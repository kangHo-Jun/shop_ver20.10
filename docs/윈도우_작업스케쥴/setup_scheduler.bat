@echo off
chcp 437 > nul

SET TASK_START=V10_AutoStart
SET TASK_STOP=V10_AutoStop
SET BAT_PATH=%~dp0START.bat
SET STOP_PATH=%~dp0STOP.bat

schtasks /delete /tn "%TASK_START%" /f 2>nul
schtasks /delete /tn "%TASK_STOP%" /f 2>nul

schtasks /create /tn "%TASK_START%" /tr "\"%BAT_PATH%\"" /sc weekly /d MON,TUE,WED,THU,FRI,SAT /st 06:00 /rl highest /f

schtasks /create /tn "%TASK_STOP%" /tr "\"%STOP_PATH%\"" /sc weekly /d MON,TUE,WED,THU,FRI,SAT /st 18:00 /rl highest /f

echo.
echo SUCCESS: Scheduler registered
echo START: Mon-Sat 06:00
echo STOP:  Mon-Sat 18:00
echo.
pause
