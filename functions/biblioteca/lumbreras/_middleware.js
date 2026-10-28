// Link previews for shared books: /biblioteca/lumbreras/?libro=<id>
// WhatsApp/Facebook/Telegram do not run JS, so the book's title and cover go into the HTML here.
const PREFIX = '/assets/library/lumbreras/';

const bookId = (b, i, seen) => {
  let id = ((b.url.match(/\/d\/([\w-]+)/) || b.url.match(/[?&]id=([\w-]+)/) || [, String(i)])[1]).slice(0, 10);
  if (seen.has(id)) id += '-' + i;
  seen.add(id);
  return id;
};

class Attr {
  constructor(attr, value) { this.attr = attr; this.value = value; }
  element(el) { el.setAttribute(this.attr, this.value); }
}
class Text {
  constructor(value) { this.value = value; }
  element(el) { el.setInnerContent(this.value); }
}
class Append {
  constructor(html) { this.html = html; }
  element(el) { el.append(this.html, { html: true }); }
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const wanted = url.searchParams.get('libro');
  const isPage = /^\/biblioteca\/lumbreras\/?(index\.html)?$/.test(url.pathname);
  if (!wanted || !isPage || request.method !== 'GET') return next();

  const page = await next();
  try {
    const asset = path => env.ASSETS.fetch(new URL(path, url.origin)).then(r => r.json());
    const [data, manifest] = await Promise.all([asset('/universe-ui/data/platform.json'), asset('/biblioteca/lumbreras/covers/manifest.json')]);
    const seen = new Set();
    const list = data.catalogs.lumbreras.filter(b => b && b.url && !b.upcoming);
    const book = list.find((b, i) => bookId(b, i, seen) === wanted);
    if (!book) return page;

    const thumb = manifest.covers && manifest.covers[book.image];
    const image = thumb
      ? `${url.origin}/biblioteca/lumbreras/covers/${encodeURI(thumb.t)}-og.jpg`
      : new URL(book.image, url.origin).href;
    const title = `${book.title} · Lumbreras`;
    const desc = [book.series, book.catalog && book.catalog.charAt(0) + book.catalog.slice(1).toLowerCase()].filter(Boolean).join(' · ');
    const share = `${url.origin}/biblioteca/lumbreras/?libro=${encodeURIComponent(wanted)}`;
    const tags = [
      ['og:type', 'book'], ['og:site_name', 'UNIverse to Study'], ['og:title', title], ['og:description', desc],
      ['og:url', share], ['og:image', image], ['og:image:alt', `Portada de ${book.title}`]
    ].map(([p, c]) => `<meta property="${p}" content="${esc(c)}">`).join('') +
      `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${esc(image)}">`;

    const res = new HTMLRewriter()
      .on('title', new Text(title))
      .on('meta[name="description"]', new Attr('content', desc))
      .on('head', new Append(tags))
      .transform(page);
    const headers = new Headers(res.headers);
    headers.set('Cache-Control', 'public, max-age=300');
    return new Response(res.body, { status: res.status, headers });
  } catch {
    return page;
  }
}
