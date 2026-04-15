@echo off
echo ========================================
echo   Dreamgirl CRM - Sales Commission System
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://www.python.org/
    pause
    exit /b 1
)

echo [1/5] Checking Python installation...
python --version

REM Kill any existing running server instances
echo.
echo [2/5] Stopping any existing server instances...
taskkill /F /IM python.exe /T >nul 2>&1
echo Done.

REM Check if virtual environment exists
if not exist "venv" (
    echo.
    echo [3/5] Creating virtual environment...
    python -m venv venv
) else (
    echo.
    echo [3/5] Virtual environment already exists
)

REM Activate virtual environment
echo.
echo [4/5] Activating virtual environment...
call venv\Scripts\activate.bat

REM Install/upgrade dependencies
echo.
echo [5/5] Installing dependencies...
pip install -q -r requirements.txt

REM Start the Flask application
echo.
echo ========================================
echo DreamGirl CRM - Starting Server
echo ========================================
echo.
echo Server will start at: http://localhost:5001
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================

python app.py

pause
