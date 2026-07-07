Deploy frontend to Vercel via GitHub Actions

1) Create a Vercel token
- Sign into https://vercel.com → Settings → Tokens → Create Token. Copy the token.

2) Get Vercel Org & Project IDs
- In Vercel: Project → Settings → General → find `Project ID`.
- Your Organization ID is available under the Org Settings URL or Organization settings.

3) Add GitHub secrets
- In GitHub repo: Settings → Secrets and variables → Actions → New repository secret.
  - `VERCEL_TOKEN` = (token from step 1)
  - `VERCEL_ORG_ID` = (org id from step 2)
  - `VERCEL_PROJECT_ID` = (project id from step 2)

4) Push to `main`
- The workflow `.github/workflows/deploy-vercel.yml` runs on pushes to `main`. It builds the frontend in `Sahayak.Frontend` and deploys to Vercel using the token.

5) After first deploy
- Visit Vercel project to confirm domain and configure any environment variables (`VITE_API_URL`).
Optional: Add `VERCEL_DOMAIN` to GitHub secrets to register your custom domain automatically during the `deploy-full` workflow.
Notes
- If your repo is frontend-only, change `working-directory` in the workflow to `.` or remove it.
- If you prefer Vercel's native Git integration (no token required), import the repo in Vercel instead and skip the workflow.
