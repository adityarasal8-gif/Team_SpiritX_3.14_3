/**
 * Compare Hospitals Page
 * 
 * Side-by-side comparison with recommendation scores
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, MapPin, Bed, Activity, X } from 'lucide-react';
import { getPublicHospitals, compareHospitals } from '../../services/api';

const CompareHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const data = await getPublicHospitals();
      setHospitals(data);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const handleCompare = async () => {
    try {
      setLoading(true);
      const data = await compareHospitals(cityFilter || null);
      // Filter to only show selected hospitals if specific ones were chosen
      const filteredData = selectedIds.length > 0 
        ? data.filter(h => selectedIds.includes(h.hospital_id))
        : data;
      setComparison(filteredData);
    } catch (error) {
      console.error('Error comparing hospitals:', error);
      alert('Failed to compare hospitals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleHospital = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(hId => hId !== id));
    } else if (selectedIds.length < 5) {
      setSelectedIds([...selectedIds, id]);
    } else {
      alert('You can compare up to 5 hospitals at a time');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const cities = [...new Set(hospitals.map(h => h.location))];
  const filteredHospitals = cityFilter
    ? hospitals.filter(h => h.location.includes(cityFilter))
    : hospitals;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Compare Hospitals</h1>
        <p className="text-gray-600 mt-2">
          Select hospitals to compare availability and get recommendations
        </p>
      </div>

      {/* Selection Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {/* City Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter by City (Optional)
            </label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Hospital Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Hospitals (2-5)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredHospitals.map(hospital => (
                <button
                  key={hospital.id}
                  onClick={() => toggleHospital(hospital.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedIds.includes(hospital.id)
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{hospital.hospital_name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {hospital.location}
                      </div>
                    </div>
                    {selectedIds.includes(hospital.id) && (
                      <div className="w-5 h-5 bg-sky-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Compare Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleCompare}
              disabled={loading}
              className="px-6 py-3 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Comparing...
                </span>
              ) : (
                selectedIds.length > 0 
                  ? `Compare ${selectedIds.length} Selected` 
                  : `Compare All${cityFilter ? ' in ' + cityFilter : ''}`
              )}
            </button>
            {selectedIds.length > 0 && (
              <button
                onClick={() => setSelectedIds([])}
                className="px-4 py-3 text-gray-600 hover:text-gray-900 font-medium"
              >
                Clear Selection
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Results */}
      {comparison.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award className="w-4 h-4" />
            <span>Sorted by recommendation score (highest first)</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {comparison.map((hospital, index) => (
              <div
                key={hospital.hospital_id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Rank Badge */}
                {index === 0 && (
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-2 text-center font-bold text-sm">
                    🏆 Best Choice
                  </div>
                )}
                
                <div className="p-6">
                  {/* Hospital Info */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {hospital.hospital_name}
                      </h3>
                      <span className="text-sm font-medium text-gray-500">
                        #{index + 1}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {hospital.city}
                    </p>
                  </div>

                  {/* Recommendation Score */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">
                        Recommendation Score
                      </span>
                      <span className={`text-2xl font-bold ${getScoreColor(hospital.recommendation_score)}`}>
                        {hospital.recommendation_score}/100
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getScoreGradient(hospital.recommendation_score)}`}
                        style={{ width: `${hospital.recommendation_score}%` }}
                      />
                    </div>
                  </div>

                  {/* Current Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                        <Bed className="w-4 h-4" />
                        Available
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {hospital.current_available}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                        <Activity className="w-4 h-4" />
                        Occupancy
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {hospital.utilization_percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Predictions */}
                  <div className="bg-sky-50 rounded-lg p-3 border border-sky-100">
                    <div className="text-xs font-semibold text-sky-700 mb-2">
                      7-Day Avg Prediction
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Expected occupancy</span>
                      <span className="text-lg font-bold text-sky-700">
                        {hospital.avg_predicted_occupancy_7_days.toFixed(1)} beds
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {comparison.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Comparison Yet</h3>
          <p className="text-gray-600">Select 2-5 hospitals above and click Compare</p>
        </div>
      )}
    </div>
  );
};

export default CompareHospitals;
