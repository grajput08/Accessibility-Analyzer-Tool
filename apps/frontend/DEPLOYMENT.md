# Frontend Deployment Guide (Vercel)

This guide will help you deploy the Nuxt.js frontend to Vercel as a separate repository.

## Prerequisites

- A Vercel account (sign up at https://vercel.com)
- Git installed on your machine
- Node.js 18+ installed
- Backend already deployed (you'll need the backend URL)

## Step 1: Create a New Repository

1. Create a new Git repository for the frontend:

```bash
cd apps/frontend
git init
git add .
git commit -m "Initial commit - Frontend"
```

2. Create a new repository on GitHub (or GitLab/Bitbucket):
   - Go to GitHub and create a new repository
   - Name it something like `accessibility-analyzer-frontend`
   - Don't initialize with README (we already have code)

3. Push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/accessibility-analyzer-frontend.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your frontend repository
4. Configure the project:
   - **Framework Preset**: Nuxt.js (should auto-detect)
   - **Root Directory**: Leave as `./` (since this is now the root of your frontend repo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.output/public` (auto-configured by Nuxt)
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add the following:
     - `API_BASE_URL`: Your backend URL (e.g., `https://your-backend.vercel.app`)

6. Click "Deploy"

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Step 3: Update Backend CORS

After your frontend is deployed, you need to update the backend's CORS configuration:

1. Go to your backend project in Vercel dashboard
2. Go to "Settings" → "Environment Variables"
3. Update `FRONTEND_URL` to your frontend URL (e.g., `https://your-frontend.vercel.app`)
4. Redeploy the backend for changes to take effect

## Step 4: Test Your Deployment

1. Visit your frontend URL (e.g., `https://your-frontend.vercel.app`)
2. Try analyzing a URL to verify the frontend-backend connection works
3. Check browser console for any errors

## Troubleshooting

### API Connection Errors

If the frontend can't connect to the backend:
1. Verify `API_BASE_URL` is set correctly in Vercel environment variables
2. Check that the backend is responding (visit the backend URL directly)
3. Verify CORS is configured correctly on the backend
4. Check browser network tab for failed requests

### Build Failures

If build fails:
1. Check build logs in Vercel dashboard
2. Verify all dependencies are in `package.json`
3. Clear build cache in Vercel settings and redeploy
4. Check that Node.js version matches (18+)

### Pages Not Loading

If pages show 404 errors:
1. Verify Nuxt preset is set to "vercel" in `nuxt.config.ts`
2. Check that routes are configured correctly
3. Clear Vercel cache and redeploy

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `API_BASE_URL` | Backend API URL | `https://your-backend.vercel.app` |

## Continuous Deployment

Vercel automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Update frontend"
git push
```

Your changes will be automatically deployed to production.

## Custom Domain (Optional)

To add a custom domain:
1. Go to your project in Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update backend's `FRONTEND_URL` to match your custom domain

## Performance Optimization

For better performance:
1. Enable Edge Functions in Vercel settings
2. Configure caching headers
3. Use Nuxt's built-in image optimization
4. Enable compression
