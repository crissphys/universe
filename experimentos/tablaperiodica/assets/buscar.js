/* Tabla periódica · buscador global: elementos, propiedades, temas y moléculas */
(function () {
  var TP = window.TP, E = TP.E;
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9₀-₉+\-]+/g, ' ').trim(); }
  TP.norm = norm;

  var ALIAS = { H: 'hidrogeno', Na: 'sodio natrium', K: 'potasio kalium', Fe: 'hierro ferrum', Ag: 'plata argentum', Au: 'oro aurum', Pb: 'plomo plumbum', Cu: 'cobre cuprum', Sn: 'estano estaño stannum', Hg: 'mercurio hydrargyrum azogue', Sb: 'antimonio stibium', S: 'azufre sulfur', W: 'wolframio tungsteno', Zn: 'zinc cinc', I: 'yodo iodo', Cs: 'cesio', Zr: 'circonio zirconio', Ti: 'titanio', He: 'helio', Hs: 'hasio hassio', Og: 'oganeson', Ts: 'teneso tennessine' };

  /* moléculas: mismo orden que enlace.js */
  TP.LEWIS_NAMES = [['H₂', 'hidrogeno'], ['N₂', 'nitrogeno'], ['O₂', 'oxigeno'], ['F₂', 'fluor'], ['HCl', 'cloruro de hidrogeno acido clorhidrico'], ['H₂O', 'agua'], ['NH₃', 'amoniaco'], ['CH₄', 'metano'], ['H₃O⁺', 'hidronio'], ['NH₄⁺', 'amonio'], ['CO₂', 'dioxido de carbono'], ['CO', 'monoxido de carbono'], ['HCN', 'cianuro de hidrogeno'], ['C₂H₄', 'eteno etileno'], ['C₂H₂', 'etino acetileno'], ['O₃', 'ozono'], ['SO₂', 'dioxido de azufre'], ['SO₃', 'trioxido de azufre'], ['BF₃', 'trifluoruro de boro'], ['NO', 'monoxido de nitrogeno oxido nitrico'], ['NO₃⁻', 'nitrato'], ['CO₃²⁻', 'carbonato'], ['SO₄²⁻', 'sulfato'], ['PCl₅', 'pentacloruro de fosforo'], ['SF₆', 'hexafluoruro de azufre']];
  TP.OM_NAMES = [['H₂⁺', 'h2+'], ['H₂', 'hidrogeno'], ['He₂⁺', ''], ['He₂', 'helio'], ['Li₂', 'litio'], ['Be₂', 'berilio'], ['B₂', 'boro'], ['C₂', 'carbono'], ['N₂⁺', ''], ['N₂', 'nitrogeno'], ['O₂⁺', ''], ['O₂', 'oxigeno'], ['O₂⁻', 'superoxido'], ['O₂²⁻', 'peroxido'], ['F₂', 'fluor'], ['Ne₂', 'neon']];

  var T = [
    ['Modelo de Bohr', 'Átomo', 'atomo/modelos', 'bohr orbitas capas niveles de energia postulados radio'],
    ['Orbitales s, p, d, f en 3D', 'Átomo', 'atomo/modelos', 'schrodinger orbital forma 3d nubes probabilidad lobulos nodos'],
    ['Números cuánticos', 'Átomo', 'atomo/config', 'n l ml ms principal azimutal magnetico espin'],
    ['Configuración electrónica', 'Átomo', 'atomo/config', 'aufbau madelung llenado subcapas diagrama de orbitales'],
    ['Principio de Pauli y regla de Hund', 'Átomo', 'atomo/config', 'exclusion multiplicidad desapareados'],
    ['Excepciones de configuración', 'Átomo', 'atomo/config', 'cromo cobre paladio excepciones semillena'],
    ['Configuración de iones', 'Átomo', 'atomo/config', 'cationes aniones isoelectronico'],
    ['Espectro del hidrógeno (Rydberg)', 'Átomo', 'atomo/espectro', 'balmer lyman paschen lineas longitud de onda fotón'],
    ['Carga nuclear efectiva y apantallamiento', 'Átomo', 'atomo/zeff', 'slater zeff z* sigma'],
    ['Resumen de fórmulas', 'Átomo', 'atomo/formulas', 'ecuaciones formulario'],
    ['Estructuras de Lewis', 'Enlace', 'enlace/lewis', 'octeto carga formal resonancia puntos pares libres'],
    ['Símbolos de Lewis', 'Enlace', 'enlace/lewis', 'electrones de valencia puntos'],
    ['Geometría molecular (RPECV)', 'Enlace', 'enlace/geometria', 'vsepr hibridacion angulos tetraedrica piramidal angular lineal'],
    ['Orbitales moleculares', 'Enlace', 'enlace/om', 'tom lcao sigma pi enlazante antienlazante orden de enlace paramagnetismo diamagnetismo'],
    ['Van der Waals y gases reales', 'Enlace', 'enlace/vdw', 'radio de van der waals ecuacion gases reales a b constantes punto critico compresibilidad'],
    ['Fuerzas intermoleculares y de London', 'Enlace', 'enlace/vdw', 'london dispersion dipolo puente de hidrogeno ebullicion'],
    ['Tipo de enlace y polaridad', 'Enlace', 'enlace/tipo', 'ionico covalente metalico diferencia de electronegatividad dipolo caracter ionico'],
    ['Tabla de Mendeléyev', 'Historia', 'historia/mendeleev', 'predicciones ekasilicio ekaaluminio ekaboro 1871'],
    ['Tabla de Meyer', 'Historia', 'historia/meyer', 'lothar meyer 1864 valencia familias'],
    ['Curva de volúmenes atómicos', 'Historia', 'historia/meyer', 'volumen atomico meyer 1870'],
    ['Ley de Moseley', 'Historia', 'historia/moseley', 'rayos x numero atomico frecuencia'],
    ['Döbereiner, Newlands y precursores', 'Historia', 'historia/camino', 'triadas octavas chancourtois seaborg linea de tiempo'],
    ['Descubrimientos por época', 'Historia', 'historia/descubrimientos', 'quien descubrio cuando siglos'],
    ['Escala de Pauling en 3D', 'Gráficos', 'graficos/bar3d', 'barras electronegatividad tridimensional'],
    ['Familias de elementos', 'Tabla', 'tabla', 'grupos alcalinos halogenos gases nobles metales de transicion'],
    ['Estado físico según la temperatura', 'Tabla', 'tabla', 'solido liquido gas temperatura deslizador']
  ];

  var IDX = null;
  function build() {
    if (IDX) return IDX; IDX = [];
    E.forEach(function (e) { IDX.push({ k: 'e', t: e.name, s: e.sym + ', número ' + e.z, q: norm(e.name + ' ' + e.sym + ' ' + e.z + ' ' + (ALIAS[e.sym] || '') + ' ' + TP.CAT[e.cat].n), go: function () { location.href = TP.url(e); }, pr: 0 }); });
    Object.keys(TP.CAT).forEach(function (k) { IDX.push({ k: 't', t: TP.CAT[k].n, s: 'Resaltar en la tabla', q: norm(TP.CAT[k].n + ' grupo familia'), go: function () { TP.tableMode('cat', k); }, pr: 2 }); });
    TP.PROPS.forEach(function (p) { IDX.push({ k: 'p', t: p.l, s: 'Gráficos', q: norm(p.l + ' ' + p.k + ' ' + p.u), go: function () { TP.gotoTrend(p.k); }, pr: 1 }); });
    T.forEach(function (x) { IDX.push({ k: 't', t: x[0], s: x[1], q: norm(x[0] + ' ' + x[3]), go: function () { TP.go(x[2]); }, pr: 1 }); });
    TP.LEWIS_NAMES.forEach(function (m, i) { IDX.push({ k: 'm', t: m[0], s: 'Lewis', q: norm(m[0] + ' ' + m[1] + ' lewis'), go: function () { TP.store.set('lewis', i); TP.go('enlace/lewis'); if (TP.sw && TP.sw.enlace) TP.sw.enlace('lewis', true); }, pr: 3 }); });
    TP.OM_NAMES.forEach(function (m, i) { IDX.push({ k: 'm', t: m[0], s: 'Orbitales moleculares', q: norm(m[0] + ' ' + m[1] + ' orbitales moleculares om'), go: function () { TP.store.set('om', 'h' + i); TP.go('enlace/om'); if (TP.sw && TP.sw.enlace) TP.sw.enlace('om', true); }, pr: 3 }); });
    ['CO', 'NO', 'HF'].forEach(function (m) { IDX.push({ k: 'm', t: m, s: 'Orbitales moleculares', q: norm(m + ' orbitales moleculares om heteronuclear'), go: function () { TP.store.set('om', 'x' + m); TP.go('enlace/om'); if (TP.sw && TP.sw.enlace) TP.sw.enlace('om', true); }, pr: 3 }); });
    return IDX;
  }
  var GROUPS = { e: 'Elementos', p: 'Propiedades', t: 'Temas', m: 'Moléculas' };

  TP.search = function (q, max) {
    var words = norm(q).split(' ').filter(Boolean); if (!words.length) return [];
    var out = [];
    build().forEach(function (it) {
      if (it.hide) return;
      var ok = words.every(function (w) { return it.q.indexOf(w) >= 0; }); if (!ok) return;
      var first = it.q.split(' ')[0], score = (norm(it.t) === words.join(' ') ? 0 : norm(it.t).indexOf(words[0]) === 0 ? 1 : first === words[0] ? 1 : 2) * 10 + it.pr;
      if (it.k === 'e' && /^\d+$/.test(words[0]) && String(it.q.split(' ').pop()) === words[0]) score = -1;
      out.push({ it: it, score: score });
    });
    out.sort(function (a, b) { return a.score - b.score; });
    return out.slice(0, max || 12).map(function (x) { return x.it; });
  };

  /* componente */
  TP.mountSearch = function (host, o) {
    o = o || {};
    host.innerHTML = '<div class="gs"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input type="search" role="combobox" aria-expanded="false" aria-controls="gs-list" aria-autocomplete="list" autocomplete="off" spellcheck="false" placeholder="' + (window.innerWidth < 480 ? 'Buscar elemento o tema' : 'Buscar elemento, propiedad o tema') + '" aria-label="Buscar elemento, propiedad o tema"><kbd class="gk" aria-hidden="true">/</kbd><ul id="gs-list" class="gl" role="listbox" hidden></ul></div>';
    var inp = host.querySelector('input'), list = host.querySelector('.gl'), cur = -1, res = [];
    function close() { list.hidden = true; inp.setAttribute('aria-expanded', 'false'); cur = -1; }
    function render() {
      var q = inp.value; document.dispatchEvent(new CustomEvent('tp:q', { detail: q }));
      res = TP.search(q, 10);
      if (!q.trim()) { close(); return; }
      if (!res.length) { list.innerHTML = '<li class="gn">Sin resultados para "' + TP.esc(q) + '"</li>'; list.hidden = false; inp.setAttribute('aria-expanded', 'true'); return; }
      var html = '', last = '';
      res.forEach(function (r, i) { if (r.k !== last) { html += '<li class="gh2" role="presentation">' + GROUPS[r.k] + '</li>'; last = r.k; } html += '<li role="option" id="gs-' + i + '" data-i="' + i + '"><b>' + TP.esc(r.t) + '</b><small>' + TP.esc(r.s) + '</small></li>'; });
      list.innerHTML = html; list.hidden = false; inp.setAttribute('aria-expanded', 'true'); cur = -1;
    }
    function mark(i) { cur = (i + res.length) % res.length; Array.prototype.forEach.call(list.querySelectorAll('[role=option]'), function (n) { n.setAttribute('aria-selected', +n.dataset.i === cur ? 'true' : 'false'); }); inp.setAttribute('aria-activedescendant', 'gs-' + cur); var n = list.querySelector('#gs-' + cur); if (n && n.scrollIntoView) n.scrollIntoView({ block: 'nearest' }); }
    function pick(i) { var r = res[i]; if (!r) return; close(); if (r.k !== 'e') { inp.value = ''; document.dispatchEvent(new CustomEvent('tp:q', { detail: '' })); } r.go(); }
    inp.addEventListener('input', render);
    inp.addEventListener('focus', function () { if (inp.value.trim()) render(); });
    inp.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowDown') { ev.preventDefault(); if (!list.hidden) mark(cur + 1); } else if (ev.key === 'ArrowUp') { ev.preventDefault(); if (!list.hidden) mark(cur - 1); }
      else if (ev.key === 'Enter') { ev.preventDefault(); pick(cur >= 0 ? cur : 0); } else if (ev.key === 'Escape') { if (inp.value) { inp.value = ''; render(); } close(); inp.blur(); }
    });
    list.addEventListener('mousedown', function (ev) { var li = ev.target.closest('[role=option]'); if (li) { ev.preventDefault(); pick(+li.dataset.i); } });
    document.addEventListener('click', function (ev) { if (!host.contains(ev.target)) close(); });
    document.addEventListener('keydown', function (ev) { if (ev.key === '/' && !/input|select|textarea/i.test(document.activeElement.tagName)) { ev.preventDefault(); inp.focus(); inp.select(); } });
    return inp;
  };
})();
