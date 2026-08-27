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
    if (/algebra|álgebra/.test(value)) return 'schedule-cell-algebra';
    if (/geometría/.test(value)) return 'schedule-cell-geometry';
    if (/química/.test(value)) return 'schedule-cell-chemistry';
    if (/trigonometría/.test(value)) return 'schedule-cell-trig';
    if (/física/.test(value)) return 'schedule-cell-physics';
    if (/aritmética/.test(value)) return 'schedule-cell-arithmetic';
    if (/humanidades|verbal/.test(value)) return 'schedule-cell-humanities';
    return 'schedule-cell-general';
  }

  function button(label, attributes, active) {
    return '<button type="button" ' + attributes + ' aria-pressed="' + (active ? 'true' : 'false') + '" class="' + (active ? 'active' : '') + '">' + safe(label) + '</button>';
  }

  function startMinutes(time) {
    var match = String(time || '').match(/^(\d{2}):(\d{2})/);
    return match ? Number(match[1]) * 60 + Number(match[2]) : 0;
  }

  function displayTime(time) { return safe(String(time || '').replace(/–/g, ' - ')); }

  function generalBreak(shift) {
    var match = String(shift.breakLabel || '').match(/^Descanso general:\s*(\d{2}:\d{2}–\d{2}:\d{2})/);
    return match ? match[1] : '';
  }

  function renderTable(days, label, shift) {
    var times = [];
    days.forEach(function (day) {
      day.sessions.forEach(function (session) { if (times.indexOf(session.time) < 0) times.push(session.time); });
    });
    var breakTime = generalBreak(shift);
    if (breakTime && times.indexOf(breakTime) < 0) times.push(breakTime);
    times.sort(function (left, right) { return startMinutes(left) - startMinutes(right); });

    var rows = times.map(function (time) {
      if (time === breakTime) return '<tr><th class="schedule-time schedule-cell-break" scope="row">' + displayTime(time) + '</th><td class="schedule-cell-break" colspan="6">RECESO</td></tr>';
      var sessions = days.map(function (day) { return day.sessions.find(function (session) { return session.time === time; }); });
      var sameCourse = sessions.length === 6 && sessions.every(function (session) { return session && session.course === sessions[0].course && session.note === sessions[0].note; });
      if (sameCourse) {
        return '<tr><th class="schedule-time" scope="row">' + displayTime(time) + '</th><td class="' + courseClass(sessions[0].course) + '" colspan="6">' + safe(sessions[0].course) + (sessions[0].note ? '<small>' + safe(sessions[0].note) + '</small>' : '') + '</td></tr>';
      }
      return '<tr><th class="schedule-time" scope="row">' + displayTime(time) + '</th>' + sessions.map(function (session) {
        return session ? '<td class="' + courseClass(session.course) + '"><strong>' + safe(session.course) + '</strong>' + (session.note ? '<small>' + safe(session.note) + '</small>' : '') + '</td>' : '<td class="schedule-cell-empty" aria-label="Sin clase">—</td>';
      }).join('') + '</tr>';
    }).join('');

    return '<section class="schedule-module"><div class="schedule-module-title">' + safe(label) + '</div><div class="schedule-table-wrap"><table class="schedule-table"><thead><tr><th scope="col">Hora</th>' + days.map(function (day) { return '<th scope="col">' + safe(day.name) + '</th>'; }).join('') + '</tr></thead><tbody>' + rows + '</tbody></table></div></section>';
  }

  function renderMilestones(cycle) {
    return '<details class="cepre-milestones"><summary><span>CRONOGRAMA ACADÉMICO</span><strong>' + cycle.evaluations.length + ' fechas integradas al planificador</strong><i>+</i></summary><div>' + cycle.evaluations.map(function (item) {
      return '<article><time datetime="' + safe(item.date) + '"><b>' + safe(formatDate(item.date)) + '</b><span>' + safe(new Date(item.date + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long' })) + '</span></time><div><strong>' + safe(item.name) + '</strong><small>' + safe(item.mode) + '</small></div></article>';
    }).join('') + '</div></details>';
  }

  function render() {
    var cycle = data.cycles[state.cycle] || data.cycles.preuniversitario;
    var shift = cycle.schedule[state.shift] || cycle.schedule.morning;
    if (!shift.modules[state.module]) state.module = 'module1';
    var moduleKeys = Object.keys(shift.modules || {});

    root.innerHTML =
      '<div class="cepre-cycle-tabs" aria-label="Elegir ciclo">' + cycleOrder.map(function (key) { return button(data.cycles[key].shortTitle, 'data-cepre-cycle="' + key + '"', state.cycle === key); }).join('') + '</div>' +
      '<div class="cepre-schedule-shell">' +
        '<header class="cepre-schedule-head"><div><span>HORARIO OFICIAL</span><h2>' + safe(cycle.title) + '</h2><p>Inicio de clases: <b>' + safe(formatDate(cycle.startDate)) + '</b></p></div><a href="/planificador">Crear mi plan <span>→</span></a></header>' +
        '<div class="cepre-schedule-controls"><div class="cepre-turn-tabs" aria-label="Elegir turno">' +
          button('Turno mañana', 'data-cepre-shift="morning"', state.shift === 'morning') + button('Turno tarde', 'data-cepre-shift="afternoon"', state.shift === 'afternoon') +
        '</div></div>' +
        '<div class="schedule-turn-title">' + safe(shift.label.toUpperCase()) + '</div>' +
        '<div class="cepre-schedule-note"><span>◷</span><b>DESCANSOS</b><p>' + safe(shift.breakLabel) + '</p></div>' +
        moduleKeys.map(function (key) { return renderTable(shift.modules[key], moduleKeys.length > 1 ? (key === 'module1' ? 'Módulo I' : 'Módulo II') : shift.label, shift); }).join('') +
        renderMilestones(cycle) +
      '</div>';

    Array.prototype.forEach.call(root.querySelectorAll('[data-cepre-cycle]'), function (control) {
      control.onclick = function () { state.cycle = control.dataset.cepreCycle; state.module = 'module1'; render(); };
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-cepre-shift]'), function (control) {
      control.onclick = function () { state.shift = control.dataset.cepreShift; state.module = 'module1'; render(); };
    });
  }

  render();
})();
