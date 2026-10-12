import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const context = { window: {} };
vm.runInNewContext(await fs.readFile('universe-ui/data/cepre-2027-1-ranking.js', 'utf8'), context);
const data = JSON.parse(JSON.stringify(context.window.UNIVERSE_CEPRE_2027_1));
for (const sede of ['Lima', 'Juliaca']) {
  const official = JSON.parse(await fs.readFile(`data/cepreuni/2027-1/primer-parcial-${sede.toLowerCase()}.json`, 'utf8'));
  for (const item of official) {
    const row = data.pre.find(row => row.code === '26' + item.codigo.trim());
    assert.ok(row);
    assert.equal(row.sede, sede);
    assert.equal(row.name, item.nombres.trim().normalize('NFC'));
    assert.equal(row.ep1, item.puntaje.trim() === 'AUSENTE' ? null : Number(item.puntaje.trim().replace(',', '.')));
  }
  console.log(`${sede}: ${official.length} official names and results verified`);
}
assert.equal(new Set(data.pre.map(row => row.code)).size, data.pre.length);
const pc1Juliaca = JSON.parse(await fs.readFile('data/cepreuni/2027-1/first-practice-juliaca.json', 'utf8'));
assert.equal(pc1Juliaca.rows.length, 99);
for (const [, code, score] of pc1Juliaca.rows) {
  const row = data.pre.find(row => row.code === code);
  assert.equal(row.sede, 'Juliaca');
  assert.equal(row.pc1, score);
}
assert.equal(data.pre.filter(row => row.sede === 'Juliaca' && row.pc1 != null).length, 99);
console.log('Juliaca: 99 visually reviewed first-practice scores verified');

// Exercise the actual browser calculation functions, including future exams.
const elements = new Map();
const element = () => ({ value: '', querySelectorAll: () => [], addEventListener() {} });
const document = { querySelectorAll: () => [], getElementById(id) { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); } };
const browser = { window: { UNIVERSE_CEPRE_2027_1: data }, document };
const rawScript = await fs.readFile('universe-ui/native/ranking-2027.js', 'utf8');
const script = rawScript.slice(0, rawScript.lastIndexOf('\n  render();')) + '\n  window.testRanking = { weightedAverage, score, tracks, discardedKey };\n})();';
vm.runInNewContext(script, browser);
const { weightedAverage: avg, score, tracks } = browser.window.testRanking;
const pre = tracks.pre;
assert.equal(browser.window.testRanking.discardedKey({ pc1: 80, pc2: 100, pc7: 0 }, pre), 'pc1');
assert.equal(avg({}, pre), null);
assert.equal(score(''), null);
assert.equal(score('  '), null);
assert.equal(score(null), null);
assert.equal(score('AUSENTE'), null);
assert.equal(score(0), 0);
assert.equal(avg({ pc1: 80 }, pre), 80);
assert.equal(avg({ pc1: 80, pc2: 100, ep1: 70 }, pre), 80); // (100 + 2*70)/3
assert.equal(avg({ pc1: 0, pc2: 0, ep1: 60 }, pre), 40); // only ONE zero PC discarded
assert.equal(avg({ pc1: 80, pc2: 100, ep1: null }, pre), 100);
assert.equal(avg({ pc1: 80, pc2: 100, pc7: 10 }, pre), 55); // PC7 not discarded
assert.equal(avg({ pc1: 10, pc2: 20, pc3: 30, pc4: 40, pc5: 50, pc6: 60, pc7: 0, ep1: 70, ep2: 80, ef: 90 }, pre), 1200 / 18);
assert.equal(avg({ ep1: 70, ep2: 80, ef: 90 }, pre), 1000 / 12);
assert.equal(avg({ e1: 10, e2: 20 }, tracks.basic), 15);
assert.equal(avg({ pc2: 100, ep1: 70 }, tracks.juliaca), 80);
assert.equal(await fs.readFile('ranking.html', 'utf8'), await fs.readFile('ranking/index.html', 'utf8'));
console.log('Weights, one discard, ties, PC7, pending notes, zero, both campuses and Basic: passed');
