import { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../config/routes';

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Verificamos si estamos en la página del catálogo
  const isCatalogPage = location.pathname === ROUTES.CATALOG;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`${ROUTES.CATALOG}?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  // Magia: 5 clics en el logo para ir al login
  const handleLogoClick = (e) => {
    e.preventDefault(); 
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 5) {
      navigate(ROUTES.LOGIN); 
      setClickCount(0);
    } else {
      if (newCount === 1) {
        navigate(ROUTES.HOME);
        setTimeout(() => setClickCount(0), 2000);
      }
    }
  };

  return (
    <header style={{ background: '#0b0d10', padding: '1rem 2rem', borderBottom: '1px solid #262b34', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap', gap: '1rem' }}>
      
      {/* Logo con el click secreto */}
      <a href="/" onClick={handleLogoClick} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <img src="/Logo ROGUE.png" alt="ROGUE GARAGE" style={{ height: '45px', objectFit: 'contain' }} />
      </a>
      
      {/* BUSCADOR (Solo se muestra si NO estamos en el catálogo) */}
      {!isCatalogPage && (
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '400px', display: 'flex', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Buscar productos, marcas..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 1rem', background: '#14171d', border: '1px solid #333', color: '#fff', borderRadius: '30px', outline: 'none', paddingRight: '40px' }}
          />
          <button type="submit" style={{ position: 'absolute', right: '5px', top: '5px', background: '#3b82f6', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ color: '#fff', fontSize: '0.8rem' }}></i>
          </button>
        </form>
      )}

      {/* Si estamos en el catálogo, este div empuja los enlaces a la derecha */}
      {isCatalogPage && <div style={{ flex: 1 }}></div>}

      <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <NavLink to={ROUTES.HOME} end style={({ isActive }) => ({ color: isActive ? '#3b82f6' : '#9aa0ab', textDecoration: 'none', fontWeight: 'bold' })}>
          Inicio
        </NavLink>
        <NavLink to={ROUTES.CATALOG} style={({ isActive }) => ({ color: isActive ? '#3b82f6' : '#9aa0ab', textDecoration: 'none', fontWeight: 'bold' })}>
          Catálogo
        </NavLink>
      </nav>
    </header>
  );
}