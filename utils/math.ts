import { PingData, Stats, Bucket } from '../types';

export const calculateStats = (data: PingData[], failedCount: number): Stats => {
  const total = data.length + failedCount;
  
  if (data.length === 0) {
    return {
      min: 0,
      max: 0,
      avg: 0,
      avgJitter: 0,
      packetLoss: 0,
      totalPings: total,
      failedPings: failedCount,
      spikes: 0,
      score: 0,
      grade: '-',
      avgSpeed: 0,
      maxSpeed: 0,
      minSpeed: 0,
      speedStability: 0,
      recommendedBitrate: 0,
      p90: 0,
      p99: 0,
      stdDev: 0,
      latencyBuckets: []
    };
  }

  const latencies = data.map(d => d.latency);
  const jitters = data.map(d => d.jitter);
  // Filter out null speeds and 0 speeds for accurate stats
  const speeds = data.map(d => d.speed).filter(s => s !== null && s > 0) as number[];
  
  const min = Math.min(...latencies);
  const max = Math.max(...latencies);
  const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const avgJitter = jitters.reduce((a, b) => a + b, 0) / jitters.length;
  const packetLoss = total > 0 ? (failedCount / total) * 100 : 0;

  // Speed Stats
  let avgSpeed = 0;
  let maxSpeed = 0;
  let minSpeed = 0;
  let speedStability = 0;
  let recommendedBitrate = 0;

  if (speeds.length > 0) {
    minSpeed = Math.min(...speeds);
    maxSpeed = Math.max(...speeds);
    avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    
    // Stability calculation
    const deviation = speeds.reduce((acc, val) => acc + Math.abs(val - avgSpeed), 0) / speeds.length;
    const variability = (deviation / avgSpeed) * 100;
    speedStability = Math.max(0, 100 - variability);

    // Recommended Bitrate Calculation
    const sortedSpeeds = [...speeds].sort((a, b) => a - b);
    const p10Index = Math.floor(sortedSpeeds.length * 0.1);
    const p10 = sortedSpeeds[p10Index];
    recommendedBitrate = Math.floor(p10 * 0.9);
  }

  // Calculate Spikes (Gaming context: > 80ms is considered a spike here)
  const spikes = latencies.filter(l => l > 80).length;

  // --- NERD STATS ---
  
  // Percentiles
  const sortedLatencies = [...latencies].sort((a, b) => a - b);
  const p90Index = Math.floor(sortedLatencies.length * 0.90);
  const p99Index = Math.floor(sortedLatencies.length * 0.99);
  const p90 = sortedLatencies[Math.min(p90Index, sortedLatencies.length - 1)] || 0;
  const p99 = sortedLatencies[Math.min(p99Index, sortedLatencies.length - 1)] || 0;

  // Standard Deviation
  const variance = latencies.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / latencies.length;
  const stdDev = Math.sqrt(variance);

  // Histogram Buckets
  // Ranges: 0-20, 20-40, 40-60, 60-80, 80-100, 100+
  const buckets: Bucket[] = [
    { range: '<20ms', count: 0, fullRange: [0, 20] },
    { range: '20-40', count: 0, fullRange: [20, 40] },
    { range: '40-60', count: 0, fullRange: [40, 60] },
    { range: '60-80', count: 0, fullRange: [60, 80] },
    { range: '80-100', count: 0, fullRange: [80, 100] },
    { range: '100+', count: 0, fullRange: [100, 9999] },
  ];

  latencies.forEach(l => {
    if (l < 20) buckets[0].count++;
    else if (l < 40) buckets[1].count++;
    else if (l < 60) buckets[2].count++;
    else if (l < 80) buckets[3].count++;
    else if (l < 100) buckets[4].count++;
    else buckets[5].count++;
  });


  // Calculate Gaming Score (0-100)
  let score = 100;
  if (avg > 40) score -= (avg - 40) * 0.5;
  if (avgJitter > 15) score -= (avgJitter - 15) * 1;
  if (latencies.length > 0) {
    const spikePercentage = (spikes / latencies.length) * 100;
    score -= Math.floor(spikePercentage / 5) * 20;
  }
  if (packetLoss > 1.5) score -= 40;
  else if (packetLoss > 0.5) score -= 15;
  if (speeds.length > 5 && speedStability < 90) score -= (90 - speedStability) * 1;
  score = Math.max(0, Math.min(100, score));

  let grade = 'F';
  if (score >= 95) grade = 'S';
  else if (score >= 85) grade = 'A';
  else if (score >= 75) grade = 'B';
  else if (score >= 60) grade = 'C';
  else if (score >= 45) grade = 'D';

  return {
    min,
    max,
    avg,
    avgJitter,
    packetLoss,
    totalPings: total,
    failedPings: failedCount,
    spikes,
    score,
    grade,
    avgSpeed,
    maxSpeed,
    minSpeed,
    speedStability,
    recommendedBitrate,
    p90,
    p99,
    stdDev,
    latencyBuckets: buckets
  };
};

export const formatNumber = (num: number, decimals = 1): string => {
  return num.toFixed(decimals);
};
