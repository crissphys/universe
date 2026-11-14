"""HD WebP for the reader: each image at up to 1600 px wide, and the first page of each PDF at 1600 px.

    python tools/make-resumenes-hd.py "<zip 1>" "<zip 2>"
    python tools/upload-resumenes.py --hd <bucket> "<zip 1>" "<zip 2>"

A 20 MB photo of a notebook becomes a few hundred KB that look the same on screen, so the page goes from
the small preview to full quality in a moment. Originals stay untouched for the download button.
Files are written to hd/<id>.webp (not committed) and uploaded to R2 at resumenes/hd/<id>.
"""
import io, json, sys, zipfile
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'hd'
W = 1600

def render(job):
    rid, ext, zpath, inner = job
    target = OUT / f'{rid}.webp'
    if target.exists():
        return rid, True
    from PIL import Image
    Image.MAX_IMAGE_PIXELS = None
    try:
        with zipfile.ZipFile(zpath) as z:
            data = z.read(inner)
        if ext == 'pdf':
            import pymupdf
            page = pymupdf.open(stream=data, filetype='pdf')[0]
            zoom = W / max(page.rect.width, 1)
            pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
            img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
        else:
            img = Image.open(io.BytesIO(data))
            img.draft('RGB', (W, W * 8))
            img = img.convert('RGB')
            if img.width > W:
                img = img.resize((W, round(img.height * W / img.width)), Image.LANCZOS)
        img.save(target, 'WEBP', quality=80, method=4)
        return rid, True
    except Exception as e:
        print('sin HD', rid, inner.rsplit('/', 1)[-1], type(e).__name__, str(e)[:80])
        return rid, False

def main(zips):
    OUT.mkdir(exist_ok=True)
    by_name = {Path(z).name: z for z in zips}
    rows = json.loads((ROOT / 'resumenes/data/catalogo.json').read_text(encoding='utf-8'))
    manifest = json.loads((ROOT / 'tools/resumenes-manifest.json').read_text(encoding='utf-8'))
    jobs = [(r['id'], r['e'], by_name[manifest[r['id']][0]], manifest[r['id']][1]) for r in rows]
    with ProcessPoolExecutor() as pool:
        ok = dict(pool.map(render, jobs, chunksize=4))
    size = sum(f.stat().st_size for f in OUT.glob('*.webp'))
    print(f'{sum(ok.values())}/{len(rows)} HD, {size / 1048576:.0f} MB en hd/')

if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
