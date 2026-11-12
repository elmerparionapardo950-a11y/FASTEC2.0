-- FASTEC · Permisos de acceso a las tablas (ejecutar una vez en SQL Editor).
-- Las reglas RLS siguen mandando: esto solo deja que la API pueda "ver" las tablas.
grant usage on schema public to anon, authenticated;

grant select on public.products, public.services, public.company, public.home_settings to anon, authenticated;
grant insert on public.events to anon, authenticated;
grant select on public.admins to authenticated;
grant insert, update, delete on public.products, public.services, public.company, public.home_settings to authenticated;
grant select, insert, update, delete on public.stock_movements to authenticated;
grant select on public.events to authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- Regla para que cada admin pueda ver su propia fila
drop policy if exists "admins: ver propio" on public.admins;
create policy "admins: ver propio" on public.admins for select using (user_id = auth.uid());
