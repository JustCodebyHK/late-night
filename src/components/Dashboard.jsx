import { useState, useEffect } from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { useDarkMode } from '../hooks/useDarkMode';

/**
 * Simple Dashboard Component - shows current temperature & humidity
 */
export function Dashboard() {
  const { isDark, toggle } = useDarkMode();
  const { temperature, humidity, loading, error, lastUpdate, minTemp, maxTemp, minTempTime, maxTempTime, resetMinMax } = useSensorData();

  const formatTime = (ts) => {
    if (!ts) return 'Never';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading sensor data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center border ${isDark ? 'border-gray-700' : 'border-red-200'}`}>
          <svg className="mx-auto h-16 w-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Connection Error</h2>
          <p className={`text-gray-600 dark:text-gray-400 mb-6`}>{error}</p>
          <p className={`text-sm text-gray-500 dark:text-gray-500`}>Check Firebase rules: set ".read": true</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 ${isDark ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-sm border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Sensor Dashboard</h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>DHT11 • ESP8266 • Firebase</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}`}>
                ● Live
              </span>
              <button
                onClick={toggle}
                className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-colors`}
                aria-label={isDark ? 'Light mode' : 'Dark mode'}
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
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Error banner */}
        {error && (
          <div className={`mb-6 p-4 rounded-xl ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className={`text-sm ${isDark ? 'text-yellow-200' : 'text-yellow-800'}`}>{error}</span>
            </div>
          </div>
        )}

        {/* Sensor Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Temperature Card */}
          <div className={`relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-orange-500 bg-opacity-10">
                  <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Temperature</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {temperature !== null ? temperature.toFixed(1) : '--'}
                    </span>
                    <span className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>°C</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm">
              <span className={`text-gray-500 dark:text-gray-400`}>Updated: {formatTime(lastUpdate)}</span>
              <div className="flex items-center gap-1 text-green-500">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Online</span>
              </div>
            </div>
          </div>

          {/* Humidity Card */}
          <div className={`relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500 bg-opacity-10">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 8.25a3.75 3.75 0 110 7.5 3.75 3.75 0 010-7.5zM12 18a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Humidity</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {humidity !== null ? humidity.toFixed(1) : '--'}
                    </span>
                    <span className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm">
              <span className={`text-gray-500 dark:text-gray-400`}>Updated: {formatTime(lastUpdate)}</span>
              <div className="flex items-center gap-1 text-green-500">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Derived Values */}
        {(temperature !== null && humidity !== null) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Heat Index */}
            <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-red-500 bg-opacity-10">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Heat Index</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {calculateHeatIndex(temperature, humidity).toFixed(1)}°C
                  </p>
                </div>
              </div>
            </div>

            {/* Dew Point */}
            <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-500 bg-opacity-10">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Dew Point</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {calculateDewPoint(temperature, humidity).toFixed(1)}°C
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Min/Max Temperature */}
        <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-8`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`}>
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Temperature Extremes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Min Temperature */}
            <div className={`relative p-4 rounded-xl ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500 bg-opacity-20">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Minimum</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                      {minTemp !== null ? minTemp.toFixed(1) : '--'}
                    </span>
                    <span className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>°C</span>
                  </div>
                  {minTempTime && (
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Recorded: {formatTime(minTempTime)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Max Temperature */}
            <div className={`relative p-4 rounded-xl ${isDark ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500 bg-opacity-20">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDark ? 'text-red-300' : 'text-red-700'}`}>Maximum</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-bold ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                      {maxTemp !== null ? maxTemp.toFixed(1) : '--'}
                    </span>
                    <span className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>°C</span>
                  </div>
                  {maxTempTime && (
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Recorded: {formatTime(maxTempTime)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {(minTemp !== null || maxTemp !== null) && (
            <button
              onClick={resetMinMax}
              className="mt-4 w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              Reset Min/Max
            </button>
          )}
        </div>

        {/* Status */}
        <div className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-4">
              <span className={`text-gray-500 dark:text-gray-400`}>Last update: <span className={`font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatTime(lastUpdate)}</span></span>
              <span className={`text-gray-500 dark:text-gray-400`}>Device: <span className={`font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>ESP8266-DHT11</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className={`font-medium text-green-600 dark:text-green-400`}>Connected to Firebase</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Reading from <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">/sensor/temperature</code> & 
            <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">/sensor/humidity</code>
          </p>
        </footer>
      </main>
    </div>
  );
}

/**
 * Calculate heat index (feels like temperature)
 */
function calculateHeatIndex(tempC, humidity) {
  const tempF = tempC * 9/5 + 32;
  const hi = -42.379 + 2.04901523 * tempF + 10.14333127 * humidity 
    - 0.22475541 * tempF * humidity - 0.00683783 * tempF * tempF 
    - 0.05481717 * humidity * humidity + 0.00122874 * tempF * tempF * humidity 
    + 0.00085282 * tempF * humidity * humidity - 0.00000199 * tempF * tempF * humidity * humidity;
  return (hi - 32) * 5/9;
}

/**
 * Calculate dew point
 */
function calculateDewPoint(tempC, humidity) {
  const a = 17.27;
  const b = 237.7;
  const alpha = (a * tempC) / (b + tempC) + Math.log(humidity / 100);
  return (b * alpha) / (a - alpha);
}