-- ============================================================================
-- ROGUE GARAGE · Configuración de Supabase (ejecutar en SQL Editor, una sola vez)
-- Revisa los comentarios: hay 2 puntos que dependen de TU base de datos actual.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. Helper: ¿el usuario actual es admin?  (evita recursión en las políticas)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------------------------------------------------------------------------
-- 1. ROLES: toda cuenta nueva es "cliente" (corrige el acceso a /admin)
-- ---------------------------------------------------------------------------
-- 1a. Mira si ya existe algún trigger sobre auth.users (probablemente el que daba rol admin):
--     select tgname from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal;
--     Si ves uno distinto a "on_auth_user_created", bórralo:  drop trigger "nombre" on auth.users;
--
-- 1b. Si la columna profiles.role es un ENUM, agrega el valor antes:
--     alter type nombre_del_enum add value if not exists 'cliente';

alter table public.profiles alter column role set default 'cliente';

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- El rol NUNCA se toma de lo que envía el navegador: siempre 'cliente'.
  -- Si tu tabla profiles tiene más columnas obligatorias (p. ej. email), agrégalas aquí.
  insert into public.profiles (id, full_name, role)
  values (new.id, nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), ''), 'cliente')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Nadie (salvo un admin o el SQL Editor) puede cambiar roles.
create or replace function public.prevent_role_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'No tienes permiso para cambiar el rol';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_change on public.profiles;
create trigger profiles_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- 1c. Cuentas ya creadas con rol equivocado: EDITA los correos de tus admins y ejecuta.
-- update public.profiles set role = 'cliente'
-- where id in (select id from auth.users where email not in ('TU_CORREO_ADMIN@ejemplo.com'));

-- ---------------------------------------------------------------------------
-- 2. MODELOS FRECUENTES: se calculan solos con las ventas completadas
-- ---------------------------------------------------------------------------
alter table public.products add column if not exists vehicle_model text;
-- En vehicle_model escribe el modelo (ej. "Toyota TXL"). Para varios, sepáralos con coma.

create or replace function public.get_frequent_models(lim int default 5)
returns table(model text, units bigint)
language sql stable security definer set search_path = public as $$
  select trim(m.name) as model, sum(si.quantity)::bigint as units
  from public.sale_items si
  join public.sales s    on s.id = si.sale_id
  join public.products p on p.id = si.product_id
  cross join lateral unnest(string_to_array(p.vehicle_model, ',')) as m(name)
  where s.status = 'completada'
    and s.date >= (now() - interval '180 days')
    and trim(m.name) <> ''
  group by trim(m.name)
  order by units desc, model
  limit lim;
$$;
grant execute on function public.get_frequent_models(int) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. FOTOS DE CLIENTES (carrusel del inicio)
-- ---------------------------------------------------------------------------
create table if not exists public.customer_photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  vehicle text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.customer_photos enable row level security;

drop policy if exists "fotos visibles para todos" on public.customer_photos;
create policy "fotos visibles para todos" on public.customer_photos
  for select using (is_active or public.is_admin());

drop policy if exists "admin gestiona fotos" on public.customer_photos;
create policy "admin gestiona fotos" on public.customer_photos
  for all using (public.is_admin()) with check (public.is_admin());
-- Las imágenes se suben al bucket público "product-images" (carpeta clientes/), el mismo de los productos.

-- ---------------------------------------------------------------------------
-- 4. ELIMINAR CUENTA (borra de verdad al usuario y su perfil)
-- ---------------------------------------------------------------------------
create or replace function public.delete_my_account()
returns void
language plpgsql security definer set search_path = public, auth as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'No autenticado'; end if;
  if public.is_admin() then
    raise exception 'Las cuentas de administrador no se pueden eliminar desde la web';
  end if;
  delete from public.profiles where id = uid;
  delete from auth.users where id = uid;
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
