@echo off
setlocal EnableExtensions
cd /d "%~dp0"

set "TASK_NAME=V10_Watchdog"
set "TASK_CMD=%cd%\WATCHDOG_CHECK.bat"

schtasks /Create /TN "%TASK_NAME%" /TR "%TASK_CMD%" /SC MINUTE /MO 5 /F
if errorlevel 1 (
    echo Failed to create %TASK_NAME%.
    exit /b 1
)

echo Created %TASK_NAME% to run every 5 minutes.
exit /b 0
