import React from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { PingData } from '../types';

interface LiveChartProps {
  data: PingData[];
  speedLimit?: number | null;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-md z-50">
        <p className="text-slate-500 text-xs mb-2 uppercase tracking-wide font-semibold">Sample #{label}</p>
        <div className="space-y-1">
            <p className="text-emerald-400 text-sm font-mono flex justify-between gap-4">
            <span>Latency:</span> <span className="font-bold">{Number(payload[0].value).toFixed(0)} ms</span>
            </p>
            {payload[1] && (
                <p className="text-cyan-400 text-sm font-mono flex justify-between gap-4">
                <span>Speed:</span> <span className="font-bold">{Number(payload[1].value).toFixed(1)} Mbps</span>
                </p>
            )}
            {payload[2] && ( // Jitter might be 3rd if speed is present
                <p className="text-amber-400 text-sm font-mono flex justify-between gap-4">
                <span>Jitter:</span> <span className="font-bold">{Number(payload[2].value).toFixed(0)} ms</span>
                </p>
            )}
        </div>
      </div>
    );
  }
  return null;
};

const LiveChart: React.FC<LiveChartProps> = ({ data, speedLimit }) => {
  if (data.length === 0) {
    return (
      <div className="h-64 md:h-80 w-full flex flex-col items-center justify-center border border-dashed border-slate-700 rounded-xl bg-slate-800/20 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        <p>Start test to view real-time metrics</p>
      </div>
    );
  }

  return (
    <div className="h-64 md:h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          
          <XAxis 
            dataKey="id" 
            hide 
            type="number" 
            domain={['dataMin', 'dataMax']} 
          />
          
          {/* Left Y-Axis: Latency */}
          <YAxis 
            yAxisId="left"
            stroke="#64748b" 
            fontSize={12} 
            tickFormatter={(val) => `${val.toFixed(0)}`}
            label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
            domain={[0, 'auto']}
          />

          {/* Right Y-Axis: Speed */}
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#06b6d4" 
            fontSize={12} 
            tickFormatter={(val) => `${val.toFixed(0)}`}
            label={{ value: 'Speed (Mbps)', angle: 90, position: 'insideRight', fill: '#06b6d4', fontSize: 10 }}
            domain={[0, 'auto']}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1 }} />
          
          {/* Latency Area */}
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="latency"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorLatency)"
            isAnimationActive={false}
          />

          {/* Speed Limit Line */}
          {speedLimit && (
              <ReferenceLine 
                yAxisId="right" 
                y={speedLimit} 
                stroke="#ef4444" 
                strokeDasharray="5 5" 
                label={{ position: 'right', value: `Cap: ${speedLimit} Mbps`, fill: '#ef4444', fontSize: 10 }} 
              />
          )}

          {/* Speed Line */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="speed"
            stroke="#06b6d4" // Cyan
            strokeWidth={2}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
          
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LiveChart;