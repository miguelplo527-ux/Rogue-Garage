import { useState } from 'react';
import { Link } from 'react-router-dom';
import StoreLayout from '../../components/layout/StoreLayout';
import { FALLBACK_IMG } from '../../components/products/ZoomImage';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { formatMoney } from '../../utils/formatters';
import { ENV } from '../../config/env';
import { ROUTES } from '../../config/routes';
import QuantityNotice from '../../components/common/QuantityNotice';

export default function CartPage() {
  const { user, displayName, firstName } = useAuth();
  const { items, count, subtotal, setQuantity, removeFromCart, clearCart } = useCart();

  const [notice, setNotice] = useState(null);
  const inc = (i) => {
    const r = setQuantity(i.id, i.quantity + 1);
    if (!r.ok) setNotice({ reason: r.reason, name: i.name });
    else setNotice(null);
  };

  const lines = items.map((i) => `• ${i.quantity} x ${i.name} — ${formatMoney(i.quantity * i.sale_price)}`).join('\n');
  const message =
    `Hola Rogue Garage, soy ${displayName} (${user?.email}) y quiero hacer este pedido:\n\n${lines}\n\nTotal: ${formatMoney(subtotal)}\n\n¿Me confirman disponibilidad y forma de pago?`;
  const waLink = `https://wa.me/${ENV.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <StoreLayout floating={false}>
      <div className="container">
        <div className="page-title">
          <h1>{firstName ? `Tu carrito, ${firstName}` : 'Tu carrito'}</h1>
          <p>{count > 0 ? `${count} ${count === 1 ? 'artículo' : 'artículos'} listos para tu pedido.` : 'Aquí verás los productos que agregues.'}</p>
        </div>

        {items.length === 0 ? (
          <div className="section" style={{ paddingTop: 24 }}>
            <div className="empty">
              <i className="fa-solid fa-cart-shopping" />
              <h3>Tu carrito está vacío</h3>
              <p>Explora el catálogo y agrega las piezas que quieras para tu camioneta.</p>
              <Link to={ROUTES.CATALOG} className="btn btn-primary">Ver catálogo</Link>
            </div>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-list">
              {notice && <QuantityNotice reason={notice.reason} productName={notice.name} onClose={() => setNotice(null)} />}
              {items.map((i) => (
                <div className="cart-item" key={i.id}>
                  <Link to={`/producto/${i.id}`}>
                    <img className="cart-thumb" src={i.image_url || FALLBACK_IMG} alt={i.name} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }} />
                  </Link>
                  <div>
                    <h3>{i.name}</h3>
                    <p className="meta">{[i.brand, i.category].filter(Boolean).join(' · ')}</p>
                    <p className="unit">{formatMoney(i.sale_price)} c/u</p>
                  </div>
                  <div className="cart-side">
                    <span className="line-total">{formatMoney(i.quantity * i.sale_price)}</span>
                    <div className="qty" role="group" aria-label={`Cantidad de ${i.name}`}>
                      <button type="button" aria-label="Quitar una unidad" disabled={i.quantity <= 1} onClick={() => setQuantity(i.id, i.quantity - 1)}>−</button>
                      <output>{i.quantity}</output>
                      <button type="button" aria-label="Agregar una unidad" onClick={() => inc(i)}>+</button>
                    </div>
                    <button type="button" className="link-danger" onClick={() => removeFromCart(i.id)}>Quitar</button>
                  </div>
                </div>
              ))}
              <button type="button" className="link-danger" style={{ alignSelf: 'flex-start' }} onClick={clearCart}>Vaciar carrito</button>
            </div>

            <aside className="summary" aria-label="Resumen del pedido">
              <h3>Resumen</h3>
              <div className="row"><span>Artículos</span><span>{count}</span></div>
              <div className="row total"><span>Total</span><span>{formatMoney(subtotal)}</span></div>
              <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-wa btn-block">
                <i className="fa-brands fa-whatsapp" /> Enviar pedido por WhatsApp
              </a>
              <small>Te confirmamos disponibilidad, envío y forma de pago por WhatsApp.</small>
            </aside>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
