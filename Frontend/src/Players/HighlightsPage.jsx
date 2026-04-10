import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import PlayerSidebar from './PlayerSidebar';
import {
  Play,
  Eye,
  Heart,
  Upload,
  Clock,
  Share2
} from 'lucide-react';
import { showToast } from '../FutsalOwner/components/Toast';

const STATIC_VIDEOS = {
  featured: [
    {
      id: 1,
      ytId: 'dQw4w9WgXcQ',
      title: 'Championship Final - Team Thunder vs Phoenix',
      description: 'Incredible last-minute goal secures championship victory',
      duration: '4:32',
      views: '15.2K',
      likes: '2.4K',
      date: '2 days ago',
      category: 'Tournament'
    },
    {
      id: 2,
      ytId: 'LDU_Txk06tM',
      title: 'Best Goals - Winter Futsal League 2024',
      description: 'Top 10 goals from the winter season',
      duration: '8:45',
      views: '8.7K',
      likes: '1.2K',
      date: '1 week ago',
      category: 'Compilation'
    },
    {
      id: 3,
      ytId: 'BHACKCNDMW8',
      title: 'Skills & Tricks Training Session',
      description: 'Pro player demonstrates advanced futsal techniques',
      duration: '12:15',
      views: '5.3K',
      likes: '845',
      date: '2 weeks ago',
      category: 'Training'
    }
  ],
  live: [
    {
      id: 4,
      ytId: '5qap5aO4i9A',
      title: 'LIVE: Team A vs Team B - League Match',
      description: 'Live coverage from National Futsal Arena',
      duration: 'LIVE',
      views: '1.2K watching',
      likes: '345',
      date: 'Now',
      category: 'Live',
      isLive: true
    },
    {
      id: 5,
      ytId: 'jfKfPfyJRdk',
      title: 'LIVE: Youth Tournament Quarter Finals',
      description: 'Under-18 championship matches',
      duration: 'LIVE',
      views: '856 watching',
      likes: '201',
      date: 'Now',
      category: 'Live',
      isLive: true
    }
  ],
  uploaded: [
    {
      id: 6,
      ytId: 'tgbNymZ7vqY',
      title: 'My Match Highlights - vs Team Warriors',
      description: 'Personal highlights from last weekend match',
      duration: '3:45',
      views: '156',
      likes: '42',
      date: 'Yesterday',
      category: 'Personal',
      isPersonal: true
    },
    {
      id: 7,
      ytId: 'CevxZvSJLk8',
      title: 'Training Drills - Shooting Practice',
      description: 'Recording of our team training session',
      duration: '6:20',
      views: '89',
      likes: '23',
      date: '3 days ago',
      category: 'Training',
      isPersonal: true
    }
  ]
};

const CATEGORY_FILTER = {
  all: () => true,
  tournament: (v) => v.category === 'Tournament' || v.category === 'Live',
  training: (v) => v.category === 'Training',
  personal: (v) => v.category === 'Personal',
  compilation: (v) => v.category === 'Compilation',
  custom: (v) => v.category === 'Custom' || v.isCustom
};

const HighlightsPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('featured');
  const [selectedVideo, setSelectedVideo] = useState(1);
  const [ytInput, setYtInput] = useState('');
  const [customVideos, setCustomVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedIds, setLikedIds] = useState({});
  const [autoplayToken, setAutoplayToken] = useState(0);
  const [loadPending, setLoadPending] = useState(false);

  const customIdRef = useRef(9000);
  const ytInputRef = useRef(null);
  const loadSectionRef = useRef(null);

  const baseAll = useMemo(
    () => [...STATIC_VIDEOS.featured, ...STATIC_VIDEOS.live, ...STATIC_VIDEOS.uploaded],
    []
  );

  const allVideos = useMemo(() => [...customVideos, ...baseAll], [customVideos, baseAll]);

  const currentVideo = useMemo(
    () => allVideos.find((v) => v.id === selectedVideo) || STATIC_VIDEOS.featured[0],
    [allVideos, selectedVideo]
  );

  useEffect(() => {
    setAutoplayToken(0);
  }, [currentVideo.ytId]);

  const extractYtId = useCallback((val) => {
    if (!val || typeof val !== 'string') return null;
    val = val.trim();
    const patterns = [
      /(?:youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#]|$)/,
      /(?:youtube\.com\/(?:watch\?[^#]*v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/,
      /[?&]v=([A-Za-z0-9_-]{11})(?:&|#|$)/
    ];
    for (const re of patterns) {
      const m = val.match(re);
      if (m) return m[1];
    }
    if (/^[A-Za-z0-9_-]{11}$/.test(val)) return val;
    return null;
  }, []);

  const fetchOEmbedMeta = async (ytId) => {
    try {
      const watchUrl = `https://www.youtube.com/watch?v=${ytId}`;
      const res = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`
      );
      if (!res.ok) return null;
      const data = await res.json();
      return {
        title: data.title || 'YouTube video',
        description: data.author_name ? `Channel: ${data.author_name}` : 'Loaded from your link.'
      };
    } catch {
      return null;
    }
  };

  const handleLoadCustomVideo = async () => {
    const id = extractYtId(ytInput);
    if (!id) {
      showToast.error('Could not find a valid YouTube video ID. Paste a full URL or 11-character ID.');
      return;
    }
    setLoadPending(true);
    const newId = customIdRef.current++;
    const placeholder = {
      id: newId,
      ytId: id,
      title: 'Loading video…',
      description: 'Fetching details from YouTube…',
      duration: '—',
      views: '—',
      likes: '—',
      date: 'Just now',
      category: 'Custom',
      isCustom: true
    };
    setCustomVideos((prev) => [placeholder, ...prev]);
    setSelectedVideo(newId);
    setYtInput('');

    const meta = await fetchOEmbedMeta(id);
    setCustomVideos((prev) =>
      prev.map((v) =>
        v.id === newId
          ? {
              ...v,
              title: meta?.title ?? 'YouTube video',
              description: meta?.description ?? 'Loaded from your link.'
            }
          : v
      )
    );
    setLoadPending(false);
    showToast.success('Video loaded');
  };

  const getEmbedUrl = (ytId, autoplay) => {
    const q = new URLSearchParams({ rel: '0' });
    if (autoplay) q.set('autoplay', '1');
    return `https://www.youtube.com/embed/${ytId}?${q.toString()}`;
  };

  const getThumbUrl = (ytId) => `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;

  const handlePlayVideo = () => {
    setAutoplayToken((t) => t + 1);
  };

  const handleLike = () => {
    const id = currentVideo.id;
    setLikedIds((prev) => {
      const next = !prev[id];
      if (next) showToast.success('Added to your likes on this device');
      return { ...prev, [id]: next };
    });
  };

  const handleShare = async () => {
    const url = `https://www.youtube.com/watch?v=${currentVideo.ytId}`;
    const title = currentVideo.title;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      showToast.success('YouTube link copied to clipboard');
    } catch (e) {
      if (e?.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(url);
        showToast.success('Link copied to clipboard');
      } catch {
        showToast.error('Could not share or copy link');
      }
    }
  };

  const scrollToLoadField = () => {
    loadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => ytInputRef.current?.focus(), 400);
  };

  const tabVideos = STATIC_VIDEOS[activeTab];
  const filteredTabVideos = useMemo(() => {
    const pred = CATEGORY_FILTER[selectedCategory] || CATEGORY_FILTER.all;
    return tabVideos.filter(pred);
  }, [tabVideos, selectedCategory]);

  const filteredCustom = useMemo(() => {
    const pred = CATEGORY_FILTER[selectedCategory] || CATEGORY_FILTER.all;
    return customVideos.filter(pred);
  }, [customVideos, selectedCategory]);

  const gridVideos = useMemo(() => [...filteredCustom, ...filteredTabVideos], [filteredCustom, filteredTabVideos]);

  const categoryCounts = useMemo(() => {
    const combined = [...customVideos, ...baseAll];
    return {
      all: combined.length,
      tournament: combined.filter(CATEGORY_FILTER.tournament).length,
      training: combined.filter(CATEGORY_FILTER.training).length,
      personal: combined.filter(CATEGORY_FILTER.personal).length,
      compilation: combined.filter(CATEGORY_FILTER.compilation).length,
      custom: combined.filter(CATEGORY_FILTER.custom).length
    };
  }, [customVideos, baseAll]);

  const categories = [
    { id: 'all', name: 'All Videos', count: categoryCounts.all },
    { id: 'tournament', name: 'Tournaments', count: categoryCounts.tournament },
    { id: 'training', name: 'Training', count: categoryCounts.training },
    { id: 'personal', name: 'Personal', count: categoryCounts.personal },
    { id: 'compilation', name: 'Compilations', count: categoryCounts.compilation },
    { id: 'custom', name: 'From link', count: categoryCounts.custom }
  ];

  const isLiked = !!likedIds[currentVideo.id];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div
        className={`flex-1 p-6 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Highlights & Videos</h1>
            <p className="text-gray-600">Watch futsal highlights, live matches, and your uploaded videos</p>
          </div>
          <button
            type="button"
            onClick={scrollToLoadField}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-6 rounded-xl flex items-center transition-all"
          >
            <Upload className="w-5 h-5 mr-2" /> Upload Video
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative bg-black aspect-video">
                <iframe
                  key={`${currentVideo.ytId}-${autoplayToken}`}
                  src={getEmbedUrl(currentVideo.ytId, autoplayToken > 0)}
                  title={currentVideo.title}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  style={{ border: 'none', display: 'block', width: '100%', height: '100%' }}
                />

                {currentVideo.isLive && (
                  <div className="absolute top-4 left-4 pointer-events-none">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
                      LIVE
                    </span>
                  </div>
                )}

                {currentVideo.isPersonal && (
                  <div className="absolute top-4 left-4 pointer-events-none">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      YOUR VIDEO
                    </span>
                  </div>
                )}

                {currentVideo.isCustom && (
                  <div className="absolute top-4 left-4 pointer-events-none">
                    <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      FROM LINK
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">{currentVideo.title}</h2>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1.5 text-gray-400" />
                        <span className="text-sm">{currentVideo.views}</span>
                      </div>
                      <div className="flex items-center">
                        <Heart
                          className={`w-4 h-4 mr-1.5 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
                        />
                        <span className="text-sm">{currentVideo.likes}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                        <span className="text-sm">{currentVideo.duration}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                    {currentVideo.category}
                  </span>
                </div>

                <p className="text-gray-600 mb-5">{currentVideo.description}</p>

                <div
                  ref={loadSectionRef}
                  className="border border-gray-200 rounded-xl p-4 mb-5 bg-gray-50 ring-2 ring-transparent focus-within:ring-emerald-400/40"
                >
                  <p className="text-sm font-medium text-gray-700 mb-2">Load a YouTube video</p>
                  <div className="flex gap-2">
                    <input
                      ref={ytInputRef}
                      type="text"
                      value={ytInput}
                      onChange={(e) => setYtInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !loadPending && handleLoadCustomVideo()}
                      placeholder="Paste YouTube URL or video ID…"
                      disabled={loadPending}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={handleLoadCustomVideo}
                      disabled={loadPending}
                      className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all shrink-0"
                    >
                      {loadPending ? '…' : 'Load'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    e.g. https://youtu.be/abc1234ABCD or https://www.youtube.com/watch?v=… or the 11-character ID
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handlePlayVideo}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-xl flex items-center transition-all"
                  >
                    <Play className="w-4 h-4 mr-2" /> Play Video
                  </button>
                  <button
                    type="button"
                    onClick={handleLike}
                    className={`border font-medium py-2 px-4 rounded-xl transition-all flex items-center ${
                      isLiked
                        ? 'border-red-300 bg-red-50 text-red-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />{' '}
                    {isLiked ? 'Liked' : 'Like'}
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-xl hover:bg-gray-50 transition-all flex items-center"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Categories</h2>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex justify-between items-center w-full p-3 rounded-xl transition-all text-left ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-50 ring-1 ring-emerald-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-gray-800">{cat.name}</span>
                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { key: 'featured', label: 'Featured Highlights' },
              { key: 'live', label: `Live Now (${STATIC_VIDEOS.live.length})` },
              { key: 'uploaded', label: `Your Uploads (${STATIC_VIDEOS.uploaded.length})` }
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`px-6 py-3 font-medium transition-all ${
                  activeTab === tab.key
                    ? 'text-emerald-600 border-b-2 border-emerald-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {gridVideos.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-12">
              No videos in this category for this tab. Try another category or tab.
            </p>
          ) : (
            gridVideos.map((video) => (
              <div
                key={video.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedVideo(video.id)}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedVideo(video.id)}
                className={`bg-white border rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer ${
                  selectedVideo === video.id
                    ? 'border-emerald-500 ring-1 ring-emerald-500'
                    : 'border-gray-100'
                }`}
              >
                <div className="relative aspect-video bg-gray-200 overflow-hidden">
                  <img
                    src={getThumbUrl(video.ytId)}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {video.isLive && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        LIVE
                      </span>
                    </div>
                  )}
                  {video.isPersonal && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                        YOURS
                      </span>
                    </div>
                  )}
                  {video.isCustom && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-amber-600 text-white px-2 py-1 rounded text-xs font-medium">
                        LINK
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-0.5 rounded text-xs font-medium">
                    {video.duration}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-1 line-clamp-2">{video.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3 text-gray-500">
                      <span className="flex items-center text-xs gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {video.views}
                      </span>
                      <span className="flex items-center text-xs gap-1">
                        <Heart
                          className={`w-3.5 h-3.5 ${likedIds[video.id] ? 'text-red-500 fill-red-500' : ''}`}
                        />
                        {video.likes}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{video.date}</span>
                  </div>
                  <div className="mt-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {video.category}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-gray-500 text-sm">
          <p>PlayPal Highlights • v2.1 • Capture the game, share the glory</p>
        </div>
      </div>
    </div>
  );
};

export default HighlightsPage;
