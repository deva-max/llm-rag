# Start both client and server development processes in parallel
Write-Host "Starting Server and Client Development Environments..." -ForegroundColor Cyan

Start-Process pwsh -ArgumentList "-Command `"cd server; pnpm run dev`"" -WindowStyle Normal
Start-Process pwsh -ArgumentList "-Command `"cd client; pnpm run dev`"" -WindowStyle Normal

Write-Host "Servers started in new windows!" -ForegroundColor Green
