import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const BASE = 'https://puntajes.admision.uni.edu.pe/';
const ROOT = path.resolve('data', 'cepreuni');
const MANIFEST_FILE = path.join(ROOT, 'manifest.json');
const OFFICIAL_FILE = path.resolve('cepre-2026-2-official.js');

const CAREERS = {
  ARQUITECTURA: ['FAUA', 'A1', 'Arquitectura'],
  URBANISMO: ['FAUA', 'A2', 'Urbanismo'],
  'INGENIERIA CIVIL': ['FIC', 'C1', 'Ingeniería Civil'],
  'INGENIERIA MECANICA': ['FIM', 'M3', 'Ingeniería Mecánica'],
  'INGENIERIA MECANICA ELECTRICA': ['FIM', 'M4', 'Ingeniería Mecánica Eléctrica'],
  'INGENIERIA NAVAL': ['FIM', 'M5', 'Ingeniería Naval'],
  'INGENIERIA MECATRONICA': ['FIM', 'M6', 'Ingeniería Mecatrónica'],
  'INGENIERIA AEROESPACIAL': ['FIM', 'M7', 'Ingeniería Aeroespacial'],
  FISICA: ['FC', 'N1', 'Física'],
  MATEMATICA: ['FC', 'N2', 'Matemática'],
  QUIMICA: ['FC', 'N3', 'Química'],
  'INGENIERIA FISICA': ['FC', 'N5', 'Ingeniería Física'],
  'CIENCIA DE LA COMPUTACION': ['FC', 'N6', 'Ciencia de la Computación'],
  'INGENIERIA ELECTRICA': ['FIEE', 'L1', 'Ingeniería Eléctrica'],
  'INGENIERIA ELECTRONICA': ['FIEE', 'L2', 'Ingeniería Electrónica'],
  'INGENIERIA DE TELECOMUNICACIONES': ['FIEE', 'L3', 'Ingeniería de Telecomunicaciones'],
  'INGENIERIA DE CIBERSEGURIDAD': ['FIEE', 'L4', 'Ingeniería de Ciberseguridad'],
  'INGENIERIA BIOMEDICA': ['FIEE', 'L5', 'Ingeniería Biomédica'],
  'INGENIERIA INDUSTRIAL': ['FIIS', 'I1', 'Ingeniería Industrial'],
  'INGENIERIA DE SISTEMAS': ['FIIS', 'I2', 'Ingeniería de Sistemas'],
  'INGENIERIA DE SOFTWARE': ['FIIS', 'I3', 'Ingeniería de Software'],
  'INGENIERIA DE INTELIGENCIA ARTIFICIAL': ['FIIS', 'I4', 'Ingeniería de Inteligencia Artificial'],
  'INGENIERIA GEOLOGICA': ['FIGMM', 'G1', 'Ingeniería Geológica'],
  'INGENIERIA METALURGICA': ['FIGMM', 'G2', 'Ingeniería Metalúrgica'],
  'INGENIERIA DE MINAS': ['FIGMM', 'G3', 'Ingeniería de Minas'],
  'INGENIERIA SANITARIA': ['FIA', 'S1', 'Ingeniería Sanitaria'],
  'INGENIERIA DE HIGIENE Y SEGURIDAD INDUSTRIAL': ['FIA', 'S2', 'Ingeniería de Higiene y Seguridad Industrial'],
  'INGENIERIA AMBIENTAL': ['FIA', 'S3', 'Ingeniería Ambiental'],
  'INGENIERIA ECONOMICA': ['FIEECS', 'E1', 'Ingeniería Económica'],
  'INGENIERIA ESTADISTICA': ['FIEECS', 'E3', 'Ingeniería Estadística'],
  'INGENIERIA QUIMICA': ['FIQT', 'Q1', 'Ingeniería Química'],
  'INGENIERIA TEXTIL': ['FIQT', 'Q2', 'Ingeniería Textil'],
  'INGENIERIA PETROQUIMICA': ['FIP', 'P2', 'Ingeniería Petroquímica'],
  'INGENIERIA DE PETROLEO Y GAS NATURAL': ['FIP', 'P3', 'Ingeniería de Petróleo y Gas Natural']
};

const EXAM_KEYS = ['pc1', 'pc2', 'pc3', 'pc4', 'pc5', 'pc6', 'pc7', 'ep1', 'ep2', 'ef'];

function repairText(value) {
  let text = String(value ?? '');
  for (let i = 0; i < 2 && /Ã.|Â.|â.|ðŸ/.test(text); i += 1) {
    const repaired = Buffer.from(text, 'latin1').toString('utf8');
    if (!repaired.includes('�')) text = repaired;
  }
  return text.normalize('NFC').trim();
}

function plain(value) {
  return repairText(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ').trim();
}

function slug(value) {
  return plain(value).toLowerCase().replace(/\s+/g, '-').replace(/^-|-$/g, '') || 'publicacion';
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function dateFromUrl(url) {
  const match = String(url).match(/(?:^|\D)(20\d{6})(?:\D|$)/);
  return match ? `${match[1].slice(0, 4)}-${match[1].slice(4, 6)}-${match[1].slice(6, 8)}` : null;
}

async function readJson(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return fallback; }
}

async function fetchText(url) {
  const response = await fetch(url, { cache: 'no-store', headers: { 'user-agent': 'UniverseToStudy-CEPRE-Sync/1.0' } });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

function extractObject(source, marker) {
  const startAt = source.indexOf(marker);
  if (startAt < 0) return null;
  const start = source.indexOf('{', startAt);
  let depth = 0, quote = '', escaped = false;
  for (let i = start; i < source.length; i += 1) {
    const char = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'" || char === '`') { quote = char; continue; }
    if (char === '{') depth += 1;
    if (char === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  return null;
}

async function discoverPublications() {
  const indexUrl = new URL('index.html', BASE).href;
  const html = await fetchText(indexUrl);
  const publicationPages = [...html.matchAll(/href=["']([^"']*publicacion=[^"']+)["']/gi)]
    .map((match) => new URL(match[1], indexUrl).href);
  const pages = [indexUrl, ...publicationPages];
  const scriptUrls = [];
  for (const pageUrl of pages) {
    const page = pageUrl === indexUrl ? html : await fetchText(pageUrl);
    for (const match of page.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)) {
      const url = new URL(match[1], pageUrl).href;
      if (/publica|app-/i.test(url) && !scriptUrls.includes(url)) scriptUrls.push(url);
    }
    if (scriptUrls.length) break;
  }
  let publications = null;
  for (const url of scriptUrls) {
    const source = await fetchText(url);
    const literal = extractObject(source, 'const publications');
    if (!literal) continue;
    publications = vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 1000 });
    break;
  }
  if (!publications) throw new Error('No se encontró el catálogo de publicaciones de la UNI.');
  return Object.entries(publications)
    .filter(([key, item]) => /CEPRE/i.test([key, item.name, item.description, item.campus].join(' ')))
    .map(([key, item]) => ({
      key: slug(key),
      title: repairText(item.name || key),
      campus: repairText(item.campus || ''),
      url: new URL(String(item.file || '').split('?')[0], BASE).href
    }));
}

function siteOf(publication) {
  const text = plain(`${publication.key} ${publication.title} ${publication.campus} ${publication.url}`);
  if (text.includes('JULIACA')) return 'Juliaca';
  if (text.includes('LIMA')) return 'Lima';
  return '';
}

function kindOf(publication) {
  const text = plain(`${publication.key} ${publication.title} ${publication.url}`);
  if (text.includes('VACANTE') || text.includes('ASIGNACION')) return 'assignment';
  const numberedPc = text.match(/\b(?:PC|PRUEBA CALIFICADA)\s*(?:NRO\s*)?([1-7])\b|\b([1-7])\s*(?:RA|DA|TA|MA)?\s*(?:PC|PRUEBA CALIFICADA)\b/);
  if (numberedPc) return `pc${numberedPc[1] || numberedPc[2]}`;
  const namedPc = ['PRIMERA', 'SEGUNDA', 'TERCERA', 'CUARTA', 'QUINTA', 'SEXTA', 'SEPTIMA'].findIndex((name) => text.includes(`${name} PRUEBA CALIFICADA`));
  if (namedPc >= 0) return `pc${namedPc + 1}`;
  if (/\bEP\s*1\b|PRIMER EXAMEN PARCIAL/.test(text)) return 'ep1';
  if (/\bEP\s*2\b|SEGUNDO EXAMEN PARCIAL/.test(text)) return 'ep2';
  if (text.includes('EXAMEN FINAL')) return 'ef';
  return 'archive';
}

function parsePreviousOfficial() {
  return fs.readFile(OFFICIAL_FILE, 'utf8').then((source) => {
    const match = source.match(/var data=(\{.*\});\s*\n\s*window\.UNIVERSE_CEPRE_2026_2/s);
    return match ? JSON.parse(match[1]) : {};
  }).catch(() => ({}));
}

function suffixLookup(rankingRows) {
  const map = new Map();
  for (const row of rankingRows) {
    const code = String(row[1] || '').toUpperCase();
    for (const length of [code.length, 6, 7]) {
      const suffix = code.slice(-length);
      if (!map.has(suffix)) map.set(suffix, code);
      else if (map.get(suffix) !== code) map.set(suffix, null);
    }
  }
  return map;
}

function fullCode(value, lookup) {
  const raw = repairText(value).toUpperCase().replace(/[^A-Z0-9]/g, '');
  return lookup.get(raw) || (lookup.has(raw) ? null : raw);
}

function statsFor(scores) {
  const entries = Object.entries(scores).filter(([, value]) => Number.isFinite(Number(value)) && Number(value) > 0);
  const values = entries.map(([, value]) => Number(value)).sort((a, b) => a - b);
  if (!values.length) return { registered: 0, average: null, minimum: null, maximum: null, median: null, deviation: null, topCodes: [] };
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length;
  const maximum = values.at(-1);
  return {
    registered: values.length,
    average: Number(average.toFixed(3)),
    minimum: values[0],
    maximum,
    median: Number((values.length % 2 ? values[(values.length - 1) / 2] : (values[values.length / 2 - 1] + values[values.length / 2]) / 2).toFixed(3)),
    deviation: Number(Math.sqrt(variance).toFixed(3)),
    topCodes: entries.filter(([, value]) => Number(value) === maximum).map(([code]) => code).sort()
  };
}

const rankingSource = await fs.readFile('ranking.html', 'utf8');
const rankingMatch = rankingSource.match(/<script id="cepre2026-ranking-data" type="application\/json">([\s\S]*?)<\/script>/);
if (!rankingMatch) throw new Error('No se encontró la base del ranking CEPREUNI.');
const rankingRows = JSON.parse(rankingMatch[1]);
const codeLookup = suffixLookup(rankingRows);
const previous = await parsePreviousOfficial();
const previousManifest = await readJson(MANIFEST_FILE, { publications: [] });
const previousByKey = new Map((previousManifest.publications || []).map((item) => [item.key, item]));
const discovered = await discoverPublications();
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const downloaded = [];

await fs.mkdir(path.join(ROOT, 'current'), { recursive: true });
for (const publication of discovered) {
  const text = await fetchText(publication.url);
  let rows;
  try { rows = JSON.parse(text); } catch { throw new Error(`${publication.url} no contiene JSON válido.`); }
  if (!Array.isArray(rows) || !rows.length || !rows.every((row) => row && typeof row === 'object')) {
    throw new Error(`${publication.url} no contiene una lista de resultados válida.`);
  }
  const normalized = rows.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, typeof value === 'string' ? repairText(value) : value])));
  const content = stableJson(normalized);
  const hash = sha256(content);
  const kind = kindOf(publication);
  const old = previousByKey.get(publication.key);
  const sourceDate = dateFromUrl(publication.url);
  const unchanged = old?.sha256 === hash;
  const originalPublished = unchanged && old.firstSeen === old.lastChanged && sourceDate ? sourceDate : old?.lastChanged;
  const record = {
    key: publication.key,
    title: publication.title,
    campus: publication.campus,
    site: siteOf(publication),
    kind,
    url: publication.url,
    sha256: hash,
    rows: normalized.length,
    firstSeen: old?.firstSeen && old.firstSeen <= today ? old.firstSeen : today,
    lastChanged: unchanged ? (originalPublished || sourceDate || today) : (old ? today : (sourceDate || today))
  };
  await fs.writeFile(path.join(ROOT, 'current', `${publication.key}.json`), content, 'utf8');
  if (!old || old.sha256 !== hash) {
    const historyDir = path.join(ROOT, 'history', today);
    await fs.mkdir(historyDir, { recursive: true });
    await fs.writeFile(path.join(historyDir, `${publication.key}-${hash.slice(0, 12)}.json`), content, 'utf8');
  }
  downloaded.push({ publication: record, rows: normalized });
}

const examScores = Object.fromEntries(EXAM_KEYS.map((key) => [key, { ...(previous.examScores?.[key] || {}) }]));
Object.assign(examScores.ef, previous.finalScores || {});
for (const { publication, rows } of downloaded) {
  if (!EXAM_KEYS.includes(publication.kind)) continue;
  const seen = new Set();
  for (const row of rows) {
    const code = fullCode(row.codigo ?? row.cod ?? row.codigo_postulante, codeLookup);
    const score = Number(row.nota ?? row.puntaje ?? row.score);
    if (!code || !codeLookup.has(code) || seen.has(code) || !Number.isFinite(score) || score < 0 || score > 150) {
      throw new Error(`Registro inválido o duplicado en ${publication.key}: ${code || 'sin código'}.`);
    }
    seen.add(code);
    examScores[publication.kind][code] = score;
  }
}

const assignments = downloaded.filter(({ publication }) => publication.kind === 'assignment');
let entrants = previous.entrants || [], ranges = previous.ranges || {}, evaluated = previous.evaluated || {}, entrantCount = previous.entrantCount || {};
if (assignments.length) {
  const all = assignments.flatMap(({ publication, rows }) => rows.map((row) => ({ ...row, sede: publication.site })));
  entrants = all.filter((row) => repairText(row.especialidad_ingreso)).map((row) => {
    const code = fullCode(row.codigo, codeLookup);
    const career = CAREERS[plain(row.especialidad_ingreso)];
    if (!code || !career) throw new Error(`No se pudo vincular el registro ${row.codigo} / ${row.especialidad_ingreso}.`);
    const total = Number(row.puntaje);
    const divisor = career[1] === 'A1' ? 185.05 : 135;
    return { codigo: code, nombres: repairText(row.nombres), puntaje: total, puntaje20: Number((total / divisor).toFixed(3)), examenFinal: examScores.ef[code] ?? null, especialidad: career[2], codigoEspecialidad: career[1], facultad: career[0], sede: row.sede };
  }).sort((a, b) => b.puntaje - a.puntaje || a.nombres.localeCompare(b.nombres, 'es'));
  ranges = {};
  for (const site of ['Lima', 'Juliaca']) {
    ranges[site] = Object.values(CAREERS).map(([faculty, code, name]) => {
      const scores = entrants.filter((row) => row.sede === site && row.codigoEspecialidad === code).map((row) => row.puntaje20).sort((a, b) => a - b);
      return [faculty, code, name, scores[0] ?? null, scores.at(-1) ?? null, scores.length, null];
    });
  }
  evaluated = { total: all.length, Lima: all.filter((row) => row.sede === 'Lima').length, Juliaca: all.filter((row) => row.sede === 'Juliaca').length };
  entrantCount = { total: entrants.length, Lima: entrants.filter((row) => row.sede === 'Lima').length, Juliaca: entrants.filter((row) => row.sede === 'Juliaca').length };
}

const statistics = Object.fromEntries(EXAM_KEYS.map((key) => [key, statsFor(examScores[key])]));
const published = downloaded.map(({ publication }) => publication.lastChanged).sort().at(-1) || previous.published || today;
const data = { cycle: previous.cycle || '2026-2', published, source: BASE + 'index.html', evaluated, entrantCount, finalScores: examScores.ef, examScores, statistics, entrants, ranges };
const cutoffValues = Object.fromEntries(Object.entries(ranges).map(([site, rows]) => [site, Object.fromEntries(rows.map((row) => [row[1], [row[3], row[4]]]))]));
const output = `/* Datos públicos CEPRE-UNI. Generado automáticamente; no usa IA. */\n(function(){\n  'use strict';\n  var data=${JSON.stringify(data)};\n  window.UNIVERSE_CEPRE_2026_2=data;\n  window.UNIVERSE_CEPRE_CUTOFFS=window.UNIVERSE_CEPRE_CUTOFFS||{};\n  window.UNIVERSE_CEPRE_CUTOFFS['2026-2|Lima']={label:'2026-2 · Lima',source:'Resultados oficiales CEPRE-UNI 2026-2',values:${JSON.stringify(cutoffValues.Lima || {})}};\n  window.UNIVERSE_CEPRE_CUTOFFS['2026-2|Juliaca']={label:'2026-2 · Juliaca',source:'Resultados oficiales CEPRE-UNI 2026-2',values:${JSON.stringify(cutoffValues.Juliaca || {})}};\n})();\n`;

await fs.writeFile(OFFICIAL_FILE, output, 'utf8');
await fs.writeFile(MANIFEST_FILE, stableJson({ version: 1, source: BASE + 'index.html', publications: downloaded.map(({ publication }) => publication).sort((a, b) => a.key.localeCompare(b.key)) }), 'utf8');

console.log(JSON.stringify({ publications: downloaded.length, archivedChanges: downloaded.filter(({ publication }) => previousByKey.get(publication.key)?.sha256 !== publication.sha256).length, exams: Object.fromEntries(EXAM_KEYS.map((key) => [key, statistics[key].registered])), entrants: entrantCount }, null, 2));
