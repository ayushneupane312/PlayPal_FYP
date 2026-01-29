import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.MODE === 'development'
    ? 'http://localhost:5000/futsal-owners'
    : '/futsal-owners';

axios.defaults.withCredentials = true;

export const useFutsalOwnerStore = create((set, get) => ({
    futsalOwners: [],
    counts: {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
    },
    pagination: {
        page: 1,
        pages: 1,
        total: 0,
        limit: 10
    },
    isLoading: false,
    error: null,
    success: false,
    currentFilter: 'all',
    searchTerm: '',

    // Register Futsal Owner
    registerFutsalOwner: async (formData) => {
        set({ isLoading: true, error: null, success: false });
        try {
            const response = await axios.post(`${API_URL}/register`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            set({ isLoading: false, success: true });
            return response.data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to submit form',
                isLoading: false,
                success: false
            });
            throw error;
        }
    },

    // Get my application status
    getMyApplication: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/my-application`);
            set({ isLoading: false });
            return response.data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch status',
                isLoading: false
            });
            throw error;
        }
    },

    // Admin: Get All Futsal Owners
    getAllFutsalOwners: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/`, { params });
            set({
                futsalOwners: response.data.data,
                counts: response.data.counts,
                pagination: response.data.pagination,
                currentFilter: params.status || 'all',
                isLoading: false
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch futsal owners',
                isLoading: false
            });
        }
    },

    // Admin: Update Status
    updateFutsalOwnerStatus: async (id, status, adminNotes = '') => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.patch(
                `${API_URL}/${id}/status`,
                { status, adminNotes }
            );
            set({ isLoading: false });
            return response.data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to update status',
                isLoading: false
            });
            throw error;
        }
    },

    // Set Filter
    setFilter: async (status) => {
        const { pagination } = get();
        await get().getAllFutsalOwners({
            status,
            page: 1,
            limit: pagination.limit
        });
    },

    // Set Page
    setPage: (page) => {
        const { currentFilter, pagination } = get();
        get().getAllFutsalOwners({
            status: currentFilter === 'all' ? undefined : currentFilter,
            page,
            limit: pagination.limit
        });
    },

    // Search
    searchFutsalOwners: async (searchTerm) => {
        set({ searchTerm });
        const { currentFilter, pagination } = get();
        await get().getAllFutsalOwners({
            status: currentFilter === 'all' ? undefined : currentFilter,
            search: searchTerm,
            page: 1,
            limit: pagination.limit
        });
    },

    // Refresh Data
    refreshData: () => {
        const { currentFilter, pagination, searchTerm } = get();
        get().getAllFutsalOwners({
            status: currentFilter === 'all' ? undefined : currentFilter,
            search: searchTerm,
            page: pagination.page,
            limit: pagination.limit
        });
    },

    // Reset State
    resetState: () => {
        set({ error: null, success: false });
    }
}));