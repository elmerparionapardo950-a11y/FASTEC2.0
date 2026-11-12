PANEL DE ADMINISTRACIÓN FASTEC

Entrar:  tudominio.com/login.html  (correo y contraseña). Administradores y clientes usan el mismo formulario;
lo que decide quién es admin es la tabla "admins" de Supabase, no un archivo del sitio.

CONFIGURACIÓN INICIAL (una sola vez, en Supabase > SQL Editor)
1) Ejecuta supabase/schema.sql      (tablas, reglas de seguridad y productos; se puede volver a ejecutar sin error)
2) Ejecuta supabase/permisos.sql    (sin esto el login no puede comprobar quién es admin)
3) Entra a login.html > "Crear cuenta" con el correo del administrador (y confirma el correo si Supabase lo pide)
4) Abre supabase/crear-admin.sql, pon ese correo y ejecútalo. Cierra sesión y vuelve a entrar.
5) (Opcional) supabase/unir-almacenamiento.sql junta Discos duros, Memoria RAM y Memorias en una sola categoría en la base.

Qué puedes hacer: agregar/editar/ocultar/eliminar productos, cambiar precios y stock en una tabla, subir fotos,
editar servicios y datos de la empresa. Todo se guarda directo en Supabase (no hay que subir data.js).

Seguridad: el panel confirma tu rol con Supabase cada vez que se abre, y las reglas RLS impiden escribir a quien no sea admin.
Usa una contraseña larga (en Supabase > Authentication > Policies sube el mínimo a 10) y no la compartas.
Para quitar un admin: ver el final de supabase/crear-admin.sql.
