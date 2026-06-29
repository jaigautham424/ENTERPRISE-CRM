import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Target, 
  Users, 
  Kanban, 
  Mail, 
  Calendar, 
  BarChart3, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  UserCheck
} from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
}

export default function Sidebar({ currentTab, setCurrentTab, currentUser, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Sales Executive'] },
    { id: 'leads', label: 'Leads', icon: Target, roles: ['Admin', 'Manager', 'Sales Executive'] },
    { id: 'customers', label: 'Customers', icon: Users, roles: ['Admin', 'Manager', 'Sales Executive'] },
    { id: 'pipeline', label: 'Sales Pipeline', icon: Kanban, roles: ['Admin', 'Manager', 'Sales Executive'] },
    { id: 'communications', label: 'Communications', icon: Mail, roles: ['Admin', 'Manager', 'Sales Executive'] },
    { id: 'meetings', label: 'Meetings', icon: Calendar, roles: ['Admin', 'Manager', 'Sales Executive'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['Admin', 'Manager', 'Sales Executive'] },
    { id: 'users', label: 'Administration', icon: ShieldAlert, roles: ['Admin'] },
  ];

  const filteredItems = menuItems.filter(item => 
    !currentUser || item.roles.includes(currentUser.role)
  );

  return (
    <motion.div
      animate={{ width: isCollapsed ? '72px' : '260px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-[#111827] border-r border-white/10 flex flex-col justify-between relative select-none"
    >
      <div>
        {/* CRM Brand Logo */}
        <div className="h-16 flex items-center px-4 justify-between border-b border-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/30 shrink-0">
              C
            </div>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-lg text-white tracking-tight truncate"
              >
                CORE CRM
              </motion.span>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-4 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
                {/* Active Tooltip on Collapse */}
                {isCollapsed && (
                  <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-[#111827] border border-white/10 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Footer Profile Summary */}
      <div className="border-t border-white/10 p-3 space-y-3">
        {currentUser && !isCollapsed && (
          <div className="flex items-center gap-3 p-1">
            <img 
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
              alt={currentUser.name} 
              className="w-9 h-9 rounded-full object-cover border border-white/10"
            />
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-white truncate">{currentUser.name}</h4>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold truncate">
                {currentUser.role}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors group relative"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
          {isCollapsed && (
            <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>

        {/* Collapse Handle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 bg-[#111827] border border-white/10 hover:border-slate-500 rounded-full p-1 text-slate-400 hover:text-white transition-colors cursor-pointer hidden md:block"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </div>
    </motion.div>
  );
}
