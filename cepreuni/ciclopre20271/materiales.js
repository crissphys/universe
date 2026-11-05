/* CEPREUNI · materiales por ciclo. Datos: materiales-<ciclo>.json (tools/build-cepreuni-materials.py). */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const KINDS = [['clase', 'Clases'], ['libro', 'Materiales'], ['repaso', 'Repasos'], ['pizarra', 'Pizarras'],
    ['solucionario', 'Solucionarios'], ['resultado', 'Resultados'], ['info', 'Información']];
  const TAG = { clase: 'Clase', libro: 'Libro', adicional: 'Extra', repaso: 'Repaso', pizarra: 'Pizarra', solucionario: 'Solución', resultado: 'Resultado', info: 'Info' };
  const LABEL = { clase: 'Clase', libro: 'Material de estudio', adicional: 'Material adicional', repaso: 'Repaso', pizarra: 'Pizarra', solucionario: 'Solucionario', resultado: 'Resultados', info: 'Información' };
  const TILE = { clase: 'Clase', libro: 'Libro', adicional: 'Extra', repaso: 'Repaso', pizarra: 'Pizarra', solucionario: 'Solu.', resultado: 'Result.', info: 'Info' };
  const EVENT = { '1EP': '1.er parcial', '2EP': '2.º parcial', EF: 'Examen final', PC1: '1.ª PC', PC2: '2.ª PC', PC3: '3.ª PC', PC4: '4.ª PC', PC5: '5.ª PC', PC6: '6.ª PC', PC7: '7.ª PC', 'Selección': 'Selección' };
  const CYCLES = ['2027-1', '2026-2', '2026-1'];
  const EXT = { pptx: 'PPT', ppt: 'PPT', docx: 'DOC', doc: 'DOC', xlsx: 'XLS', png: 'IMG', jpg: 'IMG', jpeg: 'IMG', mp4: 'VID', folder: 'DIR' };
  // Matiz del color de cada curso (tarjeta y chip); General no lleva color.
  const HUE = { 'Aritmética': 35, 'Razonamiento Matemático': 15, 'Literatura': 312, 'Álgebra': 60, 'Geometría': 95, 'Trigonometría': 150, 'Física': 205, 'Química': 235,
    'Razonamiento Verbal': 275, 'Lenguaje': 300, 'Inglés': 325, 'Psicología': 350, 'Historia': 15, 'Geografía': 125, 'Economía': 180, 'Filosofía': 260 };
  const ARROW = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 13 13 7M8 7h5v5"/></svg>';
  const group = k => (k === 'adicional' ? 'libro' : k);
  const url = it => (it.f ? `https://drive.google.com/drive/folders/${it.i}` : `https://drive.google.com/file/d/${it.i}/view`);
  const plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;

  const q = $('#q'), clearBtn = $('.search-clear'), count = $('.search-count');
  const kindsEl = $('.m-kinds'), coursesEl = $('.m-courses'), res = $('#res'), consoleEl = $('.console');
  const params = new URLSearchParams(location.search);
  const state = { q: '', kind: params.get('t') || 'clase', course: params.get('c') || '', cycle: CYCLES.includes(params.get('ciclo')) ? params.get('ciclo') : CYCLES[0] };
  const cyclesEl = $('.m-cycles'), title = $('#hero-title em');
  const cache = {};
  let items = [], courses = [];

  const style = c => `--h:${HUE[c] ?? 0};--c:${c in HUE ? 1 : 0}`;
  const match = (it, words) => words.every(w => it.h.includes(w));
  const filtered = skip => {
    const words = fold(state.q).split(/\s+/).filter(Boolean);
    return items.filter(it => (skip === 'kind' || group(it.k) === state.kind)
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

  const wk = it => (it.w ? `${it.w}${it.p ? `<sup>.${it.p}</sup>` : ''}` : '·');
  // Clases: la portada es la miniatura de Drive (diapositiva 16:9); si falla queda el número de semana.
  function card(it, flat) {
    const meta = [flat && it.c !== 'General' ? `<b>${esc(it.c)}</b>` : '', it.w ? `Semana ${it.w}` : LABEL.clase, EXT[it.x]].filter(Boolean).join(' · ');
    return `<li><a class="m-card" style="${style(it.c)}" href="${url(it)}" target="_blank" rel="noopener"><span class="m-thumb"><em aria-hidden="true">${wk(it)}</em><img src="https://drive.google.com/thumbnail?id=${it.i}&sz=w400" loading="lazy" decoding="async" referrerpolicy="no-referrer" width="320" height="180" alt=""><b>${it.w ? `S${wk(it)}` : 'Clase'}</b></span><strong>${esc(it.t)}</strong><small>${meta}</small></a></li>`;
  }

  const rail = (list, flat) => `<div class="m-railbox"><ul class="m-rail">${list.map(it => card(it, flat)).join('')}</ul></div>`;
  const body = (list, flat) => {
    const cl = list.filter(it => it.k === 'clase'), rest = list.filter(it => it.k !== 'clase');
    return (cl.length ? rail(cl, flat) : '') + (rest.length ? `<ul class="m-list">${rest.map(it => row(it, flat)).join('')}</ul>` : '');
  };
  const nav = '<span class="m-nav"><button type="button" data-dir="-1" aria-label="Anteriores"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4.5 7 10l5.5 5.5"/></svg></button><button type="button" data-dir="1" aria-label="Siguientes"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7.5 4.5 13 10l-5.5 5.5"/></svg></button></span>';

  function render() {
    const list = filtered();
    const flat = !!state.q.trim();
    // Chips de tipo y curso: cada grupo cuenta con el filtro del otro aplicado.
    const byKind = filtered('kind'), byCourse = filtered('course');
    kindsEl.innerHTML = KINDS.filter(([k]) => items.some(it => group(it.k) === k)).map(([k, label]) => {
      const n = byKind.filter(it => group(it.k) === k).length;
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
      res.innerHTML = `<section class="m-sec">${body(list, true)}</section>`;
    } else {
      res.innerHTML = courses.map(c => [c, list.filter(it => it.c === c)]).filter(([, l]) => l.length).map(([c, l]) =>
        `<section class="m-sec" id="c-${esc(fold(c).replace(/\W+/g, '-'))}"><h2>${esc(c)}<span>${l.length}</span>${l.some(it => it.k === 'clase') ? nav : ''}</h2>${body(l, false)}</section>`).join('');
    }
    res.setAttribute('aria-busy', 'false');
    const p = new URLSearchParams();
    if (state.cycle !== CYCLES[0]) p.set('ciclo', state.cycle);
    if (state.kind !== 'clase') p.set('t', state.kind);
    if (state.course) p.set('c', state.course);
    try { history.replaceState(null, '', location.pathname + (String(p) ? `?${p}` : '')); } catch { /* file:// previews */ }
  }

  function toTop() { // keep the list in view when a filter shrinks the page
    const top = res.getBoundingClientRect().top + scrollY - consoleEl.offsetHeight - 60;
    if (scrollY > top) scrollTo({ top: Math.max(0, top), behavior: 'instant' });
  }

  q.value = '';
  q.addEventListener('input', () => {
    state.q = q.value;
    if (state.q.trim() && !filtered().length) state.kind = KINDS.find(([k]) => { state.kind = k; return filtered().length; })?.[0] || 'clase';
    render();
  });
  clearBtn.addEventListener('click', () => { state.q = q.value = ''; render(); q.focus(); });
  $('.search').addEventListener('submit', e => { e.preventDefault(); q.blur(); });
  kindsEl.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { state.kind = b.dataset.kind; render(); toTop(); } });
  coursesEl.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { state.course = b.dataset.course; render(); toTop(); } });
  res.addEventListener('click', e => {
    const dir = e.target.closest('[data-dir]');
    if (dir) { const r = dir.closest('.m-sec').querySelector('.m-rail'); r.scrollBy({ left: dir.dataset.dir * r.clientWidth * .85, behavior: 'smooth' }); }
  });
  res.addEventListener('error', e => { if (e.target.matches('.m-thumb img')) e.target.remove(); }, true); // el número de semana queda de portada
  res.addEventListener('click', e => { if (e.target.closest('[data-reset]')) { state.q = q.value = ''; state.kind = 'clase'; state.course = ''; render(); } });

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

  const prepare = d => d.items.map(it => ({ ...it, h: fold([it.t, it.c, TAG[it.k], KINDS.find(([k]) => k === group(it.k))?.[1] || '', it.e || '', EVENT[it.e] || '', it.w ? `semana ${it.w} sem s${it.w}` : '', EXT[it.x] || '', it.k === 'repaso' ? 'reforzamiento' : ''].join(' ')) }));
  const load = cyc => (cache[cyc] ||= fetch(`/cepreuni/ciclopre20271/materiales-${cyc}.json?v=20261110`).then(r => r.json()).then(d => ({ courses: d.courses, items: prepare(d) })));

  function renderCycles() {
    cyclesEl.innerHTML = CYCLES.map(c => `<button type="button" data-cycle="${c}" aria-pressed="${state.cycle === c}">${c}</button>`).join('');
  }

  async function setCycle(cyc) {
    res.setAttribute('aria-busy', 'true');
    let data;
    try { data = await load(cyc); } catch { delete cache[cyc]; failed(); return; }
    state.cycle = cyc;
    ({ courses, items } = data);
    if (!items.some(it => it.c === state.course)) state.course = '';
    if (!KINDS.some(([k]) => k === state.kind && items.some(it => group(it.k) === k))) state.kind = 'clase';
    title.textContent = cyc;
    document.title = `CEPREUNI ${cyc} · Biblioteca · UNIverse to Study`;
    $('[data-stat="files"]').textContent = items.length;
    $('[data-stat="courses"]').textContent = new Set(items.map(it => it.c).filter(c => c !== 'General')).size;
    renderCycles();
    render();
    onScroll();
  }

  function failed() {
    res.setAttribute('aria-busy', 'false');
    res.innerHTML = '<div class="m-empty"><h2>No se pudo cargar la biblioteca</h2><button type="button" onclick="location.reload()">Reintentar</button></div>';
  }

  cyclesEl.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (b && b.dataset.cycle !== state.cycle) { state.q = q.value = ''; setCycle(b.dataset.cycle); }
  });
  renderCycles();
  setCycle(state.cycle);
})();
