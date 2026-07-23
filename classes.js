(function () {
  'use strict';

  var app = document.getElementById('classes-app');
  var metadata = window.UNIVERSE_CLASSES || { courses: [] };
  var courses = Array.isArray(metadata.courses) ? metadata.courses : [];
  var indexData = { courses: [], totalVideos: 0 };
  var videoCache = {};
  var currentQuestionContext = null;

  if (!app) return;

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function cleanPath() {
    var path = window.location.pathname || '/clases';
    path = path.replace(/\/index\.html$/i, '').replace(/\.html$/i, '').replace(/\/+$/g, '');
    return path || '/';
  }

  function courseBySlug(slug) {
    return courses.find(function (course) { return course.slug === slug; }) || null;
  }

  function countForCourse(slug) {
    var item = (indexData.courses || []).find(function (course) { return course.slug === slug; });
    return item ? Number(item.videoCount || 0) : 0;
  }

  async function fetchJson(url) {
    var response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return response.json();
  }

  async function loadIndex() {
    try {
      indexData = await fetchJson('/class-videos/index.json?v=5');
    } catch (error) {
      indexData = { courses: [], totalVideos: 0 };
    }
  }

  async function loadCourseVideos(slug) {
    if (videoCache[slug]) return videoCache[slug];
    var payload = await fetchJson('/class-videos/' + encodeURIComponent(slug) + '.json?v=5');
    videoCache[slug] = Array.isArray(payload.videos) ? payload.videos : [];
    return videoCache[slug];
  }

  function hero(title, text, backHref, backText) {
    return '<section class="classes-hero">' +
      '<div><div class="classes-kicker">Clases Universe to Study</div><h1>' + esc(title) + '</h1><p>' + esc(text) + '</p>' +
      '<div class="classes-pill-row"><span class="classes-pill">' + esc(indexData.totalVideos || 0) + ' videos catalogados</span><span class="classes-pill">Tres canales educativos</span><span class="classes-pill">Preguntas sin claves</span></div></div>' +
      (backHref ? '<a class="classes-back" href="' + esc(backHref) + '">' + esc(backText || 'Volver') + '</a>' : '') +
      '</section>';
  }

  function renderHome() {
    var cards = courses.filter(function (course) { return countForCourse(course.slug) > 0; }).map(function (course) {
      var count = countForCourse(course.slug);
      return '<a class="classes-course-card" href="/clases/' + esc(course.slug) + '">' +
        '<div class="classes-card-icon">' + esc(course.icon || 'U') + '</div>' +
        '<h2>' + esc(course.title) + '</h2><p>' + esc(course.description || '') + '</p>' +
        '<div class="classes-topic-meta"><span>' + esc(course.area || 'Curso') + '</span><span>' + count + ' videos</span></div></a>';
    }).join('');

    app.innerHTML = hero('¿Qué curso quieres repasar hoy?', 'El catálogo reúne los videos reales publicados por UNIverse, TODO PRE y Bastet. Cada título se conserva tal como aparece en su canal.', '', '') +
      '<section class="classes-grid">' + cards + '</section>';
  }

  function videoCard(course, video) {
    var week = video.week ? 'Semana o clase ' + video.week : 'Tema general';
    return '<a class="classes-topic-card" href="/clases/' + esc(course.slug) + '/' + esc(video.slug) + '">' +
      '<div class="classes-video-thumb"><img loading="lazy" alt="" src="https://i.ytimg.com/vi/' + esc(video.videoId) + '/mqdefault.jpg"></div>' +
      '<h2>' + esc(video.title) + '</h2>' +
      '<div class="classes-topic-meta"><span>' + esc(video.channel || 'YouTube') + '</span><span>' + esc(week) + '</span></div></a>';
  }

  function bindCourseExplorer(course, videos) {
    var input = document.getElementById('classes-video-search');
    var channel = document.getElementById('classes-channel-filter');
    var grid = document.getElementById('classes-video-grid');
    var more = document.getElementById('classes-load-more');
    var status = document.getElementById('classes-result-status');
    var visible = 48;

    function filtered() {
      var query = String(input && input.value || '').trim().toLocaleLowerCase('es');
      var selected = String(channel && channel.value || '');
      return videos.filter(function (video) {
        var matchesText = !query || String(video.title || '').toLocaleLowerCase('es').includes(query);
        var matchesChannel = !selected || video.channel === selected;
        return matchesText && matchesChannel;
      });
    }

    function draw(reset) {
      if (reset) visible = 48;
      var list = filtered();
      grid.innerHTML = list.slice(0, visible).map(function (video) { return videoCard(course, video); }).join('') ||
        '<div class="classes-empty"><h3>No se encontraron videos</h3><p>Prueba otra palabra o cambia el canal seleccionado.</p></div>';
      status.textContent = list.length + ' videos encontrados';
      more.hidden = visible >= list.length;
    }

    if (input) input.addEventListener('input', function () { draw(true); });
    if (channel) channel.addEventListener('change', function () { draw(true); });
    if (more) more.addEventListener('click', function () { visible += 48; draw(false); });
    draw(true);
  }

  async function renderCourse(course) {
    app.innerHTML = hero(course.title, course.description || 'Selecciona una clase disponible.', '/clases', 'Cambiar curso') +
      '<div class="classes-loading">Cargando videos del curso...</div>';
    try {
      var videos = await loadCourseVideos(course.slug);
      var channels = Array.from(new Set(videos.map(function (video) { return video.channel; }))).sort();
      app.innerHTML = hero(course.title, course.description || 'Selecciona una clase disponible.', '/clases', 'Cambiar curso') +
        (course.questionBank ? '<a class="classes-bank-banner" href="/clases/' + esc(course.slug) + '/banco-de-preguntas"><div><span>Banco completo</span><h2>Ver todas las preguntas de ' + esc(course.title) + '</h2><p>Enunciados y alternativas A–E, sin claves ni solucionario.</p></div><strong>Abrir banco →</strong></a>' : '') +
        '<section class="classes-explorer">' +
          '<div class="classes-explorer-controls"><label>Buscar una clase<input id="classes-video-search" type="search" placeholder="Escribe tema, semana o título"></label>' +
          '<label>Canal<select id="classes-channel-filter"><option value="">Todos los canales</option>' +
          channels.map(function (name) { return '<option value="' + esc(name) + '">' + esc(name) + '</option>'; }).join('') +
          '</select></label><strong id="classes-result-status"></strong></div>' +
          '<div id="classes-video-grid" class="classes-grid classes-video-grid"></div>' +
          '<button id="classes-load-more" class="classes-button classes-load-more" type="button">Mostrar más videos</button>' +
        '</section>';
      bindCourseExplorer(course, videos);
    } catch (error) {
      app.innerHTML = hero(course.title, 'No fue posible cargar el catálogo de este curso.', '/clases', 'Cambiar curso') +
        '<div class="classes-error"><h3>Error temporal</h3><p>Actualiza la página en unos segundos.</p></div>';
    }
  }

  function renderQuestionBank(course) {
    currentQuestionContext = { course: course.slug, topic: 'general' };
    app.innerHTML =
      '<section class="classes-topic-topbar"><div><div class="classes-kicker">Banco completo · ' + esc(course.title) + '</div>' +
      '<h1>Preguntas de ' + esc(course.title) + '</h1><p>Material de práctica con alternativas A–E, sin mostrar claves ni soluciones.</p></div>' +
      '<a class="classes-back" href="/clases/' + esc(course.slug) + '">Volver a videos</a></section>' +
      '<section class="classes-questions-panel classes-bank-panel"><div class="classes-questions-head"><div><h2>Banco completo del curso</h2>' +
      '<p class="classes-private-note">Se muestran 30 preguntas por bloque para mantener la página rápida.</p></div></div>' +
      '<div id="classes-private-questions" class="classes-question-list"><div class="classes-loading">Verificando preguntas...</div></div></section>';
    loadQuestions();
  }

  function renderTopic(course, video) {
    app.innerHTML =
      '<section class="classes-topic-topbar"><div><div class="classes-kicker">' + esc(course.title) + ' · ' + esc(video.channel) + '</div>' +
      '<h1>' + esc(video.title) + '</h1><p>El título y el tema corresponden al video original del canal.</p></div>' +
      '<a class="classes-back" href="/clases/' + esc(course.slug) + '">Volver a ' + esc(course.title) + '</a></section>' +
      '<section class="classes-topic-layout"><article class="classes-topic-video">' +
      '<iframe class="classes-video-frame" src="' + esc(video.embedUrl) + '" title="' + esc(video.title) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>' +
      '<div class="classes-video-title"><h2>' + esc(video.title) + '</h2><span class="classes-channel">' + esc(video.channel) + '</span></div></article>' +
      '<aside class="classes-questions-panel"><div class="classes-questions-head"><div><h2>Preguntas relacionadas</h2>' +
      '<p class="classes-private-note">Solo se muestran preguntas cuando el curso y la semana o tema coinciden. Nunca se mezclan con otra clase.</p></div></div>' +
      '<div id="classes-private-questions" class="classes-question-list"><div class="classes-loading">Verificando preguntas...</div></div></aside></section>';

    if (!video.questionKey || video.questionKey.indexOf('/') < 0) {
      currentQuestionContext = null;
      document.getElementById('classes-private-questions').innerHTML =
        '<div class="classes-empty"><h3>Video sin banco exacto asignado</h3><p>Este video sí forma parte del catálogo, pero no se mostrarán preguntas hasta contar con un banco que coincida exactamente con su tema.</p></div>';
      return;
    }
    var parts = video.questionKey.split('/');
    currentQuestionContext = { course: parts[0], topic: parts[1] };
    loadQuestions();
  }

  function loginBox() {
    return '<div class="classes-login-box"><h3>Inicia sesión con Google para ver las preguntas</h3>' +
      '<p>Universe crea una sesión segura independiente de que Gmail esté abierto en otra pestaña.</p>' +
      '<button class="classes-login-button" type="button" id="classes-login-google">Entrar con Google</button></div>';
  }

  function safeImageSrc(value) {
    var src = String(value || '');
    if (/^data:image\/(?:png|jpe?g|webp);base64,[a-z0-9+/=]+$/i.test(src)) return src;
    if (/^https:\/\/[^\s"'<>()]+$/i.test(src)) return src;
    return '';
  }

  function renderQuestions(questions) {
    var box = document.getElementById('classes-private-questions');
    if (!box) return;
    if (!questions || !questions.length) {
      box.innerHTML = '<div class="classes-empty"><h3>Banco exacto pendiente</h3><p>No se mostrarán preguntas de otro tema para rellenar este espacio.</p></div>';
      return;
    }
    box.innerHTML = '';
    var visible = 0;
    function appendQuestions() {
      var next = Math.min(visible + 30, questions.length);
      questions.slice(visible, next).forEach(function (question, localIndex) {
      var index = visible + localIndex;
      var card = document.createElement('article');
      card.className = 'classes-question-card';
      var heading = document.createElement('h3');
      heading.textContent = 'Pregunta ' + (question.number || index + 1) + (question.week ? ' · ' + question.week : '');
      card.appendChild(heading);
      if (question.sourceTitle) {
        var source = document.createElement('p');
        source.className = 'classes-private-note';
        source.textContent = question.sourceTitle;
        card.appendChild(source);
      }
      var stem = document.createElement('div');
      stem.className = 'classes-question-stem';
      stem.textContent = question.stem || '';
      card.appendChild(stem);
      var imageSource = safeImageSrc(question.image && (question.image.src || question.image.url || question.image.dataUrl) || question.image);
      if (imageSource) {
        var image = document.createElement('img');
        image.className = 'classes-question-image';
        image.alt = 'Figura de la pregunta ' + (question.number || index + 1);
        image.loading = 'lazy';
        image.src = imageSource;
        card.appendChild(image);
      }
      if (Array.isArray(question.choices) && question.choices.length) {
        var list = document.createElement('ul');
        list.className = 'classes-choice-list';
        question.choices.forEach(function (choice, choiceIndex) {
          var item = document.createElement('li');
          var label = document.createElement('span');
          label.className = 'classes-choice-label';
          label.textContent = choice.label || String.fromCharCode(65 + choiceIndex);
          var text = document.createElement('span');
          text.textContent = typeof choice === 'string' ? choice : (choice.text || '');
          item.appendChild(label);
          item.appendChild(text);
          list.appendChild(item);
        });
        card.appendChild(list);
      }
      box.appendChild(card);
      });
      visible = next;
      var oldButton = document.getElementById('classes-more-questions');
      if (oldButton) oldButton.remove();
      if (visible < questions.length) {
        var more = document.createElement('button');
        more.type = 'button';
        more.id = 'classes-more-questions';
        more.className = 'classes-primary-button classes-load-more';
        more.textContent = 'Mostrar 30 preguntas más';
        more.addEventListener('click', appendQuestions);
        box.appendChild(more);
      }
    }
    appendQuestions();
  }

  function openLogin() {
    if (window.UniverseGoogleAuth && typeof window.UniverseGoogleAuth.open === 'function') {
      window.UniverseGoogleAuth.open({ account: true, reason: 'classes' });
    } else {
      window.location.href = '/account';
    }
  }

  function bindLoginButton() {
    var button = document.getElementById('classes-login-google');
    if (button) button.addEventListener('click', openLogin);
  }

  async function loadQuestions() {
    var box = document.getElementById('classes-private-questions');
    if (!box || !currentQuestionContext) return;
    var token = window.localStorage ? localStorage.getItem('universe_auth_token') : '';
    if (!token) {
      box.innerHTML = loginBox();
      bindLoginButton();
      return;
    }
    box.innerHTML = '<div class="classes-loading">Cargando preguntas privadas...</div>';
    try {
      var url = '/api/classes/questions?course=' + encodeURIComponent(currentQuestionContext.course) + '&topic=' + encodeURIComponent(currentQuestionContext.topic);
      var response = await fetch(url, { cache: 'no-store', headers: { Authorization: 'Bearer ' + token } });
      if (response.status === 401 || response.status === 403) {
        box.innerHTML = loginBox();
        bindLoginButton();
        return;
      }
      if (!response.ok) throw new Error('HTTP ' + response.status);
      var payload = await response.json();
      renderQuestions(Array.isArray(payload.questions) ? payload.questions : []);
    } catch (error) {
      box.innerHTML = '<div class="classes-error"><h3>No se pudieron cargar las preguntas</h3><p>El video puede seguir viéndose normalmente.</p></div>';
    }
  }

  async function route() {
    await loadIndex();
    var parts = cleanPath().split('/').filter(Boolean);
    if (!parts.length || parts[0] !== 'clases' || parts.length === 1) {
      renderHome();
      return;
    }
    var course = courseBySlug(parts[1]);
    if (!course || countForCourse(course.slug) < 1) {
      app.innerHTML = hero('Curso no encontrado', 'No hay videos disponibles en este curso.', '/clases', 'Ver cursos');
      return;
    }
    if (parts.length === 2) {
      renderCourse(course);
      return;
    }
    if (parts[2] === 'banco-de-preguntas' && course.questionBank) {
      renderQuestionBank(course);
      return;
    }
    try {
      var videos = await loadCourseVideos(course.slug);
      var video = videos.find(function (item) { return item.slug === parts[2]; });
      if (!video) {
        app.innerHTML = hero('Clase no disponible', 'El enlace anterior no coincide con un video real del catálogo.', '/clases/' + course.slug, 'Ver videos');
        return;
      }
      renderTopic(course, video);
    } catch (error) {
      app.innerHTML = hero('No se pudo cargar la clase', 'Actualiza la página en unos segundos.', '/clases/' + course.slug, 'Volver');
    }
  }

  window.addEventListener('universe-google-auth', loadQuestions);
  window.addEventListener('storage', function (event) {
    if (event.key === 'universe_auth_token') loadQuestions();
  });

  route();
})();
