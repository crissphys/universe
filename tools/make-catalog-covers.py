"""Build light WebP covers (240/480w) + manifest for a galaxy catalog page (biblioteca/<catalog>).

Books come from universe-ui/data/platform.json (catalogs.<catalog>). Collection slugs and
descriptions are kept from the previous manifest; new collections get a slug from their name.
Books without a cover file (drivePreview or an .svg placeholder) get one from Drive's first-page
thumbnail, saved under covers/drive/<id>; covers already made are reused, so reruns only fetch new books.

Usage (from the repo root; <catalog> is the folder under biblioteca/):
  python tools/make-catalog-covers.py lumbreras              # read data + images from the working tree
  python tools/make-catalog-covers.py cuzcano origin/main    # read them from a git ref instead
"""
import io, json, os, re, subprocess, sys, time, unicodedata, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageOps

# folder -> where its original cover images live (default biblioteca/<folder>/assets/)
PREFIX = {'lumbreras': '/assets/library/lumbreras/'}
# folder -> platform.json key when they differ (same as data-key on the page)
KEY = {'librosuniversitarios': 'college'}
catalog = sys.argv[1] if len(sys.argv) > 1 else sys.exit('usage: make-catalog-covers.py <catalog folder> [git-ref]')
ref = sys.argv[2] if len(sys.argv) > 2 else None
root = os.getcwd()
out_root = os.path.join(root, f'biblioteca/{catalog}/covers')
prefix = PREFIX.get(catalog, f'/biblioteca/{catalog}/assets/')


def read(path):
    if ref:
        return subprocess.run(['git', 'show', f'{ref}:{path}'], check=True, capture_output=True).stdout
    with open(os.path.join(root, path), 'rb') as f:
        return f.read()


def slugify(s):
    s = unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


def flatten(im):
    im = ImageOps.exif_transpose(im)
    if im.mode in ('P', 'LA', 'RGBA'):
        im = im.convert('RGBA')
        bg = Image.new('RGB', im.size, (23, 23, 26))
        bg.paste(im, mask=im.split()[-1])
        return bg
    return im.convert('RGB')


def save_webps(im, rel):
    size = 0
    w, h = im.size
    for width in (240, 480):
        tw = min(width, w)
        dst = os.path.join(out_root, f'{rel}-{width}.webp')
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        im.resize((tw, round(h * tw / w)), Image.LANCZOS).save(dst, 'WEBP', quality=74, method=6)
        size += os.path.getsize(dst)
    return size


def tint(im):
    r, g, bl = im.resize((1, 1), Image.BOX).getpixel((0, 0))
    return '#%02x%02x%02x' % (r, g, bl)


def drive_id(b):
    if not (b.get('drivePreview') or b['image'].endswith('.svg') or 'drive.google.com/thumbnail' in b['image']):
        return None
    m = re.search(r'/d/([\w-]+)', b.get('url') or '')
    return m and m.group(1)


def drive_thumb(fid):
    """Drive's first-page thumbnail, or None when Drive has none for this file."""
    url = f'https://drive.google.com/thumbnail?id={fid}&sz=w800'
    for attempt in range(5):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=40) as r:
                if not r.headers.get('Content-Type', '').startswith('image/'):
                    return None
                return flatten(Image.open(io.BytesIO(r.read())))
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            time.sleep(3 * (attempt + 1))  # 429 / 5xx: back off
        except Exception:
            time.sleep(3 * (attempt + 1))
    return None


def pdf_cover(fid, cap=1 << 30):
    """No Drive thumbnail: download the PDF (up to cap bytes) and render its first page."""
    import pymupdf, tempfile
    url = f'https://drive.usercontent.google.com/download?id={fid}&export=download&confirm=t'
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=120) as r, \
                tempfile.TemporaryFile() as tmp:
            got = 0
            while chunk := r.read(1 << 20):
                got += len(chunk)
                if got > cap: return None
                tmp.write(chunk)
            tmp.seek(0)
            data = tmp.read()
            if not data.startswith(b'%PDF'):  # owner disabled downloads: Drive sends an HTML error page
                return None
            doc = pymupdf.open(stream=data, filetype='pdf')
            page = doc[0]
            pix = page.get_pixmap(matrix=pymupdf.Matrix(800 / page.rect.width, 800 / page.rect.width))
            return Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    except Exception:
        return None


books = json.loads(read('universe-ui/data/platform.json'))['catalogs'][KEY.get(catalog, catalog)]
try:
    with open(os.path.join(out_root, 'manifest.json'), encoding='utf-8') as f:
        old = json.load(f)
except FileNotFoundError:
    old = {}
meta, old_covers = old.get('collections', {}), old.get('covers', {})

collections, covers, before, after = {}, {}, 0, 0
wanted = []
for b in books:
    name = b['catalog']
    if name not in collections:
        collections[name] = meta.get(name, {'slug': slugify(name), 'description': ''})
    fid = drive_id(b)
    if fid:
        wanted.append(fid)
        continue
    src = b['image']
    if src in covers or not src.startswith('/') or src.endswith('.svg'):
        continue
    raw = read(src.lstrip('/'))
    before += len(raw)
    im = flatten(Image.open(io.BytesIO(raw)))
    # covers kept outside the catalog's own folder (e.g. /assets/library/covers/rodo/) go under covers/local/
    rel = os.path.splitext(src[len(prefix):] if src.startswith(prefix) else 'local/' + os.path.basename(src))[0]
    after += save_webps(im, rel)
    # JPEG for link previews (WhatsApp, Facebook, Telegram); kept small so WhatsApp shows the large card
    w, h = im.size
    ow = min(600, w)
    im.resize((ow, round(h * ow / w)), Image.LANCZOS).save(os.path.join(out_root, f'{rel}-og.jpg'), 'JPEG', quality=78, optimize=True, progressive=True)
    covers[src] = {'t': rel, 'c': tint(im)}

# Drive first-page covers, keyed by file id (catalogo.js and the link-preview middleware look them up the same way)
missing = []


def drive_cover(fid):
    rel = f'drive/{fid}'
    if fid in old_covers and os.path.exists(os.path.join(out_root, rel + '-480.webp')):
        return fid, old_covers[fid]
    im = drive_thumb(fid) or pdf_cover(fid)
    if im is None:
        return fid, None
    save_webps(im, rel)
    return fid, {'t': rel, 'c': tint(im)}


with ThreadPoolExecutor(6) as pool:
    for fid, entry in pool.map(drive_cover, dict.fromkeys(wanted)):
        if entry: covers[fid] = entry
        else: missing.append(fid)

manifest = {'collections': collections, 'covers': covers}
os.makedirs(out_root, exist_ok=True)
with open(os.path.join(out_root, 'manifest.json'), 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, separators=(',', ':'))
print(f'{len(books)} books, {len(collections)} collections, {len(covers)} covers  '
      f'originals {before / 1048576:.1f} MB -> webp {after / 1048576:.1f} MB; '
      f'Drive covers {len(dict.fromkeys(wanted)) - len(missing)}/{len(dict.fromkeys(wanted))}' + (f'; no cover: {" ".join(missing)}' if missing else ''))
