/** API host for production (VITE_API_URL on Render) and local dev */
const API_BASE = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'development'
    ? 'http://localhost:5000'
    : 'https://playpal-fyp.onrender.com')
).replace(/\/$/, '');

export default API_BASE;
