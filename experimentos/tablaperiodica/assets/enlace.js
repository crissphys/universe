/* Tabla periódica · pestañas "Lewis" y "Orbitales moleculares" */
(function () {
  var TP = window.TP, E = TP.E, $ = TP.$, $$ = TP.$$, NS = 'http://www.w3.org/2000/svg';
  TP.init = TP.init || {};
  function el(tag, a, par) { var n = document.createElementNS(NS, tag); for (var k in a) n.setAttribute(k, a[k]); if (par) par.appendChild(n); return n; }
  var VAL = { H: 1, He: 2, B: 3, C: 4, N: 5, O: 6, F: 7, S: 6, P: 5, Cl: 7, Xe: 8, Be: 2 };

  /* ===================== LEWIS ===================== */
  /* átomos: [símbolo, x, y, pares libres, electrones desapareados]; enlaces: [a, b, orden, 'd' = punteado] */
  var MOL = [
    { f: 'H₂', n: 'Hidrógeno', q: 0, a: [['H', -.55, 0, 0], ['H', .55, 0, 0]], b: [[0, 1, 1]], g: 'AX₂E₀ · lineal', h: '1s-1s', p: 'Apolar', note: 'Cumple el dueto (2 e⁻ alrededor de cada H).' },
    { f: 'N₂', n: 'Nitrógeno', q: 0, a: [['N', -.6, 0, 1], ['N', .6, 0, 1]], b: [[0, 1, 3]], g: 'Diatómica lineal', h: 'sp', p: 'Apolar', note: 'Enlace triple: 945 kJ/mol, el más fuerte entre moléculas diatómicas comunes; N₂ es muy poco reactivo.' },
    { f: 'O₂', n: 'Oxígeno', q: 0, a: [['O', -.65, 0, 2], ['O', .65, 0, 2]], b: [[0, 1, 2]], g: 'Diatómica lineal', h: 'sp²', p: 'Apolar', note: 'Lewis predice diamagnético, pero O₂ es paramagnético (2 e⁻ desapareados): solo lo explican los orbitales moleculares.' },
    { f: 'F₂', n: 'Flúor', q: 0, a: [['F', -.65, 0, 3], ['F', .65, 0, 3]], b: [[0, 1, 1]], g: 'Diatómica lineal', h: 'sp³', p: 'Apolar', note: 'Enlace sencillo débil (159 kJ/mol) por repulsión entre pares libres.' },
    { f: 'HCl', n: 'Cloruro de hidrógeno', q: 0, a: [['H', -.8, 0, 0], ['Cl', .8, 0, 3]], b: [[0, 1, 1]], g: 'Diatómica lineal', h: 's-p', p: 'Polar (δ⁺ H, δ⁻ Cl)', note: 'Δχ = 0,96 → covalente polar.' },
    { f: 'H₂O', n: 'Agua', q: 0, a: [['O', 0, -.1, 2], ['H', -.8, .6, 0], ['H', .8, .6, 0]], b: [[0, 1, 1], [0, 2, 1]], g: 'AX₂E₂ · angular 104,5°', h: 'sp³', p: 'Polar', note: 'Los dos pares libres comprimen el ángulo del tetraedro (109,5°) a 104,5°.' },
    { f: 'NH₃', n: 'Amoníaco', q: 0, a: [['N', 0, -.2, 1], ['H', -.9, .55, 0], ['H', .9, .55, 0], ['H', 0, 1.05, 0]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1]], g: 'AX₃E · piramidal trigonal 107°', h: 'sp³', p: 'Polar', note: 'El par libre del N le da carácter básico y permite el ion amonio.' },
    { f: 'CH₄', n: 'Metano', q: 0, a: [['C', 0, 0, 0], ['H', 0, -1, 0], ['H', 1, 0, 0], ['H', 0, 1, 0], ['H', -1, 0, 0]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]], g: 'AX₄ · tetraédrica 109,5°', h: 'sp³', p: 'Apolar', note: 'La estructura plana es solo la representación; la molécula es tetraédrica.' },
    { f: 'H₃O⁺', n: 'Ion hidronio', q: 1, a: [['O', 0, -.2, 1], ['H', -.9, .55, 0], ['H', .9, .55, 0], ['H', 0, 1.05, 0]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1]], g: 'AX₃E · piramidal trigonal', h: 'sp³', p: 'Polar', note: 'El O aporta el par para el enlace dativo con el H⁺: carga formal +1 en O.' },
    { f: 'NH₄⁺', n: 'Ion amonio', q: 1, a: [['N', 0, 0, 0], ['H', 0, -1, 0], ['H', 1, 0, 0], ['H', 0, 1, 0], ['H', -1, 0, 0]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]], g: 'AX₄ · tetraédrica', h: 'sp³', p: 'Ion', note: 'Un enlace es dativo (coordinado); los cuatro son equivalentes.' },
    { f: 'CO₂', n: 'Dióxido de carbono', q: 0, a: [['O', -1.2, 0, 2], ['C', 0, 0, 0], ['O', 1.2, 0, 2]], b: [[0, 1, 2], [1, 2, 2]], g: 'AX₂ · lineal 180°', h: 'sp', p: 'Apolar (dipolos se cancelan)', note: 'Cada enlace C=O es polar, pero la geometría lineal anula el momento dipolar.' },
    { f: 'CO', n: 'Monóxido de carbono', q: 0, a: [['C', -.6, 0, 1], ['O', .6, 0, 1]], b: [[0, 1, 3]], g: 'Diatómica lineal', h: 'sp', p: 'Débilmente polar', note: 'Cargas formales C⁻ y O⁺; el dipolo real es mínimo (0,11 D) porque el O más electronegativo compensa.' },
    { f: 'HCN', n: 'Cianuro de hidrógeno', q: 0, a: [['H', -1.55, 0, 0], ['C', -.4, 0, 0], ['N', .85, 0, 1]], b: [[0, 1, 1], [1, 2, 3]], g: 'AX₂ · lineal', h: 'sp', p: 'Polar', note: 'C central con 4 enlaces (1 + 3).' },
    { f: 'C₂H₄', n: 'Eteno', q: 0, a: [['C', -.7, 0, 0], ['C', .7, 0, 0], ['H', -1.3, -.95, 0], ['H', -1.3, .95, 0], ['H', 1.3, -.95, 0], ['H', 1.3, .95, 0]], b: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [1, 4, 1], [1, 5, 1]], g: 'AX₃ en cada C · plana 120°', h: 'sp² (σ + π)', p: 'Apolar', note: 'El doble enlace = 1 σ + 1 π; el π impide la rotación.' },
    { f: 'C₂H₂', n: 'Etino (acetileno)', q: 0, a: [['H', -1.8, 0, 0], ['C', -.65, 0, 0], ['C', .65, 0, 0], ['H', 1.8, 0, 0]], b: [[0, 1, 1], [1, 2, 3], [2, 3, 1]], g: 'AX₂ · lineal 180°', h: 'sp (1 σ + 2 π)', p: 'Apolar', note: 'Enlace triple C≡C: 1 σ y 2 π.' },
    { f: 'O₃', n: 'Ozono', q: 0, a: [['O', 0, -.35, 1], ['O', -1.05, .4, 3], ['O', 1.05, .4, 2]], b: [[0, 1, 1], [0, 2, 2]], g: 'AX₂E · angular 117°', h: 'sp²', p: 'Polar', res: 'O', note: 'Resonancia: las dos formas se mezclan y los enlaces O-O son iguales (orden 1,5).' },
    { f: 'SO₂', n: 'Dióxido de azufre', q: 0, a: [['S', 0, -.35, 1], ['O', -1.1, .4, 2], ['O', 1.1, .4, 2]], b: [[0, 1, 2], [0, 2, 2]], g: 'AX₂E · angular 119°', h: 'sp²', p: 'Polar', res: 'O', note: 'El S expande el octeto (10 e⁻); con dobles enlaces las cargas formales son 0.' },
    { f: 'SO₃', n: 'Trióxido de azufre', q: 0, a: [['S', 0, 0, 0], ['O', 0, -1.1, 2], ['O', -.95, .55, 2], ['O', .95, .55, 2]], b: [[0, 1, 2], [0, 2, 2], [0, 3, 2]], g: 'AX₃ · trigonal plana 120°', h: 'sp²', p: 'Apolar', res: 'O', note: 'Octeto expandido (12 e⁻ en S) con cargas formales cero.' },
    { f: 'BF₃', n: 'Trifluoruro de boro', q: 0, a: [['B', 0, 0, 0], ['F', 0, -1.1, 3], ['F', -.95, .55, 3], ['F', .95, .55, 3]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1]], g: 'AX₃ · trigonal plana 120°', h: 'sp²', p: 'Apolar', note: 'Octeto incompleto (6 e⁻ en B): ácido de Lewis, acepta un par de electrones.' },
    { f: 'NO', n: 'Monóxido de nitrógeno', q: 0, a: [['N', -.65, 0, 1, 1], ['O', .65, 0, 2]], b: [[0, 1, 2]], g: 'Diatómica lineal', h: 'sp', p: 'Polar', note: 'Radical con 11 e⁻ de valencia (número impar): no cumple el octeto; es paramagnético.' },
    { f: 'NO₃⁻', n: 'Ion nitrato', q: -1, a: [['N', 0, 0, 0], ['O', 0, -1.1, 2], ['O', -.95, .55, 3], ['O', .95, .55, 3]], b: [[0, 1, 2], [0, 2, 1], [0, 3, 1]], g: 'AX₃ · trigonal plana 120°', h: 'sp²', p: 'Ion', res: 'O', note: 'Tres formas resonantes; cada enlace N-O tiene orden 1,33.' },
    { f: 'CO₃²⁻', n: 'Ion carbonato', q: -2, a: [['C', 0, 0, 0], ['O', 0, -1.1, 2], ['O', -.95, .55, 3], ['O', .95, .55, 3]], b: [[0, 1, 2], [0, 2, 1], [0, 3, 1]], g: 'AX₃ · trigonal plana 120°', h: 'sp²', p: 'Ion', res: 'O', note: 'Tres formas resonantes; orden de enlace C-O = 1,33.' },
    { f: 'SO₄²⁻', n: 'Ion sulfato', q: -2, a: [['S', 0, 0, 0], ['O', 0, -1.1, 2], ['O', 0, 1.1, 2], ['O', -1.1, 0, 3], ['O', 1.1, 0, 3]], b: [[0, 1, 2], [0, 2, 2], [0, 3, 1], [0, 4, 1]], g: 'AX₄ · tetraédrica 109,5°', h: 'sp³', p: 'Ion', res: 'O', note: 'Estructura que minimiza cargas formales (octeto expandido); en realidad los 4 enlaces son equivalentes.' },
    { f: 'PCl₅', n: 'Pentacloruro de fósforo', q: 0, a: [['P', 0, 0, 0], ['Cl', 0, -1.3, 3], ['Cl', 0, 1.3, 3], ['Cl', -1.25, 0, 3], ['Cl', 1.25, 0, 3], ['Cl', .78, -.78, 3]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [0, 5, 1, 'd']], g: 'AX₅ · bipirámide trigonal 90°/120°', h: 'sp³d', p: 'Apolar', note: 'Octeto expandido (10 e⁻ en P). El enlace punteado va hacia atrás del plano.' },
    { f: 'SF₆', n: 'Hexafluoruro de azufre', q: 0, a: [['S', 0, 0, 0], ['F', 0, -1.3, 3], ['F', 0, 1.3, 3], ['F', -1.3, 0, 3], ['F', 1.3, 0, 3], ['F', -.78, -.78, 3], ['F', .78, .78, 3]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [0, 5, 1, 'd'], [0, 6, 1, 'd']], g: 'AX₆ · octaédrica 90°', h: 'sp³d²', p: 'Apolar', note: 'Octeto expandido (12 e⁻ en S). Dos enlaces se dibujan hacia delante y hacia atrás.' }
  ];
  var VSEPR = [
    ['AX₂', '2', '0', 'Lineal', '180°', 'sp', 'CO₂, BeCl₂'], ['AX₃', '3', '0', 'Trigonal plana', '120°', 'sp²', 'BF₃, SO₃'], ['AX₂E', '2', '1', 'Angular', '< 120°', 'sp²', 'SO₂, O₃'],
    ['AX₄', '4', '0', 'Tetraédrica', '109,5°', 'sp³', 'CH₄, NH₄⁺'], ['AX₃E', '3', '1', 'Piramidal trigonal', '≈ 107°', 'sp³', 'NH₃, H₃O⁺'], ['AX₂E₂', '2', '2', 'Angular', '≈ 104,5°', 'sp³', 'H₂O'],
    ['AX₅', '5', '0', 'Bipirámide trigonal', '90° / 120°', 'sp³d', 'PCl₅'], ['AX₄E', '4', '1', 'Balancín', '< 90° / < 120°', 'sp³d', 'SF₄'], ['AX₃E₂', '3', '2', 'Forma de T', '< 90°', 'sp³d', 'ClF₃'], ['AX₂E₃', '2', '3', 'Lineal', '180°', 'sp³d', 'XeF₂, I₃⁻'],
    ['AX₆', '6', '0', 'Octaédrica', '90°', 'sp³d²', 'SF₆'], ['AX₅E', '5', '1', 'Pirámide cuadrada', '< 90°', 'sp³d²', 'BrF₅'], ['AX₄E₂', '4', '2', 'Plana cuadrada', '90°', 'sp³d²', 'XeF₄']
  ];

  function drawMol(m, host) {
    var S = 84, pad = 60, xs = m.a.map(function (a) { return a[1]; }), ys = m.a.map(function (a) { return a[2]; });
    var minx = Math.min.apply(null, xs) * S - pad, maxx = Math.max.apply(null, xs) * S + pad, miny = Math.min.apply(null, ys) * S - pad, maxy = Math.max.apply(null, ys) * S + pad;
    var w = maxx - minx, h = maxy - miny;
    var svg = el('svg', { viewBox: minx + ' ' + miny + ' ' + w + ' ' + h, role: 'img', 'aria-label': 'Estructura de Lewis de ' + m.n });
    svg.style.maxWidth = Math.max(300, w * 1.25) + 'px'; svg.style.fill = 'currentColor'; svg.style.stroke = 'none';
    var cf = [], tot = 0;
    m.a.forEach(function (a, i) {
      var bonds = 0; m.b.forEach(function (b) { if (b[0] === i || b[1] === i) bonds += b[2]; });
      var val = E.filter(function (e) { return e.sym === a[0]; })[0], vv = VAL[a[0]] != null ? VAL[a[0]] : val.valence;
      cf[i] = { v: vv, lp: a[3], ue: a[4] || 0, bonds: bonds, fc: vv - (2 * a[3] + (a[4] || 0)) - bonds };
      tot += 2 * a[3] + (a[4] || 0);
    });
    m.b.forEach(function (b) { tot += 2 * b[2]; });
    m.cf = cf; m.total = tot;
    var R = function (a) { return a[0] === 'H' ? 10 : 14; };
    // enlaces
    m.b.forEach(function (b) {
      var A = m.a[b[0]], B = m.a[b[1]], x1 = A[1] * S, y1 = A[2] * S, x2 = B[1] * S, y2 = B[2] * S, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
      var sx = x1 + ux * R(A), sy = y1 + uy * R(A), ex = x2 - ux * R(B), ey = y2 - uy * R(B), n = b[2], off = n === 1 ? [0] : n === 2 ? [-4, 4] : [-6, 0, 6];
      off.forEach(function (o) { var l = el('line', { x1: sx + nx * o, y1: sy + ny * o, x2: ex + nx * o, y2: ey + ny * o, stroke: 'currentColor', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, svg); if (b[3] === 'd') l.setAttribute('stroke-dasharray', '5 5'); });
    });
    m.a.forEach(function (a, i) {
      var x = a[1] * S, y = a[2] * S, c = cf[i];
      // pares libres y electrones desapareados
      var angs = [];
      m.b.forEach(function (b) { if (b[0] === i || b[1] === i) { var o = m.a[b[0] === i ? b[1] : b[0]]; angs.push(Math.atan2(o[2] - a[2], o[1] - a[1])); } });
      var free = [], k, best, bd, t, d, cand, it, q;
      function dist(c, others) { var m = 9; others.forEach(function (o) { var dd = Math.abs(((c - o + Math.PI * 3) % (Math.PI * 2)) - Math.PI); if (dd < m) m = dd; }); return m; }
      var need = c.lp + (c.ue ? 1 : 0);
      function pickBest(others) { var bb = 0, bs = -1; for (t = 0; t < 72; t++) { cand = t * Math.PI / 36 + .1; d = dist(cand, others); if (d > bs + 1e-6) { bs = d; bb = cand; } } return bb; }
      for (k = 0; k < need; k++) free.push(pickBest(angs.concat(free)));
      for (it = 0; it < 8; it++) for (k = 0; k < free.length; k++) { q = free.slice(); q.splice(k, 1); free[k] = pickBest(angs.concat(q)); }
      free.forEach(function (ang, j) {
        var r = a[0] === 'H' ? 17 : 22, cx = x + Math.cos(ang) * r, cy = y + Math.sin(ang) * r, px = -Math.sin(ang) * 4.6, py = Math.cos(ang) * 4.6;
        if (j < c.lp) { el('circle', { cx: cx + px, cy: cy + py, r: 2.6, fill: '#ff6b4a' }, svg); el('circle', { cx: cx - px, cy: cy - py, r: 2.6, fill: '#ff6b4a' }, svg); }
        else el('circle', { cx: cx, cy: cy, r: 2.8, fill: '#79a6e4' }, svg);
      });
      var t = el('text', { x: x, y: y + 6.5, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 600, 'font-family': 'Geist, sans-serif' }, svg); t.textContent = a[0];
      if (c.fc !== 0) {
        el('circle', { cx: x + 17, cy: y - 17, r: 9, fill: c.fc > 0 ? '#ff6b4a' : '#79a6e4' }, svg);
        var f = el('text', { x: x + 17, y: y - 13, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#08080a', 'font-family': 'Geist Mono, monospace' }, svg); f.textContent = (c.fc > 0 ? '+' : '−') + (Math.abs(c.fc) > 1 ? Math.abs(c.fc) : '');
      }
    });
    if (m.q) {
      var bx = minx + 14, by = miny + 14, bw = w - 28, bh = h - 28;
      el('path', { d: 'M' + (bx + 14) + ' ' + by + ' H' + bx + ' V' + (by + bh) + ' H' + (bx + 14), fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6 }, svg);
      el('path', { d: 'M' + (bx + bw - 14) + ' ' + by + ' H' + (bx + bw) + ' V' + (by + bh) + ' H' + (bx + bw - 14), fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6 }, svg);
      var q = el('text', { x: bx + bw + 8, y: by + 6, 'text-anchor': 'start', 'font-size': 18, 'font-weight': 600, 'font-family': 'Geist, sans-serif' }, svg); q.textContent = (Math.abs(m.q) > 1 ? Math.abs(m.q) : '') + (m.q > 0 ? '+' : '−');
    }
    host.innerHTML = ''; host.appendChild(svg);
  }

  /* ---------- vista Lewis ---------- */
  function lewisView(p) {
    var grid = E.slice(0, 18).map(function (e) { return '<a class="lw" href="' + TP.url(e) + '" style="--c:' + TP.CAT[e.cat].c + '" aria-label="' + e.name + ', ' + e.valence + ' electrones de valencia"><span class="lwz">' + e.z + '</span>' + TP.lewisDot(e.sym, e.valence, 84) + '<span class="lwv">' + e.valence + ' e⁻</span></a>'; }).join('');
    p.innerHTML =
      '<section class="card"><div class="bar"><label class="sel"><select id="lm" aria-label="Molécula o ion">' + MOL.map(function (m, i) { return '<option value="' + i + '">' + m.f + ' (' + m.n.toLowerCase() + ')</option>'; }).join('') + '</select></label></div>' +
      '<div class="grid2 eq"><div><div id="lsv" class="lsv"></div><div class="leg2"><span><i style="--c:#ff6b4a"></i>par libre</span><span><i style="--c:#79a6e4"></i>electrón desapareado</span><span><i style="--c:#ff6b4a;border-radius:50%"></i>carga formal</span></div></div><div id="linfo"></div></div></section>' +
      '<div class="grid2 eq"><section class="card"><h2 class="sec">Cómo dibujar una estructura</h2><ol class="steps">' +
      '<li>Suma los electrones de valencia (más la carga si es anión, menos si es catión).</li><li>Pon al menos electronegativo en el centro (nunca H ni F).</li><li>Une con enlaces sencillos (2 e⁻ cada uno).</li><li>Completa el octeto de los átomos terminales con pares libres.</li><li>Lo que sobra va al átomo central.</li><li>Si al central le faltan electrones, forma enlaces dobles o triples.</li><li>Calcula las cargas formales: elige la estructura con cargas cercanas a 0.</li><li>Si hay varias equivalentes, es resonancia.</li></ol></section>' +
      '<section class="card"><h2 class="sec">Octeto y excepciones</h2><div class="tscroll"><table class="t"><thead><tr><th>Caso</th><th>Qué pasa</th><th>Ejemplos</th></tr></thead><tbody><tr><td>Octeto incompleto</td><td>Central con menos de 8 e⁻</td><td>BF₃, BeCl₂, AlCl₃</td></tr><tr><td>Número impar</td><td>Radical con un e⁻ desapareado</td><td>NO, NO₂</td></tr><tr><td>Octeto expandido</td><td>Periodo 3 o mayor, más de 8 e⁻</td><td>PCl₅, SF₆, SO₄²⁻</td></tr></tbody></table></div>' + TP.F('CF=e^-_{\\text{valencia}}-e^-_{\\text{no enlazantes}}-\\text{enlaces}') + '</section></div>' +
      '<section class="card"><h2 class="sec">Símbolos de Lewis</h2><div class="lwg">' + grid + '</div></section>';
    var sel = $('#lm', p);
    function show() {
      var m = MOL[+sel.value]; TP.store.set('lewis', sel.value); drawMol(m, $('#lsv', p));
      var vsum = m.a.reduce(function (s, a, i) { return s + m.cf[i].v; }, 0), counts = {}, order = [];
      m.a.forEach(function (a, i) { if (!counts[a[0]]) { counts[a[0]] = 0; order.push(i); } counts[a[0]]++; });
      var formula = order.map(function (i) { var c = counts[m.a[i][0]]; return c > 1 ? c + ' × ' + m.cf[i].v : m.cf[i].v; }).join(' + ');
      var seen = {}, rows = m.a.map(function (a, i) { var c = m.cf[i]; seen[a[0]] = (seen[a[0]] || 0) + 1; return '<tr><td class="mono">' + a[0] + (counts[a[0]] > 1 ? '<sub>' + seen[a[0]] + '</sub>' : '') + '</td><td class="n">' + c.v + '</td><td class="n">' + (2 * c.lp + c.ue) + '</td><td class="n">' + c.bonds + '</td><td class="n">' + (c.fc > 0 ? '+' : c.fc < 0 ? '−' : '') + Math.abs(c.fc) + '</td></tr>'; }).join('');
      $('#linfo', p).innerHTML = '<dl class="kv"><dt>Electrones de valencia</dt><dd>' + formula + (m.q ? (m.q > 0 ? ' − ' : ' + ') + Math.abs(m.q) : '') + ' = ' + (vsum - m.q) + '</dd><dt>Pares de electrones</dt><dd>' + TP.num((vsum - m.q) / 2, 1) + '</dd><dt>Geometría</dt><dd>' + m.g + '</dd><dt>Hibridación</dt><dd>' + m.h + '</dd><dt>Polaridad</dt><dd>' + m.p + '</dd>' + (m.res ? '<dt>Resonancia</dt><dd>Sí</dd>' : '') + '</dl>' +
        '<div class="tscroll"><table class="t"><thead><tr><th>Átomo</th><th class="n">Valencia</th><th class="n">No enlaz.</th><th class="n">Enlaces</th><th class="n">CF</th></tr></thead><tbody>' + rows + '</tbody></table></div><p class="prose" style="margin-top:12px">' + m.note + '</p>';
    }
    sel.value = TP.store.get('lewis', '5'); sel.addEventListener('change', show); show();
    p._sync = function () { var v = TP.store.get('lewis', '5'); if (sel.value !== v) { sel.value = v; show(); } };
  }

  /* ---------- vista geometría ---------- */
  function geoView(p) {
    p.innerHTML = '<section class="card"><h2 class="sec">Geometría molecular (RPECV)</h2><p class="prose">Los pares de electrones del átomo central se repelen y se orientan lo más lejos posible. Repulsión: par libre con par libre &gt; par libre con enlace &gt; enlace con enlace.</p><div class="tscroll"><table class="t"><thead><tr><th>AXE</th><th class="n">Enlaces</th><th class="n">Pares libres</th><th>Geometría</th><th>Ángulo</th><th>Hibridación</th><th>Ejemplos</th></tr></thead><tbody>' +
      VSEPR.map(function (r) { return '<tr><td class="mono">' + r[0] + '</td><td class="n">' + r[1] + '</td><td class="n">' + r[2] + '</td><td>' + r[3] + '</td><td class="mono">' + r[4] + '</td><td class="mono">' + r[5] + '</td><td>' + r[6] + '</td></tr>'; }).join('') + '</tbody></table></div></section>';
  }

  /* ---------- vista tipo de enlace ---------- */
  function tipoView(p) {
    function opt(sel) { return E.filter(function (x) { return x.en != null; }).map(function (x) { return '<option value="' + x.z + '"' + (x.z === sel ? ' selected' : '') + '>' + x.name + ' (' + x.sym + ')</option>'; }).join(''); }
    p.innerHTML = '<section class="card"><div class="bar"><label class="sel"><select id="bn1" aria-label="Elemento A">' + opt(11) + '</select></label><label class="sel"><select id="bn2" aria-label="Elemento B">' + opt(17) + '</select></label></div><dl class="kv" id="bout"></dl>' + TP.F('\\%\\ \\text{iónico}=100\\left(1-e^{-\\Delta\\chi^{2}/4}\\right)') + '</section>' +
      '<div class="grid2 eq"><section class="card"><h2 class="sec">Según Δχ</h2><div class="tscroll"><table class="t"><thead><tr><th>Δχ</th><th>Tipo</th><th>Ejemplo</th></tr></thead><tbody><tr><td class="mono">0 a 0,4</td><td>Covalente apolar</td><td>H₂, Cl₂</td></tr><tr><td class="mono">0,4 a 1,7</td><td>Covalente polar</td><td>H₂O, HCl</td></tr><tr><td class="mono">1,7 o más</td><td>Iónico</td><td>NaCl, MgO</td></tr></tbody></table></div><p class="prose" style="margin-top:12px">Metal con no metal: iónico. No metal con no metal: covalente. Metal con metal: metálico.</p></section>' +
      '<section class="card"><h2 class="sec">Parámetros de enlace</h2><dl class="kv"><dt>Longitud</dt><dd>triple &lt; doble &lt; simple</dd><dt>Energía</dt><dd>triple &gt; doble &gt; simple</dd><dt>Enlace σ</dt><dd>el primero entre dos átomos</dd><dt>Enlace π</dt><dd>cada enlace adicional</dd><dt>Dativo</dt><dd>un átomo aporta ambos e⁻</dd><dt>Orden con resonancia</dt><dd>enlaces totales / posiciones</dd></dl></section></div>';
    function bond() {
      var a = E[+$('#bn1', p).value - 1], b = E[+$('#bn2', p).value - 1], d = Math.abs(a.en - b.en), pct = 100 * (1 - Math.exp(-d * d / 4)), isM = function (x) { return ['ak', 'ae', 'tr', 'pt', 'la', 'ac'].indexOf(x.cat) >= 0; };
      var tipo = isM(a) && isM(b) ? 'Metálico' : d >= 1.7 ? 'Iónico' : d >= .4 ? 'Covalente polar' : 'Covalente apolar';
      $('#bout', p).innerHTML = '<dt>Electronegatividad de ' + a.sym + ' y ' + b.sym + '</dt><dd>' + TP.num(a.en, 2) + ' y ' + TP.num(b.en, 2) + '</dd><dt>Δχ</dt><dd>' + TP.num(d, 2) + '</dd><dt>Tipo de enlace</dt><dd>' + tipo + '</dd><dt>Carácter iónico</dt><dd>' + TP.num(pct, 0) + ' %</dd><dt>Polo negativo (δ−)</dt><dd>' + (d < .05 ? 'ninguno' : (a.en > b.en ? a : b).sym) + '</dd>';
    }
    $('#bn1', p).addEventListener('change', bond); $('#bn2', p).addEventListener('change', bond); bond();
  }

  /* ===================== ORBITALES MOLECULARES ===================== */
  var Z2 = { 'H': 1, 'He': 2, 'Li': 3, 'Be': 4, 'B': 5, 'C': 6, 'N': 7, 'O': 8, 'F': 9, 'Ne': 10 };
  var HOMO = [
    { f: 'H₂⁺', n: 'Ion molecular de hidrógeno', z: 1, q: 1, L: 106, D: 255 }, { f: 'H₂', n: 'Hidrógeno', z: 1, q: 0, L: 74, D: 436 }, { f: 'He₂⁺', n: 'Ion helio-2', z: 2, q: 1, L: 108, D: 301 }, { f: 'He₂', n: 'Helio (no existe)', z: 2, q: 0, L: null, D: null },
    { f: 'Li₂', n: 'Dilitio', z: 3, q: 0, L: 267, D: 105 }, { f: 'Be₂', n: 'Diberilio', z: 4, q: 0, L: 245, D: 9 }, { f: 'B₂', n: 'Diboro', z: 5, q: 0, L: 159, D: 290 }, { f: 'C₂', n: 'Dicarbono', z: 6, q: 0, L: 124, D: 599 },
    { f: 'N₂⁺', n: 'Ion N₂⁺', z: 7, q: 1, L: 112, D: 841 }, { f: 'N₂', n: 'Nitrógeno', z: 7, q: 0, L: 110, D: 945 }, { f: 'O₂⁺', n: 'Ion dioxigenilo', z: 8, q: 1, L: 112, D: 643 }, { f: 'O₂', n: 'Oxígeno', z: 8, q: 0, L: 121, D: 498 },
    { f: 'O₂⁻', n: 'Superóxido', z: 8, q: -1, L: 134, D: null }, { f: 'O₂²⁻', n: 'Peróxido', z: 8, q: -2, L: 149, D: null }, { f: 'F₂', n: 'Flúor', z: 9, q: 0, L: 143, D: 159 }, { f: 'Ne₂', n: 'Neón (no existe)', z: 10, q: 0, L: null, D: null }
  ];
  /* niveles de un diatómico homonuclear: [nombre, capacidad, tipo, orbitales] */
  function homoLevels(z) {
    if (z <= 2) return [['σ1s', 2, 'b'], ['σ*1s', 2, 'a']];
    var s1 = [['σ1s', 2, 'b', 1], ['σ*1s', 2, 'a', 1], ['σ2s', 2, 'b'], ['σ*2s', 2, 'a']];
    var mix = z <= 7;
    var sp = [['σ2p', 2, 'b'], ['π2p', 4, 'b'], ['π*2p', 4, 'a'], ['σ*2p', 2, 'a']];
    if (mix) sp = [sp[1], sp[0], sp[2], sp[3]];
    return s1.concat(sp);
  }
  function fill(levels, ne) {
    return levels.map(function (lv) {
      var cap = lv[1], put = Math.min(cap, Math.max(0, ne)), n = cap / 2, arr = [], i;
      ne -= put;
      for (i = 0; i < n; i++) arr.push([i < put, false]);
      for (i = 0; i < n && put > n; i++) arr[i][1] = i < put - n;
      return { n: lv[0], cap: cap, kind: lv[2], core: !!lv[3], e: put, orb: arr };
    });
  }
  function analyze(mos) {
    var nb = 0, na = 0, up = 0;
    mos.forEach(function (m) { if (m.kind === 'b') nb += m.e; else if (m.kind === 'a') na += m.e; m.orb.forEach(function (o) { if (o[0] !== o[1]) up++; }); });
    return { nb: nb, na: na, bo: (nb - na) / 2, up: up };
  }

  /* diagrama de OM (SVG). spec: {ao:{L:[{n,y,x?}],R:[..]}, mos:[{n,y,kind,orb,cap,from:[[side,idx]]}]} */
  function moDiagram(host, spec) {
    var W = 640, H = 460, svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Diagrama de orbitales moleculares de ' + spec.title });
    svg.style.stroke = 'none'; svg.style.fill = 'currentColor';
    var colors = { b: '#ff6b4a', a: '#79a6e4', n: '#a1a1aa' };
    var cxL = 90, cxR = W - 90, cxM = W / 2, lw = 74, mw = 90;
    var yaxis = el('line', { x1: 20, y1: 24, x2: 20, y2: H - 24, stroke: '#52525b', 'stroke-width': 1.2 }, svg);
    el('path', { d: 'M15 32 L20 22 L25 32', fill: 'none', stroke: '#52525b', 'stroke-width': 1.2 }, svg);
    var tE = el('text', { x: 30, y: 28, 'font-size': 12, fill: '#71717a', 'font-family': 'Geist Mono, monospace' }, svg); tE.textContent = 'E';
    function lvl(x, y, w, label, color, dim) { el('line', { x1: x - w / 2, x2: x + w / 2, y1: y, y2: y, stroke: color, 'stroke-width': 2.4, 'stroke-linecap': 'round', opacity: dim ? .5 : 1 }, svg); }
    function txt(x, y, s, a, size, col) { var t = el('text', { x: x, y: y, 'text-anchor': a || 'middle', 'font-size': size || 13, fill: col || '#a1a1aa', 'font-family': 'Geist Mono, monospace' }, svg); t.textContent = s; return t; }
    // AO
    ['L', 'R'].forEach(function (side) {
      var cx = side === 'L' ? cxL : cxR;
      spec.ao[side].forEach(function (a, i) {
        var n = a.nOrb || 1, k;
        for (k = 0; k < n; k++) { var ox = cx + (k - (n - 1) / 2) * 30; lvl(ox, a.y, 22, '', '#e4e4e7', a.core); a.xs = a.xs || []; a.xs[k] = ox; if (a.e) drawElec(ox, a.y, k < a.e[0], k < a.e[1]); }
        txt(cx + (side === 'L' ? -(n * 15 + 14) : (n * 15 + 14)), a.y + 4, a.n, side === 'L' ? 'end' : 'start', 12);
        a.cx = cx;
      });
    });
    function drawElec(x, y, up, dn) { if (up) txt(x - 3.5, y - 6, '↑', 'middle', 15, '#f4f4f5'); if (dn) txt(x + 4.5, y - 6, '↓', 'middle', 15, '#f4f4f5'); }
    // enlaces visuales AO → MO
    spec.mos.forEach(function (m) {
      (m.from || []).forEach(function (f) {
        var a = spec.ao[f[0]][f[1]], x1 = a.cx + (f[0] === 'L' ? 34 + (a.nOrb ? (a.nOrb - 1) * 15 : 0) : -34 - (a.nOrb ? (a.nOrb - 1) * 15 : 0)), x2 = cxM + (f[0] === 'L' ? -mw / 2 - 4 : mw / 2 + 4);
        el('line', { x1: x1, y1: a.y, x2: x2, y2: m.y, stroke: '#52525b', 'stroke-width': 1, 'stroke-dasharray': '3 4' }, svg);
      });
    });
    // MO
    spec.mos.forEach(function (m) {
      var n = m.orb.length, k;
      for (k = 0; k < n; k++) { var ox = cxM + (k - (n - 1) / 2) * 44; lvl(ox, m.y, 38, '', colors[m.kind], m.core); drawElec(ox, m.y, m.orb[k][0], m.orb[k][1]); }
      var side = m.side === 'L' ? 'end' : 'start';
      txt(cxM + (n * 22 + 6), m.y + 4, m.n, 'start', 13, colors[m.kind]);
    });
    var lt = txt(cxL, H - 10, spec.left, 'middle', 13, '#e4e4e7'), rt = txt(cxR, H - 10, spec.right, 'middle', 13, '#e4e4e7'); txt(cxM, H - 10, spec.title, 'middle', 13, '#e4e4e7');
    host.innerHTML = ''; host.appendChild(svg);
  }

  function specHomo(d) {
    var levels = homoLevels(d.z), ne = 2 * d.z - d.q, mos = fill(levels, ne), an = analyze(mos), n = mos.length;
    var ys = {}, top = 60, bot = 400, k;
    // posición ordinal: núcleos 1s abajo
    var order = levels.map(function (l, i) { return i; });
    var base = bot, step = (bot - top) / Math.max(1, n - 1) * (n <= 2 ? .6 : 1);
    mos.forEach(function (m, i) { m.y = base - i * step - (n <= 2 ? 80 : 0); if (!m.core && n > 2) m.y = base - i * step; });
    var from = function (name) { return name.indexOf('1s') >= 0 ? 1 : name.indexOf('2s') >= 0 ? 2 : 3; };
    var yAO = { 1: mos[0].y + (mos.length > 1 ? (mos[1].y - mos[0].y) / 2 : 0), 2: 0, 3: 0 };
    if (n > 2) {
      var s2 = mos.filter(function (m) { return m.n === 'σ2s' || m.n === 'σ*2s'; }), p2 = mos.filter(function (m) { return /2p/.test(m.n); });
      yAO[2] = (s2[0].y + s2[1].y) / 2; yAO[3] = (Math.min.apply(null, p2.map(function (m) { return m.y; })) + Math.max.apply(null, p2.map(function (m) { return m.y; }))) / 2;
    }
    var aoNames = n <= 2 ? ['1s'] : ['1s', '2s', '2p'], ao = function () { return aoNames.map(function (nm, i) { var c = n <= 2 ? 1 : i + 1; var a = { n: nm, y: yAO[c], nOrb: nm === '2p' ? 3 : 1, core: nm === '1s' && n > 2 }; var ez = nm === '1s' ? Math.min(2, d.z) : nm === '2s' ? Math.max(0, Math.min(2, d.z - 2)) : Math.max(0, d.z - 4); if (d.z <= 2) ez = d.z; a.e = nm === '2p' ? [Math.min(3, ez), Math.max(0, ez - 3)] : [ez > 0 ? 1 : 0, ez > 1 ? 1 : 0]; if (nm === '1s' && d.z === 1) a.e = [1, 0]; if (d.z <= 2 && nm === '1s') a.e = [d.z >= 1 ? 1 : 0, d.z >= 2 ? 1 : 0]; return a; }); };
    mos.forEach(function (m) { var c = from(m.n); m.from = n <= 2 ? [['L', 0], ['R', 0]] : [['L', c - 1], ['R', c - 1]]; });
    var sym = d.f.replace(/[₂⁺⁻²]+$/, '');
    var aoL = ao(), aoR = ao(); if (d.q) { aoL.concat(aoR).forEach(function (a) { a.e = null; }); }
    return { title: d.f, left: 'átomo', right: 'átomo', ao: { L: aoL, R: aoR }, mos: mos, an: an };
  }

  /* heteronucleares con energías de orbitales atómicos (eV) */
  var HET = {
    'CO': { title: 'CO', left: 'C', right: 'O', ne: 10, q: 0, L: 113, D: 1072,
      ao: { L: [{ n: '2s', y: 0, e: [1, 1] }, { n: '2p', y: 0, nOrb: 3, e: [2, 0] }], R: [{ n: '2s', y: 0, e: [1, 1] }, { n: '2p', y: 0, nOrb: 3, e: [3, 1] }] },
      aoE: { L: [-19.4, -10.6], R: [-32.4, -15.9] },
      mos: [['3σ', -36, 'b', 1, [['R', 0], ['L', 1]]], ['4σ*', -21, 'a', 1, [['L', 0], ['R', 1]]], ['1π', -17.5, 'b', 2, [['L', 1], ['R', 1]]], ['5σ', -14, 'n', 1, [['L', 0], ['R', 1]]], ['2π*', -5.5, 'a', 2, [['L', 1], ['R', 1]]], ['6σ*', 3, 'a', 1, [['L', 1], ['R', 1]]]] },
    'NO': { title: 'NO', left: 'N', right: 'O', ne: 11, q: 0, L: 115, D: 631,
      ao: { L: [{ n: '2s', y: 0, e: [1, 1] }, { n: '2p', y: 0, nOrb: 3, e: [3, 0] }], R: [{ n: '2s', y: 0, e: [1, 1] }, { n: '2p', y: 0, nOrb: 3, e: [3, 1] }] },
      aoE: { L: [-25.6, -13.2], R: [-32.4, -15.9] },
      mos: [['2σ', -35, 'b', 1, [['R', 0], ['L', 1]]], ['3σ*', -24, 'a', 1, [['L', 0], ['R', 1]]], ['1π', -17.5, 'b', 2, [['L', 1], ['R', 1]]], ['4σ', -15.5, 'b', 1, [['L', 1], ['R', 1]]], ['2π*', -8, 'a', 2, [['L', 1], ['R', 1]]], ['5σ*', 2, 'a', 1, [['L', 1], ['R', 1]]]] },
    'HF': { title: 'HF', left: 'H', right: 'F', ne: 8, q: 0, L: 92, D: 565,
      ao: { L: [{ n: '1s', y: 0, e: [1, 0] }], R: [{ n: '2s', y: 0, e: [1, 1] }, { n: '2p', y: 0, nOrb: 3, e: [3, 2] }] },
      aoE: { L: [-13.6], R: [-40.2, -18.7] },
      mos: [['1σ', -40, 'n', 1, [['R', 0]]], ['2σ', -22, 'b', 1, [['L', 0], ['R', 1]]], ['1π', -18.7, 'n', 2, [['R', 1]]], ['3σ*', -5, 'a', 1, [['L', 0], ['R', 1]]]] }
  };
  function specHet(key) {
    var d = HET[key], ymin = -44, ymax = 6, y = function (e) { return 400 - (e - ymin) / (ymax - ymin) * 340; }, ne = d.ne;
    var ao = { L: d.ao.L.map(function (a, i) { return Object.assign({}, a, { y: y(d.aoE.L[i]) }); }), R: d.ao.R.map(function (a, i) { return Object.assign({}, a, { y: y(d.aoE.R[i]) }); }) };
    var levels = d.mos.map(function (m) { return [m[0], m[3] * 2, m[2]]; }), mos = fill(levels, ne);
    mos.forEach(function (m, i) { m.y = y(d.mos[i][1]); m.from = d.mos[i][4]; });
    return { title: d.title, left: d.left, right: d.right, ao: ao, mos: mos, an: analyze(mos), L: d.L, D: d.D };
  }

  /* orbitales moleculares como mapa de ψ (LCAO hidrogenoide) */
  var MOSHAPES = [
    ['σ1s', '1s', 'σ', 'φA + φB'], ['σ*1s', '1s', 'σ*', 'φA − φB'], ['σ2s', '2s', 'σ', '2sA + 2sB'], ['σ*2s', '2s', 'σ*', '2sA − 2sB'],
    ['σ2p', '2pa', 'σ', '2pₓA − 2pₓB'], ['σ*2p', '2pa', 'σ*', '2pₓA + 2pₓB'], ['π2p', '2pp', 'π', '2p_yA + 2p_yB'], ['π*2p', '2pp', 'π*', '2p_yA − 2p_yB']
  ];
  function drawMO(cv, idx, R) {
    var ctx = cv.getContext('2d'), W = cv.width, H = cv.height, t = MOSHAPES[idx][1], n2 = t !== '1s', Lx = R / 2 + (n2 ? 11 : 4.6), Ly = Lx * H / W, img = ctx.createImageData(W, H), d = img.data, ax = -R / 2, bx = R / 2, minus = /−/.test(MOSHAPES[idx][3]);
    function phi(x, y, cx, kind) {
      var dx = x - cx, r = Math.sqrt(dx * dx + y * y);
      if (kind === '1s') return Math.exp(-r);
      if (kind === '2s') return (2 - r) * Math.exp(-r / 2) * .5;
      if (kind === '2pa') return dx * Math.exp(-r / 2) * .5;
      return y * Math.exp(-r / 2) * .5;
    }
    var max = 0, vals = new Float32Array(W * H), i, j, x, y, v, sgn = minus ? -1 : 1;
    for (j = 0; j < H; j++) for (i = 0; i < W; i++) {
      x = (i / W * 2 - 1) * Lx; y = (j / H * 2 - 1) * Ly;
      v = phi(x, y, ax, t) + sgn * phi(x, y, bx, t);
      vals[j * W + i] = v; if (Math.abs(v) > max) max = Math.abs(v);
    }
    var sig = !/\*/.test(MOSHAPES[idx][2]);
    for (j = 0; j < H; j++) for (i = 0; i < W; i++) {
      v = vals[j * W + i] / (max || 1); var a = Math.pow(Math.abs(v), .8), o = (j * W + i) * 4;
      if (v >= 0) { d[o] = 255 * a + 11 * (1 - a); d[o + 1] = 107 * a + 11 * (1 - a); d[o + 2] = 74 * a + 14 * (1 - a); } else { d[o] = 121 * a + 11 * (1 - a); d[o + 1] = 166 * a + 11 * (1 - a); d[o + 2] = 228 * a + 14 * (1 - a); }
      d[o + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    [ax, bx].forEach(function (cx) { var px = (cx / Lx + 1) / 2 * W; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px, H / 2, 3.2, 0, 6.283); ctx.fill(); });
  }

  function omView(p) {
    var list = '<optgroup label="Homonucleares">' + HOMO.map(function (d, i) { return '<option value="h' + i + '">' + d.f + ' (' + d.n.toLowerCase() + ')</option>'; }).join('') + '</optgroup><optgroup label="Heteronucleares">' + ['CO', 'NO', 'HF'].map(function (k) { return '<option value="x' + k + '">' + k + '</option>'; }).join('') + '</optgroup>';
    p.innerHTML =
      '<section class="card"><div class="bar"><label class="sel"><select id="om" aria-label="Molécula">' + list + '</select></label></div><div class="grid2"><div id="omd" class="omd"></div><div id="omi"></div></div></section>' +
      '<section class="card"><h2 class="sec">Forma de los orbitales moleculares</h2><div class="pills" id="omp" role="group" aria-label="Orbital molecular"></div>' +
      '<div class="grid2 eq" style="margin-top:14px"><div><canvas id="omc" class="cv" width="520" height="300" style="aspect-ratio:520/300;cursor:default" role="img" aria-label="Mapa de la función de onda"></canvas><div class="range" style="margin-top:8px"><label for="omr">Distancia entre núcleos</label><input id="omr" type="range" min="1" max="9" step=".05" value="4" style="flex:1"><output id="omro" class="mono">4,0 a₀</output></div><div class="leg2"><span><i style="--c:#ff6b4a"></i>ψ positiva</span><span><i style="--c:#79a6e4"></i>ψ negativa</span></div></div><div id="omt"></div></div></section>' +
      '<section class="card"><h2 class="sec">Diatómicas homonucleares</h2><div class="tscroll"><table class="t" id="omtab"></table></div></section>' +
      '<section class="card"><h2 class="sec">Ideas clave</h2><div class="grid2 eq"><div><ul class="bul"><li>Los orbitales atómicos se combinan (LCAO): N orbitales atómicos dan N orbitales moleculares.</li><li>Enlazante: densidad entre los núcleos y menor energía. Antienlazante (*): plano nodal entre los núcleos y mayor energía.</li><li>Para combinarse necesitan energía parecida, simetría compatible y solapamiento.</li><li>σ: solapamiento frontal. π: solapamiento lateral con un plano nodal que contiene el eje.</li></ul>' +
      '' + TP.F('OE=\\dfrac{e^-_{\\text{enlazantes}}-e^-_{\\text{antienlazantes}}}{2}') + '</div><div><ul class="bul"><li>OE = 0: la molécula no existe.</li><li>Más OE: enlace más corto y fuerte.</li><li>Con electrones desapareados es paramagnética; si todos están apareados, diamagnética.</li><li>Li₂ a N₂: el σ2p sube sobre el π2p por la mezcla s-p. Desde O₂ el orden es σ2p &lt; π2p.</li><li>En heteronucleares, el orbital enlazante se parece al átomo más electronegativo.</li></ul></div></div></section>';
    var sel = $('#om', p); sel.value = TP.store.get('om', 'h9');
    function spec() { var v = sel.value; if (v.charAt(0) === 'h') { var d = HOMO[+v.slice(1)]; return Object.assign({ d: d }, specHomo(d), { L: d.L, D: d.D }); } return specHet(v.slice(1)); }
    function render() {
      TP.store.set('om', sel.value);
      var s = spec(), d = s.d, an = s.an;
      moDiagram($('#omd', p), s);
      var confStr = s.mos.filter(function (m) { return m.e > 0; }).map(function (m) { return m.n + '<sup>' + m.e + '</sup>'; }).join(' ');
      var ne = d ? 2 * d.z - d.q : HET[sel.value.slice(1)].ne;
      $('#omi', p).innerHTML = '<dl class="kv"><dt>Electrones' + (d ? '' : ' de valencia') + '</dt><dd>' + ne + '</dd><dt>Configuración</dt><dd>' + confStr + '</dd><dt>Enlazantes (N<sub>b</sub>)</dt><dd>' + an.nb + '</dd><dt>Antienlazantes (N<sub>a</sub>)</dt><dd>' + an.na + '</dd><dt>Orden de enlace</dt><dd>' + TP.num(an.bo, 1) + '</dd><dt>Magnetismo</dt><dd>' + (an.up ? 'Paramagnético (' + an.up + ' desapareado' + (an.up > 1 ? 's' : '') + ')' : 'Diamagnético') + '</dd><dt>Longitud de enlace</dt><dd>' + (s.L ? s.L + ' pm' : 'n/d') + '</dd><dt>Energía de enlace</dt><dd>' + (s.D ? TP.num(s.D, 0) + ' kJ/mol' : 'n/d') + '</dd><dt>¿Existe?</dt><dd>' + (an.bo > 0 ? 'Sí' : 'No') + '</dd></dl>' +
        '' + TP.F('OE=\\dfrac{' + an.nb + '-' + an.na + '}{2}=' + TP.tn(an.bo, 1)) + '' +
        '<div class="leg2"><span><i style="--c:#ff6b4a"></i>enlazante</span><span><i style="--c:#79a6e4"></i>antienlazante</span><span><i style="--c:#a1a1aa"></i>no enlazante</span></div>';
      $$('#omtab tr[data-i]', p).forEach(function (r) { r.classList.toggle('me', 'h' + r.dataset.i === sel.value); });
    }
    sel.addEventListener('change', render); render();
    p._sync = function () { var v = TP.store.get('om', 'h9'); if (sel.value !== v) { sel.value = v; render(); } };

    var pills = $('#omp', p), cur = 0;
    pills.innerHTML = MOSHAPES.map(function (m, i) { return '<button type="button" class="pill" data-i="' + i + '" aria-pressed="false">' + m[0] + '</button>'; }).join('');
    var rng = $('#omr', p), DEF = [1.4, 1.4, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5];
    function mo() {
      var i = cur, m = MOSHAPES[i], R = +rng.value; $('#omro', p).textContent = TP.num(R, 1) + ' a₀';
      $$('#omp button', p).forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.i === i ? 'true' : 'false'); });
      drawMO($('#omc', p), i, R);
      var node = { 'σ': 'Sin plano nodal entre los núcleos: la densidad se acumula entre ellos.', 'σ*': 'Plano nodal perpendicular al eje, entre los núcleos: sin densidad entre ellos.', 'π': 'Un plano nodal que contiene el eje: lóbulos arriba y abajo.', 'π*': 'Un plano nodal con el eje y otro entre los núcleos.' }[m[2]];
      $('#omt', p).innerHTML = '<dl class="kv"><dt>Combinación</dt><dd>' + m[3] + '</dd><dt>Tipo</dt><dd>' + (m[2].indexOf('*') >= 0 ? 'Antienlazante' : 'Enlazante') + ' ' + m[2].replace('*', '') + '</dd><dt>Planos nodales</dt><dd>' + ({ 'σ': 0, 'σ*': 1, 'π': 1, 'π*': 2 }[m[2]]) + '</dd></dl><p class="prose" style="margin-top:12px">' + node + '</p>';
    }
    pills.addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b) return; cur = +b.dataset.i; rng.value = DEF[cur]; mo(); });
    rng.addEventListener('input', mo); rng.value = DEF[0]; mo();

    var maxD = 945;
    $('#omtab', p).innerHTML = '<thead><tr><th>Especie</th><th class="n">Electrones</th><th class="n">OE</th><th>Magnetismo</th><th class="n">Longitud (pm)</th><th class="n">Energía (kJ/mol)</th></tr></thead><tbody>' + HOMO.map(function (d, i) {
      var s = specHomo(d), an = s.an;
      return '<tr data-i="' + i + '"' + (sel.value === 'h' + i ? ' class="me"' : '') + '><td class="mono"><a href="#" data-i="' + i + '">' + d.f + '</a></td><td class="n">' + (2 * d.z - d.q) + '</td><td class="n">' + TP.num(an.bo, 1) + '</td><td>' + (an.up ? 'Paramagnético' : 'Diamagnético') + '</td><td class="n">' + (d.L || 'n/d') + '</td><td class="n">' + (d.D ? '<span class="rb" style="width:70px"><i style="width:' + (d.D / maxD * 100) + '%"></i></span> ' + d.D : 'n/d') + '</td></tr>';
    }).join('') + '</tbody>';
    $('#omtab', p).addEventListener('click', function (ev) { var a = ev.target.closest('a[data-i]'); if (!a) return; ev.preventDefault(); sel.value = 'h' + a.dataset.i; render(); $('#omd', p).scrollIntoView({ block: 'center', behavior: TP.reduced() ? 'auto' : 'smooth' }); });
  }

  /* ---------- vista Van der Waals ---------- */
  var GASES = [['He', 'Helio', .0346, .0238], ['Ne', 'Neón', .208, .0167], ['Ar', 'Argón', 1.355, .0320], ['Kr', 'Kriptón', 2.349, .0398], ['Xe', 'Xenón', 4.250, .0510], ['H₂', 'Hidrógeno', .2476, .02661], ['N₂', 'Nitrógeno', 1.370, .0387], ['O₂', 'Oxígeno', 1.382, .0319], ['Cl₂', 'Cloro', 6.579, .0562], ['CO₂', 'Dióxido de carbono', 3.658, .0429], ['CH₄', 'Metano', 2.303, .0431], ['NH₃', 'Amoníaco', 4.225, .0371], ['H₂O', 'Agua', 5.537, .0305]];
  var RG = 0.08314; /* L·bar/(mol·K) */

  function vdwView(p) {
    var withR = E.filter(function (x) { return x.rvdw != null; });
    p.innerHTML =
      '<section class="card"><div class="card-h"><h2 class="sec">Radio de van der Waals</h2><label class="sel"><select id="vz" aria-label="Elemento">' + withR.map(function (x) { return '<option value="' + x.z + '">' + x.name + ' (' + x.sym + ')</option>'; }).join('') + '</select></label></div>' +
      '<div class="grid2 eq"><div id="vsvg" class="vsvg"></div><div><dl class="kv" id="vkv"></dl>' + TP.F('d_{\\text{contacto}}=2\\,r_{vdW}\\qquad d_{\\text{enlace}}=2\\,r_{cov}') + '</div></div>' +
      '<div class="chart" id="vch" style="margin-top:18px"><div class="tip"></div></div><div class="leg2"><span><i style="--c:#fff"></i>elemento elegido</span>' + TP.catSpans() + '</div></section>' +
      '<section class="card"><div class="card-h"><h2 class="sec">Gases reales</h2><label class="sel"><select id="gg" aria-label="Gas">' + GASES.map(function (g, i) { return '<option value="' + i + '">' + g[1] + ' (' + g[0] + ')</option>'; }).join('') + '</select></label></div>' +
      TP.F('\\left(P+\\dfrac{a\\,n^{2}}{V^{2}}\\right)\\left(V-n\\,b\\right)=n\\,R\\,T') +
      '<div class="grid2 eq"><div><div class="range"><label for="gt">Temperatura</label><input id="gt" type="range" min="40" max="800" step="1" value="300"><output id="gto" class="mono"></output></div>' +
      '<div class="range"><label for="gv">Volumen molar</label><input id="gv" type="range" min="0" max="100" step="1" value="40"><output id="gvo" class="mono"></output></div><dl class="kv" id="gkv"></dl></div>' +
      '<div><div class="chart" id="gch"><div class="tip"></div></div><div class="leg2"><span><i style="--c:#ff6b4a"></i>van der Waals</span><span><i style="--c:#a1a1aa"></i>gas ideal</span><span><i style="--c:#79a6e4"></i>punto crítico</span></div></div></div></section>' +
      '<div class="grid2 eq"><section class="card"><h2 class="sec">Ebullición y fuerzas de London</h2><div class="chart" id="bch"><div class="tip"></div></div><div class="leg2"><span><i style="--c:#d98fc4"></i>gases nobles</span><span><i style="--c:#a597e6"></i>halógenos</span></div></section>' +
      '<section class="card"><h2 class="sec">Fuerzas intermoleculares</h2><div class="tscroll"><table class="t"><thead><tr><th>Fuerza</th><th>Se da entre</th><th class="n">Energía (kJ/mol)</th></tr></thead><tbody><tr><td>London (dispersión)</td><td>cualquier molécula; crece con el tamaño</td><td class="n">0,05 a 40</td></tr><tr><td>Dipolo con dipolo</td><td>moléculas polares</td><td class="n">5 a 25</td></tr><tr><td>Puente de hidrógeno</td><td>H unido a N, O o F</td><td class="n">10 a 40</td></tr><tr><td>Ion con dipolo</td><td>un ion y una molécula polar</td><td class="n">40 a 600</td></tr></tbody></table></div><p class="prose" style="margin-top:12px">Todas se llaman fuerzas de van der Waals salvo el puente de hidrógeno y el ion con dipolo, que son más intensas.</p></section></div>';

    /* radios */
    function pm(v) { return v == null ? 'n/d' : TP.num(v, 0) + ' pm'; }
    var vz = $('#vz', p); vz.value = TP.store.get('vdwZ', 18);
    function radios() {
      var e = E[+vz.value - 1]; TP.store.set('vdwZ', e.z);
      var rv = e.rvdw, rc = e.rcov, ra = e.rat, W = 360, H = 300, svg = TP.svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Radio covalente y de van der Waals de ' + e.name });
      var cc = TP.CAT[e.cat].c, s = Math.min(52 / Math.max(rv, 100), .3), y1 = 64, y2 = 200;
      function pair(y, r, d, op, dash, fill) { [-1, 1].forEach(function (sg) { TP.svgEl('circle', { cx: W / 2 + sg * d * s / 2, cy: y, r: r * s, fill: fill ? cc : 'none', 'fill-opacity': op, stroke: cc, 'stroke-width': 1.6, 'stroke-dasharray': dash || '' }, svg); }); }
      pair(y1, rv, 2 * rv, .22);
      TP.svgEl('line', { x1: W / 2 - rv * s, x2: W / 2 + rv * s, y1: y1, y2: y1, stroke: 'rgba(255,255,255,.55)', 'stroke-width': 1 }, svg);
      TP.svgEl('text', { x: W / 2, y: y1 + rv * s + 22, 'text-anchor': 'middle', style: 'fill:var(--fg-2)' }, svg).textContent = 'Contacto sin enlace: ' + TP.num(2 * rv, 0) + ' pm';
      if (rc != null) {
        pair(y2, rc, 2 * rc, .45, '', true);
        TP.svgEl('text', { x: W / 2, y: y2 + rc * s + 22, 'text-anchor': 'middle', style: 'fill:var(--fg-2)' }, svg).textContent = 'Enlace covalente: ' + TP.num(2 * rc, 0) + ' pm';
      }
      var host = $('#vsvg', p); host.innerHTML = ''; host.appendChild(svg);
      $('#vkv', p).innerHTML = '<dt>Radio de van der Waals</dt><dd>' + pm(rv) + '</dd><dt>Radio covalente</dt><dd>' + pm(rc) + '</dd><dt>Radio atómico</dt><dd>' + pm(ra) + '</dd><dt>Relación vdW / covalente</dt><dd>' + (rc ? TP.num(rv / rc, 2) : 'n/d') + '</dd>';
      var pts = E.filter(function (x) { return x.rvdw != null; }).map(function (x) { return { x: x.z, y: x.rvdw, e: x }; });
      var ch = $('#vch', p); ch.innerHTML = '<div class="tip"></div>';
      TP.xy(ch, pts, { label: 'Radio de van der Waals frente a Z', xl: 'Número atómico', yl: 'pm', x0: 0, line: false, hl: e.z, labels: ['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn'], tip: function (q) { return TP.num(q.y, 0) + ' pm'; } });
    }
    vz.addEventListener('change', radios); radios();

    /* gases reales */
    var gg = $('#gg', p), gt = $('#gt', p), gv = $('#gv', p);
    function gas() { return GASES[+gg.value]; }
    function crit(g) { var a = g[2], b = g[3]; return { Tc: 8 * a / (27 * RG * b), Pc: a / (27 * b * b), Vc: 3 * b }; }
    function volOf(g) { var c = crit(g), lo = Math.max(1.15 * g[3], .04), hi = 6; return Math.exp(Math.log(lo) + (Math.log(hi) - Math.log(lo)) * (+gv.value / 100)); }
    function gases() {
      var g = gas(), c = crit(g), T = +gt.value, V = volOf(g), a = g[2], b = g[3];
      var Pi = RG * T / V, Pv = RG * T / (V - b) - a / (V * V), Z = Pv * V / (RG * T);
      $('#gto', p).textContent = TP.num(T, 0) + ' K'; $('#gvo', p).textContent = TP.num(V, V < 1 ? 3 : 2) + ' L/mol';
      $('#gkv', p).innerHTML = '<dt>a / b</dt><dd>' + TP.num(a, 3) + ' L²·bar/mol² / ' + TP.num(b, 4) + ' L/mol</dd><dt>P ideal</dt><dd>' + TP.num(Pi, Pi < 1 ? 3 : 2) + ' bar</dd><dt>P de van der Waals</dt><dd>' + TP.num(Pv, Math.abs(Pv) < 1 ? 3 : 2) + ' bar</dd><dt>Factor de compresibilidad Z</dt><dd>' + TP.num(Z, 3) + '</dd><dt>Temperatura crítica</dt><dd>' + TP.num(c.Tc, 1) + ' K</dd><dt>Presión crítica</dt><dd>' + TP.num(c.Pc, 1) + ' bar</dd><dt>Volumen crítico</dt><dd>' + TP.num(c.Vc, 3) + ' L/mol</dd>';
      var host = $('#gch', p), tip = host.querySelector('.tip');
      TP.mountChart(host, function (W) {
        var H = 300, m = { l: W < 520 ? 46 : 54, r: 12, t: 14, b: 44 }, lo = Math.max(1.15 * b, .04), hi = 6, ymax = Math.max(c.Pc * 4, 5);
        var svg = TP.svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-label': 'Presión frente a volumen: gas ideal y de van der Waals' }), i;
        function X(v) { return m.l + (Math.log(v) - Math.log(lo)) / (Math.log(hi) - Math.log(lo)) * (W - m.l - m.r); }
        function Y(pp) { return H - m.b - Math.max(-.05 * ymax, Math.min(1.05 * ymax, pp)) / ymax * (H - m.t - m.b); }
        TP.niceTicks(0, ymax, false).forEach(function (t) { svgEl(svg, 'line', { x1: m.l, x2: W - m.r, y1: Y(t), y2: Y(t), class: 'grid' }); svgEl(svg, 'text', { x: m.l - 8, y: Y(t) + 4, 'text-anchor': 'end' }).textContent = TP.tick(t); });
        [.05, .1, .2, .5, 1, 2, 5].forEach(function (t) { if (t > lo && t < hi) svgEl(svg, 'text', { x: X(t), y: H - 24, 'text-anchor': 'middle' }).textContent = TP.num(t, t < 1 ? 2 : 0); });
        svgEl(svg, 'line', { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, class: 'axis' });
        svgEl(svg, 'text', { x: (m.l + W) / 2, y: H - 4, 'text-anchor': 'middle' }).textContent = 'volumen molar (L/mol, escala logarítmica)'; svgEl(svg, 'text', { x: 4, y: 12, style: 'fill:var(--fg-2)' }).textContent = 'P (bar)';
        var cid = 'c' + Math.round(Math.random() * 1e6), cp = svgEl(svg, 'clipPath', { id: cid }); svgEl(cp, 'rect', { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b });
        function path(fn, col, dash, w) { var d = '', k, v; for (k = 0; k <= 240; k++) { v = Math.exp(Math.log(lo) + (Math.log(hi) - Math.log(lo)) * k / 240); var pv = fn(v); if (!isFinite(pv)) continue; d += (d ? 'L' : 'M') + X(v).toFixed(1) + ' ' + Y(pv).toFixed(1); } svgEl(svg, 'path', { d: d, fill: 'none', stroke: col, 'stroke-width': w || 2, 'stroke-dasharray': dash || '', 'clip-path': 'url(#' + cid + ')' }); }
        if (Math.abs(T - c.Tc) > 1) path(function (v) { return v > b ? RG * c.Tc / (v - b) - a / (v * v) : NaN; }, 'rgba(121,166,228,.45)', '2 4', 1.4);
        path(function (v) { return RG * T / v; }, '#a1a1aa', '5 5', 1.8);
        path(function (v) { return v > b * 1.0001 ? RG * T / (v - b) - a / (v * v) : NaN; }, '#ff6b4a', '', 2.4);
        if (c.Vc > lo && c.Vc < hi) { svgEl(svg, 'circle', { cx: X(c.Vc), cy: Y(c.Pc), r: 5, fill: '#79a6e4', stroke: '#08080a', 'stroke-width': 2 }); svgEl(svg, 'text', { x: X(c.Vc) + 9, y: Y(c.Pc) - 8, style: 'fill:var(--fg-2)' }).textContent = 'crítico'; }
        svgEl(svg, 'line', { x1: X(V), x2: X(V), y1: m.t, y2: H - m.b, stroke: 'rgba(255,255,255,.45)', 'stroke-dasharray': '3 4' });
        svgEl(svg, 'circle', { cx: X(V), cy: Y(Pv), r: 5, fill: '#ff6b4a', stroke: '#fff', 'stroke-width': 2 }); svgEl(svg, 'circle', { cx: X(V), cy: Y(Pi), r: 4, fill: '#a1a1aa', stroke: '#fff', 'stroke-width': 1.5 });
        host.insertBefore(svg, tip);
      });
    }
    function svgEl(parent, tag, attrs) { return TP.svgEl(tag, attrs, parent); }
    gg.addEventListener('change', gases); gt.addEventListener('input', gases); gv.addEventListener('input', gases); gases();

    /* ebullición: gases nobles y halógenos */
    var bh = $('#bch', p), grp = [['ng', '#d98fc4'], ['ha', '#a597e6']];
    TP.mountChart(bh, function (W) {
      var H = 280, m = { l: W < 520 ? 46 : 54, r: 12, t: 16, b: 38 }, series = grp.map(function (g) { return [g[1], E.filter(function (x) { return x.cat === g[0] && x.bp != null && x.z <= 86; })]; });
      var all = series.reduce(function (a, s) { return a.concat(s[1]); }, []), ymin = Math.min.apply(null, all.map(function (x) { return x.bp; })), ymax = Math.max.apply(null, all.map(function (x) { return x.bp; })) * 1.1;
      var svg = TP.svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-label': 'Punto de ebullición de gases nobles y halógenos' });
      function X(z) { return m.l + (z - 1) / 85 * (W - m.l - m.r); } function Y(v) { return H - m.b - (v - 0) / ymax * (H - m.t - m.b); }
      TP.niceTicks(0, ymax, false).forEach(function (t) { svgEl(svg, 'line', { x1: m.l, x2: W - m.r, y1: Y(t), y2: Y(t), class: 'grid' }); svgEl(svg, 'text', { x: m.l - 8, y: Y(t) + 4, 'text-anchor': 'end' }).textContent = TP.tick(t); });
      [0, 20, 40, 60, 80].forEach(function (z) { var zz = Math.max(1, z); svgEl(svg, 'text', { x: X(zz), y: H - 20, 'text-anchor': 'middle' }).textContent = zz; });
      svgEl(svg, 'line', { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, class: 'axis' }); svgEl(svg, 'text', { x: 4, y: 12, style: 'fill:var(--fg-2)' }).textContent = 'ebullición (K)';
      var tp = bh.querySelector('.tip');
      series.forEach(function (s) {
        var d = ''; s[1].forEach(function (x, i) { d += (i ? 'L' : 'M') + X(x.z).toFixed(1) + ' ' + Y(x.bp).toFixed(1); }); svgEl(svg, 'path', { d: d, fill: 'none', stroke: s[0], 'stroke-width': 1.8, opacity: .8 });
        s[1].forEach(function (x) { var c = svgEl(svg, 'circle', { cx: X(x.z), cy: Y(x.bp), r: 5, fill: s[0], class: 'pt-dot' }); svgEl(svg, 'text', { x: X(x.z), y: Y(x.bp) - 10, 'text-anchor': 'middle', style: 'fill:var(--fg);font-size:11px' }).textContent = x.sym; c.addEventListener('click', function () { location.href = TP.url(x); }); c.addEventListener('pointerenter', function () { var r = c.getBoundingClientRect(), h = bh.getBoundingClientRect(); tp.innerHTML = '<b>' + x.name + '</b><br><span>' + TP.num(x.bp, x.bp < 100 ? 1 : 0) + ' K</span>'; tp.style.left = Math.max(60, Math.min(h.width - 60, r.left + r.width / 2 - h.left)) + 'px'; tp.style.top = (r.top - h.top) + 'px'; tp.dataset.on = 'true'; }); c.addEventListener('pointerleave', function () { tp.dataset.on = 'false'; }); });
      });
      bh.insertBefore(svg, tp);
    });
  }

  TP.init.enlace = function (p, sub) {
    function sync() { return function (div) { if (div._sync) div._sync(); }; }
    TP.views(p, 'enlace', [
      { id: 'lewis', label: 'Lewis', render: lewisView, show: sync() },
      { id: 'geometria', label: 'Geometría', render: geoView },
      { id: 'om', label: 'Orbitales moleculares', render: omView, show: sync() },
      { id: 'vdw', label: 'Van der Waals', render: vdwView },
      { id: 'tipo', label: 'Tipo de enlace', render: tipoView }
    ], sub);
  };
})();
