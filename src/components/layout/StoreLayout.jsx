import Navbar from './Navbar';
import Footer from './Footer';
import { ENV } from '../../config/env';

export default function StoreLayout({ children, floating = true }) {
  const wa = `https://wa.me/${ENV.WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola Rogue Garage, quiero asesoría para mi camioneta.')}`;
  return (
    <div className="page">
      <Navbar />
      <main>{children}</main>
      <Footer />
      {floating && (
        <a className="float-wa" href={wa} target="_blank" rel="noreferrer" aria-label="Escribir por WhatsApp">
          <i className="fa-brands fa-whatsapp" />
        </a>
      )}
    </div>
  );
}
