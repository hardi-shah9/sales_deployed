@echo off
REM Database Restore Script
REM Use this to restore from a backup

echo ========================================
echo   Dreamgirl CRM - Database Restore
echo ========================================
echo.
echo WARNING: This will replace your current database!
echo.
echo Available backups:
echo.
dir /b backups\*.db
echo.
echo ========================================
echo.

set /p backup_file="Enter the backup filename to restore (or press Ctrl+C to cancel): "

if not exist "backups\%backup_file%" (
    echo.
    echo ✗ Backup file not found!
    pause
    exit /b
)

echo.
echo Creating safety backup of current database...
copy dreamgirl_crm.db dreamgirl_crm_before_restore.db

echo Restoring from backup...
copy "backups\%backup_file%" dreamgirl_crm.db

if %errorlevel% equ 0 (
    echo.
    echo ✓ Database restored successfully!
    echo   Your old database is saved as: dreamgirl_crm_before_restore.db
) else (
    echo.
    echo ✗ Restore failed!
)

echo.
pause
