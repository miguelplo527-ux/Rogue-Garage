import { Link } from 'react-router-dom';
import { formatMoney } from '../../utils/formatters';
import { ENV } from '../../config/env';

export default function ProductCard({ product }) {
  const waLink = `https://wa.me/${ENV.WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola ROGUE GARAGE, quiero comprar:\n\n*${product.name}*\nPrecio: ${formatMoney(product.sale_price)}`
  )}`;

  return (
    <div className="product-card">
      <Link to={`/producto/${product.id}`} className="card-img-wrapper">
        <img
          src={product.image_url || 'https://via.placeholder.com/300x300?text=Sin+Imagen'}
          alt={product.name}
          className="card-img"
        />
        <span className="category-tag">{product.categories?.name || 'General'}</span>
      </Link>
      
      <div className="card-body">
        <h3 className="card-title">{product.name}</h3>
        <p className="card-desc">{product.description || 'Sin descripción disponible.'}</p>
        
        <div className="card-footer">
          <span className="card-price">{formatMoney(product.sale_price)}</span>
          <span className={`stock-info ${product.stock > 0 ? '' : 'out'}`}>
            {product.stock > 0 ? `Stock: ${product.stock}` : 'Agotado'}
          </span>
        </div>
        
        {product.stock > 0 && (
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp" style={{ marginTop: '10px' }}>
            <i className="fa-brands fa-whatsapp"></i> Comprar
          </a>
        )}
      </div>
    </div>
  );
}