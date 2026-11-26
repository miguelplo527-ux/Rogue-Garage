import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import StoreLayout from '../../components/layout/StoreLayout';
import OtpModal from '../../components/common/OtpModal';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { ROUTES } from '../../config/routes';
import { ENV } from '../../config/env';
import { isValidPhone, normalizePhone } from '../../utils/validators';

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
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [otp, setOtp] = useState(null); // { email, type: 'email' | 'signup' }
  const [dest, setDest] = useState(null);

  // Redirige cuando la sesión ya está disponible (evita carreras con rutas protegidas)
  useEffect(() => {
    if (user && !otp && (dest || !submitting)) navigate(dest || from || ROUTES.CATALOG, { replace: true });
  }, [user, otp, dest, submitting, from, navigate]);

  // Los clientes siempre van a la tienda; solo el rol admin entra al panel.
  const destinationFor = (profile) => (profile?.role === 'admin' ? ROUTES.ADMIN.DASHBOARD : from || ROUTES.CATALOG);

  const onSubmit = async (e) => {
    e.preventDefault();
    const mail = email.trim();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        const { user: u } = await login(mail, password);
        const profile = await authService.getProfile(u.id).catch(() => null);
        // Los administradores entran solo con su contraseña (sus correos internos no reciben códigos).
        if (ENV.LOGIN_CODE_REQUIRED && profile?.role !== 'admin') {
          // Cliente con contraseña correcta → se exige también el código enviado al correo
          await authService.logout();
          await authService.sendLoginCode(mail);
          setOtp({ email: mail, type: 'email' });
        } else {
          toast.success('Bienvenido a Rogue Garage');
          setDest(destinationFor(profile));
        }
      } else {
        if (!isValidPhone(phone)) {
          toast.error('Escribe un teléfono válido (por ejemplo 3001234567)');
          return;
        }
        const data = await register(mail, password, fullName.trim(), {
          phone: normalizePhone(phone),
          city: city.trim(),
          address: address.trim(),
        });
        if (data.session) {
          toast.success('Cuenta creada. ¡Bienvenido!');
          setDest(from || ROUTES.CATALOG);
        } else {
          setOtp({ email: mail, type: 'signup' });
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(mode === 'login' ? 'Correo o contraseña incorrectos' : err.message || 'No pudimos crear la cuenta');
    } finally {
      setSubmitting(false);
    }
  };

  const verifyCode = async (code) => {
    const data = await authService.verifyCode(otp.email, code, otp.type);
    const profile = data.user ? await authService.getProfile(data.user.id).catch(() => null) : null;
    toast.success(otp.type === 'signup' ? 'Cuenta verificada. ¡Bienvenido!' : 'Bienvenido a Rogue Garage');
    setDest(otp.type === 'signup' ? from || ROUTES.CATALOG : destinationFor(profile));
    setOtp(null);
  };

  const resendCode = () => (otp.type === 'signup' ? authService.resendSignupCode(otp.email) : authService.sendLoginCode(otp.email));

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
            {!isLogin && (
              <>
                <div className="filter-group">
                  <label htmlFor="a-phone">Teléfono / WhatsApp</label>
                  <input id="a-phone" className="field" type="tel" inputMode="tel" autoComplete="tel" required placeholder="3001234567" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="filter-group">
                  <label htmlFor="a-city">Ciudad de envío</label>
                  <input id="a-city" className="field" autoComplete="address-level2" required placeholder="Bogotá" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="filter-group">
                  <label htmlFor="a-address">Dirección de envío</label>
                  <input id="a-address" className="field" autoComplete="street-address" required placeholder="Calle 123 # 45-67, apto 301, barrio" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
              </>
            )}
            <div className="filter-group">
              <label htmlFor="a-pass">Contraseña</label>
              <div className="pass-wrap">
                <input id="a-pass" className="field" type={showPass ? 'text' : 'password'} autoComplete={isLogin ? 'current-password' : 'new-password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPass((s) => !s)}>{showPass ? 'Ocultar' : 'Ver'}</button>
              </div>
              {!isLogin && <small style={{ color: 'var(--muted)' }}>Mínimo 6 caracteres.</small>}
              {isLogin && <Link to={ROUTES.FORGOT} className="forgot-link">¿Olvidaste tu contraseña?</Link>}
            </div>

            {!isLogin && (
              <label className="check consent">
                <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} required />
                <span>Acepto la <Link to={ROUTES.PRIVACY} target="_blank">política de privacidad y tratamiento de datos</Link>.</span>
              </label>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting || (!isLogin && !accepted)}>
              {submitting ? 'Un momento...' : isLogin ? 'Ingresar' : 'Crear cuenta'}
            </button>
          </form>

          <div className="auth-foot"><Link to={ROUTES.HOME}>Volver a la tienda</Link></div>
        </div>
      </div>

      {otp && (
        <OtpModal
          email={otp.email}
          title={otp.type === 'signup' ? 'Confirma tu cuenta' : 'Verificación de acceso'}
          onVerify={verifyCode}
          onResend={resendCode}
          onClose={() => setOtp(null)}
        />
      )}
    </StoreLayout>
  );
}