import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar'; 
import Footer from '../../components/layout/Footer';
import { useProducts } from '../../hooks/useProducts'; 
import { formatMoney } from '../../utils/formatters';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  
  const [search, setSearch] = useState(queryParam);
  const { products, loading } = useProducts({ search });

  useEffect(() => {
    setSearch(queryParam);
  }, [queryParam]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  const defaultImage = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop';
  
  return (
    <div style={{ background: '#0b0d10', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <section style={{ flex: 1, padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ color: '#fff', fontSize: '2.5rem', margin: 0 }}>NUESTRO CATÁLOGO</h2>
          {/* Línea de acento cambiada a azul */}
          <div style={{ width: '60px', height: '4px', background: '#3b82f6', margin: '10px auto' }}></div>
        </div>
        
        <input 
          type="text" 
          placeholder="¿Qué buscas para tu moto? (Ej: Yamaha, frenos...)" 
          value={search} 
          onChange={handleSearchChange} 
          style={{ width: '100%', maxWidth: '600px', display: 'block', margin: '0 auto 3rem auto', padding: '1rem', background: '#14171d', border: '1px solid #333', color: '#fff', borderRadius: '30px', outline: 'none', textAlign: 'center' }} 
        />
        
        {loading ? (
          <p style={{ color: '#fff', textAlign: 'center' }}>Cargando productos...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
            {products.map(p => (
              <Link to={`/producto/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
                <div 
                  style={{ background: '#14171d', borderRadius: '8px', overflow: 'hidden', border: '1px solid #262b34', transition: 'transform 0.2s', cursor: 'pointer', height: '100%' }} 
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} 
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <img 
                    src={p.image_url || defaultImage} 
                    alt={p.name} 
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
                  />
                  <div style={{ padding: '1.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#9aa0ab', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {p.brand || 'Genérico'} · {p.categories?.name || p.category || 'Accesorio'}
                    </span>
                    <h3 style={{ color: '#fff', margin: '0.5rem 0', fontSize: '1.2rem' }}>{p.name}</h3>
                    {/* Precio cambiado a azul */}
                    <p style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '1.3rem', margin: '1rem 0 0 0' }}>{formatMoney(p.sale_price)}</p>
                  </div>
                </div>
              </Link>
            ))}
            {products.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '2rem' }}>
                <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '2rem', color: '#444', marginBottom: '1rem' }}></i>
                <p style={{ color: '#9aa0ab', fontSize: '1.1rem' }}>
                  No se encontraron productos para "<strong>{search}</strong>".
                </p>
                {/* Botón cambiado a azul */}
                <button onClick={() => handleSearchChange({ target: { value: '' } })} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', marginTop: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                  Ver todos los productos
                </button>
              </div>
            )}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}