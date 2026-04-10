import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Users, Calendar, AlertTriangle, Building2, Scale, Activity, TrendingUp, TrendingDown, Clock, CheckCircle, UserCheck, CreditCard, Shield, Loader2, Bell } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import SearchAndNotificationBar from '../components/SearchAndNotificationBar';
import notificationService from '../store/notificationService';

function formatNotificationTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

const typeToIcon = {
  admin_alert: AlertTriangle,
  booking_created: Calendar,
  booking_status: CheckCircle,
  system: Bell,
  team_invite: Users,
  team_join_request: UserCheck,
  team_join_result: CheckCircle,
  match_found: Activity,
  default: Bell
};

const typeToStyle = {
  admin_alert: { bg: 'bg-red-500/10', color: 'text-red-500' },
  booking_created: { bg: 'bg-blue-500/10', color: 'text-blue-500' },
  booking_status: { bg: 'bg-green-500/10', color: 'text-green-500' },
  system: { bg: 'bg-gray-500/10', color: 'text-gray-500' },
  default: { bg: 'bg-cyan-500/10', color: 'text-cyan-500' }
};

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setNotificationsLoading(true);
      const res = await notificationService.getNotifications();
      setNotifications(res?.data ?? []);
    } catch (_) {
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Stats data
  const stats = [
    {
      title: 'Total Revenue',
      value: 'NPR 124,500',
      subtitle: 'vs last month',
      percentage: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-500'
    },
    {
      title: 'Active Players',
      value: '8,432',
      subtitle: 'New this month',
      percentage: '+8.2%',
      trend: 'up',
      icon: Users,
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-500'
    },
    {
      title: 'Active Bookings',
      value: '1,256',
      subtitle: 'vs last week',
      percentage: '-2.4%',
      trend: 'down',
      icon: Calendar,
      bgColor: 'bg-yellow-500/10',
      iconColor: 'text-yellow-500'
    },

  ];

  const secondaryStats = [
    {
      title: 'Futsal Centers',
      value: '156',
      percentage: '+5%',
      trend: 'up',
      icon: Building2,
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-500'
    },

    {
      title: 'Daily Active Users',
      value: '2,847',
      percentage: '+18%',
      trend: 'up',
      icon: Activity,
      bgColor: 'bg-cyan-500/10',
      iconColor: 'text-cyan-500'
    }
  ];


  // Generate chart data points
  const generateChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => ({
      month,
      revenue: 2500 + Math.random() * 8000,
      bookings: 500 + Math.random() * 2500
    }));
  };

  const chartData = generateChartData();

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar onCollapseChange={setIsSidebarCollapsed} />
      
      <div 
      className={`flex-1 p-8 transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}
      style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
    >
        {/* Search & Notification Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <SearchAndNotificationBar
            searchPlaceholder="Search anything..."
            showSearch={true}
            showTime={true}
          />
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
            <p className="text-gray-500">Welcome back, Super Admin</p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={stat.iconColor} size={24} />
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      stat.trend === 'up' 
                        ? 'bg-green-500/10 text-green-600' 
                        : 'bg-red-500/10 text-red-600'
                    }`}>
                      {stat.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {stat.percentage}
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-gray-400 text-xs">{stat.subtitle}</p>
                </div>
              );
            })}
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {secondaryStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={stat.iconColor} size={24} />
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      stat.trend === 'up' 
                        ? 'bg-green-500/10 text-green-600' 
                        : 'bg-red-500/10 text-red-600'
                    }`}>
                      {stat.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {stat.percentage}
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                </div>
              );
            })}
          </div>

          {/* Revenue Chart and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Overview Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Revenue Overview</h2>
                  <p className="text-gray-500 text-sm">Monthly revenue and booking trends</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                    <span className="text-gray-600 text-sm">Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 text-sm">Bookings</span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="relative h-64">
                <svg className="w-full h-full" viewBox="0 0 800 250" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="50" x2="800" y2="50" stroke="#e5e7eb" strokeWidth="1" />
                  <line x1="0" y1="100" x2="800" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                  <line x1="0" y1="150" x2="800" y2="150" stroke="#e5e7eb" strokeWidth="1" />
                  <line x1="0" y1="200" x2="800" y2="200" stroke="#e5e7eb" strokeWidth="1" />

                  {/* Revenue area chart (cyan) */}
                  <defs>
                    <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M 0,${250 - (chartData[0].revenue / 100)} ${chartData.map((d, i) => 
                      `L ${(i * 800) / (chartData.length - 1)},${250 - (d.revenue / 100)}`
                    ).join(' ')} L 800,250 L 0,250 Z`}
                    fill="url(#revenueGradient)"
                  />
                  <path
                    d={`M 0,${250 - (chartData[0].revenue / 100)} ${chartData.map((d, i) => 
                      `L ${(i * 800) / (chartData.length - 1)},${250 - (d.revenue / 100)}`
                    ).join(' ')}`}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="3"
                  />

                  {/* Bookings line (green) */}
                  <path
                    d={`M 0,${250 - (chartData[0].bookings / 10)} ${chartData.map((d, i) => 
                      `L ${(i * 800) / (chartData.length - 1)},${250 - (d.bookings / 10)}`
                    ).join(' ')}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                  />
                </svg>

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-gray-500 text-xs pr-2">
                  <span>NPR 100k</span>
                  <span>NPR 75k</span>
                  <span>NPR 50k</span>
                  <span>NPR 25k</span>
                  <span>NPR 0</span>
                </div>

                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 w-full flex justify-between text-gray-500 text-xs pt-2">
                  {chartData.map((d, i) => (
                    <span key={i}>{d.month}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Notifications</h2>
                  <p className="text-gray-500 text-sm">System updates and alerts</p>
                </div>
                <button
                  onClick={fetchNotifications}
                  className="text-cyan-500 text-sm font-medium hover:text-cyan-600 transition-colors"
                >
                  Refresh
                </button>
              </div>

              <div className="space-y-4">
                {notificationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-gray-500 text-sm">
                    No notifications yet. Updates will appear here.
                  </div>
                ) : (
                  notifications.slice(0, 8).map((notif) => {
                    const Icon = typeToIcon[notif.type] || typeToIcon.default;
                    const style = typeToStyle[notif.type] || typeToStyle.default;
                    return (
                      <div
                        key={notif._id}
                        className={`flex items-start gap-3 pb-4 border-b border-gray-200 last:border-0 last:pb-0 ${!notif.isRead ? 'bg-cyan-50/50 -mx-2 px-2 rounded-lg' : ''}`}
                      >
                        <div className={`w-10 h-10 ${style.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className={style.color} size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-medium text-sm mb-0.5">{notif.title}</p>
                          <p className="text-gray-600 text-sm mb-1 line-clamp-2">{notif.message}</p>
                          <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <Clock size={12} />
                            <span>{formatNotificationTime(notif.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;