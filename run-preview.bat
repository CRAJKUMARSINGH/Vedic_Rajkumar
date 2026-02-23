@echo off
echo ========================================
echo   Gochar Phal - Production Preview
echo   Starting preview server...
echo ========================================
echo.

REM Check if dist folder exists
if not exist "dist\" (
    echo ERROR: Build not found!
    echo Please run run-build.bat first to create the production build.
    echo.
    pause
    exit /b 1
)

echo Starting preview server on http://localhost:4173
echo Press Ctrl+C to stop the server
echo.

npm run preview

pause
