/**
 * Dashboard Overview Page - Redesigned
 * 
 * Main hospital operations dashboard displaying:
 * - Hospital selector
 * - Key metrics (beds, occupancy, utilization)
 * - Historical and predicted occupancy charts
 * - Alerts for high occupancy
 */

import { useState, useEffect } from 'react';
import { 
  Bed, 
  Activity, 
  Heart, 
  TrendingUp,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Users
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import OccupancyChart from '../components/OccupancyChart';
import AlertsPanel from '../components/AlertsPanel';
import HospitalSelector from '../components/HospitalSelector';
import { getHospitals, getDashboard } from '../services/api';

const Dashboard = () => {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load hospitals on mount
  useEffect(() => {
    loadHospitals();
  }, []);

  // Load dashboard data when hospital changes
  useEffect(() => {
    if (selectedHospitalId) {
      loadDashboard(selectedHospitalId);
    }
  }, [selectedHospitalId]);

  const loadHospitals = async () => {
    try {
      const data = await getHospitals();
      setHospitals(data);
      if (data.length > 0) {
        setSelectedHospitalId(data[0].id);
      }
    } catch (err) {
      setError('Failed to load hospitals: ' + err.message);
    }
  };

  const loadDashboard = async (hospitalId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboard(hospitalId);
      setDashboardData(data);
    } catch (err) {
      setError('Failed to load dashboard: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (selectedHospitalId) {
      loadDashboard(selectedHospitalId);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      green: 'bg-green-100 text-green-800 border border-green-300',
      yellow: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      red: 'bg-red-100 text-red-800 border border-red-300',
    };
    const labels = {
      green: 'Normal',
      yellow: 'Caution',
      red: 'Critical',
    };
    const icons = {
      green: <CheckCircle className="w-4 h-4" />,
      yellow: <AlertCircle className="w-4 h-4" />,
      red: <AlertCircle className="w-4 h-4" />
    };
    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${styles[status]}`}>
        {icons[status]}
        {labels[status]}
      </span>
    );
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-sky-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2 text-center">Error Loading Dashboard</h3>
          <p className="text-red-700 text-center mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Monitor bed occupancy and predict future demand</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Hospital Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <HospitalSelector
              hospitals={hospitals}
              selectedId={selectedHospitalId}
              onChange={setSelectedHospitalId}
            />
          </div>
          {dashboardData && (
            <div className="flex items-center gap-4">
              {getStatusBadge(dashboardData.overall_status || 'green')}
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Beds"
            value={dashboardData.total_beds || 0}
            icon={Bed}
            color="blue"
            trend={null}
          />
          <MetricCard
            title="Current Occupancy"
            value={dashboardData.current_occupied || 0}
            icon={Activity}
            color="purple"
            trend={null}
          />
          <MetricCard
            title="ICU Beds Used"
            value={dashboardData.current_icu_occupied || 0}
            icon={Heart}
            color="red"
            trend={null}
          />
          <MetricCard
            title="Utilization Rate"
            value={`${dashboardData.current_utilization || 0}%`}
            icon={TrendingUp}
            color={dashboardData.overall_status === 'green' ? 'green' : dashboardData.overall_status === 'yellow' ? 'yellow' : 'red'}
            trend={null}
          />
        </div>
      )}

      {/* Charts and Alerts Grid */}
      {dashboardData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Occupancy Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Occupancy Forecast</h2>
                <p className="text-sm text-gray-600">Historical data and 7-day predictions</p>
              </div>
              <OccupancyChart
                historicalData={dashboardData.historical_data}
                predictions={dashboardData.predictions}
              />
            </div>
          </div>

          {/* Alerts Panel - Takes 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Active Alerts</h2>
                <p className="text-sm text-gray-600">Capacity warnings and notifications</p>
              </div>
              <AlertsPanel alerts={dashboardData.alerts} />
            </div>
          </div>
        </div>
      )}

      {/* Additional Info Cards */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-6 border border-sky-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600">Available Beds</div>
                <div className="text-2xl font-bold text-gray-900">
                  {(dashboardData.total_beds || 0) - (dashboardData.current_occupied || 0)}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {dashboardData.total_beds ? Math.round((((dashboardData.total_beds || 0) - (dashboardData.current_occupied || 0)) / dashboardData.total_beds) * 100) : 0}% capacity available
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600">Peak Forecast</div>
                <div className="text-2xl font-bold text-gray-900">
                  {dashboardData.predictions && dashboardData.predictions.length > 0
                    ? Math.round(Math.max(...dashboardData.predictions.map(p => p.predicted_occupancy)))
                    : 'N/A'}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Expected within 7 days
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600">Status</div>
                <div className="text-2xl font-bold text-gray-900 capitalize">
                  {dashboardData.overall_status || 'normal'}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              System operating normally
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
