const RATE = new Map();

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extra
    }
  });
}

function cleanId(value) {
  return String(value || '').replace(/[^a-zA-Z0-9_-]/g, '');
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

function isAdminEmail(env, email) {
  return String(env.ADMIN_EMAILS || '')
    .split(',')
    .map(function (v) { return v.trim().toLowerCase(); })
    .filter(Boolean)
    .includes(String(email || '').trim().toLowerCase());
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
    isAdmin: isAdminEmail(env, info.email),
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  return json({ user, token: await signSession(env, user) });
}

async function handleSite(request, env, subpath) {
  var auth = await verifySession(request, env);
  var method = request.method.toUpperCase();
  var path = '/' + subpath.replace(/^\/+/, '').replace(/\.json$/i, '');
  var data = method === 'GET' || method === 'DELETE' ? undefined : await request.json().catch(function () { return {}; });

  if (method === 'GET' && path.startsWith('/public')) return json(await firebase(env, '/site/universeV1' + path, 'GET'));
  if (path.startsWith('/public') && (!auth || !auth.admin)) return json({ error: 'admin_required' }, 403);

  if (path.startsWith('/profiles/')) {
    if (!auth) return json({ error: 'login_required' }, 401);
    var profileId = cleanId(path.split('/')[2]);
    if (!auth.admin && profileId !== auth.id) return json({ error: 'forbidden' }, 403);
    if (data && !auth.admin) {
      data.email = auth.email;
      data.googleName = auth.name;
      data.avatar = auth.avatar;
    }
    return json(await firebase(env, '/site/universeV1' + path, method, data));
  }

  if (path.startsWith('/codeOwners')) {
    if (!auth) return json({ error: 'login_required' }, 401);
    if (method !== 'GET' && data && !auth.admin) {
      data.userId = auth.id;
      data.email = auth.email;
    }
    return json(await firebase(env, '/site/universeV1' + path, method, data));
  }

  if (path.startsWith('/users')) {
    if (!auth) return json({ error: 'login_required' }, 401);
    return json(await firebase(env, '/site/universeV1' + path, method, data));
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
    if (apiPath.startsWith('site/')) return handleSite(request, context.env, apiPath.slice(5));
    if (apiPath.startsWith('support/')) return handleSupport(request, context.env, apiPath.slice(8));
    if (apiPath === 'ai/support') return handleAi(request, context.env);
    return json({ error: 'not_found' }, 404);
  } catch (error) {
    return json({ error: 'server_error', detail: String(error && error.message || error) }, 500);
  }
}
