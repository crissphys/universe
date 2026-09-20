(function () {
  var api = window.UniverseGoogleAuth;
  var survey = window.UniverseRankingSurvey;
  var rows = [];
  var tab = 'cepre';
  var existing = null;
  var autoOpened = false;
  var checkedAccount = '';
  var search = document.getElementById('career-search');
  var action = document.getElementById('survey-action');
  var signin = document.getElementById('survey-signin');
  var heading = document.getElementById('survey-heading');
  var message = document.getElementById('survey-message');
  var head = document.getElementById('career-head');
  var body = document.getElementById('career-body');
  var text = function (id, value) { document.getElementById(id).textContent = value; };
  function user() { var value = api.user(); return value && value.secureSession && value.provider === 'google' ? value : null; }
  function render() {
    var term = search.value.trim().toLocaleLowerCase('es');
    var list = rows.filter(function (row) { return row.career.toLocaleLowerCase('es').includes(term) || row.faculty.toLocaleLowerCase('es').includes(term); });
    list.sort(function (a, b) {
      var aCount = tab === 'cepre' ? a.ceprePre : a.admissionFirst;
      var bCount = tab === 'cepre' ? b.ceprePre : b.admissionFirst;
      return bCount - aCount || a.career.localeCompare(b.career, 'es');
    });
    text('table-heading', tab === 'cepre' ? 'CEPREUNI · Pre 2027-1' : 'Admisión UNI + Básico 2027-1');
    text('table-description', tab === 'cepre' ? 'Solo el Ciclo Pre, que puede acceder por ingreso directo.' : 'Básico se suma a Admisión. Una respuesta por persona; la carrera de Básico cuenta como primera opción.');
    head.innerHTML = tab === 'cepre' ? '<tr><th>Pos.</th><th>Carrera</th><th>Facultad</th><th>Postulantes</th></tr>' : '<tr><th>Pos.</th><th>Carrera</th><th>Facultad</th><th>1.ª opción</th><th>De Básico</th><th>Cualquier opción</th></tr>';
    body.replaceChildren();
    if (!list.length) { var empty = document.createElement('tr'); var cell = document.createElement('td'); cell.colSpan = tab === 'cepre' ? 4 : 6; cell.textContent = rows.length ? 'No hay carreras con ese nombre.' : 'No hay datos disponibles.'; empty.appendChild(cell); body.appendChild(empty); return; }
    list.forEach(function (row, index) {
      var values = tab === 'cepre' ? [index + 1, row.career, row.faculty, row.ceprePre] : [index + 1, row.career, row.faculty, row.admissionFirst, row.admissionBasic, row.admissionAny];
      var tr = document.createElement('tr');
      values.forEach(function (value) { var td = document.createElement('td'); td.textContent = value; tr.appendChild(td); });
      body.appendChild(tr);
    });
  }
  async function refreshCounts() {
    try {
      var response = await fetch('/api/site/ranking-survey-2027-1/summary', { cache: 'no-store' });
      if (!response.ok) throw new Error('Cifras no disponibles');
      var result = await response.json();
      rows = Array.isArray(result.careers) ? result.careers : [];
      text('count-total', result.totals.all);
      text('count-cepre', result.totals.cepreuni);
      text('count-admission', result.totals.admission);
      text('count-admission-detail', 'Admisión ' + result.totals.admissionDirect + ' · Básico ' + result.totals.admissionBasic);
      text('last-updated', 'Actualizado: ' + new Date(result.updatedAt).toLocaleString('es-PE') + ' · Se revisan nuevas respuestas cada 30 segundos.');
      render();
    } catch (_) { text('last-updated', 'No se pudieron consultar las cifras en este momento. Se intentará nuevamente.'); }
  }
  async function refreshSurvey(force) {
    await api.refresh();
    var account = user();
    var key = account ? String(account.id || account.email) : 'anonymous';
    if (!force && checkedAccount === key) return;
    checkedAccount = key;
    existing = null;
    if (account) {
      try { var result = await api.siteApi('/ranking-survey-2027-1', 'GET'); existing = result.survey && result.survey.completed ? result.survey : null; }
      catch (_) { message.textContent = 'No se pudo verificar tu registro. Intenta recargar la página.'; return; }
    }
    if (existing) {
      try { localStorage.setItem('universe_ranking_survey_2027_1_complete', 'yes'); } catch (_) {}
      heading.textContent = 'Tu elección está registrada';
      message.textContent = 'Puedes cambiar tus datos cuando lo necesites. Se actualizará el conteo de carreras.';
      action.textContent = 'Modificar mi elección';
      action.hidden = false;
      return;
    }
    var localDone = false;
    try { localDone = localStorage.getItem('universe_ranking_survey_2027_1_complete') === 'yes'; } catch (_) {}
    heading.textContent = localDone && !account ? 'Tu elección' : 'Participa en la encuesta';
    message.textContent = localDone && !account ? 'Inicia sesión con tu cuenta Google para consultar o modificar tu elección.' : 'Registra tu elección con una cuenta Google y contribuye a estas cifras.';
    action.textContent = localDone && !account ? 'Modificar mi elección' : 'Registrar mi elección';
    action.hidden = false;
    signin.hidden = true;
    if ((!localDone || account) && !autoOpened) { autoOpened = true; survey.open(null); }
  }
  action.addEventListener('click', async function () {
    await refreshSurvey(true);
    if (!user() && action.textContent === 'Modificar mi elección') { signin.hidden = false; api.open(signin); return; }
    survey.open(existing);
  });
  document.querySelectorAll('[data-tab]').forEach(function (button) { button.addEventListener('click', function () { tab = button.dataset.tab; document.querySelectorAll('[data-tab]').forEach(function (item) { item.setAttribute('aria-pressed', String(item === button)); }); render(); }); });
  search.addEventListener('input', render);
  window.addEventListener('universe-ranking-survey-saved', function () { refreshCounts(); refreshSurvey(true); });
  window.addEventListener('universe-google-auth', function () { if (api.user()) refreshSurvey(false); });
  refreshCounts(); refreshSurvey(false);
  setInterval(refreshCounts, 30000);
})();
