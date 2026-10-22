import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../config/routes';
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{padding: 50}}>Cargando...</div>;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  return <Outlet />;
}
