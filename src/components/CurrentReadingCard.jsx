import { useState, useEffect } from 'react';

/**
 * Card component displaying current temperature or humidity reading
 * with animated value transitions
 */
export function CurrentReadingCard({ 
  title, 
  value, 
  unit, 
  icon, 
  color = 'blue',
  trend = null // 'up' | 'down' | null
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  // Animate value change
  useEffect(() => {
    if (value !== prevValue) {
      const steps = 20;
      const stepValue = (value - prevValue) / steps;
      let currentStep = 0;
      
      const animate = setInterval(() => {
        currentStep++;
        setDisplayValue(prevValue + stepValue * currentStep);
        if (currentStep >= steps) {
          setDisplayValue(value);
          setPrevValue(value);
          clearInterval(animate);
        }
      }, 30);
      
      return () => clearInterval(animate);
    }
  }, [value, prevValue]);

  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600 border-blue-200 dark:border-blue-800',
    green: 'bg-green-500 text-green-600 border-green-200 dark:border-green-800',
    orange: 'bg-orange-500 text-orange-600 border-orange-200 dark:border-orange-800',
    red: 'bg-red-500 text-red-600 border-red-200 dark:border-red-800',
    purple: 'bg-purple-500 text-purple-600 border-purple-200 dark:border-purple-800',
  };

  const bgClass = colorClasses[color] || colorClasses.blue;
  const [bgColor, textColor, borderColor] = bgClass.split(' ');

  const trendIcons = {
    up: '↑',
    down: '↓',
  };

  return (
    <div className={`relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border ${borderColor} transition-all duration-300 hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${bgColor} bg-opacity-10`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold ${textColor}`}>
                {displayValue !== null ? displayValue.toFixed(1) : '--'}
              </span>
              <span className="text-lg text-gray-400 dark:text-gray-500">{unit}</span>
            </div>
          </div>
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${
            trend === 'up' ? 'text-green-500' : 'text-red-500'
          }`}>
            <span>{trendIcons[trend]}</span>
          </div>
        )}
      </div>

      {/* Decorative accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl" style={{ background: `linear-gradient(90deg, transparent, ${textColor}, transparent)` }} />
    </div>
  );
}