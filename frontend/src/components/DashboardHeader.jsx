/**
 * Dashboard Header Component
 * 
 * Top navigation bar with user info, notifications, and logout
 */

import { useState, useEffect, useRef } from 'react';
import { Bell, User, LogOut, Search, AlertTriangle, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getHospitals, getDashboard } from '../services/api';

const DashboardHeader = () => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (showNotifications && notifications.length === 0) {
      fetchNotifications();
    }
  }, [showNotifications]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Get all hospitals
      const hospitals = await getHospitals();
      
      // Get alerts from all hospitals
      const allAlerts = [];
      
      for (const hospital of hospitals) {
        try {
          const dashboard = await getDashboard(hospital.id);
          if (dashboard.alerts && dashboard.alerts.length > 0) {
            dashboard.alerts.forEach(alert => {
              allAlerts.push({
                ...alert,
                hospital_name: dashboard.hospital_name,
                hospital_id: dashboard.hospital_id
              });
            });
          }
        } catch (error) {
          console.error(`Failed to fetch alerts for hospital ${hospital.id}:`, error);
        }
      }

      // Sort by severity (red first, then yellow)
      allAlerts.sort((a, b) => {
        const severityOrder = { red: 0, yellow: 1, green: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });

      setNotifications(allAlerts);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'red':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'yellow':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'red':
        return 'bg-red-50 border-red-200';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  const unreadCount = notifications.filter(n => n.severity !== 'green').length;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 max-w-2xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search hospitals, predictions, alerts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 ml-6">
          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-sky-50 to-cyan-50">
                  <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="p-1 hover:bg-white rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="overflow-y-auto flex-1">
                  {loading ? (
                    <div className="p-8 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-2"></div>
                      Loading notifications...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="font-medium">No notifications</p>
                      <p className="text-sm">All systems operating normally</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification, index) => (
                        <div 
                          key={index}
                          className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${getSeverityColor(notification.severity)}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {getSeverityIcon(notification.severity)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-bold text-gray-900 truncate">
                                  {notification.hospital_name}
                                </p>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  notification.severity === 'red' 
                                    ? 'bg-red-100 text-red-700' 
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {notification.severity === 'red' ? 'Critical' : 'Warning'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mb-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500">
                                {notification.date}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <button 
                      onClick={fetchNotifications}
                      className="w-full px-4 py-2 text-sm font-semibold text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                    >
                      Refresh Notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</div>
              <div className="text-xs text-gray-500">{user?.hospitalName || 'Hospital'}</div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
