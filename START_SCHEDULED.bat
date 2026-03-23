@echo off
chcp 437 >nul
cd /d "%~dp0"

if not exist logs mkdir logs

for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd"') do set LOG_DATE=%%I
set LOG_FILE=logs\scheduler_%LOG_DATE%.log

echo ================================================== >> "%LOG_FILE%"
echo [%date% %time%] START_SCHEDULED.bat launched >> "%LOG_FILE%"
echo Working directory: %cd% >> "%LOG_FILE%"

REM 1) Kill existing processes
taskkill /F /IM python.exe /T >nul 2>&1
taskkill /F /IM pythonw.exe /T >nul 2>&1
echo [%date% %time%] Old processes cleaned >> "%LOG_FILE%"

REM 2) Start Edge in debug mode (non-blocking)
echo [%date% %time%] Starting Edge debug mode... >> "%LOG_FILE%"
taskkill /F /IM msedge.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul
start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --remote-debugging-port=9333 --user-data-dir="%LOCALAPPDATA%\Microsoft\Edge\User Data" --profile-directory="Default" --no-first-run --no-default-browser-check http://door.yl.co.kr/oms/main.jsp
echo [%date% %time%] Edge launched, waiting 10s... >> "%LOG_FILE%"
timeout /t 10 /nobreak >nul

REM 3) Start V10 server
echo [%date% %time%] Starting run_server.py... >> "%LOG_FILE%"
".venv\Scripts\python.exe" run_server.py >> "%LOG_FILE%" 2>&1
