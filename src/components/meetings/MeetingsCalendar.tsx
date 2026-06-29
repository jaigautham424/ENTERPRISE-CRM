import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  FileText,
  Video
} from 'lucide-react';
import { Meeting, User as UserType } from '../../types';

interface MeetingsCalendarProps {
  meetings: Meeting[];
  users: UserType[];
  onAddMeeting: (meeting: Omit<Meeting, 'id' | 'status'>) => Promise<void>;
  onChangeMeetingStatus: (id: string, status: 'Scheduled' | 'Completed' | 'Canceled') => Promise<void>;
}

export default function MeetingsCalendar({
  meetings,
  users,
  onAddMeeting,
  onChangeMeetingStatus
}: MeetingsCalendarProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendees, setAttendees] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const addAttendee = (e: React.FormEvent) => {
    e.preventDefault();
    if (attendeeEmail.trim() && !attendees.includes(attendeeEmail.trim())) {
      setAttendees([...attendees, attendeeEmail.trim()]);
      setAttendeeEmail('');
    }
  };

  const removeAttendee = (email: string) => {
    setAttendees(attendees.filter(a => a !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !startTime || !endTime) return;
    setIsSubmitting(true);
    try {
      await onAddMeeting({
        title,
        description,
        date,
        startTime,
        endTime,
        attendees,
        hostId: 'current', // overwritten on server
        hostName: 'Current User'
      });
      // Clear form
      setTitle('');
      setDescription('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setAttendees([]);
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Canceled': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse';
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 select-none">
      {/* 1. Scheduler Form Panel */}
      <div className="xl:col-span-1">
        <div className="bg-[#111827] border border-white/10 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span>Calendar Booking</span>
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-1 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer text-xs"
            >
              {showAddForm ? 'View Guideline' : 'Schedule slot'}
            </button>
          </div>

          {!showAddForm ? (
            <div className="space-y-4 text-xs text-slate-400 leading-relaxed py-4">
              <div className="bg-[#111827]/40 p-4 rounded-xl border border-white/10 text-slate-300">
                <h4 className="font-bold text-white uppercase tracking-widest mb-1 text-[10px]">Active Synchronization</h4>
                Meetings booked inside CRM are dynamically integrated into exchange hosts and push real-time reminders to assignees.
              </div>
              <ul className="space-y-2 list-disc list-inside">
                <li>Automatic collision checking</li>
                <li>One-click follow-up scheduling</li>
                <li>Automatic log activities on close</li>
              </ul>
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/15 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Book New Event
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Briefing Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stark compliance Alignment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Details/Agenda</label>
                <textarea
                  rows={2}
                  placeholder="Review contract constraints and deployment scopes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#111827] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">End Time</label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Add Invitees */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Invite Attendees</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="invitee@client.com"
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={addAttendee}
                    className="px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {attendees.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {attendees.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1 bg-[#111827] border border-white/10 px-2 py-0.5 rounded-lg text-[10px] text-slate-300 font-medium"
                      >
                        <span className="truncate max-w-[120px]">{email}</span>
                        <button
                          type="button"
                          onClick={() => removeAttendee(email)}
                          className="text-red-400 hover:text-red-300 ml-1 font-bold cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="w-1/2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/10 transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Scheduling...' : 'Confirm'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* 2. Upcoming Meetings Grid Column */}
      <div className="xl:col-span-2 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">Booked Sessions</h3>
            <p className="text-xs text-slate-500 mt-0.5">SLA alignment and discovery schedule</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meetings.length === 0 ? (
            <div className="col-span-2 p-12 bg-[#111827] border border-white/10 rounded-2xl text-center text-xs text-slate-500">
              No briefs scheduled. Book a slot to start.
            </div>
          ) : (
            meetings.map((meet) => (
              <div 
                key={meet.id} 
                className="bg-[#111827] border border-white/10 hover:border-slate-500 p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-xl transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`px-2 py-0.5 border rounded text-[9px] font-bold uppercase tracking-wider ${getStatusClass(meet.status)}`}>
                      {meet.status}
                    </span>
                    
                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {meet.startTime} - {meet.endTime}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors line-clamp-1">{meet.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{meet.description || 'No description added.'}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">Host:</span>
                    <span className="text-xs font-semibold text-slate-300 truncate">{meet.hostName}</span>
                  </div>

                  {meet.attendees.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">Invited:</span>
                      <span className="text-[10px] text-blue-400 font-mono truncate">{meet.attendees.join(', ')}</span>
                    </div>
                  )}

                  {meet.status === 'Scheduled' && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => onChangeMeetingStatus(meet.id, 'Completed')}
                        className="flex-1 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" /> Completed
                      </button>
                      <button
                        onClick={() => onChangeMeetingStatus(meet.id, 'Canceled')}
                        className="flex-1 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3 h-3" /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
