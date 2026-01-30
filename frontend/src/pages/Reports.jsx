/**
 * Reports Page
 * 
 * Generate and export reports
 * View historical reports and analytics summaries
 */

import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, TrendingUp, BarChart3, Clock, Plus } from 'lucide-react';
import { getHospitals, getEHRRecords, getPredictions, getDashboard } from '../services/api';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const Reports = () => {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);
  const [reportType, setReportType] = useState('occupancy');
  const [dateRange, setDateRange] = useState('30');
  const [exportFormat, setExportFormat] = useState('csv');
  const [generating, setGenerating] = useState(false);
  const [recentReportsState, setRecentReportsState] = useState([]);

  useEffect(() => {
    loadHospitals();
  }, []);

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

  // Generate and download report
  const handleGenerateReport = async () => {
    if (!selectedHospitalId) {
      alert('Please select a hospital');
      return;
    }

    setGenerating(true);
    try {
      const hospital = hospitals.find(h => h.id === selectedHospitalId);
      const hospitalName = hospital ? hospital.hospital_name.replace(/\s+/g, '_') : 'Hospital';
      const dateStr = new Date().toISOString().split('T')[0];
      
      // Get report data based on type
      let reportData;
      let reportName;
      
      switch (reportType) {
        case 'occupancy':
          reportData = await generateOccupancyReportData();
          reportName = `Occupancy_Summary_${hospitalName}_${dateStr}`;
          break;
        case 'predictions':
          reportData = await generatePredictionsReportData();
          reportName = `Forecast_Report_${hospitalName}_${dateStr}`;
          break;
        case 'patient-flow':
          reportData = await generatePatientFlowReportData();
          reportName = `Patient_Flow_${hospitalName}_${dateStr}`;
          break;
        case 'capacity':
          reportData = await generateCapacityReportData();
          reportName = `Capacity_Planning_${hospitalName}_${dateStr}`;
          break;
        default:
          throw new Error('Unknown report type');
      }

      // Export in the selected format
      switch (exportFormat) {
        case 'pdf':
          downloadPDF(reportData, reportName);
          break;
        case 'xlsx':
          downloadExcel(reportData, reportName);
          break;
        case 'json':
          downloadJSON(reportData, reportName);
          break;
        case 'csv':
        default:
          downloadCSV(reportData, reportName);
          break;
      }

      // Add to recent reports
      const newReport = {
        id: Date.now(),
        name: `${reportName}.${exportFormat}`,
        type: reportTemplates.find(t => t.id === reportType)?.name || 'Report',
        date: new Date().toISOString(),
        size: 'N/A'
      };
      setRecentReportsState(prev => [newReport, ...prev].slice(0, 10));
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  // Helper function to trigger download
  const triggerDownload = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Download as CSV
  const downloadCSV = (data, fileName) => {
    const BOM = '\uFEFF';
    const csvContent = BOM + formatDataAsCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, `${fileName}.csv`);
  };

  // Download as JSON
  const downloadJSON = (data, fileName) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    triggerDownload(blob, `${fileName}.json`);
  };

  // Download as Excel
  const downloadExcel = (data, fileName) => {
    const ws = XLSX.utils.json_to_sheet(data.records || []);
    const wb = XLSX.utils.book_new();
    
    // Add summary sheet if available
    if (data.summary) {
      const summaryData = Object.entries(data.summary).map(([key, value]) => ({
        Metric: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        Value: value
      }));
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
    }
    
    // Add data sheet
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    
    // Write file
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  // Download as PDF
  const downloadPDF = (data, fileName) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Title
    doc.setFontSize(18);
    doc.text(data.title || 'Hospital Report', pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Hospital info
    doc.setFontSize(12);
    doc.text(`Hospital: ${data.hospitalName || 'Unknown'}`, 20, y);
    y += 7;
    doc.text(`Date Range: ${data.dateRange || 'N/A'}`, 20, y);
    y += 7;
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, y);
    y += 12;

    // Summary section
    if (data.summary) {
      doc.setFontSize(14);
      doc.text('Summary', 20, y);
      y += 7;
      doc.setFontSize(10);
      
      Object.entries(data.summary).forEach(([key, value]) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        doc.text(`${label}: ${value}`, 25, y);
        y += 6;
      });
      y += 5;
    }

    // Data table (simplified)
    if (data.records && data.records.length > 0) {
      doc.setFontSize(14);
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text('Details', 20, y);
      y += 7;
      doc.setFontSize(9);
      
      const records = data.records.slice(0, 30); // Limit to first 30 records
      records.forEach((record, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const recordText = Object.entries(record)
          .slice(0, 4) // Show first 4 fields
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        doc.text(`${index + 1}. ${recordText}`, 20, y);
        y += 5;
      });
    }

    doc.save(`${fileName}.pdf`);
  };

  // Format data as CSV string
  const formatDataAsCSV = (data) => {
    let csv = `${data.title || 'Report'}\n`;
    csv += `Hospital: ${data.hospitalName || 'Unknown'}\n`;
    csv += `Date Range: ${data.dateRange || 'N/A'}\n`;
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    if (data.summary) {
      csv += `Summary\n`;
      Object.entries(data.summary).forEach(([key, value]) => {
        csv += `${key.replace(/_/g, ' ')},${value}\n`;
      });
      csv += `\n`;
    }
    
    if (data.records && data.records.length > 0) {
      csv += `Data\n`;
      const headers = Object.keys(data.records[0]);
      csv += headers.join(',') + '\n';
      data.records.forEach(record => {
        csv += headers.map(h => record[h] || '').join(',') + '\n';
      });
    }
    
    return csv;
  };

  // Generate Occupancy Summary Report Data
  const generateOccupancyReportData = async () => {
    const ehrRecords = await getEHRRecords(selectedHospitalId);
    const hospital = hospitals.find(h => h.id === selectedHospitalId);
    
    // Filter by date range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange));
    const filteredRecords = ehrRecords.filter(r => new Date(r.date) >= cutoffDate);

    // Calculate statistics
    const totalBeds = hospital?.total_beds || 0;
    const avgOccupied = filteredRecords.reduce((sum, r) => sum + (r.occupied_beds || 0), 0) / filteredRecords.length;
    const avgICU = filteredRecords.reduce((sum, r) => sum + (r.icu_occupied || 0), 0) / filteredRecords.length;
    const avgUtilization = totalBeds > 0 ? (avgOccupied / totalBeds) * 100 : 0;
    const maxOccupied = Math.max(...filteredRecords.map(r => r.occupied_beds || 0));
    const minOccupied = Math.min(...filteredRecords.map(r => r.occupied_beds || 0));

    return {
      title: 'Occupancy Summary Report',
      hospitalName: hospital?.hospital_name || 'Unknown',
      dateRange: `Last ${dateRange} Days`,
      summary: {
        total_beds: totalBeds,
        average_occupied_beds: avgOccupied.toFixed(1),
        average_icu_occupied: avgICU.toFixed(1),
        average_utilization: `${avgUtilization.toFixed(1)}%`,
        maximum_occupancy: maxOccupied,
        minimum_occupancy: minOccupied
      },
      records: filteredRecords.map(r => ({
        Date: r.date,
        Admissions: r.admissions,
        Discharges: r.discharges,
        'Occupied Beds': r.occupied_beds,
        'ICU Occupied': r.icu_occupied,
        'Emergency Cases': r.emergency_cases,
        'Utilization %': totalBeds > 0 ? ((r.occupied_beds / totalBeds) * 100).toFixed(1) : '0'
      }))
    };
  };

  // Generate Predictions Report Data
  const generatePredictionsReportData = async () => {
    const predictions = await getPredictions(selectedHospitalId);
    const hospital = hospitals.find(h => h.id === selectedHospitalId);
    const totalBeds = predictions.total_beds || hospital?.total_beds || 1;

    return {
      title: 'Forecast Report',
      hospitalName: predictions.hospital_name || hospital?.hospital_name || 'Unknown',
      dateRange: '7-Day Forecast',
      summary: {
        total_beds: totalBeds,
        model_type: predictions.model_info?.model_type || 'Prophet',
        training_period: predictions.model_info?.training_period || 'N/A',
        forecast_days: predictions.predictions?.length || 7
      },
      records: (predictions.predictions || []).map(pred => {
        const utilization = (pred.predicted_occupancy / totalBeds) * 100;
        let riskLevel = 'Low';
        if (utilization >= 85) riskLevel = 'High';
        else if (utilization >= 70) riskLevel = 'Medium';
        
        return {
          Date: pred.date,
          'Predicted Occupancy': pred.predicted_occupancy.toFixed(1),
          'Lower Bound': pred.lower_bound.toFixed(1),
          'Upper Bound': pred.upper_bound.toFixed(1),
          'Utilization %': utilization.toFixed(1),
          'Risk Level': riskLevel
        };
      })
    };
  };

  // Generate Patient Flow Report Data
  const generatePatientFlowReportData = async () => {
    const ehrRecords = await getEHRRecords(selectedHospitalId);
    const hospital = hospitals.find(h => h.id === selectedHospitalId);
    
    // Filter by date range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange));
    const filteredRecords = ehrRecords.filter(r => new Date(r.date) >= cutoffDate);

    // Calculate flow metrics
    const totalAdmissions = filteredRecords.reduce((sum, r) => sum + (r.admissions || 0), 0);
    const totalDischarges = filteredRecords.reduce((sum, r) => sum + (r.discharges || 0), 0);
    const totalEmergencies = filteredRecords.reduce((sum, r) => sum + (r.emergency_cases || 0), 0);
    const avgAdmissions = totalAdmissions / filteredRecords.length;
    const avgDischarges = totalDischarges / filteredRecords.length;
    const avgEmergencies = totalEmergencies / filteredRecords.length;
    const netFlow = totalAdmissions - totalDischarges;

    let runningTotal = 0;
    return {
      title: 'Patient Flow Analysis Report',
      hospitalName: hospital?.hospital_name || 'Unknown',
      dateRange: `Last ${dateRange} Days`,
      summary: {
        total_admissions: totalAdmissions,
        total_discharges: totalDischarges,
        total_emergencies: totalEmergencies,
        average_daily_admissions: avgAdmissions.toFixed(1),
        average_daily_discharges: avgDischarges.toFixed(1),
        average_daily_emergencies: avgEmergencies.toFixed(1),
        net_patient_flow: `${netFlow > 0 ? '+' : ''}${netFlow}`
      },
      records: filteredRecords.map(record => {
        const dailyNetFlow = (record.admissions || 0) - (record.discharges || 0);
        runningTotal += dailyNetFlow;
        return {
          Date: record.date,
          Admissions: record.admissions,
          Discharges: record.discharges,
          'Emergency Cases': record.emergency_cases,
          'Net Flow': `${dailyNetFlow > 0 ? '+' : ''}${dailyNetFlow}`,
          'Running Total': runningTotal
        };
      })
    };
  };

  // Generate Capacity Planning Report Data
  const generateCapacityReportData = async () => {
    const ehrRecords = await getEHRRecords(selectedHospitalId);
    const hospital = hospitals.find(h => h.id === selectedHospitalId);
    const dashboard = await getDashboard(selectedHospitalId);
    
    // Filter by date range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange));
    const filteredRecords = ehrRecords.filter(r => new Date(r.date) >= cutoffDate);

    const totalBeds = hospital?.total_beds || 0;
    const currentOccupied = dashboard?.current_occupied || 0;
    const currentUtilization = dashboard?.current_utilization || 0;
    const currentICU = dashboard?.current_icu_occupied || 0;

    // Calculate capacity metrics
    const avgOccupancy = filteredRecords.reduce((sum, r) => sum + (r.occupied_beds || 0), 0) / filteredRecords.length;
    const peakOccupancy = Math.max(...filteredRecords.map(r => r.occupied_beds || 0));
    const peakUtilization = totalBeds > 0 ? (peakOccupancy / totalBeds * 100) : 0;
    const daysAbove85 = filteredRecords.filter(r => totalBeds > 0 && (r.occupied_beds / totalBeds) > 0.85).length;
    const daysAbove70 = filteredRecords.filter(r => totalBeds > 0 && (r.occupied_beds / totalBeds) > 0.70).length;

    return {
      title: 'Capacity Planning Report',
      hospitalName: hospital?.hospital_name || 'Unknown',
      dateRange: `Last ${dateRange} Days`,
      summary: {
        total_beds: totalBeds,
        current_occupied: currentOccupied,
        current_utilization: `${currentUtilization.toFixed(1)}%`,
        current_icu_occupied: currentICU,
        overall_status: dashboard?.overall_status || 'Unknown',
        average_occupancy: avgOccupancy.toFixed(1),
        peak_occupancy: peakOccupancy,
        peak_utilization: `${peakUtilization.toFixed(1)}%`,
        days_above_85_percent: daysAbove85,
        days_above_70_percent: daysAbove70
      },
      records: filteredRecords.map(record => {
        const utilization = totalBeds > 0 ? ((record.occupied_beds || 0) / totalBeds * 100) : 0;
        let status = 'Normal';
        if (utilization >= 85) status = 'Critical';
        else if (utilization >= 70) status = 'High';
        
        return {
          Date: record.date,
          'Occupied Beds': record.occupied_beds,
          'Utilization %': utilization.toFixed(1),
          Status: status
        };
      })
    };
  };

  const reportTemplates = [
    {
      id: 'occupancy',
      name: 'Occupancy Summary',
      description: 'Comprehensive bed occupancy analysis with trends and forecasts',
      icon: TrendingUp,
      color: 'sky'
    },
    {
      id: 'predictions',
      name: 'Forecast Report',
      description: '7-day predictions with confidence intervals and risk analysis',
      icon: BarChart3,
      color: 'purple'
    },
    {
      id: 'patient-flow',
      name: 'Patient Flow Analysis',
      description: 'Admissions and discharges data with flow metrics',
      icon: TrendingUp,
      color: 'green'
    },
    {
      id: 'capacity',
      name: 'Capacity Planning',
      description: 'Resource utilization and capacity recommendations',
      icon: Calendar,
      color: 'amber'
    }
  ];

  const recentReports = [
    {
      id: 1,
      name: 'Monthly Occupancy Report - December 2025',
      type: 'Occupancy Summary',
      date: '2025-12-31',
      size: '2.4 MB'
    },
    {
      id: 2,
      name: 'Weekly Forecast - Week 52',
      type: 'Forecast Report',
      date: '2025-12-24',
      size: '1.8 MB'
    },
    {
      id: 3,
      name: 'Q4 Patient Flow Analysis',
      type: 'Patient Flow Analysis',
      date: '2025-12-15',
      size: '3.2 MB'
    },
    {
      id: 4,
      name: 'Annual Capacity Planning 2026',
      type: 'Capacity Planning',
      date: '2025-12-01',
      size: '4.1 MB'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      sky: 'bg-sky-50 border-sky-100 text-sky-600',
      purple: 'bg-purple-50 border-purple-100 text-purple-600',
      green: 'bg-green-50 border-green-100 text-green-600',
      amber: 'bg-amber-50 border-amber-100 text-amber-600'
    };
    return colors[color] || colors.sky;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">Generate and download analytics reports</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-6 border border-sky-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600">Total Reports</div>
              <div className="text-3xl font-bold text-gray-900">24</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Download className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600">Downloads</div>
              <div className="text-3xl font-bold text-gray-900">156</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600">This Month</div>
              <div className="text-3xl font-bold text-gray-900">8</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600">Scheduled</div>
              <div className="text-3xl font-bold text-gray-900">3</div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate New Report */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Generate New Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Hospital</label>
            <select
              value={selectedHospitalId || ''}
              onChange={(e) => setSelectedHospitalId(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            >
              <option value="">All Hospitals</option>
              {hospitals.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.hospital_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            >
              {reportTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="60">Last 60 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Export Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            >
              <option value="csv">CSV</option>
              <option value="xlsx">Excel (XLSX)</option>
              <option value="pdf">PDF</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </div>
        <button 
          onClick={handleGenerateReport}
          disabled={generating || !selectedHospitalId}
          className="w-full px-6 py-4 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          {generating ? 'Generating Report...' : `Generate ${exportFormat.toUpperCase()} Report`}
        </button>
      </div>

      {/* Report Templates */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <div
                key={template.id}
                onClick={() => setReportType(template.id)}
                className={`rounded-2xl p-6 border-2 ${getColorClasses(template.color)} hover:shadow-lg transition-all cursor-pointer ${reportType === template.id ? 'ring-2 ring-offset-2 ring-sky-500' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 ${getColorClasses(template.color)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                    <button className="text-sm font-semibold text-gray-900 hover:underline">
                      {reportType === template.id ? '✓ Selected' : 'Use Template →'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Reports</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {(recentReportsState.length > 0 ? recentReportsState : recentReports).map((report) => (
            <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{report.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(report.date).toLocaleDateString()}
                      </span>
                      <span>{report.size}</span>
                      <span className="px-2 py-1 bg-sky-100 text-sky-700 rounded-lg text-xs font-semibold">
                        {report.type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {recentReportsState.length > 0 && recentReportsState.includes(report) ? (
                    <span className="px-4 py-2 bg-green-50 text-green-600 rounded-xl font-semibold text-sm">
                      ✓ Downloaded
                    </span>
                  ) : (
                    <button className="px-4 py-2 bg-sky-50 text-sky-600 rounded-xl font-semibold hover:bg-sky-100 transition-colors flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-6 border border-sky-100">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Export Formats</h3>
        <p className="text-sm text-gray-700 mb-4">
          Reports can be exported in multiple formats including PDF, Excel (XLSX), and CSV for easy sharing and analysis.
        </p>
        <div className="flex gap-3">
          <span className="px-4 py-2 bg-white border border-sky-200 rounded-xl text-sm font-semibold text-gray-900">
            PDF
          </span>
          <span className="px-4 py-2 bg-white border border-sky-200 rounded-xl text-sm font-semibold text-gray-900">
            Excel (XLSX)
          </span>
          <span className="px-4 py-2 bg-white border border-sky-200 rounded-xl text-sm font-semibold text-gray-900">
            CSV
          </span>
          <span className="px-4 py-2 bg-white border border-sky-200 rounded-xl text-sm font-semibold text-gray-900">
            JSON
          </span>
        </div>
      </div>
    </div>
  );
};

export default Reports;
