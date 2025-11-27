import React from 'react';
import { Stats } from '../types';

interface Props {
  stats: Stats;
  loading?: boolean;
  title?: string;
}

const StreamingGrade: React.FC<Props> = ({ stats, loading, title }) => {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'S': return 'text-purple-400 border-purple-500/50 shadow-purple-500/20 from-purple-500/20 to-indigo-500/5';
      case 'A': return 'text-emerald-400 border-emerald-500/50 shadow-emerald-500/20 from-emerald-500/20 to-teal-500/5';
      case 'B': return 'text-blue-400 border-blue-500/50 shadow-blue-500/20 from-blue-500/20 to-cyan-500/5';
      case 'C': return 'text-amber-400 border-amber-500/50 shadow-amber-500/20 from-amber-500/20 to-orange-500/5';
      case 'D': return 'text-orange-500 border-orange-500/50 shadow-orange-500/20 from-orange-500/20 to-red-500/5';
      default: return 'text-rose-500 border-rose-500/50 shadow-rose-500/20 from-rose-500/20 to-red-500/5';
    }
  };

  const getVerdict = (grade: string) => {
    switch (grade) {
      case 'S': return "Native Feel. Perfect for competitive 4K/120fps.";
      case 'A': return "Excellent. Smooth high-definition streaming.";
      case 'B': return "Great. The standard, immersive cloud gaming experience.";
      case 'C': return "Playable. Meets GFN's minimums. Good for casual games.";
      case 'D': return "Unstable. Frustrating for most games due to frequent issues.";
      default: return "Unplayable. Constant, significant lag and instability.";
    }
  };

  if (loading) {
     return (
        <div className="w-full h-32 bg-slate-800/30 rounded-2xl animate-pulse border border-slate-700/50 flex items-center justify-center">
            <span className="text-slate-500 text-sm tracking-widest uppercase">Analyzing Network Integrity...</span>
        </div>
     );
  }

  const colorClass = getGradeColor(stats.grade);

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${colorClass} bg-slate-900/40 backdrop-blur-md border rounded-2xl p-6 transition-all duration-500`}>
       <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Grade Circle */}
          <div className="flex items-center gap-6">
              <div className="relative">
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-4 flex items-center justify-center bg-slate-900/50 backdrop-blur-xl ${colorClass.split(' ')[1]}`}>
                    <span className={`text-4xl md:text-5xl font-black font-mono ${colorClass.split(' ')[0]}`}>{stats.grade}</span>
                </div>
                {/* Ping Decoration */}
                <div className={`absolute -inset-1 rounded-full opacity-20 blur-md ${colorClass.split(' ')[1].replace('border', 'bg')}`}></div>
              </div>
              
              <div>
                  <h3 className="text-white font-bold text-lg md:text-xl">{title || 'Streaming Grade'}</h3>
                  <p className="text-slate-400 text-sm max-w-xs">{getVerdict(stats.grade)}</p>
              </div>
          </div>

          {/* Technical Details */}
          <div className="flex flex-col gap-2 w-full md:w-auto bg-slate-950/30 p-4 rounded-xl border border-slate-800/50 min-w-[240px]">
             <div className="flex justify-between items-center gap-8 text-sm">
                <span className="text-slate-500">Stability Score</span>
                <span className={`font-mono font-bold ${colorClass.split(' ')[0]}`}>{stats.score.toFixed(0)}/100</span>
             </div>
             <div className="flex justify-between items-center gap-8 text-sm">
                <span className="text-slate-500">Stutter Events (&gt;80ms)</span>
                <span className={`font-mono font-bold ${stats.spikes > 0 ? 'text-amber-400' : 'text-slate-200'}`}>{stats.spikes}</span>
             </div>
             <div className="flex justify-between items-center gap-8 text-sm">
                 <span className="text-slate-500">Real-time Jitter</span>
                 <span className="font-mono text-slate-200">{stats.avgJitter.toFixed(1)} ms</span>
             </div>
             <div className="flex justify-between items-center gap-8 text-sm border-t border-slate-800/50 pt-2 mt-1">
                 <span className="text-slate-400 font-medium">Rec. Bitrate Cap</span>
                 <span className="font-mono text-cyan-400 font-bold">{stats.recommendedBitrate} Mbps</span>
             </div>
          </div>
       </div>
    </div>
  );
};

export default StreamingGrade;