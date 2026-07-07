#!/usr/bin/env bash
set -euo pipefail

# Usage: ./deploy_fly.sh <FLY_APP_NAME> <SUPABASE_DATABASE_URL>
APP_NAME=${1:-sahayak-backend}
DB_URL=${2:-}

if [ -z "$DB_URL" ]; then
  echo "Usage: $0 <FLY_APP_NAME> <SUPABASE_DATABASE_URL>"
  exit 1
fi

echo "Logging in to Fly.io (ensure flyctl is installed)"
if [ -n "${FLY_API_TOKEN:-}" ]; then
  echo "Using Fly API token from environment"
  flyctl auth login --access-token "$FLY_API_TOKEN"
else
  flyctl auth login
fi

echo "Creating or ensuring app exists: $APP_NAME"
if ! flyctl apps list | grep -q "$APP_NAME"; then
  flyctl apps create $APP_NAME || true
fi

echo "Setting database secret"
flyctl secrets set ConnectionStrings__DefaultConnection="$DB_URL" --app $APP_NAME

echo "Running EF Core migrations using .NET SDK container against Supabase"
cd "$(dirname "$0")"/.. || exit 1
docker run --rm \
  -v "$(pwd)":/src \
  -w /src/Sahayak.Backend \
  -e ConnectionStrings__DefaultConnection="$DB_URL" \
  mcr.microsoft.com/dotnet/sdk:8.0 bash -lc "dotnet restore && dotnet build -c Release && dotnet ef database update --no-build" || echo "Warning: migrations may have failed; continuing to deploy"

echo "Deploying to Fly.io"
flyctl deploy --app $APP_NAME

echo "Deployment requested. If migrations did not run in the build step, you can run them now via:"
echo "  flyctl ssh console -a $APP_NAME" 
echo "  # then inside the console: dotnet ef database update"
