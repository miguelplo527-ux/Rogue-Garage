import { Link } from 'react-router-dom';
import { ENV } from '../../config/env';
import { ROUTES } from '../../config/routes';

export default function Footer() {
  const wa = `https://wa.me/${ENV.WHATSAPP_NUMBER}`;
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h4>Rogue Garage</h4>
          <p>Body kits, tuning y accesorios de lujo para camionetas y SUV premium como la Toyota TXL. Atención personalizada desde Bogotá.</p>
        </div>
        <div>
          <h4>Navegación</h4>
          <ul>
            <li><Link to={ROUTES.HOME}>Inicio</Link></li>
            <li><Link to={ROUTES.CATALOG}>Catálogo</Link></li>
            <li><Link to={ROUTES.ABOUT}>Sobre nosotros</Link></li>
            <li><Link to={ROUTES.LOGIN}>Login</Link></li>
            <li><Link to={ROUTES.PRIVACY}>Privacidad y datos</Link></li>
          </ul>
        </div>
        <div>
          <h4>Contacto</h4>
          <ul>
            <li><a href={wa} target="_blank" rel="noreferrer"><i className="fa-brands fa-whatsapp" /> WhatsApp</a></li>
            {ENV.INSTAGRAM_URL && <li><a href={ENV.INSTAGRAM_URL} target="_blank" rel="noreferrer"><i className="fa-brands fa-instagram" /> Instagram</a></li>}
            <li><i className="fa-solid fa-location-dot" /> Bogotá, Colombia</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} Rogue Garage. Todos los derechos reservados.</div>
    </footer>
  );
}
