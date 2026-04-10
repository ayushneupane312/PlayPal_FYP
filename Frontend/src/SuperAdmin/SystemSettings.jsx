import React, { useEffect, useState } from 'react';
import { Settings, Shield, Globe, Save } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import SearchAndNotificationBar from '../components/SearchAndNotificationBar';
import Dropdown from '../components/DropDown';

const CURRENCY_OPTIONS = [
  { value: 'NPR (₨)', label: 'NPR (₨)' },
  { value: 'USD ($)', label: 'USD ($)' },
  { value: 'EUR (€)', label: 'EUR (€)' },
  { value: 'GBP (£)', label: 'GBP (£)' },
];

const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC' },
  { value: 'EST', label: 'EST' },
  { value: 'PST', label: 'PST' },
  { value: 'GMT', label: 'GMT' },
  { value: 'Asia/Kathmandu', label: 'Asia/Kathmandu' },
];

const SettingsPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [platformName, setPlatformName] = useState('PlayPal');
  const [supportEmail, setSupportEmail] = useState('support@playpal.com');
  const [currency, setCurrency] = useState('NPR (₨)');
  const [timezone, setTimezone] = useState('UTC');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const settingsTabs = [
    { id: 'general', icon: Settings, label: 'General' },
    { id: 'security', icon: Shield, label: 'Security' },
  ];

  useEffect(() => {
    const allowedTabs = settingsTabs.map((t) => t.id);
    if (!allowedTabs.includes(activeTab)) setActiveTab('general');
  }, [activeTab]);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={`flex-1 ${collapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        {/* Search, live notifications & time */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <SearchAndNotificationBar
            searchPlaceholder="Search anything..."
            showSearch
            showTime
          />
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
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          activeTab === tab.id
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600'
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
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                        <Globe className="text-emerald-600" size={20} />
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
                          className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Support Email</label>
                        <input
                          type="email"
                          value={supportEmail}
                          onChange={(e) => setSupportEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Default Currency</label>
                        <Dropdown
                          variant="dark"
                          value={currency}
                          onChange={setCurrency}
                          options={CURRENCY_OPTIONS}
                          placeholder="Select currency"
                          size="medium"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Default Timezone</label>
                        <Dropdown
                          variant="dark"
                          value={timezone}
                          onChange={setTimezone}
                          options={TIMEZONE_OPTIONS}
                          placeholder="Select timezone"
                          size="medium"
                        />
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
                        <button className="relative w-14 h-8 rounded-full bg-emerald-500">
                          <div className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <h4 className="font-medium text-gray-900">Email Notifications</h4>
                          <p className="text-gray-500 text-sm">Send email alerts for critical events</p>
                        </div>
                        <button className="relative w-14 h-8 rounded-full bg-emerald-500">
                          <div className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <h4 className="font-medium text-gray-900">Auto Backup</h4>
                          <p className="text-gray-500 text-sm">Automatically backup database daily</p>
                        </div>
                        <button className="relative w-14 h-8 rounded-full bg-emerald-500">
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

              {/* Save Button */}
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  className="bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-2 font-medium shadow-lg shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  <Save size={20} className="shrink-0" />
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