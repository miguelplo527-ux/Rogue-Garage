import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useProducts } from '../../hooks/useProducts';
import { formatMoney, formatDate } from '../../utils/formatters';
import { supabase } from '../../services/supabaseClient';

export default function SalesPage() {
  const { products, reload } = useProducts();
  const [cart, setCart] = useState([]); 
  const [search, setSearch] = useState(''); 
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [customerName, setCustomerName] = useState('');
  const [history, setHistory] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  // Pestañas para organizar la vista (Punto 3: reorganización)
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' o 'historial'

  // Cargar historial de ventas con el nombre del admin (Auditoría)
  const loadHistory = async () => { 
    const { data } = await supabase
      .from('sales')
      .select('*, profiles(full_name)') // Traemos el nombre de quien vendió
      .order('date', { ascending: false })
      .limit(20); 
    setHistory(data || []); 
  };

  useEffect(() => { loadHistory(); }, []);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));
  
  const addToCart = (p) => { 
    if (p.stock <= 0) return toast.error('Producto sin stock');
    
    const existing = cart.find(item => item.id === p.id);
    if (existing) {
      if (existing.quantity >= p.stock) return toast.error('No hay más stock disponible');
      setCart(cart.map(item => item.id === p.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...p, quantity: 1 }]); 
    }
    setSearch(''); 
  };
  
  const remove = (id) => setCart(cart.filter(i => i.id !== id));
  const total = cart.reduce((a, b) => a + (b.sale_price * b.quantity), 0);

  const checkout = async () => {
    if (cart.length === 0) return toast.error('El carrito está vacío');
    setLoading(true);
    try {
      const { data: sale, error: saleError } = await supabase.from('sales').insert({ 
        total, 
        payment_method: paymentMethod, 
        customer_name: customerName || 'Cliente final',
        status: 'completada' 
      }).select().single();
      if (saleError) throw saleError;
      
      const items = cart.map(i => ({ sale_id: sale.id, product_id: i.id, quantity: i.quantity, unit_price: i.sale_price }));
      const { error: itemsError } = await supabase.from('sale_items').insert(items);
      if (itemsError) throw itemsError;

      for (const item of cart) { 
        await supabase.rpc('decrement_stock', { product_id: item.id, amount: item.quantity }); 
      }
      
      toast.success('¡Venta registrada!'); 
      setCart([]); 
      setCustomerName('');
      reload(); 
      loadHistory();
    } catch (e) { 
      console.error(e);
      toast.error('Error al vender. Revisa la consola.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const formatPaymentMethod = (method) => {
    const methods = { 'efectivo': 'Efectivo', 'transferencia': 'Transferencia', 'nequi': 'Nequi', 'daviplata': 'Daviplata', 'bancolombia': 'Bancolombia', 'tarjeta': 'Tarjeta' };
    return methods[method?.toLowerCase()] || method;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#fff', margin: 0 }}>Módulo de Ventas</h1>
        
        {/* Pestañas para organizar la vista */}
        <div style={{ display: 'flex', background: '#14171d', borderRadius: '8px', padding: '4px', border: '1px solid #262b34' }}>
          <button onClick={() => setActiveTab('pos')} style={{ padding: '8px 16px', background: activeTab === 'pos' ? '#3b82f6' : 'transparent', color: activeTab === 'pos' ? '#fff' : '#9aa0ab', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
            Punto de Venta
          </button>
          <button onClick={() => setActiveTab('historial')} style={{ padding: '8px 16px', background: activeTab === 'historial' ? '#3b82f6' : 'transparent', color: activeTab === 'historial' ? '#fff' : '#9aa0ab', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
            Historial
          </button>
        </div>
      </div>

      {activeTab === 'pos' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          <div>
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <input type="text" placeholder="Buscar producto por nombre o SKU..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '1rem', background: '#14171d', border: '1px solid #262b34', color: '#fff', borderRadius: '8px', outline: 'none' }} />
              {search && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1a1a1a', border: '1px solid #262b34', zIndex: 10, borderRadius: '0 0 8px 8px', maxHeight: '300px', overflowY: 'auto' }}>
                  {filtered.map(p => (
                    <div key={p.id} onClick={() => addToCart(p)} style={{ padding: '1rem', borderBottom: '1px solid #222', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }} onMouseEnter={e => e.currentTarget.style.background = '#222'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ color: '#fff' }}>{p.name} <small style={{color:'#888'}}>({p.stock} disp.)</small></span>
                      <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{formatMoney(p.sale_price)}</span>
                    </div>
                  ))}
                  {filtered.length === 0 && <div style={{ padding: '1rem', color: '#666', textAlign: 'center' }}>No se encontraron productos</div>}
                </div>
              )}
            </div>
            
            <div style={{ background: '#14171d', borderRadius: '8px', border: '1px solid #262b34', overflow: 'hidden' }}>
              <table style={{ width: '100%', color: '#fff', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#06070a', color: '#9aa0ab', textAlign: 'left', fontSize: '0.9rem' }}>
                    <th style={{ padding: '1rem' }}>Producto</th>
                    <th style={{ padding: '1rem' }}>Cant.</th>
                    <th style={{ padding: '1rem' }}>Precio</th>
                    <th style={{ padding: '1rem' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(i => (
                    <tr key={i.id} style={{ borderBottom: '1px solid #262b34' }}>
                      <td style={{ padding: '1rem' }}>{i.name}</td>
                      <td style={{ padding: '1rem', color: '#9aa0ab' }}>{i.quantity}</td>
                      <td style={{ padding: '1rem', color: '#3b82f6', fontWeight: 'bold' }}>{formatMoney(i.sale_price * i.quantity)}</td>
                      <td style={{ padding: '1rem' }}>
                        <button onClick={() => remove(i.id)} style={{ background: 'rgba(229,72,77,0.1)', border: 'none', color: '#e5484d', cursor: 'pointer', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold' }}>X</button>
                      </td>
                    </tr>
                  ))}
                  {cart.length === 0 && <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>Agrega productos para vender</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ background: '#14171d', padding: '1.5rem', borderRadius: '8px', border: '1px solid #262b34', height: 'fit-content' }}>
            <h2 style={{ color: '#fff', marginTop: 0, borderBottom: '1px solid #262b34', paddingBottom: '1rem', fontSize: '1.2rem' }}>Resumen de Venta</h2>
            
            <div style={{ marginTop: '1rem' }}>
              <input type="text" placeholder="Nombre del cliente (Opcional)" value={customerName} onChange={e => setCustomerName(e.target.value)} style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', marginBottom: '1rem', borderRadius: '6px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0', fontSize: '1.2rem' }}>
              <span style={{ color: '#9aa0ab' }}>Total a Pagar:</span>
              <strong style={{ color: '#3b82f6', fontSize: '1.5rem' }}>{formatMoney(total)}</strong>
            </div>
            
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '1rem', background: '#000', border: '1px solid #262b34', color: '#fff', marginBottom: '1rem', borderRadius: '6px', outline: 'none' }}>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="nequi">Nequi</option>
              <option value="daviplata">Daviplata</option>
              <option value="bancolombia">Bancolombia</option>
              <option value="tarjeta">Tarjeta</option>
            </select>
            
            <button onClick={checkout} disabled={loading || cart.length === 0} style={{ width: '100%', padding: '1rem', background: '#3b82f6', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', opacity: (loading || cart.length === 0) ? 0.5 : 1, fontSize: '1rem' }}>
              {loading ? 'Procesando...' : 'Confirmar Venta'}
            </button>
          </div>
        </div>
      ) : (
        /* HISTORIAL DE VENTAS CON AUDITORÍA */
        <div style={{ background: '#14171d', borderRadius: '8px', border: '1px solid #262b34', overflow: 'hidden' }}>
          <table style={{ width: '100%', color: '#fff', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#06070a', color: '#9aa0ab', textAlign: 'left', fontSize: '0.9rem' }}>
                <th style={{ padding: '1rem' }}>Fecha y Hora</th>
                <th style={{ padding: '1rem' }}>Cliente</th>
                <th style={{ padding: '1rem' }}>Atendido por</th>
                <th style={{ padding: '1rem' }}>Método Pago</th>
                <th style={{ padding: '1rem' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {history.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #262b34' }}>
                  <td style={{ padding: '1rem', color: '#9aa0ab', fontSize: '0.85rem' }}>{formatDate(s.date)}</td>
                  <td style={{ padding: '1rem' }}>{s.customer_name || 'Cliente final'}</td>
                  {/* AQUÍ SE MUESTRA QUIÉN HIZO LA VENTA */}
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      <i className="fa-solid fa-user" style={{ marginRight: '5px' }}></i>
                      {s.profiles?.full_name || 'Admin'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#9aa0ab', textTransform: 'capitalize' }}>{formatPaymentMethod(s.payment_method)}</td>
                  <td style={{ padding: '1rem', color: '#4caf50', fontWeight: 'bold' }}>{formatMoney(s.total)}</td>
                </tr>
              ))}
              {history.length === 0 && <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>No hay ventas registradas aún.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}