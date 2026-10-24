import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useProducts } from '../../hooks/useProducts';
import { supabase } from '../../services/supabaseClient';
import { formatMoney, formatDate } from '../../utils/formatters';

export default function PurchasesPage() {
  const { products, reload } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados para Proveedores
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');

  // Estados para el Historial
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('registro'); // 'registro' o 'historial'

  // Cargar proveedores al iniciar
  useEffect(() => {
    supabase.from('suppliers').select('*').order('name').then(({ data }) => setSuppliers(data || []));
  }, []);

  // Cargar historial de compras
  const loadHistory = async () => {
    const { data } = await supabase
      .from('purchases')
      .select('*, products(name), suppliers(name), profiles(full_name)')
      .order('date', { ascending: false })
      .limit(50);
    setHistory(data || []);
  };

  // Cargar historial al entrar a la pestaña
  useEffect(() => {
    if (activeTab === 'historial') {
      loadHistory();
    }
  }, [activeTab]);

  const saveSupplier = async () => {
    if (!newSupplierName.trim()) return;
    const { data, error } = await supabase.from('suppliers').insert({ name: newSupplierName.trim() }).select().single();
    if (!error && data) {
      setSuppliers([...suppliers, data]);
      setSelectedSupplier(data.id);
      setShowNewSupplier(false);
      setNewSupplierName('');
      toast.success('Proveedor agregado');
    } else {
      toast.error('Error al crear proveedor');
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !quantity || !unitCost) return toast.error('Llena todos los campos');
    
    setLoading(true);
    try {
      const { error: purchaseError } = await supabase.from('purchases').insert({
        product_id: selectedProduct,
        quantity: Number(quantity),
        unit_cost: Number(unitCost),
        total: Number(quantity) * Number(unitCost),
        supplier_id: selectedSupplier || null
      });
      if (purchaseError) throw purchaseError;

      await supabase.rpc('increment_stock', { 
        product_id: selectedProduct, 
        amount: Number(quantity) 
      });

      toast.success('Compra registrada y stock actualizado');
      setSelectedProduct(''); setQuantity(''); setUnitCost('');
      reload(); // Actualiza el stock en la vista
    } catch (error) {
      console.error(error);
      toast.error('Error al registrar compra.');
    } finally {
      setLoading(false);
    }
  };

  const productData = products.find(p => p.id === selectedProduct);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* HEADER CON PESTAÑAS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#fff', margin: 0, fontSize: '2rem' }}>Entrada de Mercancía</h1>
        
        <div style={{ display: 'flex', background: '#14171d', borderRadius: '8px', padding: '4px', border: '1px solid #262b34' }}>
          <button onClick={() => setActiveTab('registro')} style={{ padding: '8px 16px', background: activeTab === 'registro' ? '#3b82f6' : 'transparent', color: activeTab === 'registro' ? '#fff' : '#9aa0ab', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
            Registrar Compra
          </button>
          <button onClick={() => setActiveTab('historial')} style={{ padding: '8px 16px', background: activeTab === 'historial' ? '#3b82f6' : 'transparent', color: activeTab === 'historial' ? '#fff' : '#9aa0ab', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
            Historial
          </button>
        </div>
      </div>

      {activeTab === 'registro' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* FORMULARIO DE REGISTRO */}
          <div style={{ background: '#14171d', padding: '2rem', borderRadius: '10px', border: '1px solid #262b34' }}>
            <h2 style={{ color: '#fff', marginTop: 0, fontSize: '1.2rem', borderBottom: '1px solid #262b34', paddingBottom: '1rem' }}>Registrar Nueva Compra</h2>
            
            <form onSubmit={handlePurchase} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1.5rem' }}>
              
              <div>
                <label style={{ color: '#9aa0ab', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Proveedor</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)} style={{ flex: 1, padding: '1rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '6px', outline: 'none' }}>
                    <option value="">-- Seleccionar Proveedor --</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <button type="button" onClick={() => setShowNewSupplier(!showNewSupplier)} style={{ padding: '0 1rem', background: '#262b34', color: '#fff', border: '1px solid #444', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {showNewSupplier ? 'Cancelar' : '+ Nuevo'}
                  </button>
                </div>

                {showNewSupplier && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '10px', background: '#0b0d10', padding: '10px', borderRadius: '6px', border: '1px solid #3b82f6' }}>
                    <input type="text" placeholder="Nombre del nuevo proveedor" value={newSupplierName} onChange={(e) => setNewSupplierName(e.target.value)} style={{ flex: 1, padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', outline: 'none' }} />
                    <button type="button" onClick={saveSupplier} style={{ padding: '0 1.5rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar</button>
                  </div>
                )}
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

              <button type="submit" disabled={loading} style={{ padding: '1rem', background: '#3b82f6', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '1rem' }}>
                {loading ? 'Registrando...' : 'Registrar Compra'}
              </button>
            </form>
          </div>

          {/* RESUMEN DEL PRODUCTO */}
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
                  <span>Precio venta:</span><span style={{ color: '#3b82f6' }}>{formatMoney(productData.sale_price)}</span>
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
      ) : (
        /* HISTORIAL DE COMPRAS CON AUDITORÍA */
        <div style={{ background: '#14171d', borderRadius: '8px', border: '1px solid #262b34', overflow: 'hidden' }}>
          <table style={{ width: '100%', color: '#fff', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#06070a', color: '#9aa0ab', textAlign: 'left', fontSize: '0.9rem' }}>
                <th style={{ padding: '1rem' }}>Fecha y Hora</th>
                <th style={{ padding: '1rem' }}>Producto</th>
                <th style={{ padding: '1rem' }}>Proveedor</th>
                <th style={{ padding: '1rem' }}>Cant.</th>
                <th style={{ padding: '1rem' }}>Costo Unit.</th>
                <th style={{ padding: '1rem' }}>Total</th>
                <th style={{ padding: '1rem' }}>Registrado por</th>
              </tr>
            </thead>
            <tbody>
              {history.map(purchase => (
                <tr key={purchase.id} style={{ borderBottom: '1px solid #262b34' }}>
                  <td style={{ padding: '1rem', color: '#9aa0ab', fontSize: '0.85rem' }}>{formatDate(purchase.date)}</td>
                  <td style={{ padding: '1rem' }}>{purchase.products?.name || 'Producto eliminado'}</td>
                  <td style={{ padding: '1rem', color: '#9aa0ab' }}>{purchase.suppliers?.name || 'Sin proveedor'}</td>
                  <td style={{ padding: '1rem' }}>{purchase.quantity}</td>
                  <td style={{ padding: '1rem' }}>{formatMoney(purchase.unit_cost)}</td>
                  <td style={{ padding: '1rem', color: '#e5484d', fontWeight: 'bold' }}>{formatMoney(purchase.total)}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      <i className="fa-solid fa-user" style={{ marginRight: '5px' }}></i>
                      {purchase.profiles?.full_name || 'Admin'}
                    </span>
                  </td>
                </tr>
              ))}
              {history.length === 0 && <tr><td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>No hay compras registradas aún.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}