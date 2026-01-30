/**
 * Analytics Page
 * 
 * Advanced analytics and insights
 * Trend analysis, comparisons, and metrics
 */

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Activity, Calendar, Users, Bed } from 'lucide-react';
import { getHospitals, getEHRRecords } from '../services/api';

const Analytics = () => {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHospitals();
  }, []);

  useEffect(() => {
    if (selectedHospitalId) {
      loadRecords(selectedHospitalId);
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

  const loadRecords = async (hospitalId) => {
    setLoading(true);
    try {
      const data = await getEHRRecords(hospitalId);
      setRecords(data || []);
    } catch (error) {
      console.error('Failed to load records:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    if (records.length === 0) return null;

    const last7Days = records.slice(-7);
    const last30Days = records.slice(-30);
    
    const avgOccupancy30 = Math.round(last30Days.reduce((sum, r) => sum + (r.occupied_beds || 0), 0) / last30Days.length);
    const avgOccupancy7 = Math.round(last7Days.reduce((sum, r) => sum + (r.occupied_beds || 0), 0) / last7Days.length);
    
    const totalAdmissions30 = last30Days.reduce((sum, r) => sum + (r.admissions || 0), 0);
    const totalDischarges30 = last30Days.reduce((sum, r) => sum + (r.discharges || 0), 0);
    const avgAdmissionsPerDay = Math.round(totalAdmissions30 / 30);
    const avgDischargesPerDay = Math.round(totalDischarges30 / 30);
    
    const peakOccupancy = Math.max(...last30Days.map(r => r.occupied_beds || 0));
    const minOccupancy = Math.min(...last30Days.map(r => r.occupied_beds || 0));
    
    const trend = avgOccupancy7 > avgOccupancy30 ? 'increasing' : 'decreasing';
    const trendPercent = Math.abs(((avgOccupancy7 - avgOccupancy30) / avgOccupancy30) * 100).toFixed(1);

    return {
      avgOccupancy30,
      avgOccupancy7,
      totalAdmissions30,
      totalDischarges30,
      avgAdmissionsPerDay,
      avgDischargesPerDay,
      peakOccupancy,
      minOccupancy,
      trend,
      trendPercent
    };
  };

  const analytics = calculateAnalytics();
  const selectedHospital = hospitals.find(h => h.id === selectedHospitalId);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Advanced insights and trend analysis</p>
      </div>

      {/* Hospital Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
        </div>
      ) : analytics ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-6 border border-sky-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-600">30-Day Avg</div>
                  <div className="text-3xl font-bold text-gray-900">{analytics.avgOccupancy30}</div>
                </div>
              </div>
              <p className="text-sm text-gray-600">Average occupancy</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-600">Peak Occupancy</div>
                  <div className="text-3xl font-bold text-gray-900">{analytics.peakOccupancy}</div>
                </div>
              </div>
              <p className="text-sm text-gray-600">Highest in 30 days</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-600">Daily Admissions</div>
                  <div className="text-3xl font-bold text-gray-900">{analytics.avgAdmissionsPerDay}</div>
                </div>
              </div>
              <p className="text-sm text-gray-600">Average per day</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-600">Daily Discharges</div>
                  <div className="text-3xl font-bold text-gray-900">{analytics.avgDischargesPerDay}</div>
                </div>
              </div>
              <p className="text-sm text-gray-600">Average per day</p>
            </div>
          </div>

          {/* Trend Analysis */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Trend Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl border-2 ${
                analytics.trend === 'increasing' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  {analytics.trend === 'increasing' ? (
                    <TrendingUp className="w-8 h-8 text-red-600" />
                  ) : (
                    <TrendingDown className="w-8 h-8 text-green-600" />
                  )}
                  <div>
                    <div className="text-sm font-semibold text-gray-600">7-Day Trend</div>
                    <div className="text-2xl font-bold text-gray-900 capitalize">{analytics.trend}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  Occupancy is {analytics.trend} by {analytics.trendPercent}% compared to 30-day average
                </p>
              </div>

              <div className="p-6 rounded-xl border-2 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="text-sm font-semibold text-gray-600">Capacity Range</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {analytics.minOccupancy} - {analytics.peakOccupancy}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  Occupancy range over the past 30 days
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Admissions & Discharges */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Patient Flow (30 Days)</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-600">Total Admissions</span>
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{analytics.totalAdmissions30}</div>
                  <div className="text-sm text-gray-600 mt-1">~{analytics.avgAdmissionsPerDay} per day</div>
                </div>

                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-600">Total Discharges</span>
                    <TrendingDown className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{analytics.totalDischarges30}</div>
                  <div className="text-sm text-gray-600 mt-1">~{analytics.avgDischargesPerDay} per day</div>
                </div>

                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-600">Net Change</span>
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {analytics.totalAdmissions30 - analytics.totalDischarges30 > 0 ? '+' : ''}
                    {analytics.totalAdmissions30 - analytics.totalDischarges30}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Admissions vs Discharges</div>
                </div>
              </div>
            </div>

            {/* Hospital Capacity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Capacity Utilization</h2>
              {selectedHospital && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-600">Total Beds</span>
                      <Bed className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{selectedHospital.total_beds}</div>
                  </div>

                  <div className="p-4 bg-sky-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-600">Average Utilization</span>
                      <Activity className="w-5 h-5 text-sky-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      {((analytics.avgOccupancy30 / selectedHospital.total_beds) * 100).toFixed(1)}%
                    </div>
                    <div className="mt-3">
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-cyan-500"
                          style={{ width: `${Math.min((analytics.avgOccupancy30 / selectedHospital.total_beds) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-600">Peak Utilization</span>
                      <TrendingUp className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      {((analytics.peakOccupancy / selectedHospital.total_beds) * 100).toFixed(1)}%
                    </div>
                    <div className="mt-3">
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                          style={{ width: `${Math.min((analytics.peakOccupancy / selectedHospital.total_beds) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Insights */}
          <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-6 border border-sky-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Key Insights</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-sky-600 rounded-full mt-2"></div>
                <p className="text-gray-700">
                  Occupancy has been {analytics.trend} by {analytics.trendPercent}% over the past week compared to the monthly average.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-sky-600 rounded-full mt-2"></div>
                <p className="text-gray-700">
                  Peak occupancy of {analytics.peakOccupancy} beds represents {((analytics.peakOccupancy / selectedHospital?.total_beds) * 100).toFixed(1)}% capacity utilization.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-sky-600 rounded-full mt-2"></div>
                <p className="text-gray-700">
                  Daily patient flow averages {analytics.avgAdmissionsPerDay} admissions and {analytics.avgDischargesPerDay} discharges.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">Add EHR records to see analytics</p>
        </div>
      )}
    </div>
  );
};

export default Analytics;
