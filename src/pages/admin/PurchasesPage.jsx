import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useProducts } from '../../hooks/useProducts';
import { supabase } from '../../services/supabaseClient';
import { formatMoney } from '../../utils/formatters';

export default function PurchasesPage() {
  const { products, reload } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados para Proveedores
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');

  // Cargar proveedores al iniciar
  useEffect(() => {
    supabase.from('suppliers').select('*').order('name').then(({ data }) => setSuppliers(data || []));
  }, []);

  const addSupplier = async () => {
    const name = window.prompt("Nombre del nuevo proveedor:");
    if (name && name.trim()) {
      const { data, error } = await supabase.from('suppliers').insert({ name: name.trim() }).select().single();
      if (!error && data) {
        setSuppliers([...suppliers, data]);
        setSelectedSupplier(data.id);
        toast.success('Proveedor agregado');
      }
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !quantity || !unitCost) return toast.error('Llena todos los campos');
    
    setLoading(true);
    try {
      // 1. Registrar la compra en la base de datos con el proveedor
      const { error: purchaseError } = await supabase.from('purchases').insert({
        product_id: selectedProduct,
        quantity: Number(quantity),
        unit_cost: Number(unitCost),
        total: Number(quantity) * Number(unitCost),
        supplier_id: selectedSupplier || null // Guardamos el proveedor
      });
      if (purchaseError) throw purchaseError;

      // 2. Sumar el stock al producto
      await supabase.rpc('increment_stock', { 
        product_id: selectedProduct, 
        amount: Number(quantity) 
      });

      toast.success('Compra registrada y stock actualizado');
      setSelectedProduct(''); setQuantity(''); setUnitCost('');
      reload();
    } catch (error) {
      console.error(error);
      toast.error('Error al registrar compra.');
    } finally {
      setLoading(false);
    }
  };

  const productData = products.find(p => p.id === selectedProduct);

  return (
    <>
      <h1 style={{ color: '#fff', fontSize: '2rem', margin: '0 0 2rem 0' }}>Entrada de Mercancía</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div style={{ background: '#14171d', padding: '2rem', borderRadius: '10px', border: '1px solid #262b34' }}>
          <h2 style={{ color: '#fff', marginTop: 0, fontSize: '1.2rem', borderBottom: '1px solid #262b34', paddingBottom: '1rem' }}>Registrar Nueva Compra</h2>
          
          <form onSubmit={handlePurchase} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1.5rem' }}>
            
            {/* SELECTOR DE PROVEEDOR */}
            <div>
              <label style={{ color: '#9aa0ab', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Proveedor</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)} style={{ flex: 1, padding: '1rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '6px', outline: 'none' }}>
                  <option value="">-- Seleccionar Proveedor --</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <button type="button" onClick={addSupplier} style={{ padding: '0 1rem', background: '#262b34', color: '#fff', border: '1px solid #444', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Nuevo</button>
              </div>
            </div>

            <div>
              <label style={{ color: '#9aa0ab', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Selecciona el producto</label>
              <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} style={{ width: '100%', padding: '1rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '6px', outline: 'none' }}>
                <option value="">-- Elegir producto --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ color: '#9aa0ab', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Cantidad que llega</label>
                <input type="number" min="1" placeholder="Ej: 10" value={quantity} onChange={e => setQuantity(e.target.value)} style={{ width: '100%', padding: '1rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '6px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ color: '#9aa0ab', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Costo por unidad</label>
                <input type="number" min="0" placeholder="Ej: 45000" value={unitCost} onChange={e => setUnitCost(e.target.value)} style={{ width: '100%', padding: '1rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '6px', outline: 'none' }} />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ padding: '1rem', background: '#d99a3d', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '1rem' }}>
              {loading ? 'Registrando...' : 'Registrar Compra'}
            </button>
          </form>
        </div>

        <div style={{ background: '#14171d', padding: '2rem', borderRadius: '10px', border: '1px solid #262b34', height: 'fit-content' }}>
          <h2 style={{ color: '#fff', marginTop: 0, fontSize: '1.2rem', borderBottom: '1px solid #262b34', paddingBottom: '1rem' }}>Resumen del Producto</h2>
          
          {productData ? (
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <img src={productData.image_url || 'https://via.placeholder.com/150'} alt={productData.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
              <h3 style={{ color: '#fff', margin: 0 }}>{productData.name}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9aa0ab' }}>
                <span>Costo actual:</span><span>{formatMoney(productData.cost_price)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9aa0ab' }}>
                <span>Precio venta:</span><span style={{ color: '#d99a3d' }}>{formatMoney(productData.sale_price)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', borderTop: '1px solid #333', paddingTop: '1rem', fontWeight: 'bold' }}>
                <span>Stock a actualizar:</span><span>{productData.stock} + {quantity || 0} = {productData.stock + Number(quantity || 0)}</span>
              </div>
            </div>
          ) : (
            <p style={{ color: '#666', marginTop: '2rem', textAlign: 'center' }}>Selecciona un producto para ver su información</p>
          )}
        </div>
      </div>
    </>
  );
}