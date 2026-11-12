/* Configuración pública de FASTEC.
   La "anon key" de Supabase es PÚBLICA por diseño: la seguridad real la dan las reglas RLS de supabase/schema.sql.
   NUNCA pegues aquí la "service_role key" ni contraseñas. */
window.FASTEC_CONFIG = {
  supabaseUrl: 'https://konbmsfeznkxltrbrbjp.supabase.co',
  supabaseAnonKey: 'sb_publishable_XNJqiO9LDcokJtvjtOjCAw_CWPoGeuT',  // clave "anon public" de Supabase
  // Qué acciones exigen iniciar sesión. Pon false para permitirlas a todos.
  requireLogin: {cart: true, fav: true, whatsapp: true},
  whatsapp: '51963925684' // respaldo; normalmente se toma de company.phone
};
