import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const source = fs.readFileSync(path.join(root, 'temario.html'), 'utf8');
const match = source.match(/var DATA=(\{[\s\S]*?\});\s*var META=/);
if (!match) throw new Error('No se encontró DATA en temario.html');
const data = JSON.parse(match[1]);

function clean(value) {
  return String(value || '').replace(/^\s*\d+(?:[.)]\s*|\s+)/, '').replace(/\s+/g, ' ').trim();
}

function normalizeArea(value) {
  const area = String(value || '').toLowerCase();
  if (area.includes('matem')) return 'Matemática';
  if (area.includes('ciencia')) return 'Ciencias';
  return 'Humanidades';
}

function topicRows(modules) {
  const rows = [];
  (modules || []).forEach((module) => {
    (module.topics || []).forEach((topic) => {
      const title = clean(topic.title);
      if (!title) return;
      rows.push({
        title,
        detail: clean((topic.items || [])[0] || ''),
        group: clean(module.label)
      });
    });
  });
  return rows;
}

function weeksFromLabel(label) {
  const nums = String(label || '').match(/\d+/g) || [];
  if (!nums.length || !/semana/i.test(label)) return [];
  const start = Math.max(1, Number(nums[0]) || 1);
  const end = Math.max(start, Number(nums[1]) || start);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index).filter((week) => week <= 20);
}

const admission = [];
const cepreByWeek = Array.from({ length: 20 }, (_, index) => ({ week: index + 1, topics: [] }));

Object.entries(data.temarios || {}).forEach(([id, course]) => {
  const topics = topicRows(course.semanas);
  if (topics.length) {
    admission.push({ id, name: clean(course.name || id), area: normalizeArea(course.cat), topics });
  }
  (course.cepreSemanas || []).forEach((module) => {
    const weeks = weeksFromLabel(module.label);
    weeks.forEach((week) => {
      (module.topics || []).forEach((topic) => {
        const title = clean(topic.title);
        if (!title) return;
        cepreByWeek[week - 1].topics.push({
          course: clean(course.name || id),
          area: normalizeArea(course.cat),
          title,
          detail: clean((topic.items || [])[0] || '')
        });
      });
    });
  });
});

Object.entries(data.humanities || {}).forEach(([course, topics]) => {
  (topics || []).slice(0, 20).forEach((title, index) => {
    const cleaned = clean(title);
    if (!cleaned) return;
    cepreByWeek[index].topics.push({ course, area: 'Humanidades', title: cleaned, detail: '' });
  });
});

const payload = {
  version: 1,
  source: 'Temarios UNI y CEPREUNI publicados en Universe to Study',
  admission,
  cepre: cepreByWeek,
  evaluations: (data.evaluations || []).map((evaluation, index) => ({
    id: 'eval-' + (index + 1),
    name: clean(evaluation.name),
    range: evaluation.range,
    subjects: evaluation.subjects || []
  }))
};

const banner = '/* Generado desde temario.html con tools/build-planner-syllabus.mjs. */\n';
fs.writeFileSync(
  path.join(root, 'planner-syllabus-data.js'),
  banner + 'window.UNIVERSE_PLANNER_DATA=' + JSON.stringify(payload) + ';\n',
  'utf8'
);
console.log(JSON.stringify({
  courses: payload.admission.length,
  admissionTopics: payload.admission.reduce((sum, course) => sum + course.topics.length, 0),
  cepreTopics: payload.cepre.reduce((sum, week) => sum + week.topics.length, 0),
  evaluations: payload.evaluations.length
}, null, 2));
