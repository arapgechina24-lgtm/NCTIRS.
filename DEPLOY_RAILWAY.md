# Deploying NCTIRS to Railway — Step-by-Step Guide

## Prerequisites

- A [Railway](https://railway.com) account (sign up free with GitHub)
- A [Turso](https://turso.tech) account for the production database
- Your NCTIRS repository pushed to GitHub

---

## Step 1: Set Up the Turso Database

Your project uses Turso (libSQL) in production. The free tier gives you 500 databases and 9 GB storage.

1. Install the Turso CLI:
   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   ```

2. Sign up and authenticate:
   ```bash
   turso auth signup    # or turso auth login
   ```

3. Create your production database:
   ```bash
   turso db create nctirs-prod --location nrt
   ```

4. Get your credentials (you'll need these for Railway):
   ```bash
   turso db show nctirs-prod --url
   # Output: libsql://nctirs-prod-yourusername.turso.io

   turso db tokens create nctirs-prod
   # Output: your auth token (save this securely!)
   ```

5. Push your schema to the production database:
   ```bash
   DATABASE_URL="libsql://nctirs-prod-yourusername.turso.io" \
   TURSO_AUTH_TOKEN="your-token" \
   npx prisma db push
   ```

6. (Optional) Seed the production database:
   ```bash
   DATABASE_URL="libsql://nctirs-prod-yourusername.turso.io" \
   TURSO_AUTH_TOKEN="your-token" \
   npx tsx scripts/seed.ts
   ```

---

## Step 2: Deploy to Railway

1. Go to [railway.com](https://railway.com) and sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository (`arapgechina24-lgtm/NCTIRS..`)
4. Railway will auto-detect your Next.js project and start building

### Add Environment Variables

Before the first build finishes, click on your service and go to the **Variables** tab. Add:

| Variable                   | Value                                        |
|----------------------------|----------------------------------------------|
| `NODE_ENV`                 | `production`                                 |
| `DATABASE_URL`             | `libsql://nctirs-prod-yourusername.turso.io` |
| `TURSO_AUTH_TOKEN`         | `your-turso-token`                           |
| `NEXT_PUBLIC_APP_URL`      | `https://${{RAILWAY_PUBLIC_DOMAIN}}`         |
| `NEXT_PUBLIC_SOCKET_URL`   | `https://${{RAILWAY_PUBLIC_DOMAIN}}`         |
| `NEXT_PUBLIC_ABLY_API_KEY` | `your-ably-key` *(optional)*                 |
| `PORT`                     | `3000`                                       |

> **Tip:** Railway provides the `${{RAILWAY_PUBLIC_DOMAIN}}` variable automatically — use it in `NEXT_PUBLIC_APP_URL` so it always matches your deployment URL.

### Generate a Public Domain

1. Go to your service → **Settings** → **Networking**
2. Click **Generate Domain** to get a `*.up.railway.app` URL
3. Railway will redeploy with the new variables

---

## Step 3: Verify the Deployment

1. The build takes about 2–3 minutes
2. Once deployed, click the generated URL (e.g., `https://nctirs-production.up.railway.app`)
3. Test login with your demo credentials from the seed data

---

## Railway CLI (Alternative Deployment)

If you prefer the terminal:

```bash
# Install the Railway CLI
npm install -g @railway/cli

# Authenticate
railway login

# Link your project (run from the NCTIRS directory)
railway link

# Set environment variables
railway variables set NODE_ENV=production
railway variables set DATABASE_URL="libsql://nctirs-prod-yourusername.turso.io"
railway variables set TURSO_AUTH_TOKEN="your-token"
railway variables set PORT=3000

# Deploy
railway up

# Open in browser
railway open
```

---

## Important Notes

### Free Tier / Trial
Railway gives you a **$5 trial credit** (no credit card required). This typically lasts 2–3 weeks for a small Next.js app. After that, the Hobby plan is $5/month with $5 of included usage. Unlike Render, Railway does **not** have cold starts — your app stays awake.

### Custom Domain (Optional)
1. In Railway dashboard → your service → **Settings** → **Networking**
2. Click **Custom Domain** and enter your domain
3. Add the CNAME record Railway provides to your DNS
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain

### Continuous Deployment
Railway auto-deploys on every push to your main branch by default. You can change the branch or disable this in **Settings** → **Source**.

### Monitoring & Logs
Railway provides real-time logs right in the dashboard. Click your service → **Logs** to see build output and runtime logs. You can also use:
```bash
railway logs
```

---

## Troubleshooting

**Build fails with Prisma errors:**
The `railway.toml` ensures `prisma generate` runs before `next build`. If it still fails, check that `@prisma/client` and `prisma` are in your `dependencies` (not `devDependencies`) — they already are in your `package.json`, so this should work out of the box.

**Database connection errors:**
Verify `DATABASE_URL` starts with `libsql://` and `TURSO_AUTH_TOKEN` is set. Click **Variables** in Railway to double-check for typos or trailing whitespace.

**Port issues:**
Railway expects your app to listen on the `PORT` environment variable. Next.js defaults to 3000, which works fine — just make sure you've set `PORT=3000` in your variables.

**502/503 errors:**
Check the deploy logs. Most common cause is a missing environment variable. Required: `DATABASE_URL`, `TURSO_AUTH_TOKEN`, `NODE_ENV`, `PORT`.
