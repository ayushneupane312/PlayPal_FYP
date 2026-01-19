import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/futsal-owners"
    : "/futsal-owners";

axios.defaults.withCredentials = true;

export const useFutsalOwnerStore = create((set) => ({
  futsalOwners: [],
  currentFutsalOwner: null,
  isLoading: false,
  error: null,
  success: false,
  message: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
  },

  // Register Futsal Owner
  registerFutsalOwner: async (formData) => {
    set({ isLoading: true, error: null, success: false });
    try {
      const response = await axios.post(`${API_URL}/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      set((state) => ({
        futsalOwners: [response.data.data, ...state.futsalOwners],
        isLoading: false,
        success: true,
        message: response.data.message,
      }));
      
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error registering futsal owner",
        isLoading: false,
        success: false,
      });
      throw error;
    }
  },

  // Get All Futsal Owners
  getAllFutsalOwners: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { status, page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams({ page, limit });
      if (status) queryParams.append("status", status);

      const response = await axios.get(`${API_URL}?${queryParams.toString()}`);
      
      set({
        futsalOwners: response.data.data,
        pagination: response.data.pagination,
        isLoading: false,
      });
      
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error fetching futsal owners",
        isLoading: false,
      });
      throw error;
    }
  },

  // Reset State
  resetState: () => {
    set({
      error: null,
      success: false,
      message: null,
    });
  },

  // Clear Error
  clearError: () => {
    set({ error: null });
  },
}));