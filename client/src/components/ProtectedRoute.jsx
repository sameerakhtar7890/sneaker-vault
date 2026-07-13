import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SneakerLoader from './SneakerLoader.jsx';

/* Redirects unauthenticated users to /login, preserving the intended page */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, token } = useAuth();
  const location        = useLocation();

  // Still loading auth (token exists but user not fetched yet)
  if (token && !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <SneakerLoader size={60} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
