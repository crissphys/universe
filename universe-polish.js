(function () {
  try {
    var preferredLanguage = localStorage.getItem('universe_language');
    if (preferredLanguage === 'en' || preferredLanguage === 'es') {
      document.documentElement.dataset.universeLanguage = preferredLanguage;
      document.documentElement.lang = preferredLanguage;
    }
  } catch (_) {}

  function installUniverseI18n() {
    if (!document.head || document.getElementById('uts-i18n-runtime')) return;
    var runtime = document.createElement('script');
    runtime.id = 'uts-i18n-runtime';
    runtime.src = '/universe-i18n.js?v=bilingual-17';
    runtime.defer = true;
    document.head.appendChild(runtime);
  }

  installUniverseI18n();

  function installUniverseDesignV2() {
    if (!document.head) return;
    if (!document.getElementById('uts-fonts-v2')) {
      var fonts = document.createElement('link');
      fonts.id = 'uts-fonts-v2';
      fonts.rel = 'stylesheet';
      fonts.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@500;600;700;800&display=swap';
      document.head.appendChild(fonts);
    }
    if (!document.getElementById('uts-design-v2')) {
      var design = document.createElement('link');
      design.id = 'uts-design-v2';
      design.rel = 'stylesheet';
      design.href = '/universe-design-v2.css?v=system-9';
      document.head.appendChild(design);
    }

    function keepDesignLast() {
      var sheet = document.getElementById('uts-design-v2');
      if (sheet && document.body && sheet !== document.body.lastElementChild) {
        document.body.appendChild(sheet);
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', keepDesignLast, { once: true });
    } else {
      keepDesignLast();
    }
    window.addEventListener('load', keepDesignLast, { once: true });
  }

  installUniverseDesignV2();

  var GOOGLE_CLIENT_ID = '410302293146-nr50k7kovcpd5kuekfd49ddqc041612g.apps.googleusercontent.com';
  var GOOGLE_SCRIPT_ID = 'uts-google-identity-script';
  var AUTH_KEY = 'universe_google_user';
  var AUTH_TOKEN_KEY = 'universe_auth_token';
  var LEGACY_USER_KEY = 'universe_user';
  var GUEST_KEY = 'universe_guest_mode';
  var FIRST_GATE_KEY = 'universe_entry_gate_seen';
  var API_BASE = '/api';
  var PUBLIC_CLIENT_KEY = 'universe_public_client_id';
  var GOOGLE_IDENTITY_INITIALIZED = false;
  var CURRENT_CEPRE_CYCLE = '2026-2';
  var CEPRE_CYCLES = ['2026-2', '2026-1', '2025-2', '2025-1', '2024-2', '2024-1', '2023-2', '2023-1', '2022-2', '2022-1', '2021-2', '2021-1'];
  var ACADEMIES = ['Pitágoras', 'César Vallejo', 'ADUNI', 'Trilce', 'Pamer', 'Exclusiva UNI', 'ACUNI', 'Grupo Ciencias', 'Vonex', 'Saco Oliveros', 'Integral Class', 'Academia Prisma', 'Otra academia'];
  var CEPRE_CODES_SCRIPT_ID = 'uts-cepre-codes-script';

  function siteApi(route, method, data) {
    var headers = { 'Content-Type': 'application/json' };
    try {
      var token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) headers.Authorization = 'Bearer ' + token;
    } catch (error) {}
    var options = { method: method || 'GET', cache: 'no-store', headers: headers };
    if (data !== undefined) options.body = JSON.stringify(data);
    return fetch(API_BASE + '/site' + route, options).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return method === 'DELETE' ? null : response.json();
    });
  }

  function getPublicClientId() {
    try {
      var saved = localStorage.getItem(PUBLIC_CLIENT_KEY) || '';
      if (/^[a-zA-Z0-9_-]{16,64}$/.test(saved)) return saved;
      var generated = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'uts_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 18);
      localStorage.setItem(PUBLIC_CLIENT_KEY, generated);
      return generated;
    } catch (error) {
      window.__utsPublicClientId = window.__utsPublicClientId || ('uts_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 18));
      return window.__utsPublicClientId;
    }
  }

  function updateHomePresence(count) {
    var value = document.querySelector('[data-active-visitor-count]');
    var label = document.querySelector('[data-active-visitor-label]');
    if (!value || !label || !Number.isFinite(Number(count))) return;
    count = Math.max(0, Number(count) || 0);
    var english = document.documentElement.getAttribute('data-universe-language') === 'en';
    value.textContent = count.toLocaleString(english ? 'en-US' : 'es-PE');
    label.textContent = english ? (count === 1 ? 'person active' : 'people active') : (count === 1 ? 'persona activa' : 'personas activas');
    value.closest('.home-active-users').setAttribute('aria-label', value.textContent + ' ' + label.textContent);
  }

  function startSitePresence() {
    if (window.__utsPresenceStarted) return;
    window.__utsPresenceStarted = true;
    var heartbeat = function () {
      if (document.visibilityState === 'hidden') return;
      siteApi('/presence', 'POST', { clientId: getPublicClientId(), page: location.pathname })
        .then(function (result) { updateHomePresence(result && result.active); })
        .catch(function () {});
    };
    heartbeat();
    window.__utsPresenceTimer = window.setInterval(heartbeat, 30000);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') heartbeat();
    });
  }

  function unitalkApi(route, method, data) {
    var headers = { 'Content-Type': 'application/json' };
    try {
      var token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) headers.Authorization = 'Bearer ' + token;
    } catch (error) {}
    var options = { method: method || 'GET', cache: 'no-store', headers: headers };
    if (data !== undefined) options.body = JSON.stringify(data);
    return fetch(API_BASE + '/unitalk' + route, options).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (payload) {
        if (!response.ok) {
          var error = new Error(payload.error || 'request_failed');
          error.status = response.status;
          throw error;
        }
        return payload;
      });
    });
  }

  function getAuthToken() {
    try { return localStorage.getItem(AUTH_TOKEN_KEY) || ''; } catch (error) { return ''; }
  }

  function storeGoogleUser(user) {
    try { localStorage.setItem(AUTH_KEY, JSON.stringify(user)); } catch (error) {}
    try { localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(user)); } catch (error) {}
    try { sessionStorage.setItem(LEGACY_USER_KEY, JSON.stringify(user)); } catch (error) {}
    try { localStorage.setItem('universe_usuario_nombre', user.name || ''); } catch (error) {}
    try { localStorage.setItem('universe_usuario_email', user.email || ''); } catch (error) {}
    try { localStorage.setItem('universe_usuario_foto', user.avatar || ''); } catch (error) {}
  }

  function notifyAuthUpdated(user) {
    try {
      if (typeof window.saveUser === 'function') window.saveUser(user);
      if (typeof window.updateNavUser === 'function') window.updateNavUser();
      if (typeof window.renderAccountPanel === 'function') window.renderAccountPanel();
    } catch (error) {}
    try { window.dispatchEvent(new CustomEvent('universe-google-auth', { detail: user })); } catch (error) {}
    renderGoogleAuthButton();
  }

  async function refreshSecureSession() {
    var token = getAuthToken();
    if (!token) return null;
    try {
      var response = await fetch(API_BASE + '/auth/me', {
        cache: 'no-store',
        headers: { Authorization: 'Bearer ' + token }
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      var data = await response.json();
      if (!data || !data.user) return null;
      var previous = getCurrentAuthUser() || {};
      var user = Object.assign({}, previous, data.user, {
        provider: data.user.provider || previous.provider || 'google',
        createdAt: previous.createdAt || Date.now(),
        updatedAt: Date.now(),
        secureSession: true
      });
      storeGoogleUser(user);
      notifyAuthUpdated(user);
      return user;
    } catch (error) {
      try { localStorage.removeItem(AUTH_TOKEN_KEY); } catch (error2) {}
      var stored = getCurrentAuthUser();
      if (stored) {
        stored.secureSession = false;
        storeGoogleUser(stored);
      }
      return null;
    }
  }

  function cleanAccountId(value) {
    return String(value || '').replace(/[^a-zA-Z0-9_-]/g, '');
  }

  function normalizeCepreCode(value) {
    return String(value || '').trim().toUpperCase().replace(/\s+/g, '');
  }

  function isAdminGoogleUser() {
    var g = getCurrentAuthUser();
    return !!(g && g.provider === 'google' && g.secureSession === true && g.isAdmin === true);
  }

  function applyUniverseTheme(theme) {
    var dark = theme === 'dark';
    if (dark) document.documentElement.setAttribute('data-universe-theme', 'dark');
    else document.documentElement.removeAttribute('data-universe-theme');
    try { localStorage.setItem('universe_theme', dark ? 'dark' : 'light'); } catch (error) {}
    var btn = document.getElementById('universe-theme-toggle');
    if (btn) {
      btn.setAttribute('aria-label', dark ? 'Activar tema claro' : 'Activar tema oscuro');
      btn.setAttribute('title', dark ? 'Tema claro' : 'Tema oscuro');
    }
  }

  if (!window.applyUniverseTheme) window.applyUniverseTheme = applyUniverseTheme;
  if (!window.toggleUniverseTheme) {
    window.toggleUniverseTheme = function () {
      applyUniverseTheme(document.documentElement.getAttribute('data-universe-theme') === 'dark' ? 'light' : 'dark');
    };
  }

  function moveThemeToggleToViewport() {
    var btn = document.getElementById('universe-theme-toggle');
    if (!btn || !document.body) return;
    if (btn.parentElement !== document.body) {
      document.body.appendChild(btn);
    }
  }

  function activateUniverseNav() {
    var root = document.documentElement;
    var page = root && root.getAttribute('data-universe-page') || '';
    document.querySelectorAll('nav .nav-links').forEach(function (list) {
      if (list.querySelector('a[href="/planificador"]')) return;
      var item = document.createElement('li');
      item.innerHTML = '<a data-route="planner" href="/planificador">Planificador</a>';
      var syllabus = list.querySelector('a[href="/temario"]');
      if (syllabus && syllabus.parentElement) list.insertBefore(item, syllabus.parentElement);
      else list.appendChild(item);
    });
    document.querySelectorAll('nav .nav-links').forEach(function (list) {
      if (list.querySelector('a[href="/unitalk"]')) return;
      var item = document.createElement('li');
      item.innerHTML = '<a data-route="unitalk" href="/unitalk">UNITALK</a>';
      var library = list.querySelector('a[href="/biblioteca"]');
      if (library && library.parentElement) list.insertBefore(item, library.parentElement);
      else list.appendChild(item);
    });
    document.querySelectorAll('nav .nav-links a[data-route="privacy"]').forEach(function (link) {
      var item = link.closest('li');
      if (item) item.remove();
      else link.remove();
    });
    document.querySelectorAll('footer .footer-links').forEach(function (group) {
      var heading = group.querySelector('h4');
      var list = group.querySelector('ul');
      if (!heading || !list || !/p[aá]ginas/i.test(heading.textContent) || list.querySelector('a[href="/unitalk"]')) return;
      var item = document.createElement('li');
      item.innerHTML = '<a href="/unitalk">UNITALK</a>';
      list.appendChild(item);
    });
    document.querySelectorAll('footer .footer-links').forEach(function (group) {
      var heading = group.querySelector('h4');
      var list = group.querySelector('ul');
      if (!heading || !list || !/^cepreuni$/i.test(heading.textContent.trim()) || list.querySelector('a[href="/fijas-cepreuni"]')) return;
      var item = document.createElement('li');
      item.innerHTML = '<a href="/fijas-cepreuni">Fijas CEPREUNI</a>';
      var calculator = list.querySelector('a[href="/calculadora"]');
      if (calculator && calculator.parentElement) calculator.parentElement.insertAdjacentElement('afterend', item);
      else list.appendChild(item);
    });
    var grouped = {
      ranking: 'cepre',
      calculator: 'cepre',
      'docentes-cepreuni': 'cepre',
      'fijas-cepreuni': 'cepre',
      'ingresantes-cepreuni': 'cepre',
      exams: 'simulators',
      'admission-results': 'admission'
    };
    var active = grouped[page] || page;
    document.querySelectorAll('nav a[data-route]').forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('data-route') === active);
    });
    ensureUnifiedNavigation();
    ensureUnifiedFooter();
  }

  var UNIVERSE_PAGE_META = {
    account: ['Mi cuenta', 'Perfil, preferencias y actividad'],
    admission: ['Admisión', 'Puntajes, procesos y resultados UNI'],
    cepre: ['CEPREUNI', 'Herramientas del ciclo preuniversitario'],
    calculator: ['Calculadora CEPREUNI', 'Proyecta tu promedio con claridad'],
    ranking: ['Máximos y mínimos', 'Compara el ciclo actual y los anteriores'],
    syllabus: ['Temario', 'Organiza tu preparación por áreas y pruebas'],
    planner: ['Planificador', 'Tu cronograma personal de estudio'],
    classes: ['Clases', 'Videos y práctica organizada por temas'],
    library: ['Biblioteca', 'Materiales clasificados para estudiar mejor'],
    simulators: ['Simulacros', 'Practica con tiempo y formato de examen'],
    exams: ['Exámenes CEPREUNI', 'Recursos y evaluaciones del ciclo'],
    'docentes-cepreuni': ['Guía de aulas', 'Docentes, salones y horarios'],
    'fijas-cepreuni': ['Fijas CEPREUNI', 'Recurrencia de temas por examen'],
    'ingresantes-cepreuni': ['Ingresantes CEPREUNI', 'Resultados del ciclo 2026-2'],
    privacy: ['Privacidad', 'Cómo protegemos y utilizamos tus datos'],
    terms: ['Términos', 'Condiciones de uso de Universe to Study'],
    editorial: ['Universe editorial', 'Información, autores y metodología']
  };

  function universeBrandMarkup() {
    return '<span class="uts-brand-mark" aria-hidden="true"><svg viewBox="0 0 40 40" focusable="false"><path d="M10 9v13.2C10 29.8 14 34 20 34s10-4.2 10-11.8V15h-6.2v7.4c0 3.8-1.3 5.6-3.8 5.6s-3.8-1.8-3.8-5.6V9H10Z"/><path d="M22.5 9H32l-9.5 8V9Z"/></svg></span><span class="uts-brand-label">Universe <b>to Study</b></span>';
  }

  function ensureUnifiedNavigation() {
    var page = document.documentElement.getAttribute('data-universe-page') || '';
    if (page === 'home') return;
    document.querySelectorAll('body > nav').forEach(function (nav) {
      nav.classList.add('uts-unified-nav');
      var logo = nav.querySelector('.nav-logo');
      if (logo && !logo.querySelector('.uts-brand-mark')) {
        logo.innerHTML = universeBrandMarkup();
        logo.setAttribute('aria-label', 'Universe to Study - Inicio');
      }
      var menuButton = nav.querySelector('.uts-menu-toggle');
      if (!menuButton) {
        menuButton = document.createElement('button');
        menuButton.className = 'uts-menu-toggle';
        menuButton.type = 'button';
        menuButton.setAttribute('aria-label', 'Abrir menú');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.innerHTML = '<span></span><span></span><span></span>';
        var navLinks = nav.querySelector('.nav-links');
        if (navLinks) nav.insertBefore(menuButton, navLinks);
        menuButton.addEventListener('click', function () {
          var open = nav.classList.toggle('uts-menu-open');
          menuButton.setAttribute('aria-expanded', String(open));
          menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        });
        if (navLinks) navLinks.addEventListener('click', function (event) {
          if (!event.target.closest('a')) return;
          nav.classList.remove('uts-menu-open');
          menuButton.setAttribute('aria-expanded', 'false');
          menuButton.setAttribute('aria-label', 'Abrir menú');
        });
      }
      var slot = nav.querySelector('.uts-nav-account-slot');
      if (!slot) {
        slot = document.createElement('div');
        slot.className = 'uts-nav-account-slot';
        slot.setAttribute('aria-label', 'Cuenta de usuario');
        nav.appendChild(slot);
      }
      var button = document.getElementById('uts-google-auth-button');
      if (button && button.parentElement !== slot) slot.appendChild(button);
    });
    var context = document.getElementById('uts-page-context');
    if (context) context.remove();
  }

  function ensureUnifiedFooter() {
    var page = document.documentElement.getAttribute('data-universe-page') || '';
    var footers = Array.prototype.slice.call(document.querySelectorAll('footer'));
    if (page === 'home' || page === 'unitalk') {
      footers.slice(1).forEach(function (extra) { extra.remove(); });
      return;
    }
    var footer = footers.shift();
    footers.forEach(function (extra) { extra.remove(); });
    if (!footer) {
      footer = document.createElement('footer');
      document.body.appendChild(footer);
    }
    if (footer.dataset.utsUnified === 'true') return;
    footer.dataset.utsUnified = 'true';
    footer.className = 'uts-site-footer';
    footer.innerHTML = '<div class="uts-footer-main">' +
      '<div class="uts-footer-brand"><a href="/">Universe to Study</a><p>Recursos, herramientas y comunidad para una preparación preuniversitaria con orden.</p></div>' +
      '<div><h3>Plataforma</h3><a href="/admision">Admisión</a><a href="/cepreuni">CEPREUNI</a><a href="/planificador">Planificador</a><a href="/clases">Clases</a><a href="/biblioteca">Biblioteca</a></div>' +
      '<div><h3>Practica</h3><a href="/simulacros">Simulacros</a><a href="/temario">Temario</a><a href="/unitalk">UNITALK</a><a href="/calculadora">Calculadora</a></div>' +
      '<div><h3>Confianza</h3><a href="/nosotros">Nosotros</a><a href="/metodologia-editorial">Metodología</a><a href="/correcciones">Correcciones</a><a href="/contacto">Contacto</a></div>' +
      '</div><div class="uts-footer-bottom"><span>© <b>2026</b> Universe to Study</span><span><a href="/terminos">Términos</a><a href="/privacidad">Privacidad</a><a href="https://wa.me/51963385410?text=Hola%2C%20necesito%20ayuda%20con%20Universe%20to%20Study" target="_blank" rel="noopener noreferrer">Soporte por WhatsApp</a></span></div>';
  }

  function ensurePageContextBar(page) {
    if (!page || page === 'home' || page === 'unitalk' || document.getElementById('uts-page-context')) return;
    var nav = document.querySelector('body > nav');
    if (!nav) return;
    var meta = UNIVERSE_PAGE_META[page] || ['Universe to Study', 'Preparación preuniversitaria organizada'];
    var bar = document.createElement('div');
    bar.id = 'uts-page-context';
    bar.className = 'uts-page-context';
    bar.innerHTML = '<div class="uts-context-copy"><span>Universe to Study</span><strong>' + safeText(meta[0]) + '</strong><small>' + safeText(meta[1]) + '</small></div>' +
      '<a href="/" class="uts-context-home" aria-label="Volver al inicio"><span aria-hidden="true">←</span> Inicio</a>';
    nav.insertAdjacentElement('afterend', bar);
  }

  function goAccountPage() {
    if (location.pathname.replace(/\/+$/, '') === '/account') return;
    location.href = '/account';
  }

  function addGoogleAuthStyles() {
    if (document.getElementById('uts-google-auth-style')) return;
    var style = document.createElement('style');
    style.id = 'uts-google-auth-style';
    style.textContent = [
      'html[data-universe-page] .reveal,html[data-universe-page] .reveal.visible{opacity:1!important;visibility:visible!important;transform:none!important;filter:none!important}',
      '#uts-google-auth-button,[data-uts-account-button="true"]{position:fixed!important;top:max(12px,calc(env(safe-area-inset-top) + 12px))!important;right:max(14px,calc(env(safe-area-inset-right) + 14px))!important;z-index:2147482450!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:.5rem!important;min-height:38px!important;border:1px solid rgba(37,99,235,.22)!important;border-radius:999px!important;background:rgba(255,255,255,.92)!important;color:#0f3d75!important;box-shadow:0 12px 30px rgba(15,23,42,.16)!important;padding:.42rem .82rem!important;font:900 .84rem/1 Rajdhani,Inter,system-ui,sans-serif!important;letter-spacing:.4px!important;cursor:pointer!important;white-space:nowrap!important;transition:.2s!important;backdrop-filter:blur(12px)!important}',
      '#uts-google-auth-button:hover,[data-uts-account-button="true"]:hover{transform:translateY(-1px)!important;box-shadow:0 16px 36px rgba(37,99,235,.22)!important}',
      '#uts-google-auth-button .uts-g-mark,[data-uts-account-button="true"] .uts-g-mark{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#eaf4ff;color:#2563eb;font-weight:1000;box-shadow:inset 0 0 0 1px rgba(37,99,235,.18)}',
      '#uts-google-auth-button img,[data-uts-account-button="true"] img{width:24px;height:24px;border-radius:50%;object-fit:cover}',
      '#uts-google-auth-button small,[data-uts-account-button="true"] small{display:none}',
      '#uts-google-auth-modal{position:fixed;inset:0;z-index:2147482800;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(2,6,23,.55);backdrop-filter:blur(7px)}',
      '#uts-google-auth-modal.open{display:flex}',
      '.uts-google-card{width:min(92vw,420px);border:1px solid rgba(148,163,184,.28);border-radius:26px;background:#fff;color:#0f172a;box-shadow:0 32px 90px rgba(2,8,23,.35);overflow:hidden;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif}',
      '.uts-google-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 20px;background:linear-gradient(135deg,#075dcc,#1394e8);color:#fff}',
      '.uts-google-head strong{display:block;font-size:16px}.uts-google-head span{display:block;margin-top:3px;font-size:11px;opacity:.86}',
      '.uts-google-close{width:32px;height:32px;border:1px solid rgba(255,255,255,.32);border-radius:50%;background:rgba(255,255,255,.12);color:#fff;cursor:pointer}',
      '.uts-google-body{padding:22px}.uts-google-body p{margin:0 0 16px;color:#475569;line-height:1.58;font-size:14px}',
      '#uts-google-signin-slot{display:flex;justify-content:center;min-height:46px;margin:10px 0 12px}',
      '.uts-google-user{display:grid;grid-template-columns:58px minmax(0,1fr);gap:14px;align-items:center;border:1px solid #dbeafe;border-radius:18px;background:#f8fbff;padding:14px;margin-bottom:14px}',
      '.uts-google-user img{width:58px;height:58px;border-radius:50%;object-fit:cover}.uts-google-user b,.uts-google-user span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.uts-google-user b{font-size:16px}.uts-google-user span{margin-top:4px;color:#64748b;font-size:12px}',
      '.uts-google-actions{display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end;margin-top:16px}.uts-google-actions button{border:0;border-radius:999px;padding:10px 14px;font-weight:900;cursor:pointer}.uts-google-secondary{background:#eaf4ff;color:#075dcc}.uts-google-danger{background:#fee2e2;color:#991b1b}',
      '.uts-google-primary{background:linear-gradient(135deg,#075dcc,#1394e8);color:#fff;box-shadow:0 12px 26px rgba(7,93,204,.22)}',
      '.uts-google-hint{margin-top:10px;color:#64748b;font-size:11px;line-height:1.45;text-align:center}',
      '.uts-google-required{display:inline-flex;margin-bottom:12px;border:1px solid rgba(7,93,204,.24);border-radius:999px;background:rgba(7,93,204,.08);padding:7px 10px;color:#075dcc;font-size:11px;font-weight:1000;text-transform:uppercase;letter-spacing:.08em}',
      '.uts-google-support-note{border:1px solid rgba(245,158,11,.34);border-radius:16px;background:#fffbeb;color:#78350f;padding:12px 14px;margin-bottom:14px;font-size:13px;line-height:1.45}.uts-google-support-note strong,.uts-google-support-note span{display:block}.uts-google-support-note span{margin-top:4px;color:#92400e}',
      '.uts-google-data{display:grid;gap:8px;margin:14px 0}.uts-google-data div{display:grid;grid-template-columns:120px minmax(0,1fr);gap:10px;border:1px solid #dbeafe;border-radius:14px;background:#f8fbff;padding:10px 12px}.uts-google-data dt{color:#64748b;font-size:11px;font-weight:1000;text-transform:uppercase;letter-spacing:.06em}.uts-google-data dd{margin:0;min-width:0;overflow-wrap:anywhere;color:#0f172a;font-size:13px;font-weight:800}',
      '.uts-cepre-box{margin:16px 0;padding:14px;border:1px solid #bfdbfe;border-radius:18px;background:linear-gradient(135deg,#f8fbff,#eff6ff)}.uts-cepre-loading{color:#64748b;font-size:13px}.uts-cepre-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:12px}.uts-cepre-head b,.uts-cepre-head span{display:block}.uts-cepre-head b{font-size:15px}.uts-cepre-head span{margin-top:3px;color:#64748b;font-size:12px;line-height:1.45}.uts-cepre-head i{flex:0 0 auto;border-radius:999px;background:#dcfce7;color:#166534;padding:6px 9px;font-size:10px;font-style:normal;font-weight:1000;text-transform:uppercase}.uts-cepre-grid{display:grid;grid-template-columns:1fr;gap:10px}.uts-cepre-grid label{display:grid;gap:5px;color:#335a86;font-size:11px;font-weight:1000;text-transform:uppercase;letter-spacing:.07em}.uts-cepre-grid select,.uts-cepre-grid input{width:100%;box-sizing:border-box;border:1px solid #cfe1f3;border-radius:13px;background:#fff;color:#0f172a;padding:11px 12px;font:600 14px Inter,system-ui,sans-serif;text-transform:none;letter-spacing:0}.uts-cepre-mini{margin:10px 0 0!important;color:#475569!important;font-size:12px!important;line-height:1.45!important}',
      '.uts-announcement-layer{position:fixed!important;inset:0!important;z-index:2147482200!important;display:flex!important;align-items:flex-start!important;justify-content:center!important;padding:max(86px,calc(env(safe-area-inset-top) + 86px)) 20px 24px!important;background:rgba(2,12,32,.55)!important;overflow:auto!important;box-sizing:border-box!important;backdrop-filter:blur(10px)!important}',
      '.uts-public-announcement{position:relative!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;display:flex!important;flex-direction:column!important;width:min(880px,100%)!important;min-height:min(430px,70dvh)!important;max-height:min(76dvh,760px)!important;border:1px solid rgba(37,99,235,.25)!important;border-radius:30px!important;background:rgba(255,255,255,.98)!important;color:#0f172a!important;box-shadow:0 35px 110px rgba(2,12,32,.42)!important;overflow:auto!important;transform:none!important;font-family:Inter,system-ui,sans-serif!important}',
      '.uts-public-announcement>.uts-announcement-content{padding:clamp(24px,4vw,42px)}.uts-announcement-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr));gap:3px;margin:0;padding:0;background:#dbeafe}.uts-announcement-gallery img{display:block;width:100%;height:clamp(190px,30vw,330px);object-fit:cover;background:#eaf4ff}.uts-announcement-gallery[data-count="1"] img{height:clamp(240px,36vw,390px)}.uts-public-announcement span{display:inline-flex;margin-bottom:12px;border-radius:999px;background:#eaf4ff;color:#075dcc;padding:7px 12px;font-size:11px;font-weight:1000;text-transform:uppercase;letter-spacing:.1em}.uts-public-announcement strong{display:block;padding-right:34px;font-size:clamp(24px,3vw,36px);line-height:1.12;letter-spacing:-.03em}.uts-public-announcement p{margin:15px 0 0;color:#475569;font-size:clamp(15px,1.5vw,18px);line-height:1.65;overflow-wrap:anywhere}.uts-public-announcement p a{color:#075dcc;font-weight:800;text-decoration:underline;text-decoration-thickness:1.5px;text-underline-offset:3px}.uts-public-announcement p a:hover{color:#1d4ed8}.uts-ann-close{position:absolute;right:16px;top:16px;z-index:2;width:42px;height:42px;border:1px solid rgba(255,255,255,.24);border-radius:50%;background:rgba(15,23,42,.82);color:#fff;cursor:pointer;font-size:25px;line-height:1;box-shadow:0 9px 24px rgba(15,23,42,.25)}',
      '.uts-public-announcement .uts-announcement-actions{display:flex!important;align-items:center!important;gap:12px!important;margin-top:24px!important;padding:0!important}.uts-public-announcement .uts-ann-like{display:inline-flex!important;align-items:center!important;gap:8px!important;min-height:46px!important;border:1px solid rgba(37,99,235,.22)!important;border-radius:999px!important;background:#eef6ff!important;color:#075dcc!important;padding:10px 17px!important;font:900 13px/1 Inter,system-ui,sans-serif!important;cursor:pointer!important;box-shadow:0 10px 24px rgba(37,99,235,.10)!important}.uts-public-announcement .uts-ann-like:hover{transform:translateY(-1px)!important;background:#dfeeff!important}.uts-public-announcement .uts-ann-like[aria-pressed="true"]{background:#2563eb!important;color:#fff!important;border-color:#2563eb!important}.uts-public-announcement .uts-ann-like:disabled{cursor:wait!important;opacity:.7!important}.uts-public-announcement .uts-ann-like b{font-size:15px!important}.uts-public-announcement .uts-ann-like-status{padding:0!important;color:#64748b!important;font-size:12px!important}',
      'html[data-universe-theme="dark"] #uts-google-auth-button,html[data-universe-theme="dark"] [data-uts-account-button="true"]{background:rgba(5,5,5,.92)!important;color:#e5f2ff!important;border-color:rgba(96,165,250,.34)!important;box-shadow:0 14px 34px rgba(0,0,0,.54)!important}',
      'html[data-universe-theme="dark"] .uts-google-card{background:#061120;color:#f8fafc;border-color:#1e3a5f}',
      'html[data-universe-theme="dark"] .uts-google-body p,html[data-universe-theme="dark"] .uts-google-user span,html[data-universe-theme="dark"] .uts-google-hint{color:#cbd5e1}',
      'html[data-universe-theme="dark"] .uts-google-user{background:#071426;border-color:#1e3a5f}',
      'html[data-universe-theme="dark"] .uts-google-support-note{background:#17110a;border-color:#92400e;color:#fde68a}html[data-universe-theme="dark"] .uts-google-support-note span{color:#fcd34d}',
      'html[data-universe-theme="dark"] .uts-google-data div{background:#071426;border-color:#1e3a5f}html[data-universe-theme="dark"] .uts-google-data dt{color:#93c5fd}html[data-universe-theme="dark"] .uts-google-data dd{color:#f8fafc}',
      'html[data-universe-theme="dark"] .uts-cepre-box{background:#071426;border-color:#1e3a5f}html[data-universe-theme="dark"] .uts-cepre-head span,html[data-universe-theme="dark"] .uts-cepre-mini,html[data-universe-theme="dark"] .uts-cepre-loading{color:#cbd5e1!important}html[data-universe-theme="dark"] .uts-cepre-grid label{color:#93c5fd}html[data-universe-theme="dark"] .uts-cepre-grid select,html[data-universe-theme="dark"] .uts-cepre-grid input{background:#050505;color:#f8fafc;border-color:#334155}',
      'html[data-universe-theme="dark"] .uts-public-announcement{background:linear-gradient(145deg,rgba(7,24,57,.97),rgba(5,18,45,.94));color:#f8fafc;border-color:rgba(96,165,250,.34);box-shadow:0 24px 70px rgba(0,0,0,.58)}html[data-universe-theme="dark"] .uts-public-announcement p{color:#cbd5e1}html[data-universe-theme="dark"] .uts-public-announcement p a{color:#7dd3fc}html[data-universe-theme="dark"] .uts-public-announcement .uts-ann-like{background:rgba(37,99,235,.14)!important;color:#bfdbfe!important;border-color:rgba(96,165,250,.32)!important}html[data-universe-theme="dark"] .uts-public-announcement .uts-ann-like[aria-pressed="true"]{background:#2563eb!important;color:#fff!important}html[data-universe-theme="dark"] .uts-public-announcement .uts-ann-like-status{color:#94a3b8!important}',
      'body.support-v2-active #uts-google-auth-button,body.support-v2-active [data-uts-account-button="true"]{z-index:2147482400!important;pointer-events:none!important;opacity:.18!important;filter:grayscale(1)!important}',
      '@media(max-width:720px){#uts-google-auth-button,[data-uts-account-button="true"]{top:max(10px,calc(env(safe-area-inset-top) + 10px))!important;right:max(10px,calc(env(safe-area-inset-right) + 10px))!important;padding:.52rem .7rem!important}#uts-google-auth-button .uts-g-label,[data-uts-account-button="true"] .uts-g-label{display:none}.uts-google-card{border-radius:22px}.uts-announcement-layer{padding:max(68px,calc(env(safe-area-inset-top) + 68px)) 10px 12px!important}.uts-public-announcement{width:100%!important;min-height:min(420px,calc(100dvh - 80px))!important;max-height:calc(100dvh - 80px)!important;border-radius:24px!important}.uts-announcement-gallery{grid-template-columns:1fr}.uts-announcement-gallery img,.uts-announcement-gallery[data-count="1"] img{height:auto;max-height:300px}.uts-public-announcement>.uts-announcement-content{padding:24px 20px 28px}.uts-public-announcement strong{font-size:24px}.uts-public-announcement p{font-size:15px}.uts-ann-close{right:12px;top:12px;width:38px;height:38px}}',
      '#uts-google-auth-modal{align-items:center!important;justify-content:flex-start!important;padding:clamp(28px,3.4vw,58px)!important;background:#f7fbff!important;backdrop-filter:none!important;overflow:auto!important}',
      '#uts-google-auth-modal.open{display:flex!important;flex-direction:column!important;gap:clamp(78px,13vh,210px)!important}',
      '#uts-google-auth-modal:before{content:"";display:block;flex:0 0 min(52vh,620px);width:min(92vw,1450px);min-height:240px;background-color:#eaf2ff;background-image:linear-gradient(rgba(37,99,235,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(219,234,254,.95),rgba(239,246,255,.86));background-size:38px 38px,38px 38px,100% 100%;box-shadow:inset 0 0 0 1px rgba(37,99,235,.02)}',
      '#uts-google-auth-modal .uts-google-card{position:relative!important;z-index:1!important;width:min(420px,92vw)!important;border:0!important;border-radius:24px!important;background:#fff!important;color:#0f172a!important;box-shadow:0 32px 64px -12px rgba(15,23,42,.18)!important;overflow:auto!important;max-height:none!important;animation:utsLoginCardIn .5s cubic-bezier(.22,1,.36,1) both!important;font-family:DM Sans,Inter,system-ui,-apple-system,Segoe UI,sans-serif!important}',
      '#uts-google-auth-modal .uts-google-card:before{content:"";display:block;height:4px;background:linear-gradient(90deg,#2563eb,#7c3aed)}',
      '@keyframes utsLoginCardIn{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}',
      '#uts-google-auth-modal .uts-google-close{position:absolute!important;top:10px!important;right:10px!important;z-index:3!important;width:30px!important;height:30px!important;border:0!important;border-radius:50%!important;background:#f1f5f9!important;color:#94a3b8!important;box-shadow:none!important;cursor:pointer!important}',
      '#uts-google-auth-modal .uts-google-body{padding:2rem 2rem 2.2rem!important}#uts-google-auth-modal .uts-google-body p{margin:0 0 1.5rem!important}',
      '.uts-login-brand{display:flex;flex-direction:column;align-items:center;gap:.5rem;margin-bottom:1.6rem;text-align:center}.uts-login-logo{font-family:Bebas Neue,Rajdhani,Inter,sans-serif;font-size:2.6rem;letter-spacing:5px;background:linear-gradient(135deg,#0f172a,#2563eb);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;line-height:1}.uts-login-tagline{font-size:.8rem;color:#64748b;font-family:Rajdhani,Inter,sans-serif;letter-spacing:1.5px;text-transform:uppercase;margin-top:.15rem;font-weight:700}',
      '.uts-login-desc{font-size:.85rem!important;color:#475569!important;line-height:1.55!important;text-align:center!important;margin-bottom:1.5rem!important}.uts-login-guest-section{margin-bottom:1.5rem}.uts-login-guest-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:.7rem;padding:.85rem;background:linear-gradient(135deg,#2563eb,#60a5fa);color:#fff;border:none;border-radius:50px;font-family:Rajdhani,Inter,sans-serif;font-weight:800;font-size:1rem;letter-spacing:1.5px;cursor:pointer;transition:transform .2s,box-shadow .2s;box-shadow:0 8px 24px rgba(37,99,235,.2)}.uts-login-guest-btn:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(37,99,235,.3)}.uts-login-guest-btn svg{flex-shrink:0}',
      '.uts-login-divider{display:flex;align-items:center;gap:.8rem;color:#94a3b8;font-size:.78rem;margin:0 0 1rem;font-family:Rajdhani,Inter,sans-serif;font-weight:800;letter-spacing:1px;text-transform:uppercase}.uts-login-divider:before,.uts-login-divider:after{content:"";flex:1;height:1px;background-image:linear-gradient(90deg,transparent,rgba(37,99,235,.15),transparent)}#uts-google-signin-slot{display:flex!important;justify-content:center!important;align-items:center!important;min-height:46px!important;margin:0 0 1.5rem!important}',
      '.uts-login-official{margin-bottom:1.2rem}.uts-login-official-grid{display:flex;gap:.75rem}.uts-login-official-card{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1rem .4rem;border-radius:16px;text-decoration:none;text-align:center;transition:transform .2s,box-shadow .2s}.uts-login-official-card.cu{background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff}.uts-login-official-card.cn{background:linear-gradient(135deg,#7f1d1d,#dc2626);color:#fff}.uts-login-official-card:hover{transform:translateY(-3px);box-shadow:0 12px 28px rgba(0,0,0,.2)}.uts-login-official-name{font-family:Bebas Neue,Rajdhani,sans-serif;font-size:1.5rem;letter-spacing:2px;line-height:1}.uts-login-official-desc{font-family:Rajdhani,Inter,sans-serif;font-size:.78rem;font-weight:700;letter-spacing:1px;opacity:.86;margin-top:.3rem}',
      '.uts-login-terms{margin-top:1.2rem;text-align:center;font-size:.7rem;color:#94a3b8;line-height:1.45}.uts-login-terms a{color:#64748b;text-decoration:none;font-weight:800}.uts-login-terms a:hover{text-decoration:underline}',
      '#uts-google-auth-modal .uts-google-user{grid-template-columns:52px minmax(0,1fr);border-color:#dbeafe;border-radius:18px;background:#f8fbff;margin-bottom:1rem}#uts-google-auth-modal .uts-google-user img{width:52px;height:52px}#uts-google-auth-modal .uts-google-actions{justify-content:center}.uts-cepre-box{background:linear-gradient(135deg,#f8fbff,#eff6ff)!important}',
      '@media(max-width:720px){#uts-google-auth-modal{padding:18px 14px!important}#uts-google-auth-modal.open{gap:clamp(34px,7vh,78px)!important}#uts-google-auth-modal:before{width:100%;flex-basis:min(34vh,320px);min-height:180px;background-size:30px 30px,30px 30px,100% 100%}#uts-google-auth-modal .uts-google-card{width:min(380px,94vw)!important;border-radius:22px!important}#uts-google-auth-modal .uts-google-body{padding:1.7rem 1.4rem 1.9rem!important}.uts-login-logo{font-size:2.15rem;letter-spacing:3.5px}.uts-login-official-grid{gap:.55rem}.uts-login-official-name{font-size:1.25rem}}',
      '#uts-google-auth-button{min-height:50px!important;padding:.58rem 1rem!important;font-size:.96rem!important;gap:.62rem!important}#uts-google-auth-button .uts-g-mark{width:30px!important;height:30px!important}#uts-google-auth-button img{width:32px!important;height:32px!important}',
      '.nav-actions .nav-user-btn{display:none!important}.nav-user-btn{min-height:46px!important;padding:.58rem 1rem!important;border-radius:999px!important}.nav-user-btn .uts-g-mark{display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#eaf4ff;color:#2563eb;font-weight:1000}.nav-user-btn img{width:30px;height:30px;border-radius:50%;object-fit:cover}.nav-user-btn .uts-g-label{display:grid;line-height:1.02}.nav-user-btn .uts-g-label small{font-size:.66rem;opacity:.72}',
      'body.uts-entry-gate{overflow:hidden!important}body.uts-entry-gate #uts-google-auth-modal{background:#fff!important;align-items:center!important;justify-content:center!important;padding:clamp(16px,4vw,34px)!important;overflow:auto!important;backdrop-filter:none!important}body.uts-entry-gate #uts-google-auth-modal.open{display:flex!important;flex-direction:column!important;gap:0!important}body.uts-entry-gate #uts-google-auth-modal:before{display:none!important}body.uts-entry-gate #uts-google-auth-modal .uts-google-card{margin:auto!important;width:min(390px,92vw)!important;box-shadow:0 28px 70px rgba(15,23,42,.14)!important}body.uts-entry-gate #uts-google-auth-modal .uts-google-close{display:none!important}body.uts-entry-gate .uts-login-official{display:none!important}',
      'body.uts-entry-gate .uts-login-official{display:block!important}body.uts-entry-gate .uts-login-official-grid{display:flex!important}',
      'body.uts-support-login #uts-google-auth-modal{background:rgba(255,255,255,.96)!important;align-items:center!important;justify-content:center!important;padding:clamp(16px,4vw,34px)!important;overflow:auto!important;backdrop-filter:blur(8px)!important}body.uts-support-login #uts-google-auth-modal.open{display:flex!important;flex-direction:column!important;gap:0!important}body.uts-support-login #uts-google-auth-modal:before{display:none!important}body.uts-support-login #uts-google-auth-modal .uts-google-card{margin:auto!important;width:min(430px,94vw)!important;max-height:min(92svh,760px)!important;overflow:auto!important;box-shadow:0 28px 70px rgba(15,23,42,.18)!important}body.uts-support-login .uts-login-official{display:block!important}body.uts-support-login .uts-login-official-grid{display:flex!important}',
      'body.uts-account-login #uts-google-auth-modal{background:rgba(255,255,255,.97)!important;align-items:center!important;justify-content:center!important;padding:clamp(16px,4vw,34px)!important;overflow:auto!important;backdrop-filter:blur(8px)!important}body.uts-account-login #uts-google-auth-modal.open{display:flex!important;flex-direction:column!important;gap:0!important}body.uts-account-login #uts-google-auth-modal:before{display:none!important}body.uts-account-login #uts-google-auth-modal .uts-google-card{margin:auto!important;width:min(430px,94vw)!important;max-height:min(92svh,760px)!important;overflow:auto!important;box-shadow:0 28px 70px rgba(15,23,42,.18)!important}body.uts-account-login .uts-login-official{display:block!important}body.uts-account-login .uts-login-official-grid{display:flex!important}',
      '@media(max-width:720px){#uts-google-auth-button{min-height:44px!important;right:max(8px,calc(env(safe-area-inset-right) + 8px))!important;padding:.52rem!important}.nav-user-btn{min-height:42px!important;padding:.52rem .68rem!important}.nav-user-btn .uts-g-label small{display:none}body.uts-entry-gate #uts-google-auth-modal{padding:18px 12px!important}body.uts-entry-gate #uts-google-auth-modal .uts-google-card{width:min(360px,94vw)!important}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function safeText(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function linkifyAnnouncementText(value) {
    var text = String(value == null ? '' : value);
    var pattern = /\b((?:https?:\/\/|www\.)[^\s<>"']+)/gi;
    var html = '';
    var lastIndex = 0;
    text.replace(pattern, function (match, url, offset) {
      var cleanUrl = url;
      var trailing = '';
      while (/[.,;:!?]$/.test(cleanUrl)) {
        trailing = cleanUrl.slice(-1) + trailing;
        cleanUrl = cleanUrl.slice(0, -1);
      }
      var href = /^www\./i.test(cleanUrl) ? 'https://' + cleanUrl : cleanUrl;
      html += safeText(text.slice(lastIndex, offset));
      html += '<a href="' + safeText(href) + '" target="_blank" rel="noopener noreferrer nofollow">' + safeText(cleanUrl) + '</a>' + safeText(trailing);
      lastIndex = offset + match.length;
      return match;
    });
    html += safeText(text.slice(lastIndex));
    return html.replace(/\r?\n/g, '<br>');
  }

  var WINDOWS_1252_BYTES = {
    '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86,
    '‡': 0x87, 'ˆ': 0x88, '‰': 0x89, 'Š': 0x8a, '‹': 0x8b, 'Œ': 0x8c,
    'Ž': 0x8e, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95,
    '–': 0x96, '—': 0x97, '˜': 0x98, '™': 0x99, 'š': 0x9a, '›': 0x9b,
    'œ': 0x9c, 'ž': 0x9e, 'Ÿ': 0x9f
  };
  var SUSPECT_ENCODING = /[ÃÂðâï]|&(?:amp;)?#(?:x[0-9a-f]+|[0-9]+);?|&(?:amp;)?(?:mdash|ndash|hellip|nbsp|quot|apos);/i;

  function byteForMojibakeCharacter(character) {
    var code = character.charCodeAt(0);
    if (code <= 255) return code;
    return Object.prototype.hasOwnProperty.call(WINDOWS_1252_BYTES, character)
      ? WINDOWS_1252_BYTES[character]
      : -1;
  }

  function decodeUtf8MojibakeFragment(fragment) {
    try {
      var bytes = Array.from(fragment).map(byteForMojibakeCharacter);
      if (bytes.some(function (value) { return value < 0; })) return fragment;
      var decoded = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bytes));
      return decoded && decoded !== fragment && decoded.indexOf('\ufffd') < 0 ? decoded : fragment;
    } catch (error) {
      return fragment;
    }
  }

  function repairMojibakeRuns(text) {
    var output = '';
    for (var index = 0; index < text.length;) {
      var character = text.charAt(index);
      if ('ÃÂðâï'.indexOf(character) < 0) {
        output += character;
        index += 1;
        continue;
      }
      var runEnd = index + 1;
      while (runEnd < text.length && text.charCodeAt(runEnd) > 127 && runEnd - index < 14) runEnd += 1;
      var replacement = character;
      var consumed = 1;
      for (var end = runEnd; end > index + 1; end -= 1) {
        var fragment = text.slice(index, end);
        var decoded = decodeUtf8MojibakeFragment(fragment);
        if (decoded !== fragment) {
          replacement = decoded;
          consumed = end - index;
          break;
        }
      }
      output += replacement;
      index += consumed;
    }
    return output;
  }

  function decodeVisibleEntities(text) {
    var named = { mdash: '—', ndash: '–', hellip: '…', nbsp: '\u00a0', quot: '"', apos: "'" };
    text = text.replace(/&(?:amp;)?#(x[0-9a-f]+|[0-9]+);?/gi, function (match, value) {
      var number = /^x/i.test(value) ? parseInt(value.slice(1), 16) : parseInt(value, 10);
      if (!Number.isFinite(number) || number < 0 || number > 0x10ffff || (number >= 0xd800 && number <= 0xdfff)) return match;
      try { return String.fromCodePoint(number); } catch (error) { return match; }
    });
    return text.replace(/&(?:amp;)?(mdash|ndash|hellip|nbsp|quot|apos);/gi, function (match, name) {
      return named[String(name).toLowerCase()] || match;
    });
  }

  function repairDisplayText(value) {
    var text = String(value == null ? '' : value);
    if (!SUSPECT_ENCODING.test(text) && text.indexOf('Caracter?sticas') < 0) return text;
    for (var pass = 0; pass < 3; pass += 1) {
      var previous = text;
      text = repairMojibakeRuns(decodeVisibleEntities(text)).replace(/Caracter\?sticas/g, 'Características');
      if (text === previous) break;
    }
    return text;
  }

  function repairUniverseTextNode(node) {
    if (!node || node.nodeType !== 3 || !node.nodeValue) return;
    if (!SUSPECT_ENCODING.test(node.nodeValue) && node.nodeValue.indexOf('Caracter?sticas') < 0) return;
    var parent = node.parentElement;
    if (parent && parent.closest('script,style,noscript,textarea')) return;
    var repaired = repairDisplayText(node.nodeValue);
    if (repaired !== node.nodeValue) node.nodeValue = repaired;
  }

  function repairUniverseElement(element) {
    if (!element || element.nodeType !== 1) return;
    ['title', 'aria-label', 'placeholder', 'alt'].forEach(function (attribute) {
      if (!element.hasAttribute(attribute)) return;
      var current = element.getAttribute(attribute) || '';
      var repaired = repairDisplayText(current);
      if (repaired !== current) element.setAttribute(attribute, repaired);
    });
  }

  function repairUniverseDocument(root) {
    if (!root) return;
    if (root.nodeType === 3) {
      repairUniverseTextNode(root);
      return;
    }
    if (root.nodeType !== 1 || root.matches('script,style,noscript,textarea')) return;
    repairUniverseElement(root);
    var visibleText = root.textContent || '';
    if (!SUSPECT_ENCODING.test(visibleText) && visibleText.indexOf('Caracter?sticas') < 0) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) repairUniverseTextNode(node);
    root.querySelectorAll('[title],[aria-label],[placeholder],[alt]').forEach(repairUniverseElement);
  }

  function observeUniverseEncoding() {
    if (!document.body || window.__universeEncodingObserver) return;
    repairUniverseDocument(document.body);
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'characterData') repairUniverseTextNode(mutation.target);
        mutation.addedNodes.forEach(repairUniverseDocument);
        if (mutation.type === 'attributes') repairUniverseElement(mutation.target);
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['title', 'aria-label', 'placeholder', 'alt']
    });
    window.__universeEncodingObserver = observer;
  }

  window.UniverseTextEncoding = { repair: repairDisplayText, repairDocument: repairUniverseDocument };

  function getStoredGoogleUser() {
    try {
      var raw = localStorage.getItem(AUTH_KEY) || '';
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function getLegacyUser() {
    try {
      var raw = localStorage.getItem(LEGACY_USER_KEY) || '';
      var user = raw ? JSON.parse(raw) : null;
      return user && user.provider === 'google' ? user : null;
    } catch (error) {
      return null;
    }
  }

  function getCurrentAuthUser() {
    return getStoredGoogleUser() || getLegacyUser();
  }

  function acceptSecureSession(user, token) {
    if (!user || !user.id || !token) return null;
    try { localStorage.setItem(AUTH_TOKEN_KEY, token); } catch (error) {}
    user = Object.assign({}, user, { secureSession: true, updatedAt: Date.now() });
    storeGoogleUser(user);
    try { localStorage.removeItem(GUEST_KEY); } catch (error) {}
    try { localStorage.setItem(FIRST_GATE_KEY, '1'); } catch (error) {}
    notifyAuthUpdated(user);
    return user;
  }

  function hasGuestMode() {
    try { return localStorage.getItem(GUEST_KEY) === '1'; } catch (error) { return false; }
  }

  function getOrCreateGuestUser() {
    var legacy = null;
    try {
      legacy = JSON.parse(localStorage.getItem(LEGACY_USER_KEY) || 'null');
    } catch (error) {}
    if (legacy && legacy.provider === 'guest' && legacy.id) return legacy;
    var now = Date.now();
    var guest = {
      id: 'guest_' + now.toString(36) + '_' + Math.random().toString(36).slice(2, 8),
      name: 'Invitado Universe',
      email: '',
      avatar: '',
      provider: 'guest',
      createdAt: now,
      updatedAt: now
    };
    try { localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(guest)); } catch (error) {}
    try { sessionStorage.setItem(LEGACY_USER_KEY, JSON.stringify(guest)); } catch (error) {}
    return guest;
  }

  function enterAsGuest() {
    try { localStorage.setItem(GUEST_KEY, '1'); } catch (error) {}
    try { localStorage.setItem(FIRST_GATE_KEY, '1'); } catch (error) {}
    getOrCreateGuestUser();
    try {
      if (typeof window.updateNavUser === 'function') window.updateNavUser();
    } catch (error) {}
    renderGoogleAuthButton();
    renderGoogleAuthPanel();
    closeGoogleAuthPanel();
  }

  function decodeGoogleJwt(token) {
    var payload = String(token || '').split('.')[1] || '';
    var base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    var decoded = atob(base64);
    var bytes = decoded.split('').map(function (char) {
      return '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2);
    }).join('');
    return JSON.parse(decodeURIComponent(bytes));
  }

  async function persistGoogleUser(profile, credential) {
    var now = Date.now();
    var previous = getCurrentAuthUser() || {};
    var user = {
      id: 'google_' + String(profile.sub || previous.id || now).replace(/[^a-zA-Z0-9_-]/g, ''),
      name: profile.name || profile.given_name || previous.name || 'Usuario Google',
      email: profile.email || previous.email || '',
      avatar: profile.picture || previous.avatar || '',
      provider: 'google',
      isAdmin: false,
      secureSession: false,
      createdAt: previous.createdAt || now,
      updatedAt: now
    };
    if (credential) {
      try {
        var response = await fetch(API_BASE + '/auth/google', {
          method: 'POST',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: credential })
        });
        if (response.ok) {
          var secure = await response.json();
          if (secure && secure.token) localStorage.setItem(AUTH_TOKEN_KEY, secure.token);
          if (secure && secure.user) {
            user = Object.assign(user, secure.user, {
              provider: 'google',
              createdAt: previous.createdAt || secure.user.createdAt || now,
              updatedAt: now,
              isAdmin: secure.user.isAdmin === true,
              secureSession: true
            });
          }
        } else {
          try { localStorage.removeItem(AUTH_TOKEN_KEY); } catch (error) {}
        }
      } catch (error) {
        try { localStorage.removeItem(AUTH_TOKEN_KEY); } catch (error2) {}
      }
    } else {
      try { localStorage.removeItem(AUTH_TOKEN_KEY); } catch (error) {}
    }
    storeGoogleUser(user);
    try { localStorage.removeItem(GUEST_KEY); } catch (error) {}
    try { localStorage.setItem(FIRST_GATE_KEY, '1'); } catch (error) {}
    notifyAuthUpdated(user);
    afterGoogleLogin(user);
    return user;
  }

  function afterGoogleLogin(user) {
    var plannerOwnLogin = document.documentElement && document.documentElement.dataset.universePage === 'planner';
    if (plannerOwnLogin) {
      closeGoogleAuthPanel();
      return;
    }
    var fromEntryGate = !!(document.body && document.body.classList.contains('uts-entry-gate'));
    if (!fromEntryGate) {
      renderGoogleAuthPanel();
      return;
    }
    var id = googleProfileId(user);
    if (!id) {
      closeGoogleAuthPanel();
      return;
    }
    siteApi('/profiles/' + id, 'GET').then(function (profile) {
      if (profile && profile.onboardingComplete) {
        closeGoogleAuthPanel();
        return;
      }
      showAcademicQuestionAfterGoogle();
    }).catch(function () {
      showAcademicQuestionAfterGoogle();
    });
  }

  function showAcademicQuestionAfterGoogle() {
    var modal = ensureGoogleAuthPanel();
    try {
      document.body.classList.remove('uts-entry-gate');
      document.body.classList.add('uts-account-login');
      document.body.classList.add('uts-google-auth-open');
    } catch (error) {}
    renderGoogleAuthPanel();
    modal.classList.add('open');
  }

  function signOutGoogleUser() {
    var user = getCurrentAuthUser();
    try {
      if (window.google && google.accounts && google.accounts.id && user && user.email) {
        google.accounts.id.disableAutoSelect();
      }
    } catch (error) {}
    try { localStorage.removeItem(AUTH_KEY); } catch (error) {}
    try { localStorage.removeItem(AUTH_TOKEN_KEY); } catch (error) {}
    try { localStorage.removeItem('universe_usuario_nombre'); } catch (error) {}
    try { localStorage.removeItem('universe_usuario_email'); } catch (error) {}
    try { localStorage.removeItem('universe_usuario_foto'); } catch (error) {}
    try {
      var guest = { id: 'guest_' + Date.now().toString(36), name: 'Invitado Universe', email: '', avatar: '', provider: 'guest', createdAt: Date.now() };
      localStorage.setItem(GUEST_KEY, '1');
      localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(guest));
      sessionStorage.setItem(LEGACY_USER_KEY, JSON.stringify(guest));
      if (typeof window.saveUser === 'function') window.saveUser(guest);
      if (typeof window.updateNavUser === 'function') window.updateNavUser();
    } catch (error) {}
    renderGoogleAuthButton();
    renderGoogleAuthPanel();
  }

  function ensureGoogleAuthButton() {
    if (!document.body) return null;
    var btn = document.getElementById('uts-google-auth-button');
    if (btn) return btn;
    var legacy = document.getElementById('nav-user-btn');
    if (legacy) {
      legacy.removeAttribute('data-uts-account-button');
      legacy.setAttribute('role', 'button');
      legacy.setAttribute('tabindex', '0');
      legacy.removeAttribute('onclick');
      legacy.onclick = null;
      if (!legacy.dataset.utsBound) {
        legacy.dataset.utsBound = 'true';
        legacy.addEventListener('click', goAccountPage);
        legacy.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            goAccountPage();
          }
        });
      }
    }
    btn = document.createElement('button');
    btn.id = 'uts-google-auth-button';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Abrir cuenta');
    btn.addEventListener('click', goAccountPage);
    document.body.appendChild(btn);
    return btn;
  }

  function renderGoogleAuthButton() {
    var btn = ensureGoogleAuthButton();
    if (!btn) return;
    var user = getCurrentAuthUser();
    if (user && (user.provider === 'google' || user.provider === 'universe')) {
      btn.innerHTML = (user.avatar ? '<img alt="" src="' + safeText(user.avatar) + '">' : '<span class="uts-g-mark">' + (user.provider === 'google' ? 'G' : 'U') + '</span>') +
        '<span class="uts-g-label">' + safeText(repairDisplayText(user.name || 'Cuenta').split(' ')[0]) + '<small>' + (user.provider === 'google' ? 'Google conectado' : 'Universe conectado') + '</small></span>';
      btn.setAttribute('aria-label', 'Abrir cuenta');
      btn.title = user.email || 'Abrir cuenta';
    } else if (hasGuestMode()) {
      btn.innerHTML = '<span class="uts-g-mark">U</span><span class="uts-g-label">Cuenta<small>Invitado</small></span>';
      btn.setAttribute('aria-label', 'Abrir cuenta');
      btn.title = 'Abrir cuenta';
    } else {
      btn.innerHTML = '<span class="uts-g-mark">G</span><span class="uts-g-label">Cuenta<small>Ingresar</small></span>';
      btn.setAttribute('aria-label', 'Abrir cuenta');
      btn.title = 'Abrir cuenta';
    }
    var accountSlot = document.querySelector('#home-account-slot, .uts-nav-account-slot');
    if (accountSlot && btn.parentElement !== accountSlot) accountSlot.appendChild(btn);
  }

  function ensureGoogleAuthPanel() {
    var modal = document.getElementById('uts-google-auth-modal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'uts-google-auth-modal';
    modal.addEventListener('click', function (event) {
      if (event.target === modal && !(document.body && document.body.classList.contains('uts-entry-gate'))) closeGoogleAuthPanel();
    });
    modal.innerHTML = '<section class="uts-google-card" role="dialog" aria-modal="true" aria-labelledby="uts-google-title">' +
      '<button class="uts-google-close" type="button" aria-label="Cerrar">×</button>' +
      '<div class="uts-google-body" id="uts-google-body"></div>' +
      '</section>';
    document.body.appendChild(modal);
    modal.querySelector('.uts-google-close').addEventListener('click', closeGoogleAuthPanel);
    return modal;
  }

  function renderLoginBrand(kicker) {
    return '<div class="uts-login-brand">' +
      '<div class="uts-login-logo" id="uts-google-title">UNIVERSE</div>' +
      '<div class="uts-login-tagline">' + safeText(kicker || 'PLATAFORMA PREUNIVERSITARIA - UNI') + '</div>' +
      '</div>';
  }

  function renderLoginDivider(label) {
    return '<div class="uts-login-divider"><span>' + safeText(label) + '</span></div>';
  }

  function renderOfficialLoginLinks() {
    return '<div class="uts-login-official">' + renderLoginDivider('o accede desde') +
      '<div class="uts-login-official-grid">' +
      '<a class="uts-login-official-card cu" href="https://www.cepre.uni.edu.pe/" rel="noopener noreferrer" target="_blank"><div class="uts-login-official-name">CEPREUNI</div><div class="uts-login-official-desc">Sitio Oficial</div></a>' +
      '<a class="uts-login-official-card cn" href="https://ceprenet.uni.edu.pe/auth/login" rel="noopener noreferrer" target="_blank"><div class="uts-login-official-name">CEPRENET</div><div class="uts-login-official-desc">Plataforma Virtual</div></a>' +
      '</div></div>';
  }

  function renderGuestAccessButton(label) {
    return '<div class="uts-login-guest-section"><button class="uts-login-guest-btn" type="button" data-uts-guest><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' + safeText(label || 'Entrar como invitado') + '</button></div>';
  }

  function renderLoginTerms() {
    return '<div class="uts-login-terms">Al continuar aceptas nuestros <a href="/terminos">Términos de Servicio</a> y <a href="/privacidad">Política de Privacidad</a> de UNIVERSE.</div>';
  }

  function renderGoogleAuthPanel() {
    var modal = ensureGoogleAuthPanel();
    var body = modal.querySelector('#uts-google-body');
    var user = getCurrentAuthUser();
    if (user && (user.provider === 'google' || user.provider === 'universe')) {
      var needsSecureRefresh = !user.secureSession || !getAuthToken();
      var isGoogleProvider = user.provider === 'google';
      body.innerHTML = renderLoginBrand(isGoogleProvider ? 'CUENTA CONECTADA - GOOGLE' : 'CUENTA CONECTADA - UNIVERSE') +
        '<div class="uts-google-user">' +
        (user.avatar ? '<img alt="" src="' + safeText(user.avatar) + '">' : '<div class="uts-g-mark">' + (isGoogleProvider ? 'G' : 'U') + '</div>') +
        '<div><b>' + safeText(repairDisplayText(user.name || 'Usuario Universe')) + '</b><span>' + safeText(user.email || (isGoogleProvider ? '' : 'Cuenta Universe')) + '</span></div></div>' +
        '<p class="uts-login-desc">Tu cuenta ya está conectada. Puedes continuar usando la plataforma o editar tus datos desde Cuenta.</p>' +
        (user.isAdmin && user.secureSession ? '<div class="uts-google-support-note"><strong>Administrador verificado</strong><span>El servidor privado reconoció esta cuenta como administradora.</span></div>' : '') +
        (needsSecureRefresh && isGoogleProvider ? '<div class="uts-google-support-note"><strong>Actualizar permisos con Google</strong><span>Vuelve a continuar con Google para actualizar la sesión segura.</span></div><div id="uts-google-signin-slot"></div>' : '') +
        renderCepreAccountBox() +
        '<div class="uts-google-actions"><button class="uts-google-primary" type="button" data-uts-account-page>Abrir cuenta completa</button><button class="uts-google-secondary" type="button" data-uts-close>Cerrar</button><button class="uts-google-danger" type="button" data-uts-signout>Cerrar sesion</button></div>';
      body.querySelector('[data-uts-account-page]').addEventListener('click', goAccountPage);
      body.querySelector('[data-uts-close]').addEventListener('click', closeGoogleAuthPanel);
      body.querySelector('[data-uts-signout]').addEventListener('click', signOutGoogleUser);
      if (needsSecureRefresh && isGoogleProvider) loadGoogleIdentity(renderGoogleSignInButton);
      hydrateCepreProfileBox(user);
    } else if (hasGuestMode()) {
      body.innerHTML = renderLoginBrand('MODO INVITADO - UNI') +
        '<p class="uts-login-desc">Para guardar tu perfil, vincular tu codigo CEPREUNI o usar soporte, inicia sesion con Google.</p>' +
        renderGuestAccessButton('Seguir como invitado') +
        renderLoginDivider('o inicia con Google') +
        '<div id="uts-google-signin-slot"></div>' +
        renderOfficialLoginLinks() +
        renderLoginTerms() +
        '<div class="uts-google-actions"><button class="uts-google-secondary" type="button" data-uts-close>Cerrar</button></div>';
      body.querySelector('[data-uts-guest]').addEventListener('click', enterAsGuest);
      body.querySelector('[data-uts-close]').addEventListener('click', closeGoogleAuthPanel);
      loadGoogleIdentity(renderGoogleSignInButton);
    } else {
      body.innerHTML = renderLoginBrand('PLATAFORMA PREUNIVERSITARIA - UNI') +
        '<p class="uts-login-desc">Accede como invitado para explorar el contenido educativo, o inicia sesion con Google para guardar tu perfil.</p>' +
        renderGuestAccessButton('Entrar como invitado') +
        renderLoginDivider('o inicia con Google') +
        '<div id="uts-google-signin-slot"></div>' +
        renderOfficialLoginLinks() +
        renderLoginTerms();
      body.querySelector('[data-uts-guest]').addEventListener('click', enterAsGuest);
      loadGoogleIdentity(renderGoogleSignInButton);
    }
  }

  function renderRegisteredData(user, title) {
    var created = user && user.createdAt ? new Date(user.createdAt).toLocaleString('es-PE') : 'No registrado';
    var updated = user && user.updatedAt ? new Date(user.updatedAt).toLocaleString('es-PE') : 'No registrado';
    return '<h3 style="margin:10px 0 8px;font-size:14px">' + safeText(title || 'Datos') + '</h3>' +
      '<dl class="uts-google-data">' +
      '<div><dt>Nombre</dt><dd>' + safeText(repairDisplayText(user && user.name || 'Invitado')) + '</dd></div>' +
      '<div><dt>Correo</dt><dd>' + safeText(user && user.email || 'Sin correo registrado') + '</dd></div>' +
      '<div><dt>Tipo</dt><dd>' + safeText(user && user.provider === 'google' ? 'Google' : 'Invitado local') + '</dd></div>' +
      '<div><dt>ID local</dt><dd>' + safeText(user && user.id || '') + '</dd></div>' +
      '<div><dt>Creado</dt><dd>' + safeText(created) + '</dd></div>' +
      '<div><dt>Actualizado</dt><dd>' + safeText(updated) + '</dd></div>' +
      '</dl>';
  }

  function googleProfileId(user) {
    return cleanAccountId(user && (user.id || user.email) || '');
  }

  function loadCepreCodes() {
    if (Array.isArray(window.UNIVERSE_CEPRE_VALID_CODES)) return Promise.resolve(window.UNIVERSE_CEPRE_VALID_CODES);
    return new Promise(function (resolve) {
      var existing = document.getElementById(CEPRE_CODES_SCRIPT_ID);
      if (existing) {
        existing.addEventListener('load', function () { resolve(window.UNIVERSE_CEPRE_VALID_CODES || []); }, { once: true });
        existing.addEventListener('error', function () { resolve([]); }, { once: true });
        return;
      }
      var script = document.createElement('script');
      script.id = CEPRE_CODES_SCRIPT_ID;
      script.src = 'cepre-codes.js?v=account-5';
      script.onload = function () { resolve(window.UNIVERSE_CEPRE_VALID_CODES || []); };
      script.onerror = function () { resolve([]); };
      document.head.appendChild(script);
    });
  }

  function cycleOptions(selected) {
    selected = selected || CURRENT_CEPRE_CYCLE;
    return CEPRE_CYCLES.map(function (cycle) {
      return '<option value="' + safeText(cycle) + '"' + (cycle === selected ? ' selected' : '') + '>' + safeText(cycle) + (cycle === CURRENT_CEPRE_CYCLE ? ' · ciclo actual' : '') + '</option>';
    }).join('');
  }

  function renderCepreAccountBox() {
    return '<section class="uts-cepre-box" id="uts-cepre-box"><div class="uts-cepre-loading">Cargando datos CEPREUNI...</div></section>';
  }

  function academyOptions(selected) {
    return ['<option value="">Selecciona academia</option>'].concat(ACADEMIES.map(function (name) {
      return '<option value="' + safeText(name) + '"' + (name === selected ? ' selected' : '') + '>' + safeText(name) + '</option>';
    })).join('');
  }

  function renderCepreProfileForm(profile, community, user) {
    profile = profile || {};
    community = community || {};
    if (profile.onboardingComplete && community.username) {
      return '<div class="uts-cepre-head"><div><b>Perfil conectado</b><span>Tu configuraci\u00f3n acad\u00e9mica ya qued\u00f3 guardada en esta cuenta.</span></div><i>Completado</i></div>' +
        '<div class="uts-google-data"><div><dt>Usuario</dt><dd>@' + safeText(community.username) + '</dd></div>' +
        '<div><dt>Perfil</dt><dd>' + safeText(repairDisplayText(community.displayName || user && user.name || 'Estudiante Universe')) + '</dd></div>' +
        '<div><dt>Preparaci\u00f3n</dt><dd>' + safeText(profile.academicTrack === 'academy' ? profile.academyName : profile.academicTrack || 'Registrado') + '</dd></div></div>' +
        '<div class="uts-google-actions"><button class="uts-google-primary" type="button" data-uts-account-page>Editar en Mi cuenta</button></div>';
    }
    var track = profile.academicTrack || '';
    var cycle = profile.cepreCycle || CURRENT_CEPRE_CYCLE;
    var displayName = repairDisplayText(community.displayName || user && user.name || '');
    return '<div class="uts-cepre-head"><div><b>Completa tu perfil una sola vez</b><span>Estos datos quedar\u00e1n conectados a tu cuenta Google y podr\u00e1s editarlos luego desde Mi cuenta.</span></div></div>' +
      '<div class="uts-cepre-grid">' +
      '<label>Nombre de usuario<input id="uts-community-username" maxlength="24" placeholder="Ejemplo: criss_uni" value="' + safeText(community.username || '') + '"></label>' +
      '<label>Nombre visible<input id="uts-community-name" maxlength="40" placeholder="C\u00f3mo quieres que te llamen" value="' + safeText(displayName) + '"></label>' +
      '<label>Tipo de estudiante<select id="uts-academic-track"><option value=""' + (!track ? ' selected' : '') + '>Selecciona una opci\u00f3n</option><option value="cepreuni"' + (track === 'cepreuni' ? ' selected' : '') + '>Soy CEPREUNI</option><option value="uni-student"' + (track === 'uni-student' ? ' selected' : '') + '>Soy estudiante UNI</option><option value="san-marcos"' + (track === 'san-marcos' ? ' selected' : '') + '>Postulo a San Marcos</option><option value="academy"' + (track === 'academy' ? ' selected' : '') + '>Estoy en una academia</option><option value="independent"' + (track === 'independent' ? ' selected' : '') + '>Soy estudiante independiente</option></select></label>' +
      '<label id="uts-academy-wrap">Academia preuniversitaria<select id="uts-academy-name">' + academyOptions(profile.academyName || '') + '</select></label>' +
      '<label id="uts-cepre-cycle-wrap">Ciclo CEPREUNI<select id="uts-cepre-cycle">' + cycleOptions(cycle) + '</select></label>' +
      '<label>Objetivo<select id="uts-community-target"><option value="">Selecciona una opci\u00f3n</option><option value="UNI">UNI</option><option value="San Marcos">San Marcos</option><option value="Otra universidad">Otra universidad</option><option value="A\u00fan no lo decido">A\u00fan no lo decido</option></select></label>' +
      '</div><p class="uts-cepre-mini" id="uts-cepre-explain"></p>' +
      '<div class="uts-google-actions"><button class="uts-google-primary" type="button" id="uts-cepre-save">Guardar y continuar</button></div>' +
      '<div class="uts-google-hint" id="uts-cepre-status">Tu correo, tel\u00e9fono y permisos nunca se mostrar\u00e1n en UNITALK.</div>';
  }

  function toggleCepreModalFields(profile) {
    profile = profile || {};
    var track = document.getElementById('uts-academic-track');
    var cycle = document.getElementById('uts-cepre-cycle');
    var academyWrap = document.getElementById('uts-academy-wrap');
    var cycleWrap = document.getElementById('uts-cepre-cycle-wrap');
    var explain = document.getElementById('uts-cepre-explain');
    if (!track || !cycle || !academyWrap || !cycleWrap || !explain) return;
    var value = track.value;
    var isCepre = value === 'cepreuni';
    var isCurrent = cycle.value === CURRENT_CEPRE_CYCLE;
    academyWrap.hidden = value !== 'academy';
    cycleWrap.hidden = !isCepre;
    explain.textContent = value === 'cepreuni' ? (isCurrent ? 'Guardaremos tu ciclo. El c\u00f3digo CEPREUNI se vincula despu\u00e9s desde Mi cuenta para validarlo con seguridad.' : 'Para ciclos anteriores basta registrar el ciclo.') :
      value === 'uni-student' ? 'Guardaremos tu perfil como estudiante de la Universidad Nacional de Ingenier\u00eda.' :
      value === 'san-marcos' ? 'Guardaremos tu perfil como postulante San Marcos para personalizar temario y simulacros.' :
      value === 'academy' ? 'Selecciona tu academia preuniversitaria para ordenar mejor tus recursos.' :
      value === 'independent' ? 'Tu perfil quedar\u00e1 como estudiante independiente o aut\u00f3nomo.' :
      'Elige tu perfil acad\u00e9mico para personalizar tu experiencia.';
  }

  function hydrateCepreProfileBox(user) {
    var box = document.getElementById('uts-cepre-box');
    var id = googleProfileId(user);
    if (!box || !id) return;
    Promise.all([
      siteApi('/profiles/' + id, 'GET').catch(function () { return null; }),
      unitalkApi('/me', 'GET').catch(function () { return null; })
    ]).then(function (results) {
      var profile = results[0] || {};
      var community = results[1] && results[1].profile || {};
      box.innerHTML = renderCepreProfileForm(profile, community, user);
      var accountPage = box.querySelector('[data-uts-account-page]');
      if (accountPage) { accountPage.addEventListener('click', goAccountPage); return; }
      var member = document.getElementById('uts-academic-track');
      var cycle = document.getElementById('uts-cepre-cycle');
      if (member) member.addEventListener('change', function () { toggleCepreModalFields(profile); });
      if (cycle) cycle.addEventListener('change', function () { toggleCepreModalFields(profile); });
      var save = document.getElementById('uts-cepre-save');
      if (save) save.addEventListener('click', function () { saveCepreProfileFromModal(user, profile, community); });
      toggleCepreModalFields(profile);
    });
  }

  async function saveCepreProfileFromModal(user, profile, community) {
    profile = profile || {};
    community = community || {};
    var status = document.getElementById('uts-cepre-status');
    var trackEl = document.getElementById('uts-academic-track');
    var academyEl = document.getElementById('uts-academy-name');
    var cycle = document.getElementById('uts-cepre-cycle');
    var usernameEl = document.getElementById('uts-community-username');
    var nameEl = document.getElementById('uts-community-name');
    var targetEl = document.getElementById('uts-community-target');
    var id = googleProfileId(user);
    if (!id || !trackEl || !cycle) return;
    var track = trackEl.value || '';
    var selectedCycle = track === 'cepreuni' ? String(cycle.value || CURRENT_CEPRE_CYCLE) : '';
    var payload = {
      username: String(usernameEl && usernameEl.value || '').trim().toLowerCase(),
      displayName: String(nameEl && nameEl.value || '').trim(),
      target: String(targetEl && targetEl.value || ''),
      academicTrack: track,
      academyName: track === 'academy' && academyEl ? academyEl.value : '',
      cepreCycle: selectedCycle,
      avatar: community.avatar || user.avatar || '',
      profileVisibility: 'public',
      showAvatar: true,
      showAcademy: true,
      showCycle: true,
      showTarget: true
    };
    if (!/^[a-z0-9][a-z0-9_-]{2,23}$/.test(payload.username)) { if (status) status.textContent = 'El nombre de usuario debe tener entre 3 y 24 caracteres y usar letras, n\u00fameros, guion o guion bajo.'; return; }
    if (!payload.displayName) { if (status) status.textContent = 'Escribe el nombre que quieres mostrar.'; return; }
    if (!track) { if (status) status.textContent = 'Elige si eres CEPREUNI, estudiante UNI, San Marcos, academia o estudiante independiente.'; return; }
    if (track === 'academy' && !payload.academyName) { if (status) status.textContent = 'Selecciona tu academia preuniversitaria.'; return; }
    if (!payload.target) { if (status) status.textContent = 'Selecciona a d\u00f3nde est\u00e1s postulando.'; return; }
    try {
      await unitalkApi('/onboarding', 'POST', payload);
      if (status) status.textContent = 'Perfil conectado correctamente. Ya puedes participar en UNITALK.';
      if (UniverseGoogleAuth.refresh) await UniverseGoogleAuth.refresh().catch(function () {});
      setTimeout(function () { closeGoogleAuthPanel(); }, 650);
    } catch (error) {
      if (status) status.textContent = error.message === 'username_taken' ? 'Ese nombre de usuario ya est\u00e1 ocupado.' : 'No se pudo guardar el perfil. Revisa los datos e int\u00e9ntalo nuevamente.';
    }
  }

  function openGoogleAuthPanel(options) {
    options = options || {};
    var modal = ensureGoogleAuthPanel();
    var accountMode = !!options.account || (!options.entryGate && !options.support);
    try {
      document.body.classList.toggle('uts-entry-gate', !!options.entryGate);
      document.body.classList.toggle('uts-support-login', !!options.support);
      document.body.classList.toggle('uts-account-login', accountMode);
    } catch (error) {}
    renderGoogleAuthPanel();
    modal.classList.add('open');
    try { document.body.classList.add('uts-google-auth-open'); } catch (error) {}
  }

  function openSupportLoginPanel() {
    openGoogleAuthPanel({ support: true });
    var user = getCurrentAuthUser();
    if (user && user.provider === 'google') return;
    var body = document.getElementById('uts-google-body');
    if (!body || body.querySelector('.uts-google-support-note')) return;
    var note = document.createElement('div');
    note.className = 'uts-google-support-note';
    note.innerHTML = '<strong>Soporte requiere cuenta de Gmail</strong><span>Para proteger tu consulta, inicia sesión con Google. El chat usará automáticamente tu nombre de Gmail.</span>';
    body.insertBefore(note, body.firstChild);
  }

  function closeGoogleAuthPanel() {
    var modal = document.getElementById('uts-google-auth-modal');
    if (modal) modal.classList.remove('open');
    try { document.body.classList.remove('uts-google-auth-open'); document.body.classList.remove('uts-entry-gate'); document.body.classList.remove('uts-support-login'); document.body.classList.remove('uts-account-login'); } catch (error) {}
  }

  function loadGoogleIdentity(callback) {
    if (window.google && google.accounts && google.accounts.id) {
      callback();
      return;
    }
    var existing = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }
    var script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = callback;
    script.onerror = function () {
      var slot = document.getElementById('uts-google-signin-slot');
      if (slot) slot.innerHTML = '<p class="uts-google-hint">No se pudo cargar Google en este momento. Revisa la conexión o intenta de nuevo.</p>';
    };
    document.head.appendChild(script);
  }

  function renderGoogleSignInButton() {
    var slot = document.getElementById('uts-google-signin-slot');
    if (!slot || !(window.google && google.accounts && google.accounts.id)) return;
    slot.innerHTML = '';
    try {
      if (!GOOGLE_IDENTITY_INITIALIZED) {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: function (response) {
            var currentSlot = document.getElementById('uts-google-signin-slot');
            if (!currentSlot) return;
            try {
              var profile = decodeGoogleJwt(response && response.credential);
              persistGoogleUser(profile, response && response.credential).catch(function () {
                currentSlot.innerHTML = '<p class="uts-google-hint">No se pudo validar con el servidor privado. Inténtalo otra vez.</p>';
              });
            } catch (error) {
              currentSlot.innerHTML = '<p class="uts-google-hint">No se pudo leer la respuesta de Google. Inténtalo otra vez.</p>';
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: 'popup'
        });
        GOOGLE_IDENTITY_INITIALIZED = true;
      }
      google.accounts.id.renderButton(slot, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        logo_alignment: 'left',
        width: 300
      });
    } catch (error) {
      slot.innerHTML = '<p class="uts-google-hint">Google rechazó la inicialización. Verifica que universetostudy.com esté autorizado en Google Cloud.</p>';
    }
  }

  function initGoogleAuth() {
    addGoogleAuthStyles();
    renderGoogleAuthButton();
    window.UniverseGoogleAuth = {
      open: openGoogleAuthPanel,
      requireSupport: openSupportLoginPanel,
      close: closeGoogleAuthPanel,
      user: getCurrentAuthUser,
      isAdmin: isAdminGoogleUser,
      refresh: refreshSecureSession,
      acceptSession: acceptSecureSession,
      siteApi: siteApi,
      cleanId: cleanAccountId,
      isGoogleUser: function () {
        var user = getCurrentAuthUser();
        return !!(user && user.provider === 'google');
      },
      signOut: signOutGoogleUser,
      guest: enterAsGuest
    };
    window.handleNavUser = goAccountPage;
    window.updateNavUser = renderGoogleAuthButton;
    renderGoogleAuthButton();
    refreshSecureSession();
    setTimeout(renderGoogleAuthButton, 900);
    setTimeout(renderGoogleAuthButton, 2400);
    setTimeout(function () {
      var currentUser = getCurrentAuthUser();
      var hasUser = !!(currentUser && currentUser.secureSession === true && ['google', 'universe'].includes(currentUser.provider));
      var alreadyGuest = hasGuestMode();
      var plannerOwnLogin = document.documentElement && document.documentElement.dataset.universePage === 'planner';
      if (!hasUser && !alreadyGuest && !plannerOwnLogin) openGoogleAuthPanel({ entryGate: true });
    }, 650);
  }

  function ensureSupportDom() {
    if (!document.body || document.getElementById('support-v2-root')) return;
    ['support-v2-overlay', 'support-v2-hint', 'support-v2-fab', 'support-v2-panel'].forEach(function (id) {
      var old = document.getElementById(id);
      if (old && old.parentNode) old.parentNode.removeChild(old);
    });
    var wrap = document.createElement('div');
    wrap.id = 'support-v2-root';
    wrap.innerHTML =
      '<div id="support-v2-overlay" onclick="UniverseSupport.close()"></div>' +
      '<div id="support-v2-hint">¿Problemas? Te ayudamos</div>' +
      '<button aria-label="Abrir soporte privado" id="support-v2-fab" onclick="UniverseSupport.open()" title="Soporte" type="button">' +
      '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 2a9 9 0 0 0-9 9v3a3 3 0 0 0 3 3h1v-7H5.1A7 7 0 0 1 19 11v6h-5v2h3a4 4 0 0 0 4-4v-4a9 9 0 0 0-9-9ZM5 12h2v3H6a1 1 0 0 1-1-1v-2Zm12 0h2v3h-2v-3Z"></path></svg><span>Soporte</span><i id="support-v2-fab-dot"></i></button>' +
      '<aside aria-hidden="true" id="support-v2-panel"><header class="support-v2-head"><div><strong>Soporte Universe to Study</strong><span id="support-v2-presence">Comprobando conexión...</span></div><button aria-label="Cerrar soporte" onclick="UniverseSupport.close()" type="button">×</button></header>' +
      '<div class="support-v2-admin-layout visitor"><aside hidden id="support-v2-inbox"><div class="support-v2-inbox-title">Conversaciones</div><div id="support-v2-threads"></div></aside><main class="support-v2-conversation">' +
      '<div class="support-v2-thread-head"><div><strong id="support-v2-thread-name">Tu consulta</strong><span id="support-v2-thread-status">Chat privado</span></div><button hidden id="support-v2-solved" onclick="UniverseSupport.solve()" type="button">Solucionado</button></div>' +
      '<label class="support-v2-name-row" id="support-v2-name-row"><span>Tu nombre</span><input id="support-v2-name" maxlength="50" placeholder="Usaremos tu nombre de Gmail" type="text"></label>' +
      '<div aria-live="polite" id="support-v2-messages"></div><div hidden id="support-v2-closed">El chat ha sido cerrado. Vuelve a consultar abriendo otra vez el chat de soporte.</div>' +
      '<div hidden id="support-v2-image-preview"><img alt="Vista previa" id="support-v2-preview-img"><button onclick="UniverseSupport.clearImage()" type="button">Quitar</button></div>' +
      '<div class="support-v2-compose" id="support-v2-compose"><textarea id="support-v2-input" maxlength="1200" placeholder="Escribe tu consulta..."></textarea><div><label class="support-v2-attach" for="support-v2-file">Adjuntar imagen</label><input accept="image/png,image/jpeg,image/webp" id="support-v2-file" onchange="UniverseSupport.pickImage(this)" type="file"><button class="support-v2-send" onclick="UniverseSupport.send()" type="button">Enviar</button></div></div>' +
      '</main></div></aside>';
    document.body.appendChild(wrap);
  }

  function initFallbackSupport() {
    ensureSupportDom();
    if (window.UniverseSupport || !document.getElementById('support-v2-panel')) return;
    var BASE = API_BASE + '/support';
    var S = { admin: false, open: false, active: '', thread: null, threads: {}, image: '', timer: 0, presenceTimer: 0, ipMatch: false };
    function el(id) { return document.getElementById(id); }
    function cleanId(v) { return String(v || '').replace(/[^a-zA-Z0-9_-]/g, ''); }
    function makeId() { return 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 12); }
    function getOwnerFlag() { return false; }
    function setOwnerFlag(value) {}
    function threadId() { var id = ''; try { id = localStorage.getItem('universe_support_thread_v2') || ''; } catch (error) {} if (!id) { id = makeId(); try { localStorage.setItem('universe_support_thread_v2', id); } catch (error) {} } return cleanId(id); }
    function resetThread() { var id = makeId(); try { localStorage.setItem('universe_support_thread_v2', id); localStorage.removeItem('universe_support_closed_v2'); } catch (error) {} S.active = id; S.thread = null; }
    function profile() { var g = getCurrentAuthUser(); if (g && g.provider === 'google') { var gid = g.id || g.email || threadId(); var gname = g.name || (g.email ? String(g.email).split('@')[0] : 'Usuario Google'); return { id: cleanId(gid), name: String(gname).slice(0, 50), email: String(g.email || ''), avatar: String(g.avatar || '') }; } return { id: threadId(), name: 'Usuario', email: '', avatar: '' }; }
    function requireGoogleSupport() { if (S.admin) return true; var g = getCurrentAuthUser(); if (g && g.provider === 'google') return true; openSupportLoginPanel(); return false; }
    async function api(route, method, data) { var headers = { 'Content-Type': 'application/json' }; try { var token = localStorage.getItem(AUTH_TOKEN_KEY); if (token) headers.Authorization = 'Bearer ' + token; } catch (error) {} var options = { method: method || 'GET', cache: 'no-store', headers: headers }; if (data !== undefined) options.body = JSON.stringify(data); var response = await fetch(BASE + route, options); if (!response.ok) throw new Error('HTTP ' + response.status); return method === 'DELETE' ? null : response.json(); }
    function listMessages(obj) { return Object.keys(obj || {}).map(function (k) { var m = obj[k] || {}; m._key = k; return m; }).sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); }).slice(-160); }
    function welcome() { return '<div class="support-v2-msg bot"><div class="support-v2-bubble"><strong>UNIverseIA</strong><br/>Hola, soy UNIverseIA, el asistente de recepción de Soporte Universe to Study. Este espacio organiza tu consulta de forma individual. Para usar soporte necesitas iniciar sesión con Google.</div><div class="support-v2-meta">Mensaje de bienvenida</div></div>'; }
    function renderMessages() { var box = el('support-v2-messages'); if (!box) return; var thread = S.admin ? S.threads[S.active] : S.thread, messages = listMessages(thread && thread.messages || {}); var html = welcome(); messages.forEach(function (m) { var mine = S.admin ? !!m.admin : !m.admin; html += '<div class="support-v2-msg ' + (mine ? 'mine' : '') + '"><div class="support-v2-bubble">' + (m.text ? safeText(m.text).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>').replace(/\n/g, '<br/>') : '') + (m.image && /^data:image\/(png|jpeg|webp);base64,/i.test(m.image) ? '<img alt="Imagen adjunta" src="' + safeText(m.image) + '"/>' : '') + '</div><div class="support-v2-meta">' + safeText(m.name || 'Usuario') + ' · ' + new Date(m.ts || Date.now()).toLocaleString('es-PE', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) + '</div></div>'; }); box.innerHTML = html; box.scrollTop = box.scrollHeight; var closed = !!(thread && thread.meta && thread.meta.status === 'closed'); if (el('support-v2-closed')) el('support-v2-closed').hidden = !closed; if (el('support-v2-compose')) el('support-v2-compose').hidden = closed || (!S.active && S.admin); if (el('support-v2-solved')) el('support-v2-solved').hidden = !S.admin || !S.active || closed; if (el('support-v2-thread-name')) el('support-v2-thread-name').textContent = S.admin ? (thread && thread.meta && thread.meta.userName || 'Selecciona una conversación') : 'Tu consulta'; if (el('support-v2-thread-status')) el('support-v2-thread-status').textContent = closed ? 'Conversación solucionada' : 'Chat privado'; }
    function renderInbox() { var box = el('support-v2-threads'); if (!box) return; var items = Object.keys(S.threads || {}).map(function (id) { var t = S.threads[id] || {}, meta = t.meta || {}; return { id: id, t: t, updated: meta.updatedAt || 0 }; }).filter(function (x) { return !(x.t.meta && x.t.meta.archived); }).sort(function (a, b) { return b.updated - a.updated; }); if (S.active && !S.threads[S.active]) S.active = ''; box.innerHTML = items.map(function (x) { var m = x.t.meta || {}; return '<button class="support-v2-thread ' + (x.id === S.active ? 'active' : '') + '" data-support-id="' + safeText(x.id) + '" type="button">' + (m.unread ? '<b></b>' : '') + '<strong>' + safeText(m.userName || 'Usuario') + '</strong><span>' + safeText(m.lastText || m.userEmail || 'Nueva consulta') + '</span></button>'; }).join('') || '<div class="support-v2-inbox-title">No hay consultas pendientes.</div>'; box.querySelectorAll('[data-support-id]').forEach(function (btn) { btn.onclick = function () { S.active = btn.getAttribute('data-support-id') || ''; var t = S.threads[S.active]; if (t && t.meta) { t.meta.unread = false; api('/threads/' + S.active + '/meta', 'PATCH', { unread: false }).catch(function () {}); } renderInbox(); renderMessages(); }; }); }
    async function load() { if (!S.open) return; try { if (S.admin) { S.threads = await api('/threads') || {}; renderInbox(); } else { S.active = threadId(); S.thread = await api('/threads/' + S.active) || {}; var presence = await api('/presence/admin').catch(function () { return null; }); var online = !!(presence && Date.now() - (presence.ts || 0) < 65000); if (el('support-v2-presence')) el('support-v2-presence').textContent = online ? 'Soporte conectado ahora' : 'Soporte desconectado · deja tu consulta'; if (el('support-v2-fab-dot')) el('support-v2-fab-dot').classList.toggle('online', online); } renderMessages(); } catch (error) { if (el('support-v2-presence')) el('support-v2-presence').textContent = 'Sin conexión temporal'; renderMessages(); } }
    async function heartbeat() { if (!S.admin) return; await api('/presence/admin', 'PUT', { online: true, ts: Date.now() }).catch(function () {}); }
    async function validOwnerKey(key) { return false; }
    async function detectAdmin() { S.ipMatch = false; S.admin = !!isAdminGoogleUser(); var layout = document.querySelector('.support-v2-admin-layout'), inbox = el('support-v2-inbox'), nameRow = el('support-v2-name-row'), presence = el('support-v2-presence'); if (layout) { layout.classList.toggle('admin', S.admin); layout.classList.toggle('visitor', !S.admin); } if (inbox) inbox.hidden = !S.admin; if (nameRow) nameRow.hidden = true; if (presence) presence.textContent = S.admin ? 'Panel privado del propietario' : 'Comprobando conexión...'; if (S.admin) { heartbeat(); clearInterval(S.presenceTimer); S.presenceTimer = setInterval(heartbeat, 25000); } }
    async function send() { if (!S.admin && !requireGoogleSupport()) return; var input = el('support-v2-input'), txt = String(input && input.value || '').trim(); if (!txt && !S.image) return; var p = profile(), id = S.admin ? S.active : threadId(); if (!id) return; var thread = S.admin ? S.threads[id] : S.thread || {}, meta = thread && thread.meta || {}; var msg = { name: S.admin ? 'Soporte Universe to Study' : p.name, userId: p.id, userEmail: S.admin ? '' : p.email, userAvatar: S.admin ? '' : p.avatar, admin: S.admin, text: txt.slice(0, 1200), image: S.image || '', ts: Date.now(), page: location.pathname }; if (input) input.value = ''; clearImage(); try { await api('/threads/' + id + '/messages', 'POST', msg); await api('/threads/' + id + '/meta', 'PATCH', { userId: meta.userId || p.id, userName: meta.userName || p.name, userEmail: meta.userEmail || p.email, userAvatar: meta.userAvatar || p.avatar, lastText: txt || 'Imagen adjunta', updatedAt: msg.ts, status: 'open', archived: false, unread: !S.admin }); await load(); } catch (error) { if (input) input.value = txt; alert('No se pudo enviar. Revisa tu conexión.'); } }
    async function solve() { if (!S.admin || !S.active) return; await api('/threads/' + S.active + '/meta', 'PATCH', { status: 'closed', archived: true, unread: false, updatedAt: Date.now(), lastText: 'Consulta solucionada' }).catch(function () {}); S.active = ''; await load(); }
    function pickImage(input) { var file = input.files && input.files[0]; if (!file) return; if (file.size > 700000) { alert('La imagen debe pesar menos de 700 KB.'); input.value = ''; return; } var reader = new FileReader(); reader.onload = function () { S.image = String(reader.result || ''); if (el('support-v2-preview-img')) el('support-v2-preview-img').src = S.image; if (el('support-v2-image-preview')) el('support-v2-image-preview').hidden = false; }; reader.readAsDataURL(file); }
    function clearImage() { S.image = ''; if (el('support-v2-file')) el('support-v2-file').value = ''; if (el('support-v2-image-preview')) el('support-v2-image-preview').hidden = true; if (el('support-v2-preview-img')) el('support-v2-preview-img').removeAttribute('src'); }
    async function open() { await detectAdmin(); if (!S.admin && !requireGoogleSupport()) return; if (!S.admin) { try { if (localStorage.getItem('universe_support_closed_v2') === '1') resetThread(); } catch (error) {} } S.open = true; document.body.classList.add('support-v2-active'); if (el('support-v2-panel')) el('support-v2-panel').classList.add('open'); if (el('support-v2-overlay')) el('support-v2-overlay').classList.add('open'); if (el('support-v2-panel')) el('support-v2-panel').setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; load(); clearInterval(S.timer); S.timer = setInterval(load, 4000); }
    function close() { var thread = S.admin ? S.threads[S.active] : S.thread; if (!S.admin && thread && thread.meta && thread.meta.status === 'closed') { try { localStorage.setItem('universe_support_closed_v2', '1'); } catch (error) {} } S.open = false; document.body.classList.remove('support-v2-active'); if (el('support-v2-panel')) el('support-v2-panel').classList.remove('open'); if (el('support-v2-overlay')) el('support-v2-overlay').classList.remove('open'); if (el('support-v2-panel')) el('support-v2-panel').setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; clearInterval(S.timer); }
    window.UniverseSupport = { open: open, close: close, send: send, solve: solve, pickImage: pickImage, clearImage: clearImage };
    window.openUniverseSupportChat = window.openUniverseSupportChat || function () { window.UniverseSupport.open(); };
    var name = el('support-v2-name'); if (name) { name.value = profile().name; name.readOnly = true; name.placeholder = 'Usaremos tu nombre de Gmail'; }
    var input = el('support-v2-input'); if (input) input.addEventListener('keydown', function (event) { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } });
    detectAdmin();
  }

  function renderPublicAnnouncement(announcement) {
    var old = document.getElementById('uts-announcement-layer');
    if (old) old.remove();
    if (!announcement || !announcement.active) return;
    if ((document.documentElement.getAttribute('data-universe-page') || '') !== 'home') return;
    var stamp = String(announcement.updatedAt || announcement.createdAt || '');
    try {
      if (stamp && localStorage.getItem('uts_announcement_closed') === stamp) return;
    } catch (error) {}
    var layer = document.createElement('div');
    layer.id = 'uts-announcement-layer';
    layer.className = 'uts-announcement-layer';
    var card = document.createElement('aside');
    card.id = 'uts-public-announcement';
    card.className = 'uts-public-announcement';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-labelledby', 'uts-announcement-title');
    var announcementEnglish = document.documentElement.getAttribute('data-universe-language') === 'en';
    var announcementImages = Array.isArray(announcement.images) ? announcement.images.filter(Boolean) : [];
    if (!announcementImages.length && announcement.image) announcementImages = [announcement.image];
    var imageMarkup = announcementImages.length ? '<figure class="uts-announcement-gallery" data-count="' + announcementImages.length + '">' + announcementImages.map(function (src, index) {
      return '<img alt="Imagen ' + (index + 1) + ' del comunicado Universe" src="' + safeText(src) + '" referrerpolicy="no-referrer">';
    }).join('') + '</figure>' : '';
    card.innerHTML =
      '<button type="button" class="uts-ann-close" aria-label="Cerrar comunicado">×</button>' +
      imageMarkup +
      '<div class="uts-announcement-content"><span>Comunicado</span><strong id="uts-announcement-title">' + safeText(announcement.title || 'Universe to Study') + '</strong>' +
      (announcement.text ? '<p>' + linkifyAnnouncementText(announcement.text) + '</p>' : '') +
      '<div class="uts-announcement-actions"><button type="button" class="uts-ann-like" aria-pressed="false">♥ <b>0</b> ' + (announcementEnglish ? 'Like' : 'Me gusta') + '</button>' +
      '<small class="uts-ann-like-status" aria-live="polite">' + (announcementEnglish ? 'Be the first to react' : 'Sé la primera persona en reaccionar') + '</small></div></div>';
    layer.appendChild(card);
    var likeButton = card.querySelector('.uts-ann-like');
    var likeStatus = card.querySelector('.uts-ann-like-status');
    function updateAnnouncementLike(result) {
      result = result || {};
      var count = Math.max(0, Number(result.likes) || 0);
      var liked = result.liked === true;
      likeButton.setAttribute('aria-pressed', liked ? 'true' : 'false');
      likeButton.querySelector('b').textContent = count.toLocaleString(announcementEnglish ? 'en-US' : 'es-PE');
      likeStatus.textContent = announcementEnglish
        ? (liked ? 'You liked this announcement' : count === 1 ? '1 reaction' : count + ' reactions')
        : (liked ? 'Te gusta este comunicado' : count === 1 ? '1 reacción' : count + ' reacciones');
    }
    function loadAnnouncementLike() {
      return siteApi('/public/announcement/like?clientId=' + encodeURIComponent(getPublicClientId()), 'GET')
        .then(updateAnnouncementLike)
        .catch(function () { likeStatus.textContent = announcementEnglish ? 'Reaction unavailable' : 'Reacción no disponible'; });
    }
    likeButton.onclick = function () {
      if (likeButton.disabled) return;
      likeButton.disabled = true;
      siteApi('/public/announcement/like', 'POST', { clientId: getPublicClientId() })
        .then(updateAnnouncementLike)
        .catch(function () { likeStatus.textContent = announcementEnglish ? 'Could not save your reaction' : 'No se pudo guardar tu reacción'; })
        .finally(function () { likeButton.disabled = false; });
    };
    loadAnnouncementLike();
    function closeAnnouncement() {
      try { if (stamp) localStorage.setItem('uts_announcement_closed', stamp); } catch (error) {}
      layer.remove();
      document.removeEventListener('keydown', onAnnouncementKeydown);
    }
    function onAnnouncementKeydown(event) {
      if (event.key === 'Escape') closeAnnouncement();
    }
    card.querySelector('.uts-ann-close').onclick = closeAnnouncement;
    layer.onclick = function (event) { if (event.target === layer) closeAnnouncement(); };
    document.addEventListener('keydown', onAnnouncementKeydown);
    document.body.prepend(layer);
    window.setTimeout(function () { var close = card.querySelector('.uts-ann-close'); if (close) close.focus(); }, 0);
  }

  function applyPublicSchedule(schedule) {
    if (!schedule || (document.documentElement.getAttribute('data-universe-page') || '') !== 'home') return;
    var countdowns = schedule.countdowns || {};
    Object.keys(countdowns).forEach(function (key) {
      var item = countdowns[key] || {};
      var card = document.querySelector('[data-countdown-key="' + key + '"]');
      if (!card) return;
      if (item.target) card.dataset.countdownTarget = item.target;
      var strong = card.querySelector('.countdown-label strong');
      var pill = card.querySelector('.countdown-pill');
      if (strong && item.title) strong.textContent = item.title;
      if (pill && item.label) pill.textContent = item.label;
    });
    window.UNIVERSE_DYNAMIC_PAYMENT_EVENTS = Array.isArray(schedule.extraEvents) ? schedule.extraEvents : [];
    if (typeof window.startUniverseCountdowns === 'function') window.startUniverseCountdowns();
    if (typeof window.renderPaymentCalendar === 'function') window.renderPaymentCalendar();
  }

  function loadUniversePublicSettings() {
    siteApi('/public', 'GET').then(function (data) {
      data = data || {};
      window.UNIVERSE_PUBLIC_SETTINGS = data;
      renderPublicAnnouncement(data.announcement);
      applyPublicSchedule(data.schedule);
      window.dispatchEvent(new CustomEvent('universe-public-settings', { detail: data }));
    }).catch(function () {});
  }

  function forceRevealVisible() {
    try {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('visible');
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        el.style.transform = 'none';
        el.style.filter = 'none';
      });
    } catch (error) {}
  }

  function recoverRankingTable() {
    if ((document.documentElement.getAttribute('data-universe-page') || '') !== 'ranking') return;
    var dataNode = document.getElementById('cepre2026-ranking-data');
    var body = document.getElementById('cepre2026-cepre-v2-body');
    if (!dataNode || !body || body.children.length) return;
    var table = document.getElementById('cepre2026-cepre-v2-table');
    var input = document.getElementById('cepre2026-cepre-v2-search');
    var summary = document.getElementById('cepre2026-cepre-v2-summary');
    var data = [];
    try { data = JSON.parse(dataNode.textContent || '[]'); } catch (error) { data = []; }
    if (!Array.isArray(data) || !data.length) {
      body.innerHTML = '<tr><td colspan="12" class="cepre-v2-missing">No se pudo cargar la tabla de promedios. Actualiza la página.</td></tr>';
      return;
    }
    var limit = 420, showAll = false, activeSede = table && table.dataset ? (table.dataset.sede || '') : '';
    function fmt(v) {
      var n = Number(v || 0);
      return n.toLocaleString('es-PE', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    }
    function cell(v, discarded) {
      var n = Number(v || 0);
      return '<td class="' + (discarded ? 'cepre-v2-discard ' : '') + (n <= 0 ? 'cepre-v2-zero' : '') + '">' + (n > 0 ? fmt(n) : '—') + (discarded ? '<span>Descartada</span>' : '') + '</td>';
    }
    function rowHTML(r) {
      var out = '<tr><td class="cepre-v2-position">' + safeText(r[0]) + '</td><th scope="row" class="cepre-v2-code">' + safeText(r[1]) + '</th>';
      for (var i = 0; i < 6; i++) out += cell(r[2 + i], r[12] === i);
      out += cell(r[8], false) + cell(r[9], false) + '<td>' + fmt(r[10]) + '</td><td>' + safeText(r[11] || 'Lima') + '</td></tr>';
      return out;
    }
    function filtered() {
      var q = input ? String(input.value || '').trim().toLowerCase() : '';
      return data.filter(function (r) {
        var sedeOk = !activeSede || r[11] === activeSede;
        var qOk = !q || String(r[1] || '').toLowerCase().indexOf(q) >= 0;
        return sedeOk && qOk;
      });
    }
    function render() {
      var rows = filtered();
      var visible = showAll ? rows : rows.slice(0, limit);
      body.innerHTML = visible.map(rowHTML).join('') || '<tr><td colspan="12" class="cepre-v2-missing">No hay códigos con ese filtro.</td></tr>';
      if (summary) {
        summary.textContent = 'Mostrando ' + visible.length + ' de ' + rows.length + ' estudiantes' + (activeSede ? ' · Sede ' + activeSede : '') + '. Promedio con PC1-PC6, EP1 y EP2; la menor PC se descarta.';
      }
    }
    if (input && !input.dataset.utsRankingFallback) {
      input.dataset.utsRankingFallback = '1';
      input.addEventListener('input', render);
    }
    document.querySelectorAll('.cepre-v2-site-button').forEach(function (btn) {
      if (btn.dataset.utsRankingFallback) return;
      btn.dataset.utsRankingFallback = '1';
      btn.addEventListener('click', function () {
        activeSede = btn.dataset.sede || '';
        if (table) table.dataset.sede = activeSede;
        document.querySelectorAll('.cepre-v2-site-button').forEach(function (b) { b.classList.toggle('active', b === btn); });
        render();
      });
    });
    var more = document.querySelector('[data-cepre-v2-show-all]');
    if (more && !more.dataset.utsRankingFallback) {
      more.dataset.utsRankingFallback = '1';
      more.addEventListener('click', function () { showAll = true; more.hidden = true; render(); });
    }
    render();
  }

  function boot() {
    try { applyUniverseTheme(localStorage.getItem('universe_theme') === 'dark' ? 'dark' : 'light'); } catch (error) {}
    observeUniverseEncoding();
    forceRevealVisible();
    moveThemeToggleToViewport();
    activateUniverseNav();
    recoverRankingTable();
    initGoogleAuth();
    ensureUnifiedNavigation();
    ['support-v2-root', 'support-v2-overlay', 'support-v2-hint', 'support-v2-panel'].forEach(function (id) {
      var legacySupport = document.getElementById(id);
      if (legacySupport) legacySupport.remove();
    });
    loadUniversePublicSettings();
    startSitePresence();
    setTimeout(forceRevealVisible, 120);
    setTimeout(ensureUnifiedNavigation, 160);
    setTimeout(recoverRankingTable, 700);
    var whatsappSupportUrl = 'https://wa.me/51963385410?text=Hola%2C%20necesito%20ayuda%20con%20Universe%20to%20Study';
    window.UniverseSupport = {
      open: function () { window.open(whatsappSupportUrl, '_blank', 'noopener,noreferrer'); },
      close: function () {}
    };
    window.openUniverseSupportChat = window.UniverseSupport.open;
    var supportFab = document.getElementById('support-v2-fab');
    if (!supportFab) {
      supportFab = document.createElement('a');
      supportFab.id = 'support-v2-fab';
      document.body.appendChild(supportFab);
    }
    supportFab.setAttribute('aria-label', 'Contactar por WhatsApp');
    supportFab.setAttribute('title', 'Soporte por WhatsApp');
    supportFab.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 2a9.5 9.5 0 0 0-8.2 14.3L2.5 21.5l5.3-1.3A9.5 9.5 0 1 0 12 2Zm0 17.2c-1.4 0-2.8-.4-4-1.1l-.3-.2-3.1.8.8-3-.2-.3A7.7 7.7 0 1 1 12 19.2Zm4.3-5.5c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.2l-.7.9c-.1.2-.3.2-.5.1-1.4-.7-2.3-1.3-3.2-2.9-.2-.3.2-.5.6-1 .1-.2.1-.3 0-.5l-.7-1.8c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.7 1.1 2.9c.1.2 2 3 4.8 4.2 1.8.8 2.5.8 3.4.7.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1-.1-.2-.3-.2-.5-.3Z"></path></svg><span>WhatsApp</span>';
    if (supportFab.tagName === 'A') {
      supportFab.setAttribute('href', whatsappSupportUrl);
      supportFab.setAttribute('target', '_blank');
      supportFab.setAttribute('rel', 'noopener noreferrer');
    } else {
      supportFab.onclick = window.UniverseSupport.open;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
