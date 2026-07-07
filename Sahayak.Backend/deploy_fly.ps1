Param(
  [string]$AppName = "sahayak-backend",
  [string]$DatabaseUrl = ""
)

if (-not $DatabaseUrl) {
  Write-Host "Usage: .\deploy_fly.ps1 -AppName <app> -DatabaseUrl <SUPABASE_DATABASE_URL>"
  exit 1
}

Write-Host "Ensure flyctl is installed and you're logged in"
if ($env:FLY_API_TOKEN) {
  Write-Host "Using FLY_API_TOKEN from environment"
  flyctl auth login --access-token $env:FLY_API_TOKEN
} else {
  flyctl auth login
}

Write-Host "Creating app if missing: $AppName"
if (-not (flyctl apps list | Select-String $AppName)) {
  flyctl apps create $AppName | Out-Null
}

Write-Host "Setting secret ConnectionStrings__DefaultConnection"
flyctl secrets set ConnectionStrings__DefaultConnection="$DatabaseUrl" --app $AppName
Write-Host "Running EF Core migrations using .NET SDK container against Supabase"
Push-Location ..

$pwdEscaped = (Get-Location).Path -replace "\\","/"
docker run --rm -v "$pwdEscaped":/src -w /src/Sahayak.Backend -e ConnectionStrings__DefaultConnection="$DatabaseUrl" mcr.microsoft.com/dotnet/sdk:8.0 bash -lc "dotnet restore && dotnet build -c Release && dotnet ef database update --no-build"; if ($LASTEXITCODE -ne 0) { Write-Host "Warning: migrations may have failed; continuing to deploy" }

Write-Host "Deploying to Fly.io"
flyctl deploy --app $AppName
Pop-Location

Write-Host "If migrations did not run, you can run them manually:"
Write-Host "  flyctl ssh console -a $AppName" 
Write-Host "  # then: dotnet ef database update"
