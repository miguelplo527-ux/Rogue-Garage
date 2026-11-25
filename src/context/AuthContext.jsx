import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { authService } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Revisar si ya hay una sesión activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Escuchar cambios en la autenticación
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadProfile(userId) {
    // maybeSingle() evita errores si el perfil aún no existe (clientes nuevos)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) console.error('Error cargando el perfil:', error);

    setProfile(data);
    setLoading(false);
  }

  async function login(email, password) {
    return authService.login(email, password); // devuelve { user, session }
  }

  async function register(email, password, fullName) {
    return authService.register(email, password, fullName);
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  const isAdmin = profile?.role === 'admin';

  // Nunca mostramos el correo como nombre: si no hay nombre real, usamos "Mi cuenta".
  const cleanName = (v) => (v && !String(v).includes('@') ? String(v).trim() : '');
  const realName = cleanName(profile?.full_name) || cleanName(user?.user_metadata?.full_name);
  const displayName = realName || 'Mi cuenta';
  const firstName = realName ? realName.split(/\s+/)[0] : '';

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, isAdmin, displayName, firstName }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
