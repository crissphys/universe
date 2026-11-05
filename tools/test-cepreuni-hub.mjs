// Prueba de la lógica pura de /cepreuni (fechas en hora de Lima, estado de evaluaciones, horario y .ics).
// Uso: node tools/test-cepreuni-hub.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const win = {};
const ctx = { window: win, document: { getElementById: () => null, querySelector: () => null }, matchMedia: () => ({ matches: false }), location: { search: '' }, URLSearchParams, localStorage: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('cepreuni-2027-data.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync('cepreuni/data/semanas.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync('cepreuni/assets/cepreuni.js', 'utf8'), ctx);
const H = ctx.window.UNIVERSE_CEPREUNI_HUB;
const at = (iso) => Date.parse(iso); // instantes en UTC; Lima = UTC−5

// conteo por ciclo
assert.equal(H.eventsFor('pre').length, 11);
assert.equal(H.eventsFor('basico').length, 9);
assert.equal(H.eventsFor('ien').length, 4);

// Pre (con hora 9:00 Lima = 14:00Z): la evaluación sigue "viva" 3 h y luego pasa a hecha
const pre = H.eventsFor('pre');
let s = H.summarize(pre, at('2026-11-05T20:00:00Z'));
assert.equal(s.done, 4); assert.equal(s.next.date, '2026-11-15');
assert.equal(H.summarize(pre, at('2026-11-15T16:59:00Z')).next.date, '2026-11-15'); // 11:59 Lima
assert.equal(H.summarize(pre, at('2026-11-15T17:00:00Z')).next.date, '2026-11-29'); // 12:00 Lima

// Sin hora (Básico): hecha recién a partir del día siguiente en Lima
const bas = H.eventsFor('basico');
assert.equal(H.summarize(bas, at('2026-11-16T04:59:00Z')).next.date, '2026-11-15'); // 23:59 Lima del 15
assert.equal(H.summarize(bas, at('2026-11-16T05:00:00Z')).next.date, '2026-11-29');

// textos relativos y cambio de día en Lima (01:00Z ya es el día anterior allá)
assert.equal(H.relative(pre[4], at('2026-11-05T20:00:00Z')), 'En 10 días');
assert.equal(H.relative(pre[4], at('2026-11-14T12:00:00Z')), 'Mañana');
assert.equal(H.relative(pre[4], at('2026-11-15T10:00:00Z')), 'Hoy');
assert.equal(H.relative(pre[0], at('2026-11-05T20:00:00Z')), 'Hecha');
assert.equal(H.limaIso(at('2026-11-06T02:00:00Z')), '2026-11-05');

// horario: ahora / sigue / pasada
const m = H.mark([{ time: '07:30–10:00' }, { time: '10:20–12:50' }, { time: '12:50–13:45' }], 11 * 60);
assert.deepEqual(m.map((x) => x.st), ['past', 'now', 'next']);
assert.deepEqual(H.mark([{ time: '14:25–15:20' }, { time: '15:20–17:50' }], 8 * 60).map((x) => x.st), ['next', 'later']);

// colores por curso
assert.equal(H.courseKey('Álgebra (RM)'), 'alg');
assert.equal(H.courseKey('Razonamiento verbal'), 'hum');
assert.equal(H.courseKey('Humanidades'), 'hum');

// .ics
const ics = H.buildIcs(pre.slice(0, 2), 'pre', '20261105T200000Z');
assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 2);
assert.ok(ics.includes('DTSTART;VALUE=DATE:20260913\r\nDTEND;VALUE=DATE:20260914'));
assert.ok(ics.includes('SUMMARY:CEPREUNI · Primera práctica calificada'));
assert.ok(ics.includes('Hora: 9:00 a. m. (Lima)'));
assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
assert.ok(!/[^\r]\n/.test(ics), 'todas las líneas terminan en CRLF');
// fin de mes: DTEND no se rompe
assert.ok(H.buildIcs([{ date: '2026-12-31', name: 'x', mode: 'y', timed: false }], 'ien', 'z').includes('DTEND;VALUE=DATE:20270101'));
// semanas: la semana en curso, domingos y recesos apuntan a la siguiente, nunca fuera de rango
assert.equal(H.weekIndex('pre', at('2026-11-05T20:00:00Z')), 9);     // jueves 5 nov = semana 10
assert.equal(H.weekIndex('pre', at('2026-11-08T17:00:00Z')), 10);    // domingo 8 nov = semana 11
assert.equal(H.weekIndex('pre', at('2026-12-21T17:00:00Z')), 16);    // receso: la semana 17 (4 al 9 ene)
assert.equal(H.weekIndex('pre', at('2026-08-01T17:00:00Z')), 0);
assert.equal(H.weekIndex('pre', at('2027-03-01T17:00:00Z')), 19);
assert.equal(H.weekIndex('ien', at('2026-11-05T20:00:00Z')), 16);    // IEN va 3 semanas adelante
assert.equal(H.weekIndexOfDate('pre', '2026-11-15'), 11);

// temas: solo el ciclo Pre los tiene; cada curso trae las 20 semanas
assert.equal(JSON.stringify(H.topicsFor('pre', 'geo', 13)), JSON.stringify(['Ángulos poliedros y triedro', 'Poliedros']));
assert.equal(H.topicsFor('basico', 'geo', 13), null);
assert.equal(H.humFor('pre', 9).length, 9);
assert.equal(H.humFor('ien', 9).length, 0);
['fis', 'qui', 'ari', 'alg', 'geo', 'tri'].forEach((k) => assert.equal(ctx.window.UNIVERSE_CEPREUNI_WEEKS.silabo.pre[k].length, 20));

// cursos y días
const rows = H.courseRows('pre');
assert.equal(rows.map((r) => r.name).join('|'), 'Aritmética|Álgebra|Geometría|Trigonometría|Física|Química|Humanidades');
assert.equal(H.daysText(rows.find((r) => r.name === 'Álgebra').days), 'Lun y Mié');
assert.equal(H.daysText(rows.find((r) => r.name === 'Humanidades').days), 'Lun a Sáb');
assert.ok(H.courseRows('basico').some((r) => r.name === 'Álgebra (RM)'));

// avisos: los días sin clase y las recuperaciones aparecen en su semana
assert.ok(H.weekNotes('pre', 5).some((n) => n.date === '2026-10-08' && n.k === 'off'));
assert.ok(H.weekNotes('pre', 15).some((n) => n.date === '2026-12-21' && n.after));
assert.equal(H.weekNotes('pre', 9).length, 0);

// URL: valores válidos se respetan, los desconocidos se ignoran (también claves heredadas de Object)
const now = at('2026-11-05T20:00:00Z');
assert.deepEqual(JSON.parse(JSON.stringify(H.initial('?ciclo=ien&semana=3&vista=dia', null, now))), { cycle: 'ien', wk: 2, view: 'dia' });
assert.deepEqual(JSON.parse(JSON.stringify(H.initial('?ciclo=constructor&semana=99&vista=x', 'toString', now))), { cycle: 'pre', wk: 9, view: 'curso' });
assert.equal(H.initial('', 'basico', now).cycle, 'basico');
console.log('ok · test-cepreuni-hub');
