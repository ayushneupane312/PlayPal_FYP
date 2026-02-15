import React from 'react';
import { Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import SearchAndNotificationBar from '../components/SearchAndNotificationBar';

export default function PlayerHeader({ onMenuToggle, sidebarOpen }) {
  const { user } = useAuthStore();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <SearchAndNotificationBar
            searchPlaceholder="Search matches, venues, players..."
            showSearch={true}
            showTime={true}
            className="flex-1 min-w-0"
          />
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 flex-shrink-0 ml-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
            {getInitials(user?.name)}
          </div>
          <div className="hidden sm:block">
            <div className="font-medium text-gray-900">{user?.name || 'Player'}</div>
            <div className="text-xs text-gray-500 capitalize">{user?.role || 'player'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}