import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatMoney } from '../../utils/formatters';
import { ROUTES } from '../../config/routes';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { FALLBACK_IMG } from './ZoomImage';
import { notifyQuantityLimit } from '../common/QuantityNotice';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const category = product.categories?.name || product.category || 'General';
  const inStock = product.stock > 0;

  const handleAdd = () => {
    if (!user) {
      toast('Inicia sesión para agregar productos al carrito', { icon: '🔒' });
      navigate(ROUTES.LOGIN, { state: { from: location } });
      return;
    }
    const res = addToCart(product, 1);
    if (!res.ok) {
      if (res.reason === 'soldout') return toast.error('Este producto está agotado');
      return notifyQuantityLimit(res.reason, product.name);
    }
    if (res.capped) return notifyQuantityLimit(res.reason, product.name);
    toast.success('Agregado al carrito');
  };

  return (
    <article className="p-card">
      <Link to={`/producto/${product.id}`} className="p-media" aria-label={`Ver ${product.name}`}>
        <img
          className="p-img"
          src={product.image_url || FALLBACK_IMG}
          alt={product.name}
          loading="lazy"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
        />
        <span className={`p-tag${inStock ? '' : ' out'}`}>{inStock ? category : 'Agotado'}</span>
      </Link>
      <span className="p-brand">{product.brand || 'Genérico'}</span>
      <h3 className="p-title"><Link to={`/producto/${product.id}`}>{product.name}</Link></h3>
      <p className="p-price">{formatMoney(product.sale_price)}</p>
      <div className="p-actions">
        <Link to={`/producto/${product.id}`} className="btn btn-ghost">Ver</Link>
        <button type="button" className="btn btn-primary" onClick={handleAdd} disabled={!inStock}>
          <i className="fa-solid fa-cart-plus" /> Agregar
        </button>
      </div>
    </article>
  );
}
