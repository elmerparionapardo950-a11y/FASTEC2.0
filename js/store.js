/* Datos y utilidades compartidas.
   - Visitantes: ven siempre lo publicado en data.js.
   - Con sesión iniciada: ve su borrador en todo el sitio. */
(function(){
  const clone = o => JSON.parse(JSON.stringify(o));

  window.fastecEsc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  /* ---- sesión ---- */
  window.fastecIsAdmin = function(){
    for(const st of [sessionStorage, localStorage]){
      try{ const s = JSON.parse(st.getItem('fastec_session') || 'null'); if(s && s.exp > Date.now() && s.role === 'admin') return true; }catch(e){}
    }
    return false;
  };
  window.fastecIsUser = () => !!window.fastecSession();   // cualquier persona con sesión (cliente o admin)
  window.fastecSetSession = function(user, remember, hours, days, tokens, role){
    const exp = Date.now() + (remember ? days*24 : hours) * 3600000;
    (remember ? localStorage : sessionStorage).setItem('fastec_session', JSON.stringify({u:user, exp, at:tokens&&tokens.at, rt:tokens&&tokens.rt, role:role || 'user'}));
  };
  window.fastecSession = function(){
    for(const st of [sessionStorage, localStorage]){ try{ const s = JSON.parse(st.getItem('fastec_session')||'null'); if(s && s.exp > Date.now()) return s; }catch(e){} }
    return null;
  };
  window.fastecClearSession = function(){
    try{ sessionStorage.removeItem('fastec_session'); localStorage.removeItem('fastec_session'); }catch(e){}
  };

  /* Token de acceso vigente. Si hay que renovarlo, lo hace UNA sola vez aunque varias peticiones lo pidan a la vez. */
  const jwtExp = t => { try{ return JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).exp * 1000; }catch(e){ return 0; } };
  const sessionStore = () => {
    for(const st of [sessionStorage, localStorage]){ try{ const s = JSON.parse(st.getItem('fastec_session') || 'null'); if(s && s.exp > Date.now()) return st; }catch(e){} }
    return null;
  };
  let refreshing = null;
  window.fastecToken = async function(){
    const C = window.FASTEC_CONFIG || {}, st = sessionStore();
    if(!st) throw new Error('Sesión cerrada');
    const ses = JSON.parse(st.getItem('fastec_session'));
    if(ses.at && jwtExp(ses.at) > Date.now() + 60000) return ses.at;
    if(!refreshing) refreshing = (async () => {
      const r = ses.rt && await fetch(C.supabaseUrl + '/auth/v1/token?grant_type=refresh_token', {method:'POST', headers:{apikey:C.supabaseAnonKey, 'Content-Type':'application/json'}, body: JSON.stringify({refresh_token: ses.rt})});
      if(!r || !r.ok){ fastecClearSession(); location.replace('login.html'); throw new Error('Sesión expirada'); }
      const j = await r.json(), cur = JSON.parse(st.getItem('fastec_session') || '{}');
      cur.at = j.access_token; cur.rt = j.refresh_token; st.setItem('fastec_session', JSON.stringify(cur));
      return cur.at;
    })().finally(() => { refreshing = null; });
    return refreshing;
  };
  /* Pregunta a Supabase si la cuenta es administradora (la tabla "admins" solo devuelve su propia fila) y
     corrige el rol guardado en el navegador. Devuelve 'admin' o 'user'; lanza error si no pudo comprobarlo. */
  window.fastecVerifyRole = async function(){
    const C = window.FASTEC_CONFIG || {}, t = await fastecToken();
    const r = await fetch(C.supabaseUrl + '/rest/v1/admins?select=user_id', {headers:{apikey:C.supabaseAnonKey, Authorization:'Bearer ' + t}});
    if(!r.ok) throw new Error('No se pudo verificar el rol (' + r.status + ')');
    const rows = await r.json(), role = Array.isArray(rows) && rows.length ? 'admin' : 'user';
    const st = sessionStore();
    if(st){ const s = JSON.parse(st.getItem('fastec_session')); s.role = role; st.setItem('fastec_session', JSON.stringify(s)); }
    return role;
  };

  /* ---- datos ---- */
  window.getPublishedData = () => clone(FASTEC_DEFAULT_DATA);
  window.getSiteData = function(){
    const pub = window.__FASTEC_REMOTE ? clone(window.__FASTEC_REMOTE) : clone(FASTEC_DEFAULT_DATA);
    if(fastecIsAdmin() && window.__FASTEC_ADMIN_DATA) return clone(window.__FASTEC_ADMIN_DATA);
    return pub;
  };

  /* ---- precios y tarjeta de producto (la misma en la web y en la vista previa del panel) ---- */
  const num = v => { const n = Number(String(v ?? '').replace(',', '.')); return isFinite(n) ? n : 0; };
  window.fastecMoney = n => 'S/ ' + Number(n).toLocaleString('es-PE', {minimumFractionDigits:2, maximumFractionDigits:2});

  window.fastecProductCard = function(p){
    const e = fastecEsc, price = num(p.price), old = num(p.oldPrice);
    const img = p.image
      ? `<img src="${e(p.image)}" alt="${e(p.name)}" loading="lazy">`
      : `<div class="product-placeholder"><span>FASTEC</span><small>Imagen pendiente</small></div>`;
    const badge = p.offer || (price > 0 && old > price ? '-' + Math.round((1 - price/old) * 100) + '%' : '');
    const priceHtml = price > 0
      ? `<span class="product-price">${fastecMoney(price)}${old > price ? ` <s class="product-old">${fastecMoney(old)}</s>` : ''}</span>`
      : `<span class="product-price product-price-ask">Consultar precio</span>`;
    const hasStock = p.stock !== '' && p.stock != null;
    const sn = Number(p.stock);
    const stock = hasStock ? (sn <= 0 ? 'Agotado' : (sn <= 3 ? 'Últimas unidades' : 'Disponible')) : '';
    const stockCls = hasStock ? (sn <= 0 ? 'out' : (sn <= 3 ? 'low' : 'in')) : '';
    return `<article class="catalog-card live-product-card" data-product-id="${e(p.id)}" data-product-name="${e(p.name)}" role="button" tabindex="0" title="Consultar ${e(p.name)} por WhatsApp">
      ${badge ? `<span class="product-badge">${e(badge)}</span>` : ''}
      <div class="catalog-photo live-photo">${img}</div>
      <span class="catalog-name">${e(p.name)}</span>
      ${/^\s*(sin\s*c[oó]digo)?\s*$/i.test(p.model || '') ? '' : `<span class="catalog-model">${e(p.model)}</span>`}
      ${priceHtml}
      ${stock ? `<span class="product-stock stock-${stockCls}">${stock}</span>` : ''}
      <div class="card-actions"><button type="button" class="btn-add" data-add="${e(p.id)}"${hasStock && sn <= 0 ? ' disabled' : ''}>${hasStock && sn <= 0 ? 'Agotado' : 'Agregar al carrito'}</button><button type="button" class="btn-fav" data-fav="${e(p.id)}" aria-label="Favorito" aria-pressed="false">♡</button></div>
      <span class="product-cta">Consultar por WhatsApp ›</span>
    </article>`;
  };

})();
