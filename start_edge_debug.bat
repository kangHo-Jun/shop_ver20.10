@echo off
REM ============================================================
REM 영림 Edge 브라우저를 디버그 모드로 실행
REM V10 서버가 이 브라우저에 연결합니다
REM ============================================================

echo ============================================================
echo 영림 Edge 브라우저 디버그 모드 실행
echo ============================================================
echo.

REM 기존 Edge 브라우저 종료 및 충돌 방지
echo [1/3] 기존 Edge 및 충돌 프로세스 정리 중...
echo.

REM msedge.exe 무조건 종료 (데이터 디렉토리 잠금 해제용)
taskkill /F /IM msedge.exe /T >NUL 2>&1
if "%ERRORLEVEL%"=="0" (
    echo [정보] 기존 Edge 프로세스를 안전하게 종료했습니다.
) else (
    echo [OK] 종료할 Edge 프로세스가 없습니다.
)

REM 9333 포트 점유 확인 및 정리 (필요시)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :9333') do taskkill /F /PID %%a >NUL 2>&1

timeout /t 2 /nobreak >NUL
echo [OK] 충돌 방지 및 환경 정리 완료.
echo.
goto :start_browser

:start_browser
echo [3/3] 디버그 모드로 Edge 브라우저 실행 중...
echo.

REM Edge 브라우저를 디버그 포트 9333으로 실행 (환경변수를 사용한 유연한 경로 설정)
start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" ^
  --remote-debugging-port=9333 ^
  --user-data-dir="%LOCALAPPDATA%\Microsoft\Edge\User Data" ^
  --profile-directory="Default" ^
  --no-first-run ^
  --no-default-browser-check ^
  http://door.yl.co.kr/oms/main.jsp

echo.
echo ============================================================
echo [완료] Edge 브라우저가 디버그 모드로 실행되었습니다!
echo ============================================================
echo.
echo 다음 단계:
echo 1. 브라우저에서 영림 사이트에 로그인하세요
echo 2. 로그인 상태를 유지하세요
echo 3. V10 서버를 실행하세요
echo.
echo 주의사항:
echo - 이 브라우저 창을 닫지 마세요
echo - 디버그 포트: 9333
echo - 프로필 위치: %%LOCALAPPDATA%%\Microsoft\Edge\User Data\Default
echo.
echo 이제 V10 서버가 이 브라우저에 자동으로 연결됩니다.
echo.
pause
