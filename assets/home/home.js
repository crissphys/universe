/* UNIverse · Inicio v4: idioma, cuenta, titular, buscador y módulos en vivo de cada pilar. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var norm = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- textos: es (Latinoamérica), en, de, pt ---------- */
  var LANGS = ['es', 'en', 'de', 'pt'];
  var ROT = {
    es: ['INGRESA A', 'DOMINA', 'CONQUISTA', 'VIVE'],
    en: ['GET INTO', 'MASTER', 'CONQUER', 'LIVE'],
    de: ['SCHAFF DIE', 'MEISTERE DIE', 'EROBERE DIE', 'ERLEBE DIE'],
    pt: ['ENTRE NA', 'DOMINE A', 'CONQUISTE A', 'VIVA A']
  };
  var EXAMPLES = {
    es: ['Álgebra Lumbreras', 'tu código CEPREUNI', 'Examen de admisión 2026-2', 'Primeros Resúmenes', 'Física Cuzcano'],
    en: ['Álgebra Lumbreras', 'your CEPREUNI code', 'Admission exam 2026-2', 'Primeros Resúmenes', 'Física Cuzcano'],
    de: ['Álgebra Lumbreras', 'deinen CEPREUNI-Code', 'Aufnahmeprüfung 2026-2', 'Primeros Resúmenes', 'Física Cuzcano'],
    pt: ['Álgebra Lumbreras', 'seu código CEPREUNI', 'Prova de admissão 2026-2', 'Primeros Resúmenes', 'Física Cuzcano']
  };
  var T = {
    'skip': ['Saltar al contenido', 'Skip to content', 'Zum Inhalt springen', 'Pular para o conteúdo'],
    'nav.label': ['Principal', 'Main', 'Hauptnavigation', 'Principal'],
    'lang.label': ['Idioma: {x}', 'Language: {x}', 'Sprache: {x}', 'Idioma: {x}'],
    'hero.fixed': ['LA UNI', 'UNI', 'UNI', 'UNI'],
    'hero.aria': ['Ingresa a la UNI', 'Get into UNI', 'Schaff die UNI', 'Entre na UNI'],
    'hero.sub': ['Prepárate para la Universidad Nacional de Ingeniería.', 'Get ready for Peru’s National University of Engineering.', 'Bereite dich auf die Nationale Universität für Ingenieurwesen in Peru vor.', 'Prepare-se para a Universidade Nacional de Engenharia do Peru.'],
    'search.label': ['Buscar en UNIverse', 'Search UNIverse', 'In UNIverse suchen', 'Buscar no UNIverse'],
    'search.pre': ['Busca', 'Search', 'Suche', 'Busque'],
    'search.go': ['Buscar', 'Search', 'Suchen', 'Buscar'],
    'search.results': ['Resultados', 'Results', 'Ergebnisse', 'Resultados'],
    'cepre.line': ['Tu ciclo, tu puesto y tus fechas.', 'Your cycle, your rank, your dates.', 'Dein Zyklus, dein Rang, deine Termine.', 'Seu ciclo, sua posição e suas datas.'],
    'cepre.rank': ['Ranking 2027-1', 'Ranking 2027-1', 'Rangliste 2027-1', 'Ranking 2027-1'],
    'cepre.rank.s': ['Pre, Juliaca y Básico por código o nombre', 'Pre, Juliaca and Basic by code or name', 'Pre, Juliaca und Basis nach Code oder Name', 'Pre, Juliaca e Básico por código ou nome'],
    'cepre.cycle': ['Ciclo 2027-1', '2027-1 cycle', 'Zyklus 2027-1', 'Ciclo 2027-1'],
    'cepre.cycle.s': ['Horarios, semanas y calendario', 'Timetables, weeks and calendar', 'Stundenpläne, Wochen und Kalender', 'Horários, semanas e calendário'],
    'cepre.exams': ['Exámenes CEPREUNI', 'CEPREUNI exams', 'CEPREUNI-Prüfungen', 'Provas CEPREUNI'],
    'cepre.exams.s': ['Prácticas, parciales y finales', 'Quizzes, midterms and finals', 'Übungs-, Zwischen- und Abschlussprüfungen', 'Práticas, parciais e finais'],
    'cepre.calc': ['Calculadora', 'Calculator', 'Rechner', 'Calculadora'],
    'cepre.calc.s': ['Tu ponderado y tu carrera', 'Your weighted score and major', 'Dein gewichteter Schnitt und Studiengang', 'Sua média ponderada e seu curso'],
    'cepre.adm': ['Admisión UNI', 'UNI admission', 'UNI-Zulassung', 'Admissão UNI'],
    'cepre.adm.s': ['Resultados, ingresantes y puntajes', 'Results, admitted students and scores', 'Ergebnisse, Zugelassene und Punkte', 'Resultados, aprovados e notas'],
    'cd.d': ['días', 'days', 'Tage', 'dias'],
    'cd.h': ['horas', 'hours', 'Stunden', 'horas'],
    'cd.m': ['min', 'min', 'Min.', 'min'],
    'cd.today': ['hoy, 9:00', 'today, 9:00', 'heute, 9:00', 'hoje, 9:00'],
    'lib.name': ['Biblioteca', 'Library', 'Bibliothek', 'Biblioteca'],
    'lib.line': ['Libros y exámenes, por curso y editorial.', 'Books and exams, by course and publisher.', 'Bücher und Prüfungen nach Fach und Verlag.', 'Livros e provas, por matéria e editora.'],
    'lib.count': ['{n} libros', '{n} books', '{n} Bücher', '{n} livros'],
    'lib.shelf': ['Libros destacados', 'Featured books', 'Ausgewählte Bücher', 'Livros em destaque'],
    'lib.years': ['Exámenes de admisión UNI', 'UNI admission exams', 'UNI-Aufnahmeprüfungen', 'Provas de admissão UNI'],
    'lib.all': ['Todas las editoriales', 'All publishers', 'Alle Verlage', 'Todas as editoras'],
    'lib.all.s': ['Lumbreras, Pamer, Cuzcano, Rodo y más', 'Lumbreras, Pamer, Cuzcano, Rodo and more', 'Lumbreras, Pamer, Cuzcano, Rodo und mehr', 'Lumbreras, Pamer, Cuzcano, Rodo e mais'],
    'lib.sum': ['Resúmenes', 'Summaries', 'Zusammenfassungen', 'Resumos'],
    'lib.sum.s': ['Apuntes, formularios y mapas por tema', 'Notes, formula sheets and maps by topic', 'Notizen, Formelsammlungen und Mindmaps', 'Apontamentos, formulários e mapas por tema'],
    'lib.exams': ['Exámenes de admisión UNI', 'UNI admission exams', 'UNI-Aufnahmeprüfungen', 'Provas de admissão UNI'],
    'lib.exams.s': ['2024-2 a 2026-2, con su tiempo real', '2024-2 to 2026-2, on the real clock', '2024-2 bis 2026-2, mit echter Zeit', '2024-2 a 2026-2, com o tempo real'],
    'lib.uni': ['Editorial Universe', 'Universe editions', 'Universe-Verlag', 'Editora Universe'],
    'lib.uni.s': ['Primeros Resúmenes y solucionarios', 'Primeros Resúmenes and solution books', 'Primeros Resúmenes und Lösungsbücher', 'Primeros Resúmenes e resoluções'],
    'lib.lum.s': ['Libros rojos, azules y temas selectos', 'Red and blue books, selected topics', 'Rote und blaue Bücher, ausgewählte Themen', 'Livros vermelhos, azuis e temas seletos'],
    'lib.univ': ['Libros universitarios', 'University books', 'Universitätsbücher', 'Livros universitários'],
    'lib.univ.s': ['Para después del ingreso', 'For after admission', 'Für die Zeit nach der Zulassung', 'Para depois da aprovação'],
    'study.name': ['Estudio', 'Study', 'Lernen', 'Estudo'],
    'study.line': ['Organiza la semana y avanza por temas.', 'Plan your week and move topic by topic.', 'Plane deine Woche, Thema für Thema.', 'Organize a semana e avance por temas.'],
    'study.week': ['Ver la semana completa', 'See the full week', 'Ganze Woche ansehen', 'Ver a semana completa'],
    'study.wk': ['Semana {n}', 'Week {n}', 'Woche {n}', 'Semana {n}'],
    'study.of': ['de 20 · Ciclo Pre', 'of 20 · Pre cycle', 'von 20 · Pre-Zyklus', 'de 20 · Ciclo Pre'],
    'study.plan': ['Planificador', 'Planner', 'Planer', 'Planejador'],
    'study.plan.s': ['Tu semana convertida en tareas', 'Your week turned into tasks', 'Deine Woche als Aufgaben', 'Sua semana em tarefas'],
    'study.syl': ['Temario', 'Syllabus', 'Themenplan', 'Temário'],
    'study.syl.s': ['Temas de admisión y CEPREUNI', 'Admission and CEPREUNI topics', 'Themen für Zulassung und CEPREUNI', 'Temas de admissão e CEPREUNI'],
    'study.cls': ['Clases', 'Classes', 'Unterricht', 'Aulas'],
    'study.cls.s': ['Videos organizados por curso', 'Videos sorted by course', 'Videos nach Fach', 'Vídeos por matéria'],
    'study.room': ['Guía de aulas', 'Classroom guide', 'Raumführer', 'Guia de salas'],
    'study.room.s': ['Docentes, salones y horarios', 'Teachers, rooms and timetables', 'Lehrkräfte, Räume und Zeiten', 'Professores, salas e horários'],
    'study.info': ['Información CEPREUNI', 'CEPREUNI information', 'CEPREUNI-Infos', 'Informações CEPREUNI'],
    'study.info.s': ['Normas, estrategia y consejos', 'Rules, strategy and tips', 'Regeln, Strategie und Tipps', 'Normas, estratégia e dicas'],
    'c.alg': ['Álgebra', 'Algebra', 'Algebra', 'Álgebra'], 'c.ari': ['Aritmética', 'Arithmetic', 'Arithmetik', 'Aritmética'],
    'c.geo': ['Geometría', 'Geometry', 'Geometrie', 'Geometria'], 'c.tri': ['Trigonometría', 'Trigonometry', 'Trigonometrie', 'Trigonometria'],
    'c.fis': ['Física', 'Physics', 'Physik', 'Física'], 'c.qui': ['Química', 'Chemistry', 'Chemie', 'Química'],
    'foot.about': ['Comunidad educativa independiente.<br>Curiosidad, conocimiento y propósito.', 'An independent learning community.<br>Curiosity, knowledge and purpose.', 'Eine unabhängige Lerngemeinschaft.<br>Neugier, Wissen und Sinn.', 'Comunidade educativa independente.<br>Curiosidade, conhecimento e propósito.'],
    'foot.report': ['Reportar un error', 'Report an error', 'Fehler melden', 'Reportar um erro'],
    'foot.plat': ['Plataforma', 'Platform', 'Plattform', 'Plataforma'],
    'foot.legal': ['© 2026 UNIverseToStudy · Aprende. Practica. Avanza.', '© 2026 UNIverseToStudy · Learn. Practice. Move forward.', '© 2026 UNIverseToStudy · Lernen. Üben. Vorankommen.', '© 2026 UNIverseToStudy · Aprenda. Pratique. Avance.'],
    'acct.in': ['Ingresar', 'Sign in', 'Anmelden', 'Entrar'],
    'acct.open': ['Mi cuenta: {x}', 'My account: {x}', 'Mein Konto: {x}', 'Minha conta: {x}'],
    'acct.signin': ['Ingresar con Google', 'Sign in with Google', 'Mit Google anmelden', 'Entrar com Google'],
    'ev.p': ['{n}.ª práctica', 'Quiz {n}', '{n}. Übungsprüfung', '{n}.ª prática'],
    'ev.x': ['{n}.º parcial', 'Midterm {n}', '{n}. Zwischenprüfung', '{n}.ª parcial'],
    'ev.f': ['Examen final', 'Final exam', 'Abschlussprüfung', 'Prova final'],
    'r.popular': ['Lo más visitado', 'Most visited', 'Am häufigsten besucht', 'Mais visitados'],
    'r.pages': ['Páginas', 'Pages', 'Seiten', 'Páginas'],
    'r.books': ['Libros', 'Books', 'Bücher', 'Livros'],
    'r.rank': ['Ranking CEPREUNI', 'CEPREUNI ranking', 'CEPREUNI-Rangliste', 'Ranking CEPREUNI'],
    'r.code': ['Ver el puesto de {x}', 'See the rank of {x}', 'Rang von {x} ansehen', 'Ver a posição de {x}'],
    'r.name': ['Buscar «{x}» en el ranking', 'Find “{x}” in the ranking', '„{x}“ in der Rangliste suchen', 'Buscar “{x}” no ranking'],
    'r.none': ['Sin resultados para «{x}».', 'No results for “{x}”.', 'Keine Ergebnisse für „{x}“.', 'Sem resultados para “{x}”.'],
    'r.loading': ['Cargando libros…', 'Loading books…', 'Bücher werden geladen…', 'Carregando livros…']
  };
  var LOCALE = { es: 'es-PE', en: 'en-US', de: 'de-DE', pt: 'pt-BR' };
  var NAMES = { es: 'Español (Latinoamérica)', en: 'English', de: 'Deutsch', pt: 'Português' };
  var lang = LANGS.indexOf(root.dataset.lang) >= 0 ? root.dataset.lang : 'es';
  function t(key, vars) {
    var row = T[key]; var s = row ? row[LANGS.indexOf(lang)] || row[0] : key;
    if (vars) for (var k in vars) s = s.split('{' + k + '}').join(vars[k]);
    return s;
  }

  /* ---------- banderas como código de colores (sin imágenes) ---------- */
  var tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
  var ES_TZ = { 'America/Lima': 'PE', 'America/Bogota': 'CO', 'America/Guayaquil': 'EC', 'America/Caracas': 'VE', 'America/Santiago': 'CL', 'America/La_Paz': 'BO', 'America/Asuncion': 'PY', 'Europe/Madrid': 'ES', 'America/Mexico_City': 'MX', 'America/Monterrey': 'MX', 'America/Merida': 'MX', 'America/Cancun': 'MX', 'America/Chihuahua': 'MX', 'America/Tijuana': 'MX', 'America/Hermosillo': 'MX', 'America/Mazatlan': 'MX' };
  var region = { es: ES_TZ[tz] || (/^America\/Argentina/.test(tz) ? 'AR' : 'PE'), en: 'US', de: 'DE', pt: tz === 'Europe/Lisbon' ? 'PT' : 'BR' };
  function bands(dir, cols, weights) {
    var total = (weights || cols.map(function () { return 1; })).reduce(function (a, b) { return a + b; }, 0), at = 0, out = '';
    cols.forEach(function (c, i) {
      var size = (weights ? weights[i] : 1) / total * (dir === 'h' ? 14 : 20);
      out += dir === 'h' ? '<rect x="0" y="' + at + '" width="20" height="' + (size + .02) + '" fill="' + c + '"/>' : '<rect x="' + at + '" y="0" width="' + (size + .02) + '" height="14" fill="' + c + '"/>';
      at += size;
    });
    return out;
  }
  var FLAG = {
    PE: bands('v', ['#D91023', '#fff', '#D91023']),
    MX: bands('v', ['#006847', '#fff', '#CE1126']),
    CO: bands('h', ['#FCD116', '#003893', '#CE1126'], [2, 1, 1]),
    EC: bands('h', ['#FFDD00', '#034EA2', '#ED1C24'], [2, 1, 1]),
    VE: bands('h', ['#FFCC00', '#00247D', '#CF142B']),
    AR: bands('h', ['#74ACDF', '#fff', '#74ACDF']) + '<circle cx="10" cy="7" r="1.5" fill="#F6B40E"/>',
    CL: '<rect width="20" height="14" fill="#D52B1E"/><rect width="20" height="7" fill="#fff"/><rect width="7" height="7" fill="#0039A6"/><circle cx="3.5" cy="3.5" r="1.2" fill="#fff"/>',
    BO: bands('h', ['#D52B1E', '#F9E300', '#007934']),
    PY: bands('h', ['#D52B1E', '#fff', '#0038A8']),
    ES: bands('h', ['#AA151B', '#F1BF00', '#AA151B'], [1, 2, 1]),
    US: bands('h', ['#B22234', '#fff', '#B22234', '#fff', '#B22234', '#fff', '#B22234']) + '<rect width="9" height="8" fill="#3C3B6E"/>',
    DE: bands('h', ['#000', '#DD0000', '#FFCE00']),
    BR: '<rect width="20" height="14" fill="#009C3B"/><path d="M10 1.6 18.2 7 10 12.4 1.8 7Z" fill="#FFDF00"/><circle cx="10" cy="7" r="3.1" fill="#002776"/>',
    PT: bands('v', ['#006600', '#FF0000'], [2, 3]) + '<circle cx="8" cy="7" r="2.2" fill="#FFDF00"/>'
  };
  var flag = function (l) { return '<svg viewBox="0 0 20 14" aria-hidden="true">' + FLAG[region[l]] + '</svg>'; };

  /* ---------- aplicar idioma ---------- */
  function apply() {
    root.lang = lang === 'es' ? 'es-419' : lang;
    $$('[data-i18n]').forEach(function (el) { el.innerHTML = t(el.getAttribute('data-i18n')); });
    $$('[data-i18n-aria]').forEach(function (el) { el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria'), { x: NAMES[lang] })); });
    $('#hero-title').setAttribute('aria-label', t('hero.aria'));
    $('#rot').innerHTML = ROT[lang].map(function (w, i) { return '<span' + (i === 0 ? ' class="on"' : '') + '>' + w + '</span>'; }).join('');
    rotIndex = 0;
    $('#lang-flag').innerHTML = flag(lang);
    $('#lang-code').textContent = lang.toUpperCase();
    $('#lang-menu').innerHTML = LANGS.map(function (l) {
      return '<li role="none"><button type="button" role="menuitemradio" lang="' + (l === 'es' ? 'es-419' : l) + '" aria-checked="' + (l === lang) + '" data-lang="' + l + '" tabindex="-1"><span class="flag">' + flag(l) + '</span>' + NAMES[l] + '<svg class="tick" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg></button></li>';
    }).join('');
    paintAccount(user);
    modules();
    delete root.dataset.pending;
  }

  /* ---------- titular: el verbo cambia cada 2,6 s ---------- */
  var rotIndex = 0, rotTimer = 0;
  function rotate() {
    var spans = $$('#rot > span'); if (spans.length < 2 || document.hidden) return;
    var cur = spans[rotIndex], next = spans[(rotIndex + 1) % spans.length];
    spans.forEach(function (s) { s.classList.remove('out'); });
    cur.classList.remove('on'); cur.classList.add('out');
    next.classList.add('on');
    rotIndex = (rotIndex + 1) % spans.length;
  }
  function startRotation() { if (!rotTimer) rotTimer = setInterval(rotate, 2600); }

  /* ---------- menú de idioma ---------- */
  var btn = $('#lang-btn'), menu = $('#lang-menu');
  function items() { return $$('button', menu); }
  function openMenu(focusFirst) {
    menu.setAttribute('data-open', ''); btn.setAttribute('aria-expanded', 'true');
    var cur = items().filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0] || items()[0];
    if (focusFirst) cur.focus();
  }
  function closeMenu(refocus) {
    if (!menu.hasAttribute('data-open')) return;
    menu.removeAttribute('data-open'); btn.setAttribute('aria-expanded', 'false');
    if (refocus) btn.focus();
  }
  btn.addEventListener('click', function (e) { menu.hasAttribute('data-open') ? closeMenu() : openMenu(e.detail === 0); });
  btn.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); openMenu(true); } });
  menu.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-lang]'); if (!b) return;
    lang = b.getAttribute('data-lang'); store.set('universe_lang', lang); root.dataset.lang = lang;
    apply(); typer.restart(); closeMenu(true);
  });
  menu.addEventListener('keydown', function (e) {
    var list = items(), i = list.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); list[(i + 1) % list.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
    else if (e.key === 'Home') { e.preventDefault(); list[0].focus(); }
    else if (e.key === 'End') { e.preventDefault(); list[list.length - 1].focus(); }
    else if (e.key === 'Escape') { e.preventDefault(); closeMenu(true); }
    else if (e.key === 'Tab') closeMenu();
  });
  document.addEventListener('pointerdown', function (e) { if (!e.target.closest('.lang')) closeMenu(); });

  /* ---------- cuenta: sesión de Google guardada 30 días en este navegador ---------- */
  var user = null;
  try { if (store.get('universe_auth_token')) user = JSON.parse(store.get('universe_google_user') || 'null'); } catch (e) { user = null; }
  var PERSON = '<svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.6"/><path d="M4.8 19.5c1.3-3.3 4-5 7.2-5s5.9 1.7 7.2 5"/></svg>';
  function paintAccount(u) {
    var a = $('#acct'), pic = $('#acct-pic'), name = $('#acct-name');
    if (u && u.name) {
      var first = String(u.name).trim();
      a.href = '/account/cloud';
      a.setAttribute('aria-label', t('acct.open', { x: first }));
      name.textContent = first;
      var initial = esc(first.charAt(0).toUpperCase());
      if (u.avatar && /^https:\/\//.test(u.avatar)) {
        pic.innerHTML = initial + '<img alt="" referrerpolicy="no-referrer" decoding="async" src="' + esc(u.avatar) + '">';
        pic.querySelector('img').onerror = function () { this.remove(); };
      } else pic.innerHTML = initial;
    } else {
      a.href = '/account';
      a.setAttribute('aria-label', t('acct.signin'));
      name.textContent = t('acct.in');
      pic.innerHTML = PERSON;
    }
    a.setAttribute('data-ready', '');
  }
  addEventListener('universe-google-auth', function (e) { user = e.detail || null; paintAccount(user); });

  /* ---------- buscador ---------- */
  var ICON = {
    rank: '<path d="M4 20V10m6 10V4m6 16v-7m4 7H2"/>',
    book: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5zM5 19.5A1.5 1.5 0 0 0 6.5 21H19"/>',
    exam: '<path d="M8 3h8l3 3v15H5V3h3m0 6h8m-8 4h8m-8 4h5"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4m8-4v4"/>',
    plan: '<path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
    calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8m-8 5h2m3 0h3m-8 4h2m3 0h3"/>',
    play: '<circle cx="12" cy="12" r="8.5"/><path d="m10 8.8 5 3.2-5 3.2z"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5m0-8h.01"/>'
  };
  // destinos: [ruta, clave de título, clave de detalle, icono, palabras clave, título fijo]
  var PAGES = [
    ['/ranking', 'cepre.rank', 'cepre.rank.s', 'rank', 'ranking puesto merito orden pre basico juliaca codigo nota ponderado'],
    ['/cepreuni', 'cepre.cycle', 'cepre.cycle.s', 'cal', 'cepreuni ciclo horario semana calendario cronograma fechas clases pre basico ien'],
    ['/cepreuni/examenes', 'cepre.exams', 'cepre.exams.s', 'exam', 'examenes cepreuni practica calificada pc parcial final solucionario'],
    ['/calculadora', 'cepre.calc', 'cepre.calc.s', 'calc', 'calculadora puntaje ponderado nota carrera vacante'],
    ['/admision', 'cepre.adm', 'cepre.adm.s', 'info', 'admision uni resultados ingresantes postulantes puntaje minimo maximo'],
    ['/examenes', 'lib.exams', 'lib.exams.s', 'exam', 'examen admision uni simulacro prueba cronometro 2026 2025 2024 matematica fisica quimica'],
    ['/biblioteca', 'lib.all', 'lib.all.s', 'book', 'biblioteca libros editoriales lumbreras pamer cuzcano rodo san marcos trilce'],
    ['/resumenes', 'lib.sum', 'lib.sum.s', 'book', 'resumenes resumen apuntes formulario formularios mapas chuletas fisica quimica biologia economia'],
    ['/biblioteca/universe', 'lib.uni', 'lib.uni.s', 'book', 'universe primeros resumenes solucionarios editorial'],
    ['/biblioteca/lumbreras', null, 'lib.lum.s', 'book', 'lumbreras libros rojos azules temas selectos compendio', 'Lumbreras'],
    ['/biblioteca/librosuniversitarios', 'lib.univ', 'lib.univ.s', 'book', 'universitarios calculo fisica universitaria libros carrera'],
    ['/planificador', 'study.plan', 'study.plan.s', 'plan', 'planificador plan semana tareas organizar horario estudio'],
    ['/temario', 'study.syl', 'study.syl.s', 'plan', 'temario temas silabo contenidos admision cepreuni'],
    ['/clases', 'study.cls', 'study.cls.s', 'play', 'clases videos youtube curso'],
    ['/docentes-cepreuni', 'study.room', 'study.room.s', 'info', 'docentes profesores aulas salones guia horario'],
    ['/informacion-cepreuni', 'study.info', 'study.info.s', 'info', 'informacion cepreuni normas reglamento consejos estrategia']
  ];
  var POPULAR = [0, 5, 7, 11];
  var form = $('#search'), input = $('#q'), list = $('#q-list');
  var books = null, loading = null, sel = -1, current = [];
  function loadBooks() {
    if (!loading) loading = fetch('/biblioteca/buscar.json?v=20261104').then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (d) { books = d.b.map(function (b) { return { f: d.f[b[0]], t: b[1], s: b[2], h: norm(b[1] + ' ' + b[2] + ' ' + b[3] + ' ' + d.f[b[0]]), id: b[4], c: b[7] }; }); if (input.value.trim()) render(); })
      .catch(function () { books = []; loading = null; });
    return loading;
  }
  function isCode(q) { return /^\d{6,8}[a-z]?$/i.test(q); }
  function hl(text, words) {
    var w = words.filter(function (x) { return x.length > 1; })[0], n = norm(text), i = w ? n.indexOf(w) : -1;
    if (i < 0 || n.length !== text.length) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + w.length)) + '</mark>' + esc(text.slice(i + w.length));
  }
  var pageIcon = function (p) { return '<span class="r-ico"><svg viewBox="0 0 24 24">' + ICON[p[3]] + '</svg></span>'; };
  var pageTitle = function (p) { return p[1] ? t(p[1]) : p[5]; };
  function show(html) { list.innerHTML = html; list.hidden = false; input.setAttribute('aria-expanded', 'true'); }
  function hide() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); }
  function render() {
    var q = input.value.trim(), nq = norm(q), words = nq.split(/\s+/).filter(Boolean);
    current = []; sel = -1;
    form.classList.toggle('has-value', !!q);
    if (!q) { // con el campo vacío: accesos más visitados
      var html0 = '<div class="r-group">' + t('r.popular') + '</div>';
      POPULAR.forEach(function (i) { var p = PAGES[i]; current.push({ href: p[0] }); html0 += item(current.length - 1, pageIcon(p), esc(pageTitle(p)), esc(t(p[2]))); });
      show(html0); return;
    }
    var html = '';
    if (isCode(q)) {
      current.push({ href: '/ranking?q=' + encodeURIComponent(q.toUpperCase()) });
      html += '<div class="r-group">' + t('r.rank') + '</div>' + item(0, pageIcon(PAGES[0]), esc(t('r.code', { x: q.toUpperCase() })), esc(t('cepre.rank.s')));
    }
    var pages = PAGES.filter(function (p) { var hay = norm(pageTitle(p) + ' ' + t(p[2]) + ' ' + p[4]); return words.every(function (w) { return hay.indexOf(w) >= 0; }); }).slice(0, 5);
    if (pages.length) html += '<div class="r-group">' + t('r.pages') + '</div>';
    pages.forEach(function (p) { current.push({ href: p[0] }); html += item(current.length - 1, pageIcon(p), hl(pageTitle(p), words), esc(t(p[2]))); });
    if (books && nq.length > 1) {
      // todas las coincidencias, alternando editoriales para que ninguna tape a las demás
      var byF = {}, order = [], found = [];
      books.forEach(function (b) { if (words.every(function (w) { return b.h.indexOf(w) >= 0; })) { if (!byF[b.f]) { byF[b.f] = []; order.push(b.f); } byF[b.f].push(b); } });
      for (var k = 0, more = true; more; k++) { more = false; order.forEach(function (f) { if (byF[f][k]) { found.push(byF[f][k]); more = true; } }); }
      if (found.length) html += '<div class="r-group">' + t('r.books') + ' · ' + found.length + '</div>';
      found.forEach(function (b) {
        current.push({ href: '/biblioteca/' + b.f + '/?libro=' + encodeURIComponent(b.id) });
        var cover = b.c ? '<img class="r-cover" alt="" loading="lazy" src="/biblioteca/' + b.f + '/covers/' + encodeURI(b.c) + '-240.webp">' : '<span class="r-ico"><svg viewBox="0 0 24 24">' + ICON.book + '</svg></span>';
        html += item(current.length - 1, cover, hl(b.t, words), esc(b.s));
      });
    }
    if (!isCode(q) && q.length > 2 && !current.length && books) {
      current.push({ href: '/ranking?q=' + encodeURIComponent(q) });
      html += '<div class="r-group">' + t('r.rank') + '</div>' + item(0, pageIcon(PAGES[0]), esc(t('r.name', { x: q })), esc(t('cepre.rank.s')));
    }
    if (!current.length) html = '<div class="r-empty">' + esc(books ? t('r.none', { x: q }) : t('r.loading')) + '</div>';
    show(html);
    $$('img.r-cover', list).forEach(function (img) { img.onerror = function () { this.style.visibility = 'hidden'; }; });
  }
  function item(i, ico, title, sub) {
    return '<a class="r-item" id="r-' + i + '" role="option" aria-selected="false" href="' + esc(current[i].href) + '" tabindex="-1">' + ico + '<span><span class="r-t">' + title + '</span><span class="r-s">' + sub + '</span></span></a>';
  }
  function move(d) {
    var opts = $$('.r-item', list); if (!opts.length) return;
    sel = (sel + d + opts.length) % opts.length;
    opts.forEach(function (o, i) { o.setAttribute('aria-selected', String(i === sel)); });
    opts[sel].scrollIntoView({ block: 'nearest' });
    input.setAttribute('aria-activedescendant', opts[sel].id);
  }
  input.addEventListener('focus', function () {
    loadBooks(); render();
    // en teléfono el buscador sube bajo la cabecera para que los resultados (que abren hacia abajo) no queden tapados
    if (innerWidth < 1000) setTimeout(function () { form.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 60);
  });
  input.addEventListener('input', function () { loadBooks(); render(); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (list.hidden) render(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Escape') { if (!list.hidden) hide(); else input.blur(); }
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (sel >= 0 && current[sel]) { location.href = current[sel].href; return; }
    if (!q) { input.focus(); return; }
    // Enter sin selección: un código va directo al ranking; lo demás resalta el primer resultado en vez de abrirlo a ciegas
    if (isCode(q)) { location.href = '/ranking?q=' + encodeURIComponent(q.toUpperCase()); return; }
    render(); if (current.length) move(1);
  });
  document.addEventListener('pointerdown', function (e) { if (!e.target.closest('#search')) hide(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    var a = document.activeElement; if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable)) return;
    e.preventDefault(); input.focus();
  });

  /* placeholder que escribe ejemplos reales (se oculta al enfocar o al escribir) */
  var typer = (function () {
    var el = $('#ph-ex'), i = 0, n = 0, dir = 1, timer = 0;
    function tick() {
      var words = EXAMPLES[lang], w = words[i % words.length];
      n += dir; el.textContent = w.slice(0, n);
      var wait = dir > 0 ? 55 : 28;
      if (dir > 0 && n >= w.length) { dir = -1; wait = 1700; }
      else if (dir < 0 && n <= 0) { dir = 1; i++; wait = 350; }
      timer = setTimeout(tick, document.hidden ? 1000 : wait);
    }
    return { start: function () { if (!timer) tick(); }, restart: function () { clearTimeout(timer); timer = 0; i = 0; n = 0; dir = 1; tick(); } };
  })();

  /* ---------- módulos en vivo de los pilares ---------- */
  // Fechas de evaluación del ciclo Pre 2027-1 (las mismas de /ranking), todas a las 9:00 de Lima.
  var CALENDAR = [['p', 1, '2026-09-13'], ['p', 2, '2026-09-27'], ['x', 1, '2026-10-11'], ['p', 3, '2026-10-25'], ['p', 4, '2026-11-15'], ['x', 2, '2026-11-29'], ['p', 5, '2026-12-13'], ['p', 6, '2027-01-10'], ['p', 7, '2027-01-31'], ['f', 0, '2027-02-07']];
  var at9 = function (iso) { return Date.parse(iso + 'T09:00:00-05:00'); };
  var limaDay = function (ms) { return new Date(ms - 5 * 3600000).toISOString().slice(0, 10); };
  var dayNum = function (iso) { var p = iso.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]) / 86400000; };
  var short = function (e) { return e[0] === 'p' ? 'PC' + e[1] : e[0] === 'x' ? 'P' + e[1] : 'Final'; };
  var pad = function (n) { return n < 10 ? '0' + n : String(n); };
  var index = null, weeks = null, silabo = null;
  // portadas reales del estante: [editorial, curso]
  var SHELF = [['universe', 'historia'], ['lumbreras', 'algebra'], ['cuzcano', 'fisica'], ['pamer', 'quimica'], ['rodo', 'geometria'], ['universe', 'literatura'], ['lumbreras', 'trigonometria']];

  function setNum(el, v) {
    if (el.textContent === v) return;
    el.textContent = v;
    if (el.animate) el.animate([{ transform: 'translateY(-30%)', opacity: 0, filter: 'blur(4px)' }, { transform: 'none', opacity: 1, filter: 'none' }], { duration: 420, easing: 'cubic-bezier(.23,1,.32,1)' });
  }
  function countdown() {
    var now = Date.now(), nextI = -1;
    CALENDAR.some(function (e, i) { if (at9(e[2]) + 3 * 3600000 > now) { nextI = i; return true; } return false; });
    var mod = $('#mod-cepre');
    if (nextI < 0) { mod.hidden = true; return; }
    var e = CALENDAR[nextI], left = Math.max(0, at9(e[2]) - now);
    $('#cd-name').textContent = t('ev.' + e[0], { n: e[1] });
    $('#cd-date').textContent = left === 0 ? t('cd.today') : new Date(at9(e[2])).toLocaleDateString(LOCALE[lang], { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Lima' }) + ' · 9:00';
    setNum($('#cd-d'), pad(Math.floor(left / 86400000)));
    setNum($('#cd-h'), pad(Math.floor(left / 3600000) % 24));
    setNum($('#cd-m'), pad(Math.floor(left / 60000) % 60));
    var ol = $('#tl-list');
    if (ol.dataset.next !== String(nextI) || ol.dataset.lang !== lang) {
      ol.innerHTML = CALENDAR.map(function (c, i) { return '<li class="' + (i < nextI ? 'past' : i === nextI ? 'next' : '') + '" style="--i:' + i + '" title="' + esc(t('ev.' + c[0], { n: c[1] })) + '"><i></i><span>' + short(c) + '</span></li>'; }).join('');
      ol.dataset.next = nextI; ol.dataset.lang = lang;
    }
    // la línea avanza entre la evaluación anterior y la siguiente
    var prev = nextI > 0 ? at9(CALENDAR[nextI - 1][2]) : at9('2026-08-31'), f = Math.min(1, Math.max(0, (now - prev) / (at9(e[2]) - prev)));
    $('#tl-fill').style.setProperty('--p', ((Math.max(0, nextI - 1) + (nextI > 0 ? f : 0)) / (CALENDAR.length - 1)).toFixed(4));
    mod.hidden = false;
  }
  function library() {
    if (!index) return;
    var total = index.pubs.concat(index.sets || []).reduce(function (a, p) { return a + (+p.n || 0); }, 0);
    $('#lib-count').textContent = '· ' + t('lib.count', { n: total.toLocaleString(LOCALE[lang]) });
    var shelf = $('#shelf'); if (shelf.childElementCount) return;
    var pubs = {}; index.pubs.forEach(function (p) { pubs[p.folder] = p; });
    shelf.innerHTML = SHELF.map(function (s, i) {
      var p = pubs[s[0]], m = p && p.mc && (p.mc[s[1]] || p.mc[Object.keys(p.mc)[0]]); if (!m) return '';
      var rot = ((i - (SHELF.length - 1) / 2) * 2.2).toFixed(1);
      return '<a class="cv" href="/biblioteca/' + s[0] + '/?curso=' + s[1] + '" style="--i:' + i + ';--z:' + (i + 1) + ';--rot:' + rot + 'deg;--c:' + esc(m.c || '#18181c') + '" aria-label="' + esc(p.name) + '"><img alt="" loading="lazy" decoding="async" src="/biblioteca/' + s[0] + '/covers/' + encodeURI(m.t) + '-240.webp"></a>';
    }).join('');
  }
  function study() {
    if (!weeks || !silabo) return;
    var today = limaDay(Date.now()), wk = -1;
    weeks.forEach(function (w, i) { if (today >= w[0] && dayNum(today) <= dayNum(w[1]) + 1) wk = i + 1; });
    var mod = $('#mod-study'); if (wk < 1) { mod.hidden = true; return; }
    $('#wk-n').textContent = t('study.wk', { n: wk });
    $('#wk-of').textContent = t('study.of');
    $('#wk-bar').innerHTML = weeks.map(function (w, i) { return '<li class="' + (i + 1 < wk ? 'past' : i + 1 === wk ? 'now' : '') + '" style="--i:' + i + '"></li>'; }).join('');
    $('#topics').innerHTML = ['alg', 'ari', 'geo', 'tri', 'fis', 'qui'].map(function (c) {
      var topics = (silabo[c] && silabo[c][wk - 1]) || []; if (!topics.length) return '';
      return '<li><span class="tp-c">' + t('c.' + c) + '</span><span class="tp-t">' + esc(topics.join(' · ')) + '</span></li>';
    }).join('');
    $('#wk-link').href = '/cepreuni?ciclo=pre&semana=' + wk;
    mod.hidden = false;
  }
  function modules() { countdown(); library(); study(); }
  var asked = false;
  function loadModules() {
    if (asked) return; asked = true;
    fetch('/biblioteca/indice.json?v=20261104').then(function (r) { return r.ok ? r.json() : null; }).then(function (d) { index = d; library(); }).catch(function () {});
    var s = document.createElement('script'); s.src = '/cepreuni/data/semanas.js?v=20261105'; s.async = true;
    s.onload = function () { try { var W = window.UNIVERSE_CEPREUNI_WEEKS; weeks = W.cycles.pre.weeks; silabo = W.silabo.pre; study(); } catch (e) {} };
    document.head.appendChild(s);
  }

  /* ---------- cabecera sólida, carga diferida y entradas de los módulos ---------- */
  var top = $('#top');
  var onScroll = function () { top.classList.toggle('solid', scrollY > 24); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  new IntersectionObserver(function (entries, io) {
    if (entries[0].isIntersecting) { io.disconnect(); loadModules(); }
  }, { rootMargin: '0px 0px 60% 0px' }).observe($('#cepreuni'));
  setTimeout(loadModules, 3500);
  var reveal = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); reveal.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -15% 0px' });
  $$('.pillar').forEach(function (p) { reveal.observe(p); });
  setInterval(countdown, 20000);

  apply();
  // el titular aparece al llegar al agujero negro (blackhole.js agrega .arrived); si ese script falla, igual aparece
  function onArrive() { setTimeout(startRotation, 2200); typer.start(); }
  if (root.classList.contains('arrived')) onArrive(); else addEventListener('bh-arrive', onArrive, { once: true });
  setTimeout(function () { if (!root.classList.contains('arrived')) { root.classList.add('arrived'); onArrive(); } }, 6500);
})();
