import toast from 'react-hot-toast';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

/** Default id so the same message replaces an existing toast instead of stacking (e.g. React Strict Mode double effects). */
function defaultToastId(kind, message) {
  const s = String(message);
  const key = s.length > 160 ? `${s.slice(0, 160)}…` : s;
  return `${kind}:${key}`;
}

// Reusable toast notification functions
export const showToast = {
  success: (message, options = {}) => {
    const { id, ...rest } = options;
    toast.success(message, {
      duration: rest.duration || 4000,
      position: rest.position || 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
        padding: '16px 24px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      icon: '',
      ...rest,
      id: id ?? defaultToastId('success', message),
    });
  },

  error: (message, options = {}) => {
    const { id, ...rest } = options;
    toast.error(message, {
      duration: rest.duration || 4000,
      position: rest.position || 'top-right',
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
      ...rest,
      id: id ?? defaultToastId('error', message),
    });
  },

  info: (message, options = {}) => {
    const { id, ...rest } = options;
    toast(message, {
      duration: rest.duration || 4000,
      position: rest.position || 'top-right',
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
      ...rest,
      id: id ?? defaultToastId('info', message),
    });
  },

  warning: (message, options = {}) => {
    const { id, ...rest } = options;
    toast(message, {
      duration: rest.duration || 4000,
      position: rest.position || 'top-right',
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
      ...rest,
      id: id ?? defaultToastId('warning', message),
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