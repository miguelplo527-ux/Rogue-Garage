import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import StoreLayout from '../../components/layout/StoreLayout';
import ZoomImage from '../../components/products/ZoomImage';
import { productsService } from '../../services/productsService';
import { formatMoney } from '../../utils/formatters';
import { ENV } from '../../config/env';
import { ROUTES } from '../../config/routes';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import QuantityNotice from '../../components/common/QuantityNotice';
import { MAX_QTY_PER_PRODUCT } from '../../utils/constants';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    setLoading(true);
    productsService.getById(id).then(setProduct).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <StoreLayout floating={false}><p className="loader">Cargando producto...</p></StoreLayout>;
  if (!product) {
    return (
      <StoreLayout floating={false}>
        <div className="container section">
          <div className="empty">
            <i className="fa-solid fa-triangle-exclamation" />
            <h3>No encontramos este producto</h3>
            <Link to={ROUTES.CATALOG} className="btn btn-primary">Volver al catálogo</Link>
          </div>
        </div>
      </StoreLayout>
    );
  }

  const category = product.categories?.name || product.category || 'Accesorio';
  const inStock = product.stock > 0;

  const handleAdd = () => {
    if (!user) {
      toast('Inicia sesión para agregar productos al carrito', { icon: '🔒' });
      navigate(ROUTES.LOGIN, { state: { from: location } });
      return;
    }
    const res = addToCart(product, qty);
    if (!res.ok) {
      if (res.reason === 'soldout') return toast.error('Este producto está agotado');
      return setNotice(res.reason);
    }
    if (res.capped) setNotice(res.reason);
    else {
      setNotice(null);
      toast.success('Agregado al carrito');
    }
  };

  const increase = () => {
    const max = Math.min(MAX_QTY_PER_PRODUCT, product.stock);
    if (qty >= max) return setNotice(product.stock >= MAX_QTY_PER_PRODUCT ? 'limit' : 'stock');
    setNotice(null);
    setQty((q) => q + 1);
  };

  const waLink = `https://wa.me/${ENV.WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola Rogue Garage, quiero consultar por:\n\n*${product.name}*\nPrecio: ${formatMoney(product.sale_price)}\nSKU: ${product.sku}\n\n¿Es compatible con mi camioneta?`
  )}`;

  return (
    <StoreLayout>
      <div className="container">
        <Link to={ROUTES.CATALOG} className="crumb"><i className="fa-solid fa-arrow-left" /> Volver al catálogo</Link>

        <div className="detail-grid">
          <div>
            <ZoomImage src={product.image_url} alt={product.name} />
            <p className="zoom-hint">Pasa el mouse sobre la imagen para ampliarla.</p>
          </div>

          <div className="detail-info">
            <span className="p-brand">{product.brand || 'Genérico'} · {category}</span>
            <h1>{product.name}</h1>
            <p className="desc">{product.description || 'Este producto aún no tiene una descripción detallada. Escríbenos y te contamos todo.'}</p>

            <div className="detail-price">{formatMoney(product.sale_price)}</div>
            <div className={`stock-pill ${inStock ? 'in' : 'out'}`}>
              <i className={`fa-solid ${inStock ? 'fa-check' : 'fa-xmark'}`} />
              {inStock ? 'Disponible' : 'Agotado por ahora'}
            </div>

            <div className="buy-row">
              {inStock && (
                <div className="qty" role="group" aria-label="Cantidad">
                  <button type="button" aria-label="Quitar una unidad" disabled={qty <= 1} onClick={() => setQty((q) => q - 1)}>−</button>
                  <output>{qty}</output>
                  <button type="button" aria-label="Agregar una unidad" onClick={increase}>+</button>
                </div>
              )}
              <button type="button" className="btn btn-primary" onClick={handleAdd} disabled={!inStock}>
                <i className="fa-solid fa-cart-plus" /> {user ? 'Agregar al carrito' : 'Inicia sesión para comprar'}
              </button>
              <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-ghost">
                <i className="fa-brands fa-whatsapp" /> Consultar compatibilidad
              </a>
            </div>
            {notice && <QuantityNotice reason={notice} productName={product.name} onClose={() => setNotice(null)} />}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
