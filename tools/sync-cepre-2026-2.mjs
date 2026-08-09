import fs from 'node:fs/promises';

const BASE = 'https://puntajes.admision.uni.edu.pe/';
const SOURCES = {
  finalLima: 'resultados-examen-final-lima-20260803.json',
  finalJuliaca: 'resultados-examen-final-juliaca-20260803.json',
  vacantesLima: 'asignacion-vacantes-lima-20260803.json',
  vacantesJuliaca: 'asignacion-vacantes-juliaca-20260803.json'
};

const CAREERS = {
  'ARQUITECTURA': ['FAUA', 'A1', 'Arquitectura'],
  'URBANISMO': ['FAUA', 'A2', 'Urbanismo'],
  'INGENIERÍA CIVIL': ['FIC', 'C1', 'Ingeniería Civil'],
  'INGENIERÍA MECÁNICA': ['FIM', 'M3', 'Ingeniería Mecánica'],
  'INGENIERÍA MECÁNICA-ELÉCTRICA': ['FIM', 'M4', 'Ingeniería Mecánica Eléctrica'],
  'INGENIERÍA NAVAL': ['FIM', 'M5', 'Ingeniería Naval'],
  'INGENIERÍA MECATRÓNICA': ['FIM', 'M6', 'Ingeniería Mecatrónica'],
  'INGENIERÍA AEROESPACIAL': ['FIM', 'M7', 'Ingeniería Aeroespacial'],
  'FÍSICA': ['FC', 'N1', 'Física'],
  'MATEMÁTICA': ['FC', 'N2', 'Matemática'],
  'QUÍMICA': ['FC', 'N3', 'Química'],
  'INGENIERÍA FÍSICA': ['FC', 'N5', 'Ingeniería Física'],
  'CIENCIA DE LA COMPUTACIÓN': ['FC', 'N6', 'Ciencia de la Computación'],
  'INGENIERÍA ELÉCTRICA': ['FIEE', 'L1', 'Ingeniería Eléctrica'],
  'INGENIERÍA ELECTRÓNICA': ['FIEE', 'L2', 'Ingeniería Electrónica'],
  'INGENIERÍA DE TELECOMUNICACIONES': ['FIEE', 'L3', 'Ingeniería de Telecomunicaciones'],
  'INGENIERÍA DE CIBERSEGURIDAD': ['FIEE', 'L4', 'Ingeniería de Ciberseguridad'],
  'INGENIERÍA BIOMÉDICA': ['FIEE', 'L5', 'Ingeniería Biomédica'],
  'INGENIERÍA INDUSTRIAL': ['FIIS', 'I1', 'Ingeniería Industrial'],
  'INGENIERÍA DE SISTEMAS': ['FIIS', 'I2', 'Ingeniería de Sistemas'],
  'INGENIERÍA DE SOFTWARE': ['FIIS', 'I3', 'Ingeniería de Software'],
  'INGENIERÍA DE INTELIGENCIA ARTIFICIAL': ['FIIS', 'I4', 'Ingeniería de Inteligencia Artificial'],
  'INGENIERÍA GEOLÓGICA': ['FIGMM', 'G1', 'Ingeniería Geológica'],
  'INGENIERÍA METALÚRGICA': ['FIGMM', 'G2', 'Ingeniería Metalúrgica'],
  'INGENIERÍA DE MINAS': ['FIGMM', 'G3', 'Ingeniería de Minas'],
  'INGENIERÍA SANITARIA': ['FIA', 'S1', 'Ingeniería Sanitaria'],
  'INGENIERÍA DE HIGIENE Y SEGURIDAD INDUSTRIAL': ['FIA', 'S2', 'Ingeniería de Higiene y Seguridad Industrial'],
  'INGENIERÍA AMBIENTAL': ['FIA', 'S3', 'Ingeniería Ambiental'],
  'INGENIERÍA ECONÓMICA': ['FIEECS', 'E1', 'Ingeniería Económica'],
  'INGENIERÍA ESTADÍSTICA': ['FIEECS', 'E3', 'Ingeniería Estadística'],
  'INGENIERÍA QUÍMICA': ['FIQT', 'Q1', 'Ingeniería Química'],
  'INGENIERÍA TEXTIL': ['FIQT', 'Q2', 'Ingeniería Textil'],
  'INGENIERÍA PETROQUÍMICA': ['FIP', 'P2', 'Ingeniería Petroquímica'],
  'INGENIERÍA DE PETRÓLEO Y GAS NATURAL': ['FIP', 'P3', 'Ingeniería de Petróleo y Gas Natural']
};

async function load(name) {
  const response = await fetch(BASE + SOURCES[name], { cache: 'no-store' });
  if (!response.ok) throw new Error(`${SOURCES[name]}: HTTP ${response.status}`);
  const value = await response.json();
  if (!Array.isArray(value)) throw new Error(`${SOURCES[name]} no contiene un arreglo`);
  return value;
}

const [finalLima, finalJuliaca, vacantesLima, vacantesJuliaca] = await Promise.all([
  load('finalLima'), load('finalJuliaca'), load('vacantesLima'), load('vacantesJuliaca')
]);

if (finalLima.length !== vacantesLima.length || finalJuliaca.length !== vacantesJuliaca.length) {
  throw new Error('Los listados de examen final y asignación no tienen la misma cantidad de registros.');
}

const rankingHtml = await fs.readFile('ranking.html', 'utf8');
const rankingMatch = rankingHtml.match(/<script id="cepre2026-ranking-data" type="application\/json">([\s\S]*?)<\/script>/);
if (!rankingMatch) throw new Error('No se encontró el bloque de datos del ranking.');
const rankingCodes = new Set(JSON.parse(rankingMatch[1]).map((row) => row[1]));

const officialFinal = [...finalLima.map((row) => ({ ...row, sede: 'Lima' })), ...finalJuliaca.map((row) => ({ ...row, sede: 'Juliaca' }))];
const finalScores = {};
for (const row of officialFinal) {
  const code = `26${row.codigo}`;
  if (!rankingCodes.has(code)) throw new Error(`El código oficial ${code} no existe en el ranking.`);
  if (Object.hasOwn(finalScores, code)) throw new Error(`Código oficial duplicado: ${code}`);
  finalScores[code] = Number(row.puntaje);
}

const assignments = [...vacantesLima.map((row) => ({ ...row, sede: 'Lima' })), ...vacantesJuliaca.map((row) => ({ ...row, sede: 'Juliaca' }))];
const entrants = assignments
  .filter((row) => String(row.especialidad_ingreso || '').trim())
  .map((row) => {
    const code = `26${row.codigo}`;
    const metadata = CAREERS[row.especialidad_ingreso];
    if (!metadata) throw new Error(`Especialidad sin catálogo: ${row.especialidad_ingreso}`);
    const divisor = row.especialidad_ingreso === 'ARQUITECTURA' ? 185.05 : 135;
    return {
      codigo: code,
      nombres: row.nombres,
      puntaje: Number(row.puntaje),
      puntaje20: Number((Number(row.puntaje) / divisor).toFixed(3)),
      examenFinal: finalScores[code],
      especialidad: metadata[2],
      codigoEspecialidad: metadata[1],
      facultad: metadata[0],
      sede: row.sede
    };
  })
  .sort((a, b) => b.puntaje - a.puntaje || a.nombres.localeCompare(b.nombres, 'es'));

const ranges = {};
for (const site of ['Lima', 'Juliaca']) {
  ranges[site] = Object.values(CAREERS).map(([faculty, code, name]) => {
    const rows = entrants.filter((row) => row.sede === site && row.codigoEspecialidad === code);
    const scores = rows.map((row) => row.puntaje20).sort((a, b) => a - b);
    return [faculty, code, name, scores.length ? scores[0] : null, scores.length ? scores.at(-1) : null, rows.length, null];
  });
}

const data = {
  cycle: '2026-2',
  published: '2026-08-03',
  source: BASE + 'index.html',
  evaluated: { total: assignments.length, Lima: vacantesLima.length, Juliaca: vacantesJuliaca.length },
  entrantCount: { total: entrants.length, Lima: entrants.filter((row) => row.sede === 'Lima').length, Juliaca: entrants.filter((row) => row.sede === 'Juliaca').length },
  finalScores,
  entrants,
  ranges
};

const cutoffValues = Object.fromEntries(Object.entries(ranges).map(([site, rows]) => [site, Object.fromEntries(rows.map((row) => [row[1], [row[3], row[4]]]))]));
const output = `/* Datos públicos oficiales CEPRE-UNI 2026-2. Generado por tools/sync-cepre-2026-2.mjs. */\n(function(){\n  'use strict';\n  var data=${JSON.stringify(data)};\n  window.UNIVERSE_CEPRE_2026_2=data;\n  window.UNIVERSE_CEPRE_CUTOFFS=window.UNIVERSE_CEPRE_CUTOFFS||{};\n  window.UNIVERSE_CEPRE_CUTOFFS['2026-2|Lima']={label:'2026-2 · Lima',source:'Resultados oficiales CEPRE-UNI 2026-2',values:${JSON.stringify(cutoffValues.Lima)}};\n  window.UNIVERSE_CEPRE_CUTOFFS['2026-2|Juliaca']={label:'2026-2 · Juliaca',source:'Resultados oficiales CEPRE-UNI 2026-2',values:${JSON.stringify(cutoffValues.Juliaca)}};\n})();\n`;
await fs.writeFile('cepre-2026-2-official.js', output, 'utf8');

console.log(JSON.stringify({
  finalScores: Object.keys(finalScores).length,
  entrants: entrants.length,
  Lima: data.entrantCount.Lima,
  Juliaca: data.entrantCount.Juliaca,
  output: 'cepre-2026-2-official.js'
}, null, 2));
