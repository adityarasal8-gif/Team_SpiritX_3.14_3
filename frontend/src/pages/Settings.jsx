/**
 * Settings Page
 * 
 * User preferences and system configuration
 * Manage hospitals, thresholds, and notifications
 */

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Database, AlertCircle, Save, Hospital } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@hospital.com',
    hospitalName: user?.hospitalName || 'General Hospital',
    phone: '+1 (555) 123-4567',
    role: 'Hospital Administrator'
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    criticalAlerts: true,
    warningAlerts: true,
    infoAlerts: false,
    dailyReports: true,
    weeklyReports: true
  });

  // Threshold settings
  const [thresholdSettings, setThresholdSettings] = useState({
    criticalThreshold: 90,
    warningThreshold: 80,
    icuCriticalThreshold: 85,
    icuWarningThreshold: 70,
    forecastDays: 7
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'thresholds', name: 'Alert Thresholds', icon: AlertCircle },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'data', name: 'Data Management', icon: Database }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your preferences and system configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-sky-50 to-cyan-50 text-sky-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                      {profileData.name.charAt(0)}
                    </div>
                    <div>
                      <button className="px-4 py-2 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-all mr-2">
                        Change Photo
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Hospital Name</label>
                      <input
                        type="text"
                        value={profileData.hospitalName}
                        onChange={(e) => setProfileData({ ...profileData, hospitalName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                      <input
                        type="text"
                        value={profileData.role}
                        onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Delivery Methods</h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <div>
                          <div className="font-semibold text-gray-900">Email Alerts</div>
                          <div className="text-sm text-gray-600">Receive alerts via email</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailAlerts}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, emailAlerts: e.target.checked })}
                          className="w-5 h-5 text-sky-600 rounded focus:ring-2 focus:ring-sky-500"
                        />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <div>
                          <div className="font-semibold text-gray-900">SMS Alerts</div>
                          <div className="text-sm text-gray-600">Receive alerts via text message</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.smsAlerts}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, smsAlerts: e.target.checked })}
                          className="w-5 h-5 text-sky-600 rounded focus:ring-2 focus:ring-sky-500"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Alert Types</h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-red-50 rounded-xl cursor-pointer hover:bg-red-100 transition-colors border border-red-200">
                        <div>
                          <div className="font-semibold text-gray-900">Critical Alerts</div>
                          <div className="text-sm text-gray-600">Immediate capacity warnings</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.criticalAlerts}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, criticalAlerts: e.target.checked })}
                          className="w-5 h-5 text-sky-600 rounded focus:ring-2 focus:ring-sky-500"
                        />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl cursor-pointer hover:bg-yellow-100 transition-colors border border-yellow-200">
                        <div>
                          <div className="font-semibold text-gray-900">Warning Alerts</div>
                          <div className="text-sm text-gray-600">High occupancy warnings</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.warningAlerts}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, warningAlerts: e.target.checked })}
                          className="w-5 h-5 text-sky-600 rounded focus:ring-2 focus:ring-sky-500"
                        />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200">
                        <div>
                          <div className="font-semibold text-gray-900">Info Alerts</div>
                          <div className="text-sm text-gray-600">System updates and reports</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.infoAlerts}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, infoAlerts: e.target.checked })}
                          className="w-5 h-5 text-sky-600 rounded focus:ring-2 focus:ring-sky-500"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Scheduled Reports</h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <div>
                          <div className="font-semibold text-gray-900">Daily Reports</div>
                          <div className="text-sm text-gray-600">Receive daily occupancy summary</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.dailyReports}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, dailyReports: e.target.checked })}
                          className="w-5 h-5 text-sky-600 rounded focus:ring-2 focus:ring-sky-500"
                        />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <div>
                          <div className="font-semibold text-gray-900">Weekly Reports</div>
                          <div className="text-sm text-gray-600">Receive weekly analytics digest</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.weeklyReports}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyReports: e.target.checked })}
                          className="w-5 h-5 text-sky-600 rounded focus:ring-2 focus:ring-sky-500"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Thresholds Tab */}
            {activeTab === 'thresholds' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Alert Thresholds</h2>
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-xl p-6 border border-sky-100">
                    <h3 className="font-bold text-gray-900 mb-2">About Thresholds</h3>
                    <p className="text-sm text-gray-700">
                      Configure when alerts are triggered based on predicted occupancy levels. Adjust these values to match your hospital's capacity planning requirements.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">General Beds</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-semibold text-gray-700">Critical Threshold</label>
                          <span className="text-2xl font-bold text-red-600">{thresholdSettings.criticalThreshold}%</span>
                        </div>
                        <input
                          type="range"
                          min="70"
                          max="100"
                          value={thresholdSettings.criticalThreshold}
                          onChange={(e) => setThresholdSettings({ ...thresholdSettings, criticalThreshold: Number(e.target.value) })}
                          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                        />
                        <p className="text-sm text-gray-600 mt-2">Triggers critical alerts when occupancy exceeds this percentage</p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-semibold text-gray-700">Warning Threshold</label>
                          <span className="text-2xl font-bold text-yellow-600">{thresholdSettings.warningThreshold}%</span>
                        </div>
                        <input
                          type="range"
                          min="60"
                          max="90"
                          value={thresholdSettings.warningThreshold}
                          onChange={(e) => setThresholdSettings({ ...thresholdSettings, warningThreshold: Number(e.target.value) })}
                          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
                        />
                        <p className="text-sm text-gray-600 mt-2">Triggers warning alerts when occupancy exceeds this percentage</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">ICU Beds</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-semibold text-gray-700">ICU Critical Threshold</label>
                          <span className="text-2xl font-bold text-red-600">{thresholdSettings.icuCriticalThreshold}%</span>
                        </div>
                        <input
                          type="range"
                          min="70"
                          max="100"
                          value={thresholdSettings.icuCriticalThreshold}
                          onChange={(e) => setThresholdSettings({ ...thresholdSettings, icuCriticalThreshold: Number(e.target.value) })}
                          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                        />
                        <p className="text-sm text-gray-600 mt-2">Critical alert threshold for ICU occupancy</p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-semibold text-gray-700">ICU Warning Threshold</label>
                          <span className="text-2xl font-bold text-yellow-600">{thresholdSettings.icuWarningThreshold}%</span>
                        </div>
                        <input
                          type="range"
                          min="60"
                          max="90"
                          value={thresholdSettings.icuWarningThreshold}
                          onChange={(e) => setThresholdSettings({ ...thresholdSettings, icuWarningThreshold: Number(e.target.value) })}
                          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
                        />
                        <p className="text-sm text-gray-600 mt-2">Warning alert threshold for ICU occupancy</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Forecast Settings</h3>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Default Forecast Period</label>
                      <select
                        value={thresholdSettings.forecastDays}
                        onChange={(e) => setThresholdSettings({ ...thresholdSettings, forecastDays: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                      >
                        <option value="3">3 Days</option>
                        <option value="7">7 Days</option>
                        <option value="14">14 Days</option>
                        <option value="30">30 Days</option>
                      </select>
                      <p className="text-sm text-gray-600 mt-2">Number of days to forecast by default</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                          placeholder="Enter current password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                          placeholder="Confirm new password"
                        />
                      </div>
                      <button className="px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-all">
                        Update Password
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">Enable 2FA</div>
                        <div className="text-sm text-gray-600">Add an extra layer of security to your account</div>
                      </div>
                      <button className="px-4 py-2 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-all">
                        Enable
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Active Sessions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <div className="font-semibold text-gray-900">Current Session</div>
                          <div className="text-sm text-gray-600">Windows • Chrome • Active now</div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Management Tab */}
            {activeTab === 'data' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Management</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Data Export</h3>
                    <div className="p-4 bg-gray-50 rounded-xl mb-4">
                      <p className="text-sm text-gray-700 mb-4">
                        Export all your hospital data including EHR records, predictions, and reports.
                      </p>
                      <button className="px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-all flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Export All Data
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Data Retention</h3>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">EHR Data Retention Period</label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                      >
                        <option>30 Days</option>
                        <option>60 Days</option>
                        <option>90 Days</option>
                        <option>1 Year</option>
                        <option>2 Years</option>
                        <option>5 Years</option>
                      </select>
                      <p className="text-sm text-gray-600 mt-2">How long to store historical EHR records</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-red-900 mb-4">Danger Zone</h3>
                    <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                      <div className="font-semibold text-red-900 mb-2">Delete All Data</div>
                      <p className="text-sm text-red-700 mb-4">
                        Permanently delete all hospital data, predictions, and reports. This action cannot be undone.
                      </p>
                      <button className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all">
                        Delete All Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50"
              >
                <Save className={`w-5 h-5 ${saving ? 'animate-spin' : ''}`} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
