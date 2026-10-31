Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting AI-Based Water Resources Management Backend API" -ForegroundColor Cyan
Write-Host "URL: http://localhost:8000" -ForegroundColor Green
Write-Host "Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

$env:PYTHONPATH = "backend"
python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
