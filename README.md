# Eduloop

A college counseling platform that helps students with college planning, applications, and AI-powered guidance.

## Architecture

- **Frontend**: React + TypeScript with Vite
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: Firebase Auth
- **AI**: OpenAI GPT-4

## Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB (local or cloud)
- Firebase project
- OpenAI API key

### Environment Variables

Create a `.env` file in the root directory with:

```env
# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Session Secret
SESSION_SECRET=your_session_secret_key
```

### Installation

1. Install Node.js dependencies:
```bash
npm install
```

2. Install Python dependencies:
```bash
pip install -r backend/requirements.txt
```

## Running the Application

### Development

1. Start the FastAPI backend:
```bash
npm run backend
```

2. In a new terminal, start the frontend:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

### Production

1. Build the frontend:
```bash
npm run build
```

2. Start the backend:
```bash
python start_backend.py
```

## Features

- User authentication with Firebase
- Student profile management
- AI-powered college counseling chat
- College recommendations
- Profile insights and analytics
- College search and exploration

## API Endpoints

The FastAPI backend provides the following main endpoints:

- `/auth/*` - Authentication endpoints
- `/users/*` - User management
- `/profiles/*` - Student profiles
- `/colleges/*` - College data
- `/conversations/*` - Chat conversations
- `/messages/*` - Chat messages
- `/chat` - AI-powered chat
- `/college-recommendations/{user_id}` - AI college recommendations
- `/profile-insights/{user_id}` - Profile analysis