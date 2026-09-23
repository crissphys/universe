// Exámenes de admisión UNI: el examen real, pregunta por pregunta, con el tiempo real de cada prueba
// (3 horas) y calificado con la regla oficial de la UNI al terminar. El avance vive en este navegador:
// el cronómetro se guarda como la hora de inicio, así que sigue corriendo aunque se cierre la página.

const VERSION = '20260923-uni';
const DURATION = 3 * 60 * 60 * 1000;
const STORE = 'universe-admission-exams-v1';
const KATEX = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/';
const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const ALPHA = ['a', 'b', 'c', 'd', 'e', 'f'];

const PROCESSES = [
  {
    id: 'uni-2026-2', label: '2026-2', tone: 'blue', ready: true, title: 'Admisión UNI 2026-2',
    data: '/universe-ui/data/examenes/uni-2026-2/', figs: '/universe-ui/assets/examenes/uni-2026-2/',
    tests: [
      {id: 'aptitud-humanidades', order: 'Primera prueba', name: 'Aptitud Académica y Humanidades', count: 100, correct: 6, wrong: -1.2, max: 600,
        blurb: 'Razonamiento matemático y verbal, actualidad, comunicación y lengua, economía, filosofía, geografía, historia, inglés, literatura, lógica y psicología.',
        stats: {src: '/admission-2026-2-exam1-summary.js', global: 'UNIVERSE_ADMISSION_2026_2'}},
      {id: 'matematica', order: 'Segunda prueba', name: 'Matemática', count: 40, correct: 15, wrong: -3, max: 600,
        blurb: 'Aritmética, álgebra, geometría y trigonometría: 10 preguntas de cada curso.',
        stats: {src: '/admission-2026-2-exam2-summary.js', global: 'UNIVERSE_ADMISSION_2026_2_EXAM2'}},
      {id: 'fisica-quimica', order: 'Tercera prueba', name: 'Física y Química', count: 40, correct: 15, wrong: -3, max: 600,
        blurb: 'Física y química: 20 preguntas de cada curso.',
        stats: {src: '/admission-2026-2-exam3-summary.js', global: 'UNIVERSE_ADMISSION_2026_2_EXAM3'}}
    ]
  },
  {id: 'uni-2026-1', label: '2026-1', tone: 'violet', title: 'Admisión UNI 2026-1'},
  {id: 'uni-2025-2', label: '2025-2', tone: 'emerald', title: 'Admisión UNI 2025-2'},
  {id: 'uni-2025-1', label: '2025-1', tone: 'orange', title: 'Admisión UNI 2025-1'},
  {id: 'uni-2024-2', label: '2024-2', tone: 'rose', title: 'Admisión UNI 2024-2'}
];

const root = document.getElementById('uexam');
const $ = (s, el = root) => el.querySelector(s);
const $$ = (s, el = root) => [...el.querySelectorAll(s)];

// ─── Guardado ───
function readStore() { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch { return {}; } }
let db = readStore();
function save() { try { localStorage.setItem(STORE, JSON.stringify(db)); } catch {} }
const record = (p, t) => db[p.id]?.[t.id];
function setRecord(p, t, r) { (db[p.id] ||= {})[t.id] = r; save(); }
function dropRecord(p, t) { if (db[p.id]) delete db[p.id][t.id]; save(); }
addEventListener('storage', e => { if (e.key === STORE) { db = readStore(); route(); } });

// ─── Formato ───
const num = (v, d = 1) => {
  const r = Math.round(v * 10 ** d) / 10 ** d;
  const [i, f] = Math.abs(r).toFixed(d).split('.');
  const int = i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (r < 0 ? '−' : '') + int + (f && +f ? ',' + f.replace(/0+$/, '') : '');
};
const pad = n => String(n).padStart(2, '0');
function clock(ms) { const s = Math.max(0, Math.ceil(ms / 1000)); return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s % 3600 / 60))}:${pad(s % 60)}`; }
function span(ms) {
  const m = Math.max(0, Math.round(ms / 60000)), h = Math.floor(m / 60);
  return h ? `${h} h ${pad(m % 60)} min` : `${m} min`;
}
const when = ts => new Date(ts).toLocaleString('es-PE', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'});
const remaining = r => r.start + DURATION - Date.now();

// ─── Recursos: datos de cada prueba, KaTeX y estadísticas reales ───
const cache = new Map();
function loadTest(p, t) {
  const k = p.id + '/' + t.id;
  if (!cache.has(k)) cache.set(k, import(`${p.data}${t.id}.js?v=${VERSION}`).then(m => {
    const d = m.default;
    d.answers = [...atob(d.key)].reverse();
    d.sectionOf = i => d.sections.find(s => i + 1 >= s[1] && i + 1 <= s[2]);
    return d;
  }));
  return cache.get(k);
}
function addScript(src) {
  return new Promise((ok, fail) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = fail; document.head.append(s); });
}
let katexReady;
function ensureKatex() {
  if (!katexReady) {
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = KATEX + 'katex.min.css'; document.head.append(css);
    katexReady = addScript(KATEX + 'katex.min.js').then(() => addScript(KATEX + 'contrib/auto-render.min.js')).catch(() => null);
  }
  return katexReady;
}
function typeset(el) {
  if (!window.renderMathInElement) return;
  window.renderMathInElement(el, {
    delimiters: [{left: '\\[', right: '\\]', display: true}, {left: '\\(', right: '\\)', display: false}],
    macros: {'\\sen': '\\operatorname{sen}'}, throwOnError: false
  });
  // La coma o el punto que siguen a una fórmula no deben quedar solos al inicio de la línea siguiente.
  // auto-render deja cada fórmula dentro de un <span> sin clase: la puntuación es hermana de ese span.
  for (const k of el.querySelectorAll('.katex')) {
    if (k.closest('.katex-display')) continue;
    const host = k.parentElement.tagName === 'SPAN' && !k.parentElement.className && k.parentElement.childNodes.length === 1 ? k.parentElement : k;
    const next = host.nextSibling;
    const punct = next?.nodeType === 3 && next.data.match(/^[,.;:)?!]+/)?.[0];
    if (!punct) continue;
    host.classList.add('uexam__nobr');
    host.append(punct);
    next.data = next.data.slice(punct.length);
  }
}
// Tras dibujar las fórmulas: si una alternativa no cabe en su columna, el grupo pasa a lista; y si ni así
// cabe (una fórmula muy larga en un teléfono), solo esa alternativa se desplaza en horizontal.
function fitOptions(scope) {
  const over = b => b.scrollWidth > b.clientWidth + 2;
  for (const box of $$('.uexam__opts--cols3', scope)) if ($$('.uexam__opt', box).some(over)) box.classList.replace('uexam__opts--cols3', 'uexam__opts--list');
  for (const b of $$('.uexam__opt', scope)) b.classList.toggle('is-wide', over(b));
}
const statsCache = new Map();
function loadStats(t) {
  if (!statsCache.has(t.id)) statsCache.set(t.id, (window[t.stats.global] ? Promise.resolve() : addScript(t.stats.src)).then(() => window[t.stats.global]).catch(() => null));
  return statsCache.get(t.id);
}

// ─── Calificación ───
function grade(d, t, r) {
  const rows = new Map();
  let right = 0, wrong = 0, blank = 0;
  d.questions.forEach((_, i) => {
    const s = d.sectionOf(i), area = s[3] || s[0];
    if (!rows.has(area)) rows.set(area, {name: area, right: 0, wrong: 0, blank: 0});
    const row = rows.get(area), a = r.answers[i];
    if (!a) { blank++; row.blank++; } else if (a === d.answers[i]) { right++; row.right++; } else { wrong++; row.wrong++; }
  });
  const score = right * t.correct + wrong * t.wrong;
  return {right, wrong, blank, score, rows: [...rows.values()].map(x => ({...x, score: x.right * t.correct + x.wrong * t.wrong}))};
}
function finish(p, t, auto) {
  const r = record(p, t);
  if (!r || r.end) return;
  r.end = Math.min(Date.now(), r.start + DURATION);
  r.auto = !!auto;
  setRecord(p, t, r);
}
// Una prueba cuyo tiempo venció con la página cerrada se entrega al volver, con la hora exacta del cierre.
function settleExpired() {
  for (const p of PROCESSES) for (const t of p.tests || []) {
    const r = record(p, t);
    if (r && !r.end && remaining(r) <= 0) finish(p, t, true);
  }
}

// ─── Piezas de marcado ───
function yearsNav(active) {
  return `<nav class="xpills uexam__years" aria-label="Exámenes de admisión UNI">${PROCESSES.map(p =>
    `<a class="xpill" data-tone="${p.tone}" href="#${p.id}"${p.id === active ? ' aria-current="page"' : ''}><small>Examen admisión UNI</small><b>${p.label}</b>${p.ready ? '' : '<em>Próximamente</em>'}</a>`).join('')}</nav>`;
}
function figure(d, p, id, extra = '') {
  if (d.svgs?.[id]) return `<figure class="uexam__fig uexam__fig--svg ${extra}">${d.svgs[id]}</figure>`;
  const [w, h] = d.figures[id];
  return `<figure class="uexam__fig ${extra}"><img src="${p.figs}${id}.png" width="${Math.round(w / 2)}" height="${Math.round(h / 2)}" alt="Figura del examen (${id.slice(1)})" loading="lazy" decoding="async"></figure>`;
}
function stem(d, p, q) {
  return q.q.replace(/\[\[(fig|svg):(\w+)\]\]/g, (_, __, id) => figure(d, p, id));
}
const visible = html => html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\\[a-zA-Z]+/g, '').replace(/[{}\\()^_]/g, '').trim().length;
function optionsLayout(q) {
  if (q.ofig) return 'letters';
  if (q.cols === 1) return 'list';
  return Math.max(...q.o.map(visible)) <= 16 ? 'cols3' : 'list';
}
// Una pregunta completa. En modo revisión las alternativas quedan fijas y muestran la clave.
function questionHTML(d, p, t, i, answer, review) {
  const q = d.questions[i], s = d.sectionOf(i), key = d.answers[i];
  const items = q.items ? `<ol class="uexam__items">${q.items.map((x, k) => `<li><span>${ROMAN[k]}.</span><div>${x}</div></li>`).join('')}</ol>` : '';
  const list2 = q.list2 ? `<ol class="uexam__items uexam__items--alpha">${q.list2.map((x, k) => `<li><span>${ALPHA[k]}.</span><div>${x}</div></li>`).join('')}</ol>` : '';
  const layout = optionsLayout(q);
  const opts = LETTERS.map((L, k) => {
    const picked = answer === L, cls = ['uexam__opt'];
    if (picked) cls.push('is-picked');
    if (review && L === key) cls.push('is-key');
    if (review && picked && L !== key) cls.push('is-miss');
    const body = layout === 'letters' ? '' : `<span class="uexam__otext">${q.o[k]}</span>`;
    return `<button type="button" class="${cls.join(' ')}" role="radio" aria-checked="${picked}" data-letter="${L}"${review ? ' disabled' : ''}><span class="uexam__letter">${L}</span>${body}</button>`;
  }).join('');
  let verdict = '';
  if (review) {
    verdict = !answer ? `<p class="uexam__verdict is-blank">Sin responder · La respuesta correcta es <b>${key}</b></p>`
      : answer === key ? `<p class="uexam__verdict is-right">Correcta · Marcaste <b>${answer}</b> (+${num(t.correct)})</p>`
      : `<p class="uexam__verdict is-wrong">Incorrecta · Marcaste <b>${answer}</b>, la correcta es <b>${key}</b> (${num(t.wrong)})</p>`;
  }
  return `<header class="uexam__qhead"><span class="uexam__qnum">Pregunta ${i + 1}<small> de ${d.questions.length}</small></span><span class="uexam__subject">${s[0]}</span></header>
    <div class="uexam__stem">${stem(d, p, q)}</div>${items}${list2}${q.after ? `<p class="uexam__after">${q.after}</p>` : ''}
    ${q.ofig ? figure(d, p, q.ofig, 'uexam__fig--options') : ''}
    <div class="uexam__opts uexam__opts--${layout}" role="radiogroup" aria-label="Alternativas de la pregunta ${i + 1}">${opts}</div>${verdict}`;
}

// ─── Diálogo de confirmación ───
function confirmBox({title, body, ok, cancel = 'Cancelar', danger = false}) {
  return new Promise(resolve => {
    const dlg = document.createElement('dialog');
    dlg.className = 'uexam__dialog';
    dlg.innerHTML = `<h2>${title}</h2><p>${body}</p><div class="uexam__dialogactions"><button type="button" class="uexam__btn" value="no">${cancel}</button><button type="button" class="uexam__btn ${danger ? 'uexam__btn--danger' : 'uexam__btn--primary'}" value="yes">${ok}</button></div>`;
    root.append(dlg);
    const close = v => { dlg.close(); dlg.remove(); document.body.classList.remove('modal-open'); resolve(v); };
    dlg.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (b) return close(b.value === 'yes');
      const box = dlg.getBoundingClientRect(); // un clic en el fondo (fuera de la caja) cancela
      if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) close(false);
    });
    dlg.addEventListener('cancel', e => { e.preventDefault(); close(false); });
    document.body.classList.add('modal-open');
    dlg.showModal();
    dlg.querySelector('[value=yes]').focus();
  });
}

// ─── Vista: portada de un proceso ───
function overview(p) {
  if (!p.ready) {
    root.innerHTML = `${yearsNav(p.id)}
      <section class="uexam__soon" data-tone="${p.tone}"><span class="uexam__kick">${p.title}</span>
        <h2>Este examen llegará pronto.</h2>
        <p>Estamos transcribiendo las tres pruebas del examen de admisión UNI ${p.label}, pregunta por pregunta y con su clave, para que puedas rendirlo aquí con el tiempo real.</p>
        <p>Mientras tanto, el examen UNI 2026-2 ya está completo: Aptitud Académica y Humanidades, Matemática, y Física y Química.</p>
        <a class="uexam__btn uexam__btn--primary" href="#uni-2026-2">Rendir el examen UNI 2026-2</a></section>`;
    return;
  }
  const done = p.tests.filter(t => record(p, t)?.end);
  const cards = p.tests.map(t => {
    const r = record(p, t);
    let state = 'idle', status = '<span class="uexam__state">Sin empezar</span>', actions = `<button type="button" class="uexam__btn uexam__btn--primary" data-act="start" data-test="${t.id}">Empezar prueba</button>`;
    if (r && !r.end) {
      state = 'live';
      status = `<span class="uexam__state is-live">En curso · quedan <b data-left="${r.start + DURATION}">${span(remaining(r))}</b></span>`;
      actions = `<a class="uexam__btn uexam__btn--primary" href="#${p.id}/${t.id}">Continuar prueba</a>`;
    } else if (r?.end) {
      state = 'done';
      status = `<span class="uexam__state is-done" data-score="${t.id}">Entregada · calculando puntaje…</span>`;
      actions = `<a class="uexam__btn uexam__btn--primary" href="#${p.id}/${t.id}">Ver resultados</a><button type="button" class="uexam__link" data-act="retake" data-test="${t.id}">Volver a rendir</button>`;
    }
    return `<article class="uexam__test" data-state="${state}">
      <span class="uexam__kick">${t.order}</span><h3>${t.name}</h3>
      <p class="uexam__meta"><span>${t.count} preguntas</span><span>3 horas</span><span>${t.max} puntos</span></p>
      <p class="uexam__blurb">${t.blurb}</p>
      <p class="uexam__scoring">Correcta +${num(t.correct)} · Incorrecta ${num(t.wrong)} · En blanco 0</p>
      <div class="uexam__status">${status}</div><div class="uexam__actions">${actions}</div></article>`;
  }).join('');
  root.innerHTML = `${yearsNav(p.id)}
    <section class="uexam__intro">
      <div class="uexam__introcopy"><span class="uexam__kick">${p.title} · Examen completo</span>
        <h2>Tres pruebas. Tres horas cada una.</h2>
        <p>Resuelve el examen de admisión tal como se tomó: las mismas preguntas, las mismas alternativas y el mismo tiempo. Al terminar cada prueba se revisan tus respuestas con la clave y ves tu puntaje con la regla oficial de la UNI.</p></div>
      <dl class="uexam__facts"><div><dt>Pruebas</dt><dd>3</dd></div><div><dt>Por prueba</dt><dd>3 h</dd></div><div><dt>En total</dt><dd>9 h</dd></div><div><dt>Preguntas</dt><dd>180</dd></div></dl>
      <ul class="uexam__rules">
        <li><b>Tienes 3 horas para cada prueba.</b> Son tres exámenes diferentes —Aptitud Académica y Humanidades, Matemática, y Física y Química— y se rinden por separado: 9 horas en total, como en la UNI.</li>
        <li><b>El tiempo corre desde que pulsas «Empezar prueba»</b> y no se detiene aunque cierres la pestaña o apagues la computadora.</li>
        <li><b>Cuando el cronómetro llega a 00:00:00, la prueba se cierra sola</b> y se revisa qué respuestas son correctas. Si terminas antes, puedes entregarla.</li>
        <li><b>Puntaje oficial:</b> cada respuesta incorrecta resta y cada pregunta sin marcar vale 0. Si dudas entre alternativas, dejarla en blanco también es una decisión.</li>
        <li>Tus respuestas y tu tiempo se guardan en este navegador.</li>
      </ul>
    </section>
    <div class="uexam__tests">${cards}</div>
    <section class="uexam__total">${done.length === p.tests.length
      ? `<span class="uexam__kick">Puntaje total</span><p><b data-total>…</b> <span>/ 1&nbsp;800 puntos</span></p><small>Suma de tus tres pruebas del examen ${p.title}.</small>`
      : `<span class="uexam__kick">Puntaje total</span><p><span>Completa las tres pruebas para ver tu puntaje sobre 1&nbsp;800.</span></p><small>Llevas ${done.length} de 3 pruebas entregadas.</small>`}</section>`;
  // Los puntajes necesitan la clave de cada prueba, que se carga solo cuando hace falta.
  let total = 0, pending = done.length;
  for (const t of done) loadTest(p, t).then(d => {
    const g = grade(d, t, record(p, t));
    const el = $(`[data-score="${t.id}"]`);
    if (el) el.innerHTML = `Entregada · <b>${num(g.score)}</b> / ${t.max} puntos · ${g.right} correctas`;
    total += g.score;
    if (!--pending) { const tot = $('[data-total]'); if (tot) tot.textContent = num(total); }
  });
}

// ─── Vista: rendir una prueba ───
let current = null; // {p, t, d}
async function exam(p, t, d) {
  const r = record(p, t);
  const n = d.questions.length;
  const i = Math.min(Math.max(r.cur || 0, 0), n - 1);
  const groups = d.sections.map(([name, from, to]) => `<div class="uexam__navgroup"><span>${name}</span><div class="uexam__nums">${
    Array.from({length: to - from + 1}, (_, k) => from - 1 + k).map(j => `<button type="button" data-go="${j}" aria-label="Pregunta ${j + 1}">${j + 1}</button>`).join('')}</div></div>`).join('');
  root.innerHTML = `<div class="uexam__bar" role="region" aria-label="Estado de la prueba">
      <a class="uexam__back" href="#${p.id}">← Exámenes</a>
      <div class="uexam__bartitle"><span>${p.title} · ${t.order}</span><b>${t.name}</b></div>
      <div class="uexam__clock" role="timer" aria-label="Tiempo restante"><span data-clock>${clock(remaining(r))}</span><small>tiempo restante</small></div>
      <div class="uexam__progress"><b data-count>0</b><span>/${n}</span><span class="uexam__wide">&nbsp;respondidas</span></div>
      <button type="button" class="uexam__btn uexam__btn--primary" data-act="finish">Entregar<span class="uexam__wide"> prueba</span></button>
      <div class="uexam__timeline" aria-hidden="true"><i data-timeline></i></div>
    </div>
    <div class="uexam__work">
      <article class="uexam__card" data-card tabindex="-1"></article>
      <aside class="uexam__nav" aria-label="Preguntas de la prueba">
        <button type="button" class="uexam__navopen" data-act="navopen" aria-expanded="false">Ver todas las preguntas</button>
        <div class="uexam__navbody">${groups}
          <p class="uexam__legend"><span class="is-answered">Respondida</span><span class="is-flagged">Por revisar</span><span class="is-current">Actual</span></p></div>
      </aside>
    </div>`;
  current = {p, t, d};
  showQuestion(i, false);
  tick();
}
function showQuestion(i, focus = true) {
  const {p, t, d} = current, r = record(p, t);
  r.cur = i; setRecord(p, t, r);
  const card = $('[data-card]');
  const flagged = (r.flags || []).includes(i);
  card.innerHTML = questionHTML(d, p, t, i, r.answers[i], false) + `<footer class="uexam__qfoot">
      <button type="button" class="uexam__btn" data-act="prev"${i === 0 ? ' disabled' : ''}>← Anterior</button>
      <div class="uexam__qtools"><button type="button" class="uexam__link${flagged ? ' is-on' : ''}" data-act="flag" aria-pressed="${flagged}">${flagged ? 'Marcada para revisar' : 'Marcar para revisar'}</button>
      <button type="button" class="uexam__link" data-act="clear"${r.answers[i] ? '' : ' hidden'}>Borrar respuesta</button></div>
      ${i === d.questions.length - 1 ? '<button type="button" class="uexam__btn uexam__btn--primary" data-act="finish">Entregar prueba</button>' : '<button type="button" class="uexam__btn uexam__btn--primary" data-act="next">Siguiente →</button>'}
    </footer>`;
  typeset(card);
  fitOptions(card);
  paintNav();
  if (focus) { card.focus({preventScroll: true}); const top = card.getBoundingClientRect().top; if (top < 90 || top > innerHeight * .6) scrollTo({top: scrollY + top - 110, behavior: 'smooth'}); }
}
function paintNav() {
  const {p, t, d} = current, r = record(p, t);
  const flags = r.flags || [];
  $$('[data-go]').forEach(b => {
    const j = +b.dataset.go;
    b.classList.toggle('is-answered', !!r.answers[j]);
    b.classList.toggle('is-flagged', flags.includes(j));
    b.classList.toggle('is-current', j === r.cur);
    if (j === r.cur) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
  });
  const answered = Object.keys(r.answers).length;
  const count = $('[data-count]'); if (count) count.textContent = answered;
  const open = $('.uexam__navopen'); if (open) open.textContent = `${open.getAttribute('aria-expanded') === 'true' ? 'Ocultar' : 'Ver'} todas las preguntas · ${answered}/${d.questions.length}`;
}
function answer(letter) {
  const {p, t} = current, r = record(p, t), i = r.cur;
  if (r.answers[i] === letter) delete r.answers[i]; else r.answers[i] = letter;
  setRecord(p, t, r);
  $$('.uexam__opt').forEach(b => { const on = b.dataset.letter === r.answers[i]; b.classList.toggle('is-picked', on); b.setAttribute('aria-checked', on); });
  const clear = $('[data-act=clear]'); if (clear) clear.hidden = !r.answers[i];
  paintNav();
}

// ─── Vista: resultados y revisión ───
async function results(p, t, d) {
  const r = record(p, t);
  const g = grade(d, t, r);
  const n = d.questions.length;
  const stateOf = i => !r.answers[i] ? 'blank' : r.answers[i] === d.answers[i] ? 'right' : 'wrong';
  root.innerHTML = `<a class="uexam__back" href="#${p.id}">← Volver a los exámenes</a>
    <section class="uexam__score">
      <div class="uexam__scoremain"><span class="uexam__kick">${p.title} · ${t.order}</span><h2>${t.name}</h2>
        <p class="uexam__big"><b>${num(g.score)}</b><span>/ ${t.max} puntos</span></p>
        <p class="uexam__when">${r.auto ? '<span class="uexam__timeup">Se acabó el tiempo: la prueba se entregó y calificó automáticamente.</span>' : ''}Entregada el ${when(r.end)} · Tiempo usado: ${span(r.end - r.start)} de 3 h</p>
        <p class="uexam__compare" data-compare></p></div>
      <dl class="uexam__tally"><div class="is-right"><dt>Correctas</dt><dd>${g.right}</dd><small>+${num(g.right * t.correct)}</small></div>
        <div class="is-wrong"><dt>Incorrectas</dt><dd>${g.wrong}</dd><small>${num(g.wrong * t.wrong)}</small></div>
        <div class="is-blank"><dt>En blanco</dt><dd>${g.blank}</dd><small>0</small></div></dl>
    </section>
    <section class="uexam__breakdown"><h3>Por curso</h3><div class="uexam__tablewrap"><table><thead><tr><th>Curso</th><th>Correctas</th><th>Incorrectas</th><th>En blanco</th><th>Puntaje</th></tr></thead><tbody>${
      g.rows.map(x => `<tr><th>${x.name}</th><td>${x.right}</td><td>${x.wrong}</td><td>${x.blank}</td><td>${num(x.score)}</td></tr>`).join('')}</tbody></table></div></section>
    <section class="uexam__review"><header><h3>Revisión pregunta por pregunta</h3>
      <div class="uexam__filters" role="group" aria-label="Filtrar preguntas"><button type="button" data-filter="all" aria-pressed="true">Todas · ${n}</button><button type="button" data-filter="wrong" aria-pressed="false">Incorrectas · ${g.wrong}</button><button type="button" data-filter="blank" aria-pressed="false">En blanco · ${g.blank}</button><button type="button" data-filter="right" aria-pressed="false">Correctas · ${g.right}</button></div></header>
      <div class="uexam__map">${d.questions.map((_, i) => `<button type="button" class="is-${stateOf(i)}" data-jump="${i}" aria-label="Pregunta ${i + 1}: ${({right: 'correcta', wrong: 'incorrecta', blank: 'en blanco'})[stateOf(i)]}">${i + 1}</button>`).join('')}</div>
      <div class="uexam__list">${d.questions.map((_, i) => `<article class="uexam__card uexam__card--review is-${stateOf(i)}" id="uexam-q${i + 1}" data-state="${stateOf(i)}">${questionHTML(d, p, t, i, r.answers[i], true)}</article>`).join('')}</div>
    </section>
    <div class="uexam__again"><a class="uexam__btn uexam__btn--primary" href="#${p.id}">Volver a los exámenes</a><button type="button" class="uexam__btn" data-act="retake" data-test="${t.id}">Volver a rendir esta prueba</button></div>`;
  typeset(root);
  fitOptions(root);
  const s = await loadStats(t);
  const box = $('[data-compare]');
  if (s && box) {
    const rows = s.scoreFrequencies || [], total = rows.reduce((a, x) => a + x.count, 0);
    const below = rows.filter(x => x.score < g.score).reduce((a, x) => a + x.count, 0);
    box.innerHTML = `En el examen real rindieron esta prueba ${num(s.stats.present, 0)} postulantes: el promedio fue <b>${num(s.stats.mean)}</b> y el puntaje más alto, <b>${num(s.stats.maximum)}</b>.${total ? ` Tu puntaje supera al <b>${num(below / total * 100, 0)}&nbsp;%</b> de ellos.` : ''}`;
  }
}

// ─── Enrutado ───
let token = 0;
async function route() {
  const run = ++token;
  settleExpired();
  const [pid, tid] = location.hash.slice(1).split('/');
  const p = PROCESSES.find(x => x.id === pid) || PROCESSES[0];
  const t = p.tests?.find(x => x.id === tid);
  current = null;
  const r = t && record(p, t);
  // Rindiendo o revisando, la cabecera grande de la página sobra: la barra de la prueba ocupa su lugar.
  document.body.classList.toggle('uexam-focus', !!r);
  if (!t || !r) { overview(p); return; }
  root.innerHTML = `<p class="uexam__loading" role="status">Cargando ${t.name}…</p>`;
  let d;
  try { [d] = await Promise.all([loadTest(p, t), ensureKatex()]); } catch {
    cache.delete(p.id + '/' + t.id);
    if (run === token) root.innerHTML = `<p class="uexam__loading" role="alert">No se pudo cargar la prueba. Revisa tu conexión: tus respuestas y tu tiempo siguen guardados.<br><button type="button" class="uexam__btn" data-act="reload">Reintentar</button></p>`;
    return;
  }
  if (run !== token) return;
  if (r.end) await results(p, t, d); else await exam(p, t, d);
}

// ─── Cronómetro ───
function tick() {
  $$('[data-left]').forEach(el => { el.textContent = span(+el.dataset.left - Date.now()); });
  // En la portada, una prueba en curso cuyo tiempo acaba de vencer pasa a «Entregada» sin recargar.
  if (!current) { if ($$('[data-left]').some(el => +el.dataset.left <= Date.now())) route(); return; }
  const {p, t} = current, r = record(p, t);
  if (!r || r.end) return;
  const left = remaining(r);
  const c = $('[data-clock]');
  if (c) {
    c.textContent = clock(left);
    c.parentElement.classList.toggle('is-low', left <= 10 * 60000);
    c.parentElement.classList.toggle('is-critical', left <= 60000);
  }
  const line = $('[data-timeline]'); if (line) line.style.width = `${Math.min(100, (1 - left / DURATION) * 100)}%`;
  if (left <= 0) { finish(p, t, true); route(); }
}
setInterval(tick, 1000);

// ─── Interacción ───
root.addEventListener('click', async e => {
  const el = e.target.closest('[data-act],[data-letter],[data-go],[data-filter],[data-jump]');
  if (!el || el.disabled) return;
  const [pid] = location.hash.slice(1).split('/');
  const p = PROCESSES.find(x => x.id === pid) || PROCESSES[0];
  if (el.dataset.letter && current) return answer(el.dataset.letter);
  if (el.dataset.go && current) { showQuestion(+el.dataset.go); if (matchMedia('(max-width: 980px)').matches) toggleNav(false); return; }
  if (el.dataset.filter) {
    $$('[data-filter]').forEach(b => b.setAttribute('aria-pressed', b === el));
    $$('.uexam__card--review').forEach(a => { a.hidden = el.dataset.filter !== 'all' && a.dataset.state !== el.dataset.filter; });
    return;
  }
  if (el.dataset.jump) {
    const a = $('#uexam-q' + (+el.dataset.jump + 1));
    if (a.hidden) { $$('.uexam__card--review').forEach(x => { x.hidden = false; }); $$('[data-filter]').forEach(b => b.setAttribute('aria-pressed', b.dataset.filter === 'all')); }
    a.scrollIntoView({behavior: 'smooth', block: 'start'});
    return;
  }
  const act = el.dataset.act;
  const t = p.tests?.find(x => x.id === el.dataset.test) || current?.t;
  if (act === 'start') {
    const ok = await confirmBox({title: `¿Empezar ${t.name}?`, body: `Tienes <b>3 horas</b> para responder <b>${t.count} preguntas</b>. El tiempo empieza a correr ahora y no se puede pausar; al llegar a cero la prueba se entrega sola.`, ok: 'Empezar ahora'});
    if (!ok) return;
    setRecord(p, t, {start: Date.now(), answers: {}, flags: [], cur: 0});
    location.hash = `${p.id}/${t.id}`;
  } else if (act === 'retake') {
    const ok = await confirmBox({title: `¿Volver a rendir ${t.name}?`, body: 'Se borrarán tus respuestas y tu puntaje de esta prueba. El cronómetro vuelve a empezar desde 3 horas cuando pulses «Empezar prueba».', ok: 'Borrar y volver a rendir', danger: true});
    if (!ok) return;
    dropRecord(p, t);
    if (location.hash === `#${p.id}`) route(); else location.hash = p.id;
  } else if (act === 'finish' && current) {
    const r = record(current.p, current.t), answered = Object.keys(r.answers).length, n = current.d.questions.length;
    const ok = await confirmBox({title: '¿Entregar la prueba?', body: `Respondiste <b>${answered} de ${n}</b> preguntas${answered < n ? `; las ${n - answered} sin responder valen 0` : ''}. Después de entregar ya no podrás cambiar tus respuestas. Te quedan ${span(remaining(r))}.`, ok: 'Entregar ahora', cancel: 'Seguir resolviendo'});
    if (!ok || !current) return;
    finish(current.p, current.t, false);
    route();
    scrollTo({top: 0});
  } else if (act === 'prev' && current) showQuestion(record(current.p, current.t).cur - 1);
  else if (act === 'next' && current) showQuestion(record(current.p, current.t).cur + 1);
  else if (act === 'clear' && current) { const r = record(current.p, current.t); answer(r.answers[r.cur]); }
  else if (act === 'flag' && current) {
    const r = record(current.p, current.t), f = new Set(r.flags || []);
    f.has(r.cur) ? f.delete(r.cur) : f.add(r.cur);
    r.flags = [...f]; setRecord(current.p, current.t, r);
    el.classList.toggle('is-on', f.has(r.cur)); el.setAttribute('aria-pressed', f.has(r.cur));
    el.textContent = f.has(r.cur) ? 'Marcada para revisar' : 'Marcar para revisar';
    paintNav();
  } else if (act === 'navopen') toggleNav();
  else if (act === 'reload') location.reload();
});
function toggleNav(force) {
  const b = $('.uexam__navopen'); if (!b) return;
  const open = force ?? b.getAttribute('aria-expanded') !== 'true';
  b.setAttribute('aria-expanded', open);
  $('.uexam__nav').classList.toggle('is-open', open);
  paintNav();
}
// Teclado: A–E (o 1–5) marcan, ← y → cambian de pregunta.
document.addEventListener('keydown', e => {
  if (!current || e.ctrlKey || e.metaKey || e.altKey || document.querySelector('dialog[open]')) return;
  if (e.target.closest('input,textarea,select,[contenteditable]')) return;
  const k = e.key.toUpperCase();
  const r = record(current.p, current.t);
  if (!r || r.end) return;
  const idx = LETTERS.indexOf(k) >= 0 ? LETTERS.indexOf(k) : '12345'.indexOf(e.key);
  if (idx >= 0) { e.preventDefault(); answer(LETTERS[idx]); }
  else if (e.key === 'ArrowRight' && r.cur < current.d.questions.length - 1) { e.preventDefault(); showQuestion(r.cur + 1); }
  else if (e.key === 'ArrowLeft' && r.cur > 0) { e.preventDefault(); showQuestion(r.cur - 1); }
});

addEventListener('hashchange', () => { route(); scrollTo({top: 0}); });
route();
