import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  CalendarDays,
  CreditCard,
  Trophy,
  Users,
  User,
  Settings,
  HeartPulse,
  Video,
  HelpCircle,
  LogOut,
  CircleDot,
  ChevronLeft,
  ChevronRight,
  LampFloor
} from 'lucide-react';

const Sidebar = ({ onCollapseChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Determine active item based on current route
  const getActiveItem = () => {
    const path = location.pathname;
    if (path === "/" || path === "/Playerdashboard") return "Dashboard";
    if (path.includes("/BookingPage")) return "Bookings";
    if (path.includes("/player/matchmaking")) return "Matchmaking";
    if (path.includes("/SplitPaymentPage")) return "Payments";
    if (path.includes("/teams")) return "Teams";
    if (path.includes("/PlayersTournaments")) return "Tournaments";
    if (path.includes("/HighlightsPage")) return "Highlights";
    if (path.includes("/HealthPage")) return "Health";
    if (path.includes("/PlayerSettings")) return "Settings";
    if (path.includes("/player/profile")) return "Profile";
    if (path.includes("/help")) return "Help";
    return "Dashboard";
  };

  const [activeItem, setActiveItem] = useState(getActiveItem());

  const handleNavigation = (name) => {
    setActiveItem(name);
    
    switch (name) {
      case "Dashboard":
        navigate("/Playerdashboard");
        break;
      case "Bookings":
        navigate("/BookingPage");
        break;
        case "Matchmaking":
        navigate("/player/matchmaking");
        break;
      case "Payments":
        navigate("/SplitPaymentPage");
        break;
      case "Teams":
        navigate("/player/teams");
        break;
      case "Tournaments":
        navigate("/PlayersTournaments");
        break;
      case "Highlights":
        navigate("/HighlightsPage");
        break;
      case "Health":
        navigate("/HealthPage");
        break;
      case "Settings":
        navigate("/PlayerSettings");
        break;
      case "Help":
        navigate("/help");
        break;
      case "Profile":
        navigate("/player/profile");
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const toggleCollapse = () => {
    const newCollapseState = !isCollapsed;
    setIsCollapsed(newCollapseState);
    if (onCollapseChange) {
      onCollapseChange(newCollapseState);
    }
  };

  const handleLogoClick = () => {
    navigate("/Playerdashboard");
    setActiveItem("Dashboard");
  };

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { id: 'bookings', name: 'Bookings', icon: <CalendarDays className="w-5 h-5" />},
    { id: 'player/matchmaking', name: 'Matchmaking', icon: <CalendarDays className="w-5 h-5" />},
    { id: 'payments', name: 'Payments', icon: <CreditCard className="w-5 h-5" />,},
    { id: 'teams', name: 'Teams', icon: <Users className="w-5 h-5" /> },
    { id: 'tournaments', name: 'Tournaments', icon: <Trophy className="w-5 h-5" /> },
    { id: 'highlights', name: 'Highlights', icon: <Video className="w-5 h-5" /> },
    { id: 'health', name: 'Health', icon: <HeartPulse className="w-5 h-5" /> },
    { id: 'profile', name: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  const bottomNavItems = [
    { id: 'settings', name: 'Settings', icon: <Settings className="w-5 h-5" /> },
    { id: 'help', name: 'Help', icon: <HelpCircle className="w-5 h-5" /> },
  ];

  return (
    <div 
      className={`bg-white shadow-lg fixed h-full z-10 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full relative">
        {/* Collapse Button */}
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-20 bg-white border-2 border-gray-200 rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:bg-emerald-50 hover:border-emerald-300 z-50"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <button
            onClick={handleLogoClick}
            className={`flex items-center ${
              isCollapsed ? 'justify-center' : 'space-x-3'
            } hover:opacity-80 transition-opacity w-full`}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <CircleDot className="text-white w-6 h-6" />
            </div>
            {!isCollapsed && (
              <h1 className="text-lg font-bold text-gray-800 whitespace-nowrap">
                PlayPal
              </h1>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navigationItems.map((item) => (
              <li key={item.id} className="relative group">
                <button
                  onClick={() => handleNavigation(item.name)}
                  className={`flex items-center ${
                    isCollapsed ? 'justify-center' : 'justify-between'
                  } w-full p-3 rounded-xl transition-all ${
                    activeItem === item.name
                      ? 'bg-emerald-50 text-emerald-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                    <span
                      className={`${
                        activeItem === item.name ? 'text-emerald-600' : 'text-gray-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    {!isCollapsed && <span className="text-sm">{item.name}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className="bg-emerald-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                  {isCollapsed && item.badge && (
                    <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
                
                {/* Tooltip on hover when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.name}
                    {item.badge && (
                      <span className="ml-2 bg-emerald-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Nav */}
        <div className="p-4 border-t border-gray-100">
          <ul className="space-y-1">
            {bottomNavItems.map((item) => (
              <li key={item.id} className="relative group">
                <button
                  onClick={() => handleNavigation(item.name)}
                  className={`flex items-center ${
                    isCollapsed ? 'justify-center' : ''
                  } w-full p-3 rounded-xl transition-all ${
                    activeItem === item.name
                      ? 'bg-emerald-50 text-emerald-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span
                    className={`${
                      activeItem === item.name ? 'text-emerald-600' : 'text-gray-400'
                    } ${isCollapsed ? '' : 'mr-3'}`}
                  >
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="text-sm">{item.name}</span>}
                </button>
                
                {/* Tooltip on hover when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </li>
            ))}
            
            {/* Logout Button */}
            <li className="relative group">
              <button
                onClick={handleLogout}
                className={`flex items-center ${
                  isCollapsed ? 'justify-center' : ''
                } w-full p-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all`}
              >
                <span className={`text-gray-400 hover:text-red-600 ${isCollapsed ? '' : 'mr-3'}`}>
                  <LogOut className="w-5 h-5" />
                </span>
                {!isCollapsed && <span className="text-sm">Logout</span>}
              </button>
              
              {/* Tooltip on hover when collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  Logout
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;