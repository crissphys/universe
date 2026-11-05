/* Prueba la función /api/correcciones sin red: validación, trampa para bots, origen, límite de envíos,
   correo (Resend simulado) y respaldo (Firebase simulado). Uso: node tools/test-correcciones.mjs */
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const dir = mkdtempSync(join(tmpdir(), 'cor-'));
const file = join(dir, 'correcciones.mjs');
writeFileSync(file, readFileSync(new URL('../functions/api/correcciones.js', import.meta.url)));
const mod = await import(file);

const good = { type: 'datos', name: 'Ana Pérez', email: 'ana@example.com', page: 'Ranking', url: 'https://universetostudy.com/ranking', data: 'Código 20261234J', message: 'La nota de la PC2 aparece como 12 pero en el boletín oficial es 14.', adult: true, consent: true, website: '' };

/* --- validate --- */
assert.equal(mod.validate(good).ok, true);
assert.equal(mod.validate({ ...good, type: 'otro' }).field, 'type');
assert.equal(mod.validate({ ...good, name: 'A' }).field, 'name');
assert.equal(mod.validate({ ...good, email: 'no-es-correo' }).field, 'email');
assert.equal(mod.validate({ ...good, email: '' }).ok, true, 'el correo es opcional');
assert.equal(mod.validate({ ...good, page: '' }).field, 'page');
assert.equal(mod.validate({ ...good, url: 'javascript:alert(1)' }).field, 'url');
assert.equal(mod.validate({ ...good, url: '/ranking' }).ok, true);
assert.equal(mod.validate({ ...good, message: 'corto' }).field, 'message');
assert.equal(mod.validate({ ...good, consent: false }).field, 'consent');
assert.equal(mod.validate({ ...good, consent: 'true' }).field, 'consent', 'el consentimiento debe ser booleano true');
assert.equal(mod.validate({ ...good, message: 'x'.repeat(5000) }).value.message.length, 2000);
assert.equal(mod.validate({ ...good, name: 'Ana‮\u0000 Pérez' }).value.name, 'Ana Pérez', 'quita caracteres de control y bidi');
assert.equal(mod.validate(null).ok, false);

/* --- correo --- */
assert.equal(mod.esc('<b>"x"&\'</b>'), '&lt;b&gt;&quot;x&quot;&amp;&#39;&lt;/b&gt;');
const mail = mod.buildEmail('COR-TEST', { ...mod.validate({ ...good, name: 'Ana\nBcc: x@y.z', message: '<script>alert(1)</script> mensaje largo suficiente' }).value }, { at: Date.UTC(2026, 10, 5, 20), origin: 'https://universetostudy.com' });
assert.ok(!/[\r\n]/.test(mail.subject), 'el asunto no admite saltos de línea');
assert.ok(mail.subject.includes('ALTA'));
assert.ok(!mail.html.includes('<script>'), 'el HTML escapa el mensaje');
assert.ok(mail.text.includes('COR-TEST'));
assert.match(mod.makeId(), /^COR-[0-9A-Z]{1,6}-[0-9A-Z]{4}$/);

/* --- handler --- */
const calls = [];
globalThis.fetch = async (url, init) => { calls.push({ url: String(url), init }); return new Response('{}', { status: 200 }); };
const env = { RESEND_API_KEY: 're_test', REPORT_TO_EMAIL: 'dueno@example.com', FIREBASE_DATABASE_URL: 'https://x.firebaseio.com/', FIREBASE_DATABASE_SECRET: 's' };
let n = 0;
function req(body, { method = 'POST', origin = 'https://universetostudy.com', type = 'application/json', ip } = {}) {
  const headers = { 'Content-Type': type, 'CF-Connecting-IP': ip || '10.0.0.' + (++n) };
  if (origin) headers.Origin = origin;
  return { request: new Request('https://universetostudy.com/api/correcciones', { method, headers, body: method === 'POST' ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined }), env };
}
const run = async (c) => { const r = await mod.onRequest(c); return { status: r.status, body: await r.json() }; };

let r = await run(req(good));
assert.equal(r.status, 200); assert.equal(r.body.ok, true); assert.equal(r.body.emailed, true); assert.equal(r.body.saved, true);
const resend = calls.find((c) => c.url === 'https://api.resend.com/emails');
const sent = JSON.parse(resend.init.body);
assert.deepEqual(sent.to, ['dueno@example.com']); assert.equal(sent.reply_to, 'ana@example.com');
assert.equal(resend.init.headers.Authorization, 'Bearer re_test');
assert.ok(calls.some((c) => c.url.startsWith('https://x.firebaseio.com/site/universeV1/reports/COR-') && c.url.includes('auth=s')), 'respaldo en Firebase');

r = await run(req({ ...good, name: 'x' })); assert.equal(r.status, 400); assert.equal(r.body.field, 'name');
r = await run(req(good, { method: 'GET' })); assert.equal(r.status, 405);
r = await run(req(good, { origin: 'https://malo.example' })); assert.equal(r.status, 403);
r = await run(req(good, { type: 'text/plain' })); assert.equal(r.status, 415);
r = await run(req('{no json')); assert.equal(r.status, 400);
const before = calls.length;
r = await run(req({ ...good, website: 'http://spam' })); assert.equal(r.status, 200); assert.equal(calls.length, before, 'un bot no dispara envíos');

/* solo respaldo / solo correo / nada */
calls.length = 0; r = await mod.onRequest({ ...req(good), env: { RESEND_API_KEY: 're', REPORT_TO_EMAIL: 'a@b.co' } }); assert.equal(r.status, 200);
r = await mod.onRequest({ ...req(good), env: {} }); assert.equal(r.status, 503, 'sin ningún destino responde 503 para que la página ofrezca WhatsApp');
globalThis.fetch = async () => { throw new Error('red caída'); };
r = await mod.onRequest({ ...req(good), env }); assert.equal(r.status, 503);
globalThis.fetch = async (u) => new Response('{}', { status: String(u).includes('resend') ? 500 : 200 });
r = await run(req(good)); assert.equal(r.status, 200); assert.equal(r.body.emailed, false); assert.equal(r.body.saved, true, 'si falla el correo, el respaldo basta');
globalThis.fetch = async () => new Response('{}');
r = await mod.onRequest({ ...req(good), env: { RESEND_API_KEY: 're', ADMIN_EMAILS: 'primero@x.co, segundo@x.co' } }); assert.equal(r.status, 200);

/* límite de envíos: 5 por IP cada 10 minutos */
const codes = []; for (let i = 0; i < 7; i++) codes.push((await run(req(good, { ip: '203.0.113.9' }))).status);
assert.deepEqual(codes, [200, 200, 200, 200, 200, 429, 429]);

console.log('correcciones: todo en orden');
