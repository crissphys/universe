/* Buscador de resúmenes: coincidencias por palabra, prefijo y errores de tipeo, más sinónimos y temas
   relacionados de /resumenes/data/temas.json ("fisiocracia" encuentra "Doctrinas económicas"). */
(function (root) {
  'use strict';
  var STOP = new Set('de del la las el los y e o u en a al con por para sin un una lo que resumen resumenes apuntes sobre tema temas pdf'.split(' '));
  var MATH = ['Álgebra', 'Aritmética', 'Geometría', 'Trigonometría', 'Cálculo Diferencial', 'Álgebra Lineal'];
  var RELATED = [['Biología', 'Anatomía'], MATH, ['Física', 'Química']];

  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function words(s) { return norm(s).split(' ').filter(Boolean); }

  // Bounded edit distance (insert, delete, substitute, swap); returns max+1 when over the bound.
  function dist(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var prev2 = null, prev = [], cur, i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i];
      var low = i;
      for (j = 1; j <= b.length; j++) {
        var c = a[i - 1] === b[j - 1] ? 0 : 1;
        var v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + c);
        if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
        cur[j] = v;
        if (v < low) low = v;
      }
      if (low > max) return max + 1;
      prev2 = prev; prev = cur;
    }
    return prev[b.length];
  }
  function fuzzyOk(q, t) {
    if (q.length < 5 || t.length < 4) return false;
    var max = q.length >= 8 ? 2 : 1;
    return dist(q, t, max) <= max;
  }

  function related(a, b) {
    return a === b || RELATED.some(function (g) { return g.indexOf(a) >= 0 && g.indexOf(b) >= 0; });
  }

  function buildIndex(items, temas) {
    var temaByName = {};
    var concepts = [];
    (temas.temas || []).forEach(function (t) {
      temaByName[t.tema] = t;
      [t.tema].concat(t.claves).forEach(function (p) { concepts.push({ kind: 'tema', key: t.tema, course: t.curso, phrase: norm(p) }); });
    });
    Object.keys(temas.cursos || {}).forEach(function (c) {
      [c].concat(temas.cursos[c]).forEach(function (p) { concepts.push({ kind: 'curso', key: c, phrase: norm(p) }); });
    });
    var vocab = new Map();
    var docs = items.map(function (it, i) {
      var tt = new Set(words(it.t).filter(function (w) { return !STOP.has(w); }));
      var mt = new Set(words([it.c, it.m, it.k, it.a, it.f && it.f.replace(/\.[a-z0-9]+$/i, ''), it.d, it.y].join(' ')).filter(function (w) { return !STOP.has(w); }));
      tt.forEach(function (w) { vocab.set(w, true); });
      mt.forEach(function (w) { vocab.set(w, true); });
      return { i: i, it: it, tt: tt, mt: mt, nt: ' ' + norm(it.t) + ' ' };
    });
    return { items: items, docs: docs, concepts: concepts, vocab: Array.from(vocab.keys()), temas: temaByName };
  }

  // query token -> Map(vocabToken -> weight)
  function variants(idx, q) {
    var out = new Map([[q, 1]]);
    idx.vocab.forEach(function (t) {
      if (t === q) return;
      if (q.length >= 3 && t.indexOf(q) === 0) out.set(t, Math.max(out.get(t) || 0, 0.75));
      else if (fuzzyOk(q, t)) out.set(t, Math.max(out.get(t) || 0, 0.6));
    });
    return out;
  }

  function queryConcepts(idx, toks) {
    var joined = ' ' + toks.join(' ') + ' ';
    var hits = [];
    idx.concepts.forEach(function (c) {
      var covers = null;
      if (c.phrase && joined.indexOf(' ' + c.phrase + ' ') >= 0) {
        var pw = c.phrase.split(' ');
        covers = toks.map(function (t, i) { return pw.indexOf(t) >= 0 ? i : -1; }).filter(function (i) { return i >= 0; });
      } else if (c.phrase && c.phrase.indexOf(' ') < 0) {
        var at = toks.findIndex(function (t) { return fuzzyOk(t, c.phrase) || (t.length >= 4 && c.phrase.length > t.length && c.phrase.indexOf(t) === 0 && c.kind === 'curso'); });
        if (at >= 0) covers = [at];
      }
      if (covers && covers.length) hits.push({ kind: c.kind, key: c.key, course: c.course, covers: covers, exact: joined.indexOf(' ' + c.phrase + ' ') >= 0 });
    });
    return hits;
  }

  function search(idx, query) {
    var nq = norm(query);
    if (!nq) return null;
    var toks = nq.split(' ').filter(function (t) { return !STOP.has(t); });
    if (!toks.length) toks = nq.split(' ');
    var vars = toks.map(function (t) { return variants(idx, t); });
    var concepts = queryConcepts(idx, toks);
    var results = [];
    idx.docs.forEach(function (d) {
      var covered = toks.map(function () { return false; });
      var score = 0;
      vars.forEach(function (vm, i) {
        var best = 0;
        vm.forEach(function (w, t) {
          if (d.tt.has(t)) best = Math.max(best, 3 * w);
          else if (d.mt.has(t)) best = Math.max(best, 1.5 * w);
        });
        if (best) { covered[i] = true; score += best; }
      });
      concepts.forEach(function (c) {
        var match = c.kind === 'tema' ? d.it.m === c.key : d.it.c === c.key;
        var near = !match && c.kind === 'curso' && d.it.c && related(d.it.c, c.key);
        if (!match && !near) return;
        score += c.kind === 'tema' ? (c.exact ? 3 : 2.2) : (match ? 2 : 0.4);
        if (match) c.covers.forEach(function (i) { covered[i] = true; });
      });
      if (d.nt.indexOf(' ' + nq + ' ') >= 0) score += 4;
      var cov = covered.filter(Boolean).length / toks.length;
      if (score > 0 && cov > 0) results.push({ item: d.it, score: score, cov: cov });
    });
    var full = results.some(function (r) { return r.cov === 1; });
    return results
      .filter(function (r) { return full ? r.cov === 1 : r.cov >= 0.5; })
      .sort(function (a, b) { return b.score - a.score || (b.item.likes || 0) - (a.item.likes || 0) || String(a.item.t).localeCompare(String(b.item.t), 'es'); });
  }

  function recommend(idx, item, n) {
    var own = new Set(words(item.t).filter(function (w) { return w.length >= 4 && !STOP.has(w); }));
    return idx.docs
      .filter(function (d) { return d.it.id !== item.id; })
      .map(function (d) {
        var s = 0;
        if (item.m && d.it.m === item.m) s += 5;
        if (d.it.c === item.c) s += 3; else if (related(d.it.c, item.c)) s += 0.8;
        var shared = 0;
        d.tt.forEach(function (w) { if (own.has(w)) shared++; });
        s += Math.min(shared, 3) * 1.2;
        if (item.a && d.it.a === item.a) s += 1.2;
        if (d.it.k === item.k) s += 0.4;
        s += Math.min(d.it.likes || 0, 20) * 0.05;
        return { item: d.it, score: s };
      })
      .filter(function (r) { return r.score >= 3; })
      .sort(function (a, b) { return b.score - a.score || String(a.item.t).localeCompare(String(b.item.t), 'es'); })
      .slice(0, n || 8);
  }

  // Course and topic for community uploads, from their title and description (same rules as the catalog).
  function classify(idx, text) {
    var toks = words(text);
    var hits = queryConcepts(idx, toks).filter(function (h) { return h.exact; });
    var tema = hits.filter(function (h) { return h.kind === 'tema'; }).sort(function (a, b) { return b.covers.length - a.covers.length; })[0];
    var curso = hits.filter(function (h) { return h.kind === 'curso'; })[0];
    var course = curso ? curso.key : tema ? tema.course : 'General';
    if (tema && curso && !related(tema.course, curso.key)) tema = null;
    return { c: course, m: tema ? tema.key : undefined };
  }

  // URL piece shared by the page, the server (functions/resumenes/_middleware.js) and the sitemap builder.
  function slug(s) { return norm(s).split(' ').join('-').slice(0, 70).replace(/-+$/, '') || 'resumen'; }

  var api = { norm: norm, slug: slug, buildIndex: buildIndex, search: search, recommend: recommend, classify: classify, dist: dist };
  root.ResSearch = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
