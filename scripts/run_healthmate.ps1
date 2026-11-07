# HealthMate Windows Launcher Script
# Handles checks, setup, database initialization, dataset validation, process startup, and browser opening.

[CmdletBinding()]
param(
    [switch]$SetupOnly = $false
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path "$PSScriptRoot\.."
Set-Location $ProjectRoot

$LogsDir = Join-Path $ProjectRoot "logs"
if (-not (Test-Path $LogsDir)) {
    New-Item -ItemType Directory -Path $LogsDir | Out-Null
}

$BackendPidFile = Join-Path $LogsDir "backend.pid"
$FrontendPidFile = Join-Path $LogsDir "frontend.pid"
$AllPidsFile = Join-Path $ProjectRoot ".healthmate_pids.txt"

function Write-Stage($num, $total, $title) {
    Write-Host ""
    Write-Host "[$num/$total] $title" -ForegroundColor Cyan
}

function Write-Success($msg) {
    Write-Host "  [OK] $msg" -ForegroundColor Green
}

function Write-Info($msg) {
    Write-Host "  [-] $msg" -ForegroundColor Gray
}

function Write-WarnMsg($msg) {
    Write-Host "  [!] $msg" -ForegroundColor Yellow
}

function Write-FailAndExit($stage, $cause, $action) {
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Red
    Write-Host " [FAILED] $stage" -ForegroundColor Red
    Write-Host " Likely Cause: $cause" -ForegroundColor Red
    Write-Host " Suggested Action: $action" -ForegroundColor Yellow
    Write-Host " Logs folder: $LogsDir" -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Clear-Host
Write-Host "==========================================================" -ForegroundColor DarkCyan
Write-Host "     HealthMate - AI Health Assistant Launcher           " -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor DarkCyan
Write-Host " Project root: $ProjectRoot" -ForegroundColor Gray

# -------------------------------------------------------------
# [1/8] Checking your computer...
# -------------------------------------------------------------
Write-Stage 1 8 "Checking your computer..."

$os = [System.Environment]::OSVersion.VersionString
Write-Info "Operating System: $os"

# Bounded internet check (max 2.5s)
$isOnline = $false
try {
    $ping = New-Object System.Net.NetworkInformation.Ping
    $reply = $ping.Send("8.8.8.8", 2500)
    if ($reply.Status -eq [System.Net.NetworkInformation.IPStatus]::Success) {
        $isOnline = $true
        Write-Success "Internet connection verified."
    } else {
        Write-WarnMsg "Internet appears offline. Offline cache will be used if packages exist."
    }
} catch {
    Write-WarnMsg "Unable to ping 8.8.8.8. Continuing in offline-tolerant mode."
}

# -------------------------------------------------------------
# [2/8] Checking Python and Node.js...
# -------------------------------------------------------------
Write-Stage 2 8 "Checking Python and Node.js..."

# 1. Detect Python
$pythonCmd = $null
$pyCandidates = @("python", "py -3.11", "py -3", "python3")
foreach ($cmd in $pyCandidates) {
    try {
        $parts = $cmd -split " "
        $exe = $parts[0]
        $args = if ($parts.Length -gt 1) { $parts[1..($parts.Length-1)] + @("--version") } else { @("--version") }
        $verOut = & $exe $args 2>&1
        if ($LASTEXITCODE -eq 0 -and $verOut -match "Python\s+([0-9]+\.[0-9]+)") {
            $majorMinor = [version]$verOut.Split()[1]
            if ($majorMinor.Major -eq 3 -and $majorMinor.Minor -ge 10) {
                $pythonCmd = $cmd
                Write-Success "Found compatible Python: $verOut (using '$cmd')"
                break
            }
        }
    } catch {}
}

if (-not $pythonCmd) {
    Write-WarnMsg "Python 3.10+ was not found on your system."
    $hasWinget = Get-Command "winget" -ErrorAction SilentlyContinue
    if ($hasWinget) {
        Write-Host "  winget package manager is available." -ForegroundColor Yellow
        $resp = Read-Host "  Would you like to install Python 3.11 automatically via winget? (Y/N)"
        if ($resp -match "^[Yy]") {
            Write-Info "Installing Python 3.11 via winget... (please approve if prompted)"
            winget install --id Python.Python.3.11 -e --source winget
            Write-Info "Please restart RUN_HEALTHMATE.bat after installation completes."
            Read-Host "Press Enter to exit"
            exit 1
        }
    }
    Write-FailAndExit "Python Check" "Python 3.10 or newer is not installed or not in PATH." "Download Python 3.11 from https://www.python.org/downloads/ and check 'Add python.exe to PATH'."
}

# 2. Detect Node.js and npm
$nodeOk = $false
try {
    $nodeVer = & node -v 2>&1
    if ($LASTEXITCODE -eq 0 -and $nodeVer -match "v([0-9]+)") {
        $nodeMajor = [int]$matches[1]
        if ($nodeMajor -ge 18) {
            $nodeOk = $true
            Write-Success "Found compatible Node.js: $nodeVer"
        } else {
            Write-WarnMsg "Node.js $nodeVer is older than recommended (v18+)."
        }
    }
} catch {}

if (-not $nodeOk) {
    Write-WarnMsg "Node.js (v18+) is missing."
    $hasWinget = Get-Command "winget" -ErrorAction SilentlyContinue
    if ($hasWinget) {
        Write-Host "  winget package manager is available." -ForegroundColor Yellow
        $resp = Read-Host "  Would you like to install Node.js LTS automatically via winget? (Y/N)"
        if ($resp -match "^[Yy]") {
            Write-Info "Installing Node.js LTS via winget... (please approve if prompted)"
            winget install --id OpenJS.NodeJS.LTS -e --source winget
            Write-Info "Please restart RUN_HEALTHMATE.bat after installation completes."
            Read-Host "Press Enter to exit"
            exit 1
        }
    }
    Write-FailAndExit "Node.js Check" "Node.js is not installed or not in PATH." "Download and install Node.js (LTS) from https://nodejs.org/"
}

try {
    $npmVer = & npm -v 2>&1
    Write-Success "Found npm version: $npmVer"
} catch {
    Write-FailAndExit "npm Check" "npm package manager is not found." "Reinstall Node.js from https://nodejs.org/"
}

# -------------------------------------------------------------
# [3/8] Preparing backend...
# -------------------------------------------------------------
Write-Stage 3 8 "Preparing backend..."

$BackendDir = Join-Path $ProjectRoot "backend"
$VenvDir = Join-Path $BackendDir "venv"
$VenvPython = Join-Path $VenvDir "Scripts\python.exe"
$VenvPip = Join-Path $VenvDir "Scripts\pip.exe"

# Copy backend .env if missing
$BackendEnv = Join-Path $BackendDir ".env"
$BackendEnvExample = Join-Path $BackendDir ".env.example"
if (-not (Test-Path $BackendEnv) -and (Test-Path $BackendEnvExample)) {
    Copy-Item $BackendEnvExample $BackendEnv
    Write-Success "Created backend\.env from template (defaults to local SQLite)."
} else {
    Write-Info "Preserved existing backend\.env configuration."
}

# Create virtual environment if missing
if (-not (Test-Path $VenvPython)) {
    Write-Info "Creating Python virtual environment in backend\venv..."
    $parts = $pythonCmd -split " "
    $exe = $parts[0]
    $args = if ($parts.Length -gt 1) { $parts[1..($parts.Length-1)] + @("-m", "venv", "$VenvDir") } else { @("-m", "venv", "$VenvDir") }
    & $exe $args
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path $VenvPython)) {
        Write-FailAndExit "Backend Venv" "Failed to create backend\venv." "Ensure Python venv module is installed and disk has space."
    }
    Write-Success "Virtual environment created."
} else {
    Write-Success "Existing virtual environment found in backend\venv."
}

# Check if packages are installed
$needsBackendInstall = $false
try {
    $checkOut = & $VenvPython -c "import fastapi, uvicorn, pydantic, sklearn, pandas, openpyxl, sqlalchemy; print('OK')" 2>&1
    if ($checkOut -notmatch "OK") {
        $needsBackendInstall = $true
    }
} catch {
    $needsBackendInstall = $true
}

if ($needsBackendInstall) {
    Write-Info "Installing backend dependencies from requirements.txt..."
    & $VenvPip install -r (Join-Path $BackendDir "requirements.txt") --quiet
    if ($LASTEXITCODE -ne 0) {
        Write-FailAndExit "Backend Dependencies" "pip install failed." "Check internet connection and review logs."
    }
    Write-Success "Backend dependencies installed successfully."
} else {
    Write-Success "Backend dependencies already installed and verified."
}

# -------------------------------------------------------------
# [4/8] Installing frontend packages...
# -------------------------------------------------------------
Write-Stage 4 8 "Installing frontend packages..."

$FrontendDir = Join-Path $ProjectRoot "frontend"
$FrontendEnv = Join-Path $FrontendDir ".env"
$FrontendEnvExample = Join-Path $FrontendDir ".env.example"

if (-not (Test-Path $FrontendEnv) -and (Test-Path $FrontendEnvExample)) {
    Copy-Item $FrontendEnvExample $FrontendEnv
    Write-Success "Created frontend\.env from template."
} else {
    Write-Info "Preserved existing frontend\.env configuration."
}

$FrontendModules = Join-Path $FrontendDir "node_modules"
$PackageLock = Join-Path $FrontendDir "package-lock.json"

if (-not (Test-Path $FrontendModules)) {
    Push-Location $FrontendDir
    try {
        if (Test-Path $PackageLock) {
            Write-Info "Installing frontend packages using npm ci..."
            & npm ci
        } else {
            Write-WarnMsg "package-lock.json missing; falling back to npm install."
            & npm install
        }
        if ($LASTEXITCODE -ne 0) {
            Write-FailAndExit "Frontend Dependencies" "npm install failed." "Check network and npm cache."
        }
        Write-Success "Frontend packages installed successfully."
    } finally {
        Pop-Location
    }
} else {
    Write-Success "Frontend packages already installed."
}

# -------------------------------------------------------------
# [5/8] Checking local database...
# -------------------------------------------------------------
Write-Stage 5 8 "Checking local database..."

$initDbScript = Join-Path $ProjectRoot "scripts\init_database.py"
$validateDatasetScript = Join-Path $ProjectRoot "scripts\validate_dataset.py"

Push-Location $BackendDir
try {
    $dbInit = & $VenvPython $initDbScript 2>&1
    if ($dbInit -notmatch "DB_INITIALIZED_SUCCESS") {
        Write-FailAndExit "Database Setup" "Database initialization failed: $dbInit" "Check backend\.env DATABASE_URL setting."
    }
    Write-Success "Local database initialized and verified (SQLite)."
} finally {
    Pop-Location
}

# -------------------------------------------------------------
# [6/8] Checking food dataset...
# -------------------------------------------------------------
Write-Stage 6 8 "Checking food dataset..."

$xlsxPath = Join-Path $BackendDir "data\healthmate_indian_food_dataset_1200plus.xlsx"
$csvPath = Join-Path $BackendDir "data\healthmate_indian_food_dataset_1200plus.csv"
$rootXlsx = Join-Path $ProjectRoot "healthmate_indian_food_dataset_1200plus.xlsx"
$rootCsv = Join-Path $ProjectRoot "healthmate_indian_food_dataset_1200plus.csv"

$datasetFound = (Test-Path $xlsxPath) -or (Test-Path $csvPath) -or (Test-Path $rootXlsx) -or (Test-Path $rootCsv)
if (-not $datasetFound) {
    Write-FailAndExit "Food Dataset" "No dataset file found in backend\data\ or project root." "Ensure healthmate_indian_food_dataset_1200plus.xlsx or .csv is present."
}

Push-Location $BackendDir
try {
    $datasetCheck = & $VenvPython $validateDatasetScript 2>&1
    if ($datasetCheck -match "COUNT:([0-9]+)\|VALID:True") {
        $count = $matches[1]
        Write-Success "Verified $count food records in the catalog."
    } else {
        Write-FailAndExit "Food Dataset Validation" "Dataset failed validation: $datasetCheck" "Inspect the dataset file for correct schema columns."
    }
} finally {
    Pop-Location
}

if ($SetupOnly) {
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " Setup completed successfully!" -ForegroundColor Green
    Write-Host " You can now double-click RUN_HEALTHMATE.bat anytime to" -ForegroundColor White
    Write-Host " launch HealthMate." -ForegroundColor White
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host ""
    if ([Environment]::UserInteractive -and -not [Console]::IsInputRedirected) {
        Read-Host "Press Enter to exit"
    }
    exit 0
}

# -------------------------------------------------------------
# [7/8] Starting HealthMate...
# -------------------------------------------------------------
Write-Stage 7 8 "Starting HealthMate..."

function Check-Port($port) {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        return $conn.OwningProcess
    }
    return $null
}

# Check port 8000
$port8000Pid = Check-Port 8000
if ($port8000Pid) {
    # Check if it is HealthMate backend
    $isHmBackend = $false
    if (Test-Path $BackendPidFile) {
        $savedPid = Get-Content $BackendPidFile -ErrorAction SilentlyContinue
        if ($savedPid -eq $port8000Pid) {
            $isHmBackend = $true
        }
    }
    if ($isHmBackend) {
        Write-Info "HealthMate backend is already running on port 8000 (PID: $port8000Pid)."
    } else {
        $procName = (Get-Process -Id $port8000Pid -ErrorAction SilentlyContinue).ProcessName
        Write-Host "  Port 8000 is occupied by '$procName' (PID: $port8000Pid)." -ForegroundColor Yellow
        $resp = Read-Host "  Would you like to terminate this process to run HealthMate? (Y/N)"
        if ($resp -match "^[Yy]") {
            Stop-Process -Id $port8000Pid -Force
            Start-Sleep -Seconds 1
            Write-Success "Freed port 8000."
        } else {
            Write-FailAndExit "Port Conflict" "Port 8000 is occupied by $procName." "Close $procName or configure PORT in backend\.env."
        }
    }
}

# Check port 5173
$port5173Pid = Check-Port 5173
if ($port5173Pid) {
    $isHmFrontend = $false
    if (Test-Path $FrontendPidFile) {
        $savedPid = Get-Content $FrontendPidFile -ErrorAction SilentlyContinue
        if ($savedPid -eq $port5173Pid) {
            $isHmFrontend = $true
        }
    }
    if ($isHmFrontend) {
        Write-Info "HealthMate frontend is already running on port 5173 (PID: $port5173Pid)."
    } else {
        $procName = (Get-Process -Id $port5173Pid -ErrorAction SilentlyContinue).ProcessName
        Write-Host "  Port 5173 is occupied by '$procName' (PID: $port5173Pid)." -ForegroundColor Yellow
        $resp = Read-Host "  Would you like to terminate this process to run HealthMate? (Y/N)"
        if ($resp -match "^[Yy]") {
            Stop-Process -Id $port5173Pid -Force
            Start-Sleep -Seconds 1
            Write-Success "Freed port 5173."
        } else {
            Write-FailAndExit "Port Conflict" "Port 5173 is occupied by $procName." "Close $procName or configure port in frontend\vite.config.js."
        }
    }
}

# Start backend if not already running
if (-not (Check-Port 8000)) {
    Write-Info "Starting Backend API server in dedicated titled window..."

    $backendProc = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/k title HealthMate Backend API (Port 8000) && `"$VenvPython`" -m uvicorn app.main:app --host 127.0.0.1 --port 8000" `
        -WorkingDirectory $BackendDir `
        -PassThru

    $backendProc.Id | Out-File -FilePath $BackendPidFile -Encoding ascii
    Write-Success "Backend started (PID: $($backendProc.Id))."
}

# Wait for backend readiness via /api/health
Write-Info "Waiting for Backend API readiness (up to 30 seconds)..."
$backendReady = $false
$maxRetries = 30
for ($i = 1; $i -le $maxRetries; $i++) {
    try {
        $resp = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($resp.status -eq "healthy") {
            $backendReady = $true
            Write-Success "Backend API is healthy and connected to catalog!"
            break
        }
    } catch {}
    Start-Sleep -Milliseconds 1000
    Write-Host "." -NoNewline -ForegroundColor Gray
}
Write-Host ""

if (-not $backendReady) {
    Write-FailAndExit "Backend Health" "Backend API did not respond at http://localhost:8000/api/health." "Review the 'HealthMate Backend API' window for error details."
}

# Start frontend if not already running
if (-not (Check-Port 5173)) {
    Write-Info "Starting Frontend dev server in dedicated titled window..."

    $frontendProc = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/k title HealthMate Frontend (Port 5173) && npm run dev" `
        -WorkingDirectory $FrontendDir `
        -PassThru

    $frontendProc.Id | Out-File -FilePath $FrontendPidFile -Encoding ascii
    Write-Success "Frontend started (PID: $($frontendProc.Id))."
}

# Wait for frontend readiness
Write-Info "Waiting for Frontend dev server (up to 20 seconds)..."
$frontendReady = $false
for ($i = 1; $i -le 20; $i++) {
    try {
        $resp = Invoke-WebRequest -Uri "http://127.0.0.1:5173" -Method Get -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        if ($resp.StatusCode -eq 200) {
            $frontendReady = $true
            Write-Success "Frontend is responsive!"
            break
        }
    } catch {}
    Start-Sleep -Milliseconds 1000
    Write-Host "." -NoNewline -ForegroundColor Gray
}
Write-Host ""

# Update combined PID file
$pids = @()
if (Test-Path $BackendPidFile) { $pids += (Get-Content $BackendPidFile) }
if (Test-Path $FrontendPidFile) { $pids += (Get-Content $FrontendPidFile) }
$pids | Out-File -FilePath $AllPidsFile -Encoding ascii

# -------------------------------------------------------------
# [8/8] Opening your browser...
# -------------------------------------------------------------
Write-Stage 8 8 "Opening your browser..."

Start-Sleep -Seconds 1
Start-Process "http://localhost:5173"
Write-Success "Browser launched to http://localhost:5173"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "     HealthMate is now running!                           " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  Web App:     http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend API: http://localhost:8000" -ForegroundColor Gray
Write-Host "  API Docs:    http://localhost:8000/api/docs" -ForegroundColor Gray
Write-Host "  Database:    Local SQLite (backend\healthmate.db)" -ForegroundColor Gray
Write-Host "  Logs:        $LogsDir" -ForegroundColor Gray
Write-Host ""
Write-Host "  To stop HealthMate safely at any time:" -ForegroundColor White
Write-Host "  Double-click STOP_HEALTHMATE.bat in this folder." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "This launcher window can remain open or be closed." -ForegroundColor Gray
Write-Host "(Services are running cleanly in the background)." -ForegroundColor Gray
Write-Host ""
if ([Environment]::UserInteractive -and -not [Console]::IsInputRedirected) {
    Read-Host "Press Enter to finish"
}
exit 0
