Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting AI-Based Water Resources Management Frontend UI" -ForegroundColor Cyan
Write-Host "URL: http://localhost:5173" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

$env:PATH = "C:\Program Files\nodejs;$env:PATH"
Set-Location frontend
& "C:\Program Files\nodejs\npm.cmd" run dev
