import axios from 'axios';

const TOKEN_KEY = 'playpal_token';

/** Persist JWT for cross-origin API (playpal-web → playpal-fyp) when cookies are blocked */
export function setAuthToken(token) {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
    delete axios.defaults.headers.common.Authorization;
  }
}

export function loadAuthToken() {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
  return token;
}

axios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.defaults.withCredentials = true;
