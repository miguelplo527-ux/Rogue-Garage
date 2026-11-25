import { supabase } from './supabaseClient';

export const galleryService = {
  async getActive(limit = 12) {
    const { data, error } = await supabase
      .from('customer_photos')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },
  async getAll() {
    const { data, error } = await supabase.from('customer_photos').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  async create({ image_url, caption, vehicle }) {
    const { data, error } = await supabase
      .from('customer_photos').insert({ image_url, caption: caption || null, vehicle: vehicle || null }).select().single();
    if (error) throw error;
    return data;
  },
  async remove(id) {
    const { error } = await supabase.from('customer_photos').delete().eq('id', id);
    if (error) throw error;
  },
};
