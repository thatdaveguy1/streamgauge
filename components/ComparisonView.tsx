import React from 'react';
import { TestResult } from '../types';

interface Props {
  reports: TestResult[];
  onClose: () => void;
}

const ComparisonView: React.FC<Props> = ({ reports, onClose }) => {
  // Sort by Score (Desc), then Latency (Asc), then Jitter (Asc)
  const rankedReports = [...reports].sort((a, b) => {
    if (b.stats.score !== a.stats.score) return b.stats.score - a.stats.score;
    if (a.stats.avg !== b.stats.avg) return a.stats.avg - b.stats.avg;
    return a.stats.avgJitter - b.stats.avgJitter;
  });

  const bestReport = rankedReports[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl overflow-y-auto animate-[fadeIn_0.3s_ease-out]">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
         {/* Header */}
         <div className="flex justify-between items-center mb-8 sticky top-0 bg-slate-950/95 backdrop-blur-xl z-10 py-4 border-b border-slate-800/50">
            <div>
                <h2 className="text-2xl font-bold text-white">Performance Comparison</h2>
                <p className="text-slate-400">Ranking {reports.length} selected reports</p>
            </div>
            <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors shadow-lg"
            >
                Close Comparison
            </button>
         </div>

         {/* Winner Card */}
         {bestReport && (
             <div className="mb-10 p-1 rounded-2xl bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 shadow-2xl shadow-amber-900/20">
                <div className="bg-slate-900 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-shrink-0 text-center">
                        <div className="text-amber-400 font-bold tracking-widest uppercase text-xs mb-2">Top Performer</div>
                        <div className="text-6xl font-black text-white">{bestReport.stats.grade}</div>
                        <div className="text-slate-500 text-sm mt-1">Score: {bestReport.stats.score.toFixed(0)}</div>
                    </div>
                    <div className="flex-grow text-center md:text-left">
                        <h3 className="text-2xl font-bold text-white mb-2">{bestReport.label}</h3>
                        <p className="text-slate-400 max-w-xl">
                            Ranked #1 out of {reports.length} tests. This connection offers the lowest latency ({bestReport.stats.avg.toFixed(0)}ms) and the most reliable stability score relative to other samples in this batch.
                        </p>
                    </div>
                    {/* Key Stat Highlights */}
                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                         <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Ping</div>
                            <div className="text-2xl font-mono text-emerald-400 font-medium">{bestReport.stats.avg.toFixed(0)}<span className="text-sm text-slate-600 ml-1">ms</span></div>
                         </div>
                         <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Jitter</div>
                            <div className="text-2xl font-mono text-blue-400 font-medium">{bestReport.stats.avgJitter.toFixed(0)}<span className="text-sm text-slate-600 ml-1">ms</span></div>
                         </div>
                    </div>
                </div>
             </div>
         )}

         {/* Ranking Table */}
         <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-xs tracking-wider">
                            <th className="px-6 py-5 font-bold text-center w-20">Rank</th>
                            <th className="px-6 py-5 font-bold">Report Label</th>
                            <th className="px-6 py-5 font-bold text-center">Grade</th>
                            <th className="px-6 py-5 font-bold">Score</th>
                            <th className="px-6 py-5 font-bold text-right">Ping</th>
                            <th className="px-6 py-5 font-bold text-right">Jitter</th>
                            <th className="px-6 py-5 font-bold text-right">Packet Loss</th>
                            <th className="px-6 py-5 font-bold text-right">Speed</th>
                            <th className="px-6 py-5 font-bold text-right">Stability</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {rankedReports.map((report, index) => {
                             const isWinner = index === 0;
                             return (
                                <tr key={report.id} className={`hover:bg-slate-800/50 transition-colors ${isWinner ? 'bg-amber-500/5' : ''}`}>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold font-mono shadow-lg ${isWinner ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                                            {index + 1}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-200 text-base">{report.label}</div>
                                        <div className="text-xs text-slate-500 mt-1 font-mono">{new Date(report.timestamp).toLocaleString()}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`font-bold font-mono text-xl
                                            ${report.stats.grade === 'S' || report.stats.grade === 'A' ? 'text-emerald-400' :
                                              report.stats.grade === 'B' ? 'text-blue-400' :
                                              report.stats.grade === 'C' ? 'text-amber-400' :
                                              'text-rose-500'}`}>
                                            {report.stats.grade}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-slate-300 w-8 font-medium">{report.stats.score.toFixed(0)}</span>
                                            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${isWinner ? 'bg-amber-500' : 'bg-blue-500'}`} 
                                                    style={{ width: `${report.stats.score}%`}}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-slate-300">
                                        {report.stats.avg.toFixed(0)} <span className="text-slate-600 text-xs">ms</span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-slate-300">
                                        {report.stats.avgJitter.toFixed(0)} <span className="text-slate-600 text-xs">ms</span>
                                    </td>
                                     <td className="px-6 py-4 text-right font-mono text-slate-300">
                                        {report.stats.packetLoss.toFixed(1)}<span className="text-slate-600 text-xs">%</span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-slate-300">
                                        {report.stats.avgSpeed.toFixed(0)} <span className="text-slate-600 text-xs">Mbps</span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-slate-300">
                                        {report.stats.speedStability.toFixed(0)}<span className="text-slate-600 text-xs">%</span>
                                    </td>
                                </tr>
                             );
                        })}
                    </tbody>
                </table>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ComparisonView;