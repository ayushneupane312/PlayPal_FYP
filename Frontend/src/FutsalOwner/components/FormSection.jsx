import React from 'react';

export default function FormSection({ 
  icon: Icon, 
  title, 
  description, 
  children,
  iconBgColor = "bg-green-100",
  iconColor = "text-green-600"
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          {Icon && <Icon className={`w-6 h-6 ${iconColor}`} />}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}