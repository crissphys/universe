/* UNIverse · Planificador v4 */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const ds = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const pd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addD = (s, n) => { const d = pd(s); d.setDate(d.getDate() + n); return ds(d); };
  const dow = s => pd(s).getDay();
  const diffD = (a, b) => Math.round((pd(b) - pd(a)) / 864e5);
  const tm = t => +t.slice(0, 2) * 60 + +t.slice(3, 5);
  const ts = m => pad(Math.floor(m / 60) % 24) + ':' + pad(m % 60);
  const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
  const today = () => ds(new Date());
  const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const DAYS_L = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const MON = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
  const fmt = s => { const d = pd(s); return DAYS[d.getDay()].toLowerCase() + ' ' + d.getDate() + ' ' + MON[d.getMonth()]; };
  const fmtShort = s => { const d = pd(s); return d.getDate() + ' ' + MON[d.getMonth()]; };
  const BLOCK = 50, STEP = 60;
  const KIND = { teo: 'Teoría', pra: 'Práctica', rep: 'Repaso', aca: 'Academia' };
  const KEY = 'universe-plan-v4';

  /* ---------- Fechas de admisión UNI 2027-1 (estimadas: misma semana que 2026-1, 16/18/20 feb) ---------- */
  const ADM = '2027-02-15';
  const admEvents = d => [[d, 'Aptitud y Humanidades'], [addD(d, 2), 'Matemática'], [addD(d, 4), 'Física y Química']];

  /* ---------- Academias: ciclos vigentes (nov. 2026) ---------- */
  const LS = [1, 2, 3, 4, 5, 6];
  const ACAD = [
    { n: 'César Vallejo', c: [
      { w: 22, n: 'Intensivo UNI', a: '2026-08-24', b: '2027-02-12', k: 'int', t: [['Mañana', '08:00', '14:00'], ['Noche', '17:00', '22:00']] },
      { w: 19, n: 'Semianual Especial UNI', a: '2026-08-10', b: '2026-12-23', k: 'semi', t: [['Mañana', '08:00', '13:00'], ['Tarde', '15:00', '20:00']] },
      { w: 40, n: 'Anual UNI', a: '2026-03-06', b: '2026-12-23', k: 'anual', t: [['Mañana', '08:00', '13:00'], ['Tarde', '15:00', '20:00'], ['Noche', '17:00', '22:00']] }
    ] },
    { n: 'Trilce', c: [
      { w: 9, n: 'Repaso UNI', a: '2026-12-14', b: '2027-02-13', k: 'rep' },
      { w: 8, n: 'Verano UNI', a: '2027-01-04', b: '2027-02-27', k: 'ver' },
      { w: 17, n: 'Semestral UNI', a: '2026-08-24', b: '2026-12-24', k: 'sem' },
      { w: 41, n: 'Anual UNI', a: '2026-02-23', b: '2026-12-05', k: 'anual' },
      { w: 14, n: 'Escolar IEN', a: '2026-08-31', b: '2026-12-04', k: 'sem' }
    ] },
    { n: 'Pitágoras', c: [
      { w: 6, n: 'Repaso UNI', a: '2027-01-04', b: '2027-02-13', k: 'rep', t: [['Mañana', '08:00', '13:30']] },
      { w: 8, n: 'Verano UNI', a: '2027-01-04', b: '2027-02-27', k: 'ver', t: [['Mañana', '08:00', '13:30']] }
    ] },
    { n: 'Logical', c: [
      { w: 40, n: 'Anual UNI', a: '2026-03-09', b: '2026-12-12', k: 'anual' }
    ] },
    { n: 'Savia', sm: true, c: [
      { w: 18, n: 'Regular Especializado ABC', a: '2026-10-29', b: '2027-03-12', k: 'sem', t: [['Regular', '08:00', '16:30']] },
      { w: 18, n: 'Regular Especializado DE', a: '2026-10-29', b: '2027-03-12', k: 'sem', t: [['Regular', '08:00', '16:30']] },
      { w: 16, n: 'Paralelo Pre San Marcos', a: '2026-11-02', b: '2027-02-21', k: 'sem' }
    ] }
  ];
  const OTHER = ['Academia Ingeniería', 'ACUNI', 'ADUNI', 'Athenas', 'Aula 20', 'Bryce', 'Euclides', 'Exclusiva UNI', 'Formación UNI', 'Grupo Ciencias', 'Integral Class', 'Pamer', 'Prisma', 'Saco Oliveros', 'Vonex', 'YOMI', 'Otra academia'];
  const GENERIC = [['Anual', 'anual'], ['Semestral', 'sem'], ['Semianual', 'semi'], ['Intensivo', 'int'], ['Repaso', 'rep'], ['Verano', 'ver']].map(([n, k]) => ({ n, k }));
  const GENERIC_T = [['Mañana', '08:00', '14:00'], ['Tarde', '14:00', '20:00'], ['Noche', '17:00', '22:00']];
  // Teoría vs práctica y orden según el tipo de ciclo.
  const PACE = { anual: [0.5, 'temario', 0.1], sem: [0.4, 'temario', 0.12], semi: [0.5, 'temario', 0.12], int: [0.3, 'freq', 0.15], rep: [0, 'freq', 0.2], ver: [0.2, 'freq', 0.2] };
  const LOGO = { 'César Vallejo': 'vallejo.webp', 'Trilce': 'trilce.svg', 'Pitágoras': 'pitagoras.svg', 'ADUNI': 'aduni.webp', 'Pamer': 'pamer.svg', 'Saco Oliveros': 'saco.webp', 'Academia Ingeniería': 'ingenieria.webp', 'Logical': 'logical.webp', 'Athenas': 'athenas.webp', 'Savia': 'savia.svg', 'Vonex': 'vonex.svg', 'Integral Class': 'integral.svg', 'Prisma': 'prisma.webp', 'Aula 20': 'aula20.svg', 'YOMI': 'yomi.png' };
  const ACAD_ORDER = Object.keys(LOGO).concat(OTHER.filter(n => !LOGO[n]));
  const FIRST = 9;
  const acadOf = name => ACAD.find(a => a.n === name);
  const cyclesOf = name => acadOf(name)?.c || GENERIC;

  // Título letra por letra.
  const h1w = $('.p-hero h1 .w');
  if (h1w) h1w.setAttribute('aria-hidden', 'true'), h1w.insertAdjacentHTML('beforebegin', '<span class="sr-only">' + h1w.textContent + '</span>'), h1w.innerHTML = [...h1w.textContent].map((c, i) => `<span class="ch" style="--i:${i}">${c}</span>`).join('');

  /* ---------- Estado ---------- */
  let T = null; // temario.json
  try { localStorage.removeItem('universe-preview-plan'); localStorage.removeItem('universe-preview-plan-notify'); } catch {} // planificador anterior
  let state = load();
  let cfg = state.cfg || defaults();
  // Enlaces directos: /planificador?modo=cepre|admision|academia&ciclo=pre|basico|ien
  if (!state.blocks) {
    const q = new URLSearchParams(location.search);
    if (['cepre', 'admision', 'academia'].includes(q.get('modo'))) cfg.track = q.get('modo');
    if (['pre', 'basico', 'ien'].includes(q.get('ciclo'))) { cfg.track = 'cepre'; cfg.cycle = q.get('ciclo'); }
  }
  let editing = false, weekOff = 0, selDay = today(), sheetId = null, undo = null, toastTimer = 0;

  function defaults() {
    return { track: 'cepre', cycle: 'pre', goal: 'exams', goalDate: '', admDate: ADM, startMode: 'today', start: today(),
      acad: 'César Vallejo', acadCycle: 0, rows: [{ d: LS.slice(), s: '08:00', e: '14:00', c: '' }], acadGoal: ADM,
      days: LS.slice(), from: '15:00', hours: 3, prio: [] };
  }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }

  /* ---------- Temario ---------- */
  function courses(c = cfg) {
    if (c.track === 'cepre') return T.cepre[c.cycle].courses.map(x => ({ id: x.id, name: x.name, s: x.s }));
    return T.admision.flatMap(sec => sec.courses.map(x => ({ id: x.id, name: x.name, s: sec.id })));
  }
  const courseById = (id, c = cfg) => courses(c).find(x => x.id === id);
  function cepreTopics(cycle, id, weeks) {
    const course = T.cepre[cycle].courses.find(x => x.id === id);
    return weeks.flatMap(w => (course.w[w - 1] || []).map(t => ({ t })));
  }
  function admTopics(id, order) {
    const course = T.admision.flatMap(s => s.courses).find(x => x.id === id);
    const list = course.topics.map((t, i) => ({ t: t.t, c: t.c, f: t.f || 0, i }));
    return order === 'freq' ? list.sort((a, b) => b.f - a.f || a.i - b.i) : list;
  }
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

  /* ---------- Horas de estudio ---------- */
  function busyFor(c, date) {
    if (c.track !== 'academia') return [];
    const cy = cyclesOf(c.acad)[c.acadCycle] || {};
    if (cy.a && (date < cy.a || date > cy.b)) return [];
    const wd = dow(date);
    return c.rows.filter(r => r.d.includes(wd)).map(r => [tm(r.s), tm(r.e)]);
  }
  function slotsFor(c, date, count, taken = []) {
    const busy = busyFor(c, date).concat(taken);
    const out = [];
    let m = tm(c.from);
    let guard = 0;
    while (out.length < count && m + BLOCK <= 23 * 60 + 59 && guard++ < 60) {
      const hit = busy.find(([a, b]) => m < b && m + BLOCK > a);
      if (hit) { m = hit[1] + 10; continue; }
      out.push([ts(m), ts(m + BLOCK)]);
      m += STEP;
    }
    return out;
  }
  function slotRange(c, from, to, skip) {
    const out = [];
    for (let d = from; d <= to; d = addD(d, 1)) {
      if (!c.days.includes(dow(d)) || skip.has(d)) continue;
      const past = d === today() ? nowMin() : -1;
      slotsFor(c, d, c.hours).forEach(([s, e]) => { if (tm(s) > past) out.push({ d, s, e }); });
    }
    return out;
  }

  /* ---------- Reparto ---------- */
  // streams: [{id, w, items:[{t,c?}]}]. Devuelve bloques ordenados sobre `slots`.
  function allocate(slots, streams, theory, kindAll) {
    const live = streams.filter(s => s.items.length);
    const N = slots.length;
    if (!N || !live.length) return [];
    const weight = live.map(s => s.items.length * s.w);
    const sum = weight.reduce((a, b) => a + b, 0);
    const raw = weight.map(w => N * w / sum);
    const n = raw.map(Math.floor);
    let left = N - n.reduce((a, b) => a + b, 0);
    raw.map((r, i) => [r - n[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0) { n[i]++; left--; } });
    const all = [];
    live.forEach((s, ci) => {
      const k = n[ci], items = s.items, L = items.length;
      if (!k) return;
      const out = [];
      if (k >= L) {
        items.forEach((it, i) => {
          const m = Math.floor(k / L) + (i < k % L ? 1 : 0);
          const teo = theory > 0 ? Math.max(1, Math.round(m * theory)) : 0;
          for (let j = 0; j < m; j++) out.push({ c: s.id, t: it.t, k: kindAll || (j < teo ? 'teo' : 'pra') });
        });
      } else {
        for (let j = 0; j < k; j++) {
          const part = items.slice(Math.floor(j * L / k), Math.floor((j + 1) * L / k));
          out.push({ c: s.id, t: part.length > 3 ? part.slice(0, 3).map(p => p.t).join(' · ') + ` y ${part.length - 3} más` : part.map(p => p.t).join(' · '), k: kindAll || (theory >= 0.5 ? 'teo' : 'pra') });
        }
      }
      out.forEach((b, j) => all.push({ ...b, pos: j / out.length, ci }));
    });
    all.sort((a, b) => a.pos - b.pos || a.ci - b.ci);
    // Evita el mismo curso dos veces seguidas en un día.
    for (let i = 1; i < all.length; i++) {
      if (all[i].c === all[i - 1].c && slots[i].d === slots[i - 1].d) {
        const j = all.findIndex((b, x) => x > i && b.c !== all[i].c);
        if (j > 0) [all[i], all[j]] = [all[j], all[i]];
      }
    }
    return all.map((b, i) => ({ id: uid(), d: slots[i].d, s: slots[i].s, e: slots[i].e, c: b.c, t: b.t, k: b.k }));
  }
  let seq = 0;
  const uid = () => 'b' + Date.now().toString(36) + (seq++).toString(36);

  /* ---------- Generación ---------- */
  function goalOf(c) {
    if (c.track === 'cepre') {
      const ev = T.cepre[c.cycle].evals;
      return c.goal === 'date' && c.goalDate ? c.goalDate : ev[ev.length - 1].d;
    }
    if (c.track === 'admision') return c.admDate || ADM;
    return c.acadGoal || ADM;
  }
  function eventsOf(c) {
    if (c.track === 'cepre') return T.cepre[c.cycle].evals.map(e => ({ d: e.d, n: e.n, r: e.r }));
    const d = c.track === 'admision' ? (c.admDate || ADM) : null;
    if (d) return admEvents(d).map(([x, n]) => ({ d: x, n }));
    const g = c.acadGoal || ADM;
    return acadOf(c.acad)?.sm ? [{ d: g, n: 'Examen de admisión' }] : admEvents(g).map(([x, n]) => ({ d: x, n }));
  }
  function generate(c, doneKeys = new Set(), from) {
    const start = from || c.start || today();
    const cs = courses(c);
    const w = id => c.prio.includes(id) ? 2 : 1;
    const strip = items => (id) => items.filter(it => !doneKeys.has(id + '|' + it.t));
    const events = eventsOf(c);
    const skip = new Set(events.map(e => e.d));
    const out = [];
    if (c.track === 'cepre' && c.goal !== 'date') {
      const covered = new Set();
      let prev = null;
      for (const ev of T.cepre[c.cycle].evals) {
        const r = range(ev.r[0], ev.r[1]);
        const fresh = r.filter(x => !covered.has(x));
        r.forEach(x => covered.add(x));
        const segA = prev ? addD(prev, 1) : addD(start, 0);
        const from = segA > start ? segA : start;
        prev = ev.d;
        const to = addD(ev.d, -1);
        if (to < start || from > to) continue;
        const slots = slotRange(c, from, to, skip);
        const days = [...new Set(slots.map(s => s.d))];
        const cut = days.length >= 4 ? days[days.length - 2] : null;
        const study = slots.filter(s => !cut || s.d < cut), review = slots.filter(s => cut && s.d >= cut);
        out.push(...allocate(study, cs.map(x => ({ id: x.id, w: w(x.id), items: strip(cepreTopics(c.cycle, x.id, fresh.length ? fresh : r))(x.id) })), 1));
        out.push(...allocate(review, cs.map(x => ({ id: x.id, w: w(x.id), items: cepreTopics(c.cycle, x.id, r) })), 1, 'rep'));
      }
      return out;
    }
    const end = addD(goalOf(c), -1);
    if (end < start) return out;
    const slots = slotRange(c, start, end, skip);
    let theory = 0.5, order = 'temario', tail = 0.12;
    if (c.track === 'cepre') { theory = 1; tail = 0.15; }
    if (c.track === 'admision') { tail = Math.min(0.25, 14 / Math.max(14, diffD(start, end))); }
    if (c.track === 'academia') [theory, order, tail] = PACE[(cyclesOf(c.acad)[c.acadCycle] || {}).k || 'sem'];
    const cutAt = Math.round(slots.length * (1 - tail));
    const items = id => c.track === 'cepre' ? cepreTopics(c.cycle, id, range(1, 20)) : admTopics(id, order);
    out.push(...allocate(slots.slice(0, cutAt), cs.map(x => ({ id: x.id, w: w(x.id), items: strip(items(x.id))(x.id) })), theory));
    out.push(...allocate(slots.slice(cutAt), cs.map(x => ({ id: x.id, w: w(x.id), items: admOrCepreReview(c, x.id) })), 0, 'rep'));
    return out;
  }
  function admOrCepreReview(c, id) {
    if (c.track === 'cepre') return cepreTopics(c.cycle, id, range(1, 20));
    return admTopics(id, 'freq').filter(t => t.f > 0).concat(admTopics(id, 'freq').filter(t => !t.f)).slice(0, 12);
  }
  function classBlocks(c, from, to) {
    if (c.track !== 'academia') return [];
    const out = [];
    for (let d = from; d <= to; d = addD(d, 1)) {
      busyFor(c, d).length && c.rows.filter(r => r.d.includes(dow(d))).forEach(r => out.push({ d, s: r.s, e: r.e, c: '', t: r.c || 'Clases', k: 'aca' }));
    }
    return out;
  }

  /* ---------- Vista: configuración ---------- */
  const form = $('#form');
  function seg(el, v) { $$('button', el).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === String(v)))); }
  function renderSetup() {
    seg($('#track'), cfg.track);
    $$('[data-for]').forEach(g => { g.hidden = g.dataset.for !== cfg.track; });
    seg($('#cycle'), cfg.cycle);
    seg($('#goal'), cfg.goal);
    const ev = T.cepre[cfg.cycle].evals;
    $('#goal-date').hidden = cfg.goal !== 'date';
    $('#goal-date').value = cfg.goalDate || ev[ev.length - 1].d;
    // Cada ciclo muestra su próximo examen dentro de la opción.
    $$('#cycle .opt').forEach(o => { const e2 = T.cepre[o.dataset.v].evals.find(e => e.d >= today()); $('small', o).textContent = e2 ? shortEval(e2.n) + ' · ' + fmtShort(e2.d) : 'Terminado'; });
    const nx = ev.find(e => e.d >= today());
    $('#goal-s1').textContent = nx ? 'Siguiente: ' + fmtShort(nx.d) : 'Sin exámenes';
    $('#goal-s2').textContent = cfg.goal === 'date' ? fmtShort(cfg.goalDate || ev[ev.length - 1].d) : 'Tú eliges el día';
    $('#track-adm').textContent = fmtShort(cfg.admDate || ADM) + ' 2027';
    $('#start-s1').textContent = fmtShort(today());
    $('#start-s2').textContent = cfg.startMode === 'past' ? fmtShort(cfg.start) : 'Elige el día';
    $('#adm-date').value = cfg.admDate || ADM;
    $('#adm-label').textContent = fmtLong(cfg.admDate || ADM);
    seg($('#start-mode'), cfg.startMode);
    $('#start-date').hidden = cfg.startMode !== 'past';
    $('#start-date').value = cfg.start;
    // Academia
    const grid = $('#acad');
    if (!grid.childElementCount) grid.innerHTML = ACAD_ORDER.map((n, i) => '<button type="button" class="logo' + (LOGO[n] ? '' : ' logo-wm') + '" data-a="' + esc(n) + '" aria-label="' + esc(n) + '"' + (i >= FIRST ? ' data-extra' : '') + (i === FIRST ? ' data-row2' : '') + '>' + (LOGO[n] ? '<img src="/planificador/logos/' + LOGO[n] + '" alt="" loading="lazy" decoding="async" draggable="false">' : '<span>' + esc(n) + '</span>') + '</button>').join('');
    // Si un logo no existe, queda el nombre.
    $$('img', grid).forEach(img => {
      const fall = () => { const b = img.parentElement; if (!b) return; b.classList.add('logo-wm'); b.innerHTML = '<span>' + esc(b.dataset.a) + '</span>'; };
      if (img.complete && !img.naturalWidth && img.getAttribute('loading') !== 'lazy') fall(); else img.onerror = fall;
    });
    const open = acadOpen || ACAD_ORDER.indexOf(cfg.acad) >= FIRST;
    grid.classList.toggle('is-open', open);
    $('#acad-more').setAttribute('aria-expanded', String(open));
    $('#acad-more span').textContent = open ? 'Menos academias' : 'Más academias';
    $$('.logo', grid).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.a === cfg.acad)));
    const cys = cyclesOf(cfg.acad);
    if (cfg.acadCycle >= cys.length) cfg.acadCycle = 0;
    $('#acad-cycle').innerHTML = cys.map((c, i) => '<button type="button" class="opt opt-row" data-i="' + i + '" aria-pressed="' + (i === cfg.acadCycle) + '"><b>' + esc(c.n) + '</b><small>' + (c.a ? fmtShort(c.a) + ' – ' + fmtShort(c.b) + ' · ' + (c.w || Math.round(diffD(c.a, c.b) / 7)) + ' sem' : (PACE_LABEL[c.k] || '')) + '</small></button>').join('');
    const cy = cys[cfg.acadCycle] || cys[0];
    const shifts = cy.t || GENERIC_T;
    $('#acad-shifts').innerHTML = shifts.map(([n, s, e]) => `<button type="button" data-s="${s}" data-e="${e}" aria-pressed="${cfg.rows.length === 1 && cfg.rows[0].s === s && cfg.rows[0].e === e}">${esc(n)} <span>${s}–${e}</span></button>`).join('');
    renderRows();
    $('#acad-goal').value = cfg.acadGoal || ADM;
    // Común
    $$('#days button').forEach(b => b.setAttribute('aria-pressed', String(cfg.days.includes(+b.dataset.v))));
    $('#from').value = cfg.from;
    $$('#from-q button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.t === cfg.from)));
    const dk = cfg.days.slice().sort().join(',');
    $$('#days-q button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.q.split(',').sort().join(',') === dk)));
    $('#hours-v').textContent = cfg.hours + ' h';
    const cs = courses();
    $('#prio').innerHTML = T.sections.map(sec => { const list = cs.filter(x => x.s === sec.id); return list.length ? '<div class="prio-g" data-s="' + sec.id + '"><span>' + esc(SEC_LABEL[sec.id] || sec.name) + '</span><div class="chips">' + list.map(x => '<button type="button" data-id="' + x.id + '" data-s="' + x.s + '" aria-pressed="' + cfg.prio.includes(x.id) + '">' + esc(SHORT[x.id] || x.name) + '</button>').join('') + '</div></div>' : ''; }).join('');
    summary();
  }
  const SEC_LABEL = { mat: 'Matemáticas', cie: 'Ciencias', apt: 'Letras y aptitud' };
  const PACE_LABEL = { anual: 'Desde la base', sem: 'Teoría y práctica', semi: 'Teoría y práctica', int: 'Más práctica', rep: 'Solo práctica', ver: 'Práctica y repaso' };
  const ORD = { Primera: '1.ª', Primer: '1.er', Segunda: '2.ª', Segundo: '2.º', Tercera: '3.ª', Cuarta: '4.ª', Quinta: '5.ª', Sexta: '6.ª', 'Séptima': '7.ª', Octava: '8.ª', Novena: '9.ª' };
  const shortEval = n => n.replace(/^(\S+) /, (m, w) => ORD[w] ? ORD[w] + ' ' : m).replace('práctica calificada', 'PC').replace('evaluación calificada', 'evaluación').replace('examen parcial', 'parcial').replace('Examen final', 'Final');
  let acadOpen = false;
  const fmtLong = s => { const d = pd(s); return DAYS_L[d.getDay()].replace(/^./, m => m.toUpperCase()) + ' ' + d.getDate() + ' de ' + ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'][d.getMonth()]; };
  function renderRows() {
    $('#rows').innerHTML = cfg.rows.map((r, i) => `<li class="row" data-i="${i}">
      <div class="mini-days">${[1, 2, 3, 4, 5, 6, 0].map(d => `<button type="button" data-d="${d}" aria-pressed="${r.d.includes(d)}" aria-label="${DAYS_L[d]}">${'DLMXJVS'[d]}</button>`).join('')}</div>
      <span class="row-time"><input type="time" data-f="s" value="${r.s}" aria-label="Entrada"><i>–</i><input type="time" data-f="e" value="${r.e}" aria-label="Salida"></span>
      ${r.c ? `<span class="row-c">${esc(r.c)}</span>` : ''}
      <button type="button" class="x" data-del aria-label="Quitar"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 6 8 8M14 6l-8 8"/></svg></button></li>`).join('');
  }
  function startOf(c) { return c.track === 'admision' && c.startMode === 'past' ? c.start : today(); }
  function summary() {
    if (!T) return;
    const c = { ...cfg, start: startOf(cfg) };
    const b = generate(c);
    const h = Math.round(b.length * BLOCK / 60);
    const end = b.length ? b[b.length - 1].d : goalOf(c);
    $('#sum').innerHTML = b.length ? `<b>${b.length}</b> bloques<i></i><b>${h}</b> h<i></i>hasta ${fmt(end)}` : 'Sin horas disponibles';
    $('#create').disabled = !b.length;
  }

  form.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    const g = b.parentElement;
    if (b.classList.contains('logo')) pickAcad(b.dataset.a);
    else if (g.id === 'acad-cycle') cfg.acadCycle = +b.dataset.i;
    else if (b.id === 'acad-more') acadOpen = b.getAttribute('aria-expanded') !== 'true';
    else if (g.id === 'days-q') cfg.days = b.dataset.q.split(',').map(Number);
    else if (g.id === 'from-q') cfg.from = b.dataset.t;
    else if (b.closest('#prio')) { const id = b.dataset.id; cfg.prio = cfg.prio.includes(id) ? cfg.prio.filter(x => x !== id) : cfg.prio.concat(id); }
    else if (g.id === 'track') { cfg.track = b.dataset.v; cfg.prio = []; }
    else if (g.id === 'cycle') { cfg.cycle = b.dataset.v; cfg.prio = []; }
    else if (g.id === 'goal') cfg.goal = b.dataset.v;
    else if (g.id === 'start-mode') cfg.startMode = b.dataset.v;
    else if (g.id === 'days') { const d = +b.dataset.v; cfg.days = cfg.days.includes(d) ? cfg.days.filter(x => x !== d) : cfg.days.concat(d); }
    else if (b.id === 'hours-m') cfg.hours = Math.max(1, cfg.hours - 1);
    else if (b.id === 'hours-p') cfg.hours = Math.min(10, cfg.hours + 1);
    else if (g.id === 'acad-shifts') { cfg.rows = [{ d: LS.slice(), s: b.dataset.s, e: b.dataset.e, c: '' }]; cfg.from = ts(Math.min(tm(b.dataset.e) + 60, 20 * 60)); if (tm(b.dataset.s) >= 15 * 60) cfg.from = '07:00'; }
    else if (b.id === 'row-add') cfg.rows.push({ d: LS.slice(), s: '08:00', e: '14:00', c: '' });
    else if (b.id === 'photo-btn') { $('#photo').click(); return; }
    else if (b.hasAttribute('data-d')) { const r = cfg.rows[+b.closest('.row').dataset.i], d = +b.dataset.d; r.d = r.d.includes(d) ? r.d.filter(x => x !== d) : r.d.concat(d); }
    else if (b.hasAttribute('data-del')) cfg.rows.splice(+b.closest('.row').dataset.i, 1);
    else return;
    persistDraft();
    renderSetup();
  });
  form.addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'goal-date') cfg.goalDate = t.value;
    else if (t.id === 'adm-date') cfg.admDate = t.value || ADM;
    else if (t.id === 'start-date') cfg.start = t.value || today();
    else if (t.id === 'acad-goal') cfg.acadGoal = t.value || ADM;
    else if (t.id === 'from') cfg.from = t.value || '15:00';
    else if (t.dataset.f) { const r = cfg.rows[+t.closest('.row').dataset.i]; r[t.dataset.f] = t.value || r[t.dataset.f]; }
    else return;
    persistDraft();
    renderSetup();
  });
  function pickAcad(n) {
    cfg.acad = n; cfg.acadCycle = 0;
    const cy = cyclesOf(n)[0];
    cfg.acadGoal = acadOf(n)?.sm ? cy.b : ADM;
    if (cy.t) cfg.rows = [{ d: LS.slice(), s: cy.t[0][1], e: cy.t[0][2], c: '' }];
  }
  function persistDraft() { if (!state.blocks) { state.cfg = cfg; save(); } }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const c = { ...cfg, start: startOf(cfg) };
    const t0 = today();
    if (state.blocks && editing) {
      // Conserva lo hecho y lo pasado; rehace lo que viene.
      const keep = state.blocks.filter(b => b.d < t0 || b.done || b.u);
      const done = new Set(state.blocks.filter(b => b.done).map(b => b.c + '|' + b.t));
      state.blocks = keep.concat(generate(c, done, t0 > c.start ? t0 : c.start).filter(b => !keep.some(k => k.d === b.d && k.s === b.s)));
    } else state.blocks = generate(c);
    cfg = c;
    state.cfg = cfg;
    save();
    editing = false;
    weekOff = 0; selDay = today();
    show();
  });
  $('#cancel').addEventListener('click', () => { editing = false; cfg = state.cfg; show(); });

  /* ---------- Foto del horario ---------- */
  $('#photo').addEventListener('change', async e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const btn = $('#photo-btn');
    btn.disabled = true; btn.classList.add('is-busy');
    try {
      const image = await shrink(file);
      const r = await fetch('/api/planner/horario', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image }) });
      const data = r.ok ? await r.json() : null;
      const rows = data?.clases || [];
      if (!rows.length) throw new Error('empty');
      // Agrupa clases con el mismo horario en una sola fila.
      const map = new Map();
      rows.forEach(x => { const k = x.inicio + x.fin + x.curso; const d = x.dia % 7; map.has(k) ? map.get(k).d.push(d) : map.set(k, { d: [d], s: x.inicio, e: x.fin, c: x.curso }); });
      cfg.rows = [...map.values()].sort((a, b) => a.s.localeCompare(b.s));
      const last = Math.max(...cfg.rows.map(r => tm(r.e)));
      if (tm(cfg.from) < last) cfg.from = ts(Math.min(last + 60, 21 * 60));
      persistDraft(); renderSetup();
      toast(`${rows.length} clases agregadas`);
    } catch {
      toast('No se pudo leer la foto');
    } finally { btn.disabled = false; btn.classList.remove('is-busy'); }
  });
  function shrink(file) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => {
        let side = 1400, q = 0.72, url = '';
        for (let i = 0; i < 8; i++) {
          const k = Math.min(1, side / Math.max(img.width, img.height));
          const cv = document.createElement('canvas');
          cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
          const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(img, 0, 0, cv.width, cv.height);
          url = cv.toDataURL('image/jpeg', q);
          if (url.length < 360000) break;
          side *= 0.82; q = Math.max(0.5, q - 0.05);
        }
        URL.revokeObjectURL(img.src);
        url.length < 370000 ? res(url) : rej(new Error('big'));
      };
      img.onerror = rej;
      img.src = URL.createObjectURL(file);
    });
  }

  /* ---------- Vista: plan ---------- */
  const isStudy = b => b.k !== 'aca';
  const monday = s => addD(s, -((dow(s) + 6) % 7));
  function dayBlocks(d) {
    const own = state.blocks.filter(b => b.d === d);
    const cls = classBlocks(cfg, d, d);
    return own.concat(cls).sort((a, b) => a.s.localeCompare(b.s));
  }
  function late() {
    const t0 = today(), n = nowMin();
    return state.blocks.filter(b => !b.done && isStudy(b) && (b.d < t0 || (b.d === t0 && tm(b.e) < n - 30))).sort((a, b) => (a.d + a.s).localeCompare(b.d + b.s));
  }
  const SHORT = { razonamientomatematico: 'R. Matemático', razonamientoverbal: 'R. Verbal' };
  const nameOf = b => b.k === 'aca' ? 'Academia' : (SHORT[b.c] || courseById(b.c)?.name || b.c || 'Bloque');
  const secOf = b => b.k === 'aca' ? 'aca' : (courseById(b.c)?.s || 'x');

  function blockHTML(b, opt = {}) {
    const cls = b.k === 'aca';
    return `<li class="b${b.done ? ' is-done' : ''}${cls ? ' is-class' : ''}" data-id="${cls ? '' : b.id}" data-s="${secOf(b)}" style="--i:${opt.i || 0}">
      ${cls ? '<span class="chk chk-off" aria-hidden="true"></span>' : `<button type="button" class="chk" aria-pressed="${!!b.done}" aria-label="Hecho"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12.4 2.7 2.6L16 9.6"/></svg></button>`}
      <button type="button" class="b-main"${cls ? ' tabindex="-1" disabled' : ''}>
        <span class="b-time">${opt.date ? fmt(b.d) + ' · ' : ''}${b.s}<i>–</i>${b.e}</span>
        <span class="b-name"><b>${esc(nameOf(b))}</b>${b.k !== 'teo' ? `<em>${KIND[b.k] || ''}</em>` : ''}</span>
        <span class="b-topic">${esc(b.t)}</span>
      </button>
      ${cls ? '' : '<button type="button" class="b-x" aria-label="Eliminar"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 6 8 8M14 6l-8 8"/></svg></button>'}
    </li>`;
  }

  function renderPlan() {
    const t0 = today(), n = nowMin();
    // Ahora / siguiente
    const todays = dayBlocks(t0).filter(isStudy);
    const cur = todays.find(b => tm(b.s) <= n && n < tm(b.e));
    const nxt = todays.find(b => tm(b.s) > n);
    const card = $('#now');
    let html;
    if (cur) {
      const p = (n - tm(cur.s)) / (tm(cur.e) - tm(cur.s));
      html = `<p class="k">Ahora<span>hasta ${cur.e}</span></p>${nowBody(cur)}<div class="bar"><i style="transform:scaleX(${p.toFixed(3)})"></i></div>`;
    } else if (nxt) {
      const m = tm(nxt.s) - n;
      html = `<p class="k">Siguiente<span>${m < 60 ? `en ${m} min` : `en ${Math.floor(m / 60)} h ${m % 60 ? (m % 60) + ' min' : ''}`}</span></p>${nowBody(nxt)}`;
    } else {
      const fut = state.blocks.filter(b => b.d > t0 && isStudy(b)).sort((a, b) => (a.d + a.s).localeCompare(b.d + b.s))[0];
      const doneAll = todays.length && todays.every(b => b.done);
      const when = fut ? (fut.d === addD(t0, 1) ? 'mañana' : fmt(fut.d)) + ' · ' + fut.s : '';
      html = fut
        ? `<p class="k">${doneAll ? 'Día completo · siguiente' : 'Siguiente'}<span>${when}</span></p>${nowBody(fut)}`
        : `<p class="k">${doneAll ? 'Día completo' : 'Hoy'}</p><p class="now-t">Plan terminado</p>`;
    }
    card.innerHTML = html;
    card.dataset.id = (cur || nxt)?.id || '';

    // Pendientes
    const lt = late();
    $('#late').hidden = !lt.length;
    $('#late-n').textContent = lt.length;
    $('#late-list').innerHTML = lt.slice(0, 30).map((b, i) => blockHTML(b, { date: true, i })).join('');

    // Examen
    const ev = eventsOf(cfg).find(e => e.d >= t0);
    $('#exam').innerHTML = ev ? `<p class="k">Próximo examen</p><p class="now-t">${esc(ev.n)}</p><p class="now-s">${fmt(ev.d)}${ev.r ? ` · semanas ${ev.r[0]}–${ev.r[1]}` : ''}</p><p class="big"><b>${diffD(t0, ev.d)}</b><small>${diffD(t0, ev.d) === 1 ? 'día' : 'días'}</small></p>` : '<p class="k">Exámenes</p><p class="now-t">Sin exámenes pendientes</p>';

    // Avance
    const st = state.blocks.filter(isStudy), dn = st.filter(b => b.done).length;
    const pct = st.length ? Math.round(dn * 100 / st.length) : 0;
    const wk = monday(t0), wb = st.filter(b => b.d >= wk && b.d <= addD(wk, 6));
    $('#progress').innerHTML = `<p class="k">Avance</p><div class="ring${pct ? "" : " is-zero"}" style="--p:${pct / 100}"><svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19"/><circle class="ring-v" cx="22" cy="22" r="19" pathLength="1"/></svg><b>${pct}<small>%</small></b></div><p class="now-s">${dn} de ${st.length} bloques<br>Esta semana ${wb.filter(b => b.done).length}/${wb.length}</p>`;

    renderWeek();
    renderHero();
  }
  function nowBody(b) {
    return `<div class="now-row"><button type="button" class="chk chk-lg" data-id="${b.id}" aria-pressed="${!!b.done}" aria-label="Hecho"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12.4 2.7 2.6L16 9.6"/></svg></button>
      <div><p class="now-t" data-s="${secOf(b)}">${esc(nameOf(b))}${b.k !== 'teo' ? ` <em>${KIND[b.k]}</em>` : ''}</p><p class="now-s">${esc(b.t)}</p><p class="now-time">${b.s}–${b.e}</p><button type="button" class="focus-go" data-focus="${b.id}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4.5v11l9-5.5z"/></svg>Enfocar</button></div></div>`;
  }
  function focusOn(id) {
    const b = id ? find(id) : null;
    document.dispatchEvent(new CustomEvent('focus:open', { detail: b ? { id: b.id, title: nameOf(b), sub: b.t } : { id: '', title: '', sub: '' } }));
  }
  // Al terminar una ronda de estudio ligada a un bloque, ofrece marcarlo.
  document.addEventListener('focus:studied', e => {
    const b = e.detail.id && state.blocks ? find(e.detail.id) : null;
    if (!b || b.done) return;
    undo = () => toggle(b.id);
    toast(nameOf(b) + ': ¿hecho?', 'Marcar');
  });
  function renderWeek() {
    const t0 = today();
    const start = addD(monday(t0), weekOff * 7);
    const days = range(0, 6).map(i => addD(start, i));
    if (!days.includes(selDay)) selDay = weekOff === 0 ? t0 : start;
    $('#w-label').textContent = `${fmtShort(days[0])} – ${fmtShort(days[6])}`;
    $('#w-today').hidden = weekOff === 0;
    const evs = eventsOf(cfg);
    $('#strip').innerHTML = days.map(d => {
      const st = dayBlocks(d).filter(isStudy), dn = st.filter(b => b.done).length;
      return `<button type="button" data-d="${d}" aria-pressed="${d === selDay}"${d === t0 ? ' data-today' : ''}><span>${DAYS[dow(d)]}</span><b>${pd(d).getDate()}</b><i class="dots">${st.length ? `<i style="--p:${dn / st.length}"></i>` : ''}${evs.some(e => e.d === d) ? '<i class="ev-dot"></i>' : ''}</i></button>`;
    }).join('');
    $('#board').innerHTML = days.map(d => {
      const list = dayBlocks(d);
      const ev = evs.filter(e => e.d === d);
      const st = list.filter(isStudy);
      return `<section class="dcol${d === t0 ? ' is-today' : ''}${d === selDay ? ' is-sel' : ''}${d < t0 ? ' is-past' : ''}" data-d="${d}">
        <header><h3>${DAYS[dow(d)]} <b>${pd(d).getDate()}</b></h3><span>${st.length ? st.filter(b => b.done).length + '/' + st.length : ''}</span></header>
        ${ev.map(e => `<p class="ev">${esc(e.n)}</p>`).join('')}
        <ol class="blocks">${list.map((b, i) => blockHTML(b, { i })).join('')}</ol>
        <button type="button" class="add-in" data-add="${d}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4.5v11M4.5 10h11"/></svg>${list.length ? '' : 'Añadir'}</button>
      </section>`;
    }).join('');
  }
  function renderHero() {
    const lbl = cfg.track === 'cepre' ? `CEPREUNI · ${T.cepre[cfg.cycle].name}` : cfg.track === 'admision' ? 'Admisión UNI 2027-1' : `${cfg.acad} · ${(cyclesOf(cfg.acad)[cfg.acadCycle] || {}).n || ''}`;
    $('#hero-stats').innerHTML = state.blocks ? `<span>${esc(lbl)}</span><i></i>${cfg.hours} h al día<i></i>${fmtLong(today())}` : 'CEPREUNI · Admisión · Academia';
  }

  function show() {
    const has = !!state.blocks;
    $('#setup').hidden = has && !editing;
    $('#plan').hidden = !has || editing;
    $('#cancel').hidden = !editing;
    $('#create').textContent = editing ? 'Actualizar plan' : 'Crear plan';
    if (!has || editing) renderSetup(); else renderPlan();
    renderHero();
  }

  /* ---------- Interacción en el plan ---------- */
  const find = id => state.blocks.find(b => b.id === id);
  function toggle(id) {
    const b = find(id);
    if (!b) return;
    b.done = !b.done;
    save();
    $$(`.b[data-id="${id}"]`).forEach(li => li.classList.toggle('is-done', b.done));
    $$(`[data-id="${id}"] .chk, .chk[data-id="${id}"]`).forEach(c => c.setAttribute('aria-pressed', String(b.done)));
    if (b.done && navigator.vibrate) navigator.vibrate(8);
    clearTimeout(toggle.t);
    toggle.t = setTimeout(renderPlan, 420);
  }
  function remove(id) {
    const i = state.blocks.findIndex(b => b.id === id);
    if (i < 0) return;
    const [b] = state.blocks.splice(i, 1);
    save();
    undo = () => { state.blocks.splice(i, 0, b); save(); renderPlan(); };
    renderPlan();
    toast('Bloque eliminado', 'Deshacer');
  }
  $('#plan').addEventListener('click', e => {
    const t = e.target;
    const chk = t.closest('.chk[aria-pressed]');
    if (chk) { toggle(chk.dataset.id || chk.closest('.b').dataset.id); return; }
    const x = t.closest('.b-x');
    if (x) { remove(x.closest('.b').dataset.id); return; }
    const main = t.closest('.b-main');
    if (main) { if (dragged) return; openSheet(main.closest('.b').dataset.id); return; }
    const day = t.closest('#strip [data-d]');
    if (day) { selDay = day.dataset.d; renderWeek(); anim(); return; }
    const add = t.closest('[data-add]');
    if (add) { openSheet(null, add.dataset.add); return; }
    if (t.closest('#w-prev')) { weekOff--; renderWeek(); anim(); return; }
    if (t.closest('#w-next')) { weekOff++; renderWeek(); anim(); return; }
    if (t.closest('#w-today')) { weekOff = 0; selDay = today(); renderWeek(); anim(); return; }
    if (t.closest('#add')) { openSheet(null, selDay); return; }
    const fg = t.closest('[data-focus]');
    if (fg) { focusOn(fg.dataset.focus); return; }
    if (t.closest('#w-focus')) { focusOn(''); return; }
    if (t.closest('#late-move')) { reschedule(); return; }
    if (t.closest('#menu-btn')) { const m = $('#menu'); m.hidden = !m.hidden; $('#menu-btn').setAttribute('aria-expanded', String(!m.hidden)); return; }
    if (t.closest('#m-edit')) { closeMenu(); editing = true; cfg = { ...state.cfg }; show(); scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (t.closest('#m-ics')) { closeMenu(); ics(); return; }
    if (t.closest('#m-reset')) { closeMenu(); if (confirm('¿Borrar todo el plan?')) { delete state.blocks; save(); show(); } return; }
  });
  function anim() { const b = $('#board'); b.classList.remove('anim'); void b.offsetWidth; b.classList.add('anim'); clearTimeout(anim.t); anim.t = setTimeout(() => b.classList.remove('anim'), 900); }
  const closeMenu = () => { $('#menu').hidden = true; $('#menu-btn').setAttribute('aria-expanded', 'false'); };
  document.addEventListener('click', e => { if (!e.target.closest('#menu, #menu-btn')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  // Reprograma pendientes en los siguientes huecos libres (hasta 1 bloque extra por día).
  function reschedule() {
    const lt = late();
    if (!lt.length) return;
    const t0 = today(), n = nowMin(), end = addD(goalOf(cfg), -1);
    let moved = 0, d = t0;
    const queue = lt.slice();
    while (queue.length && d <= addD(end, 14)) {
      if (cfg.days.includes(dow(d))) {
        const taken = dayBlocks(d).map(b => [tm(b.s), tm(b.e)]);
        if (d === t0) taken.push([0, n + 5]);
        const cap = cfg.hours + 1 - dayBlocks(d).filter(b => isStudy(b) && b.d >= t0).length;
        slotsFor({ ...cfg, from: cfg.from }, d, Math.max(0, cap), taken).forEach(([s, e]) => {
          const b = queue.shift();
          if (!b) return;
          b.d = d; b.s = s; b.e = e; moved++;
        });
      }
      d = addD(d, 1);
    }
    save(); renderPlan();
    toast(`${moved} ${moved === 1 ? 'bloque reprogramado' : 'bloques reprogramados'}`);
  }

  /* ---------- Deslizar para eliminar (táctil) ---------- */
  let drag = null, dragged = false;
  $('#plan').addEventListener('pointerdown', e => {
    if (e.pointerType !== 'touch') return;
    const li = e.target.closest('.b[data-id]:not([data-id=""])');
    if (!li || e.target.closest('.chk')) return;
    drag = { li, x: e.clientX, y: e.clientY, t: performance.now(), dx: 0, on: false };
    dragged = false;
  });
  $('#plan').addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.on) {
      if (Math.abs(dy) > 10) { drag = null; return; }
      if (Math.abs(dx) > 10 && dx < 0) { drag.on = true; drag.li.setPointerCapture(e.pointerId); drag.li.classList.add('is-drag'); }
      else return;
    }
    drag.dx = Math.min(0, dx);
    const over = drag.dx < -120 ? -120 + (drag.dx + 120) * 0.3 : drag.dx;
    drag.li.style.transform = `translateX(${over}px)`;
    drag.li.classList.toggle('will-del', drag.dx < -90);
  });
  const endDrag = () => {
    if (!drag) return;
    const { li, dx, t, on } = drag;
    drag = null;
    if (!on) return;
    dragged = true; setTimeout(() => { dragged = false; }, 50);
    const v = Math.abs(dx) / (performance.now() - t);
    li.classList.remove('is-drag');
    if (dx < -90 || (v > 0.5 && dx < -30)) {
      li.style.transform = 'translateX(-110%)'; li.style.opacity = '0';
      setTimeout(() => remove(li.dataset.id), 160);
    } else { li.style.transform = ''; li.classList.remove('will-del'); }
  };
  $('#plan').addEventListener('pointerup', endDrag);
  $('#plan').addEventListener('pointercancel', endDrag);

  /* ---------- Hoja de bloque ---------- */
  const sheet = $('#sheet');
  function openSheet(id, date) {
    sheetId = id;
    const b = id ? find(id) : null;
    const cs = courses();
    $('#s-title').textContent = b ? 'Bloque' : 'Nuevo bloque';
    $('#s-course').innerHTML = cs.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
    $('#s-course').value = b?.c || cs[0].id;
    $('#s-topic').value = b?.t || '';
    $('#s-date').value = b?.d || date || today();
    const last = dayBlocks($('#s-date').value).filter(isStudy).pop();
    $('#s-start').value = b?.s || (last ? ts(tm(last.s) + STEP) : cfg.from);
    const dur = b ? tm(b.e) - tm(b.s) : BLOCK;
    seg($('#s-dur'), [25, 50, 90].includes(dur) ? dur : 50);
    seg($('#s-kind'), b?.k || 'teo');
    $('#s-del').hidden = !b;
    topicsList();
    sheet.showModal();
  }
  function topicsList() {
    const id = $('#s-course').value;
    let list = [];
    if (cfg.track === 'cepre') list = cepreTopics(cfg.cycle, id, range(1, 20));
    else list = admTopics(id, 'temario');
    $('#s-topics').innerHTML = list.map(t => `<option value="${esc(t.t)}">`).join('');
    const hit = list.find(t => t.t === $('#s-topic').value);
    $('#s-contents').innerHTML = hit?.c ? hit.c.map(x => `<li>${esc(x)}</li>`).join('') : '';
    $('#s-contents').hidden = !hit?.c;
  }
  $('#s-course').addEventListener('change', topicsList);
  $('#s-topic').addEventListener('input', topicsList);
  sheet.addEventListener('click', e => {
    if (e.target === sheet) { sheet.close(); return; }
    const b = e.target.closest('.seg button');
    if (b) seg(b.parentElement, b.dataset.v);
    if (e.target.closest('#s-close')) sheet.close();
    if (e.target.closest('#s-del')) { sheet.close(); remove(sheetId); }
  });
  $('#s-form').addEventListener('submit', e => {
    e.preventDefault();
    const dur = +($('#s-dur [aria-pressed="true"]')?.dataset.v || 50);
    const s = $('#s-start').value || cfg.from;
    const data = { c: $('#s-course').value, t: $('#s-topic').value.trim() || 'Estudio libre', d: $('#s-date').value || today(), s, e: ts(Math.min(tm(s) + dur, 23 * 60 + 59)), k: $('#s-kind [aria-pressed="true"]')?.dataset.v || 'teo' };
    if (sheetId) Object.assign(find(sheetId), data);
    else state.blocks.push({ id: uid(), u: 1, ...data });
    save();
    sheet.close();
    selDay = data.d;
    weekOff = Math.round(diffD(monday(today()), monday(data.d)) / 7);
    renderPlan();
  });

  /* ---------- Calendario (.ics) ---------- */
  function ics() {
    const t0 = today();
    const z = (d, t) => { const x = new Date(Date.UTC(...d.split('-').map((v, i) => i === 1 ? v - 1 : +v), +t.slice(0, 2) + 5, +t.slice(3))); return x.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'; };
    const clean = s => String(s).replace(/[\\;,]/g, m => '\\' + m).replace(/\n/g, ' ');
    const ev = state.blocks.filter(b => b.d >= t0 && isStudy(b)).map(b => ['BEGIN:VEVENT', `UID:${b.id}@universetostudy.com`, `DTSTAMP:${z(t0, '00:00')}`, `DTSTART:${z(b.d, b.s)}`, `DTEND:${z(b.d, b.e)}`, `SUMMARY:${clean(nameOf(b) + ' · ' + KIND[b.k])}`, `DESCRIPTION:${clean(b.t)}`, 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Estudio', 'TRIGGER:-PT5M', 'END:VALARM', 'END:VEVENT'].join('\r\n'));
    const txt = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//UNIverse//Planificador//ES', 'CALSCALE:GREGORIAN', ...ev, 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/calendar' }));
    a.download = 'plan-universe.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  /* ---------- Aviso ---------- */
  function toast(text, action) {
    const el = $('#toast');
    el.innerHTML = `<span>${esc(text)}</span>${action ? `<button type="button">${esc(action)}</button>` : ''}`;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.classList.remove('is-on'); undo = null; }, action ? 5000 : 2400);
    const b = $('button', el);
    if (b) b.onclick = () => { undo?.(); undo = null; el.classList.remove('is-on'); };
  }

  /* ---------- Volver arriba ---------- */
  const totop = $('.totop');
  if (totop) {
    const onScroll = () => {
      const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
      totop.classList.toggle('is-on', y > 700); totop.tabIndex = y > 700 ? 0 : -1;
      totop.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(3) : 0);
    };
    addEventListener('scroll', onScroll, { passive: true });
    totop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // Refresca "ahora" cada 30 s y al volver a la pestaña.
  setInterval(() => { if (T && state.blocks && !editing && !document.hidden && !sheet.open) renderPlan(); }, 30000);
  document.addEventListener('visibilitychange', () => { if (T && !document.hidden && state.blocks && !editing) renderPlan(); });

  fetch('/temariouni/temario.json?v=20261115').then(r => r.json()).then(j => {
    T = j;
    if (!T.cepre[cfg.cycle]) cfg.cycle = 'pre';
    document.documentElement.classList.add('ready');
    show();
  }).catch(() => { document.documentElement.classList.add('ready'); $('#setup').hidden = false; $('#sum').textContent = 'No se pudo cargar el temario'; });

  // Para pruebas.
  window.__plan = { generate: c => generate({ ...defaults(), ...c }), get T() { return T; } };
})();
