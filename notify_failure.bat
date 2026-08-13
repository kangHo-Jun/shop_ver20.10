@echo off
setlocal EnableExtensions
cd /d "%~dp0"

if not exist logs mkdir logs

for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd"') do set "LOG_DATE=%%I"
set "HEALTH_LOG=logs\health_%LOG_DATE%.log"
set "FAILURE_MSG=%~1"
set "MONITOR_WEBAPP_URL=https://script.google.com/macros/s/AKfycbw2u655TMN5MHz4udSKBFW9n69joOofTxPhbxCg6aJFIPqRR70SWJJMxzDSkQVvnNB0_g/exec"
set "PYTHON_EXE=.venv\Scripts\python.exe"
if not exist "%PYTHON_EXE%" set "PYTHON_EXE=python"

if "%FAILURE_MSG%"=="" set "FAILURE_MSG=unknown failure"

echo [%date% %time%] FAILURE: %FAILURE_MSG%>> "%HEALTH_LOG%"
powershell -NoProfile -Command ^
  "$url='%MONITOR_WEBAPP_URL%'; $body=@{system='留ㅼ옣';status='?ㅽ뙣';message='%FAILURE_MSG%'}; try { Invoke-RestMethod -Method Post -Uri $url -Body $body -TimeoutSec 20 | Out-Null } catch {}" >nul 2>&1
"%PYTHON_EXE%" send_alert_email.py --system "영림 자동화" --status "비정상" --subject "[영림 자동화] 비정상 알람" --message "%FAILURE_MSG%" >> "%HEALTH_LOG%" 2>&1

endlocal
