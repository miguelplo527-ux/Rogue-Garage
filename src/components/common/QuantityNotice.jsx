import toast from 'react-hot-toast';
import { ENV } from '../../config/env';
import { MAX_QTY_PER_PRODUCT } from '../../utils/constants';

const MESSAGES = {
  limit: {
    title: 'Pedido por volumen',
    text: `Para pedidos superiores a ${MAX_QTY_PER_PRODUCT} unidades de un mismo producto, le invitamos a comunicarse con uno de nuestros asesores, quien le ofrecerá una tarifa preferencial y atención personalizada.`,
    wa: (name) => `Hola Rogue Garage, deseo cotizar más de ${MAX_QTY_PER_PRODUCT} unidades de: ${name}. ¿Pueden ofrecerme una tarifa preferencial?`,
  },
  stock: {
    title: 'Cantidad sujeta a confirmación',
    text: 'En este momento no podemos añadir más unidades de este producto desde la tienda en línea. Comuníquese con un asesor y con gusto le ayudaremos con su pedido.',
    wa: (name) => `Hola Rogue Garage, quisiera más unidades de: ${name}. ¿Pueden ayudarme con mi pedido?`,
  },
};

const waLink = (reason, name) =>
  `https://wa.me/${ENV.WHATSAPP_NUMBER}?text=${encodeURIComponent(MESSAGES[reason].wa(name))}`;

/** Aviso en pantalla cuando se supera la cantidad permitida. */
export default function QuantityNotice({ reason, productName, onClose }) {
  const m = MESSAGES[reason];
  if (!m) return null;
  return (
    <div className="notice" role="status">
      <i className="fa-solid fa-headset" aria-hidden="true" />
      <div>
        <strong>{m.title}</strong>
        <p>{m.text}</p>
        <a className="btn btn-wa btn-sm" href={waLink(reason, productName)} target="_blank" rel="noreferrer">
          <i className="fa-brands fa-whatsapp" /> Hablar con un asesor
        </a>
      </div>
      {onClose && <button type="button" className="notice-close" aria-label="Cerrar aviso" onClick={onClose}>×</button>}
    </div>
  );
}

/** Mismo aviso en formato toast (para las tarjetas del catálogo). */
export function notifyQuantityLimit(reason, productName) {
  const m = MESSAGES[reason];
  if (!m) return;
  toast(
    (t) => (
      <span style={{ fontSize: '.9rem' }}>
        <strong>{m.title}.</strong> {m.text}{' '}
        <a href={waLink(reason, productName)} target="_blank" rel="noreferrer" onClick={() => toast.dismiss(t.id)} style={{ color: '#c8a874', fontWeight: 700 }}>
          Hablar con un asesor
        </a>
      </span>
    ),
    { icon: '💬', duration: 9000 }
  );
}
