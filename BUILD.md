# Building Shop CRM Desktop App

Follow these steps to build the `ShopCRM.exe` file.
Open a terminal (e.g. PowerShell or Command Prompt) and run the following commands.

## Prerequisites

1.  **Node.js**: Required to build the frontend.
2.  **Python 3.8+**: Required for the backend and PyInstaller.

## Build Steps

1.  **Build the React Frontend**
    ```cmd
    cd frontend
    npm install
    npm run build
    cd ..
    ```

2.  **Install Python Dependencies**
    ```cmd
    python -m venv venv
    venv\Scripts\activate
    pip install -r requirements.txt
    ```

3.  **Build the Executable with PyInstaller**
    ```cmd
    pyinstaller ShopCRM.spec --clean -y
    ```

4.  **Run the App**
    The built executable and required DLLs will be located in the `dist\ShopCRM` folder.
    Simply double-click `dist\ShopCRM\ShopCRM.exe` to run the app.
