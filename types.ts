export interface PingData {
  id: number;
  timestamp: number;
  latency: number;
  jitter: number; // Instantaneous jitter (difference from prev latency)
  speed: number | null; // Mbps, null if no measurement yet
  phase: TestPhase;
}

export interface Bucket {
  range: string;
  count: number;
  fullRange: [number, number];
}

export interface Stats {
  min: number;
  max: number;
  avg: number;
  avgJitter: number;
  packetLoss: number;
  totalPings: number;
  failedPings: number;
  // Gaming metrics
  spikes: number; // Number of pings > 100ms
  score: number; // 0-100 score
  grade: string; // S, A, B, C, D, F
  // Speed metrics
  avgSpeed: number;
  maxSpeed: number;
  minSpeed: number;
  speedStability: number; // 0-100%
  recommendedBitrate: number; // Mbps
  // Nerd metrics
  p90: number;
  p99: number;
  stdDev: number;
  latencyBuckets: Bucket[];
}

export interface TestResult {
  id: string;
  label: string;
  timestamp: number;
  stats: Stats;
  data: PingData[]; // Store raw data for replay
  mode: TestMode;
  region?: Region;
}

export enum TestStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
  COMPLETED = 'COMPLETED',
}

export enum TestMode {
  STANDARD = 'STANDARD', // 30s Load Test
  STABILITY = 'STABILITY', // 30s Load + 60s Capped Stability
}

export enum TestPhase {
  IDLE = 'IDLE',
  WARMUP = 'WARMUP',
  LOAD = 'LOAD',
  STABILITY = 'STABILITY',
}

export interface Region {
  id: string;
  name: string;
  url: string; // Target for ping
  flag: string;
}
