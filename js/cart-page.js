/* Páginas carrito.html y favoritos.html */
fastecReady(function(){
  const esc = fastecEsc, money = fastecMoney, $ = id => document.getElementById(id);
  const live = () => getSiteData().products.filter(p => p.active !== false);
  const cr = $('cartRoot'), fr = $('favRoot');
  const priceOf = i => { const n = Number(i.price); return isFinite(n) && n > 0 ? n : 0; };
  fastecCart.refresh(live());

  function drawCart(){
    if(!cr) return;
    const L = fastecCart.items(), t = fastecCart.totals();
    if(!L.length){ cr.innerHTML = '<div class="shop-empty"><p>Tu carrito está vacío.</p><a class="btn-main" href="productos.html">Ver productos</a></div>'; return; }
    cr.innerHTML = `<div class="cart-layout"><div class="cart-list">${L.map(i => { const pr = priceOf(i);
      return `<article class="cart-item" data-id="${esc(i.id)}">
        <div class="cart-photo">${i.image ? `<img src="${esc(i.image)}" alt="${esc(i.name)}" loading="lazy">` : '<span>FASTEC</span>'}</div>
        <div class="cart-info"><strong>${esc(i.name)}</strong>${i.brand ? `<small>${esc(i.brand)}</small>` : ''}
          <span class="${pr ? 'cart-price' : 'cart-price ask'}">${pr ? money(pr) : 'Precio por confirmar'}</span></div>
        <div class="cart-qty" role="group" aria-label="Cantidad"><button type="button" data-q="dec" aria-label="Disminuir">−</button><span>${i.qty}</span><button type="button" data-q="inc" aria-label="Aumentar">+</button></div>
        <div class="cart-sub">${pr ? money(pr * i.qty) : '—'}</div>
        <button type="button" class="cart-rm" data-rm aria-label="Eliminar">✕</button></article>`; }).join('')}</div>
      <aside class="cart-summary"><h2>Resumen</h2>
        <p><span>Artículos</span><b>${fastecCart.count()}</b></p>
        ${t.lines > t.unpriced ? `<p class="cart-total"><span>Total estimado</span><b>${money(t.total)}</b></p>` : ''}
        ${t.unpriced ? `<p class="cart-note">${t.unpriced} producto(s) con precio por confirmar: no suman al total.</p>` : ''}
        <button type="button" class="btn-main btn-wa" data-checkout>Finalizar compra por WhatsApp</button>
        <button type="button" class="btn-ghost" data-clear>Vaciar carrito</button>
        <small>No se cobra nada en línea: el pedido se confirma por WhatsApp.</small></aside></div>`;
  }
  if(cr) cr.addEventListener('click', e => {
    const row = e.target.closest('.cart-item'), id = row && Number(row.dataset.id), it = row && fastecCart.items().find(x => x.id === id);
    if(e.target.closest('[data-q]') && it) fastecCart.setQty(id, it.qty + (e.target.closest('[data-q]').dataset.q === 'inc' ? 1 : -1));
    else if(e.target.closest('[data-rm]')) fastecCart.remove(id);
    else if(e.target.closest('[data-clear]')){ if(confirm('¿Vaciar el carrito?')) fastecCart.clear(); }
    else if(e.target.closest('[data-checkout]')) fastecCart.checkout();
  });

  function drawFav(){
    if(!fr) return;
    const ids = fastecFav.ids(), list = live().filter(p => ids.includes(p.id));
    fr.innerHTML = list.length ? `<div class="fav-grid">${list.map(fastecProductCard).join('')}</div>`
      : '<div class="shop-empty"><p>Aún no tienes favoritos. Toca el corazón ♡ en un producto para guardarlo.</p><a class="btn-main" href="productos.html">Ver productos</a></div>';
    fr.querySelectorAll('[data-fav]').forEach(b => { b.classList.add('on'); b.textContent = '♥'; });
  }
  if(fr) fr.addEventListener('click', e => {
    const c = e.target.closest('.live-product-card'); if(!c || e.target.closest('button')) return;
    if(!fastecRequireLogin('whatsapp')) return;
    window.open(`https://wa.me/${fastecCart.waNumber()}?text=${encodeURIComponent('Hola, FASTEC. Quisiera consultar por: ' + (c.dataset.productName || ''))}`, '_blank', 'noopener');
  });
  const draw = () => { drawCart(); drawFav(); };
  document.addEventListener('fastec:cart', draw); draw();
});
