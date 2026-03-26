import React, { useEffect, useState } from 'react';
import { Search, Bell, Settings, Shield, BellRing, Globe, Save } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

const SettingsPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [platformName, setPlatformName] = useState('PlayPal');
  const [supportEmail, setSupportEmail] = useState('support@playpal.com');
  const [currency, setCurrency] = useState('USD ($)');
  const [timezone, setTimezone] = useState('UTC');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const settingsTabs = [
    { id: 'general', icon: Settings, label: 'General' },
    { id: 'security', icon: Shield, label: 'Security' },
    { id: 'notifications', icon: BellRing, label: 'Notifications' }
  ];

  useEffect(() => {
    const allowedTabs = settingsTabs.map((t) => t.id);
    if (!allowedTabs.includes(activeTab)) setActiveTab('general');
  }, [activeTab]);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={`flex-1 ${collapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <Search className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search anything..."
              className="flex-1 outline-none text-gray-700"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell className="text-gray-600" size={20} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">5</span>
            </button>
            <span className="text-gray-600 text-sm">05:08 AM</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
            <p className="text-gray-500">Configure platform rules and features</p>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Settings Sidebar */}
            <div className="col-span-12 lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="space-y-2">
                  {settingsTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          activeTab === tab.id
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                            : 'text-gray-700 hover:bg-emerald-50'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Settings Content */}
            <div className="col-span-12 lg:col-span-9">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  {/* Platform Configuration */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                        <Globe className="text-cyan-500" size={20} />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Platform Configuration</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Platform Name</label>
                        <input
                          type="text"
                          value={platformName}
                          onChange={(e) => setPlatformName(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Support Email</label>
                        <input
                          type="email"
                          value={supportEmail}
                          onChange={(e) => setSupportEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Default Currency</label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                        >
                          <option>USD ($)</option>
                          <option>EUR (€)</option>
                          <option>GBP (£)</option>
                          <option>NPR (₨)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Default Timezone</label>
                        <select
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                        >
                          <option>UTC</option>
                          <option>EST</option>
                          <option>PST</option>
                          <option>GMT</option>
                          <option>Asia/Kathmandu</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Maintenance Mode */}
                  <div className="bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border-2 border-yellow-500/20 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                          <Settings className="text-yellow-600" size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-yellow-900 mb-1">Maintenance Mode</h3>
                          <p className="text-yellow-700 text-sm">Enable maintenance mode to restrict access during updates</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setMaintenanceMode(!maintenanceMode)}
                        className={`relative w-14 h-8 rounded-full transition-colors ${
                          maintenanceMode ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                            maintenanceMode ? 'translate-x-6' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Additional Settings */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Settings</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                          <p className="text-gray-500 text-sm">Require 2FA for all admin accounts</p>
                        </div>
                        <button className="relative w-14 h-8 rounded-full bg-cyan-500">
                          <div className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <h4 className="font-medium text-gray-900">Email Notifications</h4>
                          <p className="text-gray-500 text-sm">Send email alerts for critical events</p>
                        </div>
                        <button className="relative w-14 h-8 rounded-full bg-cyan-500">
                          <div className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <h4 className="font-medium text-gray-900">Auto Backup</h4>
                          <p className="text-gray-500 text-sm">Automatically backup database daily</p>
                        </div>
                        <button className="relative w-14 h-8 rounded-full bg-cyan-500">
                          <div className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between py-3">
                        <div>
                          <h4 className="font-medium text-gray-900">API Rate Limiting</h4>
                          <p className="text-gray-500 text-sm">Limit API requests per user</p>
                        </div>
                        <button className="relative w-14 h-8 rounded-full bg-gray-300">
                          <div className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <Shield className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Security Settings</h3>
                  <p className="text-gray-500">Configure security and authentication settings</p>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                      <Bell className="text-cyan-500" size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
                  </div>

                  <div className="space-y-4">
                    {/* Fraud Alerts */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Fraud Alerts</h3>
                        <p className="text-gray-500 text-sm">High-priority fraud detection notifications</p>
                      </div>
                      <button className="relative w-14 h-8 rounded-full bg-green-500">
                        <div className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full shadow-md" />
                      </button>
                    </div>

                    {/* New Disputes */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">New Disputes</h3>
                        <p className="text-gray-500 text-sm">Notify when new disputes are filed</p>
                      </div>
                      <button className="relative w-14 h-8 rounded-full bg-green-500">
                        <div className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full shadow-md" />
                      </button>
                    </div>

                    {/* User Reports */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">User Reports</h3>
                        <p className="text-gray-500 text-sm">Notifications for user behavior reports</p>
                      </div>
                      <button className="relative w-14 h-8 rounded-full bg-green-500">
                        <div className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full shadow-md" />
                      </button>
                    </div>

                    {/* System Alerts */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">System Alerts</h3>
                        <p className="text-gray-500 text-sm">Critical system and performance alerts</p>
                      </div>
                      <button className="relative w-14 h-8 rounded-full bg-green-500">
                        <div className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full shadow-md" />
                      </button>
                    </div>

                    {/* Weekly Reports */}
                    <div className="flex items-center justify-between py-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Weekly Reports</h3>
                        <p className="text-gray-500 text-sm">Weekly summary email</p>
                      </div>
                      <button className="relative w-14 h-8 rounded-full bg-gray-300">
                        <div className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end mt-6">
                <button className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-emerald-500/30">
                  <Save size={20} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;