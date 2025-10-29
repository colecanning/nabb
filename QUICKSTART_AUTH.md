# Quick Start: Google Authentication

Simple 5-minute setup guide for adding users.

## Step 1: Get Google Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create **OAuth 2.0 Client ID** (NOT API key)
3. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Client Secret

## Step 2: Setup Environment

Create `.env.local`:

```env
NEXTAUTH_SECRET=run_this_command: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_client_secret_here

# Add allowed user emails (comma-separated, NO SPACES)
ALLOWED_EMAILS=your.email@gmail.com,teammate@gmail.com
```

## Step 3: Configure OAuth Consent Screen

1. Go to [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)
2. Fill in app name and your email
3. Save (publishing status doesn't matter - we control access via ALLOWED_EMAILS)

## Step 4: Start App

```bash
pnpm install
pnpm dev
```

Visit `http://localhost:3000` - only emails in ALLOWED_EMAILS can sign in!

---

## Adding/Removing Users

### Add a user:
1. Open `.env.local`
2. Add their email to ALLOWED_EMAILS (comma-separated, no spaces)
   ```env
   ALLOWED_EMAILS=existing@gmail.com,newuser@gmail.com
   ```
3. Restart dev server: `pnpm dev`

### Remove a user:
1. Open `.env.local`
2. Remove their email from ALLOWED_EMAILS
3. Restart dev server: `pnpm dev`

---

## Important Notes

- ✅ Only emails in ALLOWED_EMAILS can sign in
- ✅ No user limit - add as many as you want
- ✅ Full control in your code
- ✅ Users must sign in with exact email (case-sensitive)
- ❌ Don't use API keys - use OAuth credentials
- ⚠️ Requires server restart to add/remove users

---

## Troubleshooting

**"Access denied" after signing in with Google?**
→ Email not in ALLOWED_EMAILS - add it and restart server

**"Invalid redirect URI"?**
→ Add `http://localhost:3000/api/auth/callback/google` to OAuth credentials

**Added user but still can't sign in?**
→ Restart the dev server after changing ALLOWED_EMAILS

**Check server logs:**
```bash
✅ Access granted for user@gmail.com
❌ Access denied for unauthorized@gmail.com
```

---

For detailed docs, see `AUTHENTICATION.md`

