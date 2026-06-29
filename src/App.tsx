import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  X, 
  Briefcase, 
  DollarSign, 
  Target, 
  AlertCircle,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

// API & Types
import { api } from './utils/api';
import { User, Lead, Customer, Activity, Email, Meeting, Notification, LeadStatus, LeadPriority } from './types';

// Page Views Components
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import LoginView from './components/auth/LoginView';
import StatCard from './components/dashboard/StatCard';
import RevenueChart from './components/dashboard/RevenueChart';
import LeadTable from './components/leads/LeadTable';
import LeadSlideOver from './components/leads/LeadSlideOver';
import KanbanBoard from './components/pipeline/KanbanBoard';
import EmailComposer from './components/communications/EmailComposer';
import MeetingsCalendar from './components/meetings/MeetingsCalendar';
import ReportsView from './components/reports/ReportsView';
import UserAdminPanel from './components/users/UserAdminPanel';
import CustomersView from './components/customers/CustomersView';

export default function App() {
  // Auth sessions
  const [token, setToken] = useState<string | null>(localStorage.getItem('crm_token'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Navigation
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // Domain states
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Selection states
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  // Modals visibility toggles
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Quick Action form states
  const [qaName, setQaName] = useState('');
  const [qaEmail, setQaEmail] = useState('');
  const [qaCompany, setQaCompany] = useState('');
  const [qaValue, setQaValue] = useState('');
  const [qaPriority, setQaPriority] = useState<LeadPriority>('Medium');
  const [qaStatus, setQaStatus] = useState<LeadStatus>('New');

  const [isSubmittingQuickAction, setIsSubmittingQuickAction] = useState(false);

  // Load User Info if token exists on mount
  useEffect(() => {
    if (token) {
      localStorage.setItem('crm_token', token);
      fetchMe();
    } else {
      setCurrentUser(null);
    }
  }, [token]);

  // Command Palette Ctrl + K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchMe = async () => {
    try {
      const res = await api.get<{ user: User }>('/api/auth/me');
      setCurrentUser(res.user);
      loadAllDomainData();
    } catch (e) {
      // Clear expired token session
      handleLogout();
    }
  };

  const loadAllDomainData = async () => {
    try {
      const [
        dash,
        leadsList,
        custsList,
        actsList,
        emailsList,
        meetsList,
        notifsList,
        usersList
      ] = await Promise.all([
        api.get<any>('/api/dashboard'),
        api.get<Lead[]>('/api/leads'),
        api.get<Customer[]>('/api/customers'),
        api.get<Activity[]>('/api/activities'),
        api.get<Email[]>('/api/emails'),
        api.get<Meeting[]>('/api/meetings'),
        api.get<Notification[]>('/api/notifications'),
        api.get<User[]>('/api/auth/users')
      ]);

      setDashboardData(dash);
      setLeads(leadsList);
      setCustomers(custsList);
      setActivities(actsList);
      setEmails(emailsList);
      setMeetings(meetsList);
      setNotifications(notifsList);
      setUsers(usersList);
    } catch (err) {
      console.error('Failed to load domain assets', err);
    }
  };

  const handleLoginSuccess = (newToken: string, user: User) => {
    setToken(newToken);
    setCurrentUser(user);
    localStorage.setItem('crm_token', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('crm_token');
  };

  const refreshDashboardOnly = async () => {
    try {
      const dash = await api.get<any>('/api/dashboard');
      setDashboardData(dash);
    } catch (e) {
      console.error(e);
    }
  };

  // Add notes to a lead
  const handleAddLeadNote = async (leadId: string, text: string) => {
    try {
      await api.post(`/api/leads/${leadId}/notes`, { body: text });
      // Reload lists
      const updatedLeads = await api.get<Lead[]>('/api/leads');
      setLeads(updatedLeads);
      // Keep selected lead sync'd
      const match = updatedLeads.find(l => l.id === leadId);
      if (match) setSelectedLead(match);
      loadAllDomainData();
    } catch (err) {
      console.error(err);
    }
  };

  // Move Lead Status (Kanban D&D)
  const handleMoveLead = async (leadId: string, status: LeadStatus) => {
    try {
      await api.patch(`/api/pipeline/move`, { leadId, status });
      loadAllDomainData();
    } catch (err) {
      console.error(err);
    }
  };

  // Convert Lead to Customer
  const handleConvertLead = async (leadId: string, industry: string, address: string) => {
    try {
      await api.post(`/api/leads/${leadId}/convert`, { industry, address });
      loadAllDomainData();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Lead
  const handleDeleteLead = async (leadId: string) => {
    try {
      await api.delete(`/api/leads/${leadId}`);
      loadAllDomainData();
    } catch (err) {
      console.error(err);
    }
  };

  // Create Quick Inbound Lead Action
  const handleCreateQuickLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaName || !qaEmail || !qaCompany) return;
    setIsSubmittingQuickAction(true);
    try {
      await api.post('/api/leads', {
        name: qaName,
        email: qaEmail,
        company: qaCompany,
        value: qaValue ? Number(qaValue) : 0,
        priority: qaPriority,
        status: qaStatus
      });
      // Reset form fields
      setQaName('');
      setQaEmail('');
      setQaCompany('');
      setQaValue('');
      setQaPriority('Medium');
      setQaStatus('New');
      setIsQuickActionOpen(false);
      loadAllDomainData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingQuickAction(false);
    }
  };

  // Meeting schedule handler
  const handleAddMeeting = async (meeting: Omit<Meeting, 'id' | 'status'>) => {
    try {
      await api.post('/api/meetings', meeting);
      loadAllDomainData();
    } catch (err) {
      console.error(err);
    }
  };

  // Update meeting status
  const handleChangeMeetingStatus = async (id: string, status: 'Scheduled' | 'Completed' | 'Canceled') => {
    try {
      await api.patch(`/api/meetings/${id}/status`, { status });
      loadAllDomainData();
    } catch (err) {
      console.error(err);
    }
  };

  // Open lead slideover from anywhere (Table, Kanban, Command Palette)
  const openLeadProfile = (lead: Lead) => {
    setSelectedLead(lead);
    setIsSlideOverOpen(true);
  };

  if (!token || !currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Filter Command Palette search results
  const filteredPaletteLeads = searchTerm.trim() 
    ? leads.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.company.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const filteredPaletteCustomers = searchTerm.trim()
    ? customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.company.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  return (
    <div className="flex h-screen bg-[#0b1120] text-gray-100 overflow-hidden font-sans">
      
      {/* 1. Global collapsible Collateral sidebar */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        currentUser={currentUser} 
        onLogout={handleLogout} 
      />

      {/* 2. Executive main layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Navigations bar */}
        <Navbar 
          currentUser={currentUser} 
          notifications={notifications}
          onRefreshNotifications={() => {
            api.get<Notification[]>('/api/notifications').then(setNotifications);
            refreshDashboardOnly();
          }}
          onOpenQuickAction={() => setIsQuickActionOpen(true)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Primary Page Canvas */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              
              {/* RENDER ACTIVE PAGE VIEW */}
              {currentTab === 'dashboard' && dashboardData && (
                <div className="space-y-6">
                  {/* KPI cards grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard 
                      title="Total Pipeline Leads" 
                      value={leads.length} 
                      icon={Target} 
                      trend="up" 
                      trendValue={12.4} 
                      color="blue"
                    />
                    <StatCard 
                      title="Realized Revenue" 
                      value={`$${dashboardData.metrics.totalRevenue.toLocaleString()}`} 
                      icon={DollarSign} 
                      trend="up" 
                      trendValue={15.4} 
                      color="emerald"
                    />
                    <StatCard 
                      title="Conversion Ratio" 
                      value={`${dashboardData.metrics.conversionRate}%`} 
                      icon={Briefcase} 
                      trend="up" 
                      trendValue={3.2} 
                      color="purple"
                    />
                    <StatCard 
                      title="Meetings Booked" 
                      value={meetings.filter(m => m.status === 'Scheduled').length} 
                      icon={Clock} 
                      color="purple"
                    />
                  </div>

                  {/* Recharts Area and funnel grids */}
                  <RevenueChart 
                    revenueData={dashboardData.revenueChartData} 
                    funnelData={dashboardData.funnelData} 
                  />

                  {/* Quick Activity Lists feed & Agent Leaderboard */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Activity Feed */}
                    <div className="lg:col-span-2 bg-[#111827] border border-[#1f2937] p-5 rounded-xl flex flex-col justify-between">
                      <div className="mb-4">
                        <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest">Active Operations logs</h4>
                        <p className="text-xs text-gray-500 mt-1">Real-time audit trails of B2B CRM interactions</p>
                      </div>
                      
                      <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                        {activities.length === 0 ? (
                          <p className="text-xs text-gray-500 italic text-center py-6">No historical system logs.</p>
                        ) : (
                          activities.slice(0, 5).map((act) => (
                            <div key={act.id} className="p-3 bg-[#0b1120]/40 rounded-lg border border-[#1f2937]/50 text-xs flex justify-between items-start">
                              <div>
                                <span className="font-bold text-white">{act.title}</span>
                                <p className="text-gray-400 mt-1 leading-relaxed">{act.description}</p>
                              </div>
                              <span className="text-[9px] text-gray-500 shrink-0 font-mono">
                                {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Agent Leaderboard */}
                    <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl">
                      <div className="mb-4">
                        <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest">Staff Performance Quotas</h4>
                        <p className="text-xs text-gray-500 mt-1">Closed-won quotas leaderboard rankings</p>
                      </div>

                      <div className="space-y-3.5">
                        {dashboardData.leaderboard.map((u: any, idx: number) => (
                          <div key={u.userId} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="font-bold text-gray-500 w-4">#{idx+1}</span>
                              <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover border border-[#1f2937]" />
                              <div className="truncate">
                                <span className="font-semibold text-gray-200 block truncate">{u.name}</span>
                                <span className="text-[10px] text-gray-500 block truncate">{u.role}</span>
                              </div>
                            </div>
                            <span className="font-mono text-emerald-400 font-bold shrink-0">${u.totalSales.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentTab === 'leads' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-2 border-b border-[#1f2937]">
                    <div>
                      <h3 className="text-lg font-bold text-white">Deal Opportunities Directory</h3>
                      <p className="text-xs text-gray-400 mt-1">Acquire, enrich, and convert pipeline prospects into portfolio contracts</p>
                    </div>
                  </div>
                  <LeadTable 
                    leads={leads} 
                    onSelectLead={openLeadProfile} 
                    onDeleteLead={handleDeleteLead}
                    currentUser={currentUser}
                    users={users}
                  />
                </div>
              )}

              {currentTab === 'customers' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-2 border-b border-[#1f2937]">
                    <div>
                      <h3 className="text-lg font-bold text-white">Client Portfolio Profiles</h3>
                      <p className="text-xs text-gray-400 mt-1">Verify agreements, log transactional values, and track SLA satisfaction</p>
                    </div>
                  </div>
                  <CustomersView 
                    customers={customers} 
                    users={users}
                    onRefreshCustomers={() => {
                      api.get<Customer[]>('/api/customers').then(setCustomers);
                      api.get<Activity[]>('/api/activities').then(setActivities);
                      refreshDashboardOnly();
                    }}
                  />
                </div>
              )}

              {currentTab === 'pipeline' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-2 border-b border-[#1f2937]">
                    <div>
                      <h3 className="text-lg font-bold text-white">Sales Pipeline Kanban</h3>
                      <p className="text-xs text-gray-400 mt-1">Fluidly drag, drop, and progress deals through structured stages</p>
                    </div>
                  </div>
                  <KanbanBoard 
                    leads={leads} 
                    users={users}
                    onMoveLead={handleMoveLead}
                    onSelectLead={openLeadProfile}
                  />
                </div>
              )}

              {currentTab === 'communications' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-2 border-b border-[#1f2937]">
                    <div>
                      <h3 className="text-lg font-bold text-white">Smart Outreach Terminal</h3>
                      <p className="text-xs text-gray-400 mt-1">Draft responsive sales copy with Gemini, deploy templates, and monitor outbox logs</p>
                    </div>
                  </div>
                  <EmailComposer 
                    currentUser={currentUser} 
                    emails={emails} 
                    onRefreshEmails={() => {
                      api.get<Email[]>('/api/emails').then(setEmails);
                      api.get<Activity[]>('/api/activities').then(setActivities);
                    }}
                  />
                </div>
              )}

              {currentTab === 'meetings' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-2 border-b border-[#1f2937]">
                    <div>
                      <h3 className="text-lg font-bold text-white">Schedules & Calendar Briefings</h3>
                      <p className="text-xs text-gray-400 mt-1">Coordinate timelines, book appointments, and track briefings outcomes</p>
                    </div>
                  </div>
                  <MeetingsCalendar 
                    meetings={meetings} 
                    users={users} 
                    onAddMeeting={handleAddMeeting}
                    onChangeMeetingStatus={handleChangeMeetingStatus}
                  />
                </div>
              )}

              {currentTab === 'reports' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-2 border-b border-[#1f2937]">
                    <div>
                      <h3 className="text-lg font-bold text-white">Business Intelligence Reports</h3>
                      <p className="text-xs text-gray-400 mt-1">Analyze geographical contribution ratios and download spreadsheet compliance audits</p>
                    </div>
                  </div>
                  <ReportsView leads={leads} customers={customers} />
                </div>
              )}

              {currentTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-2 border-b border-[#1f2937]">
                    <div>
                      <h3 className="text-lg font-bold text-white">Administration Governance Center</h3>
                      <p className="text-xs text-gray-400 mt-1">Provision staff credentials, assign permissions, and activate/deactivate seats</p>
                    </div>
                  </div>
                  <UserAdminPanel 
                    users={users} 
                    onRefreshUsers={() => api.get<User[]>('/api/auth/users').then(setUsers)}
                  />
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* 3. Detail Slide-Over Drawer for opportunities */}
      <AnimatePresence>
        {isSlideOverOpen && (
          <LeadSlideOver 
            isOpen={isSlideOverOpen} 
            onClose={() => { setIsSlideOverOpen(false); setSelectedLead(null); }}
            lead={selectedLead}
            users={users}
            onAddNote={handleAddLeadNote}
            onConvertLead={handleConvertLead}
          />
        )}
      </AnimatePresence>

      {/* 4. Quick Action Modal Lead Registration Form */}
      {isQuickActionOpen && (
        <div className="fixed inset-0 bg-[#0b1120]/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#111827] border border-[#1f2937] rounded-xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-[#1f2937]">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" />
                <span>Register Inbound Opportunity</span>
              </h4>
              <button 
                onClick={() => setIsQuickActionOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#1f2937] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuickLead} className="space-y-3.5 text-xs text-gray-300">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Contact Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elon Musk"
                    value={qaName}
                    onChange={(e) => setQaName(e.target.value)}
                    className="w-full bg-[#0b1120] border border-[#1f2937] focus:border-blue-500 rounded p-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Company Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SpaceX"
                    value={qaCompany}
                    onChange={(e) => setQaCompany(e.target.value)}
                    className="w-full bg-[#0b1120] border border-[#1f2937] focus:border-blue-500 rounded p-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Inbound Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@corporation.com"
                  value={qaEmail}
                  onChange={(e) => setQaEmail(e.target.value)}
                  className="w-full bg-[#0b1120] border border-[#1f2937] focus:border-blue-500 rounded p-2 text-white outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Contract value $</label>
                  <input
                    type="number"
                    placeholder="e.g. 150000"
                    value={qaValue}
                    onChange={(e) => setQaValue(e.target.value)}
                    className="w-full bg-[#0b1120] border border-[#1f2937] focus:border-blue-500 rounded p-2 text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Priority</label>
                  <select
                    value={qaPriority}
                    onChange={(e) => setQaPriority(e.target.value as any)}
                    className="w-full bg-[#0b1120] border border-[#1f2937] focus:border-blue-500 rounded p-1.5 text-gray-300 outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Deal Stage Status</label>
                <select
                  value={qaStatus}
                  onChange={(e) => setQaStatus(e.target.value as any)}
                  className="w-full bg-[#0b1120] border border-[#1f2937] focus:border-blue-500 rounded p-1.5 text-gray-300 outline-none"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsQuickActionOpen(false)}
                  className="w-1/2 py-2 bg-[#1f2937] hover:bg-[#374151] rounded text-white font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuickAction}
                  className="w-1/2 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-bold transition-colors cursor-pointer"
                >
                  {isSubmittingQuickAction ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 5. Command Palette Search Overlay */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 bg-[#0b1120]/75 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-20 select-none" onClick={() => setIsCommandPaletteOpen(false)}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-[#111827] border border-[#1f2937] rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-4 border-b border-[#1f2937] flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                autoFocus
                placeholder="Type name, company or industry... (ESC to close)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none placeholder-gray-500 font-medium"
                onKeyDown={(e) => { if (e.key === 'Escape') setIsCommandPaletteOpen(false); }}
              />
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto custom-scrollbar p-2 divide-y divide-[#1f2937]/50">
              {!searchTerm.trim() ? (
                <div className="p-8 text-center text-xs text-gray-500">
                  Type a search term above to find matching records instantly.
                </div>
              ) : (filteredPaletteLeads.length === 0 && filteredPaletteCustomers.length === 0) ? (
                <div className="p-8 text-center text-xs text-gray-500">
                  No matching leads or customer profiles found.
                </div>
              ) : (
                <>
                  {/* Lead Matches */}
                  {filteredPaletteLeads.length > 0 && (
                    <div className="p-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-2 block mb-1">Matched Lead Pipeline</span>
                      {filteredPaletteLeads.map(l => (
                        <div
                          key={l.id}
                          onClick={() => { openLeadProfile(l); setIsCommandPaletteOpen(false); }}
                          className="p-2 hover:bg-[#1f2937] rounded-lg cursor-pointer transition-colors flex justify-between items-center"
                        >
                          <div>
                            <span className="text-xs font-semibold text-white block">{l.name}</span>
                            <span className="text-[10px] text-gray-400 block mt-0.5">{l.company} • {l.status}</span>
                          </div>
                          <span className="text-xs font-mono text-blue-400 font-bold">${l.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Customer Matches */}
                  {filteredPaletteCustomers.length > 0 && (
                    <div className="p-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-2 block mb-1">Matched Client Accounts</span>
                      {filteredPaletteCustomers.map(c => (
                        <div
                          key={c.id}
                          onClick={() => { setCurrentTab('customers'); setIsCommandPaletteOpen(false); }}
                          className="p-2 hover:bg-[#1f2937] rounded-lg cursor-pointer transition-colors flex justify-between items-center"
                        >
                          <div>
                            <span className="text-xs font-semibold text-white block">{c.name}</span>
                            <span className="text-[10px] text-gray-400 block mt-0.5">{c.company} • Converted ({c.industry})</span>
                          </div>
                          <span className="text-xs font-mono text-emerald-400 font-bold">${c.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
