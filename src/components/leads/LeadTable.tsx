import { useState } from 'react';
import { 
  User, 
  Trash2, 
  ExternalLink, 
  ArrowUpDown, 
  AlertCircle,
  HelpCircle,
  Clock,
  Briefcase
} from 'lucide-react';
import { Lead, User as UserType } from '../../types';

interface LeadTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onDeleteLead?: (id: string) => void;
  currentUser: UserType | null;
  users: UserType[];
}

export default function LeadTable({ leads, onSelectLead, onDeleteLead, currentUser, users }: LeadTableProps) {
  const [sortField, setSortField] = useState<keyof Lead>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sorting Handler
  const handleSort = (field: keyof Lead) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Helper mapping names to user structures
  const getUserName = (id?: string) => {
    if (!id) return 'Unassigned';
    return users.find(u => u.id === id)?.name || 'Unknown Agent';
  };

  // Badges maps
  const statusColors: Record<string, string> = {
    New: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Contacted: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Qualified: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    Proposal: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Negotiation: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    Won: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Lost: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  const priorityColors: Record<string, string> = {
    Low: 'bg-gray-500/10 text-gray-400',
    Medium: 'bg-blue-500/10 text-blue-400',
    High: 'bg-orange-500/10 text-orange-400',
    Critical: 'bg-red-500/15 text-red-400 animate-pulse border border-red-500/20',
  };

  // Apply Filters
  let filteredLeads = [...leads];
  if (statusFilter !== 'All') {
    filteredLeads = filteredLeads.filter(l => l.status === statusFilter);
  }
  if (priorityFilter !== 'All') {
    filteredLeads = filteredLeads.filter(l => l.priority === priorityFilter);
  }

  // Apply Sorting
  filteredLeads.sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = (bVal as string).toLowerCase();
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Apply Pagination
  const totalItems = filteredLeads.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-[#111827] border border-white/10 rounded-2xl overflow-hidden shadow-xl select-none">
      {/* Filters Sub-header Bar */}
      <div className="p-4 border-b border-white/10 bg-[#111827]/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Filters</span>
          
          {/* Status filter dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-[#111827] border border-white/10 hover:border-slate-500 text-xs text-slate-300 rounded-xl px-3 py-1.5 outline-none transition-colors cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Proposal">Proposal</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>

          {/* Priority filter dropdown */}
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
            className="bg-[#111827] border border-white/10 hover:border-slate-500 text-xs text-slate-300 rounded-xl px-3 py-1.5 outline-none transition-colors cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-white font-bold">{totalItems === 0 ? 0 : startIndex + 1}</span> - <span className="text-white font-bold">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of <span className="text-white font-bold">{totalItems}</span> Records
        </div>
      </div>

      {/* Interactive Grid Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="border-b border-white/10 bg-[#111827] text-xs font-semibold text-slate-400 uppercase tracking-widest sticky top-0 z-10">
              <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">
                  <span>Lead Identity</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('company')}>
                <div className="flex items-center gap-1">
                  <span>Organization</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1">
                  <span>Deal Stage</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('value')}>
                <div className="flex items-center gap-1">
                  <span>Contract Value</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('priority')}>
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="p-4">Assigned Agent</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10 text-sm text-slate-300">
            {paginatedLeads.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-8 h-8 text-slate-600" />
                    <span>No lead profiles match your criteria. Add one to start.</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-white/5 cursor-pointer transition-colors group border-b border-white/10"
                >
                  {/* Lead Name Info */}
                  <td className="p-4" onClick={() => onSelectLead(lead)}>
                    <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {lead.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{lead.email}</div>
                  </td>

                  {/* Company */}
                  <td className="p-4" onClick={() => onSelectLead(lead)}>
                    <div className="font-medium text-slate-200">{lead.company}</div>
                    {lead.jobTitle && <div className="text-xs text-slate-400 mt-0.5">{lead.jobTitle}</div>}
                  </td>

                  {/* Status badge */}
                  <td className="p-4" onClick={() => onSelectLead(lead)}>
                    <span className={`px-2.5 py-1 border rounded-full text-[10px] font-bold tracking-wider uppercase ${statusColors[lead.status]}`}>
                      {lead.status}
                    </span>
                  </td>

                  {/* Contract value */}
                  <td className="p-4 font-mono text-white" onClick={() => onSelectLead(lead)}>
                    ${lead.value?.toLocaleString() || '0'}
                  </td>

                  {/* Priority Tag */}
                  <td className="p-4" onClick={() => onSelectLead(lead)}>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${priorityColors[lead.priority]}`}>
                      {lead.priority}
                    </span>
                  </td>

                  {/* Assigned To Agent */}
                  <td className="p-4" onClick={() => onSelectLead(lead)}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                        <User className="w-3 h-3 text-blue-400" />
                      </div>
                      <span className="text-xs text-slate-300 truncate max-w-[120px]">
                        {getUserName(lead.assignedTo)}
                      </span>
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onSelectLead(lead)}
                        title="Open slide-over profile panel"
                        className="p-1.5 hover:bg-white/5 hover:text-white text-slate-400 rounded-md transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      
                      {/* Delete Action (Admin/Manager Only) */}
                      {onDeleteLead && (currentUser?.role === 'Admin' || currentUser?.role === 'Manager') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to permanently delete lead ${lead.name}?`)) {
                              onDeleteLead(lead.id);
                            }
                          }}
                          title="Permanently remove lead profile"
                          className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination control footer block */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-white/10 bg-[#111827]/40 flex items-center justify-between">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1.5 bg-[#111827] hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-[#111827] text-xs font-semibold rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-1 text-xs">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => handlePageChange(idx + 1)}
                className={`w-7 h-7 rounded-lg font-semibold ${
                  currentPage === idx + 1
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-[#111827] border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white'
                } transition-all cursor-pointer`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-1.5 bg-[#111827] hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-[#111827] text-xs font-semibold rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
