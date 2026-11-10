/* UNIverse · registro: botón oficial de Google y salto al perfil en cuanto la sesión queda verificada. */
(function () {
  'use strict';
  var host = document.getElementById('gsi');
  var go = function (u) { if (u && u.provider === 'google') location.replace('/account/cloud'); };
  addEventListener('universe-google-auth', function (e) { go(e.detail); });
  function render() {
    if (!window.UniverseGoogleAuth) { setTimeout(render, 120); return; }
    host.dataset.gsiWidth = String(Math.round(Math.min(400, Math.max(240, host.clientWidth))));
    window.UniverseGoogleAuth.open(host);
  }
  render();
  requestAnimationFrame(function () { requestAnimationFrame(function () { document.body.classList.add('ready'); }); });
})();
