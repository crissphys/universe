import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const sources = {
  humanidades: 'https://puntajes.admision.uni.edu.pe/resultados-admision-aptitud-academica-humanidades-20260810.json?v=20260810-1',
  matematica: 'https://puntajes.admision.uni.edu.pe/resultados-admision-prueba-matematica-20260812.json?v=20260812-1',
  ciencias: 'https://puntajes.admision.uni.edu.pe/resultados-admision-prueba-fisica-quimica-20260815.json?v=20260815-5',
  concurso: 'https://puntajes.admision.uni.edu.pe/resultados-concurso-admision-2026-2-20260814.json?v=20260814-1',
  arquitectura: 'https://puntajes.admision.uni.edu.pe/resultados-concurso-admision-2026-2-arquitectura-20260815.json?v=20260815-1'
};

const faculties = {
  'Arquitectura': ['FAUA', 'Facultad de Arquitectura, Urbanismo y Artes'],
  'Urbanismo': ['FAUA', 'Facultad de Arquitectura, Urbanismo y Artes'],
  'Ingeniería Civil': ['FIC', 'Facultad de Ingeniería Civil'],
  'Ingeniería Mecánica': ['FIM', 'Facultad de Ingeniería Mecánica'],
  'Ingeniería Mecánica-Eléctrica': ['FIM', 'Facultad de Ingeniería Mecánica'],
  'Ingeniería Naval': ['FIM', 'Facultad de Ingeniería Mecánica'],
  'Ingeniería Mecatrónica': ['FIM', 'Facultad de Ingeniería Mecánica'],
  'Ingeniería Aeroespacial': ['FIM', 'Facultad de Ingeniería Mecánica'],
  'Física': ['FC', 'Facultad de Ciencias'],
  'Matemática': ['FC', 'Facultad de Ciencias'],
  'Química': ['FC', 'Facultad de Ciencias'],
  'Ingeniería Física': ['FC', 'Facultad de Ciencias'],
  'Ciencia de la Computación': ['FC', 'Facultad de Ciencias'],
  'Ingeniería Eléctrica': ['FIEE', 'Facultad de Ingeniería Eléctrica y Electrónica'],
  'Ingeniería Electrónica': ['FIEE', 'Facultad de Ingeniería Eléctrica y Electrónica'],
  'Ingeniería de Telecomunicaciones': ['FIEE', 'Facultad de Ingeniería Eléctrica y Electrónica'],
  'Ingeniería de Ciberseguridad': ['FIEE', 'Facultad de Ingeniería Eléctrica y Electrónica'],
  'Ingeniería Biomédica': ['FIEE', 'Facultad de Ingeniería Eléctrica y Electrónica'],
  'Ingeniería Industrial': ['FIIS', 'Facultad de Ingeniería Industrial y de Sistemas'],
  'Ingeniería de Sistemas': ['FIIS', 'Facultad de Ingeniería Industrial y de Sistemas'],
  'Ingeniería de Software': ['FIIS', 'Facultad de Ingeniería Industrial y de Sistemas'],
  'Ingeniería de Inteligencia Artificial': ['FIIS', 'Facultad de Ingeniería Industrial y de Sistemas'],
  'Ingeniería Geológica': ['FIGMM', 'Facultad de Ingeniería Geológica, Minera y Metalúrgica'],
  'Ingeniería Metalúrgica': ['FIGMM', 'Facultad de Ingeniería Geológica, Minera y Metalúrgica'],
  'Ingeniería de Minas': ['FIGMM', 'Facultad de Ingeniería Geológica, Minera y Metalúrgica'],
  'Ingeniería Sanitaria': ['FIA', 'Facultad de Ingeniería Ambiental'],
  'Ingeniería de Higiene y Seguridad Industrial': ['FIA', 'Facultad de Ingeniería Ambiental'],
  'Ingeniería Ambiental': ['FIA', 'Facultad de Ingeniería Ambiental'],
  'Ingeniería Económica': ['FIEECS', 'Facultad de Ingeniería Económica, Estadística y Ciencias Sociales'],
  'Ingeniería Estadística': ['FIEECS', 'Facultad de Ingeniería Económica, Estadística y Ciencias Sociales'],
  'Ingeniería Química': ['FIQT', 'Facultad de Ingeniería Química y Textil'],
  'Ingeniería Textil': ['FIQT', 'Facultad de Ingeniería Química y Textil'],
  'Ingeniería Petroquímica': ['FIP', 'Facultad de Ingeniería de Petróleo, Gas Natural y Petroquímica'],
  'Ingeniería de Petróleo y Gas Natural': ['FIP', 'Facultad de Ingeniería de Petróleo, Gas Natural y Petroquímica']
};

function normalize(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/\s+/g, ' ').trim();
}

const careerByNormalized = new Map(Object.keys(faculties).map((name) => [normalize(name), name]));

function decimal(value) {
  const text = String(value ?? '').trim().replace(/\s/g, '').replace(',', '.');
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function round(value, digits = 3) {
  return Number(Number(value).toFixed(digits));
}

async function getJson(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'UniverseToStudyDataBuilder/1.0' } });
  if (!response.ok) throw new Error(`No se pudo descargar ${url}: HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data) || !data.length) throw new Error(`Fuente vacía o inválida: ${url}`);
  return data;
}

function validateExam(rows, label) {
  const seen = new Set();
  rows.forEach((row, index) => {
    const code = String(row.codigo || '').trim();
    if (!code) throw new Error(`${label}: código vacío en fila ${index + 1}`);
    if (seen.has(code)) throw new Error(`${label}: código duplicado ${code}`);
    seen.add(code);
    const score = decimal(row.puntaje);
    if (score != null && (score < 0 || score > 600)) throw new Error(`${label}: puntaje fuera de rango para ${code}`);
  });
}

function examSummary(rows) {
  const presentRows = rows.map((row) => ({ code: String(row.codigo).trim(), name: String(row.nombres || '').trim(), score: decimal(row.puntaje) })).filter((row) => row.score != null);
  const scores = presentRows.map((row) => row.score);
  const mean = scores.reduce((sum, value) => sum + value, 0) / scores.length;
  const variance = scores.reduce((sum, value) => sum + (value - mean) ** 2, 0) / scores.length;
  const minimum = Math.min(...scores);
  const maximum = Math.max(...scores);
  const frequencies = new Map();
  scores.forEach((score) => frequencies.set(score, (frequencies.get(score) || 0) + 1));
  const bins = Array.from({ length: 12 }, (_, index) => {
    const low = index * 50;
    const high = low + 50;
    return { low, high, count: scores.filter((score) => score >= low && (index === 11 ? score <= high : score < high)).length };
  });
  const minStudent = presentRows.find((row) => row.score === minimum);
  const maxStudent = presentRows.find((row) => row.score === maximum);
  return {
    registered: rows.length,
    present: presentRows.length,
    absent: rows.length - presentRows.length,
    mean: round(mean),
    standardDeviationPopulation: round(Math.sqrt(variance)),
    minimum,
    maximum,
    minimumStudent: minStudent,
    minimumCount: frequencies.get(minimum),
    maximumStudent: maxStudent,
    maximumCount: frequencies.get(maximum),
    bins,
    scoreFrequencies: [...frequencies.entries()].sort((a, b) => a[0] - b[0]).map(([score, count]) => ({ score, count }))
  };
}

function writeGlobal(file, globalName, value) {
  return fs.writeFile(path.join(root, file), `window.${globalName}=${JSON.stringify(value)};\n`, 'utf8');
}

function buildRanking(exams) {
  const map = new Map();
  ['exam1', 'exam2', 'exam3'].forEach((key) => {
    exams[key].forEach((source) => {
      const code = String(source.codigo || '').trim();
      const row = map.get(code) || { code, name: String(source.nombres || '').trim(), exam1: null, exam2: null, exam3: null };
      if (!row.name) row.name = String(source.nombres || '').trim();
      row[key] = decimal(source.puntaje);
      row[`${key}Status`] = row[key] == null ? 'absent' : 'present';
      map.set(code, row);
    });
  });
  const rows = [...map.values()];
  rows.forEach((row) => {
    ['exam1', 'exam2', 'exam3'].forEach((key) => { if (!(`${key}Status` in row)) row[`${key}Status`] = 'not-listed'; });
    row.complete = row.exam1 != null && row.exam2 != null && row.exam3 != null;
    row.total = row.complete ? round(row.exam1 + row.exam2 + row.exam3) : null;
  });
  const complete = rows.filter((row) => row.complete).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'es'));
  let rank = 0;
  let previous = null;
  complete.forEach((row, index) => {
    if (previous == null || row.total !== previous) rank = index + 1;
    row.rank = rank;
    previous = row.total;
  });
  rows.filter((row) => !row.complete).forEach((row) => { row.rank = null; });
  rows.sort((a, b) => (a.rank == null) - (b.rank == null) || (a.rank || 0) - (b.rank || 0) || a.name.localeCompare(b.name, 'es'));
  const totals = complete.map((row) => row.total);
  const mean = totals.reduce((sum, value) => sum + value, 0) / totals.length;
  return {
    process: 'Admisión UNI 2026-2',
    publishedExams: 3,
    provisionalMax: 1800,
    totalMax: 1800,
    sources,
    stats: {
      registered: rows.length,
      ranked: complete.length,
      incomplete: rows.length - complete.length,
      meanTotal: round(mean),
      mean20: round(mean / 90),
      minimum: Math.min(...totals),
      maximum: Math.max(...totals)
    },
    rows
  };
}

function verifyFinalScores(ranking, mainRows, architectureRows) {
  const byCode = new Map(ranking.rows.filter((row) => row.complete).map((row) => [row.code, row.total]));
  let compared = 0;
  const mismatches = [];
  const compare = (row, field) => {
    const code = String(row.codigo || '').trim();
    const published = decimal(row[field]);
    const calculated = byCode.get(code);
    if (published == null || calculated == null) return;
    compared += 1;
    if (Math.abs(published - calculated) > 0.001) mismatches.push({ code, published, calculated });
  };
  mainRows.forEach((row) => compare(row, 'puntaje'));
  architectureRows.forEach((row) => compare(row, 'puntaje_final'));
  if (mismatches.length) throw new Error(`El total de las tres pruebas no coincide con la publicación final: ${JSON.stringify(mismatches.slice(0, 8))}`);
  if (compared < 4000) throw new Error(`Cruce insuficiente con resultados finales: ${compared} registros`);
  return compared;
}

function canonicalCareer(raw) {
  const canonical = careerByNormalized.get(normalize(raw));
  if (!canonical) throw new Error(`Carrera no reconocida: ${raw}`);
  return canonical;
}

function buildEntrants(mainRows, architectureRows) {
  const ordinaryApplicants = mainRows.filter((row) => normalize(row.modalidad) === 'ORDINARIO').length + architectureRows.filter((row) => normalize(row.modalidad) === 'ORDINARIO').length;
  const allEntrants = mainRows.filter((row) => String(row.resultado || '').trim()).length + architectureRows.filter((row) => String(row.resultado || '').trim()).length;
  const admitted = [];
  mainRows.filter((row) => normalize(row.modalidad) === 'ORDINARIO' && String(row.resultado || '').trim()).forEach((row) => {
    const career = canonicalCareer(row.resultado);
    const score = decimal(row.puntaje);
    if (score == null) throw new Error(`Ingresante sin puntaje: ${row.codigo}`);
    const [facultyCode, faculty] = faculties[career];
    admitted.push({ code: String(row.codigo).trim(), name: String(row.nombres || '').trim(), career, facultyCode, faculty, score, architectureScore: null, modality: 'ORDINARIO' });
  });
  architectureRows.filter((row) => normalize(row.modalidad) === 'ORDINARIO' && String(row.resultado || '').trim()).forEach((row) => {
    const career = canonicalCareer(row.resultado);
    const score = decimal(row.puntaje_final);
    if (score == null) throw new Error(`Ingresante FAUA sin puntaje: ${row.codigo}`);
    const [facultyCode, faculty] = faculties[career];
    admitted.push({ code: String(row.codigo).trim(), name: String(row.nombres || '').trim(), career, facultyCode, faculty, score, architectureScore: decimal(row.puntaje_final_arquitectura), modality: 'ORDINARIO' });
  });
  const seen = new Set();
  admitted.forEach((row) => {
    if (seen.has(row.code)) throw new Error(`Ingresante duplicado: ${row.code}`);
    seen.add(row.code);
  });
  admitted.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'es'));
  let globalRank = 0;
  let previous = null;
  admitted.forEach((row, index) => {
    if (previous == null || row.score !== previous) globalRank = index + 1;
    row.globalRank = globalRank;
    previous = row.score;
  });
  const byCareer = new Map();
  admitted.forEach((row) => {
    if (!byCareer.has(row.career)) byCareer.set(row.career, []);
    byCareer.get(row.career).push(row);
  });
  byCareer.forEach((rows) => rows.sort((a, b) => b.score - a.score).forEach((row, index) => { row.careerRank = index + 1; }));
  const groupedFaculties = [...new Set(admitted.map((row) => row.facultyCode))].sort().map((code) => {
    const facultyRows = admitted.filter((row) => row.facultyCode === code);
    const careerNames = [...new Set(facultyRows.map((row) => row.career))].sort((a, b) => a.localeCompare(b, 'es'));
    return {
      code,
      name: facultyRows[0].faculty,
      count: facultyRows.length,
      careers: careerNames.map((career) => ({ name: career, count: byCareer.get(career).length }))
    };
  });
  const cutoffs = {};
  byCareer.forEach((rows, career) => {
    const scores = rows.map((row) => row.score);
    cutoffs[career] = {
      min20: round(Math.min(...scores) / 90, 6),
      max20: round(Math.max(...scores) / 90, 6),
      minRaw: Math.min(...scores),
      maxRaw: Math.max(...scores),
      applicants: null,
      capacity: rows.length
    };
  });
  return {
    dataset: {
      process: 'Admisión UNI 2026-2',
      modality: 'ORDINARIO',
      publishedAt: '2026-08-15',
      sources: { concurso: sources.concurso, arquitectura: sources.arquitectura },
      stats: { applicants: mainRows.length + architectureRows.length, ordinaryApplicants, ordinaryEntrants: admitted.length, allPublishedEntrants: allEntrants, faculties: groupedFaculties.length, careers: byCareer.size },
      faculties: groupedFaculties,
      rows: admitted
    },
    cutoffs,
    ordinaryApplicants,
    ordinaryEntrants: admitted.length,
    allEntrants
  };
}

async function updateAdmissionData(result) {
  const file = path.join(root, 'admission-data.js');
  const text = await fs.readFile(file, 'utf8');
  const match = text.match(/window\.UNIVERSE_ADMISSION_DATA\s*=\s*([\s\S]*);\s*$/);
  if (!match) throw new Error('No se pudo leer admission-data.js');
  const data = JSON.parse(match[1]);
  data.DATA['2026-2'] = result.cutoffs;
  data.TOTALS['2026-2'] = { applicants: result.dataset.stats.applicants, admitted: result.allEntrants, ordinaryApplicants: result.ordinaryApplicants, ordinaryEntrants: result.ordinaryEntrants };
  data.CAPACITY_TYPE['2026-2'] = 'Ingresantes oficiales de la modalidad ordinaria por especialidad; postulantes por carrera no publicados';
  data.SOURCE_URLS['2026-2'] = 'https://puntajes.admision.uni.edu.pe/admision-concurso-2026-2.html';
  data.EXTRA_SOURCES['Resultados de Arquitectura 2026-2'] = 'https://puntajes.admision.uni.edu.pe/admision-concurso-2026-2-arquitectura.html';
  if (!data.CYCLES.includes('2026-2')) data.CYCLES.push('2026-2');
  const header = '// Datos históricos y oficiales para Admisión UNI.\n// Escala comparable: 0 a 1800 puntos. Para Arquitectura se conserva además el puntaje especial en la página de ingresantes.\n';
  await fs.writeFile(file, `${header}window.UNIVERSE_ADMISSION_DATA = ${JSON.stringify(data)};\n`, 'utf8');
}

async function main() {
  const [humanidades, matematica, ciencias, concurso, arquitectura] = await Promise.all(Object.values(sources).map(getJson));
  validateExam(humanidades, 'Humanidades');
  validateExam(matematica, 'Matemática');
  validateExam(ciencias, 'Ciencias');
  const scienceStats = examSummary(ciencias);
  const scienceSummary = {
    process: 'Admisión UNI 2026-2',
    exam: 'Tercera prueba: Física y Química',
    publishedAt: '2026-08-15',
    source: sources.ciencias,
    examMax: 600,
    totalMax: 1800,
    completedExams: 3,
    questionCount: 40,
    scoring: { correct: 15, wrong: -3, blank: 0 },
    stats: Object.fromEntries(Object.entries(scienceStats).filter(([key]) => key !== 'scoreFrequencies')),
    scoreFrequencies: scienceStats.scoreFrequencies
  };
  const ranking = buildRanking({ exam1: humanidades, exam2: matematica, exam3: ciencias });
  const verifiedFinalScores = verifyFinalScores(ranking, concurso, arquitectura);
  const entrants = buildEntrants(concurso, arquitectura);
  await Promise.all([
    writeGlobal('admission-2026-2-exam3-summary.js', 'UNIVERSE_ADMISSION_2026_2_EXAM3', scienceSummary),
    writeGlobal('admission-2026-2-ranking-data.js', 'UNIVERSE_ADMISSION_2026_2_RANKING', ranking),
    writeGlobal('admission-2026-2-entrants-data.js', 'UNIVERSE_ADMISSION_2026_2_ENTRANTS', entrants.dataset),
    updateAdmissionData(entrants)
  ]);
  console.log(JSON.stringify({
    ciencias: scienceSummary.stats,
    ranking: ranking.stats,
    ordinaryApplicants: entrants.ordinaryApplicants,
    ordinaryEntrants: entrants.ordinaryEntrants,
    allPublishedEntrants: entrants.allEntrants,
    careers: entrants.dataset.stats.careers,
    verifiedFinalScores
  }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
