import React, { useState } from 'react';
import { Search, Calendar, Bell, User, CreditCard, BarChart3, Users, Trophy, Settings, Upload, MapPin, ChevronRight } from 'lucide-react';

const FutsalCenter = () => {
  const [amenities, setAmenities] = useState(['Parking', 'Locker', 'Cafeteria', 'Showers', 'First Aid']);
  const [visibility, setVisibility] = useState('Public');
  const [listingVisibility, setListingVisibility] = useState('Private');

  const toggleAmenity = (amenity) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter(a => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
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
            <span>Dashboard Overview</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-teal-600 rounded-lg text-sm">
            <MapPin className="w-4 h-4" />
            <span>Manage Futsal Centers</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 rounded-lg text-sm">
            <Calendar className="w-4 h-4" />
            <span>Bookings Management</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 rounded-lg text-sm">
            <Users className="w-4 h-4" />
            <span>User Management</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 rounded-lg text-sm">
            <CreditCard className="w-4 h-4" />
            <span>Payments & Revenue</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 rounded-lg text-sm">
            <Trophy className="w-4 h-4" />
            <span>Tournaments & Events</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 rounded-lg text-sm">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 rounded-lg text-sm">
            <Settings className="w-4 h-4" />
            <span>System Settings</span>
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
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users, centers, bookings..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <span>Manage Futsal Centers</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Add New Center</span>
          </div>

          {/* Title and Actions */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Add New Futsal Center</h1>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                Save Draft
              </button>
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium">
                Discard
              </button>
              <button className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm font-medium">
                Create & Publish
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Center Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Center Details</h2>
                  <span className="text-sm text-gray-500">Step 1</span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Center name</label>
                      <input
                        type="text"
                        placeholder="Enter center name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Owner full name</label>
                      <input
                        type="text"
                        placeholder="Owner legal name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Contact phone</label>
                      <input
                        type="text"
                        placeholder="+977 __ ___"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Contact email</label>
                      <input
                        type="email"
                        placeholder="name@domain.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      placeholder="Street, Area"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">City</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option>Select / type</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Operating hours</label>
                      <input
                        type="text"
                        placeholder="06:00 - 22:00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Courts</label>
                      <input
                        type="text"
                        placeholder="e.g., 2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Surface</label>
                      <input
                        type="text"
                        placeholder="Turf / Wooden / Hybrid"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Amenities</label>
                    <div className="flex flex-wrap gap-2">
                      {['Parking', 'Locker', 'Cafeteria', 'Showers', 'First Aid'].map((amenity) => (
                        <button
                          key={amenity}
                          onClick={() => toggleAmenity(amenity)}
                          className={`px-3 py-1.5 text-sm rounded-lg border ${
                            amenities.includes(amenity)
                              ? 'bg-teal-50 border-teal-500 text-teal-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {amenity}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Slots */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Pricing & Slots</h2>
                  <span className="text-sm text-gray-500">Step 2</span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Base price/hr</label>
                      <input
                        type="text"
                        placeholder="NPR 1,200"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Peak price/hr</label>
                      <input
                        type="text"
                        placeholder="NPR 1,800"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Slot length</label>
                      <input
                        type="text"
                        placeholder="60 min"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Daily capacity</label>
                      <input
                        type="text"
                        placeholder="24 slots"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm text-gray-700">Utilization forecast</label>
                      <span className="text-xs text-gray-500">This week</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-teal-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Verification */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Verification</h3>
                  <span className="text-sm text-gray-500">Step 3</span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Owner ID</label>
                      <button className="w-full px-3 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 flex flex-col items-center justify-center text-sm text-gray-500">
                        <Upload className="w-5 h-5 mb-1" />
                        Upload ID
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Business license</label>
                      <button className="w-full px-3 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 flex flex-col items-center justify-center text-sm text-gray-500">
                        <Upload className="w-5 h-5 mb-1" />
                        Upload license
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">Owner ID</span>
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">Missing</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">Business license</span>
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">Missing</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                  <span className="text-sm text-gray-500">Step 4</span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Latitude</label>
                      <input
                        type="text"
                        placeholder="27.68"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Longitude</label>
                      <input
                        type="text"
                        placeholder="85.31"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-teal-100 to-green-100 relative">
                      <div className="absolute inset-0 opacity-20">
                        <svg className="w-full h-full">
                          <line x1="0" y1="0" x2="100%" y2="100%" stroke="gray" strokeWidth="1" />
                          <line x1="100%" y1="0" x2="0" y2="100%" stroke="gray" strokeWidth="1" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Public visibility</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setVisibility('Private')}
                        className={`flex-1 px-3 py-2 text-sm rounded-lg border ${
                          visibility === 'Private'
                            ? 'bg-teal-50 border-teal-500 text-teal-700'
                            : 'bg-white border-gray-300 text-gray-700'
                        }`}
                      >
                        Private
                      </button>
                      <button
                        onClick={() => setVisibility('Public')}
                        className={`flex-1 px-3 py-2 text-sm rounded-lg border ${
                          visibility === 'Public'
                            ? 'bg-teal-50 border-teal-500 text-teal-700'
                            : 'bg-white border-gray-300 text-gray-700'
                        }`}
                      >
                        Public
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payouts & Preview */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Payouts & Preview</h3>
                  <span className="text-sm text-gray-500">Step 5</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Payout account</label>
                    <input
                      type="text"
                      placeholder="Link Stripe / eSewa / Khalti"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">Listing preview</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">Visibility</span>
                      <span className="text-xs text-gray-900 bg-amber-400 px-2 py-1 rounded font-medium">Private</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">KYC</span>
                      <span className="text-xs text-gray-600">Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
              <span className="text-sm text-gray-700">Complete verification and link payouts to publish the center.</span>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white text-sm font-medium">
                Save Draft
              </button>
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium">
                Discard
              </button>
              <button className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm font-medium">
                Create & Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FutsalCenter;