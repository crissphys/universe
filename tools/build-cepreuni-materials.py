"""Rebuilds cepreuni/ciclopre20271/materiales.json from the public CEPREUNI Drive folder.

    python tools/build-cepreuni-materials.py            # crawl Drive (public embeddedfolderview)
    python tools/build-cepreuni-materials.py tree.json  # reuse a cached crawl

Drive stays the source of truth: add/rename files there and re-run.
Item keys: i=drive id, t=title, c=course, k=kind, w=week, e=exam event, x=ext (''=pdf), d=ISO date, f=1 folder link, n=files in folder.
"""
import concurrent.futures as cf, html, json, re, sys, unicodedata, urllib.request
from datetime import date
from pathlib import Path

ROOT = '1JhM-qksx9sTQRJqtNkeFYUwsm2RhZ4cV'
OUT = Path(__file__).resolve().parent.parent / 'cepreuni/ciclopre20271/materiales.json'
ENTRY = re.compile(r'<div class="flip-entry" id="entry-([^"]+)".*?<a href="([^"]+)".*?<div class="flip-entry-title">(.*?)</div></a></div><div class="flip-entry-last-modified"><div>(.*?)</div>', re.S)
MONTHS = {'ene': 1, 'jan': 1, 'feb': 2, 'mar': 3, 'abr': 4, 'apr': 4, 'may': 5, 'jun': 6, 'jul': 7, 'ago': 8, 'aug': 8,
          'sep': 9, 'sept': 9, 'oct': 10, 'nov': 11, 'dic': 12, 'dec': 12}
COURSES = ['Aritmética', 'Álgebra', 'Geometría', 'Trigonometría', 'Física', 'Química', 'Razonamiento Verbal', 'Lenguaje',
           'Inglés', 'Psicología', 'Historia', 'Geografía', 'Economía', 'Filosofía', 'General']
# (course, folded keys that identify it); the first match wins, so "verbal" precedes the maths names
COURSE_KEYS = [('Razonamiento Verbal', ('verbal',)), ('Aritmética', ('arit', 'artim')), ('Álgebra', ('algebra',)),
               ('Geometría', ('geometr',)), ('Trigonometría', ('trigono',)), ('Física', ('fisica',)), ('Química', ('quimica',)),
               ('Lenguaje', ('lenguaje',)), ('Inglés', ('ingles', 'verbo correcto')), ('Psicología', ('psicolog',)),
               ('Historia', ('historia',)), ('Geografía', ('geograf',)), ('Economía', ('econom',)), ('Filosofía', ('filosof',))]
EVENTS = {'1EP': '1EP', '1RA PC': 'PC1', '2DA PC': 'PC2', '3RA PC': 'PC3', '4TA PC': 'PC4'}
IMG = ('jpg', 'jpeg', 'png', 'webp')
SHOWN_EXT = ('pptx', 'ppt', 'docx', 'doc', 'xlsx', 'png', 'jpg', 'jpeg', 'mp4')


def fold(s):
    return unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode().lower()


def kids(fid):
    for _ in range(4):
        try:
            req = urllib.request.Request(f'https://drive.google.com/embeddedfolderview?id={fid}', headers={'accept-language': 'es-PE'})
            page = urllib.request.urlopen(req, timeout=30).read().decode()
            return [dict(id=i, folder='/folders/' in h, name=html.unescape(re.sub('<[^>]+>', '', t)).strip(), mod=m)
                    for i, h, t, m in ENTRY.findall(page)]
        except Exception as e:  # noqa: BLE001 - retry any network error
            err = e
    raise SystemExit(f'Drive crawl failed for {fid}: {err}')


def walk(fid, path):
    ks = kids(fid)
    with cf.ThreadPoolExecutor(8) as ex:
        subs = [ex.submit(walk, k['id'], path + [k['name']]) for k in ks if k['folder']]
    for k in ks:
        k['path'] = path
    return ks + [n for s in subs for n in s.result()]


def course_of(*texts):
    """First text that names a course wins (file name before its folders)."""
    for t in texts:
        f = fold(t)
        for c, keys in COURSE_KEYS:
            if any(k in f for k in keys):
                return c
    return 'General'


def ext_of(name):
    m = re.search(r'\.([A-Za-z0-9]{2,4})$', name)
    return m[1].lower() if m else ''


def iso(mod):
    m = re.match(r'(\d+)\s+([a-z]+)', fold(mod))
    return f'2026-{MONTHS[m[2]]:02d}-{int(m[1]):02d}' if m and m[2] in MONTHS else ''


def week_of(title):
    t = fold(title)
    for rx in (r'^s0?(\d+)[ab]?\b', r'^(\d+)\.\d+\b', r'sesion\s*(\d+)', r'sem(?:ana)?\.?\s*0*(\d+)', r'clase\s*(\d+)',
               r'^(\d+)[sv]\b', r'_s0?(\d+)[sv]_', r'^(\d+)\s*[-–]', r'^(\d+)\.\s'):
        m = re.search(rx, t)
        if m and 0 < int(m[1]) <= 12:
            return int(m[1])
    return None


def part_of(title):
    t = fold(title)
    m = re.match(r'(?:s0?\d+([ab])|\d+\.(\d+)|\d+([sv]))(?!\w)', t)
    return None if not m else (m[2] or {'a': '1', 'b': '2', 'v': '1', 's': '2'}[m[1] or m[3]])


def clean(name, course='General', keep_year=False):
    t = name
    while re.search(r'\.[A-Za-z0-9]{2,4}$', t):  # "x.pptx.pdf"
        t = re.sub(r'\.[A-Za-z0-9]{2,4}$', '', t)
    t = re.sub(r'\[\d+\]|\s*\((?:\d+|copia)\)', '', t.replace('_', ' '))
    if not keep_year:
        t = re.sub(r'\s*[-–—]?\s*\b(?:PRE|Pre|CICLO PRE|CEPRE UNI)?[\s-]*20(?:26|27)\s*[-–]?\s*(?:I{1,2}|1|2)\b', '', t)
    for _ in range(2):  # "Teoría Pre 2027-1b" needs two passes
        t = re.sub(r'\(\s*\)|\s*(?<!\w)Pre\s*2027-?1\w*|\s*[-–]?\s*(?<!\w)PRE$|\s*(?<!\w)Teor[ií]a$', '', t, flags=re.I)
    t = re.sub(r'^\s*(?:S\d+[ab]?\s*[-–]?\s*|\d+(?:\.\d+)?\s*[-–.]?\s+(?=\D)|\d+[SV]\s+)', '', t)
    if course != 'General':  # the section header already says the course
        keys = next(k for c, k in COURSE_KEYS if c == course)
        m = re.match(r'(\w+)\s*[-–·]\s*', t)
        if m and fold(m[1]).startswith(keys):
            t = t[m.end():]
    return re.sub(r'\s{2,}', ' ', t).strip(' -–·') or name


def repaso_title(name, course):
    t = clean(name, course)
    t = re.sub(r'\b(?:1EP|PC\s*[1-4]|[1-4]\s*(?:ra|da|er|\.ª|ª)?\s*PC)\b\.?', '', t, flags=re.I)
    t = re.sub(r'\b(?:Aritm\w+|Álgebra|Geometr\w+|Trigonom\w+|F[ií]sica|Qu[ií]mica)\b', '', t, flags=re.I)
    t = re.sub(r'\s{2,}', ' ', t).strip(' -–·.')
    t = t.capitalize() if t.isupper() else t
    return (t[:1].upper() + t[1:]) if len(t) > 3 else 'Repaso'


def event_of(name):
    m = re.search(r'\b([1-4])\s*(?:ra|da|er|\.ª|ª|ta)?\s*PC\b', name, re.I) or re.search(r'PC\s*([1-4])\b', name, re.I)
    return f'PC{m[1]}' if m else ('1EP' if re.search(r'\b1EP\b', name) else '')


def build(tree):
    folders = {n['id']: n for n in tree if n['folder']}
    items, imgs = [], {}
    for n in tree:
        if n['folder']:
            continue
        top = n['path'][0] if n['path'] else ''
        sub = n['path'][1:]
        raw = n['name']
        ext = ext_of(raw)
        base = dict(i=n['id'], d=iso(n['mod']), x=ext if ext in SHOWN_EXT else '')
        low = fold(raw)
        if not top:
            course = course_of(raw)
            items.append({**base, 'c': course, 'k': 'repaso', 't': repaso_title(raw, course), 'e': '1EP'})
        elif top.startswith('📊'):
            course = course_of(sub[0])
            k = 'solucionario' if 'solucionario' in low else 'repaso' if re.search(r'retroalimentaci|recopilaci', low) else 'clase'
            it = {**base, 'c': course, 'k': k, 't': repaso_title(raw, course) if k == 'repaso' else clean(raw, course)}
            if k == 'clase':
                it['w'] = week_of(raw) if 'repaso' not in low else None
                it['p'] = part_of(raw)
            else:
                it['e'] = event_of(raw)
                it['w'] = week_of(raw) if 'semana' in low else None
            items.append(it)
        elif top.startswith('📕'):
            adicional = bool(sub)
            course = course_of(sub[0] if adicional else raw)
            title = clean(raw, course, keep_year=adicional)
            if not adicional:
                title = re.sub(r'^((?:LIBRO|SEMANA)\s+\d+)\s*-.*$', lambda m: m[1].title(), title, flags=re.I)
            items.append({**base, 'c': course, 'k': 'adicional' if adicional else 'libro', 't': title,
                          'w': week_of(raw) if adicional and 'sesi' in low else None})
        elif top.startswith('✅'):
            course = 'Inglés' if sub and 'INGL' in sub[0].upper() else course_of(raw)
            items.append({**base, 'c': course, 'k': 'repaso', 't': repaso_title(raw, course) if course != 'Inglés' else clean(raw),
                          'e': next((v for k, v in EVENTS.items() if sub and sub[0].startswith(k)), '')})
        elif top.startswith('🏆'):
            sede = 'Juliaca' if 'juliaca' in low else 'Lima'
            ev = '1PC' if re.search(r'1\.?.?\s*pc|1pc', low) else '2PC' if '2pc' in low else '3PC' if '3pc' in low else 'Selección'
            items.append({**base, 'c': 'General', 'k': 'resultado', 't': f"{ev.replace('PC', '.ª PC')} · {sede}".replace('Selección · ', 'Prueba de selección · '), 'e': ev.replace('1PC', 'PC1').replace('2PC', 'PC2').replace('3PC', 'PC3')})
        elif top.startswith('🗂'):
            course = course_of(raw)
            items.append({**base, 'c': course, 'k': 'info', 't': clean(raw, course)})
        elif top.startswith('🐻'):
            if ext in IMG:  # page screenshots -> one link per Drive folder
                imgs.setdefault(tuple(n['path']), []).append(n)
                continue
            course = course_of(raw, *sub)
            k = 'info' if re.search(r'silabo|horario', low) else 'libro' if 'material de estudio' in low else 'solucionario'
            items.append({**base, 'c': course, 'k': k, 't': clean(raw, course), 'e': event_of(raw) if k == 'solucionario' else ''})
    for path, files in imgs.items():
        fid = next(f['id'] for f in folders.values() if tuple(f['path'] + [f['name']]) == path)
        label = re.sub(r'^[^\w]+\|?\s*', '', path[-1]).strip()
        course = course_of(*path[2:])
        label = 'Solucionario · Libro 1' if re.search(r'LIBRO 1', label, re.I) else clean(label, course)
        items.append(dict(i=fid, t=label, c=course, k='solucionario', e=event_of(path[-1]), x='folder', f=1,
                          d=max(iso(f['mod']) for f in files), n=len(files)))
    order = {c: n for n, c in enumerate(COURSES)}
    kind = {k: n for n, k in enumerate(['clase', 'libro', 'adicional', 'repaso', 'solucionario', 'info', 'resultado'])}
    items.sort(key=lambda a: (order[a['c']], kind[a['k']], {'PC3': 0, 'PC2': 1, 'PC1': 2}.get(a.get('e'), 3) if a['k'] == 'resultado' else a.get('w') or 99, a.get('e') or '', a.get('p') or '', a['t']))
    return items


if __name__ == '__main__':
    tree = json.load(open(sys.argv[1], encoding='utf-8')) if len(sys.argv) > 1 else walk(ROOT, [])
    items = build(tree)
    OUT.write_text(json.dumps({'built': date.today().isoformat(), 'courses': COURSES, 'items': items}, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print(len(items), 'items ->', OUT)
