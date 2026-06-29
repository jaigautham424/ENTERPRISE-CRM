import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface RevenueData {
  name: string;
  revenue: number;
  target: number;
}

interface FunnelData {
  name: string;
  value: number;
}

interface RevenueChartProps {
  revenueData: RevenueData[];
  funnelData: FunnelData[];
}

export default function RevenueChart({ revenueData, funnelData }: RevenueChartProps) {
  // Format currency labels nicely
  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  };

  const colors = ['#3b82f6', '#60a5fa', '#34d399', '#f59e0b', '#10b981'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
      {/* 1. Area Chart: Monthly Revenue vs Targets */}
      <div className="lg:col-span-2 bg-[#111827] border border-white/10 p-6 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">Revenue Realization</h3>
            <p className="text-xs text-slate-400 mt-1">Comparing monthly recurring revenue versus strategic forecasts</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Realized Revenue</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <span>Target Baseline</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 11 }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#111827', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)'
                }}
                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#revenueGlow)" 
              />
              <Area 
                type="monotone" 
                dataKey="target" 
                stroke="rgba(156,163,175,0.4)" 
                strokeWidth={1.5} 
                strokeDasharray="4 4"
                fill="transparent" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Bar Chart: Lead conversion Pipeline Funnel */}
      <div className="bg-[#111827] border border-white/10 p-6 rounded-2xl shadow-xl">
        <div className="mb-6">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">Conversion Pipeline</h3>
          <p className="text-xs text-slate-400 mt-1">Visualizing standard lead count across key deal phases</p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} layout="vertical" margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis 
                type="number" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 11 }} 
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#d1d5db', fontSize: 11 }} 
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#111827', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)'
                }}
                formatter={(value: any) => [`${value} Leads`, 'Volume']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
