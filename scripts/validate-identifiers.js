#!/usr/bin/env node
/**
 * validate-identifiers.js
 *
 * Extracts every cdcf: identifier referenced in the example files and checks
 * it against the normative grammar in spec/appendix-d-abnf.abnf, which is
 * parsed and interpreted directly (scripts/lib/abnf.js) — there is no
 * hand-maintained copy of the grammar to keep in sync (§6.6). Segments the
 * grammar leaves to the registry (canon-law code, institution type,
 * cdcf:rel/ value) are checked against the tables in spec/03-domains.md.
 * See scripts/lib/cdcf-id.js for the exact rules.
 *
 * Error response bodies (objects with an "error" key) echo the identifier the
 * client *requested* in their "identifier" field, which may legitimately be
 * malformed or from a withdrawn domain (e.g. a former cdcf:person/ path,
 * §3.6.1). That one field is skipped; every other cdcf: value in an error
 * body (e.g. "suggestion", "successor") is still checked.
 *
 * Usage: node validate-identifiers.js <grammar-file> <examples-dir>
 * Exit code 0 = all identifiers conform, 1 = at least one violation.
 */

const fs = require('fs');
const path = require('path');
const { createChecker } = require('./lib/cdcf-id');

const [, , grammarPath, examplesDir] = process.argv;
if (!grammarPath || !examplesDir) {
  console.error('Usage: node validate-identifiers.js <grammar-file> <examples-dir>');
  process.exit(1);
}

if (!fs.existsSync(grammarPath)) {
  console.error(`Grammar file not found: ${grammarPath}`);
  process.exit(1);
}

let check;
try {
  check = createChecker(grammarPath);
} catch (e) {
  console.error(`Cannot build identifier checker: ${e.message}`);
  process.exit(1);
}

function extractCdcfRefs(obj, acc = []) {
  if (typeof obj === 'string') {
    if (obj.startsWith('cdcf:')) {
      const value = obj.slice('cdcf:'.length);
      // Skip @type / rdfs:domain / rdfs:range values: these name RDF/OWL
      // classes (e.g. cdcf:BibleVerse, cdcf:Concept), not cdcf: path
      // identifiers, and are capitalised by convention rather than following
      // the lower-case slug grammar in Appendix D.
      const isClassName = /^[A-Z]/.test(value);
      if (!isClassName) acc.push(value);
    }
  } else if (Array.isArray(obj)) {
    obj.forEach(v => extractCdcfRefs(v, acc));
  } else if (obj && typeof obj === 'object') {
    const isErrorBody = Object.prototype.hasOwnProperty.call(obj, 'error');
    Object.entries(obj).forEach(([k, v]) => {
      if (isErrorBody && k === 'identifier') return;
      extractCdcfRefs(v, acc);
    });
  }
  return acc;
}

const files = fs.readdirSync(examplesDir).filter(f => f.endsWith('.jsonld') || f.endsWith('.json'));
let failed = false;
let totalChecked = 0;

for (const file of files) {
  const full = path.join(examplesDir, file);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch (e) {
    console.error(`${file}: skipped (invalid JSON — see validate-jsonld.js output)`);
    continue;
  }

  const refs = extractCdcfRefs(data);
  for (const ref of refs) {
    totalChecked++;
    const problem = check(ref);
    if (problem) {
      console.error(`${file}: cdcf:${ref} — ${problem}`);
      failed = true;
    }
  }
  if (refs.length) console.log(`${file}: ${refs.length} identifier(s) checked`);
}

if (failed) {
  console.error(`\nFAILED: one or more cdcf: identifiers do not conform to the grammar.`);
  process.exit(1);
}

console.log(`\nAll ${totalChecked} cdcf: identifier(s) across ${files.length} file(s) conform to the grammar.`);
