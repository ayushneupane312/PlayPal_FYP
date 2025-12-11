import React, { useState } from 'react';
import { Search, Users, Calendar, MapPin, DollarSign, TrendingUp, AlertCircle, Clock, Phone, Mail, Eye, Check, Edit, Sliders, Trash2, Trophy, Settings, Bell, CreditCard, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
const AdminDashboard = () => {
  const navigate = useNavigate ();

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-sm font-semibold">ID</span>
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users, bookings, payments..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Key Metrics */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Key Metrics</h2>
                  <button className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    Today
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-xs text-gray-600">Active Users</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">12,480</div>
                    <div className="h-1 bg-teal-500 rounded-full mb-1"></div>
                    <div className="text-xs text-teal-600">+4.2% vs last week</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="text-xs text-gray-600">Total Bookings</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">3,214</div>
                    <div className="h-1 bg-teal-500 rounded-full mb-1"></div>
                    <div className="text-xs text-teal-600">+21% WoW</div>
                  </div>

                  <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span className="text-xs text-gray-600">Active Venues</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">76</div>
                    <div className="h-1 bg-teal-500 rounded-full mb-1 w-3/4"></div>
                    <div className="text-xs text-gray-600">5 pending verification</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-gray-600" />
                      <span className="text-xs text-gray-600">Revenue</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">NPR 12.3M</div>
                    <div className="h-1 bg-teal-500 rounded-full mb-1 w-2/3"></div>
                    <div className="text-xs text-gray-600">Pending payouts: NPR 180k</div>
                  </div>
                </div>
              </div>

              {/* Urgent Alerts */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Urgent Alerts</h2>
                  <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded">Attention</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-gray-900">Booking conflict detected</span>
                      </div>
                      <p className="text-xs text-gray-600">Arena Five • Court 2 • Today 8:00 PM overlaps</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 text-xs bg-orange-500 text-white rounded hover:bg-orange-600">
                        Resolve
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded">
                        <Clock className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded">
                        <Phone className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-gray-900">Payment delay</span>
                      </div>
                      <p className="text-xs text-gray-600">Payout to GoalHub pending &gt; 3 days</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600">
                        Overdue
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded">
                        <Check className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">Owner not verified</span>
                      </div>
                      <p className="text-xs text-gray-600">City Futsal awaiting KYC</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded">
                        Pending
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded">
                        <Clock className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded">
                        <Mail className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manage Futsal Centers */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Manage Futsal Centers</h2>
                  <button className="px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600">
                    Add New Center
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Valley Arena */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Valley Arena</h3>
                      <span className="px-2 py-1 text-xs bg-teal-500 text-white rounded">Verified</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">Kathmandu • Owner: S. Thapa</p>
                    <div className="mb-3">
                      <div className="text-xs text-gray-600 mb-1">Slots today:</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">24 / 32</span>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
                          <div className="h-full w-3/4 bg-teal-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="text-xs text-gray-600">Rating:</div>
                      <div className="text-sm">4.6 ⭐</div>
                      <div className="text-xs text-gray-500">Book freq: High</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-1.5 hover:bg-gray-200 rounded">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-200 rounded">
                        <Sliders className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-200 rounded">
                        <Trash2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* GoalHub */}
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">GoalHub</h3>
                      <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">Awaiting Review</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">Bhaktapur • Owner: M. Shrestha</p>
                    <div className="mb-3">
                      <div className="text-xs text-gray-600 mb-1">Slots today:</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">12 / 28</span>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
                          <div className="h-full w-2/5 bg-teal-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="text-xs text-gray-600">Rating:</div>
                      <div className="text-sm">4.2 ⭐</div>
                      <div className="text-xs text-gray-500">Book freq:</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-1.5 hover:bg-gray-200 rounded">
                        <Check className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-200 rounded">
                        <Mail className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-200 rounded">
                        <Trash2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* City Futsal */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">City Futsal</h3>
                      <span className="px-2 py-1 text-xs bg-amber-500 text-white rounded">Maintenance</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">Lalitpur • Owner: R. Lama</p>
                    <div className="mb-3">
                      <div className="text-xs text-gray-600 mb-1">Slots today:</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">0 / 20</span>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
                          <div className="h-full w-0 bg-teal-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="text-xs text-gray-600">Rating:</div>
                      <div className="text-sm">4.0 ⭐</div>
                      <div className="text-xs text-gray-500">Book freq: Low</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-1.5 hover:bg-gray-200 rounded">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-200 rounded">
                        <Calendar className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-200 rounded">
                        <Trash2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* User Management */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-4">User Management</h3>
                
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      <th className="pb-2 text-xs font-semibold text-gray-600">User</th>
                      <th className="pb-2 text-xs font-semibold text-gray-600">Role</th>
                      <th className="pb-2 text-xs font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center text-xs font-semibold">
                            RK
                          </div>
                          <span className="text-sm">Rohit K.</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-600">Player</td>
                      <td className="py-3">
                        <span className="px-2 py-1 text-xs bg-teal-500 text-white rounded">Active</span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center text-xs font-semibold">
                            CF
                          </div>
                          <span className="text-sm">City Futsal</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-600">Owner</td>
                      <td className="py-3">
                        <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">Inactive</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-xs font-semibold">
                            MG
                          </div>
                          <span className="text-sm">Meera G.</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-600">Player</td>
                      <td className="py-3">
                        <span className="px-2 py-1 text-xs bg-teal-500 text-white rounded">Active</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Payments & Revenue */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Payments & Revenue</h3>
                
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Total Revenue</span>
                    <CreditCard className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">NPR 12.3M</div>
                  <div className="text-xs text-gray-600">Refund requests: 18</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium text-gray-900">INV-9342 • Arena Five</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Paid</span>
                      <span className="text-xs text-gray-600">Stripe</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium text-gray-900">INV-9328 • GoalHub</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Pending</span>
                      <span className="text-xs text-gray-600">eSewa</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium text-gray-900">INV-9309 • City Futsal</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Refunded</span>
                      <span className="text-xs text-gray-600">Khalti</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tournaments & Events */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Tournaments & Events</h3>
                
                <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg border border-teal-200">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Valley Cup 2025</div>
                  </div>
                  <span className="px-2 py-1 text-xs bg-teal-500 text-white rounded">Ongoing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;