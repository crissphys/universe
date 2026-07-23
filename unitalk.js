(function () {
  'use strict';
  var TOKEN_KEY = 'universe_auth_token';
  var state = { me: null, academic: null, posts: [], loading: false };

  function $(id) { return document.getElementById(id); }
  function safe(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }
  function token() { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (error) { return ''; } }
  function api(path, method, data) {
    var headers = { 'Content-Type': 'application/json' };
    var currentToken = token();
    if (currentToken) headers.Authorization = 'Bearer ' + currentToken;
    var options = { method: method || 'GET', cache: 'no-store', headers: headers };
    if (data !== undefined) options.body = JSON.stringify(data);
    return fetch('/api/unitalk' + path, options).then(async function (response) {
      var payload = await response.json().catch(function () { return {}; });
      if (!response.ok) {
        var error = new Error(payload.error || 'request_failed');
        error.status = response.status;
        throw error;
      }
      return payload;
    });
  }
  function currentGoogleUser() {
    return window.UniverseGoogleAuth && UniverseGoogleAuth.user ? UniverseGoogleAuth.user() : null;
  }
  function avatar(profile, sizeClass) {
    var label = String(profile && (profile.displayName || profile.username) || 'U').charAt(0).toUpperCase();
    return '<span class="unitalk-avatar ' + (sizeClass || '') + '">' +
      (profile && profile.avatar ? '<img alt="" src="' + safe(profile.avatar) + '">' : safe(label)) + '</span>';
  }
  function relativeTime(value) {
    var time = Number(value) || 0;
    if (!time) return '';
    var seconds = Math.max(1, Math.floor((Date.now() - time) / 1000));
    if (seconds < 60) return 'hace unos segundos';
    if (seconds < 3600) return 'hace ' + Math.floor(seconds / 60) + ' min';
    if (seconds < 86400) return 'hace ' + Math.floor(seconds / 3600) + ' h';
    if (seconds < 604800) return 'hace ' + Math.floor(seconds / 86400) + ' d';
    return new Date(time).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function academicLabel(profile) {
    var values = [];
    if (profile && profile.academy) values.push(profile.academy);
    if (profile && profile.cycle) values.push(profile.cycle);
    if (profile && profile.target) values.push('Postula a ' + profile.target);
    return values.join(' · ') || 'Estudiante Universe';
  }
  function errorText(error) {
    var key = String(error && error.message || '');
    return {
      login_required: 'Inicia sesión con Google para continuar.',
      profile_required: 'Primero completa tu nombre de usuario y perfil académico en Cuenta.',
      rate_limited: 'Estás realizando acciones muy rápido. Espera un momento.',
      contenido_no_permitido: 'La publicación contiene texto que incumple las normas de convivencia.',
      demasiados_enlaces: 'Solo se permiten hasta dos enlaces.',
      contenido_vacio: 'Escribe un mensaje antes de publicar.',
      post_not_found: 'La publicación ya no está disponible.'
    }[key] || 'No se pudo completar la acción. Inténtalo nuevamente.';
  }
  function requireAccount(error) {
    if (error && (error.message === 'login_required' || error.status === 401)) {
      if (window.UniverseGoogleAuth) UniverseGoogleAuth.open({ account: true });
      return true;
    }
    if (error && (error.message === 'profile_required' || error.status === 403)) {
      if (confirm('Para participar necesitas completar tu nombre de usuario y perfil académico. ¿Abrir tu cuenta ahora?')) location.href = '/account';
      return true;
    }
    return false;
  }

  async function loadMe() {
    if (!token()) {
      state.me = null;
      renderComposerUser();
      return;
    }
    try {
      var payload = await api('/me', 'GET');
      state.me = payload.profile || null;
      state.academic = payload.academic || null;
    } catch (error) {
      state.me = null;
      state.academic = null;
    }
    renderComposerUser();
  }
  function renderComposerUser() {
    var root = $('unitalk-composer-user');
    if (!root) return;
    if (state.me && state.me.username) {
      root.innerHTML = avatar(state.me) + '<div><strong>' + safe(state.me.displayName) + '</strong><small>@' + safe(state.me.username) + ' · ' + safe(academicLabel(state.me)) + '</small></div>';
      $('unitalk-post-text').disabled = false;
      $('unitalk-publish').disabled = false;
    } else {
      var google = currentGoogleUser();
      root.innerHTML = '<span class="unitalk-avatar">U</span><div><strong>' + (google ? 'Completa tu perfil para participar' : 'Participa en UNITALK') + '</strong><small>' +
        (google ? 'Crea un nombre de usuario desde tu cuenta.' : 'Necesitas una cuenta Google y un nombre de usuario.') + '</small></div>';
      $('unitalk-post-text').disabled = false;
      $('unitalk-publish').disabled = false;
    }
  }

  function renderPost(post) {
    var author = post.author || {};
    var username = author.username || 'usuario';
    return '<article class="unitalk-post" data-post-id="' + safe(post.id) + '">' +
      '<div class="unitalk-post-head"><button class="unitalk-user-link unitalk-post-user" type="button" data-profile="' + safe(username) + '">' +
      avatar(author) + '<span><strong>' + safe(author.displayName || 'Estudiante Universe') + '</strong><small>@' + safe(username) + ' · ' + safe(academicLabel(author)) + '</small></span></button>' +
      '<time class="unitalk-time" datetime="' + new Date(post.createdAt || 0).toISOString() + '">' + safe(relativeTime(post.createdAt)) + '</time></div>' +
      '<p class="unitalk-post-text">' + safe(post.text) + '</p>' +
      '<div class="unitalk-post-actions">' +
      '<button class="unitalk-action ' + (post.myReaction === 'like' ? 'active-like' : '') + '" type="button" data-react="like">Me gusta <b>' + Number(post.likes || 0) + '</b></button>' +
      '<button class="unitalk-action ' + (post.myReaction === 'dislike' ? 'active-dislike' : '') + '" type="button" data-react="dislike">No me gusta <b>' + Number(post.dislikes || 0) + '</b></button>' +
      '<button class="unitalk-action" type="button" data-comments>Comentar <b>' + Number(post.comments || 0) + '</b></button>' +
      '<button class="unitalk-action" type="button" data-report>Reportar</button>' +
      (post.canDelete ? '<button class="unitalk-action danger" type="button" data-delete-post>Eliminar</button>' : '') +
      '</div><section class="unitalk-comments" hidden><div class="unitalk-comments-list"></div>' +
      '<div class="unitalk-comment-compose"><input maxlength="250" placeholder="Escribe un comentario respetuoso..." aria-label="Comentario"><button class="unitalk-comment-send" type="button">Enviar</button></div></section>' +
      '</article>';
  }
  function bindPost(root) {
    var postId = root.dataset.postId;
    root.querySelectorAll('[data-profile]').forEach(function (button) {
      button.onclick = function () { openProfile(button.dataset.profile); };
    });
    root.querySelectorAll('[data-react]').forEach(function (button) {
      button.onclick = async function () {
        button.disabled = true;
        try {
          var result = await api('/posts/' + encodeURIComponent(postId) + '/reaction', 'PUT', { type: button.dataset.react });
          var like = root.querySelector('[data-react="like"]');
          var dislike = root.querySelector('[data-react="dislike"]');
          like.querySelector('b').textContent = result.likes;
          dislike.querySelector('b').textContent = result.dislikes;
          like.classList.toggle('active-like', result.myReaction === 'like');
          dislike.classList.toggle('active-dislike', result.myReaction === 'dislike');
        } catch (error) {
          requireAccount(error);
        } finally { button.disabled = false; }
      };
    });
    var commentsButton = root.querySelector('[data-comments]');
    commentsButton.onclick = function () {
      var panel = root.querySelector('.unitalk-comments');
      panel.hidden = !panel.hidden;
      if (!panel.hidden && !panel.dataset.loaded) loadComments(root);
    };
    root.querySelector('.unitalk-comment-send').onclick = function () { sendComment(root); };
    root.querySelector('[data-report]').onclick = async function () {
      if (!token()) { if (window.UniverseGoogleAuth) UniverseGoogleAuth.open({ account: true }); return; }
      var reason = prompt('Explica brevemente por qué reportas esta publicación:');
      if (!reason) return;
      try { await api('/reports', 'POST', { targetType: 'post', targetId: postId, reason: reason }); alert('Reporte enviado. Gracias por ayudar a cuidar UNITALK.'); }
      catch (error) { alert(errorText(error)); }
    };
    var remove = root.querySelector('[data-delete-post]');
    if (remove) remove.onclick = async function () {
      if (!confirm('¿Eliminar esta publicación?')) return;
      try { await api('/posts/' + encodeURIComponent(postId), 'DELETE'); root.remove(); }
      catch (error) { alert(errorText(error)); }
    };
  }
  function renderFeed() {
    var root = $('unitalk-feed');
    if (!state.posts.length) {
      root.innerHTML = '<div class="unitalk-empty"><strong>Aún no hay publicaciones.</strong><br>Inicia la primera conversación académica.</div>';
      return;
    }
    root.innerHTML = state.posts.map(renderPost).join('');
    root.querySelectorAll('.unitalk-post').forEach(bindPost);
  }
  async function loadFeed() {
    if (state.loading) return;
    state.loading = true;
    $('unitalk-feed').innerHTML = '<div class="unitalk-loading">Cargando publicaciones...</div>';
    try {
      var payload = await api('/feed?limit=25', 'GET');
      state.posts = Array.isArray(payload.posts) ? payload.posts : [];
      renderFeed();
    } catch (error) {
      $('unitalk-feed').innerHTML = '<div class="unitalk-empty">No se pudieron cargar las publicaciones. Vuelve a intentarlo.</div>';
    } finally { state.loading = false; }
  }
  async function publish() {
    var text = $('unitalk-post-text').value.trim();
    var status = $('unitalk-composer-status');
    if (!text) { status.textContent = 'Escribe algo antes de publicar.'; status.className = 'unitalk-status error'; return; }
    $('unitalk-publish').disabled = true;
    try {
      var result = await api('/posts', 'POST', { text: text });
      $('unitalk-post-text').value = '';
      $('unitalk-char-count').textContent = '0';
      status.textContent = 'Publicación compartida correctamente.';
      status.className = 'unitalk-status good';
      state.posts.unshift(result.post);
      renderFeed();
    } catch (error) {
      requireAccount(error);
      status.textContent = errorText(error);
      status.className = 'unitalk-status error';
    } finally { $('unitalk-publish').disabled = false; }
  }
  async function loadComments(postRoot) {
    var list = postRoot.querySelector('.unitalk-comments-list');
    list.innerHTML = '<div class="unitalk-loading">Cargando comentarios...</div>';
    try {
      var payload = await api('/posts/' + encodeURIComponent(postRoot.dataset.postId) + '/comments', 'GET');
      renderComments(postRoot, payload.comments || []);
      postRoot.querySelector('.unitalk-comments').dataset.loaded = '1';
    } catch (error) { list.innerHTML = '<div class="unitalk-empty">No se pudieron cargar los comentarios.</div>'; }
  }
  function renderComments(postRoot, comments) {
    var list = postRoot.querySelector('.unitalk-comments-list');
    list.innerHTML = comments.length ? comments.map(function (comment) {
      var author = comment.author || {};
      return '<article class="unitalk-comment" data-comment-id="' + safe(comment.id) + '"><div class="unitalk-comment-user">' + avatar(author) +
        '<button class="unitalk-user-link" type="button" data-profile="' + safe(author.username || 'usuario') + '"><strong>' + safe(author.displayName || 'Estudiante Universe') + '</strong><small>@' + safe(author.username || 'usuario') + ' · ' + safe(relativeTime(comment.createdAt)) + '</small></button>' +
        (comment.canDelete ? '<button class="unitalk-mini-button" type="button" data-delete-comment>Eliminar</button>' : '') + '</div><p>' + safe(comment.text) + '</p></article>';
    }).join('') : '<div class="unitalk-empty">Sé la primera persona en comentar.</div>';
    list.querySelectorAll('[data-profile]').forEach(function (button) { button.onclick = function () { openProfile(button.dataset.profile); }; });
    list.querySelectorAll('[data-delete-comment]').forEach(function (button) {
      button.onclick = async function () {
        var row = button.closest('[data-comment-id]');
        if (!confirm('¿Eliminar este comentario?')) return;
        try { await api('/posts/' + encodeURIComponent(postRoot.dataset.postId) + '/comments/' + encodeURIComponent(row.dataset.commentId), 'DELETE'); row.remove(); }
        catch (error) { alert(errorText(error)); }
      };
    });
  }
  async function sendComment(postRoot) {
    var input = postRoot.querySelector('.unitalk-comment-compose input');
    var text = input.value.trim();
    if (!text) return;
    var button = postRoot.querySelector('.unitalk-comment-send');
    button.disabled = true;
    try {
      await api('/posts/' + encodeURIComponent(postRoot.dataset.postId) + '/comments', 'POST', { text: text });
      input.value = '';
      await loadComments(postRoot);
      var count = postRoot.querySelector('[data-comments] b');
      count.textContent = String(Number(count.textContent || 0) + 1);
    } catch (error) {
      requireAccount(error);
      alert(errorText(error));
    } finally { button.disabled = false; }
  }

  function profileFact(label, value) {
    return value ? '<div class="unitalk-profile-fact"><span>' + safe(label) + '</span><strong>' + safe(value) + '</strong></div>' : '';
  }
  async function openProfile(username, push) {
    username = String(username || '').toLowerCase();
    var modal = $('unitalk-profile-modal');
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    $('unitalk-profile-content').innerHTML = '<div class="unitalk-loading">Cargando perfil...</div>';
    try {
      var payload = await api('/profile/' + encodeURIComponent(username), 'GET');
      var profile = payload.profile || {};
      $('unitalk-profile-content').innerHTML = '<div class="unitalk-profile-hero">' + avatar(profile) +
        '<h2 id="unitalk-profile-name">' + safe(profile.displayName || 'Estudiante Universe') + '</h2><span class="handle">@' + safe(profile.username || username) + '</span>' +
        (profile.private ? '<p>Esta persona decidió mantener privados sus datos académicos.</p>' : '<p>' + safe(profile.bio || 'Miembro de la comunidad Universe.') + '</p>') +
        '</div><div class="unitalk-profile-facts">' +
        profileFact('Academia o institución', profile.academy) + profileFact('Ciclo', profile.cycle) + profileFact('Objetivo', profile.target) +
        profileFact('Miembro desde', profile.joinedAt ? new Date(profile.joinedAt).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' }) : '') +
        '</div>';
      if (push !== false) history.pushState({ unitalkProfile: username }, '', '/unitalk/perfil/' + encodeURIComponent(username));
    } catch (error) {
      $('unitalk-profile-content').innerHTML = '<div class="unitalk-empty">Este perfil no existe o no está disponible.</div>';
    }
  }
  function closeProfile() {
    $('unitalk-profile-modal').hidden = true;
    document.body.style.overflow = '';
    if (/^\/unitalk\/perfil\//.test(location.pathname)) history.pushState({}, '', '/unitalk');
  }
  function bootDeepProfile() {
    var match = location.pathname.match(/^\/unitalk\/perfil\/([a-zA-Z0-9_-]+)$/);
    if (match) openProfile(match[1], false);
  }

  function bind() {
    $('unitalk-post-text').addEventListener('input', function () { $('unitalk-char-count').textContent = String(this.value.length); });
    $('unitalk-publish').onclick = publish;
    $('unitalk-refresh').onclick = loadFeed;
    document.querySelectorAll('[data-close-profile]').forEach(function (button) { button.onclick = closeProfile; });
    window.addEventListener('popstate', function () {
      var match = location.pathname.match(/^\/unitalk\/perfil\/([a-zA-Z0-9_-]+)$/);
      if (match) openProfile(match[1], false);
      else { $('unitalk-profile-modal').hidden = true; document.body.style.overflow = ''; }
    });
    window.addEventListener('universe-google-auth', function () { setTimeout(function () { loadMe(); loadFeed(); }, 120); });
  }
  function boot() {
    bind();
    renderComposerUser();
    loadFeed();
    setTimeout(loadMe, 500);
    bootDeepProfile();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
