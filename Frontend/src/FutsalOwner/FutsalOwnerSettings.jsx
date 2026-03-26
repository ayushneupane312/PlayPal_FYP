import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, FileText, Bell, CreditCard, Calendar, Shield, Eye, EyeOff, MapPin, Phone, Mail, Building, Database, AlertTriangle, Trash2, Check, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFutsalOwnerStore } from '../store/futsalOwnerFormStore';
import { showToast } from './components/Toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const navigate = useNavigate();
  const { user, isAuthenticated, uploadProfileImage, isLoading: authBusy, logout, changePassword } = useAuthStore();
  const { getMyApplication } = useFutsalOwnerStore();
  const fileInputRef = useRef(null);

  const [applicationData, setApplicationData] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    const run = async () => {
      if (!isAuthenticated) return;
      if (user?.role !== 'futsalowner') return;

      try {
        const response = await getMyApplication();
        const futsalOwner = response?.data?.futsalOwner;
        setApplicationData(response?.data ?? null);
        setFormData({
          fullName: futsalOwner?.fullName || user?.name || '',
          email: futsalOwner?.email || user?.email || '',
          phone: futsalOwner?.phone || ''
        });
      } catch {
        setApplicationData(null);
        setFormData({
          fullName: user?.name || '',
          email: user?.email || '',
          phone: ''
        });
      }
    };

    run();
  }, [isAuthenticated, user?._id, user?.role, getMyApplication]);

  const ownerDisplayName = formData.fullName || user?.name || 'Owner';
  const ownerInitials = getInitials(ownerDisplayName);
  const profileImageUrl = user?.profileImage || '';

  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast.error('Please choose an image file');
      return;
    }
    try {
      await uploadProfileImage(file);
      showToast.success('Profile photo updated');
    } catch (err) {
      showToast.error(err.response?.data?.message || err.message || 'Upload failed');
    }
  };
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

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
  }, [passwordData.newPassword, passwordChecks]);
  
  const [futsalData, setFutsalData] = useState({
    defaultVenue: 'Champion Futsal Arena - Thamel',
    businessName: 'Champion Futsal Arena',
    contactNumber: '+977 9851234567',
    supportEmail: 'support@championfutsal.com',
    businessAddress: 'Thamel, Kathmandu'
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    venueVisibility: true,
    dataSharing: false
  });
  
  // Mock recent activity data
  const recentActivity = [
    { action: 'Password changed', date: 'Feb 3, 2026 at 2:15 PM' },
    { action: 'Profile photo updated', date: 'Jan 28, 2026 at 10:30 AM' },
    { action: 'Payout account added', date: 'Jan 15, 2026 at 4:45 PM' },
    { action: 'New venue added', date: 'Jan 10, 2026 at 11:00 AM' }
  ];
  
  // Mock venues list - in real app, this would come from API
  const venues = [
    'Champion Futsal Arena - Thamel',
    'Champion Futsal Arena - Baneshwor',
    'Champion Futsal Arena - Lalitpur'
  ];

  const menuItems = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'security', label: 'Password & Security', icon: Lock },
    { id: 'futsal', label: 'Futsal Information', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payment', label: 'Payment & Payout', icon: CreditCard },
    { id: 'availability', label: 'Availability & Rules', icon: Calendar },
    { id: 'privacy', label: 'Privacy & Account', icon: Shield },
  ];

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
  
  const handleFutsalDataChange = (e) => {
    const { name, value } = e.target;
    setFutsalData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = () => {
    console.log('Saving settings:', formData);
    // Add your save logic here
  };
  
  const handlePasswordSubmit = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast.error('New passwords do not match!');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      showToast.success('Password has been changed');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Cookie is cleared on the backend, but we also clear local auth state.
      await logout();
      navigate('/login', { replace: true });
    } catch (e) {
      showToast.error(e?.response?.data?.message || e?.message || 'Failed to change password');
    }
  };
  
  const handleFutsalSave = () => {
    console.log('Saving futsal information:', futsalData);
    // Add your futsal data save logic here
  };
  
  const togglePrivacySetting = (setting) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  const handleDeactivateAccount = () => {
    if (window.confirm('Are you sure you want to deactivate your account? This will temporarily disable your account and hide all venues.')) {
      console.log('Deactivating account...');
      // Add your account deactivation logic here
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-semibold">
              PP
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">PlayPal</h1>
              <p className="text-xs text-gray-500">Futsal Owner Dashboard</p>
            </div>
          </div>
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt=""
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
              {ownerInitials}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Settings Layout */}
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-80 bg-white rounded-lg shadow-sm p-4">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white rounded-lg shadow-sm p-8">
            {/* Profile Settings Content */}
            {activeTab === 'profile' && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
                </div>
                <p className="text-gray-600 mb-8">Manage your personal information and account details</p>

                {/* Profile Photo Section */}
                <div className="mb-8">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white text-3xl font-semibold overflow-hidden shrink-0">
                      {profileImageUrl ? (
                        <img src={profileImageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        ownerInitials
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">{ownerDisplayName}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {applicationData?.applicationStatus === 'approved' ? 'Verified Owner' : 'Owner'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">Upload a profile picture. Recommended size: 200x200px</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePhotoChange}
                      />
                      <button
                        type="button"
                        disabled={authBusy}
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-emerald-200 rounded-lg text-sm font-medium text-emerald-700 bg-white hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {authBusy ? 'Uploading…' : 'Upload Photo'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  {/* Phone Number */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end mt-8">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Save & Update
                  </button>
                </div>
              </div>
            )}

            {/* Password & Security Content */}
            {activeTab === 'security' && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Password & Security</h2>
                </div>
                <p className="text-gray-600 mb-8">Manage your password and security preferences</p>

                {/* Change Password Section */}
                <div className="max-w-2xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h3>

                  <div className="space-y-6">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.current ? "text" : "password"}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword.current ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
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
                          type={showPassword.new ? "text" : "password"}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword.new ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.confirm ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword.confirm ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Password strength & requirements (new password) */}
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
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
                            <span
                              className={
                                row.ok ? 'font-medium text-gray-900' : 'text-gray-500'
                              }
                            >
                              {row.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Change Password Button */}
                  <div className="mt-8">
                    <button
                      onClick={handlePasswordSubmit}
                      className="px-6 py-2.5 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Futsal Information Content */}
            {activeTab === 'futsal' && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Futsal Information Settings</h2>
                </div>
                <p className="text-gray-600 mb-8">Manage your venue details and business information</p>

                <div className="space-y-6">
                  {/* Default Futsal Venue */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Futsal Venue
                    </label>
                    <div className="relative">
                      <select
                        name="defaultVenue"
                        value={futsalData.defaultVenue}
                        onChange={handleFutsalDataChange}
                        className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                      >
                        {venues.map((venue) => (
                          <option key={venue} value={venue}>
                            {venue}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This venue will be selected by default when managing bookings
                    </p>
                  </div>

                  {/* Business Name and Contact Number */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Business Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Business Name
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={futsalData.businessName}
                        onChange={handleFutsalDataChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    {/* Contact Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={futsalData.contactNumber}
                        onChange={handleFutsalDataChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Support Email and Business Address */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Support Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Support Email
                      </label>
                      <input
                        type="email"
                        name="supportEmail"
                        value={futsalData.supportEmail}
                        onChange={handleFutsalDataChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    {/* Business Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Business Address
                      </label>
                      <input
                        type="text"
                        name="businessAddress"
                        value={futsalData.businessAddress}
                        onChange={handleFutsalDataChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Changes Button */}
                <div className="flex justify-end mt-8">
                  <button
                    onClick={handleFutsalSave}
                    className="px-6 py-2.5 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Privacy & Account Content */}
            {activeTab === 'privacy' && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Privacy & Account Controls</h2>
                </div>
                <p className="text-gray-600 mb-8">Manage your privacy settings and account preferences</p>

                {/* Privacy Settings */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Privacy Settings</h3>
                  
                  <div className="space-y-4">
                    {/* Venue Visibility */}
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Eye className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Venue Visibility</h4>
                          <p className="text-sm text-gray-600">Your venues are visible to the public</p>
                        </div>
                      </div>
                      <button
                        onClick={() => togglePrivacySetting('venueVisibility')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          privacySettings.venueVisibility ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            privacySettings.venueVisibility ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Data Sharing Consent */}
                    <div className="flex items-center justify-between py-3 border-t border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Database className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Data Sharing Consent</h4>
                          <p className="text-sm text-gray-600">Share anonymized data to help improve PlayPal</p>
                        </div>
                      </div>
                      <button
                        onClick={() => togglePrivacySetting('dataSharing')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          privacySettings.dataSharing ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            privacySettings.dataSharing ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2"
                      >
                        <span className="text-gray-700">{activity.action}</span>
                        <span className="text-sm text-gray-500">{activity.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h3 className="text-base font-semibold text-red-900">Danger Zone</h3>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Deactivate Account</h4>
                      <p className="text-sm text-gray-600">Temporarily disable your account and hide all venues</p>
                    </div>
                    <button
                      onClick={handleDeactivateAccount}
                      className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Deactivate
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {activeTab !== 'profile' && activeTab !== 'security' && activeTab !== 'futsal' && activeTab !== 'privacy' && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  {React.createElement(menuItems.find(item => item.id === activeTab)?.icon || User, {
                    className: "w-8 h-8 text-gray-400"
                  })}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {menuItems.find(item => item.id === activeTab)?.label}
                </h3>
                <p className="text-gray-500">This section is coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;