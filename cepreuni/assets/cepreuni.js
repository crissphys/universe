/* UNIverse · CEPREUNI v4.1 — hub del ciclo.
   Datos: /cepreuni-2027-data.js (ciclos, evaluaciones, horarios) y /cepreuni/data/semanas.js (semanas y temas).
   Todas las fechas y horas se calculan en hora de Lima (UTC-5, sin horario de verano).
   URL estable: ?ciclo=pre|basico|ien &semana=1..20 &vista=curso|dia (cada valor se valida; lo desconocido se ignora). */
(function () {
  'use strict';
  var DATA = window.UNIVERSE_CEPREUNI_2027, WK = window.UNIVERSE_CEPREUNI_WEEKS;
  var DAY = 864e5, HOUR = 36e5, LIVE = 3 * HOUR, LIMA = -5 * HOUR;
  var CYCLES = { pre: 'preuniversitario', basico: 'basico', ien: 'ien' };
  var TITLES = { pre: '2027-1', basico: '2027-1', ien: 'IEN 2027' };
  var TIMED = { pre: true }; // solo el cronograma Pre publica hora: 9:00 a. m.
  var DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  var SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  var BASE = ['algebra', 'aritmetica', 'geometria', 'trigonometria', 'fisica', 'quimica'], KEYS = ['alg', 'ari', 'geo', 'tri', 'fis', 'qui'];
  var ORDER = ['aritmetica', 'algebra', 'geometria', 'trigonometria', 'fisica', 'quimica', 'razonamiento verbal', 'humanidades'];
  var HUM = [['lit', 'Literatura'], ['fil', 'Filosofía'], ['rv', 'Raz. Verbal'], ['len', 'Lenguaje'], ['ing', 'Inglés'], ['his', 'Historia'], ['eco', 'Economía'], ['geo', 'Geografía'], ['psi', 'Psicología']];

  /* ---------- lógica pura (se prueba en tools/test-cepreuni-hub.mjs) ---------- */
  function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function norm(s) { return String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  function parseDay(s) { var a = s.split('-'); return Date.UTC(+a[0], +a[1] - 1, +a[2]); }
  function limaIso(ms) { return new Date(ms + LIMA).toISOString().slice(0, 10); }
  function addDays(iso, n) { return new Date(parseDay(iso) + n * DAY).toISOString().slice(0, 10); }
  function diffDays(a, b) { return Math.round((parseDay(b) - parseDay(a)) / DAY); }
  function dow(iso) { return new Date(parseDay(iso) + 12 * HOUR).getUTCDay(); }
  function longDate(iso, o) { return new Date(parseDay(iso) + 12 * HOUR).toLocaleDateString('es-PE', Object.assign({ timeZone: 'UTC' }, o)); }
  function dash(s) { return String(s == null ? '' : s).replace(/–/g, '-'); }
  function eventsFor(key) {
    var timed = !!TIMED[key];
    return DATA.cycles[CYCLES[key]].evaluations.map(function (e) {
      return { date: e.date, name: e.name, mode: e.mode, timed: timed, start: parseDay(e.date) + (timed ? 14 : 5) * HOUR };
    });
  }
  function isDone(e, now) { return e.timed ? now >= e.start + LIVE : e.date < limaIso(now); }
  function summarize(evs, now) {
    var done = 0, next = null;
    evs.forEach(function (e) { if (isDone(e, now)) done++; else if (!next) next = e; });
    return { done: done, total: evs.length, next: next };
  }
  function relative(e, now) {
    if (isDone(e, now)) return 'Hecha';
    var d = diffDays(limaIso(now), e.date);
    return d <= 0 ? 'Hoy' : d === 1 ? 'Mañana' : 'En ' + d + ' días';
  }
  function minutes(t) { var m = /^(\d\d):(\d\d)\D+(\d\d):(\d\d)/.exec(t); return m ? [+m[1] * 60 + +m[2], +m[3] * 60 + +m[4]] : [0, 0]; }
  function mark(sessions, mins) {
    var seenNext = false;
    return sessions.map(function (s) {
      var r = minutes(s.time), st = mins >= r[0] && mins < r[1] ? 'now' : mins < r[0] ? (seenNext ? 'later' : (seenNext = true, 'next')) : 'past';
      return { s: s, st: st };
    });
  }
  function courseKey(n) {
    n = norm(n);
    for (var i = 0; i < BASE.length; i++) if (n.indexOf(BASE[i]) === 0) return KEYS[i]; // «Álgebra (RM)» comparte color con Álgebra
    return 'hum'; // Humanidades y Razonamiento verbal
  }
  // Semana en curso: la primera que aún no terminó (domingo y recesos apuntan a la siguiente).
  function weekIndex(key, now) {
    var w = WK.cycles[key].weeks, today = limaIso(now);
    for (var i = 0; i < w.length; i++) if (w[i][1] >= today) return i;
    return w.length - 1;
  }
  function weekIndexOfDate(key, iso) { return weekIndex(key, parseDay(iso) - LIMA); }
  function topicsFor(key, ck, w) {
    var s = key === 'pre' && WK.silabo.pre[ck];
    return s && s[w] ? s[w] : null;
  }
  function humFor(key, w) {
    if (key !== 'pre') return [];
    return HUM.map(function (h) { return { n: h[1], t: WK.silabo.pre.hum[h[0]][w] }; });
  }
  // Cursos del ciclo con los días en que se dictan (no depende de turno ni de módulo).
  function courseRows(key) {
    var c = DATA.cycles[CYCLES[key]], map = {}, order = [];
    Object.keys(c.schedule).forEach(function (t) {
      var mods = c.schedule[t].modules;
      Object.keys(mods).forEach(function (m) {
        mods[m].forEach(function (day, di) {
          day.sessions.forEach(function (s) {
            if (!map[s.course]) { map[s.course] = { name: s.course, k: courseKey(s.course), days: [] }; order.push(s.course); }
            if (map[s.course].days.indexOf(di + 1) < 0) map[s.course].days.push(di + 1);
          });
        });
      });
    });
    function rank(n) { var i = ORDER.indexOf(norm(n.replace(/\s*\(RM\)/, ''))); return (i < 0 ? 99 : i) + (/\(RM\)/.test(n) ? .5 : 0); }
    return order.map(function (n) { var r = map[n]; r.days.sort(); return r; }).sort(function (a, b) { return rank(a.name) - rank(b.name); });
  }
  function daysText(d) {
    if (d.length === 6) return 'Lun a Sáb';
    var n = d.map(function (x) { return SHORT[x - 1]; });
    return n.length < 3 ? n.join(' y ') : n.slice(0, -1).join(', ') + ' y ' + n[n.length - 1];
  }
  function rangeText(w) {
    var a = w[0].split('-'), b = w[1].split('-');
    return a[1] === b[1] ? +a[2] + ' al ' + longDate(w[1], { day: 'numeric', month: 'long' }) : longDate(w[0], { day: 'numeric', month: 'long' }) + ' al ' + longDate(w[1], { day: 'numeric', month: 'long' });
  }
  // Avisos de una semana: los de sus días y los de recuperación que caen justo después.
  function weekNotes(key, w) {
    var c = WK.cycles[key], rangeEnd = c.weeks[w + 1] ? c.weeks[w + 1][0] : '9999', a = c.weeks[w][0], b = c.weeks[w][1];
    return Object.keys(c.days).sort().filter(function (d) { return d >= a && d < rangeEnd; }).map(function (d) { return { date: d, k: c.days[d].k, t: c.days[d].t, after: d > b }; });
  }
  function initial(search, stored, now) {
    var q = new URLSearchParams(search), c = q.get('ciclo');
    var cycle = c && has(CYCLES, c) ? c : stored && has(CYCLES, stored) ? stored : 'pre';
    var n = parseInt(q.get('semana'), 10), len = WK.cycles[cycle].weeks.length;
    return { cycle: cycle, wk: n >= 1 && n <= len ? n - 1 : weekIndex(cycle, now), view: q.get('vista') === 'dia' ? 'dia' : 'curso' };
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function icsText(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
  function buildIcs(evs, key, stamp) {
    var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//UNIverse to Study//CEPREUNI//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
    evs.forEach(function (e) {
      var s = e.date.replace(/-/g, ''), n = addDays(e.date, 1).replace(/-/g, '');
      L.push('BEGIN:VEVENT', 'UID:' + key + '-' + s + '@universetostudy.com', 'DTSTAMP:' + stamp, 'DTSTART;VALUE=DATE:' + s, 'DTEND;VALUE=DATE:' + n,
        'SUMMARY:' + icsText('CEPREUNI · ' + e.name),
        'DESCRIPTION:' + icsText('Modalidad: ' + e.mode + '.' + (e.timed ? ' Hora: 9:00 a. m. (Lima).' : '')),
        'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsText('Mañana: ' + e.name), 'TRIGGER;RELATED=START:-PT15H', 'END:VALARM', 'END:VEVENT');
    });
    L.push('END:VCALENDAR');
    return L.join('\r\n') + '\r\n';
  }
  window.UNIVERSE_CEPREUNI_HUB = { eventsFor: eventsFor, summarize: summarize, relative: relative, mark: mark, courseKey: courseKey, buildIcs: buildIcs, limaIso: limaIso, diffDays: diffDays, weekIndex: weekIndex, weekIndexOfDate: weekIndexOfDate, topicsFor: topicsFor, humFor: humFor, courseRows: courseRows, daysText: daysText, rangeText: rangeText, weekNotes: weekNotes, initial: initial };

  /* ---------- interfaz ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  if (!$('#hoy')) return;
  if (!DATA || !DATA.cycles || !WK) { $('#hoy').innerHTML = '<p class="today-msg">No se pudo cargar el cronograma. Recarga la página.</p>'; return; }

  var RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  var store = {
    get: function (k) { try { return localStorage.getItem('uni_cepre_' + k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem('uni_cepre_' + k, v); } catch (e) { /* sin almacenamiento */ } }
  };
  var nowL = new Date(Date.now() + LIMA);
  var S = initial(location.search, store.get('cycle'), Date.now());
  S.turn = store.get('turn') === 'afternoon' || store.get('turn') === 'morning' ? store.get('turn') : (nowL.getUTCHours() >= 14 ? 'afternoon' : 'morning');
  S.mod = store.get('mod') === 'module2' ? 'module2' : 'module1';
  S.day = nowL.getUTCDay() >= 1 ? nowL.getUTCDay() : 1; // domingo: lunes
  S.showDone = false;
  var ICON = {
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M12 13v4M10 15h4"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
    down: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
    ic: {
      target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
      exam: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
      timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',
      book: '<path d="M2 5h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2zM22 5h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/>',
      calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
      users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14a6 6 0 0 1 3.5 5.5"/>',
      plan: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4m-7 12 2 2 4-4"/>',
      play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z"/>',
      room: '<path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 9h5a1 1 0 0 1 1 1v11M2 21h20M8 8h2M8 12h2M8 16h2"/>',
      info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
      rank: '<path d="M5 21V11M12 21V4M19 21v-7"/>'
    }
  };
  function svg(name) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON.ic[name] + '</svg>'; }
  function swap(el, dx) {
    if (!el || !el.animate) return;
    el.getAnimations().forEach(function (a) { a.cancel(); });
    el.animate([{ opacity: 0, transform: RM.matches ? 'none' : 'translateX(' + (dx || 0) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: RM.matches ? 120 : 200, easing: 'cubic-bezier(.23,1,.32,1)' });
  }
  function download(name, text) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/calendar;charset=utf-8' }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 600);
  }
  function stamp() { return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''); }
  function cycleData() { return DATA.cycles[CYCLES[S.cycle]]; }
  function schedule() {
    var c = cycleData(), sh = c.schedule[S.turn] || c.schedule.morning;
    var mods = Object.keys(sh.modules), mod = sh.modules[S.mod] ? S.mod : 'module1';
    return { c: c, sh: sh, mods: mods, mod: mod, days: sh.modules[mod] };
  }
  function curWeek() { return weekIndex(S.cycle, Date.now()); }
  function syncUrl() {
    var q = new URLSearchParams();
    if (S.cycle !== 'pre') q.set('ciclo', S.cycle);
    if (S.wk !== curWeek()) q.set('semana', S.wk + 1);
    if (S.view === 'dia') q.set('vista', 'dia');
    try { history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash); } catch (e) { /* file:// */ }
  }

  /* fila de clase: hora, curso, temas de la semana y estado */
  function trow(m, w, withTag) {
    var k = courseKey(m.s.course), tp = k === 'hum' ? null : topicsFor(S.cycle, k, w);
    var sub = tp ? tp.join(' · ') : dash(m.s.note || '');
    var tag = withTag && (m.st === 'now' || m.st === 'next') ? '<span class="tag">' + (m.st === 'now' ? 'Ahora' : 'Próxima') + '</span>' : '';
    return '<li class="trow" data-k="' + k + '" data-st="' + (withTag ? m.st : 'plain') + '"><time>' + esc(dash(m.s.time)) + '</time><div class="crs-n"><strong>' + esc(m.s.course) + '</strong>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</div>' + tag + '</li>';
  }

  /* ---------- ciclo ---------- */
  var seg = $('#cycle');
  function paintSeg() {
    seg.style.setProperty('--i', Object.keys(CYCLES).indexOf(S.cycle));
    $$('button', seg).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.c === S.cycle)); });
    $('#title-em').textContent = TITLES[S.cycle];
  }
  seg.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-c]'); if (!b || b.dataset.c === S.cycle) return;
    S.cycle = b.dataset.c; S.showDone = false; S.wk = curWeek();
    store.set('cycle', S.cycle);
    paintSeg(); renderAll(true); syncUrl();
  });

  /* ---------- siguiente evaluación ---------- */
  var next = $('#next'), evs = [], timer = 0, shown = null, lastText = '', srLast = '';
  function unit(n, label) { return '<span class="u"><b>' + n + '</b><i>' + label + '</i></span>'; }
  function p2(n) { return n < 10 ? '0' + n : String(n); }
  function paintNext(animate) {
    var now = Date.now(), sum = summarize(evs, now);
    var steps = evs.map(function (e, i) {
      var st = isDone(e, now) ? 'done' : e === sum.next ? 'next' : 'todo';
      return '<li data-s="' + st + '" style="--j:' + i + '" title="' + esc(e.name + ', ' + longDate(e.date, { day: 'numeric', month: 'short' })) + '"></li>';
    }).join('');
    shown = sum.next; lastText = ''; srLast = '';
    if (!sum.next) {
      next.innerHTML = '<p class="k">Ciclo ' + esc(cycleData().shortTitle) + '</p><div class="next-end"><h2 class="next-name">Todas las evaluaciones ya pasaron</h2><p>Revisa tu puesto y los cortes de ingreso.</p></div>' +
        '<div class="actions"><a class="btn" href="/ranking' + (S.cycle === 'basico' ? '?sede=basico' : '') + '">Ver ranking ' + ICON.arrow + '</a></div>';
    } else {
      var e = sum.next;
      next.innerHTML =
        '<p class="k">Siguiente evaluación</p><h2 class="next-name">' + esc(e.name) + '</h2>' +
        '<p class="next-date">' + esc(longDate(e.date, { weekday: 'long', day: 'numeric', month: 'long' })) + (e.timed ? ', 9:00 a. m.' : '') + ' <span class="chip">' + esc(e.mode) + '</span></p>' +
        '<div class="count" id="count" aria-hidden="true"></div><span class="sr" id="count-sr" role="status"></span>' +
        '<div class="steps"><ol style="--n:' + evs.length + '" aria-hidden="true">' + steps + '</ol><p class="steps-sum"><b>' + sum.done + '</b> de ' + sum.total + ' evaluaciones hechas</p></div>' +
        '<div class="actions"><button type="button" class="btn" id="add-next">' + ICON.cal + 'Añadir al calendario</button></div>';
      $('#add-next').addEventListener('click', function () { addEvents([e], this, 'Añadido'); });
      tick();
    }
    if (animate) swap(next, 0);
  }
  function tick() {
    if (!shown) return;
    var now = Date.now(), el = $('#count'); if (!el) return;
    var out, sr, e = shown;
    if (e.timed) {
      var left = e.start - now;
      if (left <= 0) { out = '<span class="u"><b>En curso</b></span>'; sr = e.name + ' está en curso'; el.classList.add('is-text'); }
      else {
        var s = Math.floor(left / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
        out = (d ? unit(d, d === 1 ? 'día' : 'días') : '') + unit(p2(h), 'h') + unit(p2(m), 'min') + unit(p2(s % 60), 's');
        sr = 'Faltan ' + (d ? d + ' días, ' : '') + h + ' horas y ' + m + ' minutos para ' + e.name;
        el.classList.remove('is-text');
      }
    } else {
      var n = diffDays(limaIso(now), e.date);
      el.classList.toggle('is-text', n <= 1);
      out = n <= 0 ? '<span class="u"><b>Hoy</b></span>' : n === 1 ? '<span class="u"><b>Mañana</b></span>' : unit(n, 'días');
      sr = n <= 0 ? e.name + ' es hoy' : n === 1 ? e.name + ' es mañana' : 'Faltan ' + n + ' días para ' + e.name;
    }
    if (out !== lastText) { el.innerHTML = out; lastText = out; }
    var srEl = $('#count-sr'); if (srEl && sr !== srLast) { srLast = sr; srEl.textContent = sr; } // sin segundos: se anuncia 1 vez por minuto
    if (e.timed && now >= e.start + LIVE) { clearInterval(timer); renderAll(true); }
  }
  function addEvents(list, btn, doneLabel) {
    download(list.length > 1 ? 'cepreuni-' + S.cycle + '-cronograma.ics' : 'cepreuni-' + S.cycle + '-' + list[0].date + '.ics', buildIcs(list, S.cycle, stamp()));
    if (!btn) return;
    var html = btn.innerHTML;
    btn.classList.add('ok'); btn.innerHTML = ICON.check + doneLabel;
    setTimeout(function () { btn.classList.remove('ok'); btn.innerHTML = html; }, 1800);
  }

  /* ---------- hoy ---------- */
  function paintToday(animate) {
    var el = $('#today'), now = Date.now(), L = new Date(now + LIMA), iso = limaIso(now), mins = L.getUTCHours() * 60 + L.getUTCMinutes();
    var sc = schedule(), notes = WK.cycles[S.cycle].days, d = dow(iso), body, head = 'Hoy', showIso = iso, rows = null, msg = '';
    function dayRows(i, m) {
      var n = dow(i); if (n === 0) return null;
      var ss = sc.days[n - 1].sessions; return m == null ? ss.map(function (s) { return { s: s, st: 'plain' }; }) : mark(ss, m);
    }
    if (iso < sc.c.startDate) { msg = 'Las clases inician el ' + longDate(sc.c.startDate, { day: 'numeric', month: 'long' }) + '.'; }
    else if (notes[iso] && notes[iso].k !== 'virtual') { msg = notes[iso].t; }
    else {
      rows = dayRows(iso, mins);
      if (!rows || rows.every(function (r) { return r.st === 'past'; })) {
        showIso = addDays(iso, dow(addDays(iso, 1)) === 0 ? 2 : 1);
        head = showIso === addDays(iso, 1) ? 'Mañana' : longDate(showIso, { weekday: 'long' });
        rows = dayRows(showIso, null);
        if (notes[showIso] && notes[showIso].k !== 'virtual') { msg = notes[showIso].t; rows = null; }
      }
    }
    var w = weekIndexOfDate(S.cycle, showIso);
    var virtual = notes[showIso] && notes[showIso].k === 'virtual' ? '<p class="today-msg">' + esc(notes[showIso].t) + '</p>' : '';
    body = rows ? '<ul class="trows">' + rows.map(function (m) { return trow(m, w, head === 'Hoy'); }).join('') + '</ul>' + virtual : '<p class="today-msg">' + esc(msg) + '</p>';
    el.innerHTML = '<div class="today-head"><p class="k">' + esc(head) + '</p><p class="today-date">' + esc(longDate(showIso, { weekday: 'long', day: 'numeric', month: 'long' })) + ', semana ' + (w + 1) + '</p></div>' + body +
      '<p class="today-foot"><span>' + esc(sc.sh.label) + (sc.mods.length > 1 ? ', Módulo ' + (sc.mod === 'module2' ? 'II' : 'I') : '') + '</span><button type="button" class="link" id="change-turn">Cambiar</button></p>';
    $('#change-turn').addEventListener('click', function () { S.view = 'dia'; S.wk = curWeek(); paintWeek(true, 0); syncUrl(); goTo($('#semana')); });
    if (animate) swap(el, 0);
  }

  /* ---------- semana ---------- */
  var wkBody = $('#wk-body'), chips = $('#wk-chips');
  function paintChips() {
    var weeks = WK.cycles[S.cycle].weeks, cur = curWeek();
    chips.innerHTML = weeks.map(function (w, i) {
      return '<button type="button" aria-pressed="' + (i === S.wk) + '" aria-label="Semana ' + (i + 1) + ', ' + esc(rangeText(w)) + (i === cur ? ', esta semana' : '') + '"' + (i === cur ? ' data-cur' : '') + (i < cur ? ' data-done' : '') + ' data-w="' + i + '">' + (i + 1) + '</button>';
    }).join('');
    var b = $('button[aria-pressed="true"]', chips);
    if (b) chips.scrollLeft = b.offsetLeft - (chips.clientWidth - b.offsetWidth) / 2;
  }
  function paintWeek(animate, dir) {
    var weeks = WK.cycles[S.cycle].weeks, w = S.wk, cur = curWeek(), sc = schedule();
    paintChips();
    $('#wk-n').textContent = w + 1;
    $('#wk-range').innerHTML = esc(rangeText(weeks[w])) + (w === cur ? '<span class="chip">Esta semana</span>' : '');
    var vb = $('#view'); vb.style.setProperty('--i', S.view === 'dia' ? 1 : 0);
    $$('button', vb).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.v === S.view)); });
    var notes = weekNotes(S.cycle, w);
    $('#wk-notes').innerHTML = notes.map(function (n) {
      return '<p><b>' + SHORT[dow(n.date) - 1] + ' ' + +n.date.slice(8) + ' ' + longDate(n.date, { month: 'short' }).replace('.', '') + '</b> ' + esc(n.t) + '</p>';
    }).join('');
    var html;
    if (S.view === 'curso') {
      var rows = courseRows(S.cycle), pre = S.cycle === 'pre', hum = pre && rows.filter(function (r) { return r.k === 'hum'; })[0];
      html = '<div class="wk-cols"><ul class="courses' + (pre ? '' : ' courses--flat') + '">' + rows.filter(function (r) { return !(pre && r.k === 'hum'); }).map(function (r) {
        var tp = r.k === 'hum' ? null : topicsFor(S.cycle, r.k, w);
        return '<li class="course" data-k="' + r.k + '"><div class="course-n"><strong>' + esc(r.name) + '</strong><small>' + daysText(r.days) + '</small></div>' +
          (tp ? '<ul class="course-t">' + tp.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '') + '</li>';
      }).join('') + '</ul>' + (hum ? '<details class="hum"' + (matchMedia('(min-width: 1000px)').matches ? ' open' : '') + '><summary class="hum-sum"><div class="course-n" data-k="hum"><strong>Humanidades</strong><small>' + daysText(hum.days) + '</small></div><span class="hum-more">9 materias' + ICON.down + '</span></summary><ul class="hum-list">' +
        humFor(S.cycle, w).map(function (h) { return '<li><span>' + esc(h.n) + '</span><span>' + esc(h.t) + '</span></li>'; }).join('') + '</ul></details>' : '') + '</div>';
    } else {
      var isCur = w === cur, L = new Date(Date.now() + LIMA), d = L.getUTCDay(), mins = L.getUTCHours() * 60 + L.getUTCMinutes();
      html = '<div class="ctrl"><div class="seg" id="turn" role="group" aria-label="Turno" style="--i:' + (S.turn === 'afternoon' ? 1 : 0) + '"><i class="seg-thumb" aria-hidden="true"></i><button type="button" data-v="morning" aria-pressed="' + (S.turn === 'morning') + '">Mañana</button><button type="button" data-v="afternoon" aria-pressed="' + (S.turn === 'afternoon') + '">Tarde</button></div>' +
        (sc.mods.length > 1 ? '<div class="seg" id="mod" role="group" aria-label="Módulo" style="--i:' + (sc.mod === 'module2' ? 1 : 0) + '"><i class="seg-thumb" aria-hidden="true"></i><button type="button" data-v="module1" aria-pressed="' + (sc.mod === 'module1') + '">Módulo I</button><button type="button" data-v="module2" aria-pressed="' + (sc.mod === 'module2') + '">Módulo II</button></div>' : '') + '</div>' +
        '<div class="days" role="group" aria-label="Día de la semana">' + DAYS.map(function (n, i) {
          return '<button type="button" data-d="' + (i + 1) + '" aria-pressed="' + (S.day === i + 1) + '" aria-label="' + n + (isCur && d === i + 1 ? ', hoy' : '') + '"' + (isCur && d === i + 1 ? ' class="is-today"' : '') + '>' + SHORT[i] + '</button>';
        }).join('') + '</div><div class="sched" id="sched">' + sc.days.map(function (day, i) {
          var marks = day.sessions.map(function (s) { return { s: s, st: 'plain' }; }), today = isCur && d === i + 1;
          if (today) marks = mark(day.sessions, mins);
          return '<section class="day' + (S.day === i + 1 ? ' is-on' : '') + (today ? ' is-today' : '') + '" data-d="' + (i + 1) + '" aria-label="' + day.name + '"><h3>' + day.name + (today ? ', hoy' : '') + '</h3><ul class="trows">' + marks.map(function (m) { return trow(m, w, today); }).join('') + '</ul></section>';
        }).join('') + '</div><p class="brk">' + esc(dash(sc.sh.breakLabel || '')) + '</p>';
    }
    wkBody.innerHTML = html;
    if (animate) swap(wkBody, dir ? dir * 12 : 0);
  }
  function setWeek(i, dir) {
    var len = WK.cycles[S.cycle].weeks.length;
    if (i < 0 || i >= len || i === S.wk) return;
    S.wk = i; paintWeek(true, dir || (i > S.wk ? 1 : -1)); syncUrl();
  }
  chips.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-w]'); if (!b) return;
    var i = +b.dataset.w, dir = i > S.wk ? 1 : -1; S.wk = i; paintWeek(true, dir); syncUrl();
  });
  $('#view').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-v]'); if (!b || b.dataset.v === S.view) return;
    S.view = b.dataset.v; paintWeek(true, 0); syncUrl();
  });
  wkBody.addEventListener('click', function (e) {
    var t = e.target.closest('#turn button[data-v]'), m = e.target.closest('#mod button[data-v]'), dday = e.target.closest('.days button[data-d]');
    if (t && t.dataset.v !== S.turn) { S.turn = t.dataset.v; store.set('turn', S.turn); paintWeek(true, 0); paintToday(true); }
    else if (m && m.dataset.v !== S.mod) { S.mod = m.dataset.v; store.set('mod', S.mod); paintWeek(true, 0); paintToday(true); }
    else if (dday) {
      S.day = +dday.dataset.d;
      $$('.days button', wkBody).forEach(function (x) { x.setAttribute('aria-pressed', String(x === dday)); });
      var shownDay = null;
      $$('.day', wkBody).forEach(function (n) { var on = +n.dataset.d === S.day; n.classList.toggle('is-on', on); if (on) shownDay = n; });
      swap(shownDay, 8);
    }
  });
  // deslizar de lado cambia de semana (solo gestos claramente horizontales)
  (function () {
    var x0 = 0, y0 = 0, t0 = 0;
    wkBody.addEventListener('touchstart', function (e) { var t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; t0 = Date.now(); }, { passive: true });
    wkBody.addEventListener('touchend', function (e) {
      var t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8 && Date.now() - t0 < 600) setWeek(S.wk + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    }, { passive: true });
  })();

  /* ---------- calendario ---------- */
  function paintCal(animate) {
    var now = Date.now(), sum = summarize(evs, now), ol = $('#cal'), btn = $('#cal-more');
    ol.innerHTML = evs.map(function (e) {
      var st = isDone(e, now) ? 'done' : e === sum.next ? 'next' : 'todo', d = e.date.split('-');
      return '<li class="ev" data-s="' + st + '"' + (st === 'done' ? ' data-past hidden' : '') + '><time class="ev-d" datetime="' + e.date + '"><b>' + +d[2] + '</b><span>' + longDate(e.date, { month: 'short' }).replace('.', '') + '</span></time>' +
        '<div class="ev-t"><strong>' + esc(e.name) + '</strong><small>' + esc(longDate(e.date, { weekday: 'long' })) + ', ' + esc(e.mode) + '</small></div><span class="chip">' + relative(e, now) + '</span></li>';
    }).join('');
    var left = sum.total - sum.done;
    $('#cal-sum').innerHTML = '<b>' + left + '</b>' + (left === 1 ? 'evaluación por delante' : 'evaluaciones por delante');
    btn.hidden = !sum.done;
    btn.setAttribute('aria-expanded', String(S.showDone));
    btn.firstElementChild.textContent = (S.showDone ? 'Ocultar' : 'Ver') + ' ' + sum.done + (sum.done === 1 ? ' hecha' : ' hechas');
    $$('[data-past]', ol).forEach(function (li) { li.hidden = !S.showDone; });
    if (animate) swap(ol, 0);
  }
  $('#cal-more').addEventListener('click', function () { S.showDone = !S.showDone; paintCal(false); if (S.showDone) swap($('#cal'), 0); });
  $('#ics-all').addEventListener('click', function () { addEvents(evs, this, 'Descargado'); });

  /* ---------- herramientas: se elige por necesidad ---------- */
  var NEEDS = [
    ['prep', 'Practicar', 'Antes de rendir', [
      { t: 'Fijas CEPREUNI', d: 'Los temas que más cayeron en cada evaluación, curso por curso.', u: '/fijas-cepreuni', i: 'target', g: ['Primera PC', 'Examen final', 'Selección'] },
      { t: 'Exámenes CEPREUNI', d: 'Prácticas y parciales anteriores para ensayar.', u: '/cepreuni/examenes', i: 'exam', g: ['Prácticas', 'Parciales', 'Finales'] },
      { t: 'Simulacro final', d: 'Ensaya en condiciones de examen.', u: '/simulacros', i: 'timer', g: [] }
    ]],
    ['study', 'Estudiar', 'Material y clases', [
      { t: 'Materiales PRE', d: 'Todo el ciclo ordenado por curso y semana.', u: '/cepreuni/materialespre', i: 'book', g: ['Clases', 'Libros', 'Repasos', 'Solucionarios'] },
      { t: 'Materiales IEN', d: 'Clases, libros y problemas de cada ciclo.', u: '/cepreuni/materialesien', i: 'book', g: ['Clases', 'Libros', 'Problemas'] },
      { t: 'Clases en video', d: 'Explicaciones por curso, a tu ritmo.', u: '/clases', i: 'play', g: ['Por curso'] }
    ]],
    ['result', 'Resultados', 'Cómo vas', [
      { t: 'Ranking', d: 'Tu puesto, tu ponderado y cada evaluación, por código o nombre.', u: '/ranking', i: 'rank', cycle: true, g: ['2027-1', '2026-2', 'Carreras'] },
      { t: 'Calculadora de puntaje', d: 'Tu nota, tu carrera y los cortes históricos.', u: '/calculadora', i: 'calc', g: ['Puntaje', 'Carrera', 'Cortes'] },
      { t: 'Ingresantes 2026-2', d: 'Quién ingresó y con qué puntaje.', u: '/ingresantes-cepreuni', i: 'users', g: ['Por nombre', 'Por código'] },
      { t: 'Postulantes 2027-1', d: 'Cuántas personas eligieron cada carrera.', u: '/cantidad-de-postulantes', i: 'users', g: ['Por carrera'] }
    ]],
    ['plan', 'Organizarme', 'Tu ciclo y tu semana', [
      { t: 'Planificador', d: 'Convierte los temas en tu plan semanal y sigue tu avance.', u: '/planificador', i: 'plan', g: ['Temas', 'Tareas', 'Seguimiento'] },
      { t: 'Guía de aulas', d: 'Docentes y aulas del ciclo.', u: '/docentes-cepreuni', i: 'room', g: ['Docentes', 'Aulas'] },
      { t: 'Información del ciclo', d: 'Normas, faltas y evaluaciones, para estudiantes y familias.', u: '/informacion-cepreuni', i: 'info', g: ['Normas', 'Evaluaciones', 'Familias'] }
    ]]
  ];
  S.need = 0;
  function toolHref(t) { return t.cycle && S.cycle === 'basico' ? t.u + '?sede=basico' : t.u; }
  function tile(t, lead) {
    return '<li' + (lead ? ' class="lead"' : '') + '><a class="tile" href="' + toolHref(t) + '"><span class="ic">' + svg(t.i) + '</span><span class="tx"><b>' + esc(t.t) + '</b><small>' + esc(t.d) + '</small></span>' +
      (t.g.length ? '<span class="tags">' + t.g.map(function (g) { return '<span>' + esc(g) + '</span>'; }).join('') + '</span>' : '') + '<span class="go">' + ICON.arrow + '</span></a></li>';
  }
  function paintTools(animate) {
    var needs = $('#needs'), n = NEEDS[S.need], list = n[3].slice();
    if (S.cycle === 'ien' && n[0] === 'study') list.unshift(list.splice(1, 1)[0]); // en IEN, sus materiales van primero
    needs.innerHTML = NEEDS.map(function (g, i) {
      return '<button type="button" role="tab" class="need" id="need-' + g[0] + '" data-i="' + i + '" aria-selected="' + (i === S.need) + '" aria-controls="tools" tabindex="' + (i === S.need ? 0 : -1) + '"><span class="need-t">' + g[1] + '</span><span class="need-s">' + g[2] + '</span><small>' + g[3].length + '</small></button>';
    }).join('');
    var tools = $('#tools'); tools.setAttribute('aria-labelledby', 'need-' + n[0]);
    tools.innerHTML = list.map(function (t, i) { return tile(t, list.length === 3 && i === 0); }).join('');
    if (animate) swap(tools, 0);
  }
  $('#needs').addEventListener('click', function (e) {
    var b = e.target.closest('.need'); if (!b || +b.dataset.i === S.need) return;
    S.need = +b.dataset.i; paintTools(true);
    var cur = $('.need[aria-selected="true"]'); if (cur) cur.focus({ preventScroll: true });
  });
  $('#needs').addEventListener('keydown', function (e) {
    var k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!k) return;
    e.preventDefault(); S.need = (S.need + k + NEEDS.length) % NEEDS.length; paintTools(true);
    $('.need[aria-selected="true"]').focus({ preventScroll: true });
  });

  /* ---------- anclas internas ---------- */
  function goTo(t) {
    if (!t) return;
    t.scrollIntoView({ behavior: RM.matches ? 'auto' : 'smooth', block: 'start' });
    t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a || a.getAttribute('href').length < 2) return;
    var t = document.getElementById(a.getAttribute('href').slice(1)); if (!t) return;
    e.preventDefault(); goTo(t);
    try { history.replaceState(null, '', location.pathname + location.search + '#' + t.id); } catch (err) { /* file:// */ }
  });

  /* ---------- conjunto ---------- */
  function renderAll(animate) {
    evs = eventsFor(S.cycle);
    clearInterval(timer);
    paintNext(animate); paintToday(animate); paintWeek(animate, 0); paintCal(animate); paintTools(false);
    timer = setInterval(function () { tick(); }, shown && shown.timed ? 1000 : 60000);
  }
  paintSeg(); renderAll(false);
  setInterval(function () { if (!document.hidden) paintToday(false); }, 60000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { paintToday(false); tick(); } });

  /* ---------- sección activa, aparición y volver arriba ---------- */
  var links = $$('.snav a'), sections = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + en.target.id)); }); });
    }, { rootMargin: '-35% 0px -60% 0px' });
    sections.forEach(function (s) { if (s) spy.observe(s); });
    var rev = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); rev.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    $$('.sc').forEach(function (n) { rev.observe(n); });
  } else $$('.sc').forEach(function (n) { n.classList.add('in'); });
  (function () {
    var btn = $('.totop'), ticking = false;
    function sync() {
      ticking = false;
      var max = document.documentElement.scrollHeight - innerHeight, y = scrollY, on = y > innerHeight * 1.2;
      btn.classList.toggle('is-on', on); btn.tabIndex = on ? 0 : -1;
      btn.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(sync); } }, { passive: true });
    addEventListener('resize', sync); sync();
    btn.addEventListener('click', function () { scrollTo({ top: 0, behavior: RM.matches ? 'auto' : 'smooth' }); });
  })();
})();
