import { create } from 'zustand';
import axios from 'axios';

import API_BASE from '../utils/apiBase';
const API_URL = `${API_BASE}/api/payment`;

axios.defaults.withCredentials = true;

export const useKhaltiStore = create((set, get) => ({
    // ─── State ────────────────────────────────────────────────────────────────
    pidx: null,
    paymentUrl: null,
    paymentDetails: null,   // stores verified payment response
    isLoading: false,
    error: null,
    success: false,
    paymentStatus: null,    // "Completed" | "Pending" | "User canceled" | "Failed"

    // ─── Initiate Payment ─────────────────────────────────────────────────────
    initiatePayment: async ({ amount, purchase_order_id, purchase_order_name, customer_info }) => {
        set({ isLoading: true, error: null, success: false, paymentStatus: null });
        try {
            const response = await axios.post(`${API_URL}/initiate`, {
                amount,               // in paisa — NPR 10 = 1000 paisa
                purchase_order_id,
                purchase_order_name,
                customer_info: customer_info || {},
            });

            const { pidx, payment_url, expires_at, expires_in } = response.data.data;

            set({
                pidx,
                paymentUrl: payment_url,
                isLoading: false,
            });

            // Redirect user to Khalti payment page
            window.location.href = payment_url;

            return response.data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to initiate payment',
                isLoading: false,
                success: false,
            });
            throw error;
        }
    },

    // ─── Verify Payment (Lookup) ──────────────────────────────────────────────
    verifyPayment: async (pidx) => {
        set({ isLoading: true, error: null, success: false });
        try {
            const response = await axios.post(`${API_URL}/verify`, { pidx });

            const { status, transaction_id, total_amount, fee, refunded } =
                response.data.data;

            set({
                isLoading: false,
                success: response.data.success,
                paymentStatus: status,
                paymentDetails: {
                    status,
                    transaction_id,
                    total_amount,
                    fee,
                    refunded,
                    amount_in_rupees: total_amount / 100, // paisa to rupees
                },
            });

            return response.data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to verify payment',
                isLoading: false,
                success: false,
                paymentStatus: 'Failed',
            });
            throw error;
        }
    },

    // ─── Reset State ──────────────────────────────────────────────────────────
    resetState: () => {
        set({
            pidx: null,
            paymentUrl: null,
            paymentDetails: null,
            isLoading: false,
            error: null,
            success: false,
            paymentStatus: null,
        });
    },
}));