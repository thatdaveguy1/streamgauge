import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'default';
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, color = 'default', icon }) => {
  const getTextColor = () => {
    switch (color) {
      case 'primary': return 'text-blue-400';
      case 'success': return 'text-emerald-400';
      case 'warning': return 'text-amber-400';
      case 'danger': return 'text-rose-500';
      default: return 'text-slate-200';
    }
  };

  const getBorderColor = () => {
    switch (color) {
      case 'primary': return 'border-blue-500/20 shadow-blue-500/10';
      case 'success': return 'border-emerald-500/20 shadow-emerald-500/10';
      case 'warning': return 'border-amber-500/20 shadow-amber-500/10';
      case 'danger': return 'border-rose-500/20 shadow-rose-500/10';
      default: return 'border-slate-700 shadow-none';
    }
  };

  return (
    <div className={`relative overflow-hidden bg-slate-800/50 backdrop-blur border ${getBorderColor()} rounded-xl p-5 shadow-lg transition-all duration-300 hover:bg-slate-800/70`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-slate-400 text-xs font-bold tracking-wider uppercase">{label}</h3>
        {icon && <div className={`${getTextColor()} opacity-80`}>{icon}</div>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-mono font-medium ${getTextColor()}`}>
          {value}
        </span>
        {unit && <span className="text-slate-500 text-sm font-medium">{unit}</span>}
      </div>
    </div>
  );
};

export default StatCard;
