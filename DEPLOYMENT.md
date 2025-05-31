# Deployment Guide

This application can be deployed using Vercel for the frontend and Railway for the backend.

## Architecture Overview

- **Frontend**: React + Vite (deployed on Vercel)
- **Backend**: FastAPI + Python (deployed on Railway)
- **Database**: MongoDB Atlas (cloud database)

## Step-by-Step Deployment

### 1. Deploy Backend to Railway

1. **Create a Railway account** at [railway.app](https://railway.app)

2. **Create a new project** and connect your GitHub repository

3. **Set environment variables** in Railway dashboard:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   OPENAI_API_KEY=your_openai_api_key
   SESSION_SECRET=your_secure_session_secret
   ```

4. **Railway will automatically**:
   - Detect Python project
   - Install dependencies from `backend/requirements.txt`
   - Run `python main.py` (configured in `railway.json`)

5. **Note your Railway URL** (e.g., `https://your-app-name.up.railway.app`)

### 2. Deploy Frontend to Vercel

1. **Create a Vercel account** at [vercel.com](https://vercel.com)

2. **Import your GitHub repository**

3. **Configure build settings**:
   - Framework Preset: Vite
   - Root Directory: `.` (leave as root)
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Set environment variables** in Vercel dashboard:
   ```
   VITE_API_URL=https://your-railway-backend-url.up.railway.app
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

5. **Update `vercel.json`** with your actual Railway URL:
   ```json
   "rewrites": [
     {
       "source": "/api/(.*)",
       "destination": "https://your-actual-railway-url.up.railway.app/api/$1"
     }
   ]
   ```

### 3. Required Services Setup

**MongoDB Atlas**:
- Create cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
- Allow access from anywhere (0.0.0.0/0) for Railway
- Copy connection string

**OpenAI API**:
- Get API key from [platform.openai.com](https://platform.openai.com)
- Add billing information for API usage

**Firebase Authentication**:
- Create project at [console.firebase.google.com](https://console.firebase.google.com)
- Enable Authentication service
- Configure sign-in methods (Email/Password)
- Get configuration from Project Settings

### 4. Production Configuration

The application will automatically:
- Use production API URLs when deployed
- Handle CORS for cross-origin requests
- Connect to MongoDB Atlas
- Serve optimized React build

### 5. Local Development vs Production

**Local Development**:
```bash
npm run dev  # Runs both frontend and backend locally
```

**Production**:
- Frontend: Vercel serves static React build
- Backend: Railway runs FastAPI server
- Communication: API calls over HTTPS

## Troubleshooting

- **CORS Issues**: Check that your Railway backend allows requests from your Vercel domain
- **Environment Variables**: Ensure all required variables are set in both Railway and Vercel
- **API Endpoints**: Verify the Railway URL is correctly configured in Vercel rewrites
- **Database Connection**: Check MongoDB Atlas network access and connection string

Your deployed application will be available at your Vercel URL (e.g., `https://your-app.vercel.app`).