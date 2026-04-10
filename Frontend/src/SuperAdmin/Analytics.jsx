import React, { useState } from 'react';
import { Search, Bell, TrendingUp, Calendar, Users, Clock, DollarSign } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from '../components/AdminHeader'
const Analytics = () => {
  const [collapsed, setCollapsed] = useState(false);

  const stats = [
    {
      title: 'Total Revenue (YTD)',
      value: 'NPR 822,000',
      icon: TrendingUp,
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      trend: '+24%',
      trendPositive: true
    },
    {
      title: 'Total Bookings',
      value: '15,130',
      icon: Calendar,
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-500',
      trend: '+18%',
      trendPositive: true
    },
    {
      title: 'Active Users',
      value: '8,432',
      icon: Users,
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      trend: '+12%',
      trendPositive: true
    },
    {
      title: 'Avg. Session',
      value: '24 min',
      icon: Clock,
      bgColor: 'bg-yellow-500/10',
      iconColor: 'text-yellow-500',
      trend: '+8%',
      trendPositive: true
    }
  ];

  const dailyActiveUsers = [
    { day: 'Mon', users: 2800 },
    { day: 'Tue', users: 3100 },
    { day: 'Wed', users: 3400 },
    { day: 'Thu', users: 3600 },
    { day: 'Fri', users: 4200 },
    { day: 'Sat', users: 4800 },
    { day: 'Sun', users: 5100 }
  ];

  const bookingDistribution = [
    { label: 'Regular', value: 55, color: '#06b6d4' },
    { label: 'Tournament', value: 25, color: '#10b981' },
    { label: 'Training', value: 15, color: '#8b5cf6' },
    { label: 'Events', value: 5, color: '#f59e0b' }
  ];

  const peakHours = [
    { hour: '6AM', bookings: 120 },
    { hour: '9AM', bookings: 280 },
    { hour: '12PM', bookings: 450 },
    { hour: '3PM', bookings: 520 },
    { hour: '6PM', bookings: 680 },
    { hour: '9PM', bookings: 590 },
    { hour: '12AM', bookings: 180 }
  ];

  const topFutsals = [
    { rank: 1, name: 'Arena Sports', revenue: 32500, bookings: 456, trend: '+12%' },
    { rank: 2, name: 'Victory Center', revenue: 28900, bookings: 398, trend: '+8%' },
    { rank: 3, name: 'Elite Hub', revenue: 25600, bookings: 367, trend: '+15%' },
    { rank: 4, name: 'Champion Arena', revenue: 22100, bookings: 312, trend: '+5%' },
    { rank: 5, name: 'Metro Zone', revenue: 19800, bookings: 289, trend: '+10%' }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 45000, bookings: 980 },
    { month: 'Feb', revenue: 48000, bookings: 1050 },
    { month: 'Mar', revenue: 52000, bookings: 1120 },
    { month: 'Apr', revenue: 55000, bookings: 1200 },
    { month: 'May', revenue: 58000, bookings: 1280 },
    { month: 'Jun', revenue: 62000, bookings: 1350 },
    { month: 'Jul', revenue: 68000, bookings: 1480 },
    { month: 'Aug', revenue: 72000, bookings: 1560 },
    { month: 'Sep', revenue: 76000, bookings: 1650 },
    { month: 'Oct', revenue: 82000, bookings: 1780 },
    { month: 'Nov', revenue: 88000, bookings: 1900 },
    { month: 'Dec', revenue: 95000, bookings: 2050 }
  ];

  const maxUsers = Math.max(...dailyActiveUsers.map(d => d.users));
  const maxBookings = Math.max(...peakHours.map(h => h.bookings));
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue));

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={`flex-1 ${collapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        {/* Header */}
          <AdminHeader
          title="Perform Analytics"
          subtitle="Comprehensive user insights and trends"
     
          notificationCount={3}
          showNotification={true}
          showTime={true}
        />
       

        {/* Main Content */}
        <div className="p-8">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={stat.iconColor} size={24} />
                    </div>
                    <span className={`text-sm font-semibold ${stat.trendPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                </div>
              );
            })}
          </div>

          {/* Revenue & Bookings Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Revenue & Bookings Trend</h2>
                <p className="text-gray-500 text-sm">Monthly performance over the year</p>
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

            <div className="relative h-64">
              <svg className="w-full h-full" viewBox="0 0 1200 250" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="0" y1="50" x2="1200" y2="50" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="100" x2="1200" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="150" x2="1200" y2="150" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="200" x2="1200" y2="200" stroke="#e5e7eb" strokeWidth="1" />

                {/* Revenue area */}
                <defs>
                  <linearGradient id="revenueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={`M 0,${250 - (revenueData[0].revenue / maxRevenue * 200)} ${revenueData.map((d, i) => 
                    `L ${(i * 1200) / (revenueData.length - 1)},${250 - (d.revenue / maxRevenue * 200)}`
                  ).join(' ')} L 1200,250 L 0,250 Z`}
                  fill="url(#revenueGrad)"
                />
                <path
                  d={`M 0,${250 - (revenueData[0].revenue / maxRevenue * 200)} ${revenueData.map((d, i) => 
                    `L ${(i * 1200) / (revenueData.length - 1)},${250 - (d.revenue / maxRevenue * 200)}`
                  ).join(' ')}`}
                  fill="none"
                  stroke="#06b6d4"
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
                {revenueData.map((d, i) => (
                  <span key={i}>{d.month}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Active Users & Booking Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Daily Active Users */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Daily Active Users</h2>
                <p className="text-gray-500 text-sm">User activity by day of week</p>
              </div>
              
              <div className="h-64 flex items-end justify-between gap-4">
                {dailyActiveUsers.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-cyan-500 rounded-t-lg transition-all hover:bg-cyan-600" 
                         style={{ height: `${(data.users / maxUsers) * 100}%` }}>
                    </div>
                    <span className="text-gray-600 text-sm font-medium">{data.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Booking Distribution</h2>
                <p className="text-gray-500 text-sm">By booking type</p>
              </div>

              <div className="flex items-center justify-center gap-8">
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {bookingDistribution.map((item, index) => {
                      const total = bookingDistribution.reduce((sum, i) => sum + i.value, 0);
                      const startAngle = bookingDistribution.slice(0, index).reduce((sum, i) => sum + (i.value / total * 360), 0);
                      const angle = (item.value / total * 360);
                      const largeArcFlag = angle > 180 ? 1 : 0;
                      const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                      const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                      const x2 = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                      const y2 = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180);
                      
                      return (
                        <path
                          key={index}
                          d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                          fill={item.color}
                          className="hover:opacity-80 transition-opacity"
                        />
                      );
                    })}
                    <circle cx="50" cy="50" r="20" fill="white" />
                  </svg>
                </div>

                <div className="space-y-3">
                  {bookingDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between gap-8">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-gray-700 text-sm">{item.label}</span>
                      </div>
                      <span className="text-gray-900 font-bold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Peak Hours & Top Futsals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Peak Booking Hours */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Peak Booking Hours</h2>
                <p className="text-gray-500 text-sm">Booking heatmap by hour</p>
              </div>

              <div className="space-y-3">
                {peakHours.map((data, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-gray-600 text-sm font-medium w-16">{data.hour}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full flex items-center justify-end pr-3 transition-all"
                        style={{ width: `${(data.bookings / maxBookings) * 100}%` }}
                      >
                        <span className="text-white text-xs font-bold">{data.bookings}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Earning Futsals */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Top Earning Futsals</h2>
                <p className="text-gray-500 text-sm">Top venues by revenue (monthly)</p>
              </div>

              <div className="space-y-4">
                {topFutsals.map((futsal) => (
                  <div key={futsal.rank} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {futsal.rank}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900 font-semibold mb-1">{futsal.name}</h4>
                      <p className="text-gray-500 text-xs">{futsal.bookings} bookings</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-600 font-bold text-lg">NPR {futsal.revenue.toLocaleString()}</p>
                      <p className="text-green-500 text-xs">{futsal.trend}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;              //Completed Analytics Page 