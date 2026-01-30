/**
 * Alerts Page
 * 
 * View and manage capacity alerts
 * Configure alert thresholds and notifications
 */

import { useState, useEffect } from 'react';
import { AlertCircle, Bell, CheckCircle, XCircle, Settings, TrendingUp } from 'lucide-react';
import { getHospitals } from '../services/api';

const Alerts = () => {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all'); // all, critical, warning, info

  useEffect(() => {
    loadHospitals();
  }, []);

  useEffect(() => {
    if (selectedHospitalId) {
      generateAlerts(selectedHospitalId);
    }
  }, [selectedHospitalId]);

  const loadHospitals = async () => {
    try {
      const data = await getHospitals();
      setHospitals(data);
      if (data.length > 0) {
        setSelectedHospitalId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load hospitals:', error);
    }
  };

  const generateAlerts = (hospitalId) => {
    // Demo alerts
    const demoAlerts = [
      {
        id: 1,
        type: 'critical',
        title: 'Critical Capacity Warning',
        message: 'Predicted occupancy will exceed 90% in 2 days',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        hospitalId,
        read: false
      },
      {
        id: 2,
        type: 'warning',
        title: 'High Occupancy Expected',
        message: 'Occupancy trending above 85% for next 5 days',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        hospitalId,
        read: false
      },
      {
        id: 3,
        type: 'info',
        title: 'Weekly Forecast Updated',
        message: 'New 7-day forecast available with 95% confidence',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        hospitalId,
        read: true
      },
      {
        id: 4,
        type: 'warning',
        title: 'ICU Capacity Alert',
        message: 'ICU beds at 78% capacity, monitor closely',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        hospitalId,
        read: true
      },
      {
        id: 5,
        type: 'info',
        title: 'Data Import Complete',
        message: 'Successfully imported 30 days of EHR records',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        hospitalId,
        read: true
      }
    ];
    
    setAlerts(demoAlerts);
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.type === filter;
  });

  const unreadCount = alerts.filter(a => !a.read).length;
  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;

  const getAlertStyle = (type) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          badge: 'bg-red-100 text-red-800'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          badge: 'bg-yellow-100 text-yellow-800'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-800'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Alerts</h1>
          <p className="text-gray-600">Capacity warnings and system notifications</p>
        </div>
        <button className="px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Alert Settings
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600">Critical</div>
              <div className="text-3xl font-bold text-gray-900">{criticalCount}</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border border-yellow-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600">Warnings</div>
              <div className="text-3xl font-bold text-gray-900">{warningCount}</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600">Unread</div>
              <div className="text-3xl font-bold text-gray-900">{unreadCount}</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600">Total Alerts</div>
              <div className="text-3xl font-bold text-gray-900">{alerts.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Hospital Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Hospital</label>
            <select
              value={selectedHospitalId || ''}
              onChange={(e) => setSelectedHospitalId(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            >
              {hospitals.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.hospital_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filter === 'all' ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('critical')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filter === 'critical' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Critical
              </button>
              <button
                onClick={() => setFilter('warning')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filter === 'warning' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Warning
              </button>
              <button
                onClick={() => setFilter('info')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filter === 'info' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Info
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Alerts</h3>
            <p className="text-gray-600">
              {filter === 'all' ? 'You have no alerts at this time' : `No ${filter} alerts found`}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const style = getAlertStyle(alert.type);
            return (
              <div
                key={alert.id}
                className={`bg-white rounded-2xl shadow-sm border-2 ${style.border} p-6 hover:shadow-lg transition-all ${
                  !alert.read ? 'border-l-4' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${style.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <AlertCircle className={`w-6 h-6 ${style.icon}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">{alert.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style.badge} uppercase`}>
                            {alert.type}
                          </span>
                          {!alert.read && (
                            <span className="w-2 h-2 bg-sky-600 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-gray-700">{alert.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-gray-500">{formatTimestamp(alert.timestamp)}</span>
                      <div className="flex items-center gap-2">
                        {!alert.read && (
                          <button className="px-4 py-2 bg-sky-50 text-sky-600 rounded-lg font-semibold hover:bg-sky-100 transition-colors text-sm">
                            Mark as Read
                          </button>
                        )}
                        <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm">
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Alert Settings Info */}
      <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-6 border border-sky-100">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Alert Configuration</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
            <p><span className="font-semibold">Critical Alerts:</span> Triggered when predicted occupancy exceeds 90% capacity</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
            <p><span className="font-semibold">Warning Alerts:</span> Triggered when predicted occupancy exceeds 80% capacity</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
            <p><span className="font-semibold">Info Alerts:</span> System updates, data imports, and forecast refreshes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
