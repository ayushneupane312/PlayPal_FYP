import React, { useEffect, useMemo, useRef, useState } from 'react';
import PlayerSidebar from './PlayerSidebar';
import {
  User,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Save,
  Download,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../FutsalOwner/components/Toast';
import { useAuthStore } from '../store/authStore';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, updateMe, uploadProfileImage, changePassword, logout, isLoading: authBusy } = useAuthStore();
  const fileInputRef = useRef(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const splitName = (full) => {
    const trimmed = (full || '').trim();
    if (!trimmed) return { firstName: '', lastName: '' };
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };
    return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
  };

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    location: '',
    preferredPosition: 'Midfielder'
  });

  useEffect(() => {
    const { firstName, lastName } = splitName(user?.name);
    setFormData((prev) => ({
      ...prev,
      firstName,
      lastName,
      email: user?.email || '',
      phoneNumber: user?.phone || '',
      location: user?.location || '',
      preferredPosition: user?.preferredPosition || prev.preferredPosition || 'Midfielder'
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    bookingReminders: true,
    paymentAlerts: true,
    teamUpdates: true,
    tournamentNews: false,
    promotionalEmails: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveChanges = () => {
    (async () => {
      try {
        const name = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();
        const payload = {
          name,
          phone: formData.phoneNumber,
          location: formData.location,
          preferredPosition: formData.preferredPosition
        };
        const res = await updateMe(payload);
        showToast.success(res?.msg || 'Profile updated');
      } catch (e) {
        showToast.error(e?.response?.data?.message || e?.message || 'Failed to update profile');
      }
    })();
  };

  const handlePhotoPick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadProfileImage(file);
      showToast.success('Profile photo updated');
    } catch (err) {
      showToast.error(err?.response?.data?.message || err?.message || 'Failed to upload photo');
    } finally {
      e.target.value = '';
    }
  };

  const passwordChecks = useMemo(() => {
    const p = passwordData.newPassword || '';
    return {
      length: p.length >= 8,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      number: /\d/.test(p),
      special: /[^A-Za-z0-9]/.test(p),
    };
  }, [passwordData.newPassword]);

  const passwordStrengthMeta = useMemo(() => {
    const p = passwordData.newPassword || '';
    const metCount = Object.values(passwordChecks).filter(Boolean).length;
    if (!p) {
      return { label: 'Very Weak', filledSegments: 0, segmentTone: 'neutral' };
    }
    const filledSegments = Math.min(4, metCount);
    let label = 'Very Weak';
    if (metCount >= 5) label = 'Strong';
    else if (metCount === 4) label = 'Good';
    else if (metCount === 3) label = 'Fair';
    else if (metCount === 2) label = 'Weak';

    let segmentTone = 'neutral';
    if (filledSegments <= 1) segmentTone = 'weak';
    else if (filledSegments === 2 || filledSegments === 3) segmentTone = 'fair';
    else segmentTone = 'strong';
    return { label, filledSegments, segmentTone };
  }, [passwordChecks, passwordData.newPassword]);

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showToast.error('Please fill all password fields');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast.error('New passwords do not match');
      return;
    }
    try {
      const res = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });
      showToast.success(res?.message || 'Password changed successfully. Please login again.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      await logout();
      navigate('/login', { replace: true });
    } catch (e) {
      showToast.error(e?.response?.data?.message || e?.message || 'Password change failed');
    }
  };

  const handleExportData = () => {
    console.log('Exporting data');
    alert('Your data export has been initiated. You will receive an email shortly.');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Deleting account');
      alert('Account deletion initiated. You will receive a confirmation email.');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  ];

  const positions = [
    'Midfielder',
    'Forward',
    'Defender',
    'Goalkeeper',
    'Winger'
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />

      {/* Main Content */}
      <div 
        className={`flex-1 p-8 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and settings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-emerald-600 border-b-2 border-emerald-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        {/* Profile Tab Content */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Personal Information Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-emerald-500" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                  <p className="text-sm text-gray-600">Update your personal details and contact information</p>
                </div>
              </div>

              {/* Profile Photo */}
              <div className="flex items-center gap-5 mb-6">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt=""
                    className="w-20 h-20 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                    {(user?.name || 'U').slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">Profile photo</p>
                  <p className="text-xs text-gray-500 mt-0.5">JPG/PNG up to 5MB. Recommended 200×200.</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <button
                    type="button"
                    disabled={authBusy}
                    onClick={handlePhotoPick}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 border border-emerald-200 rounded-lg text-sm font-medium text-emerald-700 bg-white hover:bg-emerald-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {authBusy ? 'Uploading…' : 'Upload Photo'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Preferred Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Position
                  </label>
                  <select
                    name="preferredPosition"
                    value={formData.preferredPosition}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    {positions.map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleSaveChanges}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-xl flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-emerald-500" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Security</h2>
                  <p className="text-sm text-gray-600">Manage your password and security settings</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Confirm New Password + strength */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-gray-600">Password strength</span>
                    <span className="font-medium text-gray-900 tabular-nums">
                      {passwordStrengthMeta.label}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-1.5" role="presentation">
                    {[0, 1, 2, 3].map((i) => {
                      const active = i < passwordStrengthMeta.filledSegments;
                      const tone = passwordStrengthMeta.segmentTone;
                      let activeClass = 'bg-gray-300';
                      if (active) {
                        if (tone === 'weak') activeClass = 'bg-red-400';
                        else if (tone === 'fair') activeClass = 'bg-amber-400';
                        else activeClass = 'bg-emerald-500';
                      } else {
                        activeClass = 'bg-gray-200';
                      }
                      return (
                        <div
                          key={i}
                          className={`h-2.5 min-w-0 flex-1 rounded-full transition-colors ${activeClass}`}
                        />
                      );
                    })}
                  </div>
                  <ul className="mt-4 space-y-2.5 text-sm">
                    {[
                      { id: 'len', text: 'At least 8 characters', ok: passwordChecks.length },
                      { id: 'up', text: 'Contains uppercase letter', ok: passwordChecks.upper },
                      { id: 'lo', text: 'Contains lowercase letter', ok: passwordChecks.lower },
                      { id: 'num', text: 'Contains a number', ok: passwordChecks.number },
                      { id: 'spec', text: 'Contains special character', ok: passwordChecks.special },
                    ].map((row) => (
                      <li key={row.id} className="flex items-start gap-2.5">
                        {row.ok ? (
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                        ) : (
                          <X className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                        )}
                        <span className={row.ok ? 'font-medium text-gray-900' : 'text-gray-500'}>
                          {row.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={handleChangePassword}
                className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-xl transition-all"
              >
                Change Password
              </button>
            </div>

            {/* Data & Account Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Trash2 className="w-5 h-5 text-red-500" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Data & Account</h2>
                  <p className="text-sm text-gray-600">Manage your data and account settings</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleExportData}
                  className="bg-white border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export My Data
                </button>

                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-xl transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                Deleting your account is permanent and cannot be undone. All your data will be permanently removed.
              </p>
            </div>
          </div>
        )}

        {/* Notifications Tab Content */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="w-5 h-5 text-emerald-500" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
                  <p className="text-sm text-gray-600">Choose how you want to receive notifications</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Email Notifications Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('emailNotifications')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.emailNotifications ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Push Notifications Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-gray-900">Push Notifications</h3>
                    <p className="text-sm text-gray-600">Receive push notifications on your device</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('pushNotifications')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.pushNotifications ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* SMS Notifications Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-gray-900">SMS Notifications</h3>
                    <p className="text-sm text-gray-600">Receive text message notifications</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('smsNotifications')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.smsNotifications ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Types */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Types</h2>

              <div className="space-y-4">
                {/* Booking Reminders */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-gray-900">Booking Reminders</h3>
                    <p className="text-sm text-gray-600">Get reminders about upcoming bookings</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('bookingReminders')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.bookingReminders ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.bookingReminders ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Payment Alerts */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-gray-900">Payment Alerts</h3>
                    <p className="text-sm text-gray-600">Notifications about payments and transactions</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('paymentAlerts')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.paymentAlerts ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.paymentAlerts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Team Updates */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-gray-900">Team Updates</h3>
                    <p className="text-sm text-gray-600">Updates from your teams and teammates</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('teamUpdates')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.teamUpdates ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.teamUpdates ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Tournament News */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-gray-900">Tournament News</h3>
                    <p className="text-sm text-gray-600">Latest updates about tournaments</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('tournamentNews')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.tournamentNews ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.tournamentNews ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Promotional Emails */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-gray-900">Promotional Emails</h3>
                    <p className="text-sm text-gray-600">Special offers and promotions</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('promotionalEmails')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.promotionalEmails ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.promotionalEmails ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy and Appearance sections removed */}
      </div>
    </div>
  );
};

export default SettingsPage;