import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import StoreLayout from '../../components/layout/StoreLayout';
import { useCart } from '../../hooks/useCart';
import { paymentsService } from '../../services/paymentsService';
import { formatMoney } from '../../utils/formatters';
import { ROUTES } from '../../config/routes';

const POLL_MS = 3000;
const MAX_TRIES = 30; // ~90 segundos esperando la confirmación de Wompi

// Wompi devuelve al cliente a /pedido?ref=...; aquí se consulta el estado real del pedido.
export default function OrderPage() {
  const [params] = useSearchParams();
  const reference = params.get('ref');
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [state, setState] = useState('loading'); // loading | found | missing | error
  const tries = useRef(0);
  const cleared = useRef(false);

  useEffect(() => {
    if (!reference) { setState('missing'); return undefined; }
    let timer;
    let cancelled = false;

    const check = async () => {
      try {
        const o = await paymentsService.getOrderByReference(reference);
        if (cancelled) return;
        if (!o) { setState('missing'); return; }
        setOrder(o);
        setState('found');
        if (o.status === 'pagado' && !cleared.current) {
          cleared.current = true;
          clearCart();
        }
        tries.current += 1;
        if (o.status === 'pendiente' && tries.current < MAX_TRIES) timer = setTimeout(check, POLL_MS);
      } catch (err) {
        console.error(err);
        if (!cancelled) setState('error');
      }
    };
    check();
    return () => { cancelled = true; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  const status = order?.status;

  return (
    <StoreLayout floating={false}>
      <div className="container">
        <div className="page-title">
          <h1>Tu pedido</h1>
          {reference && <p>Referencia: {reference}</p>}
        </div>

        <div className="section" style={{ paddingTop: 16 }}>
          {state === 'loading' && <p className="loader">Consultando tu pedido...</p>}

          {state === 'error' && (
            <div className="empty">
              <i className="fa-solid fa-triangle-exclamation" />
              <h3>No pudimos consultar tu pedido</h3>
              <p>Recarga la página en unos segundos. Si ya pagaste, tu pedido quedará registrado.</p>
            </div>
          )}

          {state === 'missing' && (
            <div className="empty">
              <i className="fa-solid fa-box-open" />
              <h3>No encontramos este pedido</h3>
              <p>Revisa que hayas iniciado sesión con la misma cuenta con la que pagaste.</p>
              <Link to={ROUTES.CATALOG} className="btn btn-primary">Ver catálogo</Link>
            </div>
          )}

          {state === 'found' && order && (
            <section className="panel" aria-live="polite">
              {status === 'pagado' && (
                <>
                  <h2><i className="fa-solid fa-circle-check" style={{ color: 'var(--success)' }} aria-hidden="true" /> ¡Pago recibido!</h2>
                  <p>Gracias por tu compra. Te contactaremos al {order.customer_phone} para coordinar el envío a {order.shipping_address}, {order.shipping_city}.</p>
                </>
              )}
              {status === 'pendiente' && (
                <>
                  <h2><i className="fa-solid fa-hourglass-half" style={{ color: 'var(--accent)' }} aria-hidden="true" /> Estamos confirmando tu pago</h2>
                  <p>Esto toma unos segundos. No cierres esta página; si tardas en verlo, tu banco aún está procesando la transacción.</p>
                </>
              )}
              {(status === 'rechazado' || status === 'anulado') && (
                <>
                  <h2><i className="fa-solid fa-circle-xmark" style={{ color: 'var(--danger)' }} aria-hidden="true" /> El pago no se completó</h2>
                  <p>No se realizó ningún cobro. Tus productos siguen en el carrito para que lo intentes de nuevo.</p>
                  <Link to={ROUTES.CART} className="btn btn-primary">Volver al carrito</Link>
                </>
              )}

              <dl className="data-list">
                {(order.order_items || []).map((i) => (
                  <div key={i.id}><dt>{i.quantity} x {i.name}</dt><dd>{formatMoney(i.quantity * i.unit_price)}</dd></div>
                ))}
                <div><dt>Total</dt><dd>{formatMoney(order.total)}</dd></div>
              </dl>

              {status === 'pagado' && <Link to={ROUTES.CATALOG} className="btn btn-ghost">Seguir comprando</Link>}
            </section>
          )}
        </div>
      </div>
    </StoreLayout>
  );
}