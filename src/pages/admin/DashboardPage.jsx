import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient'; 
import { formatMoney } from '../../utils/formatters';

export default function DashboardPage() {
  const [stats, setStats] = useState({ ventas: 0, ingresos: 0, productos: 0 });

  useEffect(() => {
    async function load() {
      const { data: p } = await supabase.from('products').select('id').eq('is_active', true);
      const { data: s } = await supabase.from('sales').select('total').eq('status', 'completada');
      setStats({ 
        productos: p?.length || 0, 
        ventas: s?.length || 0, 
        ingresos: s?.reduce((a, b) => a + Number(b.total), 0) || 0 
      });
    }
    load();
  }, []);

  const cardStyle = {
    background: '#14171d', 
    padding: '2rem', 
    borderRadius: '10px', 
    border: '1px solid #262b34',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '2rem', margin: 0 }}>Resumen General</h1>
          <p style={{ color: '#9aa0ab', margin: '0.5rem 0 0 0' }}>Bienvenido al panel de control de ROGUE GARAGE</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: '#9aa0ab', margin: 0, fontSize: '1rem', fontWeight: '500' }}>Ingresos Totales</h3>
            <i className="fa-solid fa-sack-dollar" style={{ color: '#d99a3d', fontSize: '1.5rem' }}></i>
          </div>
          <p style={{ color: '#d99a3d', fontSize: '2.5rem', margin: 0, fontWeight: 'bold' }}>{formatMoney(stats.ingresos)}</p>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: '#9aa0ab', margin: 0, fontSize: '1rem', fontWeight: '500' }}>Ventas Registradas</h3>
            <i className="fa-solid fa-receipt" style={{ color: '#4caf50', fontSize: '1.5rem' }}></i>
          </div>
          <p style={{ color: '#fff', fontSize: '2.5rem', margin: 0, fontWeight: 'bold' }}>{stats.ventas}</p>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: '#9aa0ab', margin: 0, fontSize: '1rem', fontWeight: '500' }}>Productos Activos</h3>
            <i className="fa-solid fa-box" style={{ color: '#fff', fontSize: '1.5rem' }}></i>
          </div>
          <p style={{ color: '#fff', fontSize: '2.5rem', margin: 0, fontWeight: 'bold' }}>{stats.productos}</p>
        </div>
      </div>
    </>
  );
}