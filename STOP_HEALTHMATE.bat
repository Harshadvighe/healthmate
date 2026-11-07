@echo off
setlocal enabledelayedexpansion
title "HealthMate - Safe Process Stopper"

:: Change to current directory of the batch file (supports paths with spaces)
cd /d "%~dp0"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\stop_healthmate.ps1"
set EXIT_CODE=%ERRORLEVEL%

exit /b %EXIT_CODE%
