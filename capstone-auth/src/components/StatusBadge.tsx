import React from 'react';
import { Badge } from './ui/badge';
import { StatusBadgeProps } from '../types';

const StatusBadge: React.FC<StatusBadgeProps> = ({ count, label, icon, color }) => {
  const variant = color === 'primary' ? 'default' : color;
  
  return (
    <div className="flex flex-col items-center p-4 rounded-lg bg-card border shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <Badge variant={variant} className="text-lg px-3 py-1">
          {count}
        </Badge>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
};

export default StatusBadge;
