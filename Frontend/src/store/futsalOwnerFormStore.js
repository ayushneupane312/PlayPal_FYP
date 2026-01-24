import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/futsal-owners"
    : "/futsal-owners";

axios.defaults.withCredentials = true;

export const useFutsalOwnerStore = create((set, get) => ({
  // ==================== STATE ====================
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
    limit: 10,
  },
  
  counts: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  },
  
  searchTerm: '',
  currentFilter: 'all',
  stats: null,

  // ==================== REGISTER FUTSAL OWNER ====================
  registerFutsalOwner: async (formData) => {
    set({ isLoading: true, error: null, success: false, message: null });
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
        error: null,
      }));
      
      console.log('✅ Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Registration error:', error);
      const errorMessage = error.response?.data?.message || "Error registering futsal owner";
      set({
        error: errorMessage,
        isLoading: false,
        success: false,
        message: null,
      });
      throw error;
    }
  },

  // ==================== GET ALL FUTSAL OWNERS ====================
  getAllFutsalOwners: async (params = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      const state = get();
      
      const status = params.status !== undefined ? params.status : state.currentFilter;
      const page = params.page !== undefined ? params.page : state.pagination.page;
      const limit = params.limit !== undefined ? params.limit : state.pagination.limit;
      const search = params.search !== undefined ? params.search : state.searchTerm;
      
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      if (status && status !== 'all') {
        queryParams.append('status', status);
      }
      
      if (search && search.trim() !== '') {
        queryParams.append('search', search.trim());
      }

      console.log('📡 Fetching with params:', { status, page, limit, search });
      
      const response = await axios.get(`${API_URL}?${queryParams.toString()}`);
      
      set({
        futsalOwners: response.data.data || [],
        pagination: {
          total: response.data.pagination?.total || 0,
          page: response.data.pagination?.page || 1,
          pages: response.data.pagination?.pages || 1,
          limit: response.data.pagination?.limit || 10,
        },
        counts: response.data.counts || {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        },
        currentFilter: status,
        searchTerm: search,
        isLoading: false,
        error: null,
      });
      
      console.log('✅ Fetched:', response.data.data.length, 'futsal owners');
      return response.data;
    } catch (error) {
      console.error('❌ Fetch error:', error);
      const errorMessage = error.response?.data?.message || "Error fetching futsal owners";
      set({
        error: errorMessage,
        isLoading: false,
        futsalOwners: [],
      });
      throw error;
    }
  },

  // ==================== GET SINGLE FUTSAL OWNER BY ID ====================
  // ✅ THIS IS THE MISSING FUNCTION!
  getFutsalOwnerById: async (id) => {
    set({ isLoading: true, error: null, currentFutsalOwner: null });
    
    try {
      console.log('🔍 Fetching owner with ID:', id);
      
      const response = await axios.get(`${API_URL}/${id}`);
      
      console.log('✅ Owner fetched:', response.data.data);
      
      set({
        currentFutsalOwner: response.data.data,
        isLoading: false,
        error: null,
      });
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Fetch single owner error:', error);
      const errorMessage = error.response?.data?.message || "Error fetching futsal owner details";
      set({
        error: errorMessage,
        isLoading: false,
        currentFutsalOwner: null,
      });
      throw error;
    }
  },

  // ==================== SEARCH FUTSAL OWNERS ====================
  searchFutsalOwners: async (searchTerm) => {
    const state = get();
    set({ searchTerm });
    
    return get().getAllFutsalOwners({
      search: searchTerm,
      status: state.currentFilter,
      page: 1,
      limit: state.pagination.limit,
    });
  },

  // ==================== SET FILTER ====================
  setFilter: async (status) => {
    const state = get();
    set({ currentFilter: status });
    
    return get().getAllFutsalOwners({
      status,
      search: state.searchTerm,
      page: 1,
      limit: state.pagination.limit,
    });
  },

  // ==================== SET PAGE ====================
  setPage: async (page) => {
    const state = get();
    
    return get().getAllFutsalOwners({
      status: state.currentFilter,
      search: state.searchTerm,
      page,
      limit: state.pagination.limit,
    });
  },

  // ==================== UPDATE STATUS ====================
  updateFutsalOwnerStatus: async (id, status) => {
    set({ isLoading: true, error: null, success: false });
    try {
      const response = await axios.patch(`${API_URL}/${id}/status`, { status });
      
      set((state) => ({
        futsalOwners: state.futsalOwners.map((owner) =>
          owner._id === id ? { ...owner, status, statusUpdatedAt: new Date() } : owner
        ),
        currentFutsalOwner: state.currentFutsalOwner?._id === id 
          ? { ...state.currentFutsalOwner, status, statusUpdatedAt: new Date() }
          : state.currentFutsalOwner,
        isLoading: false,
        success: true,
        message: response.data.message,
        error: null,
      }));
      
      console.log('✅ Status updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Status update error:', error);
      const errorMessage = error.response?.data?.message || "Error updating status";
      set({
        error: errorMessage,
        isLoading: false,
        success: false,
      });
      throw error;
    }
  },

  // ==================== DELETE FUTSAL OWNER ====================
  deleteFutsalOwner: async (id) => {
    set({ isLoading: true, error: null, success: false });
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      
      set((state) => ({
        futsalOwners: state.futsalOwners.filter((owner) => owner._id !== id),
        currentFutsalOwner: state.currentFutsalOwner?._id === id ? null : state.currentFutsalOwner,
        pagination: {
          ...state.pagination,
          total: state.pagination.total - 1,
        },
        isLoading: false,
        success: true,
        message: response.data.message,
        error: null,
      }));
      
      console.log('✅ Futsal owner deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Delete error:', error);
      const errorMessage = error.response?.data?.message || "Error deleting futsal owner";
      set({
        error: errorMessage,
        isLoading: false,
        success: false,
      });
      throw error;
    }
  },

  // ==================== REFRESH DATA ====================
  refreshData: async () => {
    const state = get();
    return get().getAllFutsalOwners({
      status: state.currentFilter,
      search: state.searchTerm,
      page: state.pagination.page,
      limit: state.pagination.limit,
    });
  },

  // ==================== CLEAR CURRENT OWNER ====================
  clearCurrentOwner: () => {
    set({ currentFutsalOwner: null });
  },

  resetState: () => {
    set({
      error: null,
      success: false,
      message: null,
    });
  },


}));