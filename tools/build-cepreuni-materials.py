"""Rebuilds cepreuni/<programa>/materiales-<ciclo>.json from the public CEPREUNI Drive folders.

    python tools/build-cepreuni-materials.py                   # every cycle (crawls Drive, public embeddedfolderview)
    python tools/build-cepreuni-materials.py 2026-2            # one cycle
    python tools/build-cepreuni-materials.py 2026-2 tree.json  # reuse a cached crawl

Drive stays the source of truth: add/rename files there and re-run.
Item keys: i=drive id, t=title, c=course, k=kind, w=week/session, p=part (3.2 -> 2), e=exam event,
x=ext shown in the UI ('' = pdf), d=ISO date, f=1 folder link, n=pages inside the folder.
"""
import concurrent.futures as cf, html, json, re, sys, unicodedata, urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / 'cepreuni'
CYCLES = {  # cycle -> (Drive folder, page folder); newest first = the order of the selector in each page
    '2027-1': ('1JhM-qksx9sTQRJqtNkeFYUwsm2RhZ4cV', 'materialespre'),
    '2026-2': ('1eZLZyRRbs46_IlVQyYjXrpCNGuWo5OGW', 'materialespre'),
    '2026-1': ('1F-1tbNGVQ_34leVy3Yfb1mmDF6eqLZax', 'materialespre'),
    '2027': ('1P9142BrZzvwineILYUaEfo1F1eTKJmnP', 'materialesien'),
    '2026': ('1aWpK2Y4IlggeZZHggSEnelaD2Mffrtxx', 'materialesien'),
    '2025': ('1wnVmcDyJMShYL0RTzHsfSk43Bl-yyHu6', 'materialesien'),
}
ENTRY = re.compile(r'<div class="flip-entry" id="entry-([^"]+)".*?<a href="([^"]+)".*?<div class="flip-entry-title">(.*?)</div></a></div><div class="flip-entry-last-modified"><div>(.*?)</div>', re.S)
MONTHS = {'ene': 1, 'jan': 1, 'feb': 2, 'mar': 3, 'abr': 4, 'apr': 4, 'may': 5, 'jun': 6, 'jul': 7, 'ago': 8, 'aug': 8,
          'sep': 9, 'sept': 9, 'oct': 10, 'nov': 11, 'dic': 12, 'dec': 12}
COURSES = ['Aritmética', 'Razonamiento Matemático', 'Álgebra', 'Geometría', 'Trigonometría', 'Física', 'Química',
           'Razonamiento Verbal', 'Lenguaje', 'Literatura', 'Inglés', 'Psicología', 'Historia', 'Geografía', 'Economía',
           'Filosofía', 'General']
# (course, folded keys that identify it); the first match wins, so "verbal" precedes the maths names
COURSE_KEYS = [('Razonamiento Verbal', ('verbal',)), ('Razonamiento Matemático', ('razonamiento matem',)),
               ('Aritmética', ('arit', 'artim')), ('Álgebra', ('algebra',)), ('Geometría', ('geometr',)),
               ('Trigonometría', ('trigono',)), ('Física', ('fisica',)), ('Química', ('quimica',)),
               ('Lenguaje', ('lenguaje',)), ('Literatura', ('literatura',)), ('Inglés', ('ingles', 'verbo correcto')),
               ('Psicología', ('psicolog',)), ('Historia', ('historia',)), ('Geografía', ('geograf',)),
               ('Economía', ('econom',)), ('Filosofía', ('filosof',))]
IMG = ('jpg', 'jpeg', 'png', 'webp')
SHOWN_EXT = ('pptx', 'ppt', 'docx', 'doc', 'xlsx', 'png', 'jpg', 'jpeg', 'mp4')
KIND_ORDER = ['clase', 'libro', 'adicional', 'repaso', 'pizarra', 'problemas', 'evaluacion', 'solucionario', 'info', 'resultado']
# files that are really page screenshots (Drive keeps no extension on the 2026 uploads)
PAGE_SOL = re.compile(r'^\(.+\)\s*[\d-]')
PAGE_REPASO = re.compile(r'^(?:\(.*\)\s*)?(?:pizarra|p[aá]gina)\s*\d+$', re.I)
PAGE_WA = re.compile(r'^IMG-\d{8}-WA\d+')


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
    for rx in (r'^s0?(\d+)[ab]?(?!\w)', r'^(\d+)\.\d+(?!\w)', r'sesion\s*(\d+)', r'sem(?:ana)?\.?\s*0*(\d+)', r'clase\s*(\d+)',
               r'week\s*(\d+)', r'^(\d+)[sv](?!\w)', r'_s0?(\d+)[sv]_', r'^0*(\d+)\s*[-–]', r'^0*(\d+)[.)]?\s'):
        m = re.search(rx, t)
        if m and 0 < int(m[1]) <= 25:
            return int(m[1])
    return None


def part_of(title):
    t = fold(title)
    m = re.match(r'(?:s0?\d+([ab])|\d+\.(\d+)|\d+([sv]))(?!\w)', t)
    if m:
        return m[2] or {'a': '1', 'b': '2', 'v': '1', 's': '2'}[m[1] or m[3]]
    m = re.search(r'(?:sesion|semana)\s*\d+[,.]([1-9])', t)
    return m[1] if m else None


def clean(name, course='General', keep_year=False):
    t = name
    while re.search(r'\.[A-Za-z0-9]{2,4}$', t):  # "x.pptx.pdf"
        t = re.sub(r'\.[A-Za-z0-9]{2,4}$', '', t)
    t = re.sub(r'\[\d+\]|\s*\((?:\d+|copia)\)', '', t.replace('_', ' '))
    t = re.sub(r'\s*[-–—]\s*(?:Ciclo Pre\s+)?CEPREUNI(?:\s+20\d\d-\d)?', '', t)
    t = re.sub(r'\s*[-–—]?\s*(?<!\w)IEN\s*(?:20\d\d)?(?!\w)', '', t)
    if not keep_year:
        t = re.sub(r'\s*[-–—]?\s*(?<!\w)(?:PRE|Pre|CICLO PRE|CEPRE UNI)?[\s-]*20(?:26|27)\s*[-–]?\s*(?:I{1,2}|1|2)(?!\w)', '', t)
    for _ in range(2):  # "Teoría Pre 2027-1b" needs two passes
        t = re.sub(r'\(\s*\)|\s*(?<!\w)Pre\s*2027-?1\w*|\s*[-–]?\s*(?<!\w)PRE$|\s*(?<!\w)Teor[ií]a$', '', t, flags=re.I)
    t = re.sub(r'^\s*(?:S\d+[ab]?\s*[-–]?\s*|\d+(?:[.,]\d+)?\s*[-–.]?\s+(?=\D)|\d+[SV]\s+)', '', t)
    if course != 'General':  # the section header already says the course
        keys = next(k for c, k in COURSE_KEYS if c == course)
        m = re.match(r'(\w+)\s*[-–—·]\s*', t)
        if m and fold(m[1]).startswith(keys):
            t = t[m.end():]
    return re.sub(r'\s{2,}', ' ', t).strip(' -–—·') or name


def event_of(name):
    f = fold(name).replace('_', ' ')
    m = re.search(r'(?<!\d)([1-7])\s*(?:ra|da|er|ta|ma|mo|do)?\.?\s*pc(?!\w)', f) or re.search(r'pc\s*([1-7])(?!\d)', f) \
        or re.search(r'(?<!\d)([1-7])\s*(?:\.a|a)\s*prueba calificada', f)
    if m:
        return f'PC{m[1]}'
    m = re.search(r'(?<!\d)([1-3])\s*(?:er|do|ro)?\s*(?:ep|parcial)', f)
    if m:
        return f'{m[1]}EP'
    return 'EF' if re.search(r'ex(?:amen)?\.? final|ex final', f) else ''


def repaso_title(name, course):
    t = clean(name, course)
    t = re.sub(r'(?<!\w)(?:[1-3]EP|PC\s*[1-7]|[1-7]\s*(?:ra|da|er|ta|ma|mo|\.ª|ª)?\s*PC)(?!\w)\.?', '', t, flags=re.I)
    t = re.sub(r'(?<!\w)(?:Aritm\w+|Álgebra|Algebra|Geometr\w+|Trigonom\w+|F[ií]sica|Qu[ií]mica)(?:\s+I{1,2})?(?!\w)', '', t, flags=re.I)
    t = re.sub(r'\s{2,}', ' ', t).strip(' -–—·.')
    t = t.capitalize() if t.isupper() else t
    return (t[:1].upper() + t[1:]) if len(t) > 3 else 'Repaso'


def pretty(folder_name):
    """'🧪 | QUÍMICA (UNIverse)' -> 'QUÍMICA (UNIverse)'."""
    return re.sub(r'^[^\w(]+\|?\s*', '', folder_name).strip()


def build(tree, cyc):
    folders = {n['id']: n for n in tree if n['folder']}
    items, groups = [], {}

    def group(path, **meta):
        groups.setdefault(tuple(path), []).append(meta)

    for n in tree:
        if n['folder']:
            continue
        path, raw = n['path'], n['name']
        top, sub = fold(path[0]) if path else '', path[1:]
        ext = ext_of(raw)
        low = fold(raw)
        base = dict(i=n['id'], d=iso(n['mod']), x=ext if ext in SHOWN_EXT else '')

        if not path:  # loose files at the cycle root
            course = course_of(raw)
            if 'resultado' in low:
                items.append({**base, 'c': 'General', 'k': 'resultado', 't': 'Resultados de admisión'})
            elif 'repaso' in low:
                items.append({**base, 'c': course, 'k': 'repaso', 't': repaso_title(raw, course), 'e': event_of(raw)})
            else:
                items.append({**base, 'c': course, 'k': 'info', 't': clean(raw, course)})
        elif 'ppts' in top or 'presentaciones' in top:
            course = course_of(sub[0] if sub else raw)
            k = 'solucionario' if 'solucionario' in low else 'repaso' if re.search(r'retroalimentaci|recopilaci', low) else 'clase'
            title = repaso_title(raw, course) if k == 'repaso' else clean(raw, course)
            if sub and 'by criss' in fold(sub[0]):
                title += ' · Criss'
            it = {**base, 'c': course, 'k': k, 't': title}
            if k == 'clase':
                it['w'] = week_of(raw) if 'repaso' not in low else None
                it['p'] = part_of(raw)
            else:
                it['e'] = event_of(raw)
                it['w'] = week_of(raw) if 'semana' in low else None
            items.append(it)
        elif 'pizarra' in top:
            if PAGE_WA.match(raw):
                group(path, kind='pizarra', label='Pizarras sin clasificar', mod=n['mod'])
                continue
            course = course_of(sub[0] if sub else raw, raw)
            who = re.sub(r'\s*\(Semana[^)]*\)', '', clean(raw, course)).strip()  # the tile already shows the week
            items.append({**base, 'c': course, 'k': 'pizarra', 't': 'Pizarra' if who in ('', 'N/A') else who, 'x': base['x'] or 'jpg',
                          'w': week_of(raw) if 'semana' in low else None, 'p': part_of(raw)})
        elif 'solucionario' in top:
            if ext in IMG or (cyc != '2027-1' and PAGE_SOL.match(raw)):  # page screenshots -> one link per Drive folder
                group(path, kind='solucionario', mod=n['mod'])
                continue
            course = course_of(raw, *sub)
            k = 'info' if re.search(r'silabo|horario', low) else 'libro' if 'material de estudio' in low else 'solucionario'
            items.append({**base, 'c': course, 'k': k, 't': clean(raw, course), 'e': event_of(raw) if k == 'solucionario' else ''})
        elif 'repaso' in top:
            leaf = sub[-1] if sub else ''
            if PAGE_REPASO.match(raw):
                group(path, kind='repaso', mod=n['mod'])
                continue
            if 'adicional' in fold(leaf):
                course = course_of(leaf, raw)
                items.append({**base, 'c': course, 'k': 'adicional', 't': clean(raw, course, keep_year=True),
                              'w': week_of(raw) if 'sesi' in low else None, 'p': part_of(raw)})
                continue
            course = course_of(raw, leaf)
            k = 'solucionario' if 'solucionario' in low else 'repaso'
            items.append({**base, 'c': course, 'k': k, 't': repaso_title(raw, course) if k == 'repaso' else clean(raw, course),
                          'e': event_of(leaf) or event_of(raw)})
        elif 'resultado' in top:
            if cyc == '2027-1':
                sede = 'Juliaca' if 'juliaca' in low else 'Lima'
                ev = '1PC' if re.search(r'1\.?.?\s*pc|1pc', low) else '2PC' if '2pc' in low else '3PC' if '3pc' in low else 'Selección'
                title = f"{ev.replace('PC', '.ª PC')} · {sede}".replace('Selección · ', 'Prueba de selección · ')
                e = ev.replace('1PC', 'PC1').replace('2PC', 'PC2').replace('3PC', 'PC3')
            else:
                m = re.match(r'RESULTADOS?(\d)PC.*?(JULIACA)?$', raw.rsplit('.', 1)[0], re.I)
                if m:
                    title, e = f"{m[1]}.ª PC · {'Juliaca' if m[2] else 'Lima'}", f'PC{m[1]}'
                else:
                    title, e = re.sub(r'^Resultados\s*[-–—]\s*', '', clean(raw)).replace(' — ', ' · '), event_of(raw)
            items.append({**base, 'c': 'General', 'k': 'resultado', 't': title, 'e': e})
        elif re.search(r'resolucion|claves', top):
            course = course_of(sub[0] if sub else raw, raw)
            items.append({**base, 'c': course, 'k': 'solucionario', 't': clean(raw, course), 'w': week_of(raw), 'e': ''})
        elif re.search(r'enunciado|problemas|guias', top):
            course = course_of(sub[0] if sub else raw, raw)
            items.append({**base, 'c': course, 'k': 'problemas', 't': clean(raw, course), 'w': week_of(raw), 'p': part_of(raw)})
        elif 'evaluacion' in top:
            course = course_of(sub[0] if sub else raw, raw)
            items.append({**base, 'c': course, 'k': 'evaluacion', 't': clean(raw, course), 'w': week_of(raw), 'p': part_of(raw)})
        elif 'material' in top or 'laboratorio' in top:
            adicional = bool(sub) and 'laboratorio' not in top
            course = course_of(sub[0] if adicional else raw)
            title = clean(raw, course, keep_year=adicional)
            if not adicional:
                title = re.sub(r'^((?:LIBRO|SEMANA)\s+\d+)\s*-\s*[^()—–]+$', lambda m: m[1].title(), title, flags=re.I)
            items.append({**base, 'c': course, 'k': 'adicional' if adicional else 'libro', 't': title,
                          'w': week_of(raw) if adicional and 'sesi' in low else None})
        else:  # sílabos, información general, cronogramas
            course = course_of(raw)
            items.append({**base, 'c': course, 'k': 'info', 't': clean(raw, course)})

    for path, files in groups.items():
        kind = files[0]['kind']
        leaf_id = next((f['id'] for f in folders.values() if tuple(f['path'] + [f['name']]) == path), None)
        if not leaf_id:
            continue
        leaf = path[-1]
        d = max(iso(f['mod']) for f in files)
        if kind == 'pizarra':
            items.append(dict(i=leaf_id, t=files[0]['label'], c='General', k=kind, x='folder', f=1, d=d, n=len(files)))
        elif kind == 'solucionario':
            mat = re.search(r'(\d)\s*(?:er|do|ro)\s*material', fold(' '.join(path)))
            course = course_of(*reversed(path[1:]))
            if cyc == '2027-1':
                title = 'Solucionario · Libro 1' if re.search(r'LIBRO 1', leaf, re.I) else clean(pretty(leaf), course)
            else:
                title = 'Solucionario · ' + (f'{mat[1]}.{"er" if mat[1] == "1" else "º"} material' if mat else clean(pretty(leaf), course))
            items.append(dict(i=leaf_id, t=title, c=course, k=kind, e=event_of(leaf), x='folder', f=1, d=d, n=len(files)))
        else:
            course = course_of(leaf)
            items.append(dict(i=leaf_id, t=repaso_title(pretty(leaf), course) if course != 'General' else clean(pretty(leaf)),
                              c=course, k='repaso', e=event_of(leaf), x='folder', f=1, d=d, n=len(files)))

    order = {c: n for n, c in enumerate(COURSES)}
    kind_rank = {k: n for n, k in enumerate(KIND_ORDER)}

    def key(a):
        e = a.get('e') or ''
        third = -int(e[2:]) if a['k'] == 'resultado' and e[2:].isdigit() else (a.get('w') or 99)
        return (order[a['c']], kind_rank[a['k']], third, e, a.get('p') or '', a['t'])
    pdfs = {(it['c'], it['k'], it['t'], it.get('w'), it.get('p')) for it in items if not it['x']}
    items[:] = [it for it in items if not it['x'] or it['x'] not in ('pptx', 'ppt') or (it['c'], it['k'], it['t'], it.get('w'), it.get('p')) not in pdfs]
    for it in items:  # '1.0' is a whole week, not a part
        if it.get('p') in ('0', None):
            it.pop('p', None)
    items.sort(key=key)
    return items


def run(cyc, tree_path=None):
    folder, page = CYCLES[cyc]
    tree = json.load(open(tree_path, encoding='utf-8')) if tree_path else walk(folder, [])
    items = build(tree, cyc)
    dest = ROOT / page / f'materiales-{cyc}.json'
    dest.write_text(json.dumps({'cycle': cyc, 'built': date.today().isoformat(), 'courses': COURSES, 'items': items},
                               ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print(cyc, len(items), 'items ->', dest.name)


if __name__ == '__main__':
    args = sys.argv[1:]
    for c in ([args[0]] if args else CYCLES):
        run(c, args[1] if len(args) > 1 else None)
