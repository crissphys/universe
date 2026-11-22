/* UNIverse · nieve de entrada (solo la primera visita; para revisarla: playSnow() o playSnow(0.25) en cámara lenta).
   Viento desde la izquierda, tres planos de copos, escarcha desde los bordes y nieve que sube desde abajo hasta
   cubrir la pantalla; 9 s en blanco y una ráfaga se lleva la nieve mostrando la versión clara.
   Rendimiento: texturas dibujadas una sola vez, lienzos a 1x (o menos en equipos modestos), escarcha a media
   resolución y cada 3 cuadros, sin sombras en tiempo real, menos copos si el cuadro tarda, y el agujero negro
   deja de dibujar mientras la pantalla está tapada. */
(function () {
  'use strict';
  var root = document.documentElement, running = false;
  var TOTAL = 6400; // ms hasta el blanco total (se anima siempre, igual que el agujero negro)
  var HOLD = 9000;  // ms de pantalla blanca antes de mostrar la versión nueva

  /* ---------- texturas, una sola vez ---------- */
  function cnv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function radial(size, stops) {
    var c = cnv(size, size), g = c.getContext('2d'), r = size / 2, gr = g.createRadialGradient(r, r, 0, r, r, r);
    stops.forEach(function (s) { gr.addColorStop(s[0], s[1]); });
    g.fillStyle = gr; g.fillRect(0, 0, size, size); return c;
  }
  // cristal de seis brazos con ramas
  function crystal(size, seed) {
    var c = cnv(size, size), g = c.getContext('2d'), R = size * .42, rnd = mulberry(seed);
    g.translate(size / 2, size / 2); g.strokeStyle = '#fff'; g.lineCap = 'round';
    g.globalAlpha = .8; g.shadowColor = 'rgba(255,255,255,.8)'; g.shadowBlur = size * .08;
    var br = [.35 + rnd() * .15, .6 + rnd() * .12, .82], bl = [.32 + rnd() * .1, .24 + rnd() * .08, .14];
    for (var k = 0; k < 6; k++) {
      g.save(); g.rotate(k * Math.PI / 3);
      g.lineWidth = Math.max(1, size * .028); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -R); g.stroke();
      g.lineWidth = Math.max(.8, size * .018);
      for (var j = 0; j < 3; j++) {
        var y = -R * br[j], l = R * bl[j];
        g.beginPath(); g.moveTo(0, y); g.lineTo(-l * .8, y - l * .7); g.moveTo(0, y); g.lineTo(l * .8, y - l * .7); g.stroke();
      }
      g.restore();
    }
    var cg = g.createRadialGradient(0, 0, 0, 0, 0, R * .32); cg.addColorStop(0, 'rgba(255,255,255,.95)'); cg.addColorStop(1, 'rgba(255,255,255,0)');
    g.shadowBlur = 0; g.fillStyle = cg; g.beginPath(); g.arc(0, 0, R * .32, 0, 6.283); g.fill();
    return c;
  }
  // grumo irregular con sombra azulada abajo: se ve con volumen
  function clump(size, seed) {
    var c = cnv(size, size), g = c.getContext('2d'), rnd = mulberry(seed), r = size / 2;
    for (var i = 0; i < 9; i++) {
      var a = rnd() * 6.28, d = rnd() * r * .32, x = r + Math.cos(a) * d, y = r + Math.sin(a) * d, rr = r * (.22 + rnd() * .2);
      var gr = g.createRadialGradient(x - rr * .3, y - rr * .35, rr * .1, x, y, rr);
      gr.addColorStop(0, '#fff'); gr.addColorStop(.6, 'rgba(236,242,250,.92)'); gr.addColorStop(.85, 'rgba(196,208,224,.55)'); gr.addColorStop(1, 'rgba(196,208,224,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, 6.283); g.fill();
    }
    return c;
  }
  var TEX = null;
  function textures() {
    if (TEX) return TEX;
    TEX = {
      crystals: [], clumps: [],
      bokeh: radial(96, [[0, 'rgba(255,255,255,.55)'], [.72, 'rgba(255,255,255,.42)'], [.86, 'rgba(255,255,255,.5)'], [1, 'rgba(255,255,255,0)']]),
      speck: radial(24, [[0, '#fff'], [.35, 'rgba(255,255,255,.85)'], [1, 'rgba(255,255,255,0)']]),
      // copo con halo gris: se distingue sobre la página clara sin sombras en tiempo real
      shade: radial(24, [[0, '#fff'], [.4, 'rgba(250,251,253,.95)'], [.62, 'rgba(150,162,182,.35)'], [1, 'rgba(150,162,182,0)']])
    };
    for (var i = 0; i < 6; i++) { TEX.crystals.push(crystal(72, 11 + i * 7)); TEX.clumps.push(clump(48, 5 + i * 13)); }
    return TEX;
  }
  // escarcha del vidrio a media resolución: cristalitos y granos, más densa cerca de los bordes
  function frostTexture(w, h) {
    var c = cnv(w, h), g = c.getContext('2d'), rnd = mulberry(7), n = Math.min(3500, Math.round(w * h / 90)), cr = textures().crystals;
    g.fillStyle = '#fff';
    for (var i = 0; i < n; i++) {
      var x = rnd() * w, y = rnd() * h, e = Math.min(x, w - x, y, h - y) / Math.min(w, h); // 0 en el borde
      if (rnd() < e * 2.2) continue;
      var s = 1 + rnd() * rnd() * 8;
      g.globalAlpha = .35 + rnd() * .5;
      if (s > 4.5) { var a = rnd() * 6.28; g.setTransform(Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), x, y); g.drawImage(cr[i % 6], -s / 2, -s / 2, s, s); g.setTransform(1, 0, 0, 1, 0, 0); }
      else g.fillRect(x - s * .11, y - s * .11, s * .22 + .6, s * .22 + .6);
    }
    return c;
  }

  function run(speed) {
    if (running) return; running = true;
    var SPEED = speed > 0 && speed <= 1 ? speed : 1;
    if (window.setTheme) setTheme('dark'); else root.dataset.theme = 'dark';
    var T = textures();
    var wrap = document.createElement('div'), air = cnv(1, 1), glass = cnv(1, 1);
    var ax = air.getContext('2d'), gx = glass.getContext('2d');
    wrap.className = 'snow'; wrap.setAttribute('aria-hidden', 'true'); wrap.appendChild(air); wrap.appendChild(glass);
    document.body.appendChild(wrap);

    // equipo modesto: menos copos y lienzo más pequeño (la nieve es suave, no se nota)
    var low = (navigator.hardwareConcurrency || 4) <= 4 || (navigator.deviceMemory || 4) <= 3 || innerWidth < 760;
    var S = Math.min(devicePixelRatio || 1, 1) * (low ? .75 : 1);
    var W, H, FW, FH, flakes = [], t0 = performance.now(), whiteAt = 0, frost, fm, fmx, ridge = [], maxFlakes, tick = 0;
    function size() {
      W = innerWidth; H = innerHeight; FW = Math.ceil(W / 2); FH = Math.ceil(H / 2);
      air.width = glass.width = Math.round(W * S); air.height = glass.height = Math.round(H * S);
      ax.setTransform(S, 0, 0, S, 0, 0); gx.setTransform(S, 0, 0, S, 0, 0);
      frost = frostTexture(FW, FH); fm = cnv(FW, FH); fmx = fm.getContext('2d');
      var rnd = mulberry(3); ridge = []; for (var i = 0; i < 9; i++) ridge.push([rnd() * 6.28, .003 + rnd() * .03, 1.5 + rnd() * (i < 3 ? 14 : 4)]);
      maxFlakes = Math.round(Math.min(low ? 260 : 460, W * H / (low ? 2600 : 2200)));
    }
    size(); addEventListener('resize', size);
    function poke() { if (!whiteAt) t0 = Math.min(t0, performance.now() - TOTAL * .8 / SPEED); } // un toque adelanta la nieve
    addEventListener('pointerdown', poke, { once: true, passive: true });
    addEventListener('keydown', poke, { once: true });

    function spawn(first) {
      var z = Math.random(), kind = z < .55 ? 0 : z < .94 ? 1 : 2; // 0 lejano, 1 grumo o cristal, 2 desenfocado cerca
      var s = kind === 0 ? 2 + z * 6 : kind === 1 ? 6 + (z - .55) * 34 : 30 + Math.random() * 60;
      var f = {
        x: first ? Math.random() * W * .6 : -s - Math.random() * 80, y: Math.random() * H * 1.15 - H * .2,
        k: kind, s: s, z: z, tex: kind === 1 ? (Math.random() < .3 ? T.crystals : T.clumps)[Math.random() * 6 | 0] : kind === 2 ? T.bokeh : T.speck,
        drag: .35 + z * .85 + Math.random() * .25, fall: 6 + z * 30 + Math.random() * 14,
        f1: .6 + Math.random() * 1.8, f2: 2 + Math.random() * 3, a1: 8 + Math.random() * 30, a2: 2 + Math.random() * 8, ph: Math.random() * 6.28,
        rot: Math.random() * 6.28, spin: (Math.random() - .5) * 3, tum: Math.random() * 6.28, tumS: .8 + Math.random() * 2.4,
        al: kind === 2 ? .08 + Math.random() * .14 : kind === 0 ? .45 + z * .6 : .75 + Math.random() * .25
      };
      // inserción ordenada por profundidad: así no hace falta ordenar cada cuadro
      var lo = 0, hi = flakes.length; while (lo < hi) { var m = lo + hi >> 1; if (flakes[m].z < z) lo = m + 1; else hi = m; }
      flakes.splice(lo, 0, f);
    }
    // viento desde la izquierda: brisa constante más ráfagas (siempre hacia la derecha)
    function wind(t) { return 210 + 110 * Math.sin(t * .0005) + 70 * Math.sin(t * .0013 + 1.7) + 40 * Math.sin(t * .0033 + 4.1); }
    var halo = T.speck;
    // copo que se pega al vidrio: queda en un lienzo que no se borra
    function stick(f, p) {
      var s = f.k === 2 ? f.s * .5 : Math.max(8, f.s) * (1 + p * 1.5);
      gx.globalAlpha = .4 + p * .3; gx.drawImage(halo, f.x - s, f.y - s, s * 2, s * 2);
      gx.globalAlpha = .55 + p * .4;
      var c = Math.cos(f.rot) * S, n = Math.sin(f.rot) * S;
      gx.setTransform(c, n, -n, c, f.x * S, f.y * S); gx.drawImage(T.crystals[(f.ph * 10 | 0) % 6], -s / 2, -s / 2, s, s);
      gx.setTransform(S, 0, 0, S, 0, 0);
    }
    // si el equipo no llega a ~40 cps, menos copos
    var slow = 0, fast = 0, last = t0;
    function frame(now) {
      var raw = Math.max(0, Math.min(50, now - last)), dt = raw / 1000 * SPEED; last = now;
      if (raw > 25) { if (++slow > 20) { maxFlakes = Math.max(80, maxFlakes * .7 | 0); slow = 0; } } else slow = 0;
      var p = Math.max(0, Math.min(1, (now - t0) * SPEED / TOTAL)), w = wind(t0 + (now - t0) * SPEED), t = (now - t0) * SPEED / 1000;
      var want = maxFlakes * Math.min(1, .18 + p * 1.25); // empieza con pocos copos y cada vez son más
      while (flakes.length < want) spawn(now - t0 < 60);
      ax.clearRect(0, 0, W, H);

      // escarcha desde los bordes: media resolución y cada 3 cuadros
      var reach = Math.pow(p, 1.4);
      if (tick++ % 3 === 0) {
        fmx.globalCompositeOperation = 'copy'; fmx.drawImage(frost, 0, 0);
        fmx.globalCompositeOperation = 'destination-out';
        var R = Math.hypot(FW, FH) * .62, gr = fmx.createRadialGradient(FW / 2, FH / 2, R * Math.max(0, .95 - reach * 1.05), FW / 2, FH / 2, R * Math.max(.05, 1.25 - reach * 1.1));
        gr.addColorStop(0, '#000'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        fmx.fillStyle = gr; fmx.fillRect(0, 0, FW, FH);
      }

      // nieve que sube desde abajo: cresta irregular con sombra azulada para dar volumen
      var top = H * (1.03 - Math.pow(Math.max(0, (p - .2) / .8), 1.8) * 1.12), sx = w * t * .02;
      if (top < H + 30) {
        ax.beginPath(); ax.moveTo(0, H);
        for (var x = 0; x <= W + 12; x += 12) {
          var y = top; for (var r = 0; r < ridge.length; r++) y += Math.sin(x * ridge[r][1] + ridge[r][0] + sx * (r % 2 ? 1 : -.5)) * ridge[r][2];
          ax.lineTo(x, y);
        }
        ax.lineTo(W, H); ax.closePath();
        var dg = ax.createLinearGradient(0, top - 60, 0, top + 160);
        dg.addColorStop(0, '#fff'); dg.addColorStop(.25, '#eef2f7'); dg.addColorStop(.5, '#dde4ee'); dg.addColorStop(1, '#f7f9fc');
        ax.fillStyle = dg; ax.fill();
      }

      // copos, ya ordenados del más lejano al más cercano
      var stickRate = .01 + p * p * p * 1.3;
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        f.ph += dt; f.rot += f.spin * dt; f.tum += f.tumS * dt;
        var gust = Math.sin(t * f.f1 + f.ph) * f.a1 + Math.sin(t * f.f2 + f.ph * 3) * f.a2;
        f.x += (w * f.drag + gust * .6) * dt;
        f.y += (f.fall + gust * .9) * dt;
        if (f.k !== 0 && Math.random() < stickRate * dt) { stick(f, p); f.x = W + 999; }
        if (f.x > W + f.s || f.y > H + f.s) { flakes.splice(i--, 1); continue; }
        ax.globalAlpha = f.al;
        if (f.k !== 1) ax.drawImage(f.tex, f.x - f.s / 2, f.y - f.s / 2, f.s, f.s);
        else { // cristal que gira y se voltea: el coseno lo aplasta como un disco visto de canto
          var sc = (.25 + .75 * Math.abs(Math.cos(f.tum))) * S, c = Math.cos(f.rot), n = Math.sin(f.rot);
          ax.setTransform(c * sc, n * sc, -n * S, c * S, f.x * S, f.y * S);
          ax.drawImage(f.tex, -f.s / 2, -f.s / 2, f.s, f.s);
          ax.setTransform(S, 0, 0, S, 0, 0);
        }
      }
      ax.globalAlpha = Math.min(1, .25 + reach); ax.drawImage(fm, 0, 0, W, H); ax.globalAlpha = 1;

      // al final el blanco termina de cerrar los huecos
      wrap.style.setProperty('--white', Math.pow(Math.max(0, (p - .74) / .26), 2).toFixed(3));
      if (p >= 1 && !whiteAt) {
        whiteAt = now; flakes.length = 0;
        root.dataset.cover = '1'; // el agujero negro no dibuja mientras está tapado
        message();
        setTimeout(blow, HOLD);
        return; // con la pantalla blanca no hace falta seguir dibujando
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    /* sobre el blanco: la frase pequeña sube primero y luego las letras de UNIverse aparecen una tras otra, desenfocadas */
    var msg = null;
    function message() {
      var L = (root.lang || 'es').slice(0, 2), pre = { en: 'Christmas has arrived at', de: 'Weihnachten ist da bei', pt: 'O Natal chegou à' }[L] || 'La Navidad llegó a';
      msg = document.createElement('div'); msg.className = 'snow-msg';
      var letters = 'UNIverse'.split('').map(function (ch, i) { return '<span style="transition-delay:' + (700 + i * 70) + 'ms">' + ch + '</span>'; }).join('');
      msg.innerHTML = '<small>' + pre + '</small><b><svg viewBox="0 0 89.5 99" aria-hidden="true" style="transition-delay:550ms"><path d="M0 0H24.5V60A20.25 18 0 0 0 65 60V28L63.5 26L35 37.5L64 .5H89.5V61A44.75 38 0 0 1 0 61Z"/></svg>' + letters + '</b>';
      wrap.appendChild(msg);
      requestAnimationFrame(function () { requestAnimationFrame(function () { msg.classList.add('on'); }); });
    }

    /* ráfaga final: el blanco se rompe desde la izquierda con un borde irregular y sale volando en copos */
    function blow() {
      if (window.setTheme) setTheme('light', true); else root.dataset.theme = 'light';
      delete root.dataset.cover;
      if (msg) msg.classList.add('out');
      gx.clearRect(0, 0, W, H); wrap.style.setProperty('--white', '0');
      var b0 = performance.now(), DUR = 1700 / SPEED, bits = [], prev = b0, edge = [], rate = low ? 450 : 900;
      for (var k = 0; k < 6; k++) edge.push([Math.random() * 6.28, .004 + Math.random() * .03, 10 + Math.random() * (k < 2 ? 70 : 20)]);
      function front(y, base) { var v = base; for (var k = 0; k < edge.length; k++) v += Math.sin(y * edge[k][1] + edge[k][0]) * edge[k][2]; return v; }
      function sheet(base, off) {
        ax.beginPath(); ax.moveTo(W + 60, -20);
        for (var y = -20; y <= H + 20; y += 12) ax.lineTo(front(y, base) - off, y);
        ax.lineTo(W + 60, H + 20); ax.closePath(); ax.fill();
      }
      function step(now) {
        var dt = Math.max(0, Math.min(50, now - prev)) / 1000 * SPEED; prev = now;
        var q = Math.max(0, Math.min(1, (now - b0) / DUR)), base = -160 + (W + 420) * q * q * (1.4 - .4 * q); // arranca lento y acelera
        ax.clearRect(0, 0, W, H);
        // el frente suelta nieve: unos copos quedan atrás sobre la página y se apagan, otros vuelan con la ráfaga
        if (q < 1) for (var n = Math.round(rate * dt); n > 0; n--) {
          var yy = Math.random() * H, z = Math.random();
          bits.push({ x: front(yy, base) - Math.random() * 40, y: yy, vx: 120 + z * 900, vy: (Math.random() - .5) * 120, s: 3 + z * z * 10, z: z, life: .6 + Math.random() * .8 });
        }
        for (var i = 0; i < bits.length; i++) {
          var b = bits[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.vy += 30 * dt; b.life -= dt;
          if (b.x > W + 60 || b.life <= 0) { bits.splice(i--, 1); continue; }
          ax.globalAlpha = Math.min(1, b.life * 1.5) * (.6 + b.z * .4);
          var len = b.s * (1 + b.vx / 500); // copo estirado por la velocidad
          ax.drawImage(T.shade, b.x - len / 2, b.y - b.s / 2, len, b.s);
        }
        // lo que queda de la capa blanca: primero una franja gris tenue (sombra del borde), luego el blanco encima
        ax.globalAlpha = .1; ax.fillStyle = '#5a6478'; sheet(base, 14);
        ax.globalAlpha = .12; sheet(base, 6);
        ax.globalAlpha = 1; ax.fillStyle = '#fff'; sheet(base, 0);
        if (q < 1 || bits.length) requestAnimationFrame(step);
        else { wrap.remove(); removeEventListener('resize', size); running = false; }
      }
      requestAnimationFrame(step);
    }
  }

  window.playSnow = run;
  if (root.dataset.snow === '1') {
    try { localStorage.setItem('universe_snow', '1'); } catch (e) {}
    root.removeAttribute('data-snow');
    run();
  }
})();
