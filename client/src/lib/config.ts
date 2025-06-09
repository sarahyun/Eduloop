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