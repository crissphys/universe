/* CEPREUNI 2027-1 · materiales. Datos: materiales.json (tools/build-cepreuni-materials.py). */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const KINDS = [['all', 'Todo'], ['clase', 'Clases'], ['libro', 'Materiales'], ['repaso', 'Repasos'],
    ['solucionario', 'Solucionarios'], ['resultado', 'Resultados'], ['info', 'Información']];
  const TAG = { clase: 'Clase', libro: 'Libro', adicional: 'Extra', repaso: 'Repaso', solucionario: 'Solución', resultado: 'Resultado', info: 'Info' };
  const LABEL = { clase: 'Clase', libro: 'Material de estudio', adicional: 'Material adicional', repaso: 'Repaso', solucionario: 'Solucionario', resultado: 'Resultados', info: 'Información' };
  const TILE = { clase: 'Clase', libro: 'Libro', adicional: 'Extra', repaso: 'Repaso', solucionario: 'Solu.', resultado: 'Result.', info: 'Info' };
  const EVENT = { '1EP': '1.er parcial', PC1: '1.ª PC', PC2: '2.ª PC', PC3: '3.ª PC', PC4: '4.ª PC', 'Selección': 'Selección' };
  const EXT = { pptx: 'PPT', ppt: 'PPT', docx: 'DOC', doc: 'DOC', xlsx: 'XLS', png: 'IMG', jpg: 'IMG', jpeg: 'IMG', mp4: 'VID', folder: 'DIR' };
  // Matiz del color de cada curso (tarjeta y chip); General no lleva color.
  const HUE = { 'Aritmética': 35, 'Álgebra': 60, 'Geometría': 95, 'Trigonometría': 150, 'Física': 205, 'Química': 235,
    'Razonamiento Verbal': 275, 'Lenguaje': 300, 'Inglés': 325, 'Psicología': 350, 'Historia': 15, 'Geografía': 125, 'Economía': 180, 'Filosofía': 260 };
  const ARROW = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 13 13 7M8 7h5v5"/></svg>';
  const group = k => (k === 'adicional' ? 'libro' : k);
  const url = it => (it.f ? `https://drive.google.com/drive/folders/${it.i}` : `https://drive.google.com/file/d/${it.i}/view`);
  const plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;

  const q = $('#q'), clearBtn = $('.search-clear'), count = $('.search-count');
  const kindsEl = $('.m-kinds'), coursesEl = $('.m-courses'), res = $('#res'), consoleEl = $('.console');
  const params = new URLSearchParams(location.search);
  const state = { q: params.get('q') || '', kind: params.get('t') || 'all', course: params.get('c') || '' };
  let items = [], courses = [];

  const style = c => `--h:${HUE[c] ?? 0};--c:${c in HUE ? 1 : 0}`;
  const match = (it, words) => words.every(w => it.h.includes(w));
  const filtered = skip => {
    const words = fold(state.q).split(/\s+/).filter(Boolean);
    return items.filter(it => (skip === 'kind' || state.kind === 'all' || group(it.k) === state.kind)
      && (skip === 'course' || !state.course || it.c === state.course) && match(it, words));
  };

  function tile(it) {
    const ev = it.k === 'repaso' || it.k === 'solucionario' || it.k === 'resultado';
    let big = '·';
    if (it.w) big = `${it.w}${it.p ? `<sup>.${it.p}</sup>` : ''}`;
    else if (ev && it.e) big = it.e.replace('Selección', 'Sel.');
    else if (it.k === 'libro') big = (/\d+/.exec(it.t) || ['L'])[0];
    else if (it.n) big = it.n;
    else if (it.k === 'info') big = 'i';
    const small = it.k === 'clase' || it.k === 'adicional' ? 'Sem.' : TILE[it.k];
    return `<span class="m-tile" aria-hidden="true"><i>${small}</i><b${ev && !it.w ? ' class="is-ev"' : ''}>${big}</b><u>${EXT[it.x] || 'PDF'}</u></span>`;
  }

  function row(it, flat) {
    const bits = [it.w && (it.k === 'clase' || it.k === 'adicional') ? `Semana ${it.w}` : EVENT[it.e] || '',
      it.n ? plural(it.n, 'imagen', 'imágenes') : EXT[it.x] && it.x !== 'folder' ? EXT[it.x] : ''].filter(Boolean);
    const meta = [flat && it.c !== 'General' ? `<b>${esc(it.c)}</b>` : '', ...(bits.length ? bits : [LABEL[it.k]])].filter(Boolean).join(' · ');
    return `<li><a class="m-row" style="${style(it.c)}" href="${url(it)}" target="_blank" rel="noopener">${tile(it)}<span class="m-txt"><strong>${esc(it.t)}</strong><small>${meta}</small></span>${ARROW}</a></li>`;
  }

  function render() {
    const list = filtered();
    const flat = !!state.q.trim();
    // Chips de tipo y curso: cada grupo cuenta con el filtro del otro aplicado.
    const byKind = filtered('kind'), byCourse = filtered('course');
    kindsEl.innerHTML = KINDS.map(([k, label]) => {
      const n = k === 'all' ? byKind.length : byKind.filter(it => group(it.k) === k).length;
      return `<button type="button" data-kind="${k}" aria-pressed="${state.kind === k}"${n ? '' : ' disabled'}>${label}<span>${n}</span></button>`;
    }).join('');
    coursesEl.innerHTML = `<button type="button" data-course="" aria-pressed="${!state.course}">Todos<span>${byCourse.length}</span></button>`
      + courses.map(c => [c, byCourse.filter(it => it.c === c).length]).filter(([c, n]) => n || c === state.course)
        .map(([c, n]) => `<button type="button" data-course="${esc(c)}" style="${style(c)}" aria-pressed="${state.course === c}"><i></i>${esc(c)}<span>${n}</span></button>`).join('');

    count.textContent = flat ? list.length : '';
    clearBtn.hidden = !state.q;
    if (!list.length) {
      res.innerHTML = `<div class="m-empty"><h2>${flat ? `Sin resultados para «${esc(state.q.trim())}»` : 'Sin materiales'}</h2><button type="button" data-reset>Ver todo</button></div>`;
    } else if (flat) {
      res.innerHTML = `<section class="m-sec"><ul class="m-list">${list.map(it => row(it, true)).join('')}</ul></section>`;
    } else {
      res.innerHTML = courses.map(c => [c, list.filter(it => it.c === c)]).filter(([, l]) => l.length).map(([c, l]) =>
        `<section class="m-sec" id="c-${esc(fold(c).replace(/\W+/g, '-'))}"><h2>${esc(c)}<span>${l.length}</span></h2><ul class="m-list">${l.map(it => row(it, false)).join('')}</ul></section>`).join('');
    }
    res.setAttribute('aria-busy', 'false');
    const p = new URLSearchParams();
    if (state.q.trim()) p.set('q', state.q.trim());
    if (state.kind !== 'all') p.set('t', state.kind);
    if (state.course) p.set('c', state.course);
    try { history.replaceState(null, '', location.pathname + (String(p) ? `?${p}` : '')); } catch { /* file:// previews */ }
  }

  function toTop() { // keep the list in view when a filter shrinks the page
    const top = res.getBoundingClientRect().top + scrollY - consoleEl.offsetHeight - 60;
    if (scrollY > top) scrollTo({ top: Math.max(0, top), behavior: 'instant' });
  }

  q.value = state.q;
  q.addEventListener('input', () => { state.q = q.value; render(); });
  clearBtn.addEventListener('click', () => { state.q = q.value = ''; render(); q.focus(); });
  $('.search').addEventListener('submit', e => { e.preventDefault(); q.blur(); });
  kindsEl.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { state.kind = b.dataset.kind; render(); toTop(); } });
  coursesEl.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { state.course = b.dataset.course; render(); toTop(); } });
  res.addEventListener('click', e => { if (e.target.closest('[data-reset]')) { state.q = q.value = ''; state.kind = 'all'; state.course = ''; render(); } });

  const totop = $('.totop');
  const onScroll = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    consoleEl.classList.toggle('is-stuck', y > consoleEl.offsetTop);
    totop.classList.toggle('is-on', y > 700);
    totop.tabIndex = y > 700 ? 0 : -1;
    totop.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(3) : 0);
  };
  addEventListener('scroll', onScroll, { passive: true });
  totop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  fetch('/cepreuni/ciclopre20271/materiales.json?v=20261105').then(r => r.json()).then(d => {
    courses = d.courses;
    items = d.items.map(it => ({ ...it, h: fold([it.t, it.c, TAG[it.k], KINDS.find(([k]) => k === group(it.k))?.[1] || '', it.e || '', EVENT[it.e] || '', it.w ? `semana ${it.w} sem s${it.w}` : '', EXT[it.x] || '', it.k === 'repaso' ? 'reforzamiento' : ''].join(' ')) }));
    if (!KINDS.some(([k]) => k === state.kind)) state.kind = 'all';
    $('[data-stat="files"]').textContent = items.length;
    $('[data-stat="courses"]').textContent = new Set(items.map(it => it.c).filter(c => c !== 'General')).size;
    render();
    onScroll();
  }).catch(() => {
    res.setAttribute('aria-busy', 'false');
    res.innerHTML = '<div class="m-empty"><h2>No se pudo cargar la biblioteca</h2><button type="button" onclick="location.reload()">Reintentar</button></div>';
  });
})();
