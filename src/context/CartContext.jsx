import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from './AuthContext.jsx';

const CartContext = createContext(null);
const storageKey = (userId) => `rogue_cart_${userId}`;

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
      setItems(raw ? JSON.parse(raw) : []);
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
      const max = Number.isFinite(Number(product.stock)) ? Number(product.stock) : Infinity;
      if (max <= 0) return { ok: false, reason: 'stock' };
      let capped = false;
      setItems((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        const current = existing?.quantity ?? 0;
        const next = Math.min(current + quantity, max);
        capped = next < current + quantity;
        const snapshot = {
          id: product.id,
          name: product.name,
          brand: product.brand,
          category: product.categories?.name || product.category || '',
          image_url: product.image_url,
          sale_price: Number(product.sale_price) || 0,
          stock: max === Infinity ? null : max,
          quantity: next,
        };
        return existing ? prev.map((i) => (i.id === product.id ? snapshot : i)) : [...prev, snapshot];
      });
      return { ok: true, capped };
    },
    [userId]
  );

  const setQuantity = useCallback((productId, quantity) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id !== productId) return i;
          const max = i.stock ?? Infinity;
          return { ...i, quantity: Math.max(1, Math.min(quantity, max)) };
        })
        .filter(Boolean)
    );
  }, []);

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
