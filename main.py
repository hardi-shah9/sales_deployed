import sys
import threading
import time
import urllib.request
import urllib.error
import subprocess
import os
from app import app

def run_flask():
    app.run(host='127.0.0.1', port=5001, debug=False, use_reloader=False)

def verify_server_running(url, max_retries=10, delay=0.5):
    """Wait for the server to be ready before showing the window."""
    for _ in range(max_retries):
        try:
            urllib.request.urlopen(url)
            return True
        except urllib.error.URLError:
            time.sleep(delay)
    return False

def launch_edge_app(url):
    """Launch Microsoft Edge in App Mode and wait for it to close."""
    edge_paths = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    ]
    
    edge_exe = None
    for path in edge_paths:
        if os.path.exists(path):
            edge_exe = path
            break
            
    if edge_exe:
        # Popen without shell so we can track the process
        # We MUST use a separate user-data-dir so Edge doesn't delegate to an existing
        # Edge process and exit immediately (which would kill our Flask server prematurely).
        profile_dir = os.path.join(os.path.expanduser('~'), '.shopcrm', 'edge_profile')
        print(f"Launching {edge_exe} in app mode...")
        proc = subprocess.Popen([
            edge_exe, 
            f'--app={url}', 
            '--window-size=1280,800',
            f'--user-data-dir={profile_dir}',
            '--no-first-run',
            '--no-default-browser-check'
        ])
        proc.wait() # This blocks until the app window is closed
        return True
    
    return False

if __name__ == '__main__':
    # If running from a PyInstaller bundle, we might need this
    if getattr(sys, 'frozen', False):
        sys.path.append(sys._MEIPASS)

    flask_thread = threading.Thread(target=run_flask, daemon=True)
    flask_thread.start()

    url = 'http://127.0.0.1:5001'
    if verify_server_running(url):
        # Create app window using Edge App mode
        launch_edge_app(url)
        
        # Keep the python thread alive! The heartbeat monitor in app.py
        # will handle shutting down os._exit(0) when the window is closed.
        while True:
            time.sleep(1)
    else:
        print("Failed to start Flask server.")
        sys.exit(1)
