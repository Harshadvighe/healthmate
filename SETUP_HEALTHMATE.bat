@echo off
setlocal enabledelayedexpansion
title "HealthMate - Environment and Dependencies Setup"

:: Change to current directory of the batch file (supports paths with spaces)
cd /d "%~dp0"

echo ==========================================================
echo    HealthMate - Running Environment Setup (No Launch)    
echo ==========================================================
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\run_healthmate.ps1" -SetupOnly
if errorlevel 1 (
    echo.
    echo [ERROR] Setup encountered an issue.
    echo Please review the output above or inspect the logs folder.
    echo.
    pause
    exit /b 1
)

exit /b 0
