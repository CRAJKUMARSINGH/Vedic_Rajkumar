@echo off
echo ========================================
echo   Gochar Phal - Installation
echo   Installing dependencies...
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo Recommended version: 18.x or higher
    echo.
    pause
    exit /b 1
)

REM Display Node.js version
echo Node.js version:
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed!
    echo.
    pause
    exit /b 1
)

REM Display npm version
echo npm version:
npm --version
echo.

REM Clean install
if exist "node_modules\" (
    echo Removing old node_modules...
    rmdir /s /q node_modules
    echo.
)

if exist "package-lock.json" (
    echo Removing old package-lock.json...
    del package-lock.json
    echo.
)

echo Installing dependencies...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   INSTALLATION SUCCESSFUL!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Copy .env.example to .env
    echo 2. Edit .env with your Supabase credentials
    echo 3. Run run-dev.bat to start development server
    echo.
) else (
    echo.
    echo ========================================
    echo   INSTALLATION FAILED!
    echo ========================================
    echo.
    echo Check the error messages above.
    echo.
)

pause
