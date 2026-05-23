/** API host for production (VITE_API_URL on Render) and local dev */
function normalizeApiBase(url) {
  let base = (url || '').trim().replace(/\/+$/, '');
  // Common mistake: VITE_API_URL ending with /api breaks /auth routes
  if (base.endsWith('/api')) base = base.slice(0, -4);
  return base;
}

const API_BASE = normalizeApiBase(
  import.meta.env.VITE_API_URL ||
    (import.meta.env.MODE === 'development'
      ? 'http://localhost:5000'
      : 'https://playpal-fyp.onrender.com')
);

export default API_BASE;
