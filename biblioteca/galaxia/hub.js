/* UNIverse · /biblioteca v4
   Search and the favorites list send people straight to a book on its publisher page (?libro= is read by catalogo.js).
   Favorites come from /api/site/library/favorites (votes are cast with the star in catalogo.js). Data: indice.json (counts, covers) and
   buscar.json (one row per book, loaded on first use) — both built by tools/build-biblioteca-index.py.

   Editorial accordion = vanilla port of Skiper UI 52 (HoverExpand_001, horizontal, desktop) and
   Skiper UI 53 (HoverExpand_002, vertical, phone). Original: React + Framer Motion by gxuri,
   https://gxuri.me — free to use and modify; attribution to Skiper UI required (https://skiper-ui.com).
   One markup serves both: hub.css lays it out as a row (>= 1000px) or a column (below). */
(() => {
  'use strict';

  const INDEX_URL = '/biblioteca/indice.json';
  const SEARCH_URL = '/biblioteca/buscar.json';
  const DIRECTORY_URL = '/universe-ui/data/library-directory.json';
  const FAVS_URL = '/api/site/library/favorites';
  const START = 'lumbreras'; // accordion tile open on arrival
  const TAG = { 1: 'Problemas', 2: 'Solucionario' };
  // same shorthand catalogo.js understands
  const ALIAS = {
    rm: 'razonamiento matematico', rv: 'razonamiento verbal', trigo: 'trigonometria', geo: 'geometria', aritm: 'aritmetica',
    arit: 'aritmetica', alg: 'algebra', quim: 'quimica', fis: 'fisica', bio: 'biologia', sol: 'solucionario', solu: 'solucionario',
    pr: 'problemas resueltos', lit: 'literatura', len: 'lenguaje', hist: 'historia', eco: 'economia', filo: 'filosofia', psico: 'psicologia'
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => n.toLocaleString('es-PE');
  const plural = (n, one, many) => `${fmt(n)} ${n === 1 ? one : many}`;
  const fold = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const norm = s => ' ' + fold(s).replace(/[^a-z0-9ñ]+/g, ' ').trim() + ' ';
  const SMALL = new Set(['de', 'del', 'y', 'la', 'el', 'las', 'los', 'en', 'un', 'con', 'por', 'a']);
  const titleCase = s => s !== s.toUpperCase() ? s : s.toLowerCase().split(' ')
    .map((w, i) => (i && SMALL.has(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const cover = (folder, t, size) => `/biblioteca/${folder}/covers/${encodeURI(t)}-${size}.webp`;
  const url = s => `/biblioteca/${s.folder}/`;
  const ARROW = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 13 13 7M8 7h5v5"/></svg>';
  const GO = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11.5M11 5.5l4.5 4.5-4.5 4.5"/></svg>';

  let data = null;          // indice.json
  let sources = [];         // publishers + collection pages, same shape

  /* ---------- Search across every book ---------- */
  let searchData = null, searchLoad = null;
  function loadSearch() {
    if (!searchLoad) {
      searchLoad = fetch(SEARCH_URL).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(d => {
        const name = Object.fromEntries(sources.map(s => [s.folder, s.name]));
        searchData = d.b.map(r => {
          const [p, title, sub, hay, id, c, y, t] = r;
          const folder = d.f[p];
          return {
            folder, title, sub, id, y, t, name: name[folder] || folder,
            nt: norm(title),
            key: norm([title, sub, hay, name[folder] || '', c >= 0 ? d.courses[c][1] : '', y === 2 ? 'solucionario' : y === 1 ? 'problemas resueltos' : ''].join(' '))
          };
        });
        return searchData;
      }).catch(err => { searchLoad = null; throw err; });
    }
    return searchLoad;
  }

  const tokensOf = q => norm(q).trim().split(' ').filter(Boolean).flatMap(t => (ALIAS[t] || t).split(' '));
  function mark(text, tokens) {
    const f = fold(text);
    if (f.length !== text.length) return esc(text);
    const on = new Array(text.length).fill(false);
    tokens.forEach(t => {
      const re = new RegExp(`(^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
      let m;
      while ((m = re.exec(f))) for (let i = m.index + m[1].length; i < m.index + m[1].length + t.length; i++) on[i] = true;
    });
    let out = '', open = false;
    for (let i = 0; i < text.length; i++) {
      if (on[i] !== open) { out += open ? '</mark>' : '<mark>'; open = on[i]; }
      out += esc(text[i]);
    }
    return out + (open ? '</mark>' : '');
  }

  function initSearch() {
    const form = $('.finder'), input = $('#q'), box = $('#results'), clear = $('.finder-clear');
    let items = [], active = -1, seq = 0, timer = 0;
    const MAX = 8;

    const open = html => { box.innerHTML = html; box.hidden = false; input.setAttribute('aria-expanded', 'true'); items = $$('[role="option"]', box); active = -1; };
    const close = () => { box.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; };
    const setActive = i => {
      items.forEach((n, k) => n.setAttribute('aria-selected', String(k === i)));
      active = i;
      if (i >= 0) { input.setAttribute('aria-activedescendant', items[i].id); items[i].scrollIntoView({ block: 'nearest' }); } else input.removeAttribute('aria-activedescendant');
    };

    const names = () => sources.map(s => ({ href: url(s), label: s.name, hint: plural(s.n, 'libro', 'libros'), key: norm(s.name) }));

    const run = async () => {
      const q = input.value.trim(), mine = ++seq;
      form.classList.toggle('has-q', !!q);
      clear.hidden = !q;
      if (!q) { close(); return; }
      if (!searchData) {
        open('<div class="res-sk" aria-hidden="true"><i></i><i></i></div><div class="res-sk" aria-hidden="true"><i></i><i></i></div><div class="res-sk" aria-hidden="true"><i></i><i></i></div>');
        try { await loadSearch(); } catch {
          if (mine === seq) open('<div class="res-empty"><b>No se pudo cargar la búsqueda</b><span>Revisa tu conexión e inténtalo otra vez.</span></div>');
          return;
        }
        if (mine !== seq) return;
      }
      const tokens = tokensOf(q);
      const hits = searchData.filter(e => tokens.every(t => e.key.includes(' ' + t)));
      hits.sort((a, b) => (tokens.every(t => b.nt.includes(' ' + t)) - tokens.every(t => a.nt.includes(' ' + t))) || a.title.length - b.title.length);
      const quick = names().filter(n => tokens.every(t => n.key.includes(' ' + t))).slice(0, 4);
      let n = 0;
      const chips = quick.length ? `<p class="res-label">Ir a</p><div class="res-chips">${quick.map(c =>
        `<a class="res-chip" role="option" id="r${n++}" href="${c.href}">${esc(c.label)}<small>${esc(c.hint)}</small></a>`).join('')}</div>` : '';
      let body;
      if (hits.length) {
        body = `<p class="res-label">${plural(hits.length, 'libro', 'libros')}</p>` + hits.slice(0, MAX).map(e => {
          const img = e.t ? `<img class="res-cover" src="${cover(e.folder, e.t, 240)}" alt="" width="40" height="54" loading="lazy" decoding="async">` : '<span class="res-cover" aria-hidden="true"></span>';
          return `<a class="res-row" role="option" id="r${n++}" href="/biblioteca/${e.folder}/?libro=${encodeURIComponent(e.id)}">${img}
            <span class="res-txt"><b>${mark(titleCase(e.title), tokens)}</b><small>${esc(e.name)} · ${esc(titleCase(e.sub))}</small></span>
            ${TAG[e.y] ? `<span class="res-tag">${TAG[e.y]}</span>` : ''}</a>`;
        }).join('') + (hits.length > MAX ? `<p class="res-note">Hay ${fmt(hits.length - MAX)} más. Añade el curso o la editorial para afinar.</p>` : '');
      } else if (!quick.length) {
        body = `<div class="res-empty"><b>Sin resultados para «${esc(q)}»</b><span>Prueba con el curso (álgebra, física) o con la editorial.</span></div>
          <div class="res-chips">${data.pubs.slice(0, 6).map(s => `<a class="res-chip" role="option" id="r${n++}" href="${url(s)}">${esc(s.name)}</a>`).join('')}</div>`;
      } else body = '';
      open(chips + body);
    };

    input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 70); });
    input.addEventListener('focus', () => { loadSearch().catch(() => {}); if (input.value.trim() && box.hidden) run(); });
    form.addEventListener('pointerenter', () => { loadSearch().catch(() => {}); }, { once: true });
    form.addEventListener('submit', e => { e.preventDefault(); const t = items[active] || items[0]; if (t) t.click(); });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (box.hidden && input.value.trim()) { run(); return; }
        if (!items.length) return;
        e.preventDefault();
        const n = active + (e.key === 'ArrowDown' ? 1 : -1);
        setActive(n >= items.length ? -1 : n < -1 ? items.length - 1 : n);
      } else if (e.key === 'Escape') {
        if (!box.hidden) { e.preventDefault(); close(); } else if (input.value) { input.value = ''; run(); }
      }
    });
    box.addEventListener('pointermove', e => { const i = items.indexOf(e.target.closest('[role="option"]')); if (i >= 0 && i !== active) setActive(i); });
    clear.addEventListener('click', () => { input.value = ''; run(); input.focus(); });
    document.addEventListener('pointerdown', e => { if (!form.contains(e.target)) close(); });
    $('.try').addEventListener('click', e => {
      const b = e.target.closest('[data-try]');
      if (!b) return;
      input.value = b.dataset.try; input.focus(); run();
    });
    // "/" jumps to the search from anywhere on the page
    document.addEventListener('keydown', e => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName)) return;
      e.preventDefault();
      input.focus();
      input.select();
    });
  }

  /* ---------- Favorites: most-starred books, ranked by the number of people who starred them ---------- */
  const STAR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m10 2.8 2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L2.8 8.1l5-.7z"/></svg>';
  async function renderFavs() {
    const box = $('.favs'), list = $('.favs-list');
    let top;
    try {
      const r = await fetch(FAVS_URL);
      if (!r.ok) throw new Error(r.status);
      top = (await r.json()).top || [];
    } catch { box.hidden = true; return; } // no backend (or offline): the hero keeps just the search
    const name = Object.fromEntries(sources.map(s => [s.folder, s.name]));
    list.innerHTML = top.length ? top.slice(0, 6).map((b, i) => `
      <li><a class="fav" href="/biblioteca/${esc(b.folder)}/?libro=${encodeURIComponent(b.id)}">
        <span class="fav-rank">${i + 1}</span>
        ${b.cover ? `<img class="fav-cover" src="${cover(b.folder, b.cover, 240)}" alt="" width="44" height="58" loading="lazy" decoding="async">` : '<span class="fav-cover" aria-hidden="true"></span>'}
        <span class="fav-txt"><b>${esc(titleCase(b.title))}</b><small>${esc(name[b.folder] || b.folder)} · ${esc(titleCase(b.sub))}</small></span>
        <span class="fav-n" aria-label="${plural(b.n, 'favorito', 'favoritos')}">${STAR}${fmt(b.n)}</span>
      </a></li>`).join('')
      : '<li class="favs-empty"><b>Aún no hay favoritos</b><span>Abre un libro y toca la estrella. Los más votados aparecen aquí.</span></li>';
  }

  /* ---------- Collections that lead somewhere ---------- */
  function renderStart(sets) {
    $('.start').innerHTML = sets.map(s => `
      <li><a class="start-card" href="${url(s)}">
        <span class="start-stack" aria-hidden="true">${s.covers.slice(0, 3).map(c => `<img src="${cover(s.folder, c.t, 240)}" alt="" width="46" height="62" loading="lazy" decoding="async" style="--c:${c.c}">`).join('')}</span>
        <span class="start-txt"><b>${esc(s.name)}</b><small>${plural(s.n, 'libro', 'libros')}</small></span>
        ${GO}
      </a></li>`).join('');
  }

  /* ---------- Publishers: Skiper 52 / 53 ---------- */
  function renderPublishers(pubs) {
    const host = $('.hx');
    const first = Math.max(0, pubs.findIndex(s => s.folder === START));
    host.innerHTML = pubs.map((s, i) => {
      const c = s.covers[0];
      const meta = `${plural(s.n, 'libro', 'libros')} · ${plural(s.collections.length, 'colección', 'colecciones')}`;
      return `<a class="hx-tile" href="${url(s)}" data-i="${i}" aria-label="${esc(s.name)}, ${esc(meta)}" style="--c:${c ? c.c : '#18181c'}">
        ${c ? `<img src="${cover(s.folder, c.t, 480)}" alt="" decoding="async" ${Math.abs(i - first) > 4 ? 'loading="lazy"' : ''}>` : ''}
        <span class="hx-rail" aria-hidden="true"><b>${esc(s.name)}</b><i>${fmt(s.n)}</i></span>
        <span class="hx-body" aria-hidden="true"><b>${esc(s.name)}</b><small>${esc(meta)}</small><span class="hx-go">Entrar ${GO}</span></span>
      </a>`;
    }).join('');
    host.removeAttribute('aria-busy');

    const tiles = $$('.hx-tile', host);
    let cur = -1;
    const open = (i, scroll) => {
      if (i === cur) return;
      cur = i;
      tiles.forEach((t, k) => t.classList.toggle('is-active', k === i));
      // phone column: keep the opened row in view once the one above has collapsed
      if (scroll && matchMedia('(max-width: 999px)').matches) {
        setTimeout(() => tiles[i].scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 330);
      }
    };
    open(first, false);
    requestAnimationFrame(() => host.classList.add('is-live')); // first layout without animating

    // row: hover opens (skiper onHoverStart). Column: rows move under the pointer, so only a tap opens;
    // a first tap opens, a second enters
    const row = matchMedia('(min-width: 1000px)');
    host.addEventListener('pointerover', e => {
      const t = e.target.closest('.hx-tile');
      if (t && e.pointerType === 'mouse' && row.matches) open(+t.dataset.i, false);
    });
    host.addEventListener('focusin', e => {
      const t = e.target.closest('.hx-tile');
      // keyboard focus only: a mouse/touch press also focuses the link and would open it before the click
      if (t && t.matches(':focus-visible')) open(+t.dataset.i, false);
    });
    host.addEventListener('click', e => {
      const t = e.target.closest('.hx-tile');
      if (!t) return;
      if (+t.dataset.i !== cur) { e.preventDefault(); open(+t.dataset.i, true); }
    });
    host.addEventListener('keydown', e => {
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      tiles[Math.min(tiles.length - 1, Math.max(0, cur + d))].focus({ preventScroll: true });
    });
  }

  /* ---------- Exams and CEPREUNI files, then Drive folders ---------- */
  function renderLinks(links) {
    $('.more').innerHTML = links.map(l => `<li><a class="folder" href="${esc(l.url)}"><span>${esc(l.name)}</span><small>${plural(l.n, l.one, l.many)}</small>${ARROW}</a></li>`).join('');
  }

  const cleanFolder = s => titleCase(String(s).replace(/^[^|]*\|\s*/, '').replace(/\s+/g, ' ').trim());
  async function renderFolders() {
    let dir;
    try {
      const r = await fetch(DIRECTORY_URL);
      if (!r.ok) throw new Error(r.status);
      dir = await r.json();
    } catch { return; }
    const groups = (dir.groups || []).filter(g => g.items && g.items.length);
    if (!groups.length) return;
    const sec = $('#carpetas'), tabs = $('.folder-tabs', sec), ul = $('.folders', sec);
    let cur = groups[0].id;
    tabs.innerHTML = groups.map(g => `<button class="tab" type="button" data-g="${esc(g.id)}" aria-pressed="${g.id === cur}">${esc(g.title)}<span>${g.items.length}</span></button>`).join('');
    const draw = () => {
      const g = groups.find(x => x.id === cur);
      ul.innerHTML = g.items.map(it => `<li><a class="folder" href="${esc(it.url)}" target="_blank" rel="noopener noreferrer"><span>${esc(cleanFolder(it.title))}</span>${ARROW}</a></li>`).join('') +
        (g.url ? `<li><a class="folder folder-all" href="${esc(g.url)}" target="_blank" rel="noopener noreferrer"><span>Ver todo en Drive</span>${ARROW}</a></li>` : '');
    };
    tabs.addEventListener('click', e => {
      const t = e.target.closest('.tab');
      if (!t) return;
      cur = t.dataset.g;
      $$('.tab', tabs).forEach(x => x.setAttribute('aria-pressed', String(x === t)));
      draw();
    });
    draw();
    sec.hidden = false;
  }

  /* ---------- Back to top ---------- */
  function initToTop() {
    const btn = $('.totop');
    let ticking = false;
    const sync = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      const on = scrollY > innerHeight * 1.2;
      btn.classList.toggle('is-on', on);
      btn.tabIndex = on ? 0 : -1;
      btn.style.setProperty('--p', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(sync); } }, { passive: true });
    addEventListener('resize', sync);
    sync();
    btn.addEventListener('click', () => {
      scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      $('.brand').focus({ preventScroll: true });
    });
  }

  /* ---------- Boot ---------- */
  async function boot() {
    initToTop();
    try {
      const r = await fetch(INDEX_URL);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      data = await r.json();
      if (!data.pubs || !data.pubs.length) throw new Error('índice vacío');
    } catch (err) {
      $('.hx').innerHTML = '<div class="fail"><p>No se pudo cargar la biblioteca.</p><button type="button">Reintentar</button></div>';
      $('.hx button').addEventListener('click', () => location.reload());
      console.error(err);
      return;
    }
    const { pubs, sets = [], links = [] } = data;
    sources = [...pubs, ...sets];
    $('[data-count="books"]').textContent = fmt(sources.reduce((n, s) => n + s.n, 0));
    $('[data-count="pubs"]').textContent = fmt(pubs.length);
    $('.pub-count').textContent = fmt(pubs.length);
    renderFavs();
    initSearch();
    renderPublishers(pubs);
    renderStart(sets);
    renderLinks(links);
    renderFolders();
  }

  boot();
})();
