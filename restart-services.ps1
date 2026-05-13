# Restart all NeuroCashEngine core services
Write-Host "=== Stopping Existing Services ===" -ForegroundColor Red
$ports = @(3001, 3005, 3006, 3007)

foreach ($port in $ports) {
  try {
    $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($processes) {
      foreach ($pid in $processes) {
        try {
          Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
          Write-Host "Stopped process on port $port (PID: $pid)" -ForegroundColor Yellow
        } catch {}
      }
    }
  } catch {}
}

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "=== Starting All Core Services ===" -ForegroundColor Green

# account-center
Write-Host "Starting account-center (3001)..."
Start-Process -FilePath "node" -ArgumentList "dist/main.js" -WorkingDirectory "backend/shared/account-center" -WindowStyle Hidden

# cash-flow-engine
Write-Host "Starting cash-flow-engine (3005)..."
Start-Process -FilePath "node" -ArgumentList "dist/main.js" -WorkingDirectory "backend/core/cash-flow-engine" -WindowStyle Hidden

# content-hub
Write-Host "Starting content-hub (3006)..."
Start-Process -FilePath "node" -ArgumentList "dist/main.js" -WorkingDirectory "backend/core/content-hub" -WindowStyle Hidden

# data-product-api
Write-Host "Starting data-product-api (3007)..."
Start-Process -FilePath "node" -ArgumentList "dist/main.js" -WorkingDirectory "backend/core/data-product-api" -WindowStyle Hidden

Write-Host ""
Write-Host "Waiting 15 seconds for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "=== Service Status Check ===" -ForegroundColor Green

$allOk = $true

function Test-Port {
  param($port, $name)
  try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $tcp.Connect("localhost", $port)
    $tcp.Close()
    Write-Host "$name ($port): OK" -ForegroundColor Green
    return $true
  } catch {
    Write-Host "$name ($port): FAILED" -ForegroundColor Red
    return $false
  }
}

# account-center has a health endpoint
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 5
  Write-Host "account-center (3001): OK" -ForegroundColor Green
} catch {
  Write-Host "account-center (3001): FAILED" -ForegroundColor Red
  $allOk = $false
}

if (-not (Test-Port 3005 "cash-flow-engine")) { $allOk = $false }
if (-not (Test-Port 3006 "content-hub")) { $allOk = $false }
if (-not (Test-Port 3007 "data-product-api")) { $allOk = $false }

Write-Host ""
if ($allOk) {
  Write-Host "=== ALL SERVICES STARTED SUCCESSFULLY! ===" -ForegroundColor Green
} else {
  Write-Host "=== Some services failed to start ===" -ForegroundColor Red
}
Write-Host ""
Write-Host "Services available at:"
Write-Host "  - account-center: http://localhost:3001"
Write-Host "  - cash-flow-engine: http://localhost:3005"
Write-Host "  - content-hub: http://localhost:3006"
Write-Host "  - data-product-api: http://localhost:3007"
