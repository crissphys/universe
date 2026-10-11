import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import vm from 'node:vm';

// Exact public JSON, not OCR. Validate BOTH campuses before changing the ranking.
const root = 'data/cepreuni/2027-1';
const file = 'universe-ui/data/cepre-2027-1-ranking.js';
const context = { window: {} };
vm.runInNewContext(await fs.readFile(file, 'utf8'), context);
const data = JSON.parse(JSON.stringify(context.window.UNIVERSE_CEPRE_2027_1));
assert.equal(data.cycle, '2027-1');
const original = structuredClone(data);
const lookup = new Map(data.pre.map(row => [row.code, row]));
assert.equal(lookup.size, data.pre.length);
const sources = [];
const downloads = [];
for (const sede of ['Lima', 'Juliaca']) {
  const url = `https://puntajes.admision.uni.edu.pe/primer-parcial-${sede.toLowerCase()}.json?v=20261011-2`;
  const response = await fetch(url, { cache: 'no-store' });
  assert.ok(response.ok, `HTTP ${response.status}: ${url}`);
  const raw = await response.text();
  const rows = JSON.parse(raw);
  assert.ok(Array.isArray(rows) && rows.length > 0);
  const seen = new Set();
  let absent = 0, added = 0;
  for (const item of rows) {
    const shortCode = String(item.codigo).trim().toUpperCase();
    assert.match(shortCode, sede === 'Lima' ? /^2\d{4}[A-HJK]$/ : /^3\d{4}[A-HJK]$/);
    const code = `26${shortCode}`;
    assert.ok(!seen.has(code), `Duplicate: ${code}`);
    seen.add(code);
    const name = String(item.nombres).trim().normalize('NFC');
    assert.ok(name && !name.includes('\uFFFD'));
    const text = String(item.puntaje).trim();
    const isAbsent = text === 'AUSENTE';
    if (!isAbsent) assert.match(text, /^\d+(?:[.,]\d+)?$/);
    const ep1 = isAbsent ? null : Number(text.replace(',', '.'));
    assert.ok(isAbsent || (Number.isFinite(ep1) && ep1 >= 0 && ep1 <= 150));
    let row = lookup.get(code);
    if (!row) {
      row = { code, sede };
      data.pre.push(row);
      lookup.set(code, row);
      added++;
    }
    assert.equal(row.sede, sede);
    row.name = name;
    row.ep1 = ep1;
    if (isAbsent) { row.ep1Status = 'AUSENTE'; absent++; }
    else delete row.ep1Status;
  }
  const unmatchedExistingCodes = original.pre.filter(row => row.sede === sede && !seen.has(row.code)).map(row => row.code);
  sources.push({ sede, exam: 'ep1', url, sha256: crypto.createHash('sha256').update(raw).digest('hex'), count: rows.length, scored: rows.length - absent, absent, added, unmatchedExistingCodes });
  downloads.push({ sede, raw });
}
// Existing practices and Basic must remain byte-for-byte equivalent in value.
for (const old of original.pre) {
  for (const [key, value] of Object.entries(old).filter(([key]) => !['name', 'ep1', 'ep1Status'].includes(key))) assert.deepEqual(lookup.get(old.code)[key], value);
}
assert.deepEqual(data.basic, original.basic);
data.pre.sort((a, b) => a.code.localeCompare(b.code));
data.publishedAt = '2026-10-11';
data.sources.firstPartial = sources;
await fs.mkdir(root, { recursive: true });
for (const { sede, raw } of downloads) await fs.writeFile(`${root}/primer-parcial-${sede.toLowerCase()}.json`, raw);
await fs.writeFile(`${root}/first-partial-manifest.json`, JSON.stringify({ cycle: data.cycle, publishedAt: data.publishedAt, codeMapping: 'Full ranking code = 26 + exact published short code', sources }, null, 2) + '\n');
await fs.writeFile(file, `window.UNIVERSE_CEPRE_2027_1=${JSON.stringify(data)};\n`);
for (const source of sources) console.log(JSON.stringify(source));
