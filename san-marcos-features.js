(function () {
  'use strict';

  var MAX_SM = 2000;
  var fmt0 = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 });
  var fmt1 = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 1 });
  var fmt3 = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 3 });

  function data() { return window.UNIVERSE_SAN_MARCOS || null; }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function text(v) { return String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  function pct(v) { return Math.max(0, Math.min(100, (Number(v) || 0) / MAX_SM * 100)); }
  function score(v) { return v == null || !isFinite(v) ? 'Sin dato' : fmt1.format(Number(v)); }
  function smallTopic(v) {
    v = String(v || '').trim();
    return v.length > 86 ? v.slice(0, 83).trim() + '…' : v;
  }
  function rows(cycle) {
    var d = data();
    return d && d.results && d.results[cycle] ? d.results[cycle] : [];
  }
  function cycles() {
    var d = data();
    return d && d.results ? Object.keys(d.results).sort().reverse() : [];
  }
  function idealFor(r) {
    var min = Number(r.min) || 0, max = Number(r.max) || min, mean = Number(r.mean) || min;
    var spread = Math.max(0, max - min);
    var safety = Math.max(70, Math.min(180, spread * .28 || min * .07));
    var zoneLow = Math.min(MAX_SM, min + Math.max(30, safety * .38));
    var zoneHigh = Math.min(MAX_SM, Math.max(zoneLow + 25, min + safety));
    var target = Math.min(MAX_SM, Math.max(zoneHigh + 25, mean + safety * .72));
    return { low: zoneLow, high: zoneHigh, target: target, latest: min, spread: spread };
  }
  function ratio(r) {
    return Number(r.vacancies) > 0 ? Number(r.applicants || 0) / Number(r.vacancies) : 0;
  }
  function rowLabel(r) {
    return r.career + (r.campus && r.campus !== 'Lima' ? ' - ' + r.campus : '');
  }
  function sourceNote() {
    var d = data();
    if (!d) return '';
    return '<p class="uts-sm-note">Fuentes referenciales: <a href="https://ciclero.guru/temario" target="_blank" rel="noopener noreferrer">temario Ciclero</a>, <a href="https://ciclero.guru/analisis-resultados" target="_blank" rel="noopener noreferrer">análisis 2026-I</a> y <a href="https://admision.unmsm.edu.pe/Website20262/" target="_blank" rel="noopener noreferrer">resultados oficiales UNMSM 2026-II</a>. El simulacro de Universe usa preguntas originales, no copia bancos externos.</p>';
  }

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
    document.body.appendChild(drawerShell());

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
    var initial = location.hash === '#san-marcos' ? 'unmsm' : (function () {
      try { return localStorage.getItem('universe_syllabus_mode') || 'uni'; } catch (e) { return 'uni'; }
    })();
    setMode(initial);
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
    return '<header class="uts-sm-hero"><div><span class="uts-sm-kicker">Temario de San Marcos ' + esc(d.syllabusCycle) + '</span><h2>Universidad Nacional Mayor de San Marcos</h2><p>Ruta de repaso por cursos: abre una tarjeta y usa sus contenidos como lista de control para teoría, práctica y simulacro.</p></div><div class="uts-sm-logo-lockup"><div><strong>UNMSM</strong><span>San Marcos</span></div></div></header><div class="uts-sm-body"><div class="uts-sm-group-grid">' + cards + '</div>' + sourceNote() + '</div>';
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
    body.innerHTML = '<div class="uts-sm-mini-guide"><b>Cómo repasarlo:</b> primero define los conceptos, luego resuelve ejercicios o preguntas tipo admisión y al final arma un resumen propio de errores frecuentes.</div><ol class="uts-sm-topic-list">' +
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

  function initIdealSanMarcos() {
    if (!data() || !/\/admision(\.html)?\/?$/.test(location.pathname)) return;
    var anchor = $('#puntaje-ideal') || $('.admission-page');
    if (!anchor || $('#puntaje-ideal-san-marcos')) return;
    var section = document.createElement('section');
    section.className = 'uts-sm-admission';
    section.id = 'puntaje-ideal-san-marcos';
    section.innerHTML =
      '<span class="uts-sm-kicker">San Marcos · escala 0 a 2000</span><h2>Puntaje ideal por carrera para el próximo examen</h2><p class="uts-sm-note">Elige una carrera/sede y mira el corte reciente, zona ideal aproximada y meta recomendada con margen.</p>' +
      '<div class="uts-sm-input-grid"><label>Carrera a comparar<select id="uts-sm-career"></select></label><button class="uts-sm-action" id="uts-sm-calc" type="button">Calcular puntaje ideal</button></div>' +
      '<div class="uts-sm-scorebar"><div class="uts-sm-track"><i class="uts-sm-zone" id="uts-sm-zone"></i></div><b class="uts-sm-marker" id="uts-sm-latest" data-label="corte"></b><b class="uts-sm-marker" id="uts-sm-target" data-label="ideal"></b></div>' +
      '<div class="uts-sm-result-grid" id="uts-sm-metrics"></div><p class="uts-sm-note" id="uts-sm-reading"></p>' +
      '<div class="uts-sm-table-wrap"><table class="uts-sm-table"><thead><tr><th>Carrera</th><th>Sede</th><th>Corte reciente</th><th>Zona ideal</th><th>Puntaje ideal</th></tr></thead><tbody id="uts-sm-quick"></tbody></table></div>' +
      '<p><a class="admission-btn ghost" href="/resultados-admision?institucion=unmsm">Ver resultados San Marcos por concurso</a></p>' + sourceNote();
    anchor.parentNode.insertBefore(section, anchor.nextSibling);
    var sel = $('#uts-sm-career');
    var list = rows('2026-II').filter(function (r) { return r.min != null; }).sort(function (a, b) { return rowLabel(a).localeCompare(rowLabel(b)); });
    sel.innerHTML = list.map(function (r, i) { return '<option value="' + i + '">' + esc(rowLabel(r)) + '</option>'; }).join('');
    function render() {
      var r = list[Number(sel.value) || 0];
      if (!r) return;
      var est = idealFor(r);
      $('#uts-sm-zone').style.left = pct(est.low) + '%';
      $('#uts-sm-zone').style.width = Math.max(2, pct(est.high) - pct(est.low)) + '%';
      $('#uts-sm-latest').style.left = pct(est.latest) + '%';
      $('#uts-sm-latest').setAttribute('data-label', 'corte ' + score(est.latest));
      $('#uts-sm-target').style.left = pct(est.target) + '%';
      $('#uts-sm-target').setAttribute('data-label', 'ideal ' + score(est.target));
      $('#uts-sm-metrics').innerHTML = [
        ['Corte reciente', score(r.min) + ' pts'],
        ['Zona ideal', score(est.low) + ' a ' + score(est.high)],
        ['Puntaje ideal', score(est.target) + ' pts'],
        ['Competencia', ratio(r) ? fmt1.format(ratio(r)) + ' postulantes/vacante' : 'Sin dato']
      ].map(function (m) { return '<article class="uts-sm-metric"><span>' + esc(m[0]) + '</span><b>' + esc(m[1]) + '</b></article>'; }).join('');
      $('#uts-sm-reading').textContent = rowLabel(r) + ': para no quedarte pegado al corte, apunta a una zona de ' + score(est.low) + ' a ' + score(est.high) + ' puntos. La meta ideal sugerida es ' + score(est.target) + ' puntos.';
    }
    function renderQuick() {
      $('#uts-sm-quick').innerHTML = list.slice().sort(function (a, b) { return idealFor(b).target - idealFor(a).target; }).slice(0, 18).map(function (r) {
        var est = idealFor(r);
        return '<tr><td>' + esc(r.career) + '</td><td>' + esc(r.campus) + '</td><td>' + score(r.min) + '</td><td>' + score(est.low) + ' - ' + score(est.high) + '</td><td>' + score(est.target) + '</td></tr>';
      }).join('');
    }
    sel.addEventListener('change', render);
    $('#uts-sm-calc').addEventListener('click', render);
    render(); renderQuick();
  }

  function initResultsSanMarcos() {
    if (!data() || !/\/resultados-admision(\.html)?\/?$/.test(location.pathname)) return;
    var host = $('.results-page') || $('main') || document.body;
    if ($('#uts-sm-results')) return;
    var section = document.createElement('section');
    section.className = 'uts-sm-results';
    section.id = 'uts-sm-results';
    section.innerHTML =
      '<span class="uts-sm-kicker">Resultados San Marcos</span><h2>Máximos, mínimos, demanda y competitividad por carrera</h2><p class="uts-sm-note">Cambia el concurso y filtra por carrera. La tabla usa estadísticas agregadas por sede.</p>' +
      '<div class="uts-sm-input-grid"><label>Concurso<select id="uts-sm-cycle"></select></label><label>Filtrar carrera<input id="uts-sm-results-search" type="search" placeholder="Ejemplo: Medicina, Sistemas, Derecho"></label></div>' +
      '<div class="uts-sm-result-grid" id="uts-sm-kpis"></div><div class="uts-sm-bars" id="uts-sm-bars"></div><div class="uts-sm-table-wrap"><table class="uts-sm-table"><thead><tr><th>Carrera</th><th>Sede</th><th>Postulantes</th><th>Vacantes</th><th>Competencia</th><th>Mínimo</th><th>Máximo</th><th>Media</th></tr></thead><tbody id="uts-sm-results-body"></tbody></table></div>' + sourceNote();
    var first = $('.chart-grid', host) || host.firstElementChild;
    if (first && first.parentNode) first.parentNode.insertBefore(section, first);
    else host.appendChild(section);
    var cycleSel = $('#uts-sm-cycle');
    cycleSel.innerHTML = cycles().map(function (c) { return '<option value="' + esc(c) + '">' + esc(c) + '</option>'; }).join('');
    cycleSel.value = cycles()[0] || '';
    function filtered() {
      var q = text($('#uts-sm-results-search').value);
      return rows(cycleSel.value).filter(function (r) { return !q || text(rowLabel(r)).indexOf(q) >= 0; });
    }
    function render() {
      var list = filtered().filter(function (r) { return r.min != null; });
      var total = list.reduce(function (s, r) { return s + (Number(r.applicants) || 0); }, 0);
      var highDemand = list.slice().sort(function (a, b) { return ratio(b) - ratio(a); })[0];
      var highScore = list.slice().sort(function (a, b) { return (b.max || 0) - (a.max || 0); })[0];
      var lowCut = list.slice().sort(function (a, b) { return (a.min || 0) - (b.min || 0); })[0];
      $('#uts-sm-kpis').innerHTML = [
        ['Postulantes', fmt0.format(total)],
        ['Mayor competitividad', highDemand ? rowLabel(highDemand) : 'Sin dato'],
        ['Puntaje más alto', highScore ? score(highScore.max) + ' · ' + highScore.career : 'Sin dato'],
        ['Corte menor', lowCut ? score(lowCut.min) + ' · ' + rowLabel(lowCut) : 'Sin dato']
      ].map(function (m) { return '<article class="uts-sm-metric"><span>' + esc(m[0]) + '</span><b>' + esc(m[1]) + '</b></article>'; }).join('');
      $('#uts-sm-bars').innerHTML = list.slice().sort(function (a, b) { return (b.min || 0) - (a.min || 0); }).slice(0, 36).map(function (r) {
        return '<div class="uts-sm-bar-row"><small title="' + esc(rowLabel(r)) + '">' + esc(rowLabel(r)) + '</small><div class="uts-sm-bar"><i style="width:' + pct(r.min) + '%"></i></div><b>' + score(r.min) + '</b></div>';
      }).join('');
      $('#uts-sm-results-body').innerHTML = list.slice().sort(function (a, b) { return (b.min || 0) - (a.min || 0); }).map(function (r) {
        return '<tr><td>' + esc(r.career) + '</td><td>' + esc(r.campus) + '</td><td>' + fmt0.format(r.applicants || 0) + '</td><td>' + fmt0.format(r.vacancies || 0) + '</td><td>' + (ratio(r) ? fmt1.format(ratio(r)) + ' / vacante' : 'Sin dato') + '</td><td>' + score(r.min) + '</td><td>' + score(r.max) + '</td><td>' + score(r.mean) + '</td></tr>';
      }).join('');
    }
    cycleSel.addEventListener('change', render);
    $('#uts-sm-results-search').addEventListener('input', render);
    render();
    if (new URLSearchParams(location.search).get('institucion') === 'unmsm') setTimeout(function () { section.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 400);
  }

  function initSimulatorSanMarcos() {
    if (!data() || !/\/simulacros(\.html)?\/?$/.test(location.pathname)) return;
    var host = $('main') || document.body;
    if ($('#uts-sm-simulator')) return;
    var section = document.createElement('section');
    section.className = 'uts-sm-simulator';
    section.id = 'uts-sm-simulator';
    section.innerHTML =
      '<span class="uts-sm-kicker">Simulacro San Marcos</span><h2>Generador virtual por área y curso</h2><p class="uts-sm-note">Crea un bloque original de práctica con 5 alternativas. La estructura es referencial y cambia cada vez que generas.</p>' +
      '<div class="uts-sm-sim-controls"><label>Área<select id="uts-sm-area"></select></label><label>Curso<select id="uts-sm-sim-course"></select></label><label>Cantidad<select id="uts-sm-count"><option>10</option><option>20</option><option>40</option></select></label><button class="uts-sm-action" id="uts-sm-generate" type="button">Generar simulacro</button></div>' +
      '<div id="uts-sm-sim-status" class="uts-sm-note"></div><div class="uts-sm-questions" id="uts-sm-questions"></div>';
    var footer = $('footer');
    if (footer && footer.parentNode) footer.parentNode.insertBefore(section, footer);
    else host.appendChild(section);
    var areaCourses = {
      'Todas las áreas': [],
      'Área A · Ciencias de la Salud': ['Biología', 'Química', 'Física', 'Psicología', 'Habilidad verbal'],
      'Área B · Ciencias Básicas': ['Habilidad matemática', 'Aritmética', 'Álgebra', 'Geometría', 'Trigonometría', 'Física', 'Química', 'Biología'],
      'Área C · Ingeniería': ['Habilidad matemática', 'Aritmética', 'Álgebra', 'Geometría', 'Trigonometría', 'Física', 'Química'],
      'Área D · Económico-empresarial': ['Economía', 'Habilidad matemática', 'Aritmética', 'Álgebra', 'Lenguaje'],
      'Área E · Humanidades y Sociales': ['Lenguaje', 'Literatura', 'Historia del Perú', 'Historia universal', 'Geografía', 'Filosofía', 'Educación cívica', 'Habilidad verbal']
    };
    var areaSel = $('#uts-sm-area'), courseSel = $('#uts-sm-sim-course');
    areaSel.innerHTML = Object.keys(areaCourses).map(function (a) { return '<option>' + esc(a) + '</option>'; }).join('');
    function setCourses() {
      var names = areaCourses[areaSel.value];
      var list = data().syllabus.filter(function (c) { return !names.length || names.indexOf(c.name) >= 0; });
      courseSel.innerHTML = '<option value="">Todos los cursos del área</option>' + list.map(function (c) { return '<option value="' + esc(c.slug) + '">' + esc(c.name) + '</option>'; }).join('');
    }
    function pool() {
      var names = areaCourses[areaSel.value], selected = courseSel.value;
      return data().syllabus.filter(function (c) { return selected ? c.slug === selected : (!names.length || names.indexOf(c.name) >= 0); });
    }
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function shuffle(arr) { return arr.map(function (x) { return [Math.random(), x]; }).sort(function (a, b) { return a[0] - b[0]; }).map(function (x) { return x[1]; }); }
    function makeQuestion(courses, allCourses, n) {
      if (!courses.length) courses = allCourses;
      var ready = courses.filter(function (c) { return (c.topics || []).length; });
      var course = pick(ready.length ? ready : courses);
      var topic = pick(course.topics || ['Tema general']);
      var otherTopics = shuffle(allCourses.reduce(function (a, c) { return a.concat((c.topics || []).filter(function (t) { return t !== topic; }).slice(0, 18)); }, [])).slice(0, 4);
      var opts = shuffle([topic].concat(otherTopics)).slice(0, 5);
      while (opts.length < 5) opts.push('Revisión de conceptos y resolución de ejercicios');
      var correct = opts.indexOf(topic);
      return { n: n, course: course.name, topic: topic, correct: correct, opts: opts };
    }
    function generate() {
      var courses = pool();
      var all = data().syllabus;
      var count = Math.min(40, Math.max(5, Number($('#uts-sm-count').value) || 10));
      var questions = [];
      for (var i = 0; i < count; i++) questions.push(makeQuestion(courses, all, i + 1));
      $('#uts-sm-questions').innerHTML = questions.map(function (q) {
        return '<article class="uts-sm-question" data-correct="' + q.correct + '"><b>Pregunta ' + q.n + ' · ' + esc(q.course) + '</b><p>Selecciona el contenido que corresponde mejor al bloque de estudio planteado.</p><div class="uts-sm-options">' +
          q.opts.map(function (op, i) { return '<label><input type="radio" name="uts-sm-q' + q.n + '" value="' + i + '"><span>' + esc(smallTopic(op)) + '</span></label>'; }).join('') +
          '</div><small class="uts-sm-note">Clave de repaso: ' + esc(smallTopic(q.topic)) + '</small></article>';
      }).join('') + '<button class="uts-sm-action" id="uts-sm-grade" type="button">Calificar simulacro</button>';
      $('#uts-sm-sim-status').textContent = 'Simulacro generado: ' + count + ' preguntas originales para ' + areaSel.value + '.';
      $('#uts-sm-grade').addEventListener('click', function () {
        var ok = 0, total = 0;
        $all('.uts-sm-question').forEach(function (card) {
          total++;
          var selected = $('input:checked', card);
          if (selected && selected.value === card.getAttribute('data-correct')) ok++;
        });
        $('#uts-sm-sim-status').textContent = 'Resultado: ' + ok + ' de ' + total + '. Si fallaste varias, vuelve al temario San Marcos y repasa los bloques marcados.';
      });
    }
    areaSel.addEventListener('change', setCourses);
    $('#uts-sm-generate').addEventListener('click', generate);
    setCourses();
  }

  function init() {
    if (!data()) return;
    initSyllabusSwitch();
    initIdealSanMarcos();
    initResultsSanMarcos();
    initSimulatorSanMarcos();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
