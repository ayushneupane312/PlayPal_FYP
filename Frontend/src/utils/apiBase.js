/** Single place for API host — set VITE_API_URL in Frontend/.env.development */
const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'development'
    ? 'http://localhost:3001'
    : 'https://playpal-fyp.onrender.com');

export default API_BASE;
