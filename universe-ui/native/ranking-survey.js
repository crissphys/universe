(function () {
  var STORAGE_KEY = 'universe_ranking_survey_2027_1_complete';
  var source = window.UNIVERSE_CEPRE_2027_1;
  if (!source || !window.UniverseGoogleAuth) return;

  var faculties = {
    FAUA: { name: 'Arquitectura, Urbanismo y Artes', careers: ['Arquitectura', 'Urbanismo'] },
    FC: { name: 'Ciencias', careers: ['Física', 'Matemática', 'Química', 'Ingeniería Física', 'Ciencia de la Computación'] },
    FIA: { name: 'Ingeniería Ambiental', careers: ['Ingeniería Sanitaria', 'Ingeniería de Higiene y Seguridad Industrial', 'Ingeniería Ambiental'] },
    FIC: { name: 'Ingeniería Civil', careers: ['Ingeniería Civil'] },
    FIEECS: { name: 'Ingeniería Económica, Estadística y Ciencias Sociales', careers: ['Ingeniería Económica', 'Ingeniería Estadística'] },
    FIEE: { name: 'Ingeniería Eléctrica y Electrónica', careers: ['Ingeniería Eléctrica', 'Ingeniería Electrónica', 'Ingeniería de Telecomunicaciones', 'Ingeniería de Ciberseguridad', 'Ingeniería Biomédica'] },
    FIGMM: { name: 'Ingeniería Geológica, Minera y Metalúrgica', careers: ['Ingeniería Geológica', 'Ingeniería Metalúrgica', 'Ingeniería de Minas'] },
    FIIS: { name: 'Ingeniería Industrial y de Sistemas', careers: ['Ingeniería Industrial', 'Ingeniería de Sistemas', 'Ingeniería de Software', 'Ingeniería de Inteligencia Artificial'] },
    FIM: { name: 'Ingeniería Mecánica', careers: ['Ingeniería Mecánica', 'Ingeniería Mecánica Eléctrica', 'Ingeniería Naval', 'Ingeniería Mecatrónica', 'Ingeniería Aeroespacial'] },
    FIP: { name: 'Ingeniería de Petróleo, Gas Natural y Petroquímica', careers: ['Ingeniería de Petróleo y Gas Natural', 'Ingeniería Petroquímica'] },
    FIQT: { name: 'Ingeniería Química y Textil', careers: ['Ingeniería Química', 'Ingeniería Textil'] }
  };
  var state = { route: '', cepreTrack: '', code: '', faculty: '', careers: [] };
  var overlay;
  var panel;
  var title;
  var content;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function button(label, action, primary) {
    return '<button type="button" class="ranking-survey-button' + (primary ? ' is-primary' : '') + '" data-survey-action="' + action + '">' + esc(label) + '</button>';
  }

  function setView(heading, eyebrow, html) {
    title.textContent = heading;
    panel.querySelector('.ranking-survey-eyebrow').textContent = eyebrow || 'ENCUESTA 2027-1';
    content.innerHTML = html;
    panel.focus();
  }

  function close(markComplete) {
    if (markComplete) {
      try { localStorage.setItem(STORAGE_KEY, 'yes'); } catch (_) {}
    }
    if (!overlay) return;
    var closing = overlay;
    overlay = null;
    closing.classList.remove('is-visible');
    document.documentElement.classList.remove('ranking-survey-open');
    setTimeout(function () { closing.remove(); }, 240);
  }

  function intro() {
    setView('Hola, soy UNIverseAI', 'UNIVERSEAI',
      '<p class="ranking-survey-lead">Te quiero hacer una encuesta. ¿Tienes un minuto?</p>' +
      '<div class="ranking-survey-actions">' + button('Sí, tengo un minuto', 'start', true) + button('No, ahora no', 'decline', false) + '</div>');
  }

  function decline() {
    setView('Está bien', 'GRACIAS POR RESPONDER',
      '<p class="ranking-survey-lead">La próxima vez que visites esta página, la encuesta volverá a aparecer.</p>' +
      '<div class="ranking-survey-actions">' + button('Entendido', 'close-declined', true) + '</div>');
  }

  function chooseRoute() {
    setView('¿Cómo participarás en el proceso 2027-1?', 'TU PROCESO',
      '<p class="ranking-survey-lead">Elige la opción que corresponda contigo.</p>' +
      '<div class="ranking-survey-choice-grid">' +
      button('CEPREUNI 2027-1', 'route-cepre', true) +
      button('Admisión 2027-1', 'route-admission', false) +
      button('No participaré en este proceso', 'route-none', false) +
      '</div><div class="ranking-survey-footer">' + button('Volver', 'intro', false) + '</div>');
  }

  function notParticipating() {
    setView('Muchas gracias', 'ENCUESTA COMPLETADA',
      '<p class="ranking-survey-lead">Eso es todo por ahora. Gracias por ayudarnos a conocer mejor a la comunidad UNIverse.</p>' +
      '<div class="ranking-survey-actions">' + button('Finalizar', 'finish-none', true) + '</div>');
  }

  function chooseCepreTrack() {
    setView('¿A qué ciclo perteneces?', 'CEPREUNI 2027-1',
      '<p class="ranking-survey-lead">Tu código será validado solamente dentro del ciclo que selecciones.</p>' +
      '<div class="ranking-survey-actions">' + button('Ciclo Preuniversitario', 'track-pre', true) + button('Ciclo Básico', 'track-basic', false) + '</div>' +
      '<div class="ranking-survey-footer">' + button('Volver', 'route', false) + '</div>');
  }

  function codeOptions() {
    var rows = state.cepreTrack === 'basic' ? source.basic : source.pre;
    return rows.map(function (row) { return '<option value="' + esc(row[0]) + '"></option>'; }).join('');
  }

  function askCode(message) {
    var trackName = state.cepreTrack === 'basic' ? 'Ciclo Básico' : 'Ciclo Preuniversitario';
    setView('Pon tu código', 'CEPREUNI 2027-1 · ' + trackName.toUpperCase(),
      '<p class="ranking-survey-lead">Escribe el código que aparece en el ranking de ' + trackName + '.</p>' +
      '<form class="ranking-survey-form" data-survey-form="code">' +
      '<label for="ranking-survey-code">Código</label>' +
      '<input id="ranking-survey-code" name="code" list="ranking-survey-codes" maxlength="12" autocomplete="off" autocapitalize="characters" placeholder="Ejemplo: 2620001B" value="' + esc(state.code) + '" required>' +
      '<datalist id="ranking-survey-codes">' + codeOptions() + '</datalist>' +
      '<p class="ranking-survey-error" role="alert">' + esc(message || '') + '</p>' +
      '<div class="ranking-survey-actions">' + button('Verificar código', 'verify-code', true) + button('Volver', 'cepre-track', false) + '</div></form>');
    var input = panel.querySelector('#ranking-survey-code');
    input.addEventListener('input', function () { input.value = input.value.toUpperCase().replace(/\s+/g, ''); });
    input.focus();
  }

  function verifyCode() {
    var input = panel.querySelector('#ranking-survey-code');
    var code = String(input && input.value || '').trim().toUpperCase().replace(/\s+/g, '');
    var rows = state.cepreTrack === 'basic' ? source.basic : source.pre;
    if (!rows.some(function (row) { return row[0] === code; })) {
      state.code = code;
      askCode('Ese código no aparece en el ranking del ciclo elegido. Revísalo o vuelve para cambiar de ciclo.');
      return;
    }
    state.code = code;
    confirmCode();
  }

  function confirmCode() {
    var trackName = state.cepreTrack === 'basic' ? 'Ciclo Básico' : 'Ciclo Preuniversitario';
    setView('Confirma tu código', 'VALIDACIÓN DE IDENTIDAD ACADÉMICA',
      '<p class="ranking-survey-lead">Ingresaste el código:</p>' +
      '<div class="ranking-survey-code-confirm">' + esc(state.code) + '<span>' + esc(trackName) + ' · 2027-1</span></div>' +
      '<p class="ranking-survey-question">¿Confirmas que este código es correcto y te pertenece?</p>' +
      '<div class="ranking-survey-actions">' + button('Sí, es mi código', 'confirm-code', true) + button('No, corregir', 'edit-code', false) + '</div>');
  }

  function facultyOptions(selected) {
    return '<option value="">Selecciona una facultad</option>' + Object.keys(faculties).map(function (key) {
      return '<option value="' + key + '"' + (key === selected ? ' selected' : '') + '>' + key + ' · ' + esc(faculties[key].name) + '</option>';
    }).join('');
  }

  function allCareerOptions(selected) {
    return '<option value="">Selecciona una carrera</option>' + Object.keys(faculties).map(function (key) {
      return '<optgroup label="' + key + ' · ' + esc(faculties[key].name) + '">' + faculties[key].careers.map(function (career) {
        return '<option value="' + esc(career) + '"' + (career === selected ? ' selected' : '') + '>' + esc(career) + '</option>';
      }).join('') + '</optgroup>';
    }).join('');
  }

  function askCepreCareer(message) {
    setView('¿A qué carrera postulas?', 'ÚLTIMO PASO ACADÉMICO',
      '<p class="ranking-survey-lead">Tu carrera se sumará al conteo público sin mostrar tu código ni tu cuenta.</p>' +
      '<form class="ranking-survey-form" data-survey-form="cepre-career"><label for="ranking-survey-career">Carrera</label>' +
      '<select id="ranking-survey-career" required>' + allCareerOptions(state.careers[0] || '') + '</select>' +
      '<p class="ranking-survey-error" role="alert">' + esc(message || '') + '</p>' +
      '<div class="ranking-survey-actions">' + button('Continuar', 'save-cepre-career', true) + button('Volver', 'confirm-view', false) + '</div></form>');
  }

  function askAdmissionCareers(message) {
    var faculty = faculties[state.faculty];
    var careerOptions = function (selected, optional) {
      var first = '<option value="">' + (optional ? 'Sin elegir' : 'Selecciona una carrera') + '</option>';
      if (!faculty) return first;
      return first + faculty.careers.map(function (career) {
        return '<option value="' + esc(career) + '"' + (career === selected ? ' selected' : '') + '>' + esc(career) + '</option>';
      }).join('');
    };
    setView('Elige tus carreras', 'ADMISIÓN 2027-1',
      '<p class="ranking-survey-lead">Puedes elegir hasta tres carreras de una misma facultad. La primera será tu opción principal.</p>' +
      '<form class="ranking-survey-form" data-survey-form="admission-careers">' +
      '<label for="ranking-survey-faculty">Facultad</label><select id="ranking-survey-faculty">' + facultyOptions(state.faculty) + '</select>' +
      '<div class="ranking-survey-priorities"' + (faculty ? '' : ' hidden') + '>' +
      '<label>Primera opción<select data-priority="0" required>' + careerOptions(state.careers[0] || '', false) + '</select></label>' +
      '<label>Segunda opción<select data-priority="1">' + careerOptions(state.careers[1] || '', true) + '</select></label>' +
      '<label>Tercera opción<select data-priority="2">' + careerOptions(state.careers[2] || '', true) + '</select></label></div>' +
      '<p class="ranking-survey-error" role="alert">' + esc(message || '') + '</p>' +
      '<div class="ranking-survey-actions">' + button('Continuar', 'save-admission-careers', true) + button('Volver', 'route', false) + '</div></form>');
    panel.querySelector('#ranking-survey-faculty').addEventListener('change', function (event) {
      state.faculty = event.target.value;
      state.careers = [];
      askAdmissionCareers('');
    });
  }

  function readAdmissionCareers() {
    var values = Array.prototype.map.call(panel.querySelectorAll('[data-priority]'), function (select) { return select.value; }).filter(Boolean);
    if (!state.faculty || !values.length) {
      askAdmissionCareers('Selecciona una facultad y, por lo menos, tu primera opción.');
      return false;
    }
    if (new Set(values).size !== values.length) {
      askAdmissionCareers('No repitas una misma carrera en dos opciones.');
      return false;
    }
    state.careers = values;
    return true;
  }

  function summaryHtml() {
    if (state.route === 'cepreuni') {
      return '<strong>CEPREUNI 2027-1</strong><span>' + esc(state.cepreTrack === 'basic' ? 'Ciclo Básico' : 'Ciclo Preuniversitario') + '</span><span>Código ' + esc(state.code) + '</span><span>' + esc(state.careers[0]) + '</span>';
    }
    return '<strong>Admisión 2027-1</strong><span>' + esc(state.faculty + ' · ' + faculties[state.faculty].name) + '</span>' + state.careers.map(function (career, index) { return '<span>' + (index + 1) + '. ' + esc(career) + '</span>'; }).join('');
  }

  function isGoogleUser() {
    var user = window.UniverseGoogleAuth.user && window.UniverseGoogleAuth.user();
    return !!(user && user.secureSession && user.provider === 'google' && user.email);
  }

  function accountGate(message) {
    var user = window.UniverseGoogleAuth.user && window.UniverseGoogleAuth.user();
    var account = isGoogleUser()
      ? '<div class="ranking-survey-account"><span>Cuenta Google verificada</span><strong>' + esc(user.email) + '</strong></div>' + button('Guardar información', 'submit', true)
      : '<div class="ranking-survey-google" data-google-signin><span data-google-signin-slot></span></div><p class="ranking-survey-privacy">Inicia sesión con Google para vincular y guardar esta información de manera privada.</p>';
    setView('Confirma y guarda', 'CUENTA UNIVERSE',
      '<p class="ranking-survey-lead">Revisa tus respuestas antes de guardarlas.</p><div class="ranking-survey-review">' + summaryHtml() + '</div>' +
      '<p class="ranking-survey-error" role="alert">' + esc(message || '') + '</p><div class="ranking-survey-save">' + account + '</div>' +
      '<div class="ranking-survey-footer">' + button('Volver', state.route === 'cepreuni' ? 'cepre-career' : 'admission-careers', false) + '</div>');
    if (!isGoogleUser()) setTimeout(function () {
      var host = panel.querySelector('[data-google-signin]');
      if (host) window.UniverseGoogleAuth.open(host);
    }, 0);
  }

  function payload() {
    return state.route === 'cepreuni' ? {
      route: 'cepreuni', cycle: '2027-1', cepreTrack: state.cepreTrack, code: state.code, careers: state.careers
    } : {
      route: 'admission', cycle: '2027-1', faculty: state.faculty, careers: state.careers
    };
  }

  async function submit() {
    if (!isGoogleUser()) { accountGate('Necesitas una cuenta Google verificada para guardar.'); return; }
    var action = panel.querySelector('[data-survey-action="submit"]');
    if (action) { action.disabled = true; action.textContent = 'Guardando…'; }
    try {
      var result = await window.UniverseGoogleAuth.siteApi('/ranking-survey-2027-1', 'PUT', payload());
      if (!result || !result.ok || !result.survey || result.survey.cycle !== '2027-1') throw new Error('save_not_confirmed');
      success();
    } catch (error) {
      var messages = {
        gmail_required: 'Inicia sesión con una cuenta Google para continuar.',
        invalid_code: 'El backend no pudo validar ese código en el ciclo elegido.',
        code_already_claimed: 'Ese código ya está vinculado a otra cuenta Google.',
        invalid_career_selection: 'Revisa la facultad y las carreras seleccionadas.',
        save_not_confirmed: 'El servidor no confirmó el guardado. La encuesta no se marcó como completada.'
      };
      accountGate(messages[error.message] || 'No se pudo guardar de forma segura. La encuesta no se marcó; inténtalo nuevamente.');
    }
  }

  function success() {
    window.dispatchEvent(new CustomEvent('universe-ranking-survey-saved'));
    setView('¡Listo!', 'INFORMACIÓN GUARDADA',
      '<p class="ranking-survey-lead">Tu elección quedó vinculada a tu cuenta Google. Solo se mostrará en el conteo agregado, sin tu código ni tu correo.</p>' +
      '<div class="ranking-survey-actions">' + button('Finalizar', 'finish-saved', true) + '</div>');
  }

  function create() {
    overlay = document.createElement('div');
    overlay.className = 'ranking-survey-overlay';
    overlay.innerHTML = '<section class="ranking-survey-dialog" role="dialog" aria-modal="true" aria-labelledby="ranking-survey-title" tabindex="-1">' +
      '<div class="ranking-survey-orb" aria-hidden="true"><span>U</span></div><div class="ranking-survey-eyebrow">UNIVERSEAI</div>' +
      '<h2 id="ranking-survey-title"></h2><div class="ranking-survey-content"></div></section>';
    document.body.appendChild(overlay);
    panel = overlay.querySelector('.ranking-survey-dialog');
    title = overlay.querySelector('#ranking-survey-title');
    content = overlay.querySelector('.ranking-survey-content');
    document.documentElement.classList.add('ranking-survey-open');
    requestAnimationFrame(function () { overlay.classList.add('is-visible'); intro(); });

    overlay.addEventListener('click', function (event) {
      var action = event.target.closest('[data-survey-action]');
      if (!action) return;
      var name = action.getAttribute('data-survey-action');
      if (name === 'start') chooseRoute();
      else if (name === 'decline') decline();
      else if (name === 'close-declined') close(false);
      else if (name === 'intro') intro();
      else if (name === 'route') chooseRoute();
      else if (name === 'route-none') notParticipating();
      else if (name === 'finish-none') close(true);
      else if (name === 'route-cepre') { state.route = 'cepreuni'; chooseCepreTrack(); }
      else if (name === 'route-admission') { state.route = 'admission'; askAdmissionCareers(''); }
      else if (name === 'cepre-track') chooseCepreTrack();
      else if (name === 'track-pre' || name === 'track-basic') { var nextTrack = name === 'track-basic' ? 'basic' : 'pre'; if (state.cepreTrack !== nextTrack) state.code = ''; state.cepreTrack = nextTrack; askCode(''); }
      else if (name === 'verify-code') verifyCode();
      else if (name === 'edit-code') askCode('');
      else if (name === 'confirm-view') confirmCode();
      else if (name === 'confirm-code') askCepreCareer('');
      else if (name === 'cepre-career') askCepreCareer('');
      else if (name === 'save-cepre-career') {
        var career = panel.querySelector('#ranking-survey-career').value;
        if (!career) askCepreCareer('Selecciona la carrera a la que postulas.');
        else { state.careers = [career]; accountGate(''); }
      }
      else if (name === 'admission-careers') askAdmissionCareers('');
      else if (name === 'save-admission-careers' && readAdmissionCareers()) accountGate('');
      else if (name === 'submit') submit();
      else if (name === 'finish-saved') close(true);
    });

    overlay.addEventListener('submit', function (event) {
      event.preventDefault();
      if (event.target.matches('[data-survey-form="code"]')) verifyCode();
    });
  }

  window.addEventListener('universe-google-auth', function () {
    if (overlay && document.body.contains(overlay) && (state.careers.length || state.route === 'admission')) accountGate('');
  });

  window.UniverseRankingSurvey = {
    open: function (existing) {
      if (overlay) return;
      state = existing && existing.completed ? {
        route: existing.route || '', cepreTrack: existing.cepreTrack || '', code: existing.code || '',
        faculty: existing.faculty || '', careers: Array.isArray(existing.careers) ? existing.careers.slice(0, 3) : []
      } : { route: '', cepreTrack: '', code: '', faculty: '', careers: [] };
      create();
      if (existing && existing.completed) requestAnimationFrame(function () {
        if (overlay) chooseRoute();
      });
    }
  };
})();
