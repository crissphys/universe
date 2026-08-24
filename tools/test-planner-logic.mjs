import fs from 'node:fs';
import vm from 'node:vm';

const dataSource = fs.readFileSync(new URL('../planner-syllabus-data.js', import.meta.url), 'utf8');
const plannerSource = fs.readFileSync(new URL('../planner.js', import.meta.url), 'utf8')
  .replace(
    /if \(document\.readyState === 'loading'\)[\s\S]*?else boot\(\);\s*\}\)\(\);\s*$/,
    "globalThis.__plannerTest = { buildSchedule, evaluationEvents }; })();"
  );

const context = {
  window: {},
  localStorage: { getItem: () => null, setItem: () => {} },
  Date,
  Math,
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(dataSource, context);
vm.runInContext(plannerSource, context);

const profile = {
  username: 'qa_user',
  studentType: 'cepreuni',
  cepreCycle: 'preuniversitario',
  academyName: '',
  shift: 'morning',
  focus: 'all',
  startDate: '2026-08-31',
  endMode: 'cepre-final',
  endDate: '2027-01-17'
};
const events = context.__plannerTest.buildSchedule(profile);
const exams = events.filter((event) => event.type === 'exam');
const finalExam = exams.find((event) => event.topic === 'EXAMEN FINAL');

if (exams.length !== 10) throw new Error(`Expected 10 assessments, found ${exams.length}`);
if (!finalExam || finalExam.date !== '2027-01-24') throw new Error('Final exam reminder is missing or has the wrong date');
if (events.some((event) => !event.date || !event.start || !event.end || !event.topic)) throw new Error('Invalid planner event found');

const admissionEvents = context.__plannerTest.buildSchedule({
  ...profile,
  studentType: 'academy',
  cepreCycle: '',
  academyName: 'Pamer',
  focus: 'math',
  endMode: 'admission',
  endDate: '2027-02-14'
});
const areaCounts = admissionEvents.reduce((totals, event) => {
  totals[event.area] = (totals[event.area] || 0) + 1;
  return totals;
}, {});
if (!admissionEvents.length || areaCounts.Matemática <= areaCounts.Ciencias || areaCounts.Matemática <= areaCounts.Humanidades) {
  throw new Error('Mathematics focus is not receiving the largest number of blocks');
}

const html = fs.readFileSync(new URL('../planificador.html', import.meta.url), 'utf8');
const referencedIds = [...plannerSource.matchAll(/\$\('([^']+)'\)/g)].map((match) => match[1]);
const missingIds = [...new Set(referencedIds)].filter((id) => !html.includes(`id="${id}"`));
if (missingIds.length) throw new Error(`Missing HTML ids: ${missingIds.join(', ')}`);

console.log(JSON.stringify({
  cepreEvents: events.length,
  admissionEvents: admissionEvents.length,
  exams: exams.length,
  finalExam: finalExam.date,
  mathFocus: areaCounts
}));
