"""Build light WebP covers (240/480w) + manifest for biblioteca/lumbreras.

Books come from universe-ui/data/platform.json (catalogs.lumbreras). Collection slugs and
descriptions are kept from the previous manifest; new collections get a slug from their name.

Usage (from the repo root):
  python tools/make-lumbreras-covers.py              # read data + images from the working tree
  python tools/make-lumbreras-covers.py origin/main  # read them from a git ref instead
"""
import io, json, os, re, subprocess, sys, unicodedata
from PIL import Image, ImageOps

ref = sys.argv[1] if len(sys.argv) > 1 else None
root = os.getcwd()
out_root = os.path.join(root, 'biblioteca/lumbreras/covers')
prefix = '/assets/library/lumbreras/'


def read(path):
    if ref:
        return subprocess.run(['git', 'show', f'{ref}:{path}'], check=True, capture_output=True).stdout
    with open(os.path.join(root, path), 'rb') as f:
        return f.read()


def slugify(s):
    s = unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


books = json.loads(read('universe-ui/data/platform.json'))['catalogs']['lumbreras']
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
    if src in covers or not src.startswith(prefix):
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
    r, g, bl = im.resize((1, 1), Image.BOX).getpixel((0, 0))
    covers[src] = {'t': rel, 'c': '#%02x%02x%02x' % (r, g, bl)}

manifest = {'collections': collections, 'covers': covers}
with open(os.path.join(out_root, 'manifest.json'), 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, separators=(',', ':'))
print(f'{len(books)} books, {len(collections)} collections, {len(covers)} covers  '
      f'originals {before / 1048576:.1f} MB -> webp {after / 1048576:.1f} MB')
