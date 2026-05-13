# Simple script to start NeuroCashEngine core services
Write-Host "=== Starting NeuroCashEngine Core Services ===" -ForegroundColor Green

# Start account-center (port 3001)
Write-Host "Starting account-center (port 3001)..." -ForegroundColor Cyan
Start-Process -FilePath "node" -ArgumentList "dist/main.js" -WorkingDirectory "backend/shared/account-center" -WindowStyle Hidden

# Start cash-flow-engine (port 3005)
Write-Host "Starting cash-flow-engine (port 3005)..." -ForegroundColor Cyan
Start-Process -FilePath "node" -ArgumentList "dist/main.js" -WorkingDirectory "backend/core/cash-flow-engine" -WindowStyle Hidden

# Start content-hub (port 3006)
Write-Host "Starting content-hub (port 3006)..." -ForegroundColor Cyan
Start-Process -FilePath "node" -ArgumentList "dist/main.js" -WorkingDirectory "backend/core/content-hub" -WindowStyle Hidden

# Start data-product-api (port 3007)
Write-Host "Starting data-product-api (port 3007)..." -ForegroundColor Cyan
Start-Process -FilePath "node" -ArgumentList "dist/main.js" -WorkingDirectory "backend/core/data-product-api" -WindowStyle Hidden

Write-Host ""
Write-Host "All services started! Waiting 10 seconds for initialization..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "=== Service Health Check ===" -ForegroundColor Green

# Check account-center
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 5
  Write-Host "account-center (3001): OK" -ForegroundColor Green
} catch {
  Write-Host "account-center (3001): FAILED" -ForegroundColor Red
}

# Check cash-flow-engine port
try {
  $tcp = New-Object System.Net.Sockets.TcpClient
  $tcp.Connect("localhost", 3005)
  $tcp.Close()
  Write-Host "cash-flow-engine (3005): OK" -ForegroundColor Green
} catch {
  Write-Host "cash-flow-engine (3005): FAILED" -ForegroundColor Red
}

# Check content-hub port
try {
  $tcp = New-Object System.Net.Sockets.TcpClient
  $tcp.Connect("localhost", 3006)
  $tcp.Close()
  Write-Host "content-hub (3006): OK" -ForegroundColor Green
} catch {
  Write-Host "content-hub (3006): FAILED" -ForegroundColor Red
}

# Check data-product-api port
try {
  $tcp = New-Object System.Net.Sockets.TcpClient
  $tcp.Connect("localhost", 3007)
  $tcp.Close()
  Write-Host "data-product-api (3007): OK" -ForegroundColor Green
} catch {
  Write-Host "data-product-api (3007): FAILED" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Startup Complete ===" -ForegroundColor Green
Write-Host "Service URLs:"
Write-Host "  - account-center: http://localhost:3001"
Write-Host "  - cash-flow-engine: http://localhost:3005"
Write-Host "  - content-hub: http://localhost:3006"
Write-Host "  - data-product-api: http://localhost:3007"
