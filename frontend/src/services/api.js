/**
 * API Service Layer
 * 
 * Centralized API communication with the FastAPI backend.
 * Uses axios for HTTP requests.
 */

import axios from 'axios';

// Base URL for API - uses Vite proxy in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============== Hospital APIs ==============

/**
 * Get all hospitals
 */
export const getHospitals = async () => {
  const response = await api.get('/hospitals');
  return response.data;
};

/**
 * Get specific hospital by ID
 */
export const getHospital = async (hospitalId) => {
  const response = await api.get(`/hospitals/${hospitalId}`);
  return response.data;
};

/**
 * Create a new hospital
 */
export const createHospital = async (hospitalData) => {
  const response = await api.post('/hospitals', hospitalData);
  return response.data;
};

// ============== EHR APIs ==============

/**
 * Get EHR records for a hospital
 */
export const getEHRRecords = async (hospitalId) => {
  const response = await api.get(`/ehr/${hospitalId}`);
  return response.data;
};

/**
 * Get latest EHR record for a hospital
 */
export const getLatestEHR = async (hospitalId) => {
  const response = await api.get(`/ehr/${hospitalId}/latest`);
  return response.data;
};

/**
 * Create a new EHR record
 */
export const createEHRRecord = async (ehrData) => {
  const response = await api.post('/ehr', ehrData);
  return response.data;
};

// ============== Prediction APIs ==============

/**
 * Get bed occupancy predictions for a hospital
 */
export const getPredictions = async (hospitalId, days = 7) => {
  const response = await api.get(`/predict/${hospitalId}`, {
    params: { days }
  });
  return response.data;
};

// ============== Dashboard APIs ==============

/**
 * Get complete dashboard data for a hospital
 */
export const getDashboard = async (hospitalId) => {
  const response = await api.get(`/dashboard/${hospitalId}`);
  return response.data;
};

export default api;
