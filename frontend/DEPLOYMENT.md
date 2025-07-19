# Vercel Deployment Guide

## Prerequisites
- Your backend API must be deployed and accessible
- Vercel account connected to your GitHub repository

## Environment Variables
Set these in your Vercel project settings:

```
VITE_API_URL=https://your-backend-url.com
```

Replace `your-backend-url.com` with your actual backend API URL.

## Deployment Steps

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Build Settings**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3. **Set Environment Variables**: Add `VITE_API_URL` in Vercel dashboard
4. **Deploy**: Vercel will automatically deploy on push to main branch

## Troubleshooting

### 404 Errors
- The `vercel.json` file handles client-side routing
- All routes redirect to `index.html` for SPA functionality

### API Connection Issues
- Ensure `VITE_API_URL` is set correctly
- Check that your backend allows CORS from your Vercel domain
- Verify backend is accessible from the internet

### Build Errors
- Check that all dependencies are in `package.json`
- Ensure Node.js version is compatible (16+ recommended) 