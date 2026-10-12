import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';

// Read-only PDF source; import only the page-by-page reviewed transcription.
const sourcePdf = process.argv[2];
if (!sourcePdf) throw new Error('Usage: node tools/import-cepre-2027-first-practice-juliaca.mjs <source.pdf>');
const publicationFile = 'data/cepreuni/2027-1/first-practice-juliaca.json';
const rankingFile = 'universe-ui/data/cepre-2027-1-ranking.js';
const publication = JSON.parse(await fs.readFile(publicationFile, 'utf8'));
const sourceBytes = await fs.readFile(sourcePdf);
const source = {
  fileName: path.basename(sourcePdf),
  sha256: crypto.createHash('sha256').update(sourceBytes).digest('hex'),
  bytes: sourceBytes.length,
  pageCount: 1,
  reviewedRows: 99,
  ocrCrossCheckedScores: 98,
  visuallyResolvedOcrRows: [16]
};
assert.equal(publication.cycle, '2027-1');
assert.equal(publication.sede, 'Juliaca');
assert.equal(publication.exam, 'pc1');
assert.equal(publication.rows.length, publication.count);
assert.equal(publication.count, 99);
const context = { window: {} };
vm.runInNewContext(await fs.readFile(rankingFile, 'utf8'), context);
const data = JSON.parse(JSON.stringify(context.window.UNIVERSE_CEPRE_2027_1));
const original = structuredClone(data);
assert.equal(data.cycle, publication.cycle);
const lookup = new Map(data.pre.map(row => [row.code, row]));
assert.equal(lookup.size, data.pre.length);
const seen = new Set();
for (const [index, [sequence, code, score]] of publication.rows.entries()) {
  assert.equal(sequence, index + 1);
  assert.match(code, /^263\d{4}[A-HJK]$/);
  assert.ok(!seen.has(code), `Duplicate code ${code}`);
  if (index) assert.ok(publication.rows[index - 1][1] < code);
  assert.ok(Number.isFinite(score) && score >= 0 && score <= 150);
  const row = lookup.get(code);
  assert.ok(row, `Unmatched code ${code}`);
  assert.equal(row.sede, 'Juliaca');
  if (row.pc1 != null) assert.equal(row.pc1, score, `Existing PC1 differs for ${code}`);
  row.pc1 = score;
  seen.add(code);
}
// Verify all other notes, names, campuses, codes and Basic values are preserved.
for (const old of original.pre) {
  const actual = structuredClone(lookup.get(old.code));
  if (seen.has(old.code) && !Object.hasOwn(old, 'pc1')) delete actual.pc1;
  assert.deepEqual(actual, old);
}
assert.deepEqual(data.basic, original.basic);
data.updatedAt = '2026-10-12';
data.sources.firstPracticeJuliaca = {
  sede: publication.sede, exam: publication.exam, publishedAt: publication.publishedAt,
  importedAt: data.updatedAt, count: publication.count, source,
  codesWithoutPc1: data.pre.filter(row => row.sede === 'Juliaca' && row.pc1 == null).map(row => row.code)
};
publication.source = source;
await fs.writeFile(publicationFile, JSON.stringify(publication, null, 2) + '\n');
await fs.writeFile(rankingFile, `window.UNIVERSE_CEPRE_2027_1=${JSON.stringify(data)};\n`);
console.log(JSON.stringify(data.sources.firstPracticeJuliaca, null, 2));
