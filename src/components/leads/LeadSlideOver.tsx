import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Mail, 
  Phone, 
  Building, 
  DollarSign, 
  Clock, 
  Briefcase, 
  FileText, 
  Send,
  UserCheck,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { Lead, User } from '../../types';

interface LeadSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  users: User[];
  onAddNote: (leadId: string, noteText: string) => Promise<void>;
  onConvertLead: (leadId: string, industry: string, address: string) => Promise<void>;
}

export default function LeadSlideOver({
  isOpen,
  onClose,
  lead,
  users,
  onAddNote,
  onConvertLead
}: LeadSlideOverProps) {
  const [noteText, setNoteText] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  
  // Lead conversion wizard states
  const [showConvertForm, setShowConvertForm] = useState(false);
  const [industry, setIndustry] = useState('Technology');
  const [address, setAddress] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  if (!isOpen || !lead) return null;

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setIsSubmittingNote(true);
    try {
      await onAddNote(lead.id, noteText);
      setNoteText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConverting(true);
    try {
      await onConvertLead(lead.id, industry, address);
      setShowConvertForm(false);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsConverting(false);
    }
  };

  const getAssigneeName = (id?: string) => {
    if (!id) return 'Unassigned';
    return users.find(u => u.id === id)?.name || 'Unknown Agent';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop glass blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0b1120]/60 backdrop-blur-sm transition-opacity"
        />

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 220 }}
            className="pointer-events-auto w-screen max-w-lg"
          >
            <div className="flex h-full flex-col bg-[#111827] border-l border-[#1f2937] shadow-2xl overflow-y-auto custom-scrollbar">
              {/* Profile Top Bar */}
              <div className="p-6 border-b border-[#1f2937] bg-[#111827]/40">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                      {lead.status} Deal
                    </span>
                    <h2 className="text-xl font-bold text-white mt-3">{lead.name}</h2>
                    <p className="text-sm text-gray-400 mt-1">{lead.jobTitle || 'Representative'} at <span className="text-blue-400 font-semibold">{lead.company}</span></p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-[#1f2937] text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body tabs */}
              <div className="flex-1 p-6 space-y-8">
                {/* 1. Core Profile Stats Block */}
                <div className="grid grid-cols-2 gap-4 bg-[#0b1120] p-4 rounded-xl border border-[#1f2937]">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Contract Value</span>
                    <span className="text-lg font-bold font-mono text-white mt-1 block">
                      ${lead.value?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Lead Owner</span>
                    <span className="text-sm font-semibold text-gray-200 mt-1 block truncate">
                      {getAssigneeName(lead.assignedTo)}
                    </span>
                  </div>
                </div>

                {/* Lead Actions / Convert Panel */}
                {lead.status !== 'Won' && (
                  <div className="bg-[#1e1b4b]/20 border border-blue-900/40 p-4 rounded-xl">
                    {!showConvertForm ? (
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-white">Convert to Customer</h4>
                          <p className="text-xs text-gray-400 mt-0.5">Move this deal to closed-won and create a portfolio profile.</p>
                        </div>
                        <button
                          onClick={() => setShowConvertForm(true)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors shrink-0 cursor-pointer"
                        >
                          Convert Profile
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleConvertSubmit} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Onboarding Spec</h4>
                          <button
                            type="button"
                            onClick={() => setShowConvertForm(false)}
                            className="text-xs text-gray-400 hover:text-white underline cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                        
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Sector Industry</label>
                          <input
                            type="text"
                            required
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            placeholder="e.g., Software, Fintech, Logistics"
                            className="w-full bg-[#0b1120] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Corporate Headquarters Address</label>
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Street, City, State, ZIP"
                            className="w-full bg-[#0b1120] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isConverting}
                          className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-600/10 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {isConverting ? 'Provisioning...' : <><CheckCircle className="w-4 h-4" /> Finalize Conversion</>}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* 2. Contact Details section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#1f2937] pb-2">
                    Contact Coordinates
                  </h3>
                  <div className="grid grid-cols-1 gap-3 text-xs text-gray-300">
                    <div className="flex items-center gap-3 bg-[#0b1120]/40 p-2.5 rounded-lg border border-[#1f2937]/50">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="font-mono">{lead.email}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-[#0b1120]/40 p-2.5 rounded-lg border border-[#1f2937]/50">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="font-mono">{lead.phone || 'No phone supplied'}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-[#0b1120]/40 p-2.5 rounded-lg border border-[#1f2937]/50">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                      <span>Channel Source: <span className="font-semibold text-gray-200">{lead.source}</span></span>
                    </div>
                  </div>
                </div>

                {/* 3. Action History & Notes logger */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#1f2937] pb-2">
                    Deal Audit Log ({lead.notes.length})
                  </h3>

                  {/* Log Note Form */}
                  <form onSubmit={handleAddNoteSubmit} className="relative">
                    <textarea
                      rows={2}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add an update (e.g. Call logs, next follow-up notes)..."
                      className="w-full bg-[#0b1120] border border-[#1f2937] rounded-xl p-3 pr-12 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingNote || !noteText.trim()}
                      className="absolute right-3.5 bottom-4 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-40 transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {/* Historic Notes list */}
                  <div className="space-y-3.5 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {lead.notes.length === 0 ? (
                      <p className="text-xs text-gray-500 italic text-center py-4">No logged records. Capture updates above.</p>
                    ) : (
                      lead.notes.map((note) => (
                        <div key={note.id} className="p-3 bg-[#0b1120]/40 border border-[#1f2937] rounded-xl text-xs space-y-1">
                          <div className="flex justify-between items-center text-gray-400">
                            <span className="font-semibold text-gray-300">{note.authorName}</span>
                            <span className="text-[10px]">
                              {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-gray-300 leading-relaxed mt-1 font-medium">{note.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
