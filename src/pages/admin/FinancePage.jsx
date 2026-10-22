import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { formatMoney } from '../../utils/formatters';

export default function FinancePage() {
  const [stats, setStats] = useState({ ingresos: 0, costos: 0, ganancia: 0 });

  useEffect(() => {
    async function load() {
      const { data: sales } = await supabase.from('sales').select('total').eq('status', 'completada');
      const { data: items } = await supabase.from('sale_items').select('quantity, products(cost_price)');

      const ingresos = sales?.reduce((acc, s) => acc + Number(s.total), 0) || 0;
      const costos = items?.reduce((acc, i) => acc + ((i.products?.cost_price || 0) * i.quantity), 0) || 0;
      
      setStats({ ingresos, costos, ganancia: ingresos - costos });
    }
    load();
  }, []);

  return (
    <>
      <h1 style={{ color: '#fff', marginBottom: '2rem' }}>Finanzas</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        <div style={{ background: '#14171d', padding: '2rem', borderRadius: '8px', borderLeft: '4px solid #4caf50' }}>
          <h3 style={{ color: '#9aa0ab', margin: 0 }}>Ingresos Totales</h3>
          <p style={{ color: '#4caf50', fontSize: '2rem', margin: '0.5rem 0 0 0' }}>{formatMoney(stats.ingresos)}</p>
        </div>
        <div style={{ background: '#14171d', padding: '2rem', borderRadius: '8px', borderLeft: '4px solid #e5484d' }}>
          <h3 style={{ color: '#9aa0ab', margin: 0 }}>Costo de Mercancía</h3>
          <p style={{ color: '#e5484d', fontSize: '2rem', margin: '0.5rem 0 0 0' }}>{formatMoney(stats.costos)}</p>
        </div>
        <div style={{ background: '#14171d', padding: '2rem', borderRadius: '8px', borderLeft: '4px solid #d99a3d' }}>
          <h3 style={{ color: '#9aa0ab', margin: 0 }}>Ganancia Neta</h3>
          <p style={{ color: '#d99a3d', fontSize: '2rem', margin: '0.5rem 0 0 0' }}>{formatMoney(stats.ganancia)}</p>
        </div>
      </div>
    </>
  );
}