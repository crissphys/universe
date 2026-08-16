(function () {
  'use strict';

  var menuButton = document.getElementById('home-menu-toggle');
  var menu = document.getElementById('home-nav-links');

  function setMenu(open) {
    if (!menuButton || !menu) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    menu.classList.toggle('open', open);
    document.body.classList.toggle('home-menu-open', open);
  }

  function closeMenu() {
    setMenu(false);
  }

  if (menuButton && menu) {
    menu.setAttribute('aria-hidden', 'true');
    menuButton.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      var open = menuButton.getAttribute('aria-expanded') === 'true';
      setMenu(!open);
    });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('click', function (event) {
      if (!menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) closeMenu();
    }, { passive: true });
  }

  var accountSlot = document.getElementById('home-account-slot');

  function placeAccountButton() {
    if (!accountSlot) return false;
    var button = document.getElementById('uts-google-auth-button') || document.querySelector('[data-uts-account-button="true"]');
    if (!button) return false;
    if (button.parentNode !== accountSlot) accountSlot.appendChild(button);
    return true;
  }

  if (!placeAccountButton() && document.body && 'MutationObserver' in window) {
    var accountObserver = new MutationObserver(function () {
      if (placeAccountButton()) accountObserver.disconnect();
    });
    accountObserver.observe(document.body, { childList: true, subtree: true });
  }

  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('.home-reveal'));
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (item) { item.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    revealItems.forEach(function (item) { observer.observe(item); });
  }

  var countdowns = Array.prototype.slice.call(document.querySelectorAll('.home-countdown[data-target]'));
  var countdownTimer = 0;

  function two(value) { return String(Math.max(0, value)).padStart(2, '0'); }

  function renderCountdown() {
    if (!countdowns.length) return;
    var now = Date.now();
    var nextCountdown = null;

    countdowns.forEach(function (countdown) {
      var target = new Date(countdown.getAttribute('data-target')).getTime();
      var distance = target - now;
      var caption = countdown.querySelector('.countdown-caption');
      var values;

      countdown.classList.remove('is-next');
      if (!Number.isFinite(target) || distance <= 0) {
        values = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        countdown.classList.add('is-complete');
        if (caption) caption.textContent = countdown.getAttribute('data-complete') || 'Prueba finalizada';
      } else {
        countdown.classList.remove('is-complete');
        if (!nextCountdown || target < nextCountdown.target) nextCountdown = { node: countdown, target: target };
        values = {
          days: Math.floor(distance / 86400000),
          hours: Math.floor((distance % 86400000) / 3600000),
          minutes: Math.floor((distance % 3600000) / 60000),
          seconds: Math.floor((distance % 60000) / 1000)
        };
        if (caption) caption.textContent = 'Tiempo restante';
      }

      Object.keys(values).forEach(function (unit) {
        var node = countdown.querySelector('[data-count="' + unit + '"]');
        if (node) node.textContent = two(values[unit]);
      });
    });

    if (nextCountdown) nextCountdown.node.classList.add('is-next');
    else if (countdownTimer) window.clearInterval(countdownTimer);
  }

  if (countdowns.length) {
    renderCountdown();
    countdownTimer = window.setInterval(renderCountdown, 1000);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) renderCountdown();
    });
  }

  var worldChatFeed = document.getElementById('home-world-chat-feed');
  var worldChatForm = document.getElementById('home-world-chat-form');
  var worldChatInput = document.getElementById('home-world-chat-input');
  var worldChatCount = document.getElementById('home-world-chat-count');
  var worldChatStatus = document.getElementById('home-world-chat-status');
  var worldChatSend = document.getElementById('home-world-chat-send');
  var worldChatRefresh = document.getElementById('home-world-chat-refresh');
  var worldChatTimer = 0;

  function safeText(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function richCommunityText(value) {
    var source = String(value || '');
    var output = '';
    var cursor = 0;
    source.replace(/https?:\/\/[^\s<>"']+/gi, function (match, offset) {
      var url = match;
      var tail = '';
      while (/[.,!?;:)\]]$/.test(url)) {
        tail = url.slice(-1) + tail;
        url = url.slice(0, -1);
      }
      output += safeText(source.slice(cursor, offset));
      output += '<a href="' + safeText(url) + '" target="_blank" rel="ugc nofollow noopener noreferrer">' + safeText(url) + '</a>' + safeText(tail);
      cursor = offset + match.length;
      return match;
    });
    output += safeText(source.slice(cursor));
    return output.replace(/(^|\s)#([\p{L}\p{N}_]{2,30})/gu, function (_, prefix, tag) {
      return prefix + '<a href="/unitalk?tag=' + encodeURIComponent(tag) + '">#' + safeText(tag) + '</a>';
    });
  }

  function worldChatToken() {
    try { return localStorage.getItem('universe_auth_token') || ''; }
    catch (error) { return ''; }
  }

  function worldChatApi(path, options) {
    options = options || {};
    var headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    var token = worldChatToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    return fetch('/api/unitalk' + path, Object.assign({ cache: 'no-store', headers: headers }, options)).then(async function (response) {
      var payload = await response.json().catch(function () { return {}; });
      if (!response.ok) {
        var error = new Error(payload.error || 'request_failed');
        error.status = response.status;
        throw error;
      }
      return payload;
    });
  }

  function worldChatRelativeTime(value) {
    var seconds = Math.max(1, Math.floor((Date.now() - (Number(value) || 0)) / 1000));
    if (seconds < 60) return 'ahora';
    if (seconds < 3600) return 'hace ' + Math.floor(seconds / 60) + ' min';
    if (seconds < 86400) return 'hace ' + Math.floor(seconds / 3600) + ' h';
    return 'hace ' + Math.floor(seconds / 86400) + ' d';
  }

  function renderWorldChat(posts) {
    if (!worldChatFeed) return;
    posts = Array.isArray(posts) ? posts.slice(0, 5) : [];
    if (!posts.length) {
      worldChatFeed.innerHTML = '<div class="home-world-chat-empty">Todavía no hay mensajes. Sé la primera persona en iniciar la conversación.</div>';
      return;
    }
    worldChatFeed.innerHTML = posts.map(function (post) {
      var author = post.author || {};
      var name = author.displayName || author.username || 'Estudiante Universe';
      var initial = String(name).charAt(0).toUpperCase();
      var avatar = author.avatar ? '<img src="' + safeText(author.avatar) + '" alt="">' : safeText(initial);
      var message = post.text || (post.attachment ? 'Compartió un archivo en UNITALK.' : 'Nueva publicación en UNITALK.');
      return '<article class="home-world-chat-message"><span class="home-world-chat-avatar">' + avatar + '</span>' +
        '<div class="home-world-chat-copy"><div class="home-world-chat-meta"><b>' + safeText(name) + '</b><time>' + safeText(worldChatRelativeTime(post.createdAt)) + '</time></div>' +
        '<p>' + richCommunityText(message) + '</p></div></article>';
    }).join('');
  }

  async function loadWorldChat(silent) {
    if (!worldChatFeed) return;
    if (!silent) worldChatFeed.innerHTML = '<div class="home-world-chat-loading">Cargando la conversación…</div>';
    try {
      var payload = await worldChatApi('/feed?limit=5');
      renderWorldChat(payload.posts);
    } catch (error) {
      if (!silent) worldChatFeed.innerHTML = '<div class="home-world-chat-empty">La conversación no está disponible por el momento. Puedes entrar directamente a UNITALK.</div>';
    }
  }

  function setWorldChatStatus(message, kind) {
    if (!worldChatStatus) return;
    worldChatStatus.textContent = message;
    worldChatStatus.classList.toggle('is-error', kind === 'error');
    worldChatStatus.classList.toggle('is-success', kind === 'success');
  }

  function openWorldChatLogin() {
    if (window.UniverseGoogleAuth && typeof window.UniverseGoogleAuth.open === 'function') {
      window.UniverseGoogleAuth.open({ account: true });
    } else {
      location.href = '/account';
    }
  }

  async function publishWorldChat(event) {
    event.preventDefault();
    var text = String(worldChatInput && worldChatInput.value || '').trim();
    if (!text) {
      setWorldChatStatus('Escribe un mensaje antes de publicarlo.', 'error');
      return;
    }
    if (!worldChatToken()) {
      setWorldChatStatus('Inicia sesión con Google para participar.', 'error');
      openWorldChatLogin();
      return;
    }
    if (worldChatSend) worldChatSend.disabled = true;
    setWorldChatStatus('Publicando en UNITALK…');
    try {
      await worldChatApi('/posts', { method: 'POST', body: JSON.stringify({ text: text, discussion: false }) });
      if (worldChatInput) worldChatInput.value = '';
      if (worldChatCount) worldChatCount.textContent = '0/400';
      setWorldChatStatus('Tu mensaje ya aparece en UNITALK.', 'success');
      await loadWorldChat(true);
    } catch (error) {
      if (error.message === 'login_required') {
        setWorldChatStatus('Tu sesión venció. Inicia sesión con Google otra vez.', 'error');
        openWorldChatLogin();
      } else if (error.message === 'profile_required') {
        setWorldChatStatus('Completa primero tu perfil de UNITALK desde Mi cuenta.', 'error');
        window.setTimeout(function () { location.href = '/account'; }, 900);
      } else if (error.message === 'contenido_no_permitido') {
        setWorldChatStatus('Ese mensaje incumple las normas de convivencia.', 'error');
      } else if (error.message === 'demasiados_enlaces') {
        setWorldChatStatus('Solo puedes incluir hasta dos enlaces.', 'error');
      } else if (error.message === 'rate_limited') {
        setWorldChatStatus('Espera un momento antes de volver a publicar.', 'error');
      } else {
        setWorldChatStatus('No se pudo publicar. Inténtalo nuevamente.', 'error');
      }
    } finally {
      if (worldChatSend) worldChatSend.disabled = false;
    }
  }

  if (worldChatFeed) {
    loadWorldChat(false);
    worldChatTimer = window.setInterval(function () {
      if (!document.hidden) loadWorldChat(true);
    }, 15000);
  }
  if (worldChatRefresh) worldChatRefresh.addEventListener('click', function () { loadWorldChat(false); });
  if (worldChatForm) worldChatForm.addEventListener('submit', publishWorldChat);
  if (worldChatInput) worldChatInput.addEventListener('input', function () {
    if (worldChatCount) worldChatCount.textContent = worldChatInput.value.length + '/400';
    if (worldChatStatus && (worldChatStatus.classList.contains('is-error') || worldChatStatus.classList.contains('is-success'))) {
      setWorldChatStatus(worldChatToken() ? 'Tu mensaje se publicará también en UNITALK.' : 'Necesitas una cuenta de Google registrada para publicar.');
    }
  });

  var year = document.getElementById('home-year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
