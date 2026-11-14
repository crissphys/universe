// /resumenes for search engines and link previews: every summary, topic, course, author and uploader page is
// served as real HTML with its own <title>, description, canonical URL, schema.org data and the visible
// content already in place (title, details, preview image, recommendations, cards). The page script then
// takes over. Same markup as the browser builds, from resumenes/assets/shared.js.
import R from '../../resumenes/assets/shared.js';
import Search from '../../resumenes/assets/search.js';

const SITE = 'UNIverse to Study';
const data = { at: 0, base: null, temas: null, uploads: [], upAt: 0, idx: null };

async function asset(env, origin, path) {
  let res = await env.ASSETS.fetch(new URL(path, origin));
  if (res.status >= 300 && res.status < 400 && res.headers.get('Location')) res = await env.ASSETS.fetch(new URL(res.headers.get('Location'), origin));
  return res;
}

async function load(env, origin) {
  if (!data.base || Date.now() - data.at > 600000) {
    const [cat, temas] = await Promise.all([asset(env, origin, '/resumenes/data/catalogo.json').then(r => r.json()), asset(env, origin, '/resumenes/data/temas.json').then(r => r.json())]);
    data.base = cat; data.temas = temas; data.at = Date.now(); data.idx = null;
  }
  if (Date.now() - data.upAt > 60000) {
    // Approved community uploads, through the public API (same rules as the page).
    const list = await fetch(new URL('/api/resumenes/list', origin)).then(r => r.ok ? r.json() : { items: [] }).catch(() => ({ items: [] }));
    const tmp = Search.buildIndex(data.base, data.temas);
    data.uploads = (list.items || []).map(r => Object.assign({ k: 'Aporte', f: r.t + '.' + r.e }, r, Search.classify(tmp, r.t + ' ' + (r.d || ''))));
    data.upAt = Date.now(); data.idx = null;
  }
  const items = data.uploads.concat(data.base);
  if (!data.idx) data.idx = Search.buildIndex(items, data.temas);
  return { items, idx: data.idx };
}

const esc = R.esc;
const abs = (origin, p) => origin + p;
const quality = it => (it.p ? 1 : 0) + (it.m ? 1 : 0) + (it.t.includes(' · ') ? 0 : 1);
const bare = t => t.replace(/^[^A-Za-zÁÉÍÓÚÑáéíóúñ¿]+/, '');

function setMeta(html, { title, desc, url, image, robots, jsonld }) {
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${esc(url)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${esc(url)}$2`);
  if (image) html = html.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${esc(image)}$2`);
  const extra = (robots ? `<meta name="robots" content="${robots}">` : '') +
    (jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : '');
  return html.replace('<!--ssr:head-->', extra);
}

function crumbs(origin, list) {
  return { '@type': 'BreadcrumbList', itemListElement: list.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(origin, p) })) };
}

function renderDoc(html, it, items, idx, origin) {
  const url = abs(origin, R.path.doc(it));
  const thumb = R.path.thumb(it);
  const image = thumb ? abs(origin, thumb) : '';
  const title = `${it.t} · ${it.m || it.c} | UNIverse`;
  const desc = R.describe(it);
  const trail = [['Resúmenes', '/resumenes'], [it.c, R.path.curso(it.c)]].concat(it.m ? [[it.m, R.path.tema(it.m)]] : [], [[it.t, R.path.doc(it)]]);
  const jsonld = { '@context': 'https://schema.org', '@graph': [
    Object.assign({
      '@type': 'LearningResource', '@id': url + '#resumen', name: it.t, description: desc, url,
      learningResourceType: it.k && it.k !== 'Aporte' ? it.k : 'Resumen', educationalLevel: it.n === 'uni' ? 'Universitario' : 'Preuniversitario',
      inLanguage: 'es', isAccessibleForFree: true, encodingFormat: it.e === 'pdf' ? 'application/pdf' : 'image/' + (it.e === 'jpg' ? 'jpeg' : it.e),
      about: [{ '@type': 'Thing', name: it.c }].concat(it.m ? [{ '@type': 'Thing', name: it.m }] : []),
      isPartOf: { '@type': 'WebSite', name: SITE, url: origin + '/' }
    }, image ? { image, thumbnailUrl: image } : {}, it.a ? { author: { '@type': 'Person', name: it.a } } : {}, it.y ? { dateCreated: String(it.y) } : {}),
    crumbs(origin, trail)
  ] };
  html = setMeta(html, { title, desc, url, image, jsonld });
  // The HD copy starts downloading with the HTML, before any script runs.
  if (R.path.hd(it)) html = html.replace('</head>', `<link rel="preload" as="image" href="${esc(R.path.hd(it))}" fetchpriority="high">
</head>`);
  const recs = Search.recommend(idx, it, 8);
  const metaRows = R.metaRows(it).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('') + '<dt id="doc-pages-k" hidden>Páginas</dt><dd id="doc-pages-n" hidden></dd>';
  return html
    .replace('<body>', '<body class="doc-open">')
    .replace('<section class="view" id="list-view" aria-labelledby="list-title">', '<section class="view" id="list-view" aria-labelledby="list-title" hidden>')
    .replace('<section class="view" id="doc-view" aria-labelledby="doc-title" hidden>', '<section class="view" id="doc-view" aria-labelledby="doc-title">')
    .replace('<div class="doc-info" id="doc-info">', `<div class="doc-info" id="doc-info" style="--hue:${R.HUE[it.c] ?? 30}">`)
    .replace('<a class="course" id="doc-course" href="/resumenes"></a>', `<a class="course" id="doc-course" href="${esc(R.path.curso(it.c))}">${esc(it.c)}</a>`)
    .replace('<h1 id="doc-title"></h1>', `<h1 id="doc-title">${esc(it.t)}</h1>`)
    .replace('<div id="doc-uploader"></div>', `<div id="doc-uploader">${R.uploaderHTML(it)}</div>`)
    .replace('<p class="doc-desc" id="doc-desc" hidden></p>', it.d ? `<p class="doc-desc" id="doc-desc">${esc(it.d)}</p>` : '<p class="doc-desc" id="doc-desc" hidden></p>')
    .replace('<dl class="doc-meta" id="doc-meta"></dl>', `<dl class="doc-meta" id="doc-meta">${metaRows}</dl>`)
    .replace('<a class="act primary" id="download" href="#" download>', `<a class="act primary" id="download" href="${esc(R.path.file(it, true))}" download="${esc(it.f || it.t)}" rel="nofollow">`)
    .replace('<ol id="recs"></ol>', `<ol id="recs">${recs.map(r => R.recHTML(r.item)).join('')}</ol>`)
    .replace('<div class="doc-pages" id="pages" aria-label="Páginas del resumen"></div>',
      `<div class="doc-pages" id="pages" aria-label="Páginas del resumen">${thumb ? `<div class="page poster" style="aspect-ratio:${R.ratio(it).css}"><img src="${esc(thumb)}" alt="Vista previa de ${esc(it.t)}" fetchpriority="high"></div>` : ''}</div>`)
    .replace('class="add" id="add"', 'class="add away" id="add"');
}

function renderList(html, route, items, origin) {
  const list = items.filter(it => R.matches(it, route))
    .sort((a, b) => (b.at || 0) - (a.at || 0) || quality(b) - quality(a) || bare(a.t).localeCompare(bare(b.t), 'es', { numeric: true, sensitivity: 'base' }));
  const first = list[0];
  let label = '', trail = [['Resúmenes', '/resumenes']], pathNow = '/resumenes', title, desc;
  if (route.kind) {
    if (!first) return null;
    label = route.kind === 'tema' ? first.m : route.kind === 'curso' ? first.c : first.a;
    pathNow = route.kind === 'tema' ? R.path.tema(label) : route.kind === 'curso' ? R.path.curso(label) : route.kind === 'autor' ? R.path.autor(label) : R.path.user(route.key);
    if (route.kind === 'tema') trail.push([first.c, R.path.curso(first.c)]);
    trail.push([label, pathNow]);
    const n = list.length;
    title = route.kind === 'tema' ? `${label}: resúmenes y apuntes de ${first.c} | UNIverse`
      : route.kind === 'curso' ? `Resúmenes de ${label}: apuntes y formularios gratis | UNIverse`
      : `Resúmenes de ${label} | UNIverse`;
    desc = route.kind === 'tema' ? `${n} ${n === 1 ? 'resumen' : 'resúmenes'}, apuntes y mapas de ${label} (${first.c}) para la UNI y CEPREUNI. Léelos completos y descárgalos gratis.`
      : route.kind === 'curso' ? `${n} resúmenes, apuntes, formularios y mapas de ${label} para la UNI y CEPREUNI, ordenados por tema. Léelos completos y descárgalos gratis.`
      : `${n} ${n === 1 ? 'resumen publicado' : 'resúmenes publicados'} por ${label} en UNIverse. Léelos completos y descárgalos gratis.`;
  } else {
    title = 'Resúmenes y apuntes UNI y CEPREUNI gratis | UNIverse';
    desc = `${items.length.toLocaleString('es-PE')} resúmenes, apuntes, formularios y mapas de Física, Química, Biología, Economía y todos los cursos de la UNI y CEPREUNI. Léelos completos y descárgalos gratis.`;
  }
  const url = abs(origin, pathNow);
  const image = first && first.p ? abs(origin, R.path.thumb(first)) : '';
  const jsonld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'CollectionPage', '@id': url, name: label ? title.replace(/ \| UNIverse$/, '') : 'Resúmenes', description: desc, url, inLanguage: 'es', isPartOf: { '@type': 'WebSite', name: SITE, url: origin + '/' },
      mainEntity: { '@type': 'ItemList', numberOfItems: list.length, itemListElement: list.slice(0, 24).map((it, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(origin, R.path.doc(it)), name: it.t })) } },
    crumbs(origin, trail)
  ] };
  html = setMeta(html, { title, desc, url, image, jsonld });
  const cards = list.slice(0, 48).map((it, i) => R.cardHTML(it, { eager: i < 4 })).join('');
  html = html.replace(/<!--ssr:grid-->[\s\S]*?<!--\/ssr:grid-->/, cards);
  if (route.kind) {
    const n = list.length;
    const sub = route.kind === 'u' ? (n === 1 ? ' resumen publicado' : ' resúmenes publicados') : n === 1 ? ' resumen' : ' resúmenes';
    const courseLink = route.kind === 'tema' ? ` de <a href="${esc(R.path.curso(first.c))}">${esc(first.c)}</a>` : '';
    html = html
      .replace('<a class="back" id="scope" href="/resumenes" hidden>', '<a class="back" id="scope" href="/resumenes">')
      .replace('<h1 id="list-title">Resúmenes</h1>', `<h1 id="list-title">${esc(label)}</h1>`)
      .replace(/<p class="hero-sub" id="hero-sub">[\s\S]*?<\/p>/, `<p class="hero-sub" id="hero-sub"><b class="num">${n.toLocaleString('es-PE')}</b>${sub}${courseLink}</p>`);
    if (route.kind === 'u') html = html.replace('<span class="acct-pic hero-pic" id="hero-pic" hidden></span>', `<span class="acct-pic hero-pic" id="hero-pic">${esc(R.initials(label))}${first.av ? `<img src="${esc(first.av)}" alt="" referrerpolicy="no-referrer">` : ''}</span>`);
  } else {
    html = html.replace(/<p class="hero-sub" id="hero-sub"><b class="num">[^<]*<\/b>/, `<p class="hero-sub" id="hero-sub"><b class="num">${items.length.toLocaleString('es-PE')}</b>`);
  }
  return html;
}

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  if (!['GET', 'HEAD'].includes(request.method)) return next();
  if (/^\/resumenes\/(assets|data|thumbs|admin)(\/|$)/.test(url.pathname) || /\.[a-z0-9]{2,5}$/i.test(url.pathname)) return next();
  try {
    const route = R.route(url.pathname);
    const [tpl, { items, idx }] = await Promise.all([asset(env, url.origin, '/resumenes/').then(r => r.text()), load(env, url.origin)]);
    let html = null;
    let status = 200;
    if (route.view === 'doc') {
      const legacy = items.find(it => it.id === route.id);
      if (legacy && url.pathname !== R.path.doc(legacy)) return Response.redirect(url.origin + R.path.doc(legacy) + url.search, 301);
      if (legacy) html = renderDoc(tpl, legacy, items, idx, url.origin);
    } else if (route.view === 'list') {
      const legacyId = url.searchParams.get('r'); // old ?r=<id> links
      const old = legacyId && items.find(it => it.id === legacyId);
      if (old) return Response.redirect(url.origin + R.path.doc(old), 301);
      html = renderList(tpl, route, items, url.origin);
    }
    if (!html) {
      status = 404;
      html = setMeta(tpl, { title: 'Resumen no disponible | UNIverse', desc: 'Este resumen no existe o ya no está publicado.', url: url.origin + '/resumenes', robots: 'noindex' });
    }
    return new Response(request.method === 'HEAD' ? null : html, {
      status,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=0, must-revalidate', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' }
    });
  } catch (e) {
    return next();
  }
}
