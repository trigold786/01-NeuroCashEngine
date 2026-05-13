# Simple API test script
Write-Host "=== Testing NeuroCashEngine APIs ===" -ForegroundColor Green

Write-Host ""
Write-Host "1. Testing account-center health..." -ForegroundColor Cyan
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 5
  Write-Host "   OK - Status:" $response.StatusCode
} catch {
  Write-Host "   FAILED -" $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Testing user registration..." -ForegroundColor Cyan
$registerBody = @{
  email = "test@example.com"
  username = "testuser"
  password = "Test123456"
} | ConvertTo-Json
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3001/auth/register" -Method POST -Body $registerBody -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
  Write-Host "   OK - Status:" $response.StatusCode
  Write-Host "   Response:" $response.Content
} catch {
  Write-Host "   FAILED -" $_.Exception.Message -ForegroundColor Red
  if ($_.Exception.Response) {
    Write-Host "   Status:" $_.Exception.Response.StatusCode.value__
  }
}

Write-Host ""
Write-Host "3. Testing data-product-api (investment sentiment)..." -ForegroundColor Cyan
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3007/api/investment-sentiment" -UseBasicParsing -TimeoutSec 5
  Write-Host "   OK - Status:" $response.StatusCode
  Write-Host "   Response:" $response.Content
} catch {
  Write-Host "   FAILED -" $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Green
