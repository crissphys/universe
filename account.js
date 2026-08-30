(function () {
  var API_BASE = '/api/site';
  var AUTH_TOKEN_KEY = 'universe_auth_token';
  var CURRENT_CEPRE_CYCLE = '2027-1';
  var VERIFIED_CEPRE_CYCLE = '2026-2';
  var CEPRE_CYCLES = ['2027-2', '2027-1', '2026-2', '2026-1', '2025-2', '2025-1', '2024-2', '2024-1', '2023-2', '2023-1', '2022-2', '2022-1', '2021-2', '2021-1'];
  var ACADEMIES = ['Pitágoras', 'César Vallejo', 'ADUNI', 'Trilce', 'Pamer', 'Exclusiva UNI', 'ASEUNI', 'ADCUNI', 'Academia Ingeniería', 'Formación UNI', 'Aula 20', 'ACUNI', 'Grupo Ciencias', 'Vonex', 'Saco Oliveros', 'Savia', 'Integral Class', 'Academia Prisma', 'Academia Euclides', 'Academia Apolo', 'Academia Mendel', 'Otra academia'];
  var INTENT_LABELS = {
    offering: 'Dispuesto/a a apoyar',
    seeking: 'Buscando material',
    both: 'Apoya y busca material',
    networking: 'Aquí para estudiar y conocer personas'
  };
  var state = {
    user: null,
    profile: null,
    community: null,
    communityAvatar: '',
    communityDirty: false,
    profileLoading: false,
    secureSessionRefreshed: false,
    public: {},
    reports: [],
    announcementImages: [],
    extraEvents: []
  };

  function $(id) { return document.getElementById(id); }
  function cleanId(v) { return String(v || '').replace(/[^a-zA-Z0-9_-]/g, ''); }
  function normalizeCode(v) { return String(v || '').trim().toUpperCase().replace(/\s+/g, ''); }
  function safe(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function repairText(value) {
    var text = String(value == null ? '' : value);
    if (window.UniverseTextEncoding && typeof window.UniverseTextEncoding.repair === 'function') {
      return window.UniverseTextEncoding.repair(text);
    }
    if (!/[ÃÂðâ]/.test(text)) return text;
    try {
      var bytes = Uint8Array.from(Array.from(text).map(function (char) { return char.charCodeAt(0); }));
      var decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      return decoded || text;
    } catch (error) { return text; }
  }
  function api(route, method, data) {
    var headers = { 'Content-Type': 'application/json' };
    try {
      var token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) headers.Authorization = 'Bearer ' + token;
    } catch (error) {}
    var opt = { method: method || 'GET', cache: 'no-store', headers: headers };
    if (data !== undefined) opt.body = JSON.stringify(data);
    return fetch(API_BASE + route, opt).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return method === 'DELETE' ? null : r.json();
    });
  }
  function communityApi(route, method, data) {
    var headers = { 'Content-Type': 'application/json' };
    try {
      var token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) headers.Authorization = 'Bearer ' + token;
    } catch (error) {}
    var opt = { method: method || 'GET', cache: 'no-store', headers: headers };
    if (data !== undefined) opt.body = JSON.stringify(data);
    return fetch('/api/unitalk' + route, opt).then(async function (r) {
      var payload = await r.json().catch(function () { return {}; });
      if (!r.ok) {
        var error = new Error(payload.error || 'request_failed');
        error.status = r.status;
        throw error;
      }
      return payload;
    });
  }
  function status(id, msg, type) {
    var el = $(id);
    if (!el) return;
    el.textContent = msg;
    el.className = 'account-status ' + (type || '');
  }
  function user() {
    return window.UniverseGoogleAuth && UniverseGoogleAuth.user ? UniverseGoogleAuth.user() : null;
  }
  function isAdmin() {
    return window.UniverseGoogleAuth && UniverseGoogleAuth.isAdmin && UniverseGoogleAuth.isAdmin();
  }
  function uid() {
    return cleanId(state.user && (state.user.id || state.user.email));
  }
  function toPeruIso(v) { return v ? String(v).slice(0, 16) + ':00-05:00' : ''; }
  function fromIso(v) { return String(v || '').replace(/:00-05:00$/, '').slice(0, 16); }

  function fillSelect(id, list, selected, blank) {
    var el = $(id);
    if (!el) return;
    var html = blank ? '<option value="">' + safe(blank) + '</option>' : '';
    html += list.map(function (item) {
      return '<option value="' + safe(item) + '"' + (item === selected ? ' selected' : '') + '>' + safe(item) + '</option>';
    }).join('');
    el.innerHTML = html;
  }
  function validCodes() {
    return new Set((window.UNIVERSE_CEPRE_VALID_CODES || []).map(normalizeCode));
  }
  function showLogin() {
    $('account-login-card').hidden = false;
    $('account-content').hidden = true;
    $('admin-panel').classList.remove('active');
  }
  function toggleAcademicFields() {
    var track = $('academic-track') ? $('academic-track').value : '';
    var member = track === 'cepreuni';
    var academy = track === 'academy';
    var uniStudent = track === 'uni-student';
    var cycle = $('cepre-cycle') ? $('cepre-cycle').value : CURRENT_CEPRE_CYCLE;
    if ($('cepre-details-wrap')) $('cepre-details-wrap').hidden = !member;
    if ($('academy-wrap')) $('academy-wrap').hidden = !academy;
    if ($('uni-details-wrap')) $('uni-details-wrap').hidden = !uniStudent;
    if ($('cepre-code-wrap')) $('cepre-code-wrap').hidden = !member || cycle !== VERIFIED_CEPRE_CYCLE;
    if ($('community-target') && !$('community-target').value) {
      if (member || uniStudent) $('community-target').value = 'UNI';
      if (track === 'san-marcos') $('community-target').value = 'San Marcos';
    }
    if ($('academic-explain')) {
      $('academic-explain').textContent =
        track === 'cepreuni' ? 'Selecciona el ciclo 2027 o uno anterior y luego indica si perteneces a Básico, PRE, IEN, Intensivo u otra modalidad.' :
        track === 'uni-student' ? 'Indica tu carrera y ciclo actual en la Universidad Nacional de Ingeniería.' :
        track === 'san-marcos' ? 'Guardaremos tu perfil como postulante San Marcos para personalizar temario, simulacros y avisos.' :
        track === 'academy' ? 'Selecciona la academia a la que asistes y el ciclo o modalidad que llevas.' :
        track === 'independent' ? 'Tu perfil mostrará que estudias de forma autodidacta.' :
        'Elige tu perfil académico para personalizar tu experiencia.';
    }
    updateOverview();
  }
  function academicSummary() {
    var track = $('academic-track') ? $('academic-track').value : '';
    if (track === 'cepreuni') return ['CEPREUNI', $('cepre-cycle').value, $('cepre-program').value].filter(Boolean).join(' · ');
    if (track === 'academy') return [$('academy-name').value, $('academy-cycle').value].filter(Boolean).join(' · ') || 'Estudia en una academia';
    if (track === 'uni-student') return ['Estudiante UNI', $('uni-career').value, $('uni-cycle').value].filter(Boolean).join(' · ');
    if (track === 'san-marcos') return 'Postulante a San Marcos';
    if (track === 'independent') return 'Estudiante autodidacta';
    return 'Completa tu situación académica';
  }
  function updateOverview() {
    var fallbackName = repairText([$('profile-first') && $('profile-first').value, $('profile-last') && $('profile-last').value].filter(Boolean).join(' ') || state.user && state.user.name || 'Tu nombre');
    var displayName = $('community-display-name') && $('community-display-name').value.trim() || fallbackName;
    var username = $('community-username') && $('community-username').value.trim().toLowerCase();
    if ($('account-display-name')) $('account-display-name').textContent = displayName || 'Tu nombre';
    if ($('account-display-handle')) $('account-display-handle').textContent = username ? '@' + username : '@usuario';
    if ($('account-academic-summary')) $('account-academic-summary').textContent = academicSummary();
    if ($('account-intent-summary')) $('account-intent-summary').textContent = INTENT_LABELS[$('community-intent') && $('community-intent').value] || 'Indica qué buscas en la comunidad';
  }
  function fillProfile() {
    var u = state.user, p = state.profile || {};
    var parts = repairText(p.googleName || u.name || '').split(/\s+/);
    var firstName = repairText(p.firstName || parts[0] || '');
    var lastName = repairText(p.lastName || parts.slice(1).join(' ') || '');
    $('profile-first').value = firstName;
    $('profile-last').value = lastName;
    $('profile-age').value = p.age || '';
    $('profile-phone').value = p.phone || '';
    $('profile-email').value = u.email || '';
    $('academic-track').value = p.academicTrack || (p.cepreMember || p.cepreCode || p.cepreCycle ? 'cepreuni' : '');
    fillSelect('academy-name', ACADEMIES, p.academyName || '', 'Selecciona academia');
    fillSelect('cepre-cycle', CEPRE_CYCLES, p.cepreCycle || CURRENT_CEPRE_CYCLE);
    $('cepre-program').value = p.cepreProgram || '';
    $('academy-cycle').value = p.academyCycle || '';
    $('uni-career').value = p.uniCareer || '';
    $('uni-cycle').value = p.uniCycle || '';
    var code = normalizeCode(p.cepreCode || '');
    if (code) {
      $('code-current').innerHTML = '<p><span class="code-lock">Código registrado: ' + safe(code) + ' · ' + safe(p.cepreCycle || CURRENT_CEPRE_CYCLE) + '</span></p>';
      $('cepre-code').value = code;
      $('cepre-code').disabled = true;
    } else {
      $('code-current').innerHTML = '';
      $('cepre-code').value = '';
      $('cepre-code').disabled = false;
    }
    toggleAcademicFields();
  }
  function fillCommunity(force) {
    if (state.communityDirty && !force) return;
    var p = state.community || {};
    var fallbackName = repairText([state.profile && state.profile.firstName, state.profile && state.profile.lastName].filter(Boolean).join(' ') || state.user && state.user.name || '');
    $('community-username').value = p.username || '';
    $('community-display-name').value = p.displayName || fallbackName;
    $('community-target').value = p.target || state.profile && state.profile.target || '';
    $('community-intent').value = p.intent || state.profile && state.profile.communityIntent || '';
    $('community-visibility').value = p.profileVisibility || 'public';
    $('community-bio').value = p.bio || '';
    $('community-show-avatar').checked = p.showAvatar !== false;
    $('community-show-academy').checked = p.showAcademy !== false;
    $('community-show-cycle').checked = p.showCycle !== false;
    $('community-show-target').checked = p.showTarget !== false;
    state.communityAvatar = p.avatar || state.user && state.user.avatar || '';
    var avatar = $('community-avatar');
    avatar.innerHTML = state.communityAvatar ? '<img alt="" src="' + safe(state.communityAvatar) + '">' : safe((fallbackName || 'U').charAt(0).toUpperCase());
    updateOverview();
  }
  function communityPayload() {
    return {
      username: $('community-username').value.trim().toLowerCase(),
      displayName: $('community-display-name').value.trim(),
      target: $('community-target').value,
      intent: $('community-intent').value,
      bio: $('community-bio').value.trim(),
      avatar: state.communityAvatar || '',
      profileVisibility: $('community-visibility').value,
      showAvatar: $('community-show-avatar').checked,
      showAcademy: $('community-show-academy').checked,
      showCycle: $('community-show-cycle').checked,
      showTarget: $('community-show-target').checked
    };
  }
  function communityError(error) {
    return {
      invalid_username: 'El nombre de usuario debe tener entre 3 y 24 caracteres y usar solo letras, números, guion o guion bajo.',
      username_taken: 'Ese nombre de usuario ya está siendo utilizado.',
      username_change_wait: 'Por seguridad, el nombre de usuario solo puede cambiarse una vez cada 30 días.',
      academic_track_required: 'Selecciona primero tu tipo de estudiante.',
      academy_required: 'Selecciona tu academia.',
      academy_cycle_required: 'Selecciona el ciclo o modalidad de tu academia.',
      cepre_program_required: 'Selecciona tu modalidad CEPREUNI.',
      uni_career_required: 'Escribe tu carrera UNI.',
      uni_cycle_required: 'Selecciona tu ciclo universitario.',
      community_intent_required: 'Indica qué buscas o cómo quieres apoyar en la comunidad.',
      target_required: 'Selecciona a dónde estás postulando.'
    }[String(error && error.message || '')] || 'No se pudo guardar el perfil. Inténtalo nuevamente.';
  }
  async function loadProfile() {
    if (!window.UniverseGoogleAuth) { setTimeout(loadProfile, 180); return; }
    if (state.profileLoading) return;
    state.profileLoading = true;
    try {
      if (!state.secureSessionRefreshed && UniverseGoogleAuth.refresh) {
        state.secureSessionRefreshed = true;
        await UniverseGoogleAuth.refresh().catch(function () {});
      }
      state.user = user();
      if (!state.user || state.user.provider !== 'google') { showLogin(); return; }
      $('account-login-card').hidden = true;
      $('account-content').hidden = false;
      var results = await Promise.all([
        api('/profiles/' + uid(), 'GET').catch(function () { return null; }),
        communityApi('/me', 'GET').catch(function () { return null; })
      ]);
      state.profile = results[0] || {};
      state.community = results[1] && results[1].profile || null;
      fillProfile();
      fillCommunity();
      if (isAdmin()) { $('admin-panel').classList.add('active'); await loadAdmin(); }
      else $('admin-panel').classList.remove('active');
    } finally {
      state.profileLoading = false;
    }
  }
  function academicPayload() {
    var track = $('academic-track').value;
    return {
      firstName: $('profile-first').value.trim(),
      lastName: $('profile-last').value.trim(),
      age: $('profile-age').value.trim(),
      phone: $('profile-phone').value.trim(),
      academicTrack: track,
      academyName: track === 'academy' ? $('academy-name').value : '',
      academyCycle: track === 'academy' ? $('academy-cycle').value : '',
      cepreMember: track === 'cepreuni',
      cepreCycle: track === 'cepreuni' ? ($('cepre-cycle').value || CURRENT_CEPRE_CYCLE) : '',
      cepreProgram: track === 'cepreuni' ? $('cepre-program').value : '',
      uniCareer: track === 'uni-student' ? $('uni-career').value.trim() : '',
      uniCycle: track === 'uni-student' ? $('uni-cycle').value : '',
      communityIntent: $('community-intent').value,
      target: $('community-target').value,
      onboardingComplete: true,
      email: state.user.email || '',
      googleName: state.user.name || '',
      avatar: state.user.avatar || '',
      updatedAt: Date.now()
    };
  }
  function validateUnifiedProfile(publicData, academicData) {
    if (!/^[a-z0-9][a-z0-9_-]{2,23}$/.test(publicData.username)) return communityError(new Error('invalid_username'));
    if (!publicData.displayName) return 'Escribe el nombre que quieres mostrar en tu perfil.';
    if (!academicData.academicTrack) return 'Selecciona tu situación académica actual.';
    if (academicData.academicTrack === 'academy' && !academicData.academyName) return 'Selecciona la academia a la que asistes.';
    if (academicData.academicTrack === 'academy' && !academicData.academyCycle) return 'Selecciona el ciclo o modalidad de tu academia.';
    if (academicData.academicTrack === 'cepreuni' && !academicData.cepreProgram) return 'Selecciona tu modalidad CEPREUNI: Básico, PRE, IEN, Intensivo u otra.';
    if (academicData.academicTrack === 'uni-student' && !academicData.uniCareer) return 'Escribe la carrera que estudias en la UNI.';
    if (academicData.academicTrack === 'uni-student' && !academicData.uniCycle) return 'Selecciona tu ciclo universitario.';
    if (!academicData.target) return 'Selecciona tu objetivo principal.';
    if (!publicData.intent) return 'Indica si quieres apoyar, buscas material o ambas cosas.';
    return '';
  }
  async function prepareCepreCode(academicData) {
    var existing = normalizeCode(state.profile && state.profile.cepreCode || '');
    if (academicData.academicTrack !== 'cepreuni' || academicData.cepreCycle !== VERIFIED_CEPRE_CYCLE) return null;
    if (existing) return { code: existing, existing: true };
    var code = normalizeCode($('cepre-code').value);
    if (!code) throw new Error('cepre_code_required');
    if (!validCodes().has(code)) throw new Error('cepre_code_invalid');
    var ownerRoute = '/codeOwnersByCycle/' + cleanId(academicData.cepreCycle) + '/' + cleanId(code);
    var owner = await api(ownerRoute, 'GET').catch(function () { return null; });
    var legacy = await api('/codeOwners/' + cleanId(code), 'GET').catch(function () { return null; });
    if ((owner && owner.userId && owner.userId !== uid()) || (legacy && legacy.userId && legacy.userId !== uid())) throw new Error('cepre_code_taken');
    var ok = confirm('Confirma tu código CEPREUNI del ciclo ' + academicData.cepreCycle + ':\n\n' + code + '\n\nQuedará vinculado a ' + (state.user.email || '') + '.');
    if (!ok) throw new Error('save_cancelled');
    return { code: code, ownerRoute: ownerRoute, existing: false };
  }
  async function saveUnifiedProfile() {
    if (!state.user) return;
    var button = document.querySelector('[data-save-unified]');
    var publicData = communityPayload();
    var academicData = academicPayload();
    var validation = validateUnifiedProfile(publicData, academicData);
    if (validation) { unifiedStatus(validation, 'bad'); return; }
    if (button) button.disabled = true;
    unifiedStatus('Guardando tu perfil único...', 'saving');
    try {
      var codeClaim = await prepareCepreCode(academicData);
      if (codeClaim && codeClaim.code) academicData.cepreCode = codeClaim.code;
      var result = await communityApi('/onboarding', 'POST', Object.assign({}, publicData, academicData));
      if (codeClaim && !codeClaim.existing) {
        await api(codeClaim.ownerRoute, 'PUT', { cycle: academicData.cepreCycle });
        await api('/codeOwners/' + cleanId(codeClaim.code), 'PUT', { cycle: academicData.cepreCycle });
      }
      await api('/profiles/' + uid(), 'PATCH', academicData);
      state.profile = Object.assign({}, state.profile || {}, academicData, result.academic || {}, { onboardingComplete: true });
      state.community = Object.assign({}, state.community || {}, publicData, result.profile || {});
      state.communityDirty = false;
      fillProfile();
      fillCommunity(true);
      unifiedStatus('Perfil actualizado. Los cambios ya se usan también en UNITalk.', 'good');
    } catch (error) {
      var message = {
        cepre_code_required: 'Escribe tu código CEPREUNI para el ciclo verificable seleccionado.',
        cepre_code_invalid: 'Ese código no aparece en el padrón CEPREUNI disponible en Universe.',
        cepre_code_taken: 'Ese código CEPREUNI ya está vinculado a otra cuenta.',
        save_cancelled: 'No se realizaron cambios.'
      }[String(error && error.message || '')] || communityError(error);
      unifiedStatus(message, error && error.message === 'save_cancelled' ? 'warn' : 'bad');
    } finally {
      if (button) button.disabled = false;
    }
  }
  async function loadAdmin() {
    var adminData = await Promise.all([
      api('/public', 'GET').catch(function () { return null; }),
      communityApi('/moderation/reports', 'GET').catch(function () { return null; })
    ]);
    state.public = adminData[0] || {};
    state.reports = adminData[1] && adminData[1].reports || [];
    renderReports();
    var a = state.public.announcement || {}, s = state.public.schedule || {}, c = s.countdowns || {};
    $('ann-active').value = String(a.active !== false);
    $('ann-title').value = a.title || '';
    $('ann-text').value = a.text || '';
    state.announcementImages = Array.isArray(a.images) ? a.images.slice() : (a.image ? [a.image] : []);
    $('ann-image-url').value = state.announcementImages.filter(function (src) { return String(src).indexOf('data:') !== 0; }).join('\n');
    renderAnnouncementImages();
    $('final-title').value = (c.final && c.final.title) || 'Examen final CEPREUNI';
    $('final-target').value = fromIso(c.final && c.final.target) || '2026-08-02T09:00';
    $('final-label').value = (c.final && c.final.label) || 'Dom. 2 ago - 9:00 AM';
    $('adm-title').value = (c.admision && c.admision.title) || 'Admisión UNI 2026-2';
    $('adm-target').value = fromIso(c.admision && c.admision.target) || '2026-08-10T09:00';
    $('adm-label').value = (c.admision && c.admision.label) || 'Lun. 10 ago - 9:00 AM';
    state.extraEvents = Array.isArray(s.extraEvents) ? s.extraEvents : [];
    renderEvents();
  }
  function renderReports() {
    var root = $('unitalk-report-list');
    if (!root) return;
    var reports = state.reports.filter(function (report) { return report.status === 'open'; });
    root.innerHTML = reports.length ? reports.map(function (report) {
      return '<div class="admin-event" data-report-id="' + safe(report.id) + '"><div><strong>' + safe(report.targetType || 'Contenido') + ' · ' + safe(report.targetId) + '</strong><br><small>' + safe(report.reason || 'Sin detalle') + ' · ' + new Date(report.createdAt || 0).toLocaleString('es-PE') + '</small></div><div class="account-actions"><button class="account-btn secondary" type="button" data-report-action="reviewed">Atendido</button><button class="account-btn danger" type="button" data-report-action="dismissed">Descartar</button></div></div>';
    }).join('') : '<div class="account-status good">No hay reportes pendientes.</div>';
    root.querySelectorAll('[data-report-action]').forEach(function (button) {
      button.onclick = async function () {
        var row = button.closest('[data-report-id]');
        try {
          await communityApi('/moderation/reports/' + encodeURIComponent(row.dataset.reportId), 'PATCH', { status: button.dataset.reportAction });
          state.reports = state.reports.map(function (report) {
            if (report.id === row.dataset.reportId) report.status = button.dataset.reportAction;
            return report;
          });
          renderReports();
          status('unitalk-report-status', 'Reporte actualizado.', 'good');
        } catch (error) { status('unitalk-report-status', 'No se pudo actualizar el reporte.', 'bad'); }
      };
    });
  }
  function renderEvents() {
    var root = $('event-list');
    root.innerHTML = state.extraEvents.length ? state.extraEvents.map(function (e, i) {
      return '<div class="admin-event"><div><strong>' + safe(e.title) + '</strong><br><small>' + safe(e.date) + (e.endDate ? ' - ' + safe(e.endDate) : '') + ' · ' + safe(e.type || 'evento') + '</small></div><button class="account-btn danger" type="button" data-del-event="' + i + '">Quitar</button></div>';
    }).join('') : '<div class="account-status">No hay eventos extra publicados.</div>';
    root.querySelectorAll('[data-del-event]').forEach(function (btn) {
      btn.onclick = function () { state.extraEvents.splice(Number(btn.dataset.delEvent), 1); renderEvents(); };
    });
  }
  function addEvent() {
    var e = { title: $('ev-title').value.trim(), date: $('ev-date').value, type: $('ev-type').value, detail: $('ev-detail').value.trim() };
    var end = $('ev-end').value;
    if (end) e.endDate = end;
    if (!e.title || !e.date) { status('schedule-status', 'Completa título y fecha del evento.', 'bad'); return; }
    state.extraEvents.push(e);
    ['ev-title', 'ev-date', 'ev-end', 'ev-detail'].forEach(function (id) { $(id).value = ''; });
    renderEvents();
    status('schedule-status', 'Evento agregado. Presiona Guardar fechas para publicarlo.', 'warn');
  }
  function unifiedStatus(msg, type) {
    var el = $('unified-status');
    if (!el) return;
    el.textContent = msg;
    el.dataset.state = type || '';
  }
  function announcementUrls() {
    var value = $('ann-image-url') ? $('ann-image-url').value : '';
    return String(value || '').split(/\r?\n/).map(function (src) { return src.trim(); }).filter(function (src) { return /^https:\/\/[^\s"'<>]+$/i.test(src); });
  }
  function syncAnnouncementUrls() {
    var uploaded = state.announcementImages.filter(function (src) { return String(src).indexOf('data:image/') === 0; });
    state.announcementImages = uploaded.concat(announcementUrls()).filter(function (src, index, list) { return list.indexOf(src) === index; });
  }
  function renderAnnouncementImages() {
    var root = $('ann-preview-gallery');
    if (!root) return;
    root.innerHTML = state.announcementImages.map(function (src, index) {
      return '<figure class="announcement-preview-item"><img src="' + safe(src) + '" alt="Vista previa ' + (index + 1) + '"><button type="button" data-remove-ann-image="' + index + '" aria-label="Quitar imagen ' + (index + 1) + '">×</button></figure>';
    }).join('');
    root.querySelectorAll('[data-remove-ann-image]').forEach(function (button) {
      button.onclick = function () {
        state.announcementImages.splice(Number(button.dataset.removeAnnImage), 1);
        $('ann-image-url').value = state.announcementImages.filter(function (src) { return String(src).indexOf('data:') !== 0; }).join('\n');
        renderAnnouncementImages();
      };
    });
  }
  async function saveAnnouncement() {
    if (!isAdmin()) return;
    syncAnnouncementUrls();
    await api('/public/announcement', 'PUT', { active: $('ann-active').value === 'true', title: $('ann-title').value.trim(), text: $('ann-text').value.trim(), image: state.announcementImages[0] || '', images: state.announcementImages, updatedAt: Date.now(), updatedBy: state.user.email });
    status('ann-status', 'Comunicado publicado correctamente.', 'good');
  }
  async function saveSchedule() {
    if (!isAdmin()) return;
    var data = {
      countdowns: {
        final: { title: $('final-title').value.trim(), target: toPeruIso($('final-target').value), label: $('final-label').value.trim() },
        admision: { title: $('adm-title').value.trim(), target: toPeruIso($('adm-target').value), label: $('adm-label').value.trim() }
      },
      extraEvents: state.extraEvents,
      updatedAt: Date.now(),
      updatedBy: state.user.email
    };
    await api('/public/schedule', 'PUT', data);
    status('schedule-status', 'Fechas y calendario publicados para todos.', 'good');
  }
  function prepareCommunityAvatar(file) {
    if (!file || !/^image\/(?:png|jpeg|webp)$/i.test(file.type)) {
      unifiedStatus('Selecciona una imagen PNG, JPG o WebP.', 'bad');
      return;
    }
    if (file.size > 5000000) {
      unifiedStatus('La imagen original no puede pesar más de 5 MB.', 'bad');
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      var image = new Image();
      image.onload = function () {
        var size = 320;
        var canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        var ctx = canvas.getContext('2d');
        var crop = Math.min(image.naturalWidth, image.naturalHeight);
        var sx = Math.max(0, (image.naturalWidth - crop) / 2);
        var sy = Math.max(0, (image.naturalHeight - crop) / 2);
        ctx.drawImage(image, sx, sy, crop, crop, 0, 0, size, size);
        state.communityAvatar = canvas.toDataURL('image/jpeg', .78);
        $('community-avatar').innerHTML = '<img alt="" src="' + safe(state.communityAvatar) + '">';
        unifiedStatus('Foto preparada. Presiona “Guardar todos los cambios”.', 'warn');
      };
      image.onerror = function () { unifiedStatus('No se pudo leer la imagen.', 'bad'); };
      image.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  }
  function bind() {
    var login = document.querySelector('[data-login]');
    if (login) login.onclick = function () { UniverseGoogleAuth.open({ account: true }); };
    document.querySelector('[data-save-unified]').onclick = saveUnifiedProfile;
    document.querySelector('[data-logout]').onclick = function () {
      if (window.UniverseGoogleAuth) UniverseGoogleAuth.signOut();
      state.user = null; state.profile = null; state.community = null; showLogin();
    };
    ['academic-track', 'academy-name', 'academy-cycle', 'cepre-cycle', 'cepre-program', 'uni-career', 'uni-cycle', 'community-intent', 'community-target'].forEach(function (id) {
      if ($(id)) $(id).addEventListener('change', toggleAcademicFields);
    });
    document.querySelector('[data-save-ann]').onclick = saveAnnouncement;
    document.querySelector('[data-save-schedule]').onclick = saveSchedule;
    document.querySelector('[data-add-event]').onclick = addEvent;
    $('ann-image-url').addEventListener('change', function () { syncAnnouncementUrls(); renderAnnouncementImages(); });
    $('ann-image-file').onchange = function () {
      var input = this;
      var files = Array.from(input.files || []);
      if (!files.length) return;
      var valid = files.filter(function (file) { return /^image\/(?:png|jpeg|webp)$/i.test(file.type) && file.size <= 750000; });
      if (valid.length !== files.length) status('ann-status', 'Se omitieron imágenes inválidas o mayores de 750 KB.', 'bad');
      Promise.all(valid.map(function (file) {
        return new Promise(function (resolve) {
          var reader = new FileReader();
          reader.onload = function () { resolve(String(reader.result || '')); };
          reader.onerror = function () { resolve(''); };
          reader.readAsDataURL(file);
        });
      })).then(function (images) {
        state.announcementImages = state.announcementImages.concat(images.filter(Boolean)).filter(function (src, index, list) { return list.indexOf(src) === index; });
        renderAnnouncementImages();
        if (valid.length === files.length) status('ann-status', valid.length + (valid.length === 1 ? ' imagen añadida.' : ' imágenes añadidas.'), 'good');
      });
      input.value = '';
    };
    $('community-avatar-file').onchange = function () {
      var file = this.files && this.files[0];
      if (file) prepareCommunityAvatar(file);
      this.value = '';
    };
    [
      'community-username',
      'community-display-name',
      'community-target',
      'community-intent',
      'community-visibility',
      'community-bio',
      'profile-first',
      'profile-last',
      'profile-age',
      'profile-phone',
      'academic-track',
      'academy-name',
      'academy-cycle',
      'cepre-cycle',
      'cepre-program',
      'uni-career',
      'uni-cycle',
      'community-show-avatar',
      'community-show-academy',
      'community-show-cycle',
      'community-show-target'
    ].forEach(function (id) {
      if (!$(id)) return;
      $(id).addEventListener('input', function () { state.communityDirty = true; updateOverview(); });
      $(id).addEventListener('change', function () { state.communityDirty = true; updateOverview(); });
    });
    window.addEventListener('universe-google-auth', function () { setTimeout(loadProfile, 80); });
  }
  function boot() { bind(); setTimeout(loadProfile, 350); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
