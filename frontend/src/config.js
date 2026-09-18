// Centralized application & backend API configuration
export const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080'
    : 'https://pollora-backend.onrender.com');

// WebSocket connection endpoint derived dynamically from API_URL
export const WS_URL = API_URL.replace(/^http/, 'ws');
