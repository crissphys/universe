(function () {
  var GOOGLE_CLIENT_ID = '410302293146-nr50k7kovcpd5kuekfd49ddqc041612g.apps.googleusercontent.com';
  var GOOGLE_SCRIPT_ID = 'uts-google-identity-script';
  var AUTH_KEY = 'universe_google_user';
  var LEGACY_USER_KEY = 'universe_user';

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
    var grouped = {
      ranking: 'cepre',
      calculator: 'cepre',
      exams: 'simulators',
      'admission-results': 'admission'
    };
    var active = grouped[page] || page;
    document.querySelectorAll('nav a[data-route]').forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('data-route') === active);
    });
  }

  function addGoogleAuthStyles() {
    if (document.getElementById('uts-google-auth-style')) return;
    var style = document.createElement('style');
    style.id = 'uts-google-auth-style';
    style.textContent = [
      '#uts-google-auth-button{display:inline-flex!important;align-items:center;justify-content:center;gap:8px;min-height:38px;border:1px solid rgba(59,130,246,.28);border-radius:999px;background:linear-gradient(135deg,rgba(255,255,255,.94),rgba(236,247,255,.9));color:#0f3d75;box-shadow:0 10px 26px rgba(37,99,235,.14);padding:7px 12px;font:900 12px/1 Inter,system-ui,sans-serif;cursor:pointer;white-space:nowrap;transition:.2s;z-index:2147482450}',
      '#uts-google-auth-button:hover{transform:translateY(-1px);box-shadow:0 14px 32px rgba(37,99,235,.2)}',
      '#uts-google-auth-button .uts-g-mark{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#fff;color:#2563eb;font-weight:1000;box-shadow:inset 0 0 0 1px rgba(37,99,235,.18)}',
      '#uts-google-auth-button img{width:24px;height:24px;border-radius:50%;object-fit:cover}',
      '#uts-google-auth-button small{display:block;font-size:9px;color:#64748b;font-weight:900;line-height:1;margin-top:2px}',
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
      '.uts-google-hint{margin-top:10px;color:#64748b;font-size:11px;line-height:1.45;text-align:center}',
      'html[data-universe-theme="dark"] #uts-google-auth-button{background:linear-gradient(135deg,#071426,#0f2744);color:#e5f2ff;border-color:rgba(96,165,250,.28)}',
      'html[data-universe-theme="dark"] #uts-google-auth-button small{color:#cbd5e1}',
      'html[data-universe-theme="dark"] .uts-google-card{background:#061120;color:#f8fafc;border-color:#1e3a5f}',
      'html[data-universe-theme="dark"] .uts-google-body p,html[data-universe-theme="dark"] .uts-google-user span,html[data-universe-theme="dark"] .uts-google-hint{color:#cbd5e1}',
      'html[data-universe-theme="dark"] .uts-google-user{background:#071426;border-color:#1e3a5f}',
      'body.support-v2-active #uts-google-auth-button{z-index:2147482400!important;pointer-events:none!important;opacity:.18!important;filter:grayscale(1)!important}',
      '@media(max-width:720px){#uts-google-auth-button{position:fixed;left:max(14px,env(safe-area-inset-left));bottom:max(76px,calc(env(safe-area-inset-bottom) + 76px));padding:10px;border-radius:999px}#uts-google-auth-button .uts-g-label{display:none}.uts-google-card{border-radius:22px}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function safeText(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

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

  function decodeGoogleJwt(token) {
    var payload = String(token || '').split('.')[1] || '';
    var base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    var decoded = atob(base64);
    var bytes = decoded.split('').map(function (char) {
      return '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2);
    }).join('');
    return JSON.parse(decodeURIComponent(bytes));
  }

  function persistGoogleUser(profile) {
    var now = Date.now();
    var previous = getCurrentAuthUser() || {};
    var user = {
      id: 'google_' + String(profile.sub || previous.id || now).replace(/[^a-zA-Z0-9_-]/g, ''),
      name: profile.name || profile.given_name || previous.name || 'Usuario Google',
      email: profile.email || previous.email || '',
      avatar: profile.picture || previous.avatar || '',
      provider: 'google',
      createdAt: previous.createdAt || now,
      updatedAt: now
    };
    try { localStorage.setItem(AUTH_KEY, JSON.stringify(user)); } catch (error) {}
    try { localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(user)); } catch (error) {}
    try { sessionStorage.setItem(LEGACY_USER_KEY, JSON.stringify(user)); } catch (error) {}
    try { localStorage.setItem('universe_usuario_nombre', user.name); } catch (error) {}
    try { localStorage.setItem('universe_usuario_email', user.email); } catch (error) {}
    try { localStorage.setItem('universe_usuario_foto', user.avatar); } catch (error) {}
    try {
      if (typeof window.saveUser === 'function') window.saveUser(user);
      if (typeof window.updateNavUser === 'function') window.updateNavUser();
      if (typeof window.renderAccountPanel === 'function') window.renderAccountPanel();
    } catch (error) {}
    window.dispatchEvent(new CustomEvent('universe-google-auth', { detail: user }));
    renderGoogleAuthButton();
    renderGoogleAuthPanel();
    return user;
  }

  function signOutGoogleUser() {
    var user = getCurrentAuthUser();
    try {
      if (window.google && google.accounts && google.accounts.id && user && user.email) {
        google.accounts.id.disableAutoSelect();
      }
    } catch (error) {}
    try { localStorage.removeItem(AUTH_KEY); } catch (error) {}
    try { localStorage.removeItem('universe_usuario_nombre'); } catch (error) {}
    try { localStorage.removeItem('universe_usuario_email'); } catch (error) {}
    try { localStorage.removeItem('universe_usuario_foto'); } catch (error) {}
    try {
      var guest = { id: 'guest_' + Date.now().toString(36), name: 'Invitado Universe', email: '', avatar: '', provider: 'guest', createdAt: Date.now() };
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
    btn = document.createElement('button');
    btn.id = 'uts-google-auth-button';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Ingresar con Google');
    btn.addEventListener('click', openGoogleAuthPanel);
    var navActions = document.querySelector('nav .nav-actions') || document.querySelector('nav');
    if (navActions) navActions.appendChild(btn);
    else document.body.appendChild(btn);
    return btn;
  }

  function renderGoogleAuthButton() {
    var btn = ensureGoogleAuthButton();
    if (!btn) return;
    var user = getCurrentAuthUser();
    if (user && user.provider === 'google') {
      btn.innerHTML = (user.avatar ? '<img alt="" src="' + safeText(user.avatar) + '">' : '<span class="uts-g-mark">G</span>') +
        '<span class="uts-g-label">' + safeText((user.name || 'Cuenta').split(' ')[0]) + '<small>Google conectado</small></span>';
      btn.setAttribute('aria-label', 'Cuenta Google conectada');
      btn.title = user.email || 'Cuenta Google conectada';
    } else {
      btn.innerHTML = '<span class="uts-g-mark">G</span><span class="uts-g-label">Ingresar<small>con Google</small></span>';
      btn.setAttribute('aria-label', 'Ingresar con Google');
      btn.title = 'Ingresar con Google';
    }
  }

  function ensureGoogleAuthPanel() {
    var modal = document.getElementById('uts-google-auth-modal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'uts-google-auth-modal';
    modal.addEventListener('click', function (event) {
      if (event.target === modal) closeGoogleAuthPanel();
    });
    modal.innerHTML = '<section class="uts-google-card" role="dialog" aria-modal="true" aria-labelledby="uts-google-title">' +
      '<header class="uts-google-head"><div><strong id="uts-google-title">Cuenta Universe</strong><span>Registro opcional con Google</span></div><button class="uts-google-close" type="button" aria-label="Cerrar">×</button></header>' +
      '<div class="uts-google-body" id="uts-google-body"></div>' +
      '</section>';
    document.body.appendChild(modal);
    modal.querySelector('.uts-google-close').addEventListener('click', closeGoogleAuthPanel);
    return modal;
  }

  function renderGoogleAuthPanel() {
    var modal = ensureGoogleAuthPanel();
    var body = modal.querySelector('#uts-google-body');
    var user = getCurrentAuthUser();
    if (user && user.provider === 'google') {
      body.innerHTML = '<div class="uts-google-user">' +
        (user.avatar ? '<img alt="" src="' + safeText(user.avatar) + '">' : '<div class="uts-g-mark">G</div>') +
        '<div><b>' + safeText(user.name || 'Usuario Google') + '</b><span>' + safeText(user.email || '') + '</span></div></div>' +
        '<p>Tu cuenta ya está conectada en este navegador. No volveremos a pedirte el registro mientras no cierres sesión o borres los datos del navegador.</p>' +
        '<div class="uts-google-actions"><button class="uts-google-secondary" type="button" data-uts-close>Cerrar</button><button class="uts-google-danger" type="button" data-uts-signout>Cerrar sesión</button></div>';
      body.querySelector('[data-uts-close]').addEventListener('click', closeGoogleAuthPanel);
      body.querySelector('[data-uts-signout]').addEventListener('click', signOutGoogleUser);
    } else {
      body.innerHTML = '<p>Conecta tu cuenta de Google para guardar tu nombre, correo y foto en Universe to Study. Es opcional: puedes seguir usando la página sin registrarte.</p>' +
        '<div id="uts-google-signin-slot"></div>' +
        '<div class="uts-google-hint">Si ya te registraste antes, este botón no volverá a aparecer como obligación: solo verás tu cuenta conectada.</div>' +
        '<div class="uts-google-actions"><button class="uts-google-secondary" type="button" data-uts-close>Seguir sin cuenta</button></div>';
      body.querySelector('[data-uts-close]').addEventListener('click', closeGoogleAuthPanel);
      loadGoogleIdentity(renderGoogleSignInButton);
    }
  }

  function openGoogleAuthPanel() {
    var modal = ensureGoogleAuthPanel();
    renderGoogleAuthPanel();
    modal.classList.add('open');
    try { document.body.classList.add('uts-google-auth-open'); } catch (error) {}
  }

  function closeGoogleAuthPanel() {
    var modal = document.getElementById('uts-google-auth-modal');
    if (modal) modal.classList.remove('open');
    try { document.body.classList.remove('uts-google-auth-open'); } catch (error) {}
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
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: function (response) {
          try {
            var profile = decodeGoogleJwt(response && response.credential);
            persistGoogleUser(profile);
            closeGoogleAuthPanel();
          } catch (error) {
            slot.innerHTML = '<p class="uts-google-hint">No se pudo leer la respuesta de Google. Inténtalo otra vez.</p>';
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        ux_mode: 'popup'
      });
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
      close: closeGoogleAuthPanel,
      user: getCurrentAuthUser,
      signOut: signOutGoogleUser
    };
  }

  function boot() {
    moveThemeToggleToViewport();
    activateUniverseNav();
    initGoogleAuth();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
