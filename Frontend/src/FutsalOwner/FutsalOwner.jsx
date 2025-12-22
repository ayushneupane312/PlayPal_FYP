import React, { useState } from 'react';
import { Calendar, Users, CreditCard, Trophy, Star, Bell, Settings, Menu, TrendingUp, DollarSign, Activity, Plus, RefreshCw, Send } from 'lucide-react';

const FutsalDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [calendarView, setCalendarView] = useState('month');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Sample data
  const stats = [
    { title: 'Bookings today', value: '26', change: '+12% vs yesterday', positive: true },
    { title: 'Revenue (NPR)', value: '84,300', change: '+8% weekly', positive: true },
    { title: 'Occupancy', value: '78%', change: '+5 pts', positive: true },
    { title: 'Upcoming matches', value: '9', change: 'Today', positive: true },
    { title: 'Registered players', value: '1,243', change: '+34 this week', positive: true }
  ];

  const activities = [
    { type: 'Booking confirmed', team: 'Team Thunder', court: 'Court A', time: '6-7 PM', status: 'Booked', color: 'emerald' },
    { type: 'Refund issued', team: 'No-show', time: '11 AM', status: 'Refunded', color: 'blue' },
    { type: 'Review received', rating: '4.5★', comment: 'Great turf quality', status: 'New', color: 'yellow' }
  ];

  const bookings = [
    { day: 'Mon 1', slots: [{ court: 'Court A', time: '7 AM', status: 'booked' }, { court: 'Court B', time: '8 AM', status: 'open' }] },
    { day: 'Tue 2', slots: [{ court: 'Court A', time: '6 PM', status: 'booked' }, { court: 'Maintenance', time: '8 PM', status: 'maintenance' }] },
    { day: 'Wed 3', slots: [{ court: 'Open', time: '5 PM', status: 'open' }] },
    { day: 'Thu 4', slots: [{ court: 'Court B', time: '7 PM', status: 'booked' }] },
    { day: 'Fri 5', slots: [{ court: 'Court A', time: '6 PM', status: 'booked' }, { court: 'Court B', time: '7 PM', status: 'booked' }] },
    { day: 'Sat 6', slots: [{ court: 'Open', time: '10 AM', status: 'open' }] },
    { day: 'Sun 7', slots: [{ court: 'Private', time: '2 PM', status: 'private' }] }
  ];

  const payments = [
    { player: 'Team Thunder', method: 'eSewa', amount: 'NPR 4,200', status: 'Completed' },
    { player: 'Solo • A. Rana', method: 'Stripe', amount: 'NPR 1,800', status: 'Refunded' },
    { player: 'Team Falcons', method: 'Khalti', amount: 'NPR 3,600', status: 'Pending' }
  ];

  const teams = [
    { name: 'Team Thunder', bookings: 14, rating: '4.7★', engagement: 'high' },
    { name: 'Solo • M. Karki', bookings: 12, rating: '4.9★', engagement: 'medium' },
    { name: 'Team Falcons', bookings: 9, rating: '4.6★', engagement: 'medium' }
  ];

  const notifications = [
    { text: 'New booking • Court A • 7 PM', time: '2m ago' },
    { text: 'Payment received • NPR 3,600 • Khalti', time: '12m ago' },
    { text: 'Dispute opened • Team Falcons', time: '1h ago' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      booked: 'bg-red-500',
      open: 'bg-emerald-500',
      maintenance: 'bg-gray-400',
      private: 'bg-purple-500'
    };
    return colors[status] || 'bg-gray-300';
  };

  const Sidebar = () => (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
      <div className="p-4 flex items-center justify-between">
        <div className={`${sidebarOpen ? 'block' : 'hidden'} w-10 h-10 bg-emerald-500 rounded-lg`}></div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-800 rounded">
          <Menu size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {[
          { icon: Activity, label: 'Dashboard Overview', view: 'overview' },
          { icon: Calendar, label: 'Manage Bookings', view: 'bookings' },
          { icon: CreditCard, label: 'Payments & Revenue', view: 'payments' },
          { icon: Users, label: 'Players & Teams', view: 'players' },
          { icon: Trophy, label: 'Tournaments & Events', view: 'tournaments' },
          { icon: Star, label: 'Reviews & Ratings', view: 'reviews' },
          { icon: Bell, label: 'Notifications', view: 'notifications' },
          { icon: Settings, label: 'Account Settings', view: 'settings' }
        ].map((item) => (
          <button
            key={item.view}
            onClick={() => setActiveView(item.view)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
              activeView === item.view ? 'bg-emerald-600' : 'hover:bg-gray-800'
            }`}
          >
            <item.icon size={20} />
            {sidebarOpen && <span className="text-sm">{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );

  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">{stat.title}</div>
            <div className="text-3xl font-bold mb-2">{stat.value}</div>
            <div className={`inline-block px-2 py-1 rounded text-xs ${stat.positive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Trends and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Trends</h3>
            <span className="text-sm text-gray-500">Last 7 days</span>
          </div>
          <div className="h-64 flex items-center justify-center bg-emerald-50 rounded-lg">
            <div className="text-center">
              <TrendingUp size={48} className="mx-auto mb-2 text-emerald-600" />
              <p className="text-gray-600">Revenue & Booking Trends</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-6">
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Calendar size={16} />
              <span className="text-sm">Add Booking</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <DollarSign size={16} />
              <span className="text-sm">Issue Refund</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Send size={16} />
              <span className="text-sm">Send Offer</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Activity</h3>
            <span className="text-sm text-gray-500">Recent</span>
          </div>
          <div className="space-y-4">
            {activities.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{activity.type}</div>
                  <div className="text-xs text-gray-600">
                    {activity.team} {activity.court && `• ${activity.court}`} {activity.time && `• ${activity.time}`}
                    {activity.rating && activity.rating} {activity.comment && `• ${activity.comment}`}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                  activity.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                  activity.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Manage Bookings</h3>
          <div className="flex gap-2">
            <button onClick={() => setCalendarView('month')} className={`px-4 py-2 rounded ${calendarView === 'month' ? 'bg-emerald-500 text-white' : 'bg-gray-100'}`}>Month</button>
            <button onClick={() => setCalendarView('week')} className={`px-4 py-2 rounded ${calendarView === 'week' ? 'bg-emerald-500 text-white' : 'bg-gray-100'}`}>Week</button>
            <button onClick={() => setCalendarView('day')} className={`px-4 py-2 rounded ${calendarView === 'day' ? 'bg-emerald-500 text-white' : 'bg-gray-100'}`}>Day</button>
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-gray-100 rounded">«</button>
            <button className="p-1 hover:bg-gray-100 rounded">‹</button>
            <span className="font-medium px-3">September 2025</span>
            <button className="p-1 hover:bg-gray-100 rounded">›</button>
            <button className="p-1 hover:bg-gray-100 rounded">»</button>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">Add Booking</button>
            <button className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">Block Slot</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {bookings.map((day, idx) => (
            <div key={idx} className="border border-gray-200 rounded p-2 min-h-24">
              <div className="text-xs font-medium text-gray-600 mb-2">{day.day}</div>
              <div className="space-y-1">
                {day.slots.map((slot, sidx) => (
                  <div key={sidx} className={`${getStatusColor(slot.status)} text-white text-xs rounded px-2 py-1`}>
                    <div className="font-medium">{slot.court}</div>
                    <div className="text-xs opacity-90">{slot.time}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PaymentsContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Total earnings</div>
          <div className="text-3xl font-bold">NPR 1,245,600</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Pending payouts</div>
          <div className="text-3xl font-bold">NPR 84,000</div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-lg mb-4">Recent Transactions</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 text-sm font-medium">Player/Team</th>
              <th className="text-left py-2 text-sm font-medium">Method</th>
              <th className="text-left py-2 text-sm font-medium">Amount</th>
              <th className="text-left py-2 text-sm font-medium">Status</th>
              <th className="text-left py-2 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-3">{payment.player}</td>
                <td className="py-3">{payment.method}</td>
                <td className="py-3 font-medium">{payment.amount}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    payment.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                    payment.status === 'Refunded' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {payment.status}
                  </span>
                </td>
                <td className="py-3">
                  <button className="text-emerald-600 hover:underline text-sm">
                    {payment.status === 'Completed' ? 'Receipt' : payment.status === 'Refunded' ? 'Details' : 'Payout'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const PlayersContent = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Players & Teams</h3>
          <span className="text-sm text-gray-500">Engagement</span>
        </div>
        <div className="space-y-4">
          {teams.map((team, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                <div>
                  <div className="font-medium">{team.name}</div>
                  <div className="text-sm text-gray-600">{team.bookings} bookings • {team.rating}</div>
                </div>
              </div>
              <button className="px-4 py-2 border border-emerald-500 text-emerald-600 rounded hover:bg-emerald-50">
                Send Offer
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <h1 className="text-xl font-semibold">Welcome, Everest Futsal!</h1>
              <input
                type="text"
                placeholder="Search bookings, players, payouts..."
                className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Bell size={20} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Settings size={20} />
              </button>
              <div className="w-8 h-8 rounded-full bg-emerald-500"></div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <h2 className="text-2xl font-bold mb-6">Owner Dashboard Overview</h2>
          
          {activeView === 'overview' && <OverviewContent />}
          {activeView === 'payments' && <PaymentsContent />}
          {activeView === 'players' && <PlayersContent />}
          {activeView === 'notifications' && (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-lg mb-4">Notifications</h3>
              <div className="space-y-3">
                {notifications.map((notif, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 border-b">
                    <span className="text-sm">{notif.text}</span>
                    <span className="text-xs text-gray-500">{notif.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FutsalDashboard;