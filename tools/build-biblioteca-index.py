"""Build biblioteca/indice.json: the small index /biblioteca loads instead of platform.json.

For every publisher and collection page it keeps the book count, the collections (name, slug, count)
and a few local covers, plus the size of the CEPREUNI archives. Run it after changing
universe-ui/data/platform.json or any biblioteca/<folder>/covers/manifest.json:

    python tools/build-biblioteca-index.py
"""
import json
import re
import unicodedata
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# folder, platform.json key, display name
PUBS = [
    ('universe', 'universe', 'Universe'), ('lumbreras', 'lumbreras', 'Lumbreras'), ('pamer', 'pamer', 'Pamer'),
    ('cuzcano', 'cuzcano', 'Cuzcano'), ('rodo', 'rodo', 'Rodo'), ('sanmarcos', 'sanmarcos', 'San Marcos'),
    ('megabyte', 'megabyte', 'Megabyte'), ('amautas', 'amautas', 'Amautas'), ('manhattan', 'manhattan', 'Manhattan'),
    ('moshera', 'moshera', 'Moshera'), ('trilce', 'trilce', 'Trilce'), ('delta', 'delta', 'Delta'),
    ('rubinos', 'rubinos', 'Rubiños'), ('editoriales', 'editoriales', 'Otras editoriales'),
]
SETS = [
    ('cursos', 'cursos', 'Libros por curso'), ('literatura', 'literatura', 'Literatura'),
    ('librosuniversitarios', 'college', 'Libros universitarios'),
]
# archives that live on their own pages: key, name, url, singular, plural
LINKS = [
    ('examenes', 'Exámenes CEPREUNI', '/cepreuni/examenes', 'examen', 'exámenes'),
    ('materials', 'CEPREUNI 2027-1', '/cepreuni/ciclopre20271', 'archivo', 'archivos'),
]
COVERS_PER_SOURCE = 8
# same courses, order and matching rule as biblioteca/galaxia/catalogo.js (COURSES / TYPES)
COURSES = [
    ('fisica', 'Física'), ('quimica', 'Química'), ('algebra', 'Álgebra'), ('aritmetica', 'Aritmética'),
    ('geometria', 'Geometría'), ('trigonometria', 'Trigonometría'), ('razonamiento matematico', 'R. Matemático'),
    ('razonamiento verbal', 'R. Verbal'), ('lenguaje', 'Lenguaje'), ('literatura', 'Literatura'),
    ('historia', 'Historia'), ('geografia', 'Geografía'), ('economia', 'Economía'), ('biologia', 'Biología'),
    ('anatomia', 'Anatomía'), ('filosofia', 'Filosofía'), ('psicologia', 'Psicología'), ('logica', 'Lógica'),
]
SMALL = {'de', 'del', 'y', 'la', 'el', 'las', 'los', 'en', 'un', 'con', 'por', 'a'}
ACRONYM = {'uni', 'preuni', 'cepreuni', 'unsa', 'uncp', 'unmsm', 'pre', 'ii', 'iii', 'iv'}


def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()


def norm(s):
    return ' ' + re.sub(r'[^a-z0-9ñ]+', ' ', fold(s)).strip() + ' '


def classify(b):
    k = norm(' '.join([b.get('title', ''), b.get('series', '') or '', b.get('section', '') or '']))
    ty = 2 if ' solucionario' in k else 1 if 'problemas resueltos' in k else 0
    course = next((i for i, (c, _) in enumerate(COURSES) if (' ' + c) in k), -1)
    return course, ty


def slugify(s):
    return re.sub(r'^-|-$', '', re.sub(r'[^a-z0-9]+', '-', fold(s)))


def title_case(s):
    # same rule as catalogo.js: only ALL-CAPS names are recased
    if s != s.upper():
        return s
    words = s.lower().split(' ')
    return ' '.join(w.upper() if w in ACRONYM else w if i and w in SMALL else w[:1].upper() + w[1:] for i, w in enumerate(words))


def drive_id(url):
    m = re.search(r'/d/([\w-]+)', url or '')
    return m.group(1) if m else None


def source(folder, key, name, books):
    man_path = ROOT / 'biblioteca' / folder / 'covers' / 'manifest.json'
    man = json.loads(man_path.read_text(encoding='utf-8')) if man_path.exists() else {}
    covers, meta = man.get('covers', {}), man.get('collections', {})
    cols, by_name, picked, extra, n = [], {}, [], [], 0
    mix, rows, seen, cv = {}, [], set(), {}
    for b in books or []:
        if not b or not b.get('url') or b.get('upcoming'):
            continue
        # book id exactly as catalogo.js builds it, so /biblioteca/<folder>/?libro=<id> opens the book
        m = re.search(r'/d/([\w-]+)', b['url']) or re.search(r'[?&]id=([\w-]+)', b['url'])
        bid = (m.group(1) if m else str(n))[:10]
        if bid in seen:
            bid += '-' + str(n)
        seen.add(bid)
        ci, ty = classify(b)
        if ci >= 0:
            mix.setdefault(COURSES[ci][0].replace(' ', '-'), [0, 0, 0])[ty] += 1
        n += 1
        cat = b.get('catalog', '')
        col = by_name.get(cat)
        if not col:
            col = {'name': title_case(cat), 'slug': (meta.get(cat) or {}).get('slug') or slugify(cat), 'n': 0}
            by_name[cat] = col
            cols.append(col)
        col['n'] += 1
        image = b.get('image', '')
        did = drive_id(b['url']) if (b.get('drivePreview') or image.endswith('.svg') or 'drive.google.com/thumbnail' in image) else None
        thumb = covers.get(image) or (did and covers.get(did))
        row_cat = title_case(cat)
        sub = b.get('series') or row_cat
        hay = ' '.join(x for x in (b.get('section'), row_cat, b.get('author')) if x)
        rows.append([b.get('title', ''), sub, hay, bid, ci, ty, thumb['t'] if thumb else ''])
        if thumb and ci >= 0:  # the first book of each course stands in for it in the course picker
            cv.setdefault(COURSES[ci][0].replace(' ', '-'), {'t': thumb['t'], 'c': thumb['c']})
        if not thumb:
            continue
        cover = {'t': thumb['t'], 'c': thumb['c'], 'col': cat}
        # one cover per collection first, so each source shows its range
        if len(picked) < COVERS_PER_SOURCE and all(p['col'] != cat for p in picked):
            picked.append(cover)
        elif len(extra) < COVERS_PER_SOURCE:
            extra.append(cover)
    while len(picked) < COVERS_PER_SOURCE and extra:
        picked.append(extra.pop(0))
    return {
        'folder': folder, 'name': name, 'n': n, 'collections': cols, 'm': mix, 'mc': cv,
        'covers': [{'t': p['t'], 'c': p['c']} for p in picked],
    }, rows


def main():
    data = json.loads((ROOT / 'universe-ui' / 'data' / 'platform.json').read_text(encoding='utf-8'))
    cat = data.get('catalogs', {})
    built = [(source(f, k, n, cat.get(k)), 'p') for f, k, n in PUBS] + [(source(f, k, n, cat.get(k)), 's') for f, k, n in SETS]
    built = [(s, rows, kind) for (s, rows), kind in built if s['n']]
    pubs = [s for s, _, kind in built if kind == 'p']
    sets = [s for s, _, kind in built if kind == 's']
    # search index: folder list + one compact row per book [title, sub, haystack, id, course, type, cover]
    folders = [s['folder'] for s, _, _ in built]
    books = [[i] + r for i, (_, rows, _) in enumerate(built) for r in rows]
    search = {'f': folders, 'courses': [[c.replace(' ', '-'), l] for c, l in COURSES], 'b': books}
    spath = ROOT / 'biblioteca' / 'buscar.json'
    spath.write_text(json.dumps(search, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    print(f'{spath.relative_to(ROOT)}: {len(books)} libros, {spath.stat().st_size} bytes')
    links = []
    for key, name, url, one, many in LINKS:
        books = [b for b in cat.get(key, []) if b and b.get('url') and not b.get('upcoming')]
        pick = [b for b in books if not re.search('resultado', b.get('catalog', '') + ' ' + b.get('title', ''), re.I)]
        ids = [i for i in (drive_id(b['url']) for b in (pick if len(pick) >= 3 else books)) if i][:COVERS_PER_SOURCE]
        if books:
            links.append({'name': name, 'url': url, 'n': len(books), 'one': one, 'many': many, 'drive': ids})
    out = {'updated': date.today().isoformat(), 'courses': search['courses'], 'pubs': pubs, 'sets': sets, 'links': links}
    path = ROOT / 'biblioteca' / 'indice.json'
    path.write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    total = sum(s['n'] for s in pubs + sets)
    print(f'{path.relative_to(ROOT)}: {len(pubs)} editoriales, {len(sets)} colecciones, {total} libros, {path.stat().st_size} bytes')


if __name__ == '__main__':
    main()
