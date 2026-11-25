import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import StoreLayout from '../../components/layout/StoreLayout';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { ROUTES } from '../../config/routes';

// Se llega aquí desde el enlace del correo: Supabase abre una sesión temporal de recuperación.
export default function ResetPasswordPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Las contraseñas no coinciden');
    setBusy(true);
    try {
      await authService.updatePassword(password);
      await authService.logout();
      toast.success('Contraseña actualizada. Ya puedes iniciar sesión.');
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error('No pudimos actualizar la contraseña. Pide un enlace nuevo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <StoreLayout floating={false}>
      <div className="auth-wrap">
        <div className="auth-card">
          <h1>Nueva contraseña</h1>
          {loading ? (
            <p>Verificando enlace...</p>
          ) : !user ? (
            <>
              <p>Este enlace no es válido o ya venció. Pide uno nuevo para continuar.</p>
              <Link to={ROUTES.FORGOT} className="btn btn-primary btn-block">Pedir enlace nuevo</Link>
            </>
          ) : (
            <>
              <p>Elige una contraseña nueva para tu cuenta.</p>
              <form className="auth-form" onSubmit={onSubmit}>
                <div className="filter-group">
                  <label htmlFor="r-pass">Contraseña nueva</label>
                  <input id="r-pass" className="field" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="filter-group">
                  <label htmlFor="r-pass2">Repite la contraseña</label>
                  <input id="r-pass2" className="field" type="password" autoComplete="new-password" minLength={6} required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Guardando...' : 'Guardar contraseña'}</button>
              </form>
            </>
          )}
        </div>
      </div>
    </StoreLayout>
  );
}
