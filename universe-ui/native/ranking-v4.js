/* Ranking CEPREUNI: 2027-1 in progress, 2026-2 final and admission ranges by career.
   Scores come from their own data files; this script only ranks and presents them. */
(function () {
  var root = document.getElementById('rk4');

  var current = window.UNIVERSE_CEPRE_2027_1 || null;
  var official = window.UNIVERSE_CEPRE_2026_2 || {};
  var supplied2025 = window.UNIVERSE_CEPRE_HISTORY_2025_2 || null;
  var PAGE = 50;
  var MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];

  function $(id) { return document.getElementById(id); }
  function all(selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fold(value) { return String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase(); }
  // Every typed word must appear, in any order: "elmer jara" finds JARA RODRIGUEZ ELMER.
  function matcher(query) {
    var words = fold(query).split(/\s+/).filter(Boolean);
    return function (text) { return words.every(function (word) { return text.indexOf(word) !== -1; }); };
  }
  function score(value) {
    if (value == null || typeof value === 'boolean' || String(value).trim() === '') return null;
    var n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  function fmt(value) { var n = score(value); return n == null ? '—' : n.toFixed(3); }
  function int(value) { return Number(value || 0).toLocaleString('es-PE'); }
  function pct(value) {
    var digits = value < 10 ? 1 : 0;
    return value.toLocaleString('es-PE', { minimumFractionDigits: digits, maximumFractionDigits: digits }) + ' %';
  }
  function date(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    return m ? Number(m[3]) + ' ' + MONTHS[Number(m[2]) - 1] + ' ' + m[1] : '—';
  }
  function median(values) {
    if (!values.length) return null;
    var s = values.slice().sort(function (a, b) { return a - b; });
    var mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  }
  function kpi(label, value, note) {
    return '<div><dt>' + esc(label) + '</dt><dd><strong>' + value + '</strong>' + (note ? '<small>' + note + '</small>' : '') + '</dd></div>';
  }
  function pager(nav, page, pages, onTurn) {
    if (!nav) return;
    if (pages <= 1) { nav.innerHTML = ''; nav.hidden = true; return; }
    nav.hidden = false;
    var items = [];
    var windowStart = Math.max(1, Math.min(page - 2, pages - 4));
    var windowEnd = Math.min(pages, windowStart + 4);
    if (windowStart > 1) items.push(1);
    if (windowStart > 2) items.push('…');
    for (var i = windowStart; i <= windowEnd; i++) items.push(i);
    if (windowEnd < pages - 1) items.push('…');
    if (windowEnd < pages) items.push(pages);
    nav.innerHTML = '<button type="button" data-page="' + (page - 1) + '"' + (page === 1 ? ' disabled' : '') + '><span aria-hidden="true">←</span><span class="rk4-pager-label"> Anterior</span></button><ol>' + items.map(function (item) {
      if (item === '…') return '<li aria-hidden="true">…</li>';
      return '<li><button type="button" data-page="' + item + '"' + (item === page ? ' aria-current="page"' : '') + ' aria-label="Página ' + item + '">' + item + '</button></li>';
    }).join('') + '</ol><span class="rk4-pager-count">' + page + ' / ' + pages + '</span><button type="button" data-page="' + (page + 1) + '"' + (page === pages ? ' disabled' : '') + '><span class="rk4-pager-label">Siguiente </span><span aria-hidden="true">→</span></button>';
    nav.onclick = function (event) {
      var button = event.target.closest('button[data-page]');
      if (!button || button.disabled) return;
      onTurn(Math.max(1, Math.min(pages, Number(button.getAttribute('data-page')))));
    };
  }
  function scrollIntoViewIfNeeded(el) {
    if (!el) return;
    var top = el.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.6) el.scrollIntoView({ block: 'start', behavior: motionOk() ? 'smooth' : 'auto' });
  }
  // When the sticky search is pinned, a shorter result list would leave the reader in the footer.
  function keepResults(input) {
    var bar = input.closest('.rk4-controls'), panel = input.closest('.rk4-panel');
    if (!bar || !panel || bar.getBoundingClientRect().top > 1) return;
    var top = panel.getBoundingClientRect().top + window.pageYOffset;
    if (window.pageYOffset > top) window.scrollTo(0, top);
  }
  function motionOk() {
    return !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) && !document.documentElement.classList.contains('motion-off');
  }
  function press(group, attr, value) {
    all('[' + attr + ']', root).forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.getAttribute(attr) === value));
    });
  }

  /* ---------- URL state ---------- */
  var params = new URLSearchParams(location.search);
  var state = {
    view: ({ '2026-2': '2026-2', carreras: 'carreras' })[params.get('vista')] || '2027-1',
    track: ({ juliaca: 'juliaca', basico: 'basic' })[params.get('sede')] || 'pre',
    query: params.get('q') || ''
  };
  function syncUrl() {
    var next = new URLSearchParams();
    if (state.view !== '2027-1') next.set('vista', state.view);
    if (state.view === '2027-1' && state.track !== 'pre') next.set('sede', state.track === 'basic' ? 'basico' : 'juliaca');
    if (state.view === '2027-1' && state.query) next.set('q', state.query);
    var url = location.pathname + (next.toString() ? '?' + next.toString() : '') + location.hash;
    try { history.replaceState(null, '', url); } catch (e) { /* file:// or sandboxed */ }
  }

  /* ---------- Tabs ---------- */
  var tabs = all('[data-rk4-view]', root);
  var panels = { '2027-1': $('rk4-panel-current'), '2026-2': $('rk4-panel-final'), carreras: $('rk4-panel-careers') };
  var rendered = {};
  function selectView(view, focusTab) {
    state.view = panels[view] ? view : '2027-1';
    tabs.forEach(function (tab) {
      var on = tab.getAttribute('data-rk4-view') === state.view;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focusTab) tab.focus();
    });
    Object.keys(panels).forEach(function (key) { if (panels[key]) panels[key].hidden = key !== state.view; });
    if (!rendered[state.view]) {
      rendered[state.view] = true;
      if (state.view === '2026-2') finalView.init();
      if (state.view === 'carreras') careersView.init();
    }
    syncUrl();
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { selectView(tab.getAttribute('data-rk4-view')); });
    tab.addEventListener('keydown', function (event) {
      var move = { ArrowRight: 1, ArrowLeft: -1, Home: -index, End: tabs.length - 1 - index }[event.key];
      if (move == null) return;
      event.preventDefault();
      var target = tabs[(index + move + tabs.length) % tabs.length];
      selectView(target.getAttribute('data-rk4-view'), true);
    });
  });

  /* ---------- 2027-1 ---------- */
  var PRE_EXAMS = [
    { key: 'pc1', label: '1.ª PC', short: '1.ª PC', step: '1PC', weight: 1, drop: true },
    { key: 'pc2', label: '2.ª PC', short: '2.ª PC', step: '2PC', weight: 1, drop: true },
    { key: 'ep1', label: '1.er parcial', short: '1.er parcial', step: '1EP', weight: 2, drop: false },
    { key: 'pc3', label: '3.ª PC', short: '3.ª PC', step: '3PC', weight: 1, drop: true },
    { key: 'pc4', label: '4.ª PC', short: '4.ª PC', step: '4PC', weight: 1, drop: true },
    { key: 'ep2', label: '2.º parcial', short: '2.º parcial', step: '2EP', weight: 4, drop: false },
    { key: 'pc5', label: '5.ª PC', short: '5.ª PC', step: '5PC', weight: 1, drop: true },
    { key: 'pc6', label: '6.ª PC', short: '6.ª PC', step: '6PC', weight: 1, drop: true },
    { key: 'pc7', label: '7.ª PC', short: '7.ª PC', step: '7PC', weight: 1, drop: false },
    { key: 'ef', label: 'Examen final', short: 'Final', step: 'EF', weight: 6, drop: false }
  ];
  var BASIC_EXAMS = [];
  for (var b = 1; b <= 9; b++) BASIC_EXAMS.push({ key: 'e' + b, label: b + '.ª evaluación', short: 'Eval. ' + b, weight: 1, drop: false });
  var TRACKS = {
    pre: { label: 'Pre Lima', sede: 'Lima', source: 'pre', max: 150, exams: PRE_EXAMS },
    juliaca: { label: 'Pre Juliaca', sede: 'Juliaca', source: 'pre', max: 150, exams: PRE_EXAMS },
    basic: { label: 'Ciclo Básico', sede: null, source: 'basic', max: 20, exams: BASIC_EXAMS }
  };
  var cache = {};
  // Pure calculation hooks for tools/test-cepre-2027-ranking.mjs.
  window.UNIVERSE_RANKING_RK4 = { weighted: weighted, score: score, tracks: TRACKS };
  if (!root) return;

  function weighted(row, track) {
    var included = [], droppable = [];
    track.exams.forEach(function (exam) {
      var value = score(row[exam.key]);
      if (value == null) return;
      var item = { key: exam.key, value: value, weight: exam.weight };
      included.push(item);
      if (exam.drop) droppable.push(item);
    });
    var dropped = null;
    if (track.source === 'pre' && droppable.length >= 2) {
      dropped = droppable.reduce(function (low, item) { return item.value < low.value ? item : low; });
      included = included.filter(function (item) { return item !== dropped; });
    }
    var weight = included.reduce(function (sum, item) { return sum + item.weight; }, 0);
    return {
      average: weight ? included.reduce(function (sum, item) { return sum + item.value * item.weight; }, 0) / weight : null,
      dropped: dropped ? dropped.key : null,
      weight: weight
    };
  }

  function rowsFor(trackKey) {
    if (cache[trackKey]) return cache[trackKey];
    var track = TRACKS[trackKey];
    var rows = ((current && current[track.source]) || []).filter(function (raw) {
      return !track.sede || (raw.sede || 'Lima') === track.sede;
    }).map(function (raw) {
      var row = Object.assign({}, raw);
      var result = weighted(row, track);
      row.average = result.average;
      row.dropped = result.dropped;
      row.weight = result.weight;
      row.search = fold(row.code + ' ' + (row.name || ''));
      return row;
    }).sort(function (a, c) {
      if (a.average == null && c.average != null) return 1;
      if (a.average != null && c.average == null) return -1;
      if (a.average != null && c.average != null && a.average !== c.average) return c.average - a.average;
      return String(a.code).localeCompare(String(c.code));
    });
    rows.forEach(function (row, i) { row.place = row.average == null ? null : i + 1; });
    var scored = rows.filter(function (row) { return row.average != null; });
    var examRank = {};
    track.exams.forEach(function (exam) {
      var list = rows.filter(function (row) { return score(row[exam.key]) != null; }).sort(function (a, c) { return score(c[exam.key]) - score(a[exam.key]); });
      var ranks = {}, previous = null, place = 0;
      list.forEach(function (row, i) {
        var v = score(row[exam.key]);
        if (v !== previous) { place = i + 1; previous = v; }
        ranks[row.code] = place;
      });
      examRank[exam.key] = { ranks: ranks, count: list.length };
    });
    var published = track.exams.filter(function (exam) {
      return rows.some(function (row) { return score(row[exam.key]) != null || row[exam.key + 'Status']; });
    });
    var hasNames = rows.some(function (row) { return row.name; });
    var hasAbsent = rows.some(function (row) { return track.exams.some(function (exam) { return row[exam.key + 'Status'] === 'AUSENTE'; }); });
    cache[trackKey] = { rows: rows, scored: scored, examRank: examRank, published: published, track: track, hasNames: hasNames, hasAbsent: hasAbsent };
    return cache[trackKey];
  }

  var currentView = (function () {
    var search = $('rk4-search'), clear = $('rk4-clear');
    var head = $('rk4-head'), body = $('rk4-body'), cards = $('rk4-cards'), nav = $('rk4-pager');
    var kpis = $('rk4-kpis'), spotlight = $('rk4-spotlight'), order = $('rk4-order');
    var allExams = $('rk4-all-exams'), allExamsWrap = $('rk4-all-exams-wrap');
    var page = 1, focusCode = null, timer = null;

    function cellState(row, exam) {
      var value = score(row[exam.key]);
      if (row[exam.key + 'Status'] === 'AUSENTE') return 'absent';
      if (value == null) return 'pending';
      return row.dropped === exam.key ? 'dropped' : 'counted';
    }
    function cell(row, exam) {
      var s = cellState(row, exam);
      if (s === 'absent') return '<td class="rk4-num"><span class="rk4-tag rk4-tag-absent">Ausente</span></td>';
      if (s === 'pending') return '<td class="rk4-num rk4-pending"><span aria-hidden="true">—</span><span class="sr-only">Sin nota</span></td>';
      if (s === 'dropped') return '<td class="rk4-num rk4-dropped" title="Nota descartada del ponderado"><s>' + fmt(row[exam.key]) + '</s><span class="sr-only"> (descartada)</span></td>';
      return '<td class="rk4-num">' + fmt(row[exam.key]) + '</td>';
    }
    function placeBadge(place) {
      if (place == null) return '<span class="rk4-place rk4-place-none" title="Sin notas registradas">—</span>';
      return '<span class="rk4-place' + (place <= 3 ? ' rk4-medal-' + place : '') + '">' + place + '</span>';
    }
    function shownExams(data) {
      if (data.track.source === 'pre' && allExams && allExams.checked) return data.track.exams;
      return data.published;
    }

    function renderSpotlight(row, data) {
      if (!row) { spotlight.hidden = true; spotlight.innerHTML = ''; return; }
      var track = data.track, total = data.scored.length;
      var top = data.scored[0];
      var mean = total ? data.scored.reduce(function (s, r) { return s + r.average; }, 0) / total : null;
      var standing = '';
      if (row.place != null) {
        var topShare = row.place / total * 100;
        standing = '<div class="rk4-spot-stats">' +
          kpi('Puesto', '<span class="rk4-big">' + int(row.place) + '</span>', 'de ' + int(total)) +
          kpi(track.source === 'basic' ? 'Promedio' : 'Ponderado', fmt(row.average), 'sobre ' + track.max) +
          kpi('Ubicación', 'Top ' + pct(Math.max(topShare, 0.1)), row.place === 1 ? 'Primer puesto' : '−' + fmt(top.average - row.average) + ' del 1.º') +
          kpi('Frente a la media', (row.average >= mean ? '+' : '−') + fmt(Math.abs(row.average - mean)), 'media ' + fmt(mean)) +
          '</div>';
      } else {
        standing = '<p class="rk4-spot-empty">Sin notas registradas.</p>';
      }
      var exams = data.published.map(function (exam) {
        var s = cellState(row, exam), rank = data.examRank[exam.key];
        var status = { counted: 'Cuenta', dropped: 'Descartada', pending: 'Sin nota', absent: 'Ausente' }[s];
        var value = s === 'absent' ? 'Ausente' : s === 'pending' ? '—' : fmt(row[exam.key]);
        var detail = rank.ranks[row.code] ? 'Puesto ' + int(rank.ranks[row.code]) + ' de ' + int(rank.count) : status;
        return '<li data-state="' + s + '"><span class="rk4-spot-exam">' + esc(exam.label) + '<small>peso ' + exam.weight + '</small></span><strong>' + (s === 'dropped' ? '<s>' + value + '</s>' : value) + '</strong><small>' + esc(s === 'dropped' ? 'Descartada · ' + detail : detail) + '</small></li>';
      }).join('');
      spotlight.innerHTML = '<header><div><p class="rk4-kicker">' + esc(track.label) + '</p><h2>' + esc(row.name || (data.hasNames ? 'Nombre no publicado' : 'Código ' + row.code)) + '</h2>' + (row.name || data.hasNames ? '<p class="rk4-code">' + esc(row.code) + '</p>' : '') + '</div><button type="button" class="rk4-ghost" data-rk4-close>Cerrar</button></header>' + standing + '<ol class="rk4-spot-exams">' + exams + '</ol>';
      spotlight.hidden = false;
    }

    function renderKpis(data) {
      var track = data.track, scored = data.scored;
      var top = scored[0];
      var values = scored.map(function (r) { return r.average; });
      var mean = values.length ? values.reduce(function (s, v) { return s + v; }, 0) / values.length : null;
      kpis.innerHTML =
        kpi('Estudiantes', int(data.rows.length), int(scored.length) + ' con nota') +
        kpi('Primer puesto', top ? fmt(top.average) : '—', top ? esc(top.name || top.code) : '') +
        kpi('Media', fmt(mean), 'Mediana ' + fmt(median(values)));
    }

    function render(opts) {
      var data = rowsFor(state.track), track = data.track;
      var q = fold(state.query.trim());
      var hits = matcher(q);
      var list = q ? data.rows.filter(function (row) { return hits(row.search); }) : data.rows;
      var sort = order.value;
      if (sort !== 'place') {
        list = list.slice().sort(function (a, c) {
          if (sort === 'code') return String(a.code).localeCompare(String(c.code));
          return String(a.name || '￿').localeCompare(String(c.name || '￿'), 'es') || String(a.code).localeCompare(String(c.code));
        });
      }
      var pages = Math.max(1, Math.ceil(list.length / PAGE));
      if (focusCode) {
        var at = list.findIndex(function (row) { return row.code === focusCode; });
        if (at >= 0) page = Math.floor(at / PAGE) + 1;
      }
      page = Math.min(Math.max(1, page), pages);
      var start = (page - 1) * PAGE, visible = list.slice(start, start + PAGE);
      var exams = shownExams(data);

      var scoreLabel = track.source === 'basic' ? 'Promedio' : 'Ponderado';
      head.innerHTML = '<tr><th scope="col" class="rk4-col-place">Puesto</th><th scope="col" class="rk4-col-code">Código</th>' + (data.hasNames ? '<th scope="col" class="rk4-col-name">Estudiante</th>' : '') + '<th scope="col" class="rk4-num rk4-col-score">' + scoreLabel + '</th>' + exams.map(function (exam) {
        return '<th scope="col" class="rk4-num">' + esc(exam.short) + '<small>peso ' + exam.weight + '</small></th>';
      }).join('') + '</tr>';
      var empty = q ? 'Sin resultados para «' + esc(state.query.trim()) + '» en ' + track.label + '.' : 'Sin estudiantes registrados.';
      body.innerHTML = visible.length ? visible.map(function (row) {
        var cls = (row.place && row.place <= 3 ? 'rk4-top' : '') + (row.code === focusCode ? ' is-focus' : '');
        return '<tr' + (cls.trim() ? ' class="' + cls.trim() + '"' : '') + '><td class="rk4-col-place">' + placeBadge(row.place) + '</td><th scope="row" class="rk4-col-code"><button type="button" class="rk4-code-btn" data-rk4-code="' + esc(row.code) + '" aria-label="Ver detalle de ' + esc(row.code) + '">' + esc(row.code) + '</button></th>' + (data.hasNames ? '<td class="rk4-col-name">' + (row.name ? esc(row.name) : '<span class="rk4-muted">No publicado</span>') + '</td>' : '') + '<td class="rk4-num rk4-col-score">' + fmt(row.average) + '</td>' + exams.map(function (exam) { return cell(row, exam); }).join('') + '</tr>';
      }).join('') : '<tr><td colspan="' + (exams.length + (data.hasNames ? 4 : 3)) + '" class="rk4-empty">' + empty + '</td></tr>';

      cards.innerHTML = visible.length ? visible.map(function (row) {
        return '<li><button type="button" class="rk4-card" data-rk4-code="' + esc(row.code) + '">' + placeBadge(row.place) + '<span class="rk4-card-id"><strong>' + esc(row.name || (data.hasNames ? 'Nombre no publicado' : row.code)) + '</strong><small>' + esc(row.name || data.hasNames ? row.code : track.label) + '</small></span><span class="rk4-card-score"><strong>' + fmt(row.average) + '</strong><small>' + scoreLabel + '</small></span></button></li>';
      }).join('') : '<li class="rk4-empty">' + empty + '</li>';

      pager(nav, page, pages, function (target) { page = target; focusCode = null; render(); scrollIntoViewIfNeeded($('rk4-table-title')); });

      var only = list.length === 1 ? list[0] : null;
      var focused = focusCode ? data.rows.find(function (row) { return row.code === focusCode; }) : null;
      renderSpotlight(focused || only, data);
      renderKpis(data);

      $('rk4-table-title').textContent = track.label;
      $('rk4-table-sub').textContent = (list.length ? int(start + 1) + '–' + int(start + visible.length) + ' de ' + int(list.length) : '0 resultados') + ' · sobre ' + track.max;
      clear.hidden = !state.query;
      allExamsWrap.hidden = track.source !== 'pre';
      var legend = $('rk4-legend').querySelectorAll('li');
      legend[0].hidden = track.source !== 'pre';
      legend[2].hidden = !data.hasAbsent;
      search.placeholder = data.hasNames ? 'Busca tu código o nombre' : 'Busca tu código';
      if (opts && opts.reveal) scrollIntoViewIfNeeded(spotlight.hidden ? $('rk4-table-title') : spotlight);
    }

    function setTrack(key) {
      state.track = TRACKS[key] ? key : 'pre';
      press(null, 'data-rk4-track', state.track);
      page = 1; focusCode = null;
      render(); syncUrl();
    }
    function openCode(code) {
      focusCode = code; state.query = code; search.value = code;
      render({ reveal: true }); syncUrl();
    }

    all('[data-rk4-track]', root).forEach(function (button) {
      button.addEventListener('click', function () { setTrack(button.getAttribute('data-rk4-track')); });
    });
    search.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { state.query = search.value; page = 1; focusCode = null; render(); syncUrl(); keepResults(search); }, 120);
    });
    search.addEventListener('keydown', function (event) { if (event.key === 'Escape' && search.value) { event.preventDefault(); clear.click(); } });
    clear.addEventListener('click', function () { search.value = ''; state.query = ''; page = 1; focusCode = null; render(); syncUrl(); search.focus(); });
    order.addEventListener('change', function () { page = 1; render(); });
    allExams.addEventListener('change', function () { render(); });
    root.addEventListener('click', function (event) {
      var target = event.target.closest('[data-rk4-code]');
      if (target && panels['2027-1'].contains(target)) openCode(target.getAttribute('data-rk4-code'));
      if (event.target.closest('[data-rk4-close]')) clear.click();
    });

    function renderProgress() {
      var data = rowsFor('pre'), juliaca = rowsFor('juliaca');
      var publishedKeys = {};
      data.published.concat(juliaca.published).forEach(function (exam) { publishedKeys[exam.key] = true; });
      var done = PRE_EXAMS.filter(function (exam) { return publishedKeys[exam.key]; });
      var nextExam = PRE_EXAMS.find(function (exam) { return !publishedKeys[exam.key]; });
      $('rk4-progress-count').innerHTML = '<strong>' + done.length + '/' + PRE_EXAMS.length + '</strong> evaluaciones';
      $('rk4-steps').innerHTML = PRE_EXAMS.map(function (exam) {
        var on = !!publishedKeys[exam.key];
        return '<li data-done="' + on + '"' + (exam === nextExam ? ' data-next="true"' : '') + ' title="' + esc(exam.label + ' · peso ' + exam.weight) + '"><span class="rk4-step-dot" aria-hidden="true"></span><span class="rk4-step-name" aria-hidden="true">' + esc(exam.step) + '</span><span class="sr-only">' + esc(exam.label) + '</span><span class="rk4-step-weight">×' + exam.weight + '</span><span class="sr-only">' + (on ? ', publicada' : exam === nextExam ? ', siguiente' : ', pendiente') + '</span></li>';
      }).join('');
    }

    function renderSources() {
      var list = $('rk4-sources');
      if (!list || !current) return;
      var s = current.sources || {}, items = [];
      if (s.pre) items.push('1.ª PC Pre Lima: <code>' + esc(s.pre) + '</code>.');
      if (s.firstPracticeJuliaca) {
        var j = s.firstPracticeJuliaca;
        items.push('1.ª PC Pre Juliaca (' + date(j.publishedAt) + '): ' + int(j.count) + ' notas.');
      }
      if (s.basic) items.push('1.ª evaluación Ciclo Básico: <code>' + esc(s.basic) + '</code>.');
      (s.secondEvaluation || []).forEach(function (item) {
        items.push((item.track === 'basic' ? '2.ª evaluación Ciclo Básico' : '2.ª PC Pre ' + esc(item.sede)) + ': <code>' + esc(item.file) + '</code> (' + int(item.count) + ' notas).');
      });
      (s.firstPartial || []).forEach(function (item) {
        items.push('1.er parcial Pre ' + esc(item.sede) + ': ' + int(item.scored) + ' notas, ' + int(item.absent) + ' ausentes.');
      });
      (s.thirdEvaluation || []).forEach(function (item) {
        items.push((item.track === 'basic' ? '4.ª evaluación Ciclo Básico' : '3.ª PC Pre ' + esc(item.sede)) + ': <code>' + esc(item.file) + '</code> (' + int(item.count) + ' notas' + (item.absent ? ', ' + int(item.absent) + (item.absent === 1 ? ' ausente' : ' ausentes') : '') + ').');
      });
      if (s.manualCorrections && s.manualCorrections.count) items.push(int(s.manualCorrections.count) + (s.manualCorrections.count === 1 ? ' corrección manual registrada' : ' correcciones manuales registradas') + '. <a href="/correcciones">Reportar un error</a>');
      list.innerHTML = items.map(function (item) { return '<li>' + item + '</li>'; }).join('');
    }

    function init() {
      if (!current) {
        kpis.innerHTML = '';
        body.innerHTML = '<tr><td class="rk4-empty">No se pudieron cargar las notas 2027-1. Recarga la página.</td></tr>';
        return;
      }
      $('rk4-updated').textContent = date([current.updatedAt, current.publishedAt].filter(Boolean).sort().pop());
      ['pre', 'juliaca', 'basic'].forEach(function (key) {
        var el = root.querySelector('[data-rk4-count="' + key + '"]');
        if (el) el.textContent = int(rowsFor(key).rows.length);
      });
      press(null, 'data-rk4-track', state.track);
      search.value = state.query;
      renderProgress();
      renderSources();
      render();
    }
    return { init: init };
  })();

  /* ---------- 2026-2 final ---------- */
  function parseJson(id, fallback) {
    var node = $(id);
    try { return node ? JSON.parse(node.textContent || '') : fallback; } catch (e) { return fallback; }
  }
  var finalRows = null;
  function finalData() {
    if (finalRows) return finalRows;
    var data = parseJson('cepre2026-ranking-data', []);
    var examScores = official.examScores || {}, finals = (official.examScores && official.examScores.ef) || official.finalScores || {};
    var columns = { pc1: 2, pc2: 3, pc3: 4, pc4: 5, pc5: 6, pc6: 7, pc7: 8, ep1: 9, ep2: 10 };
    var entrants = {};
    (official.entrants || []).forEach(function (e) { entrants[e.codigo] = e; });
    finalRows = data.map(function (r) {
      var row = r.slice();
      Object.keys(columns).forEach(function (key) {
        var scores = examScores[key] || {};
        if (Object.prototype.hasOwnProperty.call(scores, row[1])) row[columns[key]] = Number(scores[row[1]]);
      });
      var ef = Object.prototype.hasOwnProperty.call(finals, row[1]) ? Number(finals[row[1]]) : 0;
      var pcs = row.slice(2, 8).map(Number);
      var lowest = 0;
      for (var i = 1; i < 6; i++) if (pcs[i] < pcs[lowest]) lowest = i;
      var best5 = pcs.reduce(function (s, v) { return s + v; }, 0) - pcs[lowest];
      var total = (best5 + Number(row[8] || 0) + 2 * Number(row[9] || 0) + 4 * Number(row[10] || 0) + 6 * ef) / 18;
      var entrant = entrants[row[1]] || null;
      return { code: row[1], scores: row.slice(2, 11).map(Number), ef: ef, dropped: lowest, total: total, sede: row[12] || 'Lima', entrant: entrant, search: fold(row[1] + ' ' + (entrant ? entrant.nombres : '')) };
    }).sort(function (a, c) { return c.total - a.total || String(a.code).localeCompare(String(c.code)); });
    var bySite = {};
    finalRows.forEach(function (row, i) {
      row.place = i + 1;
      bySite[row.sede] = (bySite[row.sede] || 0) + 1;
      row.sitePlace = bySite[row.sede];
    });
    return finalRows;
  }

  var finalView = (function () {
    var site = '', page = 1, timer = null;
    function render() {
      var rows = finalData();
      var q = $('rk4-final-search').value.trim(), hits = matcher(q);
      var onlyEntrants = $('rk4-final-entrants').checked;
      var list = rows.filter(function (row) {
        return (!site || row.sede === site) && (!q || hits(row.search)) && (!onlyEntrants || row.entrant);
      });
      var pages = Math.max(1, Math.ceil(list.length / PAGE));
      page = Math.min(page, pages);
      var start = (page - 1) * PAGE, visible = list.slice(start, start + PAGE);
      $('rk4-final-body').innerHTML = visible.length ? visible.map(function (row) {
        var place = site ? row.sitePlace : row.place;
        var cells = row.scores.map(function (v, i) {
          var missing = !v, dropped = i === row.dropped;
          return '<td class="rk4-num' + (missing ? ' rk4-pending' : '') + (dropped ? ' rk4-dropped' : '') + '"' + (missing ? ' title="Sin nota registrada: cuenta como 0"' : dropped ? ' title="Nota descartada"' : '') + '>' + (dropped ? '<s>' + fmt(v) + '</s><span class="sr-only"> (descartada)</span>' : fmt(v)) + '</td>';
        }).join('');
        var e = row.entrant;
        return '<tr' + (place <= 3 ? ' class="rk4-top"' : '') + '><td class="rk4-col-place"><span class="rk4-place' + (place <= 3 ? ' rk4-medal-' + place : '') + '">' + place + '</span></td><th scope="row" class="rk4-col-code"><span class="rk4-mono">' + esc(row.code) + '</span></th><td class="rk4-num rk4-col-score">' + fmt(row.total) + '</td><td>' + (e ? '<span class="rk4-entrant" title="' + esc(e.especialidad + ' · ' + e.facultad) + '"><span class="rk4-tag rk4-tag-in">' + esc(e.codigoEspecialidad) + '</span><span class="rk4-entrant-name">' + esc(e.especialidad) + '</span></span>' : '<span class="rk4-muted">—</span>') + '</td><td>' + esc(row.sede) + '</td>' + cells + '<td class="rk4-num' + (row.ef ? '' : ' rk4-pending') + '"' + (row.ef ? '' : ' title="Sin nota registrada: cuenta como 0"') + '>' + fmt(row.ef) + '</td></tr>';
      }).join('') : '<tr><td colspan="15" class="rk4-empty">Sin resultados.</td></tr>';
      $('rk4-final-cards').innerHTML = visible.length ? visible.map(function (row) {
        var place = site ? row.sitePlace : row.place, e = row.entrant;
        return '<li><div class="rk4-card"><span class="rk4-place' + (place <= 3 ? ' rk4-medal-' + place : '') + '">' + place + '</span><span class="rk4-card-id"><strong>' + esc(e ? e.nombres : row.code) + '</strong><small>' + (e ? esc(row.code) + ' · ' : '') + esc(row.sede) + '</small>' + (e ? '<span class="rk4-entrant"><span class="rk4-tag rk4-tag-in">' + esc(e.codigoEspecialidad) + '</span><span class="rk4-entrant-name">' + esc(e.especialidad) + '</span></span>' : '') + '</span><span class="rk4-card-score"><strong>' + fmt(row.total) + '</strong><small>Final</small></span></div></li>';
      }).join('') : '<li class="rk4-empty">Sin resultados.</li>';
      pager($('rk4-final-pager'), page, pages, function (target) { page = target; render(); scrollIntoViewIfNeeded($('rk4-final-title')); });
      $('rk4-final-title').textContent = (onlyEntrants ? 'Ingresantes · ' : '') + (site || 'Lima y Juliaca');
      $('rk4-final-sub').textContent = (list.length ? int(start + 1) + '–' + int(start + visible.length) + ' de ' + int(list.length) : '0 resultados') + ' · sobre 150';
    }
    function renderStats() {
      var rows = finalData().filter(function (row) { return !site || row.sede === site; });
      var top = rows[0];
      var withEf = rows.filter(function (row) { return row.ef > 0; });
      var mean = withEf.length ? withEf.reduce(function (s, r) { return s + r.total; }, 0) / withEf.length : null;
      var evaluated = official.evaluated || {}, entrantCount = official.entrantCount || {};
      $('rk4-final-kpis').innerHTML =
        kpi('Evaluados', int(site ? evaluated[site] : evaluated.total), site ? '' : 'Lima ' + int(evaluated.Lima) + ' · Juliaca ' + int(evaluated.Juliaca)) +
        kpi('Ingresantes', int(site ? entrantCount[site] : entrantCount.total), site ? '' : 'Lima ' + int(entrantCount.Lima) + ' · Juliaca ' + int(entrantCount.Juliaca)) +
        kpi('Primer puesto', top ? fmt(top.total) : '—', top ? esc(top.entrant ? top.entrant.nombres : top.code) : '') +
        kpi('Media', fmt(mean), '');
      var labels = ['1.ª PC', '2.ª PC', '3.ª PC', '4.ª PC', '5.ª PC', '6.ª PC', '7.ª PC', '1.er parcial', '2.º parcial', 'Examen final'];
      $('rk4-exam-stats').innerHTML = labels.map(function (label, i) {
        var get = function (row) { return i === 9 ? row.ef : row.scores[i]; };
        var registered = rows.filter(function (row) { return get(row) > 0; });
        var best = registered.reduce(function (m, row) { return !m || get(row) > get(m) || (get(row) === get(m) && row.code < m.code) ? row : m; }, null);
        var avg = registered.length ? registered.reduce(function (s, row) { return s + get(row); }, 0) / registered.length : null;
        return '<tr><th scope="row">' + label + '</th><td class="rk4-num">' + int(registered.length) + '</td><td class="rk4-num">' + fmt(avg) + '</td><td class="rk4-num">' + (best ? fmt(get(best)) : '—') + '</td><td><span class="rk4-mono">' + (best ? esc(best.code) : '—') + '</span></td></tr>';
      }).join('');
    }
    function setSite(value) {
      site = value; page = 1;
      press(null, 'data-rk4-final-site', site);
      renderStats(); render();
    }
    function init() {
      $('rk4-final-published').textContent = date(official.published);
      if (official.source) $('rk4-final-source').href = official.source;
      all('[data-rk4-final-site]', root).forEach(function (button) {
        button.addEventListener('click', function () { setSite(button.getAttribute('data-rk4-final-site')); });
      });
      $('rk4-final-search').addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { page = 1; render(); keepResults($('rk4-final-search')); }, 120); });
      $('rk4-final-entrants').addEventListener('change', function () { page = 1; render(); });
      renderStats(); render();
    }
    return { init: init };
  })();

  /* ---------- Ranges by career ---------- */
  var careersView = (function () {
    var history = {}, cycle = '2026-2', site = 'Lima';
    var AXIS_MIN = 8, AXIS_MAX = 20;
    function benchmark() {
      var rows = finalData().filter(function (row) {
        var pcs = row.scores.slice(0, 6).filter(function (v) { return v > 0; }).length;
        return row.sede === site && pcs >= 5 && row.scores[6] > 0 && row.scores[7] > 0 && row.scores[8] > 0 && row.ef > 0;
      });
      var average = rows.length ? rows.reduce(function (s, r) { return s + r.total; }, 0) / rows.length / 7.5 : null;
      return { average: average, count: rows.length };
    }
    function projected(siteName) {
      var ordered = ['2024-2', '2025-2', '2026-1', '2026-2'];
      var latest = (history['2026-2'] && history['2026-2'][siteName]) || [];
      return latest.map(function (base) {
        var series = [];
        ordered.forEach(function (key) {
          var rows = (history[key] && history[key][siteName]) || [];
          var row = rows.find(function (item) { return item[1] === base[1]; });
          if (row && Number.isFinite(Number(row[3])) && row[3] != null && Number.isFinite(Number(row[4])) && row[4] != null) series.push(row);
        });
        if (!series.length) return [base[0], base[1], base[2], null, null, null, null];
        var first = series[0], last = series[series.length - 1], steps = Math.max(1, series.length - 1);
        var minTrend = Math.max(-0.7, Math.min(0.7, (Number(last[3]) - Number(first[3])) / steps * 0.55));
        var maxTrend = Math.max(-0.8, Math.min(0.8, (Number(last[4]) - Number(first[4])) / steps * 0.55));
        var pMin = Math.max(0, Math.min(20, Number(last[3]) + 0.2 + minTrend));
        var pMax = Math.max(pMin, Math.min(20, Number(last[4]) + 0.15 + maxTrend));
        return [base[0], base[1], base[2], Number(pMin.toFixed(3)), Number(pMax.toFixed(3)), null, null];
      });
    }
    function bar(row, marker) {
      var min = score(row[3]), max = score(row[4]);
      if (max == null) return '<span class="rk4-muted">Sin ingresantes</span>';
      var span = AXIS_MAX - AXIS_MIN;
      var lo = Math.max(AXIS_MIN, min == null ? max : min), hi = Math.max(lo, max);
      var left = (lo - AXIS_MIN) / span * 100, width = Math.max((hi - lo) / span * 100, 1.2);
      var m = marker == null ? '' : '<b style="left:' + Math.max(0, Math.min(100, (marker - AXIS_MIN) / span * 100)).toFixed(2) + '%"></b>';
      return '<div class="rk4-range" role="img" aria-label="Mínimo ' + fmt(min) + ', máximo ' + fmt(max) + '"><i style="left:' + left.toFixed(2) + '%;width:' + width.toFixed(2) + '%"></i>' + m + '</div>';
    }
    function render() {
      var rows = (history[cycle] && history[cycle][site]) || [];
      var q = fold($('rk4-career-search').value.trim());
      var sort = $('rk4-careers-order').value;
      var hasEntrants = rows.some(function (r) { return r[5] != null; });
      var hasVacancies = rows.some(function (r) { return r[6] != null; });
      var projection = cycle === '2027-1';
      var bench = benchmark();
      var hits = matcher(q);
      var list = rows.filter(function (r) { return !q || hits(fold(r[0] + ' ' + r[1] + ' ' + r[2])); });
      if (sort !== 'official') {
        list = list.slice().sort(function (a, c) {
          if (sort === 'name') return String(a[2]).localeCompare(String(c[2]), 'es');
          var i = sort === 'min' ? 3 : 4, va = score(a[i]), vc = score(c[i]);
          if (va == null && vc == null) return 0;
          if (va == null) return 1;
          if (vc == null) return -1;
          return vc - va;
        });
      }
      $('rk4-careers-head').innerHTML = '<tr><th scope="col">Especialidad</th>' + (hasEntrants ? '<th scope="col" class="rk4-num">Ingresantes</th>' : '') + (hasVacancies ? '<th scope="col" class="rk4-num">Vacantes</th>' : '') + '<th scope="col" class="rk4-num">Mínimo</th><th scope="col" class="rk4-num">Máximo</th><th scope="col" class="rk4-col-range"><span class="rk4-axis" aria-hidden="true"><span>8</span><span>12</span><span>16</span><span>20</span></span><span class="sr-only">Rango en escala de 8 a 20</span></th></tr>';
      var cols = 4 + (hasEntrants ? 1 : 0) + (hasVacancies ? 1 : 0);
      $('rk4-careers-body').innerHTML = list.length ? list.map(function (r) {
        return '<tr><th scope="row"><span class="rk4-career"><span class="rk4-tag">' + esc(r[1]) + '</span><span><strong>' + esc(r[2]) + '</strong><small>' + esc(r[0]) + '</small></span></span></th>' + (hasEntrants ? '<td class="rk4-num" data-label="Ingresantes">' + (r[5] == null ? '<span class="rk4-muted">—</span>' : int(r[5])) + '</td>' : '') + (hasVacancies ? '<td class="rk4-num" data-label="Vacantes">' + (r[6] == null ? '<span class="rk4-muted">—</span>' : int(r[6])) + '</td>' : '') + '<td class="rk4-num" data-label="Mínimo">' + fmt(r[3]) + '</td><td class="rk4-num" data-label="Máximo">' + fmt(r[4]) + '</td><td class="rk4-col-range">' + bar(r, bench.average) + '</td></tr>';
      }).join('') : '<tr><td colspan="' + cols + '" class="rk4-empty">' + (rows.length ? 'Sin resultados.' : 'Sin datos de ' + esc(site) + ' en ' + esc(cycle) + '.') + '</td></tr>';

      var withAdmission = rows.filter(function (r) { return score(r[4]) != null; });
      var entrantsKpi, entrantsNote;
      if (projection) { entrantsKpi = '—'; entrantsNote = ''; }
      else if (cycle === '2026-2' && official.entrantCount) { entrantsKpi = int(official.entrantCount[site]); entrantsNote = int(official.evaluated && official.evaluated[site]) + ' evaluados'; }
      else if (cycle === '2025-2' && supplied2025) { entrantsKpi = int(supplied2025.officialEntrants); entrantsNote = '+' + int(supplied2025.ordinaryEntrants) + ' por ordinario'; }
      else {
        var sum = rows.reduce(function (s, r) { return s + (Number(r[5]) || 0); }, 0);
        entrantsKpi = sum ? int(sum) : '—'; entrantsNote = '';
      }
      var highest = withAdmission.reduce(function (m, r) { return !m || Number(r[3]) > Number(m[3]) ? r : m; }, null);
      $('rk4-careers-kpis').innerHTML =
        kpi('Ingresantes', entrantsKpi, entrantsNote) +
        kpi('Carreras', rows.length ? int(withAdmission.length) + '/' + int(rows.length) : '—', projection ? 'con proyección' : 'con ingresantes') +
        kpi('Mínimo más alto', highest ? fmt(highest[3]) : '—', highest ? esc(highest[2]) : '') +
        kpi('Promedio 2026-2', bench.average == null ? '—' : fmt(bench.average), 'sobre 20');
      $('rk4-careers-title').textContent = (projection ? 'Proyección 2027-1' : cycle) + ' · ' + site;
      $('rk4-careers-sub').textContent = int(list.length) + ' carreras';
      $('rk4-marker-legend').textContent = 'promedio 2026-2 de ' + site;

      var callout = $('rk4-careers-callout');
      callout.hidden = !projection;
      callout.textContent = projection ? 'Proyección referencial de Universe, no oficial.' : '';

      var note = $('rk4-careers-note');
      if (cycle === '2026-2' && official.source) note.innerHTML = '<a href="' + esc(official.source) + '" target="_blank" rel="noopener noreferrer">Fuente oficial 2026-2 ↗</a>';
      else if (cycle === '2025-2' && supplied2025) note.innerHTML = '<a href="' + esc(supplied2025.officialSource) + '" target="_blank" rel="noopener noreferrer">Estadística oficial 2025-2 ↗</a>';
      else note.textContent = '';

      all('[data-rk4-site]', root).forEach(function (button) {
        var available = !!(history[cycle] && history[cycle][button.getAttribute('data-rk4-site')] && history[cycle][button.getAttribute('data-rk4-site')].length);
        button.disabled = !available;
        button.title = available ? '' : 'Sin datos en ' + cycle;
      });
    }
    function init() {
      history = parseJson('ranking-v3-history-data', {}) || {};
      if (official.ranges) history['2026-2'] = { Lima: official.ranges.Lima || [], Juliaca: official.ranges.Juliaca || [] };
      if (supplied2025 && Array.isArray(supplied2025.rows)) {
        history[supplied2025.cycle] = history[supplied2025.cycle] || {};
        history[supplied2025.cycle][supplied2025.site] = supplied2025.rows;
      }
      history['2027-1'] = { Lima: projected('Lima'), Juliaca: projected('Juliaca') };
      all('[data-rk4-cycle]', root).forEach(function (button) {
        button.addEventListener('click', function () {
          cycle = button.getAttribute('data-rk4-cycle');
          press(null, 'data-rk4-cycle', cycle);
          if (!(history[cycle] && history[cycle][site] && history[cycle][site].length)) { site = 'Lima'; press(null, 'data-rk4-site', site); }
          render();
        });
      });
      all('[data-rk4-site]', root).forEach(function (button) {
        button.addEventListener('click', function () { site = button.getAttribute('data-rk4-site'); press(null, 'data-rk4-site', site); render(); });
      });
      $('rk4-career-search').addEventListener('input', render);
      $('rk4-careers-order').addEventListener('change', render);
      render();
    }
    return { init: init };
  })();

  currentView.init();
  selectView(state.view);
})();
