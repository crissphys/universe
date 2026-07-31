(function () {
  'use strict';

  var TOKEN_KEY = 'universe_auth_token';
  var SAVED_KEY = 'unitalk_saved_posts_v1';
  var COMPACT_KEY = 'unitalk_compact_view';
  var MOTION_KEY = 'unitalk_reduce_motion';
  var state = {
    me: null,
    academic: null,
    posts: [],
    loading: false,
    view: 'home',
    filter: 'all',
    search: '',
    discussion: false,
    attachment: null,
    pollActive: false,
    pollOptions: ['', ''],
    activePostId: '',
    saved: new Set(readList(SAVED_KEY))
  };
  var ATTACHMENT_RULES = {
    image: { types: ['image/jpeg', 'image/png', 'image/webp'], legacyMax: 1200000, label: 'foto' },
    video: { types: ['video/mp4', 'video/webm'], legacyMax: 6000000, label: 'video' },
    pdf: { types: ['application/pdf'], legacyMax: 3000000, label: 'PDF' }
  };

  function $(id) { return document.getElementById(id); }
  function safe(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }
  function bytesLabel(value) {
    var size = Math.max(0, Number(value) || 0);
    if (size < 1024) return size + ' B';
    if (size < 1048576) return (size / 1024).toFixed(1) + ' KB';
    return (size / 1048576).toFixed(1) + ' MB';
  }
  function hashtagValue(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/^#+/, '').trim().replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '').replace(/_+/g, '_').replace(/^_|_$/g, '').slice(0, 30);
  }
  function textWithHashtags(value) {
    return safe(value).replace(/(^|\s)#([\p{L}\p{N}_]{2,30})/gu, function (_, prefix, tag) {
      return prefix + '<a class="unitalk-hashtag" href="/unitalk?tag=' + encodeURIComponent(hashtagValue(tag)) + '" data-hashtag="' + safe(hashtagValue(tag)) + '">#' + safe(tag) + '</a>';
    });
  }
  function releaseAttachment(attachment) {
    if (attachment && attachment.previewUrl && /^blob:/.test(attachment.previewUrl)) {
      try { URL.revokeObjectURL(attachment.previewUrl); } catch (error) {}
    }
  }
  function fileToDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result || '')); };
      reader.onerror = function () { reject(new Error('attachment_invalid')); };
      reader.readAsDataURL(file);
    });
  }
  function compressLegacyImage(file) {
    return fileToDataUrl(file).then(function (source) {
      return new Promise(function (resolve, reject) {
        var image = new Image();
        image.onload = function () {
          var limit = 1600;
          var scale = Math.min(1, limit / Math.max(image.naturalWidth || 1, image.naturalHeight || 1));
          var canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          var context = canvas.getContext('2d', { alpha: false });
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(function (blob) {
            if (!blob) { reject(new Error('attachment_invalid')); return; }
            fileToDataUrl(blob).then(function (dataUrl) {
              resolve({ dataUrl: dataUrl, size: blob.size, mime: blob.type || 'image/jpeg' });
            }, reject);
          }, file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.84);
        };
        image.onerror = function () { reject(new Error('attachment_invalid')); };
        image.src = source;
      });
    });
  }
  async function legacyAttachmentPayload(attachment) {
    var rule = ATTACHMENT_RULES[attachment.kind];
    var prepared = attachment.kind === 'image'
      ? await compressLegacyImage(attachment.blob)
      : { dataUrl: await fileToDataUrl(attachment.blob), size: attachment.size, mime: attachment.mime };
    if (!rule || prepared.size > rule.legacyMax) throw new Error('media_storage_unavailable');
    return {
      kind: attachment.kind,
      name: attachment.name,
      mime: prepared.mime,
      size: prepared.size,
      dataUrl: prepared.dataUrl
    };
  }
  function readList(key) {
    try {
      var data = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(data) ? data : [];
    } catch (error) { return []; }
  }
  function writeList(key, list) { try { localStorage.setItem(key, JSON.stringify(list)); } catch (error) {} }
  function readFlag(key) { try { return localStorage.getItem(key) === '1'; } catch (error) { return false; } }
  function writeFlag(key, value) { try { localStorage.setItem(key, value ? '1' : '0'); } catch (error) {} }
  function token() { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (error) { return ''; } }
  function currentGoogleUser() { return window.UniverseGoogleAuth && UniverseGoogleAuth.user ? UniverseGoogleAuth.user() : null; }
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
  function rawApi(path, body) {
    var headers = { 'Content-Type': 'application/octet-stream' };
    var currentToken = token();
    if (currentToken) headers.Authorization = 'Bearer ' + currentToken;
    return fetch('/api/unitalk' + path, {
      method: 'PUT',
      cache: 'no-store',
      headers: headers,
      body: body
    }).then(async function (response) {
      var payload = await response.json().catch(function () { return {}; });
      if (!response.ok) {
        var error = new Error(payload.error || 'request_failed');
        error.status = response.status;
        throw error;
      }
      return payload;
    });
  }
  async function uploadAttachment(attachment, status) {
    var started;
    try {
      started = await api('/uploads/start', 'POST', {
        kind: attachment.kind,
        mime: attachment.mime,
        name: attachment.name,
        size: attachment.size
      });
    } catch (error) {
      if (error.message === 'media_storage_unavailable') return legacyAttachmentPayload(attachment);
      throw error;
    }
    var partSize = Math.max(1, Number(started.partSize) || (8 * 1024 * 1024));
    var parts = [];
    try {
      for (var offset = 0, partNumber = 1; offset < attachment.size; offset += partSize, partNumber += 1) {
        var chunk = attachment.blob.slice(offset, Math.min(attachment.size, offset + partSize));
        var uploaded = await rawApi('/uploads/' + encodeURIComponent(started.id) + '/parts/' + partNumber, chunk);
        parts.push({ partNumber: uploaded.partNumber, etag: uploaded.etag });
        var percent = Math.min(100, Math.round(Math.min(attachment.size, offset + chunk.size) * 100 / attachment.size));
        status.textContent = 'Subiendo ' + attachment.name + ': ' + percent + '%';
        status.className = 'unitalk-status';
      }
      await api('/uploads/' + encodeURIComponent(started.id) + '/complete', 'POST', { parts: parts });
      return { uploadId: started.id };
    } catch (error) {
      await api('/uploads/' + encodeURIComponent(started.id), 'DELETE').catch(function () {});
      throw error;
    }
  }
  function relativeTime(value) {
    var time = Number(value) || 0;
    if (!time) return '';
    var seconds = Math.max(1, Math.floor((Date.now() - time) / 1000));
    if (seconds < 60) return 'ahora';
    if (seconds < 3600) return 'hace ' + Math.floor(seconds / 60) + ' min';
    if (seconds < 86400) return 'hace ' + Math.floor(seconds / 3600) + ' h';
    if (seconds < 604800) return 'hace ' + Math.floor(seconds / 86400) + ' d';
    return new Date(time).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  }
  function initial(profile) { return String(profile && (profile.displayName || profile.username) || 'U').charAt(0).toUpperCase(); }
  function avatar(profile, extraClass) {
    return '<span class="unitalk-avatar ' + safe(extraClass || '') + '">' +
      (profile && profile.avatar ? '<img alt="" src="' + safe(profile.avatar) + '">' : safe(initial(profile))) + '</span>';
  }
  function academicLabel(profile) {
    var parts = [];
    if (profile && profile.academy) parts.push(profile.academy);
    if (profile && profile.cycle) parts.push(profile.cycle);
    if (profile && profile.target) parts.push('Postula a ' + profile.target);
    return parts.join(' · ') || 'Miembro de UNITALK';
  }
  function errorText(error) {
    var key = String(error && error.message || '');
    return {
      login_required: 'Inicia sesión con Google para continuar.',
      profile_required: 'Completa tu perfil público y académico antes de participar.',
      rate_limited: 'Estás realizando acciones muy rápido. Espera un momento.',
      contenido_no_permitido: 'El texto incumple las normas de convivencia.',
      demasiados_enlaces: 'Solo se permiten hasta dos enlaces.',
      contenido_vacio: 'Escribe un mensaje antes de publicar.',
      post_not_found: 'La publicación ya no está disponible.',
      forbidden: 'No tienes permiso para realizar esta acción.',
      attachment_invalid: 'El archivo no es válido o su formato no está permitido.',
      attachment_too_large: 'El archivo supera el tamaño permitido.',
      media_storage_unavailable: 'El almacenamiento de archivos no está disponible en este momento.',
      upload_not_found: 'La carga caducó o ya fue utilizada. Selecciona el archivo nuevamente.',
      upload_part_invalid: 'Una parte del archivo no se pudo cargar. Inténtalo de nuevo.',
      upload_incomplete: 'El archivo no terminó de subir. Inténtalo de nuevo.',
      upload_size_mismatch: 'El archivo recibido no coincide con el original.',
      media_not_found: 'El archivo adjunto ya no está disponible.',
      poll_invalid: 'La encuesta necesita entre 2 y 4 alternativas diferentes.',
      poll_not_found: 'La encuesta ya no está disponible.',
      poll_option_invalid: 'Selecciona una alternativa válida.'
    }[key] || 'No se pudo completar la acción. Inténtalo nuevamente.';
  }
  function toast(message) {
    var root = $('unitalk-toast');
    if (!root) return;
    root.textContent = message;
    root.classList.add('show');
    clearTimeout(window.unitalkToastTimer);
    window.unitalkToastTimer = setTimeout(function () { root.classList.remove('show'); }, 2800);
  }
  function requireAccount(error) {
    if (!error || (error.message !== 'login_required' && error.status !== 401)) return false;
    if (window.UniverseGoogleAuth) UniverseGoogleAuth.open({ account: true });
    else toast('Inicia sesión con Google para participar.');
    return true;
  }
  function requireProfile(error) {
    if (!error || (error.message !== 'profile_required' && error.status !== 403)) return false;
    toast('Completa tu perfil antes de participar.');
    setTimeout(function () { location.href = '/account'; }, 750);
    return true;
  }
  function isMine(post) {
    return !!(state.me && post.author && state.me.username && post.author.username === state.me.username);
  }
  function setBodyPreferences() {
    document.body.classList.toggle('unitalk-compact', readFlag(COMPACT_KEY));
    document.body.classList.toggle('unitalk-reduce-motion', readFlag(MOTION_KEY));
  }
  function renderIdentity() {
    var google = currentGoogleUser();
    var profile = state.me || google || {};
    $('unitalk-top-avatar').innerHTML = profile.avatar ? '<img alt="" src="' + safe(profile.avatar) + '">' : safe(initial(profile));
    $('unitalk-composer-avatar').innerHTML = profile.avatar ? '<img alt="" src="' + safe(profile.avatar) + '">' : safe(initial(profile));
    $('unitalk-top-name').textContent = state.me && state.me.username ? 'Hola, ' + String(state.me.displayName || state.me.username).split(/\s+/)[0] : google ? 'Completa tu perfil' : 'Iniciar sesión';
  }
  async function loadMe() {
    if (!token()) { state.me = null; state.academic = null; renderIdentity(); return; }
    try {
      var payload = await api('/me', 'GET');
      state.me = payload.profile || null;
      state.academic = payload.academic || null;
    } catch (error) { state.me = null; state.academic = null; }
    renderIdentity();
  }
  function visiblePosts() {
    var query = state.search.toLowerCase();
    return state.posts.filter(function (post) {
      if (state.filter === 'mine' && !isMine(post)) return false;
      if (state.filter === 'recent' && Number(post.createdAt || 0) < Date.now() - 7 * 86400000) return false;
      if (!query) return true;
      var author = post.author || {};
      return [post.text, (post.hashtags || []).map(function (tag) { return '#' + tag; }).join(' '), author.displayName, author.username, academicLabel(author)].join(' ').toLowerCase().indexOf(query) !== -1;
    });
  }
  function attachmentMarkup(attachment) {
    if (!attachment || !attachment.url) return '';
    var name = safe(attachment.name || (attachment.kind === 'pdf' ? 'Documento PDF' : 'Archivo adjunto'));
    var url = safe(attachment.url);
    if (attachment.kind === 'image') {
      return '<div class="unitalk-post-media"><img src="' + url + '" alt="' + name + '" loading="lazy"><div class="unitalk-media-note">🖼️ ' + name + '</div></div>';
    }
    if (attachment.kind === 'video') {
      return '<div class="unitalk-post-media"><video src="' + url + '" controls preload="none" playsinline aria-label="' + name + '"></video><div class="unitalk-media-note">🎬 ' + name + ' · ' + safe(bytesLabel(attachment.size)) + '</div></div>';
    }
    if (attachment.kind === 'pdf') {
      return '<div class="unitalk-post-media"><a class="unitalk-post-file" href="' + url + '" target="_blank" rel="noopener"><span>📄</span><span><strong>' + name + '</strong><small>PDF · ' + safe(bytesLabel(attachment.size)) + ' · Abrir documento</small></span></a></div>';
    }
    return '';
  }
  function pollMarkup(poll) {
    if (!poll || !Array.isArray(poll.options) || poll.options.length < 2) return '';
    var total = Math.max(0, Number(poll.totalVotes) || 0);
    return '<section class="unitalk-poll" aria-label="Encuesta"><div class="unitalk-poll-title">📊 Encuesta</div><div class="unitalk-poll-options">' +
      poll.options.map(function (option) {
        var votes = Math.max(0, Number(option.votes) || 0);
        var percent = total ? Math.round(votes * 100 / total) : 0;
        var selected = poll.myVote === option.id;
        return '<button class="unitalk-poll-option ' + (selected ? 'selected' : '') + '" type="button" data-poll-option="' + safe(option.id) + '" style="--poll-percent:' + percent + '%">' +
          '<span class="unitalk-poll-bar" aria-hidden="true"></span><span class="unitalk-poll-option-text">' + safe(option.text) + '</span><span class="unitalk-poll-result">' + percent + '%</span></button>';
      }).join('') + '</div><small>' + total + (total === 1 ? ' voto' : ' votos') + (poll.myVote ? ' · Tu voto está marcado' : '') + '</small></section>';
  }
  function postMarkup(post, compact) {
    var author = post.author || {};
    var saved = state.saved.has(post.id);
    return '<article class="unitalk-post" data-post-id="' + safe(post.id) + '">' +
      '<div class="unitalk-post-head"><button class="unitalk-user-link" type="button" data-profile="' + safe(author.username || '') + '">' +
      avatar(author) + '<span><strong>' + safe(author.displayName || 'Estudiante Universe') + '</strong><small>@' + safe(author.username || 'usuario') + ' · ' + safe(academicLabel(author)) + '</small></span></button>' +
      '<time class="unitalk-time">' + safe(relativeTime(post.createdAt)) + '</time></div>' +
      (post.discussion ? '<span class="unitalk-post-label">💬 Discusión académica</span>' : '') +
      (post.text ? '<p class="unitalk-post-text">' + textWithHashtags(post.text) + '</p>' : '') +
      attachmentMarkup(post.attachment) +
      pollMarkup(post.poll) +
      '<div class="unitalk-post-actions">' +
      '<button class="unitalk-action ' + (post.myReaction === 'like' ? 'active-like' : '') + '" type="button" data-post-action="like">👍 <b>' + Number(post.likes || 0) + '</b></button>' +
      '<button class="unitalk-action ' + (post.myReaction === 'dislike' ? 'active-dislike' : '') + '" type="button" data-post-action="dislike">👎 <b>' + Number(post.dislikes || 0) + '</b></button>' +
      '<button class="unitalk-action" type="button" data-post-action="comments">💬 <b>' + Number(post.comments || 0) + '</b> comentarios</button>' +
      '<button class="unitalk-action ' + (saved ? 'save-active' : '') + '" type="button" data-post-action="save">🔖 ' + (saved ? 'Guardado' : 'Guardar') + '</button>' +
      '<button class="unitalk-action" type="button" data-post-action="report">Reportar</button>' +
      (post.canDelete ? '<button class="unitalk-action danger" type="button" data-post-action="delete">Eliminar</button>' : '') +
      '</div></article>';
  }
  function renderFeed() {
    var root = $('unitalk-feed');
    var posts = visiblePosts();
    $('unitalk-feed-summary').textContent = state.search ? 'Resultados para “' + state.search + '”' : state.filter === 'mine' ? 'Tus publicaciones' : state.filter === 'recent' ? 'Publicaciones de los últimos 7 días' : 'Publicaciones recomendadas';
    root.innerHTML = posts.length ? posts.map(function (post) { return postMarkup(post); }).join('') : '<div class="unitalk-empty"><strong>No hay publicaciones para mostrar.</strong><br>Prueba otro filtro o inicia una conversación.</div>';
  }
  function renderActivity() {
    var root = $('unitalk-recent-activity');
    var recent = state.posts.slice(0, 3);
    $('unitalk-community-count').textContent = state.posts.length ? '+' + state.posts.length : '—';
    root.innerHTML = recent.length ? recent.map(function (post) {
      var author = post.author || {};
      return '<div class="unitalk-activity"><span class="unitalk-activity-icon">💬</span><span><strong>' + safe(author.displayName || 'Un estudiante') + ' compartió una publicación.</strong><small>' + safe(relativeTime(post.createdAt)) + '</small></span></div>';
    }).join('') : '<div class="unitalk-activity-empty">Aún no hay actividad. Sé quien inicie la conversación.</div>';
  }
  async function loadFeed() {
    if (state.loading) return;
    state.loading = true;
    $('unitalk-feed').innerHTML = '<div class="unitalk-loading">Cargando publicaciones...</div>';
    try {
      var payload = await api('/feed?limit=30', 'GET');
      state.posts = Array.isArray(payload.posts) ? payload.posts : [];
      renderFeed();
      renderActivity();
    } catch (error) {
      $('unitalk-feed').innerHTML = '<div class="unitalk-empty">No se pudieron cargar las publicaciones. Vuelve a intentarlo.</div>';
    } finally { state.loading = false; }
  }
  function updateComposer() {
    var text = $('unitalk-post-text').value;
    $('unitalk-char-count').textContent = String(text.length);
    $('unitalk-mode-chip').hidden = !state.discussion;
    $('unitalk-discussion').classList.toggle('active', state.discussion);
    $('unitalk-poll-panel').hidden = !state.pollActive;
    $('unitalk-poll-toggle').classList.toggle('active', state.pollActive);
    document.querySelectorAll('[data-attachment-kind]').forEach(function (button) {
      button.classList.toggle('active', !!state.attachment && button.dataset.attachmentKind === state.attachment.kind);
    });
    renderAttachmentPreview();
  }
  function renderAttachmentPreview() {
    var panel = $('unitalk-attachment-panel');
    var root = $('unitalk-attachment-preview');
    var attachment = state.attachment;
    panel.hidden = !attachment;
    if (!attachment) { root.innerHTML = ''; return; }
    var name = safe(attachment.name);
    if (attachment.kind === 'image') root.innerHTML = '<div class="unitalk-attachment-preview"><img src="' + safe(attachment.previewUrl) + '" alt="' + name + '"></div>';
    else if (attachment.kind === 'video') root.innerHTML = '<div class="unitalk-attachment-preview"><video src="' + safe(attachment.previewUrl) + '" controls preload="metadata" playsinline></video></div>';
    else root.innerHTML = '<div class="unitalk-attachment-file"><span>📄</span><span><strong>' + name + '</strong><small>' + safe(bytesLabel(attachment.size)) + '</small></span></div>';
  }
  async function chooseAttachment(kind, file) {
    var rule = ATTACHMENT_RULES[kind];
    var status = $('unitalk-composer-status');
    if (!rule || !file || rule.types.indexOf(file.type) === -1) {
      status.textContent = 'Ese formato no está permitido.';
      status.className = 'unitalk-status error';
      return;
    }
    status.textContent = 'Preparando ' + rule.label + '...';
    status.className = 'unitalk-status';
    try {
      if (!file.size) throw new Error('attachment_invalid');
      releaseAttachment(state.attachment);
      state.attachment = {
        kind: kind,
        name: String(file.name || rule.label).slice(0, 90),
        mime: file.type,
        size: file.size,
        blob: file,
        previewUrl: URL.createObjectURL(file)
      };
      status.textContent = 'Archivo listo (' + bytesLabel(file.size) + '). Puedes añadir un texto o publicarlo directamente.';
      status.className = 'unitalk-status good';
      updateComposer();
    } catch (error) {
      releaseAttachment(state.attachment);
      state.attachment = null;
      status.textContent = errorText(error);
      status.className = 'unitalk-status error';
      updateComposer();
    }
  }
  function renderPollBuilder() {
    var panel = $('unitalk-poll-panel');
    var root = $('unitalk-poll-options');
    panel.hidden = !state.pollActive;
    $('unitalk-poll-toggle').classList.toggle('active', state.pollActive);
    if (!state.pollActive) { root.innerHTML = ''; return; }
    root.innerHTML = state.pollOptions.map(function (option, index) {
      return '<label class="unitalk-poll-builder-option"><span>' + (index + 1) + '</span><input type="text" maxlength="80" value="' + safe(option) + '" placeholder="Alternativa ' + (index + 1) + '" data-poll-builder-index="' + index + '">' +
        (state.pollOptions.length > 2 ? '<button type="button" data-poll-remove="' + index + '" aria-label="Quitar alternativa ' + (index + 1) + '">×</button>' : '') + '</label>';
    }).join('');
    $('unitalk-poll-add-option').hidden = state.pollOptions.length >= 4;
    root.querySelectorAll('[data-poll-builder-index]').forEach(function (input) {
      input.addEventListener('input', function () { state.pollOptions[Number(input.dataset.pollBuilderIndex)] = input.value; });
    });
    root.querySelectorAll('[data-poll-remove]').forEach(function (button) {
      button.onclick = function () {
        state.pollOptions.splice(Number(button.dataset.pollRemove), 1);
        renderPollBuilder();
      };
    });
  }
  function pollPayload() {
    if (!state.pollActive) return null;
    var options = state.pollOptions.map(function (option) { return String(option || '').trim(); });
    var normalized = options.map(function (option) { return option.toLowerCase(); });
    if (options.length < 2 || options.length > 4 || options.some(function (option) { return !option; }) || new Set(normalized).size !== options.length) return false;
    return { options: options };
  }
  async function publish() {
    var text = $('unitalk-post-text').value.trim();
    var status = $('unitalk-composer-status');
    var poll = pollPayload();
    if (state.pollActive && !text) { status.textContent = 'Escribe la pregunta de la encuesta en la publicación.'; status.className = 'unitalk-status error'; return; }
    if (poll === false) { status.textContent = 'Completa entre 2 y 4 alternativas diferentes.'; status.className = 'unitalk-status error'; return; }
    if (!text && !state.attachment) { status.textContent = 'Escribe algo o selecciona un archivo antes de publicar.'; status.className = 'unitalk-status error'; return; }
    var button = $('unitalk-publish');
    var uploadedAttachmentPayload = null;
    button.disabled = true;
    try {
      var selectedAttachment = state.attachment;
      uploadedAttachmentPayload = selectedAttachment ? await uploadAttachment(selectedAttachment, status) : null;
      var result = await api('/posts', 'POST', { text: text, discussion: state.discussion, attachment: uploadedAttachmentPayload, poll: poll });
      uploadedAttachmentPayload = null;
      $('unitalk-post-text').value = '';
      state.discussion = false;
      releaseAttachment(selectedAttachment);
      state.attachment = null;
      state.pollActive = false;
      state.pollOptions = ['', ''];
      ['unitalk-image-input', 'unitalk-video-input', 'unitalk-pdf-input'].forEach(function (id) { $(id).value = ''; });
      renderPollBuilder();
      updateComposer();
      status.textContent = 'Publicación compartida correctamente.';
      status.className = 'unitalk-status good';
      state.posts.unshift(result.post);
      renderFeed();
      renderActivity();
      toast('Tu publicación ya aparece en UNITALK.');
    } catch (error) {
      if (uploadedAttachmentPayload && uploadedAttachmentPayload.uploadId) {
        await api('/uploads/' + encodeURIComponent(uploadedAttachmentPayload.uploadId), 'DELETE').catch(function () {});
      }
      requireAccount(error) || requireProfile(error);
      status.textContent = errorText(error);
      status.className = 'unitalk-status error';
    } finally { button.disabled = false; }
  }
  function postById(postId) { return state.posts.find(function (post) { return post.id === postId; }); }
  async function react(post, type) {
    try {
      var result = await api('/posts/' + encodeURIComponent(post.id) + '/reaction', 'PUT', { type: type });
      post.likes = result.likes;
      post.dislikes = result.dislikes;
      post.myReaction = result.myReaction;
      renderFeed();
    } catch (error) { requireAccount(error) || requireProfile(error) || toast(errorText(error)); }
  }
  async function votePoll(post, optionId) {
    try {
      var result = await api('/posts/' + encodeURIComponent(post.id) + '/poll-vote', 'PUT', { optionId: optionId });
      post.poll = result.poll;
      renderFeed();
      if (state.activePostId === post.id) await loadConversation(post.id);
    } catch (error) { requireAccount(error) || requireProfile(error) || toast(errorText(error)); }
  }
  function savePost(postId) {
    if (state.saved.has(postId)) state.saved.delete(postId);
    else state.saved.add(postId);
    writeList(SAVED_KEY, Array.from(state.saved));
    renderFeed();
    toast(state.saved.has(postId) ? 'Publicación guardada.' : 'Publicación retirada de guardados.');
  }
  async function deletePost(post) {
    if (!confirm('¿Eliminar esta publicación? Esta acción no se puede deshacer.')) return;
    try {
      await api('/posts/' + encodeURIComponent(post.id), 'DELETE');
      state.posts = state.posts.filter(function (item) { return item.id !== post.id; });
      state.saved.delete(post.id);
      writeList(SAVED_KEY, Array.from(state.saved));
      renderFeed();
      renderActivity();
      toast('Publicación eliminada.');
    } catch (error) { toast(errorText(error)); }
  }
  async function reportPost(post) {
    if (!token()) { requireAccount({ message: 'login_required' }); return; }
    var reason = prompt('Explica brevemente por qué reportas esta publicación:');
    if (!reason) return;
    try { await api('/reports', 'POST', { targetType: 'post', targetId: post.id, reason: reason }); toast('Reporte enviado. Gracias por ayudar a cuidar UNITALK.'); }
    catch (error) { toast(errorText(error)); }
  }
  function commentMarkup(comment) {
    var author = comment.author || {};
    return '<article class="unitalk-comment" data-comment-id="' + safe(comment.id) + '"><div class="unitalk-comment-head">' + avatar(author) +
      '<button class="unitalk-user-link" type="button" data-profile="' + safe(author.username || '') + '"><span><strong>' + safe(author.displayName || 'Estudiante Universe') + '</strong><small>@' + safe(author.username || 'usuario') + ' · ' + safe(relativeTime(comment.createdAt)) + '</small></span></button>' +
      (comment.canDelete ? '<button class="unitalk-mini-button" type="button" data-comment-action="delete">Eliminar</button>' : '') + '</div><p>' + safe(comment.text) + '</p></article>';
  }
  async function loadConversation(postId) {
    var post = postById(postId);
    if (!post) return;
    state.activePostId = postId;
    $('unitalk-conversation-modal').hidden = false;
    $('unitalk-conversation-content').innerHTML = postMarkup(post) + '<div class="unitalk-post-comments"><div class="unitalk-loading">Cargando comentarios...</div></div>';
    try {
      var payload = await api('/posts/' + encodeURIComponent(postId) + '/comments', 'GET');
      var comments = payload.comments || [];
      $('unitalk-conversation-content').querySelector('.unitalk-post-comments').innerHTML = '<div class="unitalk-comments-list">' + (comments.length ? comments.map(commentMarkup).join('') : '<div class="unitalk-empty">Sé la primera persona en comentar.</div>') + '</div>';
    } catch (error) {
      $('unitalk-conversation-content').querySelector('.unitalk-post-comments').innerHTML = '<div class="unitalk-empty">No se pudieron cargar los comentarios.</div>';
    }
  }
  async function sendComment() {
    var postId = state.activePostId;
    var text = $('unitalk-comment-input').value.trim();
    if (!postId || !text) return;
    var button = $('unitalk-comment-send');
    button.disabled = true;
    try {
      var result = await api('/posts/' + encodeURIComponent(postId) + '/comments', 'POST', { text: text });
      $('unitalk-comment-input').value = '';
      var post = postById(postId);
      if (post) post.comments = result.comments;
      await loadConversation(postId);
      renderFeed();
    } catch (error) { requireAccount(error) || requireProfile(error) || toast(errorText(error)); }
    finally { button.disabled = false; }
  }
  async function deleteComment(button) {
    var row = button.closest('[data-comment-id]');
    if (!row || !state.activePostId || !confirm('¿Eliminar este comentario?')) return;
    try {
      await api('/posts/' + encodeURIComponent(state.activePostId) + '/comments/' + encodeURIComponent(row.dataset.commentId), 'DELETE');
      await loadConversation(state.activePostId);
      var post = postById(state.activePostId);
      if (post) post.comments = Math.max(0, Number(post.comments || 0) - 1);
      renderFeed();
    } catch (error) { toast(errorText(error)); }
  }
  function profileFact(label, value) { return value ? '<div class="unitalk-profile-fact"><span>' + safe(label) + '</span><strong>' + safe(value) + '</strong></div>' : ''; }
  async function openProfile(username, push) {
    username = String(username || '').toLowerCase();
    if (!username) return;
    $('unitalk-profile-modal').hidden = false;
    $('unitalk-profile-content').innerHTML = '<div class="unitalk-loading">Cargando perfil...</div>';
    try {
      var payload = await api('/profile/' + encodeURIComponent(username), 'GET');
      var profile = payload.profile || {};
      $('unitalk-profile-content').innerHTML = '<div class="unitalk-profile-hero">' + avatar(profile) +
        '<h2 id="unitalk-profile-name">' + safe(profile.displayName || 'Estudiante Universe') + '</h2><span class="handle">@' + safe(profile.username || username) + '</span>' +
        (profile.private ? '<p>Esta persona eligió mantener privados sus datos académicos.</p>' : '<p>' + safe(profile.bio || 'Miembro de la comunidad Universe.') + '</p>') +
        '</div><div class="unitalk-profile-facts">' + profileFact('Academia o institución', profile.academy) + profileFact('Ciclo', profile.cycle) + profileFact('Objetivo', profile.target) + profileFact('Miembro desde', profile.joinedAt ? new Date(profile.joinedAt).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' }) : '') + '</div>';
      if (push !== false) history.pushState({ unitalkProfile: username }, '', '/unitalk/perfil/' + encodeURIComponent(username));
    } catch (error) { $('unitalk-profile-content').innerHTML = '<div class="unitalk-empty">Este perfil no existe o no está disponible.</div>'; }
  }
  function closeModal(id) {
    $(id).hidden = true;
    if (id === 'unitalk-profile-modal' && /^\/unitalk\/perfil\//.test(location.pathname)) history.pushState({}, '', '/unitalk');
    if (id === 'unitalk-conversation-modal') state.activePostId = '';
  }
  function setView(view) {
    state.view = view;
    $('unitalk-home-view').hidden = view !== 'home';
    $('unitalk-page-view').hidden = view === 'home';
    document.querySelectorAll('.unitalk-nav-item').forEach(function (button) { button.classList.toggle('active', button.dataset.view === view); });
    $('unitalk-sidebar').classList.remove('open');
    $('unitalk-sidebar-overlay').classList.remove('show');
    if (view === 'home') { renderFeed(); return; }
    renderPage(view);
  }
  function renderPage(view) {
    var root = $('unitalk-page-view');
    var mine = state.posts.filter(isMine);
    if (view === 'explore') {
      root.innerHTML = '<div class="unitalk-page-heading"><div><h1>Explorar</h1><p>Busca temas y conversaciones de la comunidad.</p></div></div>' +
        '<section class="unitalk-page-card"><h2>Temas para conversar</h2><div class="unitalk-explore-grid"><div class="unitalk-topic-card"><strong>Matemática</strong><span>Comparte métodos, dudas y ejercicios.</span></div><div class="unitalk-topic-card"><strong>Ciencias</strong><span>Física, Química y razonamiento científico.</span></div><div class="unitalk-topic-card"><strong>Humanidades</strong><span>Lecturas, ideas y estrategias de repaso.</span></div><div class="unitalk-topic-card"><strong>Vida preuniversitaria</strong><span>Organización, motivación y metas.</span></div></div></section>' +
        '<section class="unitalk-page-card"><h2>Publicaciones recientes</h2><div class="unitalk-feed">' + (state.posts.length ? state.posts.map(postMarkup).join('') : '<div class="unitalk-empty">Aún no hay publicaciones.</div>') + '</div></section>';
      return;
    }
    if (view === 'saved') {
      var savedPosts = state.posts.filter(function (post) { return state.saved.has(post.id); });
      root.innerHTML = '<div class="unitalk-page-heading"><div><h1>Guardados</h1><p>Publicaciones que quieres revisar después.</p></div></div><section class="unitalk-feed">' + (savedPosts.length ? savedPosts.map(postMarkup).join('') : '<div class="unitalk-empty">Todavía no guardaste publicaciones.</div>') + '</section>';
      return;
    }
    if (view === 'profile') {
      var profile = state.me || currentGoogleUser() || {};
      root.innerHTML = '<div class="unitalk-page-heading"><div><h1>Mi perfil</h1><p>Así te verá la comunidad de UNITALK.</p></div></div><section class="unitalk-page-card"><div class="unitalk-profile-summary">' + avatar(profile) + '<div><h2>' + safe(profile.displayName || profile.name || 'Tu perfil') + '</h2><span class="unitalk-handle">' + (state.me && state.me.username ? '@' + safe(state.me.username) : 'Completa tu perfil público') + '</span><p>' + safe(state.me && state.me.bio || 'Configura tus datos visibles y preferencias de privacidad desde tu cuenta.') + '</p></div></div><a class="unitalk-profile-cta" href="/account">Administrar mi perfil</a></section><section class="unitalk-page-card"><h2>Mis publicaciones</h2><div class="unitalk-feed">' + (mine.length ? mine.map(postMarkup).join('') : '<div class="unitalk-empty">Aún no has publicado en UNITALK.</div>') + '</div></section>';
      return;
    }
    if (view === 'settings') {
      var dark = document.documentElement.getAttribute('data-universe-theme') === 'dark';
      root.innerHTML = '<div class="unitalk-page-heading"><div><h1>Ajustes</h1><p>Personaliza tu experiencia sin cambiar la privacidad de tu cuenta.</p></div></div><section class="unitalk-page-card"><div class="unitalk-settings-list">' +
        settingRow('dark', 'Modo oscuro', 'Aplica el mismo tema a todo Universe to Study.', dark) + settingRow('compact', 'Vista compacta', 'Muestra más publicaciones en la pantalla.', readFlag(COMPACT_KEY)) + settingRow('motion', 'Reducir animaciones', 'Desactiva efectos decorativos de la interfaz.', readFlag(MOTION_KEY)) +
        '</div></section><section class="unitalk-page-card"><h2>Privacidad y convivencia</h2><p>Tu Gmail, teléfono y permisos de administrador nunca aparecen en UNITALK. Elige los datos visibles desde tu cuenta.</p><a class="unitalk-profile-cta" href="/account">Ir a privacidad del perfil</a></section>';
    }
  }
  function settingRow(key, title, description, active) {
    return '<div class="unitalk-setting"><div><strong>' + safe(title) + '</strong><small>' + safe(description) + '</small></div><button class="unitalk-switch ' + (active ? 'active' : '') + '" type="button" data-setting="' + safe(key) + '" aria-label="Cambiar ' + safe(title) + '"></button></div>';
  }
  function switchSetting(key) {
    if (key === 'dark') {
      if (window.toggleUniverseTheme) window.toggleUniverseTheme();
      else document.documentElement.toggleAttribute('data-universe-theme');
    } else if (key === 'compact') writeFlag(COMPACT_KEY, !readFlag(COMPACT_KEY));
    else if (key === 'motion') writeFlag(MOTION_KEY, !readFlag(MOTION_KEY));
    setBodyPreferences();
    renderPage('settings');
  }
  function handlePostAction(button) {
    var postRoot = button.closest('[data-post-id]');
    var post = postRoot && postById(postRoot.dataset.postId);
    if (!post) return;
    var action = button.dataset.postAction;
    if (action === 'like' || action === 'dislike') react(post, action);
    else if (action === 'comments') loadConversation(post.id);
    else if (action === 'save') savePost(post.id);
    else if (action === 'report') reportPost(post);
    else if (action === 'delete') deletePost(post);
  }
  function bind() {
    $('unitalk-post-text').addEventListener('input', updateComposer);
    $('unitalk-publish').onclick = publish;
    $('unitalk-discussion').onclick = function () { state.discussion = !state.discussion; updateComposer(); };
    $('unitalk-poll-toggle').onclick = function () {
      state.pollActive = !state.pollActive;
      if (state.pollActive && state.pollOptions.length < 2) state.pollOptions = ['', ''];
      renderPollBuilder();
      updateComposer();
    };
    $('unitalk-poll-close').onclick = function () { state.pollActive = false; state.pollOptions = ['', '']; renderPollBuilder(); updateComposer(); };
    $('unitalk-poll-add-option').onclick = function () {
      if (state.pollOptions.length < 4) state.pollOptions.push('');
      renderPollBuilder();
    };
    $('unitalk-attachment-remove').onclick = function () {
      releaseAttachment(state.attachment);
      state.attachment = null;
      ['unitalk-image-input', 'unitalk-video-input', 'unitalk-pdf-input'].forEach(function (id) { $(id).value = ''; });
      $('unitalk-composer-status').textContent = 'Archivo retirado.';
      $('unitalk-composer-status').className = 'unitalk-status';
      updateComposer();
    };
    document.querySelectorAll('[data-attachment-kind]').forEach(function (button) {
      button.onclick = function () {
        var target = button.dataset.attachmentKind === 'image' ? 'unitalk-image-input' : button.dataset.attachmentKind === 'video' ? 'unitalk-video-input' : 'unitalk-pdf-input';
        $(target).click();
      };
    });
    [
      ['unitalk-image-input', 'image'],
      ['unitalk-video-input', 'video'],
      ['unitalk-pdf-input', 'pdf']
    ].forEach(function (entry) {
      $(entry[0]).addEventListener('change', function () {
        if (this.files && this.files[0]) chooseAttachment(entry[1], this.files[0]);
      });
    });
    $('unitalk-profile-action').onclick = function () { location.href = '/account'; };
    $('unitalk-sidebar-publish').onclick = function () { setView('home'); setTimeout(function () { $('unitalk-post-text').focus(); }, 0); };
    $('unitalk-join-button').onclick = function () { if (!currentGoogleUser() && window.UniverseGoogleAuth) UniverseGoogleAuth.open({ account: true }); else { setView('home'); $('unitalk-post-text').focus(); } };
    $('unitalk-menu-toggle').onclick = function () { $('unitalk-sidebar').classList.toggle('open'); $('unitalk-sidebar-overlay').classList.toggle('show'); };
    $('unitalk-sidebar-overlay').onclick = function () { $('unitalk-sidebar').classList.remove('open'); $('unitalk-sidebar-overlay').classList.remove('show'); };
    $('unitalk-account-button').onclick = function () {
      if (!currentGoogleUser()) { if (window.UniverseGoogleAuth) UniverseGoogleAuth.open({ account: true }); return; }
      $('unitalk-account-menu').hidden = !$('unitalk-account-menu').hidden;
    };
    $('unitalk-search-input').addEventListener('input', function () { state.search = this.value.trim(); $('unitalk-search-clear').hidden = !state.search; if (state.view === 'home') renderFeed(); else if (state.view === 'explore') renderPage('explore'); });
    $('unitalk-search-clear').onclick = function () { $('unitalk-search-input').value = ''; state.search = ''; this.hidden = true; if (location.search) history.replaceState({}, '', location.pathname); if (state.view === 'home') renderFeed(); else if (state.view === 'explore') renderPage('explore'); };
    document.querySelectorAll('.unitalk-tab').forEach(function (button) { button.onclick = function () { state.filter = button.dataset.filter; document.querySelectorAll('.unitalk-tab').forEach(function (tab) { tab.classList.toggle('active', tab === button); }); renderFeed(); }; });
    $('unitalk-comment-send').onclick = sendComment;
    $('unitalk-comment-input').addEventListener('keydown', function (event) { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') sendComment(); });
    document.addEventListener('click', function (event) {
      var viewButton = event.target.closest('[data-view]');
      if (viewButton) { event.preventDefault(); setView(viewButton.dataset.view); $('unitalk-account-menu').hidden = true; return; }
      var profileButton = event.target.closest('[data-profile]');
      if (profileButton) { openProfile(profileButton.dataset.profile); return; }
      var hashtagButton = event.target.closest('[data-hashtag]');
      if (hashtagButton) {
        event.preventDefault();
        state.search = '#' + hashtagButton.dataset.hashtag;
        $('unitalk-search-input').value = state.search;
        $('unitalk-search-clear').hidden = false;
        history.replaceState({}, '', '/unitalk?tag=' + encodeURIComponent(hashtagButton.dataset.hashtag));
        setView('home');
        renderFeed();
        return;
      }
      var pollButton = event.target.closest('[data-poll-option]');
      if (pollButton) {
        var pollRoot = pollButton.closest('[data-post-id]');
        var pollPost = pollRoot && postById(pollRoot.dataset.postId);
        if (pollPost) votePoll(pollPost, pollButton.dataset.pollOption);
        return;
      }
      var actionButton = event.target.closest('[data-post-action]');
      if (actionButton) { handlePostAction(actionButton); return; }
      var closeButton = event.target.closest('[data-close-modal]');
      if (closeButton) { closeModal(closeButton.dataset.closeModal); return; }
      var deleteCommentButton = event.target.closest('[data-comment-action="delete"]');
      if (deleteCommentButton) { deleteComment(deleteCommentButton); return; }
      var settingButton = event.target.closest('[data-setting]');
      if (settingButton) { switchSetting(settingButton.dataset.setting); return; }
      if (!$('unitalk-account-menu').contains(event.target) && !$('unitalk-account-button').contains(event.target)) $('unitalk-account-menu').hidden = true;
    });
    window.addEventListener('universe-google-auth', function () { setTimeout(function () { loadMe(); loadFeed(); }, 120); });
    window.addEventListener('popstate', function () {
      var match = location.pathname.match(/^\/unitalk\/perfil\/([a-zA-Z0-9_-]+)$/);
      if (match) openProfile(match[1], false);
      else $('unitalk-profile-modal').hidden = true;
    });
  }
  function bootDeepProfile() { var match = location.pathname.match(/^\/unitalk\/perfil\/([a-zA-Z0-9_-]+)$/); if (match) openProfile(match[1], false); }
  function boot() {
    setBodyPreferences();
    bind();
    var initialTag = hashtagValue(new URLSearchParams(location.search).get('tag'));
    if (initialTag) {
      state.search = '#' + initialTag;
      $('unitalk-search-input').value = state.search;
      $('unitalk-search-clear').hidden = false;
    }
    renderIdentity();
    updateComposer();
    loadFeed();
    setTimeout(loadMe, 500);
    bootDeepProfile();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
