import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Stats } from '../types';

interface Props {
  stats: Stats;
}

const NerdStats: React.FC<Props> = ({ stats }) => {
  const [activeTab, setActiveTab] = useState<'latency' | 'path'>('latency');

  return (
    <div className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mt-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
            </svg>
          </div>
          <div>
             <h3 className="text-xl font-bold text-white">Nerd Network Stats</h3>
             <p className="text-sm text-slate-400">Deep dive traffic analysis</p>
          </div>
        </div>
        
        <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
           <button 
             onClick={() => setActiveTab('latency')}
             className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'latency' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
           >
             Distribution
           </button>
           <button 
             onClick={() => setActiveTab('path')}
             className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'path' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
           >
             Path Visualizer
           </button>
        </div>
      </div>

      {activeTab === 'latency' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Histogram Chart */}
          <div className="lg:col-span-2 h-64 bg-slate-950/30 rounded-xl p-4 border border-slate-800/50">
            <h4 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-4">Latency Distribution (Histogram)</h4>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={stats.latencyBuckets} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="range" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                    cursor={{fill: '#1e293b', opacity: 0.5}}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                   {stats.latencyBuckets.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index > 3 ? '#f43f5e' : index > 1 ? '#f59e0b' : '#6366f1'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Percentiles */}
          <div className="flex flex-col gap-4">
              <div className="flex-1 bg-slate-950/30 rounded-xl p-5 border border-slate-800/50 flex flex-col justify-center">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Average Latency</span>
                  <div className="text-3xl font-mono text-white font-medium">{stats.avg.toFixed(1)}<span className="text-sm text-slate-500 ml-1">ms</span></div>
              </div>
              <div className="flex-1 bg-slate-950/30 rounded-xl p-5 border border-slate-800/50 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full"></div>
                  <span className="text-xs text-blue-400 uppercase tracking-wider font-bold mb-1">P90 (90%)</span>
                  <div className="text-3xl font-mono text-blue-100 font-medium z-10">{stats.p90.toFixed(0)}<span className="text-sm text-slate-500 ml-1">ms</span></div>
                  <p className="text-[10px] text-slate-500 mt-1">90% of packets were faster than this.</p>
              </div>
               <div className="flex-1 bg-slate-950/30 rounded-xl p-5 border border-slate-800/50 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-bl-full"></div>
                  <span className="text-xs text-purple-400 uppercase tracking-wider font-bold mb-1">P99 (Worst 1%)</span>
                  <div className="text-3xl font-mono text-purple-100 font-medium z-10">{stats.p99.toFixed(0)}<span className="text-sm text-slate-500 ml-1">ms</span></div>
                  <p className="text-[10px] text-slate-500 mt-1">Critical for spotting stutter.</p>
              </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-64 bg-slate-950/30 rounded-xl border border-slate-800/50 flex items-center justify-around px-4 md:px-12 overflow-hidden">
             {/* Simulated Path Visualization */}
             <div className="absolute inset-x-0 top-1/2 h-1 bg-slate-800 -translate-y-1/2 z-0"></div>
             
             {/* Device Node */}
             <div className="relative z-10 flex flex-col items-center gap-2">
                 <div className="w-12 h-12 bg-slate-800 rounded-full border-2 border-slate-600 flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                    </svg>
                 </div>
                 <span className="text-xs font-bold text-slate-400">YOU</span>
             </div>

             {/* Local Network Node */}
             <div className="relative z-10 flex flex-col items-center gap-2">
                 <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-lg bg-slate-900 transition-colors duration-500 ${stats.avgJitter > 20 ? 'border-amber-500 shadow-amber-500/20' : 'border-emerald-500 shadow-emerald-500/20'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${stats.avgJitter > 20 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                 </div>
                 <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-400">LOCAL NET</span>
                    {stats.avgJitter > 20 && <span className="text-[10px] text-amber-500 font-mono">High Jitter</span>}
                 </div>
             </div>

             {/* ISP Node */}
             <div className="relative z-10 flex flex-col items-center gap-2">
                 <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-lg bg-slate-900 transition-colors duration-500 ${stats.packetLoss > 1 ? 'border-rose-500 shadow-rose-500/20' : 'border-emerald-500 shadow-emerald-500/20'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${stats.packetLoss > 1 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                 </div>
                 <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-400">ISP / BACKBONE</span>
                    {stats.packetLoss > 1 && <span className="text-[10px] text-rose-500 font-mono">Packet Loss</span>}
                 </div>
             </div>

             {/* Server Node */}
             <div className="relative z-10 flex flex-col items-center gap-2">
                 <div className="w-12 h-12 bg-slate-800 rounded-full border-2 border-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.072 0 2.063.49 2.7 1.35l2.087 2.606c.541.674.836 1.502.836 2.362v.82m-18 0V12a3 3 0 003 3h13.5a3 3 0 003-3v-.82" />
                    </svg>
                 </div>
                 <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-indigo-400">GAME SERVER</span>
                    <span className="text-[10px] text-slate-500 font-mono">{stats.avg.toFixed(0)}ms away</span>
                 </div>
             </div>

             {/* Animated Packets */}
             <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none">
                 <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 -translate-y-1/2 animate-[ping_2s_linear_infinite]" style={{ left: '20%' }}></div>
                 <div className="w-2 h-2 bg-indigo-500 rounded-full absolute top-1/2 -translate-y-1/2 animate-[ping_2s_linear_infinite_0.5s]" style={{ left: '50%' }}></div>
                 <div className="w-2 h-2 bg-emerald-500 rounded-full absolute top-1/2 -translate-y-1/2 animate-[ping_2s_linear_infinite_1s]" style={{ left: '80%' }}></div>
             </div>
        </div>
      )}
    </div>
  );
};

export default NerdStats;
