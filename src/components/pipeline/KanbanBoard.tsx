import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  DollarSign, 
  User, 
  TrendingUp, 
  ArrowRightLeft, 
  HelpCircle,
  FileText,
  Briefcase
} from 'lucide-react';
import { Lead, LeadStatus, User as UserType } from '../../types';

interface KanbanBoardProps {
  leads: Lead[];
  users: UserType[];
  onMoveLead: (leadId: string, status: LeadStatus) => void;
  onSelectLead: (lead: Lead) => void;
}

const COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'New', label: 'New Inbound', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { id: 'Contacted', label: 'Contacted', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { id: 'Qualified', label: 'Qualified', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { id: 'Proposal', label: 'Proposal Sent', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { id: 'Negotiation', label: 'In Negotiation', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  { id: 'Won', label: 'Closed Won 🚀', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { id: 'Lost', label: 'Closed Lost', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' }
];

export default function KanbanBoard({ leads, users, onMoveLead, onSelectLead }: KanbanBoardProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: LeadStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedId;
    if (id) {
      onMoveLead(id, targetStatus);
    }
    setDraggedId(null);
  };

  const getAssigneeName = (id?: string) => {
    if (!id) return 'Unassigned';
    return users.find(u => u.id === id)?.name || 'Unknown Agent';
  };

  // Helper calculating column aggregates
  const getColStats = (status: LeadStatus) => {
    const colLeads = leads.filter(l => l.status === status);
    const count = colLeads.length;
    const value = colLeads.reduce((sum, l) => sum + l.value, 0);
    return { count, value };
  };

  const priorityColors: Record<string, string> = {
    Low: 'bg-gray-500/10 text-gray-400',
    Medium: 'bg-blue-500/10 text-blue-400',
    High: 'bg-orange-500/10 text-orange-400',
    Critical: 'bg-red-500/25 text-red-400 border border-red-500/20 animate-pulse'
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 select-none h-[calc(100vh-12rem)] custom-scrollbar">
      {COLUMNS.map((column) => {
        const { count, value } = getColStats(column.id);
        const colLeads = leads.filter(l => l.status === column.id);

        return (
          <div
            key={column.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
            className="w-80 bg-[#111827]/40 border border-white/10 hover:border-slate-700 rounded-2xl flex flex-col h-full shrink-0 transition-all shadow-lg"
          >
            {/* Column Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#111827] rounded-t-2xl">
              <div>
                <h4 className="font-bold text-xs text-slate-200 tracking-wider uppercase flex items-center gap-2">
                  <span>{column.label}</span>
                  <span className="text-[10px] bg-white/5 text-slate-400 px-2 py-0.5 rounded-full font-sans">
                    {count}
                  </span>
                </h4>
                <p className="text-xs font-semibold font-mono text-slate-400 mt-1">
                  ${value.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Draggable Area */}
            <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
              {colLeads.length === 0 ? (
                <div className="h-full min-h-[150px] border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center text-center p-4">
                  <span className="text-xs text-slate-500 font-medium">Drag opportunities here</span>
                </div>
              ) : (
                colLeads.map((lead) => (
                  <motion.div
                    key={lead.id}
                    layoutId={`card-${lead.id}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onClick={() => onSelectLead(lead)}
                    className={`bg-[#111827] border border-white/10 hover:border-slate-500 rounded-2xl p-4 cursor-grab active:cursor-grabbing hover:shadow-xl transition-all duration-200 relative group ${
                      draggedId === lead.id ? 'opacity-40 scale-95' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors truncate max-w-[170px]">
                        {lead.company}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${priorityColors[lead.priority]}`}>
                        {lead.priority}
                      </span>
                    </div>

                    <h5 className="text-xs text-slate-400 mt-1 truncate">{lead.name}</h5>

                    {/* Footer values and user assignees */}
                    <div className="flex items-center justify-between mt-4 border-t border-white/10 pt-3">
                      <span className="font-mono text-xs text-white font-bold">
                        ${lead.value?.toLocaleString() || '0'}
                      </span>

                      <div className="flex items-center gap-1.5" title={`Assigned to ${getAssigneeName(lead.assignedTo)}`}>
                        <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                          <User className="w-2.5 h-2.5 text-blue-400" />
                        </div>
                        <span className="text-[10px] text-slate-400 max-w-[80px] truncate">
                          {getAssigneeName(lead.assignedTo).split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
