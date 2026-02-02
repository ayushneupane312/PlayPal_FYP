import { useState } from 'react';

export const useConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: 'Confirm Action',
    message: 'Are you sure?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger',
    onConfirm: () => {},
  });
  const [isLoading, setIsLoading] = useState(false);

  const showConfirmation = (options) => {
    setConfig({
      title: options.title || 'Confirm Action',
      message: options.message || 'Are you sure you want to proceed?',
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      type: options.type || 'danger',
      onConfirm: options.onConfirm || (() => {}),
    });
    setIsOpen(true);
  };

  const hideConfirmation = () => {
    setIsOpen(false);
    setIsLoading(false);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await config.onConfirm();
      hideConfirmation();
    } catch (error) {
      console.error('Confirmation action failed:', error);
      setIsLoading(false);
    }
  };

  return {
    isOpen,
    isLoading,
    config,
    showConfirmation,
    hideConfirmation,
    handleConfirm,
  };
};