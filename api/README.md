# 🔧 Vercel Serverless Functions

This directory contains the serverless backend for Vercel deployment.

## 📁 Files

### `index.py`
The main serverless function that handles all API endpoints. This is a Vercel-optimized version of `/app/backend/server.py` with:

- **MongoDB Connection Pooling**: Singleton pattern for efficient connection reuse
- **Lazy Initialization**: Collections are initialized on first request
- **CORS Configuration**: Pre-configured for Vercel domains
- **Error Handling**: Graceful fallbacks for all critical operations

### `requirements.txt`
Minimal Python dependencies for the serverless functions. Kept minimal to reduce cold start times.

## 🔄 Relationship with `/backend/`

- **`/app/backend/`**: Used for local development
- **`/app/api/`**: Used for Vercel serverless deployment

Both are functionally identical but optimized for their respective environments.

## 🚀 Deployment

This directory is automatically used by Vercel when deploying. Configuration is in `/app/vercel.json`.

**You don't need to do anything special** - Vercel will:
1. Detect `api/index.py`
2. Install dependencies from `requirements.txt`
3. Create serverless functions
4. Route `/api/*` requests to these functions

## 🔍 Testing

To test the serverless functions locally:

```bash
# Install Vercel CLI
npm install -g vercel

# Run local development server
vercel dev
```

This will simulate the Vercel environment on your machine.

## 📝 Notes

- All endpoints are prefixed with `/api/`
- Environment variables are loaded from Vercel dashboard
- Cold starts may take 1-3 seconds for first request
- Subsequent requests are fast (~100-500ms)

## 🆘 Troubleshooting

If functions don't work:
1. Check Vercel Functions logs in dashboard
2. Verify environment variables are set
3. Ensure MongoDB connection string is correct
4. Review CORS configuration if getting CORS errors

See [VERCEL_DEPLOYMENT_GUIDE.md](../VERCEL_DEPLOYMENT_GUIDE.md) for detailed troubleshooting.
