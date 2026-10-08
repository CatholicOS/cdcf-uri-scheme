#!/usr/bin/env node
/**
 * validate-jsonld.js
 *
 * Walks the given directory and checks every *.jsonld and *.json file:
 *   1. Parses as valid JSON
 *   2. If it has an "@context" or "@id" key, performs a minimal sanity check
 *      that referenced cdcf: identifiers look like cdcf: URIs (does not
 *      validate them against the ABNF grammar — see validate-identifiers.js
 *      for that).
 *
 * Swap in a real JSON-LD processor (e.g., the `jsonld` npm package, doing an
 * actual expand() call) for stricter semantic validation. This script
 * intentionally stays dependency-free so it runs without a network fetch of
 * the @context document.
 *
 * Exit code 0 = all files valid, 1 = at least one failure.
 */

const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
if (!dir) {
  console.error('Usage: node validate-jsonld.js <examples-dir>');
  process.exit(1);
}

const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsonld') || f.endsWith('.json'));
let failed = false;

for (const file of files) {
  const full = path.join(dir, file);
  const raw = fs.readFileSync(full, 'utf8');
  try {
    const obj = JSON.parse(raw);

    // Minimal structural sanity checks for cdcf: identifiers found in the doc.
    const cdcfRefs = [];
    JSON.stringify(obj, (k, v) => {
      if (typeof v === 'string' && v.startsWith('cdcf:')) cdcfRefs.push(v);
      return v;
    });

    const malformed = cdcfRefs.filter(ref => {
      const value = ref.slice('cdcf:'.length);
      if (/^[A-Z]/.test(value)) return false; // RDF/OWL class name, e.g. cdcf:BibleVerse — not a path identifier
      return !/^[a-z][a-z0-9-]*\/[a-z0-9\-/.]+$/i.test(value)
        && !/^[a-z][a-z0-9-]*\/[a-z0-9-]+$/i.test(value);
    });

    if (malformed.length) {
      console.error(`${file}: possibly malformed cdcf: reference(s): ${malformed.join(', ')}`);
      failed = true;
    } else {
      console.log(`${file}: OK (${cdcfRefs.length} cdcf: reference(s) found, JSON valid)`);
    }
  } catch (e) {
    console.error(`${file}: INVALID JSON — ${e.message}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log(`\nAll ${files.length} example file(s) passed.`);
