/**
 * AlertsPanel Component
 * 
 * Displays alerts for high occupancy predictions with improved styling
 */

import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Calendar, TrendingUp } from 'lucide-react';

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
        return 'bg-gradient-to-r from-red-50 to-red-100 border-red-300 hover:border-red-400 hover:shadow-lg';
      case 'yellow':
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300 hover:border-yellow-400 hover:shadow-lg';
      default:
        return 'bg-gradient-to-r from-green-50 to-green-100 border-green-300 hover:border-green-400 hover:shadow-lg';
    }
  };

  const getSeverityBadge = (severity) => {
    const styles = {
      red: 'bg-red-600 text-white',
      yellow: 'bg-yellow-600 text-white',
      green: 'bg-green-600 text-white',
    };
    const labels = {
      red: 'Critical',
      yellow: 'Warning',
      green: 'Normal',
    };
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${styles[severity] || styles.green}`}>
        {labels[severity] || labels.green}
      </span>
    );
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
          <p className="text-gray-600">No alerts - All systems normal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border-2 ${getAlertStyle(alert.severity)} flex items-start space-x-3 transition-all duration-300 animate-slideIn`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
                {getAlertIcon(alert.severity)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(alert.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                {getSeverityBadge(alert.severity)}
              </div>
              <p className="text-sm text-gray-800 font-medium mb-2 leading-relaxed">{alert.message}</p>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <TrendingUp className="w-3 h-3 text-gray-500" />
                  <span className="font-bold text-gray-700">{alert.predicted_occupancy} beds</span>
                </div>
                <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="font-bold text-gray-700">{alert.utilization_percentage}%</span>
                  <span className="text-gray-500">capacity</span>
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default AlertsPanel;
