@echo off
chcp 65001 >nul
echo ========================================
echo Firebase 설정 및 배포 자동화
echo ========================================
echo.

echo [1/3] Firebase 설정 확인 중...
if not exist "firebase-config.js" (
    echo ✗ firebase-config.js 파일이 없습니다.
    echo   firebase-auto-setup.html 파일을 열어서 설정하세요.
    echo.
    start firebase-auto-setup.html
    pause
    exit /b 1
)

findstr /C:"YOUR_API_KEY" firebase-config.js >nul
if %errorlevel% == 0 (
    echo ✗ firebase-config.js에 실제 Firebase 구성 정보를 입력해야 합니다.
    echo   firebase-auto-setup.html 파일을 열어서 설정하세요.
    echo.
    start firebase-auto-setup.html
    pause
    exit /b 1
)

echo ✓ Firebase 설정 파일이 있습니다.
echo.

echo [2/3] Git에 커밋 중...
git add firebase-config.js
git commit -m "Firebase 설정 추가" 2>nul
if %errorlevel% neq 0 (
    echo   변경사항이 없거나 이미 커밋되었습니다.
) else (
    echo ✓ 커밋 완료
)
echo.

echo [3/3] GitHub에 푸시 중...
git push
if %errorlevel% == 0 (
    echo.
    echo ========================================
    echo ✓ 배포 완료!
    echo ========================================
    echo.
    echo Cloudflare Pages가 자동으로 배포를 시작합니다.
    echo 몇 분 후 https://malgn-booking.pages.dev 에서 확인하세요.
    echo.
) else (
    echo.
    echo ✗ 푸시 실패
    echo   Git 설정을 확인하세요.
    echo.
)

pause


