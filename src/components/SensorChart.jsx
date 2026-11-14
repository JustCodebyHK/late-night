import { useEffect, useRef, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useDarkMode } from '../hooks/useDarkMode';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Reusable line chart component for sensor data
 */
export function SensorChart({ 
  data, 
  label, 
  color = '#3b82f6',
  backgroundColor = 'rgba(59, 130, 246, 0.1)',
  borderColor = '#3b82f6',
  yAxisLabel,
  min = null,
  max = null,
  height = 300
}) {
  const { isDark } = useDarkMode();
  const chartRef = useRef(null);

  // Chart options - memoized to prevent re-renders
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : '#111827',
        titleColor: isDark ? '#f3f4f6' : '#ffffff',
        bodyColor: isDark ? '#d1d5db' : '#e5e7eb',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `${label}: ${context.parsed.y.toFixed(1)}${yAxisLabel ? ' ' + yAxisLabel : ''}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
          font: { size: 11 },
          maxTicksLimit: 8,
        },
        border: {
          display: false,
        },
      },
      y: {
        min,
        max,
        grid: {
          color: isDark ? '#374151' : '#e5e7eb',
          drawBorder: false,
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
          font: { size: 11 },
          callback: (value) => `${value}${yAxisLabel ? ' ' + yAxisLabel : ''}`,
        },
        border: {
          display: false,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2,
        borderColor,
        backgroundColor,
      },
      point: {
        radius: 0,
        hoverRadius: 6,
        hoverBorderWidth: 2,
        hoverBorderColor: '#ffffff',
        backgroundColor: borderColor,
      },
    },
    animation: {
      duration: 750,
      easing: 'easeOutQuart',
    },
  }), [isDark, label, yAxisLabel, min, max, borderColor, backgroundColor]);

  // Chart data - memoized
  const chartData = useMemo(() => ({
    labels: data?.labels || [],
    datasets: [{
      label,
      data: data?.temperature || data?.humidity || data || [],
      fill: true,
    }],
  }), [data, label]);

  // Handle theme change - update chart
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [isDark]);

  if (!data || (data.labels && data.labels.length === 0)) {
    return (
      <div className="h-[300px] flex items-center justify-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-400 dark:text-gray-500">
          <svg className="mx-auto mb-3 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm">No data available</p>
          <p className="text-xs mt-1">Waiting for sensor readings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
          {label}
        </h3>
      </div>
      <div style={{ height: `${height}px` }}>
        <Line
          ref={chartRef}
          data={chartData}
          options={options}
        />
      </div>
    </div>
  );
}

/**
 * Dual-axis chart showing both temperature and humidity
 */
export function DualSensorChart({ data, height = 350 }) {
  const { isDark } = useDarkMode();
  const chartRef = useRef(null);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: isDark ? '#d1d5db' : '#374151',
          font: { size: 12 },
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : '#111827',
        titleColor: isDark ? '#f3f4f6' : '#ffffff',
        bodyColor: isDark ? '#d1d5db' : '#e5e7eb',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
          font: { size: 11 },
          maxTicksLimit: 8,
        },
        border: { display: false },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Temperature (°C)',
          color: isDark ? '#9ca3af' : '#6b7280',
          font: { size: 11 },
        },
        grid: {
          color: isDark ? '#374151' : '#e5e7eb',
          drawBorder: false,
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
          font: { size: 11 },
          callback: (value) => `${value}°C`,
        },
        border: { display: false },
        suggestedMin: 0,
        suggestedMax: 50,
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Humidity (%)',
          color: isDark ? '#9ca3af' : '#6b7280',
          font: { size: 11 },
        },
        grid: { drawOnChartArea: false, drawBorder: false },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
          font: { size: 11 },
          callback: (value) => `${value}%`,
        },
        border: { display: false },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
    elements: {
      line: { tension: 0.4, borderWidth: 2 },
      point: { radius: 0, hoverRadius: 6, hoverBorderWidth: 2, hoverBorderColor: '#ffffff' },
    },
    animation: { duration: 750, easing: 'easeOutQuart' },
  }), [isDark]);

  const chartData = useMemo(() => {
    if (!data || !data.labels || data.labels.length === 0) {
      return { labels: [], datasets: [] };
    }
    return {
      labels: data.labels,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: data.temperature,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          yAxisID: 'y',
          fill: true,
        },
        {
          label: 'Humidity (%)',
          data: data.humidity,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          yAxisID: 'y1',
          fill: true,
        },
      ],
    };
  }, [data]);

  useEffect(() => {
    if (chartRef.current) chartRef.current.update();
  }, [isDark]);

  if (!data || !data.labels || data.labels.length === 0) {
    return (
      <div className="h-[350px] flex items-center justify-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-400 dark:text-gray-500">
          <svg className="mx-auto mb-3 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm">No historical data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Temperature & Humidity History
      </h3>
      <div style={{ height: `${height}px` }}>
        <Line
          ref={chartRef}
          data={chartData}
          options={options}
        />
      </div>
    </div>
  );
}