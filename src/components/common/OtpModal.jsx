import { useEffect, useRef, useState } from 'react';

const maskEmail = (email = '') => {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  return `${user.slice(0, 2)}${'•'.repeat(Math.max(user.length - 2, 2))}@${domain}`;
};

/**
 * Modal de verificación: avisa que se envió un código al correo y permite ingresarlo.
 * props: email, title, onVerify(code) -> Promise, onResend() -> Promise, onClose()
 */
export default function OtpModal({ email, title = 'Verifica tu correo', onVerify, onResend, onClose }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [info, setInfo] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onVerify(code.replace(/\s/g, ''));
    } catch {
      setError('El código no es válido o ya venció. Revísalo o solicita uno nuevo.');
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setError('');
    setInfo('');
    try {
      await onResend();
      setCooldown(60);
      setInfo('Te enviamos un código nuevo.');
    } catch {
      setError('No pudimos reenviar el código. Espera un momento e inténtalo de nuevo.');
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="otp-title">
        <div className="modal-icon" aria-hidden="true"><i className="fa-solid fa-envelope-circle-check" /></div>
        <h2 id="otp-title">{title}</h2>
        <p className="modal-lead">
          <strong>Se le ha enviado un código</strong> de verificación a <strong>{maskEmail(email)}</strong>.
          Revisa tu bandeja de entrada (y la carpeta de spam) e ingrésalo aquí.
        </p>
        <form onSubmit={submit} className="auth-form">
          <input
            ref={inputRef}
            className="field otp-input"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,9}"
            maxLength={9}
            placeholder="000000"
            aria-label="Código de verificación"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9 ]/g, ''))}
            required
          />
          {error && <p className="form-error" role="alert">{error}</p>}
          {info && <p className="form-info" role="status">{info}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy || code.replace(/\s/g, '').length < 6}>
            {busy ? 'Verificando...' : 'Verificar código'}
          </button>
        </form>
        <div className="modal-actions">
          <button type="button" className="link-btn" onClick={resend} disabled={cooldown > 0}>
            {cooldown > 0 ? `Reenviar código en ${cooldown}s` : 'Reenviar código'}
          </button>
          <button type="button" className="link-btn" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
