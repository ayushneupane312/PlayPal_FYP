import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/auth"
    : "/auth";

const UPLOAD_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5000/upload"
    : "/upload";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,

  signup: async (email, password, name, userType) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/signup`, {
        email,
        password,
        name,
        userType,
      });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.msg || "Error signing up",
        isLoading: false,
      });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      
      // ✅ DEBUG LOGS ADDED
      console.log('=== LOGIN DEBUG ===');
      console.log('Response from backend:', response.data.user);
      console.log('Email logged in:', email);
      console.log('User name:', response.data.user.name);
      console.log('User role:', response.data.user.role);
      console.log('==================');
      
      set({
        isAuthenticated: true,
        user: response.data.user,
        error: null,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.msg || "Error logging in",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`${API_URL}/logout`);
      set({ user: null, isAuthenticated: false, error: null, isLoading: false });
      console.log("Logged out successfully");
    } catch (error) {
      set({ error: "Error logging out", isLoading: false });
      throw error;
    }
  },

  verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/verify-email`, { code });
            set({ user: response.data.user, isAuthenticated: true, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.msg || "Error verifying email", isLoading: false });
            throw error;
        }
    },

  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/check-auth`, {
        timeout: 8000,
      });
      
      // ✅ DEBUG LOGS ADDED
      console.log('=== CHECK AUTH DEBUG ===');
      console.log('User from checkAuth:', response.data.user);
      console.log('User name:', response.data.user?.name);
      console.log('User role:', response.data.user?.role);
      console.log('========================');
      
      set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
    } catch (error) {
      const isNetworkError = !error.response && (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message?.includes('Network Error'));
      set({
        error: null,
        isCheckingAuth: false,
        isAuthenticated: false,
        user: null,
      });
      if (isNetworkError && import.meta.env.MODE === 'development') {
        console.warn('Backend unreachable. Start the server (e.g. npm run server in backend folder) to avoid this.');
      }
    }
  },

  forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/forgot-password`, { email });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error.response.data.msg || "Error sending reset password email",
            });
            throw error;
        }
    },
    resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error.response.data.msg || "Error resetting password",
            });
            throw error;
        }
    },

    uploadFile: async (user_id, file) => {
        set({ isLoading: true, error: null });
        const formData = new FormData();
        formData.append('user_id', user_id);
        formData.append('file', file);

        try {
            const response = await axios.post(`${UPLOAD_URL}/upload-file`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            set({ isLoading: false });
            return response.data;
        } catch (error) {
            set({ 
                error: error.response?.data?.msg || "Error uploading file", 
                isLoading: false 
            });
            throw error;
        }
    },

    getFiles: async (user_id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${UPLOAD_URL}/get-file`, { 
                params: { user_id } 
            });
            set({ isLoading: false });
            return response.data;
        } catch (error) {
            set({ 
                error: error.response?.data?.msg || "Error getting files", 
                isLoading: false 
            });
            throw error;
        }
    },

}));