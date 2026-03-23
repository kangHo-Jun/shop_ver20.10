@echo off
chcp 437 >nul
cd /d "%~dp0"

set "START_CMD=cmd /c \"C:\Users\DSAI\Desktop\shop_ver20.10_new\START_SCHEDULED.bat\""
set "STOP_CMD=cmd /c \"C:\Users\DSAI\Desktop\shop_ver20.10_new\STOP_SCHEDULED.bat\""

echo ========================================
echo   V10 Windows Task Scheduler Setup
echo ========================================
echo.
echo This script requires administrator rights.
echo.

REM Monday-Saturday 6:00 server start task
echo [1/2] Registering 06:00 auto start task...
schtasks /create /tn "V10_AutoStart" /tr "%START_CMD%" /sc weekly /d MON,TUE,WED,THU,FRI,SAT /st 06:00 /f /rl highest
if %errorlevel% equ 0 (
    echo     [OK] Start task registered
) else (
    echo     [FAIL] Start task registration failed - run as administrator
)

echo.

REM Monday-Saturday 17:00 server stop task
echo [2/2] Registering 17:00 auto stop task...
schtasks /create /tn "V10_AutoStop" /tr "%STOP_CMD%" /sc weekly /d MON,TUE,WED,THU,FRI,SAT /st 17:00 /f /rl highest
if %errorlevel% equ 0 (
    echo     [OK] Stop task registered
) else (
    echo     [FAIL] Stop task registration failed - run as administrator
)

echo.
echo ========================================
echo   Registered Task Check
echo ========================================
schtasks /query /tn "V10_AutoStart" /fo list 2>nul
schtasks /query /tn "V10_AutoStop" /fo list 2>nul

echo.
echo Done. Tasks are scheduled Monday-Saturday at 06:00 and 17:00.
pause
