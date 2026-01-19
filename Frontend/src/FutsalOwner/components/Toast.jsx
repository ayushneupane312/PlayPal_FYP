import toast from 'react-hot-toast';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Reusable toast notification functions
export const showToast = {
  success: (message, options = {}) => {
    toast.success(message, {
      duration: options.duration || 4000,
      position: options.position || 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
        padding: '16px 24px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      icon: '✅',
      ...options,
    });
  },

  error: (message, options = {}) => {
    toast.error(message, {
      duration: options.duration || 4000,
      position: options.position || 'top-right',
      style: {
        background: '#EF4444',
        color: '#fff',
        padding: '16px 24px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      icon: '❌',
      ...options,
    });
  },

  info: (message, options = {}) => {
    toast(message, {
      duration: options.duration || 4000,
      position: options.position || 'top-right',
      style: {
        background: '#3B82F6',
        color: '#fff',
        padding: '16px 24px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      icon: 'ℹ️',
      ...options,
    });
  },

  warning: (message, options = {}) => {
    toast(message, {
      duration: options.duration || 4000,
      position: options.position || 'top-right',
      style: {
        background: '#F59E0B',
        color: '#fff',
        padding: '16px 24px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      icon: '⚠️',
      ...options,
    });
  },

  // Custom toast with icon
  custom: (message, icon, options = {}) => {
    toast(message, {
      duration: options.duration || 4000,
      position: options.position || 'top-right',
      icon: icon,
      style: {
        background: options.background || '#6366F1',
        color: options.color || '#fff',
        padding: '16px 24px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        ...options.style,
      },
      ...options,
    });
  },

  // Promise-based toast (for async operations)
  promise: (promise, messages, options = {}) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Error occurred',
      },
      {
        position: options.position || 'top-right',
        style: {
          padding: '16px 24px',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: '500',
        },
        ...options,
      }
    );
  },
};

// Toast component wrapper (for Toaster provider)
export { Toaster } from 'react-hot-toast';