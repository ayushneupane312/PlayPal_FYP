import React, { useState } from 'react';
import { Bell, Search, Menu, X, Trophy } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Header({ onMenuToggle, sidebarOpen }) {
  const { user } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [notifications] = useState([
    { id: 1, title: 'New booking request', desc: 'Team Alpha requested Court 1 for tomorrow at 6 PM', time: 'Just now' },
    { id: 2, title: 'Payment received', desc: 'Rs. 2,500 received for booking #1234', time: '5 min ago' },
    { id: 3, title: 'Tournament registration', desc: '5 new teams registered for Weekend Cup', time: '1 hour ago' }
  ]);

  // Get user initials
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
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuToggle} 
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                ></div>
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      <Trophy className="w-5 h-5 text-yellow-500" />
                    </div>
                  </div>
                  <div className="max-h-96 overflow-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                        >
                          <h4 className="font-medium text-gray-900 mb-1">{notif.title}</h4>
                          <p className="text-sm text-gray-600 mb-1">{notif.desc}</p>
                          <span className="text-xs text-gray-500">{notif.time}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        No new notifications
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
              {getInitials(user?.name)}
            </div>
            <div className="hidden sm:block">
              <div className="font-medium text-gray-900">{user?.name || 'User'}</div>
              <div className="text-xs text-gray-500 capitalize">{user?.role || 'Owner'}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}