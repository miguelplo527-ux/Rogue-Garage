import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../config/routes';

export default function AdminRoute() {
  // Añadimos "user" y "profile" para saber qué está pasando
  const { isAdmin, loading, user, profile } = useAuth();

  // Si está cargando, mostramos un mensaje y NO redirigimos
  if (loading) return <div style={{ padding: 50, color: '#fff', background: '#0b0d10', height: '100vh' }}>Cargando perfil de usuario...</div>;

  // Si hay usuario pero el perfil aún no ha cargado en la memoria, esperamos
  if (user && !profile) {
    return <div style={{ padding: 50, color: '#fff', background: '#0b0d10', height: '100vh' }}>Verificando permisos...</div>;
  }

  // Si ya cargó todo y definitivamente NO es admin, lo mandamos a la tienda
  if (!isAdmin) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  // Si es admin, lo dejamos pasar al panel
  return <Outlet />;
}