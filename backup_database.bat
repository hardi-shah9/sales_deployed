@echo off
REM Daily Database Backup Script
REM Run this every day to backup your data!

echo ========================================
echo   Dreamgirl CRM - Database Backup
echo ========================================
echo.

REM Create backups folder if it doesn't exist
if not exist "backups" mkdir backups

REM Create backup with date and time stamp
set datetime=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set datetime=%datetime: =0%

echo Creating backup...
copy dreamgirl_crm.db "backups\dreamgirl_crm_%datetime%.db"

if %errorlevel% equ 0 (
    echo.
    echo ✓ Backup created successfully!
    echo   Location: backups\dreamgirl_crm_%datetime%.db
    echo.
    echo Your data is safe!
) else (
    echo.
    echo ✗ Backup failed! Please check if the database file exists.
)

echo.
echo ========================================
pause
