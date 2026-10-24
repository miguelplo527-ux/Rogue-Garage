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

  // Cargar historial de ventas
  const loadHistory = async () => { 
    const { data } = await supabase
      .from('sales')
      .select('*')
      .order('date', { ascending: false })
      .limit(5); 
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

  // Función para poner bonito el nombre del método de pago
  const formatPaymentMethod = (method) => {
    const methods = {
      'efectivo': 'Efectivo',
      'transferencia': 'Transferencia',
      'nequi': 'Nequi',
      'daviplata': 'Daviplata',
      'bancolombia': 'Bancolombia',
      'tarjeta': 'Tarjeta'
    };
    return methods[method?.toLowerCase()] || method;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
      <div>
        <h1 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '2rem' }}>Punto de Venta</h1>
        
        {/* Buscador */}
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
        
        {/* Tabla del carrito */}
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
          <input 
            type="text" 
            placeholder="Nombre del cliente (Opcional)" 
            value={customerName} 
            onChange={e => setCustomerName(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', marginBottom: '1rem', borderRadius: '6px' }} 
          />
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

        {/* HISTORIAL DE VENTAS MEJORADO */}
        <div style={{ marginTop: '2.5rem' }}>
          <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid #262b34', paddingBottom: '0.5rem' }}>Últimas Ventas</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {history.map(s => (
              <div key={s.id} style={{ background: '#0b0d10', padding: '12px', borderRadius: '6px', border: '1px solid #262b34' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {s.customer_name || 'Cliente final'}
                  </span>
                  <span style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {formatMoney(s.total)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#9aa0ab' }}>
                  <span><i className="fa-regular fa-clock" style={{ marginRight: '4px' }}></i>{formatDate(s.date)}</span>
                  <span style={{ textTransform: 'capitalize' }}><i className="fa-solid fa-money-bill" style={{ marginRight: '4px' }}></i>{formatPaymentMethod(s.payment_method)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}