/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the app
 * - User login/logout with role-based access
 * - JWT token management
 * - Protected route handling based on roles
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

// User roles
export const USER_ROLES = {
  HOSPITAL_ADMIN: 'HOSPITAL_ADMIN',
  PATIENT: 'PATIENT'
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing token on mount and fetch user
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        try {
          // Verify token and get user data
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          // Token invalid or expired
          localStorage.removeItem('auth_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // Call backend login endpoint
      const response = await api.post('/auth/login', { email, password });
      const { access_token, role, user_id, name, hospital_id } = response.data;

      localStorage.setItem('auth_token', access_token);
      
      // Create user object from token data
      const userData = {
        id: user_id,
        name: name,
        email: email,
        role: role,
        hospital_id: hospital_id
      };
      setUser(userData);

      // Redirect based on role
      if (role === USER_ROLES.HOSPITAL_ADMIN) {
        navigate('/dashboard');
      } else if (role === USER_ROLES.PATIENT) {
        navigate('/patient');
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed. Please check your credentials.' 
      };
    }
  };

  const register = async (name, email, password, role, hospitalId = null) => {
    try {
      // Call backend register endpoint
      const payload = {
        name,
        email,
        password,
        role
      };

      if (role === USER_ROLES.HOSPITAL_ADMIN && hospitalId) {
        payload.hospital_id = hospitalId;
      }

      const response = await api.post('/auth/register', payload);
      const { access_token, role: userRole, user_id, name: userName, hospital_id } = response.data;

      localStorage.setItem('auth_token', access_token);
      
      // Create user object from token data
      const userData = {
        id: user_id,
        name: userName,
        email: email,
        role: userRole,
        hospital_id: hospital_id
      };
      setUser(userData);

      // Redirect based on role
      if (userRole === USER_ROLES.HOSPITAL_ADMIN) {
        navigate('/dashboard');
      } else if (userRole === USER_ROLES.PATIENT) {
        navigate('/patient');
      }

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    navigate('/login');
  };

  // Helper functions for role checking
  const isHospitalAdmin = () => user?.role === USER_ROLES.HOSPITAL_ADMIN;
  const isPatient = () => user?.role === USER_ROLES.PATIENT;

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isHospitalAdmin,
    isPatient,
    USER_ROLES
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
