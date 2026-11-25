-- Rogue Garage: categorías oficiales (las 5 de los catálogos en PDF).
-- Esquema real: categories(id, name UNIQUE, slug UNIQUE NOT NULL, description); products.category_id y products.category (texto).

-- 1. Renombrar la categoría que ya habíamos creado
update public.categories set name = 'Body Kit', slug = 'body-kit'
where name = 'Bodykits' and not exists (select 1 from public.categories where name = 'Body Kit' or slug = 'body-kit');

-- 2. Crear las que falten
insert into public.categories (name, slug)
select v.name, v.slug
from (values
  ('Body Kit', 'body-kit'),
  ('Camionetas y Autos', 'camionetas-y-autos'),
  ('Iluminación', 'iluminacion'),
  ('Llaveros y Logos', 'llaveros-y-logos'),
  ('Tuning', 'tuning')
) as v(name, slug)
where not exists (select 1 from public.categories c where c.name = v.name or c.slug = v.slug);

-- 3. Actualizar el texto de categoría de productos que usaban el nombre anterior
update public.products set category = 'Body Kit' where category = 'Bodykits';

-- 4. Borrar categorías sobrantes que no tengan productos
delete from public.categories
where name not in ('Body Kit', 'Camionetas y Autos', 'Iluminación', 'Llaveros y Logos', 'Tuning')
  and id not in (select category_id from public.products where category_id is not null);

-- 5. Revisar el resultado
select c.name, c.slug, count(p.id) as productos
from public.categories c left join public.products p on p.category_id = c.id
group by c.name, c.slug order by c.name;
