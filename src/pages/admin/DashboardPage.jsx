import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient'; 
import { formatMoney } from '../../utils/formatters';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';

export default function DashboardPage() {
  const [stats, setStats] = useState({ ventas: 0, ingresos: 0, productos: 0, stockBajo: [] });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // 1. Totales generales
        const { data: p } = await supabase.from('products').select('id, stock, name').eq('is_active', true);
        const { data: s } = await supabase.from('sales').select('total, date').eq('status', 'completada');
        
        // 2. Productos con stock bajo
        const bajos = p?.filter(prod => prod.stock <= 3) || [];

        // 3. Datos para la gráfica (últimos 7 días)
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return { 
            date: d.toISOString().split('T')[0], 
            name: d.toLocaleDateString('es-CO', { weekday: 'short' }),
            total: 0 
          };
        }).reverse();

        s?.forEach(sale => {
          const saleDate = sale.date.split('T')[0];
          const day = last7Days.find(d => d.date === saleDate);
          if (day) day.total += Number(sale.total);
        });

        setChartData(last7Days);
        setStats({ 
          productos: p?.length || 0, 
          ventas: s?.length || 0, 
          ingresos: s?.reduce((a, b) => a + Number(b.total), 0) || 0,
          stockBajo: bajos
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cardStyle = {
    background: '#14171d', padding: '1.5rem', borderRadius: '10px', 
    border: '1px solid #262b34', boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
  };

  if (loading) return <div style={{color: '#fff', padding: '2rem'}}>Cargando dashboard...</div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '2rem', margin: 0 }}>Resumen General</h1>
          <p style={{ color: '#9aa0ab', margin: '0.5rem 0 0 0' }}>Monitoreo en tiempo real de ROGUE GARAGE</p>
        </div>
      </div>

      {/* TARJETAS DE RESUMEN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: '#9aa0ab', margin: 0, fontSize: '0.9rem' }}>Ingresos Totales</h3>
            <i className="fa-solid fa-sack-dollar" style={{ color: '#3b82f6', fontSize: '1.5rem' }}></i>
          </div>
          <p style={{ color: '#3b82f6', fontSize: '2rem', margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>{formatMoney(stats.ingresos)}</p>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: '#9aa0ab', margin: 0, fontSize: '0.9rem' }}>Ventas Registradas</h3>
            <i className="fa-solid fa-receipt" style={{ color: '#4caf50', fontSize: '1.5rem' }}></i>
          </div>
          <p style={{ color: '#fff', fontSize: '2rem', margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>{stats.ventas}</p>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: '#9aa0ab', margin: 0, fontSize: '0.9rem' }}>Productos Activos</h3>
            <i className="fa-solid fa-box" style={{ color: '#fff', fontSize: '1.5rem' }}></i>
          </div>
          <p style={{ color: '#fff', fontSize: '2rem', margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>{stats.productos}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* GRÁFICA DE VENTAS */}
        <div style={cardStyle}>
          <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Ventas de los últimos 7 días</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#9aa0ab" />
                <YAxis stroke="#9aa0ab" tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ background: '#0b0d10', border: '1px solid #3b82f6', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => [formatMoney(value), 'Ingresos']}
                />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ALERTAS DE STOCK */}
        <div style={cardStyle}>
          <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ color: '#e5484d', marginRight: '8px' }}></i>
            Alertas de Stock Bajo
          </h3>
          {stats.stockBajo.length === 0 ? (
            <p style={{ color: '#4caf50', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>Todo el inventario está saludable.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stats.stockBajo.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#0b0d10', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #e5484d' }}>
                  <span style={{ color: '#fff', fontSize: '0.85rem' }}>{p.name}</span>
                  <span style={{ color: '#e5484d', fontWeight: 'bold', fontSize: '0.85rem' }}>{p.stock} unds</span>
                </div>
              ))}
            </div>
          )}
          <Link to={ROUTES.ADMIN.PURCHASES} style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem', background: '#262b34', color: '#fff', textDecoration: 'none', padding: '10px', borderRadius: '6px', fontSize: '0.9rem' }}>
            Ir a Compras para Reponer
          </Link>
        </div>
      </div>
    </>
  );
}