import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo from './Logo';
import { ROUTES } from '../../config/routes';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, displayName, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Cierra el menú móvil al cambiar de página
  useEffect(() => setOpen(false), [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast.success('Sesión cerrada');
    navigate(ROUTES.HOME);
  };

  return (
    <header className="site-header">
      <span className="header-wing left" aria-hidden="true" />
      <span className="header-wing right" aria-hidden="true" />
      <div className="container header-inner">
        <Logo />

        <button
          type="button"
          className="nav-toggle"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          aria-controls="menu-principal"
          onClick={() => setOpen((o) => !o)}
        >
          <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-bars'}`} />
        </button>

        <div id="menu-principal" className={`nav-panel${open ? ' open' : ''}`}>
          <nav aria-label="Principal">
            <ul className="nav-links">
              <li><NavLink to={ROUTES.HOME} end className={linkClass}>Inicio</NavLink></li>
              <li><NavLink to={ROUTES.CATALOG} className={linkClass}>Catálogo</NavLink></li>
              <li><NavLink to={ROUTES.ABOUT} className={linkClass}>Sobre nosotros</NavLink></li>
              {!user && (
                <li><NavLink to={ROUTES.LOGIN} className={({ isActive }) => `nav-link login-link${isActive ? ' active' : ''}`}>
                  <i className="fa-regular fa-user" /> Login
                </NavLink></li>
              )}
            </ul>
          </nav>

          {user && (
            <div className="nav-end">
              <NavLink to={ROUTES.CART} className={(s) => `${linkClass(s)} cart-link`} aria-label={`Carrito, ${count} artículos`}>
                <i className="fa-solid fa-cart-shopping" /> Carrito
                {count > 0 && <span className="cart-badge">{count}</span>}
              </NavLink>
              {isAdmin && (
                <NavLink to={ROUTES.ADMIN.DASHBOARD} className={linkClass}>
                  <i className="fa-solid fa-gauge" /> Panel
                </NavLink>
              )}
              <span className="user-chip" title={user.email}>{displayName}</span>
              <button type="button" className="nav-link nav-btn" onClick={handleLogout}>
                <i className="fa-solid fa-right-from-bracket" /> Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
