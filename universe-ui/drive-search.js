// DRIVE UNIVERSE: local search over data/drive-index.json (built by scripts/index-drive.mjs).
// The index is fetched once, normalized once, and every query runs in memory: no Drive calls.
const INDEX_URL = '/universe-ui/data/drive-index.json';
let files = null, loading = null, meta = null;

// "ÁLGEBRA – CEPREUNI (2026-2).pdf" -> "algebra cepreuni 2026 2 pdf"
export const normalize = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9ñ]+/g, ' ').trim();
// Folder names carry decorative prefixes ("🏫 | UNIVERSIDADES"); keep only the words for display.
const cleanFolder = s => s.replace(/^[^\p{L}\p{N}]*\|\s*/u, '').replace(/^[^\p{L}\p{N}]+/u, '').trim() || s;

export function loadDrive() {
  if (files) return Promise.resolve(files);
  if (!loading) loading = fetch(INDEX_URL).then(r => r.json()).then(d => {
    meta = { generatedAt: d.generatedAt, total: d.totalFiles };
    const paths = d.paths.map(p => { const parts = p ? p.split(' › ').map(cleanFolder) : []; return { label: parts.join(' › '), norm: normalize(parts.join(' ')) }; });
    files = d.files.map(([name, id, pi, kind]) => {
      const ext = (name.match(/\.([a-z0-9]{1,5})$/i) || [])[1]?.toLowerCase() || '';
      return {
        name, title: ext ? name.slice(0, -ext.length - 1) : name, ext,
        url: kind ? `https://docs.google.com/${kind}/d/${id}/edit` : `https://drive.google.com/file/d/${id}/view`,
        type: kind ? { document: 'doc', spreadsheets: 'sheet', presentation: 'slides', forms: 'form' }[kind] : ext,
        path: paths[pi].label, n: ' ' + normalize(name) + ' ', p: ' ' + paths[pi].norm + ' '
      };
    });
    return files;
  }).catch(e => { loading = null; throw e; });
  return loading;
}
export const driveMeta = () => meta;

// Abbreviations students type vs. how files are named. Each alternative is a list of words that
// must all be present ("1ep" also finds "1er examen parcial" and "parcial 1").
const ORD = ['', 'primer', 'segund', 'tercer', 'cuart', 'quint', 'sext', 'septim'];
function alternatives(token) {
  const alts = [[token]];
  let m;
  if ((m = token.match(/^(\d)(pc|ep|ef)$/))) {
    const [, d, k] = m, ord = ORD[+d] || d;
    if (k === 'pc') alts.push([d, 'pc'], [ord, 'pc'], [d, 'practica'], [ord, 'practica']);
    if (k === 'ep') alts.push([d, 'parcial'], [ord, 'parcial']);
    if (k === 'ef') alts.push(['final']);
  }
  if (token === 'pc') alts.push(['practica calificada']);
  if (token === 'parcial') alts.push(['ep']);
  if (token.length > 4) alts.push([token.replace(/(es|s)$/, '')]);
  return alts;
}
// Word-start matches (" quim") count more than matches in the middle of a word.
function find(field, words) {
  let score = 0;
  for (const w of words) {
    const i = field.indexOf(w);
    if (i < 0) return 0;
    score += field[i - 1] === ' ' ? 2 : 1;
  }
  return score;
}

export function searchDrive(query) {
  if (!files) return { hits: [], similar: false };
  const q = normalize(query);
  const tokens = q.split(' ').filter(t => t.length > 1 || /\d/.test(t));
  if (!tokens.length) return { hits: [], similar: false };
  const alts = tokens.map(alternatives);
  const scored = [];
  for (const f of files) {
    let inName = 0, inPath = 0, score = 0;
    for (const options of alts) {
      let best = 0, where = 0;
      for (const words of options) {
        const n = find(f.n, words);
        if (n * 5 > best) { best = n * 5; where = 1; }
        const p = find(f.p, words);
        if (p > best) { best = p; where = 2; }
      }
      if (where === 1) inName++; else if (where === 2) inPath++;
      score += best;
    }
    const matched = inName + inPath;
    if (!matched) continue;
    const title = f.n.trim();
    if (title === q || normalize(f.title) === q) score += 100;          // 1. exact name
    else if (title.startsWith(q)) score += 40;                           // 2. name starts with the query
    if (inName === tokens.length) score += 25;                           // 3. every word in the name
    score += matched * 30 - title.length / 40;                           // 4/5. more words first, name over path
    scored.push({ f, matched, score });
  }
  // All words first; if nothing has them all, show the closest files as "similares".
  let need = tokens.length, hits = [];
  while (need > 0 && !(hits = scored.filter(x => x.matched >= need)).length) need--;
  hits.sort((a, b) => b.score - a.score);
  return { hits: hits.map(x => x.f), similar: need < tokens.length };
}

export function fileIcon(type) {
  if (type === 'pdf') return 'pdf';
  if (['doc', 'docx', 'odt', 'rtf', 'txt'].includes(type)) return 'doc';
  if (['ppt', 'pptx', 'pps', 'ppsx', 'slides', 'key'].includes(type)) return 'slides';
  if (['xls', 'xlsx', 'csv', 'sheet'].includes(type)) return 'sheet';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'heic'].includes(type)) return 'image';
  if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'mp3', 'm4a', 'wav'].includes(type)) return 'media';
  if (['zip', 'rar', '7z'].includes(type)) return 'zip';
  return 'file';
}
