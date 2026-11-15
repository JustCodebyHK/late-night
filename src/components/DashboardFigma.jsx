import { useState, useEffect, useMemo } from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { useDarkMode } from '../hooks/useDarkMode';
import { StatusIndicator, StatusBadge } from './StatusIndicator';
import { SensorChart, DualSensorChart } from './SensorChart';
import { CurrentReadingCard } from './CurrentReadingCard';

/**
 * DashboardFigma - A beautiful sensor dashboard replica from Figma design
 * Integrates with Firebase real-time sensor data
 */
export function DashboardFigma() {
  const { isDark, toggle } = useDarkMode();
  const { 
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
  } = useSensorData();
  
  const [now, setNow] = useState(new Date());
  const [resetLabel, setResetLabel] = useState('Reset Today');
  const [chartData, setChartData] = useState({ labels: [], temperature: [], humidity: [] });
  const [chartTimeRange, setChartTimeRange] = useState('24h');

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate historical chart data (in production, fetch from Firebase history)
  useEffect(() => {
    // Generate mock historical data for demonstration
    const generateMockHistory = () => {
      const labels = [];
      const tempData = [];
      const humData = [];
      const now = Date.now();
      
      // Generate data points for the selected time range
      let hoursBack = 24;
      if (chartTimeRange === '1h') hoursBack = 1;
      else if (chartTimeRange === '6h') hoursBack = 6;
      else if (chartTimeRange === '7d') hoursBack = 24 * 7;
      
      const points = chartTimeRange === '1h' ? 60 : chartTimeRange === '6h' ? 72 : chartTimeRange === '24h' ? 48 : 56;
      const intervalMs = (hoursBack * 60 * 60 * 1000) / points;
      
      for (let i = points - 1; i >= 0; i--) {
        const time = new Date(now - i * intervalMs);
        labels.push(time.toLocaleTimeString('en-GB', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }));
        
        // Base values with some variation
        const baseTemp = temperature || 22;
        const baseHum = humidity || 50;
        const variation = Math.sin(i * 0.3) * 2 + (Math.random() - 0.5) * 1.5;
        const humVariation = Math.cos(i * 0.2) * 5 + (Math.random() - 0.5) * 3;
        
        tempData.push(Math.max(0, Math.round((baseTemp + variation) * 10) / 10));
        humData.push(Math.max(0, Math.min(100, Math.round(baseHum + humVariation))));
      }
      
      return { labels, temperature: tempData, humidity: humData };
    };
    
    setChartData(generateMockHistory());
  }, [chartTimeRange, temperature, humidity]);

  // Calculate heat index and dew point
  const heatIndex = useMemo(() => {
    if (temperature === null || humidity === null) return null;
    // Simplified heat index calculation
    const T = temperature;
    const RH = humidity;
    return Math.round((T + 0.33 * RH - 0.7 * T * RH / 100 - 4.0) * 10) / 10;
  }, [temperature, humidity]);

  const dewPoint = useMemo(() => {
    if (temperature === null || humidity === null) return null;
    // Magnus formula for dew point
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temperature) / (b + temperature)) + Math.log(humidity / 100);
    return Math.round((b * alpha) / (a - alpha) * 10) / 10;
  }, [temperature, humidity]);

  const handleReset = () => {
    resetMinMax();
    setResetLabel('Extremes Reset');
    setTimeout(() => setResetLabel('Reset Today'), 1800);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Metric cards data
  const metrics = useMemo(() => [
    {
      label: 'Temperature',
      description: 'Ambient reading',
      value: temperature !== null ? temperature.toFixed(1) : '—',
      unit: '°C',
      time: lastUpdate ? `Updated ${formatTimestamp(lastUpdate)}` : 'Waiting...',
      tone: 'coral',
      icon: '🌡️',
    },
    {
      label: 'Humidity',
      description: 'Relative humidity',
      value: humidity !== null ? humidity.toFixed(1) : '—',
      unit: '%',
      time: lastUpdate ? `Updated ${formatTimestamp(lastUpdate)}` : 'Waiting...',
      tone: 'blue',
      icon: '💧',
      progress: humidity !== null ? humidity : 0,
    },
    {
      label: 'Heat Index',
      description: 'Feels like',
      value: heatIndex !== null ? heatIndex.toFixed(1) : '—',
      unit: '°C',
      time: 'Calculated now',
      tone: 'amber',
      icon: '🔥',
    },
    {
      label: 'Dew Point',
      description: 'Condensation temp',
      value: dewPoint !== null ? dewPoint.toFixed(1) : '—',
      unit: '°C',
      time: 'Calculated now',
      tone: 'violet',
      icon: '🌫️',
    },
  ], [temperature, humidity, heatIndex, dewPoint, lastUpdate]);

  if (loading) {
    return (
      <main className="app-shell">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <div className="dashboard">
          <div className="loading-state">
            <div className="spinner" />
            <p>Connecting to sensors...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="dashboard">
        <header className="topbar">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" />
              Environmental monitor
            </div>
            <h1>Sensor Dashboard</h1>
            <p className="subtitle">
              DHT11 <span>•</span> ESP32 <span>•</span> Firebase Realtime
            </p>
          </div>
          <div className="header-actions">
            <StatusBadge isOnline={temperature !== null} />
            <button
              className="theme-toggle"
              type="button"
              onClick={toggle}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? (
                <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="3.75" stroke="currentColor" strokeWidth="1.7" />
                  <path
                    d="M12 2.25V4M12 20v1.75M21.75 12H20M4 12H2.25M18.9 5.1l-1.24 1.24M6.34 17.66 5.1 18.9M18.9 18.9l-1.24-1.24M6.34 6.34 5.1 5.1"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M20.1 15.3A8.65 8.65 0 0 1 8.7 3.9 8.65 8.65 0 1 0 20.1 15.3Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </header>

        <section className="metrics-grid" aria-label="Current sensor readings">
          {metrics.map((metric) => (
            <article className={`metric-card tone-${metric.tone}`} key={metric.label}>
              <div className="card-accent" />
              <div className="metric-heading">
                <div>
                  <h2>{metric.label}</h2>
                  <p>{metric.description}</p>
                </div>
                <div className="metric-icon" role="img" aria-label={metric.label}>
                  <span style={{ fontSize: '21px' }}>{metric.icon}</span>
                </div>
              </div>
              <div className="metric-reading">
                <strong>{metric.value}</strong>
                <span>{metric.unit}</span>
              </div>
              {metric.progress !== undefined ? (
                <div className="humidity-progress" aria-label={`${metric.progress}% humidity`}>
                  <span style={{ width: `${metric.progress}%` }} />
                </div>
              ) : (
                <div className="card-rule" />
              )}
              <p className="metric-time">
                <span className="fresh-dot" />
                {metric.time}
              </p>
            </article>
          ))}
        </section>

        <section className="extremes-card" aria-labelledby="extremes-heading">
          <div className="section-heading">
            <div>
              <div className="section-kicker">24 hour overview</div>
              <h2 id="extremes-heading">Today's Extremes</h2>
            </div>
            <button className="reset-button" type="button" onClick={handleReset}>
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M4.1 7A6.5 6.5 0 1 1 3.5 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M3.25 3.75V7.5H7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {resetLabel}
            </button>
          </div>

          <div className="extremes-grid">
            <article className="extreme minimum">
              <div className="extreme-top">
                <div className="extreme-icon">
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path
                      d="M10 3.5v13M5.5 12l4.5 4.5 4.5-4.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span>Minimum</span>
              </div>
              <div className="extreme-value">
                {minTemp !== null ? (
                  <>
                    {minTemp.toFixed(1)} <span>°C</span>
                  </>
                ) : (
                  <>— <span>°C</span></>
                )}
              </div>
              <p>
                Recorded at <strong>{minTempTime ? formatTimestamp(minTempTime) : '—'}</strong>
              </p>
            </article>
            <div className="extreme-divider" />
            <article className="extreme maximum">
              <div className="extreme-top">
                <div className="extreme-icon">
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path
                      d="M10 16.5v-13M5.5 8 10 3.5 14.5 8"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span>Maximum</span>
              </div>
              <div className="extreme-value">
                {maxTemp !== null ? (
                  <>
                    {maxTemp.toFixed(1)} <span>°C</span>
                  </>
                ) : (
                  <>— <span>°C</span></>
                )}
              </div>
              <p>
                Recorded at <strong>{maxTempTime ? formatTimestamp(maxTempTime) : '—'}</strong>
              </p>
            </article>
          </div>
        </section>

        {/* Historical Charts Section */}
        <section className="charts-section" aria-labelledby="charts-heading">
          <div className="section-heading">
            <div>
              <div className="section-kicker">Historical data</div>
              <h2 id="charts-heading">Temperature & Humidity History</h2>
            </div>
            <div className="chart-time-range" role="group" aria-label="Time range">
              {['1h', '6h', '24h', '7d'].map((range) => (
                <button
                  key={range}
                  className={`time-range-btn ${chartTimeRange === range ? 'active' : ''}`}
                  onClick={() => setChartTimeRange(range)}
                  aria-pressed={chartTimeRange === range}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="charts-grid">
            <DualSensorChart data={chartData} height={350} />
          </div>
        </section>

        <footer>
          <div className="status-bar">
            <div className="status-item">
              <span className="status-label">Last update</span>
              <strong>{lastUpdate ? `Today, ${formatTimestamp(lastUpdate)}` : 'Waiting for data...'}</strong>
            </div>
            <div className="status-separator" />
            <div className="status-item">
              <span className="status-label">Device</span>
              <strong>ESP32-DHT11</strong>
            </div>
            <StatusIndicator 
              isOnline={temperature !== null} 
              lastSeen={lastUpdate}
              deviceId="ESP32-DHT11"
              showDetails={true}
            />
          </div>
          <div className="metadata">
            <p>
              Source <code>/sensor/temperature</code> & <code>/sensor/humidity</code>
            </p>
            <p>Synced via GitHub Actions / Firebase Realtime DB</p>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
          color: var(--text-secondary);
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border);
          border-top-color: var(--blue);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}

export default DashboardFigma;