-- Rogue Garage: categorías para el catálogo de vehículos de lujo.
-- Ejecutar en Supabase > SQL Editor. Ajusta si tu tabla `categories` tiene otras columnas.
-- El formulario de productos busca la categoría por NOMBRE; sin estas filas el producto se guarda sin categoría.

insert into categories (name)
select v.name
from (values
  ('Bodykits'),
  ('Rines y llantas'),
  ('Estribos y protectores'),
  ('Iluminación'),
  ('Interior de lujo'),
  ('Accesorios')
) as v(name)
where not exists (select 1 from categories c where c.name = v.name);

-- Opcional: oculta del catálogo los productos antiguos de motos (siguen existiendo en el panel).
-- update products set is_active = false where category in ('Cascos', 'Indumentaria', 'Repuestos');
