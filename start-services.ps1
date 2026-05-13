# NeuroCashEngine 核心服务启动脚本
Write-Host "=== 启动 NeuroCashEngine 核心服务 ===" -ForegroundColor Green

# 启动 account-center (端口 3001)
Write-Host "启动 account-center (端口 3001)..." -ForegroundColor Cyan
Start-Process -FilePath "node" -ArgumentList "dist/main.js" -WorkingDirectory "backend\shared\account-center" -WindowStyle Hidden

# 启动 cash-flow-engine (端口 3005)
Write-Host "启动 cash-flow-engine (端口 3005)..." -ForegroundColor Cyan
Start-Process -FilePath "node" -ArgumentList "dist/main.js" -WorkingDirectory "backend\core\cash-flow-engine" -WindowStyle Hidden

# 启动 content-hub (端口 3006)
Write-Host "启动 content-hub (端口 3006)..." -ForegroundColor Cyan
Start-Process -FilePath "node" -ArgumentList "dist/main.js" -WorkingDirectory "backend\core\content-hub" -WindowStyle Hidden

# 启动 data-product-api (端口 3007)
Write-Host "启动 data-product-api (端口 3007)..." -ForegroundColor Cyan
Start-Process -FilePath "node" -ArgumentList "dist/main.js" -WorkingDirectory "backend\core\data-product-api" -WindowStyle Hidden

Write-Host ""
Write-Host "所有服务已启动！等待 10 秒后验证健康检查..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "=== 验证服务健康检查 ===" -ForegroundColor Green

# 验证 account-center
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 5
  Write-Host "account-center (3001): OK" -ForegroundColor Green
} catch {
  Write-Host "account-center (3001): 无法访问" -ForegroundColor Red
}

# 验证 cash-flow-engine (没有health端点，检查端口是否监听)
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3005/" -UseBasicParsing -TimeoutSec 5
  Write-Host "cash-flow-engine (3005): OK" -ForegroundColor Green
} catch {
  try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $tcp.Connect("localhost", 3005)
    $tcp.Close()
    Write-Host "cash-flow-engine (3005): 端口监听正常" -ForegroundColor Green
  } catch {
    Write-Host "cash-flow-engine (3005): 无法访问" -ForegroundColor Red
  }
}

# 验证 content-hub
try {
  $tcp = New-Object System.Net.Sockets.TcpClient
  $tcp.Connect("localhost", 3006)
  $tcp.Close()
  Write-Host "content-hub (3006): 端口监听正常" -ForegroundColor Green
} catch {
  Write-Host "content-hub (3006): 无法访问" -ForegroundColor Red
}

# 验证 data-product-api
try {
  $tcp = New-Object System.Net.Sockets.TcpClient
  $tcp.Connect("localhost", 3007)
  $tcp.Close()
  Write-Host "data-product-api (3007): 端口监听正常" -ForegroundColor Green
} catch {
  Write-Host "data-product-api (3007): 无法访问" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== 启动完成 ===" -ForegroundColor Green
Write-Host "服务地址："
Write-Host "  - account-center: http://localhost:3001"
Write-Host "  - cash-flow-engine: http://localhost:3005"
Write-Host "  - content-hub: http://localhost:3006"
Write-Host "  - data-product-api: http://localhost:3007"
Write-Host ""
Write-Host "停止所有服务，请运行: stop-services.ps1" -ForegroundColor Yellow
