@echo off
setlocal enabledelayedexpansion
title "HealthMate - AI Health Assistant Launcher"

:: Change to current directory of the batch file (supports paths with spaces)
cd /d "%~dp0"

:: Launch the PowerShell setup and runner script
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\run_healthmate.ps1"
if errorlevel 1 (
    echo.
    echo [ERROR] HealthMate exited with an error.
    echo Please see the message above or check the logs directory for details.
    echo.
    pause
    exit /b 1
)

exit /b 0
