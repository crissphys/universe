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

function cleanUsername(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 24);
}

function validUsername(value) {
  return /^[a-z0-9][a-z0-9_-]{2,23}$/.test(String(value || ''));
}

function cleanBoolean(value, fallback = false) {
  return value === true || value === 'true' ? true : value === false || value === 'false' ? false : fallback;
}

function moderateText(value, max) {
  var text = cleanText(value, max).replace(/\s{3,}/g, '  ');
  var normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  var blocked = BLOCKED_TERMS.some(function (term) {
    return normalized.includes(term.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
  });
  var links = (text.match(/https?:\/\/|www\./gi) || []).length;
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

function publicProfile(profile, viewer) {
  profile = profile && typeof profile === 'object' ? profile : {};
  var visibility = ['public', 'members', 'private'].includes(profile.profileVisibility) ? profile.profileVisibility : 'public';
  var isOwner = !!(viewer && viewer.id === profile.userId);
  var canSee = isOwner || visibility === 'public' || (visibility === 'members' && !!viewer);
  var result = {
    username: cleanUsername(profile.username),
    displayName: cleanText(profile.displayName || 'Estudiante Universe', 40),
    bio: canSee ? cleanText(profile.bio, 160) : '',
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
    exp: now + 60 * 60 * 24 * 7
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
  return String(env.ADMIN_EMAIL_SHA256 || '')
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
    return json({ course, topic, questions });
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
  return {
    id: cleanId(post.id),
    text: cleanText(post.text, 400),
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
    text: cleanText(comment.text, 250),
    createdAt: Number(comment.createdAt) || 0,
    author: publicProfile(profileCache[authorId], viewer),
    canDelete: !!(viewer && (viewer.admin || viewer.id === authorId))
  };
}

async function handleUnitalk(request, env, subpath) {
  var auth = await verifySession(request, env);
  var method = request.method.toUpperCase();
  var path = '/' + subpath.replace(/^\/+/, '').replace(/\.json$/i, '');
  var body = method === 'GET' || method === 'DELETE' ? {} : await request.json().catch(function () { return {}; });

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

  if (path === '/feed' && method === 'GET') {
    if (!rateLimit(request, 'unitalk-feed', 100, 60000)) return json({ error: 'rate_limited' }, 429);
    var url = new URL(request.url);
    var limit = Math.max(5, Math.min(30, Number(url.searchParams.get('limit')) || 20));
    var postsObject = await firebaseQuery(env, UNIT_ROOT + '/posts', { orderBy: '"$key"', limitToLast: String(limit + 10) }) || {};
    var posts = Object.keys(postsObject).map(function (id) {
      var post = postsObject[id] || {};
      post.id = cleanId(post.id || id);
      return post;
    }).filter(function (post) { return post.status !== 'removed' && post.text; })
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
    var moderated = moderateText(body.text, 400);
    if (!moderated.allowed) return json({ error: moderated.reason }, 400);
    var postId = newCommunityId('p');
    var post = {
      id: postId,
      authorId: auth.id,
      text: moderated.text,
      likes: 0,
      dislikes: 0,
      comments: 0,
      status: 'visible',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await firebase(env, UNIT_ROOT + '/posts/' + postId, 'PUT', post);
    return json({ ok: true, post: await postView(env, post, auth, { [auth.id]: member.profile }) }, 201);
  }

  var postMatch = path.match(/^\/posts\/([a-zA-Z0-9_-]+)$/);
  if (postMatch && method === 'DELETE') {
    if (!auth) return json({ error: 'login_required' }, 401);
    var deletePost = await firebase(env, UNIT_ROOT + '/posts/' + cleanId(postMatch[1]), 'GET');
    if (!deletePost) return json({ error: 'post_not_found' }, 404);
    if (!auth.admin && deletePost.authorId !== auth.id) return json({ error: 'forbidden' }, 403);
    await firebase(env, UNIT_ROOT + '/posts/' + cleanId(postMatch[1]), 'PATCH', { status: 'removed', removedAt: Date.now(), removedBy: auth.id });
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
    if (apiPath.startsWith('unitalk/')) return handleUnitalk(request, context.env, apiPath.slice(8));
    if (apiPath === 'ai/support') return handleAi(request, context.env);
    return json({ error: 'not_found' }, 404);
  } catch (error) {
    return json({ error: 'server_error', detail: String(error && error.message || error) }, 500);
  }
}
