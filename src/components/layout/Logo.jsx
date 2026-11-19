import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';

export default function Logo() {
  return (
    <Link to={ROUTES.HOME} className="brand" aria-label="Rogue Garage, ir al inicio">
      <span className="brand-mark" aria-hidden="true"><span>RG</span></span>
      <span className="brand-text">
        <strong>ROGUE GARAGE</strong>
        <small>BODYKITS DE LUJO</small>
      </span>
    </Link>
  );
}
