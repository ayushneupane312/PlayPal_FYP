import React from 'react';
import SearchAndNotificationBar from './SearchAndNotificationBar';

const PageHeader = ({
  title,
  subtitle,
  showNotification = true,
  showTime = true,
  showSearch = true,
  actions = null,
  icon = null,
}) => {
  return (
    <div className="px-8 py-4 flex items-center justify-between mb-6 flex-wrap gap-4">
      {/* Left Side - Title & Subtitle */}
      <div className="flex items-center gap-3 flex-shrink-0">
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

      {/* Right Side - Search, Notifications & Time */}
      <div className="flex items-center gap-4 flex-1 min-w-0 justify-end">
        {actions && <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>}
        {showNotification && (
          <SearchAndNotificationBar
            showSearch={showSearch}
            showTime={showTime}
            searchPlaceholder="Search anything..."
            className="flex-1 max-w-md min-w-0 justify-end"
          />
        )}
      </div>
    </div>
  );
};

export default PageHeader;