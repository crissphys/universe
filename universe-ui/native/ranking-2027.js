(function () {
  var source = window.UNIVERSE_CEPRE_2027_1;
  var section = document.getElementById('ranking-2027');
  var body = document.getElementById('ranking-2027-body');
  var head = document.getElementById('ranking-2027-head');
  var search = document.getElementById('ranking-2027-search');
  var summary = document.getElementById('ranking-2027-summary');
  var stats = document.getElementById('ranking-2027-stats');
  var scale = document.getElementById('ranking-2027-scale');
  var process = document.getElementById('ranking-process');
  if (!source || !section || !body || !head || !search || !summary || !stats || !scale || !process) return;

  var tracks = {
    pre: {
      label: 'Pre Lima',
      sede: 'Lima',
      maximum: 150,
      sourceKey: 'pre',
      exams: [
        ['pc1', '1PC', 1, true],
        ['pc2', '2PC', 1, true],
        ['ep1', '1EP', 2, false],
        ['pc3', '3PC', 1, true],
        ['pc4', '4PC', 1, true],
        ['ep2', '2EP', 4, false],
        ['pc5', '5PC', 1, true],
        ['pc6', '6PC', 1, true],
        ['pc7', '7PC', 1, false],
        ['ef', 'EF', 6, false]
      ]
    },
    basic: {
      label: 'Ciclo Básico',
      maximum: 20,
      sourceKey: 'basic',
      exams: [
        ['e1', 'Eval. 1', 1, false],
        ['e2', 'Eval. 2', 1, false],
        ['e3', 'Eval. 3', 1, false],
        ['e4', 'Eval. 4', 1, false],
        ['e5', 'Eval. 5', 1, false],
        ['e6', 'Eval. 6', 1, false],
        ['e7', 'Eval. 7', 1, false],
        ['e8', 'Eval. 8', 1, false],
        ['e9', 'Eval. 9', 1, false]
      ]
    }
  };
  tracks.juliaca = Object.assign({}, tracks.pre, { label: 'Pre Juliaca', sede: 'Juliaca' });
  var activeTrack = 'pre';
  var currentPage = 1;
  var pageSize = 50;
  var cards = document.getElementById('ranking-2027-cards');
  var clear = document.getElementById('ranking-2027-clear');
  var order = document.getElementById('ranking-2027-order');
  var allExams = document.getElementById('ranking-2027-all-exams');
  var previous = document.getElementById('ranking-2027-previous');
  var next = document.getElementById('ranking-2027-next');
  var rowCache = {};

  function normalized(value) { return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase(); }
  function motionEnabled() { return window.matchMedia && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !document.documentElement.classList.contains('motion-off'); }

  function discardedKey(row, track) {
    var pcs = track.exams.filter(function (exam) { return exam[3] && score(row[exam[0]]) != null; });
    if (track.sourceKey !== 'pre' || pcs.length < 2) return null;
    return pcs.reduce(function (a, b) { return score(row[b[0]]) < score(row[a[0]]) ? b : a; })[0];
  }

  function displayedExams(rows, track) {
    return track.exams.filter(function (exam) {
      return (allExams && allExams.checked) || rows.some(function (row) { return score(row[exam[0]]) != null || row[exam[0] + 'Status']; });
    });
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function score(value) {
    if (value == null || String(value).trim() === '' || typeof value === 'boolean') return null;
    var number = Number(value);
    return value == null || !Number.isFinite(number) ? null : number;
  }

  function format(value) {
    var number = score(value);
    return number == null ? '-' : number.toFixed(3);
  }

  function normalizeRows(track) {
    return (source[track.sourceKey] || []).filter(function (raw) {
      return !track.sede || (raw.sede || 'Lima') === track.sede;
    }).map(function (raw, index) {
      var row = Array.isArray(raw) ? { code: raw[0] } : Object.assign({}, raw);
      if (Array.isArray(raw)) row[track.sourceKey === 'pre' ? 'pc1' : 'e1'] = raw[1];
      row.originalIndex = index;
      row.average = weightedAverage(row, track);
      return row;
    }).sort(function (a, b) {
      var averageA = score(a.average);
      var averageB = score(b.average);
      if (averageA == null && averageB != null) return 1;
      if (averageA != null && averageB == null) return -1;
      if (averageA != null && averageB != null && averageA !== averageB) return averageB - averageA;
      return String(a.code).localeCompare(String(b.code));
    }).map(function (row, index) {
      row.place = index + 1;
      return row;
    });
  }

  function weightedAverage(row, track) {
    var included = [];
    var droppable = [];
    track.exams.forEach(function (exam) {
      var value = score(row[exam[0]]);
      if (value == null) return;
      var item = { key: exam[0], value: value, weight: exam[2] };
      included.push(item);
      if (exam[3]) droppable.push(item);
    });
    // Discard one currently registered PC1–PC6; keep a lone practice and PC7.
    if (track.sourceKey === 'pre' && droppable.length >= 2) {
      var lowest = droppable.reduce(function (current, item) { return item.value < current.value ? item : current; });
      included = included.filter(function (item) { return item !== lowest; });
    }
    var totalWeight = included.reduce(function (total, item) { return total + item.weight; }, 0);
    if (!totalWeight) return null;
    return included.reduce(function (total, item) { return total + item.value * item.weight; }, 0) / totalWeight;
  }

  function renderHead(track, shown) {
    var exams = shown.map(function (exam) {
      var weight = exam[2] > 1 ? ' ×' + exam[2] : '';
      return '<th scope="col" title="' + esc(exam[1] + weight) + '">' + esc(exam[1]) + weight + '</th>';
    }).join('');
    head.innerHTML = '<tr><th class="ranking-2027-place" scope="col">Puesto</th><th class="ranking-2027-code" scope="col">Código</th><th class="ranking-2027-name" scope="col">Estudiante</th><th class="ranking-2027-average" scope="col">Ponderado actual</th>' + exams + '</tr>';
  }

  function renderStats(rows, track) {
    var published = rows.filter(function (row) { return score(row.average) != null; });
    var top = published[0] || null;
    var mean = published.length ? published.reduce(function (total, row) { return total + row.average; }, 0) / published.length : null;
    stats.innerHTML = [
      ['Estudiantes', rows.length.toLocaleString('es-PE'), track.label],
      ['Con nota', published.length.toLocaleString('es-PE'), 'Evaluaciones publicadas'],
      ['Mayor ponderado', top ? format(top.average) : '-', top ? 'Código ' + top.code : 'Sin resultados'],
      ['Ponderado medio', format(mean), 'Solo evaluaciones publicadas']
    ].map(function (item) {
      return '<article><span>' + esc(item[0]) + '</span><strong>' + esc(item[1]) + '</strong><small>' + esc(item[2]) + '</small></article>';
    }).join('');
  }

  function rowHtml(row, track, shown) {
    var discarded = discardedKey(row, track);
    var cells = shown.map(function (exam) {
      var value = score(row[exam[0]]);
      var absent = row[exam[0] + 'Status'] === 'AUSENTE';
      var removed = discarded === exam[0];
      return '<td class="' + (value == null ? 'ranking-2027-pending' : removed ? 'ranking-2027-discarded' : '') + '"' + (removed ? ' title="PC descartada del ponderado"' : '') + '>' + (absent ? 'Ausente' : value == null ? '<span title="Sin nota registrada">Pendiente</span>' : format(value)) + (removed ? '<span class="sr-only">, descartada</span>' : '') + '</td>';
    }).join('');
    var medal = row.place <= 3 ? ' ranking-2027-top ranking-2027-top-' + row.place : '';
    return '<tr class="' + medal.trim() + '"><td class="ranking-2027-place"><span class="rk-place">' + row.place + '</span></td><th class="ranking-2027-code" scope="row">' + esc(row.code) + '</th><td class="ranking-2027-name">' + esc(row.name || 'No publicado') + '</td><td class="ranking-2027-average">' + format(row.average) + '</td>' + cells + '</tr>';
  }

  function cardHtml(row, track, shown) {
    var discarded = discardedKey(row, track);
    return '<details class="rk-student"><summary><span class="rk-place' + (row.place <= 3 ? ' rk-medal-' + row.place : '') + '">' + row.place + '</span><span class="rk-student-identity"><strong>' + esc(row.name || 'Nombre no publicado') + '</strong><small>' + esc(row.code) + '</small><small class="rk-card-toggle">Ver notas ↓</small></span><span class="rk-student-score"><strong>' + format(row.average) + '</strong><small>Ponderado</small></span></summary><div class="rk-score-grid"><dl>' + shown.map(function (exam) {
      var value = score(row[exam[0]]);
      var removed = discarded === exam[0];
      return '<div' + (removed ? ' data-discarded="true"' : '') + '><dt>' + esc(exam[1]) + ' ×' + exam[2] + (removed ? ' · descartada' : '') + '</dt><dd>' + (row[exam[0] + 'Status'] === 'AUSENTE' ? 'Ausente' : value == null ? 'Pendiente' : format(value)) + '</dd></div>';
    }).join('') + '</dl><p>Tu puesto corresponde a ' + esc(track.label) + '. Toca el encabezado para cerrar las notas.</p></div></details>';
  }

  function render() {
    var track = tracks[activeTrack];
    var rows = rowCache[activeTrack] || (rowCache[activeTrack] = normalizeRows(track));
    var query = normalized(search.value.trim());
    var filtered = query ? rows.filter(function (row) { return normalized(row.code + ' ' + (row.name || '')).indexOf(query) !== -1; }) : rows;
    var shown = displayedExams(rows, track);
    var sort = order ? order.value : 'average';
    filtered = filtered.slice().sort(function (a, b) {
      return sort === 'code' ? a.code.localeCompare(b.code) : sort === 'name' ? String(a.name || '\uffff').localeCompare(String(b.name || '\uffff'), 'es') || a.place - b.place : a.place - b.place;
    });
    var pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    currentPage = Math.min(currentPage, pages);
    var start = (currentPage - 1) * pageSize;
    var visible = filtered.slice(start, start + pageSize);
    renderHead(track, shown);
    renderStats(rows, track);
    scale.textContent = track.maximum === 20 ? 'Notas sobre 20' : 'Puntajes sobre 150';
    var empty = 'No encontramos ese código o nombre en ' + track.label + '. Revisa lo escrito o cambia de sede.';
    body.innerHTML = visible.length ? visible.map(function (row) { return rowHtml(row, track, shown); }).join('') : '<tr><td colspan="' + (shown.length + 4) + '" class="ranking-2027-empty">' + esc(empty) + '</td></tr>';
    if (cards) cards.innerHTML = visible.length ? visible.map(function (row) { return cardHtml(row, track, shown); }).join('') : '<p class="ranking-2027-empty">' + esc(empty) + '</p>';
    if (clear) clear.hidden = !query;
    if (previous) previous.disabled = currentPage === 1;
    if (next) next.disabled = currentPage === pages;
    summary.textContent = filtered.length ? (start + 1) + '-' + Math.min(start + pageSize, filtered.length) + ' de ' + filtered.length.toLocaleString('es-PE') + ' · Página ' + currentPage + ' de ' + pages : 'Sin resultados';
    document.querySelectorAll('.rk-method-pre').forEach(function (el) { el.hidden = track.sourceKey !== 'pre'; });
    document.querySelectorAll('.rk-method-basic').forEach(function (el) { el.hidden = track.sourceKey !== 'basic'; });
    document.querySelectorAll('.rk-table-legend').forEach(function (el) { el.textContent = track.sourceKey === 'basic' ? 'Cada evaluación tiene peso 1' : 'PC tachada = descartada'; });
    var label = document.getElementById('ranking-2027-title');
    if (label) label.textContent = track.label + ' · 2027-1';
  }

  section.querySelectorAll('[data-ranking-2027-track]').forEach(function (button) {
    button.addEventListener('click', function () {
      var selectedTrack = button.getAttribute('data-ranking-2027-track');
      activeTrack = tracks[selectedTrack] ? selectedTrack : 'pre';
      section.querySelectorAll('[data-ranking-2027-track]').forEach(function (item) {
        item.setAttribute('aria-pressed', String(item === button));
      });
      search.value = '';
      currentPage = 1;
      search.placeholder = 'Código o nombre en ' + tracks[activeTrack].label;
      render();
    });
  });

  search.addEventListener('input', function () { currentPage = 1; render(); });
  if (clear) clear.addEventListener('click', function () { search.value = ''; currentPage = 1; render(); search.focus(); });
  if (order) order.addEventListener('change', function () { currentPage = 1; render(); });
  if (allExams) allExams.addEventListener('change', render);
  function turnPage(direction) {
    currentPage += direction;
    render();
    var wrap = section.querySelector('.ranking-2027-table-wrap');
    if (wrap) wrap.scrollTop = 0;
    if (cards && window.matchMedia && window.matchMedia('(max-width:640px)').matches) cards.scrollIntoView({ block: 'start' });
  }
  if (previous) previous.addEventListener('click', function () { turnPage(-1); });
  if (next) next.addEventListener('click', function () { turnPage(1); });
  function setArchiveView(view) {
    document.querySelectorAll('[data-ranking-view]').forEach(function (tab) {
      tab.setAttribute('aria-selected', String(tab.getAttribute('data-ranking-view') === view));
    });
    var currentPanel = document.getElementById('ranking-v3-current-panel');
    var historyPanel = document.getElementById('ranking-v3-history-panel');
    if (currentPanel) currentPanel.hidden = view !== 'current';
    if (historyPanel) historyPanel.hidden = view !== 'history';
  }
  document.querySelectorAll('[data-ranking-view]').forEach(function (tab) {
    tab.addEventListener('click', function () { selectCycle(tab.getAttribute('data-ranking-view') === 'history' ? 'history' : '2026-2'); });
  });
  function selectCycle(cycle) {
    section.hidden = cycle !== '2027-1';
    var archive = document.getElementById('ranking-archive-panel');
    if (archive) archive.hidden = cycle === '2027-1';
    document.querySelectorAll('[data-ranking-cycle]').forEach(function (button) { button.setAttribute('aria-pressed', String(button.getAttribute('data-ranking-cycle') === cycle)); });
    if (cycle !== '2027-1') setArchiveView(cycle === 'history' ? 'history' : 'current');
    process.value = cycle === '2027-1' ? cycle : '2026-2';
    if (window.gsap && motionEnabled()) window.gsap.fromTo(cycle === '2027-1' ? section : archive, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .35, clearProps: 'transform,opacity' });
  }
  document.querySelectorAll('[data-ranking-cycle]').forEach(function (button) { button.addEventListener('click', function () { selectCycle(button.getAttribute('data-ranking-cycle')); }); });
  process.addEventListener('change', function () { selectCycle(process.value); });

  render();
  if (window.gsap && motionEnabled()) {
    window.gsap.fromTo('.rk-hero-copy > *, .rk-cycle-card', { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: .055, duration: .55, ease: 'power3.out', clearProps: 'transform,opacity' });
  }
})();
