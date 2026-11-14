// node tools/test-calculadora-pre.mjs — cálculo de /cepreuni/calculadorapre contra /ranking y la fórmula oficial.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const ctx = { window: {}, document: { getElementById: () => null }, matchMedia: () => ({ matches: false }), console };
vm.runInNewContext(fs.readFileSync('cepreuni/calculadorapre/calc.js', 'utf8'), ctx);
const { run, need } = ctx.window.UNIVERSE_CALC_PRE;
const near = (a, b, e = 1e-6) => assert.ok(Math.abs(a - b) < e, `${a} ≠ ${b}`);

// Ciclo completo = (S + 2·EP1 + 4·EP2 + 6·EF) / 2700 · 20, S = 5 mejores de PC1–6 + PC7.
const full = [100, 90, 120, 80, 110, 130, 140, 125, 105, 115];
const S = [100, 90, 80, 110, 140, 125].sort((a, b) => b - a).slice(0, 5).reduce((a, b) => a + b) + 105;
near(run(full).p, (S + 2 * 120 + 4 * 130 + 6 * 115) / 2700 * 20);

// Parcial: igual que /ranking (la práctica más baja no cuenta desde la 2.ª práctica).
const part = [140.16, 143.54, 141.25, 123.86, null, null, null, null, null, null];
near(run(part).p, (140.16 + 143.54 + 2 * 141.25) / 4 / 7.5);
assert.equal(run(part).drop, 3);
assert.equal(run(Array(10).fill(null)).p, null);

// need(): la nota hallada deja el ponderado exactamente en la meta.
const v = [120, 110, 100, null, null, null, null, null, null, null];
const t = 15, x = need(v, [3], t) * 150;
near(run(v.map((y, i) => i === 3 ? x : y)).p, t, 1e-4);
assert.equal(need(v, [3], 25), null);
assert.equal(need(v, [3], 1), 0);
assert.equal(need(v.map(() => 1), [], 10), undefined);

// Mismo ponderado que /ranking para cada alumno del padrón.
const w = {}; vm.runInNewContext(fs.readFileSync('universe-ui/data/cepre-2027-1-ranking.js', 'utf8'), { window: w });
const keys = ['pc1', 'pc2', 'ep1', 'pc3', 'pc4', 'ep2', 'pc5', 'pc6', 'pc7', 'ef'];
const pub = keys.map(k => w.UNIVERSE_CEPRE_2027_1.pre.some(r => r[k] != null || r[k + 'Status']));
for (const r of w.UNIVERSE_CEPRE_2027_1.pre.slice(0, 300)) {
  const vals = keys.map((k, i) => !pub[i] ? null : r[k + 'Status'] === 'AUSENTE' || r[k] == null ? 0 : r[k]);
  const inc = vals.map((x, i) => ({ x, w: [1, 1, 2, 1, 1, 4, 1, 1, 1, 6][i], d: [1, 1, 0, 1, 1, 0, 1, 1, 0, 0][i] })).filter(o => o.x != null);
  const pcs = inc.filter(o => o.d); let use = inc;
  if (pcs.length >= 2) { const low = pcs.reduce((l, o) => o.x < l.x ? o : l); use = inc.filter(o => o !== low); }
  near(run(vals).p, use.reduce((s, o) => s + o.x * o.w, 0) / use.reduce((s, o) => s + o.w, 0) / 7.5);
}
// Arquitectura: PAD = PID + 1.54·(SV + PVD), máximo 3701; SV = 5 mejores de 6 vocacionales.
const voc = [80, 70, 85, 60, 90, 75], pvd = 150;
const SV = voc.slice().sort((a, b) => b - a).slice(0, 5).reduce((a, b) => a + b);
const PID = S + 2 * 120 + 4 * 130 + 6 * 115;
near(run(full.concat(voc, [pvd]), true).p, (PID + 1.54 * (SV + pvd)) / 3701 * 20);
assert.equal(run(full.concat(voc, [pvd]), true).vdrop, 13);
near(run(full.concat(voc, [pvd]), false).p, PID / 2700 * 20); // otras carreras ignoran lo vocacional
const pa = [120, 110, 100, null, null, null, null, null, null, null, 80, 70, null, null, null, null, null];
near(run(pa, true).p, ((120 + 2 * 100) + 1.54 * 80) / (150 * 3 + 1.54 * 90) * 20); // cae la 2.ª práctica y la vocacional 2
const xa = need(pa, [16], 15, true);
near(run(pa.map((y, i) => i === 16 ? xa * 200 : y), true).p, 15, 1e-4);
console.log('calculadora PRE: ok');
