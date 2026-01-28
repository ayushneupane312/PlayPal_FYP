import React, { useState } from 'react';
import PlayerSidebar from './PlayerSidebar';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Check,
  X,
} from 'lucide-react';

const Bookings = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Bookings');

  const bookingsData = [
    {
      id: 1,
      venueName: 'Kathmandu Sports Arena',
      location: 'Thamel, Kathmandu',
      date: '2024-12-22',
      time: '6:00 PM',
      duration: '1 hour',
      players: '8/10 players',
      type: 'Indoor',
      price: 2500,
      status: 'confirmed',
    },
    {
      id: 2,
      venueName: 'Patan Futsal Ground',
      location: 'Lalitpur, Nepal',
      date: '2024-12-23',
      time: '5:30 PM',
      duration: '1 hour',
      players: '6/10 players',
      type: 'Outdoor',
      price: 2000,
      status: 'pending',
    },
    {
      id: 3,
      venueName: 'Lalitpur Sports Complex',
      location: 'Jawalakhel, Lalitpur',
      date: '2024-12-28',
      time: '4:00 PM',
      duration: '1.5 hours',
      players: '10/10 players',
      type: 'Indoor',
      price: 3000,
      status: 'confirmed',
    },
    {
      id: 4,
      venueName: 'Bhaktapur Futsal Hub',
      location: 'Durbar Square, Bhaktapur',
      date: '2024-12-30',
      time: '7:00 PM',
      duration: '1 hour',
      players: '4/10 players',
      type: 'Indoor',
      price: 1800,
      status: 'pending',
    },
  ];

  const confirmedBookings = bookingsData.filter(
    (booking) => booking.status === 'confirmed'
  ).length;
  const pendingBookings = bookingsData.filter(
    (booking) => booking.status === 'pending'
  ).length;
  const totalAmount = bookingsData.reduce(
    (sum, booking) => sum + booking.price,
    0
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />

      {/* Main Content - Dynamic margin based on sidebar state */}
      <div 
        className={`flex-1 p-8 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                My Bookings
              </h1>
              <p className="text-gray-600">Manage your futsal court reservations</p>
            </div>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-emerald-200">
              <Plus className="w-5 h-5" />
              Book New Slot
            </button>
          </div>

          {/* Summary Cards - Moved to Top */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-5xl font-bold text-emerald-600 mb-2">
                {confirmedBookings}
              </p>
              <p className="text-gray-600">Confirmed Bookings</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-5xl font-bold text-amber-600 mb-2">
                {pendingBookings}
              </p>
              <p className="text-gray-600">Pending Confirmation</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-5xl font-bold text-gray-900 mb-2">
                Rs. {totalAmount.toLocaleString()}
              </p>
              <p className="text-gray-600">Total Amount</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-6 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
              >
                <option>All Bookings</option>
                <option>Confirmed</option>
                <option>Pending</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            {bookingsData.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
              >
                {/* Top Section - Booking Details */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {booking.venueName}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          Rs. {booking.price.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">per session</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{booking.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium">
                          {booking.date} at {booking.time}
                        </span>
                      </div>
                      <span>• {booking.duration}</span>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{booking.players}</span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          booking.type === 'Indoor'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {booking.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Section - Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  {booking.status === 'pending' && (
                    <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all">
                      <Check className="w-4 h-4" />
                      Confirm Booking
                    </button>
                  )}
                  <button className="text-red-500 hover:bg-red-50 px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all border border-red-200">
                    <X className="w-4 h-4" />
                    Cancel Booking
                  </button>
                  <button className="text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-lg font-medium transition-all border border-gray-200">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;