(function () {
  var BASE = 'https://universe-82fc3-default-rtdb.firebaseio.com/site/universeV1';
  var CURRENT_CEPRE_CYCLE = '2026-2';
  var CEPRE_CYCLES = ['2026-2', '2026-1', '2025-2', '2025-1', '2024-2', '2024-1', '2023-2', '2023-1', '2022-2', '2022-1', '2021-2', '2021-1'];
  var ACADEMIES = ['Pitágoras', 'César Vallejo', 'ADUNI', 'Trilce', 'Pamer', 'Exclusiva UNI', 'ACUNI', 'Grupo Ciencias', 'Vonex', 'Saco Oliveros', 'Integral Class', 'Academia Prisma', 'Otra academia'];
  var state = { user: null, profile: null, public: {}, announcementImage: '', extraEvents: [] };

  function $(id) { return document.getElementById(id); }
  function cleanId(v) { return String(v || '').replace(/[^a-zA-Z0-9_-]/g, ''); }
  function normalizeCode(v) { return String(v || '').trim().toUpperCase().replace(/\s+/g, ''); }
  function safe(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function api(route, method, data) {
    var opt = { method: method || 'GET', cache: 'no-store', headers: { 'Content-Type': 'application/json' } };
    if (data !== undefined) opt.body = JSON.stringify(data);
    return fetch(BASE + route + '.json', opt).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return method === 'DELETE' ? null : r.json();
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
    var parts = String(p.googleName || u.name || '').split(/\s+/);
    $('account-display-name').textContent = (p.firstName || u.name || 'Usuario') + (p.lastName ? ' ' + p.lastName : '');
    $('account-display-email').textContent = u.email || '';
    $('profile-first').value = p.firstName || parts[0] || '';
    $('profile-last').value = p.lastName || parts.slice(1).join(' ') || '';
    $('profile-age').value = p.age || '';
    $('profile-phone').value = p.phone || '';
    $('profile-email').value = u.email || '';
    $('academic-track').value = p.academicTrack || (p.cepreMember || p.cepreCode || p.cepreCycle ? 'cepreuni' : '');
    fillSelect('academy-name', ACADEMIES, p.academyName || '', 'Selecciona academia');
    fillSelect('cepre-cycle', CEPRE_CYCLES, p.cepreCycle || CURRENT_CEPRE_CYCLE);
    var avatar = $('account-avatar');
    avatar.innerHTML = u.avatar ? '<img alt="" src="' + safe(u.avatar) + '">' : safe((u.name || 'U').charAt(0).toUpperCase());
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
  async function loadProfile() {
    if (!window.UniverseGoogleAuth) { setTimeout(loadProfile, 180); return; }
    state.user = user();
    if (!state.user || state.user.provider !== 'google') { showLogin(); return; }
    $('account-login-card').hidden = true;
    $('account-content').hidden = false;
    state.profile = await api('/profiles/' + uid(), 'GET').catch(function () { return null; }) || {};
    fillProfile();
    if (isAdmin()) { $('admin-panel').classList.add('active'); await loadAdmin(); }
    else $('admin-panel').classList.remove('active');
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
      email: state.user.email || '',
      googleName: state.user.name || '',
      avatar: state.user.avatar || '',
      updatedAt: Date.now()
    };

    if (!track) { status('code-status', 'Elige si eres CEPREUNI, estudiante UNI, San Marcos, academia o estudiante independiente.', 'bad'); return; }
    if (track === 'academy' && !data.academyName) { status('code-status', 'Selecciona tu academia.', 'bad'); return; }
    if (track !== 'cepreuni') {
      if (existing) { status('code-status', 'Tu cuenta ya tiene un código CEPREUNI del ciclo actual; no se elimina desde aquí.', 'bad'); return; }
      data.cepreCode = '';
      await api('/profiles/' + uid(), 'PATCH', data);
      state.profile = Object.assign({}, state.profile || {}, data);
      fillProfile();
      status('code-status', 'Perfil académico guardado correctamente.', 'good');
      return;
    }
    if (cycle !== CURRENT_CEPRE_CYCLE) {
      data.cepreCode = '';
      await api('/profiles/' + uid(), 'PATCH', data);
      state.profile = Object.assign({}, state.profile || {}, data);
      fillProfile();
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
    await api(ownerRoute, 'PUT', { userId: uid(), email: state.user.email || '', cycle: cycle, createdAt: Date.now() });
    await api('/codeOwners/' + cleanId(code), 'PUT', { userId: uid(), email: state.user.email || '', cycle: cycle, createdAt: Date.now() });
    await api('/profiles/' + uid(), 'PATCH', data);
    state.profile = Object.assign({}, state.profile || {}, data);
    fillProfile();
    status('code-status', 'Datos CEPREUNI guardados. Tu código queda vinculado para el ciclo actual.', 'good');
  }
  async function loadAdmin() {
    state.public = await api('/public', 'GET').catch(function () { return null; }) || {};
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
  function bind() {
    var login = document.querySelector('[data-login]');
    if (login) login.onclick = function () { UniverseGoogleAuth.open({ account: true }); };
    document.querySelector('[data-save-profile]').onclick = saveProfile;
    document.querySelector('[data-register-code]').onclick = saveAcademicProfile;
    document.querySelector('[data-logout]').onclick = function () {
      if (window.UniverseGoogleAuth) UniverseGoogleAuth.signOut();
      state.user = null; state.profile = null; showLogin();
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
    window.addEventListener('universe-google-auth', function () { setTimeout(loadProfile, 80); });
  }
  function boot() { bind(); setTimeout(loadProfile, 350); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
