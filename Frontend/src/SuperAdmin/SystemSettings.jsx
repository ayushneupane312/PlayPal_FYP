import React, { useEffect, useState } from 'react';
import {
  Settings,
  Globe,
  Save,
  Mail,
  Coins,
  Clock,
  Wrench,
  RotateCcw,
} from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import SearchAndNotificationBar from '../components/SearchAndNotificationBar';
import Dropdown from '../components/DropDown';
import { showToast } from '../FutsalOwner/components/Toast';

const STORAGE_KEY = 'playpal_admin_system_settings';

const CURRENCY_OPTIONS = [
  { value: 'NPR', label: 'NPR (₨)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
];

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kathmandu', label: 'Asia/Kathmandu (NPT)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
];

const DEFAULT_SETTINGS = {
  platformName: 'PlayPal',
  supportEmail: 'support@playpal.com',
  currency: 'NPR',
  timezone: 'Asia/Kathmandu',
  maintenanceMode: false,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      platformName: parsed.platformName ?? DEFAULT_SETTINGS.platformName,
      supportEmail: parsed.supportEmail ?? DEFAULT_SETTINGS.supportEmail,
      currency: parsed.currency ?? DEFAULT_SETTINGS.currency,
      timezone: parsed.timezone ?? DEFAULT_SETTINGS.timezone,
      maintenanceMode: parsed.maintenanceMode ?? DEFAULT_SETTINGS.maintenanceMode,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

const SystemSettings = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_savedAt`);
    if (saved) setLastSaved(saved);
  }, []);

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setSettings({ ...DEFAULT_SETTINGS });
    showToast.success('Settings reset to defaults (not saved yet)');
  };

  const handleSave = async () => {
    const email = settings.supportEmail?.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast.error('Please enter a valid support email');
      return;
    }
    if (!settings.platformName?.trim()) {
      showToast.error('Platform name is required');
      return;
    }

    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      const now = new Date().toLocaleString();
      localStorage.setItem(`${STORAGE_KEY}_savedAt`, now);
      setLastSaved(now);
      showToast.success('System settings saved successfully');
    } catch {
      showToast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`flex-1 ${collapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        <div className="bg-white border-b border-slate-200 px-8 py-4">
          <SearchAndNotificationBar
            searchPlaceholder="Search anything..."
            showSearch
            showTime
          />
        </div>

        <div className="p-8 max-w-5xl">
          <div className="mb-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-emerald-600 uppercase tracking-wide mb-1">
                  Admin Panel
                </p>
                <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
                <p className="text-slate-500 mt-1">
                  Configure platform rules and regional defaults
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                    settings.maintenanceMode
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      settings.maintenanceMode ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                  {settings.maintenanceMode ? 'Maintenance on' : 'Platform live'}
                </span>
                {lastSaved && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-slate-100 text-slate-600">
                    <Clock className="w-3.5 h-3.5" />
                    Saved {lastSaved}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Platform Configuration</h2>
                  <p className="text-sm text-slate-500">Branding and regional defaults for the platform</p>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Settings className="w-4 h-4 text-slate-400" />
                    Platform Name
                  </label>
                  <input
                    type="text"
                    value={settings.platformName}
                    onChange={(e) => update('platformName', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="PlayPal"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => update('supportEmail', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="support@playpal.com"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Coins className="w-4 h-4 text-slate-400" />
                    Default Currency
                  </label>
                  <Dropdown
                    value={settings.currency}
                    onChange={(v) => update('currency', v)}
                    options={CURRENCY_OPTIONS}
                    placeholder="Select currency"
                    size="medium"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Default Timezone
                  </label>
                  <Dropdown
                    value={settings.timezone}
                    onChange={(v) => update('timezone', v)}
                    options={TIMEZONE_OPTIONS}
                    placeholder="Select timezone"
                    size="medium"
                  />
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/80 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <Wrench className="w-6 h-6 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-amber-950">Maintenance Mode</h3>
                    <p className="text-sm text-amber-800/90 mt-1 max-w-md">
                      When enabled, restrict player and owner access during platform updates. Admins
                      can still use this panel.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.maintenanceMode}
                  onClick={() => update('maintenanceMode', !settings.maintenanceMode)}
                  className={`relative shrink-0 w-14 h-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                    settings.maintenanceMode ? 'bg-amber-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      settings.maintenanceMode ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>
            </section>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to defaults
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-all font-medium shadow-lg shadow-emerald-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
