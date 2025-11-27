import { useState, useRef, useCallback, useEffect } from 'react';
import { PingData, Stats, TestStatus, TestResult, TestMode, TestPhase, Region } from '../types';
import { calculateStats } from '../utils/math';

// REGION CONFIGURATION
// Using reliable Cloud Regional Endpoints (AWS S3) that typically respond to HEAD requests.
export const REGIONS: Region[] = [
  { id: 'auto', name: 'Auto (Nearest Edge)', url: 'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js', flag: '🌍' },
  { id: 'us-east', name: 'US East (N. Virginia)', url: 'https://s3.us-east-1.amazonaws.com', flag: '🇺🇸' },
  { id: 'us-west', name: 'US West (Oregon)', url: 'https://s3.us-west-2.amazonaws.com', flag: '🇺🇸' },
  { id: 'eu-west', name: 'EU West (Ireland)', url: 'https://s3.eu-west-1.amazonaws.com', flag: '🇪🇺' },
  { id: 'eu-central', name: 'EU Central (Frankfurt)', url: 'https://s3.eu-central-1.amazonaws.com', flag: '🇩🇪' },
  { id: 'ap-northeast', name: 'Asia Pacific (Tokyo)', url: 'https://s3.ap-northeast-1.amazonaws.com', flag: '🇯🇵' },
  { id: 'sa-east', name: 'South America (São Paulo)', url: 'https://s3.sa-east-1.amazonaws.com', flag: '🇧🇷' },
];

const SPEED_TARGETS = [
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg', 
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?fm=jpg&w=2000&q=80',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js' 
];

const INTERVAL_MS = 500; 
const WARMUP_DURATION = 5000; 
const LOAD_PHASE_DURATION = 30000; 
const STABILITY_PHASE_DURATION = 60000; 

export const useJitterTest = () => {
  const [status, setStatus] = useState<TestStatus>(TestStatus.IDLE);
  const [mode, setMode] = useState<TestMode>(TestMode.STANDARD);
  const [phase, setPhase] = useState<TestPhase>(TestPhase.IDLE);
  const [selectedRegion, setSelectedRegion] = useState<Region>(REGIONS[0]);
  
  const [data, setData] = useState<PingData[]>([]);
  const [failedPings, setFailedPings] = useState(0);
  const [history, setHistory] = useState<TestResult[]>([]);
  const [progress, setProgress] = useState(0);
  
  const [currentSpeedLimit, setCurrentSpeedLimit] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);
  const durationTimerRef = useRef<number | null>(null);
  const warmupTimerRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  
  const countRef = useRef(0);
  const prevLatencyRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  const phaseRef = useRef<TestPhase>(TestPhase.IDLE);
  const modeRef = useRef<TestMode>(TestMode.STANDARD);
  const dataRef = useRef<PingData[]>([]);
  
  // Ref to hold the current ping target based on region
  const pingTargetRef = useRef<string>(REGIONS[0].url);
  
  const isSpeedTestRunningRef = useRef(false);
  const lastSpeedRef = useRef<number | null>(null);
  const speedLoopIdRef = useRef<number>(0);
  const currentTargetIndexRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const speedLimitRef = useRef<number | null>(null); 

  const performSpeedTest = useCallback(async () => {
     if (!isSpeedTestRunningRef.current) return;
     
     const loopId = speedLoopIdRef.current;
     const targetUrl = SPEED_TARGETS[currentTargetIndexRef.current];
     const uniqueUrl = `${targetUrl}?t=${Date.now()}-${Math.random()}`;
     
     const controller = new AbortController();
     abortControllerRef.current = controller;
     
     const timeoutId = setTimeout(() => controller.abort(), 10000);

     const start = performance.now();

     try {
         const response = await fetch(uniqueUrl, { 
            method: 'GET',
            mode: 'cors',
            signal: controller.signal
         });
         
         if (!response.ok) throw new Error(`HTTP ${response.status}`);

         const blob = await response.blob();
         clearTimeout(timeoutId);

         const end = performance.now();
         const durationSeconds = (end - start) / 1000;
         const sizeInBytes = blob.size;
         
         if (durationSeconds < 0.05) {
             if (isSpeedTestRunningRef.current && speedLoopIdRef.current === loopId) {
                 setTimeout(performSpeedTest, 50);
             }
             return;
         }

         const bitsLoaded = sizeInBytes * 8;
         const speedMbps = (bitsLoaded / durationSeconds) / 1000000;
         
         if (isSpeedTestRunningRef.current && speedLoopIdRef.current === loopId) {
             const limit = speedLimitRef.current;
             if (limit !== null && limit > 0) {
                 const targetDurationSec = bitsLoaded / (limit * 1000000);
                 const waitTimeSec = targetDurationSec - durationSeconds;
                 if (waitTimeSec > 0) {
                     lastSpeedRef.current = limit;
                     setTimeout(performSpeedTest, waitTimeSec * 1000);
                     return;
                 }
             }
             lastSpeedRef.current = speedMbps;
             setTimeout(performSpeedTest, 100);
         }

     } catch (e: any) {
         clearTimeout(timeoutId);
         currentTargetIndexRef.current = (currentTargetIndexRef.current + 1) % SPEED_TARGETS.length;

         if (isSpeedTestRunningRef.current && speedLoopIdRef.current === loopId) {
            setTimeout(performSpeedTest, 500);
         }
     }
  }, []);

  const performPing = useCallback(async () => {
    const id = countRef.current++;
    const start = performance.now();
    // Use the region-specific URL
    const uniqueUrl = `${pingTargetRef.current}?t=${start}-${Math.random()}`;

    try {
      await fetch(uniqueUrl, { 
        method: 'HEAD', 
        mode: 'no-cors' // Use no-cors to allow opaque response from generic endpoints like S3
      });
      const end = performance.now();
      const latency = end - start;
      
      let jitter = 0;
      if (prevLatencyRef.current !== null) {
        jitter = Math.abs(latency - prevLatencyRef.current);
      }
      prevLatencyRef.current = latency;

      const newDataPoint: PingData = {
        id,
        timestamp: Date.now(),
        latency,
        jitter,
        speed: lastSpeedRef.current,
        phase: phaseRef.current
      };

      setData(prev => {
        const next = [...prev, newDataPoint];
        dataRef.current = next; 
        return next;
      });

    } catch (error) {
      setFailedPings(prev => prev + 1);
      prevLatencyRef.current = null; 
    }
  }, []);

  const finishTest = useCallback(() => {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    if (progressIntervalRef.current) { window.clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }
    if (durationTimerRef.current) { window.clearTimeout(durationTimerRef.current); durationTimerRef.current = null; }
    if (warmupTimerRef.current) { window.clearTimeout(warmupTimerRef.current); warmupTimerRef.current = null; }
    
    isSpeedTestRunningRef.current = false;
    if (abortControllerRef.current) abortControllerRef.current.abort();
    
    setStatus(TestStatus.COMPLETED);
    setPhase(TestPhase.IDLE);
    phaseRef.current = TestPhase.IDLE;
    setProgress(100);
    speedLimitRef.current = null;
    setCurrentSpeedLimit(null);
  }, []);

  const transitionToStabilityPhase = useCallback(() => {
      const currentStats = calculateStats(dataRef.current, 0); 
      const safeBitrate = currentStats.recommendedBitrate;
      const cap = Math.max(5, safeBitrate - 10);
      
      speedLimitRef.current = cap;
      setCurrentSpeedLimit(cap);
      setPhase(TestPhase.STABILITY);
      phaseRef.current = TestPhase.STABILITY;
      
      durationTimerRef.current = window.setTimeout(finishTest, STABILITY_PHASE_DURATION);

  }, [finishTest]);

  const startRecordingPhase = useCallback(() => {
    setData([]);
    dataRef.current = [];
    setFailedPings(0);
    
    startTimeRef.current = Date.now();
    setPhase(TestPhase.LOAD);
    phaseRef.current = TestPhase.LOAD;
    
    if (modeRef.current === TestMode.STANDARD) {
        durationTimerRef.current = window.setTimeout(finishTest, LOAD_PHASE_DURATION);
    } else {
        durationTimerRef.current = window.setTimeout(transitionToStabilityPhase, LOAD_PHASE_DURATION);
    }
  }, [finishTest, transitionToStabilityPhase]);

  const startTest = useCallback((selectedMode: TestMode = TestMode.STANDARD) => {
    if (status === TestStatus.RUNNING) return;
    
    setMode(selectedMode);
    modeRef.current = selectedMode; 
    pingTargetRef.current = selectedRegion.url; // Lock in the region URL
    
    setData([]);
    dataRef.current = [];
    setFailedPings(0);
    countRef.current = 0;
    prevLatencyRef.current = null;
    lastSpeedRef.current = null;
    currentTargetIndexRef.current = 0; 
    speedLimitRef.current = null;
    setCurrentSpeedLimit(null);
    
    setStatus(TestStatus.RUNNING);
    setPhase(TestPhase.WARMUP);
    phaseRef.current = TestPhase.WARMUP;
    setProgress(0);
    
    startTimeRef.current = Date.now();

    isSpeedTestRunningRef.current = true;
    speedLoopIdRef.current++;
    performSpeedTest();

    performPing();

    timerRef.current = window.setInterval(performPing, INTERVAL_MS);
    
    warmupTimerRef.current = window.setTimeout(startRecordingPhase, WARMUP_DURATION);

    progressIntervalRef.current = window.setInterval(() => {
        if (phaseRef.current === TestPhase.WARMUP) {
            setProgress(0);
        } else {
            const elapsed = Date.now() - startTimeRef.current;
            const totalDuration = selectedMode === TestMode.STANDARD 
                ? LOAD_PHASE_DURATION 
                : (LOAD_PHASE_DURATION + STABILITY_PHASE_DURATION);

            const p = Math.min((elapsed / totalDuration) * 100, 100);
            setProgress(p);
        }
    }, 100);

  }, [status, performPing, performSpeedTest, startRecordingPhase, selectedRegion]);

  const stopTest = useCallback(() => {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    if (progressIntervalRef.current) { window.clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }
    if (durationTimerRef.current) { window.clearTimeout(durationTimerRef.current); durationTimerRef.current = null; }
    if (warmupTimerRef.current) { window.clearTimeout(warmupTimerRef.current); warmupTimerRef.current = null; }
    
    isSpeedTestRunningRef.current = false;
    if (abortControllerRef.current) abortControllerRef.current.abort();
    
    setStatus(TestStatus.STOPPED);
    setPhase(TestPhase.IDLE);
    phaseRef.current = TestPhase.IDLE;
  }, []);

  const saveResult = useCallback((label: string) => {
    const loadData = data.filter(d => d.phase !== TestPhase.STABILITY);
    const stats = calculateStats(loadData, failedPings);
    
    const result: TestResult = {
        id: Date.now().toString(),
        label: label || `Test #${history.length + 1}`,
        timestamp: Date.now(),
        stats,
        data: [...data],
        mode: mode,
        region: selectedRegion
    };
    setHistory(prev => [result, ...prev]);
    setStatus(TestStatus.IDLE);
    setData([]);
    dataRef.current = [];
    setFailedPings(0);
    setProgress(0);
    lastSpeedRef.current = null;
    setCurrentSpeedLimit(null);
    return result;
  }, [data, failedPings, history, mode, selectedRegion]);

  const discardResult = useCallback(() => {
      setStatus(TestStatus.IDLE);
      setData([]);
      dataRef.current = [];
      setFailedPings(0);
      setProgress(0);
      lastSpeedRef.current = null;
      setCurrentSpeedLimit(null);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (progressIntervalRef.current) window.clearInterval(progressIntervalRef.current);
      if (durationTimerRef.current) window.clearTimeout(durationTimerRef.current);
      if (warmupTimerRef.current) window.clearTimeout(warmupTimerRef.current);
      isSpeedTestRunningRef.current = false;
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const loadData = data.filter(d => d.phase !== TestPhase.STABILITY);
  const stats: Stats = calculateStats(loadData, failedPings);
  
  const cappedData = data.filter(d => d.phase === TestPhase.STABILITY);
  const cappedStats = calculateStats(cappedData, 0);

  return {
    status,
    phase,
    mode,
    data,
    stats,
    cappedStats,
    progress,
    history,
    currentSpeedLimit,
    selectedRegion,
    setSelectedRegion,
    startTest,
    stopTest,
    saveResult,
    discardResult,
    reset: discardResult
  };
};
