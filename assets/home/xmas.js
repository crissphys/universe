/* UNIverse · Navidad en el inicio: gorro 3D en la esquina del buscador (se balancea al inclinar el teléfono, al desplazarse o
   al mover el puntero), guirnalda de luces y dos esferas colgantes. Solo transform y opacity; el bucle duerme
   cuando el gorro está quieto. */
(function () {
  'use strict';
  var search = document.getElementById('search'), hero = document.querySelector('.hero');
  if (!search || !hero) return;

  /* ---------- gorro ---------- */
  var hat = document.createElement('span');
  hat.className = 'hat'; hat.setAttribute('aria-hidden', 'true');
  hat.innerHTML = '<span class="hat-body"><svg viewBox="0 0 64 56">' +
    '<defs><linearGradient id="hatR" x1="0" y1="0" x2="1" y2=".4"><stop offset="0" stop-color="#ff5a52"/><stop offset=".55" stop-color="#d81f2a"/><stop offset="1" stop-color="#8e0f19"/></linearGradient>' +
    '<radialGradient id="hatF" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#eef1f6"/><stop offset="1" stop-color="#c9d1dc"/></radialGradient></defs>' +
    '<path d="M8 44 C10 26 22 10 40 6 C48 4 55 8 57 14 C52 12 46 13 43 18 C40 24 44 34 46 44 Z" fill="url(#hatR)"/>' +
    '<path d="M20 22 C26 14 34 9 42 8" stroke="rgba(255,255,255,.28)" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
    '<rect x="4" y="40" width="48" height="12" rx="6" fill="url(#hatF)"/>' +
    '</svg></span><span class="hat-pom"></span>';
  search.appendChild(hat);
  var body = hat.firstChild, pom = hat.lastChild;

  // resorte amortiguado: ángulo del gorro y de la borla (la borla va con retraso)
  var a = 0, va = 0, b = 0, vb = 0, target = 0, raf = 0, last = 0, lastY = scrollY;
  function kick(v) { va += v; wake(); }
  function wake() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); } }
  function step(now) {
    var dt = Math.min(.05, (now - last) / 1000); last = now;
    va += (-(a - target) * 90 - va * 7) * dt; a += va * dt;
    vb += (-(b - a) * 60 - vb * 5) * dt; b += vb * dt;
    body.style.transform = 'rotateZ(' + a.toFixed(2) + 'deg) rotateY(' + (a * 1.6).toFixed(2) + 'deg)';
    pom.style.transform = 'rotate(' + (b * 1.8).toFixed(2) + 'deg)';
    if (Math.abs(va) + Math.abs(vb) + Math.abs(a - target) + Math.abs(b - a) > .05) raf = requestAnimationFrame(step); else raf = 0;
  }
  // inclinar el teléfono (Android lo da sin permiso; en iPhone se pide al primer toque)
  function tilt(e) { if (e.gamma == null) return; target = Math.max(-18, Math.min(18, e.gamma * .6)); wake(); }
  addEventListener('deviceorientation', tilt, { passive: true });
  if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
    addEventListener('touchend', function ask() { DeviceOrientationEvent.requestPermission().catch(function () {}); removeEventListener('touchend', ask); }, { passive: true });
  }
  // desplazarse lo sacude según la velocidad
  addEventListener('scroll', function () { var d = scrollY - lastY; lastY = scrollY; if (Math.abs(d) > 1) kick(Math.max(-60, Math.min(60, d * .8))); }, { passive: true });
  // en computadora sigue un poco al puntero
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var px = 0;
    addEventListener('pointermove', function (e) { var dx = e.clientX - px; px = e.clientX; target = (e.clientX / innerWidth - .5) * 14; if (Math.abs(dx) > 2) kick(dx * .15); }, { passive: true });
  }
  setTimeout(function () { kick(60); }, 900); // se acomoda al cargar

  /* ---------- guirnalda de luces y esferas ---------- */
  var deco = document.createElement('div'); deco.className = 'xmas'; deco.setAttribute('aria-hidden', 'true');
  hero.appendChild(deco);
  var COLORS = ['#ff4d4d', '#ffcf4a', '#3ddc84', '#5fa8ff', '#ff8ad8'];
  function build() {
    var W = hero.clientWidth, span = W < 760 ? 120 : 170, n = Math.ceil(W / span), sag = W < 760 ? 16 : 22, d = '', html = '';
    for (var i = 0; i < n; i++) { var x0 = i * W / n, x1 = (i + 1) * W / n; d += (i ? '' : 'M' + x0 + ' 0') + ' Q' + (x0 + x1) / 2 + ' ' + sag * 2 + ' ' + x1 + ' 0'; }
    html += '<svg class="xmas-wire" viewBox="0 0 ' + W + ' ' + (sag + 4) + '" preserveAspectRatio="none"><path d="' + d + '"/></svg>';
    var k = 0;
    for (i = 0; i < n; i++) for (var j = 1; j <= 4; j++) {
      var t = j / 5, x = (i + t) * W / n, y = sag * 2 * t * (1 - t) * 2 * .5 * 2; // altura de la curva en t
      html += '<i class="bulb" style="left:' + x.toFixed(1) + 'px;top:' + (y + 2).toFixed(1) + 'px;--c:' + COLORS[k % 5] + ';--d:' + (k * 0.37 % 2.4).toFixed(2) + 's"></i>'; k++;
    }
    html += '<span class="orn orn-l"><i></i></span><span class="orn orn-r"><i></i></span>';
    deco.innerHTML = html;
  }
  build();
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 200); });
})();
