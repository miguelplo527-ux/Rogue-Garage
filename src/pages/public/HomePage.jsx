import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar'; 
import Footer from '../../components/layout/Footer'; 
import { ROUTES } from '../../config/routes';
import { ENV } from '../../config/env';
import { useProducts } from '../../hooks/useProducts';
import { formatMoney } from '../../utils/formatters';

export default function HomePage() {
  const navigate = useNavigate();
  const { products, loading } = useProducts({});
  const [marcas, setMarcas] = useState([]);

  // Atajo de teclado secreto (Alt + M)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        navigate(ROUTES.LOGIN);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  useEffect(() => {
    if (products.length > 0) {
      const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
      setMarcas(uniqueBrands);
    }
  }, [products]);

  const whatsappLink = `https://wa.me/${ENV.WHATSAPP_NUMBER}?text=Hola%20ROGUE%20GARAGE,%20quiero%20saber%20más%20sobre%20sus%20productos`;
  const instagramLink = "https://instagram.com/tu_instagram_aqui";

  const productosDestacados = products.slice(0, 4);
  const defaultImage = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop';

  return (
    <div style={{ background: '#0b0d10', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      {/* HERO SECTION CON EL LOGO */}
      <section style={{ 
        position: 'relative',
        height: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid #262b34',
        overflow: 'hidden',
        backgroundColor: '#0b0d10'
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 60%)',
          zIndex: 0
        }}></div>

        <div style={{ textAlign: 'center', padding: '0 1rem', maxWidth: '800px', zIndex: 2 }}>
          <img src="/images/Logo ROGUE.png" alt="ROGUE GARAGE" style={{ height: '120px', objectFit: 'contain', marginBottom: '1.5rem' }} />
          <h1 style={{ color: '#fff', fontSize: '3rem', fontWeight: '900', margin: '0 0 1rem 0', lineHeight: '1.1' }}>
            Equipa tu moto al más alto nivel.
          </h1>
          <p style={{ color: '#d1d5db', fontSize: '1.2rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            Accesorios, repuestos estéticos y detalles premium en Bogotá para motociclistas que no se conforman con lo básico.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href="#catalogo-destacado" style={{ padding: '1rem 2.5rem', background: '#3b82f6', color: '#fff', textDecoration: 'none', fontWeight: 'bold', borderRadius: '4px', fontSize: '1.1rem', transition: 'transform 0.2s' }}>
              Ver Productos
            </a>
            <a href={whatsappLink} target="_blank" rel="noreferrer" style={{ padding: '1rem 2.5rem', background: 'transparent', color: '#fff', textDecoration: 'none', fontWeight: 'bold', border: '1px solid #fff', borderRadius: '4px', fontSize: '1.1rem' }}>
              Atención Directa
            </a>
          </div>
        </div>
      </section>

      {/* BARRA DE CONFIANZA */}
      <section style={{ background: '#14171d', padding: '2rem', borderBottom: '1px solid #262b34' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-motorcycle" style={{ color: '#3b82f6', fontSize: '1.8rem' }}></i>
            <div>
              <h3 style={{ color: '#fff', margin: 0, fontSize: '1.1rem' }}>Pensado para tu moto</h3>
              <p style={{ color: '#9aa0ab', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Selección experta de accesorios.</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-location-dot" style={{ color: '#3b82f6', fontSize: '1.8rem' }}></i>
            <div>
              <h3 style={{ color: '#fff', margin: 0, fontSize: '1.1rem' }}>Con base en Bogotá</h3>
              <p style={{ color: '#9aa0ab', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Conocemos las vías de la ciudad.</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-handshake" style={{ color: '#3b82f6', fontSize: '1.8rem' }}></i>
            <div>
              <h3 style={{ color: '#fff', margin: 0, fontSize: '1.1rem' }}>Atención Directa</h3>
              <p style={{ color: '#9aa0ab', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Hablas directo con los dueños.</p>
            </div>
          </div>
        </div>
      </section>

      {/* MARCAS DISPONIBLES */}
      <section style={{ padding: '3rem 1rem', maxWidth: '1200px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.5rem' }}>Marcas Disponibles</h2>
        <div style={{ width: '60px', height: '4px', background: '#3b82f6', margin: '0 auto 2rem auto' }}></div>
        {marcas.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
            {marcas.map((marca, index) => (
              <div key={index} style={{ background: '#14171d', border: '1px solid #262b34', padding: '1rem 2rem', borderRadius: '30px', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>
                {marca}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#9aa0ab' }}>Registra productos en el panel para ver las marcas disponibles aquí.</p>
        )}
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section id="catalogo-destacado" style={{ padding: '3rem 1rem', maxWidth: '1200px', margin: '0 auto', width: '100%', borderTop: '1px solid #262b34', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '2rem', margin: 0 }}>Nuestros Productos</h2>
            <p style={{ color: '#9aa0ab', margin: '0.5rem 0 0 0' }}>Lo último que ha llegado a nuestra tienda.</p>
          </div>
          <Link to={ROUTES.CATALOG} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>Ver todo el catálogo →</Link>
        </div>

        {loading ? (
          <p style={{ color: '#fff', textAlign: 'center' }}>Cargando productos...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {productosDestacados.map(p => (
              <Link to={`/producto/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#14171d', borderRadius: '8px', overflow: 'hidden', border: '1px solid #262b34', transition: 'all 0.3s', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = '#3b82f6'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#262b34'; }}>
                  <img src={p.image_url || defaultImage} alt={p.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }} />
                  <div style={{ padding: '1.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#9aa0ab', textTransform: 'uppercase', letterSpacing: '1px' }}>{p.brand || 'Genérico'}</span>
                    <h3 style={{ color: '#fff', margin: '0.5rem 0', fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h3>
                    <p style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '1.3rem', margin: 0 }}>{formatMoney(p.sale_price)}</p>
                  </div>
                </div>
              </Link>
            ))}
            {productosDestacados.length === 0 && <p style={{ color: '#9aa0ab', gridColumn: '1 / -1' }}>Aún no hay productos registrados en el sistema.</p>}
          </div>
        )}
      </section>

      <Footer />

      {/* BOTONES FLOTANTES */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 1000 }}>
        <a href={whatsappLink} target="_blank" rel="noreferrer" style={{ background: '#25d366', color: '#fff', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: '1.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', transition: 'transform 0.2s' }}>
          <i className="fa-brands fa-whatsapp"></i>
        </a>
        <a href={instagramLink} target="_blank" rel="noreferrer" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: '1.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', transition: 'transform 0.2s' }}>
          <i className="fa-brands fa-instagram"></i>
        </a>
      </div>
    </div>
  );
}