/**
 * MetricCard Component
 * 
 * Displays a single metric with icon and optional trend
 */

import React from 'react';

const MetricCard = ({ title, value, subtitle, icon: Icon, status }) => {
  const getStatusColor = () => {
    if (status === 'red') return 'bg-red-50 border-red-200';
    if (status === 'yellow') return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const getIconColor = () => {
    if (status === 'red') return 'text-red-600';
    if (status === 'yellow') return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className={`p-6 rounded-lg border-2 ${getStatusColor()} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-full ${getStatusColor()}`}>
            <Icon className={`h-6 w-6 ${getIconColor()}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
