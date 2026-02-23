@echo off
echo ========================================
echo   Gochar Phal - Vercel Deployment
echo   Deploying to Vercel...
echo ========================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Vercel CLI not found. Installing...
    call npm install -g vercel
    echo.
)

echo Vercel CLI version:
vercel --version
echo.

echo ========================================
echo   Deployment Options:
echo ========================================
echo.
echo 1. Deploy to Preview (test deployment)
echo 2. Deploy to Production (live deployment)
echo 3. Cancel
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo Deploying to preview...
    echo.
    vercel
) else if "%choice%"=="2" (
    echo.
    echo Deploying to production...
    echo.
    echo WARNING: This will update your live site!
    set /p confirm="Are you sure? (yes/no): "
    if /i "%confirm%"=="yes" (
        vercel --prod
    ) else (
        echo Deployment cancelled.
    )
) else if "%choice%"=="3" (
    echo Deployment cancelled.
) else (
    echo Invalid choice. Deployment cancelled.
)

echo.
pause
