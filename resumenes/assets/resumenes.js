/* UNIverse · Resúmenes: rejilla con vistas previas y buscador, vista de documento, perfiles de autor y de
   quien sube, likes/guardados, subida y "Mis resúmenes". URLs limpias: /resumenes/<titulo>-<id>,
   /resumenes/tema/<tema>, /resumenes/curso/<curso>, /resumenes/autor/<autor>, /resumenes/u/<clave>. */
(() => {
  'use strict';
  const V = '20261114d';
  const $ = id => document.getElementById(id);
  const R = window.ResShared;
  const STATUS = { pending: 'En revisión', approved: 'Publicado', rejected: 'Rechazado', uploading: 'Subida incompleta' };
  const ERR = {
    google_login_required: 'Ingresa con Google para continuar.',
    title_required: 'Escribe un título de al menos 3 caracteres.',
    description_required: 'La descripción debe tener al menos 10 caracteres.',
    year_invalid: 'Elige el año.',
    type_not_allowed: 'Solo se aceptan archivos PDF, JPG, PNG o WebP.',
    type_mismatch: 'El archivo no es un PDF o una imagen válida.',
    size_invalid: 'El archivo está vacío.',
    captcha_required: 'Completa la verificación antes de enviar.',
    captcha_failed: 'La verificación no se completó. Inténtalo de nuevo.',
    captcha_not_configured: 'La subida no está disponible en este momento.',
    storage_not_configured: 'La subida no está disponible en este momento.',
    upload_limit_hour: 'Llegaste al límite de 3 subidas por hora. Inténtalo más tarde.',
    upload_limit_day: 'Llegaste al límite de 10 subidas por día. Inténtalo mañana.',
    rate_limited: 'Demasiados intentos seguidos. Espera un momento.'
  };
  const USER_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';
  const LIST_TITLE = 'Resúmenes y apuntes UNI y CEPREUNI gratis | UNIverse';

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  const saved = new Set(store.get('res_saved', []));
  const liked = new Set(store.get('res_liked', []));
  let clientId = store.get('res_client', '');
  if (!clientId) { clientId = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now()).replace(/[^a-z0-9]/gi, ''); store.set('res_client', clientId); }

  const S = { items: [], byId: new Map(), idx: null, temas: null, likes: {}, q: '', sort: 'rel', savedOnly: false, results: [], shown: 0, viewer: null, cfg: null, uploadsLoaded: false, scroll: {}, terms: [], route: { view: 'list' }, me: null };
  const Auth = () => window.UniverseGoogleAuth;
  const token = () => { try { return localStorage.getItem('universe_auth_token') || ''; } catch { return ''; } };
  const googleUser = () => { const u = Auth() && Auth().user(); return u && u.provider === 'google' && u.secureSession ? u : null; };

  async function api(path, method = 'GET', body, signal) {
    const headers = {};
    const t = token();
    if (t) headers.Authorization = 'Bearer ' + t;
    const raw = body instanceof Blob;
    if (body !== undefined && !raw) headers['Content-Type'] = 'application/json';
    const r = await fetch('/api/resumenes' + path, { method, headers, cache: 'no-store', signal, body: body === undefined ? undefined : raw ? body : JSON.stringify(body) });
    const out = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(out.error || 'http_' + r.status), { status: r.status, code: out.error });
    return out;
  }

  const fmtN = n => Number(n || 0).toLocaleString('es-PE');
  const bare = t => t.replace(/^[^A-Za-zÁÉÍÓÚÑáéíóúñ¿]+/, '');
  const cmpT = (a, b) => bare(a.t).localeCompare(bare(b.t), 'es', { numeric: true, sensitivity: 'base' });
  // Default order: most liked, newest community uploads, then files whose name says what they are.
  const quality = it => (it.p ? 1 : 0) + (it.m ? 1 : 0) + (it.t.includes(' · ') ? 0 : 1);
  function node(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ---------- datos ---------- */
  function setItems(list) {
    list.forEach(it => { it.likes = Number(S.likes[it.id]) || 0; });
    S.items = list;
    S.byId = new Map(list.map(it => [it.id, it]));
    S.idx = ResSearch.buildIndex(list, S.temas);
  }
  function mergeUploads(rows) {
    const base = S.items.filter(it => it.id[0] === 'b');
    const fresh = rows.map(r => Object.assign({ k: 'Aporte', f: r.t + '.' + r.e }, r, ResSearch.classify(S.idx, r.t + ' ' + (r.d || ''))));
    setItems(fresh.concat(base));
  }

  /* ---------- rejilla ---------- */
  const grid = $('grid');
  function scopeLabel(r) {
    if (!r.kind) return null;
    const first = S.items.find(it => R.matches(it, r));
    if (r.kind === 'tema') return first ? first.m : null;
    if (r.kind === 'curso') return first ? first.c : null;
    if (r.kind === 'autor') return first ? first.a : null;
    return first ? first.a : null;
  }
  function compute() {
    const q = S.q.trim();
    const r = S.route;
    let res = q ? (ResSearch.search(S.idx, q) || []).map(x => x.item) : S.items.slice();
    if (r.kind) res = res.filter(it => R.matches(it, r));
    S.terms = q ? ResSearch.norm(q).split(' ').filter(t => t.length > 1) : [];
    if (S.savedOnly) res = res.filter(it => saved.has(it.id));
    const sort = S.sort === 'rel' && !q ? 'default' : S.sort;
    if (sort === 'likes') res.sort((a, b) => b.likes - a.likes || cmpT(a, b));
    else if (sort === 'az') res.sort(cmpT);
    else if (sort === 'new') res.sort((a, b) => (b.at || 0) - (a.at || 0) || (b.y || 0) - (a.y || 0) || cmpT(a, b));
    else if (sort === 'default') res.sort((a, b) => b.likes - a.likes || (b.at || 0) - (a.at || 0) || quality(b) - quality(a) || cmpT(a, b));
    S.results = res;
    S.shown = 0;
    grid.textContent = '';
    renderMore();
    const meta = $('meta');
    meta.textContent = '';
    meta.append(node('b', 'num', fmtN(res.length)), res.length === 1 ? ' resultado' : q || S.savedOnly ? ' resultados' : ' resúmenes');
    renderEmpty(q);
  }
  function renderMore() {
    const end = Math.min(S.results.length, S.shown + 48);
    let html = '';
    for (let i = S.shown; i < end; i++) html += R.cardHTML(S.results[i], { terms: S.terms, eager: i < 4 });
    const from = S.shown;
    grid.insertAdjacentHTML('beforeend', html);
    S.shown = end;
    masonry(from);
  }
  // Row spans for the mosaic: read every new card's height first, then write (one layout pass per batch).
  function masonry(from = 0) {
    grid.classList.add('masonry');
    const lis = Array.from(grid.children).slice(from);
    const gap = parseFloat(getComputedStyle(grid).getPropertyValue('--gy')) || 0;
    const heights = lis.map(li => li.firstElementChild ? li.firstElementChild.getBoundingClientRect().height : 0);
    lis.forEach((li, i) => li.style.setProperty('--span', Math.ceil((heights[i] + gap) / 2)));
  }
  let gridWidth = 0;
  new ResizeObserver(([e]) => {
    const w = Math.round(e.contentRect.width);
    if (w && w !== gridWidth) { gridWidth = w; requestAnimationFrame(() => masonry(0)); }
  }).observe(grid);
  if (document.fonts) document.fonts.ready.then(() => masonry(0));
  function renderEmpty(q) {
    const empty = $('empty');
    empty.hidden = S.results.length > 0;
    if (empty.hidden) return;
    empty.textContent = '';
    if (S.savedOnly && !q) {
      empty.append(node('h2', '', 'Aún no guardas resúmenes'), node('p', '', 'Toca Guardar en cualquier resumen y aparecerá aquí.'));
    } else if (!q && S.route.kind) {
      empty.append(node('h2', '', 'Todavía no hay resúmenes publicados aquí'), node('p', '', 'Vuelve pronto o revisa todos los resúmenes.'));
    } else {
      empty.append(node('h2', '', 'Sin resultados para «' + q + '»'), node('p', '', 'Prueba con el curso o con otra palabra del tema.'));
      const tries = node('div', 'tries');
      ['Física', 'Doctrinas económicas', 'Estequiometría', 'Célula', 'Revolución francesa'].forEach(t => { const c = node('button', 'chip', t); c.type = 'button'; c.dataset.try = t; tries.append(c); });
      empty.append(tries);
    }
  }
  new IntersectionObserver(es => { if (es[0].isIntersecting && S.shown < S.results.length && !$('list-view').hidden) renderMore(); }, { rootMargin: '1200px 0px' }).observe($('more'));

  function renderHero() {
    const r = S.route;
    const label = scopeLabel(r);
    const scoped = !!r.kind;
    $('scope').hidden = !scoped;
    $('hero-pic').hidden = r.kind !== 'u';
    if (!scoped) {
      $('list-title').textContent = 'Resúmenes';
      $('hero-sub').innerHTML = '';
      $('hero-sub').append(node('b', 'num', fmtN(S.items.length)), ' resúmenes, formularios y mapas para leer y descargar');
      document.title = LIST_TITLE;
      return;
    }
    const count = S.items.filter(it => R.matches(it, r)).length;
    const name = label || (r.kind === 'u' ? 'Este usuario' : 'Sin resultados');
    $('list-title').textContent = name;
    const what = r.kind === 'u' ? (count === 1 ? ' resumen publicado' : ' resúmenes publicados') : count === 1 ? ' resumen' : ' resúmenes';
    $('hero-sub').innerHTML = '';
    $('hero-sub').append(node('b', 'num', fmtN(count)), what);
    if (r.kind === 'tema') { const c = S.items.find(it => R.matches(it, r)); if (c) $('hero-sub').append(' de ', Object.assign(node('a', '', c.c), { href: R.path.curso(c.c) })); }
    if (r.kind === 'u') {
      const first = S.items.find(it => R.matches(it, r));
      const pic = $('hero-pic');
      pic.textContent = R.initials(name);
      if (first && first.av) { const img = new Image(); img.alt = ''; img.referrerPolicy = 'no-referrer'; img.src = first.av; img.onerror = () => img.remove(); pic.append(img); }
    }
    const kind = { tema: 'Resúmenes de ', curso: 'Resúmenes de ', autor: 'Resúmenes de ', u: 'Resúmenes de ' }[r.kind];
    document.title = (label ? kind + label : 'Resúmenes') + ' | UNIverse';
  }

  let qTimer = 0;
  function setQuery(v, immediate) {
    S.q = v;
    $('clear').hidden = !v;
    clearTimeout(qTimer);
    const run = () => {
      compute();
      const u = new URL(location.href);
      if (v.trim()) u.searchParams.set('q', v.trim()); else u.searchParams.delete('q');
      history.replaceState(history.state, '', u.pathname + u.search);
    };
    if (immediate) run(); else qTimer = setTimeout(run, 110);
  }

  /* ---------- vista de un resumen ---------- */
  function setCanonical(href) { const l = document.querySelector('link[rel="canonical"]'); if (l) l.href = location.origin + href; }
  function openDoc(id) {
    const it = S.byId.get(id);
    const docV = $('doc-view');
    if (S.viewer) { S.viewer.destroy(); S.viewer = null; }
    $('list-view').hidden = true;
    docV.hidden = false;
    docV.classList.remove('enter'); void docV.offsetWidth; docV.classList.add('enter');
    document.body.classList.add('doc-open');
    $('add').classList.add('away');
    scrollTo(0, 0);
    const pages = $('pages');
    if (!it) {
      if (!S.uploadsLoaded) { pages.textContent = ''; return; } // the community list is still loading
      document.title = 'Resumen no disponible | UNIverse';
      $('doc-title').textContent = 'Este resumen no está disponible';
      ['doc-course', 'doc-meta', 'recs', 'doc-uploader'].forEach(k => { $(k).textContent = ''; });
      $('doc-desc').hidden = true;
      pages.textContent = '';
      document.querySelector('.doc-actions').hidden = true;
      return;
    }
    if (location.pathname !== R.path.doc(it)) history.replaceState(history.state, '', R.path.doc(it));
    setCanonical(R.path.doc(it));
    document.querySelector('.doc-actions').hidden = false;
    document.title = it.t + ' · ' + (it.m || it.c) + ' | UNIverse';
    $('doc-info').style.setProperty('--hue', R.HUE[it.c] ?? 30);
    const course = $('doc-course');
    course.textContent = it.c;
    course.href = R.path.curso(it.c);
    $('doc-title').textContent = it.t;
    $('doc-uploader').innerHTML = R.uploaderHTML(it);
    $('doc-desc').hidden = !it.d;
    $('doc-desc').textContent = it.d || '';
    const dl = $('doc-meta');
    dl.innerHTML = R.metaRows(it).map(([k, v]) => '<dt>' + k + '</dt><dd>' + v + '</dd>').join('') + '<dt id="doc-pages-k" hidden>Páginas</dt><dd id="doc-pages-n" hidden></dd>';
    syncLike(it);
    syncSave(it);
    const d = $('download');
    d.href = R.path.file(it, true);
    d.setAttribute('download', it.f || it.t);
    S.viewer = ResViewer.render(pages, {
      url: R.path.file(it), ext: it.e, alt: it.t, poster: R.path.thumb(it) || undefined, posterRatio: R.ratio(it).css,
      onPages: n => { if (it.e === 'pdf') { $('doc-pages-n').textContent = fmtN(n); $('doc-pages-n').hidden = $('doc-pages-k').hidden = false; } },
      onError: () => {
        pages.textContent = '';
        const box = node('div', 'doc-state');
        const src = R.path.thumb(it);
        // The file could not be read here: keep its first page visible and offer the original.
        if (src) { const pg = node('div', 'page poster'); pg.style.aspectRatio = R.ratio(it).css; const img = new Image(); img.src = src; img.alt = 'Vista previa de ' + it.t; pg.append(img); pages.append(pg); }
        box.append(node('h2', '', 'La vista completa no cargó'), node('p', '', 'Puedes descargarlo en su formato original.'));
        const a = node('a', 'act primary', 'Descargar');
        a.href = R.path.file(it, true);
        a.setAttribute('download', it.f || it.t);
        box.append(a);
        pages.append(box);
      }
    });
    const recs = ResSearch.recommend(S.idx, it, 8);
    $('recs').innerHTML = recs.map(r => R.recHTML(r.item)).join('');
    $('recs-title').parentElement.hidden = !recs.length;
  }
  function showList() {
    if (S.viewer) { S.viewer.destroy(); S.viewer = null; }
    $('doc-view').hidden = true;
    $('list-view').hidden = false;
    document.body.classList.remove('doc-open');
    $('add').classList.remove('away');
    setCanonical(location.pathname.replace(/\/+$/, '') || '/resumenes');
    renderHero();
    compute();
    const y = S.scroll[location.pathname] || 0;
    requestAnimationFrame(() => scrollTo(0, y));
  }
  function route() {
    const legacy = new URLSearchParams(location.search).get('r');
    if (legacy) { const it = S.byId.get(legacy); history.replaceState({}, '', it ? R.path.doc(it) : '/resumenes'); }
    S.route = R.route(location.pathname);
    if (S.route.view === 'doc') return openDoc(S.route.id);
    if (S.route.view === 'missing') S.route = { view: 'list' };
    const q = new URLSearchParams(location.search).get('q') || '';
    S.q = q;
    $('q').value = q;
    $('clear').hidden = !q;
    showList();
  }
  function go(href) {
    if (!$('list-view').hidden) S.scroll[location.pathname] = scrollY;
    history.pushState({ inApp: true }, '', href);
    route();
  }

  /* ---------- like y guardar ---------- */
  function syncLike(it) {
    const on = liked.has(it.id);
    $('like').setAttribute('aria-pressed', on);
    $('like').setAttribute('aria-label', on ? 'Quitar me gusta' : 'Me gusta');
    $('like-n').textContent = fmtN(it.likes);
  }
  function syncSave(it) {
    const on = saved.has(it.id);
    $('save').setAttribute('aria-pressed', on);
    $('save-t').textContent = on ? 'Guardado' : 'Guardar';
  }
  const currentItem = () => S.route.view === 'doc' ? S.byId.get(S.route.id) : null;
  async function toggleLike() {
    const it = currentItem();
    if (!it) return;
    const on = !liked.has(it.id);
    on ? liked.add(it.id) : liked.delete(it.id);
    it.likes = Math.max(0, it.likes + (on ? 1 : -1));
    store.set('res_liked', [...liked]);
    syncLike(it);
    const btn = $('like');
    btn.classList.remove('pop');
    if (on) { void btn.offsetWidth; btn.classList.add('pop'); }
    try {
      const r = await api('/like', 'POST', { id: it.id, on, clientId });
      it.likes = r.likes;
      S.likes[it.id] = r.likes;
      if (currentItem() === it) syncLike(it);
    } catch {
      on ? liked.delete(it.id) : liked.add(it.id);
      it.likes = Math.max(0, it.likes + (on ? -1 : 1));
      store.set('res_liked', [...liked]);
      if (currentItem() === it) syncLike(it);
      toast('No se pudo registrar. Inténtalo de nuevo.');
    }
  }
  function toggleSave() {
    const it = currentItem();
    if (!it) return;
    const on = !saved.has(it.id);
    on ? saved.add(it.id) : saved.delete(it.id);
    store.set('res_saved', [...saved]);
    syncSave(it);
    toast(on ? 'Guardado en este dispositivo' : 'Quitado de guardados');
  }
  async function share() {
    const it = currentItem();
    if (!it) return;
    const url = location.origin + R.path.doc(it);
    if (navigator.share && matchMedia('(pointer: coarse)').matches) { try { await navigator.share({ title: it.t, url }); } catch {} return; }
    try { await navigator.clipboard.writeText(url); toast('Enlace copiado'); } catch { toast(url); }
  }

  let toastTimer = 0;
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('on'), 2200);
  }

  /* ---------- hojas ---------- */
  function openSheet(d) { if (!d.open) { d.classList.remove('closing'); d.showModal(); } }
  function closeSheet(d) {
    if (!d.open || d.classList.contains('closing')) return;
    d.classList.add('closing');
    const done = () => { d.classList.remove('closing'); d.close(); };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return done();
    setTimeout(done, 230);
  }
  document.querySelectorAll('dialog.sheet').forEach(d => {
    d.addEventListener('cancel', e => { e.preventDefault(); closeSheet(d); });
    d.addEventListener('click', e => { if (e.target === d || e.target.closest('[data-close]')) closeSheet(d); });
  });
  const gsiDone = new WeakSet();
  function showGate(gate) {
    gate.hidden = false;
    const host = gate.querySelector('[data-google-signin]');
    if (host && !gsiDone.has(host) && Auth()) { gsiDone.add(host); Auth().open(host); }
  }

  /* ---------- cuenta ---------- */
  function picInto(el, name, avatar) {
    el.textContent = R.initials(name);
    if (avatar) { const img = new Image(); img.alt = ''; img.referrerPolicy = 'no-referrer'; img.src = avatar; img.onerror = () => img.remove(); el.append(img); }
  }
  function renderAccount() {
    const u = googleUser() || (Auth() && Auth().user());
    const pic = $('acct-pic');
    if (u) picInto(pic, u.name, u.avatar); else pic.innerHTML = USER_ICON;
    $('acct-name').textContent = u ? String(u.name || 'Mi cuenta').split(' ')[0] : 'Ingresar';
    $('acct').setAttribute('aria-label', u ? 'Mis resúmenes' : 'Ingresar');
  }
  async function loadMe() {
    if (!googleUser()) { S.me = null; return null; }
    S.me = await api('/me').catch(e => (e.status === 401 ? null : S.me));
    return S.me;
  }
  async function renderMe() {
    const u = googleUser();
    $('me-gate').hidden = true;
    $('me-panel').hidden = !u;
    if (!u) return showGate($('me-gate'));
    $('me-name').textContent = u.name || 'Tu cuenta';
    picInto($('me-pic'), u.name, u.avatar);
    const list = $('mine');
    list.textContent = '';
    $('me-count').textContent = 'Cargando…';
    const r = await loadMe();
    if (!r) { $('me-count').textContent = 'No se pudo cargar tu lista. Vuelve a ingresar.'; return; }
    $('admin-link').hidden = !r.admin;
    const pub = $('my-page');
    pub.hidden = !r.items.some(it => it.status === 'approved');
    pub.href = R.path.user(r.key);
    $('me-count').textContent = (r.publicName ? 'Publicas como ' + r.publicName + '. ' : '') + (r.items.length ? fmtN(r.items.length) + (r.items.length === 1 ? ' resumen subido' : ' resúmenes subidos') : 'Aún no subes resúmenes');
    r.items.forEach(it => {
      const li = document.createElement('li');
      const t = it.status === 'approved' ? node('a', '', it.t) : node('b', '', it.t);
      if (it.status === 'approved') t.href = R.path.doc(it);
      const st = node('span', 'status ' + it.status, STATUS[it.status] || it.status);
      const when = it.createdAt ? new Date(it.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
      const sm = node('small', '', [R.fmtExt(it.e) + ' · ' + R.fmtSize(it.s), it.y, when].filter(Boolean).join(' · ') + (it.status === 'rejected' && it.note ? '. Motivo: ' + it.note : ''));
      li.append(t, st, sm);
      list.append(li);
    });
  }

  /* ---------- subir ---------- */
  const up = { file: null, captcha: '', widget: null, confirmedDup: false, ctrl: null, id: '' };
  async function ensureCfg() {
    if (!S.cfg) S.cfg = await api('/config').catch(() => ({ uploads: false, turnstileSiteKey: '' }));
    return S.cfg;
  }
  function fillYears() {
    const sel = $('year');
    if (sel.options.length) return;
    sel.append(new Option('Elige el año', ''));
    for (let y = new Date().getFullYear(); y >= 2015; y--) sel.append(new Option(String(y), String(y)));
    sel.options[0].disabled = true;
    sel.value = '';
  }
  async function renderUpload() {
    const u = googleUser();
    const busy = !$('up-progress').hidden || !$('up-done').hidden;
    $('up-gate').hidden = true;
    $('up-form').hidden = !u || busy;
    if (!u) return showGate($('up-gate'));
    if (busy) return;
    fillYears();
    const cfg = await ensureCfg();
    $('up-off').hidden = cfg.uploads !== false;
    $('up-send').disabled = cfg.uploads === false;
    if (cfg.uploads && cfg.turnstileSiteKey) mountCaptcha(cfg.turnstileSiteKey);
    const me = S.me || await loadMe();
    $('up-as').hidden = !(me && me.publicName);
    if (me && me.publicName) $('up-as-name').textContent = me.publicName;
  }
  function mountCaptcha(key) {
    if (up.widget !== null) return;
    up.widget = 'loading';
    const draw = () => {
      up.widget = turnstile.render('#captcha', {
        sitekey: key, theme: document.documentElement.dataset.theme === 'light' ? 'light' : 'dark', size: 'flexible', language: 'es',
        callback: t => { up.captcha = t; }, 'expired-callback': () => { up.captcha = ''; }, 'error-callback': () => { up.captcha = ''; }
      });
    };
    if (window.turnstile) return draw();
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = draw;
    s.onerror = () => { up.widget = null; };
    document.head.append(s);
  }
  function resetCaptcha() { up.captcha = ''; if (window.turnstile && up.widget && up.widget !== 'loading') turnstile.reset(up.widget); }

  const EXT_MIME = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
  async function sniff(file) {
    const b = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    const s = String.fromCharCode(...b);
    if (s.startsWith('%PDF')) return 'application/pdf';
    if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
    if (b[0] === 0x89 && s.slice(1, 4) === 'PNG') return 'image/png';
    if (s.startsWith('RIFF') && s.slice(8, 12) === 'WEBP') return 'image/webp';
    return '';
  }
  function fieldError(id, msg) {
    const f = $(id);
    f.querySelector('.field-err')?.remove();
    if (msg) { f.dataset.error = ''; const p = node('p', 'field-err', msg); p.id = id + '-err'; f.append(p); } else delete f.dataset.error;
  }
  async function pickFile(file) {
    up.file = null;
    up.thumb = null;
    fieldError('f-file', '');
    $('file-name').textContent = 'Elige un PDF o una imagen';
    document.getElementById('drop-prev')?.remove();
    if (!file) return;
    const ext = (file.name.match(/\.([a-z0-9]+)$/i) || [])[1]?.toLowerCase();
    const mime = EXT_MIME[ext];
    if (!mime) return fieldError('f-file', ERR.type_not_allowed);
    if (!file.size) return fieldError('f-file', ERR.size_invalid);
    if (await sniff(file) !== mime) return fieldError('f-file', ERR.type_mismatch);
    up.file = { blob: file, mime, name: file.name };
    $('file-name').textContent = file.name;
    $('file-hint').textContent = R.fmtExt(ext === 'jpeg' ? 'jpg' : ext) + ' · ' + R.fmtSize(file.size);
    if (!$('title').value.trim()) { $('title').value = file.name.replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ').replace(/^copia de\s+/i, '').trim().slice(0, 120); similar(); }
    // The same preview the library will show; made here so the server never has to open the file.
    up.thumb = ResViewer.snapshot(file, mime === 'application/pdf').then(t => {
      if (t && up.file && up.file.blob === file) { const u = URL.createObjectURL(t.blob); const img = new Image(); img.id = 'drop-prev'; img.alt = ''; img.onload = () => URL.revokeObjectURL(u); img.src = u; document.querySelector('.drop-ic').append(img); }
      return t;
    });
  }

  let simTimer = 0;
  function similar() {
    clearTimeout(simTimer);
    simTimer = setTimeout(() => {
      const box = $('similar');
      const q = $('title').value.trim();
      up.confirmedDup = false;
      $('up-send').textContent = 'Enviar a revisión';
      const res = q.length >= 3 ? (ResSearch.search(S.idx, q) || []).filter(r => r.cov === 1 && r.score >= 5).slice(0, 4) : [];
      box.hidden = !res.length;
      box.classList.remove('strong');
      box.textContent = '';
      if (!res.length) return;
      box.append(node('h3', '', res.length === 1 ? 'Ya hay un resumen parecido' : 'Ya hay ' + res.length + ' resúmenes parecidos'));
      const ol = document.createElement('ol');
      res.forEach(({ item }) => {
        const li = document.createElement('li');
        const a = node('a', '', item.t);
        a.href = R.path.doc(item);
        a.target = '_blank';
        a.rel = 'noopener';
        a.append(node('span', '', item.c));
        li.append(a);
        ol.append(li);
      });
      box.append(ol);
    }, 180);
  }

  async function submitUpload(e) {
    e.preventDefault();
    $('up-err').hidden = true;
    const title = $('title').value.trim(), desc = $('desc').value.trim(), year = $('year').value;
    let bad = false;
    if (!up.file) { if ($('f-file').dataset.error === undefined) fieldError('f-file', 'Elige el archivo.'); bad = true; }
    fieldError('f-title', title.length < 3 ? ERR.title_required : ''); bad ||= title.length < 3;
    fieldError('f-desc', desc.length < 10 ? ERR.description_required : ''); bad ||= desc.length < 10;
    fieldError('f-year', !year ? ERR.year_invalid : ''); bad ||= !year;
    if (bad) { $('up-form').querySelector('[data-error] input, [data-error] textarea, [data-error] select')?.focus(); return; }
    const box = $('similar');
    if (!box.hidden && !up.confirmedDup) {
      up.confirmedDup = true;
      box.classList.add('strong');
      box.querySelector('h3').textContent = 'Antes de enviar: revisa si ya está en la biblioteca';
      $('up-send').textContent = 'Es distinto, enviar a revisión';
      box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    if (S.cfg && S.cfg.turnstileSiteKey && !up.captcha) { $('up-err').textContent = ERR.captcha_required; $('up-err').hidden = false; return; }
    await doUpload({ title, description: desc, year: Number(year) });
  }

  async function doUpload(fields) {
    const file = up.file;
    const thumb = up.thumb;
    $('up-form').hidden = true;
    $('up-progress').hidden = false;
    setProgress(0, 'Preparando…');
    up.ctrl = new AbortController();
    try {
      const start = await api('/uploads/start', 'POST', Object.assign({ name: file.name, mime: file.mime, size: file.blob.size, captcha: up.captcha }, fields), up.ctrl.signal);
      resetCaptcha();
      up.id = start.id;
      const queue = Array.from({ length: start.parts }, (_, i) => i + 1);
      let sent = 0;
      setProgress(0, 'Subiendo…');
      const worker = async () => {
        while (queue.length) {
          const n = queue.shift();
          const blob = file.blob.slice((n - 1) * start.partSize, Math.min(n * start.partSize, file.blob.size));
          for (let attempt = 1; ; attempt++) {
            try { await api('/uploads/' + start.id + '/part/' + n, 'PUT', blob, up.ctrl.signal); break; } catch (err) {
              if (up.ctrl.signal.aborted || attempt >= 4 || (err.status && err.status < 500 && err.status !== 429)) throw err;
              await new Promise(r => setTimeout(r, 800 * attempt));
            }
          }
          sent += blob.size;
          setProgress(sent / file.blob.size, 'Subiendo…');
        }
      };
      const sendThumb = (thumb || Promise.resolve(null)).then(t => t && api('/uploads/' + start.id + '/thumb?r=' + t.r.replace(':', 'x'), 'PUT', t.blob, up.ctrl.signal)).catch(() => null); // a missing preview never blocks the upload
      await Promise.all([worker(), worker(), worker(), sendThumb]);
      setProgress(1, 'Verificando el archivo…');
      await api('/uploads/' + start.id + '/complete', 'POST', {}, up.ctrl.signal);
      $('up-progress').hidden = true;
      $('up-done').hidden = false;
      resetForm();
    } catch (err) {
      resetCaptcha();
      if (up.id) api('/uploads/' + up.id + '/abort', 'POST', {}).catch(() => {});
      $('up-progress').hidden = true;
      $('up-form').hidden = false;
      if (err.name !== 'AbortError') { $('up-err').textContent = ERR[err.code] || 'No se pudo subir el archivo. Revisa tu conexión e inténtalo de nuevo.'; $('up-err').hidden = false; }
      if (err.status === 401) renderUpload();
    } finally {
      up.id = '';
      up.ctrl = null;
    }
  }
  function setProgress(p, label) {
    const pct = Math.round(p * 100);
    $('up-step').textContent = label;
    $('up-pct').textContent = pct + ' %';
    $('up-bar').setAttribute('aria-valuenow', pct);
    $('up-bar').firstElementChild.style.transform = 'scaleX(' + p + ')';
  }
  function resetForm() {
    $('up-form').reset();
    up.file = null;
    up.thumb = null;
    up.confirmedDup = false;
    $('file-name').textContent = 'Elige un PDF o una imagen';
    $('file-hint').textContent = 'PDF, JPG, PNG o WebP · sin límite de tamaño';
    document.getElementById('drop-prev')?.remove();
    $('similar').hidden = true;
    $('up-send').textContent = 'Enviar a revisión';
    ['f-file', 'f-title', 'f-desc', 'f-year'].forEach(id => fieldError(id, ''));
    $('year').value = '';
  }

  /* ---------- eventos ---------- */
  function bind() {
    $('q').addEventListener('input', e => setQuery(e.target.value));
    $('q').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); setQuery(e.target.value, true); e.target.blur(); } });
    $('clear').addEventListener('click', () => { $('q').value = ''; setQuery('', true); $('q').focus(); });
    $('sort').addEventListener('change', e => { S.sort = e.target.value; compute(); });
    $('saved').addEventListener('click', e => { S.savedOnly = !S.savedOnly; e.currentTarget.setAttribute('aria-pressed', S.savedOnly); compute(); });
    $('empty').addEventListener('click', e => { const t = e.target.closest('[data-try]'); if (t) { $('q').value = t.dataset.try; setQuery(t.dataset.try, true); } });
    // In-page navigation for every /resumenes link (cards, recommendations, topic, course, author, uploader).
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="/resumenes"]');
      if (!a || a.target || a.hasAttribute('download') || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (a.closest('dialog') || /^\/resumenes\/admin/.test(a.getAttribute('href'))) return;
      e.preventDefault();
      go(a.getAttribute('href'));
    });
    $('back').addEventListener('click', e => {
      e.preventDefault();
      if (history.state && history.state.inApp) history.back();
      else go('/resumenes');
    });
    addEventListener('popstate', route);
    $('like').addEventListener('click', toggleLike);
    $('save').addEventListener('click', toggleSave);
    $('share').addEventListener('click', share);
    $('theme').addEventListener('click', () => {
      const t = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = t;
      try { localStorage.setItem('res_theme', t); } catch {}
      document.querySelector('meta[name="theme-color"]').content = t === 'light' ? '#f7f7f5' : '#08080a';
    });
    document.addEventListener('keydown', e => {
      if (document.querySelector('dialog[open]')) return;
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
      if (e.key === '/' && !typing && !$('list-view').hidden) { e.preventDefault(); $('q').focus(); }
      if (e.key === 'Escape' && !$('doc-view').hidden && !typing) $('back').click();
    });
    $('add').addEventListener('click', () => { openSheet($('up-sheet')); renderUpload(); });
    $('acct').addEventListener('click', () => { openSheet($('me-sheet')); renderMe(); });
    $('up-mine').addEventListener('click', () => { closeSheet($('up-sheet')); setTimeout(() => { openSheet($('me-sheet')); renderMe(); }, 240); });
    $('up-again').addEventListener('click', () => { $('up-done').hidden = true; renderUpload(); });
    $('up-cancel').addEventListener('click', () => up.ctrl && up.ctrl.abort());
    $('up-form').addEventListener('submit', submitUpload);
    $('title').addEventListener('input', similar);
    $('file').addEventListener('change', e => pickFile(e.target.files[0]));
    ['dragenter', 'dragover'].forEach(t => $('drop').addEventListener(t, e => { e.preventDefault(); $('drop').classList.add('over'); }));
    ['dragleave', 'drop'].forEach(t => $('drop').addEventListener(t, () => $('drop').classList.remove('over')));
    $('drop').addEventListener('drop', e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) pickFile(f); });
    ['f-title', 'f-desc', 'f-year'].forEach(id => $(id).addEventListener('input', () => { if ($(id).dataset.error !== undefined) fieldError(id, ''); }));
    $('signout').addEventListener('click', () => { Auth() && Auth().signOut(); S.me = null; closeSheet($('me-sheet')); toast('Sesión cerrada'); });
    addEventListener('universe-google-auth', () => {
      renderAccount();
      if ($('me-sheet').open) renderMe();
      if ($('up-sheet').open) renderUpload();
    });
    addEventListener('beforeunload', e => { if (up.ctrl) { e.preventDefault(); e.returnValue = ''; } });
  }

  async function boot() {
    bind();
    renderAccount();
    try {
      const [cat, temas] = await Promise.all([
        fetch('/resumenes/data/catalogo.json?v=' + V).then(r => r.json()),
        fetch('/resumenes/data/temas.json?v=' + V).then(r => r.json())
      ]);
      S.temas = temas;
      setItems(cat);
      route();
    } catch {
      grid.textContent = '';
      $('empty').hidden = false;
      $('empty').textContent = '';
      $('empty').append(node('h2', '', 'No se pudo cargar la biblioteca'), node('p', '', 'Revisa tu conexión y recarga la página.'));
      return;
    }
    const [list, likes] = await Promise.all([api('/list').catch(() => ({ items: [] })), api('/likes').catch(() => ({ likes: {} }))]);
    S.likes = likes.likes || {};
    mergeUploads(list.items || []);
    S.uploadsLoaded = true;
    const open = currentItem();
    if (S.route.view === 'doc') { if (open && $('pages').childElementCount) syncLike(open); else openDoc(S.route.id); }
    else { renderHero(); compute(); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
