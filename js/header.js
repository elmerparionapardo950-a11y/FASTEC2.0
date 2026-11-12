/* Encabezado único de FASTEC.
   Este archivo contiene una sola copia del logo y menú para las 5 páginas. */
(function(){
  const markup = `<header class="site-header">
  <div class="wrap header-inner">
    <a href="productos.html" class="brand" aria-label="FASTEC - Productos">
      <span class="brand-mark">
        <img src="img/logo3.png" alt="">
      </span>
      <span class="brand-name"></span>
    </a>

    <nav class="main-nav" id="mainNav" aria-label="Navegación principal">
      <a href="productos.html" data-page="productos.html">Productos</a>
      <a href="servicios.html" data-page="servicios.html">Servicios</a>
      <a href="contacto.html" data-page="contacto.html">Contacto</a>
      <a href="nosotros.html" data-page="nosotros.html">Nosotros</a>
    </nav>

    <div class="header-actions">
      <div class="acct" data-account></div>
      <a href="favoritos.html" class="icon-btn" aria-label="Favoritos"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg><b class="icon-count" data-fav-count hidden>0</b></a>
      <a href="carrito.html" class="icon-btn" aria-label="Carrito"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg><b class="icon-count" data-cart-count hidden>0</b></a>
    </div>

    <button class="nav-toggle" id="navToggle" aria-label="Abrir menú" aria-expanded="false" type="button">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>
`;

  function cargarCabecera(){
    const contenedor = document.getElementById('sharedHeader');
    if (!contenedor) return;
    contenedor.outerHTML = markup;

    const actual = (location.pathname.split('/').pop() || 'productos.html').toLowerCase();
    document.querySelectorAll('.main-nav a[data-page]').forEach(link => {
      const activo = link.dataset.page.toLowerCase() === actual;
      link.classList.toggle('active', activo);
      if (activo) link.setAttribute('aria-current','page');
    });

    if(window.fastecSyncCart) fastecSyncCart();

    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('mainNav');
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const abierto = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(abierto));
        toggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
      });
      nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
        toggle.setAttribute('aria-label','Abrir menú');
      }));
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', cargarCabecera);
  else cargarCabecera();
})();
