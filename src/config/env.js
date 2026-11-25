export const ENV = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  WHATSAPP_NUMBER: import.meta.env.VITE_WHATSAPP_NUMBER || '573000000000',
  INSTAGRAM_URL: import.meta.env.VITE_INSTAGRAM_URL || '',
  CONTACT_EMAIL: import.meta.env.VITE_CONTACT_EMAIL || '',
  // Código por correo al iniciar sesión (se puede apagar con VITE_REQUIRE_LOGIN_CODE=false)
  LOGIN_CODE_REQUIRED: import.meta.env.VITE_REQUIRE_LOGIN_CODE !== 'false',
};
