export const formatMoney = (n) => {
  const num = Number(n) || 0;
  return `${num < 0 ? '-' : ''}$${Math.abs(num).toLocaleString('es-CO')}`;
};

export const formatDate = (d) => d ? new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '—';