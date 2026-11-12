-- FASTEC · Une "Discos duros", "Memoria RAM" y "Memorias y almacenamiento" en una sola categoría.
-- Ejecutar una vez en Supabase > SQL Editor. (La web ya los muestra juntos aunque no lo ejecutes;
-- esto solo ordena la base y el panel de administración.)
update public.products
   set category = 'ALMACENAMIENTO Y MEMORIA', updated_at = now()
 where category in ('DISCOS DUROS', 'MEMORIA RAM', 'MEMORIAS Y ALMACENAMIENTO');
