import { useState, useEffect, useRef } from 'react';
import { Bell, Search, Terminal, Plus, ShieldCheck, Mail, Calendar, HelpCircle, Globe } from 'lucide-react';
import { Notification, User } from '../../types';
import { api } from '../../utils/api';

interface NavbarProps {
  currentUser: User | null;
  notifications: Notification[];
  onRefreshNotifications: () => void;
  onOpenQuickAction: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onOpenCommandPalette: () => void;
}

export default function Navbar({
  currentUser,
  notifications,
  onRefreshNotifications,
  onOpenQuickAction,
  searchTerm,
  setSearchTerm,
  onOpenCommandPalette
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.post('/api/notifications/read-all');
      onRefreshNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await api.post(`/api/notifications/${id}/read`);
      onRefreshNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-16 bg-[#0B1120]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 z-30 select-none">
      {/* Global Search and Command Palette Button */}
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder="Global Search (Ctrl + K)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={onOpenCommandPalette}
            className="w-full bg-white/5 border border-white/10 hover:border-slate-500 focus:border-blue-500 rounded-xl pl-10 pr-16 py-2 text-sm text-white outline-none transition-all placeholder-slate-500"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-slate-400">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Actions Pane */}
      <div className="flex items-center gap-4">
        {/* Quick Create Action Button */}
        <button
          onClick={onOpenQuickAction}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create Deal</span>
        </button>

        {/* Notifications Popover Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 border-2 border-[#0B1120] rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-80 bg-[#111827] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <span className="font-semibold text-xs text-white">Inbox Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto custom-scrollbar divide-y divide-white/10">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500">
                    No recent system updates.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkSingleRead(notif.id)}
                      className={`p-3.5 cursor-pointer hover:bg-white/5 transition-colors ${
                        !notif.read ? 'bg-blue-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 shrink-0">
                          {notif.type === 'Lead Assigned' && <Plus className="w-4 h-4 text-blue-400" />}
                          {notif.type === 'Meeting Reminder' && <Calendar className="w-4 h-4 text-amber-400" />}
                          {notif.type === 'Deal Closed' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                          {notif.type === 'System' && <Terminal className="w-4 h-4 text-purple-400" />}
                        </div>
                        <div>
                          <p className={`text-xs text-gray-200 ${!notif.read ? 'font-semibold' : ''}`}>
                            {notif.title}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                          <span className="text-[9px] text-gray-500 mt-1 block">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Beautiful high-fidelity User profile widget from Design HTML */}
        {currentUser && (
          <div className="flex items-center gap-3 pl-2 border-l border-white/10">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-white leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">{currentUser.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-400 p-[1.5px] shrink-0">
              <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden border border-slate-950">
                <img 
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                  alt={currentUser.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
