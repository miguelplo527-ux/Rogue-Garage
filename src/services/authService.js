import { supabase } from './supabaseClient';

export const authService = {
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  async register(email, password, fullName) {
    // Nunca enviamos el rol: lo asigna la base de datos ('cliente').
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return data;
  },
  /** Envía un código de un solo uso al correo (cuenta existente). */
  async sendLoginCode(email) {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    if (error) throw error;
  },
  /** type: 'email' (login) | 'signup' (confirmar cuenta nueva) */
  async verifyCode(email, token, type) {
    const { data, error } = await supabase.auth.verifyOtp({ email, token: token.trim(), type });
    if (error) throw error;
    return data;
  },
  async resendSignupCode(email) {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  },
  async requestPasswordReset(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/restablecer`,
    });
    if (error) throw error;
  },
  async updatePassword(password) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },
  async deleteMyAccount() {
    const { error } = await supabase.rpc('delete_my_account');
    if (error) throw error;
  },
  async logout() {
    await supabase.auth.signOut();
  },
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
  async getProfile(userId) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) throw error;
    return data;
  },
};
