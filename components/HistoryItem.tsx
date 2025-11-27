import React from 'react';
import { TestResult } from '../types';
import { formatNumber } from '../utils/math';

interface Props {
  item: TestResult;
  onClick: (item: TestResult) => void;
  onToggleSelect?: (id: string, selected: boolean) => void;
  isActive: boolean;
  isSelected?: boolean;
}

const HistoryItem: React.FC<Props> = ({ item, onClick, onToggleSelect, isActive, isSelected }) => {
  
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the main onClick
    if (onToggleSelect) {
        onToggleSelect(item.id, !isSelected);
    }
  };

  return (
    <div 
        onClick={() => onClick(item)}
        className={`bg-slate-800/40 border rounded-xl p-4 flex flex-col gap-3 transition-all duration-200 cursor-pointer group relative overflow-hidden
            ${isActive 
                ? 'border-primary/50 ring-1 ring-primary/50 bg-slate-800' 
                : isSelected
                    ? 'border-blue-500/30 bg-blue-900/10'
                    : 'border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
            }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
             {/* Selection Checkbox */}
            <div 
                onClick={handleCheckboxClick}
                className={`flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all z-10
                    ${isSelected 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : 'border-slate-600 bg-slate-800/50 hover:border-slate-400'
                    }`}
            >
                {isSelected && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                )}
            </div>

            <div className={`w-2 h-2 rounded-full ${item.stats.grade === 'S' || item.stats.grade === 'A' ? 'bg-emerald-500' : item.stats.grade === 'B' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
            <div>
                <h4 className={`font-semibold transition-colors ${isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>{item.label}</h4>
                <p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</p>
            </div>
        </div>
        <div className={`text-xs px-2 py-1 rounded bg-slate-700/30 text-slate-400 font-mono border border-slate-700/50`}>
           Grade {item.stats.grade}
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2 mt-1 border-t border-slate-700/50 pt-3">
         <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Ping</p>
            <p className="text-lg font-mono text-emerald-400">{formatNumber(item.stats.avg, 0)}<span className="text-xs text-slate-500 ml-1">ms</span></p>
         </div>
         <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Jitter</p>
            <p className={`text-lg font-mono ${item.stats.avgJitter > 30 ? 'text-amber-400' : 'text-blue-400'}`}>{formatNumber(item.stats.avgJitter, 0)}<span className="text-xs text-slate-500 ml-1">ms</span></p>
         </div>
         <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Speed</p>
            <p className="text-lg font-mono text-cyan-400">{formatNumber(item.stats.avgSpeed, 0)}<span className="text-xs text-slate-500 ml-1">Mb</span></p>
         </div>
         <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Rec.</p>
            <p className="text-lg font-mono text-indigo-400">{formatNumber(item.stats.recommendedBitrate, 0)}<span className="text-xs text-slate-500 ml-1">Mb</span></p>
         </div>
      </div>
    </div>
  )
}
export default HistoryItem;