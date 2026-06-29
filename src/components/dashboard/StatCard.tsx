import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendValue?: number;
  description?: string;
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple';
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  description,
  color = 'blue'
}: StatCardProps) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-500/10 border-blue-500/20',
      text: 'text-blue-400',
      gradient: 'from-blue-500 to-indigo-500',
      hoverBorder: 'hover:border-blue-500/30',
      glow: 'group-hover:bg-blue-500/5'
    },
    emerald: {
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      text: 'text-emerald-400',
      gradient: 'from-emerald-500 to-teal-500',
      hoverBorder: 'hover:border-emerald-500/30',
      glow: 'group-hover:bg-emerald-500/5'
    },
    amber: {
      bg: 'bg-amber-500/10 border-amber-500/20',
      text: 'text-amber-400',
      gradient: 'from-amber-500 to-orange-500',
      hoverBorder: 'hover:border-amber-500/30',
      glow: 'group-hover:bg-amber-500/5'
    },
    rose: {
      bg: 'bg-rose-500/10 border-rose-500/20',
      text: 'text-rose-400',
      gradient: 'from-rose-500 to-red-500',
      hoverBorder: 'hover:border-rose-500/30',
      glow: 'group-hover:bg-rose-500/5'
    },
    purple: {
      bg: 'bg-purple-500/10 border-purple-500/20',
      text: 'text-purple-400',
      gradient: 'from-purple-500 to-pink-500',
      hoverBorder: 'hover:border-purple-500/30',
      glow: 'group-hover:bg-purple-500/5'
    }
  };

  const scheme = colorMap[color];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`relative group bg-[#111827] border border-white/10 ${scheme.hoverBorder} rounded-2xl p-6 overflow-hidden transition-all duration-300 shadow-xl`}
    >
      {/* Top Gradient Active Border Indicator on Hover */}
      <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${scheme.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Decorative Corner Glow */}
      <div className={`absolute -right-4 -top-4 w-28 h-28 bg-transparent rounded-full blur-3xl transition-colors duration-500 ${scheme.glow}`} />

      <div className="flex justify-between items-start mb-4 relative z-10">
        {/* Rounded Icon Enclosure */}
        <div className={`p-2.5 rounded-xl border ${scheme.bg}`}>
          <Icon className={`w-5 h-5 ${scheme.text}`} />
        </div>

        {/* Dynamic MoM Trend Indicator */}
        {trendValue !== undefined && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
            trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            <span>{trend === 'up' ? '▲' : '▼'}</span>
            <span>{trendValue}%</span>
          </div>
        )}
      </div>

      <div className="relative z-10">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
        <h3 className="text-2xl font-bold text-white mt-1.5 tracking-tight font-sans">
          {value}
        </h3>
        {description && (
          <p className="text-xs text-slate-500 mt-2 font-medium">{description}</p>
        )}
      </div>
    </motion.div>
  );
}
