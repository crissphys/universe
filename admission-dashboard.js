(function () {
  'use strict';
  var data = window.UNIVERSE_ADMISSION_2026_2;
  if (!data) return;
  var stats = data.stats;
  var nf0 = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 });
  var nf1 = new Intl.NumberFormat('es-PE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  var nf3 = new Intl.NumberFormat('es-PE', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  function byId(id) { return document.getElementById(id); }
  function set(id, value) { var el = byId(id); if (el) el.textContent = value; }
  function points(value) { return nf3.format(Number(value || 0)); }
  function vigesimal(value) { return nf3.format(Number(value || 0) / data.examMax * 20); }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function difficulty(mean) {
    var ratio = mean / data.examMax * 100;
    if (ratio >= 70) return { label: 'Accesibilidad alta', text: 'El promedio superó el 70 % del puntaje máximo.' };
    if (ratio >= 55) return { label: 'Dificultad moderada', text: 'El promedio quedó entre 55 % y 70 % del máximo.' };
    if (ratio >= 40) return { label: 'Examen exigente', text: 'El promedio quedó entre 40 % y 55 % del máximo.' };
    return { label: 'Examen muy exigente', text: 'El promedio quedó por debajo del 40 % del máximo.' };
  }
  function renderChart() {
    var chart = byId('admissionScoreHistogram');
    if (!chart) return;
    var bins = stats.bins || [];
    var maxCount = Math.max.apply(null, bins.map(function (bin) { return bin.count; }));
    chart.innerHTML = bins.map(function (bin) {
      var height = maxCount ? Math.max(1.2, bin.count / maxCount * 100) : 1.2;
      var meanBin = stats.mean >= bin.low && (stats.mean < bin.high || bin.high === data.examMax);
      var range = bin.high === data.examMax ? bin.low + '–' + bin.high : bin.low + '–<' + bin.high;
      return '<div class="histogram-bar' + (meanBin ? ' mean-bin' : '') + '" tabindex="0" style="--bar-height:' + height.toFixed(2) + '%" aria-label="' + nf0.format(bin.count) + ' postulantes entre ' + bin.low + ' y ' + bin.high + ' puntos">' +
        '<div class="histogram-tooltip"><b>' + nf0.format(bin.count) + '</b>postulantes<br>' + range + ' puntos</div><i></i><span>' + bin.low + '–' + bin.high + '</span></div>';
    }).join('');
  }
  function renderStats() {
    var d = difficulty(stats.mean);
    set('examPresent', nf0.format(stats.present));
    set('examRegistered', nf0.format(stats.registered) + ' inscritos · ' + nf0.format(stats.absent) + ' ausentes');
    set('examMean', points(stats.mean));
    set('examMean20', vigesimal(stats.mean) + ' / 20');
    set('examStdDev', points(stats.standardDeviationPopulation));
    set('examStdDevNote', 'dispersión poblacional de puntajes');
    set('examDifficulty', d.label);
    set('examDifficultyNote', d.text);
    set('examTopScore', points(stats.maximum));
    set('examTopStudent', stats.maximumStudent.name + ' · ' + stats.maximumStudent.code);
    set('examLowScore', points(stats.minimum));
    set('examLowStudent', stats.minimumStudent.name + ' · ' + stats.minimumStudent.code);
    set('examMeanCaption', 'Promedio: ' + points(stats.mean) + ' puntos · barra naranja');
  }
  function parseScore(input) {
    var value = Number(String(input.value || '').replace(',', '.'));
    return clamp(isFinite(value) ? value : 0, 0, data.examMax);
  }
  function renderTools() {
    var scoreInput = byId('scoreConverterInput');
    var percentileInput = byId('percentileInput');
    var targetInput = byId('targetScoreInput');
    var goalInput = byId('targetVigesimalInput');
    var frequencies = data.scoreFrequencies || [];
    function updateConverter() {
      var score = parseScore(scoreInput);
      set('scoreConverterResult', vigesimal(score) + ' / 20');
      set('scoreConverterDetail', points(score / data.totalMax * 20) + ' puntos vigesimales aportados al total final de 3 pruebas');
    }
    function updatePercentile() {
      var score = parseScore(percentileInput);
      var belowOrEqual = frequencies.reduce(function (sum, item) { return sum + (item.score <= score ? item.count : 0); }, 0);
      var above = frequencies.reduce(function (sum, item) { return sum + (item.score > score ? item.count : 0); }, 0);
      var percentile = belowOrEqual / stats.present * 100;
      set('percentileResult', 'Percentil ' + nf1.format(percentile));
      set('percentileDetail', 'Puesto estimado ' + nf0.format(above + 1) + ' de ' + nf0.format(stats.present) + ' · ' + (score >= stats.mean ? 'sobre' : 'debajo de') + ' la media');
    }
    function updateTarget() {
      var score = parseScore(targetInput);
      var goal = clamp(Number(String(goalInput.value || '').replace(',', '.')) || 0, 0, 20);
      var totalGoal = goal / 20 * data.totalMax;
      var remaining = totalGoal - score;
      var perExam = remaining / 2;
      if (remaining <= 0) {
        set('targetResult', 'Meta ya cubierta');
        set('targetDetail', 'Con este primer puntaje ya alcanzaste los puntos equivalentes a la meta final elegida.');
      } else if (perExam > data.examMax) {
        set('targetResult', 'Meta no alcanzable');
        set('targetDetail', 'Necesitarías ' + points(perExam) + ' por examen restante, por encima del máximo de 600.');
      } else {
        set('targetResult', points(perExam) + ' por examen');
        set('targetDetail', 'Necesitas ' + points(remaining) + ' puntos entre Matemática y Física–Química para cerrar con ' + nf1.format(goal) + '/20.');
      }
    }
    if (scoreInput) scoreInput.addEventListener('input', updateConverter);
    if (percentileInput) percentileInput.addEventListener('input', updatePercentile);
    if (targetInput) targetInput.addEventListener('input', updateTarget);
    if (goalInput) goalInput.addEventListener('input', updateTarget);
    updateConverter(); updatePercentile(); updateTarget();
  }
  function init() { renderChart(); renderStats(); renderTools(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
