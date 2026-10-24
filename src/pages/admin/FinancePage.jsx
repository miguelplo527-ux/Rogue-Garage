import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { formatMoney } from '../../utils/formatters';

export default function FinancePage() {
  const [stats, setStats] = useState({ ingresos: 0, costos: 0, gastosOp: 0, ganancia: 0, margen: 0 });

  useEffect(() => {
    async function load() {
      // 1. Ventas y costos de mercancía
      const { data: sales } = await supabase.from('sales').select('total').eq('status', 'completada');
      const { data: items } = await supabase.from('sale_items').select('quantity, products(cost_price)');
      
      // 2. Gastos operativos
      const { data: expenses } = await supabase.from('expenses').select('amount');

      const ingresos = sales?.reduce((acc, s) => acc + Number(s.total), 0) || 0;
      const costos = items?.reduce((acc, i) => acc + ((i.products?.cost_price || 0) * i.quantity), 0) || 0;
      const gastosOp = expenses?.reduce((acc, e) => acc + Number(e.amount), 0) || 0;
      
      const ganancia = ingresos - costos - gastosOp;
      const margen = ingresos > 0 ? ((ganancia / ingresos) * 100).toFixed(1) : 0;

      setStats({ ingresos, costos, gastosOp, ganancia, margen });
    }
    load();
  }, []);

  const cardStyle = { background: '#14171d', padding: '2rem', borderRadius: '10px', borderLeft: '4px solid' };

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#fff', fontSize: '2rem', margin: 0 }}>Estado Financiero</h1>
        <p style={{ color: '#9aa0ab', margin: '0.5rem 0 0 0' }}>Rentabilidad real del negocio</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ ...cardStyle, borderLeftColor: '#4caf50' }}>
          <h3 style={{ color: '#9aa0ab', margin: 0, fontSize: '0.9rem' }}>Ingresos por Ventas</h3>
          <p style={{ color: '#4caf50', fontSize: '2rem', margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>{formatMoney(stats.ingresos)}</p>
        </div>
        <div style={{ ...cardStyle, borderLeftColor: '#e5484d' }}>
          <h3 style={{ color: '#9aa0ab', margin: 0, fontSize: '0.9rem' }}>Costo de Mercancía</h3>
          <p style={{ color: '#e5484d', fontSize: '2rem', margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>{formatMoney(stats.costos)}</p>
        </div>
        <div style={{ ...cardStyle, borderLeftColor: '#f59e0b' }}>
          <h3 style={{ color: '#9aa0ab', margin: 0, fontSize: '0.9rem' }}>Gastos Operativos</h3>
          <p style={{ color: '#f59e0b', fontSize: '2rem', margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>{formatMoney(stats.gastosOp)}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* GANANCIA NETA */}
        <div style={{ ...cardStyle, borderLeftColor: '#3b82f6', background: 'linear-gradient(45deg, #14171d, #1e293b)' }}>
          <h3 style={{ color: '#9aa0ab', margin: 0, fontSize: '1rem' }}>Ganancia Neta Real</h3>
          <p style={{ color: '#fff', fontSize: '3rem', margin: '0.5rem 0', fontWeight: '900' }}>{formatMoney(stats.ganancia)}</p>
          <p style={{ color: '#9aa0ab', margin: 0, fontSize: '0.9rem' }}>Descontando costos y gastos operativos</p>
        </div>

        {/* MARGEN DE RENTABILIDAD */}
        <div style={cardStyle}>
          <h3 style={{ color: '#9aa0ab', margin: 0, fontSize: '1rem' }}>Margen de Rentabilidad</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', margin: '0.5rem 0' }}>
            <p style={{ color: stats.margen >= 0 ? '#3b82f6' : '#e5484d', fontSize: '3rem', margin: 0, fontWeight: '900' }}>{stats.margen}%</p>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#262b34', borderRadius: '4px', marginTop: '1rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(Math.max(stats.margen, 0), 100)}%`, background: '#3b82f6', borderRadius: '4px' }}></div>
          </div>
          <p style={{ color: '#9aa0ab', margin: '1rem 0 0 0', fontSize: '0.9rem' }}>Porcentaje de dinero que queda libre por cada venta.</p>
        </div>
      </div>
    </>
  );
}