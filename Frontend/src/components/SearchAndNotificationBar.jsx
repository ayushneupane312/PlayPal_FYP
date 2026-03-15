import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Users, Calendar, Trophy, AlertCircle, Check, CheckCheck } from 'lucide-react';
import notificationService from '../store/notificationService';

/**
 * Format date to relative time (e.g. "Just now", "5 min ago")
 */
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

/** Icon + colour per notification type */
const NOTIF_CONFIG = {
  team_invite:              { icon: <Users className="w-4 h-4" />,       color: 'text-emerald-600', bg: 'bg-emerald-50' },
  team_join_request:        { icon: <Users className="w-4 h-4" />,       color: 'text-blue-600',    bg: 'bg-blue-50'    },
  team_join_result:         { icon: <Trophy className="w-4 h-4" />,      color: 'text-amber-600',   bg: 'bg-amber-50'   },
  booking_created:          { icon: <Calendar className="w-4 h-4" />,    color: 'text-purple-600',  bg: 'bg-purple-50'  },
  booking_status:           { icon: <Calendar className="w-4 h-4" />,    color: 'text-purple-600',  bg: 'bg-purple-50'  },
  match_found:              { icon: <Trophy className="w-4 h-4" />,      color: 'text-emerald-600', bg: 'bg-emerald-50' },
  tournament_registration:   { icon: <Trophy className="w-4 h-4" />,      color: 'text-emerald-600', bg: 'bg-emerald-50' },
  tournament_created:       { icon: <Trophy className="w-4 h-4" />,      color: 'text-emerald-600', bg: 'bg-emerald-50' },
  tournament_update:        { icon: <Trophy className="w-4 h-4" />,      color: 'text-amber-600',   bg: 'bg-amber-50'   },
  admin_alert:              { icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-500',     bg: 'bg-red-50'     },
  system:                   { icon: <AlertCircle className="w-4 h-4" />, color: 'text-gray-500',    bg: 'bg-gray-100'   },
};

function getConfig(type) {
  return NOTIF_CONFIG[type] || NOTIF_CONFIG.system;
}

/**
 * Resolve navigation target for a notification.
 * team_invite → /player/team-invite/:teamId  (accept/decline page)
 * everything else → stored link, or a sensible fallback
 */
function resolveLink(notif) {
  if (notif.type === 'team_invite' && notif.meta?.teamId) {
    return `/player/team-invite/${notif.meta.teamId}`;
  }
  if (notif.link) return notif.link;

  const fallbacks = {
    team_join_request:        '/player/teams',
    team_join_result:         '/player/teams',
    booking_created:         '/player/mybookings',
    booking_status:          '/player/mybookings',
    match_found:             '/player/matchmaking',
    tournament_registration:  '/PlayersTournaments',
    tournament_created:       '/PlayersTournaments',
    tournament_update:       '/PlayersTournaments',
  };
  return fallbacks[notif.type] || null;
}

export default function SearchAndNotificationBar({
  onSearch,
  searchPlaceholder = 'Search anything...',
  className = '',
  showSearch = true,
  showTime = true
}) {
  const navigate = useNavigate();
  const [searchValue, setSearchValue]     = useState('');
  const [showDropdown, setShowDropdown]   = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);
  const [currentTime, setCurrentTime]     = useState(() =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  );

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      setNotifications(res?.data ?? []);
      setUnreadCount(res?.unreadCount ?? 0);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update clock every minute
  useEffect(() => {
    const t = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(t);
  }, []);

  // Initial load + 30-second background poll (keeps badge fresh)
  useEffect(() => {
    fetchNotifications();
    const poll = setInterval(fetchNotifications, 30000);
    return () => clearInterval(poll);
  }, [fetchNotifications]);

  // Also refresh whenever the dropdown is opened
  useEffect(() => {
    if (showDropdown) fetchNotifications();
  }, [showDropdown, fetchNotifications]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchValue);
  };

  // Mark a single notification read (called from the tick button)
  const handleMarkOneRead = async (notifId, e) => {
    e.stopPropagation(); // don't also trigger the row click
    try {
      await notificationService.markNotificationRead(notifId);
      setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, isRead: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  const handleNotificationClick = async (notif) => {
    // Mark read first
    if (!notif.isRead) {
      try {
        await notificationService.markNotificationRead(notif._id);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
        setUnreadCount(c => Math.max(0, c - 1));
      } catch { /* silent */ }
    }
    setShowDropdown(false);
    const dest = resolveLink(notif);
    if (dest) navigate(dest);
  };

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>

      {/* ── Search ─────────────────────────────────────────────── */}
      {showSearch && (
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-400"
          />
        </form>
      )}

      <div className="flex items-center gap-4 flex-shrink-0">

        {/* ── Bell + dropdown ─────────────────────────────────── */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(prev => !prev)}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-6 h-6 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-medium px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <>
              {/* Backdrop — closes dropdown on outside click */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
                aria-hidden="true"
              />

              <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">

                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      <CheckCheck className="w-4 h-4" /> Mark all read
                    </button>
                  )}
                </div>

                {/* Notification list */}
                <div className="max-h-96 overflow-auto">
                  {loading ? (
                    <div className="p-8 text-center text-gray-500 text-sm">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const { icon, color, bg } = getConfig(notif.type);
                      return (
                        <button
                          type="button"
                          key={notif._id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`w-full text-left flex gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition ${!notif.isRead ? 'bg-emerald-50/50' : ''}`}
                        >
                          {/* Coloured type icon */}
                          <div className={`w-9 h-9 ${bg} rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                            {icon}
                          </div>

                          {/* Text content */}
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium text-sm leading-snug ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notif.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-xs text-gray-400 mt-1 block">
                              {formatNotificationTime(notif.createdAt)}
                            </span>
                          </div>

                          {/* Unread dot + per-item mark-read button */}
                          {!notif.isRead && (
                            <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                              <span className="w-2 h-2 bg-blue-500 rounded-full" />
                              <button
                                type="button"
                                onClick={e => handleMarkOneRead(notif._id, e)}
                                className="text-gray-300 hover:text-emerald-600 transition mt-1"
                                title="Mark as read"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Clock ──────────────────────────────────────────── */}
        {showTime && (
          <span className="text-gray-600 text-sm font-medium tabular-nums">{currentTime}</span>
        )}
      </div>
    </div>
  );
}