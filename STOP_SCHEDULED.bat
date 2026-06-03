@echo off
chcp 437 >nul
setlocal EnableExtensions EnableDelayedExpansion

REM Auto-elevate to administrator when needed
net session >nul 2>&1
if %errorlevel% neq 0 (
    powershell -Command "Start-Process cmd '/c \"%~f0\"' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"

if not exist logs mkdir logs

for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd"') do set "LOG_DATE=%%I"
set "LOG_FILE=logs\scheduler_%LOG_DATE%.log"
set "SERVER_PID_FILE=logs\run_server.pid"
set "EDGE_PID_FILE=logs\edge_9333.pid"
set "SERVER_PORT=5081"
set "EDGE_PORT=9333"

echo [%date% %time%] STOP_SCHEDULED.bat launched >> "%LOG_FILE%"

if exist "%SERVER_PID_FILE%" (
    set "SERVER_PID="
    for /f "usebackq delims=" %%I in ("%SERVER_PID_FILE%") do (
        set "SERVER_PID=%%I"
        goto :server_pid_loaded
    )
    :server_pid_loaded
    if not "%SERVER_PID%"=="" (
        echo [%date% %time%] Stopping run_server.py PID %SERVER_PID% >> "%LOG_FILE%"
        taskkill /f /pid %SERVER_PID% /t >> "%LOG_FILE%" 2>&1
    )
    del "%SERVER_PID_FILE%" >nul 2>&1
) else (
    echo [%date% %time%] No run_server PID file found. >> "%LOG_FILE%"
)

set "SERVER_LISTENER_PID="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%SERVER_PORT% .*LISTENING"') do (
    set "SERVER_LISTENER_PID=%%P"
    goto :server_listener_found
)
goto :after_server_fallback

:server_listener_found
if defined SERVER_LISTENER_PID (
    echo [%date% %time%] Fallback stopping run_server listener PID !SERVER_LISTENER_PID! on port %SERVER_PORT%. >> "%LOG_FILE%"
    taskkill /f /pid !SERVER_LISTENER_PID! /t >> "%LOG_FILE%" 2>&1
)

:after_server_fallback

if exist "%EDGE_PID_FILE%" (
    set "EDGE_PID="
    for /f "usebackq delims=" %%I in ("%EDGE_PID_FILE%") do (
        set "EDGE_PID=%%I"
        goto :edge_pid_loaded
    )
    :edge_pid_loaded
    if not "%EDGE_PID%"=="" (
        echo [%date% %time%] Stopping Edge debug PID %EDGE_PID% >> "%LOG_FILE%"
        taskkill /f /pid %EDGE_PID% /t >> "%LOG_FILE%" 2>&1
        if errorlevel 1 (
            echo [%date% %time%] Edge PID %EDGE_PID% stop failed. Falling back to port %EDGE_PORT% lookup. >> "%LOG_FILE%"
        ) else (
            echo [%date% %time%] Edge PID %EDGE_PID% stop requested successfully. >> "%LOG_FILE%"
        )
    )
) else (
    echo [%date% %time%] No Edge PID file found. >> "%LOG_FILE%"
)

set "EDGE_LISTENER_PID="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%EDGE_PORT% .*LISTENING"') do (
    set "EDGE_LISTENER_PID=%%P"
    goto :edge_listener_found
)
goto :after_edge_fallback

:edge_listener_found
if defined EDGE_LISTENER_PID (
    echo [%date% %time%] Fallback stopping Edge listener PID !EDGE_LISTENER_PID! on port %EDGE_PORT%. >> "%LOG_FILE%"
    taskkill /f /pid !EDGE_LISTENER_PID! /t >> "%LOG_FILE%" 2>&1
)

:after_edge_fallback
del "%EDGE_PID_FILE%" >nul 2>&1

set "EDGE_PORT_OPEN="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%EDGE_PORT% .*LISTENING"') do (
    set "EDGE_PORT_OPEN=%%P"
    goto :edge_port_still_open
)
echo [%date% %time%] Edge debug port %EDGE_PORT% confirmed closed. >> "%LOG_FILE%"
goto :done

:edge_port_still_open
echo [%date% %time%] WARNING: Edge debug port %EDGE_PORT% still open (PID !EDGE_PORT_OPEN!). >> "%LOG_FILE%"

:done

echo [%date% %time%] Stop command completed >> "%LOG_FILE%"
