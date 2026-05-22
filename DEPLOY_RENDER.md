# Deploy PlayPal on Render (CI/CD)

Deployment is **Render only** (no Vercel). Use `render.yaml` and the steps below.

## Pipeline overview

| Step | What happens |
|------|----------------|
| **Git push to `main`** | GitHub Actions runs CI (build + syntax checks) |
| **Render Auto-Deploy** | Render pulls `main` and redeploys (already connected to `ayushneupane312/PlayPal_FYP`) |

## Fix your current failed deploy (`PlayPal_FYP`)

Your API service must use the **backend** folder, not the repo root.

In [Render Dashboard](https://dashboard.render.com) → **PlayPal_FYP** → **Settings**:

| Setting | Value |
|---------|--------|
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/health` |

### Required environment variables

Copy from your local `backend/.env` into **Environment** (see `backend/.env.example`):

- `MONGO_URI` — **required** (app exits without it)
- `JWT_SECRET_KEY` — **required**
- `NODE_ENV` = `production`
- `FRONTEND_URL` = your frontend URL (e.g. `https://playpal-web.onrender.com` or `http://localhost:5173` for testing)
- Cloudinary, email, Khalti keys as you use locally

Optional:

- `ENABLE_SELF_PING` = `true` — pings `/health` every 14 min on free tier

Then **Manual Deploy** → Deploy latest commit.

## Frontend (static site)

Create a second Render service:

1. **New +** → **Static Site** → connect `PlayPal_FYP` repo  
2. **Root Directory:** `Frontend`  
3. **Build Command:** `npm install && npm run build`  
4. **Publish Directory:** `dist`  
5. **Environment:** `VITE_API_URL` = `https://playpal-fyp.onrender.com`  
6. Add rewrite rule: `/*` → `/index.html` (SPA)

Or apply the Blueprint:

https://dashboard.render.com/blueprint/new?repo=https://github.com/ayushneupane312/PlayPal_FYP

## After pushing this repo

```bash
git add render.yaml .github/workflows/ci.yml backend/src/index.js backend/package.json DEPLOY_RENDER.md
git commit -m "Add Render CI/CD blueprint and production fixes"
git push origin main
```

Render will auto-deploy when the push completes. Check **Logs** if status is still failed — missing `MONGO_URI` is the most common cause.
