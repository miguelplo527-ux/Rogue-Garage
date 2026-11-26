import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import StoreLayout from '../../components/layout/StoreLayout';
import { FALLBACK_IMG } from '../../components/products/ZoomImage';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { paymentsService } from '../../services/paymentsService';
import { formatMoney } from '../../utils/formatters';
import { ENV } from '../../config/env';
import { ROUTES } from '../../config/routes';
import QuantityNotice from '../../components/common/QuantityNotice';

export default function CartPage() {
  const navigate = useNavigate();
  const { user, profile, displayName, firstName } = useAuth();
  const { items, count, subtotal, setQuantity, removeFromCart, clearCart } = useCart();

  const [notice, setNotice] = useState(null);
  const [paying, setPaying] = useState(false);
  const hasShipping = Boolean(profile?.phone && profile?.shipping_address && profile?.shipping_city);

  const pay = async () => {
    if (!hasShipping) {
      toast.error('Completa tu teléfono y dirección de envío para pagar');
      navigate(ROUTES.ACCOUNT);
      return;
    }
    setPaying(true);
    try {
      const { url } = await paymentsService.startCheckout(items);
      window.location.href = url; // pasarela segura de Wompi
    } catch (err) {
      console.error(err);
      if (err.code === 'missing_shipping') {
        toast.error('Completa tu teléfono y dirección de envío para pagar');
        navigate(ROUTES.ACCOUNT);
      } else if (err.code === 'stock') {
        toast.error(`No hay suficientes unidades de ${err.details?.product || 'un producto'}. Ajusta la cantidad.`);
      } else {
        toast.error('No pudimos iniciar el pago. Inténtalo de nuevo en un momento.');
      }
      setPaying(false);
    }
  };
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
              {hasShipping ? (
                <small>
                  Enviar a: {profile.shipping_address}, {profile.shipping_city} · {profile.phone}{' '}
                  <Link to={ROUTES.ACCOUNT} className="inline-link">Cambiar</Link>
                </small>
              ) : (
                <small>
                  Para pagar necesitamos tu teléfono y dirección de envío.{' '}
                  <Link to={ROUTES.ACCOUNT} className="inline-link">Completar datos</Link>
                </small>
              )}
              <button type="button" className="btn btn-primary btn-block" onClick={pay} disabled={paying}>
                <i className="fa-solid fa-lock" aria-hidden="true" /> {paying ? 'Abriendo pago...' : 'Pagar con tarjeta, PSE o Nequi'}
              </button>
              <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-wa btn-block">
                <i className="fa-brands fa-whatsapp" /> Enviar pedido por WhatsApp
              </a>
              <small>Pago seguro con Wompi. También puedes pedir por WhatsApp y te confirmamos disponibilidad y envío.</small>
            </aside>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}