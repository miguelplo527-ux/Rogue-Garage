import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../config/routes';

export default function Sidebar() {
  const { logout } = useAuth(); 
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate(ROUTES.LOGIN); };
  
  const linkStyle = ({ isActive }) => ({
    display: 'flex', 
    alignItems: 'center',
    gap: '10px',
    padding: '12px 15px', 
    color: isActive ? '#d99a3d' : '#9aa0ab', 
    textDecoration: 'none', 
    borderRadius: '8px', 
    marginBottom: '8px', 
    background: isActive ? 'rgba(217, 154, 61, 0.1)' : 'transparent',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.2s'
  });

  return (
    <aside style={{ width: '260px', background: '#06070a', padding: '1.5rem', borderRight: '1px solid #262b34', display: 'flex', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ color: '#fff', margin: 0, fontSize: '1.2rem', letterSpacing: '1px' }}>ROGUE GARAGE</h2>
        <span style={{ display: 'inline-block', background: '#d99a3d', color: '#000', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px', marginTop: '5px' }}>ADMIN</span>
      </div>
      
      <nav style={{ flex: 1 }}>
        <NavLink to={ROUTES.ADMIN.DASHBOARD} end style={linkStyle}><i className="fa-solid fa-chart-line"></i> Dashboard</NavLink>
        <NavLink to={ROUTES.ADMIN.PRODUCTS} style={linkStyle}><i className="fa-solid fa-box"></i> Productos</NavLink>
        <NavLink to={ROUTES.ADMIN.INVENTORY} style={linkStyle}><i className="fa-solid fa-boxes-stacked"></i> Inventario</NavLink>
        <NavLink to={ROUTES.ADMIN.PURCHASES} style={linkStyle}><i className="fa-solid fa-truck"></i> Compras</NavLink>
        <NavLink to={ROUTES.ADMIN.SALES} style={linkStyle}><i className="fa-solid fa-cash-register"></i> Ventas</NavLink>
        <NavLink to={ROUTES.ADMIN.FINANCE} style={linkStyle}><i className="fa-solid fa-coins"></i> Finanzas</NavLink>

        {/* 👇 ESTE ES EL NUEVO BOTÓN DE AYUDA 👇 */}
        <div style={{ marginTop: '1rem', borderTop: '1px solid #262b34', paddingTop: '1rem' }}>
          <NavLink to="/admin/ayuda" style={linkStyle}><i className="fa-solid fa-circle-question"></i> Manual / Ayuda</NavLink>
        </div>

      </nav>

      <div style={{ borderTop: '1px solid #262b34', paddingTop: '1rem' }}>
        <NavLink to={ROUTES.HOME} target="_blank" style={linkStyle}><i className="fa-solid fa-store"></i> Ver Tienda</NavLink>
        <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', background: 'none', border: 'none', color: '#e5484d', cursor: 'pointer', fontWeight: 'bold', borderRadius: '8px', fontSize: '0.95rem' }}>
          <i className="fa-solid fa-right-from-bracket"></i> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}