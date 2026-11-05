/* Tabla periódica · página principal: tabla, gráficos, vistas y navegación */
(function () {
  var TP = window.TP, E = TP.E, BASE = TP.BASE, $ = TP.$, $$ = TP.$$, esc = TP.esc, svgEl = TP.svgEl;
  var touch = window.matchMedia('(hover: none)');
  TP.store.set('mode', 'cat'); TP.store.set('filter', '');
  var S = { m: TP.store.get('mode', 'cat'), tprop: TP.store.get('tprop', 'en'), temp: 298, unit: TP.store.get('unit', 'K'), q: '', filter: TP.store.get('filter', '') || null, cur: E[0], prop: TP.store.get('prop', 'en') };

  /* ---------- vistas con submenú ---------- */
  TP.sw = {}; TP.last = {};
  TP.views = function (panel, tab, defs, initial, extra) {
    panel.innerHTML = '<div class="vbar"><div class="seg" role="tablist" aria-label="Vistas">' + defs.map(function (d) { return '<button type="button" role="tab" data-v="' + d.id + '" aria-selected="false">' + d.label + '</button>'; }).join('') + '</div>' + (extra || '') + '</div><div class="vbody"></div>';
    var body = $('.vbody', panel), made = {}, curId = null;
    function go(id, push) {
      var d = defs.filter(function (x) { return x.id === id; })[0] || defs[0]; id = d.id;
      $$('.vbar [role=tab]', panel).forEach(function (b) { b.setAttribute('aria-selected', b.dataset.v === id ? 'true' : 'false'); });
      Object.keys(made).forEach(function (k) { made[k].hidden = k !== id; });
      if (!made[id]) { var div = document.createElement('div'); div.className = 'view'; body.appendChild(div); made[id] = div; d.render(div); }
      if (d.show) d.show(made[id]);
      curId = id; TP.last[tab] = id;
      if (push) history.replaceState(null, '', '#' + tab + '/' + id);
    }
    $('.vbar .seg', panel).addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (b) go(b.dataset.v, true); });
    TP.sw[tab] = go;
    go(initial || defs[0].id, false);
    return { go: go, refresh: function () { if (made[curId]) { made[curId].remove(); delete made[curId]; } go(curId, false); }, cur: function () { return curId; } };
  };

  /* ---------- tabla ---------- */
  var MODES = [['cat', 'Categoría'], ['block', 'Bloque'], ['state', 'Estado'], ['prop', 'Propiedad']];
  function infoHTML(e) {
    var u = S.unit;
    return '<div class="big" style="--c:' + TP.CAT[e.cat].c + '"><i>' + e.z + '</i><b>' + e.sym + '</b><small>' + TP.num(e.mass) + ' u</small></div>' +
      '<div class="info-txt"><h2>' + e.name + '</h2><div class="chips"><span class="tag">' + TP.CAT[e.cat].n + '</span>' + (e.group ? '<span class="tag">Grupo ' + e.group + '</span>' : '') + '<span class="tag">Periodo ' + e.period + '</span><span class="tag">Bloque ' + e.block + '</span></div><dl>' +
      '<div><dt>Configuración</dt><dd>' + e.cfgShort + '</dd></div>' +
      '<div><dt>Electronegatividad</dt><dd>' + TP.num(e.en, 2) + '</dd></div>' +
      '<div><dt>Energía de ionización</dt><dd>' + TP.num(e.ie, 1) + ' kJ/mol</dd></div>' +
      '<div><dt>Densidad</dt><dd>' + (e.dens == null ? 'n/d' : TP.num(e.dens) + ' g/cm³') + '</dd></div>' +
      '<div><dt>Fusión</dt><dd>' + TP.temp(e.mp, u) + '</dd></div>' +
      '<div><dt>Ebullición</dt><dd>' + TP.temp(e.bp, u) + '</dd></div></dl>' +
      '<a class="go" href="' + TP.url(e) + '">Ver ficha completa →</a></div>';
  }

  function buildTable(opt) {
    var g = document.createElement('div'); g.className = 'pt'; g.setAttribute('role', 'group'); g.setAttribute('aria-label', 'Tabla periódica');
    var i, c;
    g.appendChild(document.createElement('span'));
    for (c = 1; c <= 18; c++) { var gh = document.createElement('span'); gh.className = 'gh'; gh.textContent = c; gh.style.gridColumn = c + 1; gh.style.gridRow = 1; g.appendChild(gh); }
    for (i = 1; i <= 7; i++) { var ph = document.createElement('span'); ph.className = 'ph'; ph.textContent = i; ph.style.gridRow = i + 1; ph.style.gridColumn = 1; g.appendChild(ph); }
    var gap = document.createElement('span'); gap.className = 'fgap'; gap.style.gridRow = 9; g.appendChild(gap);
    [['6', 10], ['7', 11]].forEach(function (x) { var l = document.createElement('span'); l.className = 'fh'; l.textContent = x[0]; l.style.gridRow = x[1]; l.style.gridColumn = 1; g.appendChild(l); });
    E.forEach(function (e) {
      var a = document.createElement('a'); a.className = 'el'; a.href = TP.url(e); a.dataset.z = e.z;
      a.style.gridColumn = e.col + 1; a.style.gridRow = e.row + 1;
      a.setAttribute('aria-label', e.name + ', número atómico ' + e.z);
      a.innerHTML = '<i>' + e.z + '</i><b>' + e.sym + '</b><small>' + e.name + '</small><em></em>';
      g.appendChild(a);
    });
    if (opt.info) { var inf = document.createElement('div'); inf.className = 'info'; inf.setAttribute('aria-live', 'polite'); g.appendChild(inf); }
    return g;
  }
  TP.buildTable = buildTable;
  function matches(e, q) {
    q = TP.norm(q); if (!q) return true;
    if (/^\d+$/.test(q)) return String(e.z) === q;
    return q.split(' ').every(function (w) { return TP.norm(e.name).indexOf(w) === 0 || TP.norm(e.sym) === w || TP.norm(TP.CAT[e.cat].n).indexOf(w) >= 0; });
  }
  function paintTable(g, mode, o) {
    o = o || {};
    var kind = mode === 'block' ? 'block' : mode === 'state' ? 'state' : mode === 'cat' ? 'cat' : 'scale';
    g.dataset.mode = kind === 'block' ? 'cat' : kind;
    g.classList.toggle('vals', kind === 'scale');
    var rng = kind === 'scale' ? TP.range(mode) : null, p = kind === 'scale' ? TP.prop(mode) : null;
    $$('.el', g).forEach(function (a) {
      var e = E[a.dataset.z - 1], em = $('em', a);
      a.removeAttribute('data-na');
      if (kind === 'cat') a.style.setProperty('--c', TP.CAT[e.cat].c);
      else if (kind === 'block') a.style.setProperty('--c', TP.BLOCK[e.block][1]);
      else if (kind === 'state') a.style.setProperty('--c', TP.STATE[TP.stateAt(e, S.temp)][1]);
      else {
        var v = TP.val(e, mode);
        if (v == null) { a.dataset.na = 'true'; a.style.removeProperty('--bgc'); em.textContent = ''; }
        else {
          var col = TP.ramp(rng.t(v)); a.style.setProperty('--bgc', TP.rgb(col)); a.style.setProperty('--ink', TP.ink(col));
          var vv = p.temp ? (S.unit === 'C' ? v - 273.15 : S.unit === 'F' ? v * 9 / 5 - 459.67 : v) : v;
          em.textContent = p.year ? v : p.log && vv < 0.1 ? TP.tick(vv) : TP.num(vv, p.temp ? 0 : p.d);
        }
      }
      var key = kind === 'cat' ? e.cat : kind === 'block' ? e.block : kind === 'state' ? TP.stateAt(e, S.temp) : null;
      var dim = (o.filter && key !== o.filter) || (o.q && !matches(e, o.q));
      if (dim) a.dataset.dim = 'true'; else a.removeAttribute('data-dim');
    });
  }
  function scaleLegend(host, mode) {
    var p = TP.prop(mode), r = TP.range(mode), f = function (v) { return p.temp ? TP.temp(v, S.unit) : p.year ? v : TP.num(v, p.d) + (p.u ? ' ' + p.u : ''); };
    var lo = E.filter(function (e) { return TP.val(e, mode) === r.lo; })[0], hi = E.filter(function (e) { return TP.val(e, mode) === r.hi; })[0];
    host.className = 'legend';
    host.innerHTML = '<div class="grad"><span>' + lo.sym + ' ' + f(r.lo) + '</span><i class="gbar"></i><span>' + f(r.hi) + ' ' + hi.sym + '</span>' + (p.log ? '<span>escala log</span>' : '') + '<span class="gna"><i></i>sin dato</span></div>';
  }
  function keyLegend(host, mode) {
    host.className = 'legend'; host.innerHTML = '';
    var src = mode === 'cat' ? Object.keys(TP.CAT).map(function (k) { return [k, TP.CAT[k].n, TP.CAT[k].c]; }) : mode === 'block' ? Object.keys(TP.BLOCK).map(function (k) { return [k, TP.BLOCK[k][0], TP.BLOCK[k][1]]; }) : ['s', 'l', 'g', 'u'].map(function (k) { return [k, TP.STATE[k][0], TP.STATE[k][1]]; });
    src.forEach(function (x) {
      var n = mode === 'state' ? E.filter(function (e) { return TP.stateAt(e, S.temp) === x[0]; }).length : null;
      var b = document.createElement('button'); b.type = 'button'; b.dataset.k = x[0]; b.setAttribute('aria-pressed', S.filter === x[0] ? 'true' : 'false');
      b.innerHTML = '<i style="--c:' + x[2] + '"></i>' + x[1] + (n != null ? ' <span class="mono">' + n + '</span>' : '');
      host.appendChild(b);
    });
    host.classList.toggle('dim', !!S.filter);
  }

  var FAM = [['1', 'Alcalinos', 'ns¹', '+1', 'Metales blandos que reaccionan con el agua.'], ['2', 'Alcalinotérreos', 'ns²', '+2', 'Metales reactivos de óxidos básicos.'], ['3 a 12', 'Metales de transición', '(n−1)d ns', 'varios', 'Duros, conductores, compuestos coloreados.'], ['13', 'Térreos', 'ns² np¹', '+3', 'B metaloide; Al, Ga, In, Tl metales.'], ['14', 'Carbonoideos', 'ns² np²', '±4, +2', 'Del no metal C al metal Pb.'], ['15', 'Nitrogenoideos', 'ns² np³', '−3, +3, +5', 'N₂ inerte; Bi metálico.'], ['16', 'Calcógenos', 'ns² np⁴', '−2, +4, +6', 'O oxidante; S, Se, Te en cadenas.'], ['17', 'Halógenos', 'ns² np⁵', '−1, +1 a +7', 'No metales muy electronegativos.'], ['18', 'Gases nobles', 'ns² np⁶', '0', 'Capa completa; casi inertes.']];

  function renderTabla(panel) {
    var propOpts = TP.PROPS.map(function (p) { return '<option value="' + p.k + '">' + p.l + (p.u ? ' (' + p.u + ')' : '') + '</option>'; }).join('');
    panel.innerHTML =
      '<div class="bar"><span class="lbl" id="lbl-m">Colorear por</span><div class="seg" id="mseg" role="group" aria-labelledby="lbl-m">' + MODES.map(function (m) { return '<button type="button" data-m="' + m[0] + '">' + m[1] + '</button>'; }).join('') + '</div>' +
      '<label class="sel" id="psel"><select id="pprop" aria-label="Propiedad">' + propOpts + '</select></label>' +
      '<div class="seg" id="unit" role="group" aria-label="Unidad de temperatura"><button type="button" data-u="K">K</button><button type="button" data-u="C">°C</button><button type="button" data-u="F">°F</button></div></div>' +
      '<div id="legend"></div>' +
      '<div class="tslider" id="tsl"><label for="temp" class="lbl">Temperatura</label><input id="temp" type="range" min="0" max="6000" step="1" value="298"><output id="tout" class="mono"></output></div>' +
      '<div class="ptwrap" id="ptw"></div>' +
      '<details class="acc"><summary>Familias de elementos</summary><div class="body"><div class="tscroll"><table class="t"><thead><tr><th>Grupo</th><th>Familia</th><th>Valencia</th><th>Oxidación</th><th>Rasgos</th></tr></thead><tbody>' + FAM.map(function (f) { return '<tr><td class="mono">' + f[0] + '</td><td>' + f[1] + '</td><td class="mono">' + f[2] + '</td><td class="mono">' + f[3] + '</td><td>' + f[4] + '</td></tr>'; }).join('') + '</tbody></table></div></div></details>';
    var g = buildTable({ info: true }); $('#ptw', panel).appendChild(g);
    var info = $('.info', g), leg = $('#legend', panel), pp = $('#pprop', panel); pp.value = S.tprop;
    function mk() { return S.m === 'prop' ? S.tprop : S.m; }
    function setCur(e) { S.cur = e; $$('.el[aria-current]', g).forEach(function (n) { n.removeAttribute('aria-current'); }); $('.el[data-z="' + e.z + '"]', g).setAttribute('aria-current', 'true'); info.innerHTML = infoHTML(e); info.style.setProperty('--c', TP.CAT[e.cat].c); }
    function refresh() {
      var m = mk(), p = TP.prop(m);
      $('#psel', panel).hidden = S.m !== 'prop'; $('#tsl', panel).hidden = S.m !== 'state'; $('#unit', panel).hidden = !(S.m === 'state' || (p && p.temp));
      $$('#mseg button', panel).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.m === S.m ? 'true' : 'false'); });
      $$('#unit button', panel).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.u === S.unit ? 'true' : 'false'); });
      $('#tout', panel).textContent = TP.temp(S.temp, S.unit);
      if (S.m === 'prop') scaleLegend(leg, m); else keyLegend(leg, m);
      paintTable(g, m, { filter: S.filter, q: S.q }); setCur(S.cur);
    }
    TP._tref = refresh;
    $('#mseg', panel).addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b) return; S.m = b.dataset.m; S.filter = null; refresh(); });
    pp.addEventListener('change', function () { S.tprop = pp.value; TP.store.set('tprop', S.tprop); refresh(); });
    $('#unit', panel).addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b) return; S.unit = b.dataset.u; TP.store.set('unit', S.unit); refresh(); });
    $('#temp', panel).addEventListener('input', function (ev) { S.temp = +ev.target.value; refresh(); });
    leg.addEventListener('click', function (ev) { var b = ev.target.closest('button[data-k]'); if (!b) return; S.filter = S.filter === b.dataset.k ? null : b.dataset.k; refresh(); });
    g.addEventListener('mouseover', function (ev) { var a = ev.target.closest('.el'); if (a && !touch.matches) setCur(E[a.dataset.z - 1]); });
    g.addEventListener('focusin', function (ev) { var a = ev.target.closest('.el'); if (a) setCur(E[a.dataset.z - 1]); });
    g.addEventListener('click', function (ev) { var a = ev.target.closest('.el'); if (!a || !touch.matches) return; ev.preventDefault(); var e = E[a.dataset.z - 1]; setCur(e); openSheet(e); });
    var pos = {}; E.forEach(function (e) { pos[e.row + ',' + e.col] = e; });
    g.addEventListener('keydown', function (ev) {
      var a = ev.target.closest('.el'); if (!a) return;
      var e = E[a.dataset.z - 1], dr = 0, dc = 0;
      if (ev.key === 'ArrowRight') dc = 1; else if (ev.key === 'ArrowLeft') dc = -1; else if (ev.key === 'ArrowDown') dr = 1; else if (ev.key === 'ArrowUp') dr = -1; else return;
      var r = e.row, c = e.col, n = null, k;
      for (k = 0; k < 20 && !n; k++) { r += dr; c += dc; if (r === 8) r += dr; if (r < 1 || r > 10 || c < 1 || c > 18) break; n = pos[r + ',' + c]; }
      if (n) { ev.preventDefault(); $('.el[data-z="' + n.z + '"]', g).focus(); }
    });
    document.addEventListener('tp:q', function (ev) {
      var f = ev.detail ? E.filter(function (e) { return matches(e, ev.detail); }) : [];
      S.q = f.length ? ev.detail : ''; paintTable(g, mk(), { filter: S.filter, q: S.q });
      if (f.length === 1) setCur(f[0]);
    });
    refresh();
  }
  TP.tableMode = function (m, filter) { S.m = m; S.filter = filter || null; TP.go('tabla'); if (TP._tref) TP._tref(); };

  /* hoja inferior (móvil): se cierra con X, botón, toque fuera, Escape o arrastrando hacia abajo */
  var sheet = $('#sheet'), scrim = $('#scrim'), lastFocus = null;
  var XSVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  function sheetHTML(e) {
    var u = S.unit;
    return '<div class="sh-head" id="shh"><span class="grab"></span><button type="button" class="sx" aria-label="Cerrar">' + XSVG + '</button></div>' +
      '<div class="sh-body" style="--c:' + TP.CAT[e.cat].c + '"><div class="sh-top"><div class="sh-tile"><i>' + e.z + '</i><b>' + e.sym + '</b></div><div><h2>' + e.name + '</h2><p>' + TP.num(e.mass) + ' u</p></div></div>' +
      '<div class="chips"><span class="tag">' + TP.CAT[e.cat].n + '</span>' + (e.group ? '<span class="tag">Grupo ' + e.group + '</span>' : '') + '<span class="tag">Periodo ' + e.period + '</span><span class="tag">Bloque ' + e.block + '</span></div>' +
      '<dl class="sh-facts"><div><dt>Configuración</dt><dd>' + e.cfgShort + '</dd></div><div><dt>Electronegatividad</dt><dd>' + TP.num(e.en, 2) + '</dd></div><div><dt>Energía de ionización</dt><dd>' + TP.num(e.ie, 1) + ' kJ/mol</dd></div><div><dt>Densidad</dt><dd>' + (e.dens == null ? 'n/d' : TP.num(e.dens) + ' g/cm³') + '</dd></div><div><dt>Fusión</dt><dd>' + TP.temp(e.mp, u) + '</dd></div><div><dt>Ebullición</dt><dd>' + TP.temp(e.bp, u) + '</dd></div></dl>' +
      '<div class="sh-act"><a class="btn" href="' + TP.url(e) + '">Ver ficha completa</a><button type="button" class="btn ghost sx2">Cerrar</button></div></div>';
  }
  function openSheet(e) {
    lastFocus = document.activeElement; sheet.innerHTML = sheetHTML(e); sheet.style.transform = '';
    sheet.dataset.open = 'true'; scrim.dataset.open = 'true'; document.documentElement.classList.add('sheet-open');
    var x = $('.sx', sheet); if (x) x.focus({ preventScroll: true });
  }
  function closeSheet() {
    if (sheet.dataset.open !== 'true') return;
    sheet.dataset.open = 'false'; scrim.dataset.open = 'false'; sheet.style.transform = ''; document.documentElement.classList.remove('sheet-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  scrim.addEventListener('click', closeSheet);
  sheet.addEventListener('click', function (ev) { if (ev.target.closest('.sx, .sx2')) closeSheet(); });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') closeSheet(); });
  (function drag() {
    var y0 = null, t0 = 0, dy = 0;
    sheet.addEventListener('pointerdown', function (ev) { var h = ev.target.closest('.sh-head, .sh-top'); if (!h || ev.target.closest('.sx')) return; y0 = ev.clientY; t0 = Date.now(); dy = 0; sheet.setPointerCapture(ev.pointerId); sheet.classList.add('dragging'); });
    sheet.addEventListener('pointermove', function (ev) { if (y0 == null) return; dy = Math.max(0, ev.clientY - y0); sheet.style.transform = 'translateY(' + dy + 'px)'; });
    function end() { if (y0 == null) return; var fast = dy / Math.max(1, Date.now() - t0) > .5; y0 = null; sheet.classList.remove('dragging'); if (dy > 90 || (fast && dy > 30)) closeSheet(); else sheet.style.transform = ''; }
    sheet.addEventListener('pointerup', end); sheet.addEventListener('pointercancel', end);
  })();

  /* ---------- gráficos ---------- */
  var PX = {
    en: { def: 'Capacidad de un átomo para atraer los electrones de un enlace.', f: '\\chi_{\\text{Mulliken}}=\\dfrac{EI+AE}{2}', per: 'Aumenta', grp: 'Disminuye', why: 'Átomos pequeños con Z* alta atraen y retienen electrones.', exc: 'F (3,98) es el máximo. Los gases nobles ligeros no tienen valor de Pauling.' },
    ie: { def: 'Energía para quitar el electrón más débil de un átomo gaseoso: X(g) → X⁺(g) + e⁻.', per: 'Aumenta', grp: 'Disminuye', why: 'Más Z* y menor radio retienen al electrón; en el grupo está más lejos y más apantallado.', exc: 'Be > B y N > O (también Mg > Al y P > S).' },
    ea: { def: 'Energía liberada al captar un electrón: X(g) + e⁻ → X⁻(g).', per: 'Aumenta (tendencia)', grp: 'Disminuye (tendencia)', why: 'Más Z* y menor tamaño atraen mejor al electrón extra.', exc: 'Cl > F por repulsión en el F pequeño. Be, Mg, N y los gases nobles no forman anión estable.' },
    rat: { def: 'Distancia del núcleo al electrón externo (mitad de la distancia entre núcleos).', f: 'r\\approx 52{,}9\\ \\text{pm}\\cdot\\dfrac{n^{*2}}{Z^{*}}', per: 'Disminuye', grp: 'Aumenta', why: 'En el periodo crece Z* con la misma capa; en el grupo se añade una capa.', exc: 'Contracción lantánida: Hf ≈ Zr. Los metales de transición casi no cambian.' },
    rcov: { def: 'Radio en enlaces covalentes: mitad de la distancia de enlace entre dos átomos iguales.', per: 'Disminuye', grp: 'Aumenta', why: 'Igual que el radio atómico.', exc: 'Cambia con el orden de enlace (sencillo > doble > triple).' },
    rvdw: { def: 'Radio de la nube electrónica en contacto con otro átomo sin enlace.', per: 'Disminuye', grp: 'Aumenta', why: 'Igual que el radio atómico; siempre es mayor que el covalente.', exc: 'Se mide en sólidos y gases nobles.' },
    zeff: { def: 'Carga que siente un electrón: Z* = Z − σ (reglas de Slater).', f: 'Z^{*}=Z-\\sigma', per: 'Aumenta', grp: 'Casi constante', why: 'Cada electrón de la misma capa apantalla solo 0,35.', exc: 'En d y f el apantallamiento es débil y Z* crece más. Pd no tiene electrones 5s: su electrón más externo es 4d y Z* salta.' },
    mull: { def: 'Escala de electronegatividad basada en propiedades del átomo aislado.', f: '\\chi=\\dfrac{EI+AE}{2}\\ (\\text{eV})', per: 'Aumenta', grp: 'Disminuye', why: 'Un átomo que retiene sus electrones (EI alta) y capta otros (AE alta) es electronegativo.', exc: 'Con AE sin dato se toma 0.' },
    mass: { def: 'Masa promedio de los isótopos naturales, en u.', per: 'Aumenta', grp: 'Aumenta', why: 'Cada elemento añade protones y neutrones.', exc: 'Inversiones por masa: Ar/K, Co/Ni, Te/I, Th/Pa. La tabla se ordena por Z, no por masa.' },
    dens: { def: 'Masa por volumen (g/cm³; gases a 0 °C y 1 atm).', per: 'Sube hasta el centro del bloque d', grp: 'Aumenta', why: 'La masa atómica crece más rápido que el volumen.', exc: 'Os (22,59) e Ir son los más densos; Li flota en agua.' },
    mp: { def: 'Temperatura de fusión: refleja la fuerza del enlace en el sólido.', per: 'Sube y cae (máximo en el centro)', grp: 'Transición sube; alcalinos y halógenos bajan', why: 'W y el diamante tienen enlaces fuertes; los gases nobles solo fuerzas de London.', exc: 'Hg es líquido; Ga funde a 30 °C; el C sublima.' },
    bp: { def: 'Temperatura de ebullición a 1 atm.', per: 'Sube y cae (máximo en el centro)', grp: 'Transición sube; alcalinos y halógenos bajan', why: 'Igual que la fusión: depende de la fuerza entre partículas.', exc: 'He (4,2 K) es el más bajo; W y Re los más altos.' },
    cp: { def: 'Energía para subir 1 K la temperatura de un gramo.', per: 'Disminuye', grp: 'Disminuye', why: 'Más masa por átomo, menos energía por gramo.', exc: 'H (14,3 J/g·K) y He son los máximos.' },
    k: { def: 'Facilidad con que el material conduce calor.', per: 'Máximo en los metales del grupo 11', grp: 'Varía', why: 'Los electrones libres transportan el calor.', exc: 'Ag (429) y Cu (401) lideran; los no metales aíslan.' },
    valence: { def: 'Electrones de la capa externa (en el bloque d, electrones s + d).', per: 'Aumenta de 1 a 8', grp: 'Constante', why: 'Define la familia y el tipo de enlace.', exc: 'El He tiene 2.' },
    unpaired: { def: 'Electrones sin pareja en el átomo aislado (regla de Hund). Causan paramagnetismo.', per: 'Sube y baja', grp: 'Varía', why: 'Depende del llenado de los orbitales p, d y f.', exc: 'Máximos: Cr (6), Mn (5), Gd (8).' },
    year: { def: 'Año de descubrimiento o de primer aislamiento.', per: 'Sin tendencia', grp: 'Sin tendencia', why: 'Los metales reactivos se aislaron con la electrólisis (1800 a 1810); los radiactivos, con la física nuclear.', exc: 'Los elementos de la antigüedad no tienen año.' }
  };
  function propStats(k) {
    var p = TP.prop(k), a = E.filter(function (e) { return TP.val(e, k) != null; }).map(function (e) { return { e: e, v: TP.val(e, k) }; });
    a.sort(function (x, y) { return x.v - y.v; });
    var mean = a.reduce(function (s, x) { return s + x.v; }, 0) / a.length, med = a[Math.floor(a.length / 2)];
    function f(v) { return p.temp ? TP.temp(v, S.unit) : p.year ? Math.round(v) : p.log && v < .1 ? TP.tick(v) : TP.num(v, p.d); }
    return { n: a.length, lo: a[0], hi: a[a.length - 1], mean: mean, med: med, f: f, p: p };
  }
  function showTip(host, tip, node, html) {
    var r = node.getBoundingClientRect(), h = host.getBoundingClientRect();
    tip.innerHTML = html; tip.style.left = Math.max(60, Math.min(h.width - 60, r.left + r.width / 2 - h.left)) + 'px'; tip.style.top = (r.top - h.top) + 'px'; tip.dataset.on = 'true';
  }
  function niceTicks(lo, hi, log) {
    var arr = [], i, v;
    if (log) { for (i = Math.floor(Math.log10(lo)); i <= Math.ceil(Math.log10(hi)); i++) arr.push(Math.pow(10, i)); return arr; }
    var span = hi - lo, step = Math.pow(10, Math.floor(Math.log10(span / 5))), r = span / 5 / step;
    step *= r < 1.5 ? 1 : r < 3 ? 2 : r < 7 ? 5 : 10;
    for (v = Math.ceil(lo / step - 1e-9) * step; v <= hi + step * 1e-9; v += step) arr.push(+v.toFixed(10));
    return arr;
  }
  TP.niceTicks = niceTicks;
  function axisY(svg, m, W, H, lo, hi, log, fmt) {
    var tr = log ? Math.log : function (v) { return v; }, a = tr(lo), b = tr(hi);
    function Y(v) { return H - m.b - (tr(v) - a) / (b - a || 1) * (H - m.t - m.b); }
    niceTicks(lo, hi, log).forEach(function (tv) { if (tv < lo * (log ? .999 : 1) - 1e-9 || tv > hi * (log ? 1.001 : 1) + 1e-9) return; var y = Y(tv); svgEl('line', { x1: m.l, x2: W - m.r, y1: y, y2: y, class: 'grid' }, svg); svgEl('text', { x: m.l - 8, y: y + 4, 'text-anchor': 'end' }, svg).textContent = fmt(tv); });
    return Y;
  }
  function range(vals, p) { var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals); if (!p.log && lo > 0 && (hi - lo) / hi > .4) lo = 0; return [lo, hi]; }

  function cvt(v) { return S.unit === 'C' ? v - 273.15 : S.unit === 'F' ? v * 9 / 5 - 459.67 : v; }
  function yUnit(k, p) { return p.temp ? (S.unit === 'C' ? '°C' : S.unit === 'F' ? '°F' : 'K') : (p.u || { en: 'χ', zeff: 'Z*', valence: 'e⁻', unpaired: 'e⁻', year: 'año' }[k] || ''); }
  function lineChart(host, k, hl) {
    var p = TP.prop(k), V = function (e) { var v = TP.val(e, k); return v == null ? null : (p.temp ? cvt(v) : v); }, pts = E.filter(function (e) { return V(e) != null; });
    TP.mountChart(host, function (W) {
      var H = W < 520 ? 280 : 340, m = { l: W < 520 ? 44 : 54, r: 10, t: 24, b: 32 }, r = range(pts.map(function (e) { return V(e); }), p);
      var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-label': p.l + ' frente al número atómico' }), i;
      function X(z) { return m.l + (z - 1) / 117 * (W - m.l - m.r); }
      var Y = axisY(svg, m, W, H, r[0], r[1], p.log, function (v) { return p.year ? Math.round(v) : TP.tick(v); });
      var bounds = [0, 2, 10, 18, 36, 54, 86, 118];
      for (i = 0; i < bounds.length - 1; i++) {
        var x1 = X(bounds[i] + 1), x2 = X(bounds[i + 1] + 1);
        if (i) svgEl('line', { x1: x1 - 3, x2: x1 - 3, y1: m.t - 8, y2: H - m.b, class: 'grid', 'stroke-dasharray': '3 4' }, svg);
        if (x2 - x1 > 22) svgEl('text', { x: (x1 + x2) / 2 - 3, y: 12, 'text-anchor': 'middle' }, svg).textContent = 'P' + (i + 1);
      }
      var step = W < 520 ? 30 : 20; for (i = 0; i <= 118; i += step) { var z = Math.max(1, i); svgEl('text', { x: X(z), y: H - 10, 'text-anchor': 'middle' }, svg).textContent = z; }
      svgEl('line', { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, class: 'axis' }, svg);
      svgEl('text', { x: 4, y: 12, style: 'fill:var(--fg-2)' }, svg).textContent = yUnit(k, p);
      var per = {}; pts.forEach(function (e) { (per[e.period] = per[e.period] || []).push(e); });
      Object.keys(per).forEach(function (pp) {
        var d = ''; per[pp].sort(function (u, v) { return u.z - v.z; }).forEach(function (e, j) { d += (j ? 'L' : 'M') + X(e.z).toFixed(1) + ' ' + Y(V(e)).toFixed(1); });
        svgEl('path', { d: d, class: 'ln', stroke: '#fff' }, svg);
      });
      var tip = host.querySelector('.tip');
      pts.forEach(function (e) {
        var c = svgEl('circle', { cx: X(e.z), cy: Y(V(e)), r: 3.6, class: 'pt-dot', fill: TP.CAT[e.cat].c }, svg);
        c.addEventListener('pointerenter', function () { showTip(host, tip, c, '<b>' + e.name + '</b> <span>' + e.sym + ', Z ' + e.z + '</span><br><span>' + TP.fmtProp(e, p, S.unit) + '</span>'); });
        c.addEventListener('pointerleave', function () { tip.dataset.on = 'false'; });
        c.addEventListener('click', function () { location.href = TP.url(e); });
        if (hl === e.z) { c.setAttribute('r', 7); c.setAttribute('stroke', '#fff'); c.setAttribute('stroke-width', 2); svgEl('text', { x: X(e.z), y: Y(V(e)) - 12, 'text-anchor': 'middle', style: 'fill:var(--fg);font-weight:600' }, svg).textContent = e.sym; }
      });
      host.insertBefore(svg, tip);
    });
  }
  var PCOL = ['#e5806a', '#e3a857', '#b9c46c', '#6fbf9a', '#5db7c4', '#79a6e4', '#a597e6'];
  function groupChart(host, k, hl) {
    var p = TP.prop(k), V = function (e) { var v = TP.val(e, k); return v == null ? null : (p.temp ? cvt(v) : v); }, els = E.filter(function (e) { return e.group && V(e) != null; });
    TP.mountChart(host, function (W) {
      var H = W < 520 ? 280 : 340, m = { l: W < 520 ? 44 : 54, r: 10, t: 14, b: 32 }, r = range(els.map(function (e) { return V(e); }), p);
      var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-label': p.l + ' por grupo y periodo' }), i;
      function X(g) { return m.l + (g - 1) / 17 * (W - m.l - m.r); }
      var Y = axisY(svg, m, W, H, r[0], r[1], p.log, function (v) { return p.year ? Math.round(v) : TP.tick(v); });
      for (i = 1; i <= 18; i++) if (W >= 520 || i % 2) svgEl('text', { x: X(i), y: H - 10, 'text-anchor': 'middle' }, svg).textContent = i;
      svgEl('line', { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, class: 'axis' }, svg);
      svgEl('text', { x: 4, y: 12, style: 'fill:var(--fg-2)' }, svg).textContent = yUnit(k, p);
      var tip = host.querySelector('.tip');
      for (var pr = 1; pr <= 7; pr++) {
        var arr = els.filter(function (e) { return e.period === pr; }).sort(function (u, v) { return u.group - v.group; }), d = '';
        arr.forEach(function (e, j) { d += (j ? 'L' : 'M') + X(e.group).toFixed(1) + ' ' + Y(V(e)).toFixed(1); });
        svgEl('path', { d: d, class: 'ln', stroke: PCOL[pr - 1], 'stroke-width': 1.8, opacity: .85 }, svg);
        arr.forEach(function (e) {
          var c = svgEl('circle', { cx: X(e.group), cy: Y(V(e)), r: 3.8, class: 'pt-dot', fill: PCOL[pr - 1] }, svg);
          c.addEventListener('pointerenter', function () { showTip(host, tip, c, '<b>' + e.name + '</b> <span>' + e.sym + ', periodo ' + e.period + '</span><br><span>' + TP.fmtProp(e, p, S.unit) + '</span>'); });
          c.addEventListener('pointerleave', function () { tip.dataset.on = 'false'; });
          c.addEventListener('click', function () { location.href = TP.url(e); });
          if (hl === e.z) { c.setAttribute('r', 7); c.setAttribute('stroke', '#fff'); c.setAttribute('stroke-width', 2); svgEl('text', { x: X(e.group), y: Y(V(e)) - 12, 'text-anchor': 'middle', style: 'fill:var(--fg);font-weight:600' }, svg).textContent = e.sym; }
        });
      }
      host.insertBefore(svg, tip);
    });
    var lg = document.createElement('div'); lg.className = 'legend'; lg.style.marginTop = '12px';
    lg.innerHTML = PCOL.map(function (c, j) { return '<span><i style="--c:' + c + '"></i>Periodo ' + (j + 1) + '</span>'; }).join(''); host.appendChild(lg);
  }
  TP.lineChart = lineChart; TP.groupChart = groupChart;
  function mapChart(host, k) { var w = document.createElement('div'); w.className = 'ptwrap'; var g = buildTable({ info: false }); w.appendChild(g); host.appendChild(w); paintTable(g, k, {}); }

  /* gráfico XY genérico: pts [{x, y, e}] */
  TP.xy = function (host, pts, o) {
    TP.mountChart(host, function (W) {
      var H = W < 520 ? 280 : 340, m = { l: W < 520 ? 44 : 54, r: 12, t: 14, b: 44 }, xs = pts.map(function (p) { return p.x; }), ys = pts.map(function (p) { return p.y; });
      var x0 = o.x0 != null ? o.x0 : Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = o.y0 != null ? o.y0 : 0, y1 = Math.max.apply(null, ys) * 1.08;
      function X(v) { return m.l + (v - x0) / (x1 - x0) * (W - m.l - m.r); }
      var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-label': o.label }), i;
      var Y = axisY(svg, m, W, H, y0, y1, false, TP.tick);
      var nt = W < 520 ? 4 : 6; for (i = 0; i <= nt; i++) { var xv = x0 + (x1 - x0) * i / nt; svgEl('text', { x: X(xv), y: H - 24, 'text-anchor': 'middle' }, svg).textContent = Math.round(xv); }
      svgEl('line', { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, class: 'axis' }, svg);
      svgEl('text', { x: (m.l + W) / 2, y: H - 4, 'text-anchor': 'middle' }, svg).textContent = o.xl;
      if (W >= 520) { var yt = svgEl('text', { x: 12, y: H / 2, 'text-anchor': 'middle', transform: 'rotate(-90 12 ' + H / 2 + ')' }, svg); yt.textContent = o.yl; }
      if (o.line) { var d = ''; pts.slice().sort(function (a, b) { return a.x - b.x; }).forEach(function (p, j) { d += (j ? 'L' : 'M') + X(p.x).toFixed(1) + ' ' + Y(p.y).toFixed(1); }); svgEl('path', { d: d, class: 'ln', stroke: '#fff', opacity: .35 }, svg); }
      if (o.fit) svgEl('line', { x1: X(o.fit[0]), y1: Y(o.fit[1]), x2: X(o.fit[2]), y2: Y(o.fit[3]), stroke: '#ff6b4a', 'stroke-width': 1.4, 'stroke-dasharray': '5 5', opacity: .7 }, svg);
      var tip = host.querySelector('.tip');
      pts.forEach(function (p) {
        var c = svgEl('circle', { cx: X(p.x), cy: Y(p.y), r: 4, class: 'pt-dot', fill: TP.CAT[p.e.cat].c }, svg);
        c.addEventListener('pointerenter', function () { showTip(host, tip, c, '<b>' + p.e.name + '</b> <span>' + p.e.sym + '</span><br><span>' + o.tip(p) + '</span>'); });
        c.addEventListener('pointerleave', function () { tip.dataset.on = 'false'; });
        c.addEventListener('click', function () { location.href = TP.url(p.e); });
        if (o.hl === p.e.z) { c.setAttribute('r', 7); c.setAttribute('stroke', '#fff'); c.setAttribute('stroke-width', 2); svgEl('text', { x: X(p.x), y: Y(p.y) - 12, 'text-anchor': 'middle', style: 'fill:var(--fg);font-weight:600' }, svg).textContent = p.e.sym; }
        if (o.labels && o.labels.indexOf(p.e.sym) >= 0) { var t = svgEl('text', { x: X(p.x), y: Y(p.y) - 9, 'text-anchor': 'middle', style: 'fill:var(--fg);font-weight:600' }, svg); t.textContent = p.e.sym; }
      });
      host.insertBefore(svg, tip);
    });
  };

  TP.discoveries = function (host) {
    var bins = [], i;
    bins.push({ lo: -1, hi: 1699, els: [] });
    for (i = 1700; i < 2025; i += 25) bins.push({ lo: i, hi: i + 24, els: [] });
    E.forEach(function (e) { var y = e.year === 0 ? -1 : e.year; var b = bins.filter(function (bb) { return y >= bb.lo && y <= bb.hi; })[0]; if (b) b.els.push(e); });
    var mx = Math.max.apply(null, bins.map(function (b) { return b.els.length; }));
    TP.mountChart(host, function (W) {
      var H = 260, m = { l: 30, r: 6, t: 10, b: 50 }, bw = (W - m.l - m.r) / bins.length;
      var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-label': 'Elementos descubiertos por cuarto de siglo' });
      for (var q = 0; q <= 4; q++) { var y = H - m.b - q / 4 * (H - m.t - m.b); svgEl('line', { x1: m.l, x2: W - m.r, y1: y, y2: y, class: 'grid' }, svg); svgEl('text', { x: m.l - 6, y: y + 4, 'text-anchor': 'end' }, svg).textContent = Math.round(mx * q / 4); }
      var tip = host.querySelector('.tip');
      bins.forEach(function (b, j) {
        var x = m.l + j * bw + 2, w = Math.max(3, bw - 4), cum = 0;
        b.els.sort(function (u, v) { return u.z - v.z; }).forEach(function (e) {
          var hh = (H - m.t - m.b) / mx, yy = H - m.b - (cum + 1) * hh;
          var r = svgEl('rect', { x: x, y: yy + 1, width: w, height: hh - 1.5, rx: 2, fill: TP.CAT[e.cat].c, class: 'pt-dot' }, svg);
          r.addEventListener('pointerenter', function () { showTip(host, tip, r, '<b>' + e.name + '</b> <span>' + e.sym + '</span><br><span>' + (e.year || 'Antigüedad') + ', ' + TP.esc(e.who) + '</span>'); });
          r.addEventListener('pointerleave', function () { tip.dataset.on = 'false'; });
          r.addEventListener('click', function () { location.href = TP.url(e); });
          cum++;
        });
        var t = svgEl('text', { x: x + w / 2 + 4, y: H - m.b + 14, 'text-anchor': 'end', transform: 'rotate(-40 ' + (x + w / 2 + 4) + ' ' + (H - m.b + 14) + ')' }, svg); t.textContent = j === 0 ? 'antes de 1700' : b.lo;
      });
      host.insertBefore(svg, tip);
    });
  };

  /* barras 3D */
  function bars3d(host, k, ctl) {
    var cv = document.createElement('canvas'); cv.className = 'cv'; cv.setAttribute('role', 'img');
    var p = TP.prop(k); cv.setAttribute('aria-label', p.l + ' en 3D sobre la tabla periódica'); cv.style.aspectRatio = window.innerWidth < 600 ? '4 / 5' : '16 / 10';
    host.appendChild(cv);
    var ctx = cv.getContext('2d'), rng = TP.range(k), st = { yaw: -0.5, pitch: 0.95, auto: false, hover: null, zoom: 1 }, W = 0, H = 0, dpr = 1, raf = 0;
    var items = E.map(function (e) { var v = TP.val(e, k); return { e: e, v: v, t: v == null ? null : rng.t(v), x: e.col - 1 - 8.5, y: e.row - 1 - 4.5 }; });
    function proj(x, y, z, s) { var c = Math.cos(st.yaw), sn = Math.sin(st.yaw), xr = x * c - y * sn, yr = x * sn + y * c, cp = Math.cos(st.pitch), sp = Math.sin(st.pitch); return [W / 2 + xr * s, H * .6 + (yr * sp - z * cp) * s, yr]; }
    function scale() { return Math.min(W / 27, H / 17) * st.zoom * (W < H ? 1.1 : 1); }
    function render() {
      var r = cv.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
      if (cv.width !== Math.round(r.width * dpr) || cv.height !== Math.round(r.height * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
      W = cv.width; H = cv.height; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
      var s = scale(), zmax = 4.6, c = Math.cos(st.yaw), sn = Math.sin(st.yaw);
      var order = items.slice().sort(function (a, b) { return (a.x * sn + a.y * c) - (b.x * sn + b.y * c); });
      ctx.lineJoin = 'round'; ctx.font = (Math.max(9 * dpr, s * .38)) + 'px "Geist Mono", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var corners = [[-9.2, -5.2], [9.2, -5.2], [9.2, 5.2], [-9.2, 5.2]].map(function (q) { return proj(q[0], q[1], 0, s); });
      ctx.beginPath(); corners.forEach(function (q, i) { i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.fillStyle = 'rgba(255,255,255,.03)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.stroke();
      order.forEach(function (it) {
        var h = it.t == null ? 0.03 : 0.12 + it.t * zmax, d = 0.4, x0 = it.x - d, x1 = it.x + d, y0 = it.y - d, y1 = it.y + d;
        var base = it.t == null ? [60, 60, 68] : TP.ramp(0.12 + 0.88 * it.t);
        var faces = [{ n: [0, -1], pts: [[x0, y0, 0], [x1, y0, 0], [x1, y0, h], [x0, y0, h]] }, { n: [1, 0], pts: [[x1, y0, 0], [x1, y1, 0], [x1, y1, h], [x1, y0, h]] }, { n: [0, 1], pts: [[x1, y1, 0], [x0, y1, 0], [x0, y1, h], [x1, y1, h]] }, { n: [-1, 0], pts: [[x0, y1, 0], [x0, y0, 0], [x0, y0, h], [x0, y1, h]] }];
        faces.forEach(function (f) {
          var nyr = f.n[0] * sn + f.n[1] * c; if (nyr <= 0.001) return;
          var sh = 0.55 + 0.35 * Math.abs(f.n[0] * c - f.n[1] * sn) * .6 + 0.1 * nyr;
          ctx.beginPath(); f.pts.forEach(function (q, i) { var P = proj(q[0], q[1], q[2], s); i ? ctx.lineTo(P[0], P[1]) : ctx.moveTo(P[0], P[1]); }); ctx.closePath();
          ctx.fillStyle = 'rgb(' + Math.round(base[0] * sh) + ',' + Math.round(base[1] * sh) + ',' + Math.round(base[2] * sh) + ')'; ctx.fill();
        });
        ctx.beginPath(); [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].forEach(function (q, i) { var P = proj(q[0], q[1], h, s); i ? ctx.lineTo(P[0], P[1]) : ctx.moveTo(P[0], P[1]); }); ctx.closePath();
        ctx.fillStyle = 'rgb(' + Math.min(255, base[0] + 18) + ',' + Math.min(255, base[1] + 18) + ',' + Math.min(255, base[2] + 18) + ')'; ctx.fill();
        if (st.hover === it) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2 * dpr; ctx.stroke(); ctx.lineWidth = 1; }
        var tp = proj(it.x, it.y, h, s); it.sx = tp[0]; it.sy = tp[1];
        if (s > 7.5 * dpr) { ctx.fillStyle = it.t != null && it.t > .55 ? '#15110f' : '#e4e4e7'; ctx.fillText(it.e.sym, tp[0], tp[1]); }
      });
    }
    function loop() { if (!st.auto || !cv.isConnected || cv.offsetParent === null) { raf = 0; return; } st.yaw += 0.006; render(); raf = requestAnimationFrame(loop); }
    var drag = null, tip = document.createElement('div'); tip.className = 'tip'; host.appendChild(tip);
    cv.addEventListener('pointerdown', function (ev) { drag = { x: ev.clientX, y: ev.clientY, moved: false }; cv.setPointerCapture(ev.pointerId); });
    cv.addEventListener('pointermove', function (ev) {
      if (drag) { var dx = ev.clientX - drag.x, dy = ev.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true; st.yaw += dx * .008; st.pitch = Math.max(.12, Math.min(1.5, st.pitch + dy * .006)); drag.x = ev.clientX; drag.y = ev.clientY; render(); return; }
      var r = cv.getBoundingClientRect(), mx = (ev.clientX - r.left) * dpr, my = (ev.clientY - r.top) * dpr, best = null, bd = 1e9, s = scale();
      items.forEach(function (it) { if (it.sx == null) return; var d = Math.hypot(it.sx - mx, it.sy - my); if (d < bd) { bd = d; best = it; } });
      var h = best && bd < s * .75 ? best : null;
      if (h !== st.hover) { st.hover = h; render(); }
      if (h) { var hr = host.getBoundingClientRect(); tip.innerHTML = '<b>' + h.e.name + '</b> <span>' + h.e.sym + '</span><br><span>' + TP.fmtProp(h.e, p, S.unit) + '</span>'; tip.style.left = Math.max(60, Math.min(hr.width - 60, ev.clientX - hr.left)) + 'px'; tip.style.top = (ev.clientY - hr.top) + 'px'; tip.dataset.on = 'true'; } else tip.dataset.on = 'false';
    });
    cv.addEventListener('pointerup', function () { if (drag && !drag.moved && st.hover) location.href = TP.url(st.hover.e); drag = null; });
    cv.addEventListener('pointerleave', function () { st.hover = null; tip.dataset.on = 'false'; render(); });
    cv.addEventListener('dblclick', function () { st.yaw = -0.5; st.pitch = .95; st.zoom = 1; render(); });
    cv.addEventListener('wheel', function (ev) { ev.preventDefault(); st.zoom = Math.max(.6, Math.min(2.2, st.zoom * (ev.deltaY < 0 ? 1.08 : .93))); render(); }, { passive: false });
    if (window.ResizeObserver) new ResizeObserver(function () { if (cv.isConnected && cv.offsetParent) render(); }).observe(cv); else window.addEventListener('resize', function () { if (cv.isConnected && cv.offsetParent) render(); });
    ctl.innerHTML = '<button type="button" class="pill" id="auto" aria-pressed="false">Girar</button><button type="button" class="pill" data-v="top">Desde arriba</button><button type="button" class="pill" data-v="side">De lado</button><button type="button" class="pill" data-v="reset">Reiniciar</button>';
    ctl.addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b) return;
      if (b.id === 'auto') { st.auto = !st.auto && !TP.reduced(); b.setAttribute('aria-pressed', st.auto); if (st.auto && !raf) raf = requestAnimationFrame(loop); return; }
      if (b.dataset.v === 'top') { st.yaw = 0; st.pitch = 1.5; } else if (b.dataset.v === 'side') { st.yaw = 0; st.pitch = .2; } else { st.yaw = -0.5; st.pitch = .95; st.zoom = 1; }
      render();
    });
    requestAnimationFrame(render); setTimeout(render, 120);
  }

  TP.catSpans = function () { return Object.keys(TP.CAT).map(function (k) { return '<span><i style="--c:' + TP.CAT[k].c + '"></i>' + TP.CAT[k].n + '</span>'; }).join(''); };
  function renderGraficos(panel, sub) {
    var opts = TP.PROPS.map(function (p) { return '<option value="' + p.k + '">' + p.l + (p.u ? ' (' + p.u + ')' : '') + '</option>'; }).join('');
    panel.innerHTML = '<div class="gwrap"></div><div class="stats-wrap"></div>';
    var gw = $('.gwrap', panel), sw = $('.stats-wrap', panel);
    var extra = '<label class="sel"><select id="gprop" aria-label="Propiedad">' + opts + '</select></label><div class="seg" id="gunit" role="group" aria-label="Unidad de temperatura"><button type="button" data-u="K">K</button><button type="button" data-u="C">°C</button><button type="button" data-u="F">°F</button></div>';
    function chartView(fn, leg) {
      return function (div) {
        var k = S.prop; div.innerHTML = '<div class="card"><div class="row-ctl gctl" hidden></div><div class="chart"><div class="tip"></div></div><div class="glg"></div></div>';
        fn($('.chart', div), k, $('.gctl', div));
        var g = $('.glg', div);
        if (leg === 'cat') { g.className = 'glg leg2'; g.innerHTML = TP.catSpans(); } else if (leg === 'scale') scaleLegend(g, k);
      };
    }
    var V = TP.views(gw, 'graficos', [
      { id: 'linea', label: 'Por Z', render: chartView(function (h, k) { lineChart(h, k); }, 'cat') },
      { id: 'grupos', label: 'Por grupo', render: chartView(function (h, k) { groupChart(h, k); }) },
      { id: 'mapa', label: 'Mapa 2D', render: chartView(function (h, k) { mapChart(h, k); }, 'scale') },
      { id: 'bar3d', label: 'Barras 3D', render: chartView(function (h, k, c) { c.hidden = false; bars3d(h, k, c); }, 'scale') }
    ], sub, extra);
    var sel = $('#gprop', gw); sel.value = S.prop;
    function side() {
      var k = S.prop, p = TP.prop(k), s = propStats(k), x = PX[k] || {};
      $('#gunit', gw).hidden = !p.temp; $$('#gunit button', gw).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.u === S.unit ? 'true' : 'false'); });
      sw.innerHTML = '<dl class="stats"><div><dt>Mínimo</dt><dd>' + s.f(s.lo.v) + '</dd><small>' + s.lo.e.name + '</small></div><div><dt>Máximo</dt><dd>' + s.f(s.hi.v) + '</dd><small>' + s.hi.e.name + '</small></div><div><dt>Media</dt><dd>' + s.f(s.mean) + '</dd><small>' + s.n + ' elementos</small></div><div><dt>Mediana</dt><dd>' + s.f(s.med.v) + '</dd><small>' + s.med.e.name + '</small></div></dl>' +
        '<div class="card"><h2 class="sec">' + p.l + '</h2><p class="prose">' + (x.def || '') + '</p>' + (x.f ? TP.F(x.f) : '') +
        '<dl class="trend"><div><dt>En el periodo →</dt><dd>' + x.per + '</dd></div><div><dt>En el grupo ↓</dt><dd>' + x.grp + '</dd></div><div><dt>Por qué</dt><dd>' + x.why + '</dd></div><div><dt>Excepciones</dt><dd>' + x.exc + '</dd></div></dl></div>';
    }
    sel.addEventListener('change', function () { S.prop = sel.value; TP.store.set('prop', S.prop); V.refresh(); side(); });
    $('#gunit', gw).addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b) return; S.unit = b.dataset.u; TP.store.set('unit', S.unit); V.refresh(); side(); });
    TP.setGProp = function (k) { S.prop = k; sel.value = k; TP.store.set('prop', k); V.refresh(); side(); };
    side();
  }
  TP.gotoTrend = function (k) { S.prop = k; TP.store.set('prop', k); if (TP.setGProp) TP.setGProp(k); TP.go('graficos'); };

  /* ---------- navegación ---------- */
  var TABS = ['tabla', 'graficos', 'atomo', 'enlace', 'historia'];
  var ALIASES = { tendencias: 'graficos', teoria: 'atomo/config', lewis: 'enlace/lewis', om: 'enlace/om', mendeleev: 'historia/mendeleev', meyer: 'historia/meyer' };
  var LAZY = { atomo: ['orbital.js', 'atomo.js'], enlace: ['enlace.js'], historia: ['historia.js'] };
  var done = {}, loaded = {};
  TP.init = TP.init || {};
  function loadScript(f, cb) {
    if (loaded[f]) { loaded[f].push(cb); if (loaded[f].ready) cb(); return; }
    loaded[f] = [cb];
    var s = document.createElement('script'); s.src = BASE + '/assets/' + f + '?v=20261116';
    s.onload = function () { loaded[f].ready = true; loaded[f].forEach(function (c) { c(); }); };
    document.head.appendChild(s);
  }
  function loadAll(list, cb) { var f = list.shift(); if (!f) return cb(); loadScript(f, function () { loadAll(list, cb); }); }
  function parse() { var h = location.hash.slice(1); if (ALIASES[h]) h = ALIASES[h]; var a = h.split('/'); return { tab: a[0], sub: a[1] }; }
  function show(key, sub, push) {
    if (TABS.indexOf(key) < 0) key = 'tabla';
    TABS.forEach(function (k) { var on = k === key, t = $('#t-' + k), p = $('#p-' + k); t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; p.hidden = !on; });
    var p = $('#p-' + key);
    if (!done[key]) {
      done[key] = true;
      if (key === 'tabla') renderTabla(p); else if (key === 'graficos') renderGraficos(p, sub);
      else { p.innerHTML = '<div class="skel" aria-label="Cargando"></div>'; loadAll(LAZY[key].slice(), function () { p.innerHTML = ''; TP.init[key](p, sub); }); }
    } else if (sub && TP.sw[key]) TP.sw[key](sub, false);
    if (push) history.replaceState(null, '', key === 'tabla' ? location.pathname : '#' + key + (TP.last[key] ? '/' + TP.last[key] : ''));
    var t = $('#t-' + key); if (t.scrollIntoView) t.scrollIntoView({ block: 'nearest', inline: 'center' });
  }
  TP.go = function (target) {
    if (target === 'tabla') { history.replaceState(null, '', location.pathname); show('tabla'); }
    else { var a = target.split('/'); history.replaceState(null, '', '#' + target); show(a[0], a[1]); }
    window.scrollTo({ top: Math.max(0, $('#tabs').offsetTop - 80), behavior: TP.reduced() ? 'auto' : 'smooth' });
  };
  $('#tabs').addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (b) show(b.dataset.tab, null, true); });
  $('#tabs').addEventListener('keydown', function (ev) {
    var i = TABS.indexOf(document.activeElement.dataset.tab); if (i < 0) return;
    var j = ev.key === 'ArrowRight' ? (i + 1) % TABS.length : ev.key === 'ArrowLeft' ? (i + TABS.length - 1) % TABS.length : -1; if (j < 0) return;
    ev.preventDefault(); show(TABS[j], null, true); $('#t-' + TABS[j]).focus();
  });
  window.addEventListener('hashchange', function () { var x = parse(); show(x.tab, x.sub); });
  TP.mountSearch($('#search'));
  var x0 = parse(); show(x0.tab || 'tabla', x0.sub);
  var top = $('#totop');
  var tk = false; function updTop() { var y = window.scrollY, mx = document.documentElement.scrollHeight - window.innerHeight; top.classList.toggle('is-on', y > 900); top.tabIndex = y > 900 ? 0 : -1; top.style.setProperty('--p', mx > 0 ? Math.min(1, y / mx).toFixed(4) : 0); tk = false; }
  window.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(updTop); } }, { passive: true }); updTop();
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: TP.reduced() ? 'auto' : 'smooth' }); });
})();
