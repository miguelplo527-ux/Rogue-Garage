/** Teléfono: acepta 7 a 15 dígitos, con o sin +57 y espacios. Devuelve solo dígitos (y el + inicial). */
export const normalizePhone = (v = '') => String(v).replace(/[^\d+]/g, '');
export const isValidPhone = (v = '') => /^\+?\d{7,15}$/.test(normalizePhone(v));