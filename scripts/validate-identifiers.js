#!/usr/bin/env node
/**
 * validate-identifiers.js
 *
 * Extracts every cdcf: identifier referenced in the example files and checks
 * it against a small set of structural rules derived from
 * spec/appendix-d-abnf.abnf (lower-case ASCII only, valid domain prefix,
 * hyphen-separated slugs, no trailing slash, <= 256 chars).
 *
 * This is NOT a full ABNF interpreter — it re-implements the per-domain
 * shape checks in JS for speed and zero dependencies. If the grammar file
 * changes, this script's DOMAIN_PATTERNS must be kept in sync (this is a
 * known limitation — see Open Issue 12 in spec/08-open-issues.md regarding
 * ABNF maintenance process).
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

const [, , grammarPath, examplesDir] = process.argv;
if (!grammarPath || !examplesDir) {
  console.error('Usage: node validate-identifiers.js <grammar-file> <examples-dir>');
  process.exit(1);
}

if (!fs.existsSync(grammarPath)) {
  console.error(`Grammar file not found: ${grammarPath}`);
  process.exit(1);
}

// v0.5.0: `person` withdrawn (§3.6.1), `work` added (§3.6).
const VALID_DOMAINS = ['verse', 'book', 'magisterium', 'ccc', 'canon', 'concept', 'work', 'institution', 'rel'];

const DOMAIN_PATTERNS = {
  verse:        /^verse\/[a-z0-9]+\/\d+(\/\d+(-\d+)?)?$/,
  book:         /^book\/[a-z0-9]+$/,
  magisterium:  /^magisterium\/[a-z0-9-]+\/[a-z0-9-]+(\/(chapter|canon|paragraph|article)\/\d+)?$/,
  ccc:          /^ccc\/\d+(-\d+)?$/,
  canon:        /^canon\/(cic1983|cic1917|cceo)\/\d+(\/(\d+|authentic-interpretation\/\d{4}-\d{2}-\d{2}))?$/,
  // Opaque, case-sensitive "CN" prefix + 4–8 digits (Appendix D: %x43.4E 4*8DIGIT)
  concept:      /^concept\/CN\d{4,8}$/,
  work:         /^work\/[a-z0-9-]+(\/[a-z0-9-]+)*$/,
  institution:  /^institution\/(diocese|conference|council|order|dicastery|seminary|eastern-church)\/[a-z0-9-]+$/,
  rel:          /^rel\/(magisterial-proof-text|patristic-interpretation|liturgical-use|theological-argument|typological-sense|anagogical-sense|defines-concept|supersedes|interprets|contradicted-by)$/
};

function extractCdcfRefs(obj, acc = [], keyHint = null) {
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
      extractCdcfRefs(v, acc, k);
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
    if (ref.length > 256) {
      console.error(`${file}: cdcf:${ref} — exceeds 256 character limit`);
      failed = true;
      continue;
    }
    const domain = ref.split('/')[0];
    // §2.3 rule 1: lower-case only, except the fixed upper-case prefix of an
    // opaque identifier — which the concept pattern below enforces exactly.
    const allowedChars = domain === 'concept' ? /^[a-zA-Z0-9\-/.]+$/ : /^[a-z0-9\-/.]+$/;
    if (!allowedChars.test(ref)) {
      console.error(`${file}: cdcf:${ref} — contains characters outside lower-case ASCII/digits/hyphen/slash`);
      failed = true;
      continue;
    }
    if (!VALID_DOMAINS.includes(domain)) {
      console.error(`${file}: cdcf:${ref} — unknown domain "${domain}"`);
      failed = true;
      continue;
    }
    const pattern = DOMAIN_PATTERNS[domain];
    if (!pattern.test(ref)) {
      console.error(`${file}: cdcf:${ref} — does not match ${domain} domain grammar`);
      failed = true;
      continue;
    }
  }
  if (refs.length) console.log(`${file}: ${refs.length} identifier(s) checked`);
}

if (failed) {
  console.error(`\nFAILED: one or more cdcf: identifiers do not conform to the grammar.`);
  process.exit(1);
}

console.log(`\nAll ${totalChecked} cdcf: identifier(s) across ${files.length} file(s) conform to the grammar.`);
