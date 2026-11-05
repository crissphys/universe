/* Tabla periódica · núcleo: modelo de datos y cálculos derivados */
(function () {
  var TP = window.TP = window.TP || {};
  var BASE = '/experimentos/tablaperiodica';
  TP.BASE = BASE;

  TP.CAT = {
    ak: { n: 'Metales alcalinos', c: '#e5806a' },
    ae: { n: 'Alcalinotérreos', c: '#e3a857' },
    tr: { n: 'Metales de transición', c: '#b9c46c' },
    pt: { n: 'Metales postransicionales', c: '#6fbf9a' },
    md: { n: 'Metaloides', c: '#5db7c4' },
    nm: { n: 'No metales', c: '#79a6e4' },
    ha: { n: 'Halógenos', c: '#a597e6' },
    ng: { n: 'Gases nobles', c: '#d98fc4' },
    la: { n: 'Lantánidos', c: '#8db3c6' },
    ac: { n: 'Actínidos', c: '#b3a28d' }
  };
  TP.STATE = { s: ['Sólido', '#cfd2d8'], l: ['Líquido', '#79a6e4'], g: ['Gas', '#ff6b4a'], u: ['Desconocido', '#52525b'] };
  TP.BLOCK = { s: ['Bloque s', '#e5806a'], p: ['Bloque p', '#6fbf9a'], d: ['Bloque d', '#b9c46c'], f: ['Bloque f', '#8db3c6'] };

  var ORDER = [[1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [4, 0], [3, 2], [4, 1], [5, 0], [4, 2], [5, 1], [6, 0], [4, 3], [5, 2], [6, 1], [7, 0], [5, 3], [6, 2], [7, 1]];
  var LET = 'spdf';
  var EXC = {
    24: { '4s': 1, '3d': 5 }, 29: { '4s': 1, '3d': 10 }, 41: { '5s': 1, '4d': 4 }, 42: { '5s': 1, '4d': 5 },
    44: { '5s': 1, '4d': 7 }, 45: { '5s': 1, '4d': 8 }, 46: { '5s': 0, '4d': 10 }, 47: { '5s': 1, '4d': 10 },
    57: { '4f': 0, '5d': 1 }, 58: { '4f': 1, '5d': 1 }, 64: { '4f': 7, '5d': 1 }, 78: { '6s': 1, '5d': 9 }, 79: { '6s': 1, '5d': 10 },
    89: { '5f': 0, '6d': 1 }, 90: { '5f': 0, '6d': 2 }, 91: { '5f': 2, '6d': 1 }, 92: { '5f': 3, '6d': 1 }, 93: { '5f': 4, '6d': 1 },
    96: { '5f': 7, '6d': 1 }, 103: { '5f': 14, '6d': 0, '7p': 1 }, 111: { '7s': 1, '6d': 10 }
  };
  TP.ORDER = ORDER; TP.EXC = EXC;
  var CORES = [[2, 'He'], [10, 'Ne'], [18, 'Ar'], [36, 'Kr'], [54, 'Xe'], [86, 'Rn']];

  function slugify(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, ''); }
  TP.slugify = slugify;

  /* configuración como lista [n, l, e] en orden de llenado (Madelung) con excepciones aplicadas */
  function cfgOf(Z, noExc) {
    var left = Z, out = [], i, o, cap, c;
    for (i = 0; i < ORDER.length && left > 0; i++) {
      o = ORDER[i]; cap = 2 * (2 * o[1] + 1); c = Math.min(cap, left); left -= c; out.push([o[0], o[1], c]);
    }
    var ex = noExc ? null : EXC[Z];
    if (ex) {
      Object.keys(ex).forEach(function (k) {
        var n = +k[0], l = LET.indexOf(k[1]), f = out.filter(function (x) { return x[0] === n && x[1] === l; })[0];
        if (f) f[2] = ex[k]; else out.push([n, l, ex[k]]);
      });
      out.sort(function (a, b) { return ORDER.findIndex(function (o) { return o[0] === a[0] && o[1] === a[1]; }) - ORDER.findIndex(function (o) { return o[0] === b[0] && o[1] === b[1]; }); });
    }
    return out.filter(function (x) { return x[2] > 0; });
  }
  var SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  function sup(n) { return String(n).split('').map(function (d) { return SUP[+d]; }).join(''); }
  TP.sup = sup;
  function cfgStr(c, byShell) {
    var a = c.slice();
    if (byShell) a.sort(function (x, y) { return x[0] - y[0] || x[1] - y[1]; });
    return a.map(function (x) { return x[0] + LET[x[1]] + sup(x[2]); }).join(' ');
  }
  function cfgShort(Z) {
    var core = null, i;
    for (i = CORES.length - 1; i >= 0; i--) if (Z > CORES[i][0]) { core = CORES[i]; break; }
    var c = cfgOf(Z);
    if (!core) return { core: null, str: cfgStr(c, true), full: cfgStr(c, true) };
    var coreCfg = cfgOf(core[0]), rest = c.map(function (x) {
      var f = coreCfg.filter(function (y) { return y[0] === x[0] && y[1] === x[1]; })[0];
      var e = f ? x[2] - f[2] : x[2];
      return e > 0 ? [x[0], x[1], e] : null;
    }).filter(Boolean);
    return { core: core[1], str: '[' + core[1] + '] ' + cfgStr(rest, true), full: cfgStr(c, true), order: '[' + core[1] + '] ' + cfgStr(rest, false) };
  }

  /* posición en la tabla: [fila, columna] (cuadrícula 18 × 10; las filas 9 y 10 son lantánidos y actínidos) */
  function posOf(Z) {
    if (Z === 1) return [1, 1]; if (Z === 2) return [1, 18];
    if (Z <= 4) return [2, Z - 2]; if (Z <= 10) return [2, Z + 8];
    if (Z <= 12) return [3, Z - 10]; if (Z <= 18) return [3, Z];
    if (Z <= 36) return [4, Z - 18]; if (Z <= 54) return [5, Z - 36];
    if (Z <= 56) return [6, Z - 54];
    if (Z <= 70) return [9, Z - 54];   // La..Yb → columnas 3..16
    if (Z === 71) return [6, 3]; if (Z <= 86) return [6, Z - 68];
    if (Z <= 88) return [7, Z - 86];
    if (Z <= 102) return [10, Z - 86];
    if (Z === 103) return [7, 3];
    return [7, Z - 100];
  }
  function blockOf(Z, col) {
    if (Z === 2 || col <= 2) return 's';
    if ((Z >= 57 && Z <= 70) || (Z >= 89 && Z <= 102)) return 'f';
    if (col >= 13) return 'p';
    return 'd';
  }
  function periodOf(Z) { return Z <= 2 ? 1 : Z <= 10 ? 2 : Z <= 18 ? 3 : Z <= 36 ? 4 : Z <= 54 ? 5 : Z <= 86 ? 6 : 7; }

  /* Reglas de Slater para el electrón más externo */
  var NSTAR = { 1: 1, 2: 2, 3: 3, 4: 3.7, 5: 4.0, 6: 4.2, 7: 4.3 };
  function gkey(n, l) { return l <= 1 ? n * 10 : n * 10 + l; }
  function slaterGroups(c) {
    var g = {};
    c.forEach(function (x) { var k = gkey(x[0], x[1]); g[k] = (g[k] || 0) + x[2]; });
    return g;
  }
  function slater(c, target) {
    var tn = target[0], tl = target[1], tk = gkey(tn, tl), g = slaterGroups(c), s = 0, details = [];
    Object.keys(g).forEach(function (ks) {
      var k = +ks, n = Math.floor(k / 10), cnt = g[k], same = k === tk, w = 0, label;
      if (same) { cnt -= 1; w = (tn === 1) ? 0.30 : 0.35; }
      else if (tl <= 1) { w = n === tn - 1 ? 0.85 : (n < tn - 1 ? 1.0 : 0); if (n === tn) w = 0; }
      else { w = k < tk ? 1.0 : 0; }
      if (cnt > 0 && w > 0) details.push({ k: k, n: n, cnt: cnt, w: w });
      s += cnt * w;
    });
    return { sigma: s, details: details };
  }
  function valenceOf(c, block, col) {
    var nmax = Math.max.apply(null, c.map(function (x) { return x[0]; }));
    if (block === 'd') return col;
    if (block === 'f') return c.filter(function (x) { return x[0] === nmax || (x[1] >= 2 && x[0] >= nmax - 2 && x[2] < 2 * (2 * x[1] + 1)); }).reduce(function (a, x) { return a + x[2]; }, 0);
    return c.filter(function (x) { return x[0] === nmax; }).reduce(function (a, x) { return a + x[2]; }, 0);
  }
  function unpaired(c) {
    return c.reduce(function (a, x) { var orb = 2 * x[1] + 1; return a + (x[2] <= orb ? x[2] : 2 * orb - x[2]); }, 0);
  }
  function lastElectron(c) {
    var best = c[0];
    c.forEach(function (x) { if (x[0] + x[1] > best[0] + best[1] || (x[0] + x[1] === best[0] + best[1] && x[0] > best[0])) best = x; });
    var n = best[0], l = best[1], cnt = best[2], orb = 2 * l + 1, ml, ms;
    if (cnt <= orb) { ml = -l + cnt - 1; ms = 0.5; } else { ml = -l + (cnt - orb) - 1; ms = -0.5; }
    return { n: n, l: l, ml: ml, ms: ms, sub: n + LET[l] };
  }

  var E = TP.E = TP.ROWS.map(function (r, i) {
    var t = TP.TXT[i], p = posOf(r[0]), block = blockOf(r[0], p[1]), cfg = cfgOf(r[0]);
    var el = {
      z: r[0], sym: r[1], name: r[2], slug: slugify(r[2]), mass: r[3], cat: r[4], en: r[5], ie: r[6], ea: r[7],
      rat: r[8], rcov: r[9], rvdw: r[10], dens: r[11], mp: r[12], bp: r[13], cp: r[14], k: r[15], cr: r[16], st: r[17],
      row: p[0], col: p[1], block: block, period: periodOf(r[0]),
      group: (block === 'f') ? null : (r[0] === 2 ? 18 : p[1]),
      cfg: cfg, ox: t[0], year: t[1], who: t[2], etym: t[3], story: t[4], uses: t[5],
      pred: r[0] >= 104
    };
    var sh = cfgShort(el.z); el.cfgShort = sh.str; el.cfgFull = sh.full; el.cfgCore = sh.core; el.cfgOrder = sh.order || sh.full;
    el.valence = valenceOf(cfg, block, p[1]);
    el.unpaired = unpaired(cfg);
    el.last = lastElectron(cfg);
    var nmax = Math.max.apply(null, cfg.map(function (x) { return x[0]; }));
    var top = cfg.filter(function (x) { return x[0] === nmax; }).sort(function (a, b) { return b[1] - a[1]; })[0];
    var s = slater(cfg, top);
    el.zeff = el.z - s.sigma; el.slater = { target: top, sigma: s.sigma, details: s.details, nstar: NSTAR[nmax] };
    el.mull = el.ie != null ? (el.ie + (el.ea || 0)) / 2 / 96.485 : null;
    el.shells = []; cfg.forEach(function (x) { el.shells[x[0] - 1] = (el.shells[x[0] - 1] || 0) + x[2]; });
    for (var q = 0; q < el.shells.length; q++) el.shells[q] = el.shells[q] || 0;
    el.iso = TP.ISO[i]; el.neutrons = el.iso - el.z;
    return el;
  });
  TP.bySym = {}; TP.bySlug = {}; E.forEach(function (e) { TP.bySym[e.sym] = e; TP.bySlug[e.slug] = e; });
  TP.slater = slater; TP.cfgOf = cfgOf; TP.cfgStr = cfgStr;

  TP.stateAt = function (e, T) {
    if (e.mp == null || e.bp == null) return e.st;
    if (e.bp < e.mp) return T < e.bp ? 's' : 'g';
    return T < e.mp ? 's' : T < e.bp ? 'l' : 'g';
  };

  /* propiedades seleccionables (colorear, tendencias, 3D) */
  TP.PROPS = [
    { k: 'en', l: 'Electronegatividad (Pauling)', u: '', d: 2 },
    { k: 'ie', l: 'Energía de ionización (1.ª)', u: 'kJ/mol', d: 0 },
    { k: 'ea', l: 'Afinidad electrónica', u: 'kJ/mol', d: 1 },
    { k: 'rat', l: 'Radio atómico', u: 'pm', d: 0 },
    { k: 'rcov', l: 'Radio covalente', u: 'pm', d: 0 },
    { k: 'rvdw', l: 'Radio de van der Waals', u: 'pm', d: 0 },
    { k: 'zeff', l: 'Carga nuclear efectiva (Slater)', u: '', d: 2 },
    { k: 'mull', l: 'Electronegatividad de Mulliken', u: 'eV', d: 2 },
    { k: 'mass', l: 'Masa atómica', u: 'u', d: 2 },
    { k: 'dens', l: 'Densidad', u: 'g/cm³', d: 3, log: true },
    { k: 'mp', l: 'Punto de fusión', u: 'K', d: 0, temp: true },
    { k: 'bp', l: 'Punto de ebullición', u: 'K', d: 0, temp: true },
    { k: 'cp', l: 'Calor específico', u: 'J/(g·K)', d: 3 },
    { k: 'k', l: 'Conductividad térmica', u: 'W/(m·K)', d: 1, log: true },
    { k: 'valence', l: 'Electrones de valencia', u: '', d: 0 },
    { k: 'unpaired', l: 'Electrones desapareados', u: '', d: 0 },
    { k: 'year', l: 'Año de descubrimiento', u: '', d: 0, year: true }
  ];
  TP.prop = function (k) { return TP.PROPS.filter(function (p) { return p.k === k; })[0]; };
  TP.val = function (e, k) {
    var v = e[k];
    if (k === 'year' && v === 0) return null;
    return v == null ? null : v;
  };

  /* formato */
  var nf = {};
  function nfmt(d) { return nf[d] || (nf[d] = new Intl.NumberFormat('es', { minimumFractionDigits: 0, maximumFractionDigits: d })); }
  TP.num = function (v, d) {
    if (v == null || isNaN(v)) return 'n/d';
    if (d == null) d = Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : Math.abs(v) >= 1 ? 2 : 3;
    else if (v !== 0 && Math.abs(v) < 1) d = Math.max(d, Math.min(5, Math.ceil(-Math.log10(Math.abs(v))) + 1));
    if (Math.abs(v) < 0.01 && v !== 0) return v.toExponential(2).replace('.', ',').replace('e-', ' × 10⁻').replace(/10⁻(\d)/, function (m, x) { return '10⁻' + sup(+x); });
    return nfmt(d).format(v);
  };
  TP.temp = function (K, unit) {
    if (K == null) return 'n/d';
    if (unit === 'C') return TP.num(K - 273.15, 0) + ' °C';
    if (unit === 'F') return TP.num(K * 9 / 5 - 459.67, 0) + ' °F';
    return TP.num(K, K < 100 ? 2 : 0) + ' K';
  };
  TP.fmtProp = function (e, p, unit) {
    var v = TP.val(e, p.k);
    if (v == null) return 'n/d';
    if (p.temp) return TP.temp(v, unit);
    if (p.year) return String(v);
    return TP.num(v, p.d) + (p.u ? ' ' + p.u : '');
  };

  /* escala de color (monocromática cálida) */
  var STOPS = [[0, [38, 38, 46]], [.5, [160, 70, 52]], [1, [255, 176, 138]]];
  TP.ramp = function (t) {
    t = Math.max(0, Math.min(1, t));
    for (var i = 1; i < STOPS.length; i++) if (t <= STOPS[i][0]) {
      var a = STOPS[i - 1], b = STOPS[i], u = (t - a[0]) / (b[0] - a[0]);
      return [0, 1, 2].map(function (j) { return Math.round(a[1][j] + (b[1][j] - a[1][j]) * u); });
    }
    return STOPS[2][1];
  };
  TP.rgb = function (c) { return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; };
  TP.ink = function (c) { return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) > 140 ? '#15110f' : '#f4f4f5'; };
  TP.range = function (k) {
    var p = TP.prop(k), vals = E.map(function (e) { return TP.val(e, k); }).filter(function (v) { return v != null; });
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    var tr = p.log ? function (v) { return Math.log(v); } : function (v) { return v; };
    return { lo: lo, hi: hi, t: function (v) { var a = tr(lo), b = tr(hi); return (tr(v) - a) / (b - a || 1); } };
  };

  /* etiqueta compacta de eje */
  TP.tick = function (v) {
    var a = Math.abs(v);
    if (a >= 1000) return nfmt(0).format(Math.round(v));
    if (a >= 10) return nfmt(0).format(Math.round(v));
    if (a >= 1) return nfmt(1).format(v);
    if (a >= 0.01 || a === 0) return nfmt(2).format(v);
    return v.toExponential(0).replace('e-', '·10⁻').replace(/⁻(\d+)/, function (m, x) { return '⁻' + sup(+x); });
  };
  /* gráfico SVG que se vuelve a dibujar al cambiar el ancho */
  TP.mountChart = function (host, draw) {
    host._draw = function () {
      Array.prototype.forEach.call(host.querySelectorAll('svg'), function (n) { n.remove(); });
      host._w = host.clientWidth; draw(Math.max(280, Math.round(host.clientWidth || 600)));
    };
    host._draw();
  };
  var rz; window.addEventListener('resize', function () {
    clearTimeout(rz); rz = setTimeout(function () {
      Array.prototype.forEach.call(document.querySelectorAll('.chart'), function (h) { if (h._draw && h.clientWidth && Math.abs(h.clientWidth - h._w) > 4) h._draw(); });
    }, 160);
  });
  var NS = 'http://www.w3.org/2000/svg';
  TP.$ = function (s, r) { return (r || document).querySelector(s); };
  TP.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  TP.esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  TP.svgEl = function (t, a, parent) { var n = document.createElementNS(NS, t); for (var k in a) n.setAttribute(k, a[k]); if (parent) parent.appendChild(n); return n; };
  TP.reduced = function () { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; };
  TP.store = {
    get: function (k, d) { try { var v = localStorage.getItem('tp_' + k); return v == null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('tp_' + k, v); } catch (e) { } }
  };
  /* fórmulas tipográficas con KaTeX (si la CDN falla, se muestra el código TeX) */
  TP.tex = function (t, display) {
    try { if (window.katex) return window.katex.renderToString(t, { throwOnError: false, displayMode: !!display, strict: false }); } catch (e) { }
    return '<span class="mono">' + TP.esc(t) + '</span>';
  };
  TP.F = function (t) { return '<div class="formula">' + TP.tex(t, true) + '</div>'; };
  TP.tn = function (v, d) { return TP.num(v, d).replace(',', '{,}'); };
  TP.url = function (e) { return BASE + '/elemento/' + e.slug; };
  /* símbolo de puntos de Lewis (SVG); n electrones de valencia */
  TP.lewisDot = function (sym, n, size, fg) {
    size = size || 120; var c = size / 2, d = size * .31, off = size * .06, out = '', sides = [[0, -1], [1, 0], [0, 1], [-1, 0]], i, spots = [];
    if (n <= 2) { for (i = 0; i < n; i++) spots.push([(i ? 1 : -1) * off, -d]); }
    else for (i = 0; i < Math.min(n, 8); i++) {
      var sd = sides[i % 4], slot = i < 4 ? -1 : 1, px = sd[0] ? sd[0] * d : slot * off, py = sd[1] ? sd[1] * d : slot * off;
      spots.push([px, py]);
    }
    out = '<svg viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="Símbolo de Lewis de ' + sym + ' con ' + n + ' electrones de valencia" style="width:100%;max-width:' + size + 'px;fill:currentColor;stroke:none">' +
      '<text x="' + c + '" y="' + (c + size * .115) + '" text-anchor="middle" font-size="' + (size * .3) + '" font-weight="600" font-family="Geist, sans-serif" style="letter-spacing:-.03em">' + sym + '</text>' +
      spots.map(function (p) { return '<circle cx="' + (c + p[0]) + '" cy="' + (c + p[1]) + '" r="' + (size * .032) + '" fill="#ff6b4a"/>'; }).join('') + '</svg>';
    return out;
  };
  TP.LET = LET;
  var ORB_NAMES = { 's': ['s'], 'p': ['pₓ', 'p_y', 'p_z'] };
  TP.orbName = function (l) { return LET[l]; };
})();
