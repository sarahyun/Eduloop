// API Configuration for different environments
const config = {
  development: {
    apiUrl: 'http://localhost:5000/api'
  },
  production: {
    apiUrl: import.meta.env.VITE_API_URL || 'https://web-production-bb19.up.railway.app'
  }
};

const environment = import.meta.env.NODE_ENV || 'development';

export const API_BASE_URL = config[environment as keyof typeof config].apiUrl;

// Debug logging
console.log('🔧 API CONFIG DEBUG:');
console.log('🔧 Environment:', environment);
console.log('🔧 NODE_ENV:', import.meta.env.NODE_ENV);
console.log('🔧 VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('🔧 Selected API_BASE_URL:', API_BASE_URL);
console.log('🔧 Full config:', config);