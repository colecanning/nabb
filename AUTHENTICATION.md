# Authentication Setup Guide

This application uses Google Sign-In with NextAuth.js to restrict access to authorized users. **User access is controlled via the `ALLOWED_EMAILS` environment variable** - simple and reliable!

## Quick Setup

### 1. Generate NextAuth Secret

Generate a secret key for NextAuth:

```bash
openssl rand -base64 32
```

Copy the output and add it to your `.env.local` file as `NEXTAUTH_SECRET`.

### 2. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - For local development: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://yourdomain.com/api/auth/callback/google`
   - Click "Create"

5. Copy the Client ID and Client Secret to your `.env.local` file

### 3. Configure OAuth Consent Screen

1. Go to [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)
2. Fill in the required information:
   - App name: "Instagram Message Sender"
   - User support email: Your email
   - Developer contact: Your email
3. Save (publishing status doesn't matter - we control access via ALLOWED_EMAILS)

### 4. Configure Environment Variables & Add Users

Create a `.env.local` file in your project root (copy from `env.example`):

```env
# Authentication Configuration
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Allowed user emails (comma-separated, NO SPACES)
ALLOWED_EMAILS=your.email@gmail.com,teammate@gmail.com,admin@company.com
```

### 5. Managing Users

**To add a new user:**
1. Open `.env.local`
2. Add their email to `ALLOWED_EMAILS` (comma-separated, no spaces)
3. Restart the dev server

**To remove a user:**
1. Open `.env.local`
2. Remove their email from `ALLOWED_EMAILS`
3. Restart the dev server

### 6. Start the Application

```bash
pnpm dev
```

Visit `http://localhost:3000` - you'll be redirected to the login page.

## How It Works

### Protected Routes

All routes are protected except:
- `/login` - Login page
- `/api/auth/*` - Authentication API routes
- Static files and Next.js internals

### User Authorization Flow

1. User visits any page
2. Middleware checks if user is authenticated
3. If not authenticated, redirect to `/login`
4. User clicks "Sign in with Google"
5. Google OAuth flow begins
6. User authenticates with Google
7. **NextAuth checks if user's email is in `ALLOWED_EMAILS`**
8. If email is in the list, user is signed in
9. If not, access is denied with an error message

### Sign Out

Users can sign out by clicking the "Sign Out" button in the header. They'll be redirected back to the login page.

## Production Deployment

For production deployment:

1. Update `NEXTAUTH_URL` to your production domain:
   ```env
   NEXTAUTH_URL=https://yourdomain.com
   ```

2. Add your production callback URL to Google OAuth settings:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

3. Set all environment variables on your hosting platform (Vercel, Railway, etc.)

## Managing Users

All user management happens in your `.env.local` file.

### Adding a New User

1. Open `.env.local`
2. Add the user's email to `ALLOWED_EMAILS`:
   ```env
   ALLOWED_EMAILS=existing@gmail.com,newuser@gmail.com
   ```
3. Restart your dev server:
   ```bash
   pnpm dev
   ```

### Removing a User

1. Open `.env.local`
2. Remove the user's email from `ALLOWED_EMAILS`
3. Restart your dev server

### User Limit

- **No limit** - add as many users as you need
- All emails must be comma-separated with NO spaces
- Changes require server restart to take effect

## Troubleshooting

### "Sign in failed" or "Access denied" Error

- Check that the user's email is in `ALLOWED_EMAILS`
- Verify there are no spaces between comma-separated emails
- Make sure the email exactly matches (case-sensitive)
- Restart the dev server after changing `ALLOWED_EMAILS`
- Check server logs for access denied messages:
  ```
  ❌ Access denied for unauthorized@gmail.com
  ```

### OAuth Redirect URI Mismatch

- Ensure the callback URL in Google Console matches your `NEXTAUTH_URL`
- For local dev: `http://localhost:3000/api/auth/callback/google`
- For production: `https://yourdomain.com/api/auth/callback/google`

### "No ALLOWED_EMAILS configured" Error

- Make sure `ALLOWED_EMAILS` is set in `.env.local`
- Verify the file is named `.env.local` (not `.env` or `env.local`)
- Restart the dev server after creating/editing `.env.local`

### Session Issues

- Clear browser cookies
- Verify `NEXTAUTH_SECRET` is set and hasn't changed
- Check that `NEXTAUTH_URL` matches your current domain

## Security Best Practices

1. **Never commit `.env.local`** - Keep credentials and email list out of version control
2. **Use strong secrets** - Generate with `openssl rand -base64 32`
3. **Rotate secrets periodically** - Update `NEXTAUTH_SECRET` regularly
4. **Monitor access logs** - Check server logs for unauthorized access attempts
5. **Use HTTPS in production** - Never use HTTP for production deployments
6. **Limit Google OAuth scope** - Only request necessary permissions
7. **Remove departed users** - Keep `ALLOWED_EMAILS` up to date
8. **Use work emails** - Prefer company emails over personal ones for auditing
9. **Review regularly** - Audit `ALLOWED_EMAILS` list monthly

