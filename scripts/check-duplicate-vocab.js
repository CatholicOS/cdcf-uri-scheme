#!/usr/bin/env node
/**
 * check-duplicate-vocab.js
 *
 * Scans a Markdown file for tables whose first column looks like a
 * controlled-vocabulary value (backtick-quoted code spans, e.g.
 * `dogmatic-constitution`) and flags any value that appears more than once
 * within the *same* table block. This is a direct, automated check for the
 * exact bug found during the software-architecture review of version 0.2.0
 * (a duplicated `dogmatic-constitution` row in the documentType vocabulary).
 *
 * Usage: node check-duplicate-vocab.js <markdown-file>
 * Exit code 0 = no duplicates found, 1 = duplicate(s) found.
 */

const fs = require('fs');

const file = process.argv[2];
if (!file) {
  console.error('Usage: node check-duplicate-vocab.js <markdown-file>');
  process.exit(1);
}

const text = fs.readFileSync(file, 'utf8');
const lines = text.split('\n');

let inTable = false;
let currentTableRows = [];
let tableStartLine = 0;
let failed = false;

function flushTable() {
  if (currentTableRows.length < 2) { currentTableRows = []; return; }
  const seen = new Map();
  const keys = currentTableRows.map(r => r.key);
  const uniqueKeys = new Set(keys);

  // Heuristic: if more than half the rows in this table repeat the same
  // first-column value, the first column is a structural/grouping label
  // (e.g. a repeated "cdcf:magisterium/" domain prefix), not a controlled
  // vocabulary key — skip duplicate-checking that table. A real controlled
  // vocabulary (documentType, authorityLevel, cdcf:rel/ values, etc.) has
  // distinct values per row by construction.
  const maxRepeat = Math.max(...keys.map(k => keys.filter(x => x === k).length));
  if (uniqueKeys.size <= keys.length / 2 && maxRepeat > keys.length / 2) {
    currentTableRows = [];
    return;
  }

  for (const { lineNo, key } of currentTableRows) {
    if (seen.has(key)) {
      console.error(
        `${file}:${lineNo}: duplicate vocabulary value \`${key}\` ` +
        `(first seen at line ${seen.get(key)}) in table starting at line ${tableStartLine}`
      );
      failed = true;
    } else {
      seen.set(key, lineNo);
    }
  }
  currentTableRows = [];
}

lines.forEach((line, idx) => {
  const lineNo = idx + 1;
  const isTableRow = /^\|.*\|$/.test(line.trim());
  const isSeparatorRow = /^\|[\s:-]+\|$/.test(line.trim());

  if (isTableRow && !isSeparatorRow) {
    if (!inTable) { inTable = true; tableStartLine = lineNo; }
    const firstCell = line.split('|')[1]?.trim() ?? '';
    const codeMatch = firstCell.match(/^`([^`]+)`$/);
    if (codeMatch) {
      currentTableRows.push({ lineNo, key: codeMatch[1] });
    }
  } else if (isTableRow && isSeparatorRow) {
    // header separator row — ignore, don't flush
  } else {
    if (inTable) { flushTable(); inTable = false; }
  }
});
if (inTable) flushTable();

if (failed) {
  console.error('\nFAILED: duplicate controlled-vocabulary values found.');
  process.exit(1);
}

console.log(`${file}: no duplicate vocabulary values found in any table.`);
