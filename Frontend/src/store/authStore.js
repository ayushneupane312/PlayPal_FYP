import { create } from "zustand";
import axios from "axios";
import API_BASE from "../utils/apiBase.js";
import { setAuthToken } from "../utils/setupAxios.js";

const API_URL = `${API_BASE}/auth`;
const UPLOAD_URL = `${API_BASE}/upload`;
const UPLOAD_API = `${API_BASE}/api/upload`;

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
      const response = await axios.post(
        `${API_URL}/signup`,
        { email, password, name, userType },
        { timeout: 30000 }
      );
      if (response.data?.token) setAuthToken(response.data.token);
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

      if (response.data?.token) setAuthToken(response.data.token);

      if (!response.data?.success || !response.data?.user) {
        const err = new Error(response.data?.msg || "Login failed");
        err.response = { data: response.data };
        throw err;
      }

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
      setAuthToken(null);
      set({ user: null, isAuthenticated: false, error: null, isLoading: false });
      console.log("Logged out successfully");
    } catch (error) {
      set({ error: "Error logging out", isLoading: false });
      throw error;
    }
  },

  resendVerification: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.post(`${API_URL}/resend-verification`, {}, { timeout: 30000 });
      set({ isLoading: false, error: null, message: data.msg });
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.msg || 'Could not resend verification email',
        isLoading: false,
      });
      throw error;
    }
  },

  verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/verify-email`, { code });
            if (response.data?.token) setAuthToken(response.data.token);
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
      
      set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
    } catch (error) {
      setAuthToken(null);
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

  updateMe: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.patch(`${API_URL}/me`, payload);
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Update failed",
        isLoading: false,
      });
      throw error;
    }
  },

  changePassword: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.patch(`${API_URL}/change-password`, payload);
      set({ isLoading: false, error: null });
      return data;
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          error.response?.data?.msg ||
          "Password change failed",
        isLoading: false,
      });
      throw error;
    }
  },

  /** Upload image to Cloudinary, then save URL on the logged-in user */
  uploadProfileImage: async (file) => {
    set({ isLoading: true, error: null });
    const formData = new FormData();
    formData.append("file", file);
    try {
      const uploadRes = await axios.post(`${UPLOAD_API}/file`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = uploadRes.data?.url;
      if (!url) throw new Error("No image URL returned");
      const { data } = await axios.patch(`${API_URL}/me`, { profileImage: url });
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return data;
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          error.response?.data?.msg ||
          error.message ||
          "Upload failed",
        isLoading: false,
      });
      throw error;
    }
  },

  /** Upload injury image to Cloudinary, then save URL on the logged-in user */
  uploadInjuryImage: async (file) => {
    set({ isLoading: true, error: null });
    const formData = new FormData();
    formData.append("file", file);
    try {
      const uploadRes = await axios.post(`${UPLOAD_API}/file`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = uploadRes.data?.url;
      if (!url) throw new Error("No image URL returned");
      const { data } = await axios.patch(`${API_URL}/me`, { injuryImage: url });
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return data;
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          error.response?.data?.msg ||
          error.message ||
          "Upload failed",
        isLoading: false,
      });
      throw error;
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