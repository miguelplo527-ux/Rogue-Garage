-- Rogue Garage: migración segura e idempotente de categorías.
-- Puede ejecutarse varias veces y no depende de que exista un `slug` previo.

begin;

do $$
declare
  category_id_type text;
begin
  if to_regclass('public.categories') is null then
    raise exception 'No existe la tabla public.categories';
  end if;

  if to_regclass('public.products') is null then
    raise exception 'No existe la tabla public.products';
  end if;

  -- Algunas instalaciones antiguas no tienen slug.
  if not exists (
    select 1
    from pg_attribute
    where attrelid = 'public.categories'::regclass
      and attname = 'slug'
      and attnum > 0
      and not attisdropped
  ) then
    alter table public.categories add column slug text;
  end if;

  -- Algunas instalaciones antiguas no tienen category_id.
  if not exists (
    select 1
    from pg_attribute
    where attrelid = 'public.products'::regclass
      and attname = 'category_id'
      and attnum > 0
      and not attisdropped
  ) then
    select format_type(a.atttypid, a.atttypmod)
    into category_id_type
    from pg_attribute a
    where a.attrelid = 'public.categories'::regclass
      and a.attname = 'id';

    execute format(
      'alter table public.products add column category_id %s',
      category_id_type
    );
  end if;

  -- El producto puede guardar categoría solo como texto.
  if not exists (
    select 1
    from pg_attribute
    where attrelid = 'public.products'::regclass
      and attname = 'category'
      and attnum > 0
      and not attisdropped
  ) then
    alter table public.products add column category text;
  end if;
end;
$$;

-- 1) Completa slugs ausentes sin chocar con otra categoría que ya use ese slug.
update public.categories c
set slug = v.slug
from (values
  ('Body Kit', 'body-kit'),
  ('Camionetas y Autos', 'camionetas-y-autos'),
  ('Iluminación', 'iluminacion'),
  ('Llaveros y Logos', 'llaveros-y-logos'),
  ('Tuning', 'tuning')
) as v(name, slug)
where c.name = v.name
  and (c.slug is null or c.slug = '')
  and not exists (
    select 1
    from public.categories o
    where o.slug = v.slug
      and o.id is distinct from c.id
  );

-- 2) Renombra la categoría anterior solo si el nombre nuevo aún no existe.
update public.categories as c
set name = 'Body Kit', slug = 'body-kit'
where c.name = 'Bodykits'
  and not exists (
    select 1
    from public.categories existing
    where existing.id is distinct from c.id
      and (existing.name = 'Body Kit' or existing.slug = 'body-kit')
  );

-- 3) Inserta las categorías oficiales sin duplicarlas por nombre o slug.
insert into public.categories (name, slug)
select v.name, v.slug
from (values
  ('Body Kit', 'body-kit'),
  ('Camionetas y Autos', 'camionetas-y-autos'),
  ('Iluminación', 'iluminacion'),
  ('Llaveros y Logos', 'llaveros-y-logos'),
  ('Tuning', 'tuning')
) as v(name, slug)
where not exists (
  select 1
  from public.categories c
  where c.name = v.name or c.slug = v.slug
);

-- 4) Si "Bodykits" y "Body Kit" existen a la vez, pasa los productos a "Body Kit".
update public.products p
set category_id = nk.id
from public.categories ok, public.categories nk
where ok.name = 'Bodykits'
  and nk.name = 'Body Kit'
  and p.category_id = ok.id;

-- 5) Normaliza el texto antiguo en productos.
update public.products
set category = 'Body Kit'
where category = 'Bodykits';

-- 6) Productos con category_id: sincroniza el texto con el nombre de su categoría.
update public.products p
set category = c.name
from public.categories c
where p.category_id = c.id
  and p.category is distinct from c.name;

-- 7) Productos sin category_id: vincúlalos por nombre de categoría.
update public.products p
set category_id = c.id
from public.categories c
where p.category_id is null
  and p.category = c.name;

-- 8) Borra categorías que no son oficiales y que ningún producto usa.
delete from public.categories c
where c.name not in (
  'Body Kit',
  'Camionetas y Autos',
  'Iluminación',
  'Llaveros y Logos',
  'Tuning'
)
and not exists (
  select 1
  from public.products p
  where p.category_id = c.id or p.category = c.name
);

commit;

select c.name, c.slug, count(distinct p.id) as productos
from public.categories c
left join public.products p on p.category_id = c.id or p.category = c.name
group by c.id, c.name, c.slug
order by c.name;