# Railway Deployment Guide

## Files Added for Railway Deployment

The following files have been created/updated to support Railway deployment:

### 1. `Procfile`
Tells Railway how to start your application:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### 2. `railway.json`
Railway-specific configuration with health checks and deployment settings.

### 3. `runtime.txt`
Specifies Python version (3.11).

### 4. `env.example`
Documents required environment variables.

### 5. Updated `main.py`
Added proper environment variable loading with `load_dotenv()`.

### 6. Updated `requirements.txt`
Added `pydantic-settings` dependency.

## Environment Variables to Set in Railway

In your Railway project dashboard, set these environment variables:

### Required:
- `MONGODB_URI` - Your MongoDB connection string
- `OPENAI_API_KEY` - Your OpenAI API key
- `DATABASE_NAME` - Your database name (e.g., "CollegeCounselingDB")

### Optional:
- `PORT` - Railway will set this automatically
- `HOST` - Defaults to "0.0.0.0"
- `WORKERS` - Defaults to 1
- `DEBUG` - Set to "false" for production
- `ENVIRONMENT` - Set to "production"

## Deployment Steps

1. **Connect to Railway:**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select the backend folder as your root directory

2. **Set Environment Variables:**
   - In Railway dashboard, go to Variables tab
   - Add all required environment variables listed above

3. **Deploy:**
   - Railway will automatically detect your Python app
   - It will use the `Procfile` to start your application
   - Health checks will be performed on `/health` endpoint

4. **Monitor:**
   - Check the deployment logs in Railway dashboard
   - Your API will be available at the provided Railway URL

## Health Check

Your app includes a health check endpoint at `/health` that Railway will use to verify your deployment is working correctly.

## Database Setup

Make sure your MongoDB database is accessible from Railway. You can use:
- MongoDB Atlas (recommended)
- Railway's MongoDB addon
- Any other cloud MongoDB service

## Troubleshooting

If deployment fails:
1. Check the Railway logs for error messages
2. Verify all environment variables are set correctly
3. Ensure your MongoDB connection string is accessible from Railway
4. Check that all dependencies in `requirements.txt` are correct 