/* CEPREUNI · biblioteca de exámenes. Datos: examenes.json (una sección por evaluación, archivos en Drive). */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;

  // Evaluaciones en el orden del ciclo. weeks = semanas que evalúa (mismo dato que /cepreuni).
  const EVAL = {
    '1pc': { code: '1PC', short: '1.ª PC', long: '1.ª práctica calificada', weeks: '1–2', keys: 'pc1 primera practica' },
    '2pc': { code: '2PC', short: '2.ª PC', long: '2.ª práctica calificada', weeks: '3–6', keys: 'pc2 segunda practica' },
    '1ep': { code: '1EP', short: '1.er parcial', long: '1.er examen parcial', weeks: '1–7', keys: 'ep1 primer parcial examen', big: true },
    '3pc': { code: '3PC', short: '3.ª PC', long: '3.ª práctica calificada', weeks: '8–9', keys: 'pc3 tercera practica' },
    '4pc': { code: '4PC', short: '4.ª PC', long: '4.ª práctica calificada', weeks: '10–11', keys: 'pc4 cuarta practica' },
    '2ep': { code: '2EP', short: '2.º parcial', long: '2.º examen parcial', weeks: '8–13', keys: 'ep2 segundo parcial examen', big: true },
    '5pc': { code: '5PC', short: '5.ª PC', long: '5.ª práctica calificada', weeks: '15–16', keys: 'pc5 quinta practica' },
    '6pc': { code: '6PC', short: '6.ª PC', long: '6.ª práctica calificada', weeks: '17–18', keys: 'pc6 sexta practica' },
    '7pc': { code: '7PC', short: '7.ª PC', long: '7.ª práctica calificada', weeks: '19–20', keys: 'pc7 septima practica' },
    'examen-final': { code: 'EF', short: 'Examen final', long: 'Examen final', weeks: '15–20', keys: 'ef final examen', big: true },
  };
  const OLD = 'antes', SETS = 'colecciones';
  const CHEV = d => `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="${d}"/></svg>`;
  const PREV = CHEV('M12.5 4.5 7 10l5.5 5.5'), NEXT = CHEV('M7.5 4.5 13 10l-5.5 5.5');

  const thumb = (id, w) => `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w${w}`;
  const roman = s => s.replace(/(\d{4})-(II|I)\b/gi, (_, y, r) => `${y}-${r.length}`);

  // "2023-1 (MÁS SOLUCIONARIO)" → { cycle:'2023-1', key:20231, tags:['Solucionario'] }
  function parse(doc, ev) {
    const raw = roman(doc.title.replace(/\.pdf$/i, '')).trim();
    const up = raw.toUpperCase();
    const range = /(\d{4}-\d)\s*(?:A|AL)\s*(\d{4}-\d)/i.exec(raw);
    const single = /(\d{4})(?:-(\d))?/.exec(raw);
    const tags = [];
    if (/RECONSTRUIDO/.test(up)) tags.push('Reconstruido');
    if (/SOLUCIONARIO/.test(up)) tags.push('Solucionario');
    if (/CLAVES/.test(up)) tags.push('Claves');
    if (/\bHD\b/.test(up)) tags.push('HD');
    if (/NEGRO/.test(up)) tags.push('Negro');
    if (/OTRA FORMA/.test(up)) tags.push('Otra forma');
    let cycle = '', title, key, set = false;
    if (range) { set = true; title = `${range[1]} – ${range[2]}`; key = +range[2].replace('-', '') - .5; }
    else if (/COLECCI[OÓ]N/.test(up)) { set = true; title = 'Colección'; key = 0; }
    else if (single) { cycle = single[2] ? `${single[1]}-${single[2]}` : single[1]; title = cycle; key = single[1] * 10 + (+single[2] || 0); }
    else { title = raw; key = 0; }
    return { id: doc.id, url: doc.url, ev, cycle, title, key, set, tags, raw };
  }

  const q = $('#q'), clearBtn = $('.search-clear'), count = $('.search-count');
  const evalsEl = $('.x-evals'), cyclesEl = $('.x-cycles'), res = $('#res'), consoleEl = $('.console');
  const viewer = $('.x-viewer'), frame = $('.x-frame', viewer);
  const params = new URLSearchParams(location.search);
  const state = { q: '', ev: '', cycle: '' };
  let docs = [], byId = new Map(), cycles = [], list = [], openIdx = -1, intro = true;

  const cycleOf = d => (d.set ? SETS : d.key < 20230 ? OLD : d.cycle);
  const match = (d, words) => words.every(w => d.h.includes(w));
  function filtered(skip) {
    const words = fold(state.q).split(/\s+/).filter(Boolean);
    return docs.filter(d => (skip === 'ev' || !state.ev || d.ev === state.ev)
      && (skip === 'cycle' || !state.cycle || cycleOf(d) === state.cycle) && match(d, words));
  }
  const sortNew = arr => arr.slice().sort((a, b) => (a.set - b.set) || (b.key - a.key) || (a.i - b.i));
  const sortCycle = arr => arr.slice().sort((a, b) => (a.e - b.e) || (b.key - a.key) || (a.i - b.i));

  function card(d, i, mode) {
    const e = EVAL[d.ev];
    // Con un ciclo elegido el título es la evaluación; si no, el ciclo.
    const head = mode === 'cycle' && !d.set ? e.short : d.title;
    const lead = mode === 'cycle' && !d.set ? d.title : mode === 'flat' || mode === 'cycle' ? e.short : '';
    const meta = [lead && esc(lead), ...d.tags.map(t => (t === 'Reconstruido' || t === 'Solucionario' ? `<mark>${t}</mark>` : t))].filter(Boolean);
    return `<li style="--i:${Math.min(i, 9)}"><a class="x-card" href="${esc(d.url)}" target="_blank" rel="noopener" data-id="${esc(d.id)}">`
      + `<span class="x-thumb"><em aria-hidden="true">${esc(d.set ? 'Colección' : d.cycle || e.code)}</em>`
      + `<img src="${thumb(d.id, 480)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" width="300" height="400" alt="">`
      + `<b class="x-badge${e.big ? ' is-big' : ''}">${e.code}</b></span>`
      + `<strong>${esc(head)}</strong>${meta.length ? `<small>${meta.join(' · ')}</small>` : ''}`
      + '</a></li>';
  }

  const nav = '<span class="x-nav"><button type="button" data-dir="-1" aria-label="Anteriores">' + PREV + '</button><button type="button" data-dir="1" aria-label="Siguientes">' + NEXT + '</button></span>';

  function render() {
    const hits = filtered();
    const flat = !!state.q.trim();
    const byEv = filtered('ev'), byCycle = filtered('cycle');
    evalsEl.innerHTML = `<button type="button" data-ev="" aria-pressed="${!state.ev}">Todas<span>${byEv.length}</span></button>`
      + Object.entries(EVAL).map(([k, e]) => {
        const n = byEv.filter(d => d.ev === k).length;
        return `<button type="button" data-ev="${k}" aria-pressed="${state.ev === k}"${n || state.ev === k ? '' : ' disabled'}>${e.short}<span>${n}</span></button>`;
      }).join('');
    cyclesEl.innerHTML = `<button type="button" data-cycle="" aria-pressed="${!state.cycle}">Todos<span>${byCycle.length}</span></button>`
      + cycles.map(c => [c, byCycle.filter(d => cycleOf(d) === c).length]).filter(([c, n]) => n || c === state.cycle)
        .map(([c, n]) => `<button type="button" data-cycle="${c}" aria-pressed="${state.cycle === c}"${/^\d/.test(c) ? ' class="is-num"' : ''}>${c === OLD ? 'Antes de 2023' : c === SETS ? 'Colecciones' : c}<span>${n}</span></button>`).join('');

    count.textContent = flat ? hits.length : '';
    clearBtn.hidden = !state.q;
    let html;
    if (!hits.length) {
      list = [];
      html = `<div class="x-empty"><h2>${flat ? `Sin resultados para «${esc(state.q.trim())}»` : 'No hay exámenes con estos filtros'}</h2><button type="button" data-reset>Ver todos</button></div>`;
    } else if (state.ev || state.cycle || flat) {
      // Una sola grilla: por evaluación (más reciente primero) o el ciclo completo en orden de evaluación.
      const mode = flat ? 'flat' : state.ev ? 'ev' : 'cycle';
      list = mode === 'cycle' ? sortCycle(hits) : sortNew(hits);
      const e = EVAL[state.ev];
      const h = mode === 'ev' ? `<h2>${e.long}<span>${list.length}</span><i>Semanas ${e.weeks}</i></h2>`
        : mode === 'cycle' ? `<h2>${state.cycle === OLD ? 'Antes de 2023' : state.cycle === SETS ? 'Colecciones' : `Ciclo ${state.cycle}`}<span>${list.length}</span></h2>` : '';
      html = `<section class="x-sec">${h}<ul class="x-grid">${list.map((d, i) => card(d, i, mode === 'ev' ? 'ev' : mode)).join('')}</ul></section>`;
    } else {
      // Vista inicial: una fila por evaluación.
      list = [];
      html = Object.entries(EVAL).map(([k, e]) => {
        const l = sortNew(hits.filter(d => d.ev === k));
        if (!l.length) return '';
        list.push(...l);
        return `<section class="x-sec" id="e-${k}"><h2><button type="button" class="x-more" data-ev="${k}">${e.long}<span>${l.length}</span>${NEXT}</button><i>Semanas ${e.weeks}</i>${nav}</h2>`
          + `<div class="x-railbox"><ul class="x-rail">${l.map((d, i) => card(d, i, 'ev')).join('')}</ul></div></section>`;
      }).join('');
    }
    res.innerHTML = html;
    res.classList.toggle('is-intro', intro);
    if (!intro) { res.classList.remove('is-swap'); void res.offsetWidth; res.classList.add('is-swap'); }
    intro = false;
    res.setAttribute('aria-busy', 'false');
    syncUrl();
  }

  function syncUrl() {
    const p = new URLSearchParams();
    if (state.ev) p.set('e', state.ev);
    if (state.cycle) p.set('ciclo', state.cycle);
    if (openIdx > -1 && list[openIdx]) p.set('doc', list[openIdx].id);
    try { history.replaceState(null, '', location.pathname + (String(p) ? `?${p}` : '')); } catch { /* file:// */ }
  }

  function toTop() { // mantiene los resultados a la vista cuando un filtro acorta la página
    const top = res.getBoundingClientRect().top + scrollY - consoleEl.offsetHeight - 60;
    if (scrollY > top) scrollTo({ top: Math.max(0, top), behavior: 'instant' });
  }

  /* ---------- Visor ---------- */
  const vTitle = $('.x-v-title', viewer), vMeta = $('.x-v-meta', viewer), vOpen = $('.x-v-open', viewer), vPos = $('.x-v-pos', viewer);
  const vPrev = $('[data-step="-1"]', viewer), vNext = $('[data-step="1"]', viewer);

  function show(idx) {
    const d = list[idx];
    if (!d) return;
    openIdx = idx;
    const e = EVAL[d.ev];
    vTitle.textContent = d.set ? `${e.short} · ${d.title}` : `${e.short} · ${d.cycle || d.title}`;
    vMeta.textContent = [e.long, ...d.tags].join(' · ');
    vOpen.href = d.url;
    vPos.textContent = `${idx + 1} / ${list.length}`;
    vPrev.disabled = idx === 0;
    vNext.disabled = idx === list.length - 1;
    // La primera página aparece al instante; el PDF completo la reemplaza al cargar.
    frame.classList.remove('is-ready');
    frame.innerHTML = `<img class="x-poster" src="${thumb(d.id, 1000)}" alt="" referrerpolicy="no-referrer"><span class="x-loading" role="status">Cargando documento</span>`
      + `<iframe src="https://drive.google.com/file/d/${encodeURIComponent(d.id)}/preview" title="${esc(vTitle.textContent)}" allow="autoplay" loading="eager"></iframe>`;
    const iframe = $('iframe', frame);
    // Drive dispara load antes de pintar la página: se espera un poco para no mostrar un cuadro vacío.
    iframe.addEventListener('load', () => setTimeout(() => { if (iframe.isConnected) frame.classList.add('is-ready'); }, 1100), { once: true });
    $('.x-poster', frame).addEventListener('error', ev => ev.target.remove(), { once: true });
    syncUrl();
  }

  function open(id) {
    const idx = list.findIndex(d => d.id === id);
    if (idx < 0) return;
    show(idx);
    if (!viewer.open) { viewer.showModal(); document.documentElement.classList.add('is-locked'); }
  }

  viewer.addEventListener('close', () => {
    openIdx = -1;
    document.documentElement.classList.remove('is-locked');
    setTimeout(() => { if (!viewer.open) frame.replaceChildren(); }, 220);
    syncUrl();
  });
  viewer.addEventListener('click', e => {
    if (e.target === viewer) viewer.close(); // clic en el fondo
    const step = e.target.closest('[data-step]');
    if (step) show(openIdx + +step.dataset.step);
    if (e.target.closest('[data-close]')) viewer.close();
  });
  viewer.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' && openIdx > 0) { e.preventDefault(); show(openIdx - 1); }
    if (e.key === 'ArrowRight' && openIdx < list.length - 1) { e.preventDefault(); show(openIdx + 1); }
  });

  /* ---------- Eventos ---------- */
  q.value = '';
  q.addEventListener('input', () => {
    state.q = q.value;
    // Si los filtros dejan la búsqueda vacía, se sueltan: primero el ciclo, luego la evaluación.
    if (state.q.trim() && !filtered().length && state.cycle) state.cycle = '';
    if (state.q.trim() && !filtered().length && state.ev) state.ev = '';
    render();
  });
  clearBtn.addEventListener('click', () => { state.q = q.value = ''; render(); q.focus(); });
  $('.search').addEventListener('submit', e => { e.preventDefault(); q.blur(); });
  evalsEl.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { state.ev = b.dataset.ev; render(); toTop(); } });
  cyclesEl.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { state.cycle = b.dataset.cycle; render(); toTop(); } });
  res.addEventListener('click', e => {
    const a = e.target.closest('.x-card');
    if (a && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button)) { e.preventDefault(); open(a.dataset.id); return; }
    const more = e.target.closest('.x-more');
    if (more) { state.ev = more.dataset.ev; render(); toTop(); return; }
    const dir = e.target.closest('[data-dir]');
    if (dir) { const r = dir.closest('.x-sec').querySelector('.x-rail'); r.scrollBy({ left: dir.dataset.dir * r.clientWidth * .85, behavior: 'smooth' }); return; }
    if (e.target.closest('[data-reset]')) { state.q = q.value = ''; state.ev = state.cycle = ''; render(); }
  });
  res.addEventListener('error', e => { if (e.target.matches('.x-thumb img')) e.target.remove(); }, true); // queda el ciclo como portada
  res.addEventListener('load', e => { if (e.target.matches('.x-thumb img')) e.target.classList.add('is-on'); }, true);

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

  /* ---------- Carga ---------- */
  fetch('/cepreuni/examenes/examenes.json?v=20261114').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(data => {
    const order = Object.keys(EVAL);
    docs = data.sections.filter(s => EVAL[s.id]).flatMap(s => s.documents.map(doc => parse(doc, s.id)));
    docs.forEach((d, i) => {
      const e = EVAL[d.ev];
      d.i = i; d.e = order.indexOf(d.ev);
      d.h = fold([d.raw, d.title, d.cycle, e.code, e.short, e.long, e.keys, ...d.tags, d.set ? 'coleccion' : ''].join(' '));
      byId.set(d.id, d);
    });
    const recent = [...new Set(docs.filter(d => !d.set && d.key >= 20230).sort((a, b) => b.key - a.key).map(d => d.cycle))];
    cycles = [...recent, OLD, SETS];
    const years = docs.filter(d => !d.set && d.key).map(d => Math.floor(d.key >= 10000 ? d.key / 10 : d.key));
    $('[data-stat="docs"]').textContent = docs.length;
    $('[data-stat="range"]').textContent = `${Math.min(...years)}–${Math.max(...years)}`;
    if (EVAL[params.get('e')]) state.ev = params.get('e');
    if (cycles.includes(params.get('ciclo'))) state.cycle = params.get('ciclo');
    render();
    onScroll();
    const deep = params.get('doc');
    if (deep && byId.has(deep)) {
      if (!list.some(d => d.id === deep)) { state.ev = byId.get(deep).ev; state.cycle = ''; render(); }
      open(deep);
    }
  }).catch(() => {
    res.setAttribute('aria-busy', 'false');
    res.innerHTML = '<div class="x-empty"><h2>No se pudo cargar la biblioteca</h2><button type="button" onclick="location.reload()">Reintentar</button></div>';
  });
})();
