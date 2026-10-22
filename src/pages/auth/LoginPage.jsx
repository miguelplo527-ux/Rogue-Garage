import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import './login.css';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Bienvenido');
      // Forzamos la recarga completa de la página para que los permisos se actualicen bien
      window.location.href = '/admin'; 
    } catch (err) {
      toast.error('Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-body">
      <div className="login-card">
        <div className="login-header">
          <img src="/images/logo.svg" alt="ROGUE GARAGE" className="login-logo" />
          <h1>ROGUE GARAGE</h1>
          <p>Panel de control administrativo</p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Usuario</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="password-field">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="toggle-password">
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary btn-block" disabled={loading}>
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>

        <div className="login-footer">
          <a href="/">← Volver a la tienda</a>
        </div>
      </div>
    </div>
  );
}