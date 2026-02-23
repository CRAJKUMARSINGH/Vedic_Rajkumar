@echo off
color 0A
title Gochar Phal - Vedic Transit Calculator

:menu
cls
echo ========================================
echo   GOCHAR PHAL - VEDIC TRANSIT CALCULATOR
echo   Om Shanti Shanti Shanti
echo ========================================
echo.
echo   Main Menu:
echo.
echo   1. Install Dependencies
echo   2. Start Development Server
echo   3. Build for Production
echo   4. Preview Production Build
echo   5. Run Tests
echo   6. Deploy to Vercel
echo   7. Clean Project
echo   8. Open Documentation
echo   9. Exit
echo.
echo ========================================

set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" goto install
if "%choice%"=="2" goto dev
if "%choice%"=="3" goto build
if "%choice%"=="4" goto preview
if "%choice%"=="5" goto test
if "%choice%"=="6" goto deploy
if "%choice%"=="7" goto clean
if "%choice%"=="8" goto docs
if "%choice%"=="9" goto exit
goto invalid

:install
cls
call install.bat
goto menu

:dev
cls
call run-dev.bat
goto menu

:build
cls
call run-build.bat
goto menu

:preview
cls
call run-preview.bat
goto menu

:test
cls
call test.bat
goto menu

:deploy
cls
call deploy-vercel.bat
goto menu

:clean
cls
call clean.bat
goto menu

:docs
cls
echo ========================================
echo   Opening Documentation...
echo ========================================
echo.
echo Available documentation files:
echo.
echo - README.md - Project overview
echo - DEPLOYMENT_GUIDE.md - Deployment instructions
echo - VERCEL_DEPLOY.md - Vercel-specific guide
echo - DEPLOYMENT_STATUS.md - Current deployment status
echo - EPHEMERIS_ACCURACY.md - Accuracy verification
echo - PDF_EXPORT_GUIDE.md - PDF feature guide
echo - USER_DATA_FEATURES.md - User data management
echo.
echo Opening README.md...
start README.md
echo.
pause
goto menu

:invalid
cls
echo.
echo Invalid choice! Please enter a number between 1-9.
echo.
pause
goto menu

:exit
cls
echo.
echo ========================================
echo   Thank you for using Gochar Phal!
echo   Om Shanti Shanti Shanti
echo ========================================
echo.
exit
