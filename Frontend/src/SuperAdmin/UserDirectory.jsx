import React, { useEffect, useState } from 'react';
import API_BASE from '../utils/apiBase';
import { Users, Search, Eye, Trash, Bell, Phone, Mail, Filter, Edit, Plus, X } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import Dropdown from '../components/DropDown';
import { useUserStore } from '../store/userStore';
import { showToast } from '../FutsalOwner/components/Toast';
import ConfirmationModal from '../components/ConfirmationModel';
import { useConfirmation } from '../hooks/useConfirmation';
import AdminHeader from '../components/AdminHeader';
import PhoneInput from '../components/PhoneInput';
import { getPhoneValidationError } from '../utils/phoneValidation';
import { RequiredMark } from '../components/RequiredMark';

const getVisiblePageNumbers = (current, totalPages, maxButtons = 10) => {
  const total = Math.max(1, totalPages);
  let start = Math.max(1, current - Math.floor(maxButtons / 2));
  let end = Math.min(total, start + maxButtons - 1);
  if (end - start < maxButtons - 1) {
    start = Math.max(1, end - maxButtons + 1);
  }
  const nums = [];
  for (let i = start; i <= end; i += 1) nums.push(i);
  return nums;
};

const UserManagement = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('players');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('all');

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'player',
  });

  const { users, loading, fetchUsers, deleteUser, updateUser, pagination } = useUserStore();
  
  // Confirmation hook for delete
  const { isOpen, isLoading, config, showConfirmation, hideConfirmation, handleConfirm } = useConfirmation();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    fetchUsers({ role: roleFilter, search: debouncedSearch, page });
  }, [debouncedSearch, roleFilter, page]);

  const tabs = [
    { id: 'players', label: 'Players', count: users.length },
    { id: 'owners', label: 'Futsal Owners', count: 156 }
  ];

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'player', label: 'Player' },
    { value: 'admin', label: 'Admin' },
    { value: 'futsalowner', label: 'Futsal Owner' }
  ];

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'player',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const phoneErr = getPhoneValidationError(editFormData.phone);
    if (phoneErr) {
      showToast.error(phoneErr);
      return;
    }

    try {
      await updateUser(selectedUser._id, editFormData);
      showToast.success(`${editFormData.name} updated successfully!`);
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDelete = (userId, userName) => {
    showConfirmation({
      title: 'Delete User',
      message: `Are you sure you want to delete ${userName}? This action cannot be undone and all user data will be permanently removed from the system.`,
      confirmText: 'Yes, Delete User',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteUser(userId);
          showToast.success(`${userName} has been deleted successfully!`);
        } catch (error) {
          showToast.error('Failed to delete user');
        }
      }
    });
  };

  const getRoleColor = (role = '') => {
    switch (role.toLowerCase()) {
      case 'player':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'futsalowner':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getAvatarUrl = (user = {}) => {
    const candidate = user.profileImage || user.avatar || user.imageUrl || '';
    if (!candidate) return '';
    if (candidate.startsWith('http://') || candidate.startsWith('https://')) return candidate;
    if (candidate.startsWith('/')) {
      return `${API_BASE}${candidate}`;
    }
    return candidate;
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div 
        className={`flex-1 p-8 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        {/* Top Navigation Bar */}
        <AdminHeader
          title="User Management"
          subtitle="Manage players, admins, and futsal owners"
          icon={<Users size={24} />}
          notificationCount={3}
          showNotification={true}
          showTime={true}
        />


        {/* Search and Filter Section */}
        <div className="rounded-xl shadow-sm border border-gray-100  mb-7">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by name, email, or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-gray-700 transition-all"
              />
            </div>

            <div className="w-48">
              <Dropdown
                value={roleFilter}
                onChange={(v) => {
                  setRoleFilter(v);
                  setPage(1);
                }}
                options={roleOptions}
                placeholder="Filter by role"
                icon={Filter}
                size="medium"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <Users size={48} className="mb-4 text-gray-300" />
                          <p className="text-lg font-medium text-gray-700">No users found</p>
                          <p className="text-sm">Try adjusting your search or filter criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {getAvatarUrl(user) ? (
                              <img
                                src={getAvatarUrl(user)}
                                alt={user.name || 'User'}
                                className="w-10 h-10 rounded-full object-cover border border-emerald-100"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.nextElementSibling;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full items-center justify-center text-white font-semibold"
                              style={{ display: getAvatarUrl(user) ? 'none' : 'flex' }}
                            >
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{user.name}</div>
                              <div className="text-xs text-gray-500">{user._id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Mail size={14} className="text-gray-400" />
                              {user.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Phone size={14} className="text-gray-400" />
                              {user.phone || "N/A"}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-700">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleEdit(user)}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                              title="Edit User"
                            >
                              <Edit size={16} className="text-blue-600" />
                            </button>
                            <button 
                              onClick={() => handleDelete(user._id, user.name)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                              title="Delete User"
                            >
                              <Trash size={16} className="text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!loading && (
            <div className="border-t border-gray-200 bg-white px-4 py-4">
              <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 sm:justify-end">
                {getVisiblePageNumbers(pagination.page, pagination.pages).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPage(num)}
                    className={`min-w-[2rem] px-2 py-1 text-sm font-medium transition-colors ${
                      num === pagination.page
                        ? 'text-[#f43f5e]'
                        : 'text-[#0ea5e9] hover:text-sky-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  className="ml-4 text-sm font-medium text-[#0ea5e9] transition-colors hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isOpen}
        onClose={hideConfirmation}
        onConfirm={handleConfirm}
        title={config.title}
        message={config.message}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        type={config.type}
        isLoading={isLoading}
      />

      {/* ✅ Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Edit className="text-white" size={20} />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Edit User</h3>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <RequiredMark className="inline" />
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                  placeholder="Enter full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <RequiredMark className="inline" />
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                  placeholder="Enter email address"
                />
              </div>

              <PhoneInput
                label="Phone Number"
                required
                value={editFormData.phone}
                onValueChange={(v) => setEditFormData({ ...editFormData, phone: v })}
                hideHint
              />

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <RequiredMark className="inline" />
                </label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                >
                  <option value="player">Player</option>
                  <option value="futsalowner">Futsal Owner</option>
            
                </select>
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;