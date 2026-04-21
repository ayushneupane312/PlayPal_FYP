import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  Home, 
  Shield, 
  Building2, 
  AlertTriangle, 
  BarChart3, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  CircleDot,
  LogOut
} from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModel';
import { useConfirmation } from '../hooks/useConfirmation';
import { showToast } from '../FutsalOwner/components/Toast';

const AdminSidebar = ({ onCollapseChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const { isOpen, isLoading, config, showConfirmation, hideConfirmation, handleConfirm } = useConfirmation();
  
  // Determine active item based on current route
  const getActiveItem = () => {
    const path = location.pathname;
    if (path === "/" || path === "/admindashboard") return "Dashboard";
    if (path.includes("/admin/user-management")) return "User Management";
    if (path.includes("/admin/futsal-centers") || path.startsWith("/admin/venues")) return "Futsal Centers";
    if (path.includes("/admin/futsalownerapproval")) return "Futsal Approval";
    if (path.includes("/admin/analytics")) return "Analytics";
    if (path.includes("/admin/settings")) return "Settings";
    return "Dashboard";
  };

  const [activeItem, setActiveItem] = useState(getActiveItem());

  const handleNavigation = (name) => {
    setActiveItem(name);
    
    switch (name) {
      case "Dashboard":
        navigate("/admindashboard");
        break;
      case "User Management":
        navigate("/admin/user-management");
        break;
      case "Futsal Centers":
        navigate("/admin/futsal-centers");
        break;
      case "Futsal Approval":
        navigate("/admin/futsalownerapproval");
        break;
      case "Analytics":
        navigate("/admin/analytics");
        break;
      case "Settings":
        navigate("/admin/settings");
        break;
      default:
        break;
    }
  };

  // ✅ Updated logout with confirmation
  const handleLogout = () => {
    showConfirmation({
      title: 'Logout Confirmation',
      message: 'Are you sure you want to logout? You will need to login again to access the admin dashboard.',
      confirmText: 'Yes, Logout',
      cancelText: 'Stay Logged In',
      type: 'warning',
      onConfirm: async () => {
        try {
          // Add your logout logic here
          // Example: await authStore.logout();
          
          showToast.success('Logged out successfully!');
          navigate('/login');
        } catch (error) {
          showToast.error('Failed to logout');
          console.error('Logout error:', error);
        }
      }
    });
  };

  const toggleCollapse = () => {
    const newCollapseState = !isCollapsed;
    setIsCollapsed(newCollapseState);
    if (onCollapseChange) {
      onCollapseChange(newCollapseState);
    }
  };

  const handleLogoClick = () => {
    navigate("/admindashboard");
    setActiveItem("Dashboard");
  };

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { id: 'user-management', name: 'User Management', icon: <Users className="w-5 h-5" /> },
    { id: 'futsal-centers', name: 'Futsal Centers', icon: <Building2 className="w-5 h-5" /> },
    { id: 'futsal-approval', name: 'Futsal Approval', icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'analytics', name: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  const bottomNavItems = [
    { id: 'settings', name: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
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
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <CircleDot className="text-white w-6 h-6" />
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="text-lg font-bold text-gray-800 whitespace-nowrap">
                    PlayPal
                  </h1>
                  <p className="text-xs text-emerald-600 font-medium">Super Admin</p>
                </div>
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
                  </button>
                  
                  {/* Tooltip on hover when collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                      {item.name}
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

          {/* Admin Profile - At Bottom */}
          <div className="p-4 border-t border-gray-100">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                SA
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-gray-800 text-sm font-medium truncate">Super Admin</div>
                  <div className="text-gray-500 text-xs truncate">admin@playpal.com</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Confirmation Modal */}
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
    </>
  );
};

export default AdminSidebar;