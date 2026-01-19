import React, { useState, useRef } from 'react';

const HighlightsPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('Highlights');
  const [activeTab, setActiveTab] = useState('featured');
  const [selectedVideo, setSelectedVideo] = useState(1);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoRef = useRef(null);
  
  // Video data
  const videos = {
    featured: [
      {
        id: 1,
        title: 'Championship Final - Team Thunder vs Phoenix',
        description: 'Incredible last-minute goal secures championship victory',
        duration: '4:32',
        views: '15.2K',
        likes: '2.4K',
        date: '2 days ago',
        thumbnail: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&h=225&fit=crop',
        category: 'Tournament'
      },
      {
        id: 2,
        title: 'Best Goals - Winter Futsal League 2024',
        description: 'Top 10 goals from the winter season',
        duration: '8:45',
        views: '8.7K',
        likes: '1.2K',
        date: '1 week ago',
        thumbnail: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w-400&h=225&fit=crop',
        category: 'Compilation'
      },
      {
        id: 3,
        title: 'Skills & Tricks Training Session',
        description: 'Pro player demonstrates advanced futsal techniques',
        duration: '12:15',
        views: '5.3K',
        likes: '845',
        date: '2 weeks ago',
        thumbnail: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=225&fit=crop',
        category: 'Training'
      }
    ],
    live: [
      {
        id: 4,
        title: 'LIVE: Team A vs Team B - League Match',
        description: 'Live coverage from National Futsal Arena',
        duration: 'LIVE',
        views: '1.2K watching',
        likes: '345',
        date: 'Now',
        thumbnail: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&h=225&fit=crop',
        category: 'Live',
        isLive: true
      },
      {
        id: 5,
        title: 'LIVE: Youth Tournament Quarter Finals',
        description: 'Under-18 championship matches',
        duration: 'LIVE',
        views: '856 watching',
        likes: '201',
        date: 'Now',
        thumbnail: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=400&h=225&fit=crop',
        category: 'Live',
        isLive: true
      }
    ],
    uploaded: [
      {
        id: 6,
        title: 'My Match Highlights - vs Team Warriors',
        description: 'Personal highlights from last weekend match',
        duration: '3:45',
        views: '156',
        likes: '42',
        date: 'Yesterday',
        thumbnail: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&h=225&fit=crop',
        category: 'Personal',
        isPersonal: true
      },
      {
        id: 7,
        title: 'Training Drills - Shooting Practice',
        description: 'Recording of our team training session',
        duration: '6:20',
        views: '89',
        likes: '23',
        date: '3 days ago',
        thumbnail: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=225&fit=crop',
        category: 'Training',
        isPersonal: true
      }
    ]
  };

  const categories = [
    { id: 'all', name: 'All Videos', count: 10 },
    { id: 'tournament', name: 'Tournaments', count: 4 },
    { id: 'training', name: 'Training', count: 3 },
    { id: 'personal', name: 'Personal', count: 2 },
    { id: 'compilation', name: 'Compilations', count: 1 }
  ];

  // Get current video
  const currentVideo = [...videos.featured, ...videos.live, ...videos.uploaded]
    .find(video => video.id === selectedVideo) || videos.featured[0];

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
  const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
  );

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
  );

  const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
  );

  const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  );

  const LiveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
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

  const TimeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  );

  // Handle video selection
  const handleVideoSelect = (videoId) => {
    setSelectedVideo(videoId);
    setVideoProgress(0);
  };

  // Handle video time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(progress || 0);
    }
  };

  // Simulate video play
  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
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
            <h1 className="text-3xl font-bold text-gray-800">Highlights & Videos</h1>
            <p className="text-gray-600">Watch futsal highlights, live matches, and your uploaded videos</p>
          </div>
          
          {/* Upload Button */}
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-6 rounded-xl flex items-center transition-all">
            <UploadIcon className="mr-2" /> Upload Video
          </button>
        </div>

        {/* Main Video Player Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Video Player - Larger Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Video Container */}
              <div className="relative bg-black aspect-video">
                {/* Video Player */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto">
                      <PlayIcon className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-white/80 text-sm">Click play to watch video</p>
                  </div>
                </div>
                
                {/* Video Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                  <div 
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${videoProgress}%` }}
                  ></div>
                </div>
                
                {/* Live Badge for Live Videos */}
                {currentVideo.isLive && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></span>
                      LIVE
                    </span>
                  </div>
                )}
                
                {/* Personal Badge for Uploaded Videos */}
                {currentVideo.isPersonal && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      YOUR VIDEO
                    </span>
                  </div>
                )}
              </div>
              
              {/* Video Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">{currentVideo.title}</h2>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center">
                        <EyeIcon className="mr-2 text-gray-400" />
                        <span className="text-sm">{currentVideo.views}</span>
                      </div>
                      <div className="flex items-center">
                        <HeartIcon className="mr-2 text-gray-400" />
                        <span className="text-sm">{currentVideo.likes}</span>
                      </div>
                      <div className="flex items-center">
                        <TimeIcon className="mr-2 text-gray-400" />
                        <span className="text-sm">{currentVideo.duration}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                    {currentVideo.category}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{currentVideo.description}</p>
                
                {/* Video Controls */}
                <div className="flex space-x-3">
                  <button 
                    onClick={handlePlayVideo}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-xl flex items-center transition-all"
                  >
                    <PlayIcon className="mr-2" /> Play Video
                  </button>
                  <button className="border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-xl hover:bg-gray-50 transition-all">
                    <HeartIcon className="inline mr-2" /> Like
                  </button>
                  <button className="border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-xl hover:bg-gray-50 transition-all">
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Stats & Categories */}
          <div>
            {/* Video Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Video Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-600">Total Videos</p>
                    <p className="text-2xl font-bold text-gray-800">12</p>
                  </div>
                  <div className="text-emerald-600">
                    <PlayIcon className="text-2xl" />
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold text-gray-800">2.4K</p>
                  </div>
                  <div className="text-blue-600">
                    <EyeIcon className="text-2xl" />
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-600">Total Likes</p>
                    <p className="text-2xl font-bold text-gray-800">458</p>
                  </div>
                  <div className="text-red-500">
                    <HeartIcon className="text-2xl" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Categories */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Categories</h2>
              <div className="space-y-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className="flex justify-between items-center w-full p-3 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    <span className="text-gray-800">{category.name}</span>
                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Video Tabs */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`px-6 py-3 font-medium ${activeTab === 'featured' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('featured')}
            >
              Featured Highlights
            </button>
            <button
              className={`px-6 py-3 font-medium ${activeTab === 'live' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('live')}
            >
              Live Now ({videos.live.length})
            </button>
            <button
              className={`px-6 py-3 font-medium ${activeTab === 'uploaded' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('uploaded')}
            >
              Your Uploads ({videos.uploaded.length})
            </button>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {videos[activeTab].map((video) => (
            <div 
              key={video.id} 
              className={`border rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer ${selectedVideo === video.id ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-100'}`}
              onClick={() => handleVideoSelect(video.id)}
            >
              {/* Thumbnail */}
              <div className="relative bg-gray-200 aspect-video">
                {/* Live Badge */}
                {video.isLive && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-1.5"></span>
                      LIVE
                    </span>
                  </div>
                )}
                
                {/* Personal Badge */}
                {video.isPersonal && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                      YOURS
                    </span>
                  </div>
                )}
                
                {/* Duration */}
                <div className="absolute bottom-3 right-3 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                  {video.duration}
                </div>
                
                {/* Play Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <PlayIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Video Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{video.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      <span className="text-xs">{video.views}</span>
                    </div>
                    <div className="flex items-center">
                      <HeartIcon className="w-4 h-4 mr-1" />
                      <span className="text-xs">{video.likes}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{video.date}</span>
                </div>
                
                {/* Category */}
                <div className="mt-3">
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                    {video.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
            <button className="text-emerald-600 hover:text-emerald-700 font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start p-4 border border-gray-100 rounded-xl">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                <PlayIcon className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">You uploaded a new video</p>
                <p className="text-sm text-gray-600">"My Match Highlights - vs Team Warriors"</p>
                <p className="text-xs text-gray-500 mt-1">Yesterday at 4:30 PM</p>
              </div>
            </div>
            
            <div className="flex items-start p-4 border border-gray-100 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <HeartIcon className="text-red-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Your video got 42 likes</p>
                <p className="text-sm text-gray-600">"Training Drills - Shooting Practice"</p>
                <p className="text-xs text-gray-500 mt-1">3 days ago</p>
              </div>
            </div>
            
            <div className="flex items-start p-4 border border-gray-100 rounded-xl">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <LiveIcon className="text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">New live match started</p>
                <p className="text-sm text-gray-600">"Team A vs Team B - League Match"</p>
                <p className="text-xs text-gray-500 mt-1">Currently live</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Share Your Moments</h2>
              <p className="text-emerald-100 mb-4">Upload match highlights, training videos, or epic goals</p>
              <button className="bg-white text-emerald-600 hover:bg-gray-100 font-medium py-2 px-6 rounded-xl transition-all">
                Upload Video
              </button>
            </div>
            <div className="text-right">
              <UploadIcon className="text-5xl text-white/20" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-gray-500 text-sm">
          <p>PlayPal Highlights • v2.1 • Capture the game, share the glory</p>
        </div>
        
        {/* Hidden Video Element for Progress Simulation */}
        <video 
          ref={videoRef}
          className="hidden"
          onTimeUpdate={handleTimeUpdate}
          src=""
        />
      </div>
    </div>
  );
};

export default HighlightsPage;