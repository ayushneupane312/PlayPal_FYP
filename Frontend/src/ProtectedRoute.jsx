import { Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect based on user role
    if (user?.role === 'futsalOwner') {
      return <Navigate to="/futsalownerdashboard" replace />;
    } else if (user?.role === 'player') {
      return <Navigate to="/playerdashboard" replace />;
    } else if (user?.role === 'admin') {
      return <Navigate to="/admindashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;