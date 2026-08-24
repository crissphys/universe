(function () {
  'use strict';

  var TOKEN_KEY = 'universe_auth_token';
  var CACHE_KEY = 'universe_planner_cache_v1';
  var DATA = window.UNIVERSE_PLANNER_DATA || { admission: [], cepre: [], evaluations: [] };
  var ACADEMIES = [
    'Pitágoras', 'César Vallejo', 'ADUNI', 'Trilce', 'Pamer', 'Exclusiva UNI',
    'ASEUNI', 'ADCUNI', 'Academia Ingeniería', 'Formación UNI', 'Aula 20',
    'ACUNI', 'Grupo Ciencias', 'Vonex', 'Saco Oliveros', 'Savia', 'Integral Class',
    'Academia Prisma', 'Academia Euclides', 'Academia Apolo', 'Academia Mendel', 'Otra academia'
  ];
  var CYCLE_START = '2026-08-31';
  var CEPRE_FINAL = '2027-01-24';
  var CEPRE_PLAN_END = '2027-01-17';
  var ADMISSION_PLAN_END = '2027-02-14';
  var TIME_BLOCKS = {
    morning: [['07:00', '08:20'], ['08:40', '10:00'], ['10:20', '11:40'], ['12:10', '13:30']],
    afternoon: [['14:00', '15:10'], ['15:25', '16:35'], ['16:50', '18:00'], ['18:20', '19:30']]
  };
  var state = {
    user: null,
    community: null,
    planner: null,
    wizardStep: 1,
    draft: {
      username: '', studentType: '', cepreCycle: '', academyName: '', shift: '', focus: '',
      startDate: localDate(new Date()), endMode: 'admission', endDate: ADMISSION_PLAN_END
    },
    calendarDate: startOfWeek(new Date()),
    view: 'week',
    saveTimer: null,
    language: readLanguage(),
    authMode: 'login',
    profileSubview: '',
    timer: { technique: '50-10', phase: 'focus', remaining: 3000, total: 3000, running: false, interval: null }
  };

  var TEXT = {
    es: {
      privatePlan: 'ACCESO PRIVADO Y SINCRONIZADO', platformTitle: 'Plataforma Universe', platformCopy: 'Entra a tu espacio de estudio o crea una cuenta propia de Universe.', signIn: 'Ingresar', createAccount: 'Crear cuenta', password: 'Contraseña de Universe', enterPlatform: 'Entrar a la plataforma', registerPlatform: 'Crear mi cuenta', orGoogle: 'o continúa con Google', signInTitle: 'Inicia con Google para crear tu horario',
      continueGoogle: 'Continuar con Google', authNote: 'Nunca solicitamos ni guardamos tu contraseña de Gmail.',
      setup: 'CONFIGURACIÓN INICIAL', buildRoute: 'Construyamos tu ruta de estudio', profile: 'Perfil', schedule: 'Horario', goal: 'Meta',
      studentQuestion: '¿Qué tipo de estudiante eres?', studentHelp: 'Esto define el temario y la forma en que distribuiremos tus semanas.',
      username: 'Nombre de usuario', usernameHelp: 'Entre 3 y 24 caracteres: letras minúsculas, números, guion o guion bajo.',
      select: 'Seleccionar', preCycle: 'Ciclo preuniversitario', basicCycle: 'Ciclo básico', cycleI: 'Ciclo I', blocksBreaks: '4 bloques · 3 descansos',
      cepreDescription: 'Ruta semanal según prácticas y parciales.', academy: 'Academia', academyDescription: 'Preparación basada en el temario de admisión UNI.', independent: 'Autodidacta', independentDescription: 'Una ruta completa para estudiar por tu cuenta.',
      cepreCycleQuestion: '¿Qué ciclo CEPREUNI 2027-1 llevarás?', academyQuestion: '¿En qué academia estudias?', academyHelp: 'Elige una opción o escribe el nombre de otra academia.', otherAcademy: 'Nombre de la otra academia',
      shiftQuestion: '¿En qué horario quieres organizar tus sesiones?', shiftHelp: 'Cada franja incluye cuatro bloques y descansos reales entre ellos.', morning: 'MAÑANA', afternoon: 'TARDE',
      focusQuestion: '¿Qué área necesita más espacio?', focusHelp: 'Todas seguirán presentes; el área elegida recibirá más bloques.', sciences: 'Ciencias', mathematics: 'Matemáticas', humanities: 'Humanidades', allCourses: 'Todos los cursos', balanced: 'Distribución equilibrada',
      scienceSubjects: 'Física y Química', mathSubjects: 'Aritmética, Álgebra, Geometría y Trigonometría', humanitiesSubjects: 'Lectura, lenguaje y sociedad',
      datesQuestion: '¿Desde cuándo y hasta qué fecha estudiarás?', datesHelp: 'Puedes cambiar estas fechas después sin perder tus preferencias.', startDate: 'Fecha de inicio', weekBeforeFinal: 'Una semana antes del examen final', admissionGoal: 'Proceso 2027-1', custom: 'PERSONALIZADO', chooseDate: 'Elegir otra fecha', yourOwnGoal: 'Define tu propia meta', endDate: 'Fecha final', officialCheck: 'Podrás ajustarla cuando se publique el cronograma oficial.',
      admissionDate: '14 febrero 2027 · fecha objetivo editable', open: 'Abrir', enable: 'Activar', assessment: 'Evaluación', mathArea: 'Matemática', general: 'General', reset: 'Reiniciar',
      back: 'Atrás', continue: 'Continuar', generate: 'Crear mi cronograma', myPlan: 'MI PLAN DE ESTUDIO', exportCalendar: 'Exportar calendario', reconfigure: 'Reconfigurar', today: 'HOY', progress: 'Progreso del plan', focusTimer: 'Cronómetro de enfoque', reminders: 'Recordatorios', notificationsOff: 'Notificaciones desactivadas', legend: 'Leyenda', todayButton: 'Hoy', week: 'Semana', month: 'Mes', addBlock: 'Añadir bloque',
      calendarNote: 'Las fechas CEPREUNI de este plan sirven para organizar el estudio. Confírmalas cuando la institución publique el cronograma 2027-1.',
      editCalendar: 'EDITAR CALENDARIO', studyBlock: 'Bloque de estudio', date: 'Fecha', area: 'Área', start: 'Inicio', end: 'Fin', course: 'Curso', topic: 'Tema o tarea', delete: 'Eliminar', markDone: 'Marcar completado', markPending: 'Marcar pendiente', cancel: 'Cancelar', saveBlock: 'Guardar bloque',
      focusTechniques: 'TÉCNICAS DE ENFOQUE', chooseRhythm: 'Elige un ritmo que puedas sostener', quickStart: 'Inicio ligero', quickStartCopy: '20 minutos de enfoque y 5 de pausa. Útil para empezar o recuperar el hábito.', pomodoroCopy: 'Una tarea concreta, sin interrupciones, seguida de una pausa breve.', deepBlock: 'Bloque profundo', deepBlockCopy: 'Adecuado para teoría más práctica o resolución continua de problemas.', longCycle: 'Ciclo largo', longCycleCopy: 'Para simulacros parciales o temas extensos. Úsalo solo si ya sostienes la atención.', oneTask: 'Una sesión, una tarea.', timerAdvice: 'Antes de iniciar, define qué tema y cuántos ejercicios terminarás. Durante la pausa, levántate, mira lejos de la pantalla y toma agua.',
      loginNeeded: 'Inicia sesión con Google para guardar tu plan.', selectStudent: 'Elige qué tipo de estudiante eres.', selectCycle: 'Elige tu ciclo CEPREUNI.', selectAcademy: 'Elige o escribe tu academia.', invalidUsername: 'Crea un nombre de usuario válido de 3 a 24 caracteres.', selectShiftFocus: 'Elige un horario y un área de enfoque.', invalidDates: 'Revisa las fechas: la fecha final debe ser posterior al inicio.',
      synced: 'Plan sincronizado con tu cuenta.', localOnly: 'El plan se guardó en este dispositivo; intentaremos sincronizarlo al recuperar la conexión.', noSessions: 'Hoy no tienes bloques programados. Aprovecha para descansar o revisar errores.', completedOf: '{done} de {total} bloques completados', notificationsOn: 'Notificaciones activadas', pageOpenNotice: 'Te avisaremos mientras Universe esté abierto en este dispositivo.',
      exam: 'Evaluación', review: 'Repaso', practice: 'Práctica', study: 'Estudio', topicsScheduled: 'temas programados', weeks: 'semanas', sessions: 'sesiones', hours: 'horas planificadas',
      focus: 'ENFOQUE', break: 'PAUSA', startTimer: '▶ Iniciar', pauseTimer: 'Ⅱ Pausar', timerFinished: 'Bloque completado', breakFinished: 'Pausa terminada. Vuelve a tu siguiente tarea.', confirmReset: '¿Quieres crear un cronograma nuevo? Tus bloques actuales serán reemplazados.',
      calendarDownloaded: 'Calendario exportado.', saved: 'Bloque guardado.', deleted: 'Bloque eliminado.'
    },
    en: {
      privatePlan: 'PRIVATE, SYNCED ACCESS', platformTitle: 'Universe Platform', platformCopy: 'Open your study space or create your own Universe account.', signIn: 'Sign in', createAccount: 'Create account', password: 'Universe password', enterPlatform: 'Enter the platform', registerPlatform: 'Create my account', orGoogle: 'or continue with Google', signInTitle: 'Sign in with Google to build your schedule',
      continueGoogle: 'Continue with Google', authNote: 'We never ask for or store your Gmail password.',
      setup: 'QUICK SETUP', buildRoute: 'Let’s build your study route', profile: 'Profile', schedule: 'Schedule', goal: 'Goal',
      studentQuestion: 'What kind of student are you?', studentHelp: 'This sets the syllabus and the way your weeks will be paced.', username: 'Username', usernameHelp: 'Use 3–24 lowercase letters, numbers, hyphens, or underscores.',
      select: 'Select', preCycle: 'Pre-university cycle', basicCycle: 'Foundation cycle', cycleI: 'Cycle I', blocksBreaks: '4 blocks · 3 breaks',
      cepreDescription: 'A weekly route aligned with quizzes and midterms.', academy: 'Academy', academyDescription: 'Prep built around the UNI admission syllabus.', independent: 'Self-study', independentDescription: 'A complete route you can follow on your own.',
      cepreCycleQuestion: 'Which CEPREUNI 2027-1 cycle will you take?', academyQuestion: 'Which academy do you attend?', academyHelp: 'Pick one or enter another academy.', otherAcademy: 'Other academy name',
      shiftQuestion: 'When do you want your study sessions?', shiftHelp: 'Each shift includes four blocks with proper breaks in between.', morning: 'MORNING', afternoon: 'AFTERNOON',
      focusQuestion: 'Which area needs more room?', focusHelp: 'Every area stays in the plan; your priority gets extra blocks.', sciences: 'Sciences', mathematics: 'Mathematics', humanities: 'Humanities', allCourses: 'All subjects', balanced: 'Balanced schedule',
      scienceSubjects: 'Physics and Chemistry', mathSubjects: 'Arithmetic, Algebra, Geometry and Trigonometry', humanitiesSubjects: 'Reading, language and social studies',
      datesQuestion: 'When will your plan start and end?', datesHelp: 'You can adjust these dates later without losing your preferences.', startDate: 'Start date', weekBeforeFinal: 'One week before the final exam', admissionGoal: '2027-1 process', custom: 'CUSTOM', chooseDate: 'Choose another date', yourOwnGoal: 'Set your own finish line', endDate: 'End date', officialCheck: 'You can update it when the official calendar is published.',
      admissionDate: 'February 14, 2027 · editable target date', open: 'Open', enable: 'Enable', assessment: 'Assessment', mathArea: 'Mathematics', general: 'General', reset: 'Reset',
      back: 'Back', continue: 'Continue', generate: 'Build my schedule', myPlan: 'MY STUDY PLAN', exportCalendar: 'Export calendar', reconfigure: 'Reconfigure', today: 'TODAY', progress: 'Plan progress', focusTimer: 'Focus timer', reminders: 'Reminders', notificationsOff: 'Notifications are off', legend: 'Legend', todayButton: 'Today', week: 'Week', month: 'Month', addBlock: 'Add block',
      calendarNote: 'CEPREUNI dates in this plan are planning milestones. Confirm them once the institution publishes the official 2027-1 calendar.',
      editCalendar: 'EDIT CALENDAR', studyBlock: 'Study block', date: 'Date', area: 'Area', start: 'Start', end: 'End', course: 'Subject', topic: 'Topic or task', delete: 'Delete', markDone: 'Mark complete', markPending: 'Mark pending', cancel: 'Cancel', saveBlock: 'Save block',
      focusTechniques: 'FOCUS METHODS', chooseRhythm: 'Pick a pace you can actually sustain', quickStart: 'Easy start', quickStartCopy: '20 focused minutes and a 5-minute break. Great when you are rebuilding the habit.', pomodoroCopy: 'One clear task, zero interruptions, then a short reset.', deepBlock: 'Deep-work block', deepBlockCopy: 'Good for theory plus practice or a longer problem set.', longCycle: 'Long cycle', longCycleCopy: 'Best for partial mock exams or long topics. Use it once your focus is solid.', oneTask: 'One session, one task.', timerAdvice: 'Before you start, define the topic and how many exercises you will finish. During the break, stand up, look away from the screen, and drink water.',
      loginNeeded: 'Sign in with Google to save your plan.', selectStudent: 'Choose your student type.', selectCycle: 'Choose your CEPREUNI cycle.', selectAcademy: 'Choose or enter your academy.', invalidUsername: 'Create a valid 3–24 character username.', selectShiftFocus: 'Choose a study shift and a priority area.', invalidDates: 'Check the dates: the end date must be after the start.',
      synced: 'Plan synced to your account.', localOnly: 'Your plan is saved on this device; we will sync it when the connection is back.', noSessions: 'No blocks scheduled for today. Use the time to rest or review mistakes.', completedOf: '{done} of {total} blocks completed', notificationsOn: 'Notifications enabled', pageOpenNotice: 'We will remind you while Universe is open on this device.',
      exam: 'Exam', review: 'Review', practice: 'Practice', study: 'Study', topicsScheduled: 'topics scheduled', weeks: 'weeks', sessions: 'sessions', hours: 'planned hours',
      focus: 'FOCUS', break: 'BREAK', startTimer: '▶ Start', pauseTimer: 'Ⅱ Pause', timerFinished: 'Focus block complete', breakFinished: 'Break is over. Time for your next task.', confirmReset: 'Build a new schedule? Your current blocks will be replaced.',
      calendarDownloaded: 'Calendar exported.', saved: 'Block saved.', deleted: 'Block deleted.'
    }
  };

  function $(id) { return document.getElementById(id); }
  function qa(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function cleanId(value) { return String(value || '').replace(/[^a-zA-Z0-9_-]/g, ''); }
  function safe(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]; }); }
  function tx(key, vars) {
    var value = (TEXT[state.language] && TEXT[state.language][key]) || TEXT.es[key] || key;
    Object.keys(vars || {}).forEach(function (name) { value = value.replace('{' + name + '}', vars[name]); });
    return value;
  }
  function readLanguage() { try { return localStorage.getItem('universe_language') === 'en' ? 'en' : 'es'; } catch (_) { return 'es'; } }
  function localDate(date) {
    var d = new Date(date);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function parseDate(value) { var parts = String(value || '').split('-').map(Number); return new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1, 12, 0, 0); }
  function addDays(date, days) { var result = new Date(date); result.setDate(result.getDate() + days); return result; }
  function startOfWeek(date) { var result = new Date(date); var day = result.getDay(); result.setDate(result.getDate() - (day === 0 ? 6 : day - 1)); result.setHours(12, 0, 0, 0); return result; }
  function daysBetween(start, end) { return Math.floor((parseDate(end) - parseDate(start)) / 86400000); }
  function uid(prefix) { return (prefix || 'event') + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8); }
  function formatDate(value, options) { return parseDate(value).toLocaleDateString(state.language === 'en' ? 'en-US' : 'es-PE', options || { day: 'numeric', month: 'long', year: 'numeric' }); }
  function minutesBetween(start, end) { var a = start.split(':').map(Number), b = end.split(':').map(Number); return (b[0] * 60 + b[1]) - (a[0] * 60 + a[1]); }

  function api(path, method, data) {
    var headers = { 'Content-Type': 'application/json' };
    try { var token = localStorage.getItem(TOKEN_KEY); if (token) headers.Authorization = 'Bearer ' + token; } catch (_) {}
    var options = { method: method || 'GET', headers: headers, cache: 'no-store' };
    if (data !== undefined) options.body = JSON.stringify(data);
    return fetch('/api/site' + path, options).then(async function (response) {
      var payload = await response.json().catch(function () { return {}; });
      if (!response.ok) { var error = new Error(payload.error || ('HTTP ' + response.status)); error.status = response.status; throw error; }
      return payload;
    });
  }
  function communityApi(path, method, data) {
    var headers = { 'Content-Type': 'application/json' };
    try { var token = localStorage.getItem(TOKEN_KEY); if (token) headers.Authorization = 'Bearer ' + token; } catch (_) {}
    var options = { method: method || 'GET', headers: headers, cache: 'no-store' };
    if (data !== undefined) options.body = JSON.stringify(data);
    return fetch('/api/unitalk' + path, options).then(async function (response) {
      var payload = await response.json().catch(function () { return {}; });
      if (!response.ok) { var error = new Error(payload.error || ('HTTP ' + response.status)); error.status = response.status; throw error; }
      return payload;
    });
  }

  function authApi(path, data) {
    return fetch('/api/auth/' + path, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {})
    }).then(async function (response) {
      var payload = await response.json().catch(function () { return {}; });
      if (!response.ok) { var error = new Error(payload.error || 'request_failed'); error.status = response.status; throw error; }
      return payload;
    });
  }

  function applyLanguage() {
    state.language = readLanguage();
    qa('[data-planner-t]').forEach(function (element) {
      var key = element.getAttribute('data-planner-t');
      if (TEXT[state.language] && TEXT[state.language][key]) element.textContent = TEXT[state.language][key];
    });
    $('academy-search').placeholder = state.language === 'en' ? 'Search academy' : 'Buscar academia';
    $('custom-academy').placeholder = state.language === 'en' ? 'Enter the full name' : 'Escribe el nombre completo';
    updateAuthMode();
    if (state.planner) renderDashboard();
    else updatePreview();
    updateTimerUI();
  }

  function setAuthStatus(message, isError) {
    var status = $('planner-auth-status');
    if (!status) return;
    status.textContent = message || '';
    status.classList.toggle('error', !!isError);
  }

  function updateAuthMode() {
    qa('[data-auth-mode]').forEach(function (button) {
      var selected = button.dataset.authMode === state.authMode;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
    var password = $('planner-auth-password');
    if (password) password.autocomplete = state.authMode === 'register' ? 'new-password' : 'current-password';
    var submit = $('planner-auth-submit');
    if (submit) submit.textContent = tx(state.authMode === 'register' ? 'registerPlatform' : 'enterPlatform');
    setAuthStatus('');
  }

  async function submitUniverseCredentials(event) {
    event.preventDefault();
    var username = String($('planner-auth-username').value || '').trim().toLowerCase();
    var password = String($('planner-auth-password').value || '');
    if (!/^[a-z0-9][a-z0-9_-]{2,23}$/.test(username)) {
      setAuthStatus(state.language === 'en' ? 'Use 3–24 lowercase letters, numbers, hyphens, or underscores.' : 'Usa entre 3 y 24 letras minúsculas, números, guion o guion bajo.', true);
      return;
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setAuthStatus(state.language === 'en' ? 'Use at least 8 characters, including a letter and a number.' : 'Usa al menos 8 caracteres, incluyendo una letra y un número.', true);
      return;
    }
    var submit = $('planner-auth-submit');
    submit.disabled = true;
    setAuthStatus(state.language === 'en' ? 'Checking your account…' : 'Verificando tu cuenta…');
    try {
      var result = await authApi(state.authMode === 'register' ? 'register' : 'login', { username: username, password: password });
      $('planner-auth-password').value = '';
      if (window.UniverseGoogleAuth && UniverseGoogleAuth.acceptSession) UniverseGoogleAuth.acceptSession(result.user, result.token);
      else {
        localStorage.setItem(TOKEN_KEY, result.token);
        localStorage.setItem('universe_google_user', JSON.stringify(Object.assign({}, result.user, { secureSession: true })));
      }
      setAuthStatus(state.language === 'en' ? 'All set. Opening your platform…' : 'Listo. Abriendo tu plataforma…');
      await checkAuth();
    } catch (error) {
      var messages = state.language === 'en' ? {
        username_taken: 'That username is already taken.', invalid_credentials: 'Incorrect username or password.', rate_limited: 'Too many attempts. Try again in one minute.'
      } : {
        username_taken: 'Ese nombre de usuario ya está ocupado.', invalid_credentials: 'El usuario o la contraseña son incorrectos.', rate_limited: 'Demasiados intentos. Vuelve a probar en un minuto.'
      };
      setAuthStatus(messages[error.message] || (state.language === 'en' ? 'We could not complete the sign-in.' : 'No se pudo completar el acceso.'), true);
    } finally {
      submit.disabled = false;
    }
  }

  async function enterWithGoogle() {
    var button = $('planner-login');
    button.disabled = true;
    setAuthStatus(state.language === 'en' ? 'Checking your Google session…' : 'Verificando tu sesión de Google…');
    try {
      var user = window.UniverseGoogleAuth && UniverseGoogleAuth.refresh ? await UniverseGoogleAuth.refresh().catch(function () { return null; }) : null;
      user = user || (window.UniverseGoogleAuth && UniverseGoogleAuth.user && UniverseGoogleAuth.user());
      var token = '';
      try { token = localStorage.getItem(TOKEN_KEY) || ''; } catch (_) {}
      if (user && user.secureSession === true && token) {
        await checkAuth();
        return;
      }
      setAuthStatus('');
      if (window.UniverseGoogleAuth) UniverseGoogleAuth.open({ account: true });
    } finally {
      button.disabled = false;
    }
  }

  function renderAcademies(filter) {
    var query = String(filter || '').trim().toLowerCase();
    var selected = state.draft.academyName;
    $('academy-grid').innerHTML = ACADEMIES.filter(function (name) { return !query || name.toLowerCase().includes(query); }).map(function (name) {
      var initials = name === 'Otra academia' ? '+' : name.split(/\s+/).slice(0, 2).map(function (part) { return part.charAt(0); }).join('').toUpperCase();
      return '<button class="academy-card' + (selected === name ? ' selected' : '') + '" type="button" data-academy="' + safe(name) + '"><span>' + safe(initials) + '</span><b>' + safe(name) + '</b></button>';
    }).join('');
    qa('[data-academy]', $('academy-grid')).forEach(function (button) {
      button.onclick = function () {
        state.draft.academyName = button.dataset.academy;
        $('custom-academy-wrap').hidden = state.draft.academyName !== 'Otra academia';
        renderAcademies($('academy-search').value);
        if (state.draft.academyName !== 'Otra academia') advanceFromProfileChoice();
      };
    });
  }

  function selectButtons(selector, value, attr) {
    qa(selector).forEach(function (button) { button.classList.toggle('selected', button.getAttribute(attr) === value); });
  }

  function configureWizardFromDraft() {
    $('planner-username').value = state.draft.username || '';
    selectButtons('[data-student-type]', state.draft.studentType, 'data-student-type');
    selectButtons('[data-cepre-cycle]', state.draft.cepreCycle, 'data-cepre-cycle');
    selectButtons('[data-shift]', state.draft.shift, 'data-shift');
    selectButtons('[data-focus]', state.draft.focus, 'data-focus');
    selectButtons('[data-end-mode]', state.draft.endMode, 'data-end-mode');
    $('planner-student-types').hidden = Boolean(state.profileSubview);
    $('planner-cepre-cycle').hidden = state.profileSubview !== 'cepreuni';
    $('planner-academies').hidden = state.profileSubview !== 'academy';
    $('custom-academy-wrap').hidden = state.draft.academyName !== 'Otra academia';
    $('custom-academy').value = state.draft.academyName && state.draft.academyName !== 'Otra academia' ? '' : (state.draft.customAcademy || '');
    $('planner-start-date').value = state.draft.startDate || localDate(new Date());
    $('planner-end-date').value = state.draft.endDate || ADMISSION_PLAN_END;
    renderAcademies($('academy-search').value);
    updatePreview();
  }

  function returnToStudentTypes() {
    state.profileSubview = '';
    state.draft.studentType = '';
    state.draft.cepreCycle = '';
    state.draft.academyName = '';
    state.draft.customAcademy = '';
    $('planner-setup-status').textContent = '';
    configureWizardFromDraft();
    $('planner-student-types').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function advanceFromProfileChoice() {
    var error = validateStep(1);
    if (error) {
      $('planner-setup-status').textContent = error;
      if (error === tx('invalidUsername')) $('planner-username').focus();
      return false;
    }
    $('planner-setup-status').textContent = '';
    setWizardStep(2);
    return true;
  }

  function setWizardStep(step) {
    state.wizardStep = Math.max(1, Math.min(3, step));
    qa('[data-step]').forEach(function (panel) {
      var active = Number(panel.dataset.step) === state.wizardStep;
      panel.hidden = !active;
      panel.classList.toggle('active', active);
    });
    qa('[data-step-indicator]').forEach(function (indicator) {
      var number = Number(indicator.dataset.stepIndicator);
      indicator.classList.toggle('active', number === state.wizardStep);
      indicator.classList.toggle('complete', number < state.wizardStep);
    });
    $('planner-back').hidden = state.wizardStep === 1;
    $('planner-next').hidden = state.wizardStep === 3;
    $('planner-generate').hidden = state.wizardStep !== 3;
    $('planner-setup-status').textContent = '';
    if (state.wizardStep === 3) updatePreview();
    $('planner-wizard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function validateStep(step) {
    if (step === 1) {
      state.draft.username = String($('planner-username').value || '').trim().toLowerCase();
      if (!/^[a-z0-9][a-z0-9_-]{2,23}$/.test(state.draft.username)) return tx('invalidUsername');
      if (!state.draft.studentType) return tx('selectStudent');
      if (state.draft.studentType === 'cepreuni' && !state.draft.cepreCycle) return tx('selectCycle');
      if (state.draft.studentType === 'academy') {
        if (state.draft.academyName === 'Otra academia') state.draft.customAcademy = String($('custom-academy').value || '').trim();
        if (!state.draft.academyName || (state.draft.academyName === 'Otra academia' && !state.draft.customAcademy)) return tx('selectAcademy');
      }
    }
    if (step === 2 && (!state.draft.shift || !state.draft.focus)) return tx('selectShiftFocus');
    if (step === 3) {
      state.draft.startDate = $('planner-start-date').value;
      state.draft.endDate = $('planner-end-date').value;
      if (!state.draft.startDate || !state.draft.endDate || state.draft.endDate <= state.draft.startDate) return tx('invalidDates');
    }
    return '';
  }

  function updateEndDate(mode) {
    state.draft.endMode = mode;
    if (mode === 'cepre-final') state.draft.endDate = CEPRE_PLAN_END;
    if (mode === 'admission') state.draft.endDate = ADMISSION_PLAN_END;
    $('planner-end-date').value = state.draft.endDate;
    selectButtons('[data-end-mode]', mode, 'data-end-mode');
    updatePreview();
  }

  function countStudyDays(start, end) {
    var count = 0;
    for (var date = parseDate(start), finish = parseDate(end); date <= finish; date = addDays(date, 1)) if (date.getDay() !== 0) count += 1;
    return count;
  }

  function updatePreview() {
    if (!$('planner-preview')) return;
    var start = $('planner-start-date').value || state.draft.startDate;
    var end = $('planner-end-date').value || state.draft.endDate;
    if (!start || !end || end <= start) { $('planner-preview').innerHTML = ''; return; }
    var days = countStudyDays(start, end);
    var sessions = Math.max(0, days * 4 - Math.floor(days / 6));
    var weeks = Math.max(1, Math.ceil((daysBetween(start, end) + 1) / 7));
    var minutes = (TIME_BLOCKS[state.draft.shift || 'morning'] || TIME_BLOCKS.morning).reduce(function (sum, block) { return sum + minutesBetween(block[0], block[1]); }, 0);
    var hours = Math.round((minutes * days / 60) * 10) / 10;
    var sourceTopics = admissionEntries().length;
    $('planner-preview').innerHTML = [
      [weeks, tx('weeks')], [sessions, tx('sessions')], [hours, tx('hours')], [sourceTopics, tx('topicsScheduled')]
    ].map(function (item) { return '<div><small>' + safe(item[1]) + '</small><strong>' + safe(item[0]) + '</strong></div>'; }).join('');
  }

  function admissionEntries() {
    var grouped = { 'Matemática': [], 'Ciencias': [], 'Humanidades': [] };
    (DATA.admission || []).forEach(function (course) {
      (course.topics || []).forEach(function (topic) {
        grouped[course.area] = grouped[course.area] || [];
        grouped[course.area].push({ course: course.name, area: course.area, topic: topic.title, detail: topic.detail, source: 'Admisión UNI 2027-1' });
      });
    });
    return interleaveCourses(grouped);
  }

  function interleaveCourses(grouped) {
    var result = {};
    Object.keys(grouped).forEach(function (area) {
      var byCourse = {};
      grouped[area].forEach(function (entry) { (byCourse[entry.course] = byCourse[entry.course] || []).push(entry); });
      var courses = Object.keys(byCourse), output = [], index = 0, remaining = true;
      while (remaining) {
        remaining = false;
        courses.forEach(function (course) { if (byCourse[course][index]) { output.push(byCourse[course][index]); remaining = true; } });
        index += 1;
      }
      result[area] = output;
    });
    return result;
  }

  function cepreWeekEntries(week) {
    var row = (DATA.cepre || []).find(function (item) { return Number(item.week) === week; });
    var grouped = { 'Matemática': [], 'Ciencias': [], 'Humanidades': [] };
    (row && row.topics || []).forEach(function (topic) {
      grouped[topic.area] = grouped[topic.area] || [];
      grouped[topic.area].push({ course: topic.course, area: topic.area, topic: topic.title, detail: topic.detail, source: 'CEPREUNI 2027-1 · Semana ' + week });
    });
    return grouped;
  }

  function evaluationEvents(profile) {
    if (!(profile.studentType === 'cepreuni' && profile.cepreCycle === 'preuniversitario')) return [];
    var events = [];
    (DATA.evaluations || []).forEach(function (evaluation, index) {
      var endWeek = Number((evaluation.range || [0, 0])[1]) || 0;
      var date = addDays(parseDate(CYCLE_START), endWeek * 7 - 1);
      if (/EXAMEN FINAL/i.test(evaluation.name)) date = parseDate(CEPRE_FINAL);
      events.push({
        id: 'assessment_' + (index + 1), date: localDate(date), start: '09:00', end: '12:00',
        course: 'CEPREUNI 2027-1', area: 'General', topic: evaluation.name,
        type: 'exam', status: 'pending', source: 'Hito de planificación', assessment: evaluation.name
      });
    });
    return events;
  }

  function buildSchedule(profile) {
    var events = [];
    var blocks = TIME_BLOCKS[profile.shift] || TIME_BLOCKS.morning;
    var admission = admissionEntries(), cursors = { 'Matemática': 0, 'Ciencias': 0, 'Humanidades': 0 };
    var weights = { 'Matemática': 1, 'Ciencias': 1, 'Humanidades': 1 };
    if (profile.focus === 'math') weights.Matemática = 2;
    if (profile.focus === 'science') weights.Ciencias = 2;
    if (profile.focus === 'humanities') weights.Humanidades = 2;
    var admissionCounts = { 'Matemática': 0, 'Ciencias': 0, 'Humanidades': 0 };
    var weekCursors = {}, weekCounts = {}, cycleStart = parseDate(CYCLE_START);
    for (var day = parseDate(profile.startDate), finish = parseDate(profile.endDate); day <= finish; day = addDays(day, 1)) {
      if (day.getDay() === 0) continue;
      var dateKey = localDate(day), blockCount = day.getDay() === 6 ? 3 : 4;
      var useCepre = profile.studentType === 'cepreuni' && profile.cepreCycle === 'preuniversitario';
      var week = Math.floor((day - cycleStart) / (7 * 86400000)) + 1;
      var weekly = useCepre && week >= 1 && week <= 20 ? cepreWeekEntries(week) : null;
      weekCursors[week] = weekCursors[week] || { 'Matemática': 0, 'Ciencias': 0, 'Humanidades': 0 };
      weekCounts[week] = weekCounts[week] || { 'Matemática': 0, 'Ciencias': 0, 'Humanidades': 0 };
      for (var slot = 0; slot < blockCount; slot += 1) {
        var currentCursors = weekly ? weekCursors[week] : cursors;
        var currentCounts = weekly ? weekCounts[week] : admissionCounts;
        var currentPools = weekly ? weekly : admission;
        var availableAreas = ['Matemática', 'Ciencias', 'Humanidades'].filter(function (candidate) {
          return currentPools[candidate] && currentPools[candidate].length;
        });
        var areasWithNewTopics = availableAreas.filter(function (candidate) { return (currentCursors[candidate] || 0) < currentPools[candidate].length; });
        var candidates = areasWithNewTopics.length ? areasWithNewTopics : availableAreas;
        var area = candidates.sort(function (left, right) {
          var balance = ((currentCounts[left] || 0) / weights[left]) - ((currentCounts[right] || 0) / weights[right]);
          if (balance) return balance;
          return currentPools[right].length - currentPools[left].length;
        })[0] || 'General';
        var pool = currentPools[area];
        if (!pool || !pool.length) continue;
        var cursorStore = currentCursors;
        var cursor = cursorStore[area] || 0, entry = pool[cursor % pool.length], repeated = cursor >= pool.length;
        cursorStore[area] = cursor + 1;
        currentCounts[area] = (currentCounts[area] || 0) + 1;
        events.push({
          id: uid('study'), date: dateKey, start: blocks[slot][0], end: blocks[slot][1],
          course: entry.course, area: entry.area, topic: (repeated ? (state.language === 'en' ? 'Review: ' : 'Repaso: ') : '') + entry.topic,
          type: repeated ? 'review' : 'study', status: 'pending', source: entry.source, assessment: ''
        });
      }
    }
    var assessmentEnd = profile.endMode === 'cepre-final' ? CEPRE_FINAL : profile.endDate;
    evaluationEvents(profile).forEach(function (event) {
      if (event.date >= profile.startDate && event.date <= assessmentEnd) events.push(event);
    });
    return events.sort(sortEvents);
  }

  function sortEvents(a, b) { return (a.date + a.start).localeCompare(b.date + b.start); }

  async function ensureCommunityProfile() {
    var username = state.community && state.community.username;
    if (username) return;
    var academy = state.draft.academyName === 'Otra academia' ? state.draft.customAcademy : state.draft.academyName;
    var result = await communityApi('/onboarding', 'POST', {
      username: state.draft.username,
      displayName: state.user.name || state.draft.username,
      target: 'UNI',
      bio: '', avatar: state.user.avatar || '', profileVisibility: 'public',
      showAvatar: true, showAcademy: true, showCycle: true, showTarget: true,
      academicTrack: state.draft.studentType,
      academyName: state.draft.studentType === 'academy' ? academy : '',
      cepreCycle: state.draft.studentType === 'cepreuni' ? '2027-1' : ''
    });
    state.community = result.profile || { username: state.draft.username };
  }

  function cachePlanner() { try { localStorage.setItem(CACHE_KEY, JSON.stringify(state.planner)); } catch (_) {} }
  function loadCachedPlanner() { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch (_) { return null; } }

  async function savePlanner(immediate) {
    if (!state.planner) return;
    state.planner.updatedAt = Date.now();
    cachePlanner();
    clearTimeout(state.saveTimer);
    var run = async function () {
      try {
        var response = await api('/planner', 'PUT', state.planner);
        if (response.planner) state.planner = response.planner;
        document.documentElement.dataset.plannerSync = 'ok';
      } catch (error) {
        document.documentElement.dataset.plannerSync = 'local';
      }
    };
    if (immediate) return run();
    state.saveTimer = setTimeout(run, 650);
  }

  async function generatePlanner(event) {
    event.preventDefault();
    var error = validateStep(3);
    if (error) { $('planner-setup-status').textContent = error; return; }
    $('planner-generate').disabled = true;
    $('planner-setup-status').textContent = state.language === 'en' ? 'Building your route…' : 'Creando tu ruta…';
    try {
      await ensureCommunityProfile();
      var academy = state.draft.academyName === 'Otra academia' ? state.draft.customAcademy : state.draft.academyName;
      var profile = {
        username: state.draft.username,
        studentType: state.draft.studentType,
        cepreCycle: state.draft.studentType === 'cepreuni' ? state.draft.cepreCycle : '',
        academyName: state.draft.studentType === 'academy' ? academy : '',
        shift: state.draft.shift, focus: state.draft.focus,
        startDate: state.draft.startDate, endMode: state.draft.endMode, endDate: state.draft.endDate
      };
      state.planner = { version: 1, profile: profile, settings: { technique: '50-10', notifications: false, view: 'week' }, events: buildSchedule(profile), createdAt: Date.now(), updatedAt: Date.now() };
      state.view = 'week';
      state.calendarDate = startOfWeek(parseDate(profile.startDate));
      await savePlanner(true);
      showDashboard();
    } catch (failure) {
      var message = failure.message === 'username_taken' ? (state.language === 'en' ? 'That username is already taken.' : 'Ese nombre de usuario ya está en uso.') : (state.language === 'en' ? 'We could not create the plan. Try again.' : 'No se pudo crear el plan. Inténtalo nuevamente.');
      $('planner-setup-status').textContent = message;
    } finally { $('planner-generate').disabled = false; }
  }

  function describeProfile(profile) {
    if (profile.studentType === 'cepreuni') {
      var cycleNames = state.language === 'en'
        ? { preuniversitario: 'Pre-university cycle', basico: 'Foundation cycle', i: 'Cycle I', ien: 'Cycle I' }
        : { preuniversitario: 'Ciclo preuniversitario', basico: 'Ciclo básico', i: 'Ciclo I', ien: 'Ciclo I' };
      return 'CEPREUNI 2027-1 · ' + (cycleNames[profile.cepreCycle] || '');
    }
    if (profile.studentType === 'academy') return profile.academyName + (state.language === 'en' ? ' · UNI Admission 2027-1' : ' · Admisión UNI 2027-1');
    return state.language === 'en' ? 'Self-study · UNI 2027-1' : 'Autodidacta · Admisión UNI 2027-1';
  }

  function showDashboard() {
    $('planner-auth').hidden = true;
    $('planner-wizard').hidden = true;
    $('planner-dashboard').hidden = false;
    state.view = state.planner.settings && state.planner.settings.view || 'week';
    setTechnique(state.planner.settings && state.planner.settings.technique || '50-10', false);
    renderDashboard();
    checkNotifications();
  }

  function showWizard() {
    $('planner-auth').hidden = true;
    $('planner-dashboard').hidden = true;
    $('planner-wizard').hidden = false;
    state.profileSubview = '';
    configureWizardFromDraft();
    setWizardStep(1);
  }

  function renderDashboard() {
    if (!state.planner) return;
    var profile = state.planner.profile;
    $('planner-profile-name').textContent = '@' + profile.username;
    $('planner-profile-path').textContent = describeProfile(profile);
    $('planner-avatar').textContent = (profile.username || 'U').charAt(0).toUpperCase();
    $('planner-today-date').textContent = new Date().toLocaleDateString(state.language === 'en' ? 'en-US' : 'es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
    qa('[data-calendar-view]').forEach(function (button) { button.classList.toggle('active', button.dataset.calendarView === state.view); });
    renderCalendar();
    renderToday();
    renderProgress();
    var technique = state.planner.settings && state.planner.settings.technique || '50-10';
    $('planner-technique-label').textContent = technique.replace('-', ' min + ') + ' min';
    var notifications = state.planner.settings && state.planner.settings.notifications && window.Notification && Notification.permission === 'granted';
    $('planner-notification-label').textContent = notifications ? tx('notificationsOn') : tx('notificationsOff');
    $('planner-enable-notifications').textContent = notifications ? (state.language === 'en' ? 'Enabled' : 'Activo') : (state.language === 'en' ? 'Enable' : 'Activar');
  }

  function eventsOn(date) { return (state.planner.events || []).filter(function (event) { return event.date === date; }).sort(sortEvents); }
  function renderToday() {
    var events = eventsOn(localDate(new Date()));
    $('planner-today-list').innerHTML = events.length ? events.slice(0, 5).map(function (event) {
      return '<div class="planner-today-item"><i style="background:' + areaColor(event.area, event.type) + '"></i><div><b>' + safe(event.start + ' · ' + event.course) + '</b><small>' + safe(event.topic) + '</small></div></div>';
    }).join('') : '<p class="planner-today-empty">' + safe(tx('noSessions')) + '</p>';
  }

  function renderProgress() {
    var trackable = (state.planner.events || []).filter(function (event) { return event.type !== 'exam'; });
    var done = trackable.filter(function (event) { return event.status === 'done'; }).length;
    var percent = trackable.length ? Math.round(done * 100 / trackable.length) : 0;
    $('planner-progress-value').textContent = percent + '%';
    $('planner-progress-bar').style.width = percent + '%';
    $('planner-progress-copy').textContent = tx('completedOf', { done: done, total: trackable.length });
  }

  function areaColor(area, type) { if (type === 'exam') return '#f2ad36'; if (area === 'Ciencias') return '#20b981'; if (area === 'Humanidades') return '#f0525f'; return '#2776f5'; }
  function eventMarkup(event, month) {
    var classes = (month ? 'planner-month-event' : 'planner-event') + (event.type === 'exam' ? ' exam' : '') + (event.status === 'done' ? ' done' : '');
    if (month) return '<button class="' + classes + '" data-event-id="' + safe(event.id) + '" data-area="' + safe(event.area) + '" type="button">' + safe(event.start + ' ' + event.course) + '</button>';
    return '<button class="' + classes + '" data-event-id="' + safe(event.id) + '" data-area="' + safe(event.area) + '" type="button"><time>' + safe(event.start + '—' + event.end) + '</time><strong>' + safe(event.topic) + '</strong><small>' + safe(event.course) + '</small></button>';
  }

  function bindEventCards() { qa('[data-event-id]', $('planner-calendar')).forEach(function (button) { button.onclick = function () { openEventDialog(button.dataset.eventId); }; }); }

  function renderCalendar() {
    if (state.view === 'month') renderMonth(); else renderWeek();
    bindEventCards();
  }

  function renderWeek() {
    var start = startOfWeek(state.calendarDate), today = localDate(new Date());
    var end = addDays(start, 6);
    $('planner-period-title').textContent = start.toLocaleDateString(state.language === 'en' ? 'en-US' : 'es-PE', { day: 'numeric', month: 'short' }) + ' — ' + end.toLocaleDateString(state.language === 'en' ? 'en-US' : 'es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
    var days = [];
    for (var index = 0; index < 7; index += 1) {
      var date = addDays(start, index), key = localDate(date), events = eventsOn(key);
      days.push('<section class="planner-day' + (key === today ? ' today' : '') + '"><header class="planner-day-head"><span>' + safe(date.toLocaleDateString(state.language === 'en' ? 'en-US' : 'es-PE', { weekday: 'short' })) + '</span><b>' + date.getDate() + '</b></header><div class="planner-day-events">' + events.map(function (event) { return eventMarkup(event, false); }).join('') + '</div></section>');
    }
    $('planner-calendar').innerHTML = '<div class="planner-week">' + days.join('') + '</div>';
  }

  function renderMonth() {
    var base = new Date(state.calendarDate.getFullYear(), state.calendarDate.getMonth(), 1, 12), first = startOfWeek(base), today = localDate(new Date());
    $('planner-period-title').textContent = base.toLocaleDateString(state.language === 'en' ? 'en-US' : 'es-PE', { month: 'long', year: 'numeric' });
    var labels = [], cells = [];
    for (var w = 0; w < 7; w += 1) labels.push('<div class="planner-month-weekday">' + safe(addDays(first, w).toLocaleDateString(state.language === 'en' ? 'en-US' : 'es-PE', { weekday: 'short' })) + '</div>');
    for (var index = 0; index < 42; index += 1) {
      var date = addDays(first, index), key = localDate(date), events = eventsOn(key);
      cells.push('<section class="planner-month-day' + (date.getMonth() !== base.getMonth() ? ' outside' : '') + (key === today ? ' today' : '') + '"><b>' + date.getDate() + '</b><div class="planner-month-events">' + events.slice(0, 3).map(function (event) { return eventMarkup(event, true); }).join('') + (events.length > 3 ? '<span class="planner-month-more">+' + (events.length - 3) + '</span>' : '') + '</div></section>');
    }
    $('planner-calendar').innerHTML = '<div class="planner-month">' + labels.join('') + cells.join('') + '</div>';
  }

  function openEventDialog(eventId, date) {
    var event = eventId ? (state.planner.events || []).find(function (item) { return item.id === eventId; }) : null;
    $('planner-event-id').value = event ? event.id : '';
    $('planner-event-date').value = event ? event.date : (date || localDate(state.calendarDate));
    $('planner-event-start').value = event ? event.start : (TIME_BLOCKS[state.planner.profile.shift] || TIME_BLOCKS.morning)[0][0];
    $('planner-event-end').value = event ? event.end : (TIME_BLOCKS[state.planner.profile.shift] || TIME_BLOCKS.morning)[0][1];
    $('planner-event-area').value = event ? event.area : 'Matemática';
    $('planner-event-course').value = event ? event.course : '';
    $('planner-event-topic').value = event ? event.topic : '';
    $('planner-delete-event').hidden = !event;
    $('planner-complete-event').hidden = !event || event.type === 'exam';
    $('planner-complete-event').textContent = event && event.status === 'done' ? tx('markPending') : tx('markDone');
    $('planner-event-dialog').showModal();
  }

  function saveEvent() {
    var id = $('planner-event-id').value, existing = id && state.planner.events.find(function (event) { return event.id === id; });
    var event = {
      id: id || uid('custom'), date: $('planner-event-date').value, start: $('planner-event-start').value, end: $('planner-event-end').value,
      area: $('planner-event-area').value, course: $('planner-event-course').value.trim(), topic: $('planner-event-topic').value.trim(),
      type: existing ? existing.type : 'custom', status: existing ? existing.status : 'pending', source: existing ? existing.source : 'Bloque personal', assessment: existing ? existing.assessment : ''
    };
    if (!event.date || !event.start || !event.end || event.end <= event.start || !event.course || !event.topic) return;
    if (existing) Object.assign(existing, event); else state.planner.events.push(event);
    state.planner.events.sort(sortEvents);
    $('planner-event-dialog').close();
    savePlanner(); renderDashboard();
  }

  function deleteEvent() {
    var id = $('planner-event-id').value;
    state.planner.events = state.planner.events.filter(function (event) { return event.id !== id; });
    $('planner-event-dialog').close(); savePlanner(); renderDashboard();
  }

  function toggleEventDone() {
    var id = $('planner-event-id').value, event = state.planner.events.find(function (item) { return item.id === id; });
    if (!event) return;
    event.status = event.status === 'done' ? 'pending' : 'done';
    $('planner-event-dialog').close(); savePlanner(); renderDashboard();
  }

  async function enableNotifications() {
    if (!('Notification' in window)) { $('planner-notification-label').textContent = state.language === 'en' ? 'Not supported in this browser' : 'Tu navegador no admite notificaciones'; return; }
    var permission = await Notification.requestPermission();
    state.planner.settings.notifications = permission === 'granted';
    savePlanner(); renderDashboard();
    if (permission === 'granted') new Notification('Universe to Study', { body: tx('pageOpenNotice'), icon: '/favicon-192.png' });
  }

  function checkNotifications() {
    if (!(state.planner && state.planner.settings.notifications && window.Notification && Notification.permission === 'granted')) return;
    var now = new Date(), date = localDate(now), current = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    eventsOn(date).forEach(function (event) {
      if (event.start !== current) return;
      var key = 'universe_planner_notified_' + event.id + '_' + date;
      try { if (localStorage.getItem(key)) return; localStorage.setItem(key, '1'); } catch (_) {}
      new Notification(event.course + ' · ' + event.start, { body: event.topic, icon: '/favicon-192.png', tag: event.id });
    });
  }

  function exportCalendar() {
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Universe to Study//Planificador//ES', 'CALSCALE:GREGORIAN'];
    (state.planner.events || []).forEach(function (event) {
      function stamp(date, time) { return date.replace(/-/g, '') + 'T' + time.replace(':', '') + '00'; }
      lines.push('BEGIN:VEVENT', 'UID:' + event.id + '@universetostudy.com', 'DTSTART:' + stamp(event.date, event.start), 'DTEND:' + stamp(event.date, event.end), 'SUMMARY:' + ics(event.course + ': ' + event.topic), 'DESCRIPTION:' + ics(event.source || ''), 'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' }), link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = 'plan-universe-' + state.planner.profile.startDate + '.ics'; link.click();
    setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
  }
  function ics(value) { return String(value || '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n'); }

  function setTechnique(value, save) {
    var parts = value.split('-').map(Number);
    state.timer.technique = value; state.timer.phase = 'focus'; state.timer.running = false;
    clearInterval(state.timer.interval); state.timer.remaining = parts[0] * 60; state.timer.total = parts[0] * 60;
    if (state.planner) { state.planner.settings.technique = value; if (save !== false) savePlanner(); }
    qa('[data-technique]').forEach(function (button) { button.classList.toggle('selected', button.dataset.technique === value); });
    updateTimerUI();
  }

  function updateTimerUI() {
    if (!$('planner-timer-clock')) return;
    var minutes = Math.floor(state.timer.remaining / 60), seconds = state.timer.remaining % 60;
    $('planner-timer-clock').textContent = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    $('planner-timer-phase').textContent = state.timer.phase === 'focus' ? tx('focus') : tx('break');
    $('planner-timer-toggle').textContent = state.timer.running ? tx('pauseTimer') : tx('startTimer');
    var offset = 326.73 * (1 - state.timer.remaining / Math.max(1, state.timer.total));
    $('planner-timer-progress').style.strokeDashoffset = String(offset);
  }

  function timerTick() {
    if (state.timer.remaining > 0) { state.timer.remaining -= 1; updateTimerUI(); return; }
    var parts = state.timer.technique.split('-').map(Number), wasFocus = state.timer.phase === 'focus';
    state.timer.phase = wasFocus ? 'break' : 'focus';
    state.timer.total = (wasFocus ? parts[1] : parts[0]) * 60; state.timer.remaining = state.timer.total;
    if (window.Notification && Notification.permission === 'granted') new Notification('Universe to Study', { body: wasFocus ? tx('timerFinished') : tx('breakFinished'), icon: '/favicon-192.png' });
    updateTimerUI();
  }

  function toggleTimer() {
    state.timer.running = !state.timer.running;
    clearInterval(state.timer.interval);
    if (state.timer.running) state.timer.interval = setInterval(timerTick, 1000);
    updateTimerUI();
  }

  function bindEvents() {
    $('planner-login').onclick = enterWithGoogle;
    $('planner-credentials').onsubmit = submitUniverseCredentials;
    qa('[data-auth-mode]').forEach(function (button) { button.onclick = function () { state.authMode = button.dataset.authMode; updateAuthMode(); }; });
    qa('[data-student-type]').forEach(function (button) { button.onclick = function () {
      state.draft.studentType = button.dataset.studentType;
      if (state.draft.studentType !== 'cepreuni') state.draft.cepreCycle = '';
      if (state.draft.studentType === 'cepreuni' && state.draft.cepreCycle === 'preuniversitario') { state.draft.startDate = CYCLE_START; state.draft.endMode = 'cepre-final'; state.draft.endDate = CEPRE_PLAN_END; }
      state.profileSubview = state.draft.studentType === 'cepreuni' ? 'cepreuni' : (state.draft.studentType === 'academy' ? 'academy' : '');
      configureWizardFromDraft();
      if (state.draft.studentType === 'independent') advanceFromProfileChoice();
    }; });
    qa('[data-cepre-cycle]').forEach(function (button) { button.onclick = function () {
      state.draft.cepreCycle = button.dataset.cepreCycle;
      if (state.draft.cepreCycle === 'preuniversitario') { state.draft.startDate = CYCLE_START; state.draft.endMode = 'cepre-final'; state.draft.endDate = CEPRE_PLAN_END; }
      else { state.draft.endMode = 'admission'; state.draft.endDate = ADMISSION_PLAN_END; }
      configureWizardFromDraft();
      advanceFromProfileChoice();
    }; });
    qa('[data-profile-choice-back]').forEach(function (button) { button.onclick = returnToStudentTypes; });
    $('academy-search').oninput = function () { renderAcademies(this.value); };
    qa('[data-shift]').forEach(function (button) { button.onclick = function () { state.draft.shift = button.dataset.shift; selectButtons('[data-shift]', state.draft.shift, 'data-shift'); updatePreview(); }; });
    qa('[data-focus]').forEach(function (button) { button.onclick = function () { state.draft.focus = button.dataset.focus; selectButtons('[data-focus]', state.draft.focus, 'data-focus'); updatePreview(); }; });
    qa('[data-end-mode]').forEach(function (button) { button.onclick = function () { updateEndDate(button.dataset.endMode); }; });
    $('planner-start-date').onchange = updatePreview;
    $('planner-end-date').onchange = function () { state.draft.endDate = this.value; updatePreview(); };
    $('planner-next').onclick = function () { var error = validateStep(state.wizardStep); if (error) { $('planner-setup-status').textContent = error; return; } setWizardStep(state.wizardStep + 1); };
    $('planner-back').onclick = function () { setWizardStep(state.wizardStep - 1); };
    $('planner-setup-form').onsubmit = generatePlanner;
    qa('[data-calendar-view]').forEach(function (button) { button.onclick = function () { state.view = button.dataset.calendarView; state.planner.settings.view = state.view; savePlanner(); renderDashboard(); }; });
    $('planner-prev').onclick = function () { state.calendarDate = state.view === 'month' ? new Date(state.calendarDate.getFullYear(), state.calendarDate.getMonth() - 1, 1, 12) : addDays(state.calendarDate, -7); renderCalendar(); };
    $('planner-next-period').onclick = function () { state.calendarDate = state.view === 'month' ? new Date(state.calendarDate.getFullYear(), state.calendarDate.getMonth() + 1, 1, 12) : addDays(state.calendarDate, 7); renderCalendar(); };
    $('planner-today').onclick = function () { state.calendarDate = state.view === 'month' ? new Date() : startOfWeek(new Date()); renderCalendar(); };
    $('planner-add-event').onclick = function () { openEventDialog('', localDate(state.calendarDate)); };
    $('planner-save-event').onclick = saveEvent;
    $('planner-delete-event').onclick = deleteEvent;
    $('planner-complete-event').onclick = toggleEventDone;
    $('planner-enable-notifications').onclick = enableNotifications;
    $('planner-export').onclick = exportCalendar;
    $('planner-reconfigure').onclick = function () {
      if (!confirm(tx('confirmReset'))) return;
      state.draft = Object.assign({}, state.planner.profile);
      state.draft.customAcademy = '';
      if (state.draft.academyName && !ACADEMIES.includes(state.draft.academyName)) { state.draft.customAcademy = state.draft.academyName; state.draft.academyName = 'Otra academia'; }
      showWizard();
    };
    $('planner-open-techniques').onclick = function () { $('planner-technique-dialog').showModal(); };
    qa('[data-technique]').forEach(function (button) { button.onclick = function () { setTechnique(button.dataset.technique, true); }; });
    $('planner-timer-toggle').onclick = toggleTimer;
    $('planner-timer-reset').onclick = function () { setTechnique(state.timer.technique, false); };
    window.addEventListener('universe:languagechange', applyLanguage);
    window.addEventListener('universe-google-auth', function () { setTimeout(checkAuth, 80); });
    setInterval(checkNotifications, 30000);
  }

  async function checkAuth() {
    if (!window.UniverseGoogleAuth) return;
    if (UniverseGoogleAuth.refresh) await UniverseGoogleAuth.refresh().catch(function () {});
    state.user = UniverseGoogleAuth.user && UniverseGoogleAuth.user();
    var token = '';
    try { token = localStorage.getItem(TOKEN_KEY) || ''; } catch (_) {}
    if (!state.user || !token || state.user.secureSession !== true || !['google', 'universe'].includes(state.user.provider)) {
      $('planner-auth').hidden = false; $('planner-wizard').hidden = true; $('planner-dashboard').hidden = true; return;
    }
    $('planner-welcome').textContent = (state.language === 'en' ? 'Hi, ' : 'Hola, ') + (state.user.name || 'Universe') + '.';
    var results = await Promise.all([
      api('/planner', 'GET').catch(function () { return null; }),
      communityApi('/me', 'GET').catch(function () { return null; })
    ]);
    state.community = results[1] && results[1].profile || null;
    var remote = results[0] && results[0].planner, cached = loadCachedPlanner();
    state.planner = remote || cached;
    if (state.planner && state.planner.profile && state.planner.events) {
      cachePlanner();
      state.calendarDate = startOfWeek(new Date());
      showDashboard();
      return;
    }
    state.draft.username = state.community && state.community.username || (state.user.provider === 'universe' ? state.user.name : '');
    $('planner-username').disabled = false;
    showWizard();
  }

  function boot() {
    bindEvents();
    configureWizardFromDraft();
    applyLanguage();
    var attempts = 0, wait = setInterval(function () {
      attempts += 1;
      if (window.UniverseGoogleAuth) { clearInterval(wait); checkAuth(); }
      else if (attempts > 80) clearInterval(wait);
    }, 100);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
