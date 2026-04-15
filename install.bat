@echo off
echo ========================================
echo DreamGirl CRM - Installation
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found!
    echo Please install Python 3.8+ from python.org
    pause
    exit /b 1
)

echo [1/3] Installing Python packages...
pip install -r requirements.txt

echo.
echo [2/3] Checking frontend build...
if not exist "frontend\dist" (
    echo ERROR: Frontend build not found!
    echo Please build the frontend first with: cd frontend && npm run build
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo To start the CRM, run: run.bat
echo.
pause
