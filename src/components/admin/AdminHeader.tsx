'use client';

import { useState, useEffect, useCallback } from 'react';
import { Menu, Search, Bell, ChevronDown, CheckCheck, FileText, UserCheck, MessageSquare, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  onMenuToggle: () => void;
  title?: string;
  subtitle?: string;
}

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  reference?: string | null;
  read: boolean;
  createdAt: string;
}

function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminHeader({
  onMenuToggle,
  title = 'Overview',
  subtitle,
}: AdminHeaderProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling every 15s for live updates
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string, ref?: string | null, type?: string) => {
    try {
      await fetch(`/api/admin/notifications/${id}`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification read:', err);
    }

    setShowNotifications(false);

    // Deep linking logic based on notification type and reference
    if (ref) {
      if (type === 'registration_received' || type === 'verification_updated') {
        router.push(`/admin/landowners/${ref}`);
        return;
      }
      if (type === 'enquiry_received' || type === 'enquiry_status_updated') {
        router.push(`/admin/enquiries`);
        return;
      }
      if (type === 'document_uploaded') {
        router.push(`/admin/documents`);
        return;
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/admin/notifications/read-all', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    router.push('/admin/login');
  };

  return (
    <header className="sticky top-0 z-30 h-[72px] bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Header Title */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Open Sidebar Menu"
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-foreground hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:block">
          <h1 className="text-[17px] font-bold text-foreground tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[12px] text-gray-500 line-clamp-1">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Center: Search input */}
      <div className="flex-1 max-w-[420px] mx-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick search across modules..."
            className="w-full bg-[#F8F9FA] hover:bg-gray-100 focus:bg-white border border-gray-200 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 rounded-full pl-9 pr-4 py-2 text-[13px] text-foreground placeholder:text-gray-400 transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 hover:text-gray-600"
            >
              clear
            </button>
          )}
        </div>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-2 md:gap-3.5">
        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            aria-label="Notifications"
            className="relative p-2 rounded-full text-gray-600 hover:text-foreground hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Bell size={18} />
            {/* Notification Badge with Live Unread Count */}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white animate-in zoom-in-50">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-2xl border border-gray-200/90 shadow-[0_12px_36px_-4px_rgba(0,0,0,0.12)] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-foreground">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 uppercase">
                      {unreadCount} New
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck size={13} />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 text-[12px] divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-gray-400">
                    <Bell size={24} className="mx-auto mb-1.5 text-gray-300 opacity-60" />
                    <p className="font-semibold text-gray-600">No notifications</p>
                    <p className="text-[11px]">System events will appear here.</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isUnread = !n.read;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleMarkAsRead(n.id, n.reference, n.type)}
                        className={`pt-2 p-2.5 rounded-xl transition-all cursor-pointer ${
                          isUnread
                            ? 'bg-[#0E2115]/[0.03] hover:bg-[#0E2115]/[0.07] border border-gray-200/70'
                            : 'hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 shrink-0 text-primary">
                              {n.type?.includes('registration') ? (
                                <UserCheck size={14} className="text-emerald-600" />
                              ) : n.type?.includes('document') ? (
                                <FileText size={14} className="text-blue-600" />
                              ) : (
                                <MessageSquare size={14} className="text-accent" />
                              )}
                            </span>
                            <div>
                              <p
                                className={`text-[12px] ${
                                  isUnread ? 'font-bold text-foreground' : 'font-medium text-gray-700'
                                }`}
                              >
                                {n.title}
                              </p>
                              <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">
                                {n.message}
                              </p>
                              {n.reference && (
                                <span className="font-mono text-[10px] text-gray-400 mt-1 block">
                                  Ref: {n.reference}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0">
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">
                              {timeAgo(n.createdAt)}
                            </span>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-accent mt-1.5" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1 md:pl-2 md:pr-3 rounded-full hover:bg-gray-100 transition-colors select-none cursor-pointer"
          >
            {/* Avatar Circle */}
            <div className="w-8 h-8 rounded-full bg-[#0E2115] text-accent flex items-center justify-center font-bold text-[13px] shadow-xs">
              A
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-[13px] font-bold text-foreground leading-tight">
                Admin
              </span>
              <span className="text-[11px] text-gray-500 leading-tight">
                Operations
              </span>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden md:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] p-2 z-50">
              <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <p className="text-[13px] font-bold text-foreground">
                  Trinfra Staff
                </p>
                <p className="text-[11px] text-gray-400">
                  operations@trinfra.demo
                </p>
              </div>
              <Link
                href="/admin/settings"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Settings & Preferences
              </Link>
              <Link
                href="/"
                target="_blank"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                View Public Website
              </Link>
              <div className="border-t border-gray-100 my-1 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-[12px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>Log out of Admin</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
