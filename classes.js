(function () {
  'use strict';

  var app = document.getElementById('classes-app');
  var data = window.UNIVERSE_CLASSES || { courses: [] };
  var courses = Array.isArray(data.courses) ? data.courses : [];
  var currentQuestionContext = null;

  if (!app) return;

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function cleanPath() {
    var path = window.location.pathname || '/clases';
    path = path.replace(/\/index\.html$/i, '').replace(/\.html$/i, '').replace(/\/+$/g, '');
    return path || '/';
  }

  function courseBySlug(slug) {
    return courses.find(function (course) { return course.slug === slug; }) || null;
  }

  function topicBySlug(course, slug) {
    return course && Array.isArray(course.topics)
      ? course.topics.find(function (topic) { return topic.slug === slug && topic.videoId; }) || null
      : null;
  }

  function embedUrl(topic) {
    if (topic.embedUrl) return topic.embedUrl;
    if (topic.videoId) return 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(topic.videoId) + '?rel=0&modestbranding=1';
    if (topic.playlistId) return 'https://www.youtube-nocookie.com/embed/videoseries?list=' + encodeURIComponent(topic.playlistId);
    return '';
  }

  function hero(title, text, backHref, backText) {
    return '<section class="classes-hero">' +
      '<div><div class="classes-kicker">Clases Universe to Study</div><h1>' + esc(title) + '</h1><p>' + esc(text) + '</p>' +
      '<div class="classes-pill-row"><span class="classes-pill">Videos por tema</span><span class="classes-pill">Preguntas privadas</span><span class="classes-pill">Sin solucionarios ni claves</span></div></div>' +
      (backHref ? '<a class="classes-back" href="' + esc(backHref) + '">' + esc(backText || 'Volver') + '</a>' : '') +
      '</section>';
  }

  function renderHome() {
    var cards = courses.map(function (course) {
      var count = (course.topics || []).filter(function (topic) { return topic.videoId; }).length;
      return '<a class="classes-course-card" href="/clases/' + esc(course.slug) + '">' +
        '<div class="classes-card-icon">' + esc(course.icon || 'U') + '</div>' +
        '<h2>' + esc(course.title) + '</h2>' +
        '<p>' + esc(course.description || '') + '</p>' +
        '<div class="classes-topic-meta"><span>' + esc(course.area || 'Curso') + '</span><span>' + count + ' temas con video</span></div>' +
        '</a>';
    }).join('');

    app.innerHTML = hero('¿Qué curso quieres repasar hoy?', 'Elige un curso y entra a una clase con video a pantalla útil. Las preguntas exactas se muestran aparte y solo con sesión Google.', '', '') +
      '<section class="classes-grid">' + cards + '</section>';
  }

  function renderCourse(course) {
    var topics = (course.topics || []).filter(function (topic) { return topic.videoId; });
    var cards = topics.map(function (topic, index) {
      return '<a class="classes-topic-card" href="/clases/' + esc(course.slug) + '/' + esc(topic.slug) + '">' +
        '<div class="classes-card-icon">' + String(index + 1).padStart(2, '0') + '</div>' +
        '<h2>' + esc(topic.title) + '</h2>' +
        '<p>Clase en video y panel privado de preguntas exactas para practicar este tema.</p>' +
        '<div class="classes-topic-meta"><span>' + esc(topic.channel || 'Canal') + '</span><span>Preguntas con login</span></div>' +
        '</a>';
    }).join('');

    app.innerHTML = hero(course.title, course.description || 'Selecciona un tema disponible.', '/clases', 'Cambiar curso') +
      '<section class="classes-grid">' + cards + '</section>';
  }

  function renderTopic(course, topic) {
    var src = embedUrl(topic);
    app.innerHTML = hero(topic.title, 'Mira la clase y practica al costado. Las preguntas exactas se cargan desde el backend privado y no están dentro del HTML público.', '/clases/' + course.slug, 'Volver a ' + course.title) +
      '<section class="classes-topic-layout">' +
        '<article class="classes-topic-video">' +
          '<iframe class="classes-video-frame" src="' + esc(src) + '" title="' + esc(topic.title) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>' +
          '<div class="classes-video-title"><h2>' + esc(topic.title) + '</h2><span class="classes-channel">' + esc(topic.channel || 'YouTube') + '</span></div>' +
        '</article>' +
        '<aside class="classes-questions-panel">' +
          '<div class="classes-questions-head"><div><h2>Preguntas del tema</h2><p class="classes-private-note">Se muestran solo en sesión Google. No se publican claves, respuestas ni solucionarios.</p></div></div>' +
          '<div id="classes-private-questions" class="classes-question-list"><div class="classes-loading">Verificando sesión...</div></div>' +
        '</aside>' +
      '</section>';
    currentQuestionContext = { course: course.slug, topic: topic.slug };
    loadQuestions();
  }

  function loginBox() {
    return '<div class="classes-login-box"><h3>Inicia sesión con Google para ver las preguntas del tema</h3>' +
      '<p>El video es público. Las preguntas exactas se protegen para que no queden copiadas dentro del código de la página.</p>' +
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
      box.innerHTML = '<div class="classes-empty"><h3>Preguntas aún no importadas</h3><p>Este tema ya tiene video, pero sus preguntas exactas todavía no fueron cargadas en la base privada.</p></div>';
      return;
    }
    box.innerHTML = '';
    questions.forEach(function (q, idx) {
      var card = document.createElement('article');
      card.className = 'classes-question-card';

      var title = document.createElement('h3');
      title.textContent = 'Pregunta ' + (q.number || idx + 1) + (q.week ? ' · ' + q.week : '');
      card.appendChild(title);

      if (q.sourceTitle) {
        var source = document.createElement('p');
        source.className = 'classes-private-note';
        source.textContent = q.sourceTitle;
        card.appendChild(source);
      }

      var stem = document.createElement('div');
      stem.className = 'classes-question-stem';
      stem.textContent = q.stem || '';
      card.appendChild(stem);

      var imgSrc = safeImageSrc(q.image && (q.image.src || q.image.url || q.image.dataUrl) || q.image);
      if (imgSrc) {
        var img = document.createElement('img');
        img.className = 'classes-question-image';
        img.alt = 'Imagen de la pregunta ' + (q.number || idx + 1);
        img.loading = 'lazy';
        img.src = imgSrc;
        card.appendChild(img);
      } else if (q.requiresImage) {
        var imageNote = document.createElement('p');
        imageNote.className = 'classes-private-note';
        imageNote.textContent = 'Esta pregunta depende de una tabla, grafico o figura pendiente de recorte privado.';
        card.appendChild(imageNote);
      }

      var choices = Array.isArray(q.choices) ? q.choices : [];
      if (choices.length) {
        var list = document.createElement('ul');
        list.className = 'classes-choice-list';
        choices.forEach(function (choice, choiceIndex) {
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
  }

  function openLogin() {
    if (window.UniverseGoogleAuth && typeof window.UniverseGoogleAuth.open === 'function') {
      window.UniverseGoogleAuth.open({ account: true, reason: 'classes' });
      return;
    }
    window.location.href = '/account';
  }

  function bindLoginButton() {
    var btn = document.getElementById('classes-login-google');
    if (btn) btn.addEventListener('click', openLogin);
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
      var response = await fetch(url, {
        cache: 'no-store',
        headers: { Authorization: 'Bearer ' + token }
      });
      if (response.status === 401 || response.status === 403) {
        box.innerHTML = loginBox();
        bindLoginButton();
        return;
      }
      if (!response.ok) throw new Error('HTTP ' + response.status);
      var payload = await response.json();
      renderQuestions(Array.isArray(payload.questions) ? payload.questions : []);
    } catch (error) {
      box.innerHTML = '<div class="classes-error"><h3>No se pudieron cargar las preguntas</h3><p>Reintenta en unos segundos. El video puede seguir viéndose con normalidad.</p></div>';
    }
  }

  function route() {
    var parts = cleanPath().split('/').filter(Boolean);
    if (!parts.length || parts[0] !== 'clases') {
      renderHome();
      return;
    }
    if (parts.length === 1) {
      renderHome();
      return;
    }
    var course = courseBySlug(parts[1]);
    if (!course) {
      app.innerHTML = hero('Curso no encontrado', 'La clase solicitada no existe o todavía no tiene videos asignados.', '/clases', 'Ver cursos');
      return;
    }
    if (parts.length === 2) {
      renderCourse(course);
      return;
    }
    var topic = topicBySlug(course, parts[2]);
    if (!topic) {
      app.innerHTML = hero('Tema no disponible', 'Este tema no aparece como clase completa porque todavía no tiene video asignado.', '/clases/' + course.slug, 'Ver temas');
      return;
    }
    renderTopic(course, topic);
  }

  window.addEventListener('universe-google-auth', function () {
    loadQuestions();
  });
  window.addEventListener('storage', function (event) {
    if (event.key === 'universe_auth_token') loadQuestions();
  });

  route();
})();
