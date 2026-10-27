import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageSpinner } from '../ui/Spinner';

const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageSpinner />;
  }

  if (!isAuthenticated) {
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
    }
    if (location.pathname.startsWith('/manager')) {
      return <Navigate to="/manager/login" state={{ from: location.pathname }} replace />;
    }
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // If not matching required role:
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" replace />;
    }
    if (location.pathname.startsWith('/manager')) {
      return <Navigate to="/manager/login" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

