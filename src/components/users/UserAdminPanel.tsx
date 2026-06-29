import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, 
  User, 
  Plus, 
  UserX, 
  UserCheck, 
  Key, 
  UserPlus2, 
  CheckCircle,
  HelpCircle,
  Hash
} from 'lucide-react';
import { User as UserType } from '../../types';
import { api } from '../../utils/api';

interface UserAdminPanelProps {
  users: UserType[];
  onRefreshUsers: () => void;
}

export default function UserAdminPanel({ users, onRefreshUsers }: UserAdminPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Sales Executive');
  const [department, setDepartment] = useState('Enterprise Sales');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.post('/api/auth/users', {
        name,
        email,
        password,
        role,
        department
      });
      setSuccessMsg(`Account for ${name} provisioned successfully.`);
      setName('');
      setEmail('');
      setPassword('');
      setRole('Sales Executive');
      setDepartment('Enterprise Sales');
      setShowAddForm(false);
      onRefreshUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to provision user profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: 'Active' | 'Inactive') => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.patch(`/api/auth/users/${userId}/status`, { status: nextStatus });
      onRefreshUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to modify status constraints.');
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 select-none">
      {/* 1. Account Creation Block */}
      <div className="xl:col-span-1">
        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-blue-400" />
              <span>User Governance</span>
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-1 hover:bg-[#1f2937] text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              {showAddForm ? 'View Rules' : 'Add User Agent'}
            </button>
          </div>

          {!showAddForm ? (
            <div className="space-y-4 text-xs text-gray-400 leading-relaxed py-4">
              <div className="bg-[#0b1120] p-4 rounded-xl border border-[#1f2937] text-gray-300">
                <h4 className="font-bold text-white uppercase tracking-widest mb-1 text-[10px]">Security Auditing Compliance</h4>
                Only system administrators can allocate licenses, change roles, assign departments, or revoke seat activation status.
              </div>
              <ul className="space-y-2 list-disc list-inside">
                <li>Automatic activity log audits</li>
                <li>Stateful token invalidation</li>
                <li>SLA enforcement on deactivation</li>
              </ul>
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-600/15 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UserPlus2 className="w-4 h-4" /> Provision New Account
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateUser} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold border border-red-500/20">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tony Stark"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0b1120] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Corporate Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@crm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0b1120] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Initial Security Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0b1120] border border-[#1f2937] rounded-lg pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Access Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#0b1120] border border-[#1f2937] text-xs text-gray-300 rounded-lg px-2 py-2 outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Sales Executive">Sales Executive</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Department</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sales APAC"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[#0b1120] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="w-1/2 py-2 bg-[#1f2937] hover:bg-[#374151] text-gray-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-600/10 transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Creating...' : 'Provision'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* 2. User Directory Directory Grid */}
      <div className="xl:col-span-2 bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden shadow-xl flex flex-col h-[calc(100vh-14rem)]">
        <div className="p-4 border-b border-[#1f2937] bg-[#111827]">
          <h4 className="font-bold text-xs text-gray-200 tracking-wider uppercase">Active Staff Directory ({users.length} seats allocated)</h4>
          <p className="text-xs text-gray-500 mt-1">Audit active profiles, login credentials, and department units</p>
        </div>

        {successMsg && (
          <div className="m-4 bg-emerald-500/10 text-emerald-400 p-3 rounded-lg text-xs font-semibold border border-emerald-500/20 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="border-b border-[#1f2937] bg-[#111827] text-[10px] font-bold text-gray-400 uppercase tracking-widest sticky top-0 z-10">
                <th className="p-4">Identity</th>
                <th className="p-4">Department</th>
                <th className="p-4">Role Permission</th>
                <th className="p-4">Seat Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#1f2937] text-xs text-gray-300">
              {users.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                        alt={item.name} 
                        className="w-8 h-8 rounded-full object-cover border border-[#374151]"
                      />
                      <div>
                        <span className="font-semibold text-white block">{item.name}</span>
                        <span className="text-[10px] text-gray-500 block mt-0.5">{item.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="font-semibold text-gray-200">{item.department}</span>
                  </td>

                  <td className="p-4 font-bold text-gray-400">
                    {item.role}
                  </td>

                  <td className="p-4">
                    <span className={`px-2 py-0.5 border rounded text-[10px] font-bold ${
                      item.status === 'Active' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {item.status}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    {/* Admins can toggle other admins or users status */}
                    <button
                      onClick={() => handleToggleStatus(item.id, item.status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer inline-flex items-center gap-1 ${
                        item.status === 'Active'
                          ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20'
                      }`}
                    >
                      {item.status === 'Active' ? <><UserX className="w-3.5 h-3.5" /> Suspend</> : <><UserCheck className="w-3.5 h-3.5" /> Activate</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
