#!/usr/bin/env node
/**
 * validate-grammar.js
 *
 * Checks that the ABNF file at the given path is valid RFC 5234 ABNF and is
 * usable as the cdcf: grammar:
 *   - every rule parses (scripts/lib/abnf.js);
 *   - no rule is defined with '=' more than once;
 *   - every '=/' extends a rule that has an initial '=' definition;
 *   - every referenced rule is defined (or is an RFC 5234 core rule);
 *   - the entry rule 'cdcf-id' exists.
 * Rules not reachable from 'cdcf-id' are reported as a warning only: a rule
 * may exist purely to document a convention (e.g. 'roman').
 *
 * Usage: node validate-grammar.js <path-to-abnf-file>
 * Exit code 0 = valid, 1 = invalid (with errors printed to stderr).
 */

const fs = require('fs');
const { parseGrammar, undefinedReferences } = require('./lib/abnf');

const ENTRY_RULE = 'cdcf-id';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node validate-grammar.js <path-to-abnf-file>');
  process.exit(1);
}

let parsed;
try {
  parsed = parseGrammar(fs.readFileSync(file, 'utf8'));
} catch (e) {
  console.error(`ABNF validation FAILED:\n  - ${e.message}`);
  process.exit(1);
}

const { rules, problems } = parsed;
const errors = [...problems];
const warnings = [];

const missing = undefinedReferences(rules);
if (missing.length) errors.push(`Undefined rule(s) referenced: ${missing.join(', ')}`);

if (!rules.has(ENTRY_RULE)) {
  errors.push(`Entry rule '${ENTRY_RULE}' is not defined`);
} else {
  const reachable = new Set();
  const visit = name => {
    if (reachable.has(name) || !rules.has(name)) return;
    reachable.add(name);
    rules.get(name).refs.forEach(visit);
  };
  visit(ENTRY_RULE);
  const unreachable = [...rules.values()].filter(r => !reachable.has(r.name.toLowerCase()));
  if (unreachable.length) {
    warnings.push(`Rule(s) not reachable from '${ENTRY_RULE}': ` +
      unreachable.map(r => `${r.name} (line ${r.line})`).join(', '));
  }
}

if (errors.length) {
  console.error('ABNF validation FAILED:\n' + errors.map(e => '  - ' + e).join('\n'));
  process.exit(1);
}

console.log(`ABNF validation passed: ${rules.size} rules defined, no dangling references.`);
warnings.forEach(w => console.log(`(Warning: ${w})`));
