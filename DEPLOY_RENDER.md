# Deploy PlayPal on Render (Backend + Frontend)

Deployment is **Render only** (no Vercel). Push to `main` → GitHub Actions CI runs → Render auto-deploys both services.

## Pipeline overview

| Step | What happens |
|------|----------------|
| **Git push to `main`** | GitHub Actions: backend syntax check + frontend production build |
| **Render Auto-Deploy** | Redeploys **PlayPal_FYP** (API) and **playpal-web** (static frontend) |

---

## Service 1 — Backend API (`PlayPal_FYP`)

[Render Dashboard](https://dashboard.render.com) → **PlayPal_FYP** → **Settings**:

| Setting | Value |
|---------|--------|
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/health` |
| **Auto-Deploy** | On |

**Public URL:** `https://playpal-fyp.onrender.com`  
**Health check:** `https://playpal-fyp.onrender.com/health`

### Required environment variables

| Variable | Notes |
|----------|--------|
| `MONGO_URI` | MongoDB Atlas connection string — **required** |
| `JWT_SECRET_KEY` | Long random secret — **required** |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | Live frontend URL, e.g. `https://playpal-web.onrender.com` (comma-separate for multiple origins) |

### Email (Brevo SMTP)

| Variable | Notes |
|----------|--------|
| `BREVO_SENDER_EMAIL` | Verified sender in Brevo (SMTP login username) |
| `BREVO_SMTP_KEY` | Brevo SMTP password (starts with `xsmtpsib-`) — set only in Dashboard, never in git |
| `ADMIN_EMAIL` | Inbox for new futsal registration alerts |

### Optional / feature flags

| Variable | Notes |
|----------|--------|
| `CLOUDINARY_*` / `CLOUD_*` | Image uploads |
| `KHALTI_SECRET_KEY` | Payments |
| `KHALTI_BASE_URL` | `https://a.khalti.com/api/v2` (live) or dev URL for sandbox |
| `ENABLE_SELF_PING` | `true` — keeps free tier warm (pings `/health` every 14 min) |

Copy the full list from `backend/.env.example`. Set secrets in **Environment** on Render, not in the repo.

**Super admin (Atlas):** `admin@playpal.com` / `Admin@1`

### Verification emails (Brevo)

Render often **blocks SMTP** (`Connection timeout`). Use the **HTTP API** instead:

1. [Brevo](https://app.brevo.com) → **Senders** → verify `BREVO_SENDER_EMAIL` (e.g. `playpal602@gmail.com`)
2. **SMTP & API** → **API Keys** → create key (`xkeysib-...`) → Render env **`BREVO_API_KEY`**
3. Keep `BREVO_SENDER_EMAIL` and `BREVO_SMTP_KEY` optional for local SMTP
4. Logs should show `[email] Brevo API ok →` (not `Connection timeout`)

---

## Service 2 — Frontend static site (`playpal-web`)

**New +** → **Static Site** → connect repo `ayushneupane312/PlayPal_FYP`:

| Setting | Value |
|---------|--------|
| **Root Directory** | `Frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |
| **Auto-Deploy** | On |

### Environment (build time)

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://playpal-fyp.onrender.com` |

### SPA routing

Add rewrite: **`/*`** → **`/index.html`**

Or apply both services from Blueprint:

https://dashboard.render.com/blueprint/new?repo=https://github.com/ayushneupane312/PlayPal_FYP

---

## Link backend and frontend

After both services are live:

1. **Backend** `FRONTEND_URL` = your static site URL (e.g. `https://playpal-web.onrender.com`)
2. **Frontend** `VITE_API_URL` = your API URL (e.g. `https://playpal-fyp.onrender.com`)
3. **Redeploy both** if you change either URL (frontend bakes `VITE_API_URL` at build time)

---

## Local development

**Backend** — `backend/.env` (not committed):

```env
BREVO_SENDER_EMAIL=your_verified_sender@example.com
BREVO_SMTP_KEY=your_brevo_smtp_key
ADMIN_EMAIL=admin@example.com
FRONTEND_URL=http://localhost:5173
```

**Frontend** — `Frontend/.env.development`:

```env
VITE_API_URL=http://localhost:3001
```

Run API on port 3001 or 5000 to match `VITE_API_URL`.

---

## Deploy workflow

```bash
git add .
git commit -m "Your change description"
git push origin main
```

1. GitHub → **Actions** → CI passes (Backend + Frontend jobs)  
2. Render → both services deploy automatically  
3. Verify API: `/health`  
4. Open frontend URL and test login, email, payments  

**Manual deploy:** Render → service → **Manual Deploy** → latest commit.

**Common failures:** missing `MONGO_URI`; backend **Root Directory** not `backend`; frontend missing `VITE_API_URL` or wrong API URL.

---

## CI/CD files in repo

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | GitHub Actions validation on `main` |
| `render.yaml` | Render Blueprint (API + static site) |
| `backend/.env.example` | Env var reference for Render and local setup |
