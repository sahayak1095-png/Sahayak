Backend deployment guide (ASP.NET Core 8)

Local container testing

1) Build and run with Docker Compose

```bash
cd "c:\Users\Dell\OneDrive\Desktop\Sahayak"
docker compose -f docker-compose.backend.yml up --build
```

The API will be available at http://localhost:4000 (mapped to container port 80).

Run database migrations (inside container or from host)

```bash
# from host (requires dotnet SDK and connection to Postgres)
# dotnet ef database update --project Sahayak.Backend --startup-project Sahayak.Backend

# or run inside the running container (example)
docker compose -f docker-compose.backend.yml exec backend dotnet ef database update
```

Option A — Deploy to Azure App Service (recommended for .NET)

1) Create a Resource Group and App Service Plan (Linux), and a Web App for Containers.

2) Push your container image to Azure Container Registry (ACR) or use direct Docker push:

```bash
# login and push to ACR (example)
az acr login --name <yourACR>
docker build -t <yourACR>.azurecr.io/sahayak-backend:latest -f Sahayak.Backend/Dockerfile .
docker push <yourACR>.azurecr.io/sahayak-backend:latest

# Configure Web App to use this image and set startup to port 80
az webapp config container set --name <app-name> --resource-group <rg> --docker-custom-image-name <yourACR>.azurecr.io/sahayak-backend:latest
```

3) Set App Settings (environment variables) in Azure Portal or via CLI:
- `ConnectionStrings__DefaultConnection` = Postgres connection string
- `ASPNETCORE_ENVIRONMENT` = Production
- `AllowedHosts` / CORS settings as needed

4) Ensure networking & firewall rules allow the app to reach the database (use managed Postgres or Azure Database for PostgreSQL).

Option B — Deploy to Render (simple, managed)

1) Create a new Web Service on Render.
2) Choose Docker and point Render to your repo (or upload a Dockerfile). Set the build context to `Sahayak.Backend` or provide a Dockerfile at repo root.
3) Set Environment variables: `ConnectionStrings__DefaultConnection`, `ASPNETCORE_ENVIRONMENT=Production`.
4) Render will build and deploy the container. Set the service to auto-deploy from your branch or trigger manual deploys.
5) If you have a custom backend domain, add it in the Render dashboard or provide it via `RENDER_BACKEND_URL` to the `deploy-full` workflow. Then configure your DNS to point `api.saha-yak.in` to Render's provided target.

Option C — DigitalOcean App Platform

1) Create App → Components → Web Service.
2) Use Dockerfile, set the build context to the backend folder, expose port 80.
3) Set environment variables and persistent storage if required.

CORS and Frontend

- After deployment, configure CORS in the backend to allow `https://saha-yak.in` and `https://www.saha-yak.in`.
- Update the frontend `VITE_API_URL` to point to the backend URL (e.g., `https://api.saha-yak.in/api`), then redeploy frontend.

Database considerations

- Use a managed Postgres (Azure, Render, DigitalOcean Managed DB, or ElephantSQL) in production.
- Store DB credentials in the host provider's secret/env settings.

If you want, I can:
- Create Azure CLI commands and a small script to build, push to ACR, and update the App Service.
- Prepare Render/DigitalOcean-specific deployment snippets.
- Start a local `docker compose up` and run migrations (I cannot run them from here; I'll provide the exact commands for you to run).

Fly.io + Supabase (free-tier) — quick start

1) Create a Supabase project (free)
- Sign up at https://supabase.com and create a new project in the free tier. Note the `DATABASE_URL` in Project Settings → Database → Connection String.

2) Install Fly CLI
- Follow https://fly.io/docs/hands-on/install-flyctl/ (Windows PowerShell one-liner available on the Fly docs).

3) Use the provided deploy scripts
- Files added to this repo:
	- `Sahayak.Backend/deploy_fly.sh` (bash)
	- `Sahayak.Backend/deploy_fly.ps1` (PowerShell)
	- `Sahayak.Backend/fly.toml`

```bash
# from repo root
cd "c:\Users\Dell\OneDrive\Desktop\Sahayak\Sahayak.Backend"
chmod +x deploy_fly.sh
./deploy_fly.sh sahayak-backend "<SUPABASE_DATABASE_URL>"
```

On Windows PowerShell:

```powershell
.\deploy_fly.ps1 -AppName sahayak-backend -DatabaseUrl "<SUPABASE_DATABASE_URL>"
```

4) Migrations
- If `fly.toml` includes `release_command`, Fly will attempt to run migrations during deploy. Otherwise SSH into the instance and run migrations manually:

```bash
flyctl ssh console -a sahayak-backend
# inside the instance:
dotnet ef database update
```

5) Set additional secrets
- Use `flyctl secrets set KEY=VALUE --app sahayak-backend` for settings like `ASPNETCORE_ENVIRONMENT=Production`.

6) Finalize
- Fly will provide a public URL (e.g., `https://sahayak-backend.fly.dev`). Set `VITE_API_URL` on your frontend host to `https://<your-fly-app>.fly.dev/api` and redeploy the frontend.

