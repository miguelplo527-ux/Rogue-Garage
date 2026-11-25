import { Navigate } from 'react-router-dom';
import { ROUTES } from '../../config/routes';

// El contacto vive en "Sobre nosotros" y en el botón de WhatsApp.
export default function ContactPage() {
  return <Navigate to={ROUTES.ABOUT} replace />;
}
