import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StoreLayout from '../../components/layout/StoreLayout';
import ProductCard from '../../components/products/ProductCard';
import { ROUTES } from '../../config/routes';
import { ENV } from '../../config/env';
import { useProducts } from '../../hooks/useProducts';
import { CATEGORIES, CATEGORY_ICONS, FEATURED_MODELS } from '../../utils/constants';

export default function HomePage() {
  const navigate = useNavigate();
  const { products, loading } = useProducts({});
  const [query, setQuery] = useState('');

  const featured = useMemo(() => {
    const available = products.filter((p) => p.stock > 0);
    return (available.length >= 4 ? available : products).slice(0, 4);
  }, [products]);

  const goSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `${ROUTES.CATALOG}?q=${encodeURIComponent(q)}` : ROUTES.CATALOG);
  };

  const wa = `https://wa.me/${ENV.WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola Rogue Garage, quiero asesoría para mi camioneta.')}`;

  return (
    <StoreLayout>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1>Tu camioneta de lujo, con carácter propio.</h1>
            <p className="lead">
              Bodykits, rines, estribos e iluminación para la Toyota TXL y otras camionetas premium.
              Piezas seleccionadas y asesoría directa desde Bogotá.
            </p>
            <form className="hero-search" onSubmit={goSearch} role="search">
              <input
                type="search"
                placeholder="Busca por modelo, marca o pieza"
                aria-label="Buscar en el catálogo"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit">Buscar</button>
            </form>
            <div className="hero-models">
              <span>Modelos frecuentes:</span>
              {FEATURED_MODELS.map((m) => (
                <Link key={m} className="chip" to={`${ROUTES.CATALOG}?q=${encodeURIComponent(m)}`}>{m}</Link>
              ))}
            </div>
            <div className="hero-actions">
              <Link to={ROUTES.CATALOG} className="btn btn-primary">Ver catálogo</Link>
              <a href={wa} target="_blank" rel="noreferrer" className="btn btn-ghost">
                <i className="fa-brands fa-whatsapp" /> Hablar con un asesor
              </a>
            </div>
          </div>
          <div className="hero-art">
            <img src="/images/hero-suv.svg" alt="Camioneta de lujo con bodykit y rines en acabado champagne" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Compra por categoría</h2>
              <p>Todo lo que tu camioneta necesita para verse y sentirse a otro nivel.</p>
            </div>
          </div>
          <div className="cat-grid">
            {CATEGORIES.map((c) => (
              <Link key={c} to={`${ROUTES.CATALOG}?cat=${encodeURIComponent(c)}`} className="cat-tile">
                <i className={`fa-solid ${CATEGORY_ICONS[c] || 'fa-star'}`} aria-hidden="true" />
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Destacados</h2>
              <p>Lo más reciente en bodykits y accesorios.</p>
            </div>
            <Link to={ROUTES.CATALOG} className="link-more">Ver todo el catálogo</Link>
          </div>
          {loading ? (
            <p className="loader">Cargando productos...</p>
          ) : featured.length === 0 ? (
            <div className="empty">
              <i className="fa-solid fa-box-open" />
              <h3>Estamos preparando el catálogo</h3>
              <p>Pronto verás aquí nuestros bodykits y accesorios.</p>
            </div>
          ) : (
            <div className="product-grid">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="values-grid">
            <div className="value">
              <i className="fa-solid fa-car-side" />
              <h3>Hechos para camionetas premium</h3>
              <p>Nuestro catálogo se enfoca en SUV y pickups de alta gama, empezando por la Toyota TXL.</p>
            </div>
            <div className="value">
              <i className="fa-solid fa-comments" />
              <h3>Asesoría directa</h3>
              <p>Te ayudamos a elegir la pieza correcta para tu modelo antes de comprar.</p>
            </div>
            <div className="value">
              <i className="fa-solid fa-location-dot" />
              <h3>Desde Bogotá</h3>
              <p>Conocemos el mercado local y te atendemos de forma cercana, sin intermediarios.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>¿No encuentras tu referencia?</h2>
              <p>Cuéntanos qué camioneta tienes y buscamos la pieza por ti.</p>
            </div>
            <a href={wa} target="_blank" rel="noreferrer" className="btn btn-wa">
              <i className="fa-brands fa-whatsapp" /> Escribir por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
