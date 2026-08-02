(function () {
  'use strict';

  var root = document.getElementById('uni-final-app');
  if (!root) return;

  var COURSE_ORDER = [
    'Física', 'Química', 'Álgebra', 'Aritmética', 'Geometría',
    'Trigonometría', 'Razonamiento matemático', 'Razonamiento verbal', 'Humanidades'
  ];
  var examBanks = window.UNIVERSE_EXAM_BANKS && typeof window.UNIVERSE_EXAM_BANKS === 'object'
    ? window.UNIVERSE_EXAM_BANKS
    : {};
  var defaultExamId = 'admision-uni-2027-1';
  var currentExamId = defaultExamId;
  var questions = [];
  var examTotal = 0;
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
    joinedRunId: '',
    previewActive: false,
    previewExamId: '',
    previewAnswers: {},
    saveChain: Promise.resolve()
  };

  function examBank(examId) {
    return examBanks[examId] || examBanks[defaultExamId] || {
      id: defaultExamId,
      title: 'Simulacro de admisión UNI',
      shortTitle: 'Admisión UNI',
      status: 'draft',
      durationSeconds: 10800,
      questions: []
    };
  }

  function applyExamBank(examId) {
    var bank = examBank(examId);
    currentExamId = bank.id || defaultExamId;
    questions = Array.isArray(bank.questions) ? bank.questions : [];
    examTotal = questions.length;
    return bank;
  }

  function activeExamBank() {
    var session = state.server && state.server.session;
    return applyExamBank(state.previewActive ? state.previewExamId : (session && session.examId));
  }

  applyExamBank(defaultExamId);

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
      no_session: 'No hay una sesión activa para finalizar.',
      exam_not_finalized: 'Finaliza el examen para todos antes de publicar el ranking y enviar los correos.',
      invalid_answer: 'No se pudo guardar esa alternativa.',
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

  function queueAnswerSave(id, answer) {
    state.saveChain = state.saveChain
      .catch(function () {})
      .then(function () {
        return api('save', 'POST', { id: id, answer: answer });
      })
      .catch(function (error) {
        if (error && (error.status === 409 || error.status === 423)) return loadState(true);
      });
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

  function examDurationLabel(bank) {
    var minutes = Math.max(1, Math.round((Number(bank && bank.durationSeconds) || 10800) / 60));
    if (minutes % 60 === 0) {
      var hours = minutes / 60;
      return hours + ' ' + (hours === 1 ? 'hora' : 'horas');
    }
    return minutes + ' minutos';
  }

  function renderShell(content) {
    var session = state.server && state.server.session;
    var bank = activeExamBank();
    var durationLabel = examDurationLabel(bank);
    root.innerHTML = [
      '<div class="ufe-shell">',
      '<header class="ufe-topbar">',
      '<div class="ufe-brand"><span class="ufe-brand-mark">UNI</span><span class="ufe-brand-copy"><strong>' + esc(bank.shortTitle || bank.title) + '</strong><small>' + examTotal + ' preguntas · ' + esc(durationLabel) + '</small></span></div>',
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

  function adminParticipantTable(participants) {
    if (!participants.length) return '<p class="ufe-muted">Aún no hay estudiantes registrados en esta sala.</p>';
    var sorted = participants.slice().sort(function (a, b) {
      var scoreA = a.result ? Number(a.result.percentage) || 0 : -1;
      var scoreB = b.result ? Number(b.result.percentage) || 0 : -1;
      if (scoreA !== scoreB) return scoreB - scoreA;
      if (a.blocked !== b.blocked) return a.blocked ? 1 : -1;
      return String(a.code || '').localeCompare(String(b.code || ''));
    });
    var rows = sorted.map(function (p, index) {
      var result = p.result;
      var justification = p.justification;
      var review = justification && justification.status === 'pending'
        ? '<div class="ufe-actions"><button class="ufe-btn" data-review="approved" data-user="' + esc(p.userId) + '">Aprobar</button><button class="ufe-btn ufe-btn-danger" data-review="rejected" data-user="' + esc(p.userId) + '">Rechazar</button></div>'
        : '';
      var score = p.blocked ? '0/0' : result ? result.correct + '/' + examTotal : 'Pendiente';
      var percentage = p.blocked ? '0 %' : result ? result.percentage + ' %' : '—';
      var status = p.blocked ? 'Bloqueado' : p.submittedAt ? 'Finalizado' : 'En curso o en espera';
      var justificationMarkup = justification
        ? '<div class="ufe-ranking-note"><span>' + esc(justification.text) + '</span><small>' + esc(justification.status) + '</small>' + review + '</div>'
        : '—';
      return '<tr class="' + (p.blocked ? 'is-blocked' : '') + '"><td><strong>' + (index + 1) + '</strong></td><td><strong>' + esc(p.code) + '</strong><br><span class="ufe-muted">' + esc(p.name) + '</span><br><small class="ufe-muted">' + esc(p.email || '') + '</small></td><td>' + esc(status) + '</td><td class="ufe-ranking-score"><strong>' + esc(score) + '</strong><span>' + esc(percentage) + '</span></td><td>' + p.violations + '/2</td><td>' + justificationMarkup + '</td></tr>';
    }).join('');
    return '<div class="ufe-table-wrap"><table class="ufe-table ufe-ranking-table"><thead><tr><th>Puesto</th><th>Código y estudiante</th><th>Estado</th><th>Nota</th><th>Incidencias</th><th>Justificación</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function renderAdmin() {
    state.monitoring = false;
    var session = state.server.session || {};
    var participants = state.server.participants || [];
    var presence = state.server.presence || { connected: 0, waiting: 0, taking: 0 };
    var submitted = participants.filter(function (p) { return p.submittedAt; }).length;
    var blocked = participants.filter(function (p) { return p.blocked; }).length;
    var canActivate = session.status === 'waiting';
    var canFinish = participants.length > 0 && ['waiting', 'countdown', 'active'].includes(session.status);
    var selectedExamId = session.examId && examBanks[session.examId] ? session.examId : defaultExamId;
    var bankOptions = Object.keys(examBanks).map(function (id) {
      var bank = examBanks[id];
      var suffix = bank.status === 'archived' ? ' · Archivado' : bank.status === 'draft' ? ' · En desarrollo' : '';
      return '<option value="' + esc(id) + '" ' + (id === selectedExamId ? 'selected' : '') + '>' + esc(bank.title + suffix) + '</option>';
    }).join('');
    renderShell([
      '<section class="ufe-screen" aria-label="Panel del administrador">',
      '<div class="ufe-live-strip" aria-label="Conexiones en tiempo real">',
      '<div class="ufe-live-total"><span class="ufe-live-dot" aria-hidden="true"></span><span><strong>En vivo</strong><small>Solo en Simulacros</small></span><strong class="ufe-live-number">' + presence.connected + '</strong><span class="ufe-muted">conectados ahora</span></div>',
      '<div class="ufe-live-detail"><span><strong>' + presence.waiting + '</strong> esperando</span><span><strong>' + presence.taking + '</strong> rindiendo</span></div>',
      '</div>',
      '<div class="ufe-stats">',
      '<div class="ufe-stat"><span class="ufe-muted">Estudiantes</span><strong>' + participants.length + '</strong><span>códigos únicos asignados</span></div>',
      '<div class="ufe-stat"><span class="ufe-muted">Entregas</span><strong>' + submitted + '</strong><span>de ' + participants.length + ' intentos</span></div>',
      '<div class="ufe-stat"><span class="ufe-muted">Bloqueos</span><strong>' + blocked + '</strong><span>justificables en tiempo real</span></div>',
      '</div>',
      '<div class="ufe-card ufe-stack">',
      '<div class="ufe-result-head"><div class="ufe-stack"><span class="ufe-badge">' + esc(statusLabel(session)) + '</span><h1 class="ufe-title">Control de simulacros</h1></div></div>',
      '<div class="ufe-admin-exam-picker"><label class="ufe-stack" for="ufe-exam-select"><strong>Examen que se realizará</strong><span class="ufe-muted">El banco anterior está conservado como archivo. El nuevo banco corresponde a Admisión UNI.</span></label><select class="ufe-input" id="ufe-exam-select">' + bankOptions + '</select><div class="ufe-actions"><button class="ufe-btn" id="ufe-preview-exam" type="button">Prueba previa</button><button class="ufe-btn ufe-btn-primary" id="ufe-open-room" type="button">Abrir sala con este examen</button></div></div>',
      '<div class="ufe-actions"><button class="ufe-btn ufe-btn-primary" id="ufe-activate" type="button" ' + (canActivate ? '' : 'disabled') + '>Activar 30 segundos</button><button class="ufe-btn ufe-btn-danger" id="ufe-finish-all" type="button" ' + (canFinish ? '' : 'disabled') + '>Finalizar para todos</button><button class="ufe-btn" id="ufe-publish" type="button" ' + (submitted ? '' : 'disabled') + '>Publicar notas</button></div>',
      '<p class="ufe-muted">Al activar, todos los estudiantes registrados ven la misma cuenta regresiva y disponen del tiempo configurado para el examen elegido. Las preguntas y alternativas cambian de orden para cada código sin mezclar los cursos.</p>',
      '</div>',
      '<div class="ufe-card ufe-stack"><div class="ufe-result-head"><h2>Ranking completo</h2><span class="ufe-badge">' + participants.length + ' registrados</span></div>',
      '<p class="ufe-muted">Ordenado de mayor a menor nota. Los intentos bloqueados figuran con 0/0.</p>',
      '<div class="ufe-admin-list">' + adminParticipantTable(participants) + '</div></div>',
      '</section>'
    ].join(''));

    var open = document.getElementById('ufe-open-room');
    var preview = document.getElementById('ufe-preview-exam');
    var examSelect = document.getElementById('ufe-exam-select');
    var activate = document.getElementById('ufe-activate');
    var finishAll = document.getElementById('ufe-finish-all');
    var publish = document.getElementById('ufe-publish');
    if (open) open.addEventListener('click', function () {
      if (!window.confirm('Se abrirá una nueva sala y la sesión anterior dejará de ser la activa. ¿Continuar?')) return;
      adminAction('admin/open', { examId: examSelect && examSelect.value || defaultExamId });
    });
    if (preview) preview.addEventListener('click', function () {
      state.previewActive = true;
      state.previewExamId = examSelect && examSelect.value || defaultExamId;
      state.previewAnswers = {};
      state.current = 0;
      applyExamBank(state.previewExamId);
      prepareExam('ADMIN-PREVIEW-' + state.previewExamId);
      renderAdminPreview();
    });
    if (activate) activate.addEventListener('click', function () { adminAction('admin/activate'); });
    if (finishAll) finishAll.addEventListener('click', function () {
      if (!window.confirm('Se cerrará el examen para todos y se corregirán las respuestas guardadas hasta este instante. Los bloqueados tendrán 0/0. ¿Continuar?')) return;
      adminAction('admin/finish');
    });
    if (publish) publish.addEventListener('click', function () {
      if (!window.confirm('¿Publicar ahora el ranking y las soluciones? También se enviará a cada participante un correo según su puesto final.')) return;
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

  function renderAdminPreview() {
    state.monitoring = false;
    var bank = activeExamBank();
    if (!state.order.length) prepareExam('ADMIN-PREVIEW-' + currentExamId);
    state.current = Math.max(0, Math.min(state.order.length - 1, state.current));
    var q = state.order[state.current];
    if (!q) {
      renderShell('<section class="ufe-card ufe-centered ufe-stack"><span class="ufe-badge">Vista previa</span><h1 class="ufe-title">Este banco todavía no tiene preguntas</h1><button class="ufe-btn" id="ufe-preview-exit" type="button">Volver al panel</button></section>');
    } else {
      var options = state.prepared.get(q.id) || q.choices;
      var passage = q.passage ? '<div class="ufe-passage">' + esc(q.passage) + '</div>' : '';
      var visual = q.visual ? '<div class="ufe-question-visual">' + q.visual + '</div>' : '';
      var optionMarkup = options.map(function (option, index) {
        var selected = state.previewAnswers[q.id] === option;
        return '<button class="ufe-option" type="button" data-preview-option="' + encodeURIComponent(option) + '" aria-pressed="' + selected + '"><span class="ufe-option-letter">' + String.fromCharCode(65 + index) + '.</span><span>' + esc(option) + '</span></button>';
      }).join('');
      renderShell([
        '<section class="ufe-screen" aria-label="Vista previa del examen">',
        '<div class="ufe-card ufe-result-head"><div class="ufe-stack"><span class="ufe-badge">Prueba previa · no guarda resultados</span><h1 class="ufe-title">' + esc(bank.title) + '</h1></div><button class="ufe-btn" id="ufe-preview-exit" type="button">Volver al panel</button></div>',
        '<article class="ufe-card ufe-question ufe-preview-question"><span class="ufe-muted">Pregunta ' + (state.current + 1) + ' de ' + examTotal + '</span><div class="ufe-meta"><span class="ufe-badge">' + esc(q.course) + '</span><span class="ufe-muted">' + esc(q.topic) + '</span></div>',
        passage, '<div class="ufe-question-copy">' + trustedQuestionText(q.text) + '</div>', visual,
        '<fieldset class="ufe-options" aria-label="Alternativas">' + optionMarkup + '</fieldset>',
        '<div class="ufe-question-actions"><button class="ufe-btn" id="ufe-preview-prev" type="button" ' + (state.current === 0 ? 'disabled' : '') + '>Anterior</button><button class="ufe-btn ufe-btn-primary" id="ufe-preview-next" type="button" ' + (state.current === state.order.length - 1 ? 'disabled' : '') + '>Siguiente</button></div></article></section>'
      ].join(''));
    }
    var exit = document.getElementById('ufe-preview-exit');
    if (exit) exit.addEventListener('click', function () {
      state.previewActive = false;
      state.previewExamId = '';
      state.order = [];
      applyExamBank(state.server && state.server.session && state.server.session.examId);
      renderAdmin();
    });
    var prev = document.getElementById('ufe-preview-prev');
    var next = document.getElementById('ufe-preview-next');
    if (prev) prev.addEventListener('click', function () { state.current -= 1; renderAdminPreview(); });
    if (next) next.addEventListener('click', function () { state.current += 1; renderAdminPreview(); });
    root.querySelectorAll('[data-preview-option]').forEach(function (button) {
      button.addEventListener('click', function () {
        state.previewAnswers[q.id] = decodeURIComponent(button.getAttribute('data-preview-option'));
        renderAdminPreview();
      });
    });
  }

  async function adminAction(route, data) {
    if (state.busy) return;
    state.busy = true;
    state.error = '';
    try {
      var response = await api(route, 'POST', data || {});
      if (route === 'admin/publish' && response.notifications) {
        if (!response.notifications.configured) {
          window.alert('Las notas se publicaron, pero el servicio privado de correo aún no está configurado. No se envió ningún mensaje.');
        } else if (response.notifications.sent) {
          window.alert('Ranking publicado. Se enviaron ' + response.notifications.sent + ' correos y se omitieron ' + response.notifications.skipped + ' ya enviados.');
        } else {
          window.alert('Ranking publicado. Todos los correos correspondientes ya habían sido enviados.');
        }
      }
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
    var durationLabel = examDurationLabel(activeExamBank());
    var seconds = Math.max(0, Math.ceil((session.startAt - Date.now()) / 1000));
    renderShell([
      '<section class="ufe-card ufe-centered ufe-stack" aria-label="Cuenta regresiva">',
      '<div class="ufe-result-head"><span class="ufe-badge">Inicia en</span><span class="ufe-code">' + esc(participant.code) + '</span></div>',
      '<div class="ufe-countdown" id="ufe-countdown">' + seconds + '</div>',
      '<p class="ufe-muted">Al llegar a cero se iniciará automáticamente el cronómetro de ' + esc(durationLabel) + '.</p>',
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
      '<div class="ufe-card ufe-meta"><span class="ufe-code">' + esc(participant.code) + '</span><strong id="ufe-timer">' + formatTime(remaining) + '</strong><span class="ufe-muted">' + answered + '/' + examTotal + ' respondidas</span><span class="ufe-muted">' + participant.violations + '/2 incidencias</span><button class="ufe-btn" id="ufe-finish" type="button">Finalizar</button></div>',
      '<div class="ufe-progress" aria-label="' + answered + ' de ' + examTotal + ' respondidas"><span style="width:' + (answered / examTotal * 100) + '%"></span></div>',
      '<div class="ufe-exam-layout">',
      '<aside class="ufe-card ufe-navigator" aria-label="Navegador de preguntas"><strong>Preguntas por curso</strong><span class="ufe-muted">Subrayada: respondida</span><div class="ufe-course-groups">' + nav + '</div></aside>',
      '<article class="ufe-card ufe-question">',
      '<div class="ufe-result-head"><div class="ufe-stack"><span class="ufe-muted">Pregunta ' + (state.current + 1) + ' de ' + examTotal + '</span><div class="ufe-meta"><span class="ufe-badge">' + esc(q.course) + '</span><span class="ufe-muted">' + esc(q.topic) + ' · ' + frequencyText(q.frequency) + '</span></div></div></div>',
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
        queueAnswerSave(q.id, state.answers[q.id]);
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
      if (!window.confirm('Has respondido ' + answered + ' de ' + examTotal + ' preguntas. ¿Deseas enviar el examen?')) return;
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
      await state.saveChain.catch(function () {});
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
      return '<tr><td>' + item.id + '</td><td><strong>' + esc(item.course) + '</strong><br><span class="ufe-muted">' + esc(item.topic) + '</span></td><td>' + esc(item.selected) + '</td></tr>';
    }).join('');
    var review = (result.review || []).map(function (item) {
      var statusClass = item.correct ? 'ufe-status-success' : 'ufe-status-danger';
      var statusText = item.correct ? 'Correcta' : 'Incorrecta';
      return '<details class="ufe-review-item"><summary><span><strong>Pregunta ' + item.id + '</strong><small>' + esc(item.course) + ' · ' + esc(item.topic) + '</small></span><span class="ufe-badge ' + statusClass + '">' + statusText + '</span></summary>' +
        '<div class="ufe-review-body"><div class="ufe-review-answers"><p><span>Tu respuesta</span><strong>' + esc(item.selected) + '</strong></p><p><span>Respuesta correcta</span><strong>' + esc(item.answer) + '</strong></p></div>' +
        '<div><span class="ufe-muted">Desarrollo</span><p>' + esc(item.solution) + '</p></div>' +
        (item.auditSource ? '<small class="ufe-review-source">Fuente de verificación: ' + esc(item.auditSource) + '</small>' : '') + '</div></details>';
    }).join('');
    renderShell([
      '<section class="ufe-screen" aria-label="Resultado publicado">',
      '<div class="ufe-stats"><div class="ufe-stat"><span class="ufe-muted">Código</span><strong>' + esc(participant.code) + '</strong><span>identificador del intento</span></div><div class="ufe-stat"><span class="ufe-muted">Aciertos</span><strong>' + result.correct + '/' + examTotal + '</strong><span>' + result.percentage + ' %</span></div><div class="ufe-stat"><span class="ufe-muted">Sin responder</span><strong>' + result.unanswered + '</strong><span>' + result.incorrect + ' incorrectas</span></div></div>',
      '<div class="ufe-card ufe-stack"><h2>Rendimiento por curso</h2><div class="ufe-course-score">' + course + '</div></div>',
      '<div class="ufe-card ufe-stack"><div class="ufe-result-head"><h2>Solucionario auditado</h2><span class="ufe-badge">' + (result.review ? result.review.length : result.missed.length) + ' preguntas</span></div>',
      review ? '<div class="ufe-review-list">' + review + '</div>' : (result.missed.length ? '<div class="ufe-table-wrap"><table class="ufe-table"><thead><tr><th>N.º</th><th>Curso y tema</th><th>Tu respuesta</th></tr></thead><tbody>' + missed + '</tbody></table></div>' : '<p class="ufe-badge ufe-status-success">No hubo errores.</p>'),
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
    if (state.isAdmin && state.previewActive) renderAdminPreview();
    else if (state.isAdmin) renderAdmin();
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
      applyExamBank(payload.session && payload.session.examId);
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
