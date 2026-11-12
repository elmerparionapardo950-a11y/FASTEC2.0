-- FASTEC · Convertir una cuenta en administrador. Ejecutar en Supabase > SQL Editor.
-- 1) La persona debe haber creado su cuenta antes (login.html > "Crear cuenta") y confirmado el correo.
-- 2) Cambia el correo de abajo y ejecuta.
insert into public.admins (user_id)
select id from auth.users where email = 'TU-CORREO@EJEMPLO.COM'
on conflict do nothing;

-- Ver quiénes son administradores:
-- select u.email from public.admins a join auth.users u on u.id = a.user_id;
-- Quitar a un administrador:
-- delete from public.admins where user_id = (select id from auth.users where email = 'CORREO');
