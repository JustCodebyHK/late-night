import { useState, useEffect } from 'react';
import { database, ref, onValue, set } from '../firebase/config';

/**
 * Hook to fetch sensor data from Firebase Realtime Database
 * Reads current values from /sensor/temperature, /sensor/humidity, /sensor/gasRaw, /sensor/gasPercent
 * Reads min/max from /sensor/minmax (updated by GitHub Actions 24/7)
 */
export function useSensorData() {
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [gasRaw, setGasRaw] = useState(null);
  const [gasPercent, setGasPercent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Min/Max from Firebase (survives dashboard restarts, tracked 24/7 by GitHub Actions)
  const [minTemp, setMinTemp] = useState(null);
  const [maxTemp, setMaxTemp] = useState(null);
  const [minTempTime, setMinTempTime] = useState(null);
  const [maxTempTime, setMaxTempTime] = useState(null);
  
  // Gas min/max tracking
  const [minGas, setMinGas] = useState(null);
  const [maxGas, setMaxGas] = useState(null);
  const [minGasTime, setMinGasTime] = useState(null);
  const [maxGasTime, setMaxGasTime] = useState(null);

  useEffect(() => {
    const tempRef = ref(database, 'sensor/temperature');
    const humRef = ref(database, 'sensor/humidity');
    const gasRawRef = ref(database, 'sensor/gasRaw');
    const gasPercentRef = ref(database, 'sensor/gasPercent');
    const minMaxRef = ref(database, 'sensor/minmax');

    let mounted = true;

    // Subscribe to temperature
    const tempUnsubscribe = onValue(tempRef, (snapshot) => {
      if (!mounted) return;
      
      const value = snapshot.val();
      console.log('[Firebase] Temperature:', value);
      if (value !== null) {
        setTemperature(Number(value));
        setLastUpdate(Date.now());
      }
      setLoading(false);
    }, (err) => {
      if (!mounted) return;
      console.error('[Firebase] Temperature error:', err);
      setError(err.message);
      setLoading(false);
    });

    // Subscribe to humidity
    const humUnsubscribe = onValue(humRef, (snapshot) => {
      if (!mounted) return;
      
      const value = snapshot.val();
      console.log('[Firebase] Humidity:', value);
      if (value !== null) {
        setHumidity(Number(value));
      }
    }, (err) => {
      if (!mounted) return;
      console.error('[Firebase] Humidity error:', err);
      setError(err.message);
    });

    // Subscribe to gas raw
    const gasRawUnsubscribe = onValue(gasRawRef, (snapshot) => {
      if (!mounted) return;
      
      const value = snapshot.val();
      console.log('[Firebase] Gas Raw:', value);
      if (value !== null) {
        setGasRaw(Number(value));
      }
    }, (err) => {
      if (!mounted) return;
      console.error('[Firebase] Gas Raw error:', err);
      setError(err.message);
    });

    // Subscribe to gas percent
    const gasPercentUnsubscribe = onValue(gasPercentRef, (snapshot) => {
      if (!mounted) return;
      
      const value = snapshot.val();
      console.log('[Firebase] Gas Percent:', value);
      if (value !== null) {
        setGasPercent(Number(value));
      }
    }, (err) => {
      if (!mounted) return;
      console.error('[Firebase] Gas Percent error:', err);
      setError(err.message);
    });

    // Subscribe to min/max (from GitHub Actions)
    const minMaxUnsubscribe = onValue(minMaxRef, (snapshot) => {
      if (!mounted) return;
      
      const data = snapshot.val();
      console.log('[Firebase] Min/Max:', data);
      if (data) {
        if (data.min !== null && data.min !== undefined) setMinTemp(Number(data.min));
        if (data.max !== null && data.max !== undefined) setMaxTemp(Number(data.max));
        if (data.minTime) setMinTempTime(data.minTime);
        if (data.maxTime) setMaxTempTime(data.maxTime);
        
        // Gas min/max
        if (data.minGas !== null && data.minGas !== undefined) setMinGas(Number(data.minGas));
        if (data.maxGas !== null && data.maxGas !== undefined) setMaxGas(Number(data.maxGas));
        if (data.minGasTime) setMinGasTime(data.minGasTime);
        if (data.maxGasTime) setMaxGasTime(data.maxGasTime);
      }
    }, (err) => {
      if (!mounted) return;
      console.error('[Firebase] Min/Max error:', err);
    });

    return () => {
      mounted = false;
      tempUnsubscribe();
      humUnsubscribe();
      gasRawUnsubscribe();
      gasPercentUnsubscribe();
      minMaxUnsubscribe();
    };
  }, []);

  // Function to reset min/max via direct database write
  const resetMinMax = async () => {
    try {
      await set(ref(database, 'sensor/minmax'), { 
        min: null, max: null, minTime: null, maxTime: null,
        minGas: null, maxGas: null, minGasTime: null, maxGasTime: null 
      });
      console.log('Min/Max reset requested via database write');
    } catch (err) {
      console.error('Failed to reset min/max:', err);
    }
  };

  return { 
    temperature, 
    humidity,
    gasRaw,
    gasPercent,
    loading, 
    error, 
    lastUpdate,
    minTemp,
    maxTemp,
    minTempTime,
    maxTempTime,
    minGas,
    maxGas,
    minGasTime,
    maxGasTime,
    resetMinMax
  };
}