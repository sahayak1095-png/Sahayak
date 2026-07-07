Vercel deployment guide for Sahayak.Frontend

1) Push frontend to GitHub
- Ensure the frontend repo is pushed to GitHub (or GitLab/Bitbucket).

2) Recommended Vercel import
- Sign into https://vercel.com and choose "Import Project" → select your Git provider and repo.
- Framework Preset: Other (Vite) or leave default.
- Install Command: `npm ci` (or `npm install`)
- Build Command: `npm run build`
- Output Directory: `dist`

3) Environment variables
- In Vercel dashboard → Settings → Environment Variables, set:
  - `VITE_API_URL` = https://<your-backend-base-url> (e.g. https://api.saha-yak.in)
- Add any other runtime values the frontend needs.

4) DNS / Custom domain (saha-yak.in)
- In Vercel: Project → Domains → Add `saha-yak.in` and `www.saha-yak.in`.
- Vercel will show DNS records to add in GoDaddy. Typical quick values:
  - A record: Host `@` → `76.76.21.21`
  - CNAME: Host `www` → `cname.vercel-dns.com`
- In GoDaddy DNS manager for `saha-yak.in`, add those records and remove conflicting ones.
- Back in Vercel, click Verify. SSL (Let's Encrypt) will be provisioned automatically.

5) SPA route handling
- `vercel.json` in repo includes a route that serves `index.html` for all paths. Adjust if you need API proxies or redirects.

6) Automatic deploys
- Each push to the connected Git branch (e.g., `main`) will trigger a Vercel deployment.

7) Troubleshooting
- If domain verification fails, confirm there are no other A/CNAME records conflicting for `@` or `www`.
- Use `dig` or `nslookup` to check DNS propagation. Wait 10–60 minutes for updates.

8) Next steps (backend)
- Deploy backend and set `VITE_API_URL` to point to its HTTPS URL.
- Configure CORS on backend to allow `https://saha-yak.in`.

If you want, I can:
- Prepare a `vercel.json` PR (already present) and a GitHub Action to auto-deploy.
- Walk you through adding the DNS records in GoDaddy (I'll provide step-by-step screenshots or exact clicks).
- Deploy the backend and return the final `VITE_API_URL` to set on Vercel.
