import React, { useState } from 'react';
import { Search, Users, Calendar, MapPin, DollarSign, TrendingUp, AlertCircle, Clock, Phone, Mail, Eye, Check, Edit, Sliders, Trash2, Trophy, Settings, Bell, CreditCard, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
  const [activeNav, setActiveNav] = useState('dashboard');
  const navigate = useNavigate ();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-48 bg-gray-900 text-white">
        <div className="p-4">
          <div className="w-10 h-10 bg-teal-500 rounded-lg mb-8"></div>
        </div>

        <nav className="space-y-1 px-2">
          <button
            onClick={() => setActiveNav('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${
              activeNav === 'dashboard' ? 'bg-teal-600' : 'hover:bg-gray-800'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Dashboard</div>
              <div className="text-xs text-gray-400">Overview</div>
            </div>
          </button>

          <button
            onClick={() => setActiveNav('centers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${
              activeNav === 'centers' ? 'bg-teal-600' : 'hover:bg-gray-800'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Manage</div>
              <div className="text-xs text-gray-400">Futsal Centers</div>
            </div>
          </button>

          <button
            onClick={() => setActiveNav('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${
              activeNav === 'bookings' ? 'bg-teal-600' : 'hover:bg-gray-800'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Bookings</div>
              <div className="text-xs text-gray-400">Management</div>
            </div>
          </button>

          <button
            onClick={() => {setActiveNav('users');
              navigate('/usermanagement');

            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${
              activeNav === 'users' ? 'bg-teal-600' : 'hover:bg-gray-800'
            }`}
          >
            <Users className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">User</div>
              <div className="text-xs text-gray-400">Management</div>
            </div>
          </button>

          <button
            onClick={() => setActiveNav('payments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${
              activeNav === 'payments' ? 'bg-teal-600' : 'hover:bg-gray-800'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Payments &</div>
              <div className="text-xs text-gray-400">Revenue</div>
            </div>
          </button>

          <button
            onClick={() => setActiveNav('tournaments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${
              activeNav === 'tournaments' ? 'bg-teal-600' : 'hover:bg-gray-800'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Tournaments</div>
              <div className="text-xs text-gray-400">& Events</div>
            </div>
          </button>

          <button
            onClick={() => setActiveNav('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${
              activeNav === 'notifications' ? 'bg-teal-600' : 'hover:bg-gray-800'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="font-medium">Notifications</span>
          </button>

          <button
            onClick={() => setActiveNav('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${
              activeNav === 'settings' ? 'bg-teal-600' : 'hover:bg-gray-800'
            }`}
          >
            <Settings className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">System</div>
              <div className="text-xs text-gray-400">Settings</div>
            </div>
          </button>
        </nav>
      </aside>
    </div>
)
}

export default AdminSidebar;