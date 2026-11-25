import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import StoreLayout from '../../components/layout/StoreLayout';
import { authService } from '../../services/authService';
import { ROUTES } from '../../config/routes';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authService.requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      console.error(err);
      toast.error('No pudimos enviar el correo. Inténtalo de nuevo en unos minutos.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <StoreLayout floating={false}>
      <div className="auth-wrap">
        <div className="auth-card">
          <h1>Recupera tu contraseña</h1>
          {sent ? (
            <>
              <p>Si el correo está registrado, te enviamos un enlace para crear una contraseña nueva. Revisa también la carpeta de spam.</p>
              <Link to={ROUTES.LOGIN} className="btn btn-primary btn-block">Volver a iniciar sesión</Link>
            </>
          ) : (
            <>
              <p>Escribe el correo de tu cuenta y te enviaremos un enlace para restablecerla.</p>
              <form className="auth-form" onSubmit={onSubmit}>
                <div className="filter-group">
                  <label htmlFor="f-email">Correo electrónico</label>
                  <input id="f-email" className="field" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Enviando...' : 'Enviar enlace'}</button>
              </form>
              <div className="auth-foot"><Link to={ROUTES.LOGIN}>Volver a iniciar sesión</Link></div>
            </>
          )}
        </div>
      </div>
    </StoreLayout>
  );
}
