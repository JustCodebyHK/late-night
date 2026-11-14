import { useEffect, useState } from 'react';

/**
 * Device status indicator with animated pulse when online
 */
export function StatusIndicator({ 
  isOnline, 
  lastSeen, 
  deviceId = 'ESP32-DHT11',
  showDetails = true 
}) {
  const [timeAgo, setTimeAgo] = useState('');

  // Update time ago every 30 seconds
  useEffect(() => {
    if (!lastSeen) {
      setTimeAgo('Never');
      return;
    }

    const updateTimeAgo = () => {
      const now = Date.now();
      const diff = now - lastSeen;
      
      if (diff < 60000) {
        setTimeAgo(`${Math.floor(diff / 1000)}s ago`);
      } else if (diff < 3600000) {
        setTimeAgo(`${Math.floor(diff / 60000)}m ago`);
      } else if (diff < 86400000) {
        setTimeAgo(`${Math.floor(diff / 3600000)}h ago`);
      } else {
        setTimeAgo(`${Math.floor(diff / 86400000)}d ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000);
    return () => clearInterval(interval);
  }, [lastSeen]);

  return (
    <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Status Dot with Pulse Animation */}
      <div className="relative flex-shrink-0">
        <div className={`w-4 h-4 rounded-full transition-colors duration-300 ${
          isOnline ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'
        }`} />
        {isOnline && (
          <div className="absolute inset-0 w-4 h-4 rounded-full bg-green-500 animate-pulse-ring opacity-75" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 dark:text-white truncate">{deviceId}</span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
            isOnline 
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        {showDetails && lastSeen && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Last seen: <span className="font-mono text-gray-700 dark:text-gray-300">{timeAgo}</span>
          </p>
        )}
      </div>

      {showDetails && (
        <div className="text-right">
          <p className="text-xs text-gray-400 dark:text-gray-500">Status</p>
          <p className={`font-mono text-sm ${
            isOnline ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {isOnline ? '● Connected' : '○ Disconnected'}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Compact status badge for use in headers
 */
export function StatusBadge({ isOnline, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-colors ${className} ${
      isOnline 
        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }`}>
      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
      {isOnline ? 'Live' : 'Offline'}
    </span>
  );
}