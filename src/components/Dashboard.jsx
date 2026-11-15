import { useState, useEffect } from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { useDarkMode } from '../hooks/useDarkMode';

/**
 * Modern Sensor Dashboard - Redesigned UI
 */
export function Dashboard() {
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
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatTime = (ts) => {
    if (!ts) return '--:--:--';
    return new Date(ts).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (ts) => {
    if (!ts) return 'Never';
    return new Date(ts).toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  // Loading skeleton
  if (loading && !mounted) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 animate-pulse" />
          <p className={`text-lg font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Loading sensor data...</p>
          <div className="w-48 mx-auto h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-gradient-to-r from-blue-500 to-cyan-500 animate-ping" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className={`w-full max-w-md p-8 rounded-2xl ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} border shadow-xl text-center`}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Connection Error</h2>
          <p className={`text-slate-500 dark:text-slate-400 mb-6`}>{error}</p>
          <p className={`text-sm text-slate-500 dark:text-slate-500`}>Check Firebase rules: set ".read": true</p>
        </div>
      </div>
    );
  }

  // Live indicator animation
  const liveClassName = `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
    isDark ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-800' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  }`;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Animated background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <header className={`relative sticky top-0 z-40 ${isDark ? 'bg-slate-950/80' : 'bg-white/80'} backdrop-blur-xl border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>Sensor Dashboard</h1>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>DHT11 • ESP8266 • Firebase Realtime</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={liveClassName}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
              <button
                onClick={toggle}
                className={`p-2.5 rounded-xl ${isDark ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} transition-all duration-200`}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-4xl mx-auto px-4 py-8 pb-16">
        {/* Error banner */}
        {error && (
          <div className={`mb-6 p-4 rounded-xl ${isDark ? 'bg-amber-900/30 border-amber-800' : 'bg-amber-50 border-amber-200'} border flex items-center gap-3 animate-slide-in`}>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <span className={`text-sm ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>{error}</span>
          </div>
        )}

        {/* Primary Sensor Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Temperature Card */}
          <SensorCard
            title="Temperature"
            value={temperature !== null ? temperature.toFixed(1) : '--'}
            unit="°C"
            icon={ThermometerIcon}
            gradient="from-amber-500 to-orange-500"
            bgGradient="from-amber-50 to-orange-50"
            darkGradient="from-amber-900/30 to-orange-900/30"
            iconBg="bg-amber-100 dark:bg-amber-900/30"
            iconColor="text-amber-500"
            lastUpdate={formatTime(lastUpdate)}
            trend={null}
          />

          {/* Humidity Card */}
          <SensorCard
            title="Humidity"
            value={humidity !== null ? humidity.toFixed(1) : '--'}
            unit="%"
            icon={DropletIcon}
            gradient="from-blue-500 to-cyan-500"
            bgGradient="from-blue-50 to-cyan-50"
            darkGradient="from-blue-900/30 to-cyan-900/30"
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-500"
            lastUpdate={formatTime(lastUpdate)}
            trend={null}
          />
        </div>

        {/* Derived Values */}
        {(temperature !== null && humidity !== null) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <DerivedCard
              title="Heat Index"
              subtitle="Feels like"
              value={calculateHeatIndex(temperature, humidity).toFixed(1)}
              unit="°C"
              icon={FireIcon}
              gradient="from-red-500 to-red-600"
              bgGradient="from-red-50 to-red-100"
              darkGradient="from-red-900/30 to-red-800/30"
              iconBg="bg-red-100 dark:bg-red-900/30"
              iconColor="text-red-500"
            />
            <DerivedCard
              title="Dew Point"
              subtitle="Condensation temp"
              value={calculateDewPoint(temperature, humidity).toFixed(1)}
              unit="°C"
              icon={CloudIcon}
              gradient="from-purple-500 to-indigo-500"
              bgGradient="from-purple-50 to-indigo-50"
              darkGradient="from-purple-900/30 to-indigo-900/30"
              iconBg="bg-purple-100 dark:bg-purple-900/30"
              iconColor="text-purple-500"
            />
          </div>
        )}

        {/* Today's Extremes */}
        <ExtremesCard
          minTemp={minTemp}
          maxTemp={maxTemp}
          minTempTime={minTempTime}
          maxTempTime={maxTempTime}
          formatDate={formatDate}
          resetMinMax={resetMinMax}
          isDark={isDark}
        />

        {/* Connection Status */}
        <StatusCard
          lastUpdate={formatTime(lastUpdate)}
          isDark={isDark}
        />

        {/* Footer */}
        <footer className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Source: <code className="font-mono px-2 py-0.5 rounded ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}">/sensor/temperature</code>{' '}&{' '}
            <code className="font-mono px-2 py-0.5 rounded ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}">/sensor/humidity</code>
          </p>
          <p className={`text-xs mt-2 ${isDark ? 'text-slate-600' : 'text-slate-500'}`}>
            Updated via cron-job.org every 5 min • GitHub Actions • Firebase Realtime DB
          </p>
        </footer>
      </main>
    </div>
  );
}

/* ────────────────── Sub Components ────────────────── */

function SensorCard({ 
  title, value, unit, icon: Icon, gradient, bgGradient, darkGradient, 
  iconBg, iconColor, lastUpdate, trend 
}) {
  return (
    <div className="group relative rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      {/* Gradient border accent */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
           style={{ background: `linear-gradient(135deg, ${gradient.split(' ')[0]}, ${gradient.split(' ')[2]})` }} />
      
      <div className={`relative rounded-xl p-5 ${gradient.includes('amber') ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30' : 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30'} border ${gradient.includes('amber') ? 'border-amber-200 dark:border-amber-800' : 'border-blue-200 dark:border-blue-800'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${iconBg}`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</span>
                <span className="text-xl text-slate-400 dark:text-slate-500 font-medium">{unit}</span>
              </div>
            </div>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${trend === 'up' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
              {trend === 'up' ? '↑' : '↓'}
            </div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Updated {lastUpdate}
          </span>
        </div>
      </div>
    </div>
  );
}

function DerivedCard({ title, subtitle, value, unit, icon: Icon, gradient, bgGradient, darkGradient, iconBg, iconColor }) {
  return (
    <div className="group relative rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      <div className={`relative rounded-xl p-5 ${bgGradient} dark:${darkGradient} border border-slate-200 dark:border-slate-700`}>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${iconBg}`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</span>
              <span className="text-lg text-slate-400 dark:text-slate-500 font-medium">{unit}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExtremesCard({ minTemp, maxTemp, minTempTime, maxTempTime, formatDate, resetMinMax, isDark }) {
  return (
    <div className="rounded-2xl p-6 shadow-sm border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-5">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Today's Extremes
        </h3>
        {(minTemp !== null || maxTemp !== null) && (
          <button
            onClick={resetMinMax}
            className="px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            Reset Today
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Minimum */}
        <div className="relative rounded-xl p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
          <div className="absolute top-3 right-3 w-12 h-12 bg-blue-500/10 dark:bg-blue-500/5 rounded-full" />
          <div className="relative flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Minimum</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {minTemp !== null ? minTemp.toFixed(1) : '--'}
                </span>
                <span className="text-lg text-slate-400 dark:text-slate-500">°C</span>
              </div>
              {minTempTime && (
                <p className="text-xs mt-1 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDate(minTempTime)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Maximum */}
        <div className="relative rounded-xl p-5 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800">
          <div className="absolute top-3 right-3 w-12 h-12 bg-red-500/10 dark:bg-red-500/5 rounded-full" />
          <div className="relative flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">Maximum</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {maxTemp !== null ? maxTemp.toFixed(1) : '--'}
                </span>
                <span className="text-lg text-slate-400 dark:text-slate-500">°C</span>
              </div>
              {maxTempTime && (
                <p className="text-xs mt-1 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 01-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDate(maxTempTime)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ lastUpdate, isDark }) {
  return (
    <div className="rounded-2xl p-5 shadow-sm border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Last update: <span className="font-mono font-medium text-slate-900 dark:text-white">{lastUpdate}</span></span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <span>Device: <span className="font-mono font-medium text-slate-900 dark:text-white">ESP8266-DHT11</span></span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500/20 animate-ping" />
          </div>
          <span className="font-medium text-emerald-600 dark:text-emerald-400">Firebase Connected</span>
        </div>
      </div>
    </div>
  );
}

/* ────────────────── Icons ────────────────── */

function ThermometerIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function DropletIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 8.25a3.75 3.75 0 110 7.5 3.75 3.75 0 010-7.5zM12 18a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18z" />
    </svg>
  );
}

function FireIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  );
}

/* ────────────────── Calculations ────────────────── */

function calculateHeatIndex(tempC, humidity) {
  const tempF = tempC * 9/5 + 32;
  const hi = -42.379 + 2.04901523 * tempF + 10.14333127 * humidity 
    - 0.22475541 * tempF * humidity - 0.00683783 * tempF * tempF 
    - 0.05481717 * humidity * humidity + 0.00122874 * tempF * tempF * humidity 
    + 0.00085282 * tempF * humidity * humidity - 0.00000199 * tempF * tempF * humidity * humidity;
  return (hi - 32) * 5/9;
}

function calculateDewPoint(tempC, humidity) {
  const a = 17.27;
  const b = 237.7;
  const alpha = (a * tempC) / (b + tempC) + Math.log(humidity / 100);
  return (b * alpha) / (a - alpha);
}