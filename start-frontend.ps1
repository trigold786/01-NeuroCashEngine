# Start the PWA frontend
Write-Host "=== Starting NeuroCashEngine PWA Frontend ===" -ForegroundColor Green

# Check if port 5173 is in use and stop it
try {
  $processes = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
  if ($processes) {
    foreach ($pid in $processes) {
      try {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped existing process on port 5173 (PID: $pid)" -ForegroundColor Yellow
      } catch {}
    }
  }
} catch {}

Start-Sleep -Seconds 1

# Start the dev server
Write-Host "Starting Vite dev server on http://localhost:5173..." -ForegroundColor Cyan
Start-Process -FilePath "npm" -ArgumentList "run","dev" -WorkingDirectory "frontend/apps/pwa" -WindowStyle Normal

Write-Host ""
Write-Host "Waiting 10 seconds for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if server is running
try {
  $tcp = New-Object System.Net.Sockets.TcpClient
  $tcp.Connect("localhost", 5173)
  $tcp.Close()
  Write-Host ""
  Write-Host "=== PWA FRONTEND STARTED SUCCESSFULLY! ===" -ForegroundColor Green
  Write-Host ""
  Write-Host "Access the app at: http://localhost:5173" -ForegroundColor Cyan
  Write-Host ""
} catch {
  Write-Host ""
  Write-Host "=== Failed to verify frontend on port 5173 ===" -ForegroundColor Red
  Write-Host "Check the terminal window for errors"
}
