/**
 * cdcf-id.js — shared cdcf: identifier checks for the CI validators.
 *
 * An identifier conforms when:
 *   1. it is at most 256 characters (§2.3 rule 7);
 *   2. it derives from the `cdcf-id` rule of Appendix D, with quoted strings
 *      matched case-sensitively so that §2.3 rule 1 (lower case except the
 *      fixed opaque prefix) is enforced by the same check; and
 *   3. any segment the grammar leaves to the registry (§6.6) — the canon-law
 *      code, institution type and cdcf:rel/ value — is a registered value.
 *
 * Registered values are read from the vocabulary tables in
 * spec/03-domains.md, which hold the registry's initial content. Each table
 * is located by the text of its first header cell.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { compileMatcher } = require('./abnf');

const MAX_LENGTH = 256;

// domain → { segment index (0 = domain), header of the registry table }
const REGISTERED_SEGMENTS = {
  canon:       { index: 1, header: 'Code' },
  institution: { index: 1, header: 'Institution type' },
  rel:         { index: 1, header: '`cdcf:rel/` value' },
};

/** First-column code-span values of the table whose first header cell is `header`. */
function readTableValues(markdown, header) {
  const lines = markdown.split(/\r?\n/);
  const firstCell = l => (l.split('|')[1] ?? '').trim();
  const start = lines.findIndex(l => /^\|.*\|\s*$/.test(l.trim()) && firstCell(l) === header);
  if (start === -1) return null;
  const values = new Set();
  for (const line of lines.slice(start + 2)) {
    if (!/^\|.*\|\s*$/.test(line.trim())) break;
    const m = firstCell(line).match(/^`([^`]+)`$/);
    if (m) values.add(m[1]);
  }
  return values;
}

/**
 * Build a checker from the grammar file. The registry tables are read from
 * 03-domains.md next to the grammar. Returns `check(id)`, which takes an
 * identifier with or without the `cdcf:` prefix and returns null if it
 * conforms or a reason string if it does not.
 */
function createChecker(grammarPath) {
  const grammar = fs.readFileSync(grammarPath, 'utf8');
  const matches = compileMatcher(grammar, 'cdcf-id', { caseSensitiveStrings: true });

  const domainsPath = path.join(path.dirname(grammarPath), '03-domains.md');
  const domainsMd = fs.readFileSync(domainsPath, 'utf8');
  const registered = {};
  for (const [domain, { header }] of Object.entries(REGISTERED_SEGMENTS)) {
    const values = readTableValues(domainsMd, header);
    if (!values || !values.size) {
      throw new Error(`${domainsPath}: no registry table with first header cell "${header}"`);
    }
    registered[domain] = values;
  }

  return function check(id) {
    const value = id.startsWith('cdcf:') ? id.slice('cdcf:'.length) : id;
    if (value.length > MAX_LENGTH) return `exceeds ${MAX_LENGTH} character limit`;
    if (!matches(value)) return 'does not conform to the cdcf-id production in Appendix D';

    const segments = value.split('/');
    const reg = REGISTERED_SEGMENTS[segments[0]];
    if (reg && !registered[segments[0]].has(segments[reg.index])) {
      return `"${segments[reg.index]}" is not a registered ${reg.header.replace(/`/g, '')} ` +
        `(see spec/03-domains.md)`;
    }
    return null;
  };
}

module.exports = { createChecker, readTableValues };
