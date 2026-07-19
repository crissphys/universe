(function () {
  'use strict';

  var MAX_SM = 2000;
  var fmt0 = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 });
  var fmt1 = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 1 });
  var fmt3 = new Intl.NumberFormat('es-PE', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  var admissionMode = 'uni';
  var resultsMode = 'uni';
  var admissionSnapshot = null;
  var resultsSnapshot = null;
  var simTimer = null;
  var simSeconds = 0;

  function data() { return window.UNIVERSE_SAN_MARCOS || null; }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(v) {
    return String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, Number(v) || 0)); }
  function pct(v, max) { return clamp(v / (max || MAX_SM) * 100, 0, 100); }
  function score(v) { return v == null || !isFinite(v) ? 'Sin dato' : fmt1.format(Number(v)); }
  function score20(v) { return v == null || !isFinite(v) ? 'Sin dato' : fmt3.format(Number(v) / 100) + '/20'; }
  function rows(cycle) {
    var d = data();
    return d && d.results && d.results[cycle] ? d.results[cycle] : [];
  }
  function cycles() {
    var d = data();
    return d && d.results ? Object.keys(d.results).sort().reverse() : [];
  }
  function rowLabel(r) {
    return (r.career || '') + (r.campus && r.campus !== 'Lima' ? ' - ' + r.campus : '');
  }
  function ratio(r) {
    var vacancies = Number(r.vacancies != null ? r.vacancies : r.capacity);
    return vacancies > 0 ? Number(r.applicants || 0) / vacancies : null;
  }
  function ratioLabel(v) {
    if (!isFinite(v)) return 'Sin dato';
    if (v >= 25) return 'Extrema';
    if (v >= 12) return 'Muy alta';
    if (v >= 7) return 'Alta';
    if (v >= 4) return 'Media';
    return 'Baja';
  }
  function idealFor(r) {
    var min = Number(r.min) || 0;
    var max = Number(r.max) || min;
    var mean = Number(r.mean) || min;
    var previous = findPreviousRow(r);
    var trend = previous && previous.min ? min - Number(previous.min) : 0;
    var spread = Math.max(0, max - min);
    var safety = Math.max(75, Math.min(210, spread * .24 + Math.max(0, trend) * .30 + min * .025));
    var low = clamp(min + Math.max(35, safety * .35), 0, MAX_SM);
    var high = clamp(Math.max(low + 28, min + safety), 0, MAX_SM);
    var target = clamp(Math.max(high + 30, mean + safety * .70), 0, MAX_SM);
    return { low: low, high: high, target: target, latest: min, spread: spread, trend: trend };
  }
  function findPreviousRow(r) {
    var prev = rows('2026-I');
    if (!prev.length || !r) return null;
    var exact = prev.find(function (x) { return norm(x.career) === norm(r.career) && norm(x.campus) === norm(r.campus); });
    return exact || prev.find(function (x) { return norm(x.career) === norm(r.career); }) || null;
  }
  function sourceLinks() {
    return '<a href="https://ciclero.guru/temario" target="_blank" rel="noopener noreferrer">Temario San Marcos de referencia</a>' +
      '<a href="https://ciclero.guru/analisis-resultados" target="_blank" rel="noopener noreferrer">Resultados agregados 2026-I</a>' +
      '<a href="https://admision.unmsm.edu.pe/Website20262/" target="_blank" rel="noopener noreferrer">Resultados oficiales UNMSM 2026-II</a>';
  }
  function setText(id, value) { var el = document.getElementById(id); if (el) el.textContent = value; }

  function initSyllabusSwitch() {
    var d = data(), uni = $('#temario');
    if (!d || !uni || $('#uts-sm-switch-card')) return;
    var summary = $('#resumenes-humanidades');
    var switchCard = document.createElement('section');
    switchCard.id = 'uts-sm-switch-card';
    switchCard.className = 'uts-sm-switch-card';
    switchCard.innerHTML =
      '<div class="uts-sm-switch-title"><span>Temario personalizado</span><b>Elige la universidad que vas a repasar</b><p>UNI mantiene el temario actual. San Marcos abre el temario 2027-1 organizado por comunicación, matemática, ciencias sociales y ciencias naturales.</p></div>' +
      '<div class="uts-sm-toggle" role="tablist" aria-label="Cambiar temario"><i aria-hidden="true"></i><button type="button" data-uts-mode="uni">UNI</button><button type="button" data-uts-mode="unmsm">San Marcos</button></div>';
    uni.parentNode.insertBefore(switchCard, uni);

    var panel = document.createElement('section');
    panel.id = 'uts-unmsm-temario';
    panel.className = 'uts-sm-panel';
    panel.innerHTML = renderSyllabusPanel(d);
    uni.parentNode.insertBefore(panel, uni.nextSibling);
    if (!$('#uts-sm-drawer')) document.body.appendChild(drawerShell());

    function setMode(mode) {
      mode = mode === 'unmsm' ? 'unmsm' : 'uni';
      switchCard.setAttribute('data-mode', mode);
      $all('[data-uts-mode]', switchCard).forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-uts-mode') === mode);
      });
      uni.style.display = mode === 'uni' ? '' : 'none';
      if (summary) summary.style.display = mode === 'uni' ? '' : 'none';
      panel.classList.toggle('active', mode === 'unmsm');
      try { localStorage.setItem('universe_syllabus_mode', mode); } catch (e) {}
    }
    $all('[data-uts-mode]', switchCard).forEach(function (b) {
      b.addEventListener('click', function () { setMode(b.getAttribute('data-uts-mode')); });
    });
    panel.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-uts-course]');
      if (btn) openCourse(btn.getAttribute('data-uts-course'));
    });
    setMode(location.hash === '#san-marcos' ? 'unmsm' : (localStorage.getItem('universe_syllabus_mode') || 'uni'));
  }

  function renderSyllabusPanel(d) {
    var groups = ['Comunicación', 'Matemática', 'Ciencias sociales', 'Ciencias naturales'];
    var cards = groups.map(function (group) {
      var list = d.syllabus.filter(function (c) { return c.group === group; });
      return '<article class="uts-sm-group"><h3>' + esc(group) + '</h3><div class="uts-sm-course-grid">' +
        list.map(function (c) {
          return '<button class="uts-sm-course-btn" type="button" data-uts-course="' + esc(c.slug) + '"><span>' + esc(c.icon) + '</span><b>' + esc(c.name) + '</b><small>' + esc((c.topics || []).length) + ' puntos de temario</small></button>';
        }).join('') + '</div></article>';
    }).join('');
    return '<header class="uts-sm-hero"><div><span class="uts-sm-kicker">Temario de San Marcos ' + esc(d.syllabusCycle) + '</span><h2>Universidad Nacional Mayor de San Marcos</h2><p>Ruta de repaso por cursos: abre una tarjeta y úsala como lista de control para teoría, práctica y simulacro.</p></div><div class="uts-sm-logo-lockup"><div><strong>UNMSM</strong><span>San Marcos</span></div></div></header><div class="uts-sm-body"><div class="uts-sm-group-grid">' + cards + '</div><p class="uts-sm-note">El temario San Marcos se muestra separado del temario UNI para que no se mezclen criterios de admisión.</p></div>';
  }

  function drawerShell() {
    var el = document.createElement('div');
    el.className = 'uts-sm-drawer';
    el.id = 'uts-sm-drawer';
    el.innerHTML = '<div class="uts-sm-drawer-card" role="dialog" aria-modal="true" aria-labelledby="uts-sm-drawer-title"><div class="uts-sm-drawer-head"><div><span class="uts-sm-kicker" id="uts-sm-drawer-kicker">San Marcos</span><h2 id="uts-sm-drawer-title">Curso</h2></div><button class="uts-sm-close" type="button" aria-label="Cerrar">×</button></div><div id="uts-sm-drawer-body"></div></div>';
    el.addEventListener('click', function (ev) { if (ev.target === el || ev.target.closest('.uts-sm-close')) closeCourse(); });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') closeCourse(); });
    return el;
  }
  function openCourse(slug) {
    var d = data(), drawer = $('#uts-sm-drawer'), body = $('#uts-sm-drawer-body');
    if (!d || !drawer || !body) return;
    var c = d.syllabus.find(function (x) { return x.slug === slug; });
    if (!c) return;
    $('#uts-sm-drawer-title').textContent = c.icon + ' ' + c.name;
    $('#uts-sm-drawer-kicker').textContent = c.group + ' · Temario San Marcos ' + d.syllabusCycle;
    body.innerHTML = '<div class="uts-sm-mini-guide"><b>Cómo repasarlo:</b> define conceptos, resuelve preguntas tipo admisión y arma un resumen de errores frecuentes.</div><ol class="uts-sm-topic-list">' +
      (c.topics || []).map(function (t, i) { return '<li><b>Bloque ' + (i + 1) + '.</b> ' + esc(t) + '</li>'; }).join('') +
      '</ol>';
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCourse() {
    var drawer = $('#uts-sm-drawer');
    if (drawer) drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  function captureAdmissionSnapshot() {
    if (admissionSnapshot || !$('#careerSelect')) return;
    function html(sel) { var el = $(sel); return el ? el.innerHTML : ''; }
    function txt(sel) { var el = $(sel); return el ? el.textContent : ''; }
    admissionSnapshot = {
      heroKicker: txt('.admission-hero .admission-kicker'),
      heroTitle: txt('.admission-hero h1'),
      heroText: txt('.admission-hero p'),
      heroActions: html('.admission-hero .admission-actions'),
      gridLinks: html('.admission-grid-links'),
      idealHead: html('#puntaje-ideal .section-head.clean > div:first-child'),
      note: txt('#puntaje-ideal .admission-note'),
      careerOptions: html('#careerSelect'),
      history: html('#careerHistory'),
      quickHead: html('.compact-results .section-head.clean'),
      quick: html('#quickRanking'),
      sourcesText: txt('#fuentes p'),
      sources: html('#sourceList'),
      axisMax: txt('#puntaje-ideal .score-line > span:last-child'),
      values: snapshotScoreValues()
    };
  }
  function snapshotScoreValues() {
    var ids = ['heroTargetScore', 'heroCareerText', 'targetScore', 'target20', 'projectedScore', 'projected20', 'sdScore', 'latestScore', 'latest20', 'idealZone', 'idealZone20', 'readingText', 'zoneMinLabel', 'zoneMaxLabel', 'targetLabel'];
    var values = {};
    ids.forEach(function (id) { var el = document.getElementById(id); if (el) values[id] = el.textContent; });
    ['scoreFill', 'idealZoneBand', 'latestMarker', 'targetMarker', 'zoneMinLabel', 'zoneMaxLabel', 'targetLabel'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) values[id + '_style'] = el.getAttribute('style') || '';
    });
    return values;
  }
  function restoreAdmissionUni() {
    if (!admissionSnapshot) return;
    admissionMode = 'uni';
    document.body.classList.remove('uts-admission-unmsm');
    setAdmissionButtons('uni');
    var map = [
      ['.admission-hero .admission-kicker', 'heroKicker', 'text'],
      ['.admission-hero h1', 'heroTitle', 'text'],
      ['.admission-hero p', 'heroText', 'text'],
      ['.admission-hero .admission-actions', 'heroActions', 'html'],
      ['.admission-grid-links', 'gridLinks', 'html'],
      ['#puntaje-ideal .section-head.clean > div:first-child', 'idealHead', 'html'],
      ['#puntaje-ideal .admission-note', 'note', 'text'],
      ['#careerSelect', 'careerOptions', 'html'],
      ['#careerHistory', 'history', 'html'],
      ['.compact-results .section-head.clean', 'quickHead', 'html'],
      ['#quickRanking', 'quick', 'html'],
      ['#fuentes p', 'sourcesText', 'text'],
      ['#sourceList', 'sources', 'html'],
      ['#puntaje-ideal .score-line > span:last-child', 'axisMax', 'text']
    ];
    map.forEach(function (m) { var el = $(m[0]); if (el) el[m[2] === 'html' ? 'innerHTML' : 'textContent'] = admissionSnapshot[m[1]]; });
    Object.keys(admissionSnapshot.values).forEach(function (k) {
      if (/_style$/.test(k)) {
        var node = document.getElementById(k.replace(/_style$/, ''));
        if (node) node.setAttribute('style', admissionSnapshot.values[k]);
      } else setText(k, admissionSnapshot.values[k]);
    });
  }
  function setAdmissionButtons(mode) {
    $all('[data-institution]').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-institution') === mode);
    });
  }
  function smAdmissionList() {
    return rows('2026-II').filter(function (r) { return r.min != null; }).sort(function (a, b) { return rowLabel(a).localeCompare(rowLabel(b), 'es'); });
  }
  function renderAdmissionSM() {
    var list = smAdmissionList();
    var sel = $('#careerSelect');
    if (!sel || !list.length) return;
    var idx = Number(sel.value);
    if (!isFinite(idx) || idx < 0 || idx >= list.length) idx = 0;
    var r = list[idx], est = idealFor(r);
    setText('targetScore', score(est.target));
    setText('target20', score20(est.target));
    setText('projectedScore', score(est.latest));
    setText('projected20', score20(est.latest));
    setText('sdScore', '± ' + score(Math.max(35, est.spread * .18)) + ' pts');
    setText('latestScore', score(est.latest));
    setText('latest20', score20(est.latest));
    setText('idealZone', score(est.low) + ' a ' + score(est.high) + ' puntos');
    setText('idealZone20', score20(est.low) + ' a ' + score20(est.high));
    setText('zoneMinLabel', 'Mínimo ' + score(est.low));
    setText('zoneMaxLabel', 'Máximo ' + score(est.high));
    setText('targetLabel', 'Ideal ' + score(est.target));
    setText('readingText', rowLabel(r) + ': para el próximo proceso 2027-1, la zona ideal aproximada es ' + score(est.low) + '–' + score(est.high) + ' puntos. Tu meta segura debe quedar un poco por encima: apunta a ' + score(est.target) + ' puntos.');
    setText('heroTargetScore', score(meanTarget(list)));
    setText('heroCareerText', 'Referencia general San Marcos 2027-1: revisa cada carrera en escala de 0 a 2000 puntos y compara corte reciente, zona ideal y meta sugerida.');
    var fill = $('#scoreFill'), zone = $('#idealZoneBand'), latest = $('#latestMarker'), target = $('#targetMarker'), minLab = $('#zoneMinLabel'), maxLab = $('#zoneMaxLabel'), targetLab = $('#targetLabel');
    var lowPct = pct(est.low, MAX_SM), highPct = pct(est.high, MAX_SM), targetPct = pct(est.target, MAX_SM), latestPct = pct(est.latest, MAX_SM);
    if (fill) fill.style.width = targetPct + '%';
    if (zone) { zone.style.left = lowPct + '%'; zone.style.width = Math.max(1, highPct - lowPct) + '%'; }
    if (latest) latest.style.left = latestPct + '%';
    if (target) target.style.left = targetPct + '%';
    if (minLab) minLab.style.left = lowPct + '%';
    if (maxLab) maxLab.style.left = highPct + '%';
    if (targetLab) targetLab.style.left = targetPct + '%';
    renderAdmissionHistorySM(r);
  }
  function meanTarget(list) {
    var vals = list.map(function (r) { return idealFor(r).target; });
    return vals.reduce(function (s, v) { return s + v; }, 0) / Math.max(1, vals.length);
  }
  function renderAdmissionHistorySM(r) {
    var box = $('#careerHistory');
    if (!box) return;
    var prev = findPreviousRow(r);
    var html = '<div><span>2026-II</span><b>' + score(r.min) + ' pts · ' + score20(r.min) + '</b></div>';
    if (prev) html += '<div><span>2026-I</span><b>' + score(prev.min) + ' pts · ' + score20(prev.min) + '</b></div>';
    box.innerHTML = html;
  }
  function setAdmissionSM() {
    captureAdmissionSnapshot();
    admissionMode = 'unmsm';
    document.body.classList.add('uts-admission-unmsm');
    setAdmissionButtons('unmsm');
    var d = data();
    var list = smAdmissionList();
    $('.admission-hero .admission-kicker').textContent = 'Admisión San Marcos · escala 0 a 2000';
    $('.admission-hero h1').textContent = 'Puntaje ideal para ingresar a San Marcos';
    $('.admission-hero p').textContent = 'Elige una carrera y revisa una referencia clara: corte reciente, zona ideal aproximada y puntaje sugerido para el proceso 2027-1.';
    $('.admission-hero .admission-actions').innerHTML =
      '<a class="admission-btn primary" href="#puntaje-ideal">Calcular puntaje ideal</a>' +
      '<a class="admission-btn ghost" href="/resultados-admision?institucion=unmsm">Ver resultados por concurso</a>' +
      '<a class="admission-btn ghost" href="/temario#san-marcos">Ver temario de admisión San Marcos</a>';
    var grid = $('.admission-grid-links');
    if (grid) grid.innerHTML =
      '<a href="#puntaje-ideal"><b>Puntaje ideal</b><span>Proyección por carrera en escala San Marcos.</span></a>' +
      '<a href="/resultados-admision?institucion=unmsm"><b>Resultados por concurso</b><span>Mínimos, máximos, demanda y sedes UNMSM.</span></a>' +
      '<a href="/temario#san-marcos"><b>Temario San Marcos</b><span>Comunicación, Matemática, Ciencias Sociales y Naturales.</span></a>' +
      '<a href="/simulacros?tipo=unmsm"><b>Simulacros</b><span>Practica con estructura tipo San Marcos.</span></a>';
    $('#puntaje-ideal .section-head.clean > div:first-child').innerHTML = '<span class="admission-kicker">Proyección referencial</span><h2>Puntaje ideal por carrera para ' + esc(d.syllabusCycle) + '</h2>';
    $('#puntaje-ideal .admission-note').textContent = 'La escala San Marcos va de 0 a 2000. Para aproximar a escala vigesimal, se divide entre 100.';
    $('#puntaje-ideal .score-line > span:last-child').textContent = '2000';
    var sel = $('#careerSelect');
    sel.innerHTML = list.map(function (r, i) { return '<option value="' + i + '">' + esc(rowLabel(r)) + '</option>'; }).join('');
    sel.value = '0';
    $('.compact-results .section-head.clean').innerHTML = '<div><span class="admission-kicker">Vista rápida</span><h2>Puntaje ideal para el próximo examen de admisión</h2></div><a class="admission-btn ghost" href="/resultados-admision?institucion=unmsm">Abrir análisis completo</a>';
    $('#quickRanking').innerHTML = list.slice().sort(function (a, b) { return idealFor(b).target - idealFor(a).target; }).slice(0, 10).map(function (r, i) {
      var est = idealFor(r);
      return '<article><b>' + (i + 1) + '. ' + esc(rowLabel(r)) + '</b><span>' + score(est.target) + ' pts</span><small>zona ' + score(est.low) + '–' + score(est.high) + '</small></article>';
    }).join('');
    $('#fuentes p').textContent = 'San Marcos se muestra con su propia escala, carreras, sedes y ciclos para evitar mezclar resultados con UNI.';
    $('#sourceList').innerHTML = sourceLinks();
    renderAdmissionSM();
  }
  function initAdmissionIntegrated() {
    if (!data() || !/\/admision(\.html)?\/?$/.test(location.pathname)) return;
    var old = $('#puntaje-ideal-san-marcos'); if (old) old.remove();
    document.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-institution]');
      if (!btn) return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      if (btn.getAttribute('data-institution') === 'unmsm') setAdmissionSM();
      else restoreAdmissionUni();
    }, true);
    var sel = $('#careerSelect');
    if (sel) sel.addEventListener('change', function (ev) {
      if (admissionMode === 'unmsm') {
        ev.stopImmediatePropagation();
        renderAdmissionSM();
      }
    }, true);
    if (new URLSearchParams(location.search).get('institucion') === 'unmsm') setAdmissionSM();
  }

  function captureResultsSnapshot() {
    if (resultsSnapshot || !$('#resultsBody')) return;
    function html(sel) { var el = $(sel); return el ? el.innerHTML : ''; }
    function txt(sel) { var el = $(sel); return el ? el.textContent : ''; }
    resultsSnapshot = {
      heroKicker: txt('.results-control-hero .admission-kicker'),
      heroTitle: txt('.results-control-hero h1'),
      heroText: txt('.results-control-hero p'),
      actions: html('.results-control-hero .admission-actions'),
      cycleOptions: html('#cycleSelect'),
      cycleTableOptions: html('#cycleSelectTable'),
      sourceNote: txt('#cycleSourceNote'),
      kpis: html('#resultsKpis'),
      axis: txt('.score-axis-note strong'),
      bars: html('#scoreBars'),
      demand: html('#demandChart'),
      tableHead: html('.admission-table thead tr'),
      tableBody: html('#resultsBody'),
      sourcesText: txt('#fuentes p'),
      sources: html('#sourceList')
    };
  }
  function ensureResultsUniversitySelectors() {
    if ($('#uts-results-university')) return;
    var heroControl = $('.cycle-control-inline');
    if (heroControl) {
      heroControl.insertAdjacentHTML('afterbegin', '<label for="uts-results-university">Universidad<select id="uts-results-university" class="uts-results-university"><option value="uni">UNI</option><option value="unmsm">San Marcos</option></select></label>');
    }
    var tableControls = $('.table-controls');
    if (tableControls) {
      tableControls.insertAdjacentHTML('afterbegin', '<label>Universidad<select id="uts-results-university-table" class="uts-results-university"><option value="uni">UNI</option><option value="unmsm">San Marcos</option></select></label>');
    }
    $all('.uts-results-university').forEach(function (sel) {
      sel.addEventListener('change', function () {
        setResultsMode(sel.value === 'unmsm' ? 'unmsm' : 'uni');
      });
    });
  }
  function setResultsSelectors(mode) {
    $all('.uts-results-university').forEach(function (sel) { sel.value = mode; });
  }
  function smResultCycles() {
    return ['2027-1'].concat(cycles());
  }
  function labelCycle(c) {
    return c === '2027-1' ? '2027-1 · proyección' : c;
  }
  function smRowsForCycle(cycle) {
    var base = cycle === '2027-1' ? rows('2026-II') : rows(cycle);
    return base.filter(function (r) { return r.min != null; }).map(function (r) {
      var est = idealFor(r);
      return {
        career: r.career,
        campus: r.campus || 'Lima',
        applicants: r.applicants,
        vacancies: r.vacancies,
        minRaw: cycle === '2027-1' ? est.low : Number(r.min),
        maxRaw: cycle === '2027-1' ? est.target : Number(r.max || r.min),
        mean: cycle === '2027-1' ? est.high : Number(r.mean || r.min),
        projected: cycle === '2027-1'
      };
    });
  }
  function renderResultsSM() {
    var cycleSel = $('#cycleSelect'), cycleTable = $('#cycleSelectTable');
    if (!cycleSel || !cycleTable) return;
    var cycle = cycleSel.value || '2027-1';
    cycleTable.value = cycle;
    var allRows = smRowsForCycle(cycle);
    var q = norm(($('#resultsSearch') || {}).value || '');
    var shown = allRows.filter(function (r) { return !q || norm(rowLabel(r)).indexOf(q) >= 0; }).sort(function (a, b) { return (b.minRaw || 0) - (a.minRaw || 0); });
    var total = shown.reduce(function (s, r) { return s + (Number(r.applicants) || 0); }, 0);
    var withRatio = shown.map(function (r) { return Object.assign({}, r, { comp: ratio(r) }); }).filter(function (r) { return isFinite(r.comp); });
    var demand = withRatio.slice().sort(function (a, b) { return b.comp - a.comp; })[0];
    var lowComp = withRatio.slice().sort(function (a, b) { return a.comp - b.comp; })[0];
    var high = shown.slice().sort(function (a, b) { return (b.maxRaw || 0) - (a.maxRaw || 0); })[0];
    var low = shown.slice().sort(function (a, b) { return (a.minRaw || 0) - (b.minRaw || 0); })[0];
    setText('cycleSourceNote', cycle === '2027-1' ? 'Proyección referencial para 2027-1 usando el último corte 2026-II como base.' : 'Datos agregados del concurso San Marcos ' + cycle + '.');
    $('#resultsKpis').innerHTML = [
      ['Mayor demanda', demand ? rowLabel(demand) : 'Sin dato', demand ? fmt1.format(demand.comp) + ' postulantes/vacante' : ''],
      ['Puntaje más alto', high ? score(high.maxRaw) : 'Sin dato', high ? rowLabel(high) : ''],
      ['Menor competitividad', lowComp ? rowLabel(lowComp) : 'Sin dato', lowComp ? fmt1.format(lowComp.comp) + ' postulantes/vacante' : ''],
      ['Cantidad de postulantes', total ? fmt0.format(total) : 'Sin dato', cycle === '2027-1' ? 'referencia del ciclo base' : 'total filtrado'],
      ['Corte mínimo bajo', low ? score(low.minRaw) : 'Sin dato', low ? rowLabel(low) : ''],
      ['Carreras/sedes', fmt0.format(shown.length), 'registros visibles']
    ].map(function (k) { return '<article><span>' + esc(k[0]) + '</span><strong>' + esc(k[1]) + '</strong><small>' + esc(k[2]) + '</small></article>'; }).join('');
    $('#scoreBars').innerHTML = shown.map(function (r) {
      var min = pct(r.minRaw, MAX_SM), max = pct(r.maxRaw, MAX_SM);
      return '<div class="bar-row"><div class="label" title="' + esc(rowLabel(r)) + '">' + esc(rowLabel(r)) + '</div><div class="bar-track"><i style="width:' + max + '%"></i><b style="width:' + min + '%"></b></div><div class="value">' + score(r.minRaw) + ' / ' + score(r.maxRaw) + '</div></div>';
    }).join('');
    var top = shown.filter(function (r) { return r.applicants != null; }).sort(function (a, b) { return (b.applicants || 0) - (a.applicants || 0); }).slice(0, 12);
    var maxApps = top.length ? top[0].applicants || 1 : 1;
    $('#demandChart').innerHTML = top.map(function (r) {
      return '<div class="demand-item"><b title="' + esc(rowLabel(r)) + '">' + esc(rowLabel(r)) + '</b><small>' + fmt0.format(r.applicants || 0) + '</small><div class="demand-pill"><span style="width:' + pct(r.applicants, maxApps) + '%"></span></div></div>';
    }).join('') || '<p class="admission-note">No hay postulantes para este filtro.</p>';
    $('.admission-table thead tr').innerHTML = '<th>Carrera</th><th>Sede</th><th>Postulantes</th><th>Vacantes</th><th>Competencia</th><th>Corte mínimo</th><th>Puntaje máximo</th><th>Promedio</th><th>Lectura</th>';
    $('#resultsBody').innerHTML = shown.map(function (r) {
      var rr = ratio(r);
      return '<tr><td>' + esc(r.career) + (r.projected ? ' <span class="badge-proj">Proyección</span>' : '') + '</td><td>' + esc(r.campus || 'Lima') + '</td><td>' + fmt0.format(r.applicants || 0) + '</td><td>' + fmt0.format(r.vacancies || 0) + '</td><td>' + (isFinite(rr) ? fmt1.format(rr) + ' / vacante' : 'Sin dato') + '</td><td>' + score(r.minRaw) + ' pts</td><td>' + score(r.maxRaw) + ' pts</td><td>' + score(r.mean) + ' pts</td><td>' + ratioLabel(rr) + '</td></tr>';
    }).join('');
  }
  function setResultsMode(mode) {
    captureResultsSnapshot();
    mode = mode === 'unmsm' ? 'unmsm' : 'uni';
    resultsMode = mode;
    setResultsSelectors(mode);
    document.body.classList.toggle('uts-results-unmsm', mode === 'unmsm');
    if (mode === 'uni') {
      if (!resultsSnapshot) return;
      $('.results-control-hero .admission-kicker').textContent = resultsSnapshot.heroKicker;
      $('.results-control-hero h1').textContent = resultsSnapshot.heroTitle;
      $('.results-control-hero p').textContent = resultsSnapshot.heroText;
      $('.results-control-hero .admission-actions').innerHTML = resultsSnapshot.actions;
      $('#cycleSelect').innerHTML = resultsSnapshot.cycleOptions;
      $('#cycleSelectTable').innerHTML = resultsSnapshot.cycleTableOptions;
      setText('cycleSourceNote', resultsSnapshot.sourceNote);
      $('#resultsKpis').innerHTML = resultsSnapshot.kpis;
      $('.score-axis-note strong').textContent = resultsSnapshot.axis;
      $('#scoreBars').innerHTML = resultsSnapshot.bars;
      $('#demandChart').innerHTML = resultsSnapshot.demand;
      $('.admission-table thead tr').innerHTML = resultsSnapshot.tableHead;
      $('#resultsBody').innerHTML = resultsSnapshot.tableBody;
      $('#fuentes p').textContent = resultsSnapshot.sourcesText;
      $('#sourceList').innerHTML = resultsSnapshot.sources;
      return;
    }
    $('.results-control-hero .admission-kicker').textContent = 'Resultados por concurso de admisión San Marcos';
    $('.results-control-hero h1').textContent = 'Máximos, mínimos, demanda y competitividad por carrera';
    $('.results-control-hero p').textContent = 'Selecciona universidad y concurso. San Marcos se muestra con sus carreras, sedes y escala propia de 0 a 2000 puntos.';
    $('.results-control-hero .admission-actions').innerHTML = '<a class="admission-btn ghost" href="/admision?institucion=unmsm">Volver a puntaje ideal</a><a class="admission-btn ghost" href="https://admision.unmsm.edu.pe/" target="_blank" rel="noopener noreferrer">Portal oficial UNMSM</a>';
    var options = smResultCycles().map(function (c) { return '<option value="' + esc(c) + '">' + esc(labelCycle(c)) + '</option>'; }).join('');
    $('#cycleSelect').innerHTML = options;
    $('#cycleSelectTable').innerHTML = options;
    $('#cycleSelect').value = '2027-1';
    $('#cycleSelectTable').value = '2027-1';
    $('.score-axis-note strong').textContent = 'Escala San Marcos de 0 a 2000 puntos';
    $('#fuentes p').textContent = 'Los resultados de San Marcos se muestran separados de UNI para no mezclar escalas ni criterios.';
    $('#sourceList').innerHTML = sourceLinks();
    renderResultsSM();
  }
  function initResultsIntegrated() {
    if (!data() || !/\/resultados-admision(\.html)?\/?$/.test(location.pathname)) return;
    var old = $('#uts-sm-results'); if (old) old.remove();
    ensureResultsUniversitySelectors();
    document.addEventListener('change', function (ev) {
      if (resultsMode !== 'unmsm') return;
      if (ev.target.matches('.cycle-select')) {
        ev.stopImmediatePropagation();
        $all('.cycle-select').forEach(function (sel) { if (sel !== ev.target) sel.value = ev.target.value; });
        renderResultsSM();
      }
    }, true);
    var search = $('#resultsSearch');
    if (search) search.addEventListener('input', function (ev) {
      if (resultsMode === 'unmsm') {
        ev.stopImmediatePropagation();
        renderResultsSM();
      }
    }, true);
    if (new URLSearchParams(location.search).get('institucion') === 'unmsm') setResultsMode('unmsm');
  }

  function initSimulatorIntegrated() {
    if (!data() || !/\/simulacros(\.html)?\/?$/.test(location.pathname)) return;
    var section = $('#simulacros');
    if (!section || $('#uts-sim-mode-switch')) return;
    var title = $('.section-title', section);
    var sub = $('.section-sub', section);
    if (title) title.innerHTML = 'SIMULACROS';
    if (sub) sub.textContent = 'Escoge el tipo de práctica: UNI mantiene las guías actuales y San Marcos genera un simulacro virtual con carrera, secciones, 5 alternativas y límite de 3 horas.';
    var switcher = document.createElement('div');
    switcher.id = 'uts-sim-mode-switch';
    switcher.className = 'uts-sim-mode-switch';
    switcher.innerHTML = '<button class="active" type="button" data-sim-mode="uni">Tipo UNI</button><button type="button" data-sim-mode="unmsm">Tipo San Marcos</button>';
    var reveal = $('.reveal', section);
    if (reveal) reveal.appendChild(switcher);
    var panel = document.createElement('div');
    panel.id = 'uts-sm-sim-integrated';
    panel.className = 'uts-sm-sim-integrated';
    panel.hidden = true;
    panel.innerHTML = renderSimulatorShell();
    section.appendChild(panel);
    switcher.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-sim-mode]');
      if (!btn) return;
      setSimMode(btn.getAttribute('data-sim-mode'));
    });
    $('#uts-sm-exam-generate').addEventListener('click', generateSanMarcosExam);
    $('#uts-sm-exam-finish').addEventListener('click', finishSanMarcosExam);
    fillCareerSelect();
    setSimMode(new URLSearchParams(location.search).get('tipo') === 'unmsm' ? 'unmsm' : 'uni');
  }
  function renderSimulatorShell() {
    return '<div class="uts-sm-exam-card"><div class="uts-sm-exam-head"><div><span class="uts-sm-kicker">San Marcos · simulacro virtual</span><h3>Generador por carrera y estructura de área</h3><p>Se generan 100 preguntas originales desde el temario. Tienes 3 horas; si el tiempo llega a cero, puedes seguir resolviendo y finalizar manualmente.</p></div><div class="uts-sm-exam-timer"><span>Tiempo</span><b id="uts-sm-exam-clock">03:00:00</b></div></div><div class="uts-sm-sim-controls"><label>Carrera de referencia<select id="uts-sm-exam-career"></select></label><label>Área detectada<select id="uts-sm-exam-area"><option value="A">A · Ciencias de la Salud</option><option value="B">B · Ciencias Básicas</option><option value="C">C · Ingeniería</option><option value="D">D · Económico-Empresarial</option><option value="E">E · Humanidades y Sociales</option></select></label><button class="uts-sm-action" id="uts-sm-exam-generate" type="button">Generar simulacro</button><button class="uts-sm-action secondary" id="uts-sm-exam-finish" type="button">Finalizar simulacro</button></div><div id="uts-sm-exam-status" class="uts-sm-note">Elige una carrera y genera el simulacro.</div><div id="uts-sm-exam-questions" class="uts-sm-questions"></div></div>';
  }
  function fillCareerSelect() {
    var sel = $('#uts-sm-exam-career');
    if (!sel) return;
    var list = smAdmissionList();
    sel.innerHTML = list.map(function (r, i) { return '<option value="' + i + '">' + esc(rowLabel(r)) + '</option>'; }).join('');
    sel.addEventListener('change', function () {
      var r = list[Number(sel.value) || 0];
      $('#uts-sm-exam-area').value = inferArea(r);
    });
    $('#uts-sm-exam-area').value = inferArea(list[0]);
  }
  function inferArea(r) {
    var c = norm(r && r.career);
    if (/medicina|enfermer|farmacia|odontolog|veterinaria|nutricion|obstetric|psicologia|biologia|genetica|toxicologia|tecnologia medica/.test(c)) return 'A';
    if (/matematica|fisica|quimica|computacion cientifica|estadistica|investigacion operativa/.test(c)) return 'B';
    if (/ingenier|arquitectura|software|sistemas|telecomunicaciones|mecatronica|civil/.test(c)) return 'C';
    if (/administracion|contabilidad|economia|auditoria|marketing|finanzas|turismo|gastronomia|tributaria|negocios/.test(c)) return 'D';
    return 'E';
  }
  function setSimMode(mode) {
    mode = mode === 'unmsm' ? 'unmsm' : 'uni';
    var section = $('#simulacros');
    section.setAttribute('data-sim-mode', mode);
    $all('[data-sim-mode]', section).forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-sim-mode') === mode); });
    $('#uts-sm-sim-integrated').hidden = mode !== 'unmsm';
  }
  function distribution(area) {
    var base = { 'Actitudinal': 10, 'Habilidad verbal': 10, 'Habilidad matemática': 10 };
    var add = {
      A: { 'Lenguaje': 6, 'Literatura': 4, 'Psicología': 4, 'Educación cívica': 4, 'Historia del Perú': 3, 'Historia universal': 3, 'Geografía': 4, 'Economía': 3, 'Filosofía': 3, 'Aritmética': 4, 'Álgebra': 4, 'Geometría': 3, 'Trigonometría': 3, 'Física': 7, 'Química': 7, 'Biología': 8 },
      B: { 'Lenguaje': 5, 'Literatura': 3, 'Psicología': 4, 'Educación cívica': 3, 'Historia del Perú': 3, 'Historia universal': 3, 'Geografía': 4, 'Economía': 3, 'Filosofía': 3, 'Aritmética': 5, 'Álgebra': 5, 'Geometría': 4, 'Trigonometría': 4, 'Física': 8, 'Química': 8, 'Biología': 5 },
      C: { 'Lenguaje': 5, 'Literatura': 2, 'Psicología': 2, 'Educación cívica': 3, 'Historia del Perú': 2, 'Historia universal': 2, 'Geografía': 3, 'Economía': 2, 'Filosofía': 2, 'Aritmética': 6, 'Álgebra': 6, 'Geometría': 6, 'Trigonometría': 6, 'Física': 10, 'Química': 10, 'Biología': 3 },
      D: { 'Lenguaje': 7, 'Literatura': 4, 'Psicología': 5, 'Educación cívica': 5, 'Historia del Perú': 4, 'Historia universal': 4, 'Geografía': 5, 'Economía': 10, 'Filosofía': 4, 'Aritmética': 6, 'Álgebra': 5, 'Geometría': 3, 'Trigonometría': 3, 'Física': 2, 'Química': 2, 'Biología': 1 },
      E: { 'Lenguaje': 8, 'Literatura': 8, 'Psicología': 6, 'Educación cívica': 6, 'Historia del Perú': 7, 'Historia universal': 7, 'Geografía': 6, 'Economía': 4, 'Filosofía': 6, 'Aritmética': 3, 'Álgebra': 3, 'Geometría': 2, 'Trigonometría': 2, 'Física': 1, 'Química': 1, 'Biología': 0 }
    }[area] || {};
    Object.keys(add).forEach(function (k) { base[k] = add[k]; });
    return base;
  }
  function courseByName(name) {
    if (name === 'Actitudinal') return { name: 'Actitudinal', icon: '🧭', topics: ['autonomía académica', 'pensamiento crítico', 'responsabilidad ciudadana', 'manejo del tiempo', 'ética universitaria'] };
    return (data().syllabus || []).find(function (c) { return c.name === name; }) || { name: name, icon: '•', topics: ['tema general'] };
  }
  function pick(arr, i) { return arr[((i % arr.length) + arr.length) % arr.length]; }
  function makeQuestion(courseName, n) {
    var course = courseByName(courseName);
    var topic = pick(course.topics || ['tema general'], n * 7 + courseName.length);
    var same = (course.topics || []).filter(function (t) { return t !== topic; }).slice(0, 8);
    var global = (data().syllabus || []).reduce(function (acc, c) { return acc.concat((c.topics || []).slice(0, 4)); }, []);
    var distractors = same.concat(global).filter(function (t, i, a) { return t !== topic && a.indexOf(t) === i; });
    var options = [
      'Dominar ' + topic + ' y reconocerlo en una pregunta aplicada.',
      'Confundirlo con ' + pick(distractors, n + 1) + ' sin revisar la idea central.',
      'Resolver solo por memoria sin identificar datos ni restricciones.',
      'Cambiar la escala o el contexto aunque el enunciado no lo permita.',
      'Elegir una alternativa por descarte visual sin justificar el procedimiento.'
    ];
    var correct = 0;
    var seed = n % 5;
    if (seed) {
      var good = options.shift();
      options.splice(seed, 0, good);
      correct = seed;
    }
    return { n: n, course: course.name, topic: topic, correct: correct, options: options };
  }
  function startTimer() {
    clearInterval(simTimer);
    simSeconds = 10800;
    renderClock();
    simTimer = setInterval(function () {
      simSeconds -= 1;
      renderClock();
      if (simSeconds <= 0) {
        clearInterval(simTimer);
        $('#uts-sm-exam-status').textContent = 'Tiempo cumplido. Puedes seguir resolviendo y finalizar cuando quieras.';
      }
    }, 1000);
  }
  function renderClock() {
    var h = Math.max(0, Math.floor(simSeconds / 3600));
    var m = Math.max(0, Math.floor((simSeconds % 3600) / 60));
    var s = Math.max(0, simSeconds % 60);
    setText('uts-sm-exam-clock', [h, m, s].map(function (x) { return String(x).padStart(2, '0'); }).join(':'));
  }
  function generateSanMarcosExam() {
    var area = $('#uts-sm-exam-area').value || 'C';
    var dist = distribution(area);
    var questions = [];
    Object.keys(dist).forEach(function (course) {
      for (var i = 0; i < dist[course]; i++) questions.push(makeQuestion(course, questions.length + 1));
    });
    $('#uts-sm-exam-questions').innerHTML = questions.map(function (q) {
      return '<article class="uts-sm-question" data-correct="' + q.correct + '"><b>Pregunta ' + q.n + ' · ' + esc(q.course) + '</b><p><strong>Texto fuente integrado:</strong> el bloque evalúa "' + esc(q.topic) + '". Selecciona la alternativa que mejor describe cómo abordar ese contenido en admisión.</p><div class="uts-sm-options">' +
        q.options.map(function (op, i) { return '<label><input type="radio" name="uts-sm-q' + q.n + '" value="' + i + '"><span>' + esc(op) + '</span></label>'; }).join('') +
        '</div><small class="uts-sm-note">Fuente de estudio: temario San Marcos ' + esc(data().syllabusCycle) + ' · pregunta original Universe.</small></article>';
    }).join('');
    $('#uts-sm-exam-status').textContent = 'Simulacro generado: 100 preguntas, 5 alternativas y estructura referencial del área ' + area + '.';
    startTimer();
  }
  function finishSanMarcosExam() {
    var cards = $all('.uts-sm-question', $('#uts-sm-exam-questions'));
    if (!cards.length) {
      $('#uts-sm-exam-status').textContent = 'Primero genera un simulacro.';
      return;
    }
    var ok = 0, answered = 0;
    cards.forEach(function (card) {
      var selected = $('input:checked', card);
      card.classList.remove('ok', 'bad');
      if (selected) {
        answered++;
        if (selected.value === card.getAttribute('data-correct')) { ok++; card.classList.add('ok'); }
        else card.classList.add('bad');
      }
    });
    var pts = ok / cards.length * MAX_SM;
    $('#uts-sm-exam-status').textContent = 'Resultado estimado: ' + ok + '/' + cards.length + ' correctas, ' + answered + ' respondidas, aprox. ' + score(pts) + ' puntos. Revisa las tarjetas marcadas para reforzar.';
  }

  function init() {
    if (!data()) return;
    initSyllabusSwitch();
    initAdmissionIntegrated();
    initResultsIntegrated();
    initSimulatorIntegrated();
  }
  function ready() { setTimeout(init, 80); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true });
  else ready();
})();
