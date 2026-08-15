(function () {
  'use strict';

  var admission = window.UNIVERSE_ADMISSION_DATA || {};
  var data = admission.DATA || {};
  var cycles = admission.CYCLES || [];
  var maxScore = Number(admission.MAX_SCORE) || 1800;
  var number = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 });
  var decimal = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 1 });

  function byId(id) { return document.getElementById(id); }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function setText(id, value) { var el = byId(id); if (el) el.textContent = value; }
  function score(value) { return number.format(Math.round(value)); }
  function vigesimal(value) { return decimal.format(value / 90) + '/20'; }
  function safe(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function historicalCuts(career) {
    return cycles.map(function (cycle) {
      var row = data[cycle] && data[cycle][career];
      return row && Number.isFinite(Number(row.minRaw))
        ? { cycle: cycle, score: Number(row.minRaw) }
        : null;
    }).filter(Boolean);
  }

  function readScores() {
    return ['idealExam1', 'idealExam2', 'idealExam3'].map(function (id) {
      var input = byId(id);
      var raw = input ? String(input.value || '').trim().replace(',', '.') : '';
      if (!raw) return null;
      var value = Number(raw);
      if (!Number.isFinite(value)) return null;
      value = clamp(value, 0, 600);
      if (input && Number(input.value) !== value) input.value = String(value);
      return value;
    });
  }

  function probabilityLabel(percent) {
    if (percent >= 100) return 'Muy favorable frente al historial';
    if (percent >= 75) return 'Favorable frente al historial';
    if (percent >= 50) return 'Escenario competitivo';
    if (percent >= 25) return 'Escenario exigente';
    if (percent > 0) return 'Muy por debajo de la mayoría de cortes';
    return 'Por debajo de todos los cortes analizados';
  }

  function renderHistory(cuts, projected) {
    var container = byId('admissionHistoryVisual');
    if (!container) return;
    container.innerHTML = cuts.map(function (cut) {
      var cutWidth = clamp(cut.score / maxScore * 100, 0, 100);
      var marker = projected == null ? '' : '<b style="left:' + clamp(projected / maxScore * 100, 0, 100) + '%" aria-hidden="true"></b>';
      var passed = projected != null && projected >= cut.score;
      return '<div class="history-cycle-row' + (passed ? ' passed' : '') + '">' +
        '<span>' + safe(cut.cycle) + '</span>' +
        '<div class="history-cycle-track" title="Corte mínimo ' + safe(score(cut.score)) + ' puntos"><i style="width:' + cutWidth + '%"></i>' + marker + '</div>' +
        '<strong>' + safe(score(cut.score)) + ' pts</strong>' +
      '</div>';
    }).join('') || '<p class="admission-note">No hay cortes históricos disponibles para esta carrera.</p>';
  }

  function render() {
    var careerSelect = byId('careerSelect');
    if (!careerSelect) return;
    var career = careerSelect.value;
    var cuts = historicalCuts(career);
    var scores = readScores();
    var completedScores = scores.filter(function (value) { return value != null; });
    var completed = completedScores.length;
    var currentTotal = completedScores.reduce(function (sum, value) { return sum + value; }, 0);
    var projected = completed ? clamp(currentTotal / completed * 3, 0, maxScore) : null;
    var latest = cuts.length ? cuts[cuts.length - 1].score : null;
    var passed = projected == null ? 0 : cuts.filter(function (cut) { return projected >= cut.score; }).length;
    var probability = cuts.length && projected != null ? passed / cuts.length * 100 : null;
    var ring = byId('admissionProbabilityRing');
    var module = ring && ring.closest('.ideal-probability');
    var marker = byId('personalScoreMarker');

    setText('historyVisualCareer', career || 'Carrera seleccionada');
    renderHistory(cuts, projected);

    if (projected == null) {
      if (module) module.classList.add('is-empty');
      if (ring) ring.style.setProperty('--probability', '0');
      if (marker) marker.hidden = true;
      setText('admissionProbabilityPercent', '—');
      setText('admissionProbabilityLabel', 'Ingresa una nota para calcularla');
      setText('admissionProbabilityDescription', 'El porcentaje indicará cuántos cortes mínimos históricos de ' + career + ' habría superado tu puntaje.');
      setText('personalScoreCaption', 'Tu proyección');
      setText('personalProjectedScore', '—');
      setText('personalProjected20', '—');
      setText('personalLatestDistance', '—');
      setText('personalLatestPercent', '—');
      setText('historicalCoverage', '—');
      setText('historicalCoverageDetail', cuts.length + ' ciclos disponibles');
      setText('idealScoreHint', 'Puedes comenzar con una sola nota. Mientras falten pruebas, verás una proyección provisional sobre 1800 puntos.');
      return;
    }

    if (module) module.classList.remove('is-empty');
    if (ring) ring.style.setProperty('--probability', decimal.format(probability).replace(',', '.'));
    if (marker) {
      marker.hidden = false;
      marker.style.left = clamp(projected / maxScore * 100, 0, 100) + '%';
      marker.title = (completed === 3 ? 'Tu puntaje: ' : 'Tu proyección: ') + score(projected) + ' puntos';
    }

    var distance = latest == null ? null : projected - latest;
    var latestPercent = latest ? projected / latest * 100 : null;
    var partial = completed < 3;
    setText('admissionProbabilityPercent', decimal.format(probability) + '%');
    setText('admissionProbabilityLabel', probabilityLabel(probability));
    setText(
      'admissionProbabilityDescription',
      (partial ? 'Proyección provisional: ' : 'Resultado completo: ') +
      'con ' + score(projected) + ' puntos habrías superado ' + passed + ' de ' + cuts.length +
      ' cortes mínimos históricos de ' + career + '.'
    );
    setText('personalScoreCaption', partial ? 'Proyección provisional' : 'Tu puntaje final');
    setText('personalProjectedScore', (partial ? '≈ ' : '') + score(projected) + ' pts');
    setText('personalProjected20', vigesimal(projected));
    setText('personalLatestDistance', distance == null ? 'Sin dato' : (distance >= 0 ? '+' : '−') + score(Math.abs(distance)) + ' pts');
    setText('personalLatestPercent', latestPercent == null ? 'Último corte no disponible' : decimal.format(latestPercent) + '% del último corte');
    setText('historicalCoverage', passed + ' de ' + cuts.length);
    setText('historicalCoverageDetail', decimal.format(probability) + '% de los cortes registrados');
    setText(
      'idealScoreHint',
      partial
        ? 'Has ingresado ' + completed + ' de 3 pruebas (' + score(currentTotal) + ' de ' + score(completed * 600) + ' puntos). La proyección supone que mantienes el mismo rendimiento.'
        : 'Resultado completo: ' + score(currentTotal) + ' de 1800 puntos, equivalente a ' + vigesimal(currentTotal) + '.'
    );
  }

  function init() {
    var career = byId('careerSelect');
    if (!career || !byId('admissionProbabilityRing')) return;
    ['idealExam1', 'idealExam2', 'idealExam3'].forEach(function (id) {
      var input = byId(id);
      if (input) input.addEventListener('input', render);
    });
    career.addEventListener('change', render);
    var reset = byId('idealScoreReset');
    if (reset) reset.addEventListener('click', function () {
      ['idealExam1', 'idealExam2', 'idealExam3'].forEach(function (id) { var input = byId(id); if (input) input.value = ''; });
      render();
      var first = byId('idealExam1');
      if (first) first.focus();
    });
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
