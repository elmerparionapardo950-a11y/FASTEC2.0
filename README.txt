FASTEC - Sitio web

Páginas: index, nosotros, productos, servicios, contacto.
Acceso al panel: login.html  (tudominio.com/login.html)  ->  admin.html
Datos: se leen de Supabase; data.js es solo el respaldo si Supabase no responde.
Compartidos: styles.css (tiene un índice al inicio), admin.css, store.js, catalog.js, service.js, header.js, footer-data.js, site.js, script.js.
Nota: inicio.html es una página antigua que ya no se enlaza; puedes borrarla (y la sección 11 de styles.css).


=== CONFIGURACIÓN ANTES DE PUBLICAR ===
1) DOMINIO: reemplaza "https://tudominio.com" por tu dominio real en todos los archivos
   (las páginas .html, robots.txt y sitemap.xml). En Linux/Mac:
     grep -rl "tudominio.com" . | xargs sed -i 's#https://tudominio.com#https://TU-DOMINIO-REAL#g'
   Sin esto, la imagen al compartir en WhatsApp/Facebook y el sitemap no funcionarán.
2) REDES Y HORARIO: edita el bloque SITE al inicio de site.js (Facebook, Instagram, TikTok, horario).
   Lo que dejes vacío no se muestra.
3) CONTACTO: los botones de WhatsApp, llamada y correo usan el teléfono y correo de data.js (empresa).
4) PANEL: ver README_ADMIN.txt (crear el administrador en Supabase).
5) Envía sitemap.xml en Google Search Console.
