/* Carrito múltiple + favoritos de FASTEC (localStorage, sin cuenta). La compra se envía por WhatsApp. */
(function(){
  const CK = 'fastec_cart', FK = 'fastec_fav';
  const read = (k, d) => { try{ const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; }catch(e){ return d; } };
  const write = (k, v) => { try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} };
  const priceOf = p => { const n = Number(String(p && p.price != null ? p.price : '').replace(',', '.')); return isFinite(n) && n > 0 ? n : 0; };
  const money = n => 'S/ ' + Number(n).toLocaleString('es-PE', {minimumFractionDigits:2, maximumFractionDigits:2});
  const snap = p => ({id:p.id, name:p.name, brand:p.brand || '', model:p.model || '', image:p.image || '', price:priceOf(p) || ''});

  /* Acciones que exigen cuenta (se configuran en config.js > requireLogin) */
  const GATE = Object.assign({cart:true, fav:true, whatsapp:true}, (window.FASTEC_CONFIG || {}).requireLogin);
  const page = () => (location.pathname.split('/').pop() || 'productos.html');
  window.fastecRequireLogin = function(what){
    if(!GATE[what] || window.fastecSession()) return true;
    toast('Inicia sesión para continuar');
    setTimeout(() => { location.href = 'login.html?next=' + encodeURIComponent(page()) + '&need=' + what; }, 900);
    return false;
  };

  const Cart = window.fastecCart = {
    items: () => read(CK, []).filter(i => i && i.id != null && i.qty > 0),
    add(p, qty){ const L = this.items(), i = L.find(x => x.id === p.id);
      if(i){ i.qty += qty || 1; Object.assign(i, snap(p)); } else L.push(Object.assign(snap(p), {qty: qty || 1}));
      write(CK, L); sync(); },
    setQty(id, q){ let L = this.items(); const i = L.find(x => x.id === id); if(!i) return;
      i.qty = Math.max(0, Math.min(999, Math.floor(q) || 0)); L = L.filter(x => x.qty > 0); write(CK, L); sync(); },
    remove(id){ write(CK, this.items().filter(x => x.id !== id)); sync(); },
    clear(){ write(CK, []); sync(); },
    count: () => Cart.items().reduce((s, i) => s + i.qty, 0),
    /* total solo con productos que tienen precio confirmado */
    totals(){ const L = this.items(); let total = 0, ask = 0;
      L.forEach(i => { if(priceOf(i)) total += priceOf(i) * i.qty; else ask++; });
      return {total, unpriced: ask, lines: L.length}; },
    /* Actualiza precios/fotos con los datos vigentes del catálogo */
    refresh(products){ const L = this.items(); let ch = false;
      L.forEach(i => { const p = products.find(x => x.id === i.id); if(p){ const s = snap(p); if(JSON.stringify(s) !== JSON.stringify({id:i.id, name:i.name, brand:i.brand, model:i.model, image:i.image, price:i.price})){ Object.assign(i, s); ch = true; } } });
      if(ch){ write(CK, L); sync(); } },
    waNumber(){ let c = {}; try{ c = getSiteData().company || {}; }catch(e){}
      return String(c.phone || '').replace(/\D/g, '') || (window.FASTEC_CONFIG || {}).whatsapp || '51963925684'; },
    message(){ const L = this.items(), t = this.totals(); if(!L.length) return '';
      let m = 'Hola, FASTEC. Deseo realizar el siguiente pedido:\n\n';
      L.forEach((i, n) => { const pr = priceOf(i);
        m += `${n + 1}. ${[i.brand, i.name].filter(Boolean).join(' - ')}.\n   Cantidad: ${i.qty}.\n   Precio unitario: ${pr ? money(pr) : 'por confirmar'}.\n\n`; });
      if(t.lines > t.unpriced) m += `Total estimado${t.unpriced ? ' (solo productos con precio)' : ''}: ${money(t.total)}.\n`;
      if(t.unpriced) m += `${t.unpriced} producto(s) con precio por confirmar.\n`;
      return m + '\nQuisiera confirmar la disponibilidad y coordinar la compra.'; },
    checkout(){ if(!fastecRequireLogin('whatsapp')) return false; const m = this.message(); if(!m) return false;
      window.open(`https://wa.me/${this.waNumber()}?text=${encodeURIComponent(m)}`, '_blank', 'noopener'); return true; }
  };

  const Fav = window.fastecFav = {
    ids: () => read(FK, []),
    has: id => Fav.ids().includes(id),
    toggle(id){ const L = Fav.ids(), i = L.indexOf(id); if(i >= 0) L.splice(i, 1); else L.push(id); write(FK, L); sync(); return i < 0; }
  };

  /* contadores del encabezado, corazones y evento para páginas que se redibujan */
  function sync(){
    document.querySelectorAll('[data-cart-count]').forEach(e => { const n = Cart.count(); e.textContent = n; e.hidden = !n; });
    document.querySelectorAll('[data-fav-count]').forEach(e => { const n = Fav.ids().length; e.textContent = n; e.hidden = !n; });
    const f = Fav.ids();
    document.querySelectorAll('[data-fav]').forEach(b => { const on = f.includes(Number(b.dataset.fav)); b.classList.toggle('on', on); b.textContent = on ? '♥' : '♡'; b.setAttribute('aria-pressed', on); });
    renderAccount();
    document.dispatchEvent(new CustomEvent('fastec:cart'));
  }
  /* botón de cuenta: Ingresar / menú del usuario */
  function renderAccount(){
    const s = window.fastecSession && fastecSession(), e = fastecEsc;
    document.querySelectorAll('[data-account]').forEach(box => {
      if(!s){ box.innerHTML = `<a class="acct-btn" href="login.html?next=${encodeURIComponent(page())}">Ingresar</a>`; return; }
      const name = String(s.u || '').split('@')[0];
      box.innerHTML = `<button type="button" class="acct-btn acct-user" aria-haspopup="true" aria-expanded="false"><span class="acct-dot">${e(name.charAt(0).toUpperCase())}</span><span class="acct-name">${e(name)}</span></button>
        <div class="acct-menu" hidden><small>${e(s.u)}</small>${s.role === 'admin' ? '<a href="admin.html">⚙ Panel de administración</a>' : ''}<a href="favoritos.html">♡ Mis favoritos</a><a href="carrito.html">🛒 Mi carrito</a><button type="button" data-logout>Cerrar sesión</button></div>`;
    });
  }
  document.addEventListener('click', e => {
    const u = e.target.closest('.acct-user');
    document.querySelectorAll('.acct-menu').forEach(m => { const open = u && m.previousElementSibling === u && m.hidden; m.hidden = !open; if(m.previousElementSibling) m.previousElementSibling.setAttribute('aria-expanded', open); });
    if(e.target.closest('[data-logout]')){ fastecClearSession(); location.reload(); }
    /* cualquier enlace a WhatsApp (pie, botón flotante, contacto) exige sesión */
    const w = e.target.closest('a[href*="wa.me"]');
    if(w && !fastecRequireLogin('whatsapp')){ e.preventDefault(); e.stopPropagation(); }
  });
  window.fastecSyncCart = sync;
  const find = id => { try{ return getSiteData().products.find(p => p.id === id); }catch(e){ return null; } };

  /* clics en "Agregar al carrito" y corazón (fase de captura: se atiende antes que la tarjeta) */
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-add]'), h = e.target.closest('[data-fav]');
    if(!a && !h) return;
    e.stopPropagation(); e.preventDefault();
    const id = Number((a || h).dataset[a ? 'add' : 'fav']), p = find(id);
    if(h){ if(!fastecRequireLogin('fav')) return; const on = Fav.toggle(id); toast(on ? 'Agregado a favoritos' : 'Quitado de favoritos'); return; }
    if(a && !fastecRequireLogin('cart')) return;
    if(p){ Cart.add(p, 1); toast('Agregado al carrito'); a.classList.add('added'); setTimeout(() => a.classList.remove('added'), 900); }
  }, true);

  function toast(m){ const t = document.createElement('div'); t.className = 'fx-toast'; t.textContent = m; t.setAttribute('role', 'status'); document.body.appendChild(t); setTimeout(() => t.remove(), 1800); }
  window.fastecToast = toast;

  document.addEventListener('DOMContentLoaded', sync); window.addEventListener('load', sync);
  window.addEventListener('storage', sync);   // sincroniza entre pestañas
})();
