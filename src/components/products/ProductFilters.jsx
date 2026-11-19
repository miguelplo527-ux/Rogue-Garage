const SORTS = [
  { value: 'new', label: 'Más recientes' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'name', label: 'Nombre (A-Z)' },
];

export default function ProductFilters({ values, options, onChange, onClear, open }) {
  const { q, cat, brand, min, max, stock, sort } = values;
  return (
    <aside className={`filters${open ? ' open' : ''}`} aria-label="Filtros de búsqueda">
      <h3>Filtrar</h3>

      <div className="filter-group">
        <label htmlFor="f-q">Buscar</label>
        <input id="f-q" className="field" type="search" placeholder="Modelo, marca, pieza..." value={q} onChange={(e) => onChange({ q: e.target.value })} />
      </div>

      <div className="filter-group">
        <span className="label">Categoría</span>
        <div className="chip-row">
          <button type="button" className={`chip${!cat ? ' active' : ''}`} onClick={() => onChange({ cat: '' })}>Todas</button>
          {options.categories.map((c) => (
            <button type="button" key={c} className={`chip${cat === c ? ' active' : ''}`} aria-pressed={cat === c} onClick={() => onChange({ cat: cat === c ? '' : c })}>{c}</button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label htmlFor="f-brand">Marca</label>
        <select id="f-brand" value={brand} onChange={(e) => onChange({ brand: e.target.value })}>
          <option value="">Todas las marcas</option>
          {options.brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <span className="label">Precio (COP)</span>
        <div className="price-row">
          <input className="field" type="number" min="0" inputMode="numeric" placeholder="Mínimo" aria-label="Precio mínimo" value={min} onChange={(e) => onChange({ min: e.target.value })} />
          <input className="field" type="number" min="0" inputMode="numeric" placeholder="Máximo" aria-label="Precio máximo" value={max} onChange={(e) => onChange({ max: e.target.value })} />
        </div>
      </div>

      <label className="check">
        <input type="checkbox" checked={stock === '1'} onChange={(e) => onChange({ stock: e.target.checked ? '1' : '' })} />
        Solo disponibles
      </label>

      <div className="filter-group">
        <label htmlFor="f-sort">Ordenar por</label>
        <select id="f-sort" value={sort} onChange={(e) => onChange({ sort: e.target.value === 'new' ? '' : e.target.value })}>
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <button type="button" className="btn btn-ghost btn-block" onClick={onClear}>Limpiar filtros</button>
    </aside>
  );
}
