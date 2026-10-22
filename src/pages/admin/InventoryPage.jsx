import { useProducts } from '../../hooks/useProducts';
import { formatMoney } from '../../utils/formatters';

export default function InventoryPage() {
  const { products, loading } = useProducts();

  // Cálculos de inventario
  const totalInvertido = products.reduce((acc, p) => acc + (Number(p.cost_price) * p.stock), 0);
  const totalUnidades = products.reduce((acc, p) => acc + p.stock, 0);
  const productosBajos = products.filter(p => p.stock <= 3);

  return (
    <>
      <h1 style={{ color: '#fff', fontSize: '2rem', margin: '0 0 2rem 0' }}>Control de Inventario</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ background: '#14171d', padding: '2rem', borderRadius: '10px', border: '1px solid #262b34' }}>
          <h3 style={{ color: '#9aa0ab', margin: 0, fontSize: '1rem' }}>Capital Invertido en Mercancía</h3>
          <p style={{ color: '#4caf50', fontSize: '2rem', margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>{formatMoney(totalInvertido)}</p>
          <span style={{ color: '#666', fontSize: '0.8rem' }}>Suma de costo x stock de todos los productos</span>
        </div>
        <div style={{ background: '#14171d', padding: '2rem', borderRadius: '10px', border: '1px solid #262b34' }}>
          <h3 style={{ color: '#9aa0ab', margin: 0, fontSize: '1rem' }}>Unidades Totales Disponibles</h3>
          <p style={{ color: '#fff', fontSize: '2rem', margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>{totalUnidades} unds</p>
          <span style={{ color: '#666', fontSize: '0.8rem' }}>Suma de todas las existencias físicas</span>
        </div>
      </div>

      <div style={{ background: '#14171d', borderRadius: '10px', border: '1px solid #262b34', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #262b34', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ color: '#e5484d', fontSize: '1.2rem' }}></i>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '1.2rem' }}>Alertas de Stock Bajo (≤ 3 unidades)</h2>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
          <thead>
            <tr style={{ background: '#0b0d10', color: '#9aa0ab', textAlign: 'left', fontSize: '0.9rem' }}>
              <th style={{ padding: '1rem 1.5rem' }}>Producto</th>
              <th>SKU</th>
              <th>Stock Actual</th>
              <th>Acción Sugerida</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</td></tr> : 
             productosBajos.length === 0 ? <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#4caf50' }}>¡Todo bien! No hay productos con stock bajo.</td></tr> :
             productosBajos.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '1rem 1.5rem' }}>{p.name}</td>
                <td style={{ color: '#9aa0ab', fontFamily: 'monospace' }}>{p.sku}</td>
                <td>
                  <span style={{ background: 'rgba(229,72,77,0.15)', color: '#e5484d', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                    {p.stock} unds
                  </span>
                </td>
                <td style={{ color: '#d99a3d', fontSize: '0.9rem' }}>Comprar al proveedor</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}