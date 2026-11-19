import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import StoreLayout from '../../components/layout/StoreLayout';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { ROUTES } from '../../config/routes';

export default function LoginPage({ initialMode = 'login' }) {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : null;

  const [mode, setMode] = useState(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dest, setDest] = useState(null);

  // Redirige cuando la sesión ya está disponible (evita carreras con rutas protegidas)
  useEffect(() => {
    if (user && (dest || !submitting)) navigate(dest || from || ROUTES.CATALOG, { replace: true });
  }, [user, dest, submitting, from, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        const { user: u } = await login(email.trim(), password);
        const profile = await authService.getProfile(u.id).catch(() => null);
        toast.success('Bienvenido a Rogue Garage');
        setDest(profile?.role === 'admin' ? ROUTES.ADMIN.DASHBOARD : from || ROUTES.CATALOG);
      } else {
        const data = await register(email.trim(), password, fullName.trim());
        if (data.session) {
          toast.success('Cuenta creada. ¡Bienvenido!');
          setDest(from || ROUTES.CATALOG);
        } else {
          toast.success('Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.');
          setMode('login');
          setPassword('');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(mode === 'login' ? 'Correo o contraseña incorrectos' : err.message || 'No pudimos crear la cuenta');
    } finally {
      setSubmitting(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <StoreLayout floating={false}>
      <div className="auth-wrap">
        <div className="auth-card">
          <h1>{isLogin ? 'Inicia sesión' : 'Crea tu cuenta'}</h1>
          <p>
            {from === ROUTES.CART
              ? 'Necesitas una cuenta para usar tu carrito.'
              : isLogin
                ? 'Accede para guardar tu carrito y hacer tus pedidos.'
                : 'Es gratis y te toma menos de un minuto.'}
          </p>

          <div className="tabs" role="tablist">
            <button type="button" role="tab" aria-selected={isLogin} className={isLogin ? 'active' : ''} onClick={() => setMode('login')}>Ingresar</button>
            <button type="button" role="tab" aria-selected={!isLogin} className={!isLogin ? 'active' : ''} onClick={() => setMode('register')}>Crear cuenta</button>
          </div>

          <form className="auth-form" onSubmit={onSubmit}>
            {!isLogin && (
              <div className="filter-group">
                <label htmlFor="a-name">Nombre completo</label>
                <input id="a-name" className="field" autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
            )}
            <div className="filter-group">
              <label htmlFor="a-email">Correo electrónico</label>
              <input id="a-email" className="field" type="email" autoComplete="email" required placeholder="tucorreo@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="filter-group">
              <label htmlFor="a-pass">Contraseña</label>
              <div className="pass-wrap">
                <input id="a-pass" className="field" type={showPass ? 'text' : 'password'} autoComplete={isLogin ? 'current-password' : 'new-password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPass((s) => !s)}>{showPass ? 'Ocultar' : 'Ver'}</button>
              </div>
              {!isLogin && <small style={{ color: 'var(--muted)' }}>Mínimo 6 caracteres.</small>}
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Un momento...' : isLogin ? 'Ingresar' : 'Crear cuenta'}
            </button>
          </form>

          <div className="auth-foot"><Link to={ROUTES.HOME}>Volver a la tienda</Link></div>
        </div>
      </div>
    </StoreLayout>
  );
}
