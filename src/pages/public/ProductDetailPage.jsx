import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { productsService } from '../../services/productsService';
import { formatMoney } from '../../utils/formatters';
import { ENV } from '../../config/env';
import { ROUTES } from '../../config/routes';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsService.getById(id)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ background: '#0b0d10', minHeight: '100vh', color: '#fff', padding: '50px' }}>Cargando producto...</div>;
  if (!product) return <div style={{ background: '#0b0d10', minHeight: '100vh', color: '#fff', padding: '50px' }}>Producto no encontrado. <Link to={ROUTES.CATALOG} style={{ color: '#d99a3d' }}>Volver al catálogo</Link></div>;

  const waLink = `https://wa.me/${ENV.WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola ROGUE GARAGE, estoy interesado en este producto:\n\n*${product.name}*\nPrecio: ${formatMoney(product.sale_price)}\nSKU: ${product.sku}\n\n¿Está disponible?`
  )}`;

  return (
    <div style={{ background: '#0b0d10', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <section style={{ flex: 1, padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <Link to={ROUTES.CATALOG} style={{ color: '#9aa0ab', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
          <i className="fa-solid fa-arrow-left"></i> Volver al catálogo
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', background: '#14171d', borderRadius: '12px', padding: '3rem', border: '1px solid #262b34' }}>
          
          {/* Imagen del Producto */}
          <div>
            <img 
              src={product.image_url || 'https://via.placeholder.com/600x600?text=Sin+Imagen'} 
              alt={product.name} 
              style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', border: '1px solid #262b34' }} 
            />
          </div>

          {/* Información del Producto */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ color: '#d99a3d', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1rem' }}>
             {product.brand || 'Genérico'} · {product.categories?.name || product.category || 'Accesorio'}
            </span>
            
            <h1 style={{ color: '#fff', fontSize: '2.5rem', margin: '0 0 1rem 0', lineHeight: '1.2' }}>{product.name}</h1>
            
            <p style={{ color: '#9aa0ab', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              {product.description || 'Este producto no tiene una descripción detallada todavía.'}
            </p>

            <div style={{ borderTop: '1px solid #262b34', paddingTop: '2rem', marginBottom: '2rem' }}>
              <span style={{ color: '#9aa0ab', display: 'block', marginBottom: '0.5rem' }}>Precio:</span>
              <span style={{ color: '#d99a3d', fontSize: '3rem', fontWeight: 'bold' }}>{formatMoney(product.sale_price)}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <span style={{ color: '#9aa0ab' }}>Disponibilidad:</span>
              {product.stock > 0 ? (
                <span style={{ color: '#4caf50', fontWeight: 'bold', background: 'rgba(76,175,80,0.1)', padding: '5px 12px', borderRadius: '20px' }}>
                  <i className="fa-solid fa-check"></i> En Stock ({product.stock} disponibles)
                </span>
              ) : (
                <span style={{ color: '#e5484d', fontWeight: 'bold', background: 'rgba(229,72,77,0.1)', padding: '5px 12px', borderRadius: '20px' }}>
                  <i className="fa-solid fa-xmark"></i> Agotado por ahora
                </span>
              )}
            </div>

            {/* Botón de WhatsApp */}
            {product.stock > 0 ? (
              <a 
                href={waLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', background: '#25d366', color: '#000', padding: '1.2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.5rem' }}></i> Comprar por WhatsApp
              </a>
            ) : (
              <button disabled style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', background: '#262b34', color: '#666', padding: '1.2rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'not-allowed' }}>
                Producto Agotado
              </button>
            )}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}