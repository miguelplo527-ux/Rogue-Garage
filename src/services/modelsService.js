import { supabase } from './supabaseClient';

export const modelsService = {
  /** Modelos más vendidos (ventas completadas, últimos 180 días). */
  async getFrequent(limit = 5) {
    const { data, error } = await supabase.rpc('get_frequent_models', { lim: limit });
    if (error) throw error;
    return (data || []).map((r) => r.model);
  },
};
