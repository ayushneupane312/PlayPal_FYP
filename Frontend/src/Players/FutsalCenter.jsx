import React, { useState } from 'react';
import { Search, Bell, MapPin, DollarSign, Calendar, Star, Clock, Eye, Flag, X, Grid3x3, List, CheckCircle } from 'lucide-react';
import AdminSidebar from '../SuperAdmin/AdminSidebar';

const FutsalCenters = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const centers = [
    {
      id: 1,
      name: 'Arena Sports Complex',
      location: '123 Downtown Ave, City Center',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop',
      status: 'Approved',
      revenue: 12500,
      totalBookings: 156,
      rating: 4.8,
      reviews: 234,
      pricePerHour: 50,
      weekdayHours: '8AM-10PM',
      weekendHours: '6AM-12AM',
      owner: 'John Smith'
    },
    {
      id: 2,
      name: 'Victory Futsal Center',
      location: '456 West Side Blvd',
      image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&h=400&fit=crop',
      status: 'Approved',
      revenue: 9800,
      totalBookings: 124,
      rating: 4.6,
      reviews: 189,
      pricePerHour: 45,
      weekdayHours: '9AM-11PM',
      weekendHours: '7AM-11PM',
      owner: 'Maria Garcia'
    },
    {
      id: 3,
      name: 'Champion Arena',
      location: '789 East District',
      image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&h=400&fit=crop',
      status: 'Pending',
      revenue: 0,
      totalBookings: 0,
      rating: null,
      reviews: 0,
      pricePerHour: 55,
      weekdayHours: '10AM-10PM',
      weekendHours: '8AM-10PM',
      owner: 'David Lee'
    },
    {
      id: 4,
      name: 'Elite Sports Hub',
      location: '321 North Avenue',
      image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=400&fit=crop',
      status: 'Approved',
      revenue: 15200,
      totalBookings: 198,
      rating: 4.9,
      reviews: 312,
      pricePerHour: 60,
      weekdayHours: '7AM-11PM',
      weekendHours: '6AM-12AM',
      owner: 'Sarah Johnson'
    },
    {
      id: 5,
      name: 'Metro Futsal Zone',
      location: '555 South Street',
      image: 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=800&h=400&fit=crop',
      status: 'Flagged',
      revenue: 5600,
      totalBookings: 67,
      rating: 3.2,
      reviews: 45,
      pricePerHour: 40,
      weekdayHours: '9AM-9PM',
      weekendHours: '8AM-8PM',
      owner: 'Michael Chen'
    },
    {
      id: 6,
      name: 'Prime Time Arena',
      location: '888 Central Plaza',
      image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&h=400&fit=crop',
      status: 'Approved',
      revenue: 11300,
      totalBookings: 142,
      rating: 4.7,
      reviews: 201,
      pricePerHour: 52,
      weekdayHours: '8AM-10PM',
      weekendHours: '7AM-11PM',
      owner: 'Jennifer Martinez'
    }
  ];

  const stats = [
    { label: 'Total Centers', value: 156, color: 'text-cyan-500' },
    { label: 'Approved', value: 142, color: 'text-green-500' },
    { label: 'Pending Review', value: 8, color: 'text-yellow-500' },
    { label: 'Flagged/Suspended', value: 6, color: 'text-red-500' }
  ];

  const filteredCenters = centers.filter(center => {
    const matchesSearch = center.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         center.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || center.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'approved': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'flagged': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar />
      
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
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">3</span>
            </button>
            <span className="text-gray-600 text-sm">09:25 AM</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Futsal Management</h1>
            <p className="text-gray-500">Manage and monitor all futsal centers</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-500 text-sm mb-2">{stat.label}</p>
                <h3 className={`text-4xl font-bold ${stat.color}`}>{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Search and View Toggle */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-gray-700"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="flagged">Flagged</option>
              </select>

              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-cyan-500 text-white' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-cyan-500 text-white' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Centers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCenters.map((center) => (
              <div key={center.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                {/* Image */}
                <div className="relative h-48">
                  <img 
                    src={center.image} 
                    alt={center.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(center.status)}`}>
                      {center.status === 'Approved' && <CheckCircle size={12} />}
                      {center.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{center.name}</h3>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                    <MapPin size={16} />
                    <span>{center.location}</span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Revenue (This Month)</p>
                      <div className="flex items-center gap-1">
                        <DollarSign size={16} className="text-green-500" />
                        <span className="text-green-500 font-bold">{center.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Total Bookings</p>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} className="text-blue-500" />
                        <span className="text-blue-500 font-bold">{center.totalBookings}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-gray-900">
                          {center.rating ? `${center.rating} (${center.reviews})` : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Price/Hour</p>
                      <span className="font-bold text-gray-900">${center.pricePerHour}</span>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                      <Clock size={14} />
                      <span className="font-medium">Availability</span>
                    </div>
                    <div className="text-xs text-gray-700">
                      <div>Weekday: <span className="font-semibold">{center.weekdayHours}</span></div>
                      <div>Weekend: <span className="font-semibold">{center.weekendHours}</span></div>
                    </div>
                  </div>

                  {/* Owner */}
                  <p className="text-xs text-gray-500 mb-4">Owner: <span className="font-medium text-gray-700">{center.owner}</span></p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 bg-cyan-500 text-white py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                      <Eye size={16} />
                      View Details
                    </button>
                    {center.status === 'Pending' && (
                      <button className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                        <CheckCircle size={16} />
                        Approve
                      </button>
                    )}
                    {center.status !== 'Pending' && (
                      <>
                        <button className="bg-yellow-500/10 text-yellow-600 py-2 px-3 rounded-lg hover:bg-yellow-500/20 transition-colors">
                          <Flag size={16} />
                        </button>
                        <button className="bg-red-500/10 text-red-600 py-2 px-3 rounded-lg hover:bg-red-500/20 transition-colors">
                          <X size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredCenters.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No futsal centers found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FutsalCenters;