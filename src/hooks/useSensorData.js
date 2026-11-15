import { useState, useEffect } from 'react';
import { database, ref, onValue, set } from '../firebase/config';

/**
 * Hook to fetch sensor data from Firebase Realtime Database
 * Reads current values from /sensor/temperature & /sensor/humidity
 * Reads min/max from /sensor/minmax (updated by GitHub Actions 24/7)
 */
export function useSensorData() {
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Min/Max from Firebase (survives dashboard restarts, tracked 24/7 by GitHub Actions)
  const [minTemp, setMinTemp] = useState(null);
  const [maxTemp, setMaxTemp] = useState(null);
  const [minTempTime, setMinTempTime] = useState(null);
  const [maxTempTime, setMaxTempTime] = useState(null);

  useEffect(() => {
    const tempRef = ref(database, 'sensor/temperature');
    const humRef = ref(database, 'sensor/humidity');
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
      }
    }, (err) => {
      if (!mounted) return;
      console.error('[Firebase] Min/Max error:', err);
    });

    return () => {
      mounted = false;
      tempUnsubscribe();
      humUnsubscribe();
      minMaxUnsubscribe();
    };
  }, []);

  // Function to reset min/max via direct database write
  const resetMinMax = async () => {
    try {
      await set(ref(database, 'sensor/minmax'), { min: null, max: null, minTime: null, maxTime: null });
      console.log('Min/Max reset requested via database write');
    } catch (err) {
      console.error('Failed to reset min/max:', err);
    }
  };

  return { 
    temperature, 
    humidity, 
    loading, 
    error, 
    lastUpdate,
    minTemp,
    maxTemp,
    minTempTime,
    maxTempTime,
    resetMinMax
  };
}