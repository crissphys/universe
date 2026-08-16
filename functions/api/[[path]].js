import { EXAM_BANKS, DEFAULT_EXAM_ID, getExamBank } from '../exam-data.js';

const RATE = new Map();

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      ...extra
    }
  });
}

function cleanId(value) {
  return String(value || '').replace(/[^a-zA-Z0-9_-]/g, '');
}

function cleanSlug(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 80);
}

function cleanText(value, max = 8000) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .slice(0, max)
    .trim();
}

const ACADEMIES = [
  'Pitágoras', 'César Vallejo', 'ADUNI', 'Trilce', 'Pamer', 'Exclusiva UNI',
  'ACUNI', 'Grupo Ciencias', 'Vonex', 'Saco Oliveros', 'Integral Class',
  'Academia Prisma', 'Otra academia'
];
const ACADEMIC_TRACKS = ['cepreuni', 'uni-student', 'san-marcos', 'academy', 'independent'];
const TARGETS = ['UNI', 'San Marcos', 'Otra universidad', 'Aún no lo decido'];
const UNIT_ROOT = '/community/unitalkV1';
const BLOCKED_TERMS = [
  'pornografía', 'pornografia', 'contenido sexual', 'venta de drogas',
  'amenaza de muerte', 'suicídate', 'suicidate'
];
const CENSORED_TERMS = [
  'hijo de puta', 'hija de puta', 'concha tu madre', 'conchatumadre',
  'puta', 'puto', 'mierda', 'carajo', 'pendejo', 'pendeja',
  'huevón', 'huevon', 'webón', 'webon', 'weón', 'weon',
  'cabrón', 'cabron', 'cojudo', 'cojuda', 'maricón', 'maricon',
  'imbécil', 'imbecil', 'idiota', 'estúpido', 'estupido',
  'estúpida', 'estupida', 'verga', 'ctm'
];

function cleanUsername(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 24);
}

function validUsername(value) {
  return /^[a-z0-9][a-z0-9_-]{2,23}$/.test(String(value || ''));
}

function cleanBoolean(value, fallback = false) {
  return value === true || value === 'true' ? true : value === false || value === 'false' ? false : fallback;
}

function censorText(value) {
  var text = String(value || '');
  CENSORED_TERMS.forEach(function (term) {
    var escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    var pattern = new RegExp('(^|[^\\p{L}\\p{N}_])(' + escaped + ')(?=$|[^\\p{L}\\p{N}_])', 'giu');
    text = text.replace(pattern, function (_, prefix, word) {
      return prefix + word.replace(/\S/g, '•');
    });
  });
  return text;
}

function moderateText(value, max) {
  var original = cleanText(value, max).replace(/\s{3,}/g, '  ');
  var normalized = original.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  var blocked = BLOCKED_TERMS.some(function (term) {
    return normalized.includes(term.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
  });
  var links = (original.match(/https?:\/\/|www\./gi) || []).length;
  var text = censorText(original);
  return {
    text,
    allowed: !!text && !blocked && links <= 2,
    reason: blocked ? 'contenido_no_permitido' : links > 2 ? 'demasiados_enlaces' : !text ? 'contenido_vacio' : ''
  };
}

function safeAvatar(value) {
  var src = cleanText(value, 360000);
  if (/^data:image\/(?:jpe?g|png|webp);base64,[a-z0-9+/=]+$/i.test(src) && src.length <= 350000) return src;
  if (/^https:\/\/[^\s"'<>]{1,1800}$/i.test(src)) return src;
  return '';
}

const UNIT_ATTACHMENT_RULES = {
  image: { types: ['image/jpeg', 'image/png', 'image/webp'], legacyMax: 1200000 },
  video: { types: ['video/mp4', 'video/webm'], legacyMax: 6000000 },
  pdf: { types: ['application/pdf'], legacyMax: 3000000 }
};
const UNIT_UPLOAD_PART_BYTES = 8 * 1024 * 1024;
const UNIT_UPLOAD_MAX_PARTS = 10000;

function cleanFileName(value) {
  return cleanText(value, 90).replace(/[\\/:*?"<>|]/g, '_').replace(/\s{2,}/g, ' ') || 'archivo';
}

function decodeBase64(value) {
  var binary = atob(value);
  var bytes = new Uint8Array(binary.length);
  for (var i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function validAttachmentSignature(kind, mime, bytes) {
  if (!bytes || !bytes.length) return false;
  if (kind === 'pdf') return bytes.length > 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  if (mime === 'image/jpeg') return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === 'image/png') return bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (mime === 'image/webp') return bytes.length > 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  if (mime === 'video/mp4') return bytes.length > 12 && String.fromCharCode(...bytes.slice(4, 8)) === 'ftyp';
  if (mime === 'video/webm') return bytes.length > 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
  return false;
}

function sanitizeNewAttachment(value) {
  if (!value) return { attachment: null, bytes: null, data: '' };
  if (typeof value !== 'object') return { error: 'attachment_invalid' };
  var kind = cleanText(value.kind, 10).toLowerCase();
  var mime = cleanText(value.mime, 40).toLowerCase();
  var rule = UNIT_ATTACHMENT_RULES[kind];
  if (!rule || !rule.types.includes(mime)) return { error: 'attachment_invalid' };
  var source = String(value.dataUrl || '');
  var match = source.match(/^data:([a-z0-9.+/-]+);base64,([a-z0-9+/=]+)$/i);
  if (!match || match[1].toLowerCase() !== mime) return { error: 'attachment_invalid' };
  var estimatedSize = Math.max(0, Math.floor(match[2].length * 3 / 4) - (match[2].endsWith('==') ? 2 : match[2].endsWith('=') ? 1 : 0));
  if (!estimatedSize || estimatedSize > rule.legacyMax) return { error: 'attachment_too_large' };
  var bytes;
  try { bytes = decodeBase64(match[2]); } catch (error) { return { error: 'attachment_invalid' }; }
  if (bytes.length !== estimatedSize || !validAttachmentSignature(kind, mime, bytes)) return { error: 'attachment_invalid' };
  return {
    attachment: { kind, mime, name: cleanFileName(value.name), size: bytes.length },
    bytes,
    data: match[2]
  };
}

function publicAttachment(value) {
  value = value && typeof value === 'object' ? value : {};
  var id = cleanId(value.id);
  var kind = cleanText(value.kind, 10).toLowerCase();
  var mime = cleanText(value.mime, 40).toLowerCase();
  var rule = UNIT_ATTACHMENT_RULES[kind];
  if (!id || !rule || !rule.types.includes(mime)) return null;
  return {
    id,
    kind,
    mime,
    name: cleanFileName(value.name),
    size: Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Number(value.size) || 0)),
    url: '/api/unitalk/media/' + encodeURIComponent(id)
  };
}

function uploadAttachmentReference(value) {
  if (!value || typeof value !== 'object') return '';
  return cleanId(value.uploadId || value.id);
}

function parseMediaRange(value, total) {
  var match = String(value || '').match(/^bytes=(\d*)-(\d*)$/);
  if (!match || !total) return null;
  var start;
  var end;
  if (!match[1] && match[2]) {
    var suffix = Math.max(1, Math.min(total, Number(match[2]) || 0));
    start = total - suffix;
    end = total - 1;
  } else {
    start = Math.max(0, Number(match[1]) || 0);
    end = match[2] ? Math.min(total - 1, Number(match[2]) || 0) : total - 1;
  }
  if (start >= total || start > end) return { invalid: true };
  return { start, end, length: end - start + 1 };
}

function r2MediaResponse(storedObject, media, request, requestedRange) {
  var total = Math.max(0, Number(media.size) || Number(storedObject.size) || 0);
  var status = requestedRange ? 206 : 200;
  var start = requestedRange ? requestedRange.start : 0;
  var end = requestedRange ? requestedRange.end : Math.max(0, total - 1);
  var fileName = cleanFileName(media.name).replace(/[^\x20-\x7e]/g, '_');
  var headers = {
    'Content-Type': media.mime,
    'Content-Length': String(requestedRange ? requestedRange.length : total),
    'Content-Disposition': 'inline; filename="' + fileName.replace(/"/g, '_') + '"',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'private, max-age=300',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; sandbox"
  };
  if (status === 206) headers['Content-Range'] = 'bytes ' + start + '-' + end + '/' + total;
  return new Response(storedObject.body, { status, headers });
}

function mediaResponse(bytes, media, request) {
  var total = bytes.length;
  var start = 0;
  var end = Math.max(0, total - 1);
  var status = 200;
  var range = request.headers.get('Range') || '';
  var match = range.match(/^bytes=(\d*)-(\d*)$/);
  if (match && total) {
    start = match[1] ? Math.min(total - 1, Number(match[1])) : 0;
    end = match[2] ? Math.min(total - 1, Number(match[2])) : end;
    if (start > end) return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + total } });
    status = 206;
  }
  var fileName = cleanFileName(media.name).replace(/[^\x20-\x7e]/g, '_');
  var headers = {
    'Content-Type': media.mime,
    'Content-Length': String(end - start + 1),
    'Content-Disposition': 'inline; filename="' + fileName.replace(/"/g, '_') + '"',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'private, max-age=300',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; sandbox"
  };
  if (status === 206) headers['Content-Range'] = 'bytes ' + start + '-' + end + '/' + total;
  return new Response(bytes.slice(start, end + 1), { status, headers });
}

function normalizeHashtag(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9_]/g, '').replace(/_+/g, '_').replace(/^_|_$/g, '').slice(0, 30);
}

function extractHashtags(value) {
  var tags = [];
  String(value || '').replace(/(^|\s)#([\p{L}\p{N}_]{2,30})/gu, function (_, prefix, tag) {
    tag = normalizeHashtag(tag);
    if (tag.length >= 2 && !tags.includes(tag) && tags.length < 8) tags.push(tag);
    return _;
  });
  return tags;
}

function sanitizeNewPoll(value) {
  if (!value) return { poll: null };
  if (typeof value !== 'object' || !Array.isArray(value.options) || value.options.length < 2 || value.options.length > 4) return { error: 'poll_invalid' };
  var options = [];
  var seen = new Set();
  for (var i = 0; i < value.options.length; i += 1) {
    var moderated = moderateText(value.options[i], 80);
    if (!moderated.allowed || /https?:\/\/|www\./i.test(moderated.text)) return { error: 'poll_invalid' };
    var comparable = moderated.text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (seen.has(comparable)) return { error: 'poll_invalid' };
    seen.add(comparable);
    options.push({ id: 'o' + (i + 1), text: moderated.text, votes: 0 });
  }
  return { poll: { options, totalVotes: 0 } };
}

function publicPoll(value, myVote) {
  value = value && typeof value === 'object' ? value : {};
  if (!Array.isArray(value.options) || value.options.length < 2 || value.options.length > 4) return null;
  var options = value.options.map(function (option, index) {
    return {
      id: cleanId(option && option.id) || 'o' + (index + 1),
      text: censorText(cleanText(option && option.text, 80)),
      votes: Math.max(0, Number(option && option.votes) || 0)
    };
  }).filter(function (option) { return option.text; });
  if (options.length < 2) return null;
  var validIds = options.map(function (option) { return option.id; });
  return {
    options,
    totalVotes: options.reduce(function (sum, option) { return sum + option.votes; }, 0),
    myVote: validIds.includes(cleanId(myVote)) ? cleanId(myVote) : ''
  };
}

function publicProfile(profile, viewer) {
  profile = profile && typeof profile === 'object' ? profile : {};
  var visibility = ['public', 'members', 'private'].includes(profile.profileVisibility) ? profile.profileVisibility : 'public';
  var isOwner = !!(viewer && viewer.id === profile.userId);
  var canSee = isOwner || visibility === 'public' || (visibility === 'members' && !!viewer);
  var result = {
    username: cleanUsername(profile.username),
    displayName: censorText(cleanText(profile.displayName || 'Estudiante Universe', 40)),
    bio: canSee ? censorText(cleanText(profile.bio, 160)) : '',
    avatar: canSee && profile.showAvatar !== false ? safeAvatar(profile.avatar) : '',
    profileVisibility: visibility,
    joinedAt: Number(profile.joinedAt) || 0
  };
  if (canSee && profile.showAcademy !== false) result.academy = cleanText(profile.academy, 60);
  if (canSee && profile.showCycle !== false) result.cycle = cleanText(profile.cycle, 30);
  if (canSee && profile.showTarget !== false) result.target = cleanText(profile.target, 40);
  if (!canSee) result.private = true;
  return result;
}

function sanitizeAcademicProfile(data, existing, auth) {
  data = data && typeof data === 'object' ? data : {};
  existing = existing && typeof existing === 'object' ? existing : {};
  var track = ACADEMIC_TRACKS.includes(data.academicTrack) ? data.academicTrack : existing.academicTrack || '';
  var academy = track === 'academy' && ACADEMIES.includes(data.academyName) ? data.academyName : '';
  var cycle = track === 'cepreuni' ? cleanText(data.cepreCycle, 20) : '';
  var code = track === 'cepreuni' ? cleanText(data.cepreCode || existing.cepreCode, 12).toUpperCase().replace(/\s+/g, '') : '';
  return {
    userId: auth.id,
    email: auth.email,
    googleName: auth.name,
    googleAvatar: auth.avatar,
    firstName: cleanText(data.firstName !== undefined ? data.firstName : existing.firstName, 40),
    lastName: cleanText(data.lastName !== undefined ? data.lastName : existing.lastName, 60),
    age: Math.max(0, Math.min(99, Number(data.age !== undefined ? data.age : existing.age) || 0)),
    phone: cleanText(data.phone !== undefined ? data.phone : existing.phone, 24),
    academicTrack: track,
    academyName: academy,
    cepreMember: track === 'cepreuni',
    cepreCycle: cycle,
    cepreCode: code,
    target: TARGETS.includes(data.target) ? data.target : existing.target || '',
    onboardingComplete: cleanBoolean(data.onboardingComplete, existing.onboardingComplete === true),
    createdAt: Number(existing.createdAt) || Date.now(),
    updatedAt: Date.now()
  };
}

function sanitizePublicSiteData(data) {
  data = data && typeof data === 'object' ? data : {};
  var announcement = data.announcement && typeof data.announcement === 'object' ? data.announcement : {};
  var schedule = data.schedule && typeof data.schedule === 'object' ? data.schedule : {};
  var publicImage = sanitizeImage(announcement.image);
  return {
    announcement: {
      active: announcement.active !== false,
      title: cleanText(announcement.title, 120),
      text: cleanText(announcement.text, 1200),
      image: publicImage ? publicImage.src : '',
      updatedAt: Number(announcement.updatedAt) || 0
    },
    schedule: {
      countdowns: schedule.countdowns && typeof schedule.countdowns === 'object' ? schedule.countdowns : {},
      extraEvents: Array.isArray(schedule.extraEvents) ? schedule.extraEvents.slice(0, 100) : [],
      updatedAt: Number(schedule.updatedAt) || 0
    }
  };
}

function sanitizeImage(value) {
  var src = '';
  if (typeof value === 'string') src = value;
  if (value && typeof value === 'object') src = value.src || value.url || value.dataUrl || '';
  src = String(src || '').trim();
  if (/^data:image\/(?:png|jpe?g|webp);base64,[a-z0-9+/=]+$/i.test(src) && src.length < 1200000) return { src };
  if (/^https:\/\/[^\s"'<>()]+$/i.test(src) && src.length < 2000) return { src };
  return null;
}

function sanitizeChoice(choice, index) {
  var label = typeof choice === 'object' && choice ? choice.label : '';
  var text = typeof choice === 'object' && choice ? choice.text : choice;
  label = cleanText(label || String.fromCharCode(65 + index), 2).toUpperCase().replace(/[^A-E]/g, '') || String.fromCharCode(65 + index);
  return { label, text: cleanText(text, 1800) };
}

function sanitizeQuestion(question, index) {
  question = question && typeof question === 'object' ? question : {};
  var choices = Array.isArray(question.choices) ? question.choices : [];
  var image = sanitizeImage(question.image);
  var safe = {
    id: cleanId(question.id || String(index + 1)),
    number: cleanText(question.number || index + 1, 12),
    cycle: cleanText(question.cycle, 40),
    sourceTitle: cleanText(question.sourceTitle, 180),
    week: cleanText(question.week, 60),
    requiresImage: question.requiresImage === true,
    stem: cleanText(question.stem || question.enunciado, 12000),
    choices: choices.slice(0, 5).map(sanitizeChoice).filter(function (choice) { return choice.text; })
  };
  if (image) safe.image = image;
  return safe;
}

function base64url(input) {
  var bytes = input instanceof Uint8Array ? input : new TextEncoder().encode(String(input));
  var text = '';
  bytes.forEach(function (b) { text += String.fromCharCode(b); });
  return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function unbase64url(value) {
  var b64 = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  b64 += '='.repeat((4 - b64.length % 4) % 4);
  return atob(b64);
}

async function hmac(secret, text) {
  var key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return base64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(text))));
}

async function signSession(env, user) {
  if (!env.SESSION_SECRET) throw new Error('SESSION_SECRET missing');
  var now = Math.floor(Date.now() / 1000);
  var payload = base64url(JSON.stringify({
    sub: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    admin: user.isAdmin === true,
    iat: now,
    exp: now + 60 * 60 * 24 * 30
  }));
  return payload + '.' + await hmac(env.SESSION_SECRET, payload);
}

async function verifySession(request, env) {
  try {
    var auth = request.headers.get('Authorization') || '';
    var token = auth.replace(/^Bearer\s+/i, '');
    var parts = token.split('.');
    if (parts.length !== 2 || !env.SESSION_SECRET) return null;
    var expected = await hmac(env.SESSION_SECRET, parts[0]);
    if (expected !== parts[1]) return null;
    var payload = JSON.parse(unbase64url(parts[0]));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return {
      id: cleanId(payload.sub),
      email: String(payload.email || '').toLowerCase(),
      name: String(payload.name || 'Usuario Google'),
      avatar: String(payload.avatar || ''),
      admin: payload.admin === true
    };
  } catch (error) {
    return null;
  }
}

async function sha256HexText(text) {
  var bytes = new TextEncoder().encode(String(text || '').trim().toLowerCase());
  var hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
}

async function isAdminEmail(env, email) {
  var normalized = String(email || '').trim().toLowerCase();
  var emails = String(env.ADMIN_EMAILS || '')
    .split(',')
    .map(function (v) { return v.trim().toLowerCase(); })
    .filter(Boolean)
  if (emails.includes(normalized)) return true;
  var emailHash = await sha256HexText(normalized);
  return [env.ADMIN_EMAIL_SHA256, env.ADMIN_EMAIL_SHA256_EXTRA]
    .filter(Boolean)
    .join(',')
    .split(',')
    .map(function (v) { return v.trim().toLowerCase(); })
    .filter(Boolean)
    .includes(emailHash);
}

function rateLimit(request, key, max = 90, windowMs = 60000) {
  var ip = request.headers.get('CF-Connecting-IP') || 'local';
  var id = ip + ':' + key;
  var now = Date.now();
  var hit = RATE.get(id);
  if (!hit || hit.until < now) hit = { count: 0, until: now + windowMs };
  hit.count += 1;
  RATE.set(id, hit);
  return hit.count <= max;
}

async function firebase(env, path, method = 'GET', data) {
  if (!env.FIREBASE_DATABASE_URL || !env.FIREBASE_DATABASE_SECRET) {
    throw new Error('Firebase backend secrets missing');
  }
  var url = new URL(env.FIREBASE_DATABASE_URL.replace(/\/+$/, '') + path + '.json');
  url.searchParams.set('auth', env.FIREBASE_DATABASE_SECRET);
  var res = await fetch(url.toString(), {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data === undefined ? undefined : JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Firebase HTTP ' + res.status);
  return method === 'DELETE' ? null : res.json();
}

async function firebaseReserve(env, path, data) {
  if (!env.FIREBASE_DATABASE_URL || !env.FIREBASE_DATABASE_SECRET) throw new Error('Firebase backend secrets missing');
  var url = new URL(env.FIREBASE_DATABASE_URL.replace(/\/+$/, '') + path + '.json');
  url.searchParams.set('auth', env.FIREBASE_DATABASE_SECRET);
  var current = await fetch(url.toString(), {
    headers: { 'X-Firebase-ETag': 'true' },
    cache: 'no-store'
  });
  if (!current.ok) throw new Error('Firebase HTTP ' + current.status);
  var value = await current.json();
  if (value !== null) return false;
  var saved = await fetch(url.toString(), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'If-Match': current.headers.get('ETag') || 'null_etag'
    },
    body: JSON.stringify(data)
  });
  if (saved.status === 412) return false;
  if (!saved.ok) throw new Error('Firebase HTTP ' + saved.status);
  return true;
}

async function claimUnitalkUpload(env, mediaId, authorId, postId) {
  if (!env.FIREBASE_DATABASE_URL || !env.FIREBASE_DATABASE_SECRET) throw new Error('Firebase backend secrets missing');
  var path = UNIT_ROOT + '/uploads/' + cleanId(mediaId);
  var url = new URL(env.FIREBASE_DATABASE_URL.replace(/\/+$/, '') + path + '.json');
  url.searchParams.set('auth', env.FIREBASE_DATABASE_SECRET);
  var current = await fetch(url.toString(), {
    headers: { 'X-Firebase-ETag': 'true' },
    cache: 'no-store'
  });
  if (!current.ok) throw new Error('Firebase HTTP ' + current.status);
  var value = await current.json();
  if (!value || value.authorId !== authorId || value.status !== 'ready' || value.usedAt) return false;
  var claimedAt = Date.now();
  var claimed = Object.assign({}, value, {
    status: 'claimed',
    postId: cleanId(postId),
    claimedAt,
    updatedAt: claimedAt
  });
  var saved = await fetch(url.toString(), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'If-Match': current.headers.get('ETag') || 'null_etag'
    },
    body: JSON.stringify(claimed)
  });
  if (saved.status === 412) return false;
  if (!saved.ok) throw new Error('Firebase HTTP ' + saved.status);
  return true;
}

async function firebaseQuery(env, path, params) {
  if (!env.FIREBASE_DATABASE_URL || !env.FIREBASE_DATABASE_SECRET) throw new Error('Firebase backend secrets missing');
  var url = new URL(env.FIREBASE_DATABASE_URL.replace(/\/+$/, '') + path + '.json');
  url.searchParams.set('auth', env.FIREBASE_DATABASE_SECRET);
  Object.keys(params || {}).forEach(function (key) { url.searchParams.set(key, params[key]); });
  var res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Firebase HTTP ' + res.status);
  return res.json();
}

async function ensurePrivateProfile(env, user) {
  var path = '/site/universeV1/profiles/' + user.id;
  var existing = await firebase(env, path, 'GET');
  if (!existing) {
    existing = {
      userId: user.id,
      email: user.email,
      googleName: user.name,
      googleAvatar: user.avatar,
      onboardingComplete: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await firebase(env, path, 'PUT', existing);
    return existing;
  }
  await firebase(env, path, 'PATCH', {
    email: user.email,
    googleName: user.name,
    googleAvatar: user.avatar,
    lastSeenAt: Date.now()
  });
  return existing;
}

async function googleAuth(request, env) {
  if (!rateLimit(request, 'google-auth', 20, 60000)) return json({ error: 'rate_limited' }, 429);
  var body = await request.json().catch(function () { return {}; });
  var credential = String(body.credential || '');
  if (!credential || !env.GOOGLE_CLIENT_ID) return json({ error: 'missing_google_config' }, 400);
  var res = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(credential), { cache: 'no-store' });
  if (!res.ok) return json({ error: 'invalid_google_token' }, 401);
  var info = await res.json();
  if (info.aud !== env.GOOGLE_CLIENT_ID || info.email_verified !== 'true') return json({ error: 'invalid_google_audience' }, 401);
  var user = {
    id: 'google_' + cleanId(info.sub),
    name: info.name || info.given_name || 'Usuario Google',
    email: String(info.email || '').toLowerCase(),
    avatar: info.picture || '',
    provider: 'google',
    isAdmin: await isAdminEmail(env, info.email),
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  var profile = null;
  try { profile = await ensurePrivateProfile(env, user); } catch (error) {}
  user.onboardingComplete = !!(profile && profile.onboardingComplete);
  return json({ user, token: await signSession(env, user) });
}

async function authMe(request, env) {
  var auth = await verifySession(request, env);
  if (!auth) return json({ error: 'login_required' }, 401);
  var profile = await firebase(env, '/site/universeV1/profiles/' + auth.id, 'GET').catch(function () { return null; });
  return json({
    user: {
      id: auth.id,
      name: auth.name,
      email: auth.email,
      avatar: auth.avatar,
      provider: 'google',
      isAdmin: auth.admin === true,
      secureSession: true,
      onboardingComplete: !!(profile && profile.onboardingComplete)
    }
  });
}

async function handleSite(request, env, subpath) {
  var auth = await verifySession(request, env);
  var method = request.method.toUpperCase();
  var path = '/' + subpath.replace(/^\/+/, '').replace(/\.json$/i, '');
  var data = method === 'GET' || method === 'DELETE' ? undefined : await request.json().catch(function () { return {}; });

  if (method === 'GET' && path === '/public') return json(sanitizePublicSiteData(await firebase(env, '/site/universeV1/public', 'GET')));
  if (method === 'GET' && path.startsWith('/public/')) {
    var publicData = sanitizePublicSiteData(await firebase(env, '/site/universeV1/public', 'GET'));
    return json(path === '/public/announcement' ? publicData.announcement : path === '/public/schedule' ? publicData.schedule : {});
  }
  if (path.startsWith('/public') && (!auth || !auth.admin)) return json({ error: 'admin_required' }, 403);

  if (path.startsWith('/profiles/')) {
    if (!auth) return json({ error: 'login_required' }, 401);
    var profileId = cleanId(path.split('/')[2]);
    if (!auth.admin && profileId !== auth.id) return json({ error: 'forbidden' }, 403);
    if (method === 'GET') {
      return json(await firebase(env, '/site/universeV1/profiles/' + profileId, 'GET') || {});
    }
    if (!['PATCH', 'PUT'].includes(method)) return json({ error: 'method_not_allowed' }, 405);
    if (!auth.admin) {
      var existingProfile = await firebase(env, '/site/universeV1/profiles/' + profileId, 'GET') || {};
      data = sanitizeAcademicProfile(data, existingProfile, auth);
    }
    return json(await firebase(env, '/site/universeV1/profiles/' + profileId, method, data));
  }

  if (path.startsWith('/codeOwners')) {
    if (!auth) return json({ error: 'login_required' }, 401);
    var ownerPath = '/site/universeV1' + path;
    if (method === 'GET') {
      var ownerValue = await firebase(env, ownerPath, 'GET');
      return json(ownerValue && ownerValue.userId ? { userId: cleanId(ownerValue.userId), claimed: true } : null);
    }
    if (method !== 'PUT') return json({ error: 'method_not_allowed' }, 405);
    var currentOwner = await firebase(env, ownerPath, 'GET');
    if (currentOwner && currentOwner.userId && currentOwner.userId !== auth.id) return json({ error: 'code_already_claimed' }, 409);
    if (!currentOwner) {
      var reserved = await firebaseReserve(env, ownerPath, {
        userId: auth.id,
        cycle: cleanText(data && data.cycle, 20),
        createdAt: Date.now()
      });
      if (!reserved) {
        currentOwner = await firebase(env, ownerPath, 'GET');
        if (!currentOwner || currentOwner.userId !== auth.id) return json({ error: 'code_already_claimed' }, 409);
      }
    }
    return json({ ok: true, userId: auth.id });
  }

  if (path === '/users' && method === 'GET') {
    if (!auth) return json({ error: 'login_required' }, 401);
    var users = await firebase(env, '/site/universeV1/users', 'GET') || {};
    var publicUsers = {};
    Object.keys(users).slice(0, 500).forEach(function (id) {
      var row = users[id] || {};
      publicUsers[cleanId(id)] = {
        id: cleanId(id),
        name: cleanText(row.name || 'Estudiante Universe', 40),
        points: Math.max(0, Number(row.points) || 0),
        streak: Math.max(0, Number(row.streak) || 0),
        completion: Math.max(0, Math.min(100, Number(row.completion) || 0)),
        monthKey: cleanText(row.monthKey, 10),
        updatedAt: Number(row.updatedAt) || 0
      };
    });
    return json(publicUsers);
  }

  if (path.startsWith('/users/') && method === 'PATCH') {
    if (!auth) return json({ error: 'login_required' }, 401);
    var userId = cleanId(path.split('/')[2]);
    if (!auth.admin && userId !== auth.id) return json({ error: 'forbidden' }, 403);
    var row = {
      id: userId,
      name: cleanText(data && data.name || auth.name || 'Estudiante Universe', 40),
      points: Math.max(0, Math.min(10000000, Number(data && data.points) || 0)),
      streak: Math.max(0, Math.min(10000, Number(data && data.streak) || 0)),
      completion: Math.max(0, Math.min(100, Number(data && data.completion) || 0)),
      monthKey: cleanText(data && data.monthKey, 10),
      updatedAt: Date.now()
    };
    return json(await firebase(env, '/site/universeV1/users/' + userId, 'PATCH', row));
  }

  if (!auth || !auth.admin) return json({ error: 'admin_required' }, 403);
  return json(await firebase(env, '/site/universeV1' + path, method, data));
}

async function handleSupport(request, env, subpath) {
  var auth = await verifySession(request, env);
  if (!auth) return json({ error: 'gmail_required' }, 401);
  var method = request.method.toUpperCase();
  var path = '/' + subpath.replace(/^\/+/, '').replace(/\.json$/i, '');
  var data = method === 'GET' || method === 'DELETE' ? undefined : await request.json().catch(function () { return {}; });
  var root = '/chat/supportPrivateV2';

  if (path === '/threads' && !auth.admin) return json({ error: 'admin_required' }, 403);
  if (path === '/presence/admin' && method !== 'GET' && !auth.admin) return json({ error: 'admin_required' }, 403);

  var match = path.match(/^\/threads\/([^/]+)/);
  if (match && !auth.admin) {
    var threadPath = root + '/threads/' + cleanId(match[1]);
    if (method === 'GET') {
      var thread = await firebase(env, threadPath, 'GET');
      if (thread && thread.meta && thread.meta.userId && thread.meta.userId !== auth.id) return json({ error: 'forbidden' }, 403);
      return json(thread || {});
    }
    if (data) {
      if (path.includes('/messages')) {
        data.admin = false;
        data.userId = auth.id;
        data.name = auth.name;
        data.userEmail = auth.email;
        data.userAvatar = auth.avatar;
      } else if (path.includes('/meta')) {
        data.userId = auth.id;
        data.userName = auth.name;
        data.userEmail = auth.email;
        data.userAvatar = auth.avatar;
      }
    }
  }

  return json(await firebase(env, root + path, method, data));
}

var CLASS_TOPIC_RANGES = {
  fisica: {
    'analisis-dimensional-vectores': ['Libro 1', 1, 30],
    'sistema-internacional': ['Libro 1', 1, 11],
    vectores: ['Libro 1', 12, 30],
    cinematica: ['Libro 1', 31, 68],
    'movimiento-circular': ['Libro 1', 69, 89],
    dinamica: ['Libro 1', 90, 151],
    gravitacion: ['Libro 1', 152, 180],
    'trabajo-energia': ['Libro 1', 181, 216],
    'impulso-colisiones': ['Libro 1', 217, 249],
    'movimiento-armonico': ['Libro 1', 250, 275],
    ondas: ['Libro 1', 276, 304],
    fluidos: ['Libro 1', 305, 999],
    'calor-temperatura': ['Libro 2', 1, 47],
    termodinamica: ['Libro 2', 48, 80],
    electrostatica: ['Libro 2', 81, 130],
    capacitores: ['Libro 2', 131, 147],
    'corriente-circuitos': ['Libro 2', 148, 203],
    magnetismo: ['Libro 2', 204, 240],
    'induccion-electromagnetica': ['Libro 2', 241, 269],
    'ondas-electromagneticas': ['Libro 2', 270, 285],
    optica: ['Libro 2', 286, 318],
    'fisica-moderna': ['Libro 2', 319, 999]
  }
};

function deriveClassQuestions(course, topic, questions) {
  if (!Array.isArray(questions) || !questions.length) return [];
  var range = CLASS_TOPIC_RANGES[course] && CLASS_TOPIC_RANGES[course][topic];
  if (range) {
    return questions.filter(function (question) {
      var number = Number.parseInt(String(question.number || '').replace(/\D/g, ''), 10);
      return String(question.sourceTitle || '').includes(range[0]) &&
        Number.isFinite(number) && number >= range[1] && number <= range[2];
    });
  }
  var weekMatch = String(topic || '').match(/^semana-(\d{1,2})$/);
  if (!weekMatch) return [];
  var week = Number(weekMatch[1]);
  if (week < 1 || week > 20) return [];
  var start = Math.floor((week - 1) * questions.length / 20);
  var end = Math.floor(week * questions.length / 20);
  return questions.slice(start, Math.max(start + 1, end));
}

async function handleClasses(request, env, subpath) {
  var auth = await verifySession(request, env);
  if (!auth) return json({ error: 'login_required' }, 401);
  var method = request.method.toUpperCase();
  var url = new URL(request.url);
  var path = '/' + subpath.replace(/^\/+/, '').replace(/\.json$/i, '');
  var course = cleanSlug(url.searchParams.get('course'));
  var topic = cleanSlug(url.searchParams.get('topic'));

  if (path === '/questions' && method === 'GET') {
    if (!rateLimit(request, 'classes-questions', 80, 60000)) return json({ error: 'rate_limited' }, 429);
    if (!course || !topic) return json({ error: 'missing_course_or_topic' }, 400);
    var stored = await firebase(env, '/classes/questionsV1/' + course + '/' + topic, 'GET');
    var source = Array.isArray(stored) ? stored : (stored && stored.questions);
    var questions = Array.isArray(source) ? source.map(sanitizeQuestion).filter(function (q) {
      return q.stem && q.choices && q.choices.length;
    }) : [];
    if (!questions.length && topic !== 'general') {
      var generalStored = await firebase(env, '/classes/questionsV1/' + course + '/general', 'GET');
      var generalSource = Array.isArray(generalStored) ? generalStored : (generalStored && generalStored.questions);
      var generalQuestions = Array.isArray(generalSource) ? generalSource.map(sanitizeQuestion).filter(function (q) {
        return q.stem && q.choices && q.choices.length;
      }) : [];
      questions = deriveClassQuestions(course, topic, generalQuestions);
    }
    return json({ course, topic, questions, exactTopic: Boolean(CLASS_TOPIC_RANGES[course] && CLASS_TOPIC_RANGES[course][topic]) });
  }

  if (path === '/admin/import' && method === 'POST') {
    if (!auth.admin) return json({ error: 'admin_required' }, 403);
    if (!rateLimit(request, 'classes-import', 12, 60000)) return json({ error: 'rate_limited' }, 429);
    var body = await request.json().catch(function () { return {}; });
    course = cleanSlug(body.course || course);
    topic = cleanSlug(body.topic || topic);
    if (!course || !topic) return json({ error: 'missing_course_or_topic' }, 400);
    var input = Array.isArray(body.questions) ? body.questions.slice(0, 1200) : [];
    var safeQuestions = input.map(sanitizeQuestion).filter(function (q) {
      return q.stem && q.choices && q.choices.length;
    });
    await firebase(env, '/classes/questionsV1/' + course + '/' + topic, 'PUT', {
      updatedAt: Date.now(),
      updatedBy: auth.email,
      questions: safeQuestions
    });
    return json({ ok: true, course, topic, count: safeQuestions.length });
  }

  return json({ error: 'not_found' }, 404);
}

function newCommunityId(prefix) {
  var random = crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '').slice(0, 14) : Math.random().toString(36).slice(2, 16);
  return prefix + '_' + Date.now().toString(36) + '_' + random;
}

async function communityProfileById(env, userId) {
  return await firebase(env, UNIT_ROOT + '/profiles/' + cleanId(userId), 'GET') || null;
}

async function communityProfileByUsername(env, username) {
  username = cleanUsername(username);
  if (!validUsername(username)) return null;
  var owner = await firebase(env, UNIT_ROOT + '/usernames/' + username, 'GET');
  if (!owner || !owner.userId) return null;
  return communityProfileById(env, owner.userId);
}

async function saveCommunityProfile(env, auth, data, academic) {
  data = data && typeof data === 'object' ? data : {};
  academic = academic && typeof academic === 'object' ? academic : {};
  var existing = await communityProfileById(env, auth.id) || {};
  var username = cleanUsername(data.username || existing.username);
  if (!validUsername(username)) return { error: 'invalid_username', status: 400 };
  if (existing.username && existing.username !== username) {
    var lastChange = Number(existing.usernameChangedAt) || Number(existing.joinedAt) || 0;
    if (lastChange && Date.now() - lastChange < 30 * 86400000) return { error: 'username_change_wait', status: 409 };
  }
  var owner = await firebase(env, UNIT_ROOT + '/usernames/' + username, 'GET');
  if (owner && owner.userId && owner.userId !== auth.id) return { error: 'username_taken', status: 409 };
  if (!owner) {
    var reserved = await firebaseReserve(env, UNIT_ROOT + '/usernames/' + username, { userId: auth.id, createdAt: Date.now() });
    if (!reserved) {
      owner = await firebase(env, UNIT_ROOT + '/usernames/' + username, 'GET');
      if (!owner || owner.userId !== auth.id) return { error: 'username_taken', status: 409 };
    }
  }
  var visibility = ['public', 'members', 'private'].includes(data.profileVisibility) ? data.profileVisibility : existing.profileVisibility || 'public';
  var profile = {
    userId: auth.id,
    username,
    displayName: cleanText(data.displayName || existing.displayName || auth.name || 'Estudiante Universe', 40),
    bio: cleanText(data.bio !== undefined ? data.bio : existing.bio, 160),
    avatar: safeAvatar(data.avatar !== undefined ? data.avatar : existing.avatar || auth.avatar),
    academy: academic.academicTrack === 'academy' ? cleanText(academic.academyName, 60) :
      academic.academicTrack === 'cepreuni' ? 'CEPREUNI' :
      academic.academicTrack === 'uni-student' ? 'Universidad Nacional de Ingeniería' :
      academic.academicTrack === 'san-marcos' ? 'Postulante San Marcos' :
      academic.academicTrack === 'independent' ? 'Estudiante independiente' : cleanText(existing.academy, 60),
    cycle: cleanText(academic.cepreCycle || data.cycle || existing.cycle, 30),
    target: TARGETS.includes(data.target) ? data.target : academic.target || existing.target || '',
    profileVisibility: visibility,
    showAvatar: cleanBoolean(data.showAvatar, existing.showAvatar !== false),
    showAcademy: cleanBoolean(data.showAcademy, existing.showAcademy !== false),
    showCycle: cleanBoolean(data.showCycle, existing.showCycle !== false),
    showTarget: cleanBoolean(data.showTarget, existing.showTarget !== false),
    joinedAt: Number(existing.joinedAt) || Date.now(),
    usernameChangedAt: existing.username === username ? Number(existing.usernameChangedAt) || 0 : Date.now(),
    updatedAt: Date.now()
  };
  if (!profile.displayName) return { error: 'display_name_required', status: 400 };
  await firebase(env, UNIT_ROOT + '/profiles/' + auth.id, 'PUT', profile);
  if (existing.username && existing.username !== username) {
    var oldOwner = await firebase(env, UNIT_ROOT + '/usernames/' + cleanUsername(existing.username), 'GET');
    if (oldOwner && oldOwner.userId === auth.id) await firebase(env, UNIT_ROOT + '/usernames/' + cleanUsername(existing.username), 'DELETE');
  }
  return { profile };
}

async function requireCommunityMember(env, auth) {
  if (!auth) return { error: 'login_required', status: 401 };
  var academic = await firebase(env, '/site/universeV1/profiles/' + auth.id, 'GET') || {};
  var profile = await communityProfileById(env, auth.id);
  if (!academic.onboardingComplete || !profile || !profile.username) return { error: 'profile_required', status: 403 };
  return { academic, profile };
}

async function postView(env, post, viewer, profileCache) {
  profileCache = profileCache || {};
  var authorId = cleanId(post.authorId);
  if (!profileCache[authorId]) profileCache[authorId] = await communityProfileById(env, authorId) || {};
  var myReaction = viewer ? await firebase(env, UNIT_ROOT + '/reactions/' + cleanId(post.id) + '/' + viewer.id, 'GET') : null;
  var myPollVote = viewer && post.poll ? await firebase(env, UNIT_ROOT + '/pollVotes/' + cleanId(post.id) + '/' + viewer.id, 'GET') : null;
  return {
    id: cleanId(post.id),
    text: censorText(cleanText(post.text, 400)),
    discussion: post.discussion === true,
    hashtags: Array.isArray(post.hashtags) ? post.hashtags.map(cleanSlug).filter(Boolean).slice(0, 8) : extractHashtags(post.text),
    attachment: publicAttachment(post.attachment),
    poll: publicPoll(post.poll, myPollVote && myPollVote.optionId),
    createdAt: Number(post.createdAt) || 0,
    updatedAt: Number(post.updatedAt) || 0,
    likes: Math.max(0, Number(post.likes) || 0),
    dislikes: Math.max(0, Number(post.dislikes) || 0),
    comments: Math.max(0, Number(post.comments) || 0),
    author: publicProfile(profileCache[authorId], viewer),
    myReaction: myReaction && ['like', 'dislike'].includes(myReaction.type) ? myReaction.type : '',
    canDelete: !!(viewer && (viewer.admin || viewer.id === authorId))
  };
}

async function commentView(env, comment, viewer, profileCache) {
  profileCache = profileCache || {};
  var authorId = cleanId(comment.authorId);
  if (!profileCache[authorId]) profileCache[authorId] = await communityProfileById(env, authorId) || {};
  return {
    id: cleanId(comment.id),
    text: censorText(cleanText(comment.text, 250)),
    createdAt: Number(comment.createdAt) || 0,
    author: publicProfile(profileCache[authorId], viewer),
    canDelete: !!(viewer && (viewer.admin || viewer.id === authorId))
  };
}

async function handleUnitalk(request, env, subpath) {
  var auth = await verifySession(request, env);
  var method = request.method.toUpperCase();
  var path = '/' + subpath.replace(/^\/+/, '').replace(/\.json$/i, '');
  var rawUploadPart = method === 'PUT' && /^\/uploads\/[a-zA-Z0-9_-]+\/parts\/\d+$/.test(path);
  var body = method === 'GET' || method === 'DELETE' || rawUploadPart
    ? {}
    : await request.json().catch(function () { return {}; });

  if (path === '/onboarding' && method === 'POST') {
    if (!auth) return json({ error: 'login_required' }, 401);
    if (!rateLimit(request, 'unitalk-onboarding-' + auth.id, 8, 60000)) return json({ error: 'rate_limited' }, 429);
    var existingAcademic = await firebase(env, '/site/universeV1/profiles/' + auth.id, 'GET') || {};
    body.cepreCode = existingAcademic.cepreCode || '';
    var academic = sanitizeAcademicProfile(body, existingAcademic, auth);
    if (!academic.academicTrack) return json({ error: 'academic_track_required' }, 400);
    if (academic.academicTrack === 'academy' && !academic.academyName) return json({ error: 'academy_required' }, 400);
    academic.target = TARGETS.includes(body.target) ? body.target : existingAcademic.target || '';
    if (!academic.target) return json({ error: 'target_required' }, 400);
    academic.onboardingComplete = true;
    var community = await saveCommunityProfile(env, auth, body, academic);
    if (community.error) return json({ error: community.error }, community.status);
    await firebase(env, '/site/universeV1/profiles/' + auth.id, 'PUT', academic);
    return json({ ok: true, profile: publicProfile(community.profile, auth), academic: {
      academicTrack: academic.academicTrack,
      academyName: academic.academyName,
      cepreCycle: academic.cepreCycle,
      target: academic.target,
      onboardingComplete: true
    } });
  }

  if (path === '/me') {
    if (!auth) return json({ error: 'login_required' }, 401);
    var ownAcademic = await firebase(env, '/site/universeV1/profiles/' + auth.id, 'GET') || {};
    if (method === 'GET') {
      var ownProfile = await communityProfileById(env, auth.id);
      return json({ profile: ownProfile || null, academic: ownAcademic });
    }
    if (method !== 'PUT' && method !== 'PATCH') return json({ error: 'method_not_allowed' }, 405);
    var savedProfile = await saveCommunityProfile(env, auth, body, ownAcademic);
    if (savedProfile.error) return json({ error: savedProfile.error }, savedProfile.status);
    return json({ ok: true, profile: savedProfile.profile });
  }

  var profileMatch = path.match(/^\/profile\/([a-zA-Z0-9_-]+)$/);
  if (profileMatch && method === 'GET') {
    var foundProfile = await communityProfileByUsername(env, profileMatch[1]);
    if (!foundProfile) return json({ error: 'profile_not_found' }, 404);
    return json({ profile: publicProfile(foundProfile, auth) });
  }

  if (path === '/uploads/start' && method === 'POST') {
    if (!rateLimit(request, 'unitalk-upload-start', 8, 60000)) return json({ error: 'rate_limited' }, 429);
    var uploadingMember = await requireCommunityMember(env, auth);
    if (uploadingMember.error) return json({ error: uploadingMember.error }, uploadingMember.status);
    if (!env.UNITALK_MEDIA || typeof env.UNITALK_MEDIA.createMultipartUpload !== 'function') {
      return json({ error: 'media_storage_unavailable' }, 503);
    }
    var uploadKind = cleanText(body.kind, 10).toLowerCase();
    var uploadMime = cleanText(body.mime, 40).toLowerCase();
    var uploadRule = UNIT_ATTACHMENT_RULES[uploadKind];
    var uploadSize = Math.floor(Number(body.size) || 0);
    if (!uploadRule || !uploadRule.types.includes(uploadMime) || uploadSize < 1 || !Number.isSafeInteger(uploadSize)) {
      return json({ error: 'attachment_invalid' }, 400);
    }
    var expectedParts = Math.ceil(uploadSize / UNIT_UPLOAD_PART_BYTES);
    if (expectedParts < 1 || expectedParts > UNIT_UPLOAD_MAX_PARTS) return json({ error: 'attachment_too_large' }, 413);
    var uploadMediaId = newCommunityId('m');
    var multipartUpload = await env.UNITALK_MEDIA.createMultipartUpload(uploadMediaId, {
      httpMetadata: { contentType: uploadMime },
      customMetadata: {
        authorId: auth.id,
        kind: uploadKind,
        originalName: cleanFileName(body.name)
      }
    });
    var uploadRecord = {
      id: uploadMediaId,
      authorId: auth.id,
      uploadId: multipartUpload.uploadId,
      kind: uploadKind,
      mime: uploadMime,
      name: cleanFileName(body.name),
      size: uploadSize,
      partSize: UNIT_UPLOAD_PART_BYTES,
      expectedParts,
      status: 'uploading',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    try {
      await firebase(env, UNIT_ROOT + '/uploads/' + uploadMediaId, 'PUT', uploadRecord);
    } catch (error) {
      await multipartUpload.abort().catch(function () {});
      throw error;
    }
    return json({
      id: uploadMediaId,
      partSize: UNIT_UPLOAD_PART_BYTES,
      expectedParts
    }, 201);
  }

  var uploadPartMatch = path.match(/^\/uploads\/([a-zA-Z0-9_-]+)\/parts\/(\d+)$/);
  if (uploadPartMatch && method === 'PUT') {
    if (!auth) return json({ error: 'login_required' }, 401);
    if (!rateLimit(request, 'unitalk-upload-part-' + auth.id, 180, 60000)) return json({ error: 'rate_limited' }, 429);
    if (!env.UNITALK_MEDIA || typeof env.UNITALK_MEDIA.resumeMultipartUpload !== 'function') {
      return json({ error: 'media_storage_unavailable' }, 503);
    }
    var partMediaId = cleanId(uploadPartMatch[1]);
    var partNumber = Number(uploadPartMatch[2]);
    var partRecord = await firebase(env, UNIT_ROOT + '/uploads/' + partMediaId, 'GET');
    if (!partRecord || partRecord.authorId !== auth.id || partRecord.status !== 'uploading') {
      return json({ error: 'upload_not_found' }, 404);
    }
    if (!Number.isInteger(partNumber) || partNumber < 1 || partNumber > Number(partRecord.expectedParts)) {
      return json({ error: 'upload_part_invalid' }, 400);
    }
    var contentLength = Number(request.headers.get('Content-Length')) || 0;
    if (!request.body || contentLength < 1 || contentLength > UNIT_UPLOAD_PART_BYTES) {
      return json({ error: 'upload_part_invalid' }, 400);
    }
    var expectedLength = partNumber < Number(partRecord.expectedParts)
      ? UNIT_UPLOAD_PART_BYTES
      : Number(partRecord.size) - UNIT_UPLOAD_PART_BYTES * (Number(partRecord.expectedParts) - 1);
    if (contentLength !== expectedLength) return json({ error: 'upload_part_invalid' }, 400);
    var resumedUpload = env.UNITALK_MEDIA.resumeMultipartUpload(partMediaId, cleanText(partRecord.uploadId, 256));
    var uploadedPart = await resumedUpload.uploadPart(partNumber, request.body);
    return json({ partNumber: uploadedPart.partNumber, etag: uploadedPart.etag });
  }

  var uploadCompleteMatch = path.match(/^\/uploads\/([a-zA-Z0-9_-]+)\/complete$/);
  if (uploadCompleteMatch && method === 'POST') {
    if (!auth) return json({ error: 'login_required' }, 401);
    if (!rateLimit(request, 'unitalk-upload-complete-' + auth.id, 12, 60000)) return json({ error: 'rate_limited' }, 429);
    if (!env.UNITALK_MEDIA || typeof env.UNITALK_MEDIA.resumeMultipartUpload !== 'function') {
      return json({ error: 'media_storage_unavailable' }, 503);
    }
    var completedMediaId = cleanId(uploadCompleteMatch[1]);
    var completedRecord = await firebase(env, UNIT_ROOT + '/uploads/' + completedMediaId, 'GET');
    if (!completedRecord || completedRecord.authorId !== auth.id || completedRecord.status !== 'uploading') {
      return json({ error: 'upload_not_found' }, 404);
    }
    var completedParts = Array.isArray(body.parts) ? body.parts.map(function (part) {
      return {
        partNumber: Math.floor(Number(part && part.partNumber) || 0),
        etag: cleanText(part && part.etag, 160)
      };
    }).sort(function (a, b) { return a.partNumber - b.partNumber; }) : [];
    if (completedParts.length !== Number(completedRecord.expectedParts) || completedParts.some(function (part, index) {
      return part.partNumber !== index + 1 || !part.etag;
    })) return json({ error: 'upload_incomplete' }, 400);
    var completingUpload = env.UNITALK_MEDIA.resumeMultipartUpload(completedMediaId, cleanText(completedRecord.uploadId, 256));
    var completedObject = await completingUpload.complete(completedParts);
    if (Number(completedObject.size) !== Number(completedRecord.size)) {
      await env.UNITALK_MEDIA.delete(completedMediaId).catch(function () {});
      await firebase(env, UNIT_ROOT + '/uploads/' + completedMediaId, 'PATCH', { status: 'invalid', updatedAt: Date.now() });
      return json({ error: 'upload_size_mismatch' }, 400);
    }
    var signatureObject = await env.UNITALK_MEDIA.get(completedMediaId, { range: { offset: 0, length: 16 } });
    var signatureBytes = signatureObject ? new Uint8Array(await signatureObject.arrayBuffer()) : null;
    if (!validAttachmentSignature(completedRecord.kind, completedRecord.mime, signatureBytes)) {
      await env.UNITALK_MEDIA.delete(completedMediaId).catch(function () {});
      await firebase(env, UNIT_ROOT + '/uploads/' + completedMediaId, 'PATCH', { status: 'invalid', updatedAt: Date.now() });
      return json({ error: 'attachment_invalid' }, 400);
    }
    var readyAt = Date.now();
    var completedMedia = {
      id: completedMediaId,
      postId: '',
      authorId: auth.id,
      kind: completedRecord.kind,
      mime: completedRecord.mime,
      name: completedRecord.name,
      size: Number(completedRecord.size),
      storage: 'r2',
      status: 'ready',
      createdAt: Number(completedRecord.createdAt) || readyAt,
      updatedAt: readyAt
    };
    await Promise.all([
      firebase(env, UNIT_ROOT + '/media/' + completedMediaId, 'PUT', completedMedia),
      firebase(env, UNIT_ROOT + '/uploads/' + completedMediaId, 'PATCH', { status: 'ready', readyAt, updatedAt: readyAt })
    ]);
    return json({
      ok: true,
      attachment: publicAttachment(completedMedia)
    });
  }

  var uploadDeleteMatch = path.match(/^\/uploads\/([a-zA-Z0-9_-]+)$/);
  if (uploadDeleteMatch && method === 'DELETE') {
    if (!auth) return json({ error: 'login_required' }, 401);
    var abandonedMediaId = cleanId(uploadDeleteMatch[1]);
    var abandonedRecord = await firebase(env, UNIT_ROOT + '/uploads/' + abandonedMediaId, 'GET');
    if (!abandonedRecord || abandonedRecord.authorId !== auth.id) return json({ error: 'upload_not_found' }, 404);
    if (abandonedRecord.status === 'claimed' || abandonedRecord.status === 'used') {
      return json({ error: 'upload_already_used' }, 409);
    }
    if (abandonedRecord.status === 'uploading' && env.UNITALK_MEDIA && typeof env.UNITALK_MEDIA.resumeMultipartUpload === 'function') {
      var abandonedUpload = env.UNITALK_MEDIA.resumeMultipartUpload(abandonedMediaId, cleanText(abandonedRecord.uploadId, 256));
      await abandonedUpload.abort().catch(function () {});
    }
    if (env.UNITALK_MEDIA && typeof env.UNITALK_MEDIA.delete === 'function') await env.UNITALK_MEDIA.delete(abandonedMediaId).catch(function () {});
    await Promise.all([
      firebase(env, UNIT_ROOT + '/uploads/' + abandonedMediaId, 'DELETE').catch(function () {}),
      firebase(env, UNIT_ROOT + '/media/' + abandonedMediaId, 'DELETE').catch(function () {})
    ]);
    return json({ ok: true });
  }

  var mediaMatch = path.match(/^\/media\/([a-zA-Z0-9_-]+)$/);
  if (mediaMatch && method === 'GET') {
    if (!rateLimit(request, 'unitalk-media', 160, 60000)) return json({ error: 'rate_limited' }, 429);
    var mediaId = cleanId(mediaMatch[1]);
    var media = await firebase(env, UNIT_ROOT + '/media/' + mediaId, 'GET');
    if (!media || media.status === 'removed') return json({ error: 'media_not_found' }, 404);
    var mediaPost = await firebase(env, UNIT_ROOT + '/posts/' + cleanId(media.postId), 'GET');
    if (!mediaPost || mediaPost.status === 'removed') return json({ error: 'media_not_found' }, 404);
    var mediaInfo = publicAttachment({ id: mediaId, kind: media.kind, mime: media.mime, name: media.name, size: media.size });
    if (!mediaInfo) return json({ error: 'media_not_found' }, 404);
    if (media.storage === 'r2' && env.UNITALK_MEDIA && typeof env.UNITALK_MEDIA.get === 'function') {
      var requestedRange = parseMediaRange(request.headers.get('Range'), Number(media.size) || 0);
      if (requestedRange && requestedRange.invalid) {
        return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + (Number(media.size) || 0) } });
      }
      var storedObject = await env.UNITALK_MEDIA.get(mediaId, requestedRange ? {
        range: { offset: requestedRange.start, length: requestedRange.length }
      } : undefined);
      if (!storedObject) return json({ error: 'media_not_found' }, 404);
      return r2MediaResponse(storedObject, mediaInfo, request, requestedRange);
    }
    var mediaBytes;
    try { mediaBytes = decodeBase64(String(media.data || '')); }
    catch (error) { return json({ error: 'media_not_found' }, 404); }
    if (!validAttachmentSignature(mediaInfo.kind, mediaInfo.mime, mediaBytes)) return json({ error: 'media_not_found' }, 404);
    return mediaResponse(mediaBytes, mediaInfo, request);
  }

  if (path === '/feed' && method === 'GET') {
    if (!rateLimit(request, 'unitalk-feed', 100, 60000)) return json({ error: 'rate_limited' }, 429);
    var url = new URL(request.url);
    var limit = Math.max(5, Math.min(30, Number(url.searchParams.get('limit')) || 20));
    var postsObject = await firebaseQuery(env, UNIT_ROOT + '/posts', { orderBy: '"$key"', limitToLast: String(limit + 10) }) || {};
    var posts = Object.keys(postsObject).map(function (id) {
      var post = postsObject[id] || {};
      post.id = cleanId(post.id || id);
      return post;
    }).filter(function (post) { return post.status !== 'removed' && (post.text || post.attachment); })
      .sort(function (a, b) { return Number(b.createdAt) - Number(a.createdAt); }).slice(0, limit);
    var cache = {};
    var output = [];
    for (var i = 0; i < posts.length; i += 1) output.push(await postView(env, posts[i], auth, cache));
    return json({ posts: output });
  }

  if (path === '/posts' && method === 'POST') {
    if (!rateLimit(request, 'unitalk-post', 6, 60000)) return json({ error: 'rate_limited' }, 429);
    var member = await requireCommunityMember(env, auth);
    if (member.error) return json({ error: member.error }, member.status);
    var referencedUploadId = uploadAttachmentReference(body.attachment);
    var referencedUpload = null;
    var preparedAttachment;
    if (referencedUploadId) {
      referencedUpload = await firebase(env, UNIT_ROOT + '/uploads/' + referencedUploadId, 'GET');
      var referencedMedia = await firebase(env, UNIT_ROOT + '/media/' + referencedUploadId, 'GET');
      if (!referencedUpload || !referencedMedia || referencedUpload.authorId !== auth.id ||
          referencedUpload.status !== 'ready' || referencedUpload.usedAt || referencedMedia.status !== 'ready') {
        return json({ error: 'upload_not_found' }, 404);
      }
      preparedAttachment = {
        attachment: {
          kind: referencedMedia.kind,
          mime: referencedMedia.mime,
          name: referencedMedia.name,
          size: Number(referencedMedia.size) || 0
        },
        bytes: null,
        data: ''
      };
    } else {
      preparedAttachment = sanitizeNewAttachment(body.attachment);
    }
    if (preparedAttachment.error) return json({ error: preparedAttachment.error }, 400);
    var preparedPoll = sanitizeNewPoll(body.poll);
    if (preparedPoll.error) return json({ error: preparedPoll.error }, 400);
    var moderated = moderateText(body.text, 400);
    if (!moderated.allowed && !(moderated.reason === 'contenido_vacio' && preparedAttachment.attachment)) return json({ error: moderated.reason }, 400);
    if (preparedPoll.poll && !moderated.allowed) return json({ error: 'contenido_vacio' }, 400);
    var postId = newCommunityId('p');
    var referencedUploadClaimed = false;
    if (referencedUploadId) {
      referencedUploadClaimed = await claimUnitalkUpload(env, referencedUploadId, auth.id, postId);
      if (!referencedUploadClaimed) return json({ error: 'upload_not_found' }, 409);
    }
    var post = {
      id: postId,
      authorId: auth.id,
      text: moderated.allowed ? moderated.text : '',
      discussion: body.discussion === true,
      hashtags: moderated.allowed ? extractHashtags(moderated.text) : [],
      likes: 0,
      dislikes: 0,
      comments: 0,
      status: 'visible',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    if (preparedPoll.poll) post.poll = preparedPoll.poll;
    var savedMediaId = '';
    var legacyMediaCreated = false;
    if (preparedAttachment.attachment) {
      savedMediaId = referencedUploadId || newCommunityId('m');
      post.attachment = { id: savedMediaId, ...preparedAttachment.attachment };
      if (!referencedUploadId) {
        legacyMediaCreated = true;
        var mediaRecord = {
          id: savedMediaId,
          postId,
          authorId: auth.id,
          ...preparedAttachment.attachment,
          status: 'visible',
          createdAt: Date.now()
        };
        if (env.UNITALK_MEDIA && typeof env.UNITALK_MEDIA.put === 'function') {
          await env.UNITALK_MEDIA.put(savedMediaId, preparedAttachment.bytes, {
            httpMetadata: { contentType: preparedAttachment.attachment.mime }
          });
          mediaRecord.storage = 'r2';
        } else {
          mediaRecord.storage = 'firebase';
          mediaRecord.data = preparedAttachment.data;
        }
        try {
          await firebase(env, UNIT_ROOT + '/media/' + savedMediaId, 'PUT', mediaRecord);
        } catch (error) {
          if (mediaRecord.storage === 'r2' && env.UNITALK_MEDIA && typeof env.UNITALK_MEDIA.delete === 'function') await env.UNITALK_MEDIA.delete(savedMediaId).catch(function () {});
          throw error;
        }
      }
    }
    try {
      await firebase(env, UNIT_ROOT + '/posts/' + postId, 'PUT', post);
    } catch (error) {
      if (referencedUploadClaimed) {
        await firebase(env, UNIT_ROOT + '/uploads/' + referencedUploadId, 'PATCH', {
          status: 'ready',
          postId: '',
          claimedAt: 0,
          updatedAt: Date.now()
        }).catch(function () {});
      }
      if (savedMediaId && legacyMediaCreated) {
        await firebase(env, UNIT_ROOT + '/media/' + savedMediaId, 'DELETE').catch(function () {});
        if (env.UNITALK_MEDIA && typeof env.UNITALK_MEDIA.delete === 'function') await env.UNITALK_MEDIA.delete(savedMediaId).catch(function () {});
      }
      throw error;
    }
    if (referencedUploadId) {
      var usedAt = Date.now();
      await Promise.all([
        firebase(env, UNIT_ROOT + '/media/' + referencedUploadId, 'PATCH', { postId, status: 'visible', updatedAt: usedAt }),
        firebase(env, UNIT_ROOT + '/uploads/' + referencedUploadId, 'PATCH', { postId, status: 'used', usedAt, updatedAt: usedAt })
      ]);
    }
    return json({ ok: true, post: await postView(env, post, auth, { [auth.id]: member.profile }) }, 201);
  }

  var postMatch = path.match(/^\/posts\/([a-zA-Z0-9_-]+)$/);
  if (postMatch && method === 'DELETE') {
    if (!auth) return json({ error: 'login_required' }, 401);
    var deletePost = await firebase(env, UNIT_ROOT + '/posts/' + cleanId(postMatch[1]), 'GET');
    if (!deletePost) return json({ error: 'post_not_found' }, 404);
    if (!auth.admin && deletePost.authorId !== auth.id) return json({ error: 'forbidden' }, 403);
    await firebase(env, UNIT_ROOT + '/posts/' + cleanId(postMatch[1]), 'PATCH', { status: 'removed', removedAt: Date.now(), removedBy: auth.id });
    var deletedAttachment = publicAttachment(deletePost.attachment);
    if (deletedAttachment) {
      await firebase(env, UNIT_ROOT + '/media/' + deletedAttachment.id, 'DELETE').catch(function () {});
      if (env.UNITALK_MEDIA && typeof env.UNITALK_MEDIA.delete === 'function') await env.UNITALK_MEDIA.delete(deletedAttachment.id).catch(function () {});
    }
    if (deletePost.poll) await firebase(env, UNIT_ROOT + '/pollVotes/' + cleanId(postMatch[1]), 'DELETE').catch(function () {});
    return json({ ok: true });
  }

  var reactionMatch = path.match(/^\/posts\/([a-zA-Z0-9_-]+)\/reaction$/);
  if (reactionMatch && method === 'PUT') {
    if (!rateLimit(request, 'unitalk-reaction', 40, 60000)) return json({ error: 'rate_limited' }, 429);
    var reactingMember = await requireCommunityMember(env, auth);
    if (reactingMember.error) return json({ error: reactingMember.error }, reactingMember.status);
    var reactionPostId = cleanId(reactionMatch[1]);
    var reactionPost = await firebase(env, UNIT_ROOT + '/posts/' + reactionPostId, 'GET');
    if (!reactionPost || reactionPost.status === 'removed') return json({ error: 'post_not_found' }, 404);
    var type = ['like', 'dislike'].includes(body.type) ? body.type : '';
    var reactionPath = UNIT_ROOT + '/reactions/' + reactionPostId + '/' + auth.id;
    var previousReaction = await firebase(env, reactionPath, 'GET');
    if (!type || (previousReaction && previousReaction.type === type)) await firebase(env, reactionPath, 'DELETE');
    else await firebase(env, reactionPath, 'PUT', { type, updatedAt: Date.now() });
    var reactionRows = await firebase(env, UNIT_ROOT + '/reactions/' + reactionPostId, 'GET') || {};
    var counts = { like: 0, dislike: 0 };
    Object.keys(reactionRows).forEach(function (id) {
      var currentType = reactionRows[id] && reactionRows[id].type;
      if (currentType === 'like' || currentType === 'dislike') counts[currentType] += 1;
    });
    await firebase(env, UNIT_ROOT + '/posts/' + reactionPostId, 'PATCH', { likes: counts.like, dislikes: counts.dislike, updatedAt: Date.now() });
    var activeReaction = await firebase(env, reactionPath, 'GET');
    return json({ ok: true, likes: counts.like, dislikes: counts.dislike, myReaction: activeReaction && activeReaction.type || '' });
  }

  var pollVoteMatch = path.match(/^\/posts\/([a-zA-Z0-9_-]+)\/poll-vote$/);
  if (pollVoteMatch && method === 'PUT') {
    if (!rateLimit(request, 'unitalk-poll-vote', 30, 60000)) return json({ error: 'rate_limited' }, 429);
    var votingMember = await requireCommunityMember(env, auth);
    if (votingMember.error) return json({ error: votingMember.error }, votingMember.status);
    var pollPostId = cleanId(pollVoteMatch[1]);
    var pollPost = await firebase(env, UNIT_ROOT + '/posts/' + pollPostId, 'GET');
    if (!pollPost || pollPost.status === 'removed' || !pollPost.poll) return json({ error: 'poll_not_found' }, 404);
    var currentPoll = publicPoll(pollPost.poll, '');
    if (!currentPoll) return json({ error: 'poll_not_found' }, 404);
    var optionId = cleanId(body.optionId);
    if (!currentPoll.options.some(function (option) { return option.id === optionId; })) return json({ error: 'poll_option_invalid' }, 400);
    await firebase(env, UNIT_ROOT + '/pollVotes/' + pollPostId + '/' + auth.id, 'PUT', { optionId, updatedAt: Date.now() });
    var voteRows = await firebase(env, UNIT_ROOT + '/pollVotes/' + pollPostId, 'GET') || {};
    var voteCounts = {};
    currentPoll.options.forEach(function (option) { voteCounts[option.id] = 0; });
    Object.keys(voteRows).forEach(function (userId) {
      var votedOption = cleanId(voteRows[userId] && voteRows[userId].optionId);
      if (Object.prototype.hasOwnProperty.call(voteCounts, votedOption)) voteCounts[votedOption] += 1;
    });
    var updatedPoll = {
      options: currentPoll.options.map(function (option) { return { id: option.id, text: option.text, votes: voteCounts[option.id] || 0 }; }),
      totalVotes: Object.keys(voteCounts).reduce(function (sum, id) { return sum + voteCounts[id]; }, 0)
    };
    await firebase(env, UNIT_ROOT + '/posts/' + pollPostId, 'PATCH', { poll: updatedPoll, updatedAt: Date.now() });
    return json({ ok: true, poll: publicPoll(updatedPoll, optionId) });
  }

  var commentsMatch = path.match(/^\/posts\/([a-zA-Z0-9_-]+)\/comments$/);
  if (commentsMatch && method === 'GET') {
    var commentsPostId = cleanId(commentsMatch[1]);
    var commentsObject = await firebaseQuery(env, UNIT_ROOT + '/comments/' + commentsPostId, { orderBy: '"$key"', limitToLast: '80' }) || {};
    var comments = Object.keys(commentsObject).map(function (id) {
      var comment = commentsObject[id] || {};
      comment.id = cleanId(comment.id || id);
      return comment;
    }).filter(function (comment) { return comment.status !== 'removed' && comment.text; })
      .sort(function (a, b) { return Number(a.createdAt) - Number(b.createdAt); });
    var commentCache = {};
    var commentOutput = [];
    for (var j = 0; j < comments.length; j += 1) commentOutput.push(await commentView(env, comments[j], auth, commentCache));
    return json({ comments: commentOutput });
  }

  if (commentsMatch && method === 'POST') {
    if (!rateLimit(request, 'unitalk-comment', 12, 60000)) return json({ error: 'rate_limited' }, 429);
    var commentingMember = await requireCommunityMember(env, auth);
    if (commentingMember.error) return json({ error: commentingMember.error }, commentingMember.status);
    var commentPostId = cleanId(commentsMatch[1]);
    var parentPost = await firebase(env, UNIT_ROOT + '/posts/' + commentPostId, 'GET');
    if (!parentPost || parentPost.status === 'removed') return json({ error: 'post_not_found' }, 404);
    var commentText = moderateText(body.text, 250);
    if (!commentText.allowed) return json({ error: commentText.reason }, 400);
    var commentId = newCommunityId('c');
    var newComment = { id: commentId, authorId: auth.id, text: commentText.text, status: 'visible', createdAt: Date.now() };
    await firebase(env, UNIT_ROOT + '/comments/' + commentPostId + '/' + commentId, 'PUT', newComment);
    var allComments = await firebase(env, UNIT_ROOT + '/comments/' + commentPostId, 'GET') || {};
    var commentCount = Object.keys(allComments).filter(function (id) { return allComments[id] && allComments[id].status !== 'removed'; }).length;
    await firebase(env, UNIT_ROOT + '/posts/' + commentPostId, 'PATCH', { comments: commentCount, updatedAt: Date.now() });
    return json({ ok: true, comment: await commentView(env, newComment, auth, { [auth.id]: commentingMember.profile }), comments: commentCount }, 201);
  }

  var deleteCommentMatch = path.match(/^\/posts\/([a-zA-Z0-9_-]+)\/comments\/([a-zA-Z0-9_-]+)$/);
  if (deleteCommentMatch && method === 'DELETE') {
    if (!auth) return json({ error: 'login_required' }, 401);
    var dcPost = cleanId(deleteCommentMatch[1]);
    var dcId = cleanId(deleteCommentMatch[2]);
    var deleteComment = await firebase(env, UNIT_ROOT + '/comments/' + dcPost + '/' + dcId, 'GET');
    if (!deleteComment) return json({ error: 'comment_not_found' }, 404);
    if (!auth.admin && deleteComment.authorId !== auth.id) return json({ error: 'forbidden' }, 403);
    await firebase(env, UNIT_ROOT + '/comments/' + dcPost + '/' + dcId, 'PATCH', { status: 'removed', removedAt: Date.now(), removedBy: auth.id });
    return json({ ok: true });
  }

  if (path === '/reports' && method === 'POST') {
    if (!auth) return json({ error: 'login_required' }, 401);
    if (!rateLimit(request, 'unitalk-report', 8, 60000)) return json({ error: 'rate_limited' }, 429);
    var reportId = newCommunityId('r');
    await firebase(env, UNIT_ROOT + '/reports/' + reportId, 'PUT', {
      id: reportId,
      reporterId: auth.id,
      targetType: ['post', 'comment', 'profile'].includes(body.targetType) ? body.targetType : 'post',
      targetId: cleanId(body.targetId),
      reason: cleanText(body.reason, 160),
      status: 'open',
      createdAt: Date.now()
    });
    return json({ ok: true }, 201);
  }

  if (path === '/moderation/reports' && method === 'GET') {
    if (!auth || !auth.admin) return json({ error: 'admin_required' }, 403);
    var reportsObject = await firebaseQuery(env, UNIT_ROOT + '/reports', { orderBy: '"$key"', limitToLast: '100' }) || {};
    var reports = Object.keys(reportsObject).map(function (id) {
      var report = reportsObject[id] || {};
      return {
        id: cleanId(report.id || id),
        targetType: cleanText(report.targetType, 20),
        targetId: cleanId(report.targetId),
        reason: cleanText(report.reason, 160),
        status: cleanText(report.status || 'open', 20),
        createdAt: Number(report.createdAt) || 0
      };
    }).sort(function (a, b) { return b.createdAt - a.createdAt; });
    return json({ reports });
  }

  var reportMatch = path.match(/^\/moderation\/reports\/([a-zA-Z0-9_-]+)$/);
  if (reportMatch && method === 'PATCH') {
    if (!auth || !auth.admin) return json({ error: 'admin_required' }, 403);
    var reportStatus = ['open', 'reviewed', 'dismissed'].includes(body.status) ? body.status : 'reviewed';
    await firebase(env, UNIT_ROOT + '/reports/' + cleanId(reportMatch[1]), 'PATCH', {
      status: reportStatus,
      reviewedAt: Date.now(),
      reviewedBy: auth.id
    });
    return json({ ok: true });
  }

  return json({ error: 'not_found' }, 404);
}

async function handleAi(request, env) {
  if (!rateLimit(request, 'ai', 12, 60000)) return json({ error: 'rate_limited' }, 429);
  var auth = await verifySession(request, env);
  if (!auth) return json({ error: 'login_required' }, 401);
  if (!env.OPENAI_API_KEY) return json({ error: 'model_not_configured' }, 503);
  return json({ error: 'model_endpoint_ready_but_not_enabled_in_client' }, 501);
}

const EXAM_ROOT = '/exam/finalV1';
const EXAM_PRESENCE_WINDOW_MS = 15000;

function publicExamSession(value) {
  value = value && typeof value === 'object' ? value : {};
  var bank = getExamBank(value.examId || DEFAULT_EXAM_ID);
  var now = Date.now();
  var startAt = Math.max(0, Number(value.startAt) || 0);
  var endAt = Math.max(0, Number(value.endAt) || 0);
  var status = cleanText(value.status || 'closed', 20);
  if (status === 'countdown' && startAt && now >= startAt) status = endAt && now >= endAt ? 'closed' : 'active';
  if (status === 'active' && endAt && now >= endAt) status = 'closed';
  return {
    runId: cleanId(value.runId),
    status,
    startAt,
    endAt,
    examId: bank.id,
    examTitle: bank.title,
    examStatus: bank.status,
    questionCount: bank.questionCount,
    durationSeconds: bank.durationMs / 1000,
    publishedAt: Math.max(0, Number(value.publishedAt) || 0),
    updatedAt: Math.max(0, Number(value.updatedAt) || 0)
  };
}

function publicExamParticipant(value, includePrivate, includeResult) {
  value = value && typeof value === 'object' ? value : {};
  var result = value.result && typeof value.result === 'object' ? value.result : null;
  var output = {
    userId: cleanId(value.userId),
    code: cleanText(value.code, 12),
    name: cleanText(value.name, 80),
    avatar: safeAvatar(value.avatar),
    joinedAt: Math.max(0, Number(value.joinedAt) || 0),
    violations: Math.max(0, Math.min(2, Number(value.violations) || 0)),
    blocked: value.blocked === true,
    submittedAt: Math.max(0, Number(value.submittedAt) || 0),
    justification: value.justification ? {
      text: cleanText(value.justification.text, 1200),
      sentAt: Math.max(0, Number(value.justification.sentAt) || 0),
      status: cleanText(value.justification.status || 'pending', 20),
      reviewedAt: Math.max(0, Number(value.justification.reviewedAt) || 0)
    } : null
  };
  if (includePrivate) {
    output.email = cleanText(value.email, 180);
    output.answers = value.answers && typeof value.answers === 'object' ? value.answers : {};
    output.result = result;
  } else if (includeResult && result) {
    output.result = {
      correct: Math.max(0, Number(result.correct) || 0),
      incorrect: Math.max(0, Number(result.incorrect) || 0),
      unanswered: Math.max(0, Number(result.unanswered) || 0),
      percentage: Math.max(0, Math.min(100, Number(result.percentage) || 0)),
      courseBreakdown: result.courseBreakdown || {},
      missed: Array.isArray(result.missed) ? result.missed.slice(0, Math.max(0, Number(result.total) || 200)).map(function (item) {
        item = item && typeof item === 'object' ? item : {};
        return {
          id: Math.max(0, Number(item.id) || 0),
          course: cleanText(item.course, 80),
          topic: cleanText(item.topic, 120),
          selected: cleanText(item.selected || 'Sin responder', 300)
        };
      }) : []
    };
  }
  return output;
}

function examPresencePhase(session, participant) {
  if (!session || !session.runId) return 'idle';
  if (participant && (participant.blocked || participant.submittedAt)) return 'idle';
  if (session.status === 'waiting' || session.status === 'countdown') return 'waiting';
  if (session.status === 'active' && participant) return 'taking';
  return 'idle';
}

function examPresenceSummary(values, session) {
  values = values && typeof values === 'object' ? values : {};
  if (!session || !['waiting', 'countdown', 'active'].includes(session.status)) {
    return {
      connected: 0,
      waiting: 0,
      taking: 0,
      observedAt: Date.now(),
      staleAfterSeconds: EXAM_PRESENCE_WINDOW_MS / 1000
    };
  }
  var cutoff = Date.now() - EXAM_PRESENCE_WINDOW_MS;
  var waiting = 0;
  var taking = 0;
  Object.keys(values).forEach(function (id) {
    var value = values[id] && typeof values[id] === 'object' ? values[id] : {};
    if (cleanId(value.runId) !== session.runId || Number(value.lastSeenAt) < cutoff) return;
    if (value.phase === 'waiting') waiting += 1;
    if (value.phase === 'taking') taking += 1;
  });
  return {
    connected: waiting + taking,
    waiting,
    taking,
    observedAt: Date.now(),
    staleAfterSeconds: EXAM_PRESENCE_WINDOW_MS / 1000
  };
}

async function nextExamCode(env) {
  var path = EXAM_ROOT + '/counter';
  var url = new URL(env.FIREBASE_DATABASE_URL.replace(/\/+$/, '') + path + '.json');
  url.searchParams.set('auth', env.FIREBASE_DATABASE_SECRET);
  for (var attempt = 0; attempt < 12; attempt += 1) {
    var current = await fetch(url.toString(), { headers: { 'X-Firebase-ETag': 'true' }, cache: 'no-store' });
    if (!current.ok) throw new Error('Firebase HTTP ' + current.status);
    var value = Math.max(0, Number(await current.json()) || 0) + 1;
    var saved = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'If-Match': current.headers.get('ETag') || 'null_etag'
      },
      body: JSON.stringify(value)
    });
    if (saved.status === 412) continue;
    if (!saved.ok) throw new Error('Firebase HTTP ' + saved.status);
    return 'UNI' + String(value).padStart(4, '0');
  }
  throw new Error('exam_code_contention');
}

function gradeExamAnswers(value, bank) {
  value = value && typeof value === 'object' ? value : {};
  bank = bank || getExamBank(DEFAULT_EXAM_ID);
  var examKey = bank.key || {};
  var examCount = Math.max(0, Number(bank.questionCount) || Object.keys(examKey).length);
  var correct = 0;
  var unanswered = 0;
  var missed = [];
  var courseBreakdown = {};
  Object.keys(examKey).forEach(function (id) {
    var key = examKey[id];
    var selected = cleanText(value[id], 300);
    var course = cleanText(key.course, 80);
    if (!courseBreakdown[course]) courseBreakdown[course] = { correct: 0, total: 0 };
    courseBreakdown[course].total += 1;
    if (!selected) unanswered += 1;
    if (selected === key.answer) {
      correct += 1;
      courseBreakdown[course].correct += 1;
    } else {
      missed.push({
        id: Number(id),
        course,
        topic: cleanText(key.topic, 120),
        selected: selected || 'Sin responder'
      });
    }
  });
  return {
    correct,
    total: examCount,
    incorrect: examCount - correct - unanswered,
    unanswered,
    percentage: examCount ? Math.round(correct * 10000 / examCount) / 100 : 0,
    courseBreakdown,
    missed
  };
}

function examReviewAnswers(value, bank) {
  value = value && typeof value === 'object' ? value : {};
  bank = bank || getExamBank(DEFAULT_EXAM_ID);
  return Object.keys(bank.key || {}).map(function (id) {
    var key = bank.key[id] || {};
    var selected = cleanText(value[id], 300);
    return {
      id: Number(id),
      course: cleanText(key.course, 80),
      topic: cleanText(key.topic, 120),
      selected: selected || 'Sin responder',
      correct: selected === key.answer,
      answer: cleanText(key.answer, 500),
      solution: cleanText(key.solution, 2400),
      auditSource: cleanText(key.auditSource, 500)
    };
  });
}

function escapeEmailHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
  });
}

function validResultEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(value || '').trim());
}

function examRankingRows(participants) {
  participants = participants && typeof participants === 'object' ? participants : {};
  return Object.keys(participants).map(function (id) {
    var row = participants[id] && typeof participants[id] === 'object' ? participants[id] : {};
    return Object.assign({ userId: cleanId(row.userId || id) }, row);
  }).filter(function (row) {
    return row.submittedAt && row.result && !row.blocked;
  }).sort(function (a, b) {
    var percentageDifference = (Number(b.result.percentage) || 0) - (Number(a.result.percentage) || 0);
    if (percentageDifference) return percentageDifference;
    var correctDifference = (Number(b.result.correct) || 0) - (Number(a.result.correct) || 0);
    if (correctDifference) return correctDifference;
    var submittedDifference = (Number(a.submittedAt) || 0) - (Number(b.submittedAt) || 0);
    if (submittedDifference) return submittedDifference;
    return String(a.code || '').localeCompare(String(b.code || ''));
  });
}

function examResultEmail(env, participant, rank, bank) {
  bank = bank || getExamBank(DEFAULT_EXAM_ID);
  var examCount = Math.max(0, Number(bank.questionCount) || 0);
  var examTitle = cleanText(bank.title || 'Simulacro UNIverse', 120);
  var topTen = rank > 0 && rank <= 10;
  var name = cleanText(participant.name || 'Estudiante', 80);
  var correct = Math.max(0, Number(participant.result && participant.result.correct) || 0);
  var percentage = Math.max(0, Math.min(100, Number(participant.result && participant.result.percentage) || 0));
  var siteUrl = /^https:\/\/[a-z0-9.-]+(?::\d+)?(?:\/.*)?$/i.test(String(env.PUBLIC_SITE_URL || ''))
    ? String(env.PUBLIC_SITE_URL).replace(/\/+$/, '')
    : 'https://universetostudy.com';
  var subject = topTen
    ? '¡Felicitaciones! Puesto ' + rank + ' en ' + examTitle
    : 'Tu resultado en ' + examTitle;
  var title = topTen
    ? '¡Quedaste entre los 10 primeros!'
    : 'Este resultado es un paso más en tu preparación';
  var message = topTen
    ? 'Tu constancia dio resultado: alcanzaste el puesto <strong>' + rank + '</strong> del ranking final. ¡Felicitaciones por este logro!'
    : 'Esta posición no define todo lo que puedes conseguir. Úsala para reconocer tus avances, ubicar los temas que necesitan refuerzo y volver con una estrategia más clara.';
  var rankLine = rank > 0
    ? '<p style="margin:8px 0 0;color:#475569">Puesto final: <strong style="color:#0f172a">' + rank + '</strong></p>'
    : '<p style="margin:8px 0 0;color:#475569">Este intento no fue incluido en el ranking final.</p>';
  var text = topTen
    ? 'Hola ' + name + '. Quedaste en el puesto ' + rank + ' de ' + examTitle + ' con ' + correct + '/' + examCount + ' respuestas correctas (' + percentage + '%). ¡Felicitaciones!'
    : 'Hola ' + name + '. Tu resultado en ' + examTitle + ' fue ' + correct + '/' + examCount + ' respuestas correctas (' + percentage + '%)' + (rank ? ' y el puesto ' + rank : '') + '. Sigue adelante: revisa tus temas más débiles y convierte este resultado en tu próximo avance.';
  return {
    from: cleanText(env.SIMULACRO_EMAIL_FROM || 'UNIverse to Study <resultados@universetostudy.com>', 180),
    to: [cleanText(participant.email, 180)],
    subject,
    html: '<!doctype html><html lang="es"><body style="margin:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#0f172a">' +
      '<div style="max-width:620px;margin:0 auto;padding:32px 16px"><div style="background:#fff;border:1px solid #dbe7f5;border-radius:20px;overflow:hidden">' +
      '<div style="padding:22px 28px;background:linear-gradient(135deg,#0b4fbd,#2376e8);color:#fff"><div style="font-size:13px;letter-spacing:2px;font-weight:700">UNIVERSE TO STUDY</div><h1 style="font-size:25px;line-height:1.2;margin:10px 0 0">' + escapeEmailHtml(title) + '</h1></div>' +
      '<div style="padding:28px"><p style="font-size:17px;margin:0 0 16px">Hola, <strong>' + escapeEmailHtml(name) + '</strong>.</p>' +
      '<p style="line-height:1.65;margin:0 0 20px">' + message + '</p>' +
      '<div style="padding:18px;border-radius:14px;background:#eef6ff;border:1px solid #cfe3ff"><p style="margin:0;color:#475569">Resultado</p>' +
      '<p style="font-size:24px;font-weight:800;margin:5px 0;color:#0b4fbd">' + correct + '/' + examCount + ' · ' + percentage + '%</p>' + rankLine + '</div>' +
      (topTen ? '<p style="line-height:1.65;margin:22px 0 0">Sigue cuidando ese ritmo y comparte este logro con las personas que te acompañan en tu preparación.</p>' :
        '<p style="line-height:1.65;margin:22px 0 0">Te recomendamos revisar tus respuestas, escoger tres temas prioritarios y practicar nuevamente. Cada intento bien analizado te acerca a tu meta.</p>') +
      '<p style="margin:24px 0 0"><a href="' + escapeEmailHtml(siteUrl + '/simulacros') + '" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#0b63ce;color:#fff;text-decoration:none;font-weight:700">Ver mis resultados</a></p>' +
      '</div></div><p style="text-align:center;color:#64748b;font-size:12px;line-height:1.5;margin:18px 0">Este correo informa el resultado de un simulacro que rendiste en UNIverse to Study.</p></div></body></html>',
    text,
    tags: [
      { name: 'category', value: 'simulacro_final' },
      { name: 'result', value: topTen ? 'top_10' : 'participant' }
    ]
  };
}

async function sendExamResultNotifications(env, runId, participants, bank) {
  var ranked = examRankingRows(participants);
  var rankByUserId = {};
  ranked.forEach(function (participant, index) {
    rankByUserId[cleanId(participant.userId)] = index + 1;
  });
  var allRows = Object.keys(participants || {}).map(function (id) {
    var row = participants[id] && typeof participants[id] === 'object' ? participants[id] : {};
    return Object.assign({ userId: cleanId(row.userId || id) }, row);
  });
  var pending = allRows.filter(function (participant) {
    return participant.submittedAt && participant.result && validResultEmail(participant.email) &&
      !(participant.notification && participant.notification.emailSentAt);
  });
  var alreadySent = allRows.filter(function (participant) {
    return participant.notification && participant.notification.emailSentAt;
  }).length;
  if (!pending.length) return { configured: true, sent: 0, skipped: alreadySent, failed: 0 };
  if (!env.RESEND_API_KEY || !env.SIMULACRO_EMAIL_FROM) {
    return { configured: false, sent: 0, skipped: alreadySent, failed: pending.length };
  }
  var sent = 0;
  var failed = 0;
  for (var offset = 0; offset < pending.length; offset += 100) {
    var batchRows = pending.slice(offset, offset + 100);
    var batchPayload = batchRows.map(function (participant) {
      return examResultEmail(env, participant, rankByUserId[cleanId(participant.userId)] || 0, bank);
    });
    var batchFingerprint = (await sha256HexText(batchRows.map(function (participant) {
      return cleanId(participant.userId);
    }).join(','))).slice(0, 20);
    var emailResponse = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json',
        'Idempotency-Key': 'simulacro-final-' + cleanId(runId) + '-' + batchFingerprint
      },
      body: JSON.stringify(batchPayload)
    });
    var emailResult = await emailResponse.json().catch(function () { return {}; });
    if (!emailResponse.ok) {
      failed += batchRows.length;
      continue;
    }
    var providerRows = Array.isArray(emailResult.data) ? emailResult.data : [];
    var sentAt = Date.now();
    var notificationPatch = {};
    batchRows.forEach(function (participant, index) {
      var participantId = cleanId(participant.userId);
      notificationPatch[participantId + '/notification'] = {
        emailSentAt: sentAt,
        provider: 'resend',
        providerId: cleanText(providerRows[index] && providerRows[index].id, 120),
        rank: rankByUserId[participantId] || 0,
        type: rankByUserId[participantId] && rankByUserId[participantId] <= 10 ? 'top_10' : 'motivation'
      };
    });
    await firebase(env, EXAM_ROOT + '/runs/' + cleanId(runId) + '/participants', 'PATCH', notificationPatch);
    sent += batchRows.length;
  }
  return { configured: true, sent, skipped: alreadySent, failed };
}

async function handleExam(request, env, subpath) {
  if (!rateLimit(request, 'exam', 180, 60000)) return json({ error: 'rate_limited' }, 429);
  var auth = await verifySession(request, env);
  if (!auth) return json({ error: 'login_required' }, 401);
  var method = request.method.toUpperCase();
  var path = '/' + subpath.replace(/^\/+/, '').replace(/\.json$/i, '');
  var body = method === 'GET' ? {} : await request.json().catch(function () { return {}; });
  var storedSession = await firebase(env, EXAM_ROOT + '/session', 'GET') || {};
  var session = publicExamSession(storedSession);
  var selectedBank = getExamBank(session.examId);

  if (path === '/state' && method === 'GET') {
    var participant = session.runId
      ? await firebase(env, EXAM_ROOT + '/runs/' + session.runId + '/participants/' + auth.id, 'GET')
      : null;
    if (!auth.admin && session.runId) {
      await firebase(env, EXAM_ROOT + '/presence/' + session.runId + '/' + auth.id, 'PATCH', {
        userId: auth.id,
        runId: session.runId,
        phase: examPresencePhase(session, participant),
        lastSeenAt: Date.now()
      }).catch(function () {});
    }
    var includeResult = auth.admin || Boolean(session.publishedAt);
    var response = {
      session,
      isAdmin: auth.admin === true,
      participant: participant ? publicExamParticipant(participant, auth.admin === true, includeResult) : null
    };
    if (response.participant && response.participant.result && includeResult) {
      response.participant.result.review = examReviewAnswers(participant.answers, selectedBank);
    }
    if (auth.admin && session.runId) {
      var adminState = await Promise.all([
        firebase(env, EXAM_ROOT + '/runs/' + session.runId + '/participants', 'GET'),
        firebase(env, EXAM_ROOT + '/presence/' + session.runId, 'GET')
      ]);
      var participants = adminState[0] || {};
      response.participants = Object.keys(participants).map(function (id) {
        return publicExamParticipant(participants[id], true);
      }).sort(function (a, b) { return a.joinedAt - b.joinedAt; });
      response.presence = examPresenceSummary(adminState[1], session);
    } else if (auth.admin) {
      response.participants = [];
      response.presence = examPresenceSummary({}, session);
    }
    return json(response);
  }

  if (path === '/join' && method === 'POST') {
    if (!session.runId || !['waiting', 'countdown'].includes(session.status)) return json({ error: 'room_closed' }, 409);
    if (session.startAt && Date.now() >= session.startAt) return json({ error: 'exam_started' }, 409);
    var participantPath = EXAM_ROOT + '/runs/' + session.runId + '/participants/' + auth.id;
    var existing = await firebase(env, participantPath, 'GET');
    if (!existing) {
      existing = {
        userId: auth.id,
        code: await nextExamCode(env),
        name: cleanText(auth.name || 'Estudiante Universe', 80),
        email: cleanText(auth.email, 180),
        avatar: safeAvatar(auth.avatar),
        joinedAt: Date.now(),
        violations: 0,
        blocked: false,
        submittedAt: 0
      };
      await firebase(env, participantPath, 'PUT', existing);
    }
    return json({ participant: publicExamParticipant(existing, false), session });
  }

  if (path === '/incident' && method === 'POST') {
    if (session.status !== 'active') return json({ error: 'exam_not_active' }, 409);
    var incidentPath = EXAM_ROOT + '/runs/' + session.runId + '/participants/' + auth.id;
    var incidentParticipant = await firebase(env, incidentPath, 'GET');
    if (!incidentParticipant) return json({ error: 'not_joined' }, 409);
    if (incidentParticipant.submittedAt) return json({ error: 'already_submitted' }, 409);
    var violations = Math.min(2, Math.max(0, Number(incidentParticipant.violations) || 0) + 1);
    await firebase(env, incidentPath, 'PATCH', {
      violations,
      blocked: violations >= 2,
      lastIncidentAt: Date.now(),
      lastIncidentReason: cleanText(body.reason || 'focus_lost', 80)
    });
    incidentParticipant.violations = violations;
    incidentParticipant.blocked = violations >= 2;
    return json({ participant: publicExamParticipant(incidentParticipant, false) });
  }

  if (path === '/save' && method === 'POST') {
    if (session.status !== 'active') return json({ error: 'exam_not_active' }, 409);
    var savePath = EXAM_ROOT + '/runs/' + session.runId + '/participants/' + auth.id;
    var saveParticipant = await firebase(env, savePath, 'GET');
    if (!saveParticipant) return json({ error: 'not_joined' }, 409);
    if (saveParticipant.blocked) return json({ error: 'exam_blocked' }, 423);
    if (saveParticipant.submittedAt) return json({ error: 'already_submitted' }, 409);
    var answerId = cleanId(body.id);
    var answerValue = cleanText(body.answer, 300);
    if (!selectedBank.key[answerId] || !answerValue) return json({ error: 'invalid_answer' }, 400);
    var savedAnswers = saveParticipant.answers && typeof saveParticipant.answers === 'object'
      ? saveParticipant.answers
      : {};
    savedAnswers[answerId] = answerValue;
    await firebase(env, savePath, 'PATCH', { answers: savedAnswers, lastAnswerAt: Date.now() });
    return json({ ok: true, id: Number(answerId) });
  }

  if (path === '/justify' && method === 'POST') {
    var justificationPath = EXAM_ROOT + '/runs/' + session.runId + '/participants/' + auth.id;
    var justificationParticipant = await firebase(env, justificationPath, 'GET');
    if (!justificationParticipant || !justificationParticipant.blocked) return json({ error: 'not_blocked' }, 409);
    var justificationText = cleanText(body.text, 1200);
    if (justificationText.length < 12) return json({ error: 'justification_too_short' }, 400);
    var justification = { text: justificationText, sentAt: Date.now(), status: 'pending' };
    await firebase(env, justificationPath, 'PATCH', { justification });
    return json({ ok: true, justification });
  }

  if (path === '/submit' && method === 'POST') {
    var submitPath = EXAM_ROOT + '/runs/' + session.runId + '/participants/' + auth.id;
    var submitParticipant = await firebase(env, submitPath, 'GET');
    if (!submitParticipant) return json({ error: 'not_joined' }, 409);
    if (submitParticipant.blocked) return json({ error: 'exam_blocked' }, 423);
    if (submitParticipant.submittedAt) return json({ error: 'already_submitted' }, 409);
    if (!['active', 'closed'].includes(session.status)) return json({ error: 'exam_not_active' }, 409);
    if (session.endAt && Date.now() > session.endAt + 60000) return json({ error: 'exam_time_expired' }, 409);
    var answers = {};
    Object.keys(body.answers || {}).slice(0, selectedBank.questionCount).forEach(function (id) {
      if (selectedBank.key[id]) answers[id] = cleanText(body.answers[id], 300);
    });
    var result = gradeExamAnswers(answers, selectedBank);
    var submittedAt = Date.now();
    await firebase(env, submitPath, 'PATCH', { answers, result, submittedAt });
    return json({ ok: true, submittedAt, code: cleanText(submitParticipant.code, 12) });
  }

  if (!auth.admin) return json({ error: 'admin_required' }, 403);

  if (path === '/admin/open' && method === 'POST') {
    var requestedExamId = cleanId(body.examId || DEFAULT_EXAM_ID);
    if (!EXAM_BANKS[requestedExamId]) return json({ error: 'invalid_exam' }, 400);
    var requestedBank = EXAM_BANKS[requestedExamId];
    var runId = 'run_' + Date.now().toString(36);
    var opened = {
      runId,
      examId: requestedBank.id,
      examTitle: requestedBank.title,
      questionCount: requestedBank.questionCount,
      status: 'waiting',
      startAt: 0,
      endAt: 0,
      publishedAt: 0,
      openedAt: Date.now(),
      openedBy: auth.id,
      updatedAt: Date.now()
    };
    await firebase(env, EXAM_ROOT + '/session', 'PUT', opened);
    return json({ session: publicExamSession(opened) });
  }

  if (path === '/admin/activate' && method === 'POST') {
    if (!session.runId || session.status !== 'waiting') return json({ error: 'room_not_waiting' }, 409);
    var startAt = Date.now() + 30000;
    var activated = {
      status: 'countdown',
      startAt,
      endAt: startAt + selectedBank.durationMs,
      updatedAt: Date.now(),
      activatedBy: auth.id
    };
    await firebase(env, EXAM_ROOT + '/session', 'PATCH', activated);
    return json({ session: publicExamSession(Object.assign({}, storedSession, activated)) });
  }

  if (path === '/admin/publish' && method === 'POST') {
    if (!session.runId) return json({ error: 'no_session' }, 409);
    if (!storedSession.finalizedAt) return json({ error: 'exam_not_finalized' }, 409);
    var publishParticipants = await firebase(env, EXAM_ROOT + '/runs/' + session.runId + '/participants', 'GET') || {};
    var notifications = await sendExamResultNotifications(env, session.runId, publishParticipants, selectedBank);
    var publishedAt = Math.max(0, Number(storedSession.publishedAt) || 0) || Date.now();
    var notificationAttemptAt = Date.now();
    await firebase(env, EXAM_ROOT + '/session', 'PATCH', {
      publishedAt,
      updatedAt: notificationAttemptAt,
      notificationAttemptAt,
      notificationSent: notifications.sent,
      notificationFailed: notifications.failed,
      notificationConfigured: notifications.configured
    });
    return json({
      ok: true,
      publishedAt,
      alreadyPublished: Boolean(storedSession.publishedAt),
      notifications
    });
  }

  if (path === '/admin/finish' && method === 'POST') {
    if (!session.runId) return json({ error: 'no_session' }, 409);
    if (storedSession.finalizedAt) {
      return json({
        ok: true,
        finalizedAt: Math.max(0, Number(storedSession.finalizedAt) || 0),
        alreadyFinalized: true
      });
    }
    var finishPath = EXAM_ROOT + '/runs/' + session.runId + '/participants';
    var finishParticipants = await firebase(env, finishPath, 'GET') || {};
    var finalizedAt = Date.now();
    var finishPatch = {};
    Object.keys(finishParticipants).forEach(function (id) {
      var row = finishParticipants[id] && typeof finishParticipants[id] === 'object'
        ? finishParticipants[id]
        : {};
      if (row.submittedAt && row.result) {
        finishPatch[id] = row;
        return;
      }
      var result = row.blocked ? {
        correct: 0,
        incorrect: 0,
        unanswered: 0,
        percentage: 0,
        courseBreakdown: {},
        missed: [],
        status: 'blocked',
        display: '0/0'
      } : Object.assign(gradeExamAnswers(row.answers, selectedBank), {
        status: 'finished_by_admin',
        display: ''
      });
      finishPatch[id] = Object.assign({}, row, {
        result,
        submittedAt: finalizedAt,
        finishedByAdmin: true
      });
    });
    if (Object.keys(finishPatch).length) await firebase(env, finishPath, 'PATCH', finishPatch);
    await firebase(env, EXAM_ROOT + '/session', 'PATCH', {
      status: 'closed',
      endAt: finalizedAt,
      finalizedAt,
      finalizedBy: auth.id,
      updatedAt: finalizedAt
    });
    return json({
      ok: true,
      finalizedAt,
      participants: Object.keys(finishPatch).length
    });
  }

  if (path === '/admin/review' && method === 'POST') {
    var reviewUserId = cleanId(body.userId);
    var action = body.action === 'approved' ? 'approved' : body.action === 'rejected' ? 'rejected' : '';
    if (!reviewUserId || !action) return json({ error: 'invalid_review' }, 400);
    var reviewPath = EXAM_ROOT + '/runs/' + session.runId + '/participants/' + reviewUserId;
    var reviewParticipant = await firebase(env, reviewPath, 'GET');
    if (!reviewParticipant || !reviewParticipant.justification) return json({ error: 'justification_missing' }, 404);
    var reviewPatch = {
      justification: Object.assign({}, reviewParticipant.justification, {
        status: action,
        reviewedAt: Date.now(),
        reviewedBy: auth.id
      })
    };
    if (action === 'approved') {
      reviewPatch.blocked = false;
      reviewPatch.violations = 1;
    }
    await firebase(env, reviewPath, 'PATCH', reviewPatch);
    return json({ ok: true, action });
  }

  return json({ error: 'not_found' }, 404);
}

export async function onRequest(context) {
  var request = context.request;
  if (request.method === 'OPTIONS') return json({ ok: true });
  try {
    var url = new URL(request.url);
    var apiPath = url.pathname.replace(/^\/api\/?/, '');
    if (apiPath === 'auth/google') return googleAuth(request, context.env);
    if (apiPath === 'auth/me') return authMe(request, context.env);
    if (apiPath.startsWith('site/')) return handleSite(request, context.env, apiPath.slice(5));
    if (apiPath.startsWith('support/')) return handleSupport(request, context.env, apiPath.slice(8));
    if (apiPath.startsWith('classes/')) return handleClasses(request, context.env, apiPath.slice(8));
    if (apiPath.startsWith('exam/')) return handleExam(request, context.env, apiPath.slice(5));
    if (apiPath.startsWith('unitalk/')) return handleUnitalk(request, context.env, apiPath.slice(8));
    if (apiPath === 'ai/support') return handleAi(request, context.env);
    return json({ error: 'not_found' }, 404);
  } catch (error) {
    return json({ error: 'server_error', detail: String(error && error.message || error) }, 500);
  }
}
