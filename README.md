# Rogue Garage

Tienda web de bodykits y accesorios para vehículos de lujo, especialmente camionetas como la Toyota TXL.
Stack: React + Vite + Supabase.

## Puesta en marcha
```bash
npm install
cp .env.example .env   # completa las variables de Supabase y WhatsApp
npm run dev
```

## Qué incluye
- **Tienda pública:** Inicio, Catálogo (con filtros), Detalle de producto, Sobre nosotros y Login / Crear cuenta.
- **Carrito:** solo para usuarios con sesión iniciada. Se guarda por usuario y el pedido se envía por WhatsApp.
- **Panel admin:** `/admin` (solo rol `admin` en la tabla `profiles`).

## Variables de entorno
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_WHATSAPP_NUMBER`, `VITE_INSTAGRAM_URL` (opcional).

## Configuración de Supabase (en este orden)
1. Ejecuta `docs/SUPABASE_SETUP.sql` en el SQL Editor (roles, modelos frecuentes, fotos de clientes, eliminar cuenta).
2. Sigue `docs/SUPABASE_VERIFICACION.md` (código por correo, URLs y SMTP gratuito).
3. Ejecuta también `docs/MIGRACION_CATEGORIAS.sql`.

## Antes de publicar
1. Ejecuta `docs/MIGRACION_CATEGORIAS.sql` en Supabase para crear las nuevas categorías.
2. Desactiva o actualiza los productos antiguos de motos.
3. Revisa y completa la política de privacidad (`src/pages/public/PrivacyPage.jsx`) con un abogado.
4. Sube fotos reales de producto; la ilustración de camioneta es solo un marcador de posición.
