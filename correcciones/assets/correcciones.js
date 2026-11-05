/* UNIverse · Correcciones v4 — formulario de reportes, índice legal y pequeños detalles de interfaz. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  var WA = 'https://wa.me/51963385410';

  var form = $('#rep'); if (!form) return;
  var HINTS = {
    academica: 'Indica la fórmula, pregunta o tema, qué dice, qué crees que es correcto y tu fuente.',
    datos: 'Escribe el código, curso, evaluación o carrera y el dato que ves frente al correcto. Prioridad alta.',
    tecnica: 'Cuéntanos qué hiciste, qué esperabas y qué pasó. Indica tu dispositivo y navegador si puedes.',
    derechos: 'Identifica la obra, quién es el titular y el enlace exacto. Declara que actúas de buena fe. Prioridad alta.',
    privacidad: 'Indica qué dato, qué derecho ejerces (acceso, rectificación, cancelación u oposición) y tu referencia si ya reportaste. Prioridad alta.'
  };
  var LABEL = { academica: 'Académica', datos: 'Datos', tecnica: 'Técnica', derechos: 'Derechos de autor', privacidad: 'Privacidad' };
  var ERR = {
    type_required: 'Elige un tipo de reporte.', name_required: 'Escribe tu nombre (mínimo 2 letras).', email_invalid: 'Revisa el correo: no parece válido.',
    page_required: 'Elige la página que reportas.', url_invalid: 'Escribe un enlace completo (https://…) o una ruta como /ranking.',
    message_short: 'Cuéntanos un poco más: mínimo 15 caracteres.', consent_required: 'Necesitamos tu autorización para atender el reporte.',
    adult_required: 'Confirma esta casilla para continuar.'
  };
  var PAGES = { '/': 'Inicio', '/admision': 'Admisión UNI', '/cepreuni': 'CEPREUNI', '/ranking': 'Ranking', '/calculadora': 'Calculadora de puntaje', '/calculadora-admision': 'Calculadora de puntaje',
    '/temario': 'Temario', '/clases': 'Clases', '/biblioteca': 'Biblioteca', '/examenes': 'Exámenes', '/simulacros': 'Simulacros', '/planificador': 'Planificador', '/fijas-cepreuni': 'Fijas CEPREUNI',
    '/docentes-cepreuni': 'Guía de aulas y docentes', '/ingresantes-uni-2026-2': 'Ingresantes', '/ingresantes-cepreuni': 'Ingresantes', '/unitalk': 'UNITALK', '/account': 'Mi espacio / cuenta',
    '/metodologia-editorial': 'Metodología editorial', '/terminos': 'Términos o Privacidad', '/privacidad': 'Términos o Privacidad' };

  function field(name) { return form.elements[name]; }
  function setErr(name, msg) {
    var el = $('#e-' + name); if (!el) return;
    el.textContent = msg || '';
    var input = name === 'type' ? null : field(name);
    if (input && input.setAttribute) { if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid'); }
  }
  function clearErrs() { ['type', 'name', 'email', 'page', 'url', 'message', 'adult', 'consent'].forEach(function (n) { setErr(n, ''); }); }

  /* ---------- tipo ---------- */
  function selectedType() { var r = form.querySelector('input[name="type"]:checked'); return r ? r.value : ''; }
  function paintType() {
    var t = selectedType(); $('#type-hint').textContent = t ? HINTS[t] : 'Elige el tipo que mejor describa el problema.';
    if (t) setErr('type', '');
  }
  $('#types').addEventListener('change', paintType);
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-type]'); if (!a) return;
    var r = form.querySelector('input[name="type"][value="' + a.getAttribute('data-type') + '"]');
    if (r) { r.checked = true; paintType(); save(); }
  });

  /* ---------- contador ---------- */
  var msg = field('message'), counter = $('#msg-count');
  function paintCount() { var n = msg.value.length; counter.textContent = n + ' / 2000'; counter.classList.toggle('warn', n > 1800); }
  msg.addEventListener('input', paintCount);

  /* ---------- borrador (solo en esta pestaña) ---------- */
  var KEY = 'uts-correcciones-draft', FIELDS = ['name', 'email', 'page', 'url', 'data', 'message'];
  function save() {
    try { var d = { type: selectedType() }; FIELDS.forEach(function (n) { d[n] = field(n).value; }); sessionStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* almacenamiento bloqueado */ }
  }
  function restore() {
    try {
      var d = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (!d) return;
      FIELDS.forEach(function (n) { if (typeof d[n] === 'string') field(n).value = d[n]; });
      if (d.type) { var r = form.querySelector('input[name="type"][value="' + d.type + '"]'); if (r) r.checked = true; }
    } catch (e) { /* sin borrador */ }
  }
  function wipe() { try { sessionStorage.removeItem(KEY); } catch (e) { /* nada */ } }
  form.addEventListener('input', save); form.addEventListener('change', save);
  restore();

  /* ---------- precargar página y tipo (?p=/ranking&tipo=datos) o la página de origen ---------- */
  (function () {
    var q = new URLSearchParams(location.search), p = q.get('p') || q.get('pagina') || '', t = q.get('tipo') || '';
    if (!p && document.referrer) { try { var ref = new URL(document.referrer); if (ref.host === location.host) p = ref.pathname; } catch (e) { /* sin referrer */ } }
    if (p) {
      p = p.replace(/\/+$/, '') || '/';
      var key = PAGES[p] ? p : Object.keys(PAGES).filter(function (k) { return k !== '/' && p.indexOf(k + '/') === 0; })[0];
      if (!field('page').value) {
        if (key) field('page').value = PAGES[key];
        else if (p.indexOf('/biblioteca') === 0) field('page').value = 'Biblioteca';
      }
      if (!field('url').value && /^\/[\w\-./]*$/.test(p) && p !== '/correcciones') field('url').value = location.origin + p;
    }
    if (HINTS[t]) { var r = form.querySelector('input[name="type"][value="' + t + '"]'); if (r) r.checked = true; }
    paintType(); paintCount();
  })();

  /* ---------- envío ---------- */
  var send = $('#send'), status = $('#status'), card = $('#formcard'), done = $('#done'), fail = $('#fail');
  var lastPayload = null;

  function localValidate(p) {
    if (!p.type) return ['type', 'type_required'];
    if (p.name.length < 2) return ['name', 'name_required'];
    if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.email)) return ['email', 'email_invalid'];
    if (!p.page) return ['page', 'page_required'];
    if (p.url && !/^https?:\/\/\S+$/i.test(p.url) && !/^\/\S*$/.test(p.url)) return ['url', 'url_invalid'];
    if (p.message.length < 15) return ['message', 'message_short'];
    if (!p.adult) return ['adult', 'adult_required'];
    if (!p.consent) return ['consent', 'consent_required'];
    return null;
  }
  function payload() {
    return {
      type: selectedType(), name: field('name').value.trim(), email: field('email').value.trim(), page: field('page').value, url: field('url').value.trim(),
      data: field('data').value.trim(), message: msg.value.trim(), adult: field('adult').checked, consent: field('consent').checked, website: field('website').value
    };
  }
  function focusField(name) {
    var el = name === 'type' ? form.querySelector('input[name="type"]') : (name === 'adult' || name === 'consent' ? field(name) : field(name));
    if (el) { el.scrollIntoView({ behavior: RM.matches ? 'auto' : 'smooth', block: 'center' }); el.focus({ preventScroll: true }); }
  }
  function busy(on) { send.classList.toggle('is-busy', on); send.disabled = on; send.setAttribute('aria-busy', String(on)); }
  function waLink(p) {
    var t = 'Hola, quiero reportar un error en Universe to Study.\nTipo: ' + (LABEL[p.type] || '') + '\nPágina: ' + p.page + (p.url ? '\nEnlace: ' + p.url : '') + (p.data ? '\nDatos: ' + p.data : '') + '\nMensaje: ' + p.message + '\nNombre: ' + p.name;
    return WA + '?text=' + encodeURIComponent(t.slice(0, 1500));
  }
  function show(which) { form.hidden = which !== 'form'; done.hidden = which !== 'done'; fail.hidden = which !== 'fail'; var el = which === 'done' ? done : which === 'fail' ? fail : null; if (el) { el.focus({ preventScroll: true }); card.scrollIntoView({ behavior: RM.matches ? 'auto' : 'smooth', block: 'nearest' }); } }

  function submit() {
    var p = payload(); lastPayload = p; clearErrs(); status.textContent = ''; status.classList.remove('bad');
    var v = localValidate(p);
    if (v) { setErr(v[0], ERR[v[1]]); status.textContent = 'Revisa el campo marcado.'; status.classList.add('bad'); focusField(v[0]); return; }
    busy(true); status.textContent = 'Enviando…';
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null, to = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);
    fetch('/api/correcciones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p), signal: ctrl ? ctrl.signal : undefined })
      .then(function (res) { return res.json().catch(function () { return {}; }).then(function (d) { return { ok: res.ok, status: res.status, d: d }; }); })
      .then(function (r) {
        clearTimeout(to); busy(false);
        if (r.ok && r.d.ok) {
          wipe();
          $('#done-name').textContent = p.name; $('#done-id').textContent = r.d.id;
          $('#done-note').textContent = p.email ? 'Si necesitamos más datos, te escribiremos a ' + p.email + '. Guarda tu referencia para consultas o para ejercer tus derechos.' : 'No dejaste correo, así que no podremos responderte. Guarda tu referencia por si quieres consultar tu reporte.';
          status.textContent = ''; show('done'); return;
        }
        if (r.status === 400 && r.d.field) { var f = r.d.field === 'body' ? null : r.d.field; if (f) { setErr(f, ERR[r.d.error] || 'Revisa este campo.'); focusField(f); } status.textContent = 'Revisa el campo marcado.'; status.classList.add('bad'); return; }
        if (r.status === 429) { status.textContent = 'Has enviado varios reportes seguidos. Espera unos minutos e inténtalo de nuevo.'; status.classList.add('bad'); return; }
        $('#wa').href = waLink(p); status.textContent = ''; show('fail');
      })
      .catch(function () { clearTimeout(to); busy(false); $('#wa').href = waLink(p); status.textContent = ''; show('fail'); });
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); submit(); });
  ['name', 'email', 'page', 'url', 'message'].forEach(function (n) { field(n).addEventListener('input', function () { setErr(n, ''); }); });
  ['adult', 'consent'].forEach(function (n) { field(n).addEventListener('change', function () { setErr(n, ''); }); });
  $('#retry').addEventListener('click', function () { show('form'); submit(); });
  $('#again').addEventListener('click', function () {
    form.reset(); paintType(); paintCount(); clearErrs(); show('form'); field('name').focus({ preventScroll: true });
  });
  $('#copy-id').addEventListener('click', function () {
    var id = $('#done-id').textContent, b = this, old = b.textContent;
    function ok() { b.textContent = 'Copiado'; setTimeout(function () { b.textContent = old; }, 1600); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(id).then(ok, function () { b.textContent = id; });
    else { var r = document.createRange(); r.selectNodeContents($('#done-id')); var s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Selecciona y copia'; }
  });

  /* ---------- brillo de borde (BorderGlow de React Bits, sin React) ---------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var glowRaf = 0, glowEv = null;
    document.addEventListener('pointermove', function (e) {
      glowEv = e; if (glowRaf) return;
      glowRaf = requestAnimationFrame(function () {
        glowRaf = 0;
        var card = glowEv.target.closest && glowEv.target.closest('.bglow'); if (!card) return;
        var r = card.getBoundingClientRect(), cx = r.width / 2, cy = r.height / 2, dx = glowEv.clientX - r.left - cx, dy = glowEv.clientY - r.top - cy;
        var kx = dx ? cx / Math.abs(dx) : Infinity, ky = dy ? cy / Math.abs(dy) : Infinity;
        var edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1), a = dx || dy ? Math.atan2(dy, dx) * 180 / Math.PI + 90 : 0;
        card.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
        card.style.setProperty('--cursor-angle', (a < 0 ? a + 360 : a).toFixed(3) + 'deg');
      });
    }, { passive: true });
  }

  /* ---------- anclas internas ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a || a.getAttribute('href').length < 2) return;
    var t = document.getElementById(a.getAttribute('href').slice(1)); if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: RM.matches ? 'auto' : 'smooth', block: 'start' });
    t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true });
    try { history.replaceState(null, '', location.pathname + location.search + '#' + t.id); } catch (err) { /* file:// */ }
  });
  if (location.hash.length > 1) setTimeout(function () { var t = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (t) t.scrollIntoView({ block: 'start' }); }, 60);

  /* ---------- sección activa, índice legal, aparición y volver arriba ---------- */
  function spy(links, rootMargin) {
    var map = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    if (!('IntersectionObserver' in window)) return;
    var live = {};
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { live[en.target.id] = en.isIntersecting; });
      var cur = map.filter(function (s) { return s && live[s.id]; })[0];
      links.forEach(function (a) { a.setAttribute('aria-current', String(!!cur && a.getAttribute('href') === '#' + cur.id)); });
    }, { rootMargin: rootMargin });
    map.forEach(function (s) { if (s) io.observe(s); });
  }
  spy($$('.snav a'), '-35% 0px -60% 0px');
  spy($$('#lawnav a'), '-25% 0px -65% 0px');
  if ('IntersectionObserver' in window) {
    var rev = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); rev.unobserve(en.target); } }); }, { rootMargin: '0px 0px -6% 0px' });
    $$('.sc').forEach(function (n) { rev.observe(n); });
  } else $$('.sc').forEach(function (n) { n.classList.add('in'); });
  (function () {
    var btn = $('.totop'), ticking = false;
    function sync() {
      ticking = false;
      var max = document.documentElement.scrollHeight - innerHeight, y = scrollY, on = y > innerHeight * 1.2;
      btn.classList.toggle('is-on', on); btn.tabIndex = on ? 0 : -1;
      btn.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(sync); } }, { passive: true });
    addEventListener('resize', sync); sync();
    btn.addEventListener('click', function () { scrollTo({ top: 0, behavior: RM.matches ? 'auto' : 'smooth' }); });
  })();
})();
