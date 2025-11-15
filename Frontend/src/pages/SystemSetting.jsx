import React, { useState } from 'react';
import { Search, MessageSquare, Bell, User, LogOut, BarChart3, MapPin, Calendar, Users, CreditCard, Trophy, Settings, Sliders, Shield, Lock, Globe, Database, HelpCircle } from 'lucide-react';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [require2FA, setRequire2FA] = useState(false);

  const tabs = [
    { id: 'General', icon: Sliders, label: 'General' },
    { id: 'Security', icon: Shield, label: 'Security' },
    { id: 'Notifications', icon: Bell, label: 'Notifications' },
    { id: 'Payments', icon: CreditCard, label: 'Payments' },
    { id: 'Localization', icon: Globe, label: 'Localization' },
    { id: 'Integrations', icon: Database, label: 'Integrations' },
    { id: 'Data & Export', icon: Database, label: 'Data & Export' },
    { id: 'Support', icon: HelpCircle, label: 'Support' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white">
        <div className="p-4">
          <div className="w-10 h-10 bg-teal-500 rounded-lg"></div>
        </div>

        <nav className="space-y-1 px-3">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 rounded-lg text-sm">
            <BarChart3 className="w-4 h-4" />
            <span className="font-medium">Dashboard Overview</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 rounded-lg text-sm">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">Manage Futsal Centers</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 rounded-lg text-sm">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">Bookings Management</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 rounded-lg text-sm">
            <Users className="w-4 h-4" />
            <span className="font-medium">User Management</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 rounded-lg text-sm">
            <CreditCard className="w-4 h-4" />
            <span className="font-medium">Payments & Revenue</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 rounded-lg text-sm">
            <Trophy className="w-4 h-4" />
            <span className="font-medium">Tournaments & Events</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 rounded-lg text-sm">
            <Bell className="w-4 h-4" />
            <span className="font-medium">Notifications</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-teal-600 rounded-lg text-sm">
            <Settings className="w-4 h-4" />
            <span className="font-medium">System Settings</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-sm font-semibold">ID</span>
              </div>
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search settings, users, centers..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        {/* Breadcrumb and Title */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>Administration</span>
            <span>›</span>
            <span className="text-gray-900 font-medium">System Settings</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">System Settings</h1>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                Reset Unsaved
              </button>
              <button className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm font-medium">
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                        activeTab === tab.id
                          ? 'bg-teal-50 text-teal-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* General Settings */}
              {activeTab === 'General' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">General</h2>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Core</span>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Organization name</label>
                        <input
                          type="text"
                          defaultValue="PlayPal"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Support email</label>
                        <input
                          type="email"
                          defaultValue="support@playpal.app"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Default landing</label>
                        <input
                          type="text"
                          defaultValue="Dashboard Overview"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Maintenance mode</label>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setMaintenanceMode(!maintenanceMode)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              maintenanceMode ? 'bg-teal-500' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span className="text-xs text-gray-600">
                            Temporarily disable bookings when enabled
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Booking window</label>
                        <input
                          type="text"
                          defaultValue="30 days ahead"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Cancellation cutoff</label>
                        <input
                          type="text"
                          defaultValue="6 hours before slot"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'Security' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Access</span>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">2FA requirement</label>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setRequire2FA(!require2FA)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              require2FA ? 'bg-teal-500' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                require2FA ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span className="text-xs text-gray-600">
                            Require 2FA for admins and owners
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Session timeout</label>
                        <input
                          type="text"
                          defaultValue="30 minutes"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Allowed IPs (CIDR)</label>
                        <input
                          type="text"
                          placeholder="Add IP ranges"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Password policy</label>
                        <input
                          type="text"
                          defaultValue="Strong • 12+ chars • Symbols"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">Security posture</span>
                        <span className="text-xs text-teal-700 bg-teal-100 px-2 py-1 rounded font-medium">
                          Good
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">No critical issues detected</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'Notifications' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Channels</span>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">System email sender</label>
                        <input
                          type="email"
                          defaultValue="noreply@playpal.app"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">SMS provider</label>
                        <input
                          type="text"
                          defaultValue="Linked: Twilio"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other tabs would follow similar patterns */}
              {!['General', 'Security', 'Notifications'].includes(activeTab) && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">{activeTab}</h2>
                  </div>
                  <div className="text-center py-12 text-gray-500">
                    Settings for {activeTab} coming soon...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;