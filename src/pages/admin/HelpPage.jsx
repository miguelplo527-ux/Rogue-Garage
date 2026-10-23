import { useState } from 'react';

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState('inicio');

  const TabButton = ({ id, label, icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem 1.5rem', width: '100%',
        background: activeTab === id ? 'rgba(217, 154, 61, 0.1)' : 'transparent',
        color: activeTab === id ? '#d99a3d' : '#9aa0ab',
        border: 'none', borderLeft: activeTab === id ? '3px solid #d99a3d' : '3px solid transparent',
        cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === id ? 'bold' : 'normal',
        fontSize: '1rem', transition: 'all 0.2s'
      }}
    >
      <i className={icon}></i> {label}
    </button>
  );

  const Card = ({ title, children, icon }) => (
    <div style={{ background: '#14171d', padding: '2rem', borderRadius: '10px', border: '1px solid #262b34', marginBottom: '1.5rem' }}>
      <h3 style={{ color: '#fff', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #262b34', paddingBottom: '1rem' }}>
        <i className={icon} style={{ color: '#d99a3d' }}></i> {title}
      </h3>
      <div style={{ color: '#9aa0ab', lineHeight: '1.6', marginTop: '1rem' }}>
        {children}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#fff', fontSize: '2rem', margin: 0 }}>Centro de Ayuda</h1>
        <p style={{ color: '#9aa0ab', margin: '0.5rem 0 0 0' }}>Guía paso a paso para el manejo del sistema ROGUE GARAGE</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
        {/* Menú Lateral de Ayuda */}
        <div style={{ background: '#14171d', borderRadius: '10px', border: '1px solid #262b34', overflow: 'hidden', height: 'fit-content' }}>
          <TabButton id="inicio" label="Inicio y Login" icon="fa-solid fa-house" />
          <TabButton id="productos" label="Crear Productos" icon="fa-solid fa-box" />
          <TabButton id="ventas" label="Realizar Ventas" icon="fa-solid fa-cash-register" />
          <TabButton id="compras" label="Compras y Stock" icon="fa-solid fa-truck" />
          <TabButton id="finanzas" label="Revisar Finanzas" icon="fa-solid fa-coins" />
        </div>

        {/* Contenido de la Ayuda */}
        <div>
          {activeTab === 'inicio' && (
            <Card title="Cómo ingresar al sistema" icon="fa-solid fa-house">
              <p><strong>1. Acceso:</strong> Abre el navegador y ve a la página de la tienda. En la esquina inferior o en la URL, agrega <code>/login</code>.</p>
              <p><strong>2. Credenciales:</strong> Ingresa el correo y la contraseña que el administrador te asignó.</p>
              <p><strong>3. Panel:</strong> Una vez dentro, verás el menú de la izquierda. Tu rol determinará a qué secciones tienes acceso.</p>
            </Card>
          )}

          {activeTab === 'productos' && (
            <Card title="Cómo registrar un producto nuevo" icon="fa-solid fa-box">
              <p>Ve a la pestaña <strong>Productos</strong> y haz clic en el botón amarillo <strong>"+ Nuevo Producto"</strong>.</p>
              <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
                <li><strong>SKU:</strong> Es el código único del producto. Te sugerimos usar el formato: <code>TIPO-MARCA-CATEGORIA-NUMERO</code> (Ej: <code>RE-YAM-FRE-001</code>).</li>
                <li><strong>Costo:</strong> Cuánto te costó a ti comprarlo (para calcular ganancias).</li>
                <li><strong>Precio Venta:</strong> Cuánto le cobras al cliente.</li>
                <li><strong>Imagen:</strong> Sube una foto clara del producto desde tu celular o PC.</li>
                <li><strong>Stock:</strong> Cuántas unidades tienes físicamente en la tienda.</li>
              </ul>
              <p style={{ marginTop: '1rem', color: '#d99a3d' }}><strong>Tip:</strong> Si el producto no tiene imagen, aparecerá un cuadro gris por defecto.</p>
            </Card>
          )}

          {activeTab === 'ventas' && (
            <Card title="Cómo hacer una venta" icon="fa-solid fa-cash-register">
              <p>Ve a la pestaña <strong>Ventas</strong>. Este es tu Punto de Venta (POS).</p>
              <ol style={{ paddingLeft: '1.5rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Usa el buscador para encontrar el producto por su nombre o SKU.</li>
                <li>Haz clic sobre el producto para agregarlo al carrito (puedes sumar más de uno).</li>
                <li>Selecciona el método de pago (Efectivo, Nequi, Tarjeta).</li>
                <li>Haz clic en <strong>"Confirmar Venta"</strong>.</li>
              </ol>
              <p style={{ marginTop: '1rem', color: '#4caf50' }}><strong>¡Automático!</strong> El sistema restará la unidad del inventario y sumará el dinero a tus finanzas.</p>
            </Card>
          )}

          {activeTab === 'compras' && (
            <Card title="Cómo ingresar mercancía nueva" icon="fa-solid fa-truck">
              <p>Cuando llegue un pedido de tu proveedor, ve a la pestaña <strong>Compras</strong>.</p>
              <ol style={{ paddingLeft: '1.5rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Selecciona el producto al que le vas a sumar stock.</li>
                <li>Escribe la cantidad que llegó (Ej: 10 unidades).</li>
                <li>Escribe el costo unitario de esta nueva compra.</li>
                <li>Haz clic en <strong>"Registrar Compra"</strong>.</li>
              </ol>
              <p style={{ marginTop: '1rem' }}>El stock del producto aumentará automáticamente en la sección de Inventario.</p>
            </Card>
          )}

          {activeTab === 'finanzas' && (
            <Card title="Cómo revisar las ganancias" icon="fa-solid fa-coins">
              <p>Ve a la pestaña <strong>Finanzas</strong> para ver un resumen del negocio.</p>
              <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Ingresos Totales:</strong> Todo el dinero que ha entrado por ventas.</li>
                <li><strong>Costo de Mercancía:</strong> Cuánto te costó a ti comprar lo que ya se vendió.</li>
                <li><strong>Ganancia Neta:</strong> La resta de los dos anteriores. <em>Este es el dinero real que has ganado.</em></li>
              </ul>
              <p style={{ marginTop: '1rem', color: '#e5484d' }}><strong>Nota:</strong> Esta ganancia no descuenta gastos operativos (arriendo, luz, sueldos).</p>
            </Card>
          )}
          "Acceso al sistema: Para ingresar al panel administrativo, presiona ALT + M en la página de inicio y aparecerá el Login."
        </div>
      </div>
    </div>
  );
}