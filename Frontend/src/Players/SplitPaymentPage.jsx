import React, { useState, useEffect } from 'react';

const PaymentPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('Payments');
  const [bookingAmount, setBookingAmount] = useState(5000);
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  
  // Mock booking data
  const bookingData = {
    id: 'BOOK-789123',
    date: 'Mar 18, 2024',
    time: '7:00 PM - 9:00 PM',
    venue: 'Futsal Arena, City Center',
    duration: '2 hours',
    teams: 'Team A vs Team B'
  };

  // Initialize players data
  useEffect(() => {
    const initialPlayers = [
      {
        id: 1,
        name: 'Rajan Karki',
        email: 'rajan@example.com',
        phone: '+977 9801234567',
        playerId: 'PLYR-001',
        paymentMethod: null,
        paymentStatus: 'Pending',
        amountDue: 1000,
        paymentId: null,
        transactionId: null,
        paidAt: null
      },
      {
        id: 2,
        name: 'Sujan Thapa',
        email: 'sujan@example.com',
        phone: '+977 9802345678',
        playerId: 'PLYR-002',
        paymentMethod: 'eSewa',
        paymentStatus: 'Paid',
        amountDue: 1000,
        paymentId: 'PAY-ESW-456',
        transactionId: 'TXN-ESW-789',
        paidAt: '2024-03-15 14:30'
      },
      {
        id: 3,
        name: 'Bikash Rai',
        email: 'bikash@example.com',
        phone: '+977 9803456789',
        playerId: 'PLYR-003',
        paymentMethod: 'Khalti',
        paymentStatus: 'Paid',
        amountDue: 1000,
        paymentId: 'PAY-KHL-123',
        transactionId: 'TXN-KHL-456',
        paidAt: '2024-03-15 15:45'
      },
      {
        id: 4,
        name: 'Anil Shrestha',
        email: 'anil@example.com',
        phone: '+977 9804567890',
        playerId: 'PLYR-004',
        paymentMethod: 'Stripe',
        paymentStatus: 'Paid',
        amountDue: 1000,
        paymentId: 'PAY-STR-789',
        transactionId: 'TXN-STR-123',
        paidAt: '2024-03-16 10:15'
      },
      {
        id: 5,
        name: 'Suresh Gurung',
        email: 'suresh@example.com',
        phone: '+977 9805678901',
        playerId: 'PLYR-005',
        paymentMethod: null,
        paymentStatus: 'Failed',
        amountDue: 1000,
        paymentId: null,
        transactionId: null,
        paidAt: null
      }
    ];
    
    // Calculate individual share
    const individualShare = bookingAmount / initialPlayers.length;
    const playersWithShare = initialPlayers.map(player => ({
      ...player,
      amountDue: individualShare
    }));
    
    setPlayers(playersWithShare);
  }, [bookingAmount]);

  // Calculate payment statistics
  const paidPlayers = players.filter(p => p.paymentStatus === 'Paid').length;
  const pendingPlayers = players.filter(p => p.paymentStatus === 'Pending').length;
  const failedPlayers = players.filter(p => p.paymentStatus === 'Failed').length;
  const totalPaidAmount = players.filter(p => p.paymentStatus === 'Paid')
    .reduce((sum, player) => sum + player.amountDue, 0);
  const bookingConfirmed = paidPlayers === players.length;

  // Navigation Items
  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '' },
    { id: 'bookings', name: 'Bookings', icon: '', badge: 3 },
    { id: 'payments', name: 'Payments', icon: '', badge: 2 },
    { id: 'teams', name: 'Teams', icon: '' },
    { id: 'tournaments', name: 'Tournaments', icon: '' },
    { id: 'highlights', name: 'Highlights', icon: '' },
    { id: 'health', name: 'Health', icon: '' },
  ];

  const bottomNavItems = [
    { id: 'settings', name: 'Settings', icon: '' },
    { id: 'help', name: 'Help', icon: '' },
    { id: 'logout', name: 'Logout', icon: '' },
  ];

  // Icons
  const CreditCardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
    </svg>
  );

  const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  );

  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );

  const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  );

  const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  );

  const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );

  const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  );

  const AlertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );

  // Payment method logos
  const ESewaLogo = () => (
    <div className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-bold">eSewa</div>
  );

  const KhaltiLogo = () => (
    <div className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm font-bold">Khalti</div>
  );

  const StripeLogo = () => (
    <div className="bg-indigo-500 text-white px-3 py-1 rounded-lg text-sm font-bold">Stripe</div>
  );

  // Handle payment simulation
  const handlePayment = (playerId, paymentMethod) => {
    if (selectedPlayer && selectedPlayer.id === playerId && selectedPlayer.paymentMethod) {
      // Prevent double payment - transaction already locked
      alert(`Payment already processed for ${selectedPlayer.name}. Transaction ID: ${selectedPlayer.transactionId}`);
      return;
    }

    const player = players.find(p => p.id === playerId);
    if (!player) return;

    setSelectedPlayer(player);

    // Simulate payment processing
    setTimeout(() => {
      const updatedPlayers = players.map(p => {
        if (p.id === playerId) {
          if (Math.random() > 0.2) { // 80% success rate
            return {
              ...p,
              paymentMethod: paymentMethod,
              paymentStatus: 'Paid',
              paymentId: `PAY-${paymentMethod.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
              transactionId: `TXN-${paymentMethod.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
              paidAt: new Date().toISOString()
            };
          } else {
            return {
              ...p,
              paymentStatus: 'Failed'
            };
          }
        }
        return p;
      });

      setPlayers(updatedPlayers);

      if (Math.random() > 0.2) {
        alert(`Payment successful! Transaction ID: TXN-${paymentMethod.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`);
      } else {
        alert('Payment failed. Please try again with a different payment method.');
      }
    }, 1500);
  };

  // Handle retry for failed payments
  const handleRetryPayment = (playerId) => {
    const player = players.find(p => p.id === playerId);
    if (player && player.paymentStatus === 'Failed') {
      setSelectedPlayer(player);
      // Open payment method selection
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className={`bg-white shadow-lg rounded-r-xl fixed h-full z-10 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="p-6">
          {/* Logo */}
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} mb-10`}>
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <div className="text-white font-bold">PP</div>
            </div>
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-gray-800">PlayPal<span className="text-emerald-600"> – Futsal</span></h1>
            )}
          </div>
          
          {/* Collapse Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
          >
            {sidebarCollapsed ? <ChevronRightIcon className="w-4 h-4 text-gray-600" /> : <ChevronLeftIcon className="w-4 h-4 text-gray-600" />}
          </button>
          
          {/* Navigation */}
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                className={`flex items-center justify-between w-full p-3 rounded-xl transition-all ${activeNav === item.name ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={() => setActiveNav(item.name)}
              >
                <div className="flex items-center space-x-3">
                  <span className={`text-lg ${activeNav === item.name ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </div>
                {!sidebarCollapsed && item.badge && (
                  <span className="bg-emerald-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
                {sidebarCollapsed && item.badge && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
          
          {/* Bottom Navigation */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100">
            <nav className="space-y-2">
              {bottomNavItems.map((item) => (
                <button
                  key={item.id}
                  className="flex items-center w-full p-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <span className="text-lg text-gray-400 mr-3">{item.icon}</span>
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} p-6`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Split Payment</h1>
            <p className="text-gray-600">Manage and track shared payments for your booking</p>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-emerald-100 bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                RK
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="ml-3">
              <div className="flex items-center">
                <h3 className="font-bold text-gray-800">Rajan Karki</h3>
                <span className="ml-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">Pro Player</span>
              </div>
              <p className="text-sm text-gray-600">Booking Organizer</p>
            </div>
          </div>
        </div>

        {/* Booking Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Booking Details</h2>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 text-gray-400" />
                  <span>{bookingData.date}</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="mr-2 text-gray-400" />
                  <span>{bookingData.time}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${bookingConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {bookingConfirmed ? 'Booking Confirmed' : 'Payment Pending'}
              </span>
              <p className="text-sm text-gray-600 mt-1">ID: {bookingData.id}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-gray-800">Rs. {bookingAmount}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Players</p>
              <p className="text-2xl font-bold text-gray-800">{players.length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Individual Share</p>
              <p className="text-2xl font-bold text-gray-800">Rs. {players.length > 0 ? (bookingAmount / players.length).toFixed(0) : 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Paid Amount</p>
              <p className="text-2xl font-bold text-gray-800">Rs. {totalPaidAmount}</p>
            </div>
          </div>
        </div>

        {/* Payment Progress */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Payment Progress</h2>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                {paidPlayers} Paid
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                {pendingPlayers} Pending
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                {failedPlayers} Failed
              </span>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Payment Completion</span>
              <span>{Math.round((paidPlayers / players.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(paidPlayers / players.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {!bookingConfirmed && (
            <div className="flex items-center p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertIcon className="text-amber-500 mr-3" />
              <div>
                <p className="font-medium text-gray-800">Booking will be confirmed when all players have paid</p>
                <p className="text-sm text-gray-600 mt-1">
                  {pendingPlayers + failedPlayers} player(s) still need to complete payment
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Player Payment Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Player Payments</h2>
            <div className="text-sm text-gray-600">
              Individual Share: Rs. {players.length > 0 ? (bookingAmount / players.length).toFixed(0) : 0}
            </div>
          </div>
          
          {/* Payment Legend */}
          <div className="flex items-center space-x-4 mb-6 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Paid</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Pending</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Failed</span>
            </div>
          </div>
          
          {/* Players List */}
          <div className="space-y-4">
            {players.map((player) => (
              <div 
                key={player.id} 
                className={`border rounded-xl p-4 transition-all ${selectedPlayer?.id === player.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:shadow-md'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${player.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : player.paymentStatus === 'Failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      <span className="font-bold">{player.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{player.name}</h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-sm text-gray-600">{player.email}</span>
                        <span className="text-sm text-gray-600">•</span>
                        <span className="text-sm text-gray-600">{player.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">ID: {player.playerId}</span>
                        {player.paymentMethod && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {player.paymentMethod}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${player.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : player.paymentStatus === 'Failed' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                        {player.paymentStatus}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-gray-800">Rs. {player.amountDue}</p>
                  </div>
                </div>
                
                {/* Payment Details */}
                <div className="flex justify-between items-center">
                  <div>
                    {player.paymentStatus === 'Paid' ? (
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center">
                          <CheckIcon className="w-4 h-4 text-emerald-500 mr-2" />
                          <span>Paid via {player.paymentMethod} on {new Date(player.paidAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Transaction ID: {player.transactionId}
                        </div>
                      </div>
                    ) : player.paymentStatus === 'Failed' ? (
                      <div className="text-sm text-red-600 flex items-center">
                        <AlertIcon className="w-4 h-4 mr-2" />
                        <span>Payment failed. Please retry.</span>
                      </div>
                    ) : (
                      <div className="text-sm text-amber-600 flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        <span>Awaiting payment</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Payment Actions */}
                  <div className="flex space-x-2">
                    {player.paymentStatus === 'Paid' ? (
                      <button
                        className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium cursor-not-allowed"
                        disabled
                      >
                        <CheckIcon className="inline w-4 h-4 mr-2" />
                        Payment Complete
                      </button>
                    ) : player.paymentStatus === 'Failed' ? (
                      <button
                        onClick={() => handleRetryPayment(player.id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
                      >
                        Retry Payment
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePayment(player.id, 'eSewa')}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all"
                          disabled={selectedPlayer?.id === player.id}
                        >
                          Pay with eSewa
                        </button>
                        <button
                          onClick={() => handlePayment(player.id, 'Khalti')}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all"
                          disabled={selectedPlayer?.id === player.id}
                        >
                          Pay with Khalti
                        </button>
                        <button
                          onClick={() => handlePayment(player.id, 'Stripe')}
                          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-all"
                          disabled={selectedPlayer?.id === player.id}
                        >
                          Pay with Stripe
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Payment Processing Indicator */}
                {selectedPlayer?.id === player.id && player.paymentStatus === 'Pending' && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-3"></div>
                      <span className="text-blue-600">Processing payment via {selectedPlayer.paymentMethod}...</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Payment Summary */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Payment Summary</h3>
                <p className="text-sm text-gray-600">
                  {paidPlayers} of {players.length} players have paid
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Remaining Balance</p>
                <p className="text-2xl font-bold text-gray-800">Rs. {bookingAmount - totalPaidAmount}</p>
              </div>
            </div>
            
            {/* Payment Method Info */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <ESewaLogo />
                </div>
                <p className="text-sm text-gray-600">Instant payment, no additional fees</p>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <KhaltiLogo />
                </div>
                <p className="text-sm text-gray-600">Digital wallet, fastest processing</p>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <StripeLogo />
                </div>
                <p className="text-sm text-gray-600">Credit/Debit cards, international</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Logic Implementation Notes */}
        <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4">Payment System Logic Implemented:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg">
              <div className="flex items-center mb-2">
                <CheckIcon className="text-emerald-500 mr-2" />
                <span className="font-medium text-gray-800">Individual Payment Records</span>
              </div>
              <p className="text-sm text-gray-600">Each player has separate payment record with unique ID</p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <div className="flex items-center mb-2">
                <CheckIcon className="text-emerald-500 mr-2" />
                <span className="font-medium text-gray-800">Auto-calculated Shares</span>
              </div>
              <p className="text-sm text-gray-600">individual_share = total_amount / number_of_players</p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <div className="flex items-center mb-2">
                <CheckIcon className="text-emerald-500 mr-2" />
                <span className="font-medium text-gray-800">Payment Locking</span>
              </div>
              <p className="text-sm text-gray-600">Prevents double payment once status is "Paid"</p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <div className="flex items-center mb-2">
                <CheckIcon className="text-emerald-500 mr-2" />
                <span className="font-medium text-gray-800">Independent Payments</span>
              </div>
              <p className="text-sm text-gray-600">Players pay independently without affecting others</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-gray-500 text-sm">
          <p>PlayPal Split Payment • v2.1 • Secure payment processing • Booking ID: {bookingData.id}</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;