/* Ranking CEPREUNI v5. Las notas vienen de sus archivos de datos; aquí solo se ordenan y se explican. */
(function () {
  'use strict';
  var cur = window.UNIVERSE_CEPRE_2027_1 || null;
  var official = {}; // 2026-2 y rangos: se cargan al abrir esas vistas
  var h2025 = null;
  var PAGE = 50;
  var MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
  var mobile = window.matchMedia ? window.matchMedia('(max-width: 979px)') : { matches: false, addEventListener: function () {} };

  /* ---------- utils ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fold(v) { return String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase(); }
  function words(q) { return fold(q).split(/\s+/).filter(Boolean); }
  function hasAll(text, ws) { return ws.every(function (w) { return text.indexOf(w) !== -1; }); }
  function score(v) { if (v == null || typeof v === 'boolean' || String(v).trim() === '') return null; var n = Number(v); return isFinite(n) ? n : null; }
  function fmt(v, d) { var n = score(v); return n == null ? '—' : n.toFixed(d == null ? 3 : d); }
  function int(v) { return Number(v || 0).toLocaleString('es-PE'); }
  function dateEs(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); return m ? Number(m[3]) + ' ' + MONTHS[Number(m[2]) - 1] + ' ' + m[1] : '—'; }
  function median(a) { if (!a.length) return null; var s = a.slice().sort(function (x, y) { return x - y; }), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
  function nice(x) { var p = Math.pow(10, Math.floor(Math.log10(x))), f = x / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; }
  function parseExt(o, key) { return o && o.hasOwnProperty(key) ? Number(o[key]) : undefined; }
  var X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  var SEARCH = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';

  /* ---------- URL (vista, sede, q) ---------- */
  var params = new URLSearchParams(location.search);
  var S = {
    tab: ({ '2026-2': 'f', carreras: 'r' })[params.get('vista')] || 'c',
    track: ({ juliaca: 'juliaca', basico: 'basic' })[params.get('sede')] || 'pre',
    q: params.get('q') || ''
  };
  function syncUrl() {
    var n = new URLSearchParams();
    if (S.tab === 'f') n.set('vista', '2026-2'); if (S.tab === 'r') n.set('vista', 'carreras');
    if (S.tab === 'c' && S.track !== 'pre') n.set('sede', S.track === 'basic' ? 'basico' : 'juliaca');
    if (S.tab === 'c' && boards.c && boards.c.q) n.set('q', boards.c.q);
    try { history.replaceState(null, '', location.pathname + (n.toString() ? '?' + n : '')); } catch (e) { /* file:// */ }
  }

  /* ---------- datasets ---------- */
  var PRE = [
    { key: 'pc1', label: '1.ª práctica', step: '1PC', weight: 1, drop: true },
    { key: 'pc2', label: '2.ª práctica', step: '2PC', weight: 1, drop: true },
    { key: 'ep1', label: '1.er parcial', step: '1EP', weight: 2 },
    { key: 'pc3', label: '3.ª práctica', step: '3PC', weight: 1, drop: true },
    { key: 'pc4', label: '4.ª práctica', step: '4PC', weight: 1, drop: true },
    { key: 'ep2', label: '2.º parcial', step: '2EP', weight: 4 },
    { key: 'pc5', label: '5.ª práctica', step: '5PC', weight: 1, drop: true },
    { key: 'pc6', label: '6.ª práctica', step: '6PC', weight: 1, drop: true },
    { key: 'pc7', label: '7.ª práctica', step: '7PC', weight: 1 },
    { key: 'ef', label: 'Examen final', step: 'EF', weight: 6 }
  ];
  var BASIC = []; for (var b = 1; b <= 9; b++) BASIC.push({ key: 'e' + b, label: b + '.ª evaluación', weight: 1 });
  var TRACKS = {
    pre: { label: 'Pre Lima', sede: 'Lima', src: 'pre', max: 150, metas: PRE },
    juliaca: { label: 'Pre Juliaca', sede: 'Juliaca', src: 'pre', max: 150, metas: PRE },
    basic: { label: 'Ciclo Básico', sede: null, src: 'basic', max: 20, metas: BASIC }
  };

  // Todo examen publicado cuenta: una ausencia o una nota aún no publicada vale 0 hasta que cambie.
  function finish(ds) {
    ds.rows.sort(function (a, c) {
      if ((a.avg == null) !== (c.avg == null)) return a.avg == null ? 1 : -1;
      if (a.avg !== c.avg) return c.avg - a.avg;
      return String(a.code).localeCompare(String(c.code));
    });
    ds.rows.forEach(function (r, i) { r.place = r.avg == null ? null : i + 1; });
    ds.placed = ds.rows.filter(function (r) { return r.avg != null; });
    ds.scored = ds.pop ? ds.placed.filter(ds.pop) : ds.placed;
    ds.metas.forEach(function (m, i) {
      var list = ds.rows.filter(function (r) { return r.v[i].real; }).sort(function (a, c) { return c.v[i].value - a.v[i].value; });
      var prev = null, p = 0;
      list.forEach(function (r, k) { if (r.v[i].value !== prev) { p = k + 1; prev = r.v[i].value; } r.v[i].rank = p; r.v[i].of = list.length; });
    });
    var vals = ds.scored.map(function (r) { return r.avg; });
    ds.median = median(vals);
    ds.mean = vals.length ? vals.reduce(function (s, x) { return s + x; }, 0) / vals.length : null;
    return ds;
  }
  function applyDrop(row, metas) {
    var inc = row.v.map(function (v, i) { return { i: i, v: v.value, w: metas[i].weight, drop: metas[i].drop }; });
    var cand = inc.filter(function (x) { return x.drop; });
    if (cand.length >= 2) {
      var low = cand.reduce(function (l, x) { return x.v < l.v ? x : l; });
      row.v[low.i].state = 'dropped';
      inc = inc.filter(function (x) { return x !== low; });
    }
    var w = inc.reduce(function (s, x) { return s + x.w; }, 0);
    row.sum = inc.reduce(function (s, x) { return s + x.v * x.w; }, 0);
    row.den = w;
    row.avg = w ? row.sum / w : null;
  }

  function rowFrom(r, metas) {
    var row = { code: r.code, name: r.name || '', sede: r.sede || '', search: fold(r.code + ' ' + (r.name || '')) };
    row.v = metas.map(function (m) {
      var s = score(r[m.key]), absent = r[m.key + 'Status'] === 'AUSENTE';
      return { value: s == null ? 0 : s, real: s != null && !absent, state: absent ? 'absent' : s == null ? 'pending' : 'counted' };
    });
    applyDrop(row, metas);
    return row;
  }
  // Gancho para tools/test-cepre-2027-ranking.mjs: el cálculo corre también sin DOM.
  window.UNIVERSE_RANKING_V5 = {
    score: score,
    tracks: Object.keys(TRACKS).reduce(function (o, k) { o[k] = { label: TRACKS[k].label, exams: TRACKS[k].metas }; return o; }, {}),
    weighted: function (raw, track, exams) {
      var metas = exams || track.exams, row = rowFrom(raw, metas);
      var i = row.v.map(function (v) { return v.state; }).indexOf('dropped');
      return { average: row.avg, dropped: i < 0 ? null : metas[i].key };
    }
  };
  if (!document.getElementById('p-c')) return;

  var cacheC = {};
  function buildCurrent(key) {
    if (cacheC[key]) return cacheC[key];
    var t = TRACKS[key];
    var raws = ((cur && cur[t.src]) || []).filter(function (r) { return !t.sede || (r.sede || 'Lima') === t.sede; });
    var metas = t.metas.filter(function (m) { return raws.some(function (r) { return score(r[m.key]) != null || r[m.key + 'Status']; }); });
    var rows = raws.map(function (r) { return rowFrom(r, metas); });
    return (cacheC[key] = finish({ label: t.label, max: t.max, scoreLabel: t.src === 'basic' ? 'Promedio' : 'Ponderado', metas: metas, rows: rows, hasNames: rows.some(function (r) { return r.name; }), dropText: 'Tu nota más baja entre las prácticas no cuenta' }));
  }

  var F_METAS = [
    { key: 'pc1', label: '1.ª práctica', weight: 1, drop: true }, { key: 'pc2', label: '2.ª práctica', weight: 1, drop: true },
    { key: 'pc3', label: '3.ª práctica', weight: 1, drop: true }, { key: 'pc4', label: '4.ª práctica', weight: 1, drop: true },
    { key: 'pc5', label: '5.ª práctica', weight: 1, drop: true }, { key: 'pc6', label: '6.ª práctica', weight: 1, drop: true },
    { key: 'pc7', label: '7.ª práctica', weight: 1 }, { key: 'ep1', label: '1.er parcial', weight: 2 },
    { key: 'ep2', label: '2.º parcial', weight: 4 }, { key: 'ef', label: 'Examen final', weight: 6 }
  ];
  var fRaw = null, cacheF = {};
  function buildFinal(site) {
    if (cacheF[site]) return cacheF[site];
    if (!fRaw) {
      var data = window.UNIVERSE_RANKING_2026_2 || [], ex = official.examScores || {}, fin = ex.ef || official.finalScores || {};
      var cols = { pc1: 2, pc2: 3, pc3: 4, pc4: 5, pc5: 6, pc6: 7, pc7: 8, ep1: 9, ep2: 10 };
      var ent = {}; (official.entrants || []).forEach(function (e) { ent[e.codigo] = e; });
      fRaw = data.map(function (r) {
        var row = r.slice();
        Object.keys(cols).forEach(function (k) { var x = parseExt(ex[k], row[1]); if (x !== undefined) row[cols[k]] = x; });
        var ef = parseExt(fin, row[1]); if (ef === undefined) ef = 0;
        return { code: row[1], sede: row[12] || 'Lima', vals: row.slice(2, 11).map(Number).concat(ef), entrant: ent[row[1]] || null };
      });
    }
    var rows = fRaw.filter(function (r) { return !site || r.sede === site; }).map(function (r) {
      var row = { code: r.code, name: r.entrant ? r.entrant.nombres : '', sede: r.sede, entrant: r.entrant, search: fold(r.code + ' ' + (r.entrant ? r.entrant.nombres : '')) };
      row.v = r.vals.map(function (x) { var ok = x > 0; return { value: x || 0, real: ok, state: ok ? 'counted' : 'pending' }; });
      applyDrop(row, F_METAS);
      return row;
    });
    return (cacheF[site] = finish({ label: site ? 'Ciclo Pre ' + site : 'Ciclo Pre', max: 150, scoreLabel: 'Final', metas: F_METAS, rows: rows, hasNames: false, pop: function (r) { return r.v[9].real; }, evaluated: site ? (official.evaluated || {})[site] : (official.evaluated || {}).total, dropText: 'Tu nota más baja entre las prácticas no cuenta', pendingText: 'Sin nota registrada · cuenta 0' }));
  }

  /* ---------- histogram ---------- */
  function histData(ds) {
    if (ds._h) return ds._h;
    var v = ds.scored.map(function (r) { return r.avg; });
    var min = Math.min.apply(null, v), max = Math.max.apply(null, v);
    var step = nice(Math.max(max - min, 1e-6) / 16);
    var lo = Math.floor(min / step) * step, n = Math.max(1, Math.ceil((max - lo) / step - 1e-9));
    var counts = []; for (var i = 0; i < n; i++) counts.push(0);
    v.forEach(function (x) { counts[Math.min(n - 1, Math.floor((x - lo) / step))]++; });
    return (ds._h = { lo: lo, hi: lo + n * step, step: step, counts: counts, top: Math.max.apply(null, counts) });
  }
  function hdec(step) { return step >= 1 ? 0 : 1; }
  function histHTML(ds, o) {
    if (!ds.scored.length) return '';
    var h = histData(ds), d = hdec(h.step), span = h.hi - h.lo;
    var bars = h.counts.map(function (c, i) {
      var a = h.lo + i * h.step, z = a + h.step, on = o.range && o.range[0] === a;
      var label = fmt(a, d) + '–' + fmt(z, d) + ': ' + int(c) + (c === 1 ? ' estudiante' : ' estudiantes');
      var style = ' style="--h:' + (c / h.top * 100).toFixed(1) + '%"';
      return o.link
        ? '<button type="button" class="bin" data-lo="' + a + '" data-hi="' + z + '" data-tip="' + esc(label) + '" data-on="' + !!on + '" aria-label="' + esc(label) + '" aria-pressed="' + !!on + '"' + style + '></button>'
        : '<span class="bin" role="presentation"' + style + '></span>';
    }).join('');
    function at(x) { return Math.max(0, Math.min(100, (x - h.lo) / span * 100)); }
    var med = ds.median, youAt = o.mark == null ? null : at(o.mark);
    var showMed = youAt == null || Math.abs(at(med) - youAt) > 14;
    return '<div class="hist">' +
      '<div class="mk mk-med" style="left:' + at(med).toFixed(2) + '%"><span' + (showMed ? '' : ' hidden') + '>Mediana</span></div>' +
      (youAt != null ? '<div class="mk mk-you" style="left:' + youAt.toFixed(2) + '%"><span>' + fmt(o.mark, ds.max === 150 ? 1 : 2) + '</span></div>' : '') +
      '<div class="hist-bars" role="group" aria-label="Distribución de notas">' + bars + '</div>' +
      '<div class="hist-axis" aria-hidden="true"><span>' + fmt(h.lo, d) + '</span><span>' + fmt(h.hi, d) + '</span></div>' +
      (o.link ? '<p class="hist-tip" aria-live="polite">Toca una barra para filtrar</p>' : '') + '</div>';
  }
  function sdOf(a, m) { return a.length ? Math.sqrt(a.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / a.length) : null; }
  // Desviación estándar poblacional; máximos y mínimos solo con notas reales (sin ausentes ni pendientes).
  function statsOf(ds) {
    if (ds._st) return ds._st;
    var vals = ds.scored.map(function (r) { return r.avg; });
    var per = ds.metas.map(function (m, i) {
      var rows = ds.rows.filter(function (r) { return r.v[i].real; });
      if (!rows.length) return { label: m.label, n: 0 };
      var v = rows.map(function (r) { return r.v[i].value; }), mu = v.reduce(function (s, x) { return s + x; }, 0) / v.length;
      var hi = rows.reduce(function (a, r) { return r.v[i].value > a.v[i].value ? r : a; }, rows[0]);
      var lo = rows.reduce(function (a, r) { return r.v[i].value < a.v[i].value ? r : a; }, rows[0]);
      return { label: m.label, n: v.length, sd: sdOf(v, mu), max: hi.v[i].value, maxWho: hi.name || hi.code, min: lo.v[i].value, minWho: lo.name || lo.code };
    });
    return (ds._st = { sd: sdOf(vals, ds.mean), min: Math.min.apply(null, vals), per: per });
  }
  var SLIDES = ['Distribución', 'Resumen', 'Desviación estándar por prueba', 'Nota máxima por prueba', 'Nota mínima por prueba'];
  function summaryHTML(ds) {
    var st = statsOf(ds), top = ds.scored[0];
    function item(l, v, n) { return '<div><dt>' + l + '</dt><dd><strong>' + v + '</strong>' + (n ? '<small>' + esc(n) + '</small>' : '') + '</dd></div>'; }
    return '<dl class="stats">' + item('Estudiantes', int(ds.evaluated != null ? ds.evaluated : ds.rows.length)) + item('Primer puesto', fmt(top.avg, 2), top.name || top.code) +
      item('Mediana', fmt(ds.median, 2), 'sobre ' + ds.max) + item('Media', fmt(ds.mean, 2)) + item('Desv. estándar', fmt(st.sd, 2)) + item('Más baja', fmt(st.min, 2)) + '</dl>';
  }
  function metricHTML(ds, key) {
    var per = statsOf(ds).per, scale = key === 'sd' ? (Math.max.apply(null, per.map(function (p) { return p.n ? p.sd : 0; })) || 1) : ds.max;
    return '<ul class="metric">' + per.map(function (p) {
      return '<li><span>' + esc(p.label) + '</span><b>' + (p.n ? fmt(p[key], 2) : '—') + '</b><i style="--w:' + (p.n ? Math.min(100, p[key] / scale * 100) : 0).toFixed(1) + '%"></i></li>';
    }).join('') + '</ul>';
  }
  function tableHTML(ds) {
    return '<table class="ptable"><thead><tr><th scope="col">Prueba</th><th scope="col" title="Desviación estándar">Desv. est.</th><th scope="col">Máxima</th><th scope="col">Mínima</th></tr></thead><tbody>' +
      statsOf(ds).per.map(function (p) {
        if (!p.n) return '<tr><th scope="row">' + esc(p.label) + '</th><td>—</td><td>—</td><td>—</td></tr>';
        return '<tr><th scope="row">' + esc(p.label) + '</th><td>' + fmt(p.sd, 2) + '</td><td title="' + esc(p.maxWho) + '">' + fmt(p.max, 2) + '</td><td title="' + esc(p.minWho) + '">' + fmt(p.min, 2) + '</td></tr>';
      }).join('') + '</tbody></table>';
  }
  var CHEV_L = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg>', CHEV_R = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
  // Celular: carrusel con flechas; pantallas grandes: todo a la vista debajo del gráfico.
  function panoHTML(ds) {
    if (!ds.scored.length) return '';
    function sec(i, cls, body) { return '<section class="slide ' + cls + '" aria-label="' + SLIDES[i] + '"><h3>' + SLIDES[i] + '</h3>' + body + '</section>'; }
    return '<div class="pano-head"><button type="button" class="pv prev" aria-label="Datos anteriores" disabled>' + CHEV_L + '</button><h3 class="pv-title" aria-live="polite">' + SLIDES[0] + '</h3><button type="button" class="pv next" aria-label="Más datos">' + CHEV_R + '</button></div>' +
      '<div class="slides" role="group" aria-roledescription="carrusel" aria-label="Estadísticas">' +
      sec(0, '', histHTML(ds, { link: true, range: ds._range })) + sec(1, '', summaryHTML(ds)) +
      sec(2, 'm-only', metricHTML(ds, 'sd')) + sec(3, 'm-only', metricHTML(ds, 'max')) + sec(4, 'm-only', metricHTML(ds, 'min')) +
      '<section class="slide d-only" aria-label="Por prueba"><h3>Por prueba</h3>' + tableHTML(ds) + '</section></div>' +
      '<div class="dots" aria-hidden="true"><i aria-current="true"></i><i></i><i></i><i></i><i></i></div>';
  }

  /* ---------- result ---------- */
  function pctAbove(ds, row) {
    var below = ds.scored.filter(function (r) { return r.avg < row.avg; }).length, p = below / ds.scored.length * 100;
    return p >= 99 ? Math.floor(p * 10) / 10 : Math.round(p);
  }
  function resultHTML(ds, row) {
    var big;
    if (row.place == null) big = '<p class="res-empty">Sin notas registradas.</p>';
    else big = '<div class="big"><div class="place">#' + int(row.place) + '<small>de ' + int(ds.placed.length) + '</small></div><div class="grade"><strong>' + fmt(row.avg) + '</strong><small>' + ds.scoreLabel.toLowerCase() + ' · sobre ' + ds.max + '</small></div></div>' +
      '<p class="pct">' + (row.place === 1 ? '<b>Primer puesto</b>' : 'Por encima del <b>' + pctAbove(ds, row) + ' %</b> de los estudiantes') + '</p>' +
      histHTML(ds, { mark: row.avg });
    var items = ds.metas.map(function (m, i) {
      var v = row.v[i], s = v.state;
      var note = s === 'dropped' ? ds.dropText : s === 'absent' ? 'Ausente · cuenta 0' : s === 'pending' ? (ds.pendingText || 'Nota no publicada · cuenta 0') : '';
      var rank = v.real ? 'Puesto ' + int(v.rank) + ' de ' + int(v.of) : '';
      var val = s === 'absent' ? 'Ausente' : fmt(v.value, ds.max === 150 ? 2 : 2);
      return '<li data-s="' + s + '"><span class="n">' + esc(m.label) + '<span class="w" title="Peso">×' + m.weight + '</span></span><span class="v">' + val + '</span>' +
        '<span class="bar"><i style="--w:' + Math.min(100, v.value / ds.max * 100).toFixed(1) + '%"></i></span>' +
        '<span class="note">' + esc([rank, note].filter(Boolean).join(' · ')) + '</span></li>';
    }).join('');
    var inc = ds.metas.map(function (m, i) { return { m: m, v: row.v[i] }; }).filter(function (x) { return x.v.state !== 'dropped'; });
    var calc = row.avg == null ? '' : '<p class="calc"><b>Nota × peso</b><br>' + inc.map(function (x) { return fmt(x.v.value, 2) + '×' + x.m.weight; }).join(' + ') +
      '<span class="eq">' + fmt(row.sum, 2) + ' ÷ ' + row.den + ' = <strong>' + fmt(row.avg) + '</strong></span></p>';
    return '<header class="res-head"><div><p class="res-k">' + esc(ds.label) + '</p><h2 id="res-title">' + esc(row.name || (ds.hasNames ? 'Nombre no publicado' : 'Código ' + row.code)) + '</h2>' +
      (row.name || ds.hasNames ? '<p class="code mono">' + esc(row.code) + '</p>' : '') + '</div><button type="button" class="x" data-close aria-label="Cerrar">' + X + '</button></header>' +
      big + '<h3>Cómo se calculó</h3><ol class="ex">' + items + '</ol>' + calc;
  }

  /* ---------- board (lista + panel) ---------- */
  var boards = {};
  var scrim = $('#scrim');
  function makeBoard(id, opt) {
    var root = $('#p-' + id);
    root.innerHTML =
      '<div class="board"><div class="main">' +
      '<label class="search">' + SEARCH + '<span class="sr">Buscar</span><input type="search" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search"><button type="button" class="clear" aria-label="Borrar búsqueda" hidden>' + X + '</button></label>' +
      '<div class="pills" role="group" aria-label="Filtros"></div>' +
      '<div class="pano pano-inline"></div>' +
      '<div class="list-head"><p class="count" aria-live="polite"></p><label class="sort"><span>Orden</span><select><option value="place">Puesto</option><option value="code">Código</option>' + (opt.names ? '<option value="name">Nombre</option>' : '') + '</select></label></div>' +
      '<div class="chips"></div><ul class="rows"></ul><button type="button" class="more" hidden></button>' +
      '</div><aside class="side" aria-label="Detalle"><div class="pano pano-side"></div><div class="res" id="res-' + id + '" hidden></div></aside></div>';
    var el = {
      input: $('input', root), clear: $('.clear', root), pills: $('.pills', root), inline: $('.pano-inline', root), side: $('.side', root),
      pano: $('.pano-side', root), res: $('.res', root), count: $('.count', root), sort: $('select', root), chips: $('.chips', root), rows: $('.rows', root), more: $('.more', root)
    };
    var B = { q: '', sort: 'place', shown: PAGE, sel: null, ds: null, list: [], slide: 0 };
    boards[id] = B;
    el.input.placeholder = opt.placeholder;

    function slidesEl() { return $('.slides', el.inline); }
    function syncSlides() {
      var s = slidesEl(); if (!s) return;
      var n = $$('.slide', s).filter(function (x) { return x.offsetWidth; }).length;
      B.slide = Math.max(0, Math.min(n - 1, Math.round(s.scrollLeft / (s.clientWidth || 1))));
      $('.pv-title', el.inline).textContent = SLIDES[B.slide];
      $('.prev', el.inline).disabled = B.slide === 0; $('.next', el.inline).disabled = B.slide >= n - 1;
      $$('.dots i', el.inline).forEach(function (d, i) { if (i === B.slide) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    }
    el.inline.addEventListener('scroll', function () { cancelAnimationFrame(B.raf); B.raf = requestAnimationFrame(syncSlides); }, true);
    el.inline.addEventListener('click', function (e) {
      var b = e.target.closest('.pv'); if (!b || b.disabled) return;
      var s = slidesEl(), to = B.slide + (b.classList.contains('next') ? 1 : -1);
      s.scrollTo({ left: to * s.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    window.addEventListener('resize', syncSlides);

    function closeSheet() {
      el.side.classList.remove('is-open'); scrim.hidden = true; document.body.style.overflow = '';
      el.side.removeAttribute('role'); el.side.removeAttribute('aria-modal');
    }
    function selectRow(code, focus) {
      var ds = B.ds, row = ds.rows.filter(function (r) { return r.code === code; })[0];
      B.sel = row ? code : null;
      el.res.hidden = !row; el.pano.hidden = !!row;
      if (row) {
        el.res.innerHTML = resultHTML(ds, row);
        el.res.setAttribute('aria-labelledby', 'res-title');
        if (mobile.matches) {
          el.side.classList.add('is-open'); scrim.hidden = false; document.body.style.overflow = 'hidden';
          el.side.setAttribute('role', 'dialog'); el.side.setAttribute('aria-modal', 'true');
          if (focus) $('[data-close]', el.res).focus({ preventScroll: true });
        }
      } else closeSheet();
      $$('.row', el.rows).forEach(function (b) { b.setAttribute('aria-expanded', String(b.getAttribute('data-code') === B.sel)); });
    }
    function deselect(returnFocus) {
      var code = B.sel; selectRow(null);
      if (returnFocus && code) { var b = $('.row[data-code="' + code + '"]', el.rows); if (b) b.focus({ preventScroll: true }); }
    }
    B.select = selectRow;

    function rowHTML(r, ds) {
      var m = r.place && r.place <= 3 ? ' m' + r.place : '';
      var title = r.name || (ds.hasNames ? 'Nombre no publicado' : r.code);
      var small = (r.name || ds.hasNames ? '<span class="mono">' + esc(r.code) + '</span>' : '') + (opt.sedeTag && r.sede ? '<span>' + esc(r.sede) + '</span>' : '') +
        (r.entrant ? '<span class="tag tag-in" title="' + esc(r.entrant.especialidad + ' · ' + r.entrant.facultad) + '">' + esc(r.entrant.codigoEspecialidad) + ' · ' + esc(r.entrant.especialidad) + '</span>' : '');
      return '<li><button type="button" class="row" data-code="' + esc(r.code) + '" aria-expanded="' + (r.code === B.sel) + '">' +
        '<span class="pl' + m + '">' + (r.place == null ? '—' : r.place) + '</span>' +
        '<span class="who"><b>' + esc(title) + '</b>' + (small ? '<small>' + small + '</small>' : '') + '</span>' +
        '<span class="sc"><b>' + fmt(r.avg) + '</b><i style="--w:' + (r.avg == null ? 0 : Math.min(100, r.avg / ds.max * 100)).toFixed(1) + '%"></i></span></button></li>';
    }

    function render(keepShown) {
      var ds = B.ds = opt.dataset();
      if (!keepShown) B.shown = PAGE;
      var ws = words(B.q);
      var list = ds.rows.filter(function (r) { return (!ws.length || hasAll(r.search, ws)) && (!ds._range || (r.avg != null && r.avg >= ds._range[0] && r.avg < ds._range[1] + (ds._range[1] >= histData(ds).hi ? 1e-9 : 0))) && (!opt.filter || opt.filter(r)); });
      if (B.sort !== 'place') list = list.slice().sort(function (a, c) {
        return B.sort === 'code' ? String(a.code).localeCompare(String(c.code)) : String(a.name || '￿').localeCompare(String(c.name || '￿'), 'es') || String(a.code).localeCompare(String(c.code));
      });
      B.list = list;
      var vis = list.slice(0, B.shown);
      el.rows.innerHTML = vis.length ? vis.map(function (r) { return rowHTML(r, ds); }).join('') : '<li class="empty">' + (B.q ? 'Sin resultados para «' + esc(B.q.trim()) + '»' : 'Sin estudiantes') + '</li>';
      el.count.innerHTML = list.length === ds.rows.length ? '<b>' + int(list.length) + '</b> en la lista' : '<b>' + int(list.length) + '</b> de ' + int(ds.rows.length);
      var left = list.length - vis.length;
      el.more.hidden = left <= 0; el.more.textContent = 'Mostrar ' + Math.min(PAGE, left) + ' más';
      el.chips.innerHTML = ds._range ? '<button type="button" class="chip" data-unrange>' + fmt(ds._range[0], hdec(histData(ds).step)) + '–' + fmt(ds._range[1], hdec(histData(ds).step)) + X + '<span class="sr">Quitar filtro</span></button>' : '';
      var pkey = String(ds._range);
      if (B.pds !== ds || B.pkey !== pkey) {
        B.pds = ds; B.pkey = pkey;
        var p = panoHTML(ds); el.inline.innerHTML = p; el.pano.innerHTML = p;
        var s0 = slidesEl(); if (s0 && B.slide) s0.scrollLeft = B.slide * s0.clientWidth;
        syncSlides();
      }
      el.clear.hidden = !B.q;
      el.input.placeholder = ds.hasNames || opt.names ? opt.placeholder : 'Busca tu código';
      el.pills.innerHTML = opt.pills(ds);
      if (B.sel) {
        if (ds.rows.some(function (r) { return r.code === B.sel; })) { var keep = B.sel; B.sel = null; selectRow(keep); } else deselect();
      }
      var only = list.length === 1 && B.q ? list[0] : null;
      if (only && !mobile.matches && B.sel !== only.code) selectRow(only.code);
    }
    B.render = render;
    B.reset = function () { B.q = ''; el.input.value = ''; ds_reset(); render(); };
    function ds_reset() { if (B.ds) B.ds._range = null; }

    var timer;
    el.input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { B.q = el.input.value; render(); syncUrl(); }, 110);
    });
    el.input.addEventListener('keydown', function (e) { if (e.key === 'Escape' && el.input.value) { e.preventDefault(); el.clear.click(); } });
    el.clear.addEventListener('click', function () { el.input.value = ''; B.q = ''; render(); syncUrl(); el.input.focus(); });
    el.sort.addEventListener('change', function () { B.sort = el.sort.value; render(); });
    el.more.addEventListener('click', function () { B.shown += PAGE; render(true); });
    el.pills.addEventListener('click', function (e) {
      var b = e.target.closest('[data-k]'); if (!b || b.disabled) return;
      opt.pick(b.getAttribute('data-k'), b.getAttribute('data-v'));
      if (B.ds) B.ds._range = null;
      B.sel = null; closeSheet(); render(); syncUrl();
    });
    function barPick(e) {
      var bin = e.target.closest('.bin[data-lo]'); if (!bin) return false;
      var lo = Number(bin.getAttribute('data-lo')), hi = Number(bin.getAttribute('data-hi'));
      B.ds._range = B.ds._range && B.ds._range[0] === lo ? null : [lo, hi];
      render();
      if (B.ds._range && mobile.matches) el.rows.scrollIntoView({ block: 'start', behavior: 'smooth' });
      return true;
    }
    function tip(e) { var bin = e.target.closest('.bin[data-tip]'); if (!bin) return; var t = $('.hist-tip', bin.closest('.pano')); if (t) t.textContent = bin.getAttribute('data-tip'); }
    [el.inline, el.pano].forEach(function (p) { p.addEventListener('click', barPick); p.addEventListener('mouseover', tip); p.addEventListener('focusin', tip); });
    el.chips.addEventListener('click', function (e) { if (e.target.closest('[data-unrange]')) { B.ds._range = null; render(); } });
    el.rows.addEventListener('click', function (e) {
      var b = e.target.closest('.row'); if (!b) return;
      var code = b.getAttribute('data-code');
      if (B.sel === code && !mobile.matches) deselect(); else selectRow(code, true);
    });
    el.res.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) deselect(true); });
    root.addEventListener('keydown', function (e) { if (e.key === 'Escape' && B.sel && !e.defaultPrevented) deselect(true); });
    scrim.addEventListener('click', function () { if (boards[S.tab] && boards[S.tab].sel) boards[S.tab].select(null); });
    return B;
  }

  function pill(k, v, label, on, extra, dis) {
    return '<button type="button" class="pill' + (k === 'only' ? ' pill-switch' : '') + '" data-k="' + k + '" data-v="' + v + '" aria-pressed="' + on + '"' + (dis ? ' disabled' : '') + '>' + (k === 'only' ? '<i></i>' : '') + label + (extra ? ' <small>' + extra + '</small>' : '') + '</button>';
  }

  /* ---------- 2027-1 ---------- */
  var cB = makeBoard('c', {
    placeholder: 'Busca tu código o nombre', names: true, sedeTag: false,
    dataset: function () { return buildCurrent(S.track); },
    pills: function () {
      return Object.keys(TRACKS).map(function (k) { return pill('track', k, TRACKS[k].label, S.track === k, int(buildCurrent(k).rows.length)); }).join('');
    },
    pick: function (k, v) { if (k === 'track') S.track = v; }
  });
  cB.q = S.q;

  /* ---------- 2026-2 ---------- */
  var fSite = '', fOnly = false;
  function mountFinal() {
    makeBoard('f', {
      placeholder: 'Busca tu código o nombre', names: true, sedeTag: true,
      dataset: function () { return buildFinal(fSite); },
      filter: function (r) { return !fOnly || r.entrant; },
      pills: function () {
        return pill('site', '', 'Lima y Juliaca', fSite === '') + pill('site', 'Lima', 'Lima', fSite === 'Lima') + pill('site', 'Juliaca', 'Juliaca', fSite === 'Juliaca') + pill('only', 'x', 'Ingresantes', fOnly);
      },
      pick: function (k, v) { if (k === 'site') fSite = v; if (k === 'only') fOnly = !fOnly; }
    }).render();
  }

  /* ---------- carreras ---------- */
  var careers = (function () {
    var root = $('#p-r');
    var hist = {}, st = { cycle: '2026-2', site: 'Lima', q: '', sort: 'official', mine: '' };
    var AMIN = 8, AMAX = 20;
    var CYCLES = [['2027-1', 'Proyección 2027-1'], ['2026-2', '2026-2'], ['2026-1', '2026-1'], ['2025-2', '2025-2'], ['2024-2', '2024-2']];
    function init() {
      hist = JSON.parse(JSON.stringify(window.UNIVERSE_RANKING_HISTORY || {}));
      if (official.ranges) hist['2026-2'] = { Lima: official.ranges.Lima || [], Juliaca: official.ranges.Juliaca || [] };
      if (h2025 && h2025.rows) { hist[h2025.cycle] = hist[h2025.cycle] || {}; hist[h2025.cycle][h2025.site] = h2025.rows; }
      hist['2027-1'] = { Lima: projected('Lima'), Juliaca: projected('Juliaca') };
      root.innerHTML =
        '<div class="c-tools"><label class="search">' + SEARCH + '<span class="sr">Buscar carrera</span><input type="search" autocomplete="off" placeholder="Busca una carrera o facultad"><button type="button" class="clear" aria-label="Borrar búsqueda" hidden>' + X + '</button></label>' +
        '<div class="pills" id="c-cycles" role="group" aria-label="Ciclo"></div><div class="pills" id="c-sites" role="group" aria-label="Sede"></div></div>' +
        '<div class="mine"><label for="mine">Mi nota</label><input id="mine" type="text" inputmode="decimal" autocomplete="off" placeholder="14.5"><small>sobre 20</small></div>' +
        '<div class="list-head"><p class="count"></p><label class="sort"><span>Orden</span><select><option value="official">Facultad</option><option value="name">Nombre</option><option value="min">Mínimo</option><option value="max">Máximo</option></select></label></div>' +
        '<div class="axis" aria-hidden="true"><span>8</span><span>12</span><span>16</span><span>20</span></div><ul class="careers"></ul><p class="c-note"></p>';
      var input = $('input[type=search]', root), clear = $('.clear', root);
      input.addEventListener('input', function () { st.q = input.value; clear.hidden = !st.q; render(); });
      clear.addEventListener('click', function () { input.value = ''; st.q = ''; clear.hidden = true; render(); input.focus(); });
      $('select', root).addEventListener('change', function (e) { st.sort = e.target.value; render(); });
      $('#mine').addEventListener('input', function (e) { st.mine = e.target.value.replace(',', '.'); render(); });
      root.addEventListener('click', function (e) {
        var b = e.target.closest('[data-k]'); if (!b || b.disabled) return;
        st[b.getAttribute('data-k')] = b.getAttribute('data-v');
        if (!(hist[st.cycle] && hist[st.cycle][st.site] && hist[st.cycle][st.site].length)) st.site = 'Lima';
        render();
      });
      render();
    }
    function projected(site) {
      var ord = ['2024-2', '2025-2', '2026-1', '2026-2'], latest = (hist['2026-2'] && hist['2026-2'][site]) || [];
      return latest.map(function (base) {
        var series = [];
        ord.forEach(function (k) {
          var r = ((hist[k] && hist[k][site]) || []).filter(function (x) { return x[1] === base[1]; })[0];
          if (r && score(r[3]) != null && score(r[4]) != null) series.push(r);
        });
        if (!series.length) return [base[0], base[1], base[2], null, null, null, null];
        var f = series[0], l = series[series.length - 1], n = Math.max(1, series.length - 1);
        var mt = Math.max(-.7, Math.min(.7, (Number(l[3]) - Number(f[3])) / n * .55)), xt = Math.max(-.8, Math.min(.8, (Number(l[4]) - Number(f[4])) / n * .55));
        var pm = Math.max(0, Math.min(20, Number(l[3]) + .2 + mt)), px = Math.max(pm, Math.min(20, Number(l[4]) + .15 + xt));
        return [base[0], base[1], base[2], Number(pm.toFixed(3)), Number(px.toFixed(3)), null, null];
      });
    }
    function has(c, s) { return !!(hist[c] && hist[c][s] && hist[c][s].length); }
    function pos(x) { return Math.max(0, Math.min(100, (x - AMIN) / (AMAX - AMIN) * 100)); }
    function render() {
      var mine = score(st.mine), ws = words(st.q);
      var rows = ((hist[st.cycle] && hist[st.cycle][st.site]) || []).filter(function (r) { return !ws.length || hasAll(fold(r[0] + ' ' + r[1] + ' ' + r[2]), ws); });
      if (st.sort !== 'official') rows = rows.slice().sort(function (a, c) {
        if (st.sort === 'name') return String(a[2]).localeCompare(String(c[2]), 'es');
        var i = st.sort === 'min' ? 3 : 4, x = score(a[i]), y = score(c[i]);
        return x == null ? (y == null ? 0 : 1) : y == null ? -1 : y - x;
      });
      $('#c-cycles').innerHTML = CYCLES.filter(function (c) { return has(c[0], 'Lima') || has(c[0], 'Juliaca'); }).map(function (c) { return pill('cycle', c[0], c[1], st.cycle === c[0]); }).join('');
      $('#c-sites').innerHTML = ['Lima', 'Juliaca'].map(function (s) { return pill('site', s, s, st.site === s, '', !has(st.cycle, s)); }).join('');
      $('.count', root).innerHTML = '<b>' + int(rows.length) + '</b> carreras';
      $('.careers', root).innerHTML = rows.length ? rows.map(function (r) {
        var mn = score(r[3]), mx = score(r[4]);
        if (mx == null) return '<li class="career"><span class="who"><b>' + esc(r[2]) + '</b><small><span class="tag">' + esc(r[1]) + '</span><span>' + esc(r[0]) + '</span></small></span><span class="nums">Sin ingresantes</span></li>';
        var lo = Math.max(AMIN, mn == null ? mx : mn), hi = Math.max(lo, mx);
        var fit = mine == null || mn == null ? '' : mine >= mn ? 'in' : 'below';
        var badge = fit === 'in' ? '<span class="badge badge-in">Alcanza</span>' : fit === 'below' ? '<span class="badge badge-up">Faltan ' + (mn - mine).toFixed(2) + '</span>' : '';
        return '<li class="career" data-fit="' + fit + '"><span class="who"><b>' + esc(r[2]) + '</b><small><span class="tag">' + esc(r[1]) + '</span><span>' + esc(r[0]) + '</span>' + badge + '</small></span>' +
          '<span class="nums"><b>' + fmt(mn, 2) + '</b> – <b>' + fmt(mx, 2) + '</b></span>' +
          '<span class="range" role="img" aria-label="Mínimo ' + fmt(mn, 2) + ', máximo ' + fmt(mx, 2) + '"><i style="left:' + pos(lo).toFixed(2) + '%;width:' + Math.max(pos(hi) - pos(lo), 1.2).toFixed(2) + '%"></i>' + (mine != null ? '<em style="left:' + pos(mine).toFixed(2) + '%"></em>' : '') + '</span></li>';
      }).join('') : '<li class="empty">Sin resultados</li>';
      var note = $('.c-note', root);
      if (st.cycle === '2027-1') note.textContent = 'Proyección referencial de Universe, no oficial.';
      else if (st.cycle === '2026-2' && official.source) note.innerHTML = '<a href="' + esc(official.source) + '" target="_blank" rel="noopener noreferrer">Fuente oficial 2026-2 ↗</a>';
      else if (st.cycle === '2025-2' && h2025) note.innerHTML = '<a href="' + esc(h2025.officialSource) + '" target="_blank" rel="noopener noreferrer">Estadística oficial 2025-2 ↗</a>';
      else note.textContent = '';
    }
    return { init: init };
  })();

  /* ---------- progreso 2027-1 ---------- */
  function steps() {
    if (!cur) return;
    var keys = {}; ['pre', 'juliaca'].forEach(function (k) { buildCurrent(k).metas.forEach(function (m) { keys[m.key] = true; }); });
    var next = PRE.filter(function (m) { return !keys[m.key]; })[0], done = PRE.filter(function (m) { return keys[m.key]; }).length;
    $('#steps').innerHTML = '<p class="steps-sum"><span><strong>' + done + ' de ' + PRE.length + '</strong> evaluaciones</span>' + (next ? '<span>Siguiente: ' + esc(next.label) + '</span>' : '') + '</p><ol>' +
      PRE.map(function (m) {
        var on = !!keys[m.key];
        return '<li data-done="' + on + '"' + (m === next ? ' data-next="true"' : '') + '><abbr title="' + esc(m.label + ' · peso ' + m.weight) + '">' + m.step + '<small>×' + m.weight + '</small></abbr><span class="sr">' + esc(m.label) + (on ? ', publicada' : m === next ? ', siguiente' : ', pendiente') + '</span></li>';
      }).join('') + '</ol>';
    $('#updated').textContent = dateEs([cur.updatedAt, cur.publishedAt].filter(Boolean).sort().pop());
  }

  /* ---------- datos bajo demanda + esqueleto ---------- */
  var DATA = {
    f: ['/cepre-2026-2-official.js?v=20260912-cleanup', '/ranking/data/ranking-2026-2.js?v=20261104'],
    r: ['/cepre-2026-2-official.js?v=20260912-cleanup', '/cepre-history-2025-2.js?v=20260912-cleanup', '/ranking/data/history.js?v=20261104']
  };
  var loading = {};
  function loadScript(src) {
    return loading[src] || (loading[src] = new Promise(function (ok, bad) {
      var s = document.createElement('script'); s.src = src; s.onload = ok;
      s.onerror = function () { delete loading[src]; s.remove(); bad(new Error(src)); };
      document.head.appendChild(s);
    }));
  }
  function withData(tab) {
    return Promise.all((DATA[tab] || []).map(loadScript)).then(function () {
      official = window.UNIVERSE_CEPRE_2026_2 || official; h2025 = window.UNIVERSE_CEPRE_HISTORY_2025_2 || h2025;
    });
  }
  var UNI_SOURCE = 'https://puntajes.admision.uni.edu.pe/index.html';
  function headMeta(t) {
    if (t === 'f' && official.published) { $('#updated').textContent = dateEs(official.published); if (official.source) $('#source').href = official.source; }
    else if (t === 'c' && cur) { $('#updated').textContent = dateEs([cur.updatedAt, cur.publishedAt].filter(Boolean).sort().pop()); $('#source').href = UNI_SOURCE; }
  }
  function skeletonHTML() {
    var rows = '';
    for (var i = 0; i < 8; i++) rows += '<li><i class="sk-b sk-dot"></i><span><i class="sk-b" style="width:' + (46 + (i * 37) % 38) + '%"></i><i class="sk-b sk-s"></i></span><i class="sk-b sk-n"></i></li>';
    return '<div class="board sk" role="status" aria-label="Cargando ranking"><div class="main"><div class="sk-b sk-search"></div><div class="sk-pills"><i class="sk-b"></i><i class="sk-b"></i><i class="sk-b"></i></div><div class="sk-b sk-pano"></div><ul class="sk-rows">' + rows + '</ul></div><div class="sk-aside" aria-hidden="true"><div class="sk-b sk-card"></div></div></div>';
  }

  /* ---------- tabs ---------- */
  var tabs = $$('[data-tab]'), inited = { c: true };
  var shownTab = null;
  function selectTab(t, focus) {
    var switched = shownTab !== null && shownTab !== t;
    shownTab = S.tab = t;
    tabs.forEach(function (b) { var on = b.getAttribute('data-tab') === t; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
    ['c', 'f', 'r'].forEach(function (k) { $('#p-' + k).hidden = k !== t; });
    $('#steps').hidden = t !== 'c';
    if (switched) Object.keys(boards).forEach(function (k) { if (boards[k].sel) boards[k].select(null); });
    if (!inited[t]) {
      inited[t] = true;
      var panel = $('#p-' + t); panel.innerHTML = skeletonHTML();
      withData(t).then(function () { if (t === 'f') mountFinal(); else careers.init(); headMeta(S.tab); })
        .catch(function () { inited[t] = false; panel.innerHTML = '<p class="empty">No se pudieron cargar los datos. Vuelve a abrir la pestaña.</p>'; });
    }
    headMeta(t);
    syncUrl();
  }
  tabs.forEach(function (b, i) {
    b.addEventListener('click', function () { selectTab(b.getAttribute('data-tab')); });
    b.addEventListener('keydown', function (e) {
      var mv = { ArrowRight: 1, ArrowLeft: -1, Home: -i, End: tabs.length - 1 - i }[e.key]; if (mv == null) return;
      e.preventDefault(); selectTab(tabs[(i + mv + tabs.length) % tabs.length].getAttribute('data-tab'), true);
    });
  });
  mobile.addEventListener('change', function () { Object.keys(boards).forEach(function (k) { if (boards[k].sel) boards[k].select(null); }); });

  /* ---------- contador: todas las evaluaciones son a las 9:00 a. m. (Lima, UTC−5) ---------- */
  // Fechas del cronograma CEPRE UNI Pre 2027-1 (13-08-2026). La prueba de aptitud vocacional (6 feb) no entra al ranking.
  var CALENDAR = [
    ['Primera práctica calificada', '1.ª práctica', '2026-09-13'], ['Segunda práctica calificada', '2.ª práctica', '2026-09-27'], ['Primer examen parcial', '1.er parcial', '2026-10-11'],
    ['Tercera práctica calificada', '3.ª práctica', '2026-10-25'], ['Cuarta práctica calificada', '4.ª práctica', '2026-11-15'], ['Segundo examen parcial', '2.º parcial', '2026-11-29'],
    ['Quinta práctica calificada', '5.ª práctica', '2026-12-13'], ['Sexta práctica calificada', '6.ª práctica', '2027-01-10'], ['Séptima práctica calificada', '7.ª práctica', '2027-01-31'], ['Examen final', 'Examen final', '2027-02-07']
  ].map(function (e) { var p = e[2].split('-'); return { name: e[0], short: e[1], start: Date.UTC(+p[0], +p[1] - 1, +p[2], 14, 0, 0) }; });
  var LIVE_MS = 3 * 3600000; // tras las 9:00 se muestra "En curso" unas horas
  var bar = $('#cd'), cdShown = null, cdTimer = null, cdMin = -1;
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function tickCountdown() {
    var now = Date.now(), next = CALENDAR.filter(function (e) { return e.start + LIVE_MS > now; })[0];
    if (!next) { closeCountdown(); return; }
    if (next !== cdShown) {
      cdShown = next; cdMin = -1;
      var day = function (o) { return new Date(next.start).toLocaleDateString('es-PE', Object.assign({ day: 'numeric', timeZone: 'America/Lima' }, o)).replace(',', ''); };
      $('#cd-name').innerHTML = '<span class="full">' + next.name + '</span><span class="short">' + next.short + '</span>';
      $('#cd-date').innerHTML = '<span class="full">' + day({ weekday: 'long', month: 'long' }) + ' · 9:00 a. m.</span><span class="short">' + day({ weekday: 'short', month: 'short' }) + ' · 9:00 a. m.</span>';
    }
    var left = next.start - now, out;
    if (left <= 0) out = 'En curso';
    else {
      var s = Math.floor(left / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
      out = (d ? d + '<i>d</i>' : '') + pad(h) + '<i>h</i>' + pad(m) + '<i>min</i>' + pad(s % 60) + '<i>s</i>';
      if (m !== cdMin) { cdMin = m; $('#cd-sr').textContent = 'Faltan ' + (d ? d + ' días, ' : '') + h + ' horas y ' + m + ' minutos para ' + next.name; }
    }
    $('#cd-time').innerHTML = out;
    document.documentElement.style.setProperty('--cd-h', bar.offsetHeight + 'px');
  }
  function closeCountdown() {
    clearInterval(cdTimer); bar.hidden = true;
    document.documentElement.style.setProperty('--cd-h', '0px');
  }
  $('#cd-x').addEventListener('click', closeCountdown);
  bar.hidden = false; tickCountdown(); cdTimer = setInterval(tickCountdown, 1000);
  window.addEventListener('resize', function () { if (!bar.hidden) document.documentElement.style.setProperty('--cd-h', bar.offsetHeight + 'px'); });

  /* ---------- volver arriba (planeo de 1 s, como en las bibliotecas) ---------- */
  (function () {
    var btn = $('.totop'), ticking = false, anim = 0;
    function sync() {
      ticking = false;
      var max = document.documentElement.scrollHeight - innerHeight, y = scrollY, show = y > innerHeight * 1.2;
      btn.classList.toggle('is-on', show); btn.tabIndex = show ? 0 : -1;
      btn.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(sync); } }, { passive: true });
    addEventListener('resize', sync); sync();
    var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
    function stop() { cancelAnimationFrame(anim); anim = 0; }
    ['wheel', 'touchstart', 'keydown'].forEach(function (ev) { addEventListener(ev, function () { if (anim) stop(); }, { passive: true }); });
    btn.addEventListener('click', function () {
      stop();
      var from = scrollY, t0 = performance.now();
      function step(now) {
        var p = Math.min(1, (now - t0) / 1000);
        scrollTo(0, Math.round(from * (1 - ease(p))));
        if (p < 1) anim = requestAnimationFrame(step); else { anim = 0; $('.brand').focus({ preventScroll: true }); }
      }
      anim = requestAnimationFrame(step);
    });
  })();

  if (!cur) $('#p-c .rows').innerHTML = '<li class="empty">No se pudieron cargar las notas 2027-1. Recarga la página.</li>';
  else { $('#p-c input').value = S.q; cB.render(); steps(); }
  selectTab(S.tab);
})();
