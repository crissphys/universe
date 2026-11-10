/* UNIverse · perfil: pestañas, pasos de registro la primera vez, perfil completo y accesos.
   La carga y el guardado siguen en /account.js; este archivo solo organiza la vista (eventos account:ready y account:saved). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var body = document.body;
  var tabs = $$('.tab'), saveBtn = $('[data-save-unified]'), next = $('#step-next'), back = $('#step-back'), later = $('#step-later');
  var STEPS = ['perfil', 'academico', 'comunidad'];
  var mode = 'profile', step = 0, booted = false;

  function show(id, focusTab) {
    $$('.panel').forEach(function (p) { p.classList.toggle('is-open', p.dataset.panel === id); });
    tabs.forEach(function (t) {
      var on = t.dataset.tab === id;
      t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
      if (on && focusTab) t.focus();
      // en teléfono las pestañas se desplazan: la activa siempre queda a la vista
      if (on && t.parentNode.scrollWidth > t.parentNode.clientWidth) t.parentNode.scrollTo({ left: t.offsetLeft - 20, behavior: 'smooth' });
    });
    if (mode === 'profile') history.replaceState(null, '', '#' + id);
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () { show(t.dataset.tab); });
    t.addEventListener('keydown', function (e) {
      var list = tabs.filter(function (x) { return !x.hidden; }), i = list.indexOf(t), k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); show(list[(i + 1) % list.length].dataset.tab, true); }
      else if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); show(list[(i - 1 + list.length) % list.length].dataset.tab, true); }
    });
  });

  /* validación por paso: las mismas reglas que validateUnifiedProfile en account.js, junto a cada campo */
  var val = function (id) { var el = document.getElementById(id); return el ? String(el.value || '').trim() : ''; };
  function err(id, msg) {
    var f = document.getElementById(id); if (!f) return true;
    var wrap = f.closest('.account-field') || f.parentNode, e = wrap.querySelector('.field-error');
    if (!msg) { f.removeAttribute('aria-invalid'); if (e) e.remove(); return true; }
    f.setAttribute('aria-invalid', 'true');
    if (!e) { e = document.createElement('p'); e.className = 'field-error'; e.id = id + '-err'; wrap.appendChild(e); f.setAttribute('aria-describedby', e.id); }
    e.textContent = msg;
    return false;
  }
  var CHECK = {
    perfil: function () {
      return [
        err('community-display-name', val('community-display-name') ? '' : 'Escribe el nombre que quieres mostrar.'),
        err('community-username', /^[a-z0-9][a-z0-9_-]{2,23}$/.test(val('community-username').toLowerCase()) ? '' : 'De 3 a 24 caracteres: letras, números, guion o guion bajo.')
      ].every(Boolean);
    },
    academico: function () {
      var t = val('academic-track'), r = [err('academic-track', t ? '' : 'Elige tu situación actual.')];
      if (t === 'academy') r.push(err('academy-name', val('academy-name') ? '' : 'Elige tu academia.'), err('academy-cycle', val('academy-cycle') ? '' : 'Elige tu ciclo o modalidad.'));
      if (t === 'cepreuni') r.push(err('cepre-program', val('cepre-program') ? '' : 'Elige tu modalidad CEPREUNI.'));
      if (t === 'uni-student') r.push(err('uni-career', val('uni-career') ? '' : 'Escribe la carrera que estudias.'), err('uni-cycle', val('uni-cycle') ? '' : 'Elige tu ciclo.'));
      r.push(err('community-target', val('community-target') ? '' : 'Elige tu objetivo principal.'));
      return r.every(Boolean);
    },
    comunidad: function () { return err('community-intent', val('community-intent') ? '' : 'Elige una opción.'); }
  };
  document.addEventListener('input', function (e) { if (e.target.getAttribute && e.target.getAttribute('aria-invalid')) err(e.target.id, ''); });
  document.addEventListener('change', function (e) { if (e.target.getAttribute && e.target.getAttribute('aria-invalid')) err(e.target.id, ''); });
  var firstInvalid = function () { var f = $('.panel.is-open [aria-invalid="true"]'); if (f) f.focus(); };

  function renderStep() {
    show(STEPS[step]);
    $$('.steps li').forEach(function (li, i) {
      li.classList.toggle('done', i < step); li.classList.toggle('now', i === step);
      if (i === step) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    back.hidden = step === 0; next.hidden = step === STEPS.length - 1; saveBtn.hidden = step !== STEPS.length - 1;
    var st = $('#unified-status'); st.textContent = 'Paso ' + (step + 1) + ' de ' + STEPS.length; st.dataset.state = '';
    scrollTo({ top: 0, behavior: 'smooth' });
  }
  function setMode(m) {
    mode = m; body.classList.toggle('onb', m === 'onb');
    later.hidden = m !== 'onb';
    if (m === 'onb') { step = 0; saveBtn.textContent = 'Crear mi perfil'; renderStep(); return; }
    back.hidden = true; next.hidden = true; saveBtn.hidden = false; saveBtn.textContent = 'Guardar cambios';
    var s2 = $('#unified-status'); if (/^Paso /.test(s2.textContent)) s2.textContent = 'Revisa tus datos y guarda.';
    var want = location.hash.slice(1), ok = tabs.some(function (t) { return t.dataset.tab === want && !t.hidden; });
    show(ok ? want : 'perfil');
  }
  next.addEventListener('click', function () { if (CHECK[STEPS[step]]()) { step++; renderStep(); } else firstInvalid(); });
  back.addEventListener('click', function () { if (step > 0) { step--; renderStep(); } });
  later.addEventListener('click', function () { setMode('profile'); });
  // en el último paso valida antes de que account.js guarde (este listener corre antes que su onclick)
  saveBtn.addEventListener('click', function (e) {
    var bad = mode === 'onb' ? !CHECK.comunidad() : !STEPS.every(function (s) { return CHECK[s](); });
    if (bad) {
      e.stopImmediatePropagation();
      if (mode === 'profile') { var tab = STEPS.filter(function (s) { return $('[data-panel="' + s + '"] [aria-invalid="true"]'); })[0]; if (tab) show(tab); }
      firstInvalid();
    }
  }, true);

  /* perfil completo: siete datos que hacen útil el perfil en UNITALK y en el ranking */
  function meter() {
    var items = [val('community-display-name'), /^[a-z0-9]/i.test(val('community-username')), val('community-bio'), !!$('#community-avatar img'), val('academic-track'), val('community-target'), val('community-intent')];
    var pct = Math.round(items.filter(Boolean).length / items.length * 100);
    $('#meter-n').textContent = pct + '%';
    $('#meter-fill').style.transform = 'scaleX(' + pct / 100 + ')';
    $('.meter').classList.toggle('full', pct === 100);
  }
  document.addEventListener('input', meter); document.addEventListener('change', meter);
  new MutationObserver(meter).observe($('#community-avatar'), { childList: true });
  function rank() {
    var c = $('#cepre-code'), a = $('#act-rank');
    if (c && c.disabled && c.value) { a.href = '/ranking?q=' + encodeURIComponent(c.value); a.hidden = false; } else a.hidden = true;
  }

  document.addEventListener('account:ready', function (e) {
    var d = e.detail || {};
    $('#tab-admin').hidden = !d.admin;
    $('#welcome-name').textContent = (val('community-display-name') || val('profile-first') || '').split(/\s+/)[0] || '';
    if (!booted) { booted = true; setMode(d.onboarded ? 'profile' : 'onb'); }
    $('#acc-loading').hidden = true; body.classList.add('ready');
    meter(); rank();
  });
  document.addEventListener('account:saved', function () {
    if (mode === 'onb') setMode('profile');
    meter(); rank();
  });

  var top = $('#top');
  addEventListener('scroll', function () { top.classList.toggle('solid', scrollY > 24); }, { passive: true });
})();
