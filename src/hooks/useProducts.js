import { useEffect, useState } from 'react';
import { productsService } from '../services/productsService';
export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(null);
  const load = async () => { setLoading(true); try { setProducts(await productsService.getAll(filters)); } catch (err) { setError(err); } finally { setLoading(false); } };
  useEffect(() => { load(); }, [JSON.stringify(filters)]);
  return { products, loading, error, reload: load };
}
