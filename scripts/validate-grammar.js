#!/usr/bin/env node
/**
 * validate-grammar.js
 *
 * Checks that the ABNF file at the given path is syntactically valid ABNF
 * (RFC 5234): every rule is defined, no duplicate rule names, no dangling
 * references to undefined rules.
 *
 * This is a minimal hand-rolled checker, not a full RFC 5234 parser. It is
 * deliberately simple so maintainers can see exactly what it checks. Swap in
 * a real ABNF parsing library (e.g., an npm `abnf` package) for production
 * use — keep the same CLI interface: `node validate-grammar.js <path>`.
 *
 * Exit code 0 = valid, 1 = invalid (with errors printed to stderr).
 */

const fs = require('fs');

const path = process.argv[2];
if (!path) {
  console.error('Usage: node validate-grammar.js <path-to-abnf-file>');
  process.exit(1);
}

const text = fs.readFileSync(path, 'utf8');
const lines = text.split('\n');

const defined = new Set();
const referenced = new Set();
const errors = [];

// Built-in core rules we don't expect local definitions for.
const CORE_RULES = new Set(['ALPHA', 'DIGIT']);

for (const [i, rawLine] of lines.entries()) {
  const line = rawLine.replace(/;.*$/, '').trim(); // strip comments
  if (!line) continue;

  // Rule definition: `name = ...` or continuation `name =/ ...`
  const defMatch = line.match(/^([A-Za-z][A-Za-z0-9-]*)\s*=\/?\s*(.*)$/);
  if (defMatch) {
    const [, name, rhs] = defMatch;
    defined.add(name);

    // Strip quoted string literals (e.g. "authentic-interpretation") and
    // hex/numeric terminal escapes (e.g. %x61-7A, 4DIGIT-style repeat counts
    // are handled separately) before scanning for bare-word rule references.
    const rhsNoLiterals = rhs
      .replace(/"[^"]*"/g, ' ')        // quoted literals
      .replace(/%x[0-9A-Fa-f.-]+/g, ' '); // hex escapes, incl. concatenations like %x43.4E

    for (const ref of rhsNoLiterals.matchAll(/\b[A-Za-z][A-Za-z0-9-]*\b/g)) {
      referenced.add(ref[0]);
    }
  }
}

for (const name of [...referenced]) {
  if (CORE_RULES.has(name)) referenced.delete(name);
}

const undefinedRefs = [...referenced].filter(r => !defined.has(r) && !CORE_RULES.has(r));
const unusedDefs = [...defined].filter(d => !referenced.has(d) && d !== 'cdcf-id');

if (undefinedRefs.length) {
  errors.push(`Undefined rule(s) referenced: ${undefinedRefs.join(', ')}`);
}

// Check for accidental duplicate *exact* `=` (non-incremental) definitions.
const exactDefCounts = {};
for (const rawLine of lines) {
  const line = rawLine.replace(/;.*$/, '').trim();
  const m = line.match(/^([A-Za-z][A-Za-z0-9-]*)\s*=\s+/);
  if (m) exactDefCounts[m[1]] = (exactDefCounts[m[1]] || 0) + 1;
}
const duplicates = Object.entries(exactDefCounts).filter(([, c]) => c > 1).map(([n]) => n);
if (duplicates.length) {
  errors.push(`Rule(s) defined with non-incremental '=' more than once: ${duplicates.join(', ')}`);
}

if (errors.length) {
  console.error('ABNF validation FAILED:\n' + errors.map(e => '  - ' + e).join('\n'));
  process.exit(1);
}

console.log(`ABNF validation passed: ${defined.size} rules defined, no dangling references.`);
if (unusedDefs.length) {
  console.log(`(Info: rules defined but not referenced elsewhere in the file: ${unusedDefs.join(', ')} — expected for entry points like 'cdcf-id'.)`);
}
process.exit(0);
