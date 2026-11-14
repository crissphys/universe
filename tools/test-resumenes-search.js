// node tools/test-resumenes-search.js — self-check of resumenes/assets/search.js against the real catalog.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const S = require('../resumenes/assets/search.js');
const dir = path.join(__dirname, '../resumenes/data');
const items = JSON.parse(fs.readFileSync(path.join(dir, 'catalogo.json'), 'utf8'));
const temas = JSON.parse(fs.readFileSync(path.join(dir, 'temas.json'), 'utf8'));
const idx = S.buildIndex(items, temas);
const top = (q, n = 5) => (S.search(idx, q) || []).slice(0, n).map(r => r.item);
const show = q => console.log(q.padEnd(24), '→', top(q, 4).map(i => `${i.t} [${i.c}]`).join(' | '));

// Exact topic word that appears in no file name: found through the "Doctrinas económicas" topic.
assert(top('fisiocracia').length && top('fisiocracia').every(i => i.m === 'Doctrinas económicas'), 'fisiocracia');
assert(top('mercantilismo').every(i => i.m === 'Doctrinas económicas'), 'mercantilismo');
// Typo tolerance.
assert(top('fisiocrasia').some(i => i.m === 'Doctrinas económicas'), 'fisiocrasia typo');
assert(top('estequimetria').some(i => i.m === 'Reacciones y estequiometría'), 'estequimetria typo');
// Phrase + synonym: "análisis dimensional" (also via "dimensiones").
assert(top('análisis dimensional').some(i => i.m === 'Análisis dimensional y vectores'), 'analisis dimensional');
// Course word lists that course first.
assert(top('física', 20).every(i => i.c === 'Física'), 'fisica course');
assert(top('fisica cinematica', 5).every(i => i.c === 'Física'), 'fisica cinematica');
// Accent / case insensitive.
assert.deepStrictEqual(top('QUIMICA organica').map(i => i.id), top('química orgánica').map(i => i.id));
// Empty query = no filtering.
assert.strictEqual(S.search(idx, '   '), null);
// Recommendations stay in the same course and prefer the same topic.
const doc = items.find(i => i.m === 'Doctrinas económicas');
const rec = S.recommend(idx, doc, 8);
assert(rec.length >= 4 && rec[0].item.m === 'Doctrinas económicas' && rec.every(r => r.item.c === 'Economía' && r.item.id !== doc.id), 'recommend');
// Classifier for uploads.
assert.deepStrictEqual(S.classify(idx, 'Resumen de fisiocracia y mercantilismo'), { c: 'Economía', m: 'Doctrinas económicas' });
assert.strictEqual(S.classify(idx, 'Formulario de MRUV y caída libre').c, 'Física');

['fisiocracia', 'fisiocrasia', 'análisis dimensional', 'física', 'mitosis', 'kant', 'revolución francesa', 'trigo identidades', 'rv conectores'].forEach(show);
console.log('ok');
