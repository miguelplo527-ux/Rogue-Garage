import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import StoreLayout from '../../components/layout/StoreLayout';
import ProductCard from '../../components/products/ProductCard';
import ProductFilters from '../../components/products/ProductFilters';
import { useProducts } from '../../hooks/useProducts';
import { CATEGORIES } from '../../utils/constants';

const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const categoryOf = (p) => p.categories?.name || p.category || '';

export default function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const { products, loading } = useProducts({});
  const [filtersOpen, setFiltersOpen] = useState(false);

  const values = {
    q: params.get('q') || '',
    cat: params.get('cat') || '',
    brand: params.get('brand') || '',
    min: params.get('min') || '',
    max: params.get('max') || '',
    stock: params.get('stock') || '',
    sort: params.get('sort') || 'new',
  };

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v === '' || v == null ? next.delete(k) : next.set(k, String(v))));
    setParams(next, { replace: true });
  };

  // Opciones de filtro construidas a partir de los productos reales
  const options = useMemo(() => {
    const cats = [...new Set(products.map(categoryOf).filter(Boolean))];
    cats.sort((a, b) => {
      const ia = CATEGORIES.indexOf(a), ib = CATEGORIES.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
    });
    const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    return { categories: cats, brands };
  }, [products]);

  const results = useMemo(() => {
    const q = norm(values.q).trim();
    const min = values.min === '' ? null : Number(values.min);
    const max = values.max === '' ? null : Number(values.max);
    let list = products.filter((p) => {
      if (q) {
        const hay = norm([p.name, p.sku, p.brand, p.description, categoryOf(p)].join(' '));
        if (!q.split(/\s+/).every((word) => hay.includes(word))) return false;
      }
      if (values.cat && categoryOf(p) !== values.cat) return false;
      if (values.brand && p.brand !== values.brand) return false;
      const price = Number(p.sale_price) || 0;
      if (min !== null && price < min) return false;
      if (max !== null && price > max) return false;
      if (values.stock === '1' && !(p.stock > 0)) return false;
      return true;
    });
    if (values.sort === 'price-asc') list = [...list].sort((a, b) => a.sale_price - b.sale_price);
    if (values.sort === 'price-desc') list = [...list].sort((a, b) => b.sale_price - a.sale_price);
    if (values.sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, params]);

  const activeCount = ['q', 'cat', 'brand', 'min', 'max', 'stock'].filter((k) => values[k]).length;

  return (
    <StoreLayout>
      <div className="container">
        <div className="page-title">
          <h1>Catálogo</h1>
          <p>Bodykits y accesorios para camionetas de lujo. Filtra por categoría, marca o precio.</p>
        </div>

        <div className="catalog-layout">
          <ProductFilters
            values={values}
            options={options}
            onChange={update}
            onClear={() => setParams({}, { replace: true })}
            open={filtersOpen}
          />

          <section aria-live="polite">
            <div className="results-bar">
              <span>{loading ? 'Cargando...' : `${results.length} ${results.length === 1 ? 'producto' : 'productos'}`}</span>
              <button type="button" className="btn btn-ghost btn-sm filters-toggle" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((o) => !o)}>
                <i className="fa-solid fa-sliders" /> Filtros{activeCount > 0 ? ` (${activeCount})` : ''}
              </button>
            </div>

            {loading ? (
              <p className="loader">Cargando productos...</p>
            ) : results.length === 0 ? (
              <div className="empty">
                <i className="fa-solid fa-magnifying-glass" />
                <h3>No encontramos resultados</h3>
                <p>Prueba con otra palabra o quita algunos filtros.</p>
                <button type="button" className="btn btn-primary" onClick={() => setParams({}, { replace: true })}>Ver todo el catálogo</button>
              </div>
            ) : (
              <div className="product-grid">
                {results.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </section>
        </div>
      </div>
    </StoreLayout>
  );
}
