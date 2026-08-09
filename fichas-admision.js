(function () {
  'use strict';
  var data = Array.isArray(window.UNIVERSE_ADMISSION_FREQUENCY) ? window.UNIVERSE_ADMISSION_FREQUENCY : [];
  var groups = {
    matematica: { label: 'Examen de Matemática', color: '#2563eb', copy: 'Aritmética, Álgebra, Geometría y Trigonometría.' },
    ciencias: { label: 'Examen de Física y Química', color: '#0f9f6e', copy: 'Problemas y conceptos de Física y Química.' },
    humanidades: { label: 'Examen de Aptitud y Humanidades', color: '#e5484d', copy: 'Razonamiento, comunicación y cursos de Humanidades.' }
  };
  var active = 'matematica';
  var grid = document.getElementById('ufa-grid');
  var title = document.getElementById('ufa-title');
  var description = document.getElementById('ufa-description');
  var summary = document.getElementById('ufa-summary');
  function esc(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]; }); }
  function render() {
    var meta = groups[active];
    var rows = data.filter(function (item) { return item.group === active; });
    title.textContent = meta.label;
    description.textContent = meta.copy + ' Los temas están ordenados por su recurrencia histórica.';
    summary.textContent = rows.length + ' cursos analizados';
    grid.innerHTML = rows.map(function (item) {
      return '<article class="ufa-card" style="--accent:'+meta.color+'"><div class="ufa-card-head"><div><span>Ficha por curso</span><h3>'+esc(item.course)+'</h3></div><div class="ufa-total"><b>'+item.total+'</b>registros</div></div><ol class="ufa-topic-list">'+item.topics.map(function(topic,index){return '<li class="ufa-topic"><span class="ufa-topic-rank">'+String(index+1).padStart(2,'0')+'</span><div><b>'+esc(topic.topic)+'</b><small>Presente en '+topic.exams+' procesos</small></div><span class="ufa-topic-count">'+topic.count+'×</span></li>'}).join('')+'</ol></article>';
    }).join('');
  }
  document.querySelectorAll('[data-ufa-group]').forEach(function (button) {
    button.addEventListener('click', function () {
      active = button.getAttribute('data-ufa-group');
      document.querySelectorAll('[data-ufa-group]').forEach(function (item) { item.classList.toggle('active', item === button); });
      render();
    });
  });
  render();
})();
