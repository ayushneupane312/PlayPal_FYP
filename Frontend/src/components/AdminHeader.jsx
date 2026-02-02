import React from 'react';
import { Bell } from 'lucide-react';

const PageHeader = ({ 
  title, 
  subtitle, 
  showNotification = true,
  notificationCount = 0,
  showTime = true,
  actions = null, // Custom buttons/actions
  icon = null, // Optional icon next to title
}) => {
  return (
    <div className="px-8 py-4 flex items-center justify-between mb-6">
      {/* Left Side - Title & Subtitle */}
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-white">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{title}</h1>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
      </div>

      {/* Right Side - Notifications & Time & Custom Actions */}
      <div className="flex items-center gap-4">
        {/* Custom Actions (like buttons) */}
        {actions && <div className="flex items-center gap-3">{actions}</div>}

        {/* Notification Bell */}
        {showNotification && (
          <button className="relative hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <Bell className="text-gray-600" size={20} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center px-1.5 font-medium">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>
        )}

        {/* Current Time */}
        {showTime && (
          <span className="text-gray-600 text-sm font-medium">
            {new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        )}
      </div>
    </div>
  );
};

export default PageHeader;