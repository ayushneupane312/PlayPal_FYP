import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Home, Shield, Building2, AlertTriangle, BarChart3, Settings, ChevronLeft } from 'lucide-react';

const AdminSidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active item based on current route
  const getActiveItem = () => {
    const path = location.pathname;
    if (path === "/" || path === "/admindashboard") return "dashboard";
    if (path.includes("/admin/user-management")) return "user-management";
    if (path.includes("/admin/futsal-centers")) return "futsal-centers";
    if (path.includes("/admin/fraud-detection")) return "fraud-detection";
    if (path.includes("/admin/disputes")) return "disputes";
    if (path.includes("/admin/analytics")) return "analytics";
    if (path.includes("/admin/settings")) return "settings";
    return "dashboard";
  };

  const [activeItem, setActiveItem] = useState(getActiveItem());

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'user-management', icon: Users, label: 'User Management' },
    { id: 'futsal-centers', icon: Building2, label: 'Futsal Centers' },
    { id: 'fraud-detection', icon: AlertTriangle, label: 'Fraud Detection' },
    { id: 'disputes', icon: Shield, label: 'Disputes' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleNavigation = (id) => {
    setActiveItem(id);
    
    switch (id) {
      case "dashboard":
        navigate("/admindashboard");
        break;
      case "user-management":
        navigate("/admin/user-management");
        break;
      case "futsal-centers":
        navigate("/admin/futsal-centers");
        break;
      case "fraud-detection":
        navigate("/admin/fraud-detection");
        break;
      case "disputes":
        navigate("/admin/disputes");
        break;
      case "analytics":
        navigate("/admin/analytics");
        break;
      case "settings":
        navigate("/admin/settings");
        break;
      default:
        break;
    }
  };

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} bg-slate-900 h-screen fixed left-0 top-0 transition-all duration-300 flex flex-col`}>
      {/* Logo Section */}
      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        {!collapsed && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <span className="text-white font-bold text-xl">PlayPal</span>
            </div>
            <span className="text-cyan-400 text-xs ml-10">Super Admin</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg">⚡</span>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-6 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-400' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-4 border-t border-slate-800 flex items-center justify-center hover:bg-slate-800 transition-colors"
      >
        <ChevronLeft 
          size={20} 
          className={`text-slate-400 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} 
        />
        {!collapsed && <span className="text-slate-400 text-sm ml-2">Collapse</span>}
      </button>

      {/* Admin Profile */}
      <div className="p-4 border-t border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
          SA
        </div>
        {!collapsed && (
          <div className="flex-1">
            <div className="text-white text-sm font-medium">Super Admin</div>
            <div className="text-slate-400 text-xs">admin@playpal.com</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;