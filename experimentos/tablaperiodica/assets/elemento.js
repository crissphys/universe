/* Tabla periódica · ficha de un elemento (/experimentos/tablaperiodica/elemento/<nombre>) */
(function () {
  var TP = window.TP, E = TP.E, BASE = TP.BASE, $ = TP.$, $$ = TP.$$, esc = TP.esc, svgEl = TP.svgEl;
  var main = $('#main');
  /* el buscador de la ficha lleva a la página principal */
  TP.go = function (t) { location.href = BASE + '#' + t; };
  TP.gotoTrend = function (k) { TP.store.set('prop', k); location.href = BASE + '#graficos'; };
  TP.tableMode = function (m, f) { TP.store.set('mode', m); TP.store.set('filter', f || ''); location.href = BASE; };

  var m = location.pathname.match(/\/elemento\/([^\/?#]+)/), slug = m ? decodeURIComponent(m[1]).toLowerCase() : (new URLSearchParams(location.search).get('e') || '').toLowerCase();
  slug = TP.slugify(slug) || slug;
  var e = TP.bySlug[slug] || TP.bySym[slug.charAt(0).toUpperCase() + slug.slice(1)] || (/^\d+$/.test(slug) ? E[+slug - 1] : null);
  if (!e) {
    document.title = 'Elemento no encontrado | Tabla periódica';
    main.innerHTML = '<div id="search" class="searchbox"></div><section class="head"><h1>Elemento no encontrado</h1><p class="meta"><a href="' + BASE + '">Volver a la tabla periódica</a></p></section>';
    TP.mountSearch($('#search')); return;
  }
  var cat = TP.CAT[e.cat], CRYS = { bcc: 'Cúbica centrada en el cuerpo', fcc: 'Cúbica centrada en las caras', hcp: 'Hexagonal compacta', dhcp: 'Hexagonal compacta doble', hex: 'Hexagonal', cub: 'Cúbica', ort: 'Ortorrómbica', tet: 'Tetragonal', rom: 'Romboédrica', mon: 'Monoclínica', dia: 'Cúbica tipo diamante' };
  var STN = { s: 'Sólido', l: 'Líquido', g: 'Gas', u: 'Desconocido' };
  var unit = TP.store.get('unit', 'K');

  document.title = e.name + ' (' + e.sym + '), elemento ' + e.z + ' | Tabla periódica | Universe to Study';
  function setMeta(sel, attr, v) { var n = $(sel); if (n) n.setAttribute(attr, v); }
  setMeta('meta[name="description"]', 'content', e.name + ' (' + e.sym + '), elemento ' + e.z + ': ' + cat.n.toLowerCase() + ', masa ' + TP.num(e.mass) + ' u, configuración ' + e.cfgShort + '. Propiedades, energía de ionización, Bohr, orbitales, descubrimiento y usos.');
  setMeta('meta[property="og:title"]', 'content', document.title);
  setMeta('link[rel="canonical"]', 'href', 'https://universetostudy.com' + TP.url(e));

  function rank(k) {
    var vals = E.map(function (x) { return TP.val(x, k); }).filter(function (v) { return v != null; }).sort(function (a, b) { return b - a; });
    var v = TP.val(e, k); if (v == null) return null;
    return { pos: vals.indexOf(v) + 1, n: vals.length, t: TP.range(k).t(v) };
  }
  /* temperatura que cambia de unidad sin recargar */
  function tv(K) { return K == null ? 'n/d' : '<span class="tk" data-k="' + K + '">' + TP.temp(K, unit) + '</span>'; }
  function fmtV(k) { var p = TP.prop(k), v = TP.val(e, k); if (v == null) return 'n/d'; if (p.temp) return tv(v); return TP.fmtProp(e, p, unit); }
  function row(label, value, k) {
    var r = k ? rank(k) : null;
    return '<tr><td>' + label + '</td><td class="n">' + value + '</td><td class="rk">' + (r ? '<span class="rb" title="Puesto ' + r.pos + ' de ' + r.n + '"><i style="width:' + Math.max(3, r.t * 100).toFixed(1) + '%"></i></span><small>' + r.pos + '/' + r.n + '</small>' : '') + '</td></tr>';
  }
  var prev = E[e.z - 2], next = E[e.z], stNow = TP.stateAt(e, 298);

  var sl = e.slater, nS = sl.nstar, zs = e.zeff, outerN = sl.target[0];
  var kalpha = e.z > 1 ? 10.2 * Math.pow(e.z - 1, 2) : null, rEst = 52.9177 * nS * nS / zs, eaEV = e.ea != null ? e.ea / 96.485 : null, iek = TP.IE[e.z];
  var ml = function (v) { return (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v); };

  var h = '';
  h += '<div id="search" class="searchbox"></div>';
  h += '<nav class="crumb" aria-label="Ruta"><a href="' + BASE + '">← Tabla periódica</a><span class="pn">' +
    (prev ? '<a href="' + TP.url(prev) + '" aria-label="Elemento anterior: ' + prev.name + '">‹ ' + prev.sym + '</a>' : '') +
    (next ? '<a href="' + TP.url(next) + '" aria-label="Elemento siguiente: ' + next.name + '">' + next.sym + ' ›</a>' : '') + '</span></nav>';
  h += '<section class="fh1" style="--c:' + cat.c + '"><div class="tile"><i>' + e.z + '</i><b>' + e.sym + '</b><small>' + TP.num(e.mass) + ' u</small></div>' +
    '<div><h1>' + e.name + '</h1><div class="chips" style="margin-top:12px"><span class="tag"><span class="dot"></span>' + cat.n + '</span>' + (e.group ? '<span class="tag">Grupo ' + e.group + '</span>' : '') + '<span class="tag">Periodo ' + e.period + '</span><span class="tag">Bloque ' + e.block + '</span><span class="tag">' + STN[stNow] + ' a 25 °C</span>' + (e.pred ? '<span class="tag on">Propiedades predichas</span>' : '') + '</div></div></section>';

  h += '<div class="grid2" id="top"><div class="card" id="foto"><div class="photo" id="photo"><span class="ph-sym">' + e.sym + '</span></div><p class="cap" id="photocap"></p><div class="thumbs" id="thumbs"></div></div>' +
    '<div class="facts"><div><dt>Masa atómica</dt><dd>' + TP.num(e.mass, 3) + ' u</dd></div><div><dt>Configuración</dt><dd>' + e.cfgShort + '</dd></div><div><dt>Electronegatividad</dt><dd>' + TP.num(e.en, 2) + '</dd></div><div><dt>Energía de ionización</dt><dd>' + TP.num(e.ie, 1) + ' kJ/mol</dd></div><div><dt>Punto de fusión</dt><dd>' + tv(e.mp) + '</dd></div><div><dt>Punto de ebullición</dt><dd>' + tv(e.bp) + '</dd></div></div></div>';

  h += '<nav class="jump" aria-label="Secciones"><a href="#modelos">Bohr</a><a href="#orbitales">Orbitales</a><a href="#propiedades">Propiedades</a><a href="#energias">Energías</a><a href="#descubrimiento">Descubrimiento</a><a href="#quimica">Química</a><a href="#familia">Grupo y periodo</a></nav>';

  h += '<section class="card" id="modelos"><h2 class="sec">Modelo de Bohr</h2><div class="grid2 eq"><div><div id="bohr" class="bohr"></div><p class="cap" style="text-align:center">' + e.z + ' protones, ' + e.neutrons + ' neutrones (A = ' + e.iso + '), ' + e.z + ' electrones</p></div>' +
    '<div><dl class="kv"><dt>Electrones por capa</dt><dd>' + e.shells.join(', ') + '</dd><dt>' + (e.block === 'd' ? 'Electrones s + d' : 'Electrones de valencia') + '</dt><dd>' + e.valence + '</dd><dt>Desapareados</dt><dd>' + e.unpaired + '</dd><dt>Magnetismo del átomo</dt><dd>' + (e.unpaired ? 'Paramagnético' : 'Diamagnético') + '</dd><dt>Último electrón (n, ℓ, mℓ, ms)</dt><dd>' + e.last.n + ', ' + e.last.l + ', ' + ml(e.last.ml) + ', ' + (e.last.ms > 0 ? '+½' : '−½') + '</dd></dl>' +
    '<h3 class="sub">Diagrama de orbitales</h3>' + TP.orbDiagram(e) + '</div></div></section>';

  h += '<section class="card" id="orbitales"><h2 class="sec">Orbitales de Schrödinger</h2><div class="grid2 eq"><div id="orb3d"></div><div><div class="chips" id="subs" role="group" aria-label="Subcapas ocupadas"></div>' +
    '<div class="row-ctl"><label class="sel"><select id="om" aria-label="Orientación del orbital"></select></label><button type="button" class="pill" id="cut" aria-pressed="false">Corte</button><button type="button" class="pill" id="spin" aria-pressed="true">Girar</button></div>' +
    '<dl class="kv" id="orbinfo"></dl><div class="leg2"><span><i style="--c:#ff6b4a"></i>ψ positiva</span><span><i style="--c:#79a6e4"></i>ψ negativa</span></div></div></div></section>';

  var RADII = [['Radio de van der Waals', e.rvdw, '#79a6e4'], ['Radio atómico', e.rat, '#e3a857'], ['Radio covalente', e.rcov, '#ff6b4a']].filter(function (r) { return r[1] != null; }).sort(function (a, b) { return b[1] - a[1]; });
  if (RADII.length) {
    var R0 = RADII[0][1], rs = RADII.map(function (r, i) { return '<circle cx="150" cy="130" r="' + (r[1] / R0 * 112).toFixed(1) + '" fill="' + r[2] + '" fill-opacity="' + (.16 + i * .1) + '" stroke="' + r[2] + '" stroke-width="1.6"/>'; }).join('');
    h += '<section class="card" id="tamano"><h2 class="sec">Tamaño del átomo</h2><div class="grid2 eq"><div class="vsvg"><svg viewBox="0 0 300 260" role="img" aria-label="Radios de ' + e.name + '" style="fill:none">' + rs + '<circle cx="150" cy="130" r="2.6" fill="#fff"/></svg></div><div><dl class="kv">' +
      RADII.map(function (r) { return '<dt><span class="sw" style="background:' + r[2] + '"></span>' + r[0] + '</dt><dd>' + TP.num(r[1], 0) + ' pm</dd>'; }).join('') + (e.rvdw && e.rcov ? '<dt>Relación van der Waals / covalente</dt><dd>' + TP.num(e.rvdw / e.rcov, 2) + '</dd><dt>Distancia de contacto sin enlace</dt><dd>' + TP.num(2 * e.rvdw, 0) + ' pm</dd><dt>Distancia de enlace</dt><dd>' + TP.num(2 * e.rcov, 0) + ' pm</dd>' : '') + '</dl></div></div></section>';
  }

  var PR = [];
  PR.push('<tr class="gr"><td colspan="3">Generales</td></tr>', row('Número atómico', e.z), row('Masa atómica', TP.num(e.mass, 3) + ' u', 'mass'), row('Configuración', e.cfgShort), row('Categoría', cat.n), row('Grupo', e.group || 'bloque f'), row('Periodo', e.period), row('Bloque', e.block), row('Estado a 25 °C', STN[stNow]));
  if (e.cr) PR.push(row('Estructura cristalina', CRYS[e.cr]));
  PR.push('<tr class="gr"><td colspan="3">Atómicas</td></tr>', row('Radio atómico', fmtV('rat'), 'rat'), row('Radio covalente', fmtV('rcov'), 'rcov'), row('Radio de van der Waals', fmtV('rvdw'), 'rvdw'), row('Carga nuclear efectiva (Slater)', fmtV('zeff'), 'zeff'), row('Estados de oxidación', e.ox));
  PR.push('<tr class="gr"><td colspan="3">Energéticas</td></tr>', row('Electronegatividad (Pauling)', fmtV('en'), 'en'), row('Electronegatividad (Mulliken)', fmtV('mull'), 'mull'), row('Energía de ionización (1.ª)', fmtV('ie'), 'ie'), row('Afinidad electrónica', fmtV('ea'), 'ea'));
  PR.push('<tr class="gr"><td colspan="3">Físicas</td></tr>', row('Densidad', fmtV('dens'), 'dens'), row('Punto de fusión', fmtV('mp'), 'mp'), row('Punto de ebullición', fmtV('bp'), 'bp'), row('Calor específico', fmtV('cp'), 'cp'), row('Conductividad térmica', fmtV('k'), 'k'));
  if (e.dens != null && e.st !== 'g') PR.push(row('Volumen molar', TP.num(e.mass / e.dens, 2) + ' cm³/mol'));
  h += '<section class="card" id="propiedades"><div class="card-h"><h2 class="sec">Propiedades</h2><div class="seg" id="uni" role="group" aria-label="Unidad de temperatura"><button type="button" data-u="K">K</button><button type="button" data-u="C">°C</button><button type="button" data-u="F">°F</button></div></div><div class="tscroll"><table class="t props"><thead><tr><th>Propiedad</th><th class="n">Valor</th><th>Puesto entre los elementos</th></tr></thead><tbody>' + PR.join('') + '</tbody></table></div></section>';

  var EN = '<div class="grid2 eq"><div><h3>Energía de ionización</h3>' + TP.F('X(g)+EI_1\\longrightarrow X^{+}(g)+e^-') + '<dl class="kv"><dt>Experimental</dt><dd>' + TP.num(e.ie, 1) + ' kJ/mol (' + TP.num(e.ie / 96.485, 2) + ' eV)</dd></dl>' +
    '<h4>Carga nuclear efectiva (Slater)</h4>' + TP.F('Z^{*}=Z-\\sigma') + '<dl class="kv"><dt>σ de apantallamiento</dt><dd>' + TP.num(sl.sigma, 2) + '</dd><dt>Z*</dt><dd>' + e.z + ' − ' + TP.num(sl.sigma, 2) + ' = ' + TP.num(zs, 2) + '</dd><dt>n* (capa ' + outerN + ')</dt><dd>' + TP.num(nS, 1) + '</dd></dl></div>' +
    '<div><h3>Afinidad electrónica</h3>' + TP.F('X(g)+e^-\\longrightarrow X^{-}(g)+AE') + '<dl class="kv"><dt>AE</dt><dd>' + (e.ea != null ? TP.num(e.ea, 1) + ' kJ/mol (' + TP.num(eaEV, 3) + ' eV)' : 'sin anión estable') + '</dd></dl>' +
    '<h3 class="sub2">Electronegatividad</h3>' + TP.F('\\chi_{\\text{Mulliken}}=\\dfrac{EI+AE}{2}') + '<dl class="kv"><dt>Mulliken</dt><dd>' + (e.mull != null ? TP.num(e.mull, 2) + ' eV' : 'n/d') + '</dd><dt>Pauling</dt><dd>' + TP.num(e.en, 2) + '</dd></dl></div></div>' +
    '<div class="grid2 eq" style="margin-top:22px"><div><h3>Energía de Bohr</h3>' + TP.F('E_n=-13{,}6\\ \\text{eV}\\cdot\\dfrac{Z^2}{n^2}') + '<dl class="kv"><dt>Electrón 1s sin apantallar</dt><dd>' + TP.num(-13.6057 * e.z * e.z, 0) + ' eV</dd>' + (kalpha ? '<dt>Línea Kα (Moseley)</dt><dd>' + TP.num(kalpha, 0) + ' eV</dd>' : '') + '</dl></div>' +
    '<div><h3>Tamaño estimado</h3>' + TP.F('r\\approx 52{,}9\\ \\text{pm}\\cdot\\dfrac{n^{*2}}{Z^{*}}') + '<dl class="kv"><dt>Estimado</dt><dd>' + TP.num(rEst, 0) + ' pm</dd><dt>Radio atómico medido</dt><dd>' + fmtV('rat') + '</dd></dl></div></div>';
  if (iek) EN += '<h3 class="sub2" style="margin-top:24px">Energías de ionización sucesivas</h3><div class="chart" id="iek"></div><div class="leg2"><span><i style="--c:#ff6b4a"></i>electrones de valencia</span><span><i style="--c:#79a6e4"></i>electrones internos</span><span>escala logarítmica</span></div>';
  h += '<section class="card" id="energias"><h2 class="sec">Energías y fórmulas</h2>' + EN + '</section>';

  var yr = e.year, pos = yr ? Math.max(0, Math.min(1, (yr - 1600) / (2025 - 1600))) : 0, same = yr ? E.filter(function (x) { return x.year === yr && x !== e; }) : [];
  h += '<section class="card" id="descubrimiento"><h2 class="sec">Descubrimiento</h2><div class="grid2 eq"><div><p class="big-year">' + (yr || 'Antigüedad') + '</p><p class="who">' + esc(e.who) + '</p><div class="tl" aria-hidden="true"><i style="left:' + (yr ? (pos * 100).toFixed(1) + '%' : '0%') + '"></i><span>1600</span><span>2025</span></div>' +
    (same.length ? '<p class="cap">Mismo año: ' + same.map(function (x) { return '<a href="' + TP.url(x) + '">' + x.name + '</a>'; }).join(', ') + '</p>' : '') + '</div>' +
    '<div class="prose"><p>' + esc(e.story) + '</p><p><strong>Nombre.</strong> ' + esc(e.etym) + '</p></div></div></section>';

  var tr = e.block === 'd' || e.block === 'f';
  h += '<section class="card" id="quimica"><h2 class="sec">Química y usos</h2><div class="grid2 eq"><div class="lw1"><div class="lewis-s">' + TP.lewisDot(e.sym, tr ? Math.min(2, e.valence) : e.valence, 130) + '</div><p class="cap">' + (tr ? 'Se muestran los electrones s; los d también participan en el enlace.' : e.valence + ' electrones de valencia' + (e.valence === 8 || e.z === 2 ? ', capa completa.' : '.')) + '</p></div>' +
    '<div><h3>Estados de oxidación</h3><div class="chips">' + e.ox.split(', ').map(function (o) { return '<span class="tag mono">' + o + '</span>'; }).join('') + '</div><h3 class="sub2">Usos</h3><p class="prose">' + esc(e.uses) + '</p></div></div></section>';

  function tbl(arr) {
    return '<div class="tscroll"><table class="t"><thead><tr><th>Z</th><th>Elemento</th><th class="n">χ</th><th class="n">EI₁ (kJ/mol)</th><th class="n">r covalente (pm)</th></tr></thead><tbody>' +
      arr.map(function (x) { return '<tr' + (x === e ? ' class="me"' : '') + '><td class="mono">' + x.z + '</td><td><a href="' + TP.url(x) + '">' + x.name + '</a> <span class="mono sub2">' + x.sym + '</span></td><td class="n">' + TP.num(x.en, 2) + '</td><td class="n">' + TP.num(x.ie, 0) + '</td><td class="n">' + TP.num(x.rcov, 0) + '</td></tr>'; }).join('') + '</tbody></table></div>';
  }
  var grp = e.group ? E.filter(function (x) { return x.group === e.group; }) : E.filter(function (x) { return x.block === 'f' && x.period === e.period; });
  var per = E.filter(function (x) { return x.period === e.period && x.block !== 'f'; });
  h += '<section class="card" id="familia"><div class="card-h"><h2 class="sec">Grupo y periodo</h2><div class="seg" id="gp" role="group" aria-label="Comparar con"><button type="button" data-g="g">' + (e.group ? 'Grupo ' + e.group : e.period === 6 ? 'Lantánidos' : 'Actínidos') + '</button><button type="button" data-g="p">Periodo ' + e.period + '</button></div></div><div id="tg">' + tbl(grp) + '</div><div id="tp" hidden>' + tbl(per) + '</div></section>';
  h += '<p class="src">Datos de IUPAC, NIST, CRC Handbook y OpenStax. <a href="/correcciones">Reportar un error</a></p>';
  main.innerHTML = h; main.removeAttribute('aria-live');
  TP.mountSearch($('#search'));

  /* ---------- interacción ---------- */
  function setUnit(u) { unit = u; TP.store.set('unit', u); $$('#uni button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.u === u ? 'true' : 'false'); }); $$('.tk').forEach(function (n) { n.textContent = TP.temp(+n.dataset.k, u); }); }
  $('#uni').addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (b) setUnit(b.dataset.u); }); setUnit(unit);
  $('#gp').addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b) return; $$('#gp button').forEach(function (n) { n.setAttribute('aria-pressed', n === b ? 'true' : 'false'); }); $('#tg').hidden = b.dataset.g !== 'g'; $('#tp').hidden = b.dataset.g !== 'p'; });
  $$('#gp button')[0].setAttribute('aria-pressed', 'true');

  TP.bohr($('#bohr'), e);
  var viewer = TP.orbViewer($('#orb3d'), { aspect: '1 / 1' }), subs = e.cfg.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }), cur = { n: e.last.n, l: e.last.l, m: 0 };
  function oname(n, l, mm) { return n + TP.ANG[l][mm].n.replace(/_\{([^}]*)\}/, '$1').replace('_', ''); }
  function renderOrb() {
    var Zs = TP.zeffSub(e, cur.n, cur.l), Z = Zs ? Zs.zeff : 1, s = viewer.set(cur.n, cur.l, cur.m, Math.max(.8, Z));
    $$('#subs button').forEach(function (b) { b.setAttribute('aria-pressed', (+b.dataset.n === cur.n && +b.dataset.l === cur.l) ? 'true' : 'false'); });
    var sel = $('#om'); sel.innerHTML = TP.ANG[cur.l].map(function (o, i) { return '<option value="' + i + '">' + oname(cur.n, cur.l, i) + '</option>'; }).join(''); sel.value = cur.m;
    $('#orbinfo').innerHTML = '<dt>Subcapa</dt><dd>' + cur.n + TP.LET[cur.l] + '<sup>' + subs.filter(function (x) { return x[0] === cur.n && x[1] === cur.l; })[0][2] + '</sup></dd><dt>Nodos radiales (n − ℓ − 1)</dt><dd>' + (cur.n - cur.l - 1) + '</dd><dt>Nodos angulares (ℓ)</dt><dd>' + cur.l + '</dd><dt>Z* de Slater</dt><dd>' + TP.num(Z, 2) + '</dd><dt>Radio más probable</dt><dd>' + TP.num(s.rpeak * 52.9177, 0) + ' pm</dd><dt>Radio medio ⟨r⟩</dt><dd>' + TP.num(s.rmean * 52.9177, 0) + ' pm</dd>';
  }
  $('#subs').innerHTML = subs.map(function (x) { return '<button type="button" class="pill" data-n="' + x[0] + '" data-l="' + x[1] + '" aria-pressed="false">' + x[0] + TP.LET[x[1]] + '<sup>' + x[2] + '</sup></button>'; }).join('');
  $('#subs').addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b) return; cur = { n: +b.dataset.n, l: +b.dataset.l, m: 0 }; renderOrb(); });
  $('#om').addEventListener('change', function (ev) { cur.m = +ev.target.value; renderOrb(); });
  $('#cut').addEventListener('click', function (ev) { var on = ev.currentTarget.getAttribute('aria-pressed') !== 'true'; ev.currentTarget.setAttribute('aria-pressed', on); viewer.cut(on); });
  $('#spin').addEventListener('click', function (ev) { var on = ev.currentTarget.getAttribute('aria-pressed') !== 'true'; ev.currentTarget.setAttribute('aria-pressed', viewer.auto(on)); });
  if (TP.reduced()) $('#spin').setAttribute('aria-pressed', 'false');
  renderOrb();

  if (iek) TP.mountChart($('#iek'), function (W) {
    var H = W < 520 ? 240 : 280, mg = { l: W < 520 ? 48 : 58, r: 8, t: 12, b: 30 }, n = iek.length, lo = Math.floor(Math.log10(Math.min.apply(null, iek))), hi = Math.ceil(Math.log10(Math.max.apply(null, iek)));
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-label': 'Energías de ionización sucesivas de ' + e.name }), bw = (W - mg.l - mg.r) / n, i;
    for (i = 0; i <= hi - lo; i++) { var y = H - mg.b - i / (hi - lo) * (H - mg.t - mg.b); svgEl('line', { x1: mg.l, x2: W - mg.r, y1: y, y2: y, class: 'grid' }, svg); svgEl('text', { x: mg.l - 8, y: y + 4, 'text-anchor': 'end' }, svg).textContent = TP.num(Math.pow(10, lo + i), 0); }
    iek.forEach(function (v, j) {
      var hh = (Math.log10(v) - lo) / (hi - lo) * (H - mg.t - mg.b), x = mg.l + j * bw + Math.min(4, bw * .15), core = j >= e.valence && e.block !== 'd';
      var r = svgEl('rect', { x: x, y: H - mg.b - hh, width: Math.max(3, bw - 2 * Math.min(4, bw * .15)), height: hh, rx: 3, fill: core ? '#79a6e4' : '#ff6b4a', 'fill-opacity': .88 }, svg);
      var tt = document.createElementNS('http://www.w3.org/2000/svg', 'title'); tt.textContent = 'EI' + (j + 1) + ' = ' + TP.num(v, 0) + ' kJ/mol'; r.appendChild(tt);
      if (W >= 420 || j % 2 === 0) svgEl('text', { x: x + Math.max(3, bw - 2 * Math.min(4, bw * .15)) / 2, y: H - 10, 'text-anchor': 'middle' }, svg).textContent = j + 1;
    });
    $('#iek').appendChild(svg);
  });

  /* foto y texto desde Wikipedia (es) */
  var capEl = $('#photocap');
  fetch('https://es.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(e.name), { headers: { Accept: 'application/json' } }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (d) {
    var src = d.thumbnail && d.thumbnail.source;
    if (src) { var big = src.replace(/\/\d+px-/, '/500px-'), img = new Image(), tried = false; img.alt = 'Muestra de ' + e.name.toLowerCase(); img.onload = function () { $('#photo').innerHTML = ''; $('#photo').appendChild(img); }; img.onerror = function () { if (!tried) { tried = true; img.src = src; } }; img.src = big; }
    capEl.innerHTML = src ? 'Imagen: <a href="' + (d.content_urls && d.content_urls.desktop ? d.content_urls.desktop.page : 'https://es.wikipedia.org') + '" target="_blank" rel="noopener noreferrer">Wikipedia</a> (CC BY-SA)' : 'Sin imagen disponible.';
  }).catch(function () { capEl.textContent = 'No se pudo cargar la imagen.'; });
  fetch('https://es.wikipedia.org/api/rest_v1/page/media-list/' + encodeURIComponent(e.name)).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
    if (!d || !d.items) return;
    var imgs = d.items.filter(function (it) { return it.type === 'image' && it.srcset && it.srcset.length && !/\.svg/i.test(it.title) && it.showInGallery !== false; }).slice(0, 6);
    $('#thumbs').innerHTML = imgs.map(function (it) { var u = it.srcset[it.srcset.length > 1 ? 1 : 0].src; if (u.indexOf('//') === 0) u = 'https:' + u; return '<a href="https://es.wikipedia.org/wiki/' + encodeURIComponent(it.title) + '" target="_blank" rel="noopener noreferrer"><img src="' + u + '" alt="" loading="lazy"></a>'; }).join('');
  }).catch(function () { });

  var top = $('#totop');
  var tk = false; function updTop() { var y = window.scrollY, mx = document.documentElement.scrollHeight - window.innerHeight; top.classList.toggle('is-on', y > 900); top.tabIndex = y > 900 ? 0 : -1; top.style.setProperty('--p', mx > 0 ? Math.min(1, y / mx).toFixed(4) : 0); tk = false; }
  window.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(updTop); } }, { passive: true }); updTop();
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: TP.reduced() ? 'auto' : 'smooth' }); });
})();
