// API Configuration for different environments
const config = {
  development: {
    apiUrl: 'http://localhost:5001/api'  // Vite proxy handles this
  },
  production: {
    apiUrl: '/backend'  // Vercel will rewrite /backend/* to Railway
  }
};

// More reliable environment detection for Vercel
const isProduction = import.meta.env.PROD || 
                    import.meta.env.NODE_ENV === 'production' || 
                    window.location.hostname !== 'localhost';

const environment = isProduction ? 'production' : 'development';

export const API_BASE_URL = config[environment as keyof typeof config].apiUrl;

// Debug logging
console.log('🔧 API CONFIG DEBUG:');
console.log('🔧 Environment:', environment);
console.log('🔧 NODE_ENV:', import.meta.env.NODE_ENV);
console.log('🔧 VITE_PROD:', import.meta.env.PROD);
console.log('🔧 Hostname:', window.location.hostname);
console.log('🔧 Selected API_BASE_URL:', API_BASE_URL);
console.log('🔧 Full config:', config);