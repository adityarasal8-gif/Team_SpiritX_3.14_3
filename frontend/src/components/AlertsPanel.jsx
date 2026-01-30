/**
 * AlertsPanel Component
 * 
 * Displays alerts for high occupancy predictions
 */

import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

const AlertsPanel = ({ alerts }) => {
  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'red':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'yellow':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
  };

  const getAlertStyle = (severity) => {
    switch (severity) {
      case 'red':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Alerts</h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-600">No alerts - All systems normal</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Alerts ({alerts.length})
      </h3>
      
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 ${getAlertStyle(alert.severity)} flex items-start space-x-3`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getAlertIcon(alert.severity)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {new Date(alert.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
              <p className="text-sm mt-1">{alert.message}</p>
              <p className="text-xs mt-1 font-semibold">
                Predicted: {alert.predicted_occupancy} beds ({alert.utilization_percentage}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPanel;
