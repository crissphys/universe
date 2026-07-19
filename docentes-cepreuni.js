(function () {
  var teacherRaw = window.UNIVERSE_TEACHERS_CEPREUNI || [];
  var state = { course: 'Todos' };
  function $(id) { return document.getElementById(id); }
  function norm(v) { return String(v || '').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function safe(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function courses() {
    return ['Todos'].concat(Array.from(new Set(teacherRaw.map(function (t) { return t.course; }))).sort(function (a, b) { return a.localeCompare(b, 'es'); }));
  }
  function stats() {
    var rooms = new Set();
    teacherRaw.forEach(function (t) {
      (t.schedule || []).forEach(function (s) { if (s.room && s.room !== '—') rooms.add(s.room); });
    });
    if ($('docentes-total')) $('docentes-total').textContent = String(teacherRaw.length);
    if ($('docentes-total-mini')) $('docentes-total-mini').textContent = String(teacherRaw.length);
    if ($('docentes-cursos')) $('docentes-cursos').textContent = String(courses().length - 1);
    if ($('docentes-salones')) $('docentes-salones').textContent = String(rooms.size);
  }
  function card(t) {
    var schedule = (t.schedule || []).map(function (s) {
      return '<div class="teachv6-slot"><span class="teachv6-time">' + safe(s.time) + '</span><span class="teachv6-room">' + safe(!s.room || s.room === '—' ? 'Sin aula' : s.room) + '</span></div>';
    }).join('');
    return '<article class="teachv6-card"><div class="teachv6-card-top"><span class="teachv6-course">' + safe(t.course) + '</span><span class="teachv6-floor">' + safe((t.floors || []).join(' / ') || 'Aula por confirmar') + '</span></div><div class="teachv6-card-body"><h3 class="teachv6-name">' + safe(t.name) + '</h3><div class="teachv6-rooms">Salones: ' + safe(t.roomsSummary || 'Por confirmar') + '</div><div class="teachv6-schedule">' + schedule + '</div></div></article>';
  }
  function render() {
    var grid = $('teachv6-grid'), search = $('teachv6-search'), count = $('teachv6-count');
    if (!grid) return;
    var term = norm(search && search.value);
    var visible = teacherRaw.filter(function (t) {
      var haystack = norm([t.name, t.course, t.roomsSummary, (t.floors || []).join(' '), (t.schedule || []).map(function (s) { return s.room + ' ' + s.time; }).join(' ')].join(' '));
      return (state.course === 'Todos' || t.course === state.course) && (!term || haystack.indexOf(term) >= 0);
    });
    grid.innerHTML = visible.length ? visible.map(card).join('') : '<div class="teachv6-empty">No encontramos docentes con esos filtros.</div>';
    if (count) count.textContent = visible.length + ' docente' + (visible.length === 1 ? '' : 's') + ' visibles';
  }
  function renderFilters() {
    var root = $('teachv6-filters');
    if (!root) return;
    root.innerHTML = courses().map(function (name, i) {
      return '<button class="teachv6-filter' + (i === 0 ? ' active' : '') + '" data-course="' + safe(name) + '" type="button">' + safe(name) + '</button>';
    }).join('');
    root.querySelectorAll('[data-course]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.course = btn.getAttribute('data-course') || 'Todos';
        root.querySelectorAll('button').forEach(function (b) { b.classList.toggle('active', b === btn); });
        render();
      });
    });
  }
  function boot() {
    renderFilters();
    stats();
    var input = $('teachv6-search');
    if (input) input.addEventListener('input', render);
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
