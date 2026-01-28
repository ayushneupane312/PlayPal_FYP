import React, { useState, useRef } from 'react';
import PlayerSidebar from './PlayerSidebar';
import {
  Play,
  Eye,
  Heart,
  Upload,
  MapPin,
  Clock
} from 'lucide-react';

const HighlightsPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
      {/* Sidebar */}
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
      
      {/* Main Content - Dynamic margin based on sidebar state */}
      <div 
        className={`flex-1 p-6 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Highlights & Videos</h1>
            <p className="text-gray-600">Watch futsal highlights, live matches, and your uploaded videos</p>
          </div>
          
          {/* Upload Button */}
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-6 rounded-xl flex items-center transition-all">
            <Upload className="w-5 h-5 mr-2" /> Upload Video
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
                      <Play className="w-8 h-8 text-white" />
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
                        <Eye className="w-5 h-5 mr-2 text-gray-400" />
                        <span className="text-sm">{currentVideo.views}</span>
                      </div>
                      <div className="flex items-center">
                        <Heart className="w-5 h-5 mr-2 text-gray-400" />
                        <span className="text-sm">{currentVideo.likes}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-gray-400" />
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
                    <Play className="w-5 h-5 mr-2" /> Play Video
                  </button>
                  <button className="border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-xl hover:bg-gray-50 transition-all flex items-center">
                    <Heart className="w-5 h-5 mr-2" /> Like
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
                    <Play className="w-8 h-8" />
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold text-gray-800">2.4K</p>
                  </div>
                  <div className="text-blue-600">
                    <Eye className="w-8 h-8" />
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-600">Total Likes</p>
                    <p className="text-2xl font-bold text-gray-800">458</p>
                  </div>
                  <div className="text-red-500">
                    <Heart className="w-8 h-8" />
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
              className={`bg-white border rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer ${selectedVideo === video.id ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-100'}`}
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
                    <Play className="w-6 h-6 text-white" />
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
                      <Eye className="w-4 h-4 mr-1" />
                      <span className="text-xs">{video.views}</span>
                    </div>
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
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
                <Play className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">You uploaded a new video</p>
                <p className="text-sm text-gray-600">"My Match Highlights - vs Team Warriors"</p>
                <p className="text-xs text-gray-500 mt-1">Yesterday at 4:30 PM</p>
              </div>
            </div>
            
            <div className="flex items-start p-4 border border-gray-100 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Your video got 42 likes</p>
                <p className="text-sm text-gray-600">"Training Drills - Shooting Practice"</p>
                <p className="text-xs text-gray-500 mt-1">3 days ago</p>
              </div>
            </div>
            
            <div className="flex items-start p-4 border border-gray-100 rounded-xl">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <MapPin className="w-5 h-5 text-purple-600" />
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
              <Upload className="w-20 h-20 text-white/20" />
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