import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import StoreLayout from '../../components/layout/StoreLayout';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { ROUTES } from '../../config/routes';
import { isValidPhone, normalizePhone } from '../../utils/validators';

const CONFIRM_WORD = 'ELIMINAR';

export default function AccountPage() {
  const { user, profile, refreshProfile, displayName, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPhone(profile?.phone || '');
    setCity(profile?.shipping_city || '');
    setAddress(profile?.shipping_address || '');
  }, [profile]);

  const saveShipping = async (e) => {
    e.preventDefault();
    if (!isValidPhone(phone)) return toast.error('Escribe un teléfono válido (por ejemplo 3001234567)');
    setSaving(true);
    try {
      await authService.updateShipping(user.id, {
        phone: normalizePhone(phone),
        city: city.trim(),
        address: address.trim(),
      });
      await refreshProfile();
      toast.success('Datos de envío guardados');
    } catch (err) {
      console.error(err);
      toast.error('No pudimos guardar tus datos. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authService.deleteMyAccount();
      try { localStorage.removeItem(`rogue_cart_${user.id}`); } catch { /* sin almacenamiento */ }
      await logout();
      toast.success('Tu cuenta y tus datos fueron eliminados');
      navigate(ROUTES.HOME, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(isAdmin ? 'Las cuentas de administrador no se eliminan desde la web.' : 'No pudimos eliminar la cuenta. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <StoreLayout floating={false}>
      <div className="container">
        <div className="page-title">
          <h1>Mi cuenta</h1>
          <p>Hola, {displayName}.</p>
        </div>

        <div className="account-grid">
          <section className="panel">
            <h2>Tus datos</h2>
            <dl className="data-list">
              <div><dt>Nombre</dt><dd>{displayName}</dd></div>
              <div><dt>Correo</dt><dd>{user?.email}</dd></div>
            </dl>
            <p className="panel-note">
              Tratamos tus datos según nuestra <Link to={ROUTES.PRIVACY}>política de privacidad</Link>.
            </p>
          </section>

          <section className="panel">
            <h2>Datos de envío</h2>
            <p>Usamos estos datos para entregarte tus pedidos y contactarte.</p>
            <form className="auth-form" onSubmit={saveShipping}>
              <div className="filter-group">
                <label htmlFor="acc-phone">Teléfono / WhatsApp</label>
                <input id="acc-phone" className="field" type="tel" inputMode="tel" autoComplete="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="filter-group">
                <label htmlFor="acc-city">Ciudad</label>
                <input id="acc-city" className="field" autoComplete="address-level2" required value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="filter-group">
                <label htmlFor="acc-address">Dirección</label>
                <input id="acc-address" className="field" autoComplete="street-address" required value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar datos de envío'}</button>
            </form>
          </section>

          <section className="panel danger-zone">
            <h2>Eliminar mi cuenta</h2>
            <p>
              Se borrarán de forma permanente tu cuenta, tu perfil y tu carrito. Esta acción no se puede deshacer.
            </p>
            {isAdmin ? (
              <p className="form-info">Las cuentas de administrador no se pueden eliminar desde la web.</p>
            ) : (
              <form className="auth-form" onSubmit={deleteAccount}>
                <div className="filter-group">
                  <label htmlFor="del">Escribe <strong>{CONFIRM_WORD}</strong> para confirmar</label>
                  <input id="del" className="field" autoComplete="off" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-danger" disabled={busy || confirm.trim().toUpperCase() !== CONFIRM_WORD}>
                  {busy ? 'Eliminando...' : 'Eliminar mi cuenta definitivamente'}
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </StoreLayout>
  );
}