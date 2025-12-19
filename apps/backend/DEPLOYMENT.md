# Backend Deployment Guide (Vercel)

This guide will help you deploy the backend Express.js API to Vercel as a separate repository.

## Prerequisites

- A Vercel account (sign up at https://vercel.com)
- Git installed on your machine
- Node.js 18+ installed

## Step 1: Create a New Repository

1. Create a new Git repository for the backend:

```bash
cd apps/backend
git init
git add .
git commit -m "Initial commit - Backend API"
```

2. Create a new repository on GitHub (or GitLab/Bitbucket):
   - Go to GitHub and create a new repository
   - Name it something like `accessibility-analyzer-backend`
   - Don't initialize with README (we already have code)

3. Push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/accessibility-analyzer-backend.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your backend repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: Leave as `./` (since this is now the root of your backend repo)
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add the following:
     - `FRONTEND_URL`: Your frontend URL (e.g., `https://your-frontend.vercel.app`)
     - `OPENAI_API_KEY`: Your OpenAI API key (if using AI features)
     - `NODE_ENV`: `production`

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

## Step 3: Configure Environment Variables

After deployment, note your backend URL (e.g., `https://your-backend.vercel.app`)

You'll need to update the frontend's `API_BASE_URL` environment variable with this URL.

## Step 4: Test Your Deployment

Test the API endpoints:

1. Health check:
```bash
curl https://your-backend.vercel.app/
```

2. API health:
```bash
curl https://your-backend.vercel.app/api/v1/health
```

## Troubleshooting

### CORS Errors

If you encounter CORS errors:
1. Make sure `FRONTEND_URL` environment variable is set correctly in Vercel
2. Verify the URL matches your frontend domain exactly (including https://)
3. Check Vercel logs for any error messages

### Dependencies Issues

If build fails due to dependencies:
1. Make sure all dependencies are in `dependencies`, not `devDependencies`
2. Check that Node.js version in Vercel matches your local version
3. Clear build cache in Vercel settings and redeploy

### API Not Responding

1. Check Vercel function logs in the dashboard
2. Verify the `vercel.json` configuration
3. Ensure the entry point in `vercel.json` matches your file structure

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `FRONTEND_URL` | Frontend domain for CORS | `https://your-frontend.vercel.app` |
| `OPENAI_API_KEY` | OpenAI API key (optional) | `sk-...` |
| `NODE_ENV` | Environment mode | `production` |

## Continuous Deployment

Vercel automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Update backend"
git push
```

Your changes will be automatically deployed to production.

## Custom Domain (Optional)

To add a custom domain:
1. Go to your project in Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `FRONTEND_URL` in frontend environment variables
