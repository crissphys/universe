(function () {
  var API_BASE = '/api/site';
  var AUTH_TOKEN_KEY = 'universe_auth_token';
  var CURRENT_CEPRE_CYCLE = '2026-2';
  var CEPRE_CYCLES = ['2026-2', '2026-1', '2025-2', '2025-1', '2024-2', '2024-1', '2023-2', '2023-1', '2022-2', '2022-1', '2021-2', '2021-1'];
  var ACADEMIES = ['Pitágoras', 'César Vallejo', 'ADUNI', 'Trilce', 'Pamer', 'Exclusiva UNI', 'ACUNI', 'Grupo Ciencias', 'Vonex', 'Saco Oliveros', 'Integral Class', 'Academia Prisma', 'Otra academia'];
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
    announcementImage: '',
    extraEvents: []
  };

  function $(id) { return document.getElementById(id); }
  function cleanId(v) { return String(v || '').replace(/[^a-zA-Z0-9_-]/g, ''); }
  function normalizeCode(v) { return String(v || '').trim().toUpperCase().replace(/\s+/g, ''); }
  function safe(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function repairText(value) {
    var text = String(value == null ? '' : value);
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
    var cycle = $('cepre-cycle') ? $('cepre-cycle').value : CURRENT_CEPRE_CYCLE;
    if ($('academy-wrap')) $('academy-wrap').hidden = !academy;
    if ($('cepre-cycle-wrap')) $('cepre-cycle-wrap').hidden = !member;
    if ($('cepre-code-wrap')) $('cepre-code-wrap').hidden = !member || cycle !== CURRENT_CEPRE_CYCLE;
    if ($('academic-explain')) {
      $('academic-explain').textContent =
        track === 'cepreuni' ? 'Si eres del ciclo actual, validaremos que el código exista en el ranking y que no esté usado por otra cuenta.' :
        track === 'uni-student' ? 'Guardaremos tu perfil como estudiante de la Universidad Nacional de Ingeniería.' :
        track === 'san-marcos' ? 'Guardaremos tu perfil como postulante San Marcos para personalizar temario, simulacros y avisos.' :
        track === 'academy' ? 'Selecciona tu academia preuniversitaria para organizar mejor tus recursos.' :
        track === 'independent' ? 'Listo: tu perfil quedará como estudiante autónomo.' :
        'Elige tu perfil académico para personalizar tu experiencia.';
    }
  }
  function fillProfile() {
    var u = state.user, p = state.profile || {};
    var parts = repairText(p.googleName || u.name || '').split(/\s+/);
    var firstName = repairText(p.firstName || parts[0] || '');
    var lastName = repairText(p.lastName || parts.slice(1).join(' ') || '');
    $('account-display-name').textContent = [firstName, lastName].filter(Boolean).join(' ') || 'Usuario';
    $('account-display-email').textContent = u.email || '';
    $('profile-first').value = firstName;
    $('profile-last').value = lastName;
    $('profile-age').value = p.age || '';
    $('profile-phone').value = p.phone || '';
    $('profile-email').value = u.email || '';
    $('academic-track').value = p.academicTrack || (p.cepreMember || p.cepreCode || p.cepreCycle ? 'cepreuni' : '');
    fillSelect('academy-name', ACADEMIES, p.academyName || '', 'Selecciona academia');
    fillSelect('cepre-cycle', CEPRE_CYCLES, p.cepreCycle || CURRENT_CEPRE_CYCLE);
    var avatar = $('account-avatar');
    var avatarSrc = state.community && state.community.avatar || u.avatar || '';
    avatar.innerHTML = avatarSrc ? '<img alt="" src="' + safe(avatarSrc) + '">' : safe((u.name || 'U').charAt(0).toUpperCase());
    var code = normalizeCode(p.cepreCode || '');
    if (code) {
      $('code-current').innerHTML = '<p><span class="code-lock">Código registrado: ' + safe(code) + ' · ' + safe(p.cepreCycle || CURRENT_CEPRE_CYCLE) + '</span></p>';
      $('cepre-code').value = code;
      $('cepre-code').disabled = true;
      status('code-status', 'Tu código ya está vinculado. No se puede cambiar desde esta página.', 'good');
    } else {
      $('code-current').innerHTML = '';
      $('cepre-code').value = '';
      $('cepre-code').disabled = false;
      status('code-status', 'Si eres del ciclo actual, el código se validará antes de guardarse.', 'warn');
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
    $('community-visibility').value = p.profileVisibility || 'public';
    $('community-bio').value = p.bio || '';
    $('community-show-avatar').checked = p.showAvatar !== false;
    $('community-show-academy').checked = p.showAcademy !== false;
    $('community-show-cycle').checked = p.showCycle !== false;
    $('community-show-target').checked = p.showTarget !== false;
    state.communityAvatar = p.avatar || state.user && state.user.avatar || '';
    var avatar = $('community-avatar');
    avatar.innerHTML = state.communityAvatar ? '<img alt="" src="' + safe(state.communityAvatar) + '">' : safe((fallbackName || 'U').charAt(0).toUpperCase());
  }
  function communityPayload() {
    return {
      username: $('community-username').value.trim().toLowerCase(),
      displayName: $('community-display-name').value.trim(),
      target: $('community-target').value,
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
  async function saveProfile() {
    if (!state.user) return;
    var data = {
      firstName: $('profile-first').value.trim(),
      lastName: $('profile-last').value.trim(),
      age: $('profile-age').value.trim(),
      phone: $('profile-phone').value.trim(),
      email: state.user.email || '',
      googleName: state.user.name || '',
      avatar: state.user.avatar || '',
      updatedAt: Date.now()
    };
    await api('/profiles/' + uid(), 'PATCH', data);
    state.profile = Object.assign({}, state.profile || {}, data);
    fillProfile();
    status('profile-status', 'Perfil guardado correctamente.', 'good');
  }
  async function saveAcademicProfile() {
    if (!state.user) return;
    var track = $('academic-track').value;
    var cycle = $('cepre-cycle').value || CURRENT_CEPRE_CYCLE;
    var code = normalizeCode($('cepre-code').value);
    var existing = normalizeCode(state.profile && state.profile.cepreCode || '');
    var data = {
      academicTrack: track,
      academyName: track === 'academy' ? $('academy-name').value : '',
      cepreMember: track === 'cepreuni',
      cepreCycle: track === 'cepreuni' ? cycle : '',
      target: $('community-target').value,
      onboardingComplete: true,
      email: state.user.email || '',
      googleName: state.user.name || '',
      avatar: state.user.avatar || '',
      updatedAt: Date.now()
    };

    if (!track) { status('code-status', 'Elige si eres CEPREUNI, estudiante UNI, San Marcos, academia o estudiante independiente.', 'bad'); return; }
    if (track === 'academy' && !data.academyName) { status('code-status', 'Selecciona tu academia.', 'bad'); return; }
    var publicData = communityPayload();
    if (!/^[a-z0-9][a-z0-9_-]{2,23}$/.test(publicData.username)) {
      status('code-status', 'Antes de guardar, crea tu nombre de usuario en la sección Perfil público y privacidad.', 'bad');
      $('community-username').focus();
      return;
    }
    if (track !== 'cepreuni') {
      if (existing) { status('code-status', 'Tu cuenta ya tiene un código CEPREUNI del ciclo actual; no se elimina desde aquí.', 'bad'); return; }
      data.cepreCode = '';
      try {
        var onboarding = await communityApi('/onboarding', 'POST', Object.assign({}, publicData, data));
        state.community = onboarding.profile || state.community;
        state.profile = Object.assign({}, state.profile || {}, data, { onboardingComplete: true });
      } catch (error) { status('code-status', communityError(error), 'bad'); return; }
      fillProfile();
      fillCommunity();
      status('code-status', 'Perfil académico guardado correctamente.', 'good');
      return;
    }
    if (cycle !== CURRENT_CEPRE_CYCLE) {
      data.cepreCode = '';
      try {
        var previousOnboarding = await communityApi('/onboarding', 'POST', Object.assign({}, publicData, data));
        state.community = previousOnboarding.profile || state.community;
        state.profile = Object.assign({}, state.profile || {}, data, { onboardingComplete: true });
      } catch (error) { status('code-status', communityError(error), 'bad'); return; }
      fillProfile();
      fillCommunity();
      status('code-status', 'Ciclo CEPREUNI anterior guardado. No se pidió código porque puede repetirse entre ciclos.', 'good');
      return;
    }
    if (!code) { status('code-status', 'Escribe tu código CEPREUNI del ciclo actual.', 'bad'); return; }
    if (!validCodes().has(code)) { status('code-status', 'Ese código no existe en el ranking CEPREUNI actual cargado en Universe.', 'bad'); return; }
    if (existing && existing !== code) { status('code-status', 'Tu cuenta ya tiene un código registrado y no se puede cambiar.', 'bad'); return; }
    var ownerRoute = '/codeOwnersByCycle/' + cleanId(cycle) + '/' + cleanId(code);
    var owner = await api(ownerRoute, 'GET').catch(function () { return null; });
    var legacy = await api('/codeOwners/' + cleanId(code), 'GET').catch(function () { return null; });
    if ((owner && owner.userId && owner.userId !== uid()) || (legacy && legacy.userId && legacy.userId !== uid())) {
      status('code-status', 'Este código del ciclo actual ya fue registrado por otra cuenta de Gmail.', 'bad');
      return;
    }
    if (!existing) {
      var ok = confirm('¿Estás seguro de que este es tu código CEPREUNI del ciclo ' + cycle + '?\n\nCódigo: ' + code + '\n\nNo se volverá a cambiar para este ciclo. Las notificaciones y datos asociados llegarán a tu cuenta: ' + (state.user.email || ''));
      if (!ok) return;
    }
    data.cepreCode = code;
    try {
      await api(ownerRoute, 'PUT', { cycle: cycle });
      await api('/codeOwners/' + cleanId(code), 'PUT', { cycle: cycle });
      var currentOnboarding = await communityApi('/onboarding', 'POST', Object.assign({}, publicData, data));
      state.community = currentOnboarding.profile || state.community;
      await api('/profiles/' + uid(), 'PATCH', data);
    } catch (error) {
      status('code-status', error.status === 409 ? 'Este código ya fue registrado por otra cuenta.' : communityError(error), 'bad');
      return;
    }
    state.profile = Object.assign({}, state.profile || {}, data);
    fillProfile();
    fillCommunity();
    status('code-status', 'Datos CEPREUNI guardados. Tu código queda vinculado para el ciclo actual.', 'good');
  }
  async function saveCommunityProfile() {
    if (!state.user) return;
    var payload = communityPayload();
    if (!/^[a-z0-9][a-z0-9_-]{2,23}$/.test(payload.username)) {
      status('community-status', communityError(new Error('invalid_username')), 'bad');
      return;
    }
    if (!payload.displayName) { status('community-status', 'Escribe un nombre visible.', 'bad'); return; }
    try {
      var result;
      if (!(state.profile && state.profile.onboardingComplete)) {
        payload.academicTrack = $('academic-track').value;
        payload.academyName = $('academy-name').value;
        payload.cepreCycle = $('cepre-cycle').value;
        if (!payload.academicTrack) {
          status('community-status', 'Selecciona también tu tipo de estudiante para completar el registro una sola vez.', 'bad');
          return;
        }
        result = await communityApi('/onboarding', 'POST', payload);
        state.profile = Object.assign({}, state.profile || {}, result.academic || {}, { onboardingComplete: true });
      } else {
        result = await communityApi('/me', 'PUT', payload);
      }
      state.community = Object.assign({}, state.community || {}, payload, result.profile || {});
      state.communityDirty = false;
      fillProfile();
      fillCommunity(true);
      status('community-status', 'Perfil público y preferencias de privacidad guardados.', 'good');
    } catch (error) {
      status('community-status', communityError(error), 'bad');
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
    $('ann-image-url').value = a.image && String(a.image).indexOf('data:') !== 0 ? a.image : '';
    state.announcementImage = a.image || '';
    if (a.image) { $('ann-preview').src = a.image; $('ann-preview').style.display = 'block'; }
    $('pc7-title').value = (c.pc7 && c.pc7.title) || '7.ª prueba calificada CEPREUNI';
    $('pc7-target').value = fromIso(c.pc7 && c.pc7.target) || '2026-07-26T09:00';
    $('pc7-label').value = (c.pc7 && c.pc7.label) || 'Dom. 26 jul - 9:00 AM';
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
  async function saveAnnouncement() {
    if (!isAdmin()) return;
    var image = $('ann-image-url').value.trim() || state.announcementImage || '';
    await api('/public/announcement', 'PUT', { active: $('ann-active').value === 'true', title: $('ann-title').value.trim(), text: $('ann-text').value.trim(), image: image, updatedAt: Date.now(), updatedBy: state.user.email });
    status('ann-status', 'Comunicado publicado correctamente.', 'good');
  }
  async function saveSchedule() {
    if (!isAdmin()) return;
    var data = {
      countdowns: {
        pc7: { title: $('pc7-title').value.trim(), target: toPeruIso($('pc7-target').value), label: $('pc7-label').value.trim() },
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
      status('community-status', 'Selecciona una imagen PNG, JPG o WebP.', 'bad');
      return;
    }
    if (file.size > 5000000) {
      status('community-status', 'La imagen original no puede pesar más de 5 MB.', 'bad');
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
        status('community-status', 'Foto preparada. Presiona Guardar perfil público.', 'warn');
      };
      image.onerror = function () { status('community-status', 'No se pudo leer la imagen.', 'bad'); };
      image.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  }
  function bind() {
    var login = document.querySelector('[data-login]');
    if (login) login.onclick = function () { UniverseGoogleAuth.open({ account: true }); };
    document.querySelector('[data-save-profile]').onclick = saveProfile;
    document.querySelector('[data-save-community]').onclick = saveCommunityProfile;
    document.querySelector('[data-register-code]').onclick = saveAcademicProfile;
    document.querySelector('[data-logout]').onclick = function () {
      if (window.UniverseGoogleAuth) UniverseGoogleAuth.signOut();
      state.user = null; state.profile = null; state.community = null; showLogin();
      status('profile-status', 'Sesión cerrada.', 'warn');
    };
    ['academic-track', 'academy-name', 'cepre-cycle'].forEach(function (id) {
      if ($(id)) $(id).addEventListener('change', toggleAcademicFields);
    });
    document.querySelector('[data-save-ann]').onclick = saveAnnouncement;
    document.querySelector('[data-save-schedule]').onclick = saveSchedule;
    document.querySelector('[data-add-event]').onclick = addEvent;
    $('ann-image-file').onchange = function () {
      var f = this.files && this.files[0];
      if (!f) return;
      if (f.size > 750000) { status('ann-status', 'La imagen debe pesar menos de 750 KB.', 'bad'); this.value = ''; return; }
      var r = new FileReader();
      r.onload = function () { state.announcementImage = String(r.result || ''); $('ann-preview').src = state.announcementImage; $('ann-preview').style.display = 'block'; };
      r.readAsDataURL(f);
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
      'community-visibility',
      'community-bio',
      'community-show-avatar',
      'community-show-academy',
      'community-show-cycle',
      'community-show-target'
    ].forEach(function (id) {
      if (!$(id)) return;
      $(id).addEventListener('input', function () { state.communityDirty = true; });
      $(id).addEventListener('change', function () { state.communityDirty = true; });
    });
    window.addEventListener('universe-google-auth', function () { setTimeout(loadProfile, 80); });
  }
  function boot() { bind(); setTimeout(loadProfile, 350); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
