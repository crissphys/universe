(() => {
  'use strict';

  // platform.json is the same book list the rest of the site uses
  const DATA_URL = '/universe-ui/data/platform.json';
  const BASE = '/biblioteca/lumbreras/';
  const COVERS_URL = BASE + 'covers/manifest.json';
  let covers = {};
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // Light WebP covers (240/480w) with the original file as fallback
  const SIZES = {
    card: '(min-width: 1200px) 200px, (min-width: 900px) 22vw, (min-width: 600px) 30vw, 46vw',
    list: '56px', shelf: '116px', related: '72px', sheet: '(min-width: 768px) 300px, 56vw'
  };
  const coverSrc = (b, size) => {
    if (!b.thumb) return `src="${esc(b.image.replace(/([?&]sz=)w\d+/, '$1w480'))}"`; // Drive thumbnails: ask for a small one
    const base = BASE + 'covers/' + encodeURI(b.thumb.t);
    return `src="${base}-240.webp" srcset="${base}-240.webp 240w, ${base}-480.webp 480w" sizes="${SIZES[size]}"`;
  };
  const tint = b => b.thumb ? ` style="--tint:${b.thumb.c}"` : '';
  const fold = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const norm = s => ' ' + fold(s).replace(/[^a-z0-9ñ]+/g, ' ').trim() + ' ';
  const pad2 = n => String(n).padStart(2, '0');
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const SMALL = new Set(['de', 'del', 'y', 'la', 'el', 'las', 'los', 'en']);
  const titleCase = s => s !== s.toUpperCase() ? s : s.toLowerCase().split(' ')
    .map((w, i) => (i && SMALL.has(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const ICON = {
    down: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 8 5 5 5-5"/></svg>',
    star: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m10 2.8 2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L2.8 8.1l5-.7z"/></svg>'
  };

  const TYPES = [['lib', 'Libros'], ['pr', 'Problemas resueltos'], ['sol', 'Solucionarios']];
  const COURSES = [
    ['fisica', 'Física'], ['quimica', 'Química'], ['algebra', 'Álgebra'], ['aritmetica', 'Aritmética'],
    ['geometria', 'Geometría'], ['trigonometria', 'Trigonometría'], ['razonamiento matematico', 'R. Matemático'],
    ['razonamiento verbal', 'R. Verbal'], ['lenguaje', 'Lenguaje'], ['literatura', 'Literatura'],
    ['historia', 'Historia'], ['geografia', 'Geografía'], ['economia', 'Economía'], ['biologia', 'Biología'],
    ['anatomia', 'Anatomía'], ['filosofia', 'Filosofía'], ['psicologia', 'Psicología'], ['logica', 'Lógica']
  ].map(([k, label]) => ({ k, label, slug: k.replace(/ /g, '-') }));
  const ALIAS = {
    rm: 'razonamiento matematico', rv: 'razonamiento verbal', trigo: 'trigonometria', geo: 'geometria',
    aritm: 'aritmetica', arit: 'aritmetica', alg: 'algebra', quim: 'quimica', fis: 'fisica', bio: 'biologia',
    sol: 'solucionario', solu: 'solucionario', pr: 'problemas resueltos', lit: 'literatura', len: 'lenguaje',
    hist: 'historia', eco: 'economia', filo: 'filosofia', psico: 'psicologia', cepre: 'cepreuni'
  };
  const PRETTY = {
    'razonamiento matematico': 'Razonamiento Matemático', 'razonamiento verbal': 'Razonamiento Verbal',
    trigonometria: 'Trigonometría', geometria: 'Geometría', aritmetica: 'Aritmética', algebra: 'Álgebra',
    quimica: 'Química', fisica: 'Física', biologia: 'Biología', solucionario: 'Solucionario',
    'problemas resueltos': 'Problemas resueltos', economia: 'Economía', filosofia: 'Filosofía', psicologia: 'Psicología'
  };
  const ROMAN = { 1: 'i', 2: 'ii', 3: 'iii', 4: 'iv', 5: 'v', 6: 'vi', 7: 'vii', 8: 'viii', 9: 'ix', 10: 'x' };

  /* ---------- Storage (per-browser conveniences only) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('lumb:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('lumb:' + k, JSON.stringify(v)); } catch { /* storage blocked */ } }
  };
  let saved = new Set(store.get('saved', []));
  let recent = store.get('recent', []);
  const persistSaved = () => store.set('saved', [...saved]);

  /* ---------- Data ---------- */
  let model = null;
  const slugify = s => fold(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  function buildModel(list, meta = {}) {
    const books = [];
    const collections = [];
    const colByName = new Map();
    list.forEach(b => {
      if (!b || !b.url || b.upcoming) return;
      let col = colByName.get(b.catalog);
      if (!col) {
        const m = meta[b.catalog] || {};
        col = { slug: m.slug || slugify(b.catalog), number: pad2(collections.length + 1), name: titleCase(b.catalog), description: m.description || '', groups: [], books: [], _g: new Map() };
        colByName.set(b.catalog, col); collections.push(col);
      }
      const gname = b.section || '';
      let grp = col._g.get(gname);
      if (!grp) { grp = { slug: slugify(gname) || 'g', name: gname || null, books: [], col }; col._g.set(gname, grp); col.groups.push(grp); }
      const k = norm([b.title, b.series, gname].join(' '));
      const type = k.includes(' solucionario') ? 'sol' : k.includes('problemas resueltos') ? 'pr' : 'lib';
      const course = COURSES.find(x => k.includes(' ' + x.k));
      let id = ((b.url.match(/\/d\/([\w-]+)/) || b.url.match(/[?&]id=([\w-]+)/) || [, String(books.length)])[1]).slice(0, 10);
      if (books.some(x => x.id === id)) id += '-' + books.length;
      const book = {
        n: books.length, id, title: b.title, series: b.series, image: b.image, driveUrl: b.url,
        alt: `Portada de ${b.title}`, col, group: grp, type, course: course || null, thumb: covers[b.image] || null,
        key: norm([b.title, b.series, gname, col.name, type === 'sol' ? 'solucionario' : ''].join(' '))
      };
      books.push(book); grp.books.push(book); col.books.push(book);
    });
    collections.forEach(c => delete c._g);
    const byId = new Map(books.map(b => [b.id, b]));
    return { collections, books, byId };
  }

  /* ---------- State + URL ---------- */
  const state = { q: '', tipo: '', curso: '', estante: false, view: store.get('view', 'grid') };
  function readURL() {
    const p = new URLSearchParams(location.search);
    state.q = p.get('q') || '';
    state.tipo = TYPES.some(t => t[0] === p.get('tipo')) ? p.get('tipo') : '';
    state.curso = COURSES.some(c => c.slug === p.get('curso')) ? p.get('curso') : '';
    state.estante = p.get('estante') === '1';
  }
  function writeURL() {
    const p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.tipo) p.set('tipo', state.tipo);
    if (state.curso) p.set('curso', state.curso);
    if (state.estante) p.set('estante', '1');
    const qs = p.toString();
    history.replaceState(history.state, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
  }
  const filtering = () => !!(state.q.trim() || state.tipo || state.curso || state.estante);

  /* ---------- Search ---------- */
  function parseQuery(q) {
    const raw = fold(q).replace(/[^a-z0-9ñ]+/g, ' ').trim().split(' ').filter(Boolean);
    const aliasHits = [];
    const tokens = raw.map(t => {
      const v = [t];
      if (ALIAS[t]) { v.push(ALIAS[t]); aliasHits.push([t, ALIAS[t]]); }
      if (ROMAN[t]) v.push(' ' + ROMAN[t] + ' ');
      return v;
    });
    return { tokens, aliasHits, needles: tokens.flat().map(s => s.trim()).filter(s => s.length >= 2) };
  }
  const matches = (b, tokens) => tokens.every(vs => vs.some(v => b.key.includes(v)));

  function highlight(text, needles) {
    if (!needles.length) return esc(text);
    const f = [...text].map(ch => fold(ch).charAt(0) || ch).join('');
    const marks = new Array(text.length).fill(false);
    needles.forEach(nd => {
      let i = f.indexOf(nd);
      while (i !== -1) { for (let k = i; k < i + nd.length; k++) marks[k] = true; i = f.indexOf(nd, i + nd.length); }
    });
    let out = '', open = false;
    [...text].forEach((ch, i) => {
      if (marks[i] && !open) { out += '<mark>'; open = true; }
      if (!marks[i] && open) { out += '</mark>'; open = false; }
      out += esc(ch);
    });
    return out + (open ? '</mark>' : '');
  }

  function applyFilters() {
    const { tokens, aliasHits, needles } = parseQuery(state.q);
    let list = model.books;
    if (state.tipo) list = list.filter(b => b.type === state.tipo);
    if (state.curso) list = list.filter(b => b.course && b.course.slug === state.curso);
    if (state.estante) list = list.filter(b => saved.has(b.id));
    if (tokens.length) list = list.filter(b => matches(b, tokens));
    return { list, tokens, aliasHits, needles };
  }

  /* ---------- Hero ---------- */
  function splitTitle() {
    const h = $('#hero-title');
    const text = h.textContent;
    h.setAttribute('aria-label', text);
    h.innerHTML = [...text].map((ch, i) => `<span class="ch" aria-hidden="true" style="--i:${i}">${esc(ch)}</span>`).join('');
  }

  function initCosmos() {
    const root = $('.cosmos');
    if (!window.Cosmos) return;
    window.Cosmos(root, model.collections, {
      onHover: c => $$('.gal').forEach(a => a.classList.toggle('is-hot', !!c && a.getAttribute('href') === '#' + c.slug)),
      onSelect: c => goToCollection(c.slug)
    });
    requestAnimationFrame(() => root.classList.add('is-live'));
  }

  function goToCollection(slug) {
    if (filtering()) resetFilters();
    const sec = document.getElementById(slug);
    if (!sec) return;
    sec.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(history.state, '', location.pathname + '#' + slug);
  }

  /* ---------- Cards ---------- */
  let eagerLeft = 4;
  function bookCard(b, opts = {}) {
    const li = el('li');
    const btn = el('button', 'book');
    btn.type = 'button';
    btn.dataset.id = b.id;
    btn.setAttribute('aria-label', `${b.title}, ${b.series}`);
    const eager = eagerLeft > 0; if (eager) eagerLeft--;
    const nd = opts.needles || [];
    btn.innerHTML =
      `<span class="cover"${tint(b)}><img ${coverSrc(b, 'card')} alt="" width="300" height="400" ${eager ? (eagerLeft === 3 ? 'fetchpriority="high"' : '') : 'loading="lazy"'} decoding="async"></span>` +
      (saved.has(b.id) ? `<span class="flag" aria-hidden="true">${ICON.star}</span>` : '') +
      `<span class="book-meta"><span class="book-series">${highlight(b.series, nd)}</span><span class="book-title">${highlight(b.title, nd)}</span>` +
      (opts.showCol ? `<span class="book-col">${b.col.number} · ${esc(b.col.name)}</span>` : '') + `</span>`;
    const img = btn.querySelector('img');
    const ok = () => img.parentNode.classList.add('is-ready');
    if (img.complete && img.naturalWidth) ok(); else img.addEventListener('load', ok, { once: true });
    img.addEventListener('error', ok, { once: true });
    li.append(btn);
    return li;
  }

  const revealer = new IntersectionObserver(entries => {
    let k = 0;
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.style.setProperty('--d', `${Math.min(k++, 8) * 40}ms`);
      en.target.classList.add('is-in');
      revealer.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -5% 0px', threshold: 0.01 });

  function fillGrid(grid, list, opts = {}, ctx = list) {
    grid.textContent = '';
    const frag = document.createDocumentFragment();
    list.forEach(b => { const li = bookCard(b, opts); frag.append(li); revealer.observe(li.firstChild); });
    grid.append(frag);
    grid._ctx = ctx;
  }

  function initCardEvents(root) {
    root.addEventListener('pointermove', e => {
      if (!finePointer.matches || reduceMotion.matches) return;
      const cover = e.target.closest && e.target.closest('.book .cover');
      if (!cover) return;
      const r = cover.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      cover.style.setProperty('--ry', `${(px - .5) * 14}deg`);
      cover.style.setProperty('--rx', `${(.5 - py) * 12}deg`);
      cover.style.setProperty('--gx', `${px * 100}%`);
      cover.style.setProperty('--gy', `${py * 100}%`);
    });
    root.addEventListener('pointerout', e => {
      const cover = e.target.closest && e.target.closest('.book .cover');
      if (cover && !cover.contains(e.relatedTarget)) { cover.style.removeProperty('--rx'); cover.style.removeProperty('--ry'); }
    });
    root.addEventListener('click', e => {
      const card = e.target.closest('.book, .shelf-row button');
      if (!card) return;
      const b = model.byId.get(card.dataset.id);
      if (!b) return;
      const grid = card.closest('.grid, .shelf-row');
      openSheet(b, (grid && grid._ctx) || [b]);
    });
  }

  /* ---------- Collections ---------- */
  function renderCollections() {
    const root = $('#collections');
    root.textContent = '';
    model.collections.forEach(c => {
      const sec = el('section', 'col');
      sec.id = c.slug;
      sec.setAttribute('aria-labelledby', `h-${c.slug}`);
      const named = c.groups.filter(g => g.name);
      sec.innerHTML =
        `<header class="col-head"><span class="col-num">${c.number}</span>` +
        `<h2 id="h-${c.slug}">${esc(c.name)}</h2><span class="col-count">${plural(c.books.length, 'libro', 'libros')}</span></header>` +
        `<p class="col-desc">${esc(c.description)}</p>`;
      const st = { group: null };

      if (named.length > 1) {
        const tabs = el('div', 'tabs');
        tabs.setAttribute('role', 'group');
        tabs.setAttribute('aria-label', `Secciones de ${c.name}`);
        const mk = (label, count, slug) => {
          const t = el('button', 'tab', `${esc(label)}<span>${count}</span>`);
          t.type = 'button'; t.dataset.g = slug || ''; t.setAttribute('aria-pressed', String(!slug));
          return t;
        };
        tabs.append(mk('Todos', c.books.length, null), ...c.groups.map(g => mk(g.name, g.books.length, g.slug)));
        tabs.addEventListener('click', e => {
          const t = e.target.closest('.tab');
          if (!t) return;
          $$('.tab', tabs).forEach(x => x.setAttribute('aria-pressed', String(x === t)));
          st.group = t.dataset.g || null; draw();
        });
        sec.append(tabs);
      }
      const grid = el('ul', 'grid');
      sec.append(grid);

      function draw() {
        const list = st.group ? c.groups.find(g => g.slug === st.group).books : c.books;
        fillGrid(grid, list);
      }
      sec._draw = draw;
      draw();
      root.append(sec);
    });
  }

  /* ---------- Filters ---------- */
  function renderFilters() {
    const count = fn => model.books.filter(fn).length;
    const courses = COURSES.map(c => ({ ...c, n: count(b => b.course && b.course.slug === c.slug) })).filter(c => c.n);
    const group = (title, html) => `<div class="fgroup"><h3>${title}</h3><div>${html}</div></div>`;
    $('.filters').innerHTML =
      group('Tipo', TYPES.map(([k, label]) => `<button class="chip" type="button" data-tipo="${k}" aria-pressed="${state.tipo === k}">${label}<i>${count(b => b.type === k)}</i></button>`).join('') +
        `<button class="chip saved" type="button" data-estante aria-pressed="${state.estante}">${ICON.star}Mi estante<i>${saved.size}</i></button>`) +
      group('Curso', courses.map(c => `<button class="chip" type="button" data-curso="${c.slug}" aria-pressed="${state.curso === c.slug}">${c.label}<i>${c.n}</i></button>`).join('')) +
      (state.tipo || state.curso || state.estante ? `<div><button class="chip reset" type="button" data-reset>Quitar filtros</button></div>` : '');
    const n = [state.tipo, state.curso, state.estante].filter(Boolean).length;
    const badge = $('.badge');
    badge.hidden = !n; badge.textContent = n;
  }

  function initFilters() {
    const btn = $('.filter-btn'), drawer = $('.drawer');
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      drawer.classList.toggle('is-open', open);
    });
    $('.filters').addEventListener('click', e => {
      const b = e.target.closest('.chip');
      if (!b) return;
      if (b.hasAttribute('data-reset')) { state.tipo = ''; state.curso = ''; state.estante = false; return update(true); }
      if (b.dataset.tipo) state.tipo = state.tipo === b.dataset.tipo ? '' : b.dataset.tipo;
      else if (b.dataset.curso) state.curso = state.curso === b.dataset.curso ? '' : b.dataset.curso;
      else if (b.hasAttribute('data-estante')) state.estante = !state.estante;
      update(true);
    });
  }

  function resetFilters() {
    state.q = ''; state.tipo = ''; state.curso = ''; state.estante = false;
    $('#q').value = '';
    update(false);
  }

  /* ---------- Results ---------- */
  function update(scrollToTop) {
    writeURL();
    renderFilters();
    const results = $('#results');
    const cols = $('#collections');
    const q = state.q.trim();
    $('.search-clear').hidden = !q;
    const hint = $('#hint');
    if (!filtering()) {
      results.hidden = true; cols.hidden = false; hint.hidden = true; $('.jump').hidden = false;
      $('.search-count').textContent = '';
      renderOrbit();
      return;
    }
    const { list, aliasHits, needles, tokens } = applyFilters();
    $('.search-count').textContent = list.length;
    hint.hidden = !aliasHits.length;
    hint.innerHTML = aliasHits.map(([a, b]) => `${esc(a)} → <b>${esc(PRETTY[b] || b)}</b>`).join(' · ');
    cols.hidden = true; results.hidden = false; $('#orbit').hidden = true; $('.jump').hidden = true;
    results.textContent = '';
    eagerLeft = 4;

    if (!list.length) {
      const empty = el('div', 'empty');
      const near = closest(tokens);
      empty.innerHTML =
        `<h2>${q ? `Nada para «${esc(q)}»` : 'Sin libros con estos filtros'}</h2>` +
        `<div class="empty-links">${filtering() ? '<button class="chip reset" type="button" data-reset>Limpiar filtros</button>' : ''}` +
        model.collections.map(c => `<a class="chip" href="#${c.slug}" data-go="${c.slug}">${esc(c.name)}</a>`).join('') + `</div>`;
      empty.addEventListener('click', e => {
        if (e.target.closest('[data-reset]')) return resetFilters();
        const a = e.target.closest('[data-go]'); if (a) { e.preventDefault(); goToCollection(a.dataset.go); }
      });
      results.append(empty);
      if (near.length) {
        const head = el('div', 'results-head', `<h2>Parecidos</h2><span>${plural(near.length, 'libro', 'libros')}</span>`);
        const grid = el('ul', 'grid');
        results.append(head, grid);
        fillGrid(grid, near, { showCol: true });
      }
    } else {
      const head = el('div', 'results-head', `<h2>${state.estante && !q ? 'Mi estante' : 'Resultados'}</h2><span>${plural(list.length, 'libro', 'libros')}</span>`);
      const grid = el('ul', 'grid');
      results.append(head, grid);
      fillGrid(grid, list, { showCol: true, needles });
    }
    if (scrollToTop) {
      const top = $('#catalogo').getBoundingClientRect().top + scrollY;
      if (scrollY > top + 4) scrollTo({ top, behavior: 'auto' });
    }
  }

  function closest(tokens) {
    if (!tokens.length) return [];
    const stems = tokens.map(vs => vs.length > 1 && !ROMAN[vs[0]] ? vs[1] : vs[0])
      .filter(w => w.length >= 3).map(w => w.length > 6 ? w : w.slice(0, Math.max(3, w.length - 2)));
    return model.books
      .map(b => ({ b, s: stems.reduce((n, st) => n + (b.key.includes(st) ? 1 : 0), 0) }))
      .filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 6).map(x => x.b);
  }

  function initSearch() {
    const input = $('#q');
    input.value = state.q;
    let t = 0;
    input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { state.q = input.value; update(true); }, 100); });
    $('.search').addEventListener('submit', e => { e.preventDefault(); clearTimeout(t); state.q = input.value; update(true); input.blur(); });
    $('.search-clear').addEventListener('click', () => { input.value = ''; state.q = ''; update(false); input.focus(); });
    input.addEventListener('keydown', e => { if (e.key === 'Escape' && input.value) { e.preventDefault(); input.value = ''; state.q = ''; update(false); } });
    addEventListener('keydown', e => {
      if (e.key === '/' && document.activeElement !== input && !$('.sheet').open && !e.target.closest('input, textarea')) { e.preventDefault(); input.focus(); }
    });
  }

  /* ---------- Orbit shelves ---------- */
  function shelf(title, idx, books, onClear, clearLabel) {
    const wrap = el('div', 'shelf');
    wrap.innerHTML = `<div class="shelf-head"><h2>${title}</h2>${onClear ? `<button type="button">${clearLabel}</button>` : ''}</div>`;
    const row = el('div', 'shelf-row');
    row.innerHTML = books.map(b => `<button type="button" data-id="${b.id}" aria-label="${esc(b.title)}, ${esc(b.series)}"><img ${coverSrc(b, 'shelf')} alt="" width="116" height="155" loading="lazy" decoding="async"${tint(b)}><span>${esc(b.title)}</span></button>`).join('');
    row._ctx = books;
    wrap.append(row);
    if (onClear) wrap.querySelector('.shelf-head button').addEventListener('click', onClear);
    return wrap;
  }
  function renderOrbit() {
    const orbit = $('#orbit');
    orbit.textContent = '';
    const rec = recent.map(id => model.byId.get(id)).filter(Boolean);
    const sav = [...saved].map(id => model.byId.get(id)).filter(Boolean).reverse();
    if (rec.length) orbit.append(shelf('Seguir leyendo', '01', rec, () => { recent = []; store.set('recent', recent); renderOrbit(); }, 'Borrar'));
    if (sav.length) orbit.append(shelf('Mi estante', rec.length ? '02' : '01', sav, () => { state.estante = true; update(true); }, `Ver ${sav.length}`));
    orbit.hidden = filtering() || !(rec.length || sav.length);
  }
  function pushRecent(b) {
    recent = [b.id, ...recent.filter(id => id !== b.id)].slice(0, 8);
    store.set('recent', recent);
  }

  /* ---------- Toast ---------- */
  const toast = $('.toast');
  let toastT = 0;
  function say(msg, undo) {
    const host = sheet.open ? sheet : document.body; // dialog sits in the top layer
    if (toast.parentNode !== host) host.append(toast);
    $('.toast-msg', toast).textContent = msg;
    const u = $('.toast-undo');
    u.hidden = !undo;
    u.onclick = undo ? () => { undo(); toast.classList.remove('is-on'); } : null;
    toast.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove('is-on'), undo ? 4200 : 2400);
  }

  /* ---------- Sheet ---------- */
  const sheet = $('.sheet');
  const panel = $('.sheet-panel');
  const sBody = $('.sheet-body');
  let ctxList = [], current = null, lastFocus = null, closing = false;

  function fillSheet(b, dir = 0) {
    current = b;
    const i = ctxList.indexOf(b);
    const im = $('.sheet-cover img');
    const base = b.thumb && BASE + 'covers/' + encodeURI(b.thumb.t);
    im.removeAttribute('srcset');
    if (base) { im.sizes = SIZES.sheet; im.srcset = `${base}-240.webp 240w, ${base}-480.webp 480w`; im.src = `${base}-480.webp`; }
    else im.src = b.image;
    im.alt = b.alt;
    $('.sheet-cover').style.setProperty('--tint', b.thumb ? b.thumb.c : '');
    $('.sheet-path').innerHTML = `<b>${b.col.number}</b>${esc(b.col.name)}`;
    $('.sheet-series').textContent = b.series;
    $('#sheet-title').textContent = b.title;
    const rows = [['Sección', b.group.name], ['Curso', b.course && b.course.label], ['Tipo', TYPES.find(t => t[0] === b.type)[1]]];
    $('.specs').innerHTML = rows.filter(r => r[1]).map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');
    const drive = $('.drive');
    drive.href = b.driveUrl;
    drive.setAttribute('aria-label', `Abrir ${b.title} en Google Drive (nueva pestaña)`);
    syncSaveBtn();
    $('.sheet-pos').textContent = ctxList.length > 1 ? `${pad2(i + 1)} / ${pad2(ctxList.length)}` : '';
    $('[data-move="-1"]').disabled = i <= 0;
    $('[data-move="1"]').disabled = i < 0 || i >= ctxList.length - 1;
    $('.sheet-nav').hidden = ctxList.length < 2;
    const rel = b.group.books.length > 1 ? b.group.books : null;
    $('.sheet-related').hidden = !rel;
    if (rel) {
      const row = $('.related-row');
      row.innerHTML = rel.map(x => `<button type="button" data-id="${x.id}" aria-label="${esc(x.title)}, ${esc(x.series)}"${x === b ? ' aria-current="true"' : ''}><img ${coverSrc(x, 'related')} alt="" loading="lazy" decoding="async" width="72" height="96"${tint(x)}></button>`).join('');
      const cur = row.querySelector('[aria-current]');
      if (cur) row.scrollLeft = cur.offsetLeft - row.clientWidth / 2 + cur.offsetWidth / 2;
    }
    history.replaceState(history.state, '', location.pathname + location.search + '#libro-' + b.id);
    if (dir) { sBody.style.setProperty('--dir', dir); sBody.classList.remove('swap'); void sBody.offsetWidth; sBody.classList.add('swap'); }
  }
  function syncSaveBtn() {
    const on = saved.has(current.id);
    const btn = $('[data-act="save"]');
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? 'Quitar de Mi estante' : 'Guardar en Mi estante');
  }

  function openSheet(b, list) {
    ctxList = list && list.includes(b) ? list : [b];
    if (!sheet.open) lastFocus = document.activeElement;
    fillSheet(b);
    panel.scrollTop = 0;
    panel.style.transform = '';
    if (!sheet.open) {
      sheet.showModal();
      panel.focus({ preventScroll: true });
      document.documentElement.style.overflow = 'hidden';
      requestAnimationFrame(() => requestAnimationFrame(() => sheet.setAttribute('data-open', '')));
    }
  }
  function closeSheet() {
    if (!sheet.open || closing) return;
    closing = true;
    sheet.classList.add('is-closing');
    sheet.removeAttribute('data-open');
    panel.style.transform = '';
    history.replaceState(history.state, '', location.pathname + location.search);
    const done = () => {
      closing = false;
      sheet.classList.remove('is-closing');
      sheet.close();
      document.documentElement.style.overflow = '';
      if (filtering()) update(false); else renderOrbit();
      const back = lastFocus && lastFocus.dataset && lastFocus.dataset.id ? document.querySelector(`.book[data-id="${lastFocus.dataset.id}"]`) : lastFocus;
      if (back && back.focus) back.focus({ preventScroll: true });
    };
    if (reduceMotion.matches) return setTimeout(done, 200);
    let fired = false;
    const fin = e => { if ((e && e.target !== panel) || fired) return; fired = true; panel.removeEventListener('transitionend', fin); done(); };
    panel.addEventListener('transitionend', fin);
    setTimeout(fin, 420);
  }
  const move = d => { const i = ctxList.indexOf(current) + d; if (i >= 0 && i < ctxList.length) fillSheet(ctxList[i], d); };

  function toggleSave(b) {
    const was = saved.has(b.id);
    if (was) saved.delete(b.id); else saved.add(b.id);
    persistSaved();
    if (current === b) syncSaveBtn();
    renderFilters();
    $$(`.book[data-id="${b.id}"]`).forEach(card => {
      const f = card.querySelector('.flag');
      if (saved.has(b.id) && !f) card.insertAdjacentHTML('afterbegin', `<span class="flag" aria-hidden="true">${ICON.star}</span>`);
      if (!saved.has(b.id) && f) f.remove();
    });
    say(was ? 'Quitado de Mi estante' : 'Guardado en Mi estante', () => toggleSave(b));
  }

  async function share(b) {
    const url = location.origin + location.pathname + '?libro=' + encodeURIComponent(b.id); // query so link previews can show the cover
    const data = { title: `${b.title} · Lumbreras`, text: `${b.title} (${b.series})`, url };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(url);
      say('Enlace copiado');
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      say('No se pudo compartir');
    }
  }

  function initSheet() {
    sheet.addEventListener('cancel', e => { e.preventDefault(); closeSheet(); });
    sheet.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) return closeSheet();
      const mv = e.target.closest('[data-move]'); if (mv) return move(+mv.dataset.move);
      const act = e.target.closest('[data-act]');
      if (act) return act.dataset.act === 'save' ? toggleSave(current) : share(current);
      if (e.target.closest('.drive')) return pushRecent(current);
      const rel = e.target.closest('.related-row button');
      if (rel) {
        const b = model.byId.get(rel.dataset.id);
        if (!ctxList.includes(b)) ctxList = b.group.books;
        fillSheet(b, ctxList.indexOf(b) > ctxList.indexOf(current) ? 1 : -1);
      }
    });
    $('.drive').addEventListener('auxclick', () => pushRecent(current));
    sheet.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
    });

    // drag down to dismiss (phone sheet)
    let startY = 0, dy = 0, t0 = 0, id = null;
    panel.addEventListener('pointerdown', e => {
      if (innerWidth >= 768 || id != null) return;
      if (panel.scrollTop > 0 || e.target.closest('.related-row, a, button')) return;
      id = e.pointerId; startY = e.clientY; dy = 0; t0 = e.timeStamp;
    });
    panel.addEventListener('pointermove', e => {
      if (e.pointerId !== id) return;
      const raw = e.clientY - startY;
      if (!sheet.classList.contains('is-dragging')) {
        if (raw < 6) { if (raw < -6) id = null; return; }
        sheet.classList.add('is-dragging');
        panel.setPointerCapture(id);
      }
      dy = raw > 0 ? raw : raw * .2;
      panel.style.transform = `translateY(${dy}px)`;
    });
    const end = e => {
      if (e.pointerId !== id) return;
      id = null;
      if (!sheet.classList.contains('is-dragging')) return;
      sheet.classList.remove('is-dragging');
      const v = dy / Math.max(1, e.timeStamp - t0);
      panel.style.transform = '';
      if (dy > 120 || (v > .11 && dy > 24)) closeSheet();
    };
    panel.addEventListener('pointerup', end);
    panel.addEventListener('pointercancel', end);
  }

  function openFromHash() {
    const q = new URLSearchParams(location.search).get('libro');
    const m = q ? [, q] : location.hash.match(/^#libro-([\w-]+)/);
    if (m) { const b = model.byId.get(m[1]); if (b) openSheet(b, b.group.books); return; }
    const slug = decodeURIComponent(location.hash.slice(1));
    const sec = slug && document.getElementById(slug);
    if (sec && sec.classList.contains('col') && !filtering()) requestAnimationFrame(() => sec.scrollIntoView());
  }

  /* ---------- Collection jump bar + scroll spy ---------- */
  function renderJump() {
    const nav = $('.jump');
    nav.innerHTML = model.collections.map(c => `<a href="#${c.slug}" data-slug="${c.slug}">${esc(c.name)}</a>`).join('');
    nav.addEventListener('click', e => { const a = e.target.closest('a'); if (a) { e.preventDefault(); goToCollection(a.dataset.slug); } });
    const chips = new Map($$('a', nav).map(a => [a.dataset.slug, a]));
    let on = null;
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting || on === en.target.id) return;
        on = en.target.id;
        chips.forEach((a, k) => a.classList.toggle('is-on', k === on));
        const a = chips.get(on);
        nav.scrollTo({ left: a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      });
    }, { rootMargin: '-30% 0px -65% 0px' });
    $$('.col').forEach(sec => spy.observe(sec));
  }

  /* ---------- Back to top: one-second glide ---------- */
  function initToTop() {
    const btn = $('.totop');
    const consoleEl = $('.console');
    let ticking = false, anim = 0;
    const sync = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      const y = scrollY;
      const show = y > innerHeight * 1.2;
      btn.classList.toggle('is-on', show);
      btn.tabIndex = show ? 0 : -1;
      btn.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
      consoleEl.classList.toggle('is-stuck', consoleEl.getBoundingClientRect().top <= 0 && y > 0);
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(sync); } }, { passive: true });
    addEventListener('resize', sync);
    sync();

    // explicit 1s ease-in-out glide; any wheel/touch/key input hands control back to the user
    const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const stop = () => { cancelAnimationFrame(anim); anim = 0; };
    ['wheel', 'touchstart', 'keydown'].forEach(ev => addEventListener(ev, () => anim && stop(), { passive: true }));
    btn.addEventListener('click', () => {
      stop();
      const from = scrollY, t0 = performance.now(), DUR = 1000;
      const step = now => {
        const p = Math.min(1, (now - t0) / DUR);
        scrollTo(0, Math.round(from * (1 - ease(p))));
        if (p < 1) anim = requestAnimationFrame(step);
        else { anim = 0; $('.brand').focus({ preventScroll: true }); }
      };
      anim = requestAnimationFrame(step);
    });
  }

  /* ---------- Boot ---------- */
  function fail(err) {
    const root = $('#collections');
    root.innerHTML = '<div class="fail"><p class="k">[ Error ] No se pudo cargar el catálogo.</p><button class="more" type="button">Reintentar</button></div>';
    root.querySelector('button').addEventListener('click', () => { root.innerHTML = ''; boot(); });
    console.error(err);
  }

  async function boot() {
    try {
      const [list, man] = await Promise.all([
        fetch(DATA_URL, { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
          .then(d => d.catalogs.lumbreras),
        fetch(COVERS_URL).then(r => r.ok ? r.json() : {}).catch(() => ({}))
      ]);
      covers = man.covers || {};
      model = buildModel(list, man.collections);
      if (!model.books.length) throw new Error('catálogo vacío');
    } catch (err) { return fail(err); }

    $('[data-stat="books"]').textContent = model.books.length;
    $('[data-stat="collections"]').textContent = model.collections.length;
    $('[data-stat="groups"]').textContent = model.collections.reduce((s, c) => s + c.groups.filter(g => g.name).length, 0);
    saved = new Set([...saved].filter(id => model.byId.has(id)));

    readURL();
    initCosmos();
    renderCollections();
    initFilters();
    initSearch();
    initCardEvents($('#main'));
    renderJump();
    $('#collections').removeAttribute('aria-busy');
    update(false);
    openFromHash();
    addEventListener('hashchange', openFromHash);
  }

  splitTitle();
  initSheet();
  initToTop();
  boot();
})();
