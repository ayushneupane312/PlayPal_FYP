import React, { useState } from 'react';
import { Bell, Calendar, Users, CreditCard, Trophy, Settings, Home, Grid, Search, Mail, User, DollarSign } from 'lucide-react';

export default function NotificationsCenter() {
  const [activeNav, setActiveNav] = useState('notifications');

  const notifications = [
    {
      title: 'Maintenance tonight 10 PM',
      description: 'Short outage for upgrades',
      status: 'Delivered',
      statusColor: 'bg-emerald-500',
      audience: 'All players',
      channel: 'In-app',
      time: 'Today 09:00',
      actions: ['View', 'Duplicate']
    },
    {
      title: 'Weekend tournament reminder',
      description: 'Players active 30d',
      status: 'Scheduled',
      statusColor: 'bg-yellow-500',
      audience: 'Players',
      channel: 'In-app',
      time: 'Fri 18:00',
      actions: ['Send now', 'Cancel']
    },
    {
      title: 'Owner verification tips',
      description: 'Guidelines for smooth KYC',
      status: 'Draft',
      statusColor: 'bg-gray-300',
      audience: 'Futsal owners',
      channel: 'In-app',
      time: '—',
      actions: ['Edit', 'Delete']
    },
    {
      title: 'Promo: Midweek 20% off',
      description: 'Discount for midweek bookings',
      status: 'Delivered',
      statusColor: 'bg-emerald-500',
      audience: 'Players',
      channel: 'In-app',
      time: 'Yesterday 16:20',
      actions: ['View', 'Duplicate']
    },
    {
      title: 'System update rollout',
      description: 'Performance improvements',
      status: 'Queued',
      statusColor: 'bg-yellow-500',
      audience: 'All users',
      channel: 'In-app',
      time: 'Today 14:30',
      actions: ['Prioritize', 'Cancel']
    }
  ];

  const templates = [
    {
      title: 'Promo: Midweek 20% off',
      subtitle: 'Players • In-app',
      lastUsed: 'Last used: Yesterday'
    },
    {
      title: 'Owner: Settlement reminder',
      subtitle: 'Owners • In-app',
      lastUsed: 'Last used: 7 days ago'
    },
    {
      title: 'Tournament: Final call',
      subtitle: 'Players • In-app',
      lastUsed: 'Last used: 12 days ago'
    }
  ];

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard Overview' },
    { id: 'centers', icon: Grid, label: 'Manage Futsal Centers' },
    { id: 'bookings', icon: Calendar, label: 'Bookings Management' },
    { id: 'users', icon: Users, label: 'User Management' },
    { id: 'payments', icon: CreditCard, label: 'Payments & Revenue' },
    { id: 'tournaments', icon: Trophy, label: 'Tournaments & Events' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'settings', icon: Settings, label: 'System Settings' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-48 bg-gray-900 text-white flex flex-col">
        <div className="p-4">
          <div className="w-8 h-8 bg-emerald-500 rounded"></div>
        </div>
        
        <nav className="flex-1 px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
                activeNav === item.id
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
              <span className="text-xs font-medium">ID</span>
            </div>
            <div className="relative flex-1 max-w-xl">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications, recipients..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Welcome, Admin!</span>
            <button className="p-2 hover:bg-gray-100 rounded">
              <Mail size={18} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <Bell size={18} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <DollarSign size={18} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <User size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {/* Notifications Center Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-semibold text-gray-900">Notifications Center</h1>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Calendar size={16} />
                  Last 30 days
                </button>
                <button className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  All segments
                </button>
                <button className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Bell size={16} />
                  All statuses
                </button>
                <button className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <span>↓</span>
                  Export
                </button>
              </div>
            </div>

            {/* Notifications Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-emerald-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Title</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Audience</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Channel</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Sent/Scheduled</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700"></th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notif, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{notif.title}</div>
                        <div className="text-xs text-gray-500">{notif.description}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium text-white ${notif.statusColor}`}>
                          {notif.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{notif.audience}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{notif.channel}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{notif.time}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {notif.actions.map((action, i) => (
                            <button
                              key={i}
                              className={`px-3 py-1.5 text-xs rounded ${
                                i === 0
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="px-4 py-3 bg-gray-50 flex items-center justify-between border-t border-gray-200">
                <button className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded">
                  ← Prev
                </button>
                <div className="flex items-center gap-1">
                  <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded">
                    Page 1 of 8
                  </button>
                </div>
                <button className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded">
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* Saved Templates */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Saved Templates</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  In-app
                </button>
                <button className="px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                  New Template
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {templates.map((template, idx) => (
                <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{template.title}</h3>
                    <p className="text-xs text-gray-500">{template.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded">Template</span>
                    <span className="text-xs text-gray-500">{template.lastUsed}</span>
                    <div className="flex gap-2">
                      <button className="px-4 py-1.5 text-sm bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100">
                        Use
                      </button>
                      <button className="px-4 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}