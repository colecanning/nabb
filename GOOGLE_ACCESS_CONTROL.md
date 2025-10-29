# Google-Based Access Control Options

This guide explains how to manage user access through Google instead of (or in addition to) environment variables.

## Quick Comparison

| Method | Managed In | Best For | Setup Complexity |
|--------|-----------|----------|------------------|
| **Test Users** | Google Console | Internal tools, development | ⭐ Easy |
| **Domain Restriction** | `.env.local` | Company-wide access | ⭐ Easy |
| **Email Whitelist** | `.env.local` | Small teams, specific users | ⭐ Easy |
| **Google Groups** | Google Workspace | Large orgs, dynamic teams | ⭐⭐⭐ Advanced |

---

## Method 1: OAuth Test Users (Easiest)

### ✅ Manage users directly in Google Console - no code needed!

**Setup:**

1. Go to [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)
2. Keep publishing status as **"Testing"** (not "In production")
3. Scroll to "Test users" section
4. Click "+ ADD USERS"
5. Add email addresses of allowed users
6. Save

**That's it!** Only test users can sign in. No environment variables needed.

**Configuration:**

You can simplify your `.env.local` to:
```env
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret

# No ALLOWED_EMAILS needed - Google handles it!
```

**Pros:**
- ✅ Manage users in Google Console UI
- ✅ No server restart needed
- ✅ No code deployment to add/remove users
- ✅ Perfect for internal tools

**Cons:**
- ❌ Limited to 100 test users
- ❌ Requires "Testing" status (not published)
- ❌ Users may see scary "unverified app" warning

**When to use:** Internal company tools, development, small teams (< 100 users)

---

## Method 2: Domain-Based Access

### ✅ Allow anyone from your company domain

**Setup:**

In your `.env.local`:
```env
# Allow all @yourcompany.com emails
ALLOWED_DOMAINS=yourcompany.com

# Or multiple domains
ALLOWED_DOMAINS=yourcompany.com,partner.com,contractor.com
```

**How it works:**
- Any user with `@yourcompany.com` email can sign in
- Great for Google Workspace organizations
- No need to add individual users

**Configuration options:**

```env
# Option A: Domain only (anyone from domain can access)
ALLOWED_DOMAINS=yourcompany.com

# Option B: Specific emails only
ALLOWED_EMAILS=user1@gmail.com,user2@gmail.com

# Option C: Combination (allow domain + specific external users)
ALLOWED_DOMAINS=yourcompany.com
ALLOWED_EMAILS=contractor@external.com,consultant@other.com
```

**Pros:**
- ✅ No limit on number of users
- ✅ New employees automatically have access
- ✅ Works with Google Workspace
- ✅ Simple to configure

**Cons:**
- ❌ Requires server restart to change domains
- ❌ All domain users have access (less granular)
- ❌ Can't restrict to specific teams within domain

**When to use:** Company-wide tools, Google Workspace organizations, open internal access

---

## Method 3: Google Workspace Groups (Advanced)

### ✅ Manage access via Google Groups - most flexible!

**How it works:**
1. Create a Google Group: `app-users@yourcompany.com`
2. Add/remove members in Google Admin
3. App checks if user is in the group
4. No code changes or server restarts needed

**Setup Requirements:**
- Google Workspace (paid accounts)
- Google Admin SDK enabled
- Service account or domain-wide delegation
- Additional OAuth scopes

**Implementation:**

See the example file: `app/api/auth/[...nextauth]/route-with-workspace.ts.example`

This requires:
1. Enabling Admin SDK API in Google Console
2. Requesting additional OAuth scope: `admin.directory.user.readonly`
3. Setting up service account credentials
4. Implementing group membership check

**Pros:**
- ✅ Manage users in Google Admin Console
- ✅ No server restart needed
- ✅ Can use existing Google Groups
- ✅ Supports nested groups
- ✅ Perfect for large organizations

**Cons:**
- ❌ Requires Google Workspace (paid)
- ❌ Complex setup with Admin SDK
- ❌ Needs additional API scopes
- ❌ May require IT/admin approval

**When to use:** Large organizations, complex access rules, enterprises with Google Workspace

---

## Method 4: Hybrid Approach (Recommended)

### ✅ Combine multiple methods for flexibility

**Configuration:**

```env
# Allow company domain
ALLOWED_DOMAINS=yourcompany.com

# Plus specific external users
ALLOWED_EMAILS=consultant@external.com,partner@other.com
```

**AND** use Google Console test users for beta testers:
- Keep app in "Testing" mode
- Add beta testers as test users
- They get access even if not in domain/email list

**Benefits:**
- Company employees: Automatic access via domain
- External users: Add to ALLOWED_EMAILS
- Beta testers: Manage in Google Console
- Maximum flexibility!

---

## Current Implementation

Your app currently supports:

1. ✅ **Specific email whitelist** via `ALLOWED_EMAILS`
2. ✅ **Domain-based access** via `ALLOWED_DOMAINS`
3. ✅ **Both methods** can be used together

### Examples:

**Example 1: Company domain + CEO's personal email**
```env
ALLOWED_DOMAINS=acmecorp.com
ALLOWED_EMAILS=ceo@gmail.com
```
Result: All `@acmecorp.com` emails + `ceo@gmail.com` can access

**Example 2: Multiple companies**
```env
ALLOWED_DOMAINS=acmecorp.com,partnercorp.com
```
Result: Both company domains allowed

**Example 3: Specific team members only**
```env
ALLOWED_EMAILS=alice@company.com,bob@company.com,carol@company.com
```
Result: Only these three users allowed

---

## Migration Guide

### From Email Whitelist → Domain Access

**Before:**
```env
ALLOWED_EMAILS=user1@company.com,user2@company.com,user3@company.com,...
```

**After:**
```env
ALLOWED_DOMAINS=company.com
```

**Steps:**
1. Update `.env.local`
2. Restart server: `pnpm dev`
3. Test with a company email
4. Remove old ALLOWED_EMAILS

### From ENV Variables → Google Test Users

**Steps:**
1. Go to Google Console OAuth consent screen
2. Add all users from ALLOWED_EMAILS as test users
3. Remove ALLOWED_EMAILS from `.env.local`
4. Keep app in "Testing" mode
5. Restart server

**Simplify code (optional):**

You can remove the email check from `route.ts` since Google handles it:

```typescript
async signIn({ user }) {
  // Google already checks test users - just allow everyone
  return true;
}
```

---

## Troubleshooting

### "Access Denied" but user should be allowed

1. **Check domain spelling:** `company.com` not `www.company.com`
2. **No spaces:** `company.com,other.com` ✅ not `company.com, other.com` ❌
3. **Restart server:** Changes to `.env.local` require restart
4. **Check user's actual email:** Have them check their Google account email

### Test users not working

1. **Publishing status must be "Testing"** not "In production"
2. **User must be added to test users list**
3. **User must sign in with the exact email listed**
4. **May take a few minutes for Google to update**

### Domain restriction not working

1. **Restart the server** after changing ALLOWED_DOMAINS
2. **Check the email domain** matches exactly
3. **Make sure variable is ALLOWED_DOMAINS** not ALLOWED_DOMAIN (plural)

---

## Recommendations

### For Small Teams (< 10 users)
→ Use **ALLOWED_EMAILS** or **Google Test Users**

### For Companies with Google Workspace
→ Use **ALLOWED_DOMAINS** to allow all employees

### For Large Organizations
→ Consider **Google Groups** integration

### For Mixed Internal + External
→ Use **ALLOWED_DOMAINS** + **ALLOWED_EMAILS** combo

### For Development/Beta Testing
→ Use **Google Test Users** + keep in Testing mode

---

## Security Notes

1. **Never publish test user app** - keeps control tight
2. **Use domain restriction** when possible - less to maintain
3. **Review access regularly** - remove departed employees
4. **Use Google Groups** for large orgs - better audit trail
5. **Enable 2FA** - recommend for all users
6. **Monitor sign-ins** - check NextAuth logs

---

## Need More Control?

For advanced use cases, consider:

- **Role-based access control (RBAC)** - Add roles to users
- **Database user management** - Store users in your DB
- **API key per user** - For programmatic access
- **Session duration limits** - Force re-authentication
- **IP-based restrictions** - Limit to office networks

These require custom implementation beyond NextAuth defaults.

