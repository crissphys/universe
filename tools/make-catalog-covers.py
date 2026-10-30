"""Build light WebP covers (240/480w) + manifest for a galaxy catalog page (biblioteca/<catalog>).

Books come from universe-ui/data/platform.json (catalogs.<catalog>). Collection slugs and
descriptions are kept from the previous manifest; new collections get a slug from their name.

Usage (from the repo root; <catalog> is the folder under biblioteca/):
  python tools/make-catalog-covers.py lumbreras              # read data + images from the working tree
  python tools/make-catalog-covers.py cuzcano origin/main    # read them from a git ref instead
"""
import io, json, os, re, subprocess, sys, unicodedata
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


books = json.loads(read('universe-ui/data/platform.json'))['catalogs'][KEY.get(catalog, catalog)]
try:
    with open(os.path.join(out_root, 'manifest.json'), encoding='utf-8') as f:
        meta = json.load(f).get('collections', {})
except FileNotFoundError:
    meta = {}

collections, covers, before, after = {}, {}, 0, 0
for b in books:
    name = b['catalog']
    if name not in collections:
        collections[name] = meta.get(name, {'slug': slugify(name), 'description': ''})
    src = b['image']
    if src in covers or not src.startswith(prefix) or src.endswith('.svg'):  # svg = placeholder, page uses Drive's thumbnail
        continue
    raw = read(src.lstrip('/'))
    before += len(raw)
    im = ImageOps.exif_transpose(Image.open(io.BytesIO(raw)))
    if im.mode in ('P', 'LA', 'RGBA'):
        im = im.convert('RGBA')
        bg = Image.new('RGB', im.size, (23, 23, 26))
        bg.paste(im, mask=im.split()[-1])
        im = bg
    else:
        im = im.convert('RGB')
    rel = os.path.splitext(src[len(prefix):])[0]
    w, h = im.size
    for width in (240, 480):
        tw = min(width, w)
        dst = os.path.join(out_root, f'{rel}-{width}.webp')
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        im.resize((tw, round(h * tw / w)), Image.LANCZOS).save(dst, 'WEBP', quality=74, method=6)
        after += os.path.getsize(dst)
    # JPEG for link previews (WhatsApp, Facebook, Telegram); kept small so WhatsApp shows the large card
    ow = min(600, w)
    im.resize((ow, round(h * ow / w)), Image.LANCZOS).save(os.path.join(out_root, f'{rel}-og.jpg'), 'JPEG', quality=78, optimize=True, progressive=True)
    r, g, bl = im.resize((1, 1), Image.BOX).getpixel((0, 0))
    covers[src] = {'t': rel, 'c': '#%02x%02x%02x' % (r, g, bl)}

manifest = {'collections': collections, 'covers': covers}
os.makedirs(out_root, exist_ok=True)
with open(os.path.join(out_root, 'manifest.json'), 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, separators=(',', ':'))
print(f'{len(books)} books, {len(collections)} collections, {len(covers)} covers  '
      f'originals {before / 1048576:.1f} MB -> webp {after / 1048576:.1f} MB')
