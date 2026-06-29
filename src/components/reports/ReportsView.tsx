import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  PieChart, 
  TrendingUp, 
  CheckCircle, 
  MapPin, 
  ArrowUpRight, 
  FileSpreadsheet, 
  Layers 
} from 'lucide-react';
import { api } from '../../utils/api';
import { Lead, Customer } from '../../types';

interface ReportsViewProps {
  leads: Lead[];
  customers: Customer[];
}

export default function ReportsView({ leads, customers }: ReportsViewProps) {
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await api.get<any>('/api/reports');
        setReportData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReports();
  }, [leads, customers]);

  // Simulate local CSV file generation and trigger download
  const triggerCSVDownload = (filename: string, headers: string[], rows: string[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportLeads = () => {
    const headers = ['ID', 'Name', 'Email', 'Company', 'Status', 'Priority', 'Value', 'Source', 'Created At'];
    const rows = leads.map(l => [
      l.id, l.name, l.email, l.company, l.status, l.priority, String(l.value), l.source, l.createdAt
    ]);
    triggerCSVDownload('CRM_Leads_Report_2026.csv', headers, rows);
  };

  const handleExportCustomers = () => {
    const headers = ['ID', 'Name', 'Email', 'Company', 'Industry', 'Address', 'Status', 'Lifetime Value', 'Created At'];
    const rows = customers.map(c => [
      c.id, c.name, c.email, c.company, c.industry, c.address || '', c.status, String(c.value), c.createdAt
    ]);
    triggerCSVDownload('CRM_Customers_Report_2026.csv', headers, rows);
  };

  const handleExportPerformance = () => {
    const headers = ['Region/Channel', 'Volume/Revenue', 'Ratio/Status'];
    const rows = [
      ['North America Sales', '$1,250,000', '32% Conversion'],
      ['Europe/EMEA Sales', '$850,000', '26% Conversion'],
      ['APAC Sales', '$420,000', '19% Conversion'],
      ['LATAM Sales', '$210,000', '14% Conversion'],
    ];
    triggerCSVDownload('CRM_Corporate_Performance_2026.csv', headers, rows);
  };

  if (isLoading || !reportData) {
    return <div className="p-8 text-center text-xs text-gray-500">Loading business intelligence matrices...</div>;
  }

  const { salesByRegion, leadSources, quarterlyTarget } = reportData;

  return (
    <div className="space-y-6 select-none">
      {/* 1. Target Tracking Summary Banner */}
      <div className="bg-[#111827] border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
        <div>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
            Strategic Quota Allocation
          </span>
          <h3 className="text-xl font-bold text-white mt-3">Fiscal Q2 Quota Alignment</h3>
          <p className="text-xs text-slate-400 mt-1">Measuring aggregate portfolio contract values against corporate expansion milestones.</p>
        </div>

        <div className="w-full md:w-80 space-y-2 shrink-0">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span>Target Progress ({quarterlyTarget.percent}%)</span>
            <span className="text-white font-mono">${quarterlyTarget.achieved.toLocaleString()} / ${quarterlyTarget.target.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-3.5 border border-white/10 overflow-hidden">
            <div 
              style={{ width: `${Math.min(quarterlyTarget.percent, 100)}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000"
            />
          </div>
        </div>
      </div>

      {/* 2. Business Intelligence Charts Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Territory breakdown */}
        <div className="bg-[#111827] border border-white/10 p-6 rounded-2xl space-y-4 shadow-xl">
          <div>
            <h4 className="font-bold text-xs text-white tracking-wider uppercase flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Territory Revenue Contribution</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1">Summary of contracts closed across target zones</p>
          </div>

          <div className="divide-y divide-white/10 text-xs">
            {salesByRegion.map((region: any) => (
              <div key={region.region} className="py-3.5 flex justify-between items-center first:pt-0">
                <div>
                  <span className="font-bold text-slate-200 block">{region.region}</span>
                  <span className="text-slate-500 mt-0.5 block">SLA Conversion: {region.conversion}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-white block">{region.sales.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Source breakdown */}
        <div className="bg-[#111827] border border-white/10 p-6 rounded-2xl space-y-4 shadow-xl">
          <div>
            <h4 className="font-bold text-xs text-white tracking-wider uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Acquisition Channel Efficiency</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1">Performance tracking for lead generation sources</p>
          </div>

          <div className="divide-y divide-white/10 text-xs">
            {leadSources.map((src: any) => (
              <div key={src.source} className="py-3.5 flex justify-between items-center first:pt-0">
                <div>
                  <span className="font-bold text-slate-200 block">{src.source}</span>
                  <span className="text-slate-500 mt-0.5 block">Registered leads count: {src.count}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-emerald-400 block">${src.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Executive Exports Panel */}
      <div className="bg-[#111827] border border-white/10 p-6 rounded-2xl space-y-4 shadow-xl">
        <div>
          <h4 className="font-bold text-xs text-white tracking-wider uppercase flex items-center gap-2">
            <Download className="w-4 h-4 text-slate-400" />
            <span>SaaS Regulatory CSV Exporters</span>
          </h4>
          <p className="text-xs text-slate-500 mt-1">Export high-fidelity spreadsheet audits of active sales data.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Export Leads */}
          <button
            onClick={handleExportLeads}
            className="p-5 bg-white/5 border border-white/10 hover:border-blue-500 rounded-2xl hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer text-left transition-all group flex flex-col justify-between h-36"
          >
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl w-max">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-xs text-white group-hover:text-blue-400 transition-colors">Leads Ledger</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 truncate">Export {leads.length} active opportunities</p>
            </div>
          </button>

          {/* Export Customers */}
          <button
            onClick={handleExportCustomers}
            className="p-5 bg-white/5 border border-white/10 hover:border-emerald-500 rounded-2xl hover:shadow-lg hover:shadow-emerald-500/5 cursor-pointer text-left transition-all group flex flex-col justify-between h-36"
          >
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl w-max">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">Client Directory</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 truncate">Export {customers.length} converted client portfolios</p>
            </div>
          </button>

          {/* Export Corporate performance */}
          <button
            onClick={handleExportPerformance}
            className="p-5 bg-white/5 border border-white/10 hover:border-purple-500 rounded-2xl hover:shadow-lg hover:shadow-purple-500/5 cursor-pointer text-left transition-all group flex flex-col justify-between h-36"
          >
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl w-max">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-xs text-white group-hover:text-purple-400 transition-colors">Performance Indexes</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 truncate">Territory conversion indices audit</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
