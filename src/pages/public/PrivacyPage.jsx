import { Link } from 'react-router-dom';
import StoreLayout from '../../components/layout/StoreLayout';
import { ENV } from '../../config/env';
import { ROUTES } from '../../config/routes';

// Texto base conforme a la Ley 1581 de 2012 y sus decretos reglamentarios (Colombia).
// Revísalo con un abogado y completa los datos del responsable antes de publicar.
export default function PrivacyPage() {
  const wa = `https://wa.me/${ENV.WHATSAPP_NUMBER}`;
  return (
    <StoreLayout floating={false}>
      <div className="container legal">
        <div className="page-title">
          <h1>Política de privacidad y tratamiento de datos personales</h1>
          <p>Última actualización: noviembre de 2026</p>
        </div>

        <div className="prose legal-body">
          <h2>1. Responsable del tratamiento</h2>
          <p>
            Rogue Garage, con domicilio en Bogotá, Colombia, es responsable del tratamiento de tus datos personales.
            Puedes contactarnos por <a href={wa} target="_blank" rel="noreferrer">WhatsApp</a>
            {ENV.CONTACT_EMAIL && <> o al correo <a href={`mailto:${ENV.CONTACT_EMAIL}`}>{ENV.CONTACT_EMAIL}</a></>}.
          </p>

          <h2>2. Datos que recolectamos</h2>
          <p>Nombre, correo electrónico y contraseña (almacenada de forma cifrada), los productos de tu carrito y los pedidos que nos envías.</p>

          <h2>3. Para qué los usamos</h2>
          <p>
            Crear y administrar tu cuenta, verificar tu identidad con códigos enviados al correo, guardar tu carrito,
            atender tus pedidos y consultas por WhatsApp, y comunicarnos contigo sobre tu compra.
            No vendemos tus datos a terceros.
          </p>

          <h2>4. Autorización</h2>
          <p>Al crear tu cuenta y marcar la casilla de aceptación, nos autorizas de manera previa, expresa e informada a tratar tus datos para las finalidades descritas.</p>

          <h2>5. Tus derechos</h2>
          <p>Como titular puedes conocer, actualizar y rectificar tus datos; solicitar prueba de la autorización; ser informado del uso que les damos; revocar la autorización y solicitar la supresión de tus datos; y presentar quejas ante la Superintendencia de Industria y Comercio (SIC).</p>

          <h2>6. Eliminación de tu cuenta</h2>
          <p>
            Puedes eliminar tu cuenta cuando quieras desde <Link to={ROUTES.ACCOUNT}>Mi cuenta</Link>.
            Al hacerlo se borran de forma permanente tu cuenta, tu perfil y tu carrito.
            También puedes pedirlo por los canales de contacto.
          </p>

          <h2>7. Proveedores y transferencia de datos</h2>
          <p>
            Usamos Supabase como proveedor de infraestructura (autenticación, base de datos y almacenamiento) y WhatsApp
            cuando decides enviar un pedido. Estos proveedores pueden procesar datos en servidores fuera de Colombia,
            bajo medidas de seguridad adecuadas.
          </p>

          <h2>8. Seguridad</h2>
          <p>Aplicamos medidas técnicas para proteger tus datos, como cifrado de contraseñas, verificación por código y control de acceso por roles.</p>

          <h2>9. Menores de edad</h2>
          <p>Este sitio no está dirigido a menores de 18 años. Si crees que un menor nos dio sus datos, escríbenos y los eliminaremos.</p>

          <h2>10. Vigencia y cambios</h2>
          <p>Conservamos tus datos mientras tengas una cuenta activa. Si cambiamos esta política, publicaremos la nueva versión en esta página.</p>
        </div>
      </div>
    </StoreLayout>
  );
}
