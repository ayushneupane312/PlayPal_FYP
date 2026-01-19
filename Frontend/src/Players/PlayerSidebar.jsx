import React from 'react';
import {
  Home,
  CalendarDays,
  CreditCard,
  Trophy,
  Users,
  Settings,
  HeartPulse
} from 'lucide-react';

const Sidebar = ({ activeNav, setActiveNav }) => {
  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <Home /> },
    { id: 'bookings', name: 'Bookings', icon: <CalendarDays />, badge: 3 },
    { id: 'payments', name: 'Payments', icon: <CreditCard />, badge: 2 },
    { id: 'teams', name: 'Teams', icon: <Users /> },
    { id: 'tournaments', name: 'Tournaments', icon: <Trophy /> },
    { id: 'highlights', name: 'Highlights', icon: <Video /> },
    { id: 'health', name: 'Health', icon: <HeartPulse /> },
  ];

  const bottomNavItems = [
    { id: 'settings', name: 'Settings', icon: <Settings /> },
    { id: 'help', name: 'Help', icon: <HelpCircle /> },
    { id: 'logout', name: 'Logout', icon: <LogOut /> },
  ];

  return (
    <div className="w-64 bg-white shadow-lg rounded-r-xl fixed h-full z-10">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <SoccerBall className="text-white text-xl" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">
            PlayPal<span className="text-emerald-600"> – Futsal Manager</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`flex items-center justify-between w-full p-3 rounded-xl transition-all ${
                activeNav === item.name
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveNav(item.name)}
            >
              <div className="flex items-center space-x-3">
                <span className={`text-lg ${activeNav === item.name ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="bg-emerald-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Nav */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100">
          <nav className="space-y-2">
            {bottomNavItems.map((item) => (
              <button
                key={item.id}
                className="flex items-center w-full p-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-all"
              >
                <span className="text-lg text-gray-400 mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
