import { supabase } from './supabaseClient';

export const productsService = {
      async getAll(filters = {}) {
    let query = supabase.from('products').select('*, categories(name)').eq('is_active', true).order('created_at', { ascending: false });
    
    if (filters.search) {
      // Ahora busca en nombre, SKU, marca y descripción
      query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('products').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async create(product) {
    const { data, error } = await supabase.from('products').insert(product).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, product) {
    const { data, error } = await supabase
      .from('products').update({ ...product, updated_at: new Date() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async archive(id) {
    const { error } = await supabase.from('products').update({ is_active: false }).eq('id', id);
    if (error) throw error;
  },

  async getNextSku(prefix) {
    const { data } = await supabase
      .from('products').select('sku').like('sku', `${prefix}-%`);
    const nums = (data || []).map(p => parseInt(p.sku.split('-').pop(), 10));
    const next = nums.length ? Math.max(...nums) + 1 : 1;
    return String(next).padStart(3, '0');
  },
};