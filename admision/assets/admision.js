/* Admisión UNI v4. Datos: /admission-data.js (cortes 2022-2…2026-2) y resúmenes 2026-2 por prueba. */
(() => {
  'use strict';
  const AD = window.UNIVERSE_ADMISSION_DATA;
  if (!AD) return;
  const DATA = AD.DATA, CYCLES = AD.CYCLES, CAREERS = AD.CAREERS.slice(), MAX = AD.MAX_SCORE || 1800;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const nf0 = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat('es-PE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const nf2 = new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pts = (v) => nf0.format(Math.round(v));
  const v20 = (v) => nf2.format(v / 90);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fold = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const slug = (s) => fold(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch {} } };

  /* ---------- Modelo (mismo cálculo que la página anterior: admission-engine.js) ---------- */
  const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const sampleSd = (a) => { if (a.length < 2) return 70; const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };
  function linearForecast(p, nx) {
    if (p.length < 2) return p.length ? p[0].y : 0;
    const mx = mean(p.map((q) => q.x)), my = mean(p.map((q) => q.y));
    let num = 0, den = 0; p.forEach((q) => { num += (q.x - mx) * (q.y - my); den += (q.x - mx) ** 2; });
    const b = den ? num / den : 0; return my - b * mx + b * nx;
  }
  function cuts(c) {
    const out = [];
    CYCLES.forEach((cy, i) => { const r = DATA[cy] && DATA[cy][c]; if (r && isFinite(r.minRaw)) out.push({ cycle: cy, x: i, y: Number(r.minRaw) }); });
    return out;
  }
  function estimate(c) {
    const p = cuts(c); if (!p.length) return null;
    const v = p.map((q) => q.y);
    const wDen = v.reduce((s, _, i) => s + i + 1, 0);
    const weighted = v.reduce((s, x, i) => s + x * (i + 1), 0) / wDen;
    const projected = clamp(0.58 * weighted + 0.42 * linearForecast(p, CYCLES.length), 0, MAX);
    const sd = sampleSd(v);
    const trend = v.length > 1 ? (v[v.length - 1] - v[0]) / (v.length - 1) : 0;
    const low = clamp(projected + 0.2 * sd, 0, MAX), high = clamp(projected + 0.75 * sd, 0, MAX);
    const target = clamp(high + clamp(Math.max(0, trend) * 0.75 + sd * 0.28, 35, 95), 0, MAX);
    return { cuts: p, projected, sd, low, high, target, latest: p[p.length - 1] };
  }
  function latest(c, field) {
    for (let i = CYCLES.length - 1; i >= 0; i--) { const r = DATA[CYCLES[i]] && DATA[CYCLES[i]][c]; if (r && r[field] != null && isFinite(r[field])) return { v: Number(r[field]), cycle: CYCLES[i] }; }
    return null;
  }
  const MODEL = new Map(CAREERS.map((c) => [c, estimate(c)]));
  const BY_SLUG = new Map(CAREERS.map((c) => [slug(c), c]));
  const LAST = CYCLES[CYCLES.length - 1];

  /* ---------- Estado ---------- */
  const state = { career: null, scores: [null, null, null] };
  const fromUrl = BY_SLUG.get(new URLSearchParams(location.search).get('carrera') || '');
  state.career = fromUrl || BY_SLUG.get(store.get('adm_career') || '') || 'Ingeniería Civil';
  try { const s = JSON.parse(store.get('adm_scores') || 'null'); if (Array.isArray(s) && s.length === 3) state.scores = s.map((x) => (x == null || !isFinite(x) ? null : clamp(+x, 0, 600))); } catch {}

  /* ---------- Hero: letras ---------- */
  let ci = 0;
  $$('.a-hero h1 .w').forEach((w) => { w.innerHTML = [...w.textContent].map((ch) => `<span class="ch" aria-hidden="true" style="--i:${ci++}">${esc(ch)}</span>`).join(''); });

  /* ---------- Contador animado ---------- */
  const tweens = new WeakMap();
  function count(el, to, fmt = pts) {
    const from = Number(el.dataset.v || 0);
    el.dataset.v = to;
    if (reduced || !isFinite(from) || Math.abs(to - from) < 1) { el.textContent = fmt(to); return; }
    cancelAnimationFrame(tweens.get(el));
    const t0 = performance.now(), d = 620;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(from + (to - from) * e);
      if (k < 1) tweens.set(el, requestAnimationFrame(step));
    };
    tweens.set(el, requestAnimationFrame(step));
  }
  const K = (k, root = document) => $(`[data-k="${k}"]`, root);
  const pct = (v) => clamp(v / MAX * 100, 0, 100);

  /* ---------- Buscador de carreras (combobox) ---------- */
  const input = $('#career'), list = $('#career-list'), clear = $('.pick .search-clear');
  let opts = [], active = -1;
  function match(q) {
    const words = fold(q).split(/\s+/).filter(Boolean);
    const rows = CAREERS.filter((c) => { const f = fold(c); return words.every((w) => f.includes(w)); });
    return rows.sort((a, b) => MODEL.get(b).target - MODEL.get(a).target);
  }
  function openList() {
    opts = match(input.value);
    active = opts.length ? 0 : -1;
    list.innerHTML = opts.length
      ? opts.map((c, i) => `<li id="opt-${i}" role="option" aria-selected="${i === active}" data-c="${esc(c)}">${esc(c)}<small>${pts(MODEL.get(c).target)}</small></li>`).join('')
      : '<li class="is-none" role="option" aria-disabled="true">Sin coincidencias</li>';
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    input.setAttribute('aria-activedescendant', active >= 0 ? 'opt-0' : '');
  }
  function closeList() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); }
  function move(d) {
    if (!opts.length) return;
    active = (active + d + opts.length) % opts.length;
    $$('li', list).forEach((li, i) => li.setAttribute('aria-selected', i === active));
    const li = $(`#opt-${active}`); input.setAttribute('aria-activedescendant', li.id); li.scrollIntoView({ block: 'nearest' });
  }
  function choose(c, { scroll = true } = {}) {
    closeList(); input.value = ''; clear.hidden = true; input.blur();
    select(c);
    if (scroll) $('#meta').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }
  input.addEventListener('focus', openList);
  input.addEventListener('input', () => { clear.hidden = !input.value; openList(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); list.hidden ? openList() : move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); if (opts[active]) choose(opts[active]); }
    else if (e.key === 'Escape') { closeList(); input.blur(); }
  });
  list.addEventListener('pointerdown', (e) => e.preventDefault());
  list.addEventListener('click', (e) => { const li = e.target.closest('li[data-c]'); if (li) choose(li.dataset.c); });
  clear.addEventListener('click', () => { input.value = ''; clear.hidden = true; input.focus(); openList(); });
  document.addEventListener('pointerdown', (e) => { if (!e.target.closest('.pick-box')) closeList(); });
  input.addEventListener('blur', () => setTimeout(() => { if (document.activeElement !== input) closeList(); }, 0));

  /* ---------- Meta de la carrera ---------- */
  const card = $('.meta-card'), hist = $('.hist');
  function select(c, { push = true } = {}) {
    if (!MODEL.get(c)) return;
    const changed = c !== state.career || !card.dataset.ready;
    state.career = c; store.set('adm_career', slug(c));
    if (push) { const u = new URL(location.href); u.searchParams.set('carrera', slug(c)); history.replaceState(null, '', u); }
    const m = MODEL.get(c);
    const name = $('#meta-name');
    if (changed) { name.textContent = c; name.classList.remove('swap'); void name.offsetWidth; name.classList.add('swap'); }
    count(K('target'), m.target);
    K('target20').textContent = `${v20(m.target)} sobre 20`;
    K('zone').textContent = `${pts(m.low)}–${pts(m.high)}`;
    K('last').textContent = `${pts(m.latest.y)} (${m.latest.cycle})`;
    const r = DATA[LAST][c];
    K('min26').textContent = r ? pts(r.minRaw) : '—';
    K('max26').textContent = r ? pts(r.maxRaw) : '—';
    const cap = latest(c, 'capacity');
    K('cap').textContent = cap ? nf0.format(cap.v) : '—';
    K('capCycle').textContent = cap ? cap.cycle : '';
    $('.scale-zone').style.setProperty('--x', pct(m.low) + '%');
    $('.scale-zone > i').style.setProperty('--w', ((m.high - m.low) / MAX).toFixed(4));
    $('.scale-mark.is-target').style.setProperty('--x', pct(m.target) + '%');
    $('.scale-mark.is-last').style.setProperty('--x', pct(m.latest.y) + '%');
    renderHist(m);
    card.dataset.ready = '1';
    $$('.mm button').forEach((b) => b.setAttribute('aria-current', b.dataset.c === c));
    document.title = `${c}: puntaje meta 2027-1 · Admisión UNI · UNIverse to Study`;
    renderYou();
  }

  function renderHist(m) {
    // Eje desde un piso (no desde 0) para que se note cuánto cambia el corte entre procesos.
    const lo = Math.min(...m.cuts.map((q) => q.y)), hi = Math.max(...m.cuts.map((q) => q.y), m.target);
    const floor = Math.max(0, Math.floor((lo - (hi - lo) * 0.6 - 40) / 100) * 100), top = hi + (hi - floor) * 0.14;
    const h = (v) => ((v - floor) / (top - floor) * 100).toFixed(2);
    const p = projection();
    hist.innerHTML = m.cuts.map((q, i) => {
      const cls = ['bar', i === m.cuts.length - 1 ? 'is-latest' : '', p != null && p >= q.y ? 'is-pass' : ''].join(' ');
      return `<div class="${cls}" style="--h:${h(q.y)};--i:${i}" tabindex="0" aria-label="${q.cycle}: ${pts(q.y)} puntos"><i></i><b>${pts(q.y)}</b><span>${q.cycle.slice(2)}</span></div>`;
    }).join('') + `<i class="hist-line" style="--y:${(h(m.target) / 100).toFixed(4)}" data-l="Meta ${pts(m.target)}"></i>`;
    K('histN').textContent = `${m.cuts.length} procesos`;
    hist.classList.remove('is-in');
    if (reduced) hist.classList.add('is-in');
    else requestAnimationFrame(() => requestAnimationFrame(() => hist.classList.add('is-in')));
  }

  /* ---------- Tu puntaje ---------- */
  const form = $('.you-card'), ins = $$('.you-inputs input'), out = $('.you-out');
  const parse = (s) => { s = String(s).trim().replace(',', '.'); if (!s) return null; const n = Number(s); return isFinite(n) ? n : NaN; };
  ins.forEach((el, i) => { if (state.scores[i] != null) el.value = String(state.scores[i]).replace('.', ','); });
  function projection() {
    const s = state.scores.filter((x) => x != null);
    return s.length ? clamp(s.reduce((a, b) => a + b, 0) / s.length * 3, 0, MAX) : null;
  }
  function renderYou() {
    const m = MODEL.get(state.career), p = projection();
    const done = state.scores.filter((x) => x != null).length;
    $('.you-clear').hidden = !done;
    renderNeeds(m, done);
    const you = $('.scale-mark.is-you');
    $('.lg-you-row').hidden = p == null; you.hidden = p == null;
    $$('.hist .bar').forEach((b, i) => b.classList.toggle('is-pass', p != null && p >= m.cuts[i].y));
    if (p == null) { out.dataset.state = 'empty'; return; }
    out.dataset.state = 'on';
    you.style.setProperty('--x', pct(p) + '%');
    K('you').textContent = pts(p);
    count(K('proj'), p);
    K('projLabel').textContent = done === 3 ? 'pts de 1800' : `pts proyectados · ${done} de 3 pruebas`;
    const gap = p - m.target;
    K('gap').innerHTML = gap >= 0
      ? `Superas la meta por <b class="up">${pts(gap)}</b> pts.`
      : `Te faltan <b>${pts(-gap)}</b> pts para la meta (${v20(-gap)} en vigesimal).`;
    const passed = m.cuts.filter((q) => p >= q.y).length;
    $('.you-cuts').innerHTML = m.cuts.map((q, i) => `<i class="${p >= q.y ? 'on' : ''}" style="--i:${i}"></i>`).join('');
    K('cuts').textContent = `Habrías ingresado en ${passed} de ${m.cuts.length} procesos`;
  }
  // Una sola nota por prueba: la escriben aquí o en «Resultados 2026-2» y se refleja en ambos lados.
  function setScore(i, raw, from) {
    const v = parse(raw);
    const bad = Number.isNaN(v) || (v != null && (v < 0 || v > 600));
    ins[i].setAttribute('aria-invalid', bad);
    if (from !== ins[i]) ins[i].value = raw;
    state.scores[i] = bad ? null : v;
    store.set('adm_scores', JSON.stringify(state.scores));
    renderYou();
    if (typeof syncExam === 'function') syncExam(i, from);
  }
  let syncExam = null;
  form.addEventListener('input', (e) => { const i = ins.indexOf(e.target); if (i >= 0) setScore(i, e.target.value, e.target); });
  // Calculadora: cuánto necesitas en las pruebas que faltan para cada referencia.
  function renderNeeds(m, done) {
    const total = state.scores.reduce((a, b) => a + (b || 0), 0), left = 3 - done;
    const floor = m.cuts.reduce((a, q) => (q.y < a.y ? q : a));
    const goals = [['Meta 2027-1', m.target, 'con margen'], ['Último corte', m.latest.y, m.latest.cycle], ['Corte más bajo', floor.y, floor.cycle]];
    K('needsHead').textContent = !done ? 'Para ingresar necesitas en cada prueba'
      : left ? `Llevas ${pts(total)} de ${pts(done * 600)}. En ${left === 1 ? 'la prueba que falta' : `cada una de las ${left} que faltan`} necesitas`
      : `Tu total: ${pts(total)} de 1800`;
    $('.needs-list').innerHTML = goals.map(([name, goal, sub]) => {
      let val;
      if (left) {
        const need = (goal - total) / left;
        val = need <= 0 ? '<b class="ok">Ya lo superas</b>' : need > 600 ? '<b class="no">No alcanza</b>' : `<b>${pts(Math.ceil(need))}<small> / 600</small></b>`;
      } else {
        const d = total - goal;
        val = d >= 0 ? `<b class="ok">+${pts(d)}</b>` : `<b>−${pts(-d)}</b>`;
      }
      return `<li><span>${name}<small>${pts(goal)} · ${sub}</small></span>${val}</li>`;
    }).join('');
  }
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('reset', () => { state.scores = [null, null, null]; store.set('adm_scores', 'null'); ins.forEach((x) => x.removeAttribute('aria-invalid')); setTimeout(() => { renderYou(); if (syncExam) syncExam(-1); }); });

  /* ---------- Máximos y mínimos por concurso ---------- */
  const mm = $('.mm'), more = $('.more'), cyc = $('.cyc'), sum = $('.mm-sum');
  const FIRST = 8, META = '2027-1';
  let cycle = LAST, sort = 'min', open = false;
  const fromCycle = new URLSearchParams(location.search).get('concurso');
  if (fromCycle && (fromCycle === META || Object.prototype.hasOwnProperty.call(DATA, fromCycle))) cycle = fromCycle;
  cyc.innerHTML = `<button type="button" class="is-meta" data-y="${META}" aria-pressed="false">Meta ${META}</button>`
    + CYCLES.slice().reverse().map((y) => `<button type="button" data-y="${y}" aria-pressed="false">${y}</button>`).join('');
  function mmRows() {
    if (cycle === META) return CAREERS.map((c) => { const m = MODEL.get(c); return { c, min: m.low, max: m.high, val: m.target, apps: null, cap: null }; });
    return Object.keys(DATA[cycle]).map((c) => { const r = DATA[cycle][c]; return { c, min: +r.minRaw, max: +(r.maxRaw || r.minRaw), val: +r.minRaw, apps: r.applicants, cap: r.capacity }; });
  }
  function renderMM(anim) {
    const rows = mmRows();
    const hasComp = rows.some((r) => r.apps && r.cap);
    if (!hasComp && sort === 'comp') sort = 'min';
    $$('.seg button').forEach((b) => { b.setAttribute('aria-pressed', b.dataset.sort === sort); if (b.dataset.sort === 'comp') b.hidden = !hasComp; });
    const comp = (r) => (r.apps && r.cap ? r.apps / r.cap : -1);
    rows.sort(sort === 'az' ? (a, b) => a.c.localeCompare(b.c, 'es') : sort === 'comp' ? (a, b) => comp(b) - comp(a) : (a, b) => b.val - a.val);
    $$('button', cyc).forEach((b) => b.setAttribute('aria-pressed', b.dataset.y === cycle));
    const t = AD.TOTALS[cycle];
    sum.innerHTML = cycle === META
      ? 'Barra: corte estimado<i></i>Número: meta con margen'
      : [t && t.applicants ? `<span>${nf0.format(t.applicants)}</span>postulantes` : '', t && t.admitted ? `<span>${nf0.format(t.admitted)}</span>ingresantes` : '', t && t.applicants ? '' : `<span>${rows.length}</span>carreras`].filter(Boolean).join('<i></i>');
    mm.innerHTML = rows.map((r, i) => {
      const sub = cycle === META
        ? `Corte estimado <b>${pts(r.min)}–${pts(r.max)}</b>`
        : `Mín. <b>${pts(r.min)}</b> · Máx. <b>${pts(r.max)}</b>` + (r.apps ? ` · ${nf0.format(r.apps)} postulantes` : '') + (r.cap ? ` · ${nf0.format(r.cap)} vacantes` : '') + (r.apps && r.cap ? ` · <b>${nf1.format(r.apps / r.cap)}</b> por vacante` : '');
      const val = cycle === META ? `${pts(r.val)}<small> pts</small>` : sort === 'comp' && r.apps && r.cap ? `${nf1.format(r.apps / r.cap)}<small> por vacante</small>` : `${pts(r.val)}<small> mín.</small>`;
      return `<li class="${i >= FIRST ? 'is-extra' : ''}" style="--i:${Math.min(i, 12)}"><button type="button" data-c="${esc(r.c)}" aria-current="${r.c === state.career}">
        <span class="n">${String(i + 1).padStart(2, '0')}</span><span class="nm">${esc(r.c)}</span><span class="val">${val}</span>
        <span class="br" aria-hidden="true"><i style="--a:${pct(r.min).toFixed(2)}%;--w:${((r.max - r.min) / MAX).toFixed(4)}"></i></span>
        <span class="sub">${sub}</span></button></li>`;
    }).join('');
    mm.classList.toggle('is-open', open);
    more.hidden = rows.length <= FIRST;
    more.setAttribute('aria-expanded', open);
    more.textContent = open ? 'Ver menos' : `Ver las ${rows.length}`;
    if (anim && !reduced) { mm.classList.remove('is-swap'); void mm.offsetWidth; mm.classList.add('is-swap'); }
  }
  cyc.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b || b.dataset.y === cycle) return;
    cycle = b.dataset.y;
    const u = new URL(location.href); if (cycle === LAST) u.searchParams.delete('concurso'); else u.searchParams.set('concurso', cycle); history.replaceState(null, '', u);
    renderMM(true);
  });
  mm.addEventListener('click', (e) => { const b = e.target.closest('button[data-c]'); if (b) choose(b.dataset.c); });
  more.addEventListener('click', () => {
    open = !open; renderMM(false);
    if (!open) $('#cortes').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  });
  $$('.seg button').forEach((b) => b.addEventListener('click', () => { if (sort !== b.dataset.sort) { sort = b.dataset.sort; renderMM(true); } }));

  /* ---------- Resultados 2026-2 ---------- */
  const EXAMS = [
    { id: 'e1', name: 'Humanidades', d: window.UNIVERSE_ADMISSION_2026_2 },
    { id: 'e2', name: 'Matemática', d: window.UNIVERSE_ADMISSION_2026_2_EXAM2 },
    { id: 'e3', name: 'Física y Química', d: window.UNIVERSE_ADMISSION_2026_2_EXAM3 },
  ].filter((x) => x.d && x.d.stats);
  const tabs = $('.exam-tabs'), stats = $('.exam-stats'), bins = $('.bins'), pin = $('.pct input'), pout = $('.pct output');
  let ex = 0;
  const slot = () => Number(EXAMS[ex].id.slice(1)) - 1;
  const plabel = $('.pct span');
  const day = (s) => new Date(s + 'T12:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }).replace('.', '');
  tabs.innerHTML = EXAMS.map((x, i) => `<button type="button" role="tab" id="tab-${x.id}" aria-selected="${i === 0}" data-i="${i}">${x.name}<small>${day(x.d.publishedAt)}</small></button>`).join('');
  tabs.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b && +b.dataset.i !== ex) { ex = +b.dataset.i; renderExam(true); } });
  tabs.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    ex = (ex + (e.key === 'ArrowRight' ? 1 : -1) + EXAMS.length) % EXAMS.length; renderExam(true); $(`#tab-${EXAMS[ex].id}`).focus();
  });
  function percentile(d, score) {
    const f = d.scoreFrequencies || [];
    const n = f.reduce((s, x) => s + x.count, 0); if (!n) return null;
    const below = f.reduce((s, x) => s + (x.score < score ? x.count : 0), 0);
    const above = f.reduce((s, x) => s + (x.score > score ? x.count : 0), 0);
    return { below: below / n * 100, pos: above + 1, n };
  }
  function renderExam(anim) {
    const x = EXAMS[ex], st = x.d.stats, max = x.d.examMax || 600;
    if (document.activeElement !== pin) pin.value = ins[slot()].value;
    plabel.textContent = `Tu nota de ${x.name}`;
    $$('button', tabs).forEach((b, i) => { b.setAttribute('aria-selected', i === ex); b.tabIndex = i === ex ? 0 : -1; });
    $('.exam').setAttribute('aria-labelledby', `tab-${x.id}`);
    stats.innerHTML = [['Rindieron', nf0.format(st.present)], ['Promedio', nf1.format(st.mean)], ['Más alto', nf0.format(st.maximum)], ['Desviación', nf1.format(st.standardDeviationPopulation)]]
      .map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('');
    const top = Math.max(...st.bins.map((b) => b.count));
    const v = parse(pin.value), you = v != null && !Number.isNaN(v) && v >= 0 && v <= max ? v : null;
    bins.innerHTML = st.bins.map((b, i) => {
      const on = you != null && you >= b.low && (you < b.high || (b.high === max && you <= max));
      return `<i class="${on ? 'is-you' : ''}" style="--h:${(b.count / top * 100).toFixed(2)};--i:${i}${anim && !reduced ? ';--s:0' : ''}" title="${b.low}–${b.high}: ${nf0.format(b.count)} postulantes"></i>`;
    }).join('') + `<span class="bins-mean" style="--x:${(st.mean / max * 100).toFixed(2)}" data-l="Promedio ${nf0.format(st.mean)}"></span>`;
    bins.setAttribute('aria-label', `Distribución de ${x.name}: ${st.bins.map((b) => `${b.low} a ${b.high}, ${b.count}`).join('; ')}`);
    if (anim && !reduced) requestAnimationFrame(() => requestAnimationFrame(() => $$('i', bins).forEach((el) => el.style.setProperty('--s', 1))));
    if (you == null) { pout.innerHTML = Number.isNaN(v) || (v != null) ? 'Escribe un número de 0 a 600.' : ''; return; }
    const p = percentile(x.d, you);
    pout.innerHTML = p
      ? `Superaste al <b>${nf1.format(p.below)} %</b> · puesto ${nf0.format(p.pos)} de ${nf0.format(p.n)} · <b>${v20(you * 3)}</b>/20`
      : '';
  }
  pin.addEventListener('input', () => setScore(slot(), pin.value, pin));
  syncExam = (i, from) => { if (from !== pin && (i < 0 || i === slot())) renderExam(false); else if (from === pin) renderExam(false); };

  /* ---------- Fuentes ---------- */
  const srcName = (k) => (k === LAST ? `Resultados finales ${k}` : `Estadísticas ${k}`);
  $('.src-links').innerHTML = Object.entries(AD.SOURCE_URLS || {}).map(([k, u]) => [srcName(k), u])
    .concat(Object.entries(AD.EXTRA_SOURCES || {}))
    .filter(([, u]) => /^https:\/\//.test(u))
    .map(([k, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(k)}</a>`).join('');

  /* ---------- Arranque ---------- */
  renderMM(false);
  select(state.career, { push: !!fromUrl });
  if (EXAMS.length) renderExam(false); else $('#resultados').hidden = true;

  /* Aparición al hacer scroll */
  const rv = $$('.a-sec, .hist-card, .you-card');
  if ('IntersectionObserver' in window && !reduced) {
    rv.forEach((el) => el.classList.add('rv'));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    rv.forEach((el) => io.observe(el));
  }

  /* Volver arriba */
  const totop = $('.totop');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    totop.classList.toggle('is-on', y > 700); totop.tabIndex = y > 700 ? 0 : -1;
    totop.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(3) : 0);
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  totop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
})();
