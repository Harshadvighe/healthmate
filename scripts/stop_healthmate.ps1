# HealthMate Windows Stopper Script
# Terminates ONLY the specific processes launched by HealthMate (via stored PIDs).

$ErrorActionPreference = "SilentlyContinue"

$ProjectRoot = Resolve-Path "$PSScriptRoot\.."
Set-Location $ProjectRoot

$LogsDir = Join-Path $ProjectRoot "logs"
$BackendPidFile = Join-Path $LogsDir "backend.pid"
$FrontendPidFile = Join-Path $LogsDir "frontend.pid"
$AllPidsFile = Join-Path $ProjectRoot ".healthmate_pids.txt"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor DarkCyan
Write-Host "     Stopping HealthMate Services...                      " -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor DarkCyan
Write-Host ""

$stoppedCount = 0

function Stop-SpecificPid($pidVal, $name) {
    if (-not $pidVal) { return }
    $pidInt = [int]$pidVal
    $proc = Get-Process -Id $pidInt -ErrorAction SilentlyContinue
    if ($proc) {
        Write-Host "  [-] Stopping $name (PID: $pidInt, Name: $($proc.ProcessName))..." -ForegroundColor Gray
        # Use taskkill /T to terminate process tree (including node child processes of npm)
        & taskkill /F /T /PID $pidInt > $null 2>&1
        Start-Sleep -Milliseconds 500
        $stillRunning = Get-Process -Id $pidInt -ErrorAction SilentlyContinue
        if ($stillRunning) {
            Stop-Process -Id $pidInt -Force -ErrorAction SilentlyContinue
        }
        Write-Host "  [OK] $name terminated successfully." -ForegroundColor Green
        $script:stoppedCount++
    } else {
        Write-Host "  [-] $name (PID: $pidInt) was already stopped." -ForegroundColor Gray
    }
}

# Stop backend PID
if (Test-Path $BackendPidFile) {
    $bPid = (Get-Content $BackendPidFile -ErrorAction SilentlyContinue | Select-Object -First 1).Trim()
    Stop-SpecificPid $bPid "Backend API Server"
    Remove-Item $BackendPidFile -Force -ErrorAction SilentlyContinue
}

# Stop frontend PID
if (Test-Path $FrontendPidFile) {
    $fPid = (Get-Content $FrontendPidFile -ErrorAction SilentlyContinue | Select-Object -First 1).Trim()
    Stop-SpecificPid $fPid "Frontend Dev Server"
    Remove-Item $FrontendPidFile -Force -ErrorAction SilentlyContinue
}

# Stop any remaining PIDs in .healthmate_pids.txt
if (Test-Path $AllPidsFile) {
    $pids = Get-Content $AllPidsFile -ErrorAction SilentlyContinue
    foreach ($p in $pids) {
        if ($p -and $p.Trim()) {
            Stop-SpecificPid ($p.Trim()) "Service"
        }
    }
    Remove-Item $AllPidsFile -Force -ErrorAction SilentlyContinue
}

Write-Host ""
if ($stoppedCount -gt 0) {
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " All HealthMate processes have been stopped safely.       " -ForegroundColor Green
    Write-Host " Unrelated processes on your computer were untouched.    " -ForegroundColor White
    Write-Host "==========================================================" -ForegroundColor Green
} else {
    Write-Host "==========================================================" -ForegroundColor Yellow
    Write-Host " No active HealthMate processes were running.             " -ForegroundColor Yellow
    Write-Host "==========================================================" -ForegroundColor Yellow
}
Write-Host ""
Start-Sleep -Seconds 2

