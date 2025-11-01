import React from 'react';
import { Badge } from './ui/badge';
import { StatusBadgeProps } from '../types';

const StatusBadge: React.FC<StatusBadgeProps> = ({ count, label, icon, color }) => {
  const variant = color === 'primary' ? 'default' : color;
  
  const colorClasses = {
    primary: 'from-blue-500 to-indigo-600 border-blue-300 dark:border-blue-700',
    success: 'from-green-500 to-emerald-600 border-green-300 dark:border-green-700',
    warning: 'from-orange-500 to-yellow-600 border-orange-300 dark:border-orange-700',
    destructive: 'from-red-500 to-pink-600 border-red-300 dark:border-red-700',
  };
  
  const gradientClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.primary;
  
  return (
    <div className={`flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 ${gradientClass.split(' ').slice(2).join(' ')} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-scale-in`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 bg-gradient-to-br ${gradientClass.split(' ').slice(0, 2).join(' ')} rounded-lg shadow-md`}>
          <span className="text-3xl filter drop-shadow-lg">{icon}</span>
        </div>
      </div>
      <div className={`text-4xl font-extrabold bg-gradient-to-r ${gradientClass.split(' ').slice(0, 2).join(' ')} bg-clip-text text-transparent mb-2`}>
        {count}
      </div>
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
    </div>
  );
};

export default StatusBadge;
