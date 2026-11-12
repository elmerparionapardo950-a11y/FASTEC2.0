/* Capa de datos FASTEC: lee Supabase (API REST, sin librerías) y, si falla, usa data.js.
   Expone: fastecReady(fn) -> ejecuta fn cuando los datos remotos llegaron (o fallaron). */
(function(){
  const C = window.FASTEC_CONFIG || {};
  const TIMEOUT = 5000;
  const ok = C.supabaseUrl && C.supabaseAnonKey;
  const H = {apikey: C.supabaseAnonKey, Authorization: 'Bearer ' + C.supabaseAnonKey};

  async function get(table, query){
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), TIMEOUT);
    try{
      const r = await fetch(`${C.supabaseUrl}/rest/v1/${table}?${query || 'select=*'}`, {headers: H, signal: ctl.signal});
      if(!r.ok) throw new Error(table + ' ' + r.status);
      return await r.json();
    } finally { clearTimeout(t); }
  }
  /* Fila de la base -> formato que ya usa el sitio. Sin precio/stock => '' (nada inventado). */
  const nz = v => v == null ? '' : v;
  const mapProduct = r => ({
    id: r.id, name: r.name, category: r.category, brand: r.brand || '', sku: r.sku || '',
    model: [r.brand, r.model].filter(Boolean).join(' '),      // lo que ya muestra la tarjeta
    description: r.description || '', specs: Array.isArray(r.specs) ? r.specs : [],
    price: nz(r.price), oldPrice: nz(r.old_price), offer: r.offer || '',
    featured: !!r.featured, active: r.active !== false, image: r.image || '', stock: nz(r.stock)
  });

  window.fastecRemoteOk = false;
  const ready = !ok ? Promise.resolve() : Promise.all([
    get('products', 'select=*&order=id.asc'),
    get('services', 'select=*&order=id.asc'),
    get('company', 'select=*&id=eq.1'),
    get('home_settings', 'select=*&id=eq.1')
  ]).then(([p, s, c, h]) => {
    if(!p.length) throw new Error('sin productos');          // si la tabla está vacía, se queda data.js
    const base = JSON.parse(JSON.stringify(FASTEC_DEFAULT_DATA));
    window.__FASTEC_REMOTE = {
      products: p.map(mapProduct),
      services: s.length ? s.map(x => ({id:x.id, name:x.name, category:x.category, description:x.description, icon:x.icon, image:x.image, active:x.active})) : base.services,
      company: c[0] ? Object.assign({}, base.company, Object.fromEntries(Object.entries(c[0]).filter(([k, v]) => v))) : base.company,
      home: h[0] || {}
    };
    window.fastecRemoteOk = true;
  }).catch(e => console.warn('FASTEC: usando data.js (', e.message, ')'));

  window.fastecReady = fn => ready.then(fn, fn);
})();
