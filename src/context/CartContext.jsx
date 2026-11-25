import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from './AuthContext.jsx';
import { MAX_QTY_PER_PRODUCT } from '../utils/constants';

const CartContext = createContext(null);
const storageKey = (userId) => `rogue_cart_${userId}`;

// Motivo por el que una cantidad no se puede aceptar: 'limit' (más de 10) o 'stock' (sin unidades suficientes)
const capReason = (wanted, stock) => {
  if (wanted <= Math.min(MAX_QTY_PER_PRODUCT, stock)) return null;
  return stock >= MAX_QTY_PER_PRODUCT ? 'limit' : 'stock';
};

/**
 * Carrito personal: solo existe para usuarios con sesión iniciada.
 * Se guarda por usuario en este navegador y se vacía de la vista al cerrar sesión.
 */
export function CartProvider({ children }) {
  const { user } = useAuthContext();
  const userId = user?.id ?? null;
  const [items, setItems] = useState([]);
  const [loadedFor, setLoadedFor] = useState(null);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      setLoadedFor(null);
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey(userId));
      const saved = raw ? JSON.parse(raw) : [];
      // Por seguridad, nunca se permite más del máximo aunque el almacenamiento haya sido modificado
      setItems(saved.map((i) => ({ ...i, quantity: Math.min(Number(i.quantity) || 1, MAX_QTY_PER_PRODUCT) })));
    } catch {
      setItems([]);
    }
    setLoadedFor(userId);
  }, [userId]);

  useEffect(() => {
    if (!userId || loadedFor !== userId) return;
    try {
      localStorage.setItem(storageKey(userId), JSON.stringify(items));
    } catch {
      /* almacenamiento no disponible: el carrito sigue en memoria */
    }
  }, [items, userId, loadedFor]);

  const addToCart = useCallback(
    (product, quantity = 1) => {
      if (!userId) return { ok: false, reason: 'auth' };
      const stock = Number.isFinite(Number(product.stock)) ? Number(product.stock) : Infinity;
      if (stock <= 0) return { ok: false, reason: 'soldout' };
      const existing = items.find((i) => i.id === product.id);
      const wanted = (existing?.quantity ?? 0) + quantity;
      const max = Math.min(MAX_QTY_PER_PRODUCT, stock);
      const reason = capReason(wanted, stock);
      if (existing && existing.quantity >= max) return { ok: false, reason };
      const snapshot = {
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.categories?.name || product.category || '',
        image_url: product.image_url,
        sale_price: Number(product.sale_price) || 0,
        stock: stock === Infinity ? null : stock,
        quantity: Math.min(wanted, max),
      };
      setItems((prev) => (existing ? prev.map((i) => (i.id === product.id ? snapshot : i)) : [...prev, snapshot]));
      return { ok: true, capped: wanted > max, reason };
    },
    [userId, items]
  );

  const setQuantity = useCallback(
    (productId, quantity) => {
      const item = items.find((i) => i.id === productId);
      if (!item) return { ok: false };
      const stock = item.stock ?? Infinity;
      const next = Math.max(1, Math.min(quantity, MAX_QTY_PER_PRODUCT, stock));
      setItems((prev) => prev.map((i) => (i.id === productId ? { ...i, quantity: next } : i)));
      const reason = capReason(quantity, stock);
      return reason ? { ok: false, reason } : { ok: true };
    },
    [items]
  );

  const removeFromCart = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((n, i) => n + i.quantity * i.sale_price, 0), [items]);

  const value = { cart: items, items, count, subtotal, addToCart, setQuantity, removeFromCart, clearCart };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCartContext = () => useContext(CartContext);
