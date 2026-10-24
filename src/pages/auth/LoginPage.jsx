import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth(); 
  const navigate = useNavigate();
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    try { 
      await login(email, password); 
      toast.success('Bienvenido a ROGUE GARAGE'); 
      window.location.href = '/admin'; 
    }
    catch (err) { 
      console.error(err);
      toast.error('Correo o contraseña incorrectos'); 
    }
    finally { 
      setLoading(false); 
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0b0d10 0%, #1a1f2e 100%)', padding: '1rem' }}>
      <div style={{ background: '#14171d', padding: '3rem', borderRadius: '16px', width: '100%', maxWidth: '420px', border: '1px solid #262b34', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <img src="/images/Logo ROGUE.png" alt="ROGUE GARAGE" style={{ height: '70px', objectFit: 'contain', marginBottom: '1.5rem' }} />
          <h2 style={{ color: '#fff', margin: 0, fontSize: '1.6rem', fontWeight: 'bold' }}>Acceso Administrativo</h2>
          <p style={{ color: '#9aa0ab', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>Ingresa tus credenciales para gestionar el negocio</p>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ color: '#d1d5db', fontSize: '0.85rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="admin@roguegarage.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '0.9rem 1rem', background: '#0b0d10', border: '1px solid #333', color: '#fff', borderRadius: '8px', outline: 'none', transition: 'border 0.2s' }} 
            />
          </div>

          <div>
            <label style={{ color: '#d1d5db', fontSize: '0.85rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPass ? 'text' : 'password'} 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '0.9rem 1rem', background: '#0b0d10', border: '1px solid #333', color: '#fff', borderRadius: '8px', outline: 'none', paddingRight: '50px' }} 
              />
              <button 
                type="button" 
                onClick={() => setShowPass(!showPass)} 
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9aa0ab', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                {showPass ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{ width: '100%', padding: '1rem', background: loading ? '#555' : '#3b82f6', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem', fontSize: '1rem', transition: 'background 0.2s, transform 0.1s' }}
          >
            {loading ? 'Verificando...' : 'Ingresar al Panel'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid #262b34', paddingTop: '1.5rem' }}>
          <a href="/" style={{ color: '#9aa0ab', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            ← Volver a la tienda
          </a>
        </div>

      </div>
    </div>
  );
}