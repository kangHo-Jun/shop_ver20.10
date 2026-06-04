@echo off
setlocal EnableExtensions
cd /d "%~dp0"

if not exist logs mkdir logs

for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd"') do set "LOG_DATE=%%I"
set "HEALTH_LOG=logs\health_%LOG_DATE%.log"
set "FAILURE_MSG=%~1"

if "%FAILURE_MSG%"=="" set "FAILURE_MSG=unknown failure"

echo [%date% %time%] FAILURE: %FAILURE_MSG%>> "%HEALTH_LOG%"

endlocal
