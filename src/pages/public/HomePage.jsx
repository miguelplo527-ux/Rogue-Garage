import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar'; 
import Footer from '../../components/layout/Footer'; 
import { ROUTES } from '../../config/routes';
import { ENV } from '../../config/env';

export default function HomePage() {
  const navigate = useNavigate();

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

  const whatsappLink = `https://wa.me/${ENV.WHATSAPP_NUMBER}?text=Hola%20ROGUE%20GARAGE,%20quiero%20saber%20más%20sobre%20sus%20productos`;
  const instagramLink = "https://instagram.com/tu_instagram_aqui";

  return (
    <div style={{ background: '#0b0d10', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      {/* HERO SECTION - La primera impresión */}
      <section style={{ 
        position: 'relative',
        height: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid #262b34',
        overflow: 'hidden'
      }}>
        
        {/* 1. Imagen de fondo */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          backgroundImage: 'url("/images/hero-bg.jpg")', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0
        }}></div>

        {/* 2. Capa oscura */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'linear-gradient(to bottom, rgba(11,13,16,0.6), rgba(11,13,16,0.95))',
          zIndex: 1
        }}></div>

        {/* 3. Texto y Botones */}
        <div style={{ textAlign: 'center', padding: '0 1rem', maxWidth: '800px', zIndex: 2 }}>
          <span style={{ color: '#3b82f6', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.9rem' }}>
            Bogotá · Motociclistas Urbanos
          </span>
          <h1 style={{ color: '#fff', fontSize: '4rem', fontWeight: '900', margin: '1rem 0', lineHeight: '1.1' }}>
            Tu moto, tu estilo,<br/> tu actitud.
          </h1>
          <p style={{ color: '#d1d5db', fontSize: '1.2rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            Accesorios, repuestos estéticos y detalles premium para motociclistas que no se conforman con lo básico.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to={ROUTES.CATALOG} style={{ padding: '1rem 2.5rem', background: '#3b82f6', color: '#fff', textDecoration: 'none', fontWeight: 'bold', borderRadius: '4px', fontSize: '1.1rem', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              Ver Catálogo
            </Link>
            <a href={whatsappLink} target="_blank" rel="noreferrer" style={{ padding: '1rem 2.5rem', background: 'transparent', color: '#fff', textDecoration: 'none', fontWeight: 'bold', border: '1px solid #fff', borderRadius: '4px', fontSize: '1.1rem' }}>
              Contacto Directo
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

      {/* CATEGORÍAS DESTACADAS */}
      <section style={{ padding: '4rem 1rem', maxWidth: '1200px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '0.5rem' }}>Explora por Categoría</h2>
        <div style={{ width: '60px', height: '4px', background: '#3b82f6', margin: '0 auto 3rem auto' }}></div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <Link to={ROUTES.CATALOG} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#14171d', border: '1px solid #262b34', borderRadius: '8px', padding: '3rem 1rem', transition: 'all 0.3s', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-5px)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#262b34'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <i className="fa-solid fa-vest" style={{ color: '#3b82f6', fontSize: '2.5rem', marginBottom: '1rem' }}></i>
              <h3 style={{ color: '#fff', margin: 0 }}>Indumentaria</h3>
            </div>
          </Link>
          <Link to={ROUTES.CATALOG} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#14171d', border: '1px solid #262b34', borderRadius: '8px', padding: '3rem 1rem', transition: 'all 0.3s', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-5px)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#262b34'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <i className="fa-solid fa-gears" style={{ color: '#3b82f6', fontSize: '2.5rem', marginBottom: '1rem' }}></i>
              <h3 style={{ color: '#fff', margin: 0 }}>Repuestos</h3>
            </div>
          </Link>
          <Link to={ROUTES.CATALOG} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#14171d', border: '1px solid #262b34', borderRadius: '8px', padding: '3rem 1rem', transition: 'all 0.3s', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-5px)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#262b34'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <i className="fa-solid fa-gem" style={{ color: '#3b82f6', fontSize: '2.5rem', marginBottom: '1rem' }}></i>
              <h3 style={{ color: '#fff', margin: 0 }}>Accesorios</h3>
            </div>
          </Link>
        </div>
      </section>

      <Footer />

      {/* BOTONES FLOTANTES */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 1000 }}>
        <a href={whatsappLink} target="_blank" rel="noreferrer" style={{ background: '#25d366', color: '#fff', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: '1.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          <i className="fa-brands fa-whatsapp"></i>
        </a>
        <a href={instagramLink} target="_blank" rel="noreferrer" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: '1.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          <i className="fa-brands fa-instagram"></i>
        </a>
      </div>
    </div>
  );
}