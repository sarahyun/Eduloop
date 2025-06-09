// API Configuration for different environments
const config = {
  development: {
    apiUrl: 'http://localhost:5001/api'  // Vite proxy handles this
  },
  production: {
    apiUrl: '/backend'  // Vercel will rewrite /backend/* to Railway
  }
};

const environment = import.meta.env.NODE_ENV || 'development';

export const API_BASE_URL = config[environment as keyof typeof config].apiUrl;

// Debug logging
console.log('🔧 Environment:', environment);
console.log('🔧 API_BASE_URL:', API_BASE_URL);