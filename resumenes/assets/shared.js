/* Piezas comunes a la página y al servidor (functions/resumenes/_middleware.js): URLs, textos y el HTML de
   las tarjetas, para que lo que Google recibe y lo que ve el estudiante sea el mismo marcado. */
(function (root) {
  'use strict';
  var HUE = { 'Física': 250, 'Química': 165, 'Biología': 135, 'Anatomía': 15, 'Economía': 75, 'Historia': 40, 'Geografía': 195, 'Filosofía': 290, 'Psicología': 325, 'Lenguaje': 220, 'Literatura': 350, 'Razonamiento Verbal': 205, 'Álgebra': 270, 'Aritmética': 105, 'Geometría': 235, 'Trigonometría': 305, 'Inglés': 5, 'Educación Cívica': 55, 'Arquitectura': 30, 'Cálculo Diferencial': 260, 'Álgebra Lineal': 280, 'Computación': 180 };
  var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-9.2-9.3C1.6 7.4 3.8 4 7.3 4c2 0 3.6 1.1 4.7 2.7C13.1 5.1 14.7 4 16.7 4c3.5 0 5.7 3.4 4.5 6.7C19.5 15.4 12 20 12 20Z"/></svg>';

  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function slug(s) { return norm(s).split(' ').join('-').slice(0, 70).replace(/-+$/, '') || 'resumen'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  var path = {
    doc: function (it) { return '/resumenes/' + slug(it.t) + '-' + it.id; },
    tema: function (m) { return '/resumenes/tema/' + slug(m); },
    curso: function (c) { return '/resumenes/curso/' + slug(c); },
    autor: function (a) { return '/resumenes/autor/' + slug(a); },
    user: function (key) { return '/resumenes/u/' + encodeURIComponent(key); },
    thumb: function (it) { return it.p ? (it.id[0] === 'b' ? '/resumenes/thumbs/' + it.id + '.webp' : '/api/resumenes/thumb/' + it.id) : ''; },
    file: function (it, dl) { return '/api/resumenes/file/' + encodeURIComponent(it.id) + (dl ? '?download=1' : ''); }
  };

  // "/resumenes/<slug>-<id>", "/resumenes/tema/<slug>"... -> what to show
  function route(pathname) {
    var parts = String(pathname || '').replace(/\/+$/, '').split('/').filter(Boolean);
    if (parts[0] !== 'resumenes' || parts.length === 1) return { view: 'list' };
    if (parts.length === 3 && ['tema', 'curso', 'autor', 'u'].indexOf(parts[1]) >= 0) return { view: 'list', kind: parts[1], key: decodeURIComponent(parts[2]) };
    var m = parts.length === 2 && parts[1].match(/(?:^|-)([bu][a-z0-9]{6,32})$/);
    return m ? { view: 'doc', id: m[1] } : { view: 'missing' };
  }

  function matches(it, r) {
    if (!r || !r.kind) return true;
    if (r.kind === 'tema') return !!it.m && slug(it.m) === r.key;
    if (r.kind === 'curso') return slug(it.c) === r.key;
    if (r.kind === 'autor') return !it.u && !!it.a && slug(it.a) === r.key;
    return it.u === r.key;
  }

  var fmtExt = function (e) { return e === 'pdf' ? 'PDF' : e === 'png' ? 'PNG' : e === 'webp' ? 'WEBP' : 'JPG'; };
  function fmtSize(b) {
    if (!b) return '';
    if (b < 1048576) return Math.max(1, Math.round(b / 1024)) + ' KB';
    return (b / 1048576).toFixed(b < 10485760 ? 1 : 0).replace('.', ',') + ' MB';
  }
  var lower = function (s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; };

  // One plain sentence for the meta description (and the share preview).
  function describe(it) {
    if (it.d) return it.d.slice(0, 155);
    var kind = it.k && it.k !== 'Resumen' && it.k !== 'Aporte' ? lower(it.k) : 'resumen';
    var s = it.t + ': ' + kind + ' de ' + it.c + (it.m && norm(it.m) !== norm(it.c) ? ' sobre ' + lower(it.m) : '') + (it.a ? ', de ' + it.a : '') + '. ';
    return (s + 'Léelo completo en línea o descárgalo gratis en ' + fmtExt(it.e) + '.').slice(0, 300);
  }

  // Title with the searched words marked; text escaped first.
  function marked(text, terms) {
    if (!terms || !terms.length) return esc(text);
    var f = Array.from(text, function (ch) { var c = ch.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); return /^[a-z0-9]$/.test(c) ? c : ' '; }).join('');
    var hits = [];
    terms.forEach(function (t) { var i = f.indexOf(t); while (i >= 0) { if (i === 0 || f[i - 1] === ' ') hits.push([i, i + t.length]); i = f.indexOf(t, i + t.length); } });
    hits.sort(function (a, b) { return a[0] - b[0]; });
    var out = '', at = 0;
    hits.forEach(function (h) { if (h[0] < at) return; out += esc(text.slice(at, h[0])) + '<mark>' + esc(text.slice(h[0], h[1])) + '</mark>'; at = h[1]; });
    return out + esc(text.slice(at));
  }

  // Preview shape: the page's exact proportions, as "width:height" of its preview image.
  function ratio(it) {
    var m = /^(\d{1,5}):(\d{1,5})$/.exec(it.r || '');
    var w = m ? +m[1] : 3, h = m ? +m[2] : 4;
    if (!w || !h) { w = 3; h = 4; }
    return { css: w + ' / ' + h, h: Math.round(360 * h / w) };
  }

  function thumbHTML(it, eager) {
    var src = path.thumb(it);
    var r = ratio(it);
    if (!src) return '<span class="thumb blank" style="--ar:' + r.css + '" aria-hidden="true"><b>' + esc(it.c) + '</b><i>' + fmtExt(it.e) + '</i></span>';
    return '<span class="thumb" style="--ar:' + r.css + '" aria-hidden="true"><img src="' + esc(src) + '" alt="" width="360" height="' + r.h + '" decoding="async"' + (eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' onload="this.classList.add(\'ready\')" onerror="this.parentNode.classList.add(\'blank\');this.remove()"></span>';
  }

  function cardHTML(it, opts) {
    opts = opts || {};
    var fresh = it.at && Date.now() - it.at < 14 * 864e5;
    var bits = [esc(it.c), it.k ? esc(it.k) : ''].filter(Boolean).join(' · ');
    return '<li><a class="card" href="' + esc(path.doc(it)) + '" data-id="' + esc(it.id) + '" style="--hue:' + (HUE[it.c] != null ? HUE[it.c] : 30) + '">' +
      thumbHTML(it, opts.eager) +
      '<span class="card-t">' + marked(it.t, opts.terms) + '</span>' +
      '<span class="card-m"><span>' + bits + '</span>' +
      (fresh ? '<span class="new">Nuevo</span>' : '') +
      (it.likes ? '<span class="likes" aria-label="' + it.likes + ' me gusta">' + HEART + it.likes + '</span>' : '') +
      '</span></a></li>';
  }

  function recHTML(it) {
    var src = path.thumb(it);
    return '<li><a class="rec" href="' + esc(path.doc(it)) + '" data-id="' + esc(it.id) + '" style="--hue:' + (HUE[it.c] != null ? HUE[it.c] : 30) + '">' +
      (src ? '<span class="rec-img"><img src="' + esc(src) + '" alt="" width="360" height="480" loading="lazy" decoding="async" onload="this.classList.add(\'ready\')"></span>' : '<span class="rec-img blank" aria-hidden="true">' + fmtExt(it.e) + '</span>') +
      '<span><span class="rec-t">' + esc(it.t) + '</span><span class="rec-m">' + esc([it.m || it.c, it.k].filter(Boolean).join(' · ')) + '</span></span></a></li>';
  }

  // Rows of the summary's details: [label, html]
  function metaRows(it) {
    var rows = [];
    if (it.m) rows.push(['Tema', '<a href="' + esc(path.tema(it.m)) + '">' + esc(it.m) + '</a>']);
    if (it.k && it.k !== 'Aporte') rows.push(['Tipo', esc(it.k)]);
    if (it.a && !it.u) rows.push(['Autor', '<a href="' + esc(path.autor(it.a)) + '">' + esc(it.a) + '</a>']);
    if (it.y) rows.push(['Año', esc(it.y)]);
    rows.push(['Archivo', fmtExt(it.e) + (it.s ? ' · ' + fmtSize(it.s) : '')]);
    return rows;
  }

  function initials(name) { return String(name || '?').replace(/^@/, '').trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0] || ''; }).join('').toUpperCase(); }
  function uploaderHTML(it) {
    if (!it.u) return '';
    return '<a class="uploader" href="' + esc(path.user(it.u)) + '"><span class="acct-pic">' + esc(initials(it.a)) +
      (it.av ? '<img src="' + esc(it.av) + '" alt="" referrerpolicy="no-referrer" onerror="this.remove()">' : '') +
      '</span><span>Subido por <b>' + esc(it.a) + '</b></span></a>';
  }

  var api = { ratio: ratio, HUE: HUE, slug: slug, esc: esc, path: path, route: route, matches: matches, fmtExt: fmtExt, fmtSize: fmtSize, describe: describe, marked: marked, cardHTML: cardHTML, recHTML: recHTML, metaRows: metaRows, uploaderHTML: uploaderHTML, initials: initials };
  root.ResShared = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
