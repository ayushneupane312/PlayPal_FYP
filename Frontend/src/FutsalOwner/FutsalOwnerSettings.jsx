import React, { useState } from 'react';
import { Calendar, DollarSign, Users, TrendingUp, Clock, Trophy, Bell, Search, Settings, LayoutDashboard, MapPin, CreditCard, BarChart3, Menu, X, Image as ImageIcon, Phone, Mail, Upload, User, Check, Filter, Edit, Eye, Send, ExternalLink, Camera, Lock, Shield } from 'lucide-react';

export default function FutsalApp() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [courts, setCourts] = useState([
    {
      id: 1,
      name: 'Court 1 - Premier',
      type: 'Indoor',
      size: '40m x 20m',
      price: 2500,
      peakPrice: 3500,
      status: 'active',
      amenities: ['LED Lighting', 'AC', 'Scoreboard']
    },
    {
      id: 2,
      name: 'Court 2 - Standard',
      type: 'Indoor',
      size: '40m x 20m',
      price: 2000,
      peakPrice: 3000,
      status: 'active',
      amenities: ['LED Lighting', 'Fans']
    },
    {
      id: 3,
      name: 'Court 3 - Outdoor',
      type: 'Outdoor',
      size: '42m x 22m',
      price: 1500,
      peakPrice: 2500,
      status: 'maintenance',
      amenities: ['Floodlights', 'Turf']
    },
    {
      id: 4,
      name: 'Court 4 - Training',
      type: 'Indoor',
      size: '30m x 15m',
      price: 1200,
      peakPrice: 1800,
      status: 'active',
      amenities: ['Basic Lighting']
    }
  ]);
  
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [enableAllSlots, setEnableAllSlots] = useState(true);
  const [peakHourSlots, setPeakHourSlots] = useState(['17:00', '18:00', '19:00', '20:00']);
  const [maintenanceStart, setMaintenanceStart] = useState('');
  const [maintenanceEnd, setMaintenanceEnd] = useState('');
  
  const [bookings, setBookings] = useState([
    {
      id: 1,
      team: 'Team Alpha',
      bookingId: 'BK001',
      court: 'Court 1',
      date: 'Today',
      time: '6:00 PM - 7:00 PM',
      contact: 'John Doe',
      phone: '+977-9841234567',
      price: 2500,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      initial: 'T'
    },
    {
      id: 2,
      team: 'Striker FC',
      bookingId: 'BK002',
      court: 'Court 2',
      date: 'Today',
      time: '7:00 PM - 8:00 PM',
      contact: 'Mike Smith',
      phone: '+977-9851234567',
      price: 2500,
      status: 'Pending',
      paymentStatus: 'Unpaid',
      initial: 'S'
    },
    {
      id: 3,
      team: 'Goal Getters',
      bookingId: 'BK003',
      court: 'Court 1',
      date: 'Tomorrow',
      time: '5:00 PM - 6:00 PM',
      contact: 'Sarah Johnson',
      phone: '+977-9861234567',
      price: 2500,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      initial: 'G'
    },
    {
      id: 4,
      team: 'United FC',
      bookingId: 'BK004',
      court: 'Court 2',
      date: 'Tomorrow',
      time: '8:00 PM - 9:00 PM',
      contact: 'David Brown',
      phone: '+977-9871234567',
      price: 2500,
      status: 'Pending',
      paymentStatus: 'Unpaid',
      initial: 'U'
    },
    {
      id: 5,
      team: 'Footie Kings',
      bookingId: 'BK005',
      court: 'Court 1',
      date: 'Dec 29',
      time: '6:00 PM - 7:00 PM',
      contact: 'James Wilson',
      phone: '+977-9881234567',
      price: 2500,
      status: 'Cancelled',
      paymentStatus: 'Failed',
      initial: 'F'
    },
    {
      id: 6,
      team: 'Thunder Bolts',
      bookingId: 'BK006',
      court: 'Court 3',
      date: 'Dec 30',
      time: '4:00 PM - 5:00 PM',
      contact: 'Chris Lee',
      phone: '+977-9891234567',
      price: 1500,
      status: 'Pending',
      paymentStatus: 'Unpaid',
      initial: 'T'
    }
  ]);

  const [bookingFilter, setBookingFilter]= useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  
  const [tournamentsData, setTournamentsData] = useState([
    {
      id: 1,
      name: 'Weekend Cup 2024',
      date: 'Dec 28, 2024 - Dec 29, 2024',
      description: 'Annual weekend futsal championship with exciting matches and prizes.',
      entryFee: 5000,
      prizePool: 50000,
      format: '5v5',
      status: 'Upcoming',
      teamsRegistered: 12,
      maxTeams: 16,
      icon: '🏆'
    },
    {
      id: 2,
      name: 'New Year Championship',
      date: 'Jan 1, 2025 - Jan 2, 2025',
      description: 'Celebrate the new year with competitive futsal action!',
      entryFee: 8000,
      prizePool: 100000,
      format: '5v5',
      status: 'Upcoming',
      teamsRegistered: 8,
      maxTeams: 24,
      icon: '🏆'
    },
    {
      id: 3,
      name: 'Corporate League',
      date: 'Nov 15, 2024 - Dec 15, 2024',
      description: 'Inter-company futsal league for corporate teams.',
      entryFee: 10000,
      prizePool: 75000,
      format: '5v5',
      status: 'Ongoing',
      teamsRegistered: 16,
      maxTeams: 16,
      icon: '🏆'
    },
    {
      id: 4,
      name: 'Summer Showdown',
      date: 'Aug 10, 2024 - Aug 12, 2024',
      description: 'The hottest tournament of the summer season.',
      entryFee: 6000,
      prizePool: 60000,
      format: '5v5',
      status: 'Completed',
      teamsRegistered: 20,
      maxTeams: 20,
      icon: '🏆'
    }
  ]);

  const [facilities, setFacilities] = useState([
    { id: 1, name: 'Parking', description: 'Free parking for 50+ vehicles', icon: '🚗', enabled: true },
    { id: 2, name: 'LED Floodlights', description: 'Professional-grade lighting', icon: '💡', enabled: true },
    { id: 3, name: 'Showers', description: 'Hot & cold shower facilities', icon: '🚿', enabled: true },
    { id: 4, name: 'CCTV Monitoring', description: '24/7 security surveillance', icon: '📹', enabled: true },
    { id: 5, name: 'Locker Rooms', description: 'Secure lockers with keys', icon: '🔒', enabled: true },
    { id: 6, name: 'Refreshments', description: 'Cafeteria with snacks & drinks', icon: '☕', enabled: true },
    { id: 7, name: 'Free WiFi', description: 'High-speed internet', icon: '📶', enabled: true }
  ]);

  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: 'Holiday Schedule Update',
      message: "We'll be open with reduced hours during the holiday season. Check our updated timings.",
      date: 'Dec 20, 2024',
      sent: true
    },
    {
      id: 2,
      title: 'Court 3 Maintenance',
      message: 'Court 3 will be under maintenance from Dec 27-30. Please book alternate courts.',
      date: 'Dec 25, 2024',
      sent: true
    },
    {
      id: 3,
      title: 'New Year Tournament',
      message: 'Registration now open for our New Year Championship! Early bird discount available.',
      date: 'Dec 15, 2024',
      sent: true
    }
  ]);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    sendTo: 'all'
  });

  const [profileSettings, setProfileSettings] = useState({
    firstName: 'Raj',
    lastName: 'Kumar',
    email: 'raj@championsarena.com',
    phone: '+977-9841234567',
    location: 'Kathmandu, Nepal',
    venueName: 'Champions Arena Futsal',
    currentPassword: '',
    newPassword: '',
    emailNotifications: true,
    smsNotifications: true,
    bookingAlerts: true,
    twoFactorAuth: false
  });

  const handleProfileUpdate = () => {
    alert('Profile updated successfully!');
  };

  const handlePasswordChange = () => {
    if (profileSettings.currentPassword && profileSettings.newPassword) {
      alert('Password changed successfully!');
      setProfileSettings({
        ...profileSettings,
        currentPassword: '',
        newPassword: ''
      });
    }
  };

  const handleNotificationToggle = (key) => {
    setProfileSettings({
      ...profileSettings,
      [key]: !profileSettings[key]
    });
  };

  const handleFacilityToggle = (facilityId) => {
    setFacilities(facilities.map(facility =>
      facility.id === facilityId
        ? { ...facility, enabled: !facility.enabled }
        : facility
    ));
  };

  const handleSendAnnouncement = () => {
    if (newAnnouncement.title && newAnnouncement.message) {
      const announcement = {
        id: announcements.length + 1,
        title: newAnnouncement.title,
        message: newAnnouncement.message,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        sent: true
      };
      setAnnouncements([announcement, ...announcements]);
      setNewAnnouncement({ title: '', message: '', sendTo: 'all' });
      alert('Announcement sent successfully!');
    }
  };

  const handleBookingAction = (bookingId, action) => {
    if (action === 'confirm') {
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'Confirmed' } : b
      ));
    } else if (action === 'cancel') {
      if (confirm('Are you sure you want to cancel this booking?')) {
        setBookings(bookings.map(b => 
          b.id === bookingId ? { ...b, status: 'Cancelled' } : b
        ));
      }
    }
  };

  const getFilteredBookings = () => {
    let filtered = bookings;
    
    if (bookingFilter !== 'All') {
      filtered = filtered.filter(b => b.status === bookingFilter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(b => 
        b.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.bookingId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getBookingCounts = () => {
    return {
      all: bookings.length,
      pending: bookings.filter(b => b.status === 'Pending').length,
      confirmed: bookings.filter(b => b.status === 'Confirmed').length,
      cancelled: bookings.filter(b => b.status === 'Cancelled').length
    };
  };
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New booking request', desc: 'Team Alpha requested Court 1 for tomorrow at 6 PM', time: 'Just now' },
    { id: 2, title: 'Payment received', desc: 'Rs. 2,500 received for booking #1234', time: '5 min ago' },
    { id: 3, title: 'Tournament registration', desc: '5 new teams registered for Weekend Cup', time: '1 hour ago' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Venue Management State
  const [venueInfo, setVenueInfo] = useState({
    name: 'Champions Arena Futsal',
    address: '123 Sports Complex, Kathmandu, Nepal',
    description: 'Premier futsal venue with international-standard courts, professional lighting, and top-notch facilities. Perfect for casual games, league matches, and tournaments.',
    phoneNumber: '+977-1-4567890',
    email: 'contact@championsarena.com',
    openingTime: '06:00',
    closingTime: '22:00'
  });

  const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [galleryImages, setGalleryImages] = useState([
    'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80'
  ]);

  const stats = [
    { label: "Today's Bookings", value: '12', change: '+3 from yesterday', icon: Calendar, color: 'bg-blue-500' },
    { label: 'Monthly Revenue', value: 'Rs. 2.4L', change: '+12% from last month', icon: DollarSign, color: 'bg-green-500' },
    { label: 'Active Courts', value: '4', change: '2 in maintenance', icon: MapPin, color: 'bg-purple-500' }
  ];

  const recentBookings = [
    { team: 'Team Alpha', court: 'Court 1', time: '6:00 PM - 7:00 PM', price: 'Rs. 2,500', status: 'Confirmed', initial: 'T' },
    { team: 'Striker FC', court: 'Court 2', time: '7:00 PM - 8:00 PM', price: 'Rs. 2,500', status: 'Pending', initial: 'S' },
    { team: 'Goal Getters', court: 'Court 3', time: '5:00 PM - 6:00 PM', price: 'Rs. 2,500', status: 'Confirmed', initial: 'G' },
    { team: 'FC Warriors', court: 'Court 1', time: '8:00 PM - 9:00 PM', price: 'Rs. 2,500', status: 'Confirmed', initial: 'F' }
  ];

  const tournaments = [
    { name: 'Weekend Cup 2024', date: 'Dec 28-29', prize: 'Rs. 50,000', entry: 'Rs. 5,000', teams: 12, maxTeams: 16 },
    { name: 'New Year Championship', date: 'Jan 1-2', prize: 'Rs. 100,000', entry: 'Rs. 8,000', teams: 8, maxTeams: 16 }
  ];

  const peakHours = [
    { time: '6 AM', bookings: 2 },
    { time: '8 AM', bookings: 5 },
    { time: '10 AM', bookings: 4 },
    { time: '12 PM', bookings: 3 },
    { time: '2 PM', bookings: 6 },
    { time: '4 PM', bookings: 8 },
    { time: '6 PM', bookings: 12 },
    { time: '8 PM', bookings: 11 },
    { time: '10 PM', bookings: 7 }
  ];

  const maxBookings = Math.max(...peakHours.map(h => h.bookings));

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00'
  ];

  const togglePeakHour = (time) => {
    if (peakHourSlots.includes(time)) {
      setPeakHourSlots(peakHourSlots.filter(t => t !== time));
    } else {
      setPeakHourSlots([...peakHourSlots, time]);
    }
  };

  const handleCourtStatusToggle = (courtId) => {
    setCourts(courts.map(court => 
      court.id === courtId 
        ? { ...court, status: court.status === 'active' ? 'inactive' : 'active' }
        : court
    ));
  };

  const handleDeleteCourt = (courtId) => {
    if (confirm('Are you sure you want to delete this court?')) {
      setCourts(courts.filter(court => court.id !== courtId));
    }
  };

  const handleBlockMaintenance = () => {
    if (maintenanceStart && maintenanceEnd && selectedCourt) {
      alert(`Court ${selectedCourt} blocked for maintenance from ${maintenanceStart} to ${maintenanceEnd}`);
    }
  };

  const handleDayToggle = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleInputChange = (field, value) => {
    setVenueInfo({ ...venueInfo, [field]: value });
  };

  const handleAddImage = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setGalleryImages([...galleryImages, reader.result]);
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  const handleRemoveImage = (index) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const handleSaveChanges = () => {
    alert('Changes saved successfully!');
  };

  const Sidebar = () => (
    <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transition-transform duration-300`}>
      <div className="flex items-center gap-3 p-6 border-b border-gray-800">
        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
          <Users className="w-6 h-6" />
        </div>
        <span className="text-xl font-bold">PlayPal</span>
      </div>

      <nav className="p-4 space-y-2">
        <button
          onClick={() => { setCurrentPage('dashboard'); setSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
            currentPage === 'dashboard' ? 'bg-green-600' : 'hover:bg-gray-800'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => { setCurrentPage('venue'); setSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
            currentPage === 'venue' ? 'bg-green-600' : 'hover:bg-gray-800'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span>Venue</span>
        </button>
        <button
          onClick={() => { setCurrentPage('courts'); setSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
            currentPage === 'courts' ? 'bg-green-600' : 'hover:bg-gray-800'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Courts & Pricing</span>
        </button>
        <button
          onClick={() => { setCurrentPage('bookings'); setSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
            currentPage === 'bookings' ? 'bg-green-600' : 'hover:bg-gray-800'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>Bookings</span>
        </button>
        <button
          onClick={() => { setCurrentPage('tournaments'); setSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
            currentPage === 'tournaments' ? 'bg-green-600' : 'hover:bg-gray-800'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span>Tournaments</span>
        </button>
        <button
          onClick={() => { setCurrentPage('facilities'); setSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
            currentPage === 'facilities' ? 'bg-green-600' : 'hover:bg-gray-800'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span>Facilities</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded-lg transition">
          <BarChart3 className="w-5 h-5" />
          <span>Earnings</span>
        </button>
        <button
          onClick={() => { setCurrentPage('settings'); setSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
            currentPage === 'settings' ? 'bg-green-600' : 'hover:bg-gray-800'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded-lg transition text-gray-400">
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  const Header = () => (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <Trophy className="w-5 h-5 text-yellow-500" />
                  </div>
                </div>
                <div className="max-h-96 overflow-auto">
                  {notifications.map(notif => (
                    <div key={notif.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                      <h4 className="font-medium text-gray-900 mb-1">{notif.title}</h4>
                      <p className="text-sm text-gray-600 mb-1">{notif.desc}</p>
                      <span className="text-xs text-gray-500">{notif.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
              RK
            </div>
            <span className="font-medium text-gray-900">Raj Kumar</span>
          </div>
        </div>
      </div>
    </header>
  );

  const DashboardPage = () => (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back, Raj! Here's what's happening at your venue.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600 text-sm">{stat.label}</span>
              <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
            <div className="text-green-600 text-sm">{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Weekly Revenue</h2>
            <p className="text-sm text-gray-600">Revenue and booking trends</p>
          </div>
          <div className="h-64">
            <svg viewBox="0 0 700 200" className="w-full h-full">
              <defs>
                <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.3 }} />
                  <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0.05 }} />
                </linearGradient>
              </defs>
              
              <text x="30" y="20" className="text-xs fill-gray-500">Rs.28k</text>
              <text x="30" y="60" className="text-xs fill-gray-500">Rs.21k</text>
              <text x="30" y="100" className="text-xs fill-gray-500">Rs.14k</text>
              <text x="30" y="140" className="text-xs fill-gray-500">Rs.7k</text>
              <text x="30" y="180" className="text-xs fill-gray-500">Rs.0k</text>

              <path
                d="M 80,120 L 150,100 L 220,110 L 290,80 L 360,95 L 430,85 L 500,60 L 570,50 L 640,70 L 640,180 L 80,180 Z"
                fill="url(#revenueGradient)"
              />
              <path
                d="M 80,120 L 150,100 L 220,110 L 290,80 L 360,95 L 430,85 L 500,60 L 570,50 L 640,70"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
              />

              <text x="80" y="195" className="text-xs fill-gray-500">Mon</text>
              <text x="150" y="195" className="text-xs fill-gray-500">Tue</text>
              <text x="220" y="195" className="text-xs fill-gray-500">Wed</text>
              <text x="290" y="195" className="text-xs fill-gray-500">Thu</text>
              <text x="360" y="195" className="text-xs fill-gray-500">Fri</text>
              <text x="430" y="195" className="text-xs fill-gray-500">Sat</text>
              <text x="500" y="195" className="text-xs fill-gray-500">Sun</text>
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Peak Hours</h2>
            <p className="text-sm text-gray-600">Bookings by time of day</p>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {peakHours.map((hour, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t-lg transition-all hover:from-green-600 hover:to-green-400"
                  style={{ height: `${(hour.bookings / maxBookings) * 100}%`, minHeight: '20px' }}
                ></div>
                <span className="text-xs text-gray-600 whitespace-nowrap">{hour.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
              <p className="text-sm text-gray-600">Latest booking requests</p>
            </div>
            <button className="text-green-600 text-sm font-medium hover:text-green-700">View All</button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentBookings.map((booking, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
                    {booking.initial}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{booking.team}</div>
                    <div className="text-sm text-gray-600">{booking.court} • Today</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 mb-1">{booking.time}</div>
                  <div className="text-sm text-gray-600">{booking.price}</div>
                  <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                    booking.status === 'Confirmed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Tournaments</h2>
              <p className="text-sm text-gray-600">Manage your events</p>
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">
              Create New →
            </button>
          </div>
          <div className="p-6 space-y-4">
            {tournaments.map((tournament, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{tournament.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Calendar className="w-4 h-4" />
                        {tournament.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">Prize: {tournament.prize}</div>
                    <div className="text-xs text-gray-600">Entry: {tournament.entry}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Team Registration</span>
                    <span className="font-medium text-gray-900">{tournament.teams}/{tournament.maxTeams}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${(tournament.teams / tournament.maxTeams) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const VenuePage = () => (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Venue Management</h1>
        <p className="text-gray-600">Manage your futsal venue details and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Venue Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Venue Information</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">Update your venue details visible to players</p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name</label>
                  <input
                    type="text"
                    value={venueInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={venueInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={venueInfo.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Venue Gallery */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-6">
              <ImageIcon className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Venue Gallery</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">Showcase your venue with high-quality images</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {galleryImages.map((img, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden aspect-video">
                  <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddImage}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-green-500 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-green-600"
            >
              <Upload className="w-8 h-8" />
              <span className="text-sm font-medium">Add Image</span>
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-6">
              <Phone className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="text"
                  value={venueInfo.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={venueInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Operating Hours</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Opening Time</label>
                  <input
                    type="time"
                    value={venueInfo.openingTime}
                    onChange={(e) => handleInputChange('openingTime', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Closing Time</label>
                  <input
                    type="time"
                    value={venueInfo.closingTime}
                    onChange={(e) => handleInputChange('closingTime', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Operating Days</label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map(day => (
                    <button
                      key={day}
                      onClick={() => handleDayToggle(day)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedDays.includes(day)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveChanges}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Settings className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  const CourtsPage = () => (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courts & Pricing</h1>
          <p className="text-gray-600">Manage your courts, pricing, and availability</p>
        </div>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2">
          <span className="text-xl">+</span>
          Add Court
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Courts List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Courts</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courts.map(court => (
                <div 
                  key={court.id}
                  className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                    selectedCourt === court.id 
                      ? 'border-green-500 bg-green-50' 
                      : court.status === 'maintenance'
                      ? 'border-orange-200 bg-orange-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                  onClick={() => setSelectedCourt(court.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{court.name}</h3>
                      <p className="text-sm text-gray-600">{court.type} • {court.size}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      court.status === 'active' 
                        ? 'bg-green-100 text-green-700'
                        : court.status === 'maintenance'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {court.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Regular Price</span>
                      <span className="font-semibold text-gray-900">₹ {court.price} /hr</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Peak Price</span>
                      <span className="font-semibold text-orange-600">₹ {court.peakPrice} /hr (peak)</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {court.amenities.map((amenity, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {amenity}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <button 
                      onClick={(e) => { e.stopPropagation(); }}
                      className="text-green-600 text-sm font-medium hover:text-green-700 flex items-center gap-1"
                    >
                      <Settings className="w-4 h-4" />
                      Edit
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteCourt(court.id); }}
                      className="text-red-600 text-sm font-medium hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Availability Settings */}
        <div className="space-y-6">
          {/* Availability Control */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Availability - {selectedCourt ? courts.find(c => c.id === selectedCourt)?.name : 'Select Court'}
            </h2>
            <p className="text-sm text-gray-600 mb-4">Toggle time slots and set peak hours</p>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">Enable All Slots</span>
                <button
                  onClick={() => setEnableAllSlots(!enableAllSlots)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    enableAllSlots ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      enableAllSlots ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    onClick={() => togglePeakHour(time)}
                    disabled={!enableAllSlots}
                    className={`px-2 py-2 text-sm rounded-lg font-medium transition-colors ${
                      !enableAllSlots
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : peakHourSlots.includes(time)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Click to toggle peak hours (highlighted in orange)
              </p>
            </div>
          </div>

          {/* Maintenance Block */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Block</h2>
            <p className="text-sm text-gray-600 mb-4">Block slots for maintenance</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={maintenanceStart}
                  onChange={(e) => setMaintenanceStart(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={maintenanceEnd}
                  onChange={(e) => setMaintenanceEnd(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                onClick={handleBlockMaintenance}
                disabled={!selectedCourt || !maintenanceStart || !maintenanceEnd}
                className="w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Block for Maintenance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const BookingsPage = () => {
    const filteredBookings = getFilteredBookings();
    const counts = getBookingCounts();

    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600">View and manage all booking requests</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings by team, captain, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setBookingFilter('All')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              bookingFilter === 'All'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => setBookingFilter('Pending')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              bookingFilter === 'Pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Pending ({counts.pending})
          </button>
          <button
            onClick={() => setBookingFilter('Confirmed')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              bookingFilter === 'Confirmed'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Confirmed ({counts.confirmed})
          </button>
          <button
            onClick={() => setBookingFilter('Cancelled')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              bookingFilter === 'Cancelled'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cancelled ({counts.cancelled})
          </button>
        </div>

        {/* Bookings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${
                      booking.status === 'Confirmed' ? 'bg-green-500' :
                      booking.status === 'Pending' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}>
                      {booking.initial}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{booking.team}</h3>
                      <p className="text-sm text-gray-600">{booking.bookingId} • {booking.court}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <span className="text-xl">⋮</span>
                  </button>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {booking.status === 'Confirmed' && <Check className="w-4 h-4" />}
                    {booking.status === 'Pending' && <Clock className="w-4 h-4" />}
                    {booking.status === 'Cancelled' && <X className="w-4 h-4" />}
                    {booking.status}
                  </span>
                </div>

                {/* Booking Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{booking.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{booking.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{booking.contact}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{booking.phone}</span>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 mb-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-gray-900">Rs. {booking.price}</span>
                  </div>
                  <span className={`text-sm font-medium ${
                    booking.paymentStatus === 'Paid' ? 'text-green-600' :
                    booking.paymentStatus === 'Failed' ? 'text-red-600' :
                    'text-orange-600'
                  }`}>
                    ({booking.paymentStatus})
                  </span>
                </div>

                {/* Action Buttons */}
                {booking.status === 'Pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBookingAction(booking.id, 'cancel')}
                      className="flex-1 px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <X className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleBookingAction(booking.id, 'confirm')}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    );
  };

  const TournamentsPage = () => {
    const upcomingTournaments = tournamentsData.filter(t => t.status === 'Upcoming');
    const ongoingTournaments = tournamentsData.filter(t => t.status === 'Ongoing');
    const completedTournaments = tournamentsData.filter(t => t.status === 'Completed');

    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tournaments & Events</h1>
            <p className="text-gray-600">Create and manage futsal tournaments</p>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2">
            <span className="text-xl">+</span>
            Create Tournament
          </button>
        </div>

        {/* Status Badges */}
        <div className="flex gap-3 mb-6">
          <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium text-sm">
            {upcomingTournaments.length} Upcoming
          </span>
          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium text-sm">
            {ongoingTournaments.length} Ongoing
          </span>
        </div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tournamentsData.map(tournament => (
            <div key={tournament.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 bg-orange-500 rounded-lg flex items-center justify-center text-3xl">
                      {tournament.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{tournament.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {tournament.date}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    tournament.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' :
                    tournament.status === 'Ongoing' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {tournament.status}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4">{tournament.description}</p>

                {/* Tournament Info */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Entry Fee</p>
                    <p className="font-semibold text-gray-900">Rs. {tournament.entryFee.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Prize Pool</p>
                    <p className="font-semibold text-orange-600">Rs. {tournament.prizePool.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Format</p>
                    <p className="font-semibold text-gray-900">{tournament.format}</p>
                  </div>
                </div>

                {/* Team Registration Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Team Registration
                    </span>
                    <span className="font-medium text-gray-900">
                      {tournament.teamsRegistered}/{tournament.maxTeams}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${(tournament.teamsRegistered / tournament.maxTeams) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Teams
                  </button>
                  <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {tournamentsData.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tournaments yet</h3>
            <p className="text-gray-600 mb-4">Create your first tournament to get started</p>
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
              Create Tournament
            </button>
          </div>
        )}
      </div>
    );
  };

  const FacilitiesPage = () => {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Facilities & Updates</h1>
          <p className="text-gray-600">Manage venue facilities and send announcements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Venue Facilities */}
          <div className="lg:col-span-2 space-y-6">
            {/* Venue Facilities Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Venue Facilities</h2>
                    <p className="text-sm text-gray-600">Manage and display available facilities</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">
                  + Add
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {facilities.map(facility => (
                    <div
                      key={facility.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-2xl">
                          {facility.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{facility.name}</h3>
                          <p className="text-sm text-gray-600">{facility.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleFacilityToggle(facility.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          facility.enabled ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            facility.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Announcements Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-green-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Recent Announcements</h2>
                    <p className="text-sm text-gray-600">Previous notifications sent to players</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {announcements.map(announcement => (
                  <div key={announcement.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          Sent
                        </span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{announcement.message}</p>
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {announcement.date}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - New Announcement */}
          <div className="space-y-6">
            {/* New Announcement Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="w-5 h-5 text-green-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">New Announcement</h2>
                  <p className="text-sm text-gray-600">Notify players about updates or changes</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="Announcement title..."
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    placeholder="Write your announcement..."
                    value={newAnnouncement.message}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Send To</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sendTo"
                        value="all"
                        checked={newAnnouncement.sendTo === 'all'}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, sendTo: e.target.value })}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">All Players</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sendTo"
                        value="upcoming"
                        checked={newAnnouncement.sendTo === 'upcoming'}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, sendTo: e.target.value })}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">Upcoming Bookings Only</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sendTo"
                        value="tournament"
                        checked={newAnnouncement.sendTo === 'tournament'}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, sendTo: e.target.value })}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">Tournament Participants</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleSendAnnouncement}
                  disabled={!newAnnouncement.title || !newAnnouncement.message}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Announcement
                </button>
              </div>
            </div>

            {/* Push Notifications Info */}
            <div className="bg-orange-500 rounded-lg p-6 text-white">
              <div className="flex items-start gap-3 mb-3">
                <Bell className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Push Notifications</h3>
                  <p className="text-sm opacity-90">Coming soon</p>
                </div>
              </div>
              <p className="text-sm opacity-90">
                Enable push notifications to instantly notify players on their devices.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SettingsPage = () => {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col items-center">
                {/* Profile Avatar */}
                <div className="relative mb-4">
                  <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    RK
                  </div>
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200 hover:bg-gray-50 transition">
                    <Camera className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Profile Info */}
                <h2 className="text-xl font-bold text-gray-900 mb-1">Raj Kumar</h2>
                <p className="text-gray-600 text-sm mb-1">Venue Owner</p>
                <p className="text-green-600 text-sm font-medium mb-6">Champions Arena Futsal</p>

                {/* Contact Info */}
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-5 h-5" />
                    <span className="text-sm">{profileSettings.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-5 h-5" />
                    <span className="text-sm">{profileSettings.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span className="text-sm">{profileSettings.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Settings Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-green-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                  <p className="text-sm text-gray-600">Update your personal details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={profileSettings.firstName}
                    onChange={(e) => setProfileSettings({ ...profileSettings, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profileSettings.lastName}
                    onChange={(e) => setProfileSettings({ ...profileSettings, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={profileSettings.email}
                    onChange={(e) => setProfileSettings({ ...profileSettings, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={profileSettings.phone}
                    onChange={(e) => setProfileSettings({ ...profileSettings, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <button
                onClick={handleProfileUpdate}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                Save Changes
              </button>
            </div>

            {/* Security */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-5 h-5 text-green-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                  <p className="text-sm text-gray-600">Manage your password and security settings</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={profileSettings.currentPassword}
                    onChange={(e) => setProfileSettings({ ...profileSettings, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={profileSettings.newPassword}
                    onChange={(e) => setProfileSettings({ ...profileSettings, newPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('twoFactorAuth')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      profileSettings.twoFactorAuth ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        profileSettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <button
                onClick={handlePasswordChange}
                disabled={!profileSettings.currentPassword || !profileSettings.newPassword}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Update Password
              </button>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="w-5 h-5 text-green-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
                  <p className="text-sm text-gray-600">Choose what notifications you receive</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Email Notifications</h3>
                        <p className="text-sm text-gray-600">Receive booking updates via email</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle('emailNotifications')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        profileSettings.emailNotifications ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          profileSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                        <p className="text-sm text-gray-600">Receive booking alerts via SMS</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle('smsNotifications')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        profileSettings.smsNotifications ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          profileSettings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <Bell className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Booking Alerts</h3>
                        <p className="text-sm text-gray-600">Get notified of new bookings instantly</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle('bookingAlerts')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        profileSettings.bookingAlerts ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          profileSettings.bookingAlerts ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <Header />
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'venue' && <VenuePage />}
        {currentPage === 'courts' && <CourtsPage />}
        {currentPage === 'bookings' && <BookingsPage />}
        {currentPage === 'tournaments' && <TournamentsPage />}
        {currentPage === 'facilities' && <FacilitiesPage />}
        {currentPage === 'settings' && <SettingsPage />}
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}