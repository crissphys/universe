import fs from 'node:fs';
import vm from 'node:vm';

const dataSource = fs.readFileSync(new URL('../planner-syllabus-data.js', import.meta.url), 'utf8');
const plannerSource = fs.readFileSync(new URL('../planner.js', import.meta.url), 'utf8')
  .replace(
    /if \(document\.readyState === 'loading'\)[\s\S]*?else boot\(\);\s*\}\)\(\);\s*$/,
    "globalThis.__plannerTest = { buildSchedule, evaluationEvents, ensureUniqueEventIds, toggleEventInList, accountCacheKey, plannerBelongsTo, customTimeBlocks, blocksForProfile, minutesBetween }; })();"
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
if (new Set(events.map((event) => event.id)).size !== events.length) throw new Error('Generated planner events do not have unique ids');
if (context.__plannerTest.accountCacheKey('google_a') === context.__plannerTest.accountCacheKey('google_b')) throw new Error('Planner cache is not isolated per account');
if (context.__plannerTest.plannerBelongsTo({ userId: 'google_a' }, 'google_b')) throw new Error('A planner can be loaded by the wrong account');

const duplicateEvents = [
  { id: 'study_duplicate', date: '2026-09-01', start: '07:00', type: 'study', status: 'pending' },
  { id: 'study_duplicate', date: '2026-09-02', start: '08:40', type: 'study', status: 'pending' },
  { id: 'study_duplicate', date: '2026-09-03', start: '10:20', type: 'study', status: 'done' }
];
if (!context.__plannerTest.ensureUniqueEventIds(duplicateEvents)) throw new Error('Duplicate event ids were not repaired');
if (new Set(duplicateEvents.map((event) => event.id)).size !== duplicateEvents.length) throw new Error('Repaired event ids are still duplicated');
const beforeStatuses = duplicateEvents.map((event) => event.status);
const target = duplicateEvents[1];
if (!context.__plannerTest.toggleEventInList(duplicateEvents, target.id, target.date, target.start)) throw new Error('Target event was not toggled');
if (duplicateEvents[0].status !== beforeStatuses[0] || duplicateEvents[1].status === beforeStatuses[1] || duplicateEvents[2].status !== beforeStatuses[2]) {
  throw new Error('Toggling one event changed another event');
}

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

const areaMinutes = admissionEvents.reduce((totals, event) => {
  if (event.type === 'exam') return totals;
  totals[event.area] = (totals[event.area] || 0) + context.__plannerTest.minutesBetween(event.start, event.end);
  return totals;
}, {});
if (areaMinutes.Matemática < areaMinutes.Ciencias * 2.5 || areaMinutes.Matemática < areaMinutes.Humanidades * 2.5) {
  throw new Error(`Mathematics priority does not receive substantially more study time: ${JSON.stringify(areaMinutes)}`);
}
for (const [focus, priorityArea] of [['science', 'Ciencias'], ['humanities', 'Humanidades']]) {
  const focusedEvents = context.__plannerTest.buildSchedule({ ...profile, studentType: 'independent', cepreCycle: '', focus, endMode: 'admission', endDate: '2027-02-14' });
  const focusedMinutes = focusedEvents.reduce((totals, event) => {
    if (event.type !== 'exam') totals[event.area] = (totals[event.area] || 0) + context.__plannerTest.minutesBetween(event.start, event.end);
    return totals;
  }, {});
  const otherAreas = ['Matemática', 'Ciencias', 'Humanidades'].filter((area) => area !== priorityArea);
  if (otherAreas.some((area) => focusedMinutes[priorityArea] < focusedMinutes[area] * 2.5)) {
    throw new Error(`${priorityArea} priority does not receive substantially more study time: ${JSON.stringify(focusedMinutes)}`);
  }
}

const balancedEvents = context.__plannerTest.buildSchedule({
  ...profile,
  studentType: 'independent',
  cepreCycle: '',
  shift: 'custom',
  customStart: '09:15',
  customEnd: '15:30',
  focus: 'all',
  startDate: '2026-09-01',
  endMode: 'custom',
  endDate: '2026-09-12'
});
const customBlocks = context.__plannerTest.customTimeBlocks('09:15', '15:30');
if (customBlocks.length !== 4 || customBlocks[0][0] !== '09:15' || customBlocks.at(-1)[1] !== '15:30') {
  throw new Error(`Custom blocks do not fill the selected time range: ${JSON.stringify(customBlocks)}`);
}
if (context.__plannerTest.customTimeBlocks('14:00', '13:00').length || context.__plannerTest.customTimeBlocks('09:00', '10:00').length) {
  throw new Error('Invalid or too-short custom schedules were accepted');
}
if (balancedEvents.some((event) => event.type !== 'exam' && (event.start < '09:15' || event.end > '15:30'))) {
  throw new Error('A custom-schedule event falls outside the selected time range');
}
const balancedMinutes = balancedEvents.reduce((totals, event) => {
  if (event.type === 'exam') return totals;
  totals[event.area] = (totals[event.area] || 0) + context.__plannerTest.minutesBetween(event.start, event.end);
  return totals;
}, {});
const balancedValues = ['Matemática', 'Ciencias', 'Humanidades'].map((area) => balancedMinutes[area] || 0);
if (Math.min(...balancedValues) === 0 || Math.max(...balancedValues) / Math.min(...balancedValues) > 1.2) {
  throw new Error(`All-subject priority is not balanced: ${JSON.stringify(balancedMinutes)}`);
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
  uniqueEventIds: new Set(events.map((event) => event.id)).size,
  isolatedCheckboxUpdate: duplicateEvents.map((event) => event.status),
  mathFocus: areaCounts,
  mathFocusMinutes: areaMinutes,
  customBlocks,
  balancedMinutes
}));
