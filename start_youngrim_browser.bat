@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo   Start Youngrim Browser
echo ============================================================
echo.

echo [1/3] Checking existing Chrome process...
tasklist /FI "IMAGENAME eq chrome.exe" 2>NUL | find /I /N "chrome.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [INFO] Chrome is already running.
    if /I "%MANUAL_PROMPT%"=="1" (
        choice /C YN /M "Close existing Chrome and restart in debug mode?"
        if errorlevel 2 goto :skip_kill
        if errorlevel 1 goto :do_kill
    ) else (
        echo [INFO] MANUAL_PROMPT not set. Keeping existing Chrome and continuing.
        goto :skip_kill
    )
) else (
    echo [OK] No running Chrome found.
    goto :start_browser
)

:do_kill
echo [2/3] Closing Chrome...
taskkill /F /IM chrome.exe >NUL 2>&1
timeout /t 2 /nobreak >NUL
echo [OK] Chrome closed.
goto :start_browser

:skip_kill
echo [INFO] Skipping Chrome termination.
goto :start_browser

:start_browser
echo [3/3] Starting Chrome in debug mode...
echo.
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --remote-debugging-port=9333 ^
  --user-data-dir="%cd%\avast_automation_profile" ^
  --no-first-run ^
  --no-default-browser-check ^
  http://door.yl.co.kr/oms/main.jsp

echo.
echo ============================================================
echo [SUCCESS] Chrome debug browser launched.
echo ============================================================
echo Port: 9333
echo Profile: %cd%\avast_automation_profile
echo.
if /I "%MANUAL_PROMPT%"=="1" (
    pause
) else (
    echo [INFO] MANUAL_PROMPT not set. Exiting without interactive pause.
)
