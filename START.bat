@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================================
echo   V10 자동화 서버 시작
echo ============================================================
echo.

echo [1/4] 기존 프로세스 정리...
taskkill /F /IM python.exe /T >nul 2>&1
taskkill /F /IM pythonw.exe /T >nul 2>&1
taskkill /F /IM msedge.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul
echo [OK] 정리 완료
echo.

echo [2/4] Edge 브라우저 디버그 모드 실행...
start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" ^
  --remote-debugging-port=9333 ^
  --user-data-dir="%LOCALAPPDATA%\Microsoft\Edge\User Data" ^
  --profile-directory="Default" ^
  --no-first-run ^
  --no-default-browser-check ^
  http://door.yl.co.kr/oms/main.jsp
echo [OK] Edge 실행됨 (포트 9333)
echo.

echo [3/4] 영림 로그인 확인 후 아무 키나 누르세요...
echo       (브라우저에서 로그인 상태 확인)
pause >nul
echo.

echo [4/4] V10 서버 시작 중...
echo 종료하려면 이 창을 닫으세요.
echo.
call .venv\Scripts\activate
python run_server.py
pause
