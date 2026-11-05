/* Tabla periódica · sección "Átomo": modelos, configuración, espectro, Z* y fórmulas */
(function () {
  var TP = window.TP, E = TP.E, $ = TP.$, $$ = TP.$$;
  TP.init = TP.init || {};
  function opt(sel) { return E.map(function (x) { return '<option value="' + x.z + '"' + (x.z === sel ? ' selected' : '') + '>' + x.name + ' (' + x.sym + ', ' + x.z + ')</option>'; }).join(''); }
  function oname(n, l, m) { return n + TP.ANG[l][m].n.replace(/_\{([^}]*)\}/, '$1').replace('_', ''); }


  /* ---------- modelos ---------- */
  function modelos(p) {
    var Z = +TP.store.get('atomZ', 26), e = E[Z - 1];
    p.innerHTML =
      '<div class="bar"><label class="sel"><select id="az" aria-label="Elemento">' + opt(Z) + '</select></label>' +
      '<div class="seg"><button type="button" id="aprev" aria-label="Elemento anterior">‹</button><button type="button" id="anext" aria-label="Elemento siguiente">›</button></div>' +
      '<a class="btn ghost" id="agoto" href="#">Ver ficha</a></div>' +
      '<section class="card"><h2 class="sec">Modelo de Bohr</h2><div class="grid2 eq"><div><div id="abohr" class="bohr"></div><p class="cap" id="acap"></p></div><div id="ainfo"></div></div></section>' +
      '<section class="card"><h2 class="sec">Orbitales de Schrödinger</h2><div class="grid2 eq"><div id="alab"></div><div>' +
      '<div class="chips" id="asubs" role="group" aria-label="Subcapas del elemento"></div>' +
      '<div class="row-ctl"><label class="sel"><select id="an" aria-label="n"></select></label><label class="sel"><select id="al" aria-label="ℓ"></select></label><label class="sel"><select id="am" aria-label="Orientación"></select></label></div>' +
      '<div class="row-ctl"><button type="button" class="pill" id="acut" aria-pressed="false">Corte</button><button type="button" class="pill" id="aspin" aria-pressed="' + (!TP.reduced()) + '">Girar</button><label class="range" for="az2">Z*<input id="az2" type="range" min="1" max="30" step=".05" value="1"><output id="azo">1,00</output></label></div>' +
      '<dl class="kv" id="ainf"></dl><div class="leg2"><span><i style="--c:#ff6b4a"></i>ψ positiva</span><span><i style="--c:#79a6e4"></i>ψ negativa</span></div></div></div></section>' +
      '<section class="card"><h2 class="sec">Galería de orbitales</h2><div class="gal" id="gal"></div></section>' +
      '<details class="acc"><summary>Ideas y fórmulas de cada modelo</summary><div class="body"><div class="grid2 eq"><div><h3>Bohr (1913)</h3><ul class="bul"><li>El electrón gira en órbitas circulares de energía fija sin irradiar.</li><li>Solo se permiten órbitas con L = n·ħ.</li><li>Al saltar emite o absorbe un fotón: ΔE = hν.</li></ul>' +
      '' + TP.F('r_n = 52{,}9\\ \\text{pm}\\cdot\\dfrac{n^2}{Z}') + '' + TP.F('E_n = -13{,}6\\ \\text{eV}\\cdot\\dfrac{Z^2}{n^2}') + '<p class="prose">Solo funciona con un electrón (H, He⁺, Li²⁺). No explica el enlace ni la intensidad de las líneas, y contradice la incertidumbre.</p></div>' +
      '<div><h3>Schrödinger (1926)</h3><ul class="bul"><li>El electrón es una onda: ψ(r, θ, φ) es solución de Ĥψ = Eψ.</li><li>|ψ|² es la probabilidad de encontrarlo; un orbital encierra ≈ 90 %.</li><li>No hay trayectoria (Δx·Δp ≥ ħ/2).</li></ul>' +
      '' + TP.F('\\psi_{n\\ell m}(r,\\theta,\\varphi)=R_{n\\ell}(r)\\,Y_{\\ell m}(\\theta,\\varphi)') + '' + TP.F('\\text{nodos radiales}=n-\\ell-1\\qquad\\text{nodos angulares}=\\ell') + '<p class="prose">Explica átomos polielectrónicos, la forma de los orbitales y el enlace.</p></div></div>' +
      '<div class="tscroll"><table class="t"><thead><tr><th></th><th>Bohr</th><th>Schrödinger</th></tr></thead><tbody><tr><td>Electrón</td><td>Partícula en órbita</td><td>Onda de probabilidad</td></tr><tr><td>Números cuánticos</td><td>1 (n)</td><td>4 (n, ℓ, mℓ, ms)</td></tr><tr><td>Varios electrones</td><td>No</td><td>Sí</td></tr><tr><td>Forma</td><td>Círculos planos</td><td>Orbitales s, p, d, f</td></tr></tbody></table></div></div></details>';
    var sel = $('#az', p), viewer = TP.orbViewer($('#alab', p), { aspect: '1 / 1' }), cur = { n: 1, l: 0, m: 0 }, zOv = null;
    function head() {
      e = E[Z - 1]; TP.store.set('atomZ', Z); $('#agoto', p).href = TP.url(e);
      $('#abohr', p).innerHTML = ''; TP.bohr($('#abohr', p), e);
      $('#acap', p).innerHTML = e.z + ' protones, ' + e.neutrons + ' neutrones (A = ' + e.iso + '), ' + e.z + ' electrones';
      $('#ainfo', p).innerHTML = '<dl class="kv"><dt>Electrones por capa</dt><dd>' + e.shells.join(', ') + '</dd><dt>Configuración</dt><dd>' + e.cfgShort + '</dd><dt>Electrones de valencia</dt><dd>' + e.valence + '</dd><dt>Desapareados</dt><dd>' + e.unpaired + '</dd><dt>Magnetismo</dt><dd>' + (e.unpaired ? 'Paramagnético' : 'Diamagnético') + '</dd></dl><h3 class="sub">Diagrama de orbitales</h3>' + TP.orbDiagram(e);
      var subs = e.cfg.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
      $('#asubs', p).innerHTML = subs.map(function (x) { return '<button type="button" class="pill" data-n="' + x[0] + '" data-l="' + x[1] + '" aria-pressed="false">' + x[0] + TP.LET[x[1]] + '<sup>' + x[2] + '</sup></button>'; }).join('');
      cur = { n: e.last.n, l: e.last.l, m: 0 }; zOv = null; lab();
    }
    function fillSel() {
      var n = $('#an', p), l = $('#al', p), i;
      n.innerHTML = [1, 2, 3, 4, 5, 6, 7].map(function (v) { return '<option value="' + v + '">n = ' + v + '</option>'; }).join(''); n.value = cur.n;
      var lm = Math.min(3, cur.n - 1); l.innerHTML = ''; for (i = 0; i <= lm; i++) l.innerHTML += '<option value="' + i + '">ℓ = ' + i + ' (' + TP.LET[i] + ')</option>';
      if (cur.l > lm) cur.l = lm; l.value = cur.l;
      $('#am', p).innerHTML = TP.ANG[cur.l].map(function (o, j) { return '<option value="' + j + '">' + oname(cur.n, cur.l, j) + '</option>'; }).join(''); $('#am', p).value = cur.m;
    }
    function lab() {
      fillSel();
      var sz = TP.zeffSub(e, cur.n, cur.l), Zv = zOv != null ? zOv : (sz ? sz.zeff : 1);
      $('#az2', p).value = Zv; $('#azo', p).textContent = TP.num(Zv, 2);
      var s = viewer.set(cur.n, cur.l, cur.m, Math.max(.8, Zv));
      $$('#asubs button', p).forEach(function (b) { b.setAttribute('aria-pressed', (+b.dataset.n === cur.n && +b.dataset.l === cur.l) ? 'true' : 'false'); });
      $('#ainf', p).innerHTML = '<dt>Orbital</dt><dd>' + oname(cur.n, cur.l, cur.m) + '</dd><dt>Nodos radiales (n − ℓ − 1)</dt><dd>' + (cur.n - cur.l - 1) + '</dd><dt>Nodos angulares (ℓ)</dt><dd>' + cur.l + '</dd><dt>Radio más probable</dt><dd>' + TP.num(s.rpeak * 52.9177, 0) + ' pm</dd><dt>Radio medio ⟨r⟩</dt><dd>' + TP.num(s.rmean * 52.9177, 0) + ' pm</dd><dt>Capacidad de la subcapa</dt><dd>' + 2 * (2 * cur.l + 1) + ' e⁻</dd>';
    }
    sel.addEventListener('change', function () { Z = +sel.value; head(); });
    $('#aprev', p).addEventListener('click', function () { Z = Z > 1 ? Z - 1 : 118; sel.value = Z; head(); });
    $('#anext', p).addEventListener('click', function () { Z = Z < 118 ? Z + 1 : 1; sel.value = Z; head(); });
    $('#asubs', p).addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b) return; cur = { n: +b.dataset.n, l: +b.dataset.l, m: 0 }; zOv = null; lab(); });
    $('#an', p).addEventListener('change', function (ev) { cur.n = +ev.target.value; if (cur.l > cur.n - 1) cur.l = cur.n - 1; cur.m = 0; zOv = null; lab(); });
    $('#al', p).addEventListener('change', function (ev) { cur.l = +ev.target.value; cur.m = 0; zOv = null; lab(); });
    $('#am', p).addEventListener('change', function (ev) { cur.m = +ev.target.value; lab(); });
    $('#acut', p).addEventListener('click', function (ev) { var on = ev.currentTarget.getAttribute('aria-pressed') !== 'true'; ev.currentTarget.setAttribute('aria-pressed', on); viewer.cut(on); });
    $('#aspin', p).addEventListener('click', function (ev) { var on = ev.currentTarget.getAttribute('aria-pressed') !== 'true'; ev.currentTarget.setAttribute('aria-pressed', viewer.auto(on)); });
    $('#az2', p).addEventListener('input', function (ev) { zOv = +ev.target.value; $('#azo', p).textContent = TP.num(zOv, 2); viewer.set(cur.n, cur.l, cur.m, Math.max(.8, zOv)); });
    head();
    var gal = $('#gal', p), g = [], l, m;
    for (l = 0; l <= 3; l++) for (m = 0; m < TP.ANG[l].length; m++) g.push([l, m]);
    gal.innerHTML = g.map(function (x) { return '<button type="button" class="gi" data-l="' + x[0] + '" data-m="' + x[1] + '" aria-label="Orbital ' + oname(x[0] + 1, x[0], x[1]) + '"><canvas width="120" height="120"></canvas><span>' + oname(x[0] + 1, x[0], x[1]) + '</span></button>'; }).join('');
    var cvs = $$('#gal canvas', p), idx = 0;
    (function draw() { var t = Date.now(); while (idx < cvs.length && Date.now() - t < 14) { var x = g[idx]; TP.orbThumb(cvs[idx], x[0] + 1, x[0], x[1], 1); idx++; } if (idx < cvs.length) requestAnimationFrame(draw); })();
    gal.addEventListener('click', function (ev) { var b = ev.target.closest('.gi'); if (!b) return; cur = { n: +b.dataset.l + 1, l: +b.dataset.l, m: +b.dataset.m }; zOv = 1; lab(); $('#alab', p).scrollIntoView({ block: 'center', behavior: TP.reduced() ? 'auto' : 'smooth' }); });
  }

  /* ---------- configuración ---------- */
  function ionCfg(e, q) {
    var c;
    if (q > 0) { c = e.cfg.map(function (x) { return x.slice(); }); var m = q; while (m > 0) { c.sort(function (a, b) { return b[0] - a[0] || b[1] - a[1]; }); var s = c.filter(function (x) { return x[2] > 0; })[0]; if (!s) break; s[2]--; m--; } }
    else if (q < 0) c = TP.cfgOf(e.z - q, true); else c = e.cfg.map(function (x) { return x.slice(); });
    return c.filter(function (x) { return x[2] > 0; }).sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
  }
  function config(p) {
    p.innerHTML =
      '<section class="card"><div class="bar"><label class="sel"><select id="ie1" aria-label="Elemento">' + opt(+TP.store.get('atomZ', 26)) + '</select></label><label class="sel"><select id="ie2" aria-label="Carga">' + [-3, -2, -1, 0, 1, 2, 3, 4, 5].map(function (q) { return '<option value="' + q + '"' + (q === 0 ? ' selected' : '') + '>' + (q === 0 ? 'Átomo neutro' : 'Ion ' + (q > 0 ? '+' : '−') + Math.abs(q)) + '</option>'; }).join('') + '</select></label></div>' +
      '<div class="grid2 eq"><dl class="kv" id="cres"></dl><div id="cdia"></div></div></section>' +
      '<div class="grid2 eq"><section class="card"><h2 class="sec">Orden de llenado</h2><div id="mad"></div><dl class="kv" style="margin-top:14px"><dt>Aufbau</dt><dd>menor n + ℓ primero</dd><dt>Pauli</dt><dd>máx. 2 e⁻ por orbital, espines opuestos</dd><dt>Hund</dt><dd>un e⁻ por orbital antes de aparear</dd></dl></section>' +
      '<section class="card"><h2 class="sec">Números cuánticos</h2><div class="tscroll"><table class="t"><thead><tr><th></th><th>Nombre</th><th>Valores</th><th>Define</th></tr></thead><tbody><tr><td class="mono">n</td><td>Principal</td><td>1, 2, 3…</td><td>Energía y tamaño</td></tr><tr><td class="mono">ℓ</td><td>Azimutal</td><td>0 a n − 1</td><td>Forma</td></tr><tr><td class="mono">mℓ</td><td>Magnético</td><td>−ℓ a +ℓ</td><td>Orientación</td></tr><tr><td class="mono">ms</td><td>Espín</td><td>+½, −½</td><td>Giro</td></tr></tbody></table></div>' + TP.F('e^-_{\\text{capa}}=2n^2\\qquad e^-_{\\text{subcapa}}=2(2\\ell+1)') + '</section></div>' +
      '<section class="card"><h2 class="sec">Excepciones</h2><div class="chips">' + Object.keys(TP.EXC).map(function (z) { var x = E[z - 1]; return '<a class="tag" href="' + TP.url(x) + '">' + x.sym + ' ' + x.cfgShort + '</a>'; }).join('') + '</div><p class="prose" style="margin-top:12px">Una subcapa d o f semillena o llena es más estable, y ns y (n−1)d tienen energías casi iguales. Z ≥ 104 son predicciones.</p></section>';
    var mad = '<div class="mad"><span></span>' + ['s', 'p', 'd', 'f'].map(function (x) { return '<b>' + x + '</b>'; }).join('');
    for (var n = 1; n <= 7; n++) { mad += '<b>' + n + '</b>'; for (var l = 0; l < 4; l++) { var i = TP.ORDER.findIndex(function (o) { return o[0] === n && o[1] === l; }); mad += i < 0 ? '<span class="mn"></span>' : '<span class="mc" title="Máximo ' + 2 * (2 * l + 1) + ' e⁻">' + n + TP.LET[l] + '<i>' + (i + 1) + '</i></span>'; } }
    $('#mad', p).innerHTML = mad + '</div>';
    function render() {
      var e = E[+$('#ie1', p).value - 1], q = +$('#ie2', p).value, tot = e.z - q; TP.store.set('atomZ', e.z);
      if (tot < 1 || tot > 118) { $('#cres', p).innerHTML = '<dt>Resultado</dt><dd>n/d</dd>'; $('#cdia', p).innerHTML = ''; return; }
      var c = ionCfg(e, q), up = c.reduce(function (a, x) { var o = 2 * x[1] + 1; return a + (x[2] <= o ? x[2] : 2 * o - x[2]); }, 0), iso = [2, 10, 18, 36, 54, 86, 118].indexOf(tot) >= 0 ? E[tot - 1] : null;
      var sym = e.sym + (q ? '<sup>' + (Math.abs(q) > 1 ? Math.abs(q) : '') + (q > 0 ? '+' : '−') + '</sup>' : '');
      var fake = { cfg: c };
      var nmax = Math.max.apply(null, c.map(function (x) { return x[0]; }));
      $('#cres', p).innerHTML = '<dt>Especie</dt><dd>' + sym + ', ' + tot + ' electrones</dd><dt>Configuración</dt><dd>' + TP.cfgStr(c, true) + '</dd>' + (q === 0 ? '<dt>Orden de llenado</dt><dd>' + e.cfgOrder + '</dd>' : '') + '<dt>Capas</dt><dd>' + (function () { var s = {}; c.forEach(function (x) { s[x[0]] = (s[x[0]] || 0) + x[2]; }); return Object.keys(s).map(function (k) { return s[k]; }).join(', '); })() + '</dd><dt>Desapareados</dt><dd>' + up + ', ' + (up ? 'paramagnético' : 'diamagnético') + '</dd><dt>Momento magnético (solo espín)</dt><dd>' + TP.num(Math.sqrt(up * (up + 2)), 2) + ' μB</dd><dt>Isoelectrónico con</dt><dd>' + (iso ? iso.name + ' (' + iso.sym + ')' : 'ningún gas noble') + '</dd>' + (q === 0 ? '<dt>Último electrón (n, ℓ, mℓ, ms)</dt><dd>' + e.last.n + ', ' + e.last.l + ', ' + (e.last.ml > 0 ? '+' : e.last.ml < 0 ? '−' : '') + Math.abs(e.last.ml) + ', ' + (e.last.ms > 0 ? '+½' : '−½') + '</dd>' : '');
      $('#cdia', p).innerHTML = '<h3 class="sub">Diagrama de orbitales</h3>' + TP.orbDiagram(fake);
    }
    $('#ie1', p).addEventListener('change', render); $('#ie2', p).addEventListener('change', render); render();
  }

  /* ---------- espectro ---------- */
  function espectro(p) {
    var RH = 1.0968e7, SER = ['Lyman', 'Balmer', 'Paschen', 'Brackett', 'Pfund', 'Humphreys'], ION = ['H', 'He⁺', 'Li²⁺', 'Be³⁺', 'B⁴⁺'], NL = 14, svgEl = TP.svgEl;
    var rs = { z: 1, n1: 2, n2: 3, mode: 'serie', zoom: 30 };
    p.innerHTML =
      '<section class="card"><div class="bar"><label class="sel"><select id="rz" aria-label="Ion hidrogenoide">' + ION.map(function (n, i) { return '<option value="' + (i + 1) + '">' + n + ' (Z = ' + (i + 1) + ')</option>'; }).join('') + '</select></label>' +
      '<label class="sel"><select id="r1" aria-label="Serie">' + SER.map(function (n, i) { return '<option value="' + (i + 1) + '">Serie de ' + n + ' (llega a n = ' + (i + 1) + ')</option>'; }).join('') + '</select></label>' +
      '<label class="sel"><select id="r2" aria-label="Nivel de partida"></select></label></div>' +
      TP.F('\\dfrac{1}{\\lambda}=R_H\\,Z^2\\left(\\dfrac{1}{n_1^2}-\\dfrac{1}{n_2^2}\\right)\\qquad R_H=1{,}0968\\times10^{7}\\ \\text{m}^{-1}') + '</section>' +
      '<div class="grid2 eq"><section class="card"><h2 class="sec">Niveles de energía</h2><div class="chart" id="elev"></div><p class="cap">Separación entre niveles no proporcional a la energía.</p></section><section class="card"><h2 class="sec">Transición elegida</h2><dl class="kv" id="rout"></dl></section></div>' +
      '<section class="card"><div class="card-h"><h2 class="sec">Líneas de emisión</h2><div class="seg" id="rmode" role="group" aria-label="Intervalo de visión"><button type="button" data-m="serie">Toda la serie</button><button type="button" data-m="vis">Visible</button><button type="button" data-m="zoom">Ampliar</button></div></div>' +
      '<div class="zoomrow" id="rzw" hidden><label for="rzr">Ventana</label><input id="rzr" type="range" min="1" max="100" step="1" value="30"><output id="rzo" class="mono"></output></div>' +
      '<div class="chart" id="rspec"><div class="tip"></div></div><div class="leg2" id="rleg"></div></section>' +
      '<section class="card"><h2 class="sec">Líneas de la serie</h2><div class="tscroll"><table class="t" id="rtab"><thead><tr><th>Transición</th><th class="n">Longitud de onda</th><th class="n">Energía</th><th>Región</th></tr></thead><tbody></tbody></table></div></section>';
    var rz = $('#rz', p), r1 = $('#r1', p), r2 = $('#r2', p);
    function wlOf(n2) { return 1e9 / (RH * rs.z * rs.z * (1 / (rs.n1 * rs.n1) - 1 / (n2 * n2))); }
    function evOf(n2) { return 13.6057 * rs.z * rs.z * (1 / (rs.n1 * rs.n1) - 1 / (n2 * n2)); }
    function reg(w) { return w < 380 ? 'Ultravioleta' : w > 780 ? 'Infrarrojo' : 'Visible'; }
    function col(w) { return w < 380 ? '#b9acff' : w > 780 ? '#ff9f87' : TP.wl2rgb(w); }
    function fw(w) { return w >= 1000 ? TP.num(w / 1000, 2) + ' µm' : TP.num(w, w < 100 ? 2 : 1) + ' nm'; }
    function lines() { var a = [], n; for (n = rs.n1 + 1; n <= rs.n1 + NL; n++) a.push({ n2: n, wl: wlOf(n), ev: evOf(n) }); return a; }
    function limit() { return 1e9 / (RH * rs.z * rs.z / (rs.n1 * rs.n1)); }
    function range() {
      var L = lines(), lo = limit() * .96, hi = L[0].wl * 1.04;
      if (rs.mode === 'vis') return [380, 780];
      if (rs.mode === 'zoom') { var full = hi - lo, w = Math.max(full * rs.zoom / 100, full * .01), c = wlOf(rs.n2), a = c - w / 2, b = c + w / 2; if (a < lo) { b += lo - a; a = lo; } if (b > hi) { a -= b - hi; b = hi; } return [Math.max(lo * .5, a), b]; }
      return [lo, hi];
    }
    function fillSel() {
      var i; r2.innerHTML = ''; for (i = rs.n1 + 1; i <= rs.n1 + NL; i++) r2.innerHTML += '<option value="' + i + '">Desde n = ' + i + ' (' + fw(wlOf(i)) + ')</option>';
      if (rs.n2 <= rs.n1 || rs.n2 > rs.n1 + NL) rs.n2 = rs.n1 + 1; r2.value = rs.n2; rz.value = rs.z; r1.value = rs.n1;
    }
    function info() {
      var w = wlOf(rs.n2), e = evOf(rs.n2), nu = 299792458 / (w * 1e-9);
      $('#rout', p).innerHTML = '<dt>Transición</dt><dd>n = ' + rs.n2 + ' a n = ' + rs.n1 + '</dd><dt>Serie</dt><dd>' + SER[rs.n1 - 1] + '</dd><dt>Longitud de onda</dt><dd>' + fw(w) + '</dd><dt>Región</dt><dd>' + reg(w) + '</dd><dt>Frecuencia</dt><dd>' + TP.num(nu / 1e12, 1) + ' THz</dd><dt>Energía del fotón</dt><dd>' + TP.num(e, 3) + ' eV</dd><dt>Límite de la serie</dt><dd>' + fw(limit()) + '</dd>';
    }
    function tab() {
      $('#rtab tbody', p).innerHTML = lines().map(function (l) { return '<tr data-n="' + l.n2 + '"' + (l.n2 === rs.n2 ? ' class="me"' : '') + ' tabindex="0"><td class="mono">n = ' + l.n2 + ' a ' + rs.n1 + '</td><td class="n"><span class="sw" style="background:' + col(l.wl) + '"></span>' + fw(l.wl) + '</td><td class="n">' + TP.num(l.ev, 3) + ' eV</td><td>' + reg(l.wl) + '</td></tr>'; }).join('') + '<tr><td class="mono">límite (n = ∞)</td><td class="n">' + fw(limit()) + '</td><td class="n">' + TP.num(evOf(1e9), 3) + ' eV</td><td>' + reg(limit()) + '</td></tr>';
    }
    function select(n) { rs.n2 = n; r2.value = n; info(); tab(); drawSpec(); drawLev(); }

    /* diagrama de niveles */
    function drawLev() {
      var host = $('#elev', p); host.querySelectorAll('svg').forEach(function (n) { n.remove(); });
      var W = Math.max(280, host.clientWidth || 360), H = 300, m = { l: 62, r: 62, t: 22, b: 18 }, E0 = 13.6057 * rs.z * rs.z, N = 8, svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-label': 'Niveles de energía' });
      function Y(n) { return H - m.b - ((n - 1) / N) * (H - m.t - m.b); }
      var n, ls = lines().filter(function (l) { return l.n2 <= N; }), xs = W / 2;
      svgEl('line', { x1: m.l, x2: W - m.r, y1: m.t, y2: m.t, class: 'axis', 'stroke-dasharray': '4 4' }, svg); svgEl('text', { x: m.l - 8, y: m.t + 4, 'text-anchor': 'end' }, svg).textContent = 'n = ∞'; svgEl('text', { x: W - m.r + 8, y: m.t + 4 }, svg).textContent = '0 eV';
      for (n = 1; n <= N; n++) { var y = Y(n); svgEl('line', { x1: m.l, x2: W - m.r, y1: y, y2: y, stroke: n === rs.n1 || n === rs.n2 ? '#f4f4f5' : 'rgba(255,255,255,.28)', 'stroke-width': n === rs.n1 || n === rs.n2 ? 2 : 1.2 }, svg); svgEl('text', { x: m.l - 8, y: y + 4, 'text-anchor': 'end', style: (n === rs.n1 || n === rs.n2) ? 'fill:var(--fg)' : '' }, svg).textContent = 'n = ' + n; svgEl('text', { x: W - m.r + 8, y: y + 4 }, svg).textContent = TP.num(-E0 / (n * n), n === 1 ? 1 : 2) + ' eV'; }
      var span = (W - m.l - m.r) * .8, x0 = m.l + (W - m.l - m.r) * .1;
      ls.forEach(function (l, i) {
        var x = x0 + span * (i + .5) / ls.length, sel = l.n2 === rs.n2, c = sel ? col(l.wl) : 'rgba(255,255,255,.3)';
        svgEl('line', { x1: x, x2: x, y1: Y(l.n2), y2: Y(rs.n1) - 5, stroke: c, 'stroke-width': sel ? 3 : 1.4 }, svg);
        svgEl('path', { d: 'M' + (x - 5) + ' ' + (Y(rs.n1) - 9) + ' L' + x + ' ' + (Y(rs.n1) - 1) + ' L' + (x + 5) + ' ' + (Y(rs.n1) - 9) + ' Z', fill: c, stroke: 'none' }, svg);
        var hit = svgEl('rect', { x: x - 8, y: Y(l.n2), width: 16, height: Math.max(8, Y(rs.n1) - Y(l.n2)), fill: 'transparent', stroke: 'none', style: 'cursor:pointer' }, svg); hit.addEventListener('click', function () { select(l.n2); });
      });
      host.insertBefore(svg, host.firstChild);
    }

    /* espectro con intervalo ajustable */
    function drawSpec() {
      var host = $('#rspec', p), tip = host.querySelector('.tip'); host.querySelectorAll('svg').forEach(function (n) { n.remove(); });
      var W = Math.max(280, host.clientWidth || 640), H = 210, m = { l: 14, r: 14, t: 52, b: 52 }, r = range(), lo = r[0], hi = r[1], base = H - m.b;
      function X(w) { return m.l + (w - lo) / (hi - lo) * (W - m.l - m.r); }
      var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-label': 'Espectro de líneas de la serie de ' + SER[rs.n1 - 1] });
      var defs = svgEl('defs', {}, svg), gid = 'g' + Math.round(Math.random() * 1e6), g = svgEl('linearGradient', { id: gid, x1: 0, x2: 1, y1: 0, y2: 0 }, defs), i, a = Math.max(lo, 380), b = Math.min(hi, 780);
      // fondo: color real en el visible, bandas tenues en UV e IR
      if (lo < 380) svgEl('rect', { x: X(lo), y: m.t, width: Math.max(0, X(Math.min(hi, 380)) - X(lo)), height: base - m.t, fill: 'rgba(185,172,255,.10)', stroke: 'none' }, svg);
      if (hi > 780) svgEl('rect', { x: X(Math.max(lo, 780)), y: m.t, width: Math.max(0, X(hi) - X(Math.max(lo, 780))), height: base - m.t, fill: 'rgba(255,159,135,.09)', stroke: 'none' }, svg);
      if (b > a) { for (i = 0; i <= 40; i++) { var w = a + (b - a) * i / 40; svgEl('stop', { offset: (i / 40 * 100) + '%', 'stop-color': TP.wl2rgb(w) }, g); } svgEl('rect', { x: X(a), y: m.t, width: X(b) - X(a), height: base - m.t, fill: 'url(#' + gid + ')', opacity: .32, stroke: 'none' }, svg); }
      svgEl('rect', { x: m.l, y: m.t, width: W - m.l - m.r, height: base - m.t, fill: 'none', stroke: 'rgba(255,255,255,.12)', rx: 6 }, svg);
      // límites de región
      [[380, 'Ultravioleta | Visible'], [780, 'Visible | Infrarrojo']].forEach(function (x) { if (x[0] > lo && x[0] < hi) { svgEl('line', { x1: X(x[0]), x2: X(x[0]), y1: m.t, y2: base + 8, stroke: 'rgba(255,255,255,.35)', 'stroke-dasharray': '3 4' }, svg); } });
      // regla
      var ticks = TP.niceTicks(lo, hi, false), ty = base + 8; svgEl('line', { x1: m.l, x2: W - m.r, y1: base, y2: base, class: 'axis' }, svg);
      ticks.forEach(function (t) { var x = X(t); if (x < m.l - 1 || x > W - m.r + 1) return; svgEl('line', { x1: x, x2: x, y1: base, y2: base + 6, class: 'axis' }, svg); svgEl('text', { x: x, y: base + 20, 'text-anchor': 'middle' }, svg).textContent = TP.num(t, t < 100 ? 1 : 0); });
      svgEl('text', { x: W - m.r, y: H - 6, 'text-anchor': 'end' }, svg).textContent = 'longitud de onda (nm)';
      // región activa
      var rl = [[Math.max(lo, 0), Math.min(hi, 380), 'Ultravioleta'], [Math.max(lo, 380), Math.min(hi, 780), 'Visible'], [Math.max(lo, 780), hi, 'Infrarrojo']];
      rl.forEach(function (x) { if (x[1] - x[0] > (hi - lo) * .12) svgEl('text', { x: (X(x[0]) + X(x[1])) / 2, y: m.t - 34, 'text-anchor': 'middle', style: 'fill:var(--fg-3)' }, svg).textContent = x[2]; });
      var L = lines(), inwin = 0, lim = limit();
      if (lim >= lo && lim <= hi) { svgEl('line', { x1: X(lim), x2: X(lim), y1: m.t + 8, y2: base, stroke: '#fff', 'stroke-dasharray': '2 4', opacity: .6 }, svg); if (X(lim) - m.l > 56) svgEl('text', { x: X(lim) + 4, y: m.t + 20, style: 'fill:var(--fg-2)' }, svg).textContent = 'límite'; }
      L.forEach(function (l) {
        if (l.wl < lo || l.wl > hi) return; inwin++;
        var x = X(l.wl), sel = l.n2 === rs.n2, c = col(l.wl);
        svgEl('line', { x1: x, x2: x, y1: sel ? m.t - 4 : m.t + 10, y2: base, stroke: c, 'stroke-width': sel ? 3.5 : 2, 'stroke-linecap': 'round' }, svg);
        var prevX = null;
        if (sel) { var tl = svgEl('text', { x: Math.min(W - 70, Math.max(70, x)), y: m.t - 12, 'text-anchor': 'middle', style: 'fill:var(--fg);font-weight:600;font-size:12px' }, svg); tl.textContent = 'n = ' + l.n2 + ' a ' + rs.n1 + ', ' + fw(l.wl); }
        var hit = svgEl('rect', { x: x - 7, y: m.t, width: 14, height: base - m.t, fill: 'transparent', stroke: 'none', style: 'cursor:pointer' }, svg);
        hit.addEventListener('click', function () { select(l.n2); });
        hit.addEventListener('pointerenter', function () { var rr = hit.getBoundingClientRect(), hh = host.getBoundingClientRect(); tip.innerHTML = '<b>n = ' + l.n2 + ' a ' + rs.n1 + '</b><br><span>' + fw(l.wl) + ', ' + TP.num(l.ev, 3) + ' eV</span>'; tip.style.left = Math.max(60, Math.min(hh.width - 60, rr.left + rr.width / 2 - hh.left)) + 'px'; tip.style.top = (rr.top - hh.top + 24) + 'px'; tip.dataset.on = 'true'; });
        hit.addEventListener('pointerleave', function () { tip.dataset.on = 'false'; });
      });
      // etiquetas n2 bajo la línea cuando hay espacio
      var lastX = -99; L.forEach(function (l) { if (l.wl < lo || l.wl > hi) return; var x = X(l.wl); if (x - lastX >= 22 && l.n2 !== rs.n2) { svgEl('text', { x: x, y: base - 6, 'text-anchor': 'middle', style: 'fill:var(--fg-3);font-size:10px' }, svg).textContent = l.n2; lastX = x; } else if (l.n2 === rs.n2) lastX = x; });
      host.insertBefore(svg, tip);
      $('#rleg', p).innerHTML = '<span><i style="--c:#b9acff"></i>ultravioleta</span><span><i style="--c:#7ad9a0"></i>visible (color real)</span><span><i style="--c:#ff9f87"></i>infrarrojo</span><span>' + inwin + ' de ' + NL + ' líneas en la ventana (' + TP.num(lo, 0) + ' a ' + TP.num(hi, 0) + ' nm)</span>';
      var vis = L.filter(function (l) { return l.wl >= lo && l.wl <= hi; }).map(function (l) { return X(l.wl); }).sort(function (a, b) { return a - b; }), crowded = false;
      for (i = 1; i < vis.length; i++) if (vis[i] - vis[i - 1] < 6) crowded = true;
      if (crowded && rs.mode !== 'zoom') { var gz = document.createElement('button'); gz.type = 'button'; gz.className = 'pill'; gz.textContent = 'Líneas muy juntas: ampliar'; gz.addEventListener('click', function () { rs.mode = 'zoom'; modeBtns(); drawSpec(); }); $('#rleg', p).appendChild(gz); }
      $('#rzo', p).textContent = TP.num(hi - lo, 0) + ' nm';
    }
    function modeBtns() { $$('#rmode button', p).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.m === rs.mode ? 'true' : 'false'); }); $('#rzw', p).hidden = rs.mode !== 'zoom'; }
    function full() { fillSel(); info(); tab(); modeBtns(); drawLev(); drawSpec(); }
    rz.addEventListener('change', function () { rs.z = +rz.value; full(); });
    r1.addEventListener('change', function () { rs.n1 = +r1.value; rs.n2 = rs.n1 + 1; full(); });
    r2.addEventListener('change', function () { select(+r2.value); });
    $('#rmode', p).addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b) return; rs.mode = b.dataset.m; modeBtns(); drawSpec(); });
    $('#rzr', p).addEventListener('input', function (ev) { rs.zoom = +ev.target.value; drawSpec(); });
    $('#rtab tbody', p).addEventListener('click', function (ev) { var tr = ev.target.closest('tr[data-n]'); if (tr) select(+tr.dataset.n); });
    $('#rtab tbody', p).addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { var tr = ev.target.closest('tr[data-n]'); if (tr) select(+tr.dataset.n); } });
    var rzT; window.addEventListener('resize', function () { clearTimeout(rzT); rzT = setTimeout(function () { if (p.isConnected && p.offsetParent) { drawLev(); drawSpec(); } }, 150); });
    full();
    if (window.ResizeObserver) new ResizeObserver(function () { if (p.offsetParent) { drawLev(); drawSpec(); } }).observe($('#rspec', p));
  }

  /* ---------- carga efectiva ---------- */
  function zeff(p) {
    p.innerHTML =
      '<section class="card"><div class="bar"><label class="sel"><select id="sl1" aria-label="Elemento">' + opt(+TP.store.get('atomZ', 26)) + '</select></label><label class="sel"><select id="sl2" aria-label="Subcapa"></select></label></div>' +
      '<div id="zhead"></div><div id="zbar"></div></section>' +
      '<div class="grid2 eq"><section class="card"><h2 class="sec">Cómo se calcula</h2><div id="slout"></div></section>' +
      '<section class="card"><h2 class="sec">Reglas de Slater</h2>' + TP.F('Z^{*}=Z-\\sigma') + '<div class="tscroll"><table class="t"><thead><tr><th>Electrón</th><th class="n">Mismo grupo</th><th class="n">Capa n − 1</th><th class="n">Capas internas</th></tr></thead><tbody><tr><td>ns, np</td><td class="n">0,35</td><td class="n">0,85</td><td class="n">1,00</td></tr><tr><td>nd, nf</td><td class="n">0,35</td><td class="n" colspan="2">1,00 todo lo que está a la izquierda</td></tr></tbody></table></div><p class="prose" style="margin-top:12px">En 1s el mismo grupo apantalla 0,30. Los grupos son (1s)(2s,2p)(3s,3p)(3d)(4s,4p)(4d)(4f)(5s,5p)…, y los de la derecha no apantallan.</p></section></div>' +
      '<section class="card"><div class="card-h"><h2 class="sec">Z* del electrón externo en la tabla</h2><div class="seg" id="zv" role="group" aria-label="Vista"><button type="button" data-v="z">Por Z</button><button type="button" data-v="g">Por grupo</button></div></div><div class="chart" id="zc"><div class="tip"></div></div><div class="leg2" id="zleg"></div></section>';
    var view = 'z', COL = { same: '#e3a857', n1: '#79a6e4', inner: '#71717a' };
    function subs() {
      var e = E[+$('#sl1', p).value - 1], s = e.cfg.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }), sel = $('#sl2', p);
      sel.innerHTML = s.map(function (x) { return '<option value="' + x[0] + ',' + x[1] + '">Subcapa ' + x[0] + TP.LET[x[1]] + '</option>'; }).join('');
      var top = e.slater.target; sel.value = top[0] + ',' + top[1]; TP.store.set('atomZ', e.z); render();
    }
    function kind(d, t) { return d.k === (t[0] * 10 + (t[1] <= 1 ? 0 : t[1])) ? 'same' : (d.w >= 1 ? 'inner' : 'n1'); }
    function render() {
      var e = E[+$('#sl1', p).value - 1], t = $('#sl2', p).value.split(',').map(Number), r = TP.slater(e.cfg, t), nm = t[0] + TP.LET[t[1]], zs = e.z - r.sigma;
      var segs = r.details.map(function (d) { var lab = d.k % 10 === 0 ? (d.n === 1 ? '1s' : d.n + 's, ' + d.n + 'p') : d.n + TP.LET[d.k % 10], tp = d.w < .9 && d.w !== .85 ? 'same' : d.w === .85 ? 'n1' : 'inner'; return { lab: '(' + lab + ')', v: d.cnt * d.w, cnt: d.cnt, w: d.w, tp: tp }; });
      $('#zhead', p).innerHTML = '<div class="zstat"><div><dt>Carga nuclear Z</dt><dd>' + e.z + '</dd></div><div><dt>Apantallamiento σ</dt><dd>' + TP.num(r.sigma, 2) + '</dd></div><div class="hi"><dt>Z* de ' + nm + '</dt><dd>' + TP.num(zs, 2) + '</dd></div><div><dt>Porcentaje que llega</dt><dd>' + TP.num(zs / e.z * 100, 0) + ' %</dd></div></div>';
      var tot = e.z, bar = segs.map(function (s) { return '<span class="zs ' + s.tp + '" style="flex:' + s.v + '" title="' + s.lab + ': ' + s.cnt + ' × ' + TP.num(s.w, 2) + ' = ' + TP.num(s.v, 2) + '">' + (s.v / tot > .07 ? TP.num(s.v, 1) : '') + '</span>'; }).join('') + '<span class="zs eff" style="flex:' + zs + '" title="Z* = ' + TP.num(zs, 2) + '">' + (zs / tot > .07 ? 'Z* ' + TP.num(zs, 2) : '') + '</span>';
      $('#zbar', p).innerHTML = '<div class="zbarw" role="img" aria-label="Z se reparte entre apantallamiento y carga efectiva"><div class="zbar">' + bar + '</div></div><div class="leg2"><span><i style="--c:' + COL.same + '"></i>mismo grupo</span><span><i style="--c:' + COL.n1 + '"></i>capa n − 1</span><span><i style="--c:' + COL.inner + '"></i>capas internas</span><span><i style="--c:#ff6b4a"></i>carga efectiva Z*</span></div>';
      var rows = segs.map(function (s) { return '<tr><td class="mono">' + s.lab + '</td><td class="n">' + s.cnt + '</td><td class="n">× ' + TP.num(s.w, 2) + '</td><td class="n">' + TP.num(s.v, 2) + '</td></tr>'; }).join('');
      $('#slout', p).innerHTML = '<div class="tscroll"><table class="t"><thead><tr><th>Grupo que apantalla</th><th class="n">Electrones</th><th class="n">Factor</th><th class="n">σ</th></tr></thead><tbody>' + rows + '<tr><td colspan="3"><strong>σ total</strong></td><td class="n">' + TP.num(r.sigma, 2) + '</td></tr></tbody></table></div>' + TP.F('Z^{*}_{' + nm + '}=' + e.z + '-' + TP.tn(r.sigma, 2) + '=' + TP.tn(zs, 2));
      chart(e);
    }
    function chart(e) {
      var host = $('#zc', p); host.innerHTML = '<div class="tip"></div>'; $$('#zv button', p).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === view ? 'true' : 'false'); });
      if (view === 'z') TP.lineChart(host, 'zeff', e.z); else TP.groupChart(host, 'zeff', e.z);
      $('#zleg', p).innerHTML = '<span><i style="--c:#fff"></i>elemento elegido: ' + e.name + ', Z* = ' + TP.num(e.zeff, 2) + '</span>' + (view === 'g' ? '<span>cada línea es un periodo</span>' : TP.catSpans());
    }
    $('#sl1', p).addEventListener('change', subs); $('#sl2', p).addEventListener('change', render);
    $('#zv', p).addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b) return; view = b.dataset.v; chart(E[+$('#sl1', p).value - 1]); });
    subs();
  }

  /* ---------- fórmulas ---------- */
  function formulas(p) {
    var R = [['Capa y subcapa', 'e^-_{\\text{capa}}=2n^2,\\quad e^-_{\\text{subcapa}}=2(2\\ell+1)'], ['Nodos', '\\text{radiales}=n-\\ell-1,\\quad\\text{angulares}=\\ell'], ['Carga nuclear efectiva', 'Z^{*}=Z-\\sigma'], ['Valores de n* (Slater)', 'n=1,2,3,4,5,6\\ \\Rightarrow\\ n^{*}=1,\\,2,\\,3,\\,3{,}7,\\,4{,}0,\\,4{,}2'], ['Radio estimado', 'r\\approx 52{,}9\\ \\text{pm}\\cdot\\dfrac{n^{*2}}{Z^{*}}'], ['Energía de Bohr', 'E_n=-13{,}6\\ \\text{eV}\\cdot\\dfrac{Z^2}{n^2}'], ['Radio de Bohr', 'r_n=52{,}9\\ \\text{pm}\\cdot\\dfrac{n^2}{Z}'], ['Rydberg', '\\dfrac{1}{\\lambda}=R_H Z^2\\left(\\dfrac{1}{n_1^2}-\\dfrac{1}{n_2^2}\\right)'], ['Fotón', 'E=h\\nu=\\dfrac{hc}{\\lambda}'], ['De Broglie', '\\lambda=\\dfrac{h}{m v}'], ['Incertidumbre', '\\Delta x\\,\\Delta p\\ \\ge\\ \\dfrac{\\hbar}{2}'], ['Moseley (Kα)', 'E_{K\\alpha}\\approx 10{,}2\\ \\text{eV}\\,(Z-1)^2'], ['Mulliken', '\\chi=\\dfrac{EI+AE}{2}'], ['Pauling', '\\Delta\\chi=\\sqrt{E_{AB}-\\sqrt{E_{AA}\\,E_{BB}}}\\ \\ (\\text{eV})'], ['% de carácter iónico', '100\\left(1-e^{-\\Delta\\chi^{2}/4}\\right)'], ['Carga formal', 'CF=e^-_{\\text{valencia}}-e^-_{\\text{no enlazantes}}-\\text{enlaces}'], ['Orden de enlace (OM)', 'OE=\\dfrac{e^-_{\\text{enlazantes}}-e^-_{\\text{antienlazantes}}}{2}'], ['Momento magnético', '\\mu=\\sqrt{n(n+2)}\\ \\mu_B'], ['Gas real (van der Waals)', '\\left(P+\\dfrac{a\\,n^2}{V^2}\\right)(V-n b)=n R T'], ['Fuerza de London', 'U\\propto -\\dfrac{\\alpha^2}{r^6}']];
    p.innerHTML = '<section class="card"><div class="tscroll"><table class="t"><thead><tr><th>Tema</th><th>Fórmula</th></tr></thead><tbody>' + R.map(function (r) { return '<tr><td>' + r[0] + '</td><td class="tx">' + TP.tex(r[1]) + '</td></tr>'; }).join('') + '</tbody></table></div></section>';
  }

  TP.init.atomo = function (p, sub) {
    TP.views(p, 'atomo', [
      { id: 'modelos', label: 'Modelos', render: modelos },
      { id: 'config', label: 'Configuración', render: config },
      { id: 'espectro', label: 'Espectro', render: espectro },
      { id: 'zeff', label: 'Carga efectiva', render: zeff },
      { id: 'formulas', label: 'Fórmulas', render: formulas }
    ], sub);
  };
})();
