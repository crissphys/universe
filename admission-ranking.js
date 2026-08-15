(function () {
  'use strict';
  var data = window.UNIVERSE_ADMISSION_2026_2_RANKING;
  if (!data) return;

  var nf0 = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 });
  var nf3 = new Intl.NumberFormat('es-PE', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  var state = { query: '', filter: 'complete', page: 1, size: 75 };

  function byId(id) { return document.getElementById(id); }
  function set(id, value) { var el = byId(id); if (el) el.textContent = value; }
  function safe(value) { return String(value == null ? '' : value).replace(/[&<>'"]/g, function (char) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]; }); }
  function normalize(value) { return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim(); }
  function points(value) { return value == null ? '—' : nf3.format(Number(value)); }
  function isComplete(row) { return row.exam1 != null && row.exam2 != null && row.exam3 != null; }
  function scoreState(row) {
    var complete = isComplete(row);
    var total = Number(row.exam1 || 0) + Number(row.exam2 || 0) + Number(row.exam3 || 0);
    return {
      complete: complete,
      completed: (row.exam1 != null ? 1 : 0) + (row.exam2 != null ? 1 : 0) + (row.exam3 != null ? 1 : 0),
      total: total,
      current20: complete ? total / data.provisionalMax * 20 : null,
      finalContribution20: total / data.totalMax * 20
    };
  }
  function selectedRows() {
    var query = normalize(state.query);
    return data.rows.filter(function (row) {
      if (state.filter === 'complete' && !isComplete(row)) return false;
      if (state.filter === 'incomplete' && isComplete(row)) return false;
      if (!query) return true;
      return normalize(row.code + ' ' + row.name).indexOf(query) >= 0;
    });
  }
  function rankBadge(row) {
    if (row.rank == null) return '<span class="absent-pill">Incompleto</span>';
    return '<span class="rank-medal' + (row.rank <= 3 ? ' top' : '') + '">' + nf0.format(row.rank) + '</span>';
  }
  function scoreCell(value, missingLabel) {
    return value == null ? '<span class="absent-pill">' + safe(missingLabel || 'Ausente') + '</span>' : '<span class="score-main">' + points(value) + '</span><span class="muted">de 600</span>';
  }
  function missingLabel(row, key) { return row[key + 'Status'] === 'not-listed' ? 'Sin registro' : 'Ausente'; }
  function tableRow(row) {
    var s = scoreState(row);
    return '<tr><td>' + rankBadge(row) + '</td><td><strong>' + safe(row.code) + '</strong></td><td><span class="student-name">' + safe(row.name) + '</span></td>' +
      '<td>' + scoreCell(row.exam1, 'Ausente') + '</td>' +
      '<td>' + scoreCell(row.exam2, missingLabel(row, 'exam2')) + '</td>' +
      '<td>' + scoreCell(row.exam3, missingLabel(row, 'exam3')) + '</td>' +
      '<td><span class="score-main">' + (s.complete ? points(s.total) : '—') + '</span><span class="muted">de 1.800</span></td>' +
      '<td><span class="score-main">' + (s.current20 == null ? '—' : points(s.current20)) + '</span><span class="muted">escala 0–20</span></td>' +
      '<td><span class="score-main">' + s.completed + ' / 3</span><span class="muted">pruebas con nota</span></td></tr>';
  }
  function card(row) {
    var s = scoreState(row);
    return '<article class="rank-person-card"><div class="rank-person-head">' + rankBadge(row) + '<div><b>' + safe(row.name) + '</b><small>' + safe(row.code) + '</small></div><div class="rank-person-score">' + (s.complete ? points(s.total) : 'Incompleto') + '</div></div>' +
      '<div class="rank-person-metrics"><div><span>Humanidades</span><strong>' + (row.exam1 == null ? 'Ausente' : points(row.exam1)) + '</strong></div><div><span>Matemática</span><strong>' + (row.exam2 == null ? missingLabel(row, 'exam2') : points(row.exam2)) + '</strong></div><div><span>Física y Química</span><strong>' + (row.exam3 == null ? missingLabel(row, 'exam3') : points(row.exam3)) + '</strong></div><div><span>Promedio final</span><strong>' + (s.current20 == null ? '—' : points(s.current20) + ' / 20') + '</strong></div></div></article>';
  }
  function render() {
    var rows = selectedRows();
    var pages = Math.max(1, Math.ceil(rows.length / state.size));
    if (state.page > pages) state.page = pages;
    var start = (state.page - 1) * state.size;
    var shown = rows.slice(start, start + state.size);
    var body = byId('admissionRankBody'); if (body) body.innerHTML = shown.map(tableRow).join('');
    var cards = byId('admissionRankCards'); if (cards) cards.innerHTML = shown.map(card).join('');
    set('rankResultCount', nf0.format(rows.length));
    set('rankPageInfo', 'Página ' + state.page + ' de ' + pages);
    var prev = byId('rankPrev'); var next = byId('rankNext');
    if (prev) prev.disabled = state.page <= 1;
    if (next) next.disabled = state.page >= pages;
  }
  function initSummary() {
    var stats = data.stats;
    set('rankPresent', nf0.format(stats.ranked));
    set('rankMean', points(stats.meanTotal) + ' / 1.800');
    set('rankMean20', points(stats.mean20) + ' / 20');
    set('rankTop', points(stats.maximum));
    set('rankIncomplete', nf0.format(stats.incomplete));
  }
  function bind() {
    var search = byId('admissionRankSearch');
    if (search) search.addEventListener('input', function () { state.query = search.value; state.page = 1; render(); });
    document.querySelectorAll('[data-rank-filter]').forEach(function (button) {
      button.addEventListener('click', function () {
        state.filter = button.getAttribute('data-rank-filter') || 'complete'; state.page = 1;
        document.querySelectorAll('[data-rank-filter]').forEach(function (other) { other.classList.toggle('active', other === button); });
        render();
      });
    });
    var prev = byId('rankPrev'); if (prev) prev.addEventListener('click', function () { if (state.page > 1) { state.page--; render(); window.scrollTo({ top: 430, behavior: 'smooth' }); } });
    var next = byId('rankNext'); if (next) next.addEventListener('click', function () { state.page++; render(); window.scrollTo({ top: 430, behavior: 'smooth' }); });
  }
  function init() { initSummary(); bind(); render(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
