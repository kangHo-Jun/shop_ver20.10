@echo off
setlocal EnableExtensions
cd /d "%~dp0"

set "EDGE_PORT=9333"
set "EDGE_PROFILE_DIR=%LOCALAPPDATA%\YoungrimAutoEdgeProfile_noext"
set "EDGE_WAIT_SEC=60"

echo ============================================================
echo Youngrim Edge debug launcher
echo ============================================================
echo.
echo [1/3] Cleaning only Youngrim no-extension profile processes and port %EDGE_PORT%...
echo.

powershell -NoProfile -Command "$targets = Get-WmiObject Win32_Process | Where-Object { (($_.Name -eq 'msedge.exe') -or ($_.Name -eq 'msedgedriver.exe')) -and $_.CommandLine -like '*YoungrimAutoEdgeProfile_noext*' }; foreach ($p in $targets) { try { Stop-Process -Id $p.ProcessId -Force -ErrorAction Stop } catch {} }" >NUL 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":%EDGE_PORT% .*LISTENING"') do taskkill /F /PID %%a >NUL 2>&1

timeout /t 2 /nobreak >NUL
echo [OK] Cleanup finished.
echo.
echo [2/3] Launching Edge with YoungrimAutoEdgeProfile_noext...
echo.

start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" ^
  --remote-debugging-port=%EDGE_PORT% ^
  --user-data-dir="%EDGE_PROFILE_DIR%" ^
  --profile-directory="Default" ^
  --disable-extensions ^
  --no-first-run ^
  --no-default-browser-check ^
  http://door.yl.co.kr/oms/main.jsp

set "EDGE_READY="
for /l %%N in (1,1,%EDGE_WAIT_SEC%) do (
  for /f "tokens=5" %%P in ('netstat -aon ^| findstr /R /C:":%EDGE_PORT% .*LISTENING"') do (
    set "EDGE_READY=%%P"
    goto :edge_ready
  )
  timeout /t 1 /nobreak >NUL
)

echo [ERROR] Debug port %EDGE_PORT% did not open within %EDGE_WAIT_SEC%s.
goto :done

:edge_ready
echo [3/3] Debug port %EDGE_PORT% ready with PID %EDGE_READY%.

:done
echo.
echo Do not close the Youngrim debug browser while automation is running.
if /I "%MANUAL_PROMPT%"=="1" (
pause
) else (
echo [INFO] MANUAL_PROMPT not set. Exiting without interactive pause.
)
