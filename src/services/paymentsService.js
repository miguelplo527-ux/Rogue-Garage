import { supabase } from './supabaseClient';

export const paymentsService = {
  /** Crea el pedido en el servidor y devuelve { url, reference } de Wompi. */
  async startCheckout(items) {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { items: items.map((i) => ({ id: i.id, quantity: i.quantity })) },
    });
    if (error) {
      let payload = null;
      try { payload = await error.context.json(); } catch { /* sin detalle */ }
      const e = new Error(payload?.error || error.message || 'checkout');
      e.code = payload?.error;
      e.details = payload;
      throw e;
    }
    if (!data?.url) throw new Error('checkout');
    return data;
  },

  async getOrderByReference(reference) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('reference', reference)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};