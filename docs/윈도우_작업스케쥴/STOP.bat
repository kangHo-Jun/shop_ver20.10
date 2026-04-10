@echo off
:: V10 서버 종료
taskkill /f /im python.exe /t 2>nul
taskkill /f /im pythonw.exe /t 2>nul
echo V10 서버 종료 완료
