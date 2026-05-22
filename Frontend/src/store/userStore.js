import { create } from "zustand";
import axios from "axios";
import API_BASE from "../utils/apiBase.js";

const API_URL = `${API_BASE}/api/users`;

axios.defaults.withCredentials = true;

export const useUserStore = create((set) => ({
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  success: false,
  message: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  },

  // ==================== FETCH ALL USERS ====================
  fetchUsers: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const { page = 1, limit = 10, search = '', role = 'all' } = params;
      
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search) queryParams.append('search', search);
      if (role && role !== 'all') queryParams.append('role', role);

      const response = await axios.get(`${API_URL}?${queryParams.toString()}`);
      
      set({ 
        users: response.data.data || response.data,
        pagination: response.data.pagination || {
          total: response.data.data?.length || 0,
          page: 1,
          pages: 1,
          limit: 10
        },
        loading: false 
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Fetch users error:', error);
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false,
        users: []
      });
      throw error;
    }
  },

  // ==================== GET SINGLE USER ====================
  getUserById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      set({ 
        currentUser: response.data.data || response.data,
        loading: false 
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Get user error:', error);
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false 
      });
      throw error;
    }
  },

  // ==================== CREATE USER ====================
  createUser: async (userData) => {
    set({ loading: true, error: null, success: false });
    try {
      const response = await axios.post(`${API_URL}`, userData);
      
      set((state) => ({ 
        users: [response.data.data, ...state.users],
        loading: false,
        success: true,
        message: 'User created successfully'
      }));
      
      return response.data;
    } catch (error) {
      console.error('❌ Create user error:', error);
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false,
        success: false
      });
      throw error;
    }
  },

  // ==================== UPDATE USER ====================
  updateUser: async (id, userData) => {
    set({ loading: true, error: null, success: false });
    try {
      const response = await axios.put(`${API_URL}/${id}`, userData);
      
      set((state) => ({
        users: state.users.map((user) => 
          user._id === id ? (response.data.data || response.data) : user
        ),
        currentUser: state.currentUser?._id === id 
          ? (response.data.data || response.data)
          : state.currentUser,
        loading: false,
        success: true,
        message: 'User updated successfully'
      }));
      
      return response.data;
    } catch (error) {
      console.error('❌ Update user error:', error);
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false,
        success: false
      });
      throw error;
    }
  },

  // ==================== DELETE USER ====================
  deleteUser: async (id) => {
    set({ loading: true, error: null, success: false });
    try {
      await axios.delete(`${API_URL}/${id}`);
      
      set((state) => ({
        users: state.users.filter((user) => user._id !== id),
        loading: false,
        success: true,
        message: 'User deleted successfully'
      }));
    } catch (error) {
      console.error('❌ Delete user error:', error);
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false,
        success: false
      });
      throw error;
    }
  },

  // ==================== RESET STATE ====================
  resetState: () => {
    set({
      error: null,
      success: false,
      message: null,
    });
  },

  // ==================== CLEAR CURRENT USER ====================
  clearCurrentUser: () => {
    set({ currentUser: null });
  },
}));