"""Preview images for /resumenes: first page of each PDF, or the image itself, as a 360 px WebP.

    python tools/make-resumenes-thumbs.py "<zip 1>" "<zip 2>"

Each preview keeps the page's own shape, snapped to the closest of 16:9, 3:2, 4:3, 5:4, 1:1, 4:5, 3:4,
2:3, 9:16 (taller pages keep their top, wider ones their centre). Writes resumenes/thumbs/<id>.webp
(skips existing ones unless --force) and marks the rows with "p": 1 and "r": "<w>:<h>" in
resumenes/data/catalogo.json. Run it after tools/build-resumenes.py.
"""
import io, json, sys, zipfile
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'resumenes/thumbs'
W = 360
RATIOS = [(16, 9), (3, 2), (4, 3), (5, 4), (1, 1), (4, 5), (3, 4), (2, 3), (9, 16)]

def snap(w, h):
    import math
    return min(RATIOS, key=lambda r: abs(math.log((w / h) / (r[0] / r[1]))))

def ratio_of(path):
    from PIL import Image
    with Image.open(path) as im:
        return snap(*im.size)

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
            zoom = (W * 2) / max(min(page.rect.width, page.rect.height * 16 / 9), 1)
            pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
            img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
        else:
            img = Image.open(io.BytesIO(data))
            img.draft('RGB', (W * 2, W * 4))  # fast JPEG decode at reduced size
            img = img.convert('RGB')
        rw, rh = snap(img.width, img.height)
        if img.width / img.height > rw / rh:      # wider than the slot: keep the centre
            cw = round(img.height * rw / rh)
            x = (img.width - cw) // 2
            img = img.crop((x, 0, x + cw, img.height))
        else:                                      # taller: keep the top, where the title is
            img = img.crop((0, 0, img.width, round(img.width * rh / rw)))
        img = img.resize((W, round(W * rh / rw)), Image.LANCZOS)
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
