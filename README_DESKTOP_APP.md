# Desktop Application Architecture Guide

This document explains the "magic" behind how your Flask/React web app was converted into a zero-dependency, double-clickable, native-feeling Windows `.exe`. 

As you prepare to make major UI, Database, and Logic changes, you can refer back to this guide to understand how the desktop shell wrapper works securely around the web app. Yes, you can confidently make as many changes as you want—the packaging shell is completely agnostic to your business logic, and pulling off the Edge desktop trick won't get in your way.

---

## 1. The Core Trick: Edge "App Mode"

Instead of using enormous wrappers like Electron or buggy native libraries like `pywebview` (which notoriously clash with newer Python versions), we hook into a native feature that already lives on every Windows 10/11 machine: **Microsoft Edge**.

In `main.py`, we execute a hidden command to Edge:
```python
msedge.exe --app=http://127.0.0.1:5001 --user-data-dir=~/.shopcrm/edge_profile
```
### Why is this brilliant?
- `--app=...` strips away the search bars, tabs, extensions, and bookmarks. It tricks Edge into behaving like an inescapable, native application window frame.
- `--user-data-dir=...` creates a dedicated, isolated browser profile specifically for the CRM. This stops Edge from accidentally merging tabs with the user's normal web browsing, guaranteeing it operates strictly like an independent desktop program.

## 2. The Python Daemon Launcher (`main.py`)

When you double click `ShopCRM.exe`, you are actually running the invisible `main.py` script. It has two jobs:
1. **Boot the Flask Server**: It spins up your Flask application (`app.py`) on port `5001` disguised inside a background background thread.
2. **Summon the Window**: Once it verifies port `5001` is answering requests, it fires the `msedge` app mode command mentioned above. 

Because `main.py` is configured via PyInstaller to be "windowless" (`console=False`), the terminal is completely stripped away. The only thing the user perceives is their pristine Edge window immediately popping up.

## 3. The "Heartbeat" Shutdown Protocol

One of the trickiest bugs when decoupling a webserver from a UI window is **Orphaned Processes**. Namely, if the user clicks the `X` on the top right window frame, the UI disappears but the Flask server invisibly keeps running forever, draining memory.

To prevent this natively safely, the app implements a **Heartbeat System**:
- **Frontend (React)**: Embedded in `App.tsx` and the Flask login page (`login.html`), a tiny JavaScript timer silently fires a `POST` request to `/api/heartbeat` precisely every 2 seconds.
- **Backend (Flask)**: In `app.py`, a background thread constantly monitors the heartbeat pulses. If it goes `10 seconds` without a heartbeat (which happens exclusively because the user closed the UI window), Flask commits honorable suicide by running `os._exit(0)`.

This makes the application lifecycle flawless, ensuring memory is always freed properly when shut.

## 4. Packing it all together (PyInstaller)

To compile everything offline, we use PyInstaller to crunch Python, standard libraries, and your files into a solitary bundled environment:

The instructions live inside `ShopCRM.spec` and are executed by running:
```bash
.\venv\Scripts\pyinstaller.exe ShopCRM.spec --clean -y
```

### Path Resolution
PyInstaller extracts bundled files into a temporary, hidden directory called `sys._MEIPASS` when running. Our `get_resource_path()` helper function in `app.py` makes sure Flask knows exactly where to find the React build files (`frontend/dist`), HTML templates, and Static assets (like your logo) inside that temporary blob.

### Frontend Routing
Vite is configured with `base: './'` so it doesn't break when Flask serves React routes from local filesystem offsets instead of an absolute internet web host.

---

## Moving Forward: Making Major Changes

Since this wrapper system is purely focused on **Starting Servers and Rendering Windows**, any changes you make to the Database Schema, Pricing Logic, React Components, or Authentication routes will **JUST WORK**. 

**Your Dev Workflow:**
1. Work normally using `npm run dev` and `python app.py` to iterate and build your new features. 
2. When you are totally satisfied with the new features, just run `npm run build` in the frontend directory to recompile your React code.
3. Call `.\venv\Scripts\pyinstaller.exe ShopCRM.spec --clean -y` to bundle the updated DB models and React assets right back into the `.exe`!
