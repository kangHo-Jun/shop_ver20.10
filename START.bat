@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "EDGE_EXE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
set "EDGE_PROFILE_DIR=%LOCALAPPDATA%\YoungrimAutoEdgeProfile_noext"
set "EDGE_URL=http://door.yl.co.kr/oms/main.jsp"

echo ============================================================
echo   V10 automation server start
echo ============================================================
echo.

if not exist logs mkdir logs

echo [1/4] Cleaning run_server processes and lock files...
powershell -NoProfile -Command "$targets = Get-CimInstance Win32_Process -Filter \"name = 'python.exe' or name = 'pythonw.exe'\" | Where-Object { ($_.CommandLine -like '*run_server.py*') -or ($_.ExecutablePath -like '*shop_ver20.10_new*') }; foreach ($p in $targets) { try { Stop-Process -Id $p.ProcessId -Force -ErrorAction Stop } catch {} }"
if exist "logs\v11.lock" del /f /q "logs\v11.lock" >nul 2>&1
if exist "logs\run_server.pid" del /f /q "logs\run_server.pid" >nul 2>&1
timeout /t 3 /nobreak >nul
echo [OK] Cleanup complete
echo.

echo [2/4] Launching Edge in debug mode...
start "" "%EDGE_EXE%" --remote-debugging-port=9333 --user-data-dir="%EDGE_PROFILE_DIR%" --profile-directory="Default" --disable-extensions --no-first-run --no-default-browser-check "%EDGE_URL%"
echo [OK] Edge launch requested for port 9333
echo.

echo [3/4] Waiting for Edge debug browser...
timeout /t 10 /nobreak >nul
echo.

echo [4/4] Starting V10 server...
echo.
call .venv\Scripts\activate
python run_server.py
