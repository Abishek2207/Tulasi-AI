# Tulasi AI Automated Deployment Script

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Tulasi AI - Automated Deployment Tool " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Deploying Frontend to Cloudflare Pages..." -ForegroundColor Yellow
Write-Host "Note: A browser window may open asking you to authorize Cloudflare. Please click 'Allow'."
Set-Location .\frontend
npx wrangler pages deploy .next --project-name tulasi-ai
Set-Location ..

Write-Host ""
Write-Host "Step 2: Backend Deployment to Render..." -ForegroundColor Yellow
Write-Host "To deploy the FastAPI backend for free on Render.com:"
Write-Host "  1. Push this folder to a GitHub repository."
Write-Host "  2. Go to https://dashboard.render.com/blueprints"
Write-Host "  3. Click 'New Blueprint Instance' and select your repository."
Write-Host "  4. Render will automatically detect render.yaml and deploy the backend!"

Write-Host ""
Write-Host "Deployment preparation complete! 🚀" -ForegroundColor Green
