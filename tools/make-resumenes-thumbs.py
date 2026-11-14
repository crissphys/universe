"""Preview images for /resumenes: first page of each PDF, or the image itself, as a 360 px WebP.

    python tools/make-resumenes-thumbs.py "<zip 1>" "<zip 2>"

Each preview keeps the page's exact proportions (only strips taller than 1:3 are cut, keeping the top).
Writes resumenes/thumbs/<id>.webp (skips existing ones unless --force) and marks the rows with "p": 1 and
"r": "<w>:<h>" (the preview's pixel size) in resumenes/data/catalogo.json. Run it after tools/build-resumenes.py.
"""
import io, json, sys, zipfile
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'resumenes/thumbs'
W = 360
MAX_TALL = 3  # height up to 3x the width; longer strips keep their top third

def ratio_of(path):
    from PIL import Image
    with Image.open(path) as im:
        return im.size

def render(job):
    rid, ext, zpath, inner, force = job
    target = OUT / f'{rid}.webp'
    if target.exists() and not force:
        return rid, True
    from PIL import Image
    Image.MAX_IMAGE_PIXELS = None
    try:
        with zipfile.ZipFile(zpath) as z:
            data = z.read(inner)
        if ext == 'pdf':
            import pymupdf
            doc = pymupdf.open(stream=data, filetype='pdf')
            page = doc[0]
            zoom = (W * 2) / max(page.rect.width, 1)
            pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
            img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
        else:
            img = Image.open(io.BytesIO(data))
            img.draft('RGB', (W * 2, W * 4))  # fast JPEG decode at reduced size
            img = img.convert('RGB')
        if img.height > img.width * MAX_TALL:
            img = img.crop((0, 0, img.width, img.width * MAX_TALL))
        img = img.resize((W, max(1, round(img.height * W / img.width))), Image.LANCZOS)
        img.save(target, 'WEBP', quality=62, method=6)
        return rid, True
    except Exception as e:  # damaged or protected file: the page shows the format glyph instead
        print('sin vista previa', rid, inner.rsplit('/', 1)[-1], type(e).__name__, str(e)[:80])
        return rid, False

def main(zips):
    OUT.mkdir(parents=True, exist_ok=True)
    by_name = {Path(z).name: z for z in zips}
    cat_path = ROOT / 'resumenes/data/catalogo.json'
    rows = json.loads(cat_path.read_text(encoding='utf-8'))
    manifest = json.loads((ROOT / 'tools/resumenes-manifest.json').read_text(encoding='utf-8'))
    force = '--force' in sys.argv
    jobs = [(r['id'], r['e'], by_name[manifest[r['id']][0]], manifest[r['id']][1], force) for r in rows]
    with ProcessPoolExecutor() as pool:
        ok = dict(pool.map(render, jobs, chunksize=4))
    for r in rows:
        if ok.get(r['id']):
            r['p'] = 1
            r['r'] = '%d:%d' % ratio_of(OUT / f"{r['id']}.webp")
        else:
            r.pop('p', None)
            r.pop('r', None)
    cat_path.write_text(json.dumps(rows, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    size = sum(f.stat().st_size for f in OUT.glob('*.webp'))
    print(f'{sum(ok.values())}/{len(rows)} vistas previas, {size / 1048576:.1f} MB en {OUT.relative_to(ROOT)}')

if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main([a for a in sys.argv[1:] if a != '--force'])
