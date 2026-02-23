@echo off
echo ========================================
echo   Gochar Phal - Production Build
echo   Building for deployment...
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Building production bundle...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo Output directory: dist\
    echo.
    echo To preview the build, run: run-preview.bat
    echo To deploy to Vercel, run: deploy-vercel.bat
    echo.
) else (
    echo.
    echo ========================================
    echo   BUILD FAILED!
    echo ========================================
    echo.
    echo Check the error messages above.
    echo.
)

pause
