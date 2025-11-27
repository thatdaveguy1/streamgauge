import React, { useState, useEffect } from 'react';
import { useJitterTest, REGIONS } from './hooks/useJitterTest';
import { TestStatus, TestResult, TestMode, TestPhase, Stats } from './types';
import { formatNumber, calculateStats } from './utils/math';
import StatCard from './components/StatCard';
import LiveChart from './components/LiveChart';
import HistoryItem from './components/HistoryItem';
import StreamingGrade from './components/StreamingGrade';
import ComparisonView from './components/ComparisonView';
import NerdStats from './components/NerdStats';

// Icons
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
  </svg>
);

const BoltIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l2.976-7.302H4.5a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.163-.143z" clipRule="evenodd" />
  </svg>
);

const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
  </svg>
);

const App: React.FC = () => {
  const { status, phase, mode, data, stats, cappedStats, progress, history, currentSpeedLimit, selectedRegion, setSelectedRegion, startTest, stopTest, reset, saveResult, discardResult } = useJitterTest();
  const [labelInput, setLabelInput] = useState('');
  const [viewingResult, setViewingResult] = useState<TestResult | null>(null);
  
  // Comparison State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const isRunning = status === TestStatus.RUNNING;
  const isCompleted = status === TestStatus.COMPLETED;
  const isIdle = status === TestStatus.IDLE;

  // Determine which data to show
  const activeStats = viewingResult ? viewingResult.stats : stats;
  const activeData = viewingResult ? viewingResult.data : data;
  const activeRegion = viewingResult ? viewingResult.region : selectedRegion;
  
  // Derived capped stats for viewing history
  const activeCappedStats = viewingResult 
    ? calculateStats(viewingResult.data.filter(d => d.phase === TestPhase.STABILITY), 0)
    : cappedStats;

  const handleStartStandard = () => {
      setViewingResult(null);
      startTest(TestMode.STANDARD);
  };

  const handleStartStability = () => {
      setViewingResult(null);
      startTest(TestMode.STABILITY);
  };

  const handleReset = () => {
      setViewingResult(null);
      reset();
  };

  const handleHistoryClick = (item: TestResult) => {
      if (isRunning) return;
      setViewingResult(item);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSelect = (id: string, selected: boolean) => {
      if (selected) {
          setSelectedIds(prev => [...prev, id]);
      } else {
          setSelectedIds(prev => prev.filter(itemId => itemId !== id));
      }
  };

  const handleCompare = () => {
      if (selectedIds.length >= 2) {
          setShowComparison(true);
      }
  };

  const handleClearSelection = () => {
      setSelectedIds([]);
  };

  // Helper for colors
  const getJitterColor = (jitter: number) => {
      if (jitter > 80) return 'danger';
      if (jitter > 30) return 'warning';
      return 'success';
  }

  const getStabilityColor = (stability: number, avgSpeed: number) => {
      if (avgSpeed === 0) return 'default';
      if (stability < 70) return 'danger';
      if (stability < 90) return 'warning';
      return 'success';
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = saveResult(labelInput || 'Untitled Test');
    setLabelInput('');
    setViewingResult(saved); // Immediately show the saved result
  };

  // Get selected report objects for comparison
  const selectedReports = history.filter(h => selectedIds.includes(h.id));

  // Determine if we should show capped stats
  const showCappedStats = (mode === TestMode.STABILITY && (phase === TestPhase.STABILITY || isCompleted)) || 
                          (viewingResult && viewingResult.mode === TestMode.STABILITY);
  
  const isStabilityMode = mode === TestMode.STABILITY || (viewingResult && viewingResult.mode === TestMode.STABILITY);

  // Calculate displayed cap
  // If running, use current limit. If viewing/completed, derive from stats consistent with hook logic (Max(5, Safe - 10)).
  const displayedCap = currentSpeedLimit || (isStabilityMode ? Math.max(5, activeStats.recommendedBitrate - 10) : 0);

  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-primary/30 selection:text-white">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* Comparison Overlay */}
      {showComparison && (
          <ComparisonView 
              reports={selectedReports} 
              onClose={() => setShowComparison(false)} 
          />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-8">
        
        {/* Header */}
        <header className="flex flex-col xl:flex-row justify-between items-center gap-6 border-b border-slate-800 pb-8">
          <div className="flex items-center gap-3">
             <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-accent shadow-lg shadow-primary/25">
               <ActivityIcon />
             </div>
             <div>
               <h1 className="text-2xl font-bold text-white tracking-tight">StreamGauge</h1>
               <p className="text-sm text-slate-400">Jitter & Latency Analyzer for Cloud Gaming Platforms</p>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
              
              {/* Region Selector */}
              <div className="relative group">
                <select 
                  value={selectedRegion.id}
                  onChange={(e) => {
                      const r = REGIONS.find(r => r.id === e.target.value);
                      if (r) setSelectedRegion(r);
                  }}
                  disabled={isRunning}
                  className="appearance-none bg-slate-900/50 text-white pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm w-full sm:w-64"
                >
                    {REGIONS.map(r => (
                        <option key={r.id} value={r.id}>
                            {r.flag} {r.name}
                        </option>
                    ))}
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor