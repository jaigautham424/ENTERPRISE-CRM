import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  Clock, 
  FileText, 
  User, 
  Mail, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { api } from '../../utils/api';
import { Email, User as UserType } from '../../types';

interface EmailComposerProps {
  currentUser: UserType | null;
  emails: Email[];
  onRefreshEmails: () => void;
}

const EMAIL_TEMPLATES = [
  { id: 'outreach', label: 'Cold Outreach', subject: 'Strategic Partnership Inquiry: {{company}} x Enterprise Suite', context: 'Introduce our modern low-latency CRM system and compliance layer.' },
  { id: 'demo', label: 'Request Demo', subject: 'Product Demonstration: Modern CRM Platform', context: 'Request a 10-minute slot this Thursday to show how we accelerate deal pipelines.' },
  { id: 'pricing', label: 'Contract Proposal', subject: 'Bespoke License Terms Proposal for {{company}}', context: 'Submit contract parameters, enterprise seat discounts, and SLA support plans.' }
];

export default function EmailComposer({ currentUser, emails, onRefreshEmails }: EmailComposerProps) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [company, setCompany] = useState('');
  const [context, setContext] = useState('');
  const [tone, setTone] = useState('Professional');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle template selection
  const selectTemplate = (tpl: typeof EMAIL_TEMPLATES[0]) => {
    const formattedSubject = tpl.subject.replace('{{company}}', company || 'your team');
    setSubject(formattedSubject);
    setContext(tpl.context);
  };

  // Draft email using Gemini AI proxy route
  const handleGenerateAIDraft = async () => {
    if (!recipientName || !company || !context) {
      setErrorMsg('Please specify Recipient Name, Company, and Email Context before using AI.');
      return;
    }
    setErrorMsg('');
    setIsGenerating(true);
    try {
      const res = await api.post<{ body: string; info?: string }>('/api/emails/ai-generate', {
        tone,
        recipientName,
        company,
        context
      });
      
      if (res.body) {
        // Parse Subject and Body if Gemini divided them, or inject body
        if (res.body.includes('Subject:')) {
          const parts = res.body.split('\n');
          const subjLine = parts.find(p => p.startsWith('Subject:'));
          if (subjLine) {
            setSubject(subjLine.replace('Subject:', '').trim());
            // Filter out Subject line from body
            const bodyLines = parts.filter(p => !p.startsWith('Subject:'));
            setBody(bodyLines.join('\n').trim());
          } else {
            setBody(res.body);
          }
        } else {
          setBody(res.body);
        }

        if (res.info) {
          setErrorMsg(res.info); // Elegant informational banner
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'AI compilation failed. Check backend console logs.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !subject || !body) {
      setErrorMsg('Please complete Recipient, Subject and Body fields.');
      return;
    }
    setErrorMsg('');
    setIsSending(true);
    try {
      await api.post('/api/emails/send', {
        to,
        subject,
        body,
        templateUsed: tone
      });
      setSuccessMsg('Email outbound log recorded successfully.');
      setTo('');
      setSubject('');
      setBody('');
      setRecipientName('');
      setCompany('');
      setContext('');
      onRefreshEmails();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch email.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 select-none">
      {/* 1. Intelligent AI Draft & Settings Block */}
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">Gemini Smart Mail Composer</h3>
            </div>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 font-bold px-2 py-0.5 rounded-full border border-blue-500/20">
              Copilot Active
            </span>
          </div>

          <p className="text-xs text-gray-400">
            Synthesize customized strategic B2B engagement emails based on lead contexts using server-side Gemini 3.5.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Recipient Name</label>
              <input
                type="text"
                placeholder="e.g. Richard Hendricks"
                value={recipientName}
                onChange={(e) => { setRecipientName(e.target.value); if (!to) setTo(e.target.value.toLowerCase().replace(' ', '') + '@company.com'); }}
                className="w-full bg-[#0b1120] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Target Company</label>
              <input
                type="text"
                placeholder="e.g. Pied Piper"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-[#0b1120] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Engagement Context</label>
              <input
                type="text"
                placeholder="e.g. follow-up call, compliance overview, license quota"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full bg-[#0b1120] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Tone Tuning</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-[#0b1120] border border-[#1f2937] text-xs text-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-all"
              >
                <option value="Professional & Friendly">Professional & Friendly</option>
                <option value="Highly Urgent">Highly Urgent</option>
                <option value="Informal & Short">Informal & Short</option>
                <option value="Technical & Precise">Technical & Precise</option>
                <option value="Bespoke Enterprise Pitch">Bespoke Enterprise Pitch</option>
              </select>
            </div>
          </div>

          {/* Core Templates Quick Selector */}
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Preset Outlines</span>
            <div className="flex gap-2 flex-wrap">
              {EMAIL_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => selectTemplate(tpl)}
                  className="px-2.5 py-1.5 bg-[#0b1120] border border-[#1f2937] hover:border-gray-500 rounded-lg text-xs text-gray-300 transition-colors cursor-pointer"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateAIDraft}
            disabled={isGenerating}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-600/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{isGenerating ? 'Synthesizing with Gemini...' : 'Generate Intelligent B2B Outreach Draft'}</span>
          </button>
        </div>

        {/* 2. Final Output Composition Form */}
        <form onSubmit={handleSendEmail} className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl space-y-4">
          <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider pb-2 border-b border-[#1f2937]">Outbound Mail Dispatch</h3>

          {successMsg && (
            <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-lg text-xs font-semibold border border-emerald-500/20 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-[#1f2937] text-gray-300 p-3 rounded-lg text-xs font-semibold border border-gray-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">To (Recipient Email)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full bg-[#0b1120] border border-[#1f2937] rounded-lg pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Subject Title</label>
              <input
                type="text"
                required
                placeholder="Enter email subject line..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#0b1120] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-colors font-semibold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Email Body Content</label>
              <textarea
                rows={8}
                required
                placeholder="Draft body or use Gemini smart draft above..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full bg-[#0b1120] border border-[#1f2937] rounded-lg p-3 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors resize-none font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-600/15 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isSending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{isSending ? 'Sending Outbound...' : 'Log and Send Email Outbound'}</span>
          </button>
        </form>
      </div>

      {/* 3. Dispatch Outbox Logs Column */}
      <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl flex flex-col h-[calc(100vh-14rem)]">
        <div className="mb-4">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>Sent Communications ({emails.length})</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">Audit trail of emails routed through sandbox</p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-[#1f2937] pr-2">
          {emails.length === 0 ? (
            <p className="text-xs text-gray-500 italic text-center py-8">No messages recorded in this scope.</p>
          ) : (
            emails.map((mail) => (
              <div key={mail.id} className="py-3.5 space-y-1.5 first:pt-0">
                <div className="flex justify-between items-start">
                  <div className="overflow-hidden">
                    <span className="text-xs font-semibold text-gray-300 truncate block">{mail.to}</span>
                    <span className="text-[10px] text-gray-500 block mt-0.5">
                      {new Date(mail.timestamp).toLocaleDateString()} at {new Date(mail.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[9px] font-bold uppercase tracking-wider shrink-0">
                    {mail.status}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-blue-400 truncate">{mail.subject}</h5>
                <p className="text-[11px] text-gray-400 line-clamp-3 leading-relaxed bg-[#0b1120] p-2 rounded border border-[#1f2937]/40 whitespace-pre-line font-medium">
                  {mail.body}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
