(function () {
  if (window.__universeRankingSurveyLoader) return;
  window.__universeRankingSurveyLoader = true;
  try { if (localStorage.getItem('universe_ranking_survey_2027_1_complete') === 'yes') return; } catch (_) {}

  var VERSION = '20260914-global1';
  var scripts = {
    auth: '/universe-ui/auth.js?v=' + VERSION,
    data: '/universe-ui/data/cepre-2027-1-ranking.js?v=' + VERSION,
    survey: '/universe-ui/native/ranking-survey.js?v=' + VERSION
  };

  function samePath(element, src) {
    try { return new URL(element.src, location.href).pathname === new URL(src, location.href).pathname; }
    catch (_) { return false; }
  }

  function loadScript(src, ready) {
    if (ready()) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var existing = Array.prototype.find.call(document.scripts, function (script) { return samePath(script, src); });
      var script = existing || document.createElement('script');
      var settled = false;
      function finish(error) {
        if (settled) return;
        settled = true;
        clearInterval(check);
        clearTimeout(timeout);
        if (error || !ready()) reject(error || new Error('No se pudo iniciar la encuesta.'));
        else resolve();
      }
      script.addEventListener('load', function () { finish(); }, { once: true });
      script.addEventListener('error', function () { finish(new Error('No se pudo cargar ' + src)); }, { once: true });
      var check = setInterval(function () { if (ready()) finish(); }, 50);
      var timeout = setTimeout(function () { finish(new Error('Tiempo de carga agotado.')); }, 10000);
      if (!existing) {
        script.src = src;
        script.defer = true;
        document.head.appendChild(script);
      }
    });
  }

  if (!document.querySelector('link[href*="/native/ranking.css"],link[data-universe-ranking-survey]')) {
    var stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/universe-ui/ranking-survey.css?v=' + VERSION;
    stylesheet.dataset.universeRankingSurvey = '';
    document.head.appendChild(stylesheet);
  }

  Promise.all([
    loadScript(scripts.auth, function () { return !!window.UniverseGoogleAuth; }),
    loadScript(scripts.data, function () { return !!window.UNIVERSE_CEPRE_2027_1; })
  ]).then(function () {
    return loadScript(scripts.survey, function () {
      if (document.querySelector('.ranking-survey-overlay')) return true;
      try { return localStorage.getItem('universe_ranking_survey_2027_1_complete') === 'yes'; }
      catch (_) { return false; }
    });
  }).catch(function (error) {
    console.warn('UNIverseAI survey:', error.message);
  });
})();
