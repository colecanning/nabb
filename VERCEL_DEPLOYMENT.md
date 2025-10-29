# Vercel Deployment Guide

This guide covers deploying your Instagram Message Sender app to Vercel, including Puppeteer configuration.

## Prerequisites

1. Vercel account (free tier works)
2. GitHub/GitLab/Bitbucket repository connected to Vercel
3. All environment variables ready

---

## Step 1: Update Dependencies for Vercel

Puppeteer doesn't work directly on Vercel. You need to use `puppeteer-core` with `@sparticuz/chromium`.

### Install Required Packages

```bash
pnpm add puppeteer-core @sparticuz/chromium
pnpm remove puppeteer
```

---

## Step 2: Configure Vercel

Create `vercel.json` in your project root:

```json
{
  "regions": ["iad1"],
  "functions": {
    "app/api/crawl-instagram/route.ts": {
      "maxDuration": 60,
      "memory": 3008
    },
    "app/api/get-video-duration/route.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

**Note:** 
- Free tier has 10-second timeout limit
- Pro tier allows up to 60 seconds
- Puppeteer routes need higher memory (1024-3008 MB)

---

## Step 3: Set Environment Variables in Vercel

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add all variables from your `.env.local`:

```env
# Authentication
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=https://your-app.vercel.app
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
ALLOWED_EMAILS=user1@gmail.com,user2@gmail.com

# Instagram API
PAGE_ACCESS_TOKEN=your_token
IG_USER_ID=your_id
WEBHOOK_VERIFY_TOKEN=your_token

# OpenAI & Other APIs
OPENAI_API_KEY=your_key
SERPAPI_API_KEY=your_key
```

**Important:**
- Update `NEXTAUTH_URL` to your production domain
- Update Google OAuth redirect URI to: `https://your-app.vercel.app/api/auth/callback/google`

---

## Step 4: Deploy

### Option A: Deploy via Vercel Dashboard

1. Connect your GitHub repository to Vercel
2. Import your project
3. Add environment variables
4. Click "Deploy"

### Option B: Deploy via CLI

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Deploy
vercel
```

---

## Troubleshooting

### Puppeteer Timeout Errors

**Problem:** Function timeout after 10 seconds  
**Solution:** 
- Upgrade to Vercel Pro for longer timeouts
- OR optimize your Puppeteer code
- OR use external service for web scraping

### "Module not found" Error

**Problem:** Chromium binary not loading  
**Solution:** Make sure `@sparticuz/chromium` is in `dependencies`, not `devDependencies`

### Memory Errors

**Problem:** Function runs out of memory  
**Solution:** Increase memory in `vercel.json`:
```json
{
  "functions": {
    "app/api/crawl-instagram/route.ts": {
      "memory": 3008
    }
  }
}
```

### Authentication Not Working

**Problem:** Users can't sign in after deployment  
**Solution:**
1. Check `NEXTAUTH_URL` is set to production domain
2. Update Google OAuth redirect URI in Google Console
3. Verify all environment variables are set in Vercel

---

## Free Tier Limitations

Vercel Free tier has:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ⚠️ 10-second function timeout (issues with Puppeteer)
- ⚠️ 1024 MB max function memory

**Recommendation:** For Puppeteer-heavy apps, consider:
1. Vercel Pro ($20/month) - 60s timeout, 3GB memory
2. External web scraping service
3. Alternative deployment platform (Railway, Fly.io)

---

## Post-Deployment

1. Test all API endpoints
2. Verify authentication works
3. Check Puppeteer routes function correctly
4. Monitor function logs in Vercel dashboard
5. Set up domain (if needed)

---

## Monitoring

View logs in Vercel:
1. Go to your project
2. Click "Functions" tab
3. Click on any function to see logs
4. Monitor errors and timeouts

---

## Alternative: External Puppeteer Service

If Puppeteer doesn't work well on Vercel, consider:

1. **BrowserBase** - https://www.browserbase.com/
2. **Browserless** - https://www.browserless.io/
3. **Apify** - https://apify.com/

These handle browser automation in the cloud with better reliability.

