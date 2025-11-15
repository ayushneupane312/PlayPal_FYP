import React, { useState } from 'react';
import { Search, Filter, Eye, Power, Link2, MapPin, Trash2, Calendar, Bell, Settings, CreditCard, Trophy, BarChart3, Users, Mail, Phone, CheckCircle, XCircle, Clock, FileText, PlayCircle } from 'lucide-react';

const UserDirectory = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterVerification, setFilterVerification] = useState('All');

  const users = [
    {
      id: 1,
      name: 'Rohit K.',
      email: 'rohit@mail.com',
      role: 'Player',
      status: 'Active',
      verification: 'KYC',
      registered: '2024-10-12',
      avatar: 'RK',
      color: 'bg-orange-200',
      phone: '+977 98XXXXXX',
      city: 'Kathmandu',
      lastBooking: '2025-02-05 • Arena Five',
      bookings: 32,
      refunds: 0
    },
    {
      id: 2,
      name: 'City Futsal',
      email: 'owner@cityf.com',
      role: 'Owner',
      status: 'Inactive',
      verification: 'Pending',
      registered: '2024-11-02',
      avatar: 'CF',
      color: 'bg-blue-200'
    },
    {
      id: 3,
      name: 'Meera G.',
      email: 'meera@inbox.com',
      role: 'Player',
      status: 'Active',
      verification: 'KYC',
      registered: '2025-01-05',
      avatar: 'MG',
      color: 'bg-purple-200'
    },
    {
      id: 4,
      name: 'Nimesh T.',
      email: 'nimesh@goal.com',
      role: 'Owner',
      status: 'Review',
      verification: 'Docs mismatch',
      registered: '2025-01-28',
      avatar: 'NT',
      color: 'bg-green-200'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-teal-500 text-white';
      case 'Inactive': return 'bg-gray-300 text-gray-700';
      case 'Review': return 'bg-amber-500 text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white">
        <div className="p-4">
          <div className="w-10 h-10 bg-teal-500 rounded-lg mb-8"></div>
        </div>

        <nav className="space-y-1 px-3">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 rounded-lg text-sm">
            <BarChart3 className="w-4 h-4" />
            <div>
              <div className="font-medium">Dashboard</div>
              <div className="text-xs text-gray-400">Overview</div>
            </div>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 rounded-lg text-sm">
            <MapPin className="w-4 h-4" />
            <div>
              <div className="font-medium">Manage</div>
              <div className="text-xs text-gray-400">Futsal Centers</div>
            </div>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 rounded-lg text-sm">
            <Calendar className="w-4 h-4" />
            <div>
              <div className="font-medium">Bookings</div>
              <div className="text-xs text-gray-400">Management</div>
            </div>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-teal-600 rounded-lg text-sm">
            <Users className="w-4 h-4" />
            <div>
              <div className="font-medium">User</div>
              <div className="text-xs text-gray-400">Management</div>
            </div>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 rounded-lg text-sm">
            <CreditCard className="w-4 h-4" />
            <div>
              <div className="font-medium">Payments &</div>
              <div className="text-xs text-gray-400">Revenue</div>
            </div>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 rounded-lg text-sm">
            <Trophy className="w-4 h-4" />
            <div>
              <div className="font-medium">Tournaments</div>
              <div className="text-xs text-gray-400">& Events</div>
            </div>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 rounded-lg text-sm">
            <Bell className="w-4 h-4" />
            <span className="font-medium">Notifications</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 rounded-lg text-sm">
            <Settings className="w-4 h-4" />
            <div>
              <div className="font-medium">System</div>
              <div className="text-xs text-gray-400">Settings</div>
            </div>
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
                  placeholder="Search users by name, email, role..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <span className="text-sm text-gray-600">Welcome</span>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Users Directory */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Users Directory</h2>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                        <Filter className="w-4 h-4" />
                        Filters
                      </button>
                      <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                        Role: All
                      </button>
                      <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                        Status: Active
                      </button>
                      <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                        Verification
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">User</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Role</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Status</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Verification</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Registered</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr
                            key={user.id}
                            onClick={() => setSelectedUser(user)}
                            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              selectedUser?.id === user.id ? 'bg-teal-50' : ''
                            }`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 ${user.color} rounded-full flex items-center justify-center text-sm font-semibold`}>
                                  {user.avatar}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                  <div className="text-xs text-gray-600">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-700">{user.role}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex px-3 py-1 rounded text-xs font-medium ${getStatusColor(user.status)}`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                {user.verification === 'KYC' ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-teal-600" />
                                    {user.verification}
                                  </>
                                ) : user.verification === 'Pending' ? (
                                  <>
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    {user.verification}
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4 text-red-600" />
                                    {user.verification}
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-700">{user.registered}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <button className="p-2 hover:bg-gray-100 rounded">
                                  <Eye className="w-4 h-4 text-gray-600" />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded">
                                  <Power className="w-4 h-4 text-gray-600" />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded">
                                  <Link2 className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <button className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50">
                      Prev
                    </button>
                    <span className="text-sm text-gray-600">Page 1 of 12</span>
                    <button className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50">
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* Selected User Details */}
              {selectedUser && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Selected User Details</h3>
                    <span className="text-sm text-gray-600">{selectedUser.name}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {/* Profile */}
                    <div className="bg-teal-50 rounded-lg p-4">
                      <h4 className="text-sm text-gray-600 mb-3">Profile</h4>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 ${selectedUser.color} rounded-full flex items-center justify-center text-sm font-semibold`}>
                          {selectedUser.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{selectedUser.name}</div>
                          <div className="text-xs text-gray-600">{selectedUser.role} • Joined {selectedUser.registered}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs">{selectedUser.status}</span>
                        <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs">{selectedUser.verification}</span>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="bg-teal-50 rounded-lg p-4">
                      <h4 className="text-sm text-gray-600 mb-3">Contact</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <div className="text-xs text-gray-600">Email:</div>
                          <div className="text-gray-900">{selectedUser.email}</div>
                        </div>
                        {selectedUser.phone && (
                          <div>
                            <div className="text-xs text-gray-600">Phone:</div>
                            <div className="text-gray-900">{selectedUser.phone}</div>
                          </div>
                        )}
                        {selectedUser.city && (
                          <div>
                            <div className="text-xs text-gray-600">City:</div>
                            <div className="text-gray-900">{selectedUser.city}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-teal-50 rounded-lg p-4">
                      <h4 className="text-sm text-gray-600 mb-3">Recent Activity</h4>
                      {selectedUser.lastBooking && (
                        <div className="space-y-2 text-sm">
                          <div>
                            <div className="text-xs text-gray-600">Last booking:</div>
                            <div className="text-gray-900">{selectedUser.lastBooking}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Bookings:</div>
                            <div className="text-gray-900">{selectedUser.bookings} total</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Refunds:</div>
                            <div className="text-gray-900">{selectedUser.refunds}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    <button className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm font-medium">
                      Send Message
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                      Reset Password
                    </button>
                    <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium">
                      Deactivate
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar - Filters */}
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Search</label>
                    <input
                      type="text"
                      placeholder="Type name or email..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Role</label>
                    <div className="space-y-2">
                      {['All', 'Player', 'Owner'].map((role) => (
                        <label key={role} className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="role"
                            value={role}
                            checked={filterRole === role}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="text-teal-500"
                          />
                          {role}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Verification</label>
                    <div className="space-y-2">
                      {['All', 'KYC', 'Pending', 'Review'].map((verification) => (
                        <label key={verification} className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="verification"
                            value={verification}
                            checked={filterVerification === verification}
                            onChange={(e) => setFilterVerification(e.target.value)}
                            className="text-teal-500"
                          />
                          {verification}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium mb-2">
                      Clear
                    </button>
                    <button className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm font-medium">
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              {/* Bulk Actions */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Bulk Actions</h3>
                
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm text-left">
                    <div className="font-medium">Verify KYC</div>
                    <div className="text-xs text-gray-500">Approve documents for selected owners</div>
                  </button>
                  <button className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm">
                    Run
                  </button>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm text-left">
                    <div className="font-medium flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-red-600" />
                      <span>Deactivate Users</span>
                    </div>
                    <div className="text-xs text-gray-500">Temporarily disable</div>
                  </button>
                </div>
              </div>

              {/* Verification Queue */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Verification Queue</h3>
                
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-sm text-gray-900 mb-1">GoalHub Owner</div>
                    <div className="text-xs text-gray-600">Submitted 2h ago • Business License</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-sm text-gray-900 mb-1">City Futsal Owner</div>
                    <div className="text-xs text-gray-600">Submitted 1d ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDirectory;