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
      label: 'Ciclo Pre',
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
  var activeTrack = 'pre';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function score(value) {
    var number = Number(value);
    return value == null || !Number.isFinite(number) ? null : number;
  }

  function format(value) {
    var number = score(value);
    return number == null ? '-' : number.toFixed(3);
  }

  function normalizeRows(track) {
    return (source[track.sourceKey] || []).map(function (raw, index) {
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
    if (track.sourceKey === 'pre' && droppable.length === 6) {
      var lowest = droppable.reduce(function (current, item) { return item.value < current.value ? item : current; });
      included = included.filter(function (item) { return item !== lowest; });
    }
    var totalWeight = included.reduce(function (total, item) { return total + item.weight; }, 0);
    if (!totalWeight) return null;
    return included.reduce(function (total, item) { return total + item.value * item.weight; }, 0) / totalWeight;
  }

  function renderHead(track) {
    var exams = track.exams.map(function (exam) {
      var weight = exam[2] > 1 ? ' ×' + exam[2] : '';
      return '<th title="' + esc(exam[1] + weight) + '">' + esc(exam[1]) + weight + '</th>';
    }).join('');
    head.innerHTML = '<tr><th class="ranking-2027-place">Puesto</th><th class="ranking-2027-code">Código</th>' + exams + '<th class="ranking-2027-average">Ponderado</th></tr>';
  }

  function renderStats(rows, track) {
    var published = rows.filter(function (row) { return score(row.average) != null; });
    var top = published[0] || null;
    var mean = published.length ? published.reduce(function (total, row) { return total + row.average; }, 0) / published.length : null;
    stats.innerHTML = [
      ['Códigos', rows.length.toLocaleString('es-PE'), track.label],
      ['Con nota', published.length.toLocaleString('es-PE'), 'Primera evaluación publicada'],
      ['Mayor nota', top ? format(top.average) : '-', top ? 'Código ' + top.code : 'Sin resultados'],
      ['Promedio', format(mean), 'Solo evaluaciones publicadas']
    ].map(function (item) {
      return '<article><span>' + esc(item[0]) + '</span><strong>' + esc(item[1]) + '</strong><small>' + esc(item[2]) + '</small></article>';
    }).join('');
  }

  function rowHtml(row, track) {
    var cells = track.exams.map(function (exam) {
      var value = score(row[exam[0]]);
      return '<td' + (value == null ? ' class="ranking-2027-pending"' : '') + '>' + format(value) + '</td>';
    }).join('');
    var medal = row.place <= 3 ? ' ranking-2027-top ranking-2027-top-' + row.place : '';
    return '<tr class="' + medal.trim() + '"><td class="ranking-2027-place">' + row.place + '</td><th class="ranking-2027-code" scope="row">' + esc(row.code) + '</th>' + cells + '<td class="ranking-2027-average">' + format(row.average) + '</td></tr>';
  }

  function render() {
    var track = tracks[activeTrack];
    var rows = normalizeRows(track);
    var query = search.value.trim().toUpperCase();
    var filtered = query ? rows.filter(function (row) { return String(row.code).toUpperCase().indexOf(query) !== -1; }) : rows;
    renderHead(track);
    renderStats(rows, track);
    scale.textContent = track.maximum === 20 ? 'Notas sobre 20' : 'Puntajes sobre 150';
    body.innerHTML = filtered.length ? filtered.map(function (row) { return rowHtml(row, track); }).join('') : '<tr><td colspan="13" class="ranking-2027-empty">No se encontró ese código en ' + esc(track.label) + ' 2027-1.</td></tr>';
    summary.textContent = query
      ? 'Mostrando ' + filtered.length.toLocaleString('es-PE') + ' coincidencia' + (filtered.length === 1 ? '' : 's') + ' de ' + rows.length.toLocaleString('es-PE') + ' códigos.'
      : 'Mostrando los ' + rows.length.toLocaleString('es-PE') + ' códigos, del primer al último puesto. Solo se ponderan notas publicadas.';
  }

  section.querySelectorAll('[data-ranking-2027-track]').forEach(function (button) {
    button.addEventListener('click', function () {
      activeTrack = button.getAttribute('data-ranking-2027-track') === 'basic' ? 'basic' : 'pre';
      section.querySelectorAll('[data-ranking-2027-track]').forEach(function (item) {
        item.setAttribute('aria-pressed', String(item === button));
      });
      search.value = '';
      search.placeholder = 'Buscar código de ' + tracks[activeTrack].label;
      render();
    });
  });

  search.addEventListener('input', render);
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
    tab.addEventListener('click', function () { setArchiveView(tab.getAttribute('data-ranking-view')); });
  });
  process.addEventListener('change', function () {
    if (process.value === '2026-2') {
      setArchiveView('current');
      var archive = document.getElementById('ranking-archive');
      if (archive) archive.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  render();
})();
