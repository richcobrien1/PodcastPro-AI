# Cloudflare Pages Deployment Guide

## Overview

This guide walks through deploying PodcastProAI frontend to Cloudflare Pages with automatic CI/CD from GitHub.

---

## Prerequisites

- [x] Cloudflare account (free tier is sufficient)
- [x] GitHub repository with code pushed
- [x] Clerk account with API keys
- [ ] Domain name (optional for initial deployment)

---

## Step 1: Connect GitHub Repository

1. **Go to Cloudflare Dashboard**
   - Navigate to https://dash.cloudflare.com
   - Click **Pages** in the left sidebar
   - Click **Create a project**

2. **Connect to Git**
   - Click **Connect to Git**
   - Authorize Cloudflare to access your GitHub account
   - Select the `PodcastPro-AI` repository
   - Click **Begin setup**

---

## Step 2: Configure Build Settings

**Framework preset**: `Vite`

**Build configuration**:
```
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: client
Node.js version: 18
```

**Environment Variables** (add in Production environment):
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

> ⚠️ **Important**: All frontend environment variables must be prefixed with `VITE_` to be accessible in your React app.

**Advanced settings** (optional):
- Branch: `master` (or `main`)
- Build watch paths: `client/**` (optional - limits rebuilds to client directory changes)

---

## Step 3: Deploy

1. Click **Save and Deploy**
2. Wait 2-3 minutes for the initial build
3. You'll receive a deployment URL: `https://podcastpro-ai-xxx.pages.dev`

**Build Process**:
- ✅ Cloudflare clones your repository
- ✅ Installs dependencies (`npm install`)
- ✅ Runs build command (`npm run build`)
- ✅ Deploys `dist/` folder to global CDN
- ✅ Issues SSL certificate automatically

---

## Step 4: Verify Deployment

**Test the deployment**:
1. Visit your `*.pages.dev` URL
2. Verify landing page loads correctly
3. Test navigation between pages
4. Check that assets (images, icons) load
5. Open browser console - verify no errors
6. Test sign-in flow (Clerk should work on deployed URL)

**Common Issues**:
- **404 on refresh**: Already fixed with `_redirects` file
- **Blank page**: Check console for VITE_ environment variable errors
- **Clerk not working**: Add deployed URL to Clerk's authorized domains

---

## Step 5: Add Custom Domain (Optional)

### Option A: Domain Registered with Cloudflare

1. **Add Custom Domain**:
   - Pages → Your project → **Custom domains** tab
   - Click **Set up a custom domain**
   - Enter: `podcastpro.ai` (or `app.podcastpro.ai`)
   - Click **Continue**

2. **DNS Auto-Configuration**:
   - Cloudflare automatically creates CNAME record
   - SSL certificate issued within 2 minutes
   - Domain live within 5 minutes

### Option B: Domain Registered Elsewhere

1. **Add Custom Domain** (same as above)

2. **Manual DNS Configuration**:
   ```
   Type: CNAME
   Name: @ (for root) or app (for subdomain)
   Target: podcastpro-ai-xxx.pages.dev
   ```

3. **Wait for DNS Propagation**: 5 minutes - 24 hours

---

## Step 6: Update Clerk Configuration

Once your custom domain is live:

1. **Go to Clerk Dashboard**:
   - Navigate to https://dashboard.clerk.com
   - Select your application
   - Go to **Paths** settings

2. **Update Authorized Domains**:
   - Add production domain: `https://podcastpro.ai`
   - Add app subdomain: `https://app.podcastpro.ai` (if using)
   - Keep localhost for development: `http://localhost:5173`

3. **Update Frontend Environment Variable**:
   - In Cloudflare Pages → Environment variables
   - Change to production Clerk key if different:
     ```
     VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_KEY
     ```

---

## Step 7: Configure Automatic Deployments

**Already configured!** Cloudflare Pages automatically:
- ✅ Deploys on every push to `master` branch
- ✅ Creates preview deployments for pull requests
- ✅ Provides unique URL for each deployment
- ✅ Allows instant rollback to previous versions

**Deployment triggers**:
- Push to `master` → Production deployment
- Push to any other branch → Preview deployment
- Pull request → Preview deployment with unique URL

**Managing Deployments**:
- View all deployments: Pages → Your project → **Deployments** tab
- Rollback: Click on previous deployment → **Rollback to this deployment**
- Cancel build: Click **Cancel** during build process

---

## Advanced Configuration

### Custom Build Command

If you need custom build logic, update in Pages settings:

```bash
# Install dependencies in client directory
cd client && npm ci

# Run custom build script
npm run build:production

# Optional: Run tests before build
npm run test
```

### Environment Variables by Environment

Cloudflare Pages supports multiple environments:
- **Production** (master branch)
- **Preview** (all other branches)

Add different variables for each:
```
# Production
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_API_URL=https://api.podcastpro.ai

# Preview
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=https://api-preview.podcastpro.ai
```

### Build Caching

Cloudflare automatically caches:
- ✅ `node_modules/` between builds
- ✅ Build artifacts when dependencies don't change

**Clear cache**: Pages → Settings → **Build configuration** → Clear build cache

### Functions (Optional - for API routes)

If you need serverless functions:

1. Create `client/functions/` directory
2. Add function files (e.g., `api.js`)
3. Cloudflare deploys them as Workers
4. Access at: `https://yourdomain.com/api`

---

## Monitoring & Analytics

**Built-in Analytics** (free):
- Pages → Your project → **Analytics** tab
- Page views, unique visitors, bandwidth
- Geographic distribution
- Top pages and referrers

**Web Analytics** (free, privacy-first):
- Add to your site for detailed analytics
- No cookies, GDPR-compliant
- Real-time visitor tracking

---

## Troubleshooting

### Build Fails

**Check build logs**:
1. Pages → Your project → **Deployments**
2. Click on failed deployment
3. View full build log
4. Common issues:
   - Missing dependencies in `package.json`
   - TypeScript errors (if strict mode enabled)
   - Environment variable missing

**Solution**:
- Fix issue locally
- Push to GitHub
- Cloudflare auto-retries build

### 404 Errors on Page Refresh

**Already fixed** with `client/public/_redirects` file.

If still happening:
1. Verify `_redirects` file exists in `client/public/`
2. Check build output includes `_redirects` in `dist/`
3. Redeploy if needed

### Environment Variables Not Working

**Check**:
1. Variables are prefixed with `VITE_`
2. Variables are set in correct environment (Production vs Preview)
3. Rebuild after adding/changing variables (Cloudflare doesn't auto-rebuild)

**Force Rebuild**:
- Pages → Deployments → **Retry deployment**

### Slow Build Times

**Optimization**:
1. Use `npm ci` instead of `npm install` (faster, more reliable)
2. Limit build watch paths to `client/**`
3. Check for large dependencies (consider lazy loading)

---

## Deployment Checklist

Before going live:

- [ ] Build succeeds locally (`npm run build`)
- [ ] Environment variables configured in Cloudflare
- [ ] `_redirects` file exists for React Router
- [ ] Clerk authorized domains updated
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (auto-issued by Cloudflare)
- [ ] Test all routes on deployed URL
- [ ] Test sign-in/sign-up flow
- [ ] Check browser console for errors
- [ ] Verify assets load correctly (images, fonts, icons)
- [ ] Test on mobile devices
- [ ] Set up monitoring/analytics

---

## Post-Deployment

### Continuous Deployment Workflow

1. **Develop locally**:
   ```bash
   cd client
   npm run dev
   ```

2. **Test changes**:
   - Verify functionality locally
   - Run `npm run build` to check for build errors

3. **Commit and push**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin master
   ```

4. **Automatic deployment**:
   - Cloudflare detects push
   - Builds and deploys automatically
   - Live in 1-2 minutes

5. **Verify deployment**:
   - Visit production URL
   - Test new features
   - Monitor for errors

### Rollback if Needed

1. Go to Pages → Deployments
2. Find previous working deployment
3. Click **Rollback to this deployment**
4. Site reverts instantly (no rebuild needed)

---

## Cost Breakdown

**Free Tier** (Perfect for MVP):
- 500 builds/month (~17 per day)
- Unlimited bandwidth
- Unlimited requests
- Unlimited projects
- Automatic SSL
- DDoS protection
- Global CDN

**Paid Tier** ($20/month):
- Only if you exceed 500 builds/month
- Same features as free tier
- Unlikely to need unless very active development

**Estimated Usage**:
- Development: 5-10 deployments/day = 150-300/month
- Production: 1-2 deployments/day = 30-60/month
- Total: **180-360 builds/month** (well within free tier)

---

## Support Resources

- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages
- **Vite Deployment Guide**: https://vitejs.dev/guide/static-deploy.html
- **Clerk Deployment**: https://clerk.com/docs/deployments/overview
- **Cloudflare Community**: https://community.cloudflare.com

---

## Next Steps

After successful frontend deployment:

1. **Deploy Backend API**:
   - Consider Cloudflare Workers for API
   - Or deploy Express server to Railway/Render
   - Update `VITE_API_URL` environment variable

2. **Configure R2 Storage**:
   - Set up R2 bucket for assets
   - Configure CORS for frontend access
   - Update asset upload endpoints

3. **Set Up Monitoring**:
   - Enable Cloudflare Web Analytics
   - Set up error tracking (Sentry)
   - Configure uptime monitoring

4. **Performance Optimization**:
   - Enable asset compression
   - Configure caching headers
   - Optimize images and bundles

---

*Last Updated: January 10, 2026*
