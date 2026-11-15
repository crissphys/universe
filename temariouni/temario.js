/* UNIverse · Temario UNI v4.
   Datos: /temariouni/temario.json (admisión por curso; CEPREUNI Pre, Básico e IEN por semana).
   URL estable: ?vista=admision|cepreuni|actualidad &curso=<id> &ciclo=pre|basico|ien &semana=1..20 (lo desconocido se ignora).
   Fechas en hora de Lima (UTC-5). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var VIEWS = ['admision', 'cepreuni', 'actualidad'], CYCLES = ['pre', 'basico', 'ien'];
  var SEC_SHORT = { mat: 'Matemáticas', cie: 'Ciencias', apt: 'Aptitud y Humanidades' };
  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ICON = {
    chev: '<svg class="t-chev" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4.5v11M4.5 10h11"/></svg>',
    go: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7.5 4.5 13 10l-5.5 5.5"/></svg>',
    out: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 13 13 7M8 7h5v5"/></svg>',
    check: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.25"/><path class="ck" d="m6.8 10.2 2.2 2.2 4.2-4.6"/></svg>',
    back: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4.5 7 10l5.5 5.5"/></svg>'
  };

  var NEWS = [
    { g: 'Perú', items: [
      ['Andina', 'Agencia de noticias del Estado', 'https://andina.pe/agencia/', 'andina'],
      ['El Peruano', 'Diario oficial · normas legales', 'https://www.elperuano.pe/', 'elperuano'],
      ['RPP Noticias', 'Radio y noticias al minuto', 'https://rpp.pe/', 'rpp', 1],
      ['El Comercio', 'Diario nacional', 'https://elcomercio.pe/', 'elcomercio', 1],
      ['La República', 'Diario nacional', 'https://larepublica.pe/', 'larepublica', 1],
      ['Gestión', 'Economía y negocios', 'https://gestion.pe/', 'gestion', 1],
      ['Ojo Público', 'Periodismo de investigación', 'https://ojo-publico.com/', 'ojopublico', 1],
      ['TV Perú Noticias', 'Canal del Estado', 'https://www.tvperu.gob.pe/noticias', 'tvperu', 1]
    ] },
    { g: 'Mundo', items: [
      ['BBC News Mundo', 'Internacional en español', 'https://www.bbc.com/mundo', 'bbc', 1],
      ['Reuters', 'Agencia internacional', 'https://www.reuters.com/', 'reuters', 1],
      ['Associated Press', 'Agencia internacional', 'https://apnews.com/', 'ap', 1],
      ['El País', 'Diario internacional', 'https://elpais.com/america/', 'elpais', 1],
      ['DW Español', 'Internacional en español', 'https://www.dw.com/es/', 'dw', 1],
      ['France 24 Español', 'Internacional en español', 'https://www.france24.com/es/', 'france24', 1],
      ['CNN en Español', 'Internacional en español', 'https://cnnespanol.cnn.com/', 'cnn', 1],
      ['Noticias ONU', 'Organización de las Naciones Unidas', 'https://news.un.org/es/', 'onu', 1]
    ] },
    { g: 'Ciencia y tecnología', items: [
      ['NASA Ciencia', 'Espacio y ciencias de la Tierra', 'https://ciencia.nasa.gov/', 'nasa', 1],
      ['National Geographic', 'Ciencia, historia y ambiente', 'https://www.nationalgeographicla.com/', 'natgeo', 1],
      ['Agencia SINC', 'Ciencia en español', 'https://www.agenciasinc.es/', 'sinc', 1]
    ] }
  ];

  /* ---------- utilidades ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function hl(text, q) {
    if (!q) return esc(text);
    var n = norm(text), i = n.indexOf(q);
    return i < 0 ? esc(text) : esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  }
  function todayIso() { return new Date(Date.now() - 5 * 36e5).toISOString().slice(0, 10); }
  function day(iso, o) { var a = iso.split('-'); return new Date(Date.UTC(+a[0], +a[1] - 1, +a[2], 12)).toLocaleDateString('es-PE', Object.assign({ timeZone: 'UTC' }, o)).replace(/\./g, ''); }
  function daysTo(iso) { return Math.round((Date.parse(iso) - Date.parse(todayIso())) / 864e5); }
  function rangeText(w) { return w[0].slice(5, 7) === w[1].slice(5, 7) ? +w[0].slice(8) + ' al ' + day(w[1], { day: 'numeric', month: 'long' }) : day(w[0], { day: 'numeric', month: 'long' }) + ' al ' + day(w[1], { day: 'numeric', month: 'long' }); }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('uni_temario_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('uni_temario_' + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
  };

  /* ---------- hero: letras ---------- */
  var ci = 0;
  $$('.t-hero h1 .w').forEach(function (w) {
    w.innerHTML = w.textContent.split('').map(function (c) { return '<span class="ch" style="--i:' + (ci++) + '">' + esc(c) + '</span>'; }).join('');
  });
  $('#hero-title').setAttribute('aria-label', 'Temario UNI');

  /* ---------- consola fija y volver arriba ---------- */
  var con = $('#console');
  var sentinel = document.createElement('div'); con.parentNode.insertBefore(sentinel, con);
  new IntersectionObserver(function (e) { con.classList.toggle('is-stuck', !e[0].isIntersecting); }).observe(sentinel);
  var totop = $('.totop');
  if (totop) {
    var onScroll = function () {
      var y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
      totop.classList.toggle('is-on', y > 700); totop.tabIndex = y > 700 ? 0 : -1;
      totop.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(3) : 0);
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    totop.addEventListener('click', function () { scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }); });
  }
  function toContent() { // deja la consola arriba al cambiar de contenido, sin saltos si ya está ahí
    var top = sentinel.getBoundingClientRect().top + scrollY;
    if (scrollY > top) scrollTo({ top: top, behavior: 'auto' });
  }

  var D, S, done = store.get('done', {});
  fetch('/temariouni/temario.json?v=20261115').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) { D = d; init(); })
    .catch(function () { $('#course').innerHTML = '<p class="empty">No se pudo cargar el temario. Recarga la página.</p>'; });

  function courses() { return D.admision.reduce(function (a, s) { return a.concat(s.courses.map(function (c) { c.s = s.id; return c; })); }, []); }
  function course(id) { return courses().filter(function (c) { return c.id === id; })[0]; }
  function cyc() { return D.cepre[S.cycle]; }
  function curWeek(k) {
    var w = D.cepre[k].weeks, t = todayIso();
    for (var i = 0; i < w.length; i++) if (w[i][1] >= t) return i;
    return w.length - 1;
  }
  function nextEval(k) { var t = todayIso(); return D.cepre[k].evals.filter(function (e) { return e.d >= t; })[0] || null; }

  /* ---------- estado ---------- */
  function init() {
    var q = new URLSearchParams(location.search);
    var v = q.get('vista'), c = q.get('curso'), cy = q.get('ciclo'), wk = parseInt(q.get('semana'), 10);
    var all = courses();
    S = {
      view: VIEWS.indexOf(v) >= 0 ? v : (cy || q.get('semana')) ? 'cepreuni' : c ? 'admision' : VIEWS.indexOf(store.get('view')) >= 0 ? store.get('view') : 'admision',
      course: course(c) ? c : course(store.get('course')) ? store.get('course') : all[0].id,
      sort: 'orden', cycle: CYCLES.indexOf(cy) >= 0 ? cy : CYCLES.indexOf(store.get('cycle')) >= 0 ? store.get('cycle') : 'pre',
      range: null, q: '', open: null
    };
    S.sec = course(S.course).s;
    S.wk = wk >= 1 && wk <= 20 ? wk - 1 : curWeek(S.cycle);
    $('#st-adm').textContent = all.reduce(function (a, c) { return a + c.topics.length; }, 0);
    wire();
    setView(S.view, true);
  }
  function syncUrl() {
    var p = new URLSearchParams();
    if (S.view !== 'admision') p.set('vista', S.view);
    if (S.view === 'admision') p.set('curso', S.course);
    if (S.view === 'cepreuni') { p.set('ciclo', S.cycle); if (S.wk !== curWeek(S.cycle)) p.set('semana', S.wk + 1); }
    var s = p.toString();
    history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
  }

  /* ---------- vistas ---------- */
  var PH = { admision: 'Busca un tema: «Leyes de Newton»', cepreuni: '¿En qué semana toca…?' };
  function setView(v, first) {
    S.view = v; store.set('view', v);
    var tabs = $$('#views [role="tab"]');
    $('#views').style.setProperty('--i', VIEWS.indexOf(v));
    tabs.forEach(function (t) { var on = t.dataset.v === v; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    VIEWS.forEach(function (x) {
      var el = $('#v-' + x); el.hidden = x !== v;
      if (x === v && !first && !REDUCED) { el.classList.remove('is-entering'); void el.offsetWidth; el.classList.add('is-entering'); }
    });
    $('#find').hidden = v === 'actualidad';
    $('#q').placeholder = PH[v] || '';
    if (v === 'admision') renderAdm(); else if (v === 'cepreuni') renderCep(); else renderNews();
    syncUrl();
  }

  function wire() {
    var tl = $('#views');
    tl.addEventListener('click', function (e) { var b = e.target.closest('[data-v]'); if (b && b.dataset.v !== S.view) { setView(b.dataset.v); } });
    tl.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var i = (VIEWS.indexOf(S.view) + (e.key === 'ArrowRight' ? 1 : 2)) % 3;
      setView(VIEWS[i]); $$('#views [role="tab"]')[i].focus();
    });

    var q = $('#q'), x = $('#q-x'), t = 0;
    q.addEventListener('input', function () {
      x.hidden = !q.value; clearTimeout(t);
      t = setTimeout(function () { S.q = norm(q.value.trim()); S.view === 'admision' ? paintCourse() : paintWeek(); }, 90);
    });
    $('#find').addEventListener('submit', function (e) { e.preventDefault(); q.blur(); });
    x.addEventListener('click', function () { clearQ(); q.focus(); });
    addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== q && !/input|textarea/i.test(document.activeElement.tagName) && S.view !== 'actualidad') { e.preventDefault(); q.focus(); }
      if (e.key === 'Escape' && document.activeElement === q && q.value) clearQ();
    });

    // Admisión
    $('#secs').addEventListener('click', function (e) {
      var b = e.target.closest('[data-sec]'); if (!b) return;
      S.sec = b.dataset.sec;
      var last = store.get('last_' + S.sec), list = D.admision.filter(function (s) { return s.id === S.sec; })[0].courses;
      pickCourse(list.some(function (c) { return c.id === last; }) ? last : list[0].id);
    });
    function onCourse(e) { var a = e.target.closest('[data-c]'); if (!a) return; e.preventDefault(); pickCourse(a.dataset.c); }
    $('#idx').addEventListener('click', onCourse);
    $('#crs-chips').addEventListener('click', onCourse);
    $('#course').addEventListener('click', function (e) {
      var row = e.target.closest('.t-row'), mk = e.target.closest('.mark'), so = e.target.closest('[data-sort]'), res = e.target.closest('.res[data-c]');
      if (row) {
        var li = row.parentNode, open = !li.hasAttribute('data-open');
        li.toggleAttribute('data-open', open); row.setAttribute('aria-expanded', String(open)); li.querySelector('.t-body-wrap').inert = !open;
      } else if (mk) {
        var tp = mk.closest('.topic'), key = S.course, i = tp.dataset.t, list = done[key] || [];
        var on = list.indexOf(i) < 0;
        done[key] = on ? list.concat(i) : list.filter(function (y) { return y !== i; });
        store.set('done', done);
        tp.classList.toggle('done', on); mk.setAttribute('aria-pressed', String(on));
        mk.querySelector('span').textContent = on ? 'Estudiado' : 'Marcar como estudiado';
        paintProgress(); paintIdx();
      } else if (so) {
        S.sort = so.dataset.sort; paintCourse();
      } else if (res) {
        S.open = res.dataset.t; clearQ(true); pickCourse(res.dataset.c);
      }
    });

    // CEPREUNI
    $('#cycles').addEventListener('click', function (e) {
      var b = e.target.closest('[data-c]'); if (!b || b.dataset.c === S.cycle) return;
      S.cycle = b.dataset.c; store.set('cycle', S.cycle); S.range = null; S.wk = curWeek(S.cycle);
      renderCep(); syncUrl();
    });
    $('#weeks').addEventListener('click', function (e) { var b = e.target.closest('[data-w]'); if (b) goWeek(+b.dataset.w); });
    $('#wk-prev').addEventListener('click', function () { goWeek(S.wk - 1); });
    $('#wk-next').addEventListener('click', function () { goWeek(S.wk + 1); });
    $('#next').addEventListener('click', function (e) {
      var b = e.target.closest('[data-range]'); if (!b) return;
      if (S.range) { S.range = null; } else { var ev = nextEval(S.cycle); S.range = ev; }
      paintNext(); paintWeeks(); paintWeek('fade'); syncUrl();
    });
    $('#week').addEventListener('click', function (e) {
      var r = e.target.closest('.res[data-w]'), x = e.target.closest('[data-unrange]');
      if (r) { clearQ(true); goWeek(+r.dataset.w); }
      if (x) { S.range = null; paintNext(); paintWeeks(); paintWeek('fade'); }
    });
    // Deslizar para cambiar de semana en el teléfono.
    var x0 = 0, y0 = 0, t0 = 0, wkEl = $('#week');
    wkEl.addEventListener('touchstart', function (e) { var p = e.touches[0]; x0 = p.clientX; y0 = p.clientY; t0 = Date.now(); }, { passive: true });
    wkEl.addEventListener('touchend', function (e) {
      if (S.q || S.range) return;
      var p = e.changedTouches[0], dx = p.clientX - x0, dy = p.clientY - y0, v = Math.abs(dx) / Math.max(1, Date.now() - t0);
      if (Math.abs(dx) > Math.abs(dy) * 1.6 && (Math.abs(dx) > 60 || v > 0.5)) goWeek(S.wk + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }
  function clearQ(silent) {
    var q = $('#q'); q.value = ''; S.q = ''; $('#q-x').hidden = true; $('#q-count').textContent = '';
    if (!silent) S.view === 'admision' ? paintCourse() : paintWeek();
  }

  /* ---------- Admisión ---------- */
  function renderAdm() { paintSecs(); paintIdx(); paintChips(); paintCourse(); }
  function pickCourse(id) {
    S.course = id; S.sec = course(id).s; store.set('course', id); store.set('last_' + S.sec, id); S.sort = 'orden';
    paintSecs(); paintIdx(); paintChips(); paintCourse(true); syncUrl(); toContent();
  }
  function paintSecs() {
    $('#secs').innerHTML = D.admision.map(function (s) {
      return '<button type="button" class="sec" data-s="' + s.id + '" data-sec="' + s.id + '" aria-pressed="' + (s.id === S.sec) + '">' + esc(s.name) + '<i>' + s.courses.length + '</i></button>';
    }).join('');
  }
  function doneCount(c) { var l = done[c.id] || []; return c.topics.filter(function (t, i) { return l.indexOf(String(i)) >= 0; }).length; }
  function paintIdx() {
    $('#idx').innerHTML = D.admision.map(function (s) {
      return '<div class="idx-g" data-s="' + s.id + '"><h3>' + esc(SEC_SHORT[s.id]) + '</h3>' + s.courses.map(function (c) {
        var n = doneCount(c);
        return '<a href="?curso=' + c.id + '" data-c="' + c.id + '"' + (c.id === S.course ? ' aria-current="page"' : '') + '>' + esc(c.name) +
          '<b class="' + (n && n === c.topics.length ? 'full' : '') + '">' + (n ? n + '/' : '') + c.topics.length + '</b></a>';
      }).join('') + '</div>';
    }).join('');
  }
  function paintChips() {
    var s = D.admision.filter(function (x) { return x.id === S.sec; })[0];
    var box = $('#crs-chips');
    box.innerHTML = s.courses.map(function (c) {
      return '<button type="button" class="chip" data-c="' + c.id + '" aria-pressed="' + (c.id === S.course) + '">' + esc(c.name) + '<i>' + c.topics.length + '</i></button>';
    }).join('');
    var on = box.querySelector('[aria-pressed="true"]');
    if (on) box.scrollLeft = on.offsetLeft - (box.clientWidth - on.offsetWidth) / 2;
  }
  function paintProgress() {
    var c = course(S.course), n = doneCount(c), el = $('#c-prog');
    if (!el) return;
    el.querySelector('.bar i').style.setProperty('--p', (n / c.topics.length).toFixed(3));
    el.querySelector('.lbl').textContent = n + ' de ' + c.topics.length + ' estudiados';
  }
  function freqHtml(f) { return '<span class="freq" data-f="' + f + '" aria-hidden="true"><i></i><i></i><i></i></span>'; }
  function paintCourse(anim) {
    var box = $('#course');
    if (S.q) return paintAdmSearch(box);
    $('#q-count').textContent = '';
    var c = course(S.course), list = done[c.id] || [], hasF = c.topics.some(function (t) { return t.f; });
    if (!hasF) S.sort = 'orden';
    var rows = c.topics.map(function (t, i) { return { t: t, i: i }; });
    if (S.sort === 'freq') rows.sort(function (a, b) { return b.t.f - a.t.f || a.i - b.i; });
    var head = '<div class="c-head" data-s="' + c.s + '"><h2>' + esc(c.name) + '</h2><div class="c-meta">' +
      '<p class="c-prog" id="c-prog"><span class="bar"><i></i></span><span class="lbl"></span></p>' +
      (hasF ? '<div class="sort" role="group" aria-label="Orden"><button type="button" data-sort="orden" aria-pressed="' + (S.sort === 'orden') + '">Temario</button><button type="button" data-sort="freq" aria-pressed="' + (S.sort === 'freq') + '">Más preguntados</button></div>' : '') +
      '</div></div>';
    var body = '<ol class="topics">' + rows.map(function (r, k) {
      var t = r.t, id = String(r.i), isDone = list.indexOf(id) >= 0, open = S.open === id;
      var tag = t.f >= 2 ? '<span class="freq-tag">' + freqHtml(t.f) + '<span>' + (t.f === 3 ? 'Muy preguntado' : 'Frecuente') + '</span></span>' : t.f ? '<span class="freq-tag">' + freqHtml(t.f) + '</span>' : '<span></span>';
      var concepts = t.c.length ? '<ul class="concepts">' + t.c.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '';
      return '<li class="topic' + (isDone ? ' done' : '') + (anim && !REDUCED ? ' in' : '') + '" data-t="' + id + '" style="--k:' + k + '"' + (open ? ' data-open' : '') + '>' +
        '<button type="button" class="t-row" aria-expanded="' + open + '"><span class="t-num">' + String(r.i + 1).padStart(2, '0') + '</span><span class="t-title">' + esc(t.t) + '</span>' + tag + ICON.chev + '</button>' +
        '<div class="t-body-wrap"' + (open ? '' : ' inert') + '><div class="t-in"><div class="t-detail">' + concepts +
        '<button type="button" class="mark" aria-pressed="' + isDone + '">' + ICON.check + '<span>' + (isDone ? 'Estudiado' : 'Marcar como estudiado') + '</span></button>' +
        '</div></div></div></li>';
    }).join('') + '</ol>';
    box.innerHTML = head + body;
    paintProgress();
    if (S.open != null) {
      var el = box.querySelector('[data-t="' + S.open + '"]'); S.open = null;
      if (el) requestAnimationFrame(function () { el.scrollIntoView({ block: 'center', behavior: REDUCED ? 'auto' : 'smooth' }); });
    }
  }
  function paintAdmSearch(box) {
    var q = S.q, groups = [], n = 0;
    D.admision.forEach(function (s) {
      s.courses.forEach(function (c) {
        var hits = [];
        c.topics.forEach(function (t, i) {
          var inT = norm(t.t).indexOf(q) >= 0, sub = inT ? null : t.c.filter(function (x) { return norm(x).indexOf(q) >= 0; })[0];
          if (inT || sub) hits.push({ t: t, i: i, sub: sub });
        });
        if (hits.length) { n += hits.length; groups.push({ c: c, s: s.id, hits: hits }); }
      });
    });
    $('#q-count').textContent = n || '';
    box.innerHTML = n ? '<p class="res-head">' + n + (n === 1 ? ' tema' : ' temas') + ' en ' + groups.length + (groups.length === 1 ? ' curso' : ' cursos') + '</p>' + groups.map(function (g) {
      return '<div class="res-g" data-s="' + g.s + '"><h3>' + esc(g.c.name) + '</h3>' + g.hits.map(function (h) {
        return '<button type="button" class="res" data-c="' + g.c.id + '" data-t="' + h.i + '"><b>' + String(h.i + 1).padStart(2, '0') + '</b><span><em class="rt">' + hl(h.t.t, q) + '</em>' + (h.sub ? '<small>' + hl(h.sub, q) + '</small>' : '') + '</span>' + ICON.go + '</button>';
      }).join('') + '</div>';
    }).join('') : '<p class="empty">Ningún tema coincide con «' + esc($('#q').value.trim()) + '».</p>';
  }

  /* ---------- CEPREUNI ---------- */
  function renderCep() {
    var seg = $('#cycles');
    seg.style.setProperty('--i', CYCLES.indexOf(S.cycle));
    $$('button', seg).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.c === S.cycle)); });
    $('#cyc-title').textContent = cyc().title;
    paintNext(); paintWeeks(); paintWeek();
  }
  function paintNext() {
    var ev = nextEval(S.cycle), el = $('#next');
    if (!ev) { el.innerHTML = '<div><p class="k">' + esc(cyc().title) + '</p><h2>Ciclo terminado</h2></div>'; return; }
    var d = daysTo(ev.d), when = d <= 0 ? 'Hoy' : d === 1 ? 'Mañana' : 'En ' + d + ' días';
    var r = ev.r[0] === ev.r[1] ? 'semana ' + ev.r[0] : 'semanas ' + ev.r[0] + ' a ' + ev.r[1];
    el.innerHTML = '<div><p class="k">Siguiente evaluación</p><h2>' + esc(ev.n) + '</h2><p class="d"><b>' + when + '</b> · ' + esc(day(ev.d, { weekday: 'long', day: 'numeric', month: 'long' })) + ' · entran ' + r + '</p></div>' +
      '<button type="button" class="btn' + (S.range ? ' ghost' : '') + '" data-range>' + (S.range ? 'Volver a la semana' : 'Ver lo que entra') + '</button>';
  }
  function paintWeeks() {
    var c = cyc(), now = curWeek(S.cycle), t = todayIso(), html = '';
    c.weeks.forEach(function (w, i) {
      var inr = S.range && i + 1 >= S.range.r[0] && i + 1 <= S.range.r[1];
      var cls = 'wk' + (i === now && w[0] <= t ? ' now' : '') + (w[1] < t ? ' past' : '') + (inr ? ' inr' : '');
      html += '<button type="button" class="' + cls + '" data-w="' + i + '" aria-pressed="' + (!S.range && i === S.wk) + '" aria-label="Semana ' + (i + 1) + ', ' + esc(rangeText(w)) + '"><b>' + (i + 1) + '</b><small>' + esc(day(w[0], { day: 'numeric', month: 'short' })) + '</small></button>';
      var nx = c.weeks[i + 1];
      c.evals.forEach(function (e) { if (e.d > w[1] && (!nx || e.d < nx[0])) html += '<span class="wk-ev" title="' + esc(e.n + ', ' + day(e.d, { day: 'numeric', month: 'short' })) + '"></span>'; });
    });
    var box = $('#weeks'); box.innerHTML = html;
    $('#wk-prev').disabled = S.wk <= 0 || !!S.range; $('#wk-next').disabled = S.wk >= c.weeks.length - 1 || !!S.range;
    var on = box.querySelector('[aria-pressed="true"]') || box.querySelector('.inr');
    if (on) box.scrollTo({ left: on.offsetLeft - (box.clientWidth - on.offsetWidth) / 2, behavior: REDUCED ? 'auto' : 'smooth' });
  }
  function goWeek(i) {
    var c = cyc(); if (i < 0 || i >= c.weeks.length) return;
    var dir = i > S.wk ? 'l' : 'r'; S.wk = i; S.range = null;
    paintNext(); paintWeeks(); paintWeek(dir); syncUrl();
  }
  function bySection(list) {
    return D.sections.map(function (s) { return { s: s, items: list.filter(function (x) { return x.c.s === s.id; }) }; }).filter(function (g) { return g.items.length; });
  }
  function paintWeek(dir) {
    var c = cyc(), box = $('#week');
    if (S.q) return paintCepSearch(box);
    $('#q-count').textContent = '';
    var head, items;
    if (S.range) {
      var a = S.range.r[0] - 1, b = S.range.r[1];
      head = '<div class="w-head"><h2>' + esc(S.range.n) + '</h2><p>Semanas ' + (a + 1) + ' a ' + b + '</p><button type="button" class="btn ghost x" data-unrange>' + ICON.back + 'Semana ' + (S.wk + 1) + '</button></div>';
      items = c.courses.map(function (co) {
        var li = []; for (var w = a; w < b; w++) co.w[w].forEach(function (t) { li.push({ w: w, t: t }); });
        return { c: co, li: li };
      }).filter(function (x) { return x.li.length; });
    } else {
      var w = c.weeks[S.wk], isNow = S.wk === curWeek(S.cycle) && w[0] <= todayIso();
      head = '<div class="w-head"><h2>Semana ' + (S.wk + 1) + '</h2><p>' + esc(rangeText(w)) + '</p>' + (isNow ? '<span class="tag">Esta semana</span>' : '') + '</div>';
      items = c.courses.map(function (co) { return { c: co, li: co.w[S.wk].map(function (t) { return { w: S.wk, t: t }; }) }; }).filter(function (x) { return x.li.length; });
    }
    var k = 0, anim = dir && !REDUCED;
    var body = items.length ? bySection(items).map(function (g) {
      return '<section class="w-sec" data-s="' + g.s.id + '"><h3>' + esc(g.s.name) + '</h3><div class="w-grid">' + g.items.map(function (x) {
        return '<article class="w-card' + (anim ? ' in' : '') + '" style="--k:' + (k++) + '"><h4>' + esc(x.c.name) + '</h4><ul>' + x.li.map(function (y) {
          return '<li>' + (S.range ? '<small>S' + (y.w + 1) + '</small>' : '') + esc(y.t) + '</li>';
        }).join('') + '</ul></article>';
      }).join('') + '</div></section>';
    }).join('') : '<p class="empty">Semana de repaso. No hay temas nuevos.</p>';
    box.innerHTML = head + '<div class="w-body' + (dir === 'l' || dir === 'r' ? (REDUCED ? '' : ' slide-' + dir) : '') + '">' + body + '</div>';
  }
  function paintCepSearch(box) {
    var q = S.q, c = cyc(), hits = [];
    c.courses.forEach(function (co) { co.w.forEach(function (ts, w) { ts.forEach(function (t) { if (norm(t).indexOf(q) >= 0 || norm(co.name).indexOf(q) === 0) hits.push({ co: co, w: w, t: t }); }); }); });
    hits.sort(function (a, b) { return a.w - b.w; });
    $('#q-count').textContent = hits.length || '';
    box.innerHTML = hits.length ? '<p class="res-head">' + hits.length + (hits.length === 1 ? ' resultado' : ' resultados') + ' en ' + esc(c.title) + '</p><div class="res-g">' + hits.slice(0, 120).map(function (h) {
      return '<button type="button" class="res" data-w="' + h.w + '"><b>S' + (h.w + 1) + '</b><span><em class="rt">' + hl(h.t, q) + '</em><small>' + esc(h.co.name) + ' · ' + esc(rangeText(c.weeks[h.w])) + '</small></span>' + ICON.go + '</button>';
    }).join('') + '</div>' : '<p class="empty">Ningún tema de ' + esc(c.title) + ' coincide con «' + esc($('#q').value.trim()) + '».</p>';
  }

  /* ---------- Actualidad ---------- */
  function renderNews() {
    var box = $('#news'); if (box.dataset.ok) return;
    var k = 0;
    box.innerHTML = '<div class="n-head"><h2>Actualidad</h2><p>Medios confiables para seguir lo que pasa en el Perú y el mundo.</p></div>' + NEWS.map(function (g) {
      return '<section class="n-g"><h3>' + esc(g.g) + '</h3><div class="n-grid">' + g.items.map(function (n) {
        return '<a class="n-card' + (REDUCED ? '' : ' in') + '" style="--k:' + (k++) + '" href="' + n[2] + '" target="_blank" rel="noopener noreferrer">' +
          '<span class="n-logo' + (n[4] ? ' full' : '') + '"><img src="/temariouni/logos/' + n[3] + '.png" alt="" width="48" height="48" loading="lazy" decoding="async"></span>' +
          '<span><b>' + esc(n[0]) + '</b><small>' + esc(n[1]) + '</small></span>' + ICON.out + '<span class="sr-only">(se abre en una pestaña nueva)</span></a>';
      }).join('') + '</div></section>';
    }).join('');
    box.dataset.ok = '1';
  }
})();
