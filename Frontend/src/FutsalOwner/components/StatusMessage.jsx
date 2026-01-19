import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function StatusMessage({ type, message }) {
  if (!message) return null;

  const isSuccess = type === 'success';
  
  return (
    <div className={`mb-6 ${isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4 flex items-center gap-3`}>
      {isSuccess ? (
        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
      )}
      <p className={`${isSuccess ? 'text-green-800' : 'text-red-800'} font-medium`}>
        {message}
      </p>
    </div>
  );
}