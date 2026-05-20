const API_BASE = import.meta.env.MODE === 'development'
  ? 'http://localhost:5000'
  : 'https://playpal-fyp.onrender.com';

export default API_BASE;
