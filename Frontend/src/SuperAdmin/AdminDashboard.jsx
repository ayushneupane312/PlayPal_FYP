import React, { useState } from 'react';
import { DollarSign, Users, Calendar, AlertTriangle, Building2, Scale, Activity, TrendingUp, TrendingDown, Clock, CheckCircle, UserCheck, CreditCard, Shield, Search, Bell } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  

  // Stats data
  const stats = [
    {
      title: 'Total Revenue',
      value: '$124,500',
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
    {
      title: 'Fraud Alerts',
      value: '12',
      subtitle: 'vs last week',
      percentage: '-0.16%',
      trend: 'down',
      icon: AlertTriangle,
      bgColor: 'bg-red-500/10',
      iconColor: 'text-red-500'
    }
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
      title: 'Pending Disputes',
      value: '24',
      percentage: '-8%',
      trend: 'down',
      icon: Scale,
      bgColor: 'bg-orange-500/10',
      iconColor: 'text-orange-500'
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

  const recentActivities = [
    {
      icon: AlertTriangle,
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-500',
      title: 'Suspicious payment detected from user #4521',
      time: '2 min ago'
    },
    {
      icon: Building2,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      title: 'New futsal owner registered: Arena Sports',
      time: '15 min ago'
    },
    {
      icon: CreditCard,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
      title: 'Payment of $250 processed successfully',
      time: '32 min ago'
    },
    {
      icon: UserCheck,
      iconBg: 'bg-cyan-500/10',
      iconColor: 'text-cyan-500',
      title: 'Account verified: john.doe@email.com',
      time: '1 hr ago'
    },
    {
      icon: CheckCircle,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
      title: 'Dispute #892 resolved - Refund issued',
      time: '2 hr ago'
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
            <span className="text-gray-600 text-sm">08:35 AM</span>
          </div>
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
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
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
                  <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
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
                  <span>$10k</span>
                  <span>$7.5k</span>
                  <span>$5k</span>
                  <span>$2.5k</span>
                  <span>$0k</span>
                </div>

                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 w-full flex justify-between text-gray-500 text-xs pt-2">
                  {chartData.map((d, i) => (
                    <span key={i}>{d.month}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Recent Activity</h2>
                  <p className="text-gray-500 text-sm">Real-time platform updates</p>
                </div>
                <button className="text-cyan-500 text-sm font-medium hover:text-cyan-600 transition-colors">
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {recentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                      <div className={`w-10 h-10 ${activity.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className={activity.iconColor} size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-700 text-sm mb-1">{activity.title}</p>
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <Clock size={12} />
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;