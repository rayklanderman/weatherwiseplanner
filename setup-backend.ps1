# WeatherWise Planner - Virtual Environment Setup Script
# Run this script to set up the Python backend environment

Write-Host "🚀 WeatherWise Planner - Backend Setup" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Check Python version
Write-Host "Checking Python version..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
Write-Host "Found: $pythonVersion" -ForegroundColor Green

if ($pythonVersion -notmatch "Python 3\.(11|12)") {
    Write-Host "⚠️  Warning: Python 3.11 or 3.12 recommended" -ForegroundColor Red
    Write-Host "Current version may work but could have compatibility issues`n" -ForegroundColor Yellow
}

# Check if virtual environment already exists
if (Test-Path ".venv") {
    Write-Host "⚠️  Virtual environment already exists at .venv" -ForegroundColor Yellow
    $response = Read-Host "Do you want to recreate it? (y/N)"
    
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "Removing existing virtual environment..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force .venv
    } else {
        Write-Host "Keeping existing virtual environment" -ForegroundColor Green
        Write-Host "Activating virtual environment..." -ForegroundColor Yellow
        .\.venv\Scripts\Activate.ps1
        
        Write-Host "`n✅ Virtual environment activated!" -ForegroundColor Green
        Write-Host "Run: pip install -r backend/requirements.txt" -ForegroundColor Cyan
        exit 0
    }
}

# Create virtual environment
Write-Host "`nCreating virtual environment at .venv..." -ForegroundColor Yellow
python -m venv .venv

if (-not (Test-Path ".venv")) {
    Write-Host "❌ Failed to create virtual environment" -ForegroundColor Red
    Write-Host "Make sure you have python -m venv available" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Virtual environment created" -ForegroundColor Green

# Activate virtual environment
Write-Host "`nActivating virtual environment..." -ForegroundColor Yellow
.\.venv\Scripts\Activate.ps1

# Upgrade pip
Write-Host "`nUpgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Install backend dependencies
Write-Host "`nInstalling backend dependencies..." -ForegroundColor Yellow
Write-Host "(This may take a few minutes)..." -ForegroundColor Gray
pip install -r backend/requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Failed to install dependencies" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Red
    exit 1
}

# Verify critical packages
Write-Host "`nVerifying installation..." -ForegroundColor Yellow
python -c "import fastapi, xarray, httpx, groq; print('✅ All critical packages installed')" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Some packages may not have installed correctly" -ForegroundColor Yellow
    Write-Host "Try running: pip install -r backend/requirements.txt again" -ForegroundColor Yellow
}

# Check for .env.local file
Write-Host "`nChecking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  No .env.local file found" -ForegroundColor Yellow
    Write-Host "Creating template .env.local file..." -ForegroundColor Yellow
    
    @"
# WeatherWise Planner - Environment Configuration
# Copy this to .env.local and fill in your actual API keys

# Groq API Key (REQUIRED for AI insights)
# Get your free API key at: https://console.groq.com/
GROQ_API_KEY=your_groq_api_key_here

# Optional: Groq model selection (default: llama-3.1-70b-versatile)
# GROQ_MODEL=llama-3.1-70b-versatile

# Optional: NASA data configuration
# VITE_WEATHERWISE_DEMO_MODE=true
# WEATHERWISE_DATASET=path/to/merra2_data.nc
# WEATHERWISE_FORCE_MOCK=0
# WEATHERWISE_WINDOW_DAYS=3
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
    
    Write-Host "✅ Created .env.local template" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: Edit .env.local and add your Groq API key!" -ForegroundColor Yellow
} else {
    Write-Host "✅ Found existing .env.local file" -ForegroundColor Green
    
    # Check if GROQ_API_KEY is set
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -notmatch "GROQ_API_KEY=.+") {
        Write-Host "⚠️  GROQ_API_KEY not found in .env.local" -ForegroundColor Yellow
        Write-Host "Add your Groq API key to enable AI insights" -ForegroundColor Yellow
    }
}

# Print success message
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ Backend setup complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green

Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env.local and add your Groq API key" -ForegroundColor White
Write-Host "   Get one free at: https://console.groq.com/" -ForegroundColor Gray
Write-Host "`n2. Start the backend server:" -ForegroundColor White
Write-Host "   python -m uvicorn backend.main:app --reload" -ForegroundColor Cyan
Write-Host "`n3. In a new terminal, start the frontend:" -ForegroundColor White
Write-Host "   yarn dev" -ForegroundColor Cyan

Write-Host "`n💡 Tip: The virtual environment is now active" -ForegroundColor Yellow
Write-Host "To activate it later, run: .\.venv\Scripts\Activate.ps1" -ForegroundColor Gray
