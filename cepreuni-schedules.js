(function () {
  'use strict';

  var root = document.getElementById('cepre-schedules-app');
  var data = window.UNIVERSE_CEPREUNI_2027;
  if (!root || !data || !data.cycles) return;

  var state = { cycle: 'preuniversitario', shift: 'morning', module: 'module1' };
  var cycleOrder = ['preuniversitario', 'basico', 'ien'];

  function safe(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function formatDate(value) {
    var parts = String(value || '').split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2], 12).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function courseClass(course) {
    var value = String(course || '').toLowerCase();
    if (/física|química/.test(value)) return 'science';
    if (/humanidades|verbal/.test(value)) return 'humanities';
    return 'math';
  }

  function button(label, attributes, active) {
    return '<button type="button" ' + attributes + ' aria-pressed="' + (active ? 'true' : 'false') + '" class="' + (active ? 'active' : '') + '">' + safe(label) + '</button>';
  }

  function renderDay(day) {
    return '<article class="cepre-day-card"><header><span></span><h3>' + safe(day.name) + '</h3></header><div>' + day.sessions.map(function (session) {
      return '<div class="cepre-session ' + courseClass(session.course) + '"><time>' + safe(session.time) + '</time><strong>' + safe(session.course) + '</strong>' + (session.note ? '<small>' + safe(session.note) + '</small>' : '') + '</div>';
    }).join('') + '</div></article>';
  }

  function renderMilestones(cycle) {
    return '<details class="cepre-milestones"><summary><span>CRONOGRAMA ACADÉMICO</span><strong>' + cycle.evaluations.length + ' fechas integradas al planificador</strong><i>+</i></summary><div>' + cycle.evaluations.map(function (item) {
      return '<article><time datetime="' + safe(item.date) + '"><b>' + safe(formatDate(item.date)) + '</b><span>' + safe(new Date(item.date + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long' })) + '</span></time><div><strong>' + safe(item.name) + '</strong><small>' + safe(item.mode) + '</small></div></article>';
    }).join('') + '</div></details>';
  }

  function render() {
    var cycle = data.cycles[state.cycle] || data.cycles.preuniversitario;
    var shift = cycle.schedule[state.shift] || cycle.schedule.morning;
    var hasModules = Object.keys(shift.modules || {}).length > 1;
    if (!shift.modules[state.module]) state.module = 'module1';
    var days = shift.modules[state.module] || [];

    root.innerHTML =
      '<div class="cepre-cycle-tabs" aria-label="Elegir ciclo">' + cycleOrder.map(function (key) { return button(data.cycles[key].shortTitle, 'data-cepre-cycle="' + key + '"', state.cycle === key); }).join('') + '</div>' +
      '<div class="cepre-schedule-shell">' +
        '<header class="cepre-schedule-head"><div><span>HORARIO OFICIAL</span><h2>' + safe(cycle.title) + '</h2><p>Inicio de clases: <b>' + safe(formatDate(cycle.startDate)) + '</b></p></div><a href="/planificador">Crear mi plan <span>→</span></a></header>' +
        '<div class="cepre-schedule-controls"><div class="cepre-turn-tabs" aria-label="Elegir turno">' +
          button('Turno mañana', 'data-cepre-shift="morning"', state.shift === 'morning') + button('Turno tarde', 'data-cepre-shift="afternoon"', state.shift === 'afternoon') +
        '</div>' + (hasModules ? '<div class="cepre-module-tabs" aria-label="Elegir módulo">' + button('Módulo I', 'data-cepre-module="module1"', state.module === 'module1') + button('Módulo II', 'data-cepre-module="module2"', state.module === 'module2') + '</div>' : '') + '</div>' +
        '<div class="cepre-schedule-note"><span>◷</span><b>' + safe(shift.label) + '</b><p>' + safe(shift.breakLabel) + '</p></div>' +
        '<div class="cepre-days-grid">' + days.map(renderDay).join('') + '</div>' +
        renderMilestones(cycle) +
      '</div>';

    Array.prototype.forEach.call(root.querySelectorAll('[data-cepre-cycle]'), function (control) {
      control.onclick = function () { state.cycle = control.dataset.cepreCycle; state.module = 'module1'; render(); };
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-cepre-shift]'), function (control) {
      control.onclick = function () { state.shift = control.dataset.cepreShift; state.module = 'module1'; render(); };
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-cepre-module]'), function (control) {
      control.onclick = function () { state.module = control.dataset.cepreModule; render(); };
    });
  }

  render();
})();
