@echo off
echo ========================================
echo   Gochar Phal - Clean Project
echo   Removing build artifacts and cache...
echo ========================================
echo.

echo WARNING: This will delete:
echo - node_modules folder
echo - dist folder
echo - package-lock.json
echo - .vite cache
echo.

set /p confirm="Are you sure? (yes/no): "

if /i "%confirm%"=="yes" (
    echo.
    echo Cleaning project...
    echo.
    
    if exist "node_modules\" (
        echo Removing node_modules...
        rmdir /s /q node_modules
    )
    
    if exist "dist\" (
        echo Removing dist...
        rmdir /s /q dist
    )
    
    if exist "package-lock.json" (
        echo Removing package-lock.json...
        del package-lock.json
    )
    
    if exist ".vite\" (
        echo Removing .vite cache...
        rmdir /s /q .vite
    )
    
    if exist "bun.lockb" (
        echo Removing bun.lockb...
        del bun.lockb
    )
    
    echo.
    echo ========================================
    echo   CLEAN COMPLETE!
    echo ========================================
    echo.
    echo Run install.bat to reinstall dependencies.
    echo.
) else (
    echo.
    echo Clean cancelled.
    echo.
)

pause
