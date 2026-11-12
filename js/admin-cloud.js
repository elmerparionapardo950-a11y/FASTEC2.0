/* Panel FASTEC <-> Supabase. Usa el token del administrador (nunca la clave secreta).
   La seguridad real está en las reglas RLS: aunque alguien copie este código, sin ser admin no puede escribir. */
(function(){
  const C = window.FASTEC_CONFIG || {};
  const toNum = v => (v === '' || v == null || isNaN(Number(v))) ? null : Number(v);
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  async function req(path, opt){
    const t = await fastecToken(), o = opt || {};
    const r = await fetch(C.supabaseUrl + path, Object.assign({}, o, {headers: Object.assign({apikey:C.supabaseAnonKey, Authorization:'Bearer ' + t, 'Content-Type':'application/json'}, o.headers)}));
    if(!r.ok) throw new Error(r.status + ' ' + (await r.text()).slice(0, 200));
    return r.status === 204 ? null : r.json().catch(() => null);
  }

  /* fila de la base <-> objeto del panel */
  const fromRow = r => ({id:r.id, name:r.name, category:r.category, brand:r.brand||'', model:r.model||'', sku:r.sku||'', description:r.description||'',
    specs:r.specs||[], price:r.price==null?'':Number(r.price), oldPrice:r.old_price==null?'':Number(r.old_price), offer:r.offer||'',
    featured:!!r.featured, active:r.active!==false, image:r.image||'', stock:r.stock==null?'':r.stock});
  const toRow = p => ({id:p.id, name:p.name, category:p.category||'', brand:p.brand||'', model:p.model||'', sku:p.sku||'', description:p.description||'',
    specs:p.specs||[], price:toNum(p.price), old_price:toNum(p.oldPrice), offer:p.offer||'', featured:!!p.featured, active:p.active!==false,
    image:p.image||'', stock:toNum(p.stock), updated_at:new Date().toISOString()});
  const svcRow = s => ({id:s.id, name:s.name, category:s.category||'', description:s.description||'', icon:s.icon||'', image:s.image||'', active:s.active!==false});
  const COMP = ['name','logo','email','phone','whatsapp','address','description','facebook','instagram','tiktok','hours'];
  const compRow = c => Object.assign({id:1}, Object.fromEntries(COMP.filter(k => k in (c||{})).map(k => [k, c[k] || ''])));

  /* Carga los datos completos (incluye ocultos) para el panel */
  window.fastecCloudLoad = async function(){
    try{
      const [p, s, c] = await Promise.all([req('/rest/v1/products?select=*&order=id.asc'), req('/rest/v1/services?select=*&order=id.asc'), req('/rest/v1/company?select=*&id=eq.1')]);
      window.__FASTEC_ADMIN_DATA = {products: p.map(fromRow), services: s.map(x => Object.assign({}, x)), company: Object.assign({}, FASTEC_DEFAULT_DATA.company, c[0] ? Object.fromEntries(Object.entries(c[0]).filter(([k, v]) => v)) : {})};
    }catch(e){ console.error(e); alert('No se pudieron cargar los datos desde Supabase (' + e.message + '). Se muestran los datos locales y NO se guardarán cambios.'); window.__FASTEC_OFFLINE = true; }
  };

  /* Envía solo lo que cambió respecto a "antes" */
  window.fastecCloudPush = async function(now, before){
    if(window.__FASTEC_OFFLINE) throw new Error('Sin conexión con Supabase');
    const diff = (a, b) => ({
      up: a.filter(x => !b.some(y => y.id === x.id && same(x, y))),
      del: b.filter(y => !a.some(x => x.id === y.id)).map(y => y.id)
    });
    const P = diff(now.products, before.products), S = diff(now.services || [], before.services || []);
    const up = (table, rows) => rows.length && req('/rest/v1/' + table, {method:'POST', headers:{Prefer:'resolution=merge-duplicates,return=minimal'}, body: JSON.stringify(rows)});
    const rm = (table, ids) => ids.length && req('/rest/v1/' + table + '?id=in.(' + ids.join(',') + ')', {method:'DELETE'});
    await up('products', P.up.map(toRow)); await rm('products', P.del);
    await up('services', S.up.map(svcRow)); await rm('services', S.del);
    if(!same(now.company, before.company)) await up('company', [compRow(now.company)]);
  };

  /* Sube una imagen al almacenamiento y devuelve su URL pública */
  window.fastecUploadImage = async function(blob){
    const t = await fastecToken(), name = 'p-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7) + '.jpg';
    const r = await fetch(C.supabaseUrl + '/storage/v1/object/productos/' + name, {method:'POST', headers:{apikey:C.supabaseAnonKey, Authorization:'Bearer ' + t, 'Content-Type':'image/jpeg'}, body: blob});
    if(!r.ok) throw new Error('No se pudo subir la imagen (' + r.status + ')');
    return C.supabaseUrl + '/storage/v1/object/public/productos/' + name;
  };
})();
