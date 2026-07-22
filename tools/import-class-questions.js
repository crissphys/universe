#!/usr/bin/env node
/*
 * Importa un JSON privado de preguntas al backend.
 *
 * Uso:
 *   UNIVERSE_AUTH_TOKEN=... node tools/import-class-questions.js tmp/aritmetica.json
 *
 * El token debe pertenecer a una cuenta Google administradora.
 */

const fs = require('node:fs');

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error('Falta ruta JSON');
  const token = process.env.UNIVERSE_AUTH_TOKEN;
  if (!token) throw new Error('Falta UNIVERSE_AUTH_TOKEN');
  const origin = (process.env.UNIVERSE_SITE_ORIGIN || 'https://universetostudy.com').replace(/\/+$/, '');
  const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!payload.course || !payload.topic || !Array.isArray(payload.questions)) {
    throw new Error('JSON invalido: requiere course, topic y questions[]');
  }
  const response = await fetch(`${origin}/api/classes/admin/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${text}`);
  console.log(text);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
