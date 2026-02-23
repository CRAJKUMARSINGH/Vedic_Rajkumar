@echo off
echo ========================================
echo   Gochar Phal - Vedic Transit Calculator
echo   Starting Development Server...
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting development server on http://localhost:8080
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause
