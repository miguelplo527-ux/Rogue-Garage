import { Link } from 'react-router-dom';
import StoreLayout from '../../components/layout/StoreLayout';
import { ROUTES } from '../../config/routes';
import { ENV } from '../../config/env';
import { CATEGORIES, CATEGORY_ICONS } from '../../utils/constants';

export default function AboutPage() {
  const wa = `https://wa.me/${ENV.WHATSAPP_NUMBER}`;
  return (
    <StoreLayout>
      <div className="container">
        <div className="page-title">
          <h1>Sobre nosotros</h1>
        </div>
        <div className="section" style={{ paddingTop: 24 }}>
          <div className="prose">
            <p>
              Rogue Garage nació en Bogotá para quienes quieren que su camioneta se vea tan bien como se maneja.
              Nos enfocamos en vehículos de lujo, especialmente camionetas como la Toyota TXL, y en lo que las hace únicas:
              <Link to={`${ROUTES.CATALOG}?cat=${encodeURIComponent('Body Kit')}`} className="inline-link">body kits</Link>,{' '}
              <Link to={`${ROUTES.CATALOG}?cat=${encodeURIComponent('Camionetas y Autos')}`} className="inline-link">accesorios para camionetas y autos</Link>,{' '}
              <Link to={`${ROUTES.CATALOG}?cat=${encodeURIComponent('Iluminación')}`} className="inline-link">iluminación</Link>,{' '}
              <Link to={`${ROUTES.CATALOG}?cat=${encodeURIComponent('Tuning')}`} className="inline-link">tuning</Link> y{' '}
              <Link to={`${ROUTES.CATALOG}?cat=${encodeURIComponent('Llaveros y Logos')}`} className="inline-link">llaveros y logos</Link>.
            </p>
            <p>
              Seleccionamos cada pieza pensando en el ajuste, el acabado y la forma en que se ve en el vehículo.
              Si no estás seguro de qué elegir, te asesoramos directamente antes de comprar.
            </p>
          </div>
        </div>
        <div className="values-grid" style={{ paddingBottom: 48 }}>
          <div className="value"><i className="fa-solid fa-gem" /><h3>Selección cuidada</h3><p>Pocas piezas, bien elegidas, para camionetas premium.</p></div>
          <div className="value"><i className="fa-solid fa-comments" /><h3>Trato directo</h3><p>Hablas con quien conoce el producto, sin intermediarios.</p></div>
          <div className="value"><i className="fa-solid fa-cart-shopping" /><h3>Compra simple</h3><p>Crea tu cuenta, arma tu carrito y envía tu pedido en minutos.</p></div>
        </div>
        <h2 className="about-sub">Explora lo que ofrecemos</h2>
        <div className="cat-grid" style={{ marginBottom: 48 }}>
          {CATEGORIES.map((c) => (
            <Link key={c} to={`${ROUTES.CATALOG}?cat=${encodeURIComponent(c)}`} className="cat-tile">
              <i className={`fa-solid ${CATEGORY_ICONS[c] || 'fa-star'}`} aria-hidden="true" />
              {c}
            </Link>
          ))}
        </div>
        <div className="cta-band" style={{ marginBottom: 64 }}>
          <div>
            <h2>Hablemos de tu camioneta</h2>
            <p>Cuéntanos qué modelo tienes y qué quieres lograr.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to={ROUTES.CATALOG} className="btn btn-primary">Ver catálogo</Link>
            <a href={wa} target="_blank" rel="noreferrer" className="btn btn-ghost"><i className="fa-brands fa-whatsapp" /> WhatsApp</a>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
