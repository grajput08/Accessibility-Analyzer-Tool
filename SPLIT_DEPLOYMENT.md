# Split Deployment Guide

This guide explains how to deploy the frontend and backend as separate repositories on Vercel.

## Overview

The Accessibility Analyzer Tool consists of two separate applications:
- **Frontend**: Nuxt.js application
- **Backend**: Express.js API

Each will be deployed as a separate project on Vercel.

## Quick Start

### 1. Deploy Backend First

```bash
# Navigate to backend directory
cd apps/backend

# Initialize git repository
git init
git add .
git commit -m "Initial commit - Backend API"

# Create repository on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/accessibility-backend.git
git branch -M main
git push -u origin main
```

Deploy to Vercel:
1. Go to https://vercel.com/new
2. Import the backend repository
3. Add environment variables:
   - `FRONTEND_URL`: Set this after frontend deployment
   - `OPENAI_API_KEY`: Your OpenAI API key (optional)
4. Deploy

**Important**: Note your backend URL (e.g., `https://your-backend.vercel.app`)

### 2. Deploy Frontend

```bash
# Navigate to frontend directory
cd apps/frontend

# Initialize git repository
git init
git add .
git commit -m "Initial commit - Frontend"

# Create repository on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/accessibility-frontend.git
git branch -M main
git push -u origin main
```

Deploy to Vercel:
1. Go to https://vercel.com/new
2. Import the frontend repository
3. Add environment variables:
   - `API_BASE_URL`: Your backend URL from step 1
4. Deploy

**Important**: Note your frontend URL (e.g., `https://your-frontend.vercel.app`)

### 3. Update Backend CORS

1. Go back to your backend project in Vercel
2. Settings → Environment Variables
3. Set `FRONTEND_URL` to your frontend URL from step 2
4. Redeploy the backend

## Architecture

```
┌─────────────────────────────────────────┐
│  User's Browser                         │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Frontend (Nuxt.js)                     │
│  Deployed on Vercel                     │
│  https://your-frontend.vercel.app       │
└─────────────────┬───────────────────────┘
                  │
                  │ API Calls
                  ▼
┌─────────────────────────────────────────┐
│  Backend (Express.js)                   │
│  Deployed on Vercel                     │
│  https://your-backend.vercel.app        │
└─────────────────────────────────────────┘
```

## Environment Variables

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FRONTEND_URL` | Your frontend domain for CORS | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI features | No |
| `NODE_ENV` | Set to `production` | Yes |

### Frontend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `API_BASE_URL` | Your backend API URL | Yes |

## File Structure

Each repository should contain only its respective application:

### Backend Repository
```
accessibility-analyzer-backend/
├── src/
│   ├── index.ts
│   ├── routes/
│   ├── services/
│   └── types/
├── package.json
├── tsconfig.json
├── vercel.json
├── .env.example
└── DEPLOYMENT.md
```

### Frontend Repository
```
accessibility-analyzer-frontend/
├── pages/
├── components/
├── composables/
├── stores/
├── assets/
├── layouts/
├── app.vue
├── nuxt.config.ts
├── package.json
├── tsconfig.json
├── vercel.json
├── .env.production
└── DEPLOYMENT.md
```

## Testing the Deployment

1. **Test Backend**:
   ```bash
   curl https://your-backend.vercel.app/
   curl https://your-backend.vercel.app/api/v1/health
   ```

2. **Test Frontend**:
   - Visit your frontend URL in a browser
   - Try analyzing a URL
   - Check browser console for errors

3. **Test Integration**:
   - Verify frontend can communicate with backend
   - Check network tab in browser dev tools
   - Ensure no CORS errors

## Common Issues

### CORS Errors
- Verify `FRONTEND_URL` is set correctly on backend
- Ensure URL includes `https://` and no trailing slash
- Redeploy backend after changing environment variables

### Connection Refused
- Check that `API_BASE_URL` is correct on frontend
- Verify backend is deployed and running
- Check Vercel function logs for errors

### Build Failures
- Ensure all dependencies are listed in `package.json`
- Check Node.js version (must be 18+)
- Clear build cache and redeploy

## Continuous Deployment

Both repositories will auto-deploy when you push to main:

```bash
# Make changes
git add .
git commit -m "Your commit message"
git push

# Vercel automatically deploys
```

## Custom Domains

### Backend Custom Domain
1. Vercel Dashboard → Backend Project → Settings → Domains
2. Add your API domain (e.g., `api.yourdomain.com`)
3. Update frontend's `API_BASE_URL` to new domain

### Frontend Custom Domain
1. Vercel Dashboard → Frontend Project → Settings → Domains
2. Add your domain (e.g., `www.yourdomain.com`)
3. Update backend's `FRONTEND_URL` to new domain

## Monitoring

Monitor your deployments:
- **Vercel Dashboard**: View logs, analytics, and performance
- **Browser DevTools**: Check network requests and console
- **Vercel Analytics**: Track page views and performance metrics

## Support

For detailed instructions:
- Backend: See `apps/backend/DEPLOYMENT.md`
- Frontend: See `apps/frontend/DEPLOYMENT.md`

For issues:
- Check Vercel documentation: https://vercel.com/docs
- Review function logs in Vercel dashboard
- Verify environment variables are set correctly
