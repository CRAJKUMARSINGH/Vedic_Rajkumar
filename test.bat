@echo off
echo ========================================
echo   Gochar Phal - Run Tests
echo   Running test suite...
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Running tests...
call npm run test

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ALL TESTS PASSED!
    echo ========================================
    echo.
) else (
    echo.
    echo ========================================
    echo   SOME TESTS FAILED!
    echo ========================================
    echo.
    echo Check the error messages above.
    echo.
)

pause
