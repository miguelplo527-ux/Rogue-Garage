# Verificación por código (gratis) y recuperación de contraseña

La web usa el **correo electrónico** de Supabase Auth, que es gratis. No necesitas SMS ni pagar nada.

## 1. Activar la confirmación de correo
Supabase → **Authentication → Providers → Email**:
- **Enable Email provider**: activado
- **Confirm email**: activado (así las cuentas nuevas deben verificar el código)

## 2. Que el correo traiga un CÓDIGO (no un enlace)
Supabase → **Authentication → Email Templates**. Edita estas dos plantillas y pon el código con `{{ .Token }}`:

**Confirm signup** (código al crear la cuenta)
```html
<h2>Confirma tu cuenta en Rogue Garage</h2>
<p>Tu código de verificación es:</p>
<h1 style="letter-spacing:6px">{{ .Token }}</h1>
<p>Si no fuiste tú, ignora este mensaje.</p>
```

**Magic Link** (código al iniciar sesión)
```html
<h2>Código para entrar a Rogue Garage</h2>
<p>Tu código de acceso es:</p>
<h1 style="letter-spacing:6px">{{ .Token }}</h1>
<p>Si no fuiste tú, ignora este mensaje.</p>
```

La plantilla **Reset Password** déjala como viene (envía un enlace seguro).

## 3. URLs permitidas (necesario para recuperar contraseña)
**Authentication → URL Configuration**
- **Site URL**: la URL de tu web (p. ej. `https://tu-sitio.vercel.app`)
- **Redirect URLs**: agrega `https://tu-sitio.vercel.app/restablecer` y `http://localhost:5173/restablecer`

## 4. Límite de correos (importante)
El servicio de correo por defecto de Supabase envía muy pocos mensajes por hora; sirve para probar, no para producción. Conecta un SMTP gratuito en **Authentication → SMTP Settings** (por ejemplo Brevo o Resend tienen planes gratis).

## 5. Sobre el código al iniciar sesión
El paso del código al hacer login es una verificación en la interfaz: se comprueba la contraseña y luego se exige el código del correo. Si quieres desactivarlo (por ejemplo mientras pruebas por el límite de correos), pon `VITE_REQUIRE_LOGIN_CODE=false` en tu `.env`. Para protección reforzada del panel admin, Supabase ofrece MFA con app autenticadora (TOTP), también gratis.
