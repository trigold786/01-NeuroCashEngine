# ZAP Security Baseline Scan
param(
    [string]$TargetUrl = "https://host.docker.internal",
    [string]$ReportDir = "tests/security"
)

Write-Output "=== OWASP ZAP Security Scan ==="
Write-Output "Target: ${TargetUrl}"

New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null

docker run --rm `
  -v "${PWD}/${ReportDir}:/zap/wrk" `
  -u zap `
  ghcr.io/zaproxy/zaproxy:stable `
  zap-baseline.py `
  -t "${TargetUrl}" `
  -g gen.conf `
  -r zap-report.html `
  -w zap-report.md `
  -x zap-report.xml `
  -I `
  -d
