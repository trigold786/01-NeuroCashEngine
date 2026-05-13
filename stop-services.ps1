# NeuroCashEngine 核心服务停止脚本
Write-Host "=== 停止 NeuroCashEngine 核心服务 ===" -ForegroundColor Red

# 查找并停止所有 node 进程（监听我们的端口）
$ports = @(3001, 3005, 3006, 3007)

foreach ($port in $ports) {
  try {
    $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($processes) {
      foreach ($pid in $processes) {
        try {
          Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
          Write-Host "已停止端口 $port 上的进程 (PID: $pid)" -ForegroundColor Yellow
        } catch {
          # 忽略错误
        }
      }
    } else {
      Write-Host "端口 $port 上没有运行的进程" -ForegroundColor Gray
    }
  } catch {
    Write-Host "检查端口 $port 时出错" -ForegroundColor Gray
  }
}

Write-Host ""
Write-Host "=== 停止完成！" -ForegroundColor Green
