(function () {
  'use strict';

  var exams = {
    humanidades: window.UNIVERSE_ADMISSION_2026_2,
    matematica: window.UNIVERSE_ADMISSION_2026_2_EXAM2,
    ciencias: window.UNIVERSE_ADMISSION_2026_2_EXAM3
  };
  if (!exams.humanidades || !exams.matematica || !exams.ciencias) return;

  var requestedKey = new URLSearchParams(window.location.search).get('prueba');
  var currentKey = exams[requestedKey] ? requestedKey : 'ciencias';
  var data = exams[currentKey];
  var stats = data.stats;
  var nf0 = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 });
  var nf1 = new Intl.NumberFormat('es-PE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  var nf3 = new Intl.NumberFormat('es-PE', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  function byId(id) { return document.getElementById(id); }
  function set(id, value) { var el = byId(id); if (el) el.textContent = value; }
  function points(value) { return nf3.format(Number(value || 0)); }
  function vigesimal(value) { return nf3.format(Number(value || 0) / data.examMax * 20); }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function signed(value, digits) {
    var n = Number(value || 0);
    return (n > 0 ? '+' : '') + new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(n);
  }
  function selectedMeta() {
    if (currentKey === 'humanidades') {
      return {
        date: 'Resultados oficiales · 10 de agosto de 2026',
        title: 'Primera prueba: Humanidades y Aptitud Académica',
        description: 'Distribución completa de la primera prueba de Admisión UNI 2026-2. Esta evaluación aporta hasta 600 puntos de los 1.800 del proceso.',
        converter: 'Convierte tu resultado de Humanidades y Aptitud Académica a una escala 0–20.',
        percentile: 'Compara tu nota con quienes rindieron la primera prueba.',
        targetTitle: 'Meta para las dos pruebas restantes',
        targetDescription: 'Calcula el promedio necesario entre Matemática y Física–Química para llegar a una meta final.',
        targetLabel: 'Puntaje de la primera prueba',
        targetMax: 600,
        targetDefault: 300
      };
    }
    if (currentKey === 'matematica') return {
      date: 'Resultados oficiales · 12 de agosto de 2026',
      title: 'Segunda prueba: Matemática',
      description: 'Distribución completa de la segunda prueba de Admisión UNI 2026-2. Matemática aporta hasta 600 puntos y, junto con Humanidades, completa 1.200 de los 1.800 puntos del proceso.',
      converter: 'Convierte tu resultado de Matemática a una escala 0–20.',
      percentile: 'Compara tu nota con quienes rindieron Matemática.',
      targetTitle: 'Meta para la prueba restante',
      targetDescription: 'Calcula cuánto necesitarías en Física–Química para llegar a una meta final.',
      targetLabel: 'Puntaje acumulado de las dos pruebas',
      targetMax: 1200,
      targetDefault: 480
    };
    return {
      date: 'Resultados oficiales · 15 de agosto de 2026',
      title: 'Tercera prueba: Física y Química',
      description: 'Distribución completa de la prueba de Física y Química de Admisión UNI 2026-2. Con esta evaluación se completaron los 1.800 puntos del concurso ordinario.',
      converter: 'Convierte tu resultado de Física y Química a una escala 0–20.',
      percentile: 'Compara tu nota con quienes rindieron la prueba de Ciencias.',
      targetTitle: 'Evalúa tu puntaje final',
      targetDescription: 'Ingresa el acumulado de las tres pruebas y compáralo con una meta vigesimal final.',
      targetLabel: 'Puntaje final acumulado de las tres pruebas',
      targetMax: 1800,
      targetDefault: 700
    };
  }
  function difficulty(mean) {
    var ratio = mean / data.examMax * 100;
    if (ratio >= 70) return { label: 'Accesibilidad alta', text: 'El promedio superó el 70 % del puntaje máximo.' };
    if (ratio >= 55) return { label: 'Dificultad moderada', text: 'El promedio quedó entre 55 % y 70 % del máximo.' };
    if (ratio >= 40) return { label: 'Examen exigente', text: 'El promedio quedó entre 40 % y 55 % del máximo.' };
    return { label: 'Examen muy exigente', text: 'El promedio quedó por debajo del 40 % del máximo.' };
  }
  function renderHeader() {
    var meta = selectedMeta();
    set('examOverviewKicker', meta.date);
    set('examOverviewTitle', meta.title);
    set('examOverviewDescription', meta.description);
    set('converterDescription', meta.converter);
    set('percentileDescription', meta.percentile);
    set('targetToolTitle', meta.targetTitle);
    set('targetToolDescription', meta.targetDescription);
    set('targetScoreLabel', meta.targetLabel);
    var target = byId('targetScoreInput');
    if (target) {
      target.max = String(meta.targetMax);
      target.value = String(meta.targetDefault);
    }
    var activeButton = null;
    document.querySelectorAll('[data-exam-result]').forEach(function (button) {
      var active = button.getAttribute('data-exam-result') === currentKey;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
      if (active) activeButton = button;
    });
    if (activeButton && window.innerWidth <= 760) activeButton.scrollIntoView({ block: 'nearest', inline: 'nearest' });
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
  function tiedLabel(person, count, kind) {
    if (count > 1) return person.name + ' · ' + person.code + ' · ' + nf0.format(count) + ' empatados en el ' + kind;
    return person.name + ' · ' + person.code;
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
    set('examTopStudent', tiedLabel(stats.maximumStudent, stats.maximumCount || 1, 'máximo'));
    set('examLowScore', points(stats.minimum));
    set('examLowStudent', tiedLabel(stats.minimumStudent, stats.minimumCount || 1, 'mínimo'));
    set('examMeanCaption', 'Promedio: ' + points(stats.mean) + ' puntos · barra naranja');
  }
  function renderScoring() {
    var scoring = data.scoring || (currentKey === 'humanidades' ? { correct: 6, wrong: -1.2, blank: 0 } : {});
    var questions = data.questionCount || (currentKey === 'humanidades' ? 100 : '—');
    set('scoringQuestionCount', questions);
    set('scoringCorrect', '+' + nf1.format(scoring.correct || 0) + ' puntos');
    set('scoringWrong', '−' + nf1.format(Math.abs(scoring.wrong || 0)) + ' puntos');
    set('scoringBlank', nf1.format(scoring.blank || 0) + ' puntos');
  }
  function renderComparison() {
    var container = byId('examComparison');
    if (!container) return;
    var h = exams.humanidades.stats;
    var m = exams.matematica.stats;
    var c = exams.ciencias.stats;
    var comparison = [
      { key: 'Humanidades', stats: h },
      { key: 'Matemática', stats: m },
      { key: 'Ciencias', stats: c }
    ];
    var hardest = comparison.slice().sort(function (a, b) { return a.stats.mean - b.stats.mean; })[0];
    var mostVariable = comparison.slice().sort(function (a, b) { return b.stats.standardDeviationPopulation - a.stats.standardDeviationPopulation; })[0];
    var highestMaximum = comparison.slice().sort(function (a, b) { return b.stats.maximum - a.stats.maximum; })[0];
    var cards = [
      { title: 'Promedio de Ciencias', delta: points(c.mean) + ' pts', detail: 'Humanidades ' + points(h.mean) + ' · Matemática ' + points(m.mean), tone: 'neutral' },
      { title: 'Prueba más exigente', delta: hardest.key, detail: nf1.format(hardest.stats.mean / 600 * 100) + ' % del puntaje máximo', tone: 'down' },
      { title: 'Mayor dispersión', delta: mostVariable.key, detail: 'Desviación de ' + points(mostVariable.stats.standardDeviationPopulation) + ' puntos', tone: 'neutral' },
      { title: 'Mayor máximo', delta: highestMaximum.key, detail: points(highestMaximum.stats.maximum) + ' de 600 puntos', tone: 'up' },
      { title: 'Resultados de Ciencias', delta: nf0.format(c.present), detail: nf0.format(c.registered) + ' registros oficiales publicados', tone: 'neutral' }
    ];
    container.innerHTML = cards.map(function (card) {
      return '<article><span>' + card.title + '</span><strong class="' + card.tone + '">' + card.delta + '</strong><small>' + card.detail + '</small></article>';
    }).join('');
  }
  function parseInput(input, max) {
    var value = Number(String(input && input.value || '').replace(',', '.'));
    return clamp(isFinite(value) ? value : 0, 0, max);
  }
  function updateConverter() {
    var score = parseInput(byId('scoreConverterInput'), data.examMax);
    set('scoreConverterResult', vigesimal(score) + ' / 20');
    set('scoreConverterDetail', points(score / data.totalMax * 20) + ' puntos vigesimales aportados al total final de 3 pruebas');
  }
  function updatePercentile() {
    var score = parseInput(byId('percentileInput'), data.examMax);
    var frequencies = data.scoreFrequencies || [];
    var belowOrEqual = frequencies.reduce(function (sum, item) { return sum + (item.score <= score ? item.count : 0); }, 0);
    var above = frequencies.reduce(function (sum, item) { return sum + (item.score > score ? item.count : 0); }, 0);
    var percentile = stats.present ? belowOrEqual / stats.present * 100 : 0;
    set('percentileResult', 'Percentil ' + nf1.format(percentile));
    set('percentileDetail', 'Puesto estimado ' + nf0.format(above + 1) + ' de ' + nf0.format(stats.present) + ' · ' + (score >= stats.mean ? 'sobre' : 'debajo de') + ' la media');
  }
  function updateTarget() {
    var completed = Number(data.completedExams || 1);
    var remainingExams = Math.max(0, 3 - completed);
    var accumulatedMax = completed * data.examMax;
    var accumulated = parseInput(byId('targetScoreInput'), accumulatedMax);
    var goal = parseInput(byId('targetVigesimalInput'), 20);
    var totalGoal = goal / 20 * data.totalMax;
    var remaining = totalGoal - accumulated;
    if (remaining <= 0) {
      set('targetResult', 'Meta ya cubierta');
      set('targetDetail', 'El puntaje acumulado ya alcanza los puntos equivalentes a la meta final elegida.');
    } else if (!remainingExams || remaining / remainingExams > data.examMax) {
      set('targetResult', 'Meta no alcanzable');
      set('targetDetail', remainingExams ? 'Necesitarías ' + points(remaining / remainingExams) + ' por prueba restante, por encima del máximo de 600.' : 'Las tres pruebas ya concluyeron: el resultado ingresado queda por debajo de la meta elegida.');
    } else if (remainingExams === 1) {
      set('targetResult', points(remaining) + ' puntos');
      set('targetDetail', 'Ese es el mínimo necesario en Física–Química para cerrar con ' + nf1.format(goal) + '/20.');
    } else {
      set('targetResult', points(remaining / remainingExams) + ' por examen');
      set('targetDetail', 'Necesitas ' + points(remaining) + ' puntos entre Matemática y Física–Química para cerrar con ' + nf1.format(goal) + '/20.');
    }
  }
  function renderTools() { updateConverter(); updatePercentile(); updateTarget(); }
  function renderSelectedExam() {
    data = exams[currentKey];
    stats = data.stats;
    renderHeader();
    renderChart();
    renderStats();
    renderScoring();
    renderTools();
  }
  window.UNIVERSE_SELECT_ADMISSION_EXAM = function (key) {
    if (!exams[key]) return;
    currentKey = key;
    renderSelectedExam();
  };
  function bindEvents() {
    ['scoreConverterInput', 'percentileInput', 'targetScoreInput', 'targetVigesimalInput'].forEach(function (id) {
      var input = byId(id);
      if (!input) return;
      var handler = id === 'scoreConverterInput' ? updateConverter : id === 'percentileInput' ? updatePercentile : updateTarget;
      input.addEventListener('input', handler);
    });
  }
  function init() { bindEvents(); renderComparison(); renderSelectedExam(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
