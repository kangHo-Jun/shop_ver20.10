@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo   V10 System Ready: Environment Setup
echo ============================================================
echo.

echo [1/3] Process Cleanup...

taskkill /F /IM python.exe /T >NUL 2>&1
taskkill /F /IM msedge.exe /T >NUL 2>&1

echo [OK] Basic cleanup done.

REM Simplified port cleaning
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :9333') do (
    taskkill /F /PID %%a >NUL 2>&1
)

timeout /t 2 /nobreak >NUL
echo [OK] Portfolio cleanup complete.
echo.

echo [2/3] Starting Edge Browser (Port 9333)...

REM Edge 실행 경로 (표준 경로)
set "EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
set "AUTO_DATA_DIR=%CD%\data\edge_profile"
set "HEADLESS_ARGS="

if "%BROWSER_HEADLESS%"=="true" (
    echo [INFO] Running in HEADLESS mode.
    set "HEADLESS_ARGS=--headless --disable-gpu"
)

echo [INFO] Starting Edge...
start "" "%EDGE_PATH%" %HEADLESS_ARGS% ^
  --remote-debugging-port=9333 ^
  --user-data-dir="%AUTO_DATA_DIR%" ^
  --profile-directory="Automation" ^
  --no-first-run ^
  --no-default-browser-check ^
  http://door.yl.co.kr/oms/main.jsp

echo.
echo ============================================================
echo [SUCCESS] System is ready.
echo ============================================================
echo.
echo Please login to Youngrim in the browser and run start_prod.bat.
echo ============================================================
echo.
pause
