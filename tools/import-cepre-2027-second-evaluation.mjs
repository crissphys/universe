import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import vm from 'node:vm';

// Import only the visually reviewed transcription; never raw OCR.
const file = 'universe-ui/data/cepre-2027-1-ranking.js';
const context = { window: {} };
vm.runInNewContext(await fs.readFile(file, 'utf8'), context);
const data = context.window.UNIVERSE_CEPRE_2027_1;
const publication = JSON.parse(await fs.readFile('data/cepreuni/2027-1/second-evaluation.json', 'utf8'));
assert.equal(data.cycle, publication.cycle);
for (const track of ['pre', 'basic']) {
  data[track] = data[track].map(row => Array.isArray(row)
    ? { code: row[0], [track === 'pre' ? 'pc1' : 'e1']: row[1], sede: 'Lima' }
    : { ...row });
  assert.equal(new Set(data[track].map(row => row.code)).size, data[track].length);
}
for (const source of publication.sources) {
  assert.ok(['pre', 'basic'].includes(source.track));
  assert.equal(source.exam, source.track === 'pre' ? 'pc2' : 'e2');
  assert.equal(source.rows.length, source.count);
  const seen = new Set();
  const lookup = new Map(data[source.track].map(row => [row.code, row]));
  source.rows.forEach(([sequence, code, score], index) => {
    assert.equal(sequence, index + 1);
    assert.match(code, /^26[23]\d{4}[A-HJK]$/);
    assert.ok(!seen.has(code), `Duplicate: ${code}`);
    assert.ok(Number.isFinite(score) && score >= 0 && score <= (source.track === 'pre' ? 150 : 20));
    if (index) assert.ok(source.rows[index - 1][1] < code);
    seen.add(code);
    let row = lookup.get(code);
    if (!row) {
      row = { code, sede: source.sede };
      data[source.track].push(row);
      lookup.set(code, row);
    }
    assert.equal(row.sede || 'Lima', source.sede);
    row[source.exam] = score;
  });
  console.log(`${source.track} ${source.sede}: ${seen.size} ${source.exam} scores`);
}
data.publishedAt = publication.publishedAt;
data.sources.secondEvaluation = publication.sources.map(({ rows, ...source }) => source);
for (const track of ['pre', 'basic']) data[track].sort((a, b) => a.code.localeCompare(b.code));
await fs.writeFile(file, `window.UNIVERSE_CEPRE_2027_1=${JSON.stringify(data)};\n`);
