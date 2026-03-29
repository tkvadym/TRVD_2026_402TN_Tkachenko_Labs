import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, requireAdmin = false }) {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) return <LoadingSpinner />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (requireAdmin && !isAdmin) return <Navigate to="/projects" replace />;

    return children;
}
