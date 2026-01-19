import React, { useState, useEffect } from 'react';

const HealthPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('Health');
  const [healthData, setHealthData] = useState([]);
  const [todayData, setTodayData] = useState({
    sleepHours: 7.5,
    weight: 68,
    height: 175
  });
  const [isEditing, setIsEditing] = useState(false);
  
  // Initialize health data
  useEffect(() => {
    // Mock historical health data
    const mockData = [
      {
        id: 1,
        date: '2024-03-17',
        sleepHours: 7.2,
        weight: 68.5,
        height: 175,
        bmi: 22.4,
        timestamp: '2024-03-17T08:30:00'
      },
      {
        id: 2,
        date: '2024-03-16',
        sleepHours: 6.8,
        weight: 69.0,
        height: 175,
        bmi: 22.6,
        timestamp: '2024-03-16T09:15:00'
      },
      {
        id: 3,
        date: '2024-03-15',
        sleepHours: 8.0,
        weight: 68.8,
        height: 175,
        bmi: 22.5,
        timestamp: '2024-03-15T08:45:00'
      },
      {
        id: 4,
        date: '2024-03-14',
        sleepHours: 7.5,
        weight: 68.2,
        height: 175,
        bmi: 22.3,
        timestamp: '2024-03-14T09:00:00'
      },
      {
        id: 5,
        date: '2024-03-13',
        sleepHours: 7.0,
        weight: 69.2,
        height: 175,
        bmi: 22.7,
        timestamp: '2024-03-13T08:20:00'
      }
    ];
    
    setHealthData(mockData);
  }, []);

  // Calculate BMI
  const calculateBMI = (weight, height) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  // Get today's BMI
  const todayBMI = calculateBMI(todayData.weight, todayData.height);
  
  // Get yesterday's data for comparison
  const yesterdayData = healthData.length > 0 ? healthData[0] : null;
  
  // Calculate changes
  const calculateChange = (current, previous, isPositiveIncrease = true) => {
    if (!previous) return { value: 0, status: 'no-change' };
    
    const difference = current - previous;
    const percentChange = ((difference / previous) * 100).toFixed(1);
    
    if (difference === 0) return { value: 0, status: 'no-change' };
    
    if (isPositiveIncrease) {
      return {
        value: Math.abs(difference),
        percent: Math.abs(percentChange),
        status: difference > 0 ? 'improvement' : 'decline'
      };
    } else {
      return {
        value: Math.abs(difference),
        percent: Math.abs(percentChange),
        status: difference < 0 ? 'improvement' : 'decline'
      };
    }
  };

  // Calculate changes from yesterday
  const sleepChange = calculateChange(todayData.sleepHours, yesterdayData?.sleepHours, true);
  const weightChange = calculateChange(todayData.weight, yesterdayData?.weight, false);
  const bmiChange = calculateChange(parseFloat(todayBMI), yesterdayData?.bmi, false);

  // Validate input
  const validateInput = (name, value) => {
    let numValue = parseFloat(value);
    
    if (isNaN(numValue)) return false;
    
    switch(name) {
      case 'sleepHours':
        return numValue >= 0 && numValue <= 24;
      case 'weight':
        return numValue >= 30 && numValue <= 200;
      case 'height':
        return numValue >= 100 && numValue <= 250;
      default:
        return true;
    }
  };

  // Handle input change
  const handleInputChange = (name, value) => {
    if (validateInput(name, value)) {
      setTodayData(prev => ({
        ...prev,
        [name]: parseFloat(value)
      }));
    }
  };

  // Save today's data
  const saveTodayData = () => {
    if (!validateInput('sleepHours', todayData.sleepHours) ||
        !validateInput('weight', todayData.weight) ||
        !validateInput('height', todayData.height)) {
      alert('Please enter valid health data');
      return;
    }

    const newEntry = {
      id: healthData.length + 1,
      date: new Date().toISOString().split('T')[0],
      sleepHours: todayData.sleepHours,
      weight: todayData.weight,
      height: todayData.height,
      bmi: parseFloat(todayBMI),
      timestamp: new Date().toISOString()
    };

    // Add new entry without overwriting past records
    setHealthData(prev => [newEntry, ...prev]);
    setIsEditing(false);
    
    alert('Health data saved successfully!');
  };

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
  const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
  );

  const BedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-6h4v6H4zm6 0v-6h4v6h-4z" clipRule="evenodd" />
    </svg>
  );

  const ScaleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
  );

  const RulerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
    </svg>
  );

  const CalculatorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-4a1 1 0 100 2h.01a1 1 0 100-2H13zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM7 8a1 1 0 000 2h.01a1 1 0 000-2H7z" clipRule="evenodd" />
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

  const ArrowUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  );

  const ArrowDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );

  const MinusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  );

  const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  );

  // Get BMI category
  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (bmi < 25) return { category: 'Normal', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-amber-600', bg: 'bg-amber-100' };
    return { category: 'Obese', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const bmiCategory = getBMICategory(todayBMI);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
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
            <h1 className="text-3xl font-bold text-gray-800">Health Tracking</h1>
            <p className="text-gray-600">Monitor your fitness and wellness metrics</p>
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
              <p className="text-sm text-gray-600">Health Profile ID: HP-001</p>
            </div>
          </div>
        </div>

        {/* Health Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Sleep Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm mb-1">Sleep Duration</p>
                <p className="text-2xl font-bold text-gray-800">{todayData.sleepHours} <span className="text-lg text-gray-600">hours</span></p>
                {sleepChange.status !== 'no-change' && (
                  <div className="flex items-center mt-1">
                    {sleepChange.status === 'improvement' ? (
                      <ArrowUpIcon className="w-4 h-4 text-emerald-500 mr-1" />
                    ) : (
                      <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs font-medium ${sleepChange.status === 'improvement' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {sleepChange.value.toFixed(1)}h ({sleepChange.percent}%)
                    </span>
                  </div>
                )}
                {sleepChange.status === 'no-change' && (
                  <div className="flex items-center mt-1">
                    <MinusIcon className="w-4 h-4 text-gray-500 mr-1" />
                    <span className="text-xs text-gray-500">No change</span>
                  </div>
                )}
              </div>
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <BedIcon />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Status</span>
                <span>{todayData.sleepHours >= 7 ? 'Good' : 'Needs Improvement'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${todayData.sleepHours >= 7 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min((todayData.sleepHours / 9) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Weight Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm mb-1">Weight</p>
                <p className="text-2xl font-bold text-gray-800">{todayData.weight} <span className="text-lg text-gray-600">kg</span></p>
                {weightChange.status !== 'no-change' && (
                  <div className="flex items-center mt-1">
                    {weightChange.status === 'improvement' ? (
                      <ArrowDownIcon className="w-4 h-4 text-emerald-500 mr-1" />
                    ) : (
                      <ArrowUpIcon className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs font-medium ${weightChange.status === 'improvement' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {weightChange.value.toFixed(1)}kg ({weightChange.percent}%)
                    </span>
                  </div>
                )}
                {weightChange.status === 'no-change' && (
                  <div className="flex items-center mt-1">
                    <MinusIcon className="w-4 h-4 text-gray-500 mr-1" />
                    <span className="text-xs text-gray-500">No change</span>
                  </div>
                )}
              </div>
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                <ScaleIcon />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-600">
                Healthy range: 60-75 kg
              </div>
            </div>
          </div>

          {/* Height Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm mb-1">Height</p>
                <p className="text-2xl font-bold text-gray-800">{todayData.height} <span className="text-lg text-gray-600">cm</span></p>
                <div className="flex items-center mt-1">
                  <MinusIcon className="w-4 h-4 text-gray-500 mr-1" />
                  <span className="text-xs text-gray-500">Static measurement</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                <RulerIcon />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-600">
                Last updated: Mar 10, 2024
              </div>
            </div>
          </div>

          {/* BMI Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm mb-1">BMI</p>
                <p className="text-2xl font-bold text-gray-800">{todayBMI}</p>
                {bmiChange.status !== 'no-change' && (
                  <div className="flex items-center mt-1">
                    {bmiChange.status === 'improvement' ? (
                      <ArrowDownIcon className="w-4 h-4 text-emerald-500 mr-1" />
                    ) : (
                      <ArrowUpIcon className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs font-medium ${bmiChange.status === 'improvement' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {bmiChange.value.toFixed(1)} ({bmiChange.percent}%)
                    </span>
                  </div>
                )}
                {bmiChange.status === 'no-change' && (
                  <div className="flex items-center mt-1">
                    <MinusIcon className="w-4 h-4 text-gray-500 mr-1" />
                    <span className="text-xs text-gray-500">No change</span>
                  </div>
                )}
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <CalculatorIcon />
              </div>
            </div>
            <div className="mt-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${bmiCategory.bg} ${bmiCategory.color}`}>
                {bmiCategory.category}
              </span>
            </div>
          </div>
        </div>

        {/* Health Data Input Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Update Health Data</h2>
            <span className="text-sm text-gray-600">Today: {new Date().toLocaleDateString()}</span>
          </div>
          
          {isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sleep Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sleep Duration <span className="text-gray-500">(hours)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="24"
                      value={todayData.sleepHours}
                      onChange={(e) => handleInputChange('sleepHours', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., 7.5"
                    />
                    <span className="absolute right-3 top-3 text-gray-500">hrs</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Recommended: 7-9 hours</p>
                </div>

                {/* Weight Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight <span className="text-gray-500">(kg)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="30"
                      max="200"
                      value={todayData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., 68.5"
                    />
                    <span className="absolute right-3 top-3 text-gray-500">kg</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Enter current weight</p>
                </div>

                {/* Height Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height <span className="text-gray-500">(cm)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="100"
                      max="250"
                      value={todayData.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., 175"
                    />
                    <span className="absolute right-3 top-3 text-gray-500">cm</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Usually static</p>
                </div>
              </div>

              {/* BMI Preview */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Calculated BMI</p>
                    <p className="text-2xl font-bold text-gray-800">{todayBMI}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${bmiCategory.bg} ${bmiCategory.color}`}>
                      {bmiCategory.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Formula</p>
                    <p className="text-sm font-mono">weight / (height/100)²</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={saveTodayData}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl transition-all"
                >
                  Save Today's Data
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartIcon className="text-emerald-600 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Update your health metrics</h3>
              <p className="text-gray-600 mb-6">Track your daily progress and monitor improvements</p>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-8 rounded-xl transition-all"
              >
                Update Today's Data
              </button>
            </div>
          )}
        </div>

        {/* Health History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Health History</h2>
            <div className="text-sm text-gray-600">
              {healthData.length} records stored
            </div>
          </div>
          
          {/* History Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Sleep (hrs)</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Weight (kg)</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Height (cm)</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">BMI</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {healthData.map((record, index) => {
                  const prevRecord = healthData[index + 1];
                  const sleepTrend = prevRecord ? record.sleepHours - prevRecord.sleepHours : 0;
                  const weightTrend = prevRecord ? record.weight - prevRecord.weight : 0;
                  const bmiTrend = prevRecord ? record.bmi - prevRecord.bmi : 0;
                  const recordCategory = getBMICategory(record.bmi);

                  return (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <CalendarIcon className="text-gray-400 mr-2" />
                          <span className="font-medium">{formatDate(record.date)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="font-medium">{record.sleepHours}</span>
                          {sleepTrend > 0 ? (
                            <ArrowUpIcon className="w-4 h-4 text-emerald-500 ml-2" />
                          ) : sleepTrend < 0 ? (
                            <ArrowDownIcon className="w-4 h-4 text-red-500 ml-2" />
                          ) : null}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="font-medium">{record.weight}</span>
                          {weightTrend < 0 ? (
                            <ArrowDownIcon className="w-4 h-4 text-emerald-500 ml-2" />
                          ) : weightTrend > 0 ? (
                            <ArrowUpIcon className="w-4 h-4 text-red-500 ml-2" />
                          ) : null}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{record.height}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="font-medium">{record.bmi}</span>
                          {bmiTrend < 0 ? (
                            <ArrowDownIcon className="w-4 h-4 text-emerald-500 ml-2" />
                          ) : bmiTrend > 0 ? (
                            <ArrowUpIcon className="w-4 h-4 text-red-500 ml-2" />
                          ) : null}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${recordCategory.bg} ${recordCategory.color}`}>
                          {recordCategory.category}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {healthData.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No health records yet. Start tracking today!</p>
            </div>
          )}
        </div>

        {/* Logic Summary */}
        <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4">Health Tracking Logic Implemented:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg">
              <div className="flex items-center mb-2">
                <HeartIcon className="text-emerald-500 mr-2" />
                <span className="font-medium text-gray-800">BMI Calculation</span>
              </div>
              <p className="text-sm text-gray-600">BMI = weight (kg) / (height (m) × height (m))</p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <div className="flex items-center mb-2">
                <HeartIcon className="text-emerald-500 mr-2" />
                <span className="font-medium text-gray-800">Daily Comparison</span>
              </div>
              <p className="text-sm text-gray-600">Compares today's data with previous records</p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <div className="flex items-center mb-2">
                <HeartIcon className="text-emerald-500 mr-2" />
                <span className="font-medium text-gray-800">Data Validation</span>
              </div>
              <p className="text-sm text-gray-600">Validates realistic ranges, no negatives</p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <div className="flex items-center mb-2">
                <HeartIcon className="text-emerald-500 mr-2" />
                <span className="font-medium text-gray-800">Non-destructive Updates</span>
              </div>
              <p className="text-sm text-gray-600">Past records preserved, new entries added</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-gray-500 text-sm">
          <p>PlayPal Health Tracking • v2.1 • Track progress, improve performance</p>
          <p className="text-xs text-gray-400 mt-1">Note: This is a fitness tracking tool, not medical advice</p>
        </div>
      </div>
    </div>
  );
};

export default HealthPage;