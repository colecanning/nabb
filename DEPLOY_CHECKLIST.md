# Vercel Deployment Checklist

Use this checklist before deploying to ensure everything is configured correctly.

## ✅ Pre-Deployment Checklist

### 1. Code & Configuration

- [x] Installed Puppeteer dependencies (`@sparticuz/chromium`, `puppeteer-core`)
- [x] Created `vercel.json` with function configuration
- [x] Created `lib/chromium.ts` helper
- [x] Updated API routes to use `getBrowser()`
- [x] Verified TypeScript compiles (`pnpm tsc --noEmit`)
- [ ] Committed all changes to git
- [ ] Pushed to GitHub/GitLab/Bitbucket

### 2. Google OAuth Setup

- [ ] Updated Google OAuth redirect URI to production:
  ```
  https://your-app-name.vercel.app/api/auth/callback/google
  ```
- [ ] Verified OAuth consent screen is configured
- [ ] Added production domain to authorized domains

### 3. Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

#### Authentication
- [ ] `NEXTAUTH_SECRET` - Generate new: `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` - Your production URL: `https://your-app.vercel.app`
- [ ] `GOOGLE_CLIENT_ID` - From Google Console
- [ ] `GOOGLE_CLIENT_SECRET` - From Google Console
- [ ] `ALLOWED_EMAILS` - Comma-separated emails (no spaces)

#### Instagram API
- [ ] `PAGE_ACCESS_TOKEN` - Facebook Page token
- [ ] `IG_USER_ID` - Instagram Business Account ID
- [ ] `WEBHOOK_VERIFY_TOKEN` - Your webhook token

#### Optional Services
- [ ] `OPENAI_API_KEY` - For transcription
- [ ] `SERPAPI_API_KEY` - For search

### 4. Vercel Project Settings

- [ ] Connected GitHub repository
- [ ] Build Command: `pnpm build` (should auto-detect)
- [ ] Install Command: `pnpm install` (should auto-detect)
- [ ] Root Directory: `./`
- [ ] Framework Preset: `Next.js`

---

## 🚀 Deployment Steps

### Option A: Deploy via GitHub (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Click "Deploy"

3. **Add environment variables:**
   - Go to project Settings → Environment Variables
   - Add all variables from checklist above
   - Apply to all environments (Production, Preview, Development)

4. **Redeploy:**
   - Deployments tab → Click "..." → Redeploy

### Option B: Deploy via Vercel CLI

```bash
# Install CLI
pnpm add -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## ⚙️ Post-Deployment

### 1. Verify Deployment

- [ ] Visit your production URL
- [ ] Try signing in with Google
- [ ] Test all features:
  - [ ] Instagram message sending
  - [ ] Instagram crawling (Puppeteer)
  - [ ] Video duration (Puppeteer)
  - [ ] Message retrieval
  - [ ] Search functionality

### 2. Check Function Logs

1. Go to Vercel Dashboard → Your Project
2. Click "Functions" tab
3. Click on any function to see logs
4. Look for errors or timeouts

### 3. Monitor Puppeteer Functions

Watch for these issues:
- ⚠️ Function timeout (10s on free tier)
- ⚠️ Out of memory errors
- ⚠️ Chromium download failures

---

## 🐛 Common Issues & Solutions

### Issue: "Function Timeout" on Puppeteer routes

**Cause:** Free tier has 10-second timeout limit  
**Solutions:**
1. Upgrade to Vercel Pro ($20/month) for 60s timeout
2. Optimize Puppeteer code to be faster
3. Use external service (BrowserBase, Browserless)

**Quick Fix for Pro users:**
Update `vercel.json`:
```json
{
  "functions": {
    "app/api/crawl-instagram/route.ts": {
      "maxDuration": 60
    }
  }
}
```

### Issue: "Module not found: @sparticuz/chromium"

**Cause:** Package not in dependencies  
**Solution:** 
```bash
pnpm add @sparticuz/chromium puppeteer-core
git commit -am "Add chromium dependencies"
git push
```

### Issue: Google login not working

**Cause:** Wrong redirect URI or NEXTAUTH_URL  
**Solutions:**
1. Check `NEXTAUTH_URL` in Vercel env vars
2. Update Google Console redirect URI
3. Clear browser cookies and try again

### Issue: "NEXTAUTH_SECRET not found"

**Cause:** Missing environment variable  
**Solution:**
```bash
# Generate new secret
openssl rand -base64 32

# Add to Vercel env vars
# Redeploy
```

---

## 📊 Vercel Plan Recommendations

### Free Tier
- ✅ Good for testing and small internal tools
- ⚠️ 10-second function timeout (issues with Puppeteer)
- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments

### Pro Tier ($20/month)
- ✅ 60-second function timeout
- ✅ 3GB function memory
- ✅ Priority support
- ✅ Better for Puppeteer-heavy apps

---

## 🔒 Security Reminders

- [ ] Never commit `.env.local` to git
- [ ] Rotate `NEXTAUTH_SECRET` periodically
- [ ] Review `ALLOWED_EMAILS` list regularly
- [ ] Enable 2FA on your Vercel account
- [ ] Monitor function logs for suspicious activity

---

## 📱 Testing in Production

### Test Authentication
```bash
curl -I https://your-app.vercel.app
# Should redirect to /login
```

### Test API Endpoints
```bash
# Test Instagram crawl (will fail auth, but should respond)
curl -X POST https://your-app.vercel.app/api/crawl-instagram \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.instagram.com/p/test/"}'
```

---

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ App loads at production URL
- ✅ Google sign-in works
- ✅ Only allowed users can access
- ✅ Instagram API calls work
- ✅ Puppeteer routes complete without timeout
- ✅ No errors in function logs

---

## 📞 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **NextAuth Docs:** https://next-auth.js.org/
- **Chromium Package:** https://github.com/Sparticuz/chromium

For Puppeteer issues on Vercel:
- Consider external service: https://www.browserbase.com/
- Or upgrade to Pro tier for longer timeouts

