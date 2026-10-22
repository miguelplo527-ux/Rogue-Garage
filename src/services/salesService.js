import { supabase } from './supabaseClient';

export const salesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('sales')
      .select('*, sale_items(*, products(sku, name))')
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create({ items, paymentMethod, customerName, customerPhone }) {
    const total = items.reduce((acc, i) => acc + i.quantity * i.unit_price, 0);

    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        total,
        payment_method: paymentMethod,
        customer_name: customerName,
        customer_phone: customerPhone,
      })
      .select().single();
    if (saleError) throw saleError;

    const saleItems = items.map(i => ({
      sale_id: sale.id,
      product_id: i.product_id,
      quantity: i.quantity,
      unit_price: i.unit_price,
    }));

    const { error: itemsError } = await supabase.from('sale_items').insert(saleItems);
    if (itemsError) throw itemsError;

    return sale;
  },

  async void(id, reason) {
    const { error } = await supabase
      .from('sales').update({ status: 'anulada', void_reason: reason }).eq('id', id);
    if (error) throw error;
  },
};