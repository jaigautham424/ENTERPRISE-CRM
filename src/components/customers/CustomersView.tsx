import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  TrendingUp, 
  MapPin, 
  FileText, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Briefcase, 
  Building,
  DollarSign,
  Layers,
  Award
} from 'lucide-react';
import { Customer, User } from '../../types';
import { api } from '../../utils/api';

interface CustomersViewProps {
  customers: Customer[];
  users: User[];
  onRefreshCustomers: () => void;
}

export default function CustomersView({ customers, users, onRefreshCustomers }: CustomersViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Forms states
  const [purchaseItem, setPurchaseItem] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [docName, setDocName] = useState('');
  const [noteBody, setNoteBody] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters calculation
  const industries = ['All', ...Array.from(new Set(customers.map(c => c.industry)))];

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = industryFilter === 'All' || c.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  const getAgentName = (id?: string) => {
    if (!id) return 'Unassigned';
    return users.find(u => u.id === id)?.name || 'Unknown Agent';
  };

  const handleAddPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !purchaseItem || !purchaseAmount) return;
    setIsSubmitting(true);
    try {
      const res = await api.post(`/api/customers/${selectedCustomer.id}/purchases`, {
        item: purchaseItem,
        amount: Number(purchaseAmount)
      });
      // Refresh local selected view
      setSelectedCustomer({
        ...selectedCustomer,
        value: selectedCustomer.value + Number(purchaseAmount),
        purchaseHistory: [res as any, ...selectedCustomer.purchaseHistory]
      });
      setPurchaseItem('');
      setPurchaseAmount('');
      onRefreshCustomers();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !docName) return;
    setIsSubmitting(true);
    try {
      const res = await api.post(`/api/customers/${selectedCustomer.id}/documents`, {
        name: docName
      });
      setSelectedCustomer({
        ...selectedCustomer,
        documents: [res as any, ...selectedCustomer.documents]
      });
      setDocName('');
      onRefreshCustomers();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !noteBody.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await api.post(`/api/customers/${selectedCustomer.id}/notes`, {
        body: noteBody
      });
      setSelectedCustomer({
        ...selectedCustomer,
        notes: [res as any, ...selectedCustomer.notes]
      });
      setNoteBody('');
      onRefreshCustomers();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 select-none">
      {/* Left panel: Clients listings */}
      <div className={`xl:col-span-2 space-y-4 ${selectedCustomer ? 'hidden xl:block' : ''}`}>
        {/* Filter sub bar */}
        <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0b1120] border border-[#1f2937] hover:border-gray-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sector</span>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="bg-[#0b1120] border border-[#1f2937] text-xs text-gray-300 rounded-lg px-2 py-1.5 outline-none focus:border-blue-500 transition-colors"
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Customer Profiles List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-2 p-12 bg-[#111827] border border-[#1f2937] rounded-xl text-center text-xs text-gray-500">
              No clients onboarded matching the filters.
            </div>
          ) : (
            filteredCustomers.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCustomer(c)}
                className={`p-5 bg-[#111827] border rounded-xl hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  selectedCustomer?.id === c.id ? 'border-blue-500 shadow-lg shadow-blue-500/5' : 'border-[#1f2937]'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {c.industry}
                      </span>
                      <h4 className="font-bold text-sm text-white mt-2 group-hover:text-blue-400 transition-colors">{c.company}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{c.name}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500 mt-1" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#1f2937] text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Lifetime Value</span>
                    <span className="font-semibold text-white mt-0.5 block">${c.value.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Account Mgr</span>
                    <span className="text-gray-300 mt-0.5 block truncate max-w-[120px] font-medium">{getAgentName(c.assignedTo)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right panel: Expanded Account details workspace */}
      <div className={`xl:col-span-1 bg-[#111827] border border-[#1f2937] p-5 rounded-xl h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar flex flex-col justify-between shadow-2xl ${
        !selectedCustomer ? 'hidden xl:flex items-center justify-center text-center p-12' : 'flex'
      }`}>
        {!selectedCustomer ? (
          <div className="text-gray-500 text-xs space-y-2 py-12">
            <Users className="w-8 h-8 text-gray-600 mx-auto" />
            <p>Select a client profile from the portfolio listing to open details.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#1f2937]">
              <div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="xl:hidden text-xs text-blue-400 font-semibold mb-2 block cursor-pointer"
                >
                  ← Back to List
                </button>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">
                  {selectedCustomer.industry}
                </span>
                <h3 className="font-bold text-base text-white mt-2">{selectedCustomer.company}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedCustomer.name} (Contact Person)</p>
              </div>
              <Award className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
            </div>

            {/* Coordinates */}
            <div className="space-y-2 bg-[#0b1120] p-3 rounded-xl border border-[#1f2937] text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-3.5 h-3.5 text-gray-500" />
                <span className="truncate">{selectedCustomer.address || 'No address specified'}</span>
              </div>
              <p className="text-gray-400 mt-1 font-mono">Email: {selectedCustomer.email}</p>
              <p className="text-gray-400 font-mono">Phone: {selectedCustomer.phone}</p>
            </div>

            {/* Purchases history */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-1 border-b border-[#1f2937]">Contract Transactions</h4>
              
              <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                {selectedCustomer.purchaseHistory.map((p) => (
                  <div key={p.id} className="flex justify-between items-center text-xs bg-[#0b1120]/40 p-2 rounded-lg border border-[#1f2937]/50">
                    <div className="overflow-hidden">
                      <span className="font-semibold text-gray-200 block truncate">{p.item}</span>
                      <span className="text-[10px] text-gray-500 block mt-0.5">{p.date}</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold shrink-0">${p.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Add Purchase Form */}
              <form onSubmit={handleAddPurchase} className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <input
                  type="text"
                  required
                  placeholder="New Order item..."
                  value={purchaseItem}
                  onChange={(e) => setPurchaseItem(e.target.value)}
                  className="bg-[#0b1120] border border-[#1f2937] rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
                />
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    required
                    placeholder="Amount $"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    className="bg-[#0b1120] border border-[#1f2937] rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500 w-full font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-2 bg-blue-600 hover:bg-blue-500 rounded text-xs text-white font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>

            {/* Document lockers */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-1 border-b border-[#1f2937]">Mutual Agreements</h4>

              <div className="space-y-2">
                {selectedCustomer.documents.length === 0 ? (
                  <p className="text-[10px] text-gray-500 italic text-center">No SLA or compliance documents uploaded.</p>
                ) : (
                  selectedCustomer.documents.map((d) => (
                    <div key={d.id} className="flex justify-between items-center text-xs bg-[#0b1120]/40 p-2 rounded-lg border border-[#1f2937]/50">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-gray-300 truncate font-semibold">{d.name}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">{d.date}</span>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddDocument} className="flex gap-2 pt-1">
                <input
                  type="text"
                  required
                  placeholder="e.g. SOC2_Amendment_2026.pdf"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="bg-[#0b1120] border border-[#1f2937] rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-blue-500 w-full"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded text-white cursor-pointer"
                >
                  Upload
                </button>
              </form>
            </div>

            {/* Client Notes Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-1 border-b border-[#1f2937]">Client Meeting notes</h4>

              <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                {selectedCustomer.notes.map((n) => (
                  <div key={n.id} className="p-2.5 bg-[#0b1120]/30 border border-[#1f2937] rounded-lg text-[11px] leading-relaxed">
                    <div className="flex justify-between text-gray-400 font-semibold mb-1">
                      <span>{n.authorName}</span>
                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-300 font-medium">{n.body}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddNote} className="flex gap-2 pt-1">
                <input
                  type="text"
                  required
                  placeholder="Log briefing outcome..."
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  className="bg-[#0b1120] border border-[#1f2937] rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-blue-500 w-full"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3 bg-purple-600 hover:bg-purple-500 text-xs font-bold rounded text-white cursor-pointer"
                >
                  Log
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
