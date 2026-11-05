/* Tabla periódica · modelos atómicos: Bohr (2D) y orbitales de Schrödinger (3D, funciones hidrogenoides reales) */
(function () {
  var TP = window.TP, NS = 'http://www.w3.org/2000/svg';
  var A0 = 52.9177; // pm
  var POS = '#ff6b4a', NEG = '#79a6e4';

  /* ---------- radial ---------- */
  function laguerre(k, a, x) {
    if (k === 0) return 1; var l0 = 1, l1 = 1 + a - x, i, l2;
    for (i = 1; i < k; i++) { l2 = ((2 * i + 1 + a - x) * l1 - (i + a) * l0) / (i + 1); l0 = l1; l1 = l2; }
    return l1;
  }
  function R(n, l, Z, r) { var rho = 2 * Z * r / n; return Math.pow(rho, l) * Math.exp(-rho / 2) * laguerre(n - l - 1, 2 * l + 1, rho); }
  TP.radial = R;

  /* ---------- armónicos esféricos reales (sin normalizar) ---------- */
  var ANG = {
    0: [{ n: 's', f: function () { return 1; } }],
    1: [{ n: 'pₓ', f: function (x, y, z) { return x; } }, { n: 'p_y', f: function (x, y, z) { return y; } }, { n: 'p_z', f: function (x, y, z) { return z; } }],
    2: [{ n: 'd_{z²}', f: function (x, y, z) { return 3 * z * z - 1; } }, { n: 'd_{xz}', f: function (x, y, z) { return x * z; } }, { n: 'd_{yz}', f: function (x, y, z) { return y * z; } }, { n: 'd_{x²−y²}', f: function (x, y, z) { return x * x - y * y; } }, { n: 'd_{xy}', f: function (x, y, z) { return x * y; } }],
    3: [{ n: 'f_{z³}', f: function (x, y, z) { return z * (5 * z * z - 3); } }, { n: 'f_{xz²}', f: function (x, y, z) { return x * (5 * z * z - 1); } }, { n: 'f_{yz²}', f: function (x, y, z) { return y * (5 * z * z - 1); } }, { n: 'f_{z(x²−y²)}', f: function (x, y, z) { return z * (x * x - y * y); } }, { n: 'f_{xyz}', f: function (x, y, z) { return x * y * z; } }, { n: 'f_{x(x²−3y²)}', f: function (x, y, z) { return x * (x * x - 3 * y * y); } }, { n: 'f_{y(3x²−y²)}', f: function (x, y, z) { return y * (3 * x * x - y * y); } }]
  };
  TP.ANG = ANG;
  var maxCache = {};
  function ymax(l, m) {
    var k = l + ':' + m; if (maxCache[k]) return maxCache[k];
    var f = ANG[l][m].f, mx = 0, i, x, y, z, r, v;
    for (i = 0; i < 6000; i++) { do { x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; z = Math.random() * 2 - 1; r = x * x + y * y + z * z; } while (r > 1 || r < 1e-4); r = Math.sqrt(r); v = Math.abs(f(x / r, y / r, z / r)); if (v > mx) mx = v; }
    return maxCache[k] = mx * 1.02;
  }

  /* muestreo de |ψ|² */
  TP.sample = function (n, l, m, Z, N) {
    var rmax = (2 * n * n + 12 * n) / Z, M = 1600, cdf = new Float64Array(M + 1), i, dr = rmax / M, r, p, tot = 0, peak = 0, peakR = 0, Rm2 = 0;
    for (i = 1; i <= M; i++) { r = i * dr; var rv = R(n, l, Z, r); if (rv * rv > Rm2) Rm2 = rv * rv; p = r * r * rv * rv; if (p > peak) { peak = p; peakR = r; } tot += p; cdf[i] = tot; }
    for (i = 1; i <= M; i++) cdf[i] /= tot;
    var pts = new Float32Array(N * 3), sg = new Int8Array(N), f = ANG[l][m].f, ym = ymax(l, m), k = 0, u, lo, hi, mid, x, y, z, q, rr, sgn;
    while (k < N) {
      u = Math.random(); lo = 0; hi = M;
      while (hi - lo > 1) { mid = (lo + hi) >> 1; if (cdf[mid] < u) lo = mid; else hi = mid; }
      rr = (lo + (u - cdf[lo]) / ((cdf[hi] - cdf[lo]) || 1)) * dr;
      do { x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; z = Math.random() * 2 - 1; q = x * x + y * y + z * z; } while (q > 1 || q < 1e-4);
      q = Math.sqrt(q); x /= q; y /= q; z /= q;
      var a = f(x, y, z) / ym; if (Math.random() > a * a) continue;
      var rv2 = R(n, l, Z, rr); if (rv2 * rv2 * a * a / Rm2 < .02) continue; // recorta las colas para que se vean los lóbulos
      sgn = (a >= 0 ? 1 : -1) * (rv2 >= 0 ? 1 : -1);
      pts[k * 3] = x * rr; pts[k * 3 + 1] = y * rr; pts[k * 3 + 2] = z * rr; sg[k] = sgn; k++;
    }
    return { pts: pts, sg: sg, rmax: rmax, rmean: (3 * n * n - l * (l + 1)) / (2 * Z), rpeak: peakR, n: n, l: l, m: m, Z: Z };
  };

  /* ---------- visor 3D ---------- */
  TP.orbViewer = function (host, o) {
    o = o || {};
    var cv = document.createElement('canvas'); cv.className = 'cv'; cv.style.aspectRatio = o.aspect || '1 / 1'; host.appendChild(cv);
    var ctx = cv.getContext('2d'), st = { yaw: .6, pitch: .35, auto: !TP.reduced(), cut: false, zoom: 1, s: null, vis: true, Nn: o.points || (window.innerWidth < 700 ? 4500 : 8000) }, dpr = 1, W = 0, H = 0, raf = 0, drag = null;
    function render() {
      var r = cv.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
      if (cv.width !== Math.round(r.width * dpr) || cv.height !== Math.round(r.height * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
      W = cv.width; H = cv.height; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
      var s = st.s; if (!s) return;
      var ext = Math.min(s.rmax * .62, Math.max(s.rmean * 2.1, s.rpeak * 2.6)), k = Math.min(W, H) / 2 / ext * .86 * st.zoom;
      var cy = Math.cos(st.yaw), sy = Math.sin(st.yaw), cp = Math.cos(st.pitch), sp = Math.sin(st.pitch);
      // ejes
      var ax = [['x', 1, 0, 0], ['y', 0, 1, 0], ['z', 0, 0, 1]], L = ext * .9;
      ctx.lineWidth = 1 * dpr; ctx.font = (11 * dpr) + 'px "Geist Mono", monospace'; ctx.textAlign = 'center';
      ax.forEach(function (a) {
        var x = a[1] * L, y = a[2] * L, z = a[3] * L, x1 = x * cy - y * sy, y1 = x * sy + y * cy, ys = y1 * cp - z * sp;
        ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.moveTo(W / 2, H / 2); ctx.lineTo(W / 2 + x1 * k, H / 2 + ys * k); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillText(a[0], W / 2 + x1 * k * 1.08, H / 2 + ys * k * 1.08 + 4 * dpr);
      });
      var p = s.pts, sg = s.sg, n = sg.length, i, x, y, z, x1, y1, ys, zz, sz = Math.max(1.3, 1.9 * dpr * Math.min(1.4, st.zoom));
      for (var pass = 0; pass < 2; pass++) {
        ctx.fillStyle = pass ? NEG : POS; ctx.globalAlpha = .55;
        for (i = 0; i < n; i++) {
          if ((sg[i] > 0) === !!pass) continue;
          x = p[i * 3]; y = p[i * 3 + 1]; z = p[i * 3 + 2];
          x1 = x * cy - y * sy; y1 = x * sy + y * cy; if (st.cut && x1 > 0) continue;
          ys = y1 * cp - z * sp; zz = y1 * sp + z * cp;
          ctx.fillRect(W / 2 + x1 * k - sz / 2, H / 2 + ys * k - sz / 2, sz, sz);
        }
      }
      ctx.globalAlpha = 1; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(W / 2, H / 2, 2.4 * dpr, 0, 6.283); ctx.fill();
    }
    function loop() { if (!st.auto || !st.vis || !cv.isConnected) { raf = 0; return; } st.yaw += .0085; render(); raf = requestAnimationFrame(loop); }
    function kick() { if (st.auto && st.vis && !raf) raf = requestAnimationFrame(loop); }
    cv.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function (e) { if (!drag) return; st.yaw += (e.clientX - drag.x) * .01; st.pitch = Math.max(-1.5, Math.min(1.5, st.pitch + (e.clientY - drag.y) * .01)); drag.x = e.clientX; drag.y = e.clientY; render(); });
    cv.addEventListener('pointerup', function () { drag = null; });
    cv.addEventListener('wheel', function (e) { e.preventDefault(); st.zoom = Math.max(.5, Math.min(3, st.zoom * (e.deltaY < 0 ? 1.1 : .91))); render(); }, { passive: false });
    cv.addEventListener('dblclick', function () { st.yaw = .6; st.pitch = .35; st.zoom = 1; render(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { st.vis = en[0].isIntersecting; if (st.vis) { render(); kick(); } }).observe(cv);
    if (window.ResizeObserver) new ResizeObserver(function () { if (cv.isConnected && cv.offsetParent) render(); }).observe(cv); else window.addEventListener('resize', function () { if (cv.isConnected) render(); });
    return {
      cv: cv, st: st,
      set: function (n, l, m, Z) { st.s = TP.sample(n, l, m, Z, st.Nn); render(); kick(); return st.s; },
      auto: function (v) { st.auto = v && !TP.reduced(); kick(); return st.auto; },
      cut: function (v) { st.cut = v; render(); },
      view: function (y, p) { st.yaw = y; st.pitch = p; render(); },
      render: render
    };
  };

  /* miniatura estática */
  TP.orbThumb = function (cv, n, l, m, Z) {
    var s = TP.sample(n, l, m, Z, 1400), ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
    var ext = Math.min(s.rmax * .62, Math.max(s.rmean * 2.1, s.rpeak * 2.6)), k = Math.min(W, H) / 2 / ext * .86, yaw = .7, pitch = .45, cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    for (var i = 0; i < s.sg.length; i++) {
      var x = s.pts[i * 3], y = s.pts[i * 3 + 1], z = s.pts[i * 3 + 2], x1 = x * cy - y * sy, y1 = x * sy + y * cy, ys = y1 * cp - z * sp;
      ctx.fillStyle = s.sg[i] > 0 ? POS : NEG; ctx.globalAlpha = .6; ctx.fillRect(W / 2 + x1 * k, H / 2 + ys * k, 1.6, 1.6);
    }
  };

  /* ---------- Bohr (2D) ---------- */
  var SHELL = 'KLMNOPQ';
  TP.bohr = function (host, e, o) {
    o = o || {}; var size = 420, c = size / 2, N = e.shells.length, rMin = 46, rMax = 188, anim = !TP.reduced() && o.anim !== false;
    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size); svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Modelo de Bohr de ' + e.name + ': ' + e.shells.join(', ') + ' electrones por capa');
    function el(t, a, par) { var n = document.createElementNS(NS, t); for (var k in a) n.setAttribute(k, a[k]); (par || svg).appendChild(n); return n; }
    // núcleo
    var A = e.z + e.neutrons, rn = 9 + 15 * Math.sqrt(A / 294), dots = Math.min(70, A), i, a, rr;
    el('circle', { cx: c, cy: c, r: rn, fill: 'rgba(255,255,255,.06)', stroke: 'rgba(255,255,255,.2)' });
    var seed = e.z * 9301 + 49297, rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (i = 0; i < dots; i++) {
      a = rnd() * 6.283; rr = Math.sqrt(rnd()) * (rn - 3.2);
      el('circle', { cx: c + Math.cos(a) * rr, cy: c + Math.sin(a) * rr, r: 3, fill: rnd() < e.z / A ? '#ff6b4a' : '#8b8b94', 'fill-opacity': .95 });
    }
    // capas
    for (var n = 1; n <= N; n++) {
      var r = N === 1 ? 110 : rMin + (n - 1) * (rMax - rMin) / (N - 1), cnt = e.shells[n - 1];
      el('circle', { cx: c, cy: c, r: r, fill: 'none', stroke: 'rgba(255,255,255,.14)', 'stroke-dasharray': '2 5' });
      var g = el('g', {});
      if (anim) { var an = el('animateTransform', { attributeName: 'transform', type: 'rotate', from: '0 ' + c + ' ' + c, to: (n % 2 ? 360 : -360) + ' ' + c + ' ' + c, dur: (7 + n * 4.5) + 's', repeatCount: 'indefinite' }, g); }
      var outer = n === N, off = n * 0.7;
      for (i = 0; i < cnt; i++) {
        a = i / cnt * 6.283 + off;
        el('circle', { cx: c + Math.cos(a) * r, cy: c + Math.sin(a) * r, r: 4.6, fill: outer ? '#ff6b4a' : '#e4e4e7' }, g);
      }
      var t = el('text', { x: c + r * .7071 + 6, y: c - r * .7071 - 4, fill: '#71717a', 'font-size': 11, 'font-family': 'Geist Mono, monospace' }); t.textContent = SHELL[n - 1] + ' · ' + cnt;
    }
    host.appendChild(svg);
    return svg;
  };

  /* diagrama de orbitales con flechas (regla de Hund) */
  TP.orbDiagram = function (e) {
    var rows = e.cfg.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }).map(function (x) {
      var orb = 2 * x[1] + 1, boxes = '', i;
      for (i = 0; i < orb; i++) {
        var up = i < x[2], dn = x[2] > orb && i < x[2] - orb;
        boxes += '<span class="ob">' + (up ? '<b>↑</b>' : '') + (dn ? '<b>↓</b>' : '') + '</span>';
      }
      return '<div class="od"><span class="odl">' + x[0] + TP.LET[x[1]] + '<sup>' + x[2] + '</sup></span>' + boxes + '</div>';
    });
    return '<div class="odg">' + rows.join('') + '</div>';
  };

  /* Zeff de una subcapa ocupada (Slater) */
  TP.zeffSub = function (e, n, l) {
    var occ = e.cfg.filter(function (x) { return x[0] === n && x[1] === l; })[0]; if (!occ) return null;
    var s = TP.slater(e.cfg, [n, l]); return { zeff: e.z - s.sigma, sigma: s.sigma, nstar: { 1: 1, 2: 2, 3: 3, 4: 3.7, 5: 4, 6: 4.2, 7: 4.3 }[n] };
  };

  /* longitud de onda → color aproximado */
  TP.wl2rgb = function (w) {
    var r = 0, g = 0, b = 0, f;
    if (w >= 380 && w < 440) { r = -(w - 440) / 60; b = 1; } else if (w < 490) { g = (w - 440) / 50; b = 1; } else if (w < 510) { g = 1; b = -(w - 510) / 20; } else if (w < 580) { r = (w - 510) / 70; g = 1; } else if (w < 645) { r = 1; g = -(w - 645) / 65; } else if (w <= 780) { r = 1; }
    f = w < 420 ? .3 + .7 * (w - 380) / 40 : w > 700 ? .3 + .7 * (780 - w) / 80 : 1;
    return 'rgb(' + Math.round(255 * Math.pow(r * f, .8)) + ',' + Math.round(255 * Math.pow(g * f, .8)) + ',' + Math.round(255 * Math.pow(b * f, .8)) + ')';
  };
})();
