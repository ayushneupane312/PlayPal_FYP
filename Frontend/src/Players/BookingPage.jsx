import React, { useState } from 'react';
import Sidebar from './PlayerSidebar';

const Bookings = () => {
  const [activeNav, setActiveNav] = useState('bookings');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />

      {/* Page Content */}
      <div className="flex-1 lg:ml-64 p-6">
        <h1 className="text-2xl font-bold text-gray-800">Bookings</h1>
        <p className="text-gray-500 mt-2">
          Manage your futsal bookings here
        </p>

        {/* Booking content goes here */}
      </div>
    </div>
  );
};

export default Bookings;
