#!/usr/bin/env node
// DRIVE UNIVERSE indexer: walks the public Universe Drive folder tree (read-only, no credentials)
// through Google's embedded folder view and writes universe-ui/data/drive-index.json.
// Usage: node scripts/index-drive.mjs [rootFolderId]
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const ROOT = process.argv[2] || '12ShZq78aaBi6FYzwmTlGCudsgL76Eb93';
const OUT = 'universe-ui/data/drive-index.json';
const CONCURRENCY = 6;
const RETRIES = 4;

const decode = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function listFolder(id) {
  let last;
  for (let attempt = 0; attempt < RETRIES; attempt++) {
    try {
      const res = await fetch(`https://drive.google.com/embeddedfolderview?id=${id}`, { headers: { 'accept-language': 'es' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const html = await res.text();
      const entries = [];
      // One chunk per entry, so a missing field in one entry can never swallow the next one.
      for (const chunk of html.split('<div class="flip-entry" id="entry-').slice(1)) {
        const id = chunk.slice(0, chunk.indexOf('"'));
        const href = (chunk.match(/<a href="([^"]*)"/) || [])[1] || '';
        const kind = (chunk.match(/aria-label="([^"]*)"/) || [])[1] || '';
        const name = (chunk.match(/<div class="flip-entry-title">([\s\S]*?)<\/div>/) || [])[1];
        if (name === undefined) continue;
        entries.push({ id, href: decode(href), kind, name: decode(name) });
      }
      const declared = (html.match(/class="flip-entry"/g) || []).length;
      if (declared !== entries.length) throw new Error(`parsed ${entries.length} of ${declared} entries`);
      return entries;
    } catch (e) { last = e; await sleep(800 * 2 ** attempt); }
  }
  throw last;
}

const typeOf = (name, kind, href) => {
  const ext = (name.match(/\.([a-z0-9]{1,5})$/i) || [])[1];
  if (ext) return ext.toLowerCase();
  if (/document/.test(href)) return 'gdoc';
  if (/spreadsheets/.test(href)) return 'gsheet';
  if (/presentation/.test(href)) return 'gslides';
  if (/forms/.test(href)) return 'gform';
  return (kind || 'file').toLowerCase();
};

const stats = { folders: 0, detected: 0, indexed: 0, duplicates: 0, noUrl: 0, failedFolders: [], shortcutsSkipped: 0 };
const seenFolders = new Set([ROOT]);
const files = new Map();
const queue = [{ id: ROOT, path: [] }];
let active = 0;

await new Promise(done => {
  const pump = () => {
    if (!queue.length && !active) return done();
    while (active < CONCURRENCY && queue.length) {
      const { id, path } = queue.shift();
      active++;
      listFolder(id).then(entries => {
        stats.folders++;
        for (const e of entries) {
          if (/\/drive\/folders\//.test(e.href) || e.kind === 'Folder') {
            if (seenFolders.has(e.id)) { stats.shortcutsSkipped++; continue; } // loop guard (shortcuts)
            seenFolders.add(e.id);
            queue.push({ id: e.id, path: [...path, e.name] });
            continue;
          }
          stats.detected++;
          if (!/^https:\/\//.test(e.href)) { stats.noUrl++; continue; }
          if (files.has(e.id)) { stats.duplicates++; continue; } // same Drive ID = true duplicate
          files.set(e.id, { n: e.name, u: e.href, p: path.join(' › '), t: typeOf(e.name, e.kind, e.href) });
        }
        if (stats.folders % 25 === 0) process.stdout.write(`\r  carpetas ${stats.folders} · archivos ${stats.detected} · en cola ${queue.length}   `);
      }).catch(err => stats.failedFolders.push({ id, path: path.join(' › '), error: String(err.message || err) }))
        .finally(() => { active--; pump(); });
    }
  };
  pump();
});

stats.indexed = files.size;
// Compact format (about a third of the plain JSON): folder paths live once in "paths"; each file is
// [name, driveId, pathIndex, kind] where kind is '' for drive.google.com/file/d/<id>/view or
// 'document' | 'spreadsheets' | 'presentation' | 'forms' for docs.google.com/<kind>/d/<id>/edit.
const paths = [], pathIdx = new Map();
const rows = [...files.entries()].map(([id, f]) => {
  if (!pathIdx.has(f.p)) { pathIdx.set(f.p, paths.length); paths.push(f.p); }
  const kind = (f.u.match(/docs\.google\.com\/(document|spreadsheets|presentation|forms)\//) || [])[1] || '';
  return [f.n, id, pathIdx.get(f.p), kind];
});
for (const [i, r] of rows.entries()) { // every stored row must rebuild the exact URL Drive gave us
  const u = r[3] ? `https://docs.google.com/${r[3]}/d/${r[1]}/` : `https://drive.google.com/file/d/${r[1]}/`;
  if (!files.get(r[1]).u.startsWith(u)) { stats.noUrl++; console.error('URL no reconstruible:', files.get(r[1]).u); }
}
const index = { generatedAt: new Date().toISOString(), root: ROOT, totalFolders: stats.folders, totalFiles: rows.length, paths, files: rows };
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(index));

const ok = stats.failedFolders.length === 0 && stats.noUrl === 0 && stats.detected === stats.indexed + stats.duplicates;
console.log(`\n\nINDEXACIÓN DRIVE UNIVERSE
Carpetas recorridas: ${stats.folders}
Archivos detectados: ${stats.detected}
Archivos indexados: ${stats.indexed}
Duplicados eliminados (mismo ID): ${stats.duplicates}
Archivos sin enlace: ${stats.noUrl}
Accesos directos a carpetas ya visitadas: ${stats.shortcutsSkipped}
Carpetas con error: ${stats.failedFolders.length}
${stats.failedFolders.map(f => `  - ${f.path || '(raíz)'} [${f.id}]: ${f.error}`).join('\n')}
${ok ? 'Índice verificado correctamente.' : 'ATENCIÓN: el índice no cuadra; revisa los errores.'}
Archivo: ${OUT}`);
process.exitCode = ok ? 0 : 1;
