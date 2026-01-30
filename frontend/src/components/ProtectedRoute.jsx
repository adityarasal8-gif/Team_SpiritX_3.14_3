/**
 * Protected Route Component
 * 
 * Wraps routes that require authentication with optional role restriction
 * Redirects to login if not authenticated, or home if wrong role
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireRole = null }) => {
  const { isAuthenticated, loading, user, USER_ROLES } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access control
  if (requireRole && user?.role !== requireRole) {
    // Redirect to appropriate dashboard based on actual role
    if (user?.role === USER_ROLES.HOSPITAL_ADMIN) {
      return <Navigate to="/dashboard" replace />;
    } else if (user?.role === USER_ROLES.PATIENT) {
      return <Navigate to="/patient" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
