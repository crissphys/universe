/* POST /api/correcciones
   Recibe un reporte del formulario de /correcciones, lo valida y lo entrega al propietario:
     1. correo (Resend) a REPORT_TO_EMAIL, a universetostudyoficial@gmail.com (o REPORT_TO_EMAIL si se define);
     2. respaldo en Firebase (/site/universeV1/reports) si hay credenciales.
   Responde ok si al menos una de las dos entregas funcionó. Más específico que [[path]].js, así que tiene prioridad.

   Variables (Cloudflare Pages → Settings → Variables and Secrets):
     RESEND_API_KEY       clave de https://resend.com (secreta)
     REPORT_TO_EMAIL      opcional; por defecto los reportes llegan a universetostudyoficial@gmail.com
     REPORT_FROM_EMAIL    remitente, p. ej. "Universe Reportes <reportes@universetostudy.com>" (dominio verificado en Resend).
                          Sin él se usa onboarding@resend.dev, que solo entrega al correo dueño de la cuenta de Resend.
     FIREBASE_DATABASE_URL / FIREBASE_DATABASE_SECRET   ya existentes; activan el respaldo. */

const OWNER_EMAIL = 'universetostudyoficial@gmail.com';
const RATE = new Map();
const MAX = { name: 80, email: 120, page: 160, url: 300, data: 400, message: 2000 };

const TYPES = {
  academica: { label: 'Académica', high: false },
  datos: { label: 'Datos (notas, códigos, resultados)', high: true },
  tecnica: { label: 'Técnica o visual', high: false },
  derechos: { label: 'Derechos de autor o material externo', high: true },
  privacidad: { label: 'Privacidad y datos personales', high: true }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  });
}

export function clean(value, max, multiline) {
  let s = String(value == null ? '' : value)
    .normalize('NFC')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f​-‏‪-‮⁦-⁩﻿]/g, '');
  s = multiline ? s.replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n') : s.replace(/\s+/g, ' ');
  return s.slice(0, max).trim();
}

export function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]{1,64}@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

/* Valida y normaliza el cuerpo. Devuelve { ok, value } o { ok:false, field, error }. */
export function validate(body) {
  if (!body || typeof body !== 'object') return { ok: false, field: 'body', error: 'invalid_body' };
  const type = String(body.type || '');
  if (!TYPES[type]) return { ok: false, field: 'type', error: 'type_required' };
  const name = clean(body.name, MAX.name);
  if (name.length < 2) return { ok: false, field: 'name', error: 'name_required' };
  const email = clean(body.email, MAX.email).toLowerCase();
  if (email && !EMAIL_RE.test(email)) return { ok: false, field: 'email', error: 'email_invalid' };
  const page = clean(body.page, MAX.page);
  if (!page) return { ok: false, field: 'page', error: 'page_required' };
  const url = clean(body.url, MAX.url);
  if (url && !/^https?:\/\/[^\s]+$/i.test(url) && !/^\/[^\s]*$/.test(url)) return { ok: false, field: 'url', error: 'url_invalid' };
  const data = clean(body.data, MAX.data);
  const message = clean(body.message, MAX.message, true);
  if (message.length < 15) return { ok: false, field: 'message', error: 'message_short' };
  if (body.consent !== true) return { ok: false, field: 'consent', error: 'consent_required' };
  const ageOk = body.guardian === true || body.adult === true;
  return { ok: true, value: { type, name, email, page, url, data, message, ageOk } };
}

export function makeId(now = Date.now()) {
  const rand = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().padStart(6, '0').slice(-4);
  return 'COR-' + now.toString(36).toUpperCase().slice(-6) + '-' + rand;
}

function limited(request, max, windowMs) {
  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  const now = Date.now();
  const hit = RATE.get(ip) || { n: 0, reset: now + windowMs };
  if (now > hit.reset) { hit.n = 0; hit.reset = now + windowMs; }
  hit.n += 1;
  RATE.set(ip, hit);
  if (RATE.size > 500) for (const [k, v] of RATE) if (now > v.reset) RATE.delete(k);
  return hit.n > max;
}

function recipient(env) {
  const direct = clean(env.REPORT_TO_EMAIL, 200);
  if (EMAIL_RE.test(direct)) return direct;
  const first = String(env.ADMIN_EMAILS || '').split(/[,;\s]+/).map((e) => e.trim()).find((e) => EMAIL_RE.test(e));
  return first || OWNER_EMAIL;
}

export function buildEmail(id, v, meta) {
  const type = TYPES[v.type];
  const prio = type.high ? 'Alta' : 'Normal';
  const when = new Date(meta.at).toLocaleString('es-PE', { timeZone: 'America/Lima', dateStyle: 'full', timeStyle: 'short' });
  const subject = ('[Correcciones' + (type.high ? ' · ALTA' : '') + '] ' + type.label.split(' (')[0] + ' · ' + v.page + ' — ' + v.name).replace(/[\r\n]+/g, ' ').slice(0, 200);
  const rows = [
    ['Referencia', id],
    ['Prioridad', prio],
    ['Tipo', type.label],
    ['Página', v.page],
    ['Enlace exacto', v.url || '—'],
    ['Datos', v.data || '—'],
    ['Nombre', v.name],
    ['Correo para responder', v.email || 'No dejó correo'],
    ['Edad / representante', v.ageOk ? 'Declaró ser mayor de 14 o contar con autorización' : 'Sin declarar'],
    ['Fecha (Lima)', when],
    ['Enviado desde', meta.origin || '—'],
    ['Navegador', meta.ua || '—']
  ];
  const text = rows.map((r) => r[0] + ': ' + r[1]).join('\n') + '\n\nMensaje:\n' + v.message + '\n';
  const html = '<div style="font:15px/1.55 -apple-system,Segoe UI,Roboto,sans-serif;color:#18181b;max-width:620px">' +
    '<p style="margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b6b76">UNIverse · Correcciones</p>' +
    '<h1 style="margin:0 0 16px;font-size:22px;letter-spacing:-.02em">' + esc(type.label.split(' (')[0]) + ' en ' + esc(v.page) + '</h1>' +
    '<table role="presentation" style="border-collapse:collapse;width:100%;font-size:14px">' +
    rows.map((r) => '<tr><td style="padding:7px 12px 7px 0;color:#6b6b76;white-space:nowrap;vertical-align:top;border-top:1px solid #ececf0">' + esc(r[0]) +
      '</td><td style="padding:7px 0;border-top:1px solid #ececf0">' + esc(r[1]) + '</td></tr>').join('') +
    '</table><h2 style="margin:22px 0 6px;font-size:14px;color:#6b6b76;font-weight:500">Mensaje</h2>' +
    '<div style="white-space:pre-wrap;background:#f5f5f7;border-radius:12px;padding:14px 16px">' + esc(v.message) + '</div>' +
    (v.email ? '<p style="margin:18px 0 0;font-size:13px;color:#6b6b76">Puedes responder directamente a este correo.</p>' : '') + '</div>';
  return { subject, text, html };
}

async function sendEmail(env, to, mail, replyTo) {
  if (!env.RESEND_API_KEY || !to) return false;
  const payload = {
    from: clean(env.REPORT_FROM_EMAIL, 200) || 'Universe Reportes <onboarding@resend.dev>',
    to: [to],
    subject: mail.subject,
    text: mail.text,
    html: mail.html
  };
  if (replyTo) payload.reply_to = replyTo;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.ok;
}

async function saveBackup(env, id, record) {
  if (!env.FIREBASE_DATABASE_URL || !env.FIREBASE_DATABASE_SECRET) return false;
  const url = new URL(env.FIREBASE_DATABASE_URL.replace(/\/+$/, '') + '/site/universeV1/reports/' + id + '.json');
  url.searchParams.set('auth', env.FIREBASE_DATABASE_SECRET);
  const res = await fetch(url.toString(), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record) });
  return res.ok;
}

export async function onRequest(context) {
  const request = context.request;
  const env = context.env || {};
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const url = new URL(request.url);
  const origin = request.headers.get('Origin');
  if (origin) {
    let host = '';
    try { host = new URL(origin).host; } catch (e) { /* origen inválido */ }
    if (host !== url.host) return json({ error: 'forbidden_origin' }, 403);
  }
  if (!/^application\/json\b/i.test(request.headers.get('Content-Type') || '')) return json({ error: 'json_required' }, 415);
  if (Number(request.headers.get('Content-Length') || 0) > 12000) return json({ error: 'too_large' }, 413);
  if (limited(request, 5, 10 * 60 * 1000)) return json({ error: 'rate_limited' }, 429);

  let body;
  try {
    const raw = await request.text();
    if (raw.length > 12000) return json({ error: 'too_large' }, 413);
    body = JSON.parse(raw);
  } catch (e) { return json({ error: 'invalid_body' }, 400); }

  /* Campo trampa: las personas no lo ven; si viene lleno es un bot. Se responde ok sin hacer nada. */
  if (body && body.website) return json({ ok: true, id: makeId() });

  const check = validate(body);
  if (!check.ok) return json({ error: check.error, field: check.field }, 400);

  const v = check.value;
  const id = makeId();
  const at = Date.now();
  const meta = { at, origin: origin || url.origin, ua: clean(request.headers.get('User-Agent'), 200) };
  const mail = buildEmail(id, v, meta);

  const [mailed, saved] = await Promise.all([
    sendEmail(env, recipient(env), mail, v.email).catch(() => false),
    saveBackup(env, id, { id, at, status: 'nuevo', priority: TYPES[v.type].high ? 'alta' : 'normal', ...v, origin: meta.origin }).catch(() => false)
  ]);

  if (!mailed && !saved) return json({ error: 'delivery_unavailable' }, 503);
  return json({ ok: true, id, emailed: mailed, saved });
}
