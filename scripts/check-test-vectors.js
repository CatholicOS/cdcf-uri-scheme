#!/usr/bin/env node
/**
 * check-test-vectors.js
 *
 * Asserts the grammar test vectors (spec/06-governance.md §6.6): every
 * identifier in <dir>/valid.txt MUST conform, and every identifier in
 * <dir>/invalid.txt MUST be rejected, by the same checks that
 * validate-identifiers.js applies to the examples (scripts/lib/cdcf-id.js).
 *
 * File format: one identifier per line; "#" starts a comment, either on its
 * own line or after the identifier (the reason it is invalid).
 *
 * Usage: node check-test-vectors.js <grammar-file> <test-vectors-dir>
 * Exit code 0 = all vectors behave as declared, 1 = at least one does not.
 */

const fs = require('fs');
const path = require('path');
const { createChecker } = require('./lib/cdcf-id');

const [, , grammarPath, vectorsDir] = process.argv;
if (!grammarPath || !vectorsDir) {
  console.error('Usage: node check-test-vectors.js <grammar-file> <test-vectors-dir>');
  process.exit(1);
}

let check;
try {
  check = createChecker(grammarPath);
} catch (e) {
  console.error(`Cannot build identifier checker: ${e.message}`);
  process.exit(1);
}

function readVectors(file) {
  return fs.readFileSync(path.join(vectorsDir, file), 'utf8')
    .split(/\r?\n/)
    .map((line, i) => ({ lineNo: i + 1, id: line.replace(/#.*$/, '').trim() }))
    .filter(v => v.id);
}

let failed = false;
const valid = readVectors('valid.txt');
const invalid = readVectors('invalid.txt');

for (const { lineNo, id } of valid) {
  const problem = check(id);
  if (problem) {
    console.error(`valid.txt:${lineNo}: ${id} — expected valid, but ${problem}`);
    failed = true;
  }
}
for (const { lineNo, id } of invalid) {
  if (!check(id)) {
    console.error(`invalid.txt:${lineNo}: ${id} — expected invalid, but it conforms`);
    failed = true;
  }
}

if (failed) {
  console.error('\nFAILED: grammar test vectors do not behave as declared.');
  process.exit(1);
}
console.log(`All ${valid.length} valid and ${invalid.length} invalid test vector(s) behave as declared.`);
