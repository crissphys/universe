/* CEPREUNI PRE · calculadora de ponderado. Misma regla que /ranking: la práctica más baja (1.ª–6.ª) no cuenta. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fold = v => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();
  const fmt = (n, d = 2) => n == null || !isFinite(n) ? '—' : n.toFixed(d);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DATA_URL = '/universe-ui/data/cepre-2027-1-ranking.js?v=20261026-pc1-2620333g';
  const KEY = 'universe-calc-pre';

  // Cronograma CEPRE UNI Pre 2027-1: todas las evaluaciones a las 9:00 a. m. de Lima.
  const EX = [
    ['pc1', '1.ª práctica', 1, 1, '2026-09-13'], ['pc2', '2.ª práctica', 1, 1, '2026-09-27'], ['ep1', '1.er parcial', 2, 0, '2026-10-11'],
    ['pc3', '3.ª práctica', 1, 1, '2026-10-25'], ['pc4', '4.ª práctica', 1, 1, '2026-11-15'], ['ep2', '2.º parcial', 4, 0, '2026-11-29'],
    ['pc5', '5.ª práctica', 1, 1, '2026-12-13'], ['pc6', '6.ª práctica', 1, 1, '2027-01-10'], ['pc7', '7.ª práctica', 1, 0, '2027-01-31'],
    ['ef', 'Examen final', 6, 0, '2027-02-07']
  ].map(([k, l, w, d, t]) => ({ k, l, w, d, t, at: Date.parse(t + 'T14:00:00Z'), max: 150, g: 'gen' }));
  // Arquitectura y Urbanismo: PAD = PID + 1.54·(SV + PVD). SV = 5 mejores de 6 vocacionales (90 c/u); PVD = aptitud DIAD (200), víspera del final.
  const VOC = [1, 2, 3, 4, 5, 6].map(n => ({ k: 'v' + n, l: `Vocacional ${n}`, w: 1.54, max: 90, g: 'voc' }));
  const PVD = { k: 'pvd', l: 'Aptitud vocacional', w: 1.54, max: 200, g: 'pvd', t: '2027-02-06', at: Date.parse('2027-02-06T14:00:00Z') };
  const ALL = [...EX, ...VOC, PVD], N = ALL.length;
  const ARCH = new Set(['A1', 'A2']);
  const TARGETS = { lo: 'Mínimo histórico', avg: 'Corte promedio', hi: 'Corte más alto' };
  const day = ms => new Date(ms).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'America/Lima' }).replace(/\./g, '').replace(',', '');

  /* ---------- cálculo (escala 150 por dentro, ponderado en 20) ---------- */
  function run(v, arch) {
    const take = (a, b) => { const o = []; for (let i = a; i < b; i++) if (v[i] != null) o.push({ i, x: v[i] }); return o; };
    const lowest = o => o.reduce((l, y) => y.x < l.x ? y : l);
    let gen = take(0, 10), drop = null, vdrop = null;
    const pcs = gen.filter(o => EX[o.i].d);
    if (pcs.length >= 2) { drop = lowest(pcs); gen = gen.filter(o => o !== drop); }
    let pts = gen.reduce((s, o) => s + o.x * EX[o.i].w, 0), pos = gen.reduce((s, o) => s + 150 * EX[o.i].w, 0);
    if (arch) {
      let vs = take(10, 16);
      if (vs.length >= 2) { vdrop = lowest(vs); vs = vs.filter(o => o !== vdrop); }
      pts += 1.54 * vs.reduce((s, o) => s + o.x, 0); pos += 1.54 * 90 * vs.length;
      if (v[16] != null) { pts += 1.54 * v[16]; pos += 1.54 * 200; }
    }
    return { p: pos ? pts / pos * 20 : null, drop: drop ? drop.i : null, vdrop: vdrop ? vdrop.i : null };
  }
  const fill = (v, idx, f) => v.map((y, i) => idx.includes(i) ? f * ALL[i].max : y);
  // Fracción mínima (0–1 del máximo de cada prueba) que, puesta en `idx`, deja el ponderado en `target`. null = no alcanza.
  function need(v, idx, target, arch) {
    if (!idx.length) return undefined;
    const at = f => run(fill(v, idx, f), arch).p;
    if (at(1) < target - 1e-9) return null;
    if (at(0) >= target) return 0;
    let lo = 0, hi = 1;
    for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (at(m) < target) lo = m; else hi = m; }
    return hi;
  }
  const remaining = (v, arch) => ALL.map((e, i) => v[i] == null && (arch || i < 10) ? i : -1).filter(i => i >= 0);
  // Gancho para tools/test-calculadora-pre.mjs: el cálculo corre sin DOM.
  window.UNIVERSE_CALC_PRE = { run, need, EX, ALL };
  if (!document.getElementById('notes')) return;

  /* ---------- estado ---------- */
  const blank = x => ALL.map(() => x);
  const S = { v: blank(null), tag: blank(''), off: null, who: null, scale: 150, career: 'C1', sede: 'Lima', tgt: 'avg' };
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* sin almacenamiento */ }
  const pad = (a, x) => Array.isArray(a) && a.length <= N ? a.concat(blank(x).slice(a.length)) : blank(x);
  S.v = pad(S.v, null).map((x, i) => typeof x === 'number' && x >= 0 && x <= ALL[i].max ? x : null);
  S.tag = pad(S.tag, '');
  if (S.off && !Array.isArray(S.off)) S.off = null;
  const isArch = () => ARCH.has(S.career);
  if (![20, 150].includes(S.scale)) S.scale = 150;
  if (!TARGETS[S.tgt]) S.tgt = 'avg';
  if (S.sede !== 'Juliaca') S.sede = 'Lima';
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* privado */ } };

  /* ---------- cortes ---------- */
  let C = null;
  function cuts(code, sede = S.sede) {
    const by = (C.cuts[sede] || {});
    let rows = Object.entries(by).filter(([, o]) => o[code]).map(([cy, o]) => ({ cy, min: o[code][0], max: o[code][1] }));
    let from = sede;
    if (!rows.length && sede !== 'Lima') { rows = cuts(code, 'Lima').rows; from = 'Lima'; }
    if (!rows.length) return { rows, from };
    const mins = rows.map(r => r.min);
    return { rows, from, lo: Math.min(...mins), hi: Math.max(...mins), avg: mins.reduce((a, b) => a + b, 0) / mins.length, top: Math.max(...rows.map(r => r.max)) };
  }
  const careerName = code => (C.careers.find(c => c[0] === code) || [, code])[1];

  /* ---------- padrón (se carga al buscar) ---------- */
  let pool = null, poolP = null;
  function loadPool() {
    return poolP ||= new Promise((ok, ko) => {
      if (window.UNIVERSE_CEPRE_2027_1) return ok();
      const s = document.createElement('script'); s.src = DATA_URL; s.onload = ok; s.onerror = ko; document.head.append(s);
    }).then(() => {
      const d = window.UNIVERSE_CEPRE_2027_1 || { pre: [] };
      const pub = EX.map(e => d.pre.some(r => r[e.k] != null || r[e.k + 'Status']));
      const rows = d.pre.map(r => {
        const v = EX.map((e, i) => !pub[i] ? null : (r[e.k + 'Status'] === 'AUSENTE' || r[e.k] == null) ? 0 : +r[e.k]);
        return { r, code: String(r.code).toUpperCase(), name: r.name || '', sede: r.sede || 'Lima', h: fold(r.code + ' ' + (r.name || '')), p: run(v).p };
      });
      pool = { rows, pub, at: d.updatedAt || d.publishedAt };
      return pool;
    });
  }
  function lev1(a, b) { // distancia ≤ 1 (sustitución, inserción o borrado)
    if (a === b) return true;
    if (Math.abs(a.length - b.length) > 1) return false;
    let i = 0, j = 0, e = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++e > 1) return false;
      if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
    }
    return e + (a.length - i) + (b.length - j) <= 1;
  }
  function find(q) {
    const f = fold(q).replace(/\s+/g, ' ');
    if (!f) return { hits: [] };
    const code = f.replace(/[\s-]/g, '');
    if (/^\d{3,}[A-Z]?$/.test(code)) {
      const exact = pool.rows.find(r => r.code === code);
      if (exact) return { hits: [exact], exact };
      const pre = pool.rows.filter(r => r.code.startsWith(code));
      if (pre.length) return { hits: pre.slice(0, 6), more: pre.length - 6 };
      if (code.length >= 7) return { hits: pool.rows.filter(r => lev1(r.code, code)).slice(0, 6), near: true };
      return { hits: [] };
    }
    const ws = f.split(' ').filter(w => w.length > 1);
    if (!ws.length || f.length < 3) return { hits: [] };
    const all = pool.rows.filter(r => ws.every(w => r.h.includes(w)));
    return { hits: all.slice(0, 6), more: all.length - 6 };
  }

  /* ---------- DOM ---------- */
  const q = $('#q'), list = $('#q-list'), who = $('#who'), notes = $('#notes'), voc = $('#voc'), box = $('.c-notes'), out = $('#out');
  const sel = $('#career');

  function buildCareer() {
    const groups = {};
    C.careers.forEach(([c, n, f]) => (groups[f] ||= []).push([c, n]));
    sel.innerHTML = Object.entries(groups).map(([f, cs]) => `<optgroup label="${esc(f)}">${cs.map(([c, n]) => `<option value="${c}">${esc(n)}</option>`).join('')}</optgroup>`).join('');
    if (!C.careers.some(c => c[0] === S.career)) S.career = 'C1';
    sel.value = S.career;
  }

  function buildNotes() {
    const row = (e, i) => `<li class="n-row" style="--i:${i % 10}" data-i="${i}">
      <label for="n${i}"><b>${e.l}</b><small>×${e.w}${e.g === 'gen' ? '' : ' · máx ' + e.max}${e.at ? ' · ' + day(e.at) : ''}</small></label>
      <span class="n-tag" aria-hidden="true"></span>
      <input id="n${i}" inputmode="decimal" autocomplete="off" enterkeyhint="next" placeholder="—" aria-describedby="e${i}">
      <span class="n-err" id="e${i}" role="alert"></span></li>`;
    notes.innerHTML = EX.map(row).join('');
    voc.innerHTML = ALL.slice(10).map((e, j) => row(e, j + 10)).join('');
  }

  const scaled = i => i < 10 && S.scale === 20;
  const show = i => S.v[i] == null ? '' : String(+(S.v[i] / (scaled(i) ? 7.5 : 1)).toFixed(scaled(i) ? 3 : 2));
  function paintInputs() {
    $$('.n-row input', box).forEach(el => { if (document.activeElement !== el) el.value = show(+el.closest('.n-row').dataset.i); });
    $$('#scale button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.s === S.scale)));
  }

  function parse(raw) {
    const t = String(raw).trim().replace(',', '.');
    if (!t) return { v: null };
    const n = Number(t);
    if (!isFinite(n) || n < 0) return { err: 'Nota no válida' };
    return { n };
  }

  function onNote(el) {
    const i = +el.closest('.n-row').dataset.i, row = el.closest('.n-row'), err = $('.n-err', row);
    const r = parse(el.value);
    err.textContent = ''; el.removeAttribute('aria-invalid'); err.innerHTML = '';
    if (r.err) { el.setAttribute('aria-invalid', 'true'); err.textContent = r.err; return; }
    if (r.v === null) { S.v[i] = null; S.tag[i] = ''; return commit(); }
    let n = r.n;
    if (i >= 10) {
      if (n > ALL[i].max) { el.setAttribute('aria-invalid', 'true'); err.textContent = 'Máximo ' + ALL[i].max; return; }
      S.v[i] = n; S.tag[i] = ''; return commit();
    }
    if (S.scale === 20 && n > 20) {
      const others = S.v.some((x, j) => x != null && j !== i && j < 10);
      if (n <= 150 && !others) { S.scale = 150; paintInputs(); }
      else { el.setAttribute('aria-invalid', 'true'); err.innerHTML = n <= 150 ? 'Máximo 20 · <button type="button" data-scale="150">Usar escala 150</button>' : 'Máximo 20'; return; }
    }
    if (S.scale === 150 && n > 150) { el.setAttribute('aria-invalid', 'true'); err.textContent = 'Máximo 150'; return; }
    S.v[i] = S.scale === 20 ? n * 7.5 : n;
    S.tag[i] = '';
    commit();
  }

  function commit() { save(); render(); }

  /* ---------- número que rueda ---------- */
  function tick(el, to) {
    const from = parseFloat(el.dataset.v);
    el.dataset.v = to == null ? '' : to;
    if (to == null) { el.textContent = '—'; return; }
    if (reduce || !isFinite(from) || Math.abs(from - to) < .001) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), D = 280;
    const step = t => {
      const k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(from + (to - from) * e);
      if (k < 1 && el.dataset.v == String(to)) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- render ---------- */
  function render() {
    const arch = isArch(), r = run(S.v, arch), p = r.p, cut = cuts(S.career), rest = remaining(S.v, arch);
    const target = cut[S.tgt];
    const dated = rest.filter(i => ALL[i].at).sort((a, b) => ALL[a].at - ALL[b].at);
    const next = S.v.some((x, i) => x != null && i < 10) ? (dated[0] ?? rest[0]) : undefined;
    const g20 = S.scale === 20;
    // valor a mostrar de una fracción f para la prueba i: generales en la escala elegida, vocacionales en sus puntos
    const val = (f, i) => i < 10 ? `${fmt(f * (g20 ? 20 : 150), g20 ? 2 : 1)}` : fmt(f * ALL[i].max, 1);
    const unitOf = i => i < 10 ? (g20 ? 20 : 150) : ALL[i].max;

    // filas
    $('#voc-box').hidden = !arch;
    $$('.n-row', box).forEach(row => {
      const i = +row.dataset.i, tag = $('.n-tag', row), dropped = r.drop === i || r.vdrop === i;
      tag.textContent = S.tag[i] === 'aus' ? 'Ausente' : S.tag[i] === 'sin' ? 'Sin nota' : dropped ? 'No cuenta' : i === next ? 'Siguiente' : '';
      row.dataset.state = S.tag[i] || (dropped ? 'drop' : i === next ? 'next' : S.v[i] == null ? 'empty' : 'ok');
      row.toggleAttribute('data-edited', !!(S.off && i < 10 && S.off[i] !== S.v[i]));
    });
    $('#restore').hidden = !(S.off && S.off.some((x, i) => i < 10 && x !== S.v[i]));
    $('#clear').hidden = !S.v.some(x => x != null);

    // tarjeta principal
    const entered = S.v.filter((x, i) => x != null && (arch || i < 10)).length;
    out.dataset.empty = String(p == null);
    tick($('#p'), p);
    $('#p150').textContent = p == null ? '' : arch ? 'PAD ' + fmt(p / 20 * 3701, 0) + ' / 3701' : fmt(p * 7.5, 2) + ' / 150';
    $('#done').textContent = `${entered} de ${arch ? N : 10}`;
    $$('#tgt button').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.t === S.tgt)); $('span', b).textContent = fmt(cut[b.dataset.t], 2); });
    $('#from').textContent = cut.from !== S.sede ? `Sin cortes en ${S.sede}: referencia Lima` : '';

    let status = '', tone = '';
    if (p != null && target != null) {
      if (p >= cut.hi) { status = 'Seguro'; tone = 'ok'; }
      else if (p >= cut.avg) { status = 'En el corte'; tone = 'ok'; }
      else if (p >= cut.lo) { status = 'Al límite'; tone = 'warn'; }
      else { status = `A ${fmt(cut.lo - p)} del mínimo`; tone = 'bad'; }
    }
    const st = $('#status'); st.textContent = status; st.dataset.tone = tone; st.hidden = !status;

    gauge(p, cut, rest.length ? proj(arch) : null);

    // siguiente prueba
    const nx = $('#next');
    if (!entered) nx.innerHTML = '';
    else if (next == null) {
      nx.innerHTML = target == null ? '' : `<p class="x-lead">Ponderado final <b>${fmt(p)}</b> · ${p >= target ? 'supera' : 'queda debajo de'} el ${TARGETS[S.tgt].toLowerCase()} (${fmt(target)}).</p>`;
    } else if (target != null) {
      const e = ALL[next], n1 = need(S.v, [next], target, arch), nAll = need(S.v, rest, target, arch);
      const up = p != null && p >= target;
      const vocLeft = rest.find(i => i >= 10 && i < 16), genLeft = rest.find(i => i < 10);
      let big, line;
      if (n1 === null) { big = '—'; line = `Con una sola prueba no llegas a ${fmt(target)}. Máximo posible: <b>${fmt(run(fill(S.v, [next], 1), arch).p)}</b>.`; }
      else if (n1 === 0) { big = '0'; line = `Cualquier nota te mantiene sobre ${fmt(target)}.`; }
      else { big = val(n1, next); line = up ? `para mantenerte sobre <b>${fmt(target)}</b>` : `para subir a <b>${fmt(target)}</b>`; }
      const each = (i, label) => i == null ? '' : `<div><dt>${label}</dt><dd>${nAll === null ? 'No alcanza' : nAll === 0 ? 'Ya alcanzado' : val(nAll, i) + ' / ' + unitOf(i)}</dd></div>`;
      nx.innerHTML = `<div class="x-head"><span>${e.l}</span>${e.at ? `<time>${day(e.at)}${e.g === 'gen' ? ' · 9:00' : ''}</time>` : ''}</div>
        <p class="x-big"><b>${big}</b><small>/ ${unitOf(next)}</small></p>
        <p class="x-line">${line}</p>
        <dl class="x-dl">
          ${rest.length > 1 ? each(genLeft, 'En cada prueba restante') + each(vocLeft, 'En cada vocacional') + (arch && rest.includes(16) && next !== 16 ? each(16, 'En aptitud vocacional') : '') : ''}
          ${p != null ? `<div><dt>A tu ritmo, al final</dt><dd>${fmt(proj(arch))}</dd></div>` : ''}
        </dl>`;
    } else nx.innerHTML = '';

    place(p);
    flags();
    reach();
    history(p, cut);
    const cal = EX.find(e => e.at + 3 * 3600e3 > Date.now());
    $('#hero-next').textContent = cal ? `${cal.l} · ${day(cal.at)}` : 'Ciclo completo';
  }

  function proj(arch) { // tu rendimiento medio (fracción del máximo) en lo que falta
    const k = S.v.map((x, i) => x != null && !S.tag[i] && (arch || i < 10) ? x / ALL[i].max : null).filter(x => x != null);
    if (!k.length) return null;
    const m = k.reduce((a, b) => a + b, 0) / k.length;
    return run(fill(S.v, remaining(S.v, arch), m), arch).p;
  }

  function gauge(p, cut, pj) {
    const g = $('#gauge');
    if (cut.lo == null) { g.hidden = true; return; }
    g.hidden = false;
    const vals = [cut.lo, cut.top, p, pj].filter(x => x != null);
    const a = Math.max(0, Math.floor(Math.min(...vals) - 1)), b = Math.min(20, Math.ceil(Math.max(...vals) + .5));
    const x = v => ((v - a) / (b - a) * 100).toFixed(2) + '%';
    g.style.setProperty('--lo', x(cut.lo)); g.style.setProperty('--hi', x(cut.hi));
    g.style.setProperty('--avg', x(cut.avg));
    const me = $('.g-me', g), pr = $('.g-pj', g);
    me.hidden = p == null; pr.hidden = pj == null || p == null || Math.abs(pj - p) < .02;
    if (p != null) me.style.transform = `translateX(${x(p)})`;
    if (pj != null) pr.style.transform = `translateX(${x(pj)})`;
    $('.g-a', g).textContent = a; $('.g-b', g).textContent = b;
  }

  function place(p) {
    const el = $('#place');
    if (!pool || p == null) { el.textContent = ''; return; }
    const vs = S.v.map((x, i) => pool.pub[i] ? (x ?? 0) : null), mp = run(vs).p;
    const peers = pool.rows.filter(r => r.sede === S.sede && r.p != null);
    if (!peers.length || mp == null) { el.textContent = ''; return; }
    const ahead = peers.filter(r => r.p > mp + 1e-9 && (!S.who || r.code !== S.who.code)).length;
    el.innerHTML = `Puesto <b>${(ahead + 1).toLocaleString('es-PE')}</b> de ${peers.length.toLocaleString('es-PE')} · Pre ${esc(S.sede)}`;
  }

  function flags() {
    const f = [];
    const aus = S.tag.map((t, i) => t === 'aus' ? EX[i].l : null).filter(Boolean);
    if (aus.length) f.push(`Ausente en ${aus.join(', ')}: cuenta 0.`);
    const sin = S.tag.map((t, i) => t === 'sin' ? EX[i].l : null).filter(Boolean);
    if (sin.length) f.push(`Sin nota publicada en ${sin.join(', ')}: cuenta 0.`);
    const g = S.v.slice(0, 10), k = g.filter(x => x != null);
    if (S.scale === 150 && k.length >= 2 && k.every(x => x <= 20) && !S.who) f.push('<button type="button" data-reinterpret>¿Son notas sobre 20? Convertir</button>');
    const last = g.map((x, i) => x == null ? null : i).filter(i => i != null).pop();
    if (k.length >= 3 && !S.tag[last]) {
      const others = k.length > 1 ? (k.reduce((a, b) => a + b, 0) - S.v[last]) / (k.length - 1) : null;
      const d = S.v[last] - others;
      if (Math.abs(d) >= 15) f.push(`${EX[last].l}: ${d > 0 ? '+' : '−'}${fmt(Math.abs(S.scale === 20 ? d / 7.5 : d), 1)} frente a tu promedio.`);
    }
    $('#flags').innerHTML = f.map(t => `<li>${t}</li>`).join('');
  }

  function reach() {
    const el = $('#reach'), pG = run(S.v, false).p, pA = run(S.v, true).p;
    if (pG == null) { el.hidden = true; return; }
    const all = C.careers.map(([c, n]) => ({ c, n, k: cuts(c), p: ARCH.has(c) ? pA : pG })).filter(o => o.k.avg != null).sort((a, b) => b.k.avg - a.k.avg);
    const ok = all.filter(o => o.p >= o.k.avg), near = all.filter(o => o.p < o.k.avg && o.k.avg - o.p <= .6).reverse();
    const item = o => `<li><button type="button" data-career="${o.c}" aria-pressed="${o.c === S.career}"><span>${esc(o.n)}</span><b>${fmt(o.k.avg)}</b></button></li>`;
    el.hidden = false;
    $('#reach-ok').innerHTML = ok.length ? ok.slice(0, 8).map(item).join('') + (ok.length > 8 ? `<li class="r-more">y ${ok.length - 8} más</li>` : '') : '<li class="r-none">Ninguna todavía</li>';
    $('#reach-near').innerHTML = near.slice(0, 5).map(item).join('');
    $('#near-box').hidden = !near.length;
    $('#reach-n').textContent = ok.length;
  }

  function history(p, cut) {
    $('#h-career').textContent = careerName(S.career);
    $('#h-sede').textContent = cut.from;
    const b0 = 8, b1 = 20, x = v => ((Math.min(b1, Math.max(b0, v)) - b0) / (b1 - b0) * 100).toFixed(2);
    $('#h-rows').innerHTML = cut.rows.length ? cut.rows.map(r => `<tr><th scope="row">${esc(r.cy)}</th><td>${fmt(r.min, 3)}</td><td>${fmt(r.max, 3)}</td>
      <td class="h-bar" aria-hidden="true"><i style="left:${x(r.min)}%;width:${Math.max(.6, x(r.max) - x(r.min))}%"></i>${p != null ? `<em style="left:${x(p)}%"></em>` : ''}</td></tr>`).join('')
      : '<tr><td colspan="4" class="r-none">Sin cortes registrados</td></tr>';
  }

  /* ---------- búsqueda ---------- */
  let act = -1, hits = [];
  function paintList(res) {
    hits = res.hits; act = -1;
    if (!q.value.trim()) { list.hidden = true; q.setAttribute('aria-expanded', 'false'); return; }
    list.innerHTML = hits.length
      ? (res.near ? '<li class="q-note">¿Quisiste decir?</li>' : '') + hits.map((h, i) => `<li role="option" id="o${i}" data-i="${i}"><b>${esc(h.code)}</b><span>${esc(h.name)}</span><small>${esc(h.sede)}</small></li>`).join('') + (res.more > 0 ? `<li class="q-note">${res.more} más · escribe más letras</li>` : '')
      : '<li class="q-note">Sin resultados en Pre 2027-1</li>';
    list.hidden = false; q.setAttribute('aria-expanded', 'true');
  }
  function pick(h) {
    const v = EX.map((e, i) => {
      if (!pool.pub[i]) return null;
      return (h.r[e.k + 'Status'] === 'AUSENTE' || h.r[e.k] == null) ? 0 : +h.r[e.k];
    });
    S.tag = EX.map((e, i) => !pool.pub[i] ? '' : h.r[e.k + 'Status'] === 'AUSENTE' ? 'aus' : h.r[e.k] == null ? 'sin' : '').concat(S.tag.slice(10));
    S.v = v.concat(S.v.slice(10)); S.off = v.slice(); S.sede = h.sede === 'Juliaca' ? 'Juliaca' : 'Lima';
    S.who = { code: h.code, name: h.name };
    q.value = ''; paintList({ hits: [] }); q.blur();
    paintWho(); paintSede(); paintInputs(); commit();
    if (matchMedia('(max-width: 979px)').matches) out.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
  function paintWho() {
    who.hidden = !S.who;
    $('#find').hidden = !!S.who;
    if (S.who) { $('#who-name').textContent = S.who.name.toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase()); $('#who-code').textContent = S.who.code; }
  }
  function paintSede() { $$('#sede button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sede === S.sede))); }

  q.addEventListener('focus', () => loadPool().catch(() => {}), { once: true });
  q.addEventListener('input', () => {
    if (!pool && q.value.trim()) { list.innerHTML = '<li class="q-note">Buscando…</li>'; list.hidden = false; }
    loadPool().then(() => paintList(find(q.value))).catch(() => { list.innerHTML = '<li class="q-note">No se pudo cargar el padrón</li>'; list.hidden = false; }); });
  q.addEventListener('keydown', e => {
    if (list.hidden) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); if (!hits.length) return;
      act = (act + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length;
      $$('[role=option]', list).forEach((o, i) => o.setAttribute('aria-selected', String(i === act)));
      q.setAttribute('aria-activedescendant', 'o' + act);
    } else if (e.key === 'Enter') { e.preventDefault(); const h = hits[act < 0 ? 0 : act]; if (h && (act >= 0 || hits.length === 1)) pick(h); }
    else if (e.key === 'Escape') { list.hidden = true; q.setAttribute('aria-expanded', 'false'); }
  });
  $('#find').addEventListener('submit', e => e.preventDefault());
  list.addEventListener('pointerdown', e => { const o = e.target.closest('[role=option]'); if (o) { e.preventDefault(); pick(hits[+o.dataset.i]); } });
  q.addEventListener('blur', () => setTimeout(() => { list.hidden = true; q.setAttribute('aria-expanded', 'false'); }, 120));
  $('#who-x').addEventListener('click', () => {
    S.who = null; S.off = null; S.tag = blank(''); S.v = blank(null);
    paintWho(); paintInputs(); commit(); q.focus();
  });

  /* ---------- eventos ---------- */
  box.addEventListener('input', e => { if (e.target.matches('input')) onNote(e.target); });
  box.addEventListener('change', e => { if (e.target.matches('input') && !e.target.hasAttribute('aria-invalid')) e.target.value = show(+e.target.closest('.n-row').dataset.i); });
  box.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); const n = e.target.closest('.n-row').nextElementSibling; n ? $('input', n).focus() : e.target.blur(); } });
  document.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.scale) { S.scale = +t.dataset.scale; const el = t.closest('.n-row')?.querySelector('input'); paintInputs(); if (el) onNote(el); else commit(); }
    else if (t.closest('#scale')) { S.scale = +t.dataset.s; paintInputs(); commit(); }
    else if (t.hasAttribute('data-reinterpret')) { S.v = S.v.map((x, i) => x == null || i >= 10 ? x : x * 7.5); S.scale = 20; paintInputs(); commit(); }
    else if (t.dataset.career) { S.career = t.dataset.career; sel.value = S.career; commit(); }
    else if (t.closest('#tgt')) { S.tgt = t.dataset.t; commit(); }
    else if (t.closest('#sede')) { S.sede = t.dataset.sede; paintSede(); commit(); }
    else if (t.id === 'restore') { S.v = S.off.slice(0, 10).concat(S.v.slice(10)); paintInputs(); commit(); }
    else if (t.id === 'clear') { S.v = blank(null); S.tag = blank(''); S.off = null; S.who = null; paintWho(); paintInputs(); commit(); }
  });
  sel.addEventListener('change', () => { S.career = sel.value; commit(); });

  /* ---------- volver arriba ---------- */
  const totop = $('.totop');
  addEventListener('scroll', () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    totop.classList.toggle('is-on', y > 700); totop.tabIndex = y > 700 ? 0 : -1;
    totop.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(3) : 0);
  }, { passive: true });
  totop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- copias viejas de /calculadora ---------- */
  // Atrás/adelante usa la copia guardada sin revalidar: se reemplaza por la redirección 301 actual, una vez por navegador.
  try {
    if (!localStorage.getItem('universe-calc-legacy')) {
      Promise.all(['/calculadora', '/calculadora/', '/calculadora.html'].map(u => fetch(u, { cache: 'reload', redirect: 'manual', credentials: 'same-origin' })))
        .then(() => localStorage.setItem('universe-calc-legacy', '1')).catch(() => {});
    }
  } catch (e) { /* sin almacenamiento */ }

  /* ---------- arranque ---------- */
  buildNotes();
  fetch('/cepreuni/calculadorapre/cortes.json?v=20261114').then(r => r.json()).then(d => {
    C = d; buildCareer(); paintWho(); paintSede(); paintInputs(); render();
    document.body.classList.add('is-ready');
    if (S.who) loadPool().then(render).catch(() => {});
  }).catch(() => {
    out.innerHTML = '<p class="o-label">No se pudieron cargar los cortes. Recarga la página.</p>';
    document.body.classList.add('is-ready');
  });
})();
