# Deployment Guide - Vercel

This guide explains how to deploy the Accessibility Analyzer Tool (frontend + backend) to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)
3. **Node.js**: Version 18 or higher
4. **pnpm**: Version 8 or higher

## Project Structure

```
accessibility-analyzer-tool/
├── apps/
│   ├── frontend/          # NuxtJS 3 application
│   └── backend/           # ExpressJS TypeScript application
├── api/
│   └── index.ts          # Vercel serverless function handler
├── vercel.json           # Vercel configuration
├── package.json          # Root package.json (monorepo)
└── pnpm-workspace.yaml   # pnpm workspace configuration
```

## Deployment Steps

### 1. Prepare Your Repository

Ensure your repository is pushed to GitHub, GitLab, or Bitbucket.

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Vercel will automatically detect the configuration

### 3. Configure Environment Variables (Optional)

If your application uses environment variables, add them in the Vercel dashboard:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add any required environment variables:
   - `API_BASE_URL`: Your API base URL (optional, will be auto-detected)
   - `NODE_ENV`: Set to `production`

### 4. Deploy

1. Vercel will automatically build and deploy your application
2. The build process will:
   - Install dependencies using `pnpm install`
   - Build the backend TypeScript code
   - Build the NuxtJS frontend
   - Deploy both as serverless functions

### 5. Access Your Application

After deployment, you'll get:

- **Frontend**: `https://your-project.vercel.app`
- **Backend API**: `https://your-project.vercel.app/api`

## How It Works

### Frontend (NuxtJS)

- Built as a static site using Nuxt's static generation
- Served from the root domain
- API calls are proxied to the backend

### Backend (ExpressJS)

- Converted to serverless functions
- Served under `/api/*` routes
- Handles all API requests

### Routing

- `/api/*` → Backend serverless functions
- `/*` → Frontend static files

## Troubleshooting

### Build Issues

1. **Node.js Version**: Ensure you're using Node.js 18+ in Vercel
2. **pnpm**: Vercel supports pnpm automatically
3. **TypeScript**: Make sure all TypeScript files compile correctly

### Runtime Issues

1. **API Routes**: Check that your API routes are working at `/api/*`
2. **CORS**: The backend is configured with CORS for cross-origin requests
3. **Environment Variables**: Ensure all required env vars are set in Vercel

### Common Commands

```bash
# Local development
pnpm dev

# Build for production
pnpm build

# Test locally
pnpm start
```

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS settings as instructed

## Monitoring

- **Logs**: View function logs in the Vercel dashboard
- **Analytics**: Enable Vercel Analytics for performance monitoring
- **Functions**: Monitor serverless function performance

## Support

If you encounter issues:

1. Check the Vercel deployment logs
2. Verify your `vercel.json` configuration
3. Ensure all dependencies are properly installed
4. Check that TypeScript compilation succeeds
