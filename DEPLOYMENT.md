# AI HUB — Production Deployment Checklist & Deployment Guide

This document contains step-by-step instructions for deploying **AI HUB** to production with Cloudflare Workers AI backend, Next.js frontend, and custom domain setup.

---

## 📋 Pre-Deployment Checklist

- [x] Next.js App Router codebase built with `npm run build`
- [x] Cloudflare Worker code in `worker/index.ts` with `wrangler.toml`
- [x] 3-Language Internationalization (RU, UZ, EN)
- [x] Security: IDOR protection, Rate Limiting, Guest (3) & Free User (20) quotas
- [x] Health check endpoint at `/health`

---

## 🛠️ Step-by-Step Deployment Instructions

### STEP 1: Deploy Cloudflare Worker Backend (Workers AI)
1. Install Wrangler CLI (if not already installed):
   ```bash
   npm install -g wrangler
   ```
2. Log in to your Cloudflare account:
   ```bash
   npx wrangler login
   ```
3. Navigate to the `worker/` directory and deploy:
   ```bash
   cd worker
   npx wrangler deploy
   ```
4. Copy your deployed Worker URL (e.g., `https://ai-hub-worker.your-subdomain.workers.dev`).

---

### STEP 2: Configure Production Environment Variables
Create or set the following variables on your hosting platform (Vercel, Cloudflare Pages, or VPS):

```env
# Public App Configuration
NEXT_PUBLIC_APP_URL=https://aihub.example.com
NEXT_PUBLIC_AI_API_URL=https://ai-hub-worker.your-subdomain.workers.dev

# Cloudflare Workers AI Credentials (if calling direct REST endpoint)
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id_here
CLOUDFLARE_API_TOKEN=your_cloudflare_workers_ai_api_token_here
CLOUDFLARE_WORKER_URL=https://ai-hub-worker.your-subdomain.workers.dev

# OpenRouter (Optional backup provider)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Application Behavior
MOCK_MODE=false
AI_HUB_MODEL=@cf/meta/llama-3.1-8b-instruct

# Limits & Quotas
FREE_DAILY_MESSAGES=20
GUEST_DAILY_MESSAGES=3
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW_MS=60000

# Security
ADMIN_EMAILS=owner@example.com
ALLOWED_ORIGIN=https://aihub.example.com

# Database (Optional Supabase setup)
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

---

### STEP 3: Deploy Frontend Web Application

#### Option A: Vercel (Recommended for Next.js)
1. Push your repository to GitHub / GitLab.
2. Go to [https://vercel.com](https://vercel.com) -> **New Project**.
3. Import your `Bot67` repository.
4. Add Environment Variables from STEP 2.
5. Click **Deploy**.

#### Option B: Cloudflare Pages
1. Go to Cloudflare Dashboard -> **Workers & Pages** -> **Create application**.
2. Select **Pages** -> Connect Git repository.
3. Set Framework preset to **Next.js**.
4. Set environment variables.
5. Click **Save and Deploy**.

#### Option C: Node.js VPS / Docker Server
```bash
npm install
npm run build
npm run start
```

---

### STEP 4: Custom Domain & DNS Setup (aihub.example.com)
1. Go to your DNS Manager (Cloudflare, Namecheap, GoDaddy, etc.).
2. Add a **CNAME** record:
   - **Name**: `aihub` (or `@` for root domain)
   - **Target**: `cname.vercel-dns.com` (or Cloudflare Pages target)
3. Wait for SSL certificate provisioning.

---

### STEP 5: Verification & Health Check
1. Open `https://aihub.example.com/health` in your browser. Expected response:
   ```json
   {
     "status": "ok",
     "service": "AI HUB",
     "ai": "online"
   }
   ```
2. Open `https://aihub.example.com/chat`.
3. Select **AI HUB AI** and send a test prompt in Russian, Uzbek, or English.
