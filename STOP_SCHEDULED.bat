@echo off
chcp 437 >nul
cd /d "%~dp0"

if not exist logs mkdir logs

for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd"') do set LOG_DATE=%%I
set "LOG_FILE=logs\scheduler_%LOG_DATE%.log"

echo [%date% %time%] STOP_SCHEDULED.bat launched >> "%LOG_FILE%"
taskkill /f /im python.exe /t >> "%LOG_FILE%" 2>&1
taskkill /f /im pythonw.exe /t >> "%LOG_FILE%" 2>&1
echo [%date% %time%] Stop command completed >> "%LOG_FILE%"
