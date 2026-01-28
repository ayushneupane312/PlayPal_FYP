import React, { useState } from 'react';
import PlayerSidebar from './PlayerSidebar';
import {
  User,
  Bell,
  Shield,
  Palette,
  Eye,
  EyeOff,
  Save,
  Download,
  Trash2,
  Check
} from 'lucide-react';

const SettingsPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    firstName: 'Marcus',
    lastName: 'Johnson',
    email: 'marcus.johnson@email.com',
    phoneNumber: '+1 (555) 123-4567',
    location: 'Downtown Sports Complex',
    preferredPosition: 'Midfielder'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
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

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhoneNumber: false,
    showLocation: true,
    allowMessages: true,
    showOnlineStatus: true,
    dataCollection: true
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: 'light',
    language: 'english',
    fontSize: 'medium',
    compactMode: false
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

  const handlePrivacyToggle = (key) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrivacyChange = (e) => {
    const { name, value } = e.target;
    setPrivacy(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAppearanceChange = (key, value) => {
    setAppearance(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveChanges = () => {
    console.log('Saving changes:', formData);
    alert('Changes saved successfully!');
  };

  const handleChangePassword = () => {
    console.log('Changing password');
    alert('Password changed successfully!');
    setPasswordData({ currentPassword: '', newPassword: '' });
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
    { id: 'privacy', name: 'Privacy', icon: <Shield className="w-4 h-4" /> },
    { id: 'appearance', name: 'Appearance', icon: <Palette className="w-4 h-4" /> }
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
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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

        {/* Privacy Tab Content */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            {/* Profile Privacy */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-emerald-500" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Profile Privacy</h2>
                  <p className="text-sm text-gray-600">Control who can see your profile information</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Profile Visibility */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Visibility
                  </label>
                  <select
                    name="profileVisibility"
                    value={privacy.profileVisibility}
                    onChange={handlePrivacyChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="public">Public - Everyone can see</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private - Only me</option>
                  </select>
                </div>

                {/* Show Email */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-gray-900">Show Email Address</h3>
                    <p className="text-sm text-gray-600">Display your email on your profile</p>
                  </div>
                  <button
                    onClick={() => handlePrivacyToggle('showEmail')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      privacy.showEmail ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        privacy.showEmail ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Show Phone Number */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-gray-900">Show Phone Number</h3>
                    <p className="text-sm text-gray-600">Display your phone number on your profile</p>
                  </div>
                  <button
                    onClick={() => handlePrivacyToggle('showPhoneNumber')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      privacy.showPhoneNumber ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        privacy.showPhoneNumber ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Show Location */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-gray-900">Show Location</h3>
                    <p className="text-sm text-gray-600">Display your location on your profile</p>
                  </div>
                  <button
                    onClick={() => handlePrivacyToggle('showLocation')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      privacy.showLocation ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        privacy.showLocation ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Activity Privacy */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Activity Privacy</h2>

              <div className="space-y-4">
                {/* Allow Messages */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-gray-900">Allow Messages</h3>
                    <p className="text-sm text-gray-600">Let other players send you messages</p>
                  </div>
                  <button
                    onClick={() => handlePrivacyToggle('allowMessages')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      privacy.allowMessages ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        privacy.allowMessages ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Show Online Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-gray-900">Show Online Status</h3>
                    <p className="text-sm text-gray-600">Let others see when you're online</p>
                  </div>
                  <button
                    onClick={() => handlePrivacyToggle('showOnlineStatus')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      privacy.showOnlineStatus ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        privacy.showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Data Collection */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-gray-900">Analytics & Data Collection</h3>
                    <p className="text-sm text-gray-600">Help us improve by sharing usage data</p>
                  </div>
                  <button
                    onClick={() => handlePrivacyToggle('dataCollection')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      privacy.dataCollection ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        privacy.dataCollection ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appearance Tab Content */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            {/* Theme Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Palette className="w-5 h-5 text-emerald-500" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Theme</h2>
                  <p className="text-sm text-gray-600">Customize the look and feel of your interface</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Light Theme */}
                <button
                  onClick={() => handleAppearanceChange('theme', 'light')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    appearance.theme === 'light'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-full h-24 bg-white rounded-lg mb-3 shadow-sm border border-gray-200"></div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Light</span>
                    {appearance.theme === 'light' && (
                      <Check className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                </button>

                {/* Dark Theme */}
                <button
                  onClick={() => handleAppearanceChange('theme', 'dark')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    appearance.theme === 'dark'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-full h-24 bg-gray-900 rounded-lg mb-3 shadow-sm"></div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Dark</span>
                    {appearance.theme === 'dark' && (
                      <Check className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                </button>

                {/* Auto Theme */}
                <button
                  onClick={() => handleAppearanceChange('theme', 'auto')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    appearance.theme === 'auto'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-full h-24 bg-gradient-to-r from-white to-gray-900 rounded-lg mb-3 shadow-sm"></div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Auto</span>
                    {appearance.theme === 'auto' && (
                      <Check className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Language Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Language</h2>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleAppearanceChange('language', 'english')}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    appearance.language === 'english'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium text-gray-900">English</span>
                  {appearance.language === 'english' && (
                    <Check className="w-5 h-5 text-emerald-600" />
                  )}
                </button>

                <button
                  onClick={() => handleAppearanceChange('language', 'spanish')}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    appearance.language === 'spanish'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium text-gray-900">Español</span>
                  {appearance.language === 'spanish' && (
                    <Check className="w-5 h-5 text-emerald-600" />
                  )}
                </button>

                <button
                  onClick={() => handleAppearanceChange('language', 'french')}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    appearance.language === 'french'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium text-gray-900">Français</span>
                  {appearance.language === 'french' && (
                    <Check className="w-5 h-5 text-emerald-600" />
                  )}
                </button>

                <button
                  onClick={() => handleAppearanceChange('language', 'german')}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    appearance.language === 'german'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium text-gray-900">Deutsch</span>
                  {appearance.language === 'german' && (
                    <Check className="w-5 h-5 text-emerald-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Display Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Display Settings</h2>

              <div className="space-y-6">
                {/* Font Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Font Size
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => handleAppearanceChange('fontSize', 'small')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        appearance.fontSize === 'small'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-900">Small</p>
                      <p className="text-xs text-gray-600 mt-1">Compact view</p>
                    </button>

                    <button
                      onClick={() => handleAppearanceChange('fontSize', 'medium')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        appearance.fontSize === 'medium'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="text-base font-medium text-gray-900">Medium</p>
                      <p className="text-sm text-gray-600 mt-1">Default size</p>
                    </button>

                    <button
                      onClick={() => handleAppearanceChange('fontSize', 'large')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        appearance.fontSize === 'large'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="text-lg font-medium text-gray-900">Large</p>
                      <p className="text-base text-gray-600 mt-1">Easy reading</p>
                    </button>
                  </div>
                </div>

                {/* Compact Mode */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-gray-900">Compact Mode</h3>
                    <p className="text-sm text-gray-600">Show more content with less spacing</p>
                  </div>
                  <button
                    onClick={() => handleAppearanceChange('compactMode', !appearance.compactMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      appearance.compactMode ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        appearance.compactMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;