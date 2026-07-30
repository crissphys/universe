(function () {
  'use strict';

  var root = document.getElementById('uni-final-app');
  if (!root) return;

  var COURSE_ORDER = [
    'Física', 'Química', 'Álgebra', 'Aritmética', 'Geometría',
    'Trigonometría', 'Razonamiento matemático', 'Razonamiento verbal', 'Humanidades'
  ];
  var questions = Array.isArray(window.UNIVERSE_FINAL_EXAM_QUESTIONS)
    ? window.UNIVERSE_FINAL_EXAM_QUESTIONS
    : [];
  var state = {
    auth: null,
    user: null,
    isAdmin: false,
    server: null,
    order: [],
    prepared: new Map(),
    answers: {},
    current: 0,
    warningOpen: false,
    justificationOpen: false,
    confirming: false,
    busy: false,
    error: '',
    polling: null,
    ticking: null,
    monitoring: false,
    lastIncidentAt: 0,
    joinedRunId: ''
  };

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function token() {
    try { return localStorage.getItem('universe_auth_token') || ''; } catch (error) { return ''; }
  }

  async function api(route, method, data) {
    var headers = { 'Content-Type': 'application/json' };
    var authToken = token();
    if (authToken) headers.Authorization = 'Bearer ' + authToken;
    var response = await fetch('/api/exam/' + route.replace(/^\/+/, ''), {
      method: method || 'GET',
      cache: 'no-store',
      headers: headers,
      body: data === undefined ? undefined : JSON.stringify(data)
    });
    var payload = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      var error = new Error(payload.error || 'request_failed');
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  function hashSeed(value) {
    var h = 2166136261;
    for (var i = 0; i < value.length; i += 1) {
      h ^= value.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function rng(seed) {
    var x = seed || 123456789;
    return function () {
      x ^= x << 13;
      x ^= x >>> 17;
      x ^= x << 5;
      return (x >>> 0) / 4294967296;
    };
  }

  function shuffled(items, seed) {
    var copy = items.slice();
    var random = rng(seed);
    for (var i = copy.length - 1; i > 0; i -= 1) {
      var j = Math.floor(random() * (i + 1));
      var hold = copy[i];
      copy[i] = copy[j];
      copy[j] = hold;
    }
    return copy;
  }

  function formatTime(totalSeconds) {
    var safe = Math.max(0, Math.floor(totalSeconds));
    var hours = Math.floor(safe / 3600);
    var minutes = Math.floor((safe % 3600) / 60);
    var seconds = safe % 60;
    return [hours, minutes, seconds].map(function (part) {
      return String(part).padStart(2, '0');
    }).join(':');
  }

  function statusLabel(session) {
    if (!session || !session.runId) return 'Sin sala abierta';
    if (session.status === 'waiting') return 'Sala de espera abierta';
    if (session.status === 'countdown') return 'Cuenta regresiva';
    if (session.status === 'active') return 'Examen en curso';
    return session.publishedAt ? 'Resultados publicados' : 'Examen finalizado';
  }

  function errorMessage(error) {
    var key = String(error && error.message || error || '');
    var messages = {
      login_required: 'Debes iniciar sesión con Google.',
      room_closed: 'La sala aún no está abierta o ya terminó.',
      exam_started: 'El examen ya comenzó y no admite nuevos ingresos.',
      room_not_waiting: 'La sala ya no está en estado de espera.',
      exam_not_active: 'El examen todavía no está activo.',
      exam_time_expired: 'El tiempo del examen terminó y el envío ya fue cerrado.',
      already_submitted: 'Este intento ya fue enviado.',
      exam_blocked: 'El intento está bloqueado.',
      justification_too_short: 'Explica el motivo con al menos 12 caracteres.',
      rate_limited: 'Se realizaron demasiadas acciones seguidas. Espera unos segundos.'
    };
    return messages[key] || 'No se pudo completar la acción. Inténtalo nuevamente.';
  }

  function answerStorageKey() {
    var session = state.server && state.server.session;
    var participant = state.server && state.server.participant;
    return session && participant ? 'ufe_answers_' + session.runId + '_' + participant.userId : '';
  }

  function saveAnswers() {
    var key = answerStorageKey();
    if (!key) return;
    try { sessionStorage.setItem(key, JSON.stringify(state.answers)); } catch (error) {}
  }

  function restoreAnswers() {
    var key = answerStorageKey();
    if (!key) return;
    try {
      var value = JSON.parse(sessionStorage.getItem(key) || '{}');
      state.answers = value && typeof value === 'object' ? value : {};
    } catch (error) {
      state.answers = {};
    }
  }

  function clearAnswers() {
    var key = answerStorageKey();
    if (key) {
      try { sessionStorage.removeItem(key); } catch (error) {}
    }
    state.answers = {};
  }

  function prepareExam(code) {
    var seed = hashSeed(code || 'UNI0001');
    state.order = COURSE_ORDER.flatMap(function (course, index) {
      return shuffled(questions.filter(function (q) {
        return q.course === course;
      }), seed ^ hashSeed(course + '-' + index));
    });
    state.prepared.clear();
    state.order.forEach(function (q) {
      state.prepared.set(q.id, shuffled(q.choices, hashSeed(code + '-' + q.id)));
    });
  }

  function renderShell(content) {
    var session = state.server && state.server.session;
    root.innerHTML = [
      '<div class="ufe-shell">',
      '<header class="ufe-topbar">',
      '<div class="ufe-brand"><span class="ufe-brand-mark">UNI</span><span class="ufe-brand-copy"><strong>CEPREUNI · Examen final</strong><small>Simulacro integral · 60 preguntas · 3 horas</small></span></div>',
      state.user ? '<div class="ufe-user-line"><span class="ufe-badge">' + esc(state.isAdmin ? 'Administrador' : (state.server && state.server.participant ? state.server.participant.code : 'Cuenta Google')) + '</span><span class="ufe-muted">' + esc(state.user.name || state.user.email || '') + '</span></div>' : '',
      '</header>',
      state.error ? '<div class="ufe-error" role="alert">' + esc(state.error) + '</div>' : '',
      session ? '<div class="ufe-meta"><span class="ufe-badge">' + esc(statusLabel(session)) + '</span><span class="ufe-muted">Banco verificado por curso y tema del sílabo</span></div>' : '',
      '<main>' + content + '</main>',
      '</div>'
    ].join('');
  }

  function renderLoading() {
    renderShell('<section class="ufe-card ufe-centered ufe-stack" aria-label="Cargando examen"><span class="ufe-badge">Conectando</span><h1 class="ufe-title">Preparando el examen</h1><p class="ufe-muted">Se está verificando tu sesión y el estado de la sala.</p></section>');
  }

  function renderLogin() {
    state.monitoring = false;
    renderShell([
      '<section class="ufe-card ufe-centered ufe-stack" aria-label="Acceso al examen">',
      '<span class="ufe-login-icon" aria-hidden="true">G</span>',
      '<span class="ufe-badge">Acceso obligatorio</span>',
      '<h1 class="ufe-title">Ingresa con tu cuenta de Google</h1>',
      '<p>La identidad de Google permite asignarte un solo código, conservar tu intento y mostrar tus resultados cuando sean publicados.</p>',
      '<button class="ufe-btn ufe-btn-primary" id="ufe-login" type="button">Continuar con Google</button>',
      '</section>'
    ].join(''));
    var login = document.getElementById('ufe-login');
    if (login) login.addEventListener('click', function () {
      if (state.auth && typeof state.auth.open === 'function') state.auth.open();
    });
  }

  function adminParticipantRows(participants, published) {
    if (!participants.length) return '<p class="ufe-muted">Aún no hay estudiantes registrados en esta sala.</p>';
    return participants.map(function (p) {
      var result = p.result;
      var justification = p.justification;
      var review = justification && justification.status === 'pending'
        ? '<div class="ufe-actions"><button class="ufe-btn" data-review="approved" data-user="' + esc(p.userId) + '">Aprobar</button><button class="ufe-btn ufe-btn-danger" data-review="rejected" data-user="' + esc(p.userId) + '">Rechazar</button></div>'
        : '';
      return [
        '<div class="ufe-admin-row">',
        '<div class="ufe-admin-person"><strong>' + esc(p.code) + ' · ' + esc(p.name) + '</strong><small>' + esc(p.email || '') + '</small>',
        '<small>' + (p.submittedAt ? 'Enviado' : p.blocked ? 'Bloqueado' : 'En curso o en espera') + ' · ' + p.violations + '/2 incidencias' + (result ? ' · ' + result.correct + '/60 correctas' : '') + '</small>',
        justification ? '<small><strong>Justificación:</strong> ' + esc(justification.text) + ' · ' + esc(justification.status) + '</small>' : '',
        '</div>',
        review,
        '</div>'
      ].join('');
    }).join('');
  }

  function renderAdmin() {
    state.monitoring = false;
    var session = state.server.session || {};
    var participants = state.server.participants || [];
    var submitted = participants.filter(function (p) { return p.submittedAt; }).length;
    var blocked = participants.filter(function (p) { return p.blocked; }).length;
    var canActivate = session.status === 'waiting';
    renderShell([
      '<section class="ufe-screen" aria-label="Panel del administrador">',
      '<div class="ufe-stats">',
      '<div class="ufe-stat"><span class="ufe-muted">Estudiantes</span><strong>' + participants.length + '</strong><span>códigos únicos asignados</span></div>',
      '<div class="ufe-stat"><span class="ufe-muted">Entregas</span><strong>' + submitted + '</strong><span>de ' + participants.length + ' intentos</span></div>',
      '<div class="ufe-stat"><span class="ufe-muted">Bloqueos</span><strong>' + blocked + '</strong><span>justificables en tiempo real</span></div>',
      '</div>',
      '<div class="ufe-card ufe-stack">',
      '<div class="ufe-result-head"><div class="ufe-stack"><span class="ufe-badge">' + esc(statusLabel(session)) + '</span><h1 class="ufe-title">Control del examen final</h1></div>',
      '<div class="ufe-actions"><button class="ufe-btn" id="ufe-open-room" type="button">Abrir nueva sala</button><button class="ufe-btn ufe-btn-primary" id="ufe-activate" type="button" ' + (canActivate ? '' : 'disabled') + '>Activar 30 segundos</button><button class="ufe-btn" id="ufe-publish" type="button" ' + (submitted ? '' : 'disabled') + '>Publicar notas</button></div></div>',
      '<p class="ufe-muted">Al activar, todos los estudiantes registrados ven la misma cuenta regresiva y disponen de tres horas. Las preguntas y alternativas cambian de orden para cada código sin mezclar los cursos.</p>',
      '</div>',
      '<div class="ufe-card ufe-stack"><div class="ufe-result-head"><h2>Participantes y justificaciones</h2><span class="ufe-badge">' + participants.length + ' registrados</span></div>',
      '<div class="ufe-admin-list">' + adminParticipantRows(participants, Boolean(session.publishedAt)) + '</div></div>',
      '</section>'
    ].join(''));

    var open = document.getElementById('ufe-open-room');
    var activate = document.getElementById('ufe-activate');
    var publish = document.getElementById('ufe-publish');
    if (open) open.addEventListener('click', function () {
      if (!window.confirm('Se abrirá una nueva sala y la sesión anterior dejará de ser la activa. ¿Continuar?')) return;
      adminAction('admin/open');
    });
    if (activate) activate.addEventListener('click', function () { adminAction('admin/activate'); });
    if (publish) publish.addEventListener('click', function () {
      if (!window.confirm('¿Publicar ahora las notas y soluciones para los estudiantes que entregaron?')) return;
      adminAction('admin/publish');
    });
    root.querySelectorAll('[data-review]').forEach(function (button) {
      button.addEventListener('click', function () {
        adminAction('admin/review', {
          userId: button.getAttribute('data-user'),
          action: button.getAttribute('data-review')
        });
      });
    });
  }

  async function adminAction(route, data) {
    if (state.busy) return;
    state.busy = true;
    state.error = '';
    try {
      await api(route, 'POST', data || {});
      await loadState(true);
    } catch (error) {
      state.error = errorMessage(error);
      renderAdmin();
    } finally {
      state.busy = false;
    }
  }

  function renderNoRoom() {
    state.monitoring = false;
    renderShell([
      '<section class="ufe-card ufe-centered ufe-stack" aria-label="Examen no disponible">',
      '<span class="ufe-badge">Sala cerrada</span>',
      '<h1 class="ufe-title">El examen todavía no está disponible</h1>',
      '<p>Cuando el administrador abra una nueva sala, podrás registrarte y recibir tu código personal.</p>',
      '<button class="ufe-btn" id="ufe-refresh" type="button">Actualizar estado</button>',
      '</section>'
    ].join(''));
    var refresh = document.getElementById('ufe-refresh');
    if (refresh) refresh.addEventListener('click', function () { loadState(true); });
  }

  function renderJoin() {
    state.monitoring = false;
    renderShell([
      '<section class="ufe-card ufe-centered ufe-stack" aria-label="Registro en la sala">',
      '<span class="ufe-badge">Sala abierta</span>',
      '<h1 class="ufe-title">Regístrate para recibir tu código</h1>',
      '<p>Tu cuenta tendrá un único intento. El código identifica tu entrega y será necesario para consultar la nota publicada.</p>',
      '<button class="ufe-btn ufe-btn-primary" id="ufe-join" type="button">Ingresar a la sala</button>',
      '</section>'
    ].join(''));
    var join = document.getElementById('ufe-join');
    if (join) join.addEventListener('click', joinRoom);
  }

  async function joinRoom() {
    if (state.busy) return;
    state.busy = true;
    state.error = '';
    try {
      await api('join', 'POST', {});
      await loadState(true);
    } catch (error) {
      state.error = errorMessage(error);
      renderJoin();
    } finally {
      state.busy = false;
    }
  }

  function renderWaiting() {
    state.monitoring = false;
    var participant = state.server.participant;
    renderShell([
      '<section class="ufe-card ufe-centered ufe-stack" aria-label="Sala de espera">',
      '<span class="ufe-badge">Sala de espera</span>',
      '<span class="ufe-code">' + esc(participant.code) + '</span>',
      '<h1 class="ufe-title">El examen comenzará en breve</h1>',
      '<p>El administrador aún no ha activado la cuenta regresiva. Mantén esta página abierta.</p>',
      '<div class="ufe-progress"><span style="width:0%"></span></div>',
      '</section>'
    ].join(''));
  }

  function renderCountdown() {
    state.monitoring = false;
    var session = state.server.session;
    var participant = state.server.participant;
    var seconds = Math.max(0, Math.ceil((session.startAt - Date.now()) / 1000));
    renderShell([
      '<section class="ufe-card ufe-centered ufe-stack" aria-label="Cuenta regresiva">',
      '<div class="ufe-result-head"><span class="ufe-badge">Inicia en</span><span class="ufe-code">' + esc(participant.code) + '</span></div>',
      '<div class="ufe-countdown" id="ufe-countdown">' + seconds + '</div>',
      '<p class="ufe-muted">Al llegar a cero se iniciará automáticamente el cronómetro de tres horas.</p>',
      '<div class="ufe-progress"><span id="ufe-countdown-bar" style="width:' + Math.max(0, Math.min(100, (30 - seconds) / 30 * 100)) + '%"></span></div>',
      '</section>'
    ].join(''));
    startTicking();
  }

  function frequencyText(value) {
    return value === 'baja' ? 'frecuencia baja' : value === 'media' ? 'frecuencia media' : 'frecuencia alta';
  }

  function trustedQuestionText(value) {
    return String(value || '').replace(/class="matrix"/g, 'class="ufe-matrix"');
  }

  function renderExam() {
    var participant = state.server.participant;
    var session = state.server.session;
    if (!state.order.length || state.joinedRunId !== session.runId) {
      state.joinedRunId = session.runId;
      prepareExam(participant.code);
      restoreAnswers();
    }
    state.current = Math.max(0, Math.min(state.order.length - 1, state.current));
    var q = state.order[state.current];
    var options = state.prepared.get(q.id) || q.choices;
    var answered = Object.keys(state.answers).length;
    var remaining = Math.max(0, Math.ceil((session.endAt - Date.now()) / 1000));
    var nav = COURSE_ORDER.map(function (course) {
      var entries = state.order.map(function (item, index) { return { item: item, index: index }; })
        .filter(function (entry) { return entry.item.course === course; });
      return [
        '<div class="ufe-course-group"><span class="ufe-course-title">' + esc(course) + ' · ' + entries.length + '</span><div class="ufe-q-grid">',
        entries.map(function (entry) {
          var done = Object.prototype.hasOwnProperty.call(state.answers, entry.item.id);
          return '<button class="ufe-q-btn ' + (done ? 'is-answered' : '') + '" type="button" data-q-index="' + entry.index + '" aria-current="' + (entry.index === state.current) + '" aria-label="' + esc(course) + ', pregunta ' + (entry.index + 1) + (done ? ', respondida' : ', sin responder') + '">' + (entry.index + 1) + '</button>';
        }).join(''),
        '</div></div>'
      ].join('');
    }).join('');
    var passage = q.passage ? '<div class="ufe-passage">' + esc(q.passage) + '</div>' : '';
    var visual = q.visual ? '<div class="ufe-question-visual">' + q.visual + '</div>' : '';
    var optionMarkup = options.map(function (option, index) {
      var selected = state.answers[q.id] === option;
      return '<button class="ufe-option" type="button" data-option="' + encodeURIComponent(option) + '" aria-pressed="' + selected + '"><span class="ufe-option-letter">' + String.fromCharCode(65 + index) + '.</span><span>' + esc(option) + '</span></button>';
    }).join('');

    renderShell([
      '<section class="ufe-screen" aria-label="Examen en curso">',
      '<div class="ufe-card ufe-meta"><span class="ufe-code">' + esc(participant.code) + '</span><strong id="ufe-timer">' + formatTime(remaining) + '</strong><span class="ufe-muted">' + answered + '/60 respondidas</span><span class="ufe-muted">' + participant.violations + '/2 incidencias</span><button class="ufe-btn" id="ufe-finish" type="button">Finalizar</button></div>',
      '<div class="ufe-progress" aria-label="' + answered + ' de 60 respondidas"><span style="width:' + (answered / 60 * 100) + '%"></span></div>',
      '<div class="ufe-exam-layout">',
      '<aside class="ufe-card ufe-navigator" aria-label="Navegador de preguntas"><strong>Preguntas por curso</strong><span class="ufe-muted">Subrayada: respondida</span><div class="ufe-course-groups">' + nav + '</div></aside>',
      '<article class="ufe-card ufe-question">',
      '<div class="ufe-result-head"><div class="ufe-stack"><span class="ufe-muted">Pregunta ' + (state.current + 1) + ' de 60</span><div class="ufe-meta"><span class="ufe-badge">' + esc(q.course) + '</span><span class="ufe-muted">' + esc(q.topic) + ' · ' + frequencyText(q.frequency) + '</span></div></div></div>',
      passage,
      '<div class="ufe-question-copy">' + trustedQuestionText(q.text) + '</div>',
      visual,
      '<fieldset class="ufe-options" aria-label="Alternativas">' + optionMarkup + '</fieldset>',
      '<div class="ufe-question-actions"><button class="ufe-btn" id="ufe-prev" type="button" ' + (state.current === 0 ? 'disabled' : '') + '>Anterior</button><button class="ufe-btn" id="ufe-next" type="button" ' + (state.current === state.order.length - 1 ? 'disabled' : '') + '>Siguiente</button></div>',
      '</article></div></section>'
    ].join(''));

    state.monitoring = true;
    root.querySelectorAll('[data-q-index]').forEach(function (button) {
      button.addEventListener('click', function () {
        state.current = Number(button.getAttribute('data-q-index')) || 0;
        renderExam();
      });
    });
    root.querySelectorAll('[data-option]').forEach(function (button) {
      button.addEventListener('click', function () {
        state.answers[q.id] = decodeURIComponent(button.getAttribute('data-option'));
        saveAnswers();
        if (state.current < state.order.length - 1) state.current += 1;
        renderExam();
      });
    });
    document.getElementById('ufe-prev').addEventListener('click', function () {
      state.current = Math.max(0, state.current - 1);
      renderExam();
    });
    document.getElementById('ufe-next').addEventListener('click', function () {
      state.current = Math.min(state.order.length - 1, state.current + 1);
      renderExam();
    });
    document.getElementById('ufe-finish').addEventListener('click', function () {
      if (!window.confirm('Has respondido ' + answered + ' de 60 preguntas. ¿Deseas enviar el examen?')) return;
      submitExam();
    });
    startTicking();
  }

  function renderWarning() {
    state.monitoring = false;
    var participant = state.server.participant;
    renderShell([
      '<section class="ufe-card ufe-centered ufe-stack" aria-label="Advertencia de integridad">',
      '<span class="ufe-warning-icon" aria-hidden="true">!</span>',
      '<span class="ufe-badge ufe-status-warning">Advertencia 1 de 2</span>',
      '<h1 class="ufe-title">Saliste del examen</h1>',
      '<p>Se detectó un cambio de pestaña, ventana o aplicación. Si vuelve a ocurrir, el intento quedará bloqueado.</p>',
      '<button class="ufe-btn ufe-btn-primary" id="ufe-resume" type="button">Entendido, volver al examen</button>',
      '</section>'
    ].join(''));
    document.getElementById('ufe-resume').addEventListener('click', function () {
      state.warningOpen = false;
      renderExam();
    });
  }

  function renderBlocked() {
    state.monitoring = false;
    var participant = state.server.participant;
    if (state.justificationOpen) {
      renderShell([
        '<section class="ufe-card ufe-centered ufe-stack" aria-label="Justificación del bloqueo">',
        '<span class="ufe-badge ufe-status-danger">Solicitud al administrador</span>',
        '<h1 class="ufe-title">Justificar bloqueo</h1>',
        '<p>Explica con precisión el motivo externo por el que se perdió el foco del examen.</p>',
        '<label for="ufe-justification"><strong>Justificación</strong></label>',
        '<textarea class="ufe-input" id="ufe-justification" maxlength="1200" placeholder="Describe lo ocurrido y por qué no fue una salida voluntaria."></textarea>',
        '<div class="ufe-actions"><button class="ufe-btn" id="ufe-cancel-justification" type="button">Cancelar</button><button class="ufe-btn ufe-btn-primary" id="ufe-send-justification" type="button">Enviar en tiempo real</button></div>',
        '</section>'
      ].join(''));
      document.getElementById('ufe-cancel-justification').addEventListener('click', function () {
        state.justificationOpen = false;
        renderBlocked();
      });
      document.getElementById('ufe-send-justification').addEventListener('click', sendJustification);
      return;
    }
    var justification = participant.justification;
    renderShell([
      '<section class="ufe-card ufe-centered ufe-stack" aria-label="Intento bloqueado">',
      '<span class="ufe-badge ufe-status-danger">Intento bloqueado</span>',
      '<span class="ufe-code">' + esc(participant.code) + '</span>',
      '<h1 class="ufe-title">El examen ya no puede continuar</h1>',
      '<p>Se registró una segunda salida de la pestaña, ventana o aplicación.</p>',
      justification ? '<div class="ufe-badge ufe-status-warning">Justificación ' + esc(justification.status) + '</div>' : '<button class="ufe-btn ufe-btn-primary" id="ufe-justify" type="button">Justificar bloqueo</button>',
      '</section>'
    ].join(''));
    var justify = document.getElementById('ufe-justify');
    if (justify) justify.addEventListener('click', function () {
      state.justificationOpen = true;
      renderBlocked();
    });
  }

  async function sendJustification() {
    var field = document.getElementById('ufe-justification');
    var text = field ? field.value.trim() : '';
    try {
      await api('justify', 'POST', { text: text });
      state.justificationOpen = false;
      await loadState(true);
    } catch (error) {
      state.error = errorMessage(error);
      renderBlocked();
    }
  }

  async function submitExam() {
    if (state.busy) return;
    state.busy = true;
    state.monitoring = false;
    state.error = '';
    try {
      await api('submit', 'POST', { answers: state.answers });
      clearAnswers();
      await loadState(true);
    } catch (error) {
      state.error = errorMessage(error);
      if (error && error.status === 423) await loadState(true);
      else renderExam();
    } finally {
      state.busy = false;
    }
  }

  function renderSubmitted() {
    state.monitoring = false;
    var participant = state.server.participant;
    var session = state.server.session;
    if (session.publishedAt && participant.result) {
      renderResults();
      return;
    }
    renderShell([
      '<section class="ufe-card ufe-centered ufe-stack" aria-label="Examen entregado">',
      '<span class="ufe-badge ufe-status-success">Examen recibido</span>',
      '<span class="ufe-code">' + esc(participant.code) + '</span>',
      '<h1 class="ufe-title">Tu examen se está revisando</h1>',
      '<p>Guarda tu código. Cuando el administrador publique las notas, esta misma página mostrará tu resultado y el detalle de lo que fallaste.</p>',
      '<button class="ufe-btn" id="ufe-refresh-result" type="button">Consultar publicación</button>',
      '</section>'
    ].join(''));
    document.getElementById('ufe-refresh-result').addEventListener('click', function () { loadState(true); });
  }

  function renderResults() {
    var participant = state.server.participant;
    var result = participant.result;
    var course = Object.keys(result.courseBreakdown || {}).map(function (name) {
      var row = result.courseBreakdown[name];
      return '<div><strong>' + esc(name) + '</strong><span>' + row.correct + ' de ' + row.total + ' correctas</span></div>';
    }).join('');
    var missed = (result.missed || []).map(function (item) {
      return '<tr><td>' + item.id + '</td><td><strong>' + esc(item.course) + '</strong><br><span class="ufe-muted">' + esc(item.topic) + '</span></td><td>' + esc(item.selected) + '</td><td>' + esc(item.correct) + '</td><td>' + esc(item.solution) + '</td></tr>';
    }).join('');
    renderShell([
      '<section class="ufe-screen" aria-label="Resultado publicado">',
      '<div class="ufe-stats"><div class="ufe-stat"><span class="ufe-muted">Código</span><strong>' + esc(participant.code) + '</strong><span>identificador del intento</span></div><div class="ufe-stat"><span class="ufe-muted">Aciertos</span><strong>' + result.correct + '/60</strong><span>' + result.percentage + ' %</span></div><div class="ufe-stat"><span class="ufe-muted">Sin responder</span><strong>' + result.unanswered + '</strong><span>' + result.incorrect + ' incorrectas</span></div></div>',
      '<div class="ufe-card ufe-stack"><h2>Rendimiento por curso</h2><div class="ufe-course-score">' + course + '</div></div>',
      '<div class="ufe-card ufe-stack"><div class="ufe-result-head"><h2>Preguntas por corregir</h2><span class="ufe-badge">' + result.missed.length + ' revisiones</span></div>',
      result.missed.length ? '<div class="ufe-table-wrap"><table class="ufe-table"><thead><tr><th>N.º</th><th>Curso y tema</th><th>Marcaste</th><th>Clave</th><th>Explicación</th></tr></thead><tbody>' + missed + '</tbody></table></div>' : '<p class="ufe-badge ufe-status-success">No hubo errores.</p>',
      '</div></section>'
    ].join(''));
  }

  function startTicking() {
    if (state.ticking) clearInterval(state.ticking);
    state.ticking = setInterval(function () {
      var session = state.server && state.server.session;
      if (!session) return;
      if (session.status === 'countdown') {
        var countdown = Math.max(0, Math.ceil((session.startAt - Date.now()) / 1000));
        var counter = document.getElementById('ufe-countdown');
        var bar = document.getElementById('ufe-countdown-bar');
        if (counter) counter.textContent = countdown;
        if (bar) bar.style.width = Math.max(0, Math.min(100, (30 - countdown) / 30 * 100)) + '%';
        if (countdown <= 0) loadState(true);
      }
      if (session.status === 'active') {
        var remaining = Math.max(0, Math.ceil((session.endAt - Date.now()) / 1000));
        var timer = document.getElementById('ufe-timer');
        if (timer) timer.textContent = formatTime(remaining);
        if (remaining <= 0 && state.server.participant && !state.server.participant.submittedAt && !state.server.participant.blocked) submitExam();
      }
    }, 1000);
  }

  async function reportIncident(reason) {
    if (!state.monitoring || state.busy) return;
    var now = Date.now();
    if (now - state.lastIncidentAt < 1800) return;
    state.lastIncidentAt = now;
    state.monitoring = false;
    try {
      var payload = await api('incident', 'POST', { reason: reason });
      state.server.participant = payload.participant;
      if (payload.participant.blocked) renderBlocked();
      else {
        state.warningOpen = true;
        renderWarning();
      }
    } catch (error) {
      state.error = errorMessage(error);
      await loadState(true);
    }
  }

  function routeStudent() {
    var session = state.server.session || {};
    var participant = state.server.participant;
    if (!session.runId) {
      renderNoRoom();
      return;
    }
    if (!participant) {
      if (['waiting', 'countdown'].includes(session.status) && (!session.startAt || Date.now() < session.startAt)) renderJoin();
      else renderNoRoom();
      return;
    }
    if (participant.blocked) {
      renderBlocked();
      return;
    }
    if (participant.submittedAt) {
      renderSubmitted();
      return;
    }
    if (session.status === 'waiting') {
      renderWaiting();
      return;
    }
    if (session.status === 'countdown') {
      renderCountdown();
      return;
    }
    if (session.status === 'active') {
      if (state.warningOpen) renderWarning();
      else renderExam();
      return;
    }
    renderNoRoom();
  }

  function renderCurrent() {
    if (!state.user || !state.user.secureSession) {
      renderLogin();
      return;
    }
    if (!state.server) {
      renderLoading();
      return;
    }
    if (state.isAdmin) renderAdmin();
    else routeStudent();
  }

  async function loadState(forceRender) {
    if (!state.user || !state.user.secureSession) {
      renderLogin();
      return;
    }
    try {
      var payload = await api('state', 'GET');
      var oldStatus = state.server && state.server.session && state.server.session.status;
      var oldParticipant = state.server && state.server.participant;
      state.server = payload;
      state.isAdmin = payload.isAdmin === true;
      state.error = '';
      var changed = !oldStatus || oldStatus !== payload.session.status ||
        !oldParticipant || !payload.participant ||
        oldParticipant.blocked !== payload.participant.blocked ||
        oldParticipant.submittedAt !== payload.participant.submittedAt ||
        oldParticipant.violations !== payload.participant.violations ||
        Boolean(oldParticipant.result) !== Boolean(payload.participant.result);
      if (forceRender || changed || state.isAdmin) renderCurrent();
    } catch (error) {
      if (error && error.status === 401) {
        state.user = null;
        state.server = null;
        renderLogin();
        return;
      }
      state.error = errorMessage(error);
      renderCurrent();
    }
  }

  async function establishAuth() {
    for (var attempt = 0; attempt < 40 && !window.UniverseGoogleAuth; attempt += 1) {
      await new Promise(function (resolve) { setTimeout(resolve, 100); });
    }
    state.auth = window.UniverseGoogleAuth || null;
    state.user = state.auth && typeof state.auth.user === 'function' ? state.auth.user() : null;
    renderCurrent();
    if (state.user && state.auth && typeof state.auth.refresh === 'function') {
      var refreshed = await state.auth.refresh().catch(function () { return null; });
      state.user = refreshed || (state.auth.user && state.auth.user());
    }
    if (state.user && state.user.secureSession) await loadState(true);
    else renderLogin();
  }

  window.addEventListener('universe-google-auth', function (event) {
    state.user = event.detail || (state.auth && state.auth.user && state.auth.user());
    if (state.user && state.user.secureSession) loadState(true);
    else establishAuth();
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) reportIncident('pestaña_oculta');
  });
  window.addEventListener('blur', function () {
    reportIncident('ventana_sin_foco');
  });

  state.polling = setInterval(function () {
    if (state.user && state.user.secureSession && !state.busy) loadState(false);
  }, 2500);

  renderLoading();
  establishAuth();
})();
