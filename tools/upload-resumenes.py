"""Copies every original file of resumenes/data/catalogo.json from the Drive zips to the R2 bucket.

    npx wrangler login                      (once)
    python tools/upload-resumenes.py <bucket> "<zip 1>" "<zip 2>"

Each file goes to <bucket>/resumenes/base/<id> with its real Content-Type and its original name in
Content-Disposition (the site's download button uses it). Already uploaded ids are listed in
tools/resumenes-uploaded.txt, so the script can be stopped and run again.
"""
import json, subprocess, sys, tempfile, threading, zipfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent
MIME = {'pdf': 'application/pdf', 'jpg': 'image/jpeg', 'png': 'image/png', 'webp': 'image/webp'}
HD = '--hd' in sys.argv  # upload hd/<id>.webp (tools/make-resumenes-hd.py) to resumenes/hd/<id> instead
DONE = ROOT / ('tools/resumenes-uploaded-hd.txt' if HD else 'tools/resumenes-uploaded.txt')
lock = threading.Lock()

def main(bucket, zips):
    rows = {r['id']: r for r in json.loads((ROOT / 'resumenes/data/catalogo.json').read_text(encoding='utf-8'))}
    manifest = json.loads((ROOT / 'tools/resumenes-manifest.json').read_text(encoding='utf-8'))
    done = set(DONE.read_text().split()) if DONE.exists() else set()
    archives = {Path(z).name: zipfile.ZipFile(z) for z in zips}
    todo = [i for i in rows if i not in done and (not HD or (ROOT / 'hd' / f'{i}.webp').exists())]
    print(f'{len(rows)} en el catálogo, {len(done)} ya subidos, {len(todo)} por subir')
    npx = 'npx.cmd' if sys.platform == 'win32' else 'npx'
    import os
    local = os.environ.get('WRANGLER_JS')  # optional: path to an installed wrangler.js (skips npx on every file)
    base = ['node', local] if local else [npx, '--yes', 'wrangler@4']

    def put_hd(rid):
        cmd = base + ['r2', 'object', 'put', f'{bucket}/resumenes/hd/{rid}', '--file', str(ROOT / 'hd' / f'{rid}.webp'),
                      '--content-type', 'image/webp', '--remote']
        r = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace')
        if r.returncode != 0:
            print('ERROR', rid, r.stderr.strip()[-300:])
            return
        with lock:
            with DONE.open('a') as f:
                f.write(rid + '\n')
        print('ok', rid)

    def put(rid):
        zip_name, inner = manifest[rid]
        row = rows[rid]
        with lock:
            data = archives[zip_name].read(inner)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.' + row['e']) as tmp:
            tmp.write(data)
        try:
            cmd = base + ['r2', 'object', 'put', f'{bucket}/resumenes/base/{rid}', '--file', tmp.name,
                   '--content-type', MIME[row['e']], '--content-disposition', "inline; filename*=UTF-8''" + quote(row['f']), '--remote']
            r = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace')
            if r.returncode != 0:
                print('ERROR', rid, row['f'], r.stderr.strip()[-300:])
                return
            with lock:
                with DONE.open('a') as f:
                    f.write(rid + '\n')
            print('ok', rid, row['f'])
        finally:
            Path(tmp.name).unlink(missing_ok=True)

    with ThreadPoolExecutor(max_workers=int(os.environ.get('UPLOAD_WORKERS', '6'))) as pool:
        list(pool.map(put_hd if HD else put, todo))

if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    args = [a for a in sys.argv[1:] if a != '--hd']
    main(args[0], args[1:])
