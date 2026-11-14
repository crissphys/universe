"""Builds the /resumenes catalog from Drive download zips, using ONLY the file paths (never the content).

    python tools/build-resumenes.py "<zip 1>" "<zip 2>" ...

Writes resumenes/data/catalogo.json (public list) and tools/resumenes-manifest.json (id -> zip + path,
used by tools/upload-resumenes.mjs to copy each original file to R2).

Rules (simple and explicit):
  * "Copia de " is dropped from every name; "(1)" copies with the same size are dropped as duplicates.
  * Only PDF, JPG/JPEG, PNG and WebP are kept (audio and files without a known extension are skipped).
  * Course = the course the file name starts with ("Resumen - Geografía"), else the course of its Drive folder.
  * Topic = first topic in resumenes/data/temas.json whose keywords appear in the name (same course first).
  * Type (Apuntes, Ficha, Mapa, Formulario...) = the name prefix before " - ", else a folder hint.
  * Author = an @handle or a known author in the name, else the "@handle" / "- Name" of its subfolder.
"""
import hashlib, json, re, sys, unicodedata, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMAS = json.loads((ROOT / 'resumenes/data/temas.json').read_text(encoding='utf-8'))
EXTS = {'pdf': 'pdf', 'jpg': 'jpg', 'jpeg': 'jpg', 'png': 'png', 'webp': 'webp'}

def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()

# Drive folder -> course (checked in order, on the normalized folder name)
FOLDER_COURSES = [
    ('quimica 1', 'Química'), ('fisica 1', 'Física'), ('calculo diferencial', 'Cálculo Diferencial'),
    ('algebra lineal', 'Álgebra Lineal'), ('introduccion a la computacion', 'Computación'),
    ('filosofia', 'Filosofía'), ('civica', 'Educación Cívica'), ('literatura', 'Literatura'),
    ('algebra', 'Álgebra'), ('aritmetica', 'Aritmética'), ('biologia', 'Biología'), ('historia', 'Historia'),
    ('lenguaje', 'Lenguaje'), ('economia', 'Economía'), ('geometria', 'Geometría'),
    ('trigonometria', 'Trigonometría'), ('ingles', 'Inglés'), ('geografia', 'Geografía'),
    ('razonamiento verbal', 'Razonamiento Verbal'), ('arquitectura', 'Arquitectura'), ('anatomia', 'Anatomía'),
    ('psicologia', 'Psicología'), ('quimica', 'Química'), ('fisica', 'Física'),
]
# A title that STARTS with one of these names belongs to that course, whatever folder it sits in.
TITLE_COURSES = [
    ('educacion civica', 'Educación Cívica'), ('algebra lineal', 'Álgebra Lineal'), ('english', 'Inglés'),
    ('razonamiento verbal', 'Razonamiento Verbal'),
] + [(k, v) for k, v in FOLDER_COURSES if ' ' not in k]
TITLE_COURSE_EXCEPTIONS = ('geometria molecular',)

TYPES = {
    'digital': 'Digital', 'apuntes': 'Apuntes', 'apunte': 'Apuntes', 'ficha': 'Ficha', 'chuleta': 'Chuleta',
    'presentacion': 'Presentación', 'mapa': 'Mapa', 'mapas': 'Mapa', 'formulario': 'Formulario',
    'infografia': 'Infografía', 'flashcard': 'Flashcards', 'flashcards': 'Flashcards', 'resumen': 'Resumen',
    'documento': 'Documento', 'libro': 'Libro', 'folleto': 'Folleto', 'tabla': 'Tabla', 'tablas': 'Tabla',
    'pizarra': 'Pizarra', 'pizarras': 'Pizarra',
}
FOLDER_TYPES = [('pizarras', 'Pizarra'), ('chuletas', 'Chuleta'), ('ppts', 'Presentación'), ('infografias', 'Infografía'),
                ('mapas conceptuales', 'Mapa'), ('formularios', 'Formulario'), ('apuntes', 'Apuntes'), ('laminas', 'Lámina'),
                ('flashcards', 'Flashcards'), ('unidad didactica', 'Unidad didáctica'), ('sintesis teorica', 'Síntesis teórica')]
# Parenthesised or trailing names that are authors/sources, not content.
KNOWN_AUTHORS = {
    'criss': 'Criss Vásquez', 'criss vasquez': 'Criss Vásquez', 'criss v3': 'Criss Vásquez', 'luhana': 'Luhana Belén',
    'savia': 'SAVIA', 'nueva era estudiantil': 'Nueva Era Estudiantil', 'fisica con carlitos': 'Física con Carlitos',
    'proyectphysicapro': 'ProyectPhysicaPro', 'superacademy': 'SuperAcademy', 'busho resumen': 'Búho Resumen',
    'buho resumen': 'Búho Resumen', 'armando cruz': 'Armando Cruz', 'dante rodriguez': 'Dante Rodríguez',
    'editorial isabel': 'Editorial Isabel', 'elio pariona quispe': 'Elio Pariona', 'elio pariona': 'Elio Pariona',
    'bookmaster': 'BookMaster', 'sepremat': 'SEPREMAT', 'raimondi': 'Raimondi', 'aduni': 'ADUNI',
    'by elias': 'Elias', 'christian william caballero huarcaya': 'Christian Caballero', 'la biologia te hara libre': 'La biología te hará libre',
}
ACRONYMS = {'mru', 'mruv', 'mrua', 'mcu', 'mcuv', 'mcl', 'mvcl', 'mpcl', 'mas', 'pbi', 'atp', 'adn', 'arn', 'sars', 'cov',
            'uni', 'cepreuni', 'ien', 'pc', 'sm', 'si', 'ft', 'rv', 'mcd', 'mcm', 'u12', 'ii', 'iii', 'iv', 'v', 'vi', 'vii',
            'viii', 'ix', 'x', 'xi', 'xii', 'xix', 'xx', 'xxi', 'ee', 'uu', 'aduni', 'savia', 'presm', 'keq'}
SMALL = {'de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'o', 'u', 'en', 'a', 'al', 'con', 'por', 'para', 'sin'}

def sentence_case(s):
    letters = [c for c in s if c.isalpha()]
    if not letters or sum(c.isupper() for c in letters) / len(letters) < 0.7:
        return s
    out = []
    ws = s.lower().split(' ')
    for i, w in enumerate(ws):
        bare = norm(w)
        if bare in ACRONYMS or re.fullmatch(r'[ivx]+', bare or '-') and (bare != 'i' or i == len(ws) - 1):
            w = w.upper()
        elif i == 0:
            w = w[:1].upper() + w[1:]
        out.append(w)
    return ' '.join(out)

def folder_author(folder):
    m = re.search(r'@([\w.]+(?: [A-Z][a-záéíóú]+)?)', folder)
    if m:
        return 'Criss Vásquez' if norm(m.group(1)).startswith('criss') else '@' + m.group(1)
    for k, v in KNOWN_AUTHORS.items():
        if re.search(r'\b' + k + r'\b', norm(folder)):
            return v
    m = re.search(r' - ([^-()]+?)(?: \(.*\))?$', folder)
    if m and len(m.group(1).split()) in (2, 3) and m.group(1).istitle() and not re.search(r'\d|versi', m.group(1), flags=re.I):
        return m.group(1).strip()
    return ''

GENERIC = re.compile(r'^(img[- ]?\d+[- ]?wa\d+|camscanner.*|\d+ sin titulo.*|sin titulo.*|\d+|whatsapp image.*|chuleta \d+|problema.*)$')

def clean_name(raw):
    """-> (title, tipo, author) from a bare file name without extension."""
    name = re.sub(r'^(copia de\s+)+', '', raw, flags=re.I)
    name = re.sub(r'\s*\(\d\)\s*$', '', name)              # "(1)" duplicate marker
    author = ''
    m = re.search(r'@([\w.]+)', name)
    if m:
        author = '@' + m.group(1).rstrip('._')
        if norm(author).startswith('criss'):
            author = 'Criss Vásquez'
        name = (name[:m.start()] + name[m.end():])
    name = re.sub(r'^\d{6,}-', '', name)                    # "869630712-RESUMENES-..." (Scribd id)
    if ' ' not in name.strip():
        name = name.replace('-', ' ')                       # "lectura-n2-resumen-russell..."
    name = re.sub(r'(?i)^lectura n\s?(\d+)\.?\s*(resumen\.?\s*)?', r'Lectura \1 · ', name)
    name = name.replace('_', ' ').replace('—', '-').replace('–', '-')
    for pm in list(re.finditer(r'\(([^()]*)\)', name)):
        key = norm(pm.group(1))
        if key in KNOWN_AUTHORS:
            author = author or KNOWN_AUTHORS[key]
            name = name.replace(pm.group(0), ' ')
    for key, val in KNOWN_AUTHORS.items():                 # trailing "SAVIA", "Editorial Isabel", "By Elias"...
        tail = re.search(r'[\s-]+' + r'\s+'.join(key.split()) + r'\s*$', name, flags=re.I)
        if tail and norm(tail.group(0)) == key:
            author = author or val
            name = name[:tail.start()]
    tipo = ''
    m = re.match(r'^\s*([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\s*(?:\([^)]*\))?\s+-\s+(.+)$', name)
    if m and norm(m.group(1)) in TYPES:
        tipo, name = TYPES[norm(m.group(1))], m.group(2)
    name = re.sub(r'^\s*(tema\s+\d+|s\d+|semana\s+\d+(?:\s*y\s*\d+)?)\s*-\s*', '', name, flags=re.I) if not re.fullmatch(r'\s*semana[\s\dy-]*', name, flags=re.I) else name
    name = re.sub(r'(?i)^\s*tema\s+\d+\s+', '', name)
    name = re.sub(r'^\s*\d+(?:\s*y\s*\d+)?(?:\.\d+)?\s*[.)]\s*(?=\D)', '', name)  # leading "13. ", "7 y 8. " (not "13 Colonias")
    name = re.sub(r'\s{2,}', ' ', name).strip(' -.,')
    if not tipo and re.search(r'\bformulario\b', name, flags=re.I):
        tipo = 'Formulario'
    name = sentence_case(name.replace('c2bf', '¿'))
    name = re.sub(r'(^|· |\. )([a-záéíóúñ])', lambda m: m.group(1) + m.group(2).upper(), name)
    return name, tipo, author

def pick_topic(text, course):
    n = ' ' + norm(text) + ' '
    best = None
    for t in TEMAS['temas']:
        hit = max((len(k) for k in t['claves'] if ' ' + k + ' ' in n), default=0)
        if not hit:
            continue
        if course and t['curso'] != course and not any(course in g and t['curso'] in g for g in RELATED):
            continue
        score = hit + (100 if t['curso'] == course else 0)
        if not best or score > best[0]:
            best = (score, t)
    return best[1]['tema'] if best else ''

# Topics may cross between these courses only (a biology board can hold an anatomy topic).
RELATED = [{'Biología', 'Anatomía'}, {'Álgebra', 'Aritmética', 'Geometría', 'Trigonometría', 'Cálculo Diferencial', 'Álgebra Lineal'}]

def course_from_folders(parts):
    for folder in reversed(parts):
        n = norm(folder)
        for key, course in FOLDER_COURSES:
            if re.search(r'\b' + key + r'\b', n):
                return course, folder
    return '', ''

def main(zips):
    rows, manifest, seen = [], {}, {}
    skipped = []
    for zpath in zips:
        with zipfile.ZipFile(zpath) as z:
            for info in z.infolist():
                if info.is_dir():
                    continue
                parts = info.filename.split('/')
                base = parts[-1]
                stem, _, ext = base.rpartition('.')
                ext = EXTS.get(ext.lower())
                if not stem or not ext:
                    skipped.append(info.filename)
                    continue
                folders = parts[1:-1]
                title, tipo, author = clean_name(stem)
                course, course_folder = course_from_folders(folders)
                n_title = norm(title)
                for key, c in TITLE_COURSES:
                    if (n_title + ' ').startswith(key + ' ') and not n_title.startswith(TITLE_COURSE_EXCEPTIONS):
                        course = c
                        break
                if not course:
                    course = next((t['curso'] for t in TEMAS['temas'] if pick_topic(title, '') == t['tema']), 'General')
                sub = folders[-1] if folders and folders[-1] != course_folder else ''
                author = author or folder_author(sub) or folder_author(course_folder)
                nfold = norm('/'.join(folders))
                if not tipo:
                    tipo = next((v for k, v in FOLDER_TYPES if k in nfold), 'Resumen')
                level = 'uni' if 'universitarios' in norm(folders[0] if folders else '') and 'pre' not in norm(folders[0]) else 'pre'
                year = re.search(r'\b(20[12]\d)(?:\s*-\s*(?:[12]|i{1,2}))?\b', stem, flags=re.I)
                generic = not n_title or GENERIC.match(n_title) or re.fullmatch(r'(semana|sesion|semanas)\s*[\d\s y-]*', n_title)
                if generic:
                    label = re.sub(r'\s*\(.*?\)|@[\w.]+', '', sub).strip(' -') if sub else ''
                    label = sentence_case(re.sub(r'^(resumenes|resumen|apuntes)\s+', '', label, flags=re.I)) if label and norm(label) != norm(course) else ''
                    tail = title if re.match(r'(?i)(semana|sesi)', title) else ''
                    title = ' · '.join(x for x in (course, label, tail) if x) or course
                topic = pick_topic(stem + ' ' + sub, course)
                # duplicates: same folder + same clean name + same size (Drive "(1)" copies, "Copia de")
                dkey = (norm(stem.replace('Copia de ', '')).replace(' 1', ''), info.file_size)
                if dkey in seen:
                    continue
                seen[dkey] = True
                rid = 'b' + hashlib.sha1(info.filename.encode('utf-8')).hexdigest()[:9]
                rows.append({'id': rid, 't': title, 'c': course, 'm': topic, 'k': tipo, 'a': author, 'e': ext,
                             's': info.file_size, 'n': level, 'y': int(year.group(1)) if year else None,
                             'g': bool(generic), 'f': re.sub(r'^(copia de\s+)+', '', base, flags=re.I)})
                thumb = ROOT / 'resumenes/thumbs' / f'{rid}.webp'
                if thumb.exists():  # preview made by tools/make-resumenes-thumbs.py, already cut to its ratio
                    from PIL import Image
                    with Image.open(thumb) as im:
                        w, h = im.size
                    rows[-1]['p'] = 1
                    rows[-1]['r'] = '%d:%d' % (w, h)  # exact proportions of the preview
                manifest[rid] = [Path(zpath).name, info.filename]
    # Same file saved twice under different names (same size and format): keep one copy, preferring the one
    # that names its author, then a known topic, then a real title over a generic "Curso · Carpeta N".
    best = {}
    for r in rows:
        k = (r['s'], r['e'])
        score = (bool(r['a']), bool(r['m']), not r['g'], -len(r['t']))
        if k not in best or score > best[k][0]:
            best[k] = (score, r['id'])
    dropped = [r for r in rows if best[(r['s'], r['e'])][1] != r['id']]
    keep = {i for _, i in best.values()}
    rows = [r for r in rows if r['id'] in keep]
    for r in dropped:
        manifest.pop(r['id'], None)
    # number generic titles that collide ("Biología · Pizarras virtuales" x108)
    counts, idx = {}, {}
    for r in rows:
        if r.pop('g'):
            counts[r['t']] = counts.get(r['t'], 0) + 1
    rows.sort(key=lambda r: (r['c'], r['t'], r['f']))
    for r in rows:
        if counts.get(r['t'], 0) > 1:
            idx[r['t']] = idx.get(r['t'], 0) + 1
            r['t'] = f"{r['t']} {idx[r['t']]}"
    for r in rows:
        if not r['y']:
            del r['y']
        if not r['a']:
            del r['a']
        if not r['m']:
            del r['m']
    write_sitemap(rows)
    out = ROOT / 'resumenes/data/catalogo.json'
    out.write_text(json.dumps(rows, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    (ROOT / 'tools/resumenes-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=0), encoding='utf-8')
    print(f'{len(rows)} resúmenes -> {out.relative_to(ROOT)}; {len(skipped)} omitidos (formato no admitido):')
    for s in skipped:
        print('  -', s)

def slug(s):
    # same as slug() in resumenes/assets/shared.js
    return '-'.join(norm(s).split(' '))[:70].rstrip('-') or 'resumen'

def write_sitemap(rows):
    """resumenes/sitemap.xml: list, courses, topics, authors and every summary page (listed in robots.txt)."""
    import datetime
    site = 'https://universetostudy.com'
    today = datetime.date.today().isoformat()
    paths = ['/resumenes']
    paths += sorted({'/resumenes/curso/' + slug(r['c']) for r in rows})
    paths += sorted({'/resumenes/tema/' + slug(r['m']) for r in rows if r.get('m')})
    authors = {}
    for r in rows:
        if r.get('a'):
            authors[r['a']] = authors.get(r['a'], 0) + 1
    paths += sorted('/resumenes/autor/' + slug(a) for a, n in authors.items() if n >= 2)
    paths += ['/resumenes/' + slug(r['t']) + '-' + r['id'] for r in rows]
    body = ''.join(f'  <url><loc>{site}{p}</loc><lastmod>{today}</lastmod></url>\n' for p in paths)
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + '</urlset>\n'
    (ROOT / 'resumenes/sitemap.xml').write_text(xml, encoding='utf-8')

if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
