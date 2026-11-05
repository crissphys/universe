/* Tabla periódica · pestañas "Mendeléyev" y "Meyer" */
(function () {
  var TP = window.TP, E = TP.E, $ = TP.$, $$ = TP.$$, svgEl = TP.svgEl;
  TP.init = TP.init || {};

  function modern(sym) { var e = TP.bySym[sym]; return e ? '<a href="' + TP.url(e) + '">' + e.name + '</a>' : 'n/d'; }

  /* ===================== MENDELÉYEV ===================== */
  /* [símbolo de Mendeléyev, peso atómico que usó, símbolo moderno, tipo]  tipo: 'p' predicho, 'q' dudoso */
  var G = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'], FOR = ['R₂O', 'RO', 'R₂O₃', 'RH₄ · RO₂', 'RH₃ · R₂O₅', 'RH₂ · RO₃', 'RH · R₂O₇', 'RO₄'];
  var MEN = [
    [[['H', 1, 'H']], [], [], [], [], [], [], []],
    [[['Li', 7, 'Li']], [['Be', 9.4, 'Be']], [['B', 11, 'B']], [['C', 12, 'C']], [['N', 14, 'N']], [['O', 16, 'O']], [['F', 19, 'F']], []],
    [[['Na', 23, 'Na']], [['Mg', 24, 'Mg']], [['Al', 27.3, 'Al']], [['Si', 28, 'Si']], [['P', 31, 'P']], [['S', 32, 'S']], [['Cl', 35.5, 'Cl']], []],
    [[['K', 39, 'K']], [['Ca', 40, 'Ca']], [['?', 44, 'Sc', 'p']], [['Ti', 48, 'Ti']], [['V', 51, 'V']], [['Cr', 52, 'Cr']], [['Mn', 55, 'Mn']], [['Fe', 56, 'Fe'], ['Co', 59, 'Co'], ['Ni', 59, 'Ni'], ['Cu', 63, 'Cu']]],
    [[['(Cu)', 63, 'Cu']], [['Zn', 65, 'Zn']], [['?', 68, 'Ga', 'p']], [['?', 72, 'Ge', 'p']], [['As', 75, 'As']], [['Se', 78, 'Se']], [['Br', 80, 'Br']], []],
    [[['Rb', 85, 'Rb']], [['Sr', 87, 'Sr']], [['?Yt', 88, 'Y', 'q']], [['Zr', 90, 'Zr']], [['Nb', 94, 'Nb']], [['Mo', 96, 'Mo']], [['?', 100, 'Tc', 'p']], [['Ru', 104, 'Ru'], ['Rh', 104, 'Rh'], ['Pd', 106, 'Pd'], ['Ag', 108, 'Ag']]],
    [[['(Ag)', 108, 'Ag']], [['Cd', 112, 'Cd']], [['In', 113, 'In']], [['Sn', 118, 'Sn']], [['Sb', 122, 'Sb']], [['Te', 125, 'Te']], [['J', 127, 'I']], []],
    [[['Cs', 133, 'Cs']], [['Ba', 137, 'Ba']], [['?Di', 138, null, 'q']], [['?Ce', 140, 'Ce', 'q']], [], [], [], []],
    [[], [], [], [], [], [], [], []],
    [[], [], [['?Er', 178, null, 'q']], [['?La', 180, null, 'q']], [['Ta', 182, 'Ta']], [['W', 184, 'W']], [], [['Os', 195, 'Os'], ['Ir', 197, 'Ir'], ['Pt', 198, 'Pt'], ['Au', 199, 'Au']]],
    [[['(Au)', 199, 'Au']], [['Hg', 200, 'Hg']], [['Tl', 204, 'Tl']], [['Pb', 207, 'Pb']], [['Bi', 208, 'Bi']], [], [], []],
    [[], [], [], [['Th', 231, 'Th']], [], [['U', 240, 'U']], [], []]
  ];
  var EKA = [
    { n: 'Ekaboro', s: 'Sc', yr: 1879, by: 'Nilson', rows: [['Masa atómica', '44', function (e) { return TP.num(e.mass, 2); }], ['Óxido', 'Eb₂O₃ · densidad 3,5', function () { return 'Sc₂O₃ · densidad 3,86'; }], ['Carácter del óxido', 'básico', function () { return 'básico'; }]] },
    { n: 'Ekaaluminio', s: 'Ga', yr: 1875, by: 'Lecoq de Boisbaudran', rows: [['Masa atómica', '68', function (e) { return TP.num(e.mass, 2); }], ['Densidad (g/cm³)', '5,9', function (e) { return TP.num(e.dens, 2); }], ['Punto de fusión', 'bajo', function (e) { return TP.num(e.mp - 273.15, 1) + ' °C'; }], ['Óxido', 'Ea₂O₃', function () { return 'Ga₂O₃'; }], ['Se obtiene', 'por espectroscopía', function () { return 'por espectroscopía'; }]] },
    { n: 'Ekasilicio', s: 'Ge', yr: 1886, by: 'Winkler', rows: [['Masa atómica', '72', function (e) { return TP.num(e.mass, 2); }], ['Densidad (g/cm³)', '5,5', function (e) { return TP.num(e.dens, 2); }], ['Óxido', 'EsO₂ · densidad 4,7', function () { return 'GeO₂ · densidad 4,70'; }], ['Cloruro', 'EsCl₄ · ebullición < 100 °C', function () { return 'GeCl₄ · ebullición 84 °C'; }], ['Densidad del cloruro', '1,9', function () { return '1,84'; }], ['Compuesto etílico', 'Es(C₂H₅)₄ · ebullición ≈ 160 °C', function () { return 'Ge(C₂H₅)₄ · ebullición 163,5 °C'; }]] }
  ];
  var INV = [['Ar', 'K', 'Los gases nobles se descubrieron después (1894).'], ['Co', 'Ni', 'Mendeléyev los dejó juntos en el grupo VIII.'], ['Te', 'I', 'Los puso por propiedades químicas, aunque Te pesa más que I.'], ['Th', 'Pa', 'Pa aún no se conocía (1913).']];

  /* ===================== MEYER ===================== */
  var MEY = [
    ['Tetravalentes', [['C', 12.0], ['Si', 28.5], ['?', 89.1], ['Sn', 117.6], ['Pb', 207.0]]],
    ['Trivalentes', [['N', 14.4], ['P', 31.0], ['As', 75.0], ['Sb', 120.6], ['Bi', 208.0]]],
    ['Divalentes', [['O', 16.0], ['S', 32.0], ['Se', 78.0], ['Te', 128.3]]],
    ['Monovalentes', [['F', 19.0], ['Cl', 35.46], ['Br', 80.0], ['I', 126.5]]],
    ['Monovalentes (metales)', [['Li', 7.03], ['Na', 23.05], ['K', 39.13], ['Rb', 85.4], ['Cs', 133.0], ['Tl', 204.0]]],
    ['Divalentes (metales)', [['Be', 9.3], ['Mg', 24.0], ['Ca', 40.0], ['Sr', 87.6], ['Ba', 137.1]]]
  ];
  function mendeleevView(p) {
    var wide = MEN.map(function (r, i) {
      return '<tr><th scope="row" class="mono">' + (i + 1) + '</th>' + r.map(function (c, j) {
        return '<td' + (j === 7 ? ' class="g8"' : '') + '><div class="mg">' + c.map(function (x, k) { var cl = x[3] === 'p' ? 'mp' : x[3] === 'q' ? 'mq' : ''; return '<button type="button" class="mcl ' + cl + '" data-i="' + i + '" data-j="' + j + '" data-k="' + k + '" aria-label="' + (x[3] === 'p' ? 'Hueco de peso ' + x[1] : x[0] + ' ' + x[1]) + '"><b>' + (x[3] === 'p' ? '?' : x[0]) + '</b><i>' + x[1] + '</i></button>'; }).join('') + '</div></td>';
      }).join('') + '</tr>';
    }).join('');
    p.innerHTML =
      '<section class="card"><h2 class="sec">Tabla de 1871</h2><div class="grid2"><div class="tscroll"><table class="mt"><thead><tr><th><span class="sr">Serie</span></th>' + G.map(function (g, i) { return '<th scope="col">' + g + '<small>' + FOR[i] + '</small></th>'; }).join('') + '</tr></thead><tbody>' + wide + '</tbody></table></div>' +
      '<div id="mdet" class="mdet"></div></div><div class="leg2"><span><i style="--c:#ff6b4a"></i>hueco para un elemento no descubierto</span><span><i style="--c:#e3a857"></i>identificación dudosa</span></div></section>' +
      '<section class="card"><h2 class="sec">Predicciones y realidad</h2><div class="stack" id="eka"></div></section>';
    var det = $('#mdet', p);
    function pick(i, j, k) {
      var x = MEN[i][j][k], e = x[2] ? TP.bySym[x[2]] : null;
      if (x[3] === 'p') { det.innerHTML = '<h3>Hueco de peso ' + x[1] + '</h3>' + (e ? '<dl class="kv"><dt>Elemento real</dt><dd><a href="' + TP.url(e) + '">' + e.name + ' (' + e.sym + ')</a></dd><dt>Masa real</dt><dd>' + TP.num(e.mass, 2) + ' u</dd><dt>Error de la predicción</dt><dd>' + TP.num(Math.abs(e.mass - x[1]) / e.mass * 100, 1) + ' %</dd></dl>' : ''); return; }
      det.innerHTML = '<h3>' + x[0].replace('?', '') + ' = ' + x[1] + '</h3>' + (e ? '<dl class="kv"><dt>Elemento actual</dt><dd><a href="' + TP.url(e) + '">' + e.name + ' (' + e.sym + ')</a></dd><dt>Masa actual</dt><dd>' + TP.num(e.mass, 2) + ' u</dd><dt>Diferencia</dt><dd>' + TP.num(x[1] - e.mass, 1) + ' u (' + TP.num(Math.abs(x[1] - e.mass) / e.mass * 100, 1) + ' %)</dd><dt>Grupo actual</dt><dd>' + (e.group || 'bloque f') + '</dd><dt>Grupo de Mendeléyev</dt><dd>' + G[j] + '</dd></dl>' : '<p class="prose">Identificación dudosa. ' + (x[0] === '?Di' ? 'El didimio era una mezcla de praseodimio y neodimio.' : x[0] === '?Er' ? 'Valor erróneo: el erbio pesa 167 u.' : x[0] === '?La' ? 'Valor erróneo; el hafnio (178,5 u) ocupa esta zona.' : '') + '</p>');
    }
    $('.mt', p).addEventListener('click', function (ev) { var b = ev.target.closest('.mcl'); if (!b) return; pick(+b.dataset.i, +b.dataset.j, +b.dataset.k); $$('.mcl[aria-pressed]', p).forEach(function (n) { n.removeAttribute('aria-pressed'); }); b.setAttribute('aria-pressed', 'true'); });
    pick(3, 2, 0); $$('.mcl', p).filter(function (b) { return b.dataset.i === '3' && b.dataset.j === '2'; })[0].setAttribute('aria-pressed', 'true');
    $('#eka', p).innerHTML = EKA.map(function (k) {
      var e = TP.bySym[k.s];
      return '<div><h3>' + k.n + ' y ' + '<a href="' + TP.url(e) + '">' + e.name + '</a> <span class="mono sub2">' + k.s + ', ' + k.by + ', ' + k.yr + '</span></h3><div class="tscroll"><table class="t"><thead><tr><th>Propiedad</th><th>Predicción (1871)</th><th>Observado</th></tr></thead><tbody>' + k.rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td class="mono">' + r[1] + '</td><td class="mono">' + r[2](e) + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
    }).join('');
  }

  function meyerView(p) {
    p.innerHTML =
      '<section class="card"><h2 class="sec">Tabla de 1864 (seis familias por valencia)</h2><div class="tscroll"><table class="mt mey"><thead><tr>' + MEY.map(function (f) { return '<th>' + f[0] + '</th>'; }).join('') + '</tr></thead><tbody>' + [0, 1, 2, 3, 4, 5].map(function (r) { return '<tr>' + MEY.map(function (f) { var x = f[1][r]; if (!x) return '<td></td>'; var e = TP.bySym[x[0]]; return '<td>' + (e ? '<a class="mcl" href="' + TP.url(e) + '"><b>' + x[0] + '</b><i>' + x[1] + '</i></a>' : '<span class="mcl mp"><b>?</b><i>' + x[1] + '</i></span>') + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div><div class="leg2"><span><i style="--c:#ff6b4a"></i>hueco entre Si y Sn (el futuro germanio)</span></div></section>' +
      '<section class="card"><h2 class="sec">Curva de volúmenes atómicos (1870)</h2><div class="bar"><div class="seg" id="mx" role="group" aria-label="Eje horizontal"><button type="button" data-x="z">Número atómico</button><button type="button" data-x="m">Masa atómica</button></div></div><div class="chart" id="vol"><div class="tip"></div></div><div class="leg2">' + TP.catSpans() + '</div>' + TP.F('V=\\dfrac{M}{\\rho}\\quad\\left(\\text{cm}^3\\ \\text{por mol de átomos; sin gases}\\right)') + '</section>' +
      '<div class="grid2 eq"><section class="card"><h2 class="sec">Diferencias de masa en una familia</h2><div class="tscroll"><table class="t"><thead><tr><th>Familia</th><th class="n">Diferencias (u)</th></tr></thead><tbody id="dif"></tbody></table></div></section>' +
      '<section class="card"><h2 class="sec">Mendeléyev y Meyer</h2><div class="tscroll"><table class="t"><thead><tr><th></th><th>Meyer</th><th>Mendeléyev</th></tr></thead><tbody>' + [['Publicación', '1864 y 1870', '1869'], ['Criterio', 'Valencia y masa', 'Masa y propiedades'], ['Estructura', '6 familias', '8 grupos, 12 series'], ['Predicciones', 'No las formuló', 'Ga, Sc, Ge'], ['Reconocimiento', 'Medalla Davy 1882', 'Medalla Davy 1882']].map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>'; }).join('') + '</tbody></table></div></section></div>';
    var DIF = [['Li, Na, K', ['Li', 'Na', 'K']], ['K, Rb, Cs', ['K', 'Rb', 'Cs']], ['F, Cl, Br, I', ['F', 'Cl', 'Br', 'I']], ['O, S, Se, Te', ['O', 'S', 'Se', 'Te']], ['Mg, Ca, Sr, Ba', ['Mg', 'Ca', 'Sr', 'Ba']]];
    $('#dif', p).innerHTML = DIF.map(function (d) { var m = d[1].map(function (s) { return TP.bySym[s].mass; }), df = []; for (var i = 1; i < m.length; i++) df.push(TP.num(m[i] - m[i - 1], 1)); return '<tr><td>' + d[0] + '</td><td class="n">' + df.join(' / ') + '</td></tr>'; }).join('');
    var mx = 'z';
    function vol() {
      var host = $('#vol', p); host.innerHTML = '<div class="tip"></div>';
      var pts = E.filter(function (e) { return e.dens != null && TP.stateAt(e, 298) !== 'g' && TP.stateAt(e, 298) !== 'u' && e.z <= 92 && e.z !== 85 && e.z !== 87; }).map(function (e) { return { x: mx === 'z' ? e.z : e.mass, y: e.mass / e.dens, e: e }; });
      TP.xy(host, pts, { label: 'Volumen atómico', xl: mx === 'z' ? 'Número atómico' : 'Masa atómica (u)', yl: 'cm³/mol', x0: 0, line: true, labels: ['Li', 'Na', 'K', 'Rb', 'Cs', 'Ge', 'Si', 'Mo', 'Os'], tip: function (q) { return 'V = ' + TP.num(q.y, 1) + ' cm³/mol, ρ = ' + TP.num(q.e.dens, 2) + ' g/cm³'; } });
      $$('#mx button', p).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.x === mx ? 'true' : 'false'); });
    }
    $('#mx', p).addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b) return; mx = b.dataset.x; vol(); });
    vol();
  }

  function caminoView(p) {
    p.innerHTML =
      '<section class="card"><h2 class="sec">Línea de tiempo</h2><div class="tscroll"><table class="t"><thead><tr><th>Año</th><th>Autor</th><th>Aporte</th></tr></thead><tbody>' + [
        ['1829', 'Döbereiner', 'Tríadas: la masa del central es el promedio de los extremos.'], ['1862', 'de Chancourtois', 'Hélice telúrica: propiedades que se repiten cada 16 unidades de masa.'], ['1864', 'Newlands', 'Ley de las octavas: cada octavo elemento se parece al primero.'], ['1864 y 1870', 'Meyer', 'Seis familias por valencia y curva de volúmenes atómicos.'], ['1869', 'Mendeléyev', 'Tabla por masa y propiedades, con huecos y predicciones.'], ['1913', 'Moseley', 'Orden por número atómico mediante rayos X.'], ['1945', 'Seaborg', 'Los actínidos forman una serie f bajo los lantánidos.']
      ].map(function (r) { return '<tr><td class="mono">' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>'; }).join('') + '</tbody></table></div></section>' +
      '<div class="grid2 eq"><section class="card"><h2 class="sec">Tríadas de Döbereiner</h2><div class="tscroll"><table class="t"><thead><tr><th>Tríada</th><th class="n">Promedio de extremos</th><th class="n">Central</th></tr></thead><tbody id="tri"></tbody></table></div></section>' +
      '<section class="card"><h2 class="sec">Octavas de Newlands (1866)</h2><div class="tscroll"><table class="t newl"><tbody>' + [['H 1', 'F 8', 'Cl 15'], ['Li 2', 'Na 9', 'K 16'], ['G 3', 'Mg 10', 'Ca 17'], ['Bo 4', 'Al 11', 'Cr 19'], ['C 5', 'Si 12', 'Ti 18'], ['N 6', 'P 13', 'Mn 20'], ['O 7', 'S 14', 'Fe 21']].map(function (r) { return '<tr>' + r.map(function (c) { return '<td class="mono">' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div><p class="prose" style="margin-top:10px">G es glucinio (Be) y Bo es boro. Falla desde el Ca porque no deja huecos.</p></section></div>';
    var TR = [['Li', 'Na', 'K'], ['Ca', 'Sr', 'Ba'], ['S', 'Se', 'Te'], ['Cl', 'Br', 'I']];
    $('#tri', p).innerHTML = TR.map(function (t) { var a = TP.bySym[t[0]], b = TP.bySym[t[1]], c = TP.bySym[t[2]]; return '<tr><td class="mono">' + t.join(', ') + '</td><td class="n">(' + TP.num(a.mass, 2) + ' + ' + TP.num(c.mass, 2) + ') / 2 = ' + TP.num((a.mass + c.mass) / 2, 2) + '</td><td class="n">' + TP.num(b.mass, 2) + '</td></tr>'; }).join('');
  }

  function moseleyView(p) {
    p.innerHTML =
      '<section class="card"><h2 class="sec">Ley de Moseley (1913)</h2><div class="chart" id="mos"><div class="tip"></div></div><div class="leg2">' + TP.catSpans() + '</div>' + TP.F('\\sqrt{\\nu}=a\\,(Z-b)\\qquad \\nu_{K\\alpha}=\\tfrac{3}{4}\\,R_\\infty\\,c\\,(Z-1)^2') + '<p class="prose">La raíz de la frecuencia de rayos X crece en línea recta con Z, no con la masa. Moseley ordenó la tabla por Z, vio que faltaban los elementos 43, 61, 72 y 75, y resolvió las inversiones de masa.</p></section>' +
      '<section class="card"><h2 class="sec">Inversiones de masa</h2><div class="tscroll"><table class="t"><thead><tr><th>Par</th><th class="n">Masa (u)</th><th class="n">Z</th><th>Ordenados por Z</th></tr></thead><tbody id="inv"></tbody></table></div></section>';
    $('#inv', p).innerHTML = INV.map(function (r) { var a = TP.bySym[r[0]], b = TP.bySym[r[1]]; return '<tr><td>' + modern(r[0]) + ' y ' + modern(r[1]) + '<div class="sub2">' + r[2] + '</div></td><td class="n">' + TP.num(a.mass, 2) + ' &gt; ' + TP.num(b.mass, 2) + '</td><td class="n">' + a.z + ' &lt; ' + b.z + '</td><td>' + a.sym + ' antes que ' + b.sym + '</td></tr>'; }).join('');
    var pts = E.filter(function (e) { return e.z >= 13 && e.z <= 79 && e.z !== 43 && e.z !== 61; }).map(function (e) { var nu = 0.75 * 3.2898e15 * Math.pow(e.z - 1, 2); return { x: e.z, y: Math.sqrt(nu) / 1e8, e: e }; });
    var k = Math.sqrt(0.75 * 3.2898e15) / 1e8;
    TP.xy($('#mos', p), pts, { label: 'Raíz de la frecuencia Kα frente a Z', xl: 'Número atómico', yl: '√ν (10⁸ Hz½)', x0: 10, y0: 0, labels: ['Al', 'Ca', 'Fe', 'Cu', 'Mo', 'Ag', 'W', 'Au'], fit: [13, k * 12, 79, k * 78], tip: function (q) { return 'Z ' + q.x + ', Kα ≈ ' + TP.num(10.2 * Math.pow(q.x - 1, 2) / 1000, 2) + ' keV'; } });
  }

  function descView(p) { p.innerHTML = '<section class="card"><h2 class="sec">Elementos descubiertos por cuarto de siglo</h2><div class="chart" id="disc"><div class="tip"></div></div><div class="leg2">' + TP.catSpans() + '</div></section>'; TP.discoveries($('#disc', p)); }

  TP.init.historia = function (p, sub) {
    TP.views(p, 'historia', [
      { id: 'mendeleev', label: 'Mendeléyev', render: mendeleevView },
      { id: 'meyer', label: 'Meyer', render: meyerView },
      { id: 'camino', label: 'Precursores', render: caminoView },
      { id: 'moseley', label: 'Moseley', render: moseleyView },
      { id: 'descubrimientos', label: 'Descubrimientos', render: descView }
    ], sub);
  };
})();
