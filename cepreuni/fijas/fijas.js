/* CEPREUNI · Fijas. Datos: segundo-parcial.json (pronóstico 2027-1) y archivo.json (final y selección, se carga al pedirlo).
   Estado en el hash: #curso/tema para el parcial, #final/curso o #seleccion/curso para el archivo. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fold = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const slug = s => fold(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const dec = (n, d = 1) => Number(n).toFixed(d).replace('.', ',');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  // mismo matiz por curso que la biblioteca de materiales
  const HUE = { fisica: 205, quimica: 235, aritmetica: 35, algebra: 60, geometria: 95, trigonometria: 150, rm: 15, 'razonamiento-matematico': 15,
    rv: 275, 'razonamiento-verbal': 275, humanidades: 330, literatura: 312, lenguaje: 300, ingles: 325, psicologia: 350, historia: 15, geografia: 125, economia: 180, filosofia: 260 };
  // cursos de la biblioteca de materiales (para enlazar el repaso)
  const MAT = { fisica: 'Física', quimica: 'Química', aritmetica: 'Aritmética', algebra: 'Álgebra', geometria: 'Geometría', trigonometria: 'Trigonometría',
    rm: 'Razonamiento Matemático', rv: 'Razonamiento Verbal' };
  const SHORT = { rm: 'R. Matemático', rv: 'R. Verbal' };
  const HUM = ['Economía', 'Filosofía', 'Psicología', 'Lenguaje', 'Geografía', 'Inglés', 'Literatura', 'Historia'];
  const EV = {
    p2: { title: '2.º Parcial', sub: 'Pronóstico para 2027-1 a partir de <b>13 exámenes</b> y <b>752 preguntas</b>.' },
    final: { title: 'Examen final', sub: 'Temas que más se repitieron en los exámenes finales <b>2022-2 a 2026-1</b>.' },
    seleccion: { title: 'Selección', sub: 'Temas que más se repitieron en <b>19 pruebas de selección</b> (2011-2 a 2026-2).' }
  };
  const ICON = {
    up: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 12.5v-9M4 7l4-4 4 4"/></svg>',
    down: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3.5v9M4 9l4 4 4-4"/></svg>',
    chev: '<svg class="fj-chev" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>',
    arrow: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10h10m-4-4 4 4-4 4"/></svg>'
  };

  const chipsEl = $('.fj-chips'), view = $('#vista'), hot = $('.fj-hot'), consoleEl = $('.console');
  const seg = $('.fj-seg'), pill = $('.fj-seg-pill');
  const state = { ev: 'p2', course: '', topic: '' };
  let P2 = null, ARCH = null, first = true;

  /* ---------- hash ---------- */
  function readHash() {
    const [a = '', b = ''] = decodeURIComponent(location.hash.slice(1)).split('/');
    if (a === 'final' || a === 'seleccion') Object.assign(state, { ev: a, course: b, topic: '' });
    else Object.assign(state, { ev: 'p2', course: a === 'resumen' ? '' : a, topic: b });
  }
  function writeHash() {
    const h = state.ev === 'p2' ? [state.course, state.topic].filter(Boolean).join('/') : [state.ev, state.course].filter(Boolean).join('/');
    try { history.replaceState(null, '', location.pathname + location.search + (h ? '#' + h : '')); } catch { /* file:// */ }
  }

  /* ---------- piezas ---------- */
  const course = id => P2.courses.find(c => c.id === id);
  const bar = (w, i = 0, cls = '') => `<span class="fj-bar ${cls}" style="--w:${Math.max(0, Math.min(1, w)).toFixed(3)};--i:${Math.min(i, 14)}"><i></i></span>`;
  const trend = t => t > 0 ? `<span class="fj-tr is-up">${ICON.up}Sube</span>` : t < 0 ? `<span class="fj-tr is-down">${ICON.down}Baja</span>` : '';
  const preg = n => `${dec(n)} ${n === 1 ? 'pregunta' : 'preguntas'}`;
  const seriesStats = s => {
    const v = s.filter(x => x !== null);
    return { total: v.reduce((a, b) => a + b, 0), hit: v.filter(Boolean).length, n: v.length };
  };

  function strip(series, periods, label = 'Preguntas por examen') {
    const max = Math.max(1, ...series.filter(x => x !== null));
    const aria = periods.map((p, i) => `${p}: ${series[i] === null ? 'sin el curso' : series[i]}`).join(', ');
    return `<div class="fj-strip" role="img" aria-label="${esc(label)}. ${esc(aria)}">${series.map((v, i) =>
      `<span class="${v === null ? 'is-na' : v ? '' : 'is-zero'}" style="--a:${v ? (0.28 + 0.72 * v / max).toFixed(2) : 0}"><b>${v === null ? '–' : v || '·'}</b><i>${esc(periods[i])}</i></span>`).join('')}</div>`;
  }

  function matLink(c, t) {
    const hum = c.id === 'humanidades' && HUM.find(h => fold(t.n).startsWith(fold(h)));
    const name = hum || MAT[c.id];
    return name ? `<a class="fj-link" href="/cepreuni/materialespre/?c=${encodeURIComponent(name)}">Repasar ${esc(name)} en materiales ${ICON.arrow}</a>` : '';
  }

  /* ---------- chips de curso ---------- */
  function chips() {
    let list;
    if (state.ev === 'p2') list = [['', 'Resumen', '']].concat(P2.order.map(id => { const c = course(id); return [id, SHORT[id] || c.name, c.exp]; }));
    else list = ARCH[state.ev].courses.map(c => [c.id, c.name, '']);
    chipsEl.innerHTML = list.map(([id, name, n]) =>
      `<button type="button" aria-pressed="${id === state.course}" data-c="${esc(id)}" style="--h:${HUE[id] ?? 0};--c:${id ? 1 : 0}">${id ? '<i></i>' : ''}${esc(name)}${n ? `<span>${esc(n)}</span>` : ''}</button>`).join('');
    const on = $('[aria-pressed="true"]', chipsEl);
    if (on && chipsEl.scrollWidth > chipsEl.clientWidth) chipsEl.scrollTo({ left: on.offsetLeft - chipsEl.clientWidth / 2 + on.offsetWidth / 2, behavior: first ? 'instant' : 'smooth' });
  }

  /* ---------- vista: resumen ---------- */
  function summary() {
    const rows = P2.top.map((t, i) => {
      const c = course(t.c);
      return `<li><a class="fj-rank" href="#${c.id}/${slug(t.n)}" style="--h:${HUE[c.id]}">
        <span class="fj-rank-n">${i + 1}</span>
        <span class="fj-rank-txt"><strong>${esc(t.n)}</strong><small><i></i>${esc(c.name)}${c.provisional ? ' · provisional' : ''} · ${preg(t.e)}</small></span>
        ${bar(t.p / 100, i, t.p >= 85 ? 'is-hot' : '')}<span class="fj-pct">${t.p}<small>%</small></span></a></li>`;
    }).join('');
    const tr = P2.trends.map(t => `<li class="${t.dir > 0 ? 'is-up' : 'is-down'}"><span class="fj-tr-ico">${t.dir > 0 ? ICON.up : ICON.down}</span><div><strong>${esc(t.t)}</strong> <em>${esc(course(t.c).name)}</em><p>${esc(t.d)}</p></div></li>`).join('');
    const per = P2.order.map(id => { const c = course(id);
      return `<li><a href="#${id}" style="--h:${HUE[id]}"><b>${esc(c.exp)}</b><span><i></i>${esc(c.name)}</span><small>${c.only ? 'Lit · Len · Psi' : `Promedio ${esc(c.avg)}`}</small></a></li>`; }).join('');
    return `<section class="fj-sec"><div class="fj-sec-head"><h2>Los temas con más preguntas esperadas</h2><p>Todos los cursos, ordenados por cuántas preguntas se esperan.</p></div><ol class="fj-ranks">${rows}</ol>
      <p class="fj-foot">Humanidades no figura: en 2027-1 entran solo Literatura, Lenguaje y Psicología, así que esos cursos están confirmados (<a href="#humanidades">ver Humanidades</a>). Razonamiento Matemático solo tiene dos exámenes: su pronóstico es provisional.</p></section>
      <section class="fj-sec"><div class="fj-sec-head"><h2>Preguntas por curso</h2><p>Formato de los tres últimos exámenes: 7 de Física, 7 de Química, 16 de Matemática y 30 de RM, RV y Humanidades.</p></div><ul class="fj-per">${per}</ul></section>
      <section class="fj-sec"><div class="fj-sec-head"><h2>Lo que está cambiando</h2><p>Temas que en los últimos exámenes se alejaron de su historial.</p></div><ul class="fj-trends">${tr}</ul></section>
      ${repeats(P2.repeats, true)}${method()}`;
  }

  function repeats(list, all) {
    if (!list.length) return '';
    return `<section class="fj-sec"><div class="fj-sec-head"><h2>Preguntas que volvieron</h2><p>Mismos datos, mismo enunciado o mismo esquema de resolución en dos o más exámenes.</p></div>
      <ul class="fj-reps">${list.map(r => `<li style="--h:${HUE[r.c]}"><div><strong>${esc(r.q)}</strong><small>${all ? `<i></i>${esc(course(r.c).name)} · ` : ''}${esc(r.r)}</small></div><span>${esc(r.w)}</span></li>`).join('')}</ul></section>`;
  }

  function method() {
    const v = P2.validation.map(r => `<tr><th scope="row">${esc(r.c)}</th><td>${r.h} %</td><td>${r.hr} %</td><td>${r.k} %</td><td>${r.kr} %</td></tr>`).join('');
    const cols = ['Fís', 'Quí', 'Ari', 'Álg', 'Geo', 'Tri', 'RM', 'RV', 'Hum'];
    const st = P2.periods.map(p => { const r = P2.structure[p]; return `<tr><th scope="row">${p}</th>${r.map(x => `<td>${x ?? '–'}</td>`).join('')}<td>${r.reduce((a, b) => a + (b || 0), 0)}</td></tr>`; }).join('');
    return `<section class="fj-sec fj-method"><details><summary><span>Cómo se calcula</span>${ICON.chev}</summary><div class="fj-method-body">
      <p>La base reúne los segundos exámenes parciales de 2017-1, 2019-1, 2019-2, 2020-1 y 2022-2 a 2026-2. Cada pregunta se asignó a un curso y a un tema. De 2019-1 solo existen 32 preguntas (Física, Química y Matemática).</p>
      <p>Cada tema se mide como proporción de las preguntas de su curso en cada examen, con un peso que se reduce a la mitad cada tres exámenes hacia el pasado. Esa proporción por el número de preguntas del curso da las <b>preguntas esperadas</b>. La <b>probabilidad de aparecer</b> es 1 − (1 − p)<sup>N</sup>, redondeada a múltiplos de 5 %.</p>
      <p><b>Ajuste 2027-1:</b> está confirmado que en Humanidades solo entran Literatura, Lenguaje y Psicología, además de Razonamiento Verbal. Por eso se retiraron del pronóstico Economía, Filosofía, Geografía, Historia, Inglés, Educación cívica y actualidad, y esos tres cursos se muestran como confirmados en vez de con una probabilidad. En Humanidades y Razonamiento Verbal el temario es acumulativo: cada examen evalúa desde la semana 1 hasta la semana del examen.</p>
      <p>Se supone que se mantiene el formato de los tres últimos exámenes (75 % estimado). Si volviera el anterior (Física 6, Química 6, Matemática 20, RV 18, Humanidades 10 con Inglés), cada curso tendría más preguntas y las probabilidades serían algo más altas.</p>
      <h3>Validación con exámenes pasados</h3>
      <p>Se pronosticaron los seis últimos exámenes usando solo los anteriores. De los tres temas con más preguntas esperadas por curso, el 81 % apareció (63 % al azar) y reunieron el 63 % de las preguntas del curso (46 % al azar).</p>
      <div class="fj-table"><table><thead><tr><th scope="col">Curso</th><th scope="col">Aciertos top 3</th><th scope="col">Azar</th><th scope="col">Cobertura top 3</th><th scope="col">Azar</th></tr></thead><tbody>${v}</tbody></table></div>
      <h3>Estructura de cada examen</h3>
      <div class="fj-table"><table class="is-num"><thead><tr><th scope="col">Examen</th>${cols.map(c => `<th scope="col">${c}</th>`).join('')}<th scope="col">Total</th></tr></thead><tbody>${st}</tbody></table></div>
      <p class="fj-foot">Humanidades incluye Inglés y actualidad. Pronóstico estadístico, no oficial de CEPREUNI: sirve para priorizar, no para dejar temas sin estudiar.</p>
    </div></details></section>`;
  }

  /* ---------- vista: curso del parcial ---------- */
  const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
  const inOnly = (c, n) => !c.only || c.only.some(o => fold(n).startsWith(fold(o)));
  // Humanidades y RV son acumulativos: cada examen evalúa desde la semana 1 hasta la semana del examen (aquí, la 13).
  function syllabus(list) {
    const wk = list.map((t, i) => [i + 1, t]).filter(([, t]) => !/^repaso/i.test(t));
    const li = ([w, t]) => `<li><span>S${w}</span>${esc(t)}</li>`;
    return `<div class="fj-syl"><h4>Temario acumulativo · semanas 1 a 13</h4>
      <p class="fj-syl-k">Lo nuevo desde el 1.er parcial</p><ol class="is-new">${wk.filter(([w]) => w >= 8).map(li).join('')}</ol>
      <p class="fj-syl-k">También entra</p><ol>${wk.filter(([w]) => w < 8).map(li).join('')}</ol></div>`;
  }
  function confirmedRow(c, t, i) {
    const s = seriesStats(t.s), id = slug(t.n), open = state.topic === id;
    const name = c.only.find(o => fold(t.n).startsWith(fold(o)));
    const qs = c.types.filter(q => fold(q.n).startsWith(fold(name)));
    return `<li class="fj-t is-confirmed${open ? ' is-open' : ''}" id="t-${id}" data-t="${id}">
      <button type="button" class="fj-t-head" aria-expanded="${open}" aria-controls="tb-${id}">
        <span class="fj-t-name"><strong>${esc(t.n)}</strong><small>Historial: ${s.total} preguntas en ${s.hit} de ${s.n} exámenes</small></span>
        <span class="fj-pct fj-ok">Entra</span>${ICON.chev}
      </button>
      <div class="fj-t-body" id="tb-${id}" role="region" aria-label="${esc(t.n)}"><div class="fj-t-inner">
        ${c.syl?.[name] ? syllabus(c.syl[name]) : ''}
        ${qs.length ? `<ul class="fj-mini">${qs.map(q => `<li><strong>${esc(cap(q.n.replace(/^[^:]+:\s*/, '')))}</strong> · ${esc(q.h)} <small>${q.v} ${q.v === 1 ? 'vez' : 'veces'}</small></li>`).join('')}</ul>` : ''}
        ${strip(t.s, P2.periods)}${matLink(c, t)}
      </div></div></li>`;
  }

  function courseView(c) {
    const max = Math.max(...c.topics.map(t => t.p));
    const inT = c.topics.filter(t => inOnly(c, t.n)), outT = c.topics.filter(t => !inOnly(c, t.n));
    const topics = c.only ? inT.map((t, i) => confirmedRow(c, t, i)).join('') : inT.map((t, i) => {
      const s = seriesStats(t.s), id = slug(t.n), open = state.topic === id;
      const facts = [`<li><b>${s.total}</b> ${s.total === 1 ? 'pregunta' : 'preguntas'} en <b>${s.hit} de ${s.n}</b> exámenes</li>`,
        t.l4 !== null ? `<li><b>${t.l4}</b> en los últimos 4 exámenes</li>` : '',
        `<li>Promedio <b>${dec(s.total / s.n, 2)}</b> por examen</li>`].join('');
      return `<li class="fj-t${open ? ' is-open' : ''}" id="t-${id}" data-t="${id}">
        <button type="button" class="fj-t-head" aria-expanded="${open}" aria-controls="tb-${id}">
          <span class="fj-t-name"><strong>${esc(t.n)}</strong><small>${preg(t.e)}${trend(t.t)}</small></span>
          ${bar(t.p / 100, i, t.p >= 85 ? 'is-hot' : t.p === max ? 'is-top' : '')}<span class="fj-pct">${t.p}<small>%</small></span>${ICON.chev}
        </button>
        <div class="fj-t-body" id="tb-${id}" role="region" aria-label="${esc(t.n)}"><div class="fj-t-inner">
          ${t.h ? `<p class="fj-t-how">${esc(t.h)}</p>` : ''}
          ${strip(t.s, P2.periods)}
          <ul class="fj-facts">${facts}</ul>${matLink(c, t)}
        </div></div></li>`;
    }).join('');
    const mix = c.mix.length ? `<div class="fj-mix"><h3>Composición más probable</h3><ol>${c.mix.map(([n, t]) => `<li><b>${n}</b>${esc(t)}</li>`).join('')}</ol></div>` : '';
    const reps = repeats(P2.repeats.filter(r => r.c === c.id), false);
    const next = [MAT[c.id] ? `<a href="/cepreuni/materialespre/?c=${encodeURIComponent(MAT[c.id])}">Clases y materiales de ${esc(MAT[c.id])}${ICON.arrow}</a>` : '',
      `<a href="/cepreuni/examenes?e=2ep">Parciales anteriores para practicar${ICON.arrow}</a>`].join('');
    return `<section class="fj-sec fj-course" style="--h:${HUE[c.id]}">
        <header class="fj-ch">
          <p class="fj-kicker"><i></i>${esc(c.name)}${c.provisional ? ' · pronóstico provisional' : ''}${c.only || P2.confirmed.includes(c.name) ? ' · <b class="fj-ok">confirmado para 2027-1</b>' : ''}</p>
          <h2><span class="fj-big">${esc(c.exp)}</span> preguntas esperadas</h2>
          <p class="fj-meta">${c.only ? `Solo entran ${esc(c.only.slice(0, -1).join(', '))} y ${esc(c.only.at(-1))}. El temario es acumulativo: entra todo lo de las semanas 1 a 13. Si las preguntas se reparten por igual, serían 3 o 4 por curso.` : `Promedio histórico ${esc(c.avg)}${c.avgNote ? ` (${esc(c.avgNote)})` : ''} · ${esc(c.base)}`}</p>
        </header>${mix}
        <div class="fj-sec-head is-sm"><h3>${c.only ? 'Cursos que entran' : 'Temas'}</h3><p>${c.only ? 'Toca un curso para ver su temario acumulativo y cómo suelen preguntar' : 'Probabilidad de aparecer al menos una vez'}</p></div>
        <ul class="fj-topics">${topics}</ul>
        ${outT.length ? `<div class="fj-out"><h4>No entran en 2027-1</h4><p>${outT.map(t => esc(t.n)).join(' · ')}</p></div>` : ''}
        ${!c.only && c.syl ? Object.values(c.syl).map(syllabus).join('') : ''}
      </section>${types(c)}${reps}<nav class="fj-next" aria-label="Seguir con ${esc(c.name)}">${next}</nav>`;
  }

  function types(c) {
    if (c.only) return '';
    if (!c.types.length) return '';
    const LIM = 5, more = c.types.length > LIM;
    const n = c.id === 'humanidades' || c.id === 'rv' ? 12 : 13;
    return `<section class="fj-sec"><div class="fj-sec-head"><h2>Cómo suelen preguntar</h2><p>Tipos de pregunta más frecuentes y su planteamiento habitual.</p></div>
      <ul class="fj-qs${more ? ' is-clipped' : ''}">${c.types.map((q, i) => `<li${i >= LIM ? ' class="is-extra"' : ''}>
        <div class="fj-q-main"><strong>${esc(q.n)}</strong><p>${esc(q.h)}</p><small>${esc(q.y.replace(/, /g, ' · '))}</small></div>
        <span class="fj-q-n"><b>${q.v}</b>${q.v === 1 ? 'vez' : 'veces'}<small>${q.x} de ${n}</small></span></li>`).join('')}</ul>
      ${more ? `<button type="button" class="fj-more" data-more>Ver los ${c.types.length} tipos</button>` : ''}</section>`;
  }

  /* ---------- vista: archivo ---------- */
  function archiveView() {
    const ex = ARCH[state.ev], c = ex.courses.find(x => x.id === state.course);
    const max = c.topics[0]?.t || 1, periods = ex.periods ? ex.periods.slice().reverse() : null;
    const rows = c.topics.map((t, i) => {
      const id = slug(t.n);
      if (!periods) return `<li class="fj-t is-flat"><div class="fj-t-head"><span class="fj-t-name"><strong>${esc(t.n)}</strong></span>${bar(t.t / max, i)}<span class="fj-pct">${t.t}<small> ${t.t === 1 ? 'vez' : 'veces'}</small></span></div></li>`;
      return `<li class="fj-t" data-t="${id}"><button type="button" class="fj-t-head" aria-expanded="false" aria-controls="tb-${id}">
          <span class="fj-t-name"><strong>${esc(t.n)}</strong><small>En ${t.k} de ${ex.periods.length} exámenes</small></span>${bar(t.t / max, i)}<span class="fj-pct">${t.t}<small> ${t.t === 1 ? 'vez' : 'veces'}</small></span>${ICON.chev}</button>
        <div class="fj-t-body" id="tb-${id}" role="region" aria-label="${esc(t.n)}"><div class="fj-t-inner">${strip(t.s.slice().reverse(), periods)}</div></div></li>`;
    }).join('');
    const total = c.topics.reduce((a, t) => a + t.t, 0);
    return `<section class="fj-sec fj-course" style="--h:${HUE[c.id] ?? 0}">
        <header class="fj-ch"><p class="fj-kicker"><i></i>${esc(ex.title)}</p><h2 class="is-name">${esc(c.name)}</h2><p class="fj-meta">${esc(ex.note)} ${total} preguntas de ${esc(c.name)}.</p></header>
        <div class="fj-sec-head is-sm"><h3>Temas más frecuentes</h3><p>${periods ? 'Toca un tema para verlo examen por examen' : 'Veces que apareció'}</p></div>
        <ul class="fj-topics">${rows}</ul></section>
      <nav class="fj-next"><a href="/cepreuni/examenes?e=${state.ev === 'final' ? 'examen-final' : '2ep'}">${state.ev === 'final' ? 'Exámenes finales anteriores' : 'Exámenes CEPREUNI anteriores'}${ICON.arrow}</a></nav>`;
  }

  /* ---------- render ---------- */
  function render(scroll) {
    const ev = EV[state.ev];
    $('[data-ev-title]').textContent = ev.title;
    $('[data-ev-sub]').innerHTML = ev.sub;
    document.title = `Fijas CEPREUNI · ${state.ev === 'p2' ? 'Segundo Parcial 2027-1' : ev.title} · UNIverse to Study`;
    $$('button', seg).forEach(b => b.setAttribute('aria-selected', String(b.dataset.ev === state.ev)));
    movePill();
    hot.hidden = state.ev !== 'p2';
    if (state.ev === 'p2' && state.course && !course(state.course)) state.course = '';
    if (state.ev !== 'p2' && !ARCH[state.ev].courses.some(x => x.id === state.course)) state.course = ARCH[state.ev].courses[0].id;
    chips();
    const c = state.ev === 'p2' && state.course ? course(state.course) : null;
    view.innerHTML = state.ev !== 'p2' ? archiveView() : c ? courseView(c) : summary();
    view.setAttribute('aria-busy', 'false');
    if (!first && !reduce.matches) { view.classList.remove('is-in'); void view.offsetWidth; view.classList.add('is-in'); }
    writeHash();
    if (state.topic) {
      const el = $(`#t-${CSS.escape(state.topic)}`);
      if (el) { requestAnimationFrame(() => { scrollToEl(el, 16); el.classList.add('is-flash'); setTimeout(() => el.classList.remove('is-flash'), 1400); }); return; }
    }
    if (scroll) keepInView();
    first = false;
  }

  const stickyH = () => consoleEl.offsetHeight;
  function scrollToEl(el, gap = 12) {
    const y = el.getBoundingClientRect().top + scrollY - stickyH() - gap;
    scrollTo({ top: Math.max(0, y), behavior: reduce.matches || first ? 'instant' : 'smooth' });
    first = false;
  }
  function keepInView() { // al cambiar de curso, la vista empieza justo bajo la barra fija
    const top = view.getBoundingClientRect().top + scrollY - stickyH() - 8;
    if (scrollY > top) scrollTo({ top, behavior: 'instant' });
  }

  function movePill() {
    const on = $('[aria-selected="true"]', seg);
    if (!on) return;
    pill.style.width = on.offsetWidth + 'px';
    pill.style.transform = `translateX(${on.offsetLeft}px)`;
  }

  const fail = msg => { view.setAttribute('aria-busy', 'false'); view.innerHTML = `<p class="fj-note">${msg} <button type="button" class="fj-more" onclick="location.reload()">Reintentar</button></p>`; };
  async function ensureArch() {
    if (!ARCH) { view.setAttribute('aria-busy', 'true'); ARCH = await (await fetch('/cepreuni/fijas/archivo.json?v=20261125')).json(); }
  }
  async function setEv(ev) {
    if (ev !== 'p2') { try { await ensureArch(); } catch { fail('No se pudo cargar el archivo.'); return; } }
    Object.assign(state, { ev, course: '', topic: '' });
    render(true);
  }

  /* ---------- eventos ---------- */
  seg.addEventListener('click', e => { const b = e.target.closest('[data-ev]'); if (b && b.dataset.ev !== state.ev) setEv(b.dataset.ev); });
  seg.addEventListener('keydown', e => { // flechas entre pestañas
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const tabs = $$('[data-ev]', seg), i = tabs.findIndex(b => b.dataset.ev === state.ev);
    const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    n.focus(); setEv(n.dataset.ev);
  });
  chipsEl.addEventListener('click', e => {
    const b = e.target.closest('[data-c]');
    if (!b || b.dataset.c === state.course) return;
    Object.assign(state, { course: b.dataset.c, topic: '' });
    render(true);
  });
  view.addEventListener('click', e => {
    const head = e.target.closest('button.fj-t-head');
    if (head) {
      const li = head.parentElement, open = !li.classList.contains('is-open');
      li.classList.toggle('is-open', open);
      head.setAttribute('aria-expanded', String(open));
      if (state.ev === 'p2') { state.topic = open ? li.dataset.t : ''; writeHash(); }
      return;
    }
    const more = e.target.closest('[data-more]');
    if (more) { more.previousElementSibling.classList.remove('is-clipped'); more.remove(); return; }
    const a = e.target.closest('a[href^="#"]');
    if (a) { e.preventDefault(); go(a.getAttribute('href')); }
  });
  hot.addEventListener('click', e => { const a = e.target.closest('a[href^="#"]'); if (a) { e.preventDefault(); go(a.getAttribute('href')); } });
  function go(h) { history.replaceState(null, '', h); readHash(); render(true); }
  addEventListener('hashchange', () => {
    readHash();
    if (state.ev !== 'p2' && !ARCH) ensureArch().then(() => render(true), () => fail('No se pudo cargar el archivo.'));
    else render(true);
  });
  addEventListener('resize', movePill);

  /* ---------- barra fija y volver arriba ---------- */
  const totop = $('.totop');
  let ticking = false;
  const sync = () => {
    ticking = false;
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    consoleEl.classList.toggle('is-stuck', consoleEl.getBoundingClientRect().top <= 0 && y > 0);
    totop.classList.toggle('is-on', y > 900);
    totop.tabIndex = y > 900 ? 0 : -1;
    totop.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(3) : 0);
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(sync); } }, { passive: true });
  totop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce.matches ? 'instant' : 'smooth' }));

  /* ---------- entrada: las cifras de "casi seguro" cuentan hasta su valor ---------- */
  function countUp() {
    const nums = $$('.fj-card-p b');
    if (reduce.matches) return;
    const t0 = performance.now(), D = 900, ease = t => 1 - Math.pow(1 - t, 4);
    nums.forEach(b => { b.dataset.to = b.textContent; b.textContent = '0'; });
    const tick = now => {
      nums.forEach((b, i) => {
        const t = Math.min(1, Math.max(0, (now - t0 - 260 - i * 60) / D));
        b.textContent = Math.round(ease(t) * +b.dataset.to);
      });
      if (now - t0 < D + 260 + nums.length * 60) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- inicio ---------- */
  readHash();
  countUp();
  document.fonts?.ready.then(movePill);
  fetch('/cepreuni/fijas/segundo-parcial.json?v=20261125').then(r => r.json()).then(async d => {
    P2 = d;
    if (state.ev !== 'p2') await ensureArch();
    render();
    document.documentElement.classList.add('is-ready');
  }).catch(err => { console.error(err); fail('No se pudieron cargar las fijas.'); });
  sync();
})();
