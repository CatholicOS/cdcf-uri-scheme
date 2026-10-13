/**
 * abnf.js — a small, dependency-free RFC 5234 parser and matcher.
 *
 * Supports what spec/appendix-d-abnf.abnf uses: rule definitions (`=`) and
 * incremental alternatives (`=/`), continuation lines, comments, alternation,
 * concatenation, repetition (`n*m`, `*`, `n`), groups, options, quoted
 * strings and numeric values (`%x`, `%d`, `%b`, with ranges and `.` series).
 * Prose values (`<...>`) are not supported.
 *
 * The matcher interprets the grammar directly, so validators never carry a
 * hand-maintained copy of it (spec/06-governance.md §6.6). It computes the
 * set of every end position each element can reach, so ambiguous
 * alternatives and repetitions need no backtracking heuristics.
 *
 * Quoted strings are case-insensitive, as RFC 5234 §2.3 requires, unless
 * the caller passes { caseSensitiveStrings: true }. The cdcf: validators do,
 * because §2.3 rule 1 of the specification requires lower case regardless.
 */

'use strict';

// RFC 5234 Appendix B core rules, used only where the grammar does not define
// a rule of the same name itself (Appendix D redefines ALPHA as lower-case).
const CORE_RULES = {
  alpha:  '%x41-5A / %x61-7A',
  digit:  '%x30-39',
  hexdig: 'DIGIT / "A" / "B" / "C" / "D" / "E" / "F"',
  dquote: '%x22',
  sp:     '%x20',
};

class AbnfError extends Error {}

/** Join continuation lines into one entry per rule; strip comments. */
function splitRules(text) {
  const rules = [];
  text.split(/\r?\n/).forEach((raw, idx) => {
    const line = stripComment(raw);
    if (!line.trim()) return;
    if (/^\s/.test(line)) {
      if (!rules.length) throw new AbnfError(`line ${idx + 1}: continuation line before any rule`);
      rules[rules.length - 1].text += ' ' + line.trim();
    } else {
      rules.push({ line: idx + 1, text: line.trim() });
    }
  });
  return rules;
}

/** Remove a `;` comment, ignoring semicolons inside quoted strings. */
function stripComment(line) {
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') inQuote = !inQuote;
    else if (line[i] === ';' && !inQuote) return line.slice(0, i);
  }
  return line;
}

function tokenize(src, line) {
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const rest = src.slice(i);
    let m;
    if (/^\s/.test(rest)) { i++; continue; }
    if ((m = rest.match(/^"([^"]*)"/))) {
      tokens.push({ type: 'string', value: m[1] });
    } else if ((m = rest.match(/^%([xdb])([0-9A-Fa-f]+)((?:-[0-9A-Fa-f]+)|(?:\.[0-9A-Fa-f]+)+)?/i))) {
      tokens.push({ type: 'num', ...parseNumVal(m, line) });
    } else if ((m = rest.match(/^(\d*)\*(\d*)/))) {
      tokens.push({ type: 'repeat', min: m[1] ? +m[1] : 0, max: m[2] ? +m[2] : Infinity });
    } else if ((m = rest.match(/^\d+/))) {
      tokens.push({ type: 'repeat', min: +m[0], max: +m[0] });
    } else if ((m = rest.match(/^[A-Za-z][A-Za-z0-9-]*/))) {
      tokens.push({ type: 'name', value: m[0] });
    } else if ('/()[]'.includes(rest[0])) {
      tokens.push({ type: rest[0] });
      m = [rest[0]];
    } else {
      throw new AbnfError(`line ${line}: unexpected character '${rest[0]}'`);
    }
    i += m[0].length;
  }
  return tokens;
}

function parseNumVal(m, line) {
  const base = { x: 16, d: 10, b: 2 }[m[1].toLowerCase()];
  const num = s => {
    const n = parseInt(s, base);
    if (Number.isNaN(n)) throw new AbnfError(`line ${line}: bad numeric value '${m[0]}'`);
    return n;
  };
  const first = num(m[2]);
  if (!m[3]) return { kind: 'series', codes: [first] };
  if (m[3][0] === '-') return { kind: 'range', lo: first, hi: num(m[3].slice(1)) };
  return { kind: 'series', codes: [first, ...m[3].slice(1).split('.').map(num)] };
}

/** Recursive descent over the RFC 5234 element grammar. */
function parseElements(tokens, line) {
  let pos = 0;
  const peek = () => tokens[pos];
  const expect = type => {
    if (peek()?.type !== type) throw new AbnfError(`line ${line}: expected '${type}'`);
    pos++;
  };

  function alternation() {
    const alts = [concatenation()];
    while (peek()?.type === '/') { pos++; alts.push(concatenation()); }
    return alts.length === 1 ? alts[0] : { type: 'alt', alts };
  }
  function concatenation() {
    const items = [];
    while (peek() && !['/', ')', ']'].includes(peek().type)) items.push(repetition());
    if (!items.length) throw new AbnfError(`line ${line}: empty concatenation`);
    return items.length === 1 ? items[0] : { type: 'seq', items };
  }
  function repetition() {
    if (peek().type === 'repeat') {
      const { min, max } = tokens[pos++];
      return { type: 'rep', min, max, el: element() };
    }
    return element();
  }
  function element() {
    const t = tokens[pos++];
    if (!t) throw new AbnfError(`line ${line}: unexpected end of rule`);
    switch (t.type) {
      case 'name':   return { type: 'ref', name: t.value.toLowerCase(), display: t.value };
      case 'string': return { type: 'string', value: t.value };
      case 'num':    return t;
      case '(': { const e = alternation(); expect(')'); return e; }
      case '[': { const e = alternation(); expect(']'); return { type: 'rep', min: 0, max: 1, el: e }; }
      default: throw new AbnfError(`line ${line}: unexpected '${t.type}'`);
    }
  }

  const node = alternation();
  if (pos !== tokens.length) throw new AbnfError(`line ${line}: unexpected '${peek().type}'`);
  return node;
}

/** Collect the rule names an element tree references. */
function references(node, acc = new Set()) {
  switch (node.type) {
    case 'ref': acc.add(node.name); break;
    case 'alt': node.alts.forEach(n => references(n, acc)); break;
    case 'seq': node.items.forEach(n => references(n, acc)); break;
    case 'rep': references(node.el, acc); break;
  }
  return acc;
}

/**
 * Parse a grammar. Returns { rules, problems } where `rules` maps lower-cased
 * rule names to { name, line, node, refs } and `problems` lists RFC 5234
 * violations found while assembling the rule set (syntax errors throw).
 */
function parseGrammar(text) {
  const rules = new Map();
  const problems = [];
  const incrementals = [];

  for (const { line, text: src } of splitRules(text)) {
    const m = src.match(/^([A-Za-z][A-Za-z0-9-]*)\s*(=\/|=)\s*(.*)$/);
    if (!m) throw new AbnfError(`line ${line}: expected 'rulename =' or 'rulename =/'`);
    const [, name, op, rhs] = m;
    const key = name.toLowerCase();
    const node = parseElements(tokenize(rhs, line), line);

    if (op === '=') {
      if (rules.has(key)) {
        problems.push(`line ${line}: rule '${name}' defined with '=' more than once (first at line ${rules.get(key).line})`);
      } else {
        rules.set(key, { name, line, node });
      }
    } else {
      incrementals.push({ key, name, line, node });
    }
  }

  // RFC 5234 §3.3: `=/` adds alternatives to an existing rule.
  for (const inc of incrementals) {
    const base = rules.get(inc.key);
    if (!base) {
      problems.push(`line ${inc.line}: '${inc.name} =/' has no initial '${inc.name} =' definition (RFC 5234 §3.3)`);
      continue;
    }
    const alts = base.node.type === 'alt' ? base.node.alts : [base.node];
    base.node = { type: 'alt', alts: [...alts, inc.node] };
  }

  for (const rule of rules.values()) rule.refs = references(rule.node);
  return { rules, problems };
}

/** Rules referenced but defined neither in the grammar nor as core rules. */
function undefinedReferences(rules) {
  const missing = new Set();
  for (const rule of rules.values()) {
    for (const ref of rule.refs) if (!rules.has(ref) && !CORE_RULES[ref]) missing.add(ref);
  }
  return [...missing];
}

/**
 * Build a full-string matcher for `entryRule`. The returned function takes a
 * string and returns true only if the whole string derives from that rule.
 */
function compileMatcher(text, entryRule, { caseSensitiveStrings = false } = {}) {
  const { rules, problems } = parseGrammar(text);
  if (problems.length) throw new AbnfError(problems.join('\n'));
  const missing = undefinedReferences(rules);
  if (missing.length) throw new AbnfError(`undefined rule(s): ${missing.join(', ')}`);

  const nodeFor = name => {
    if (rules.has(name)) return rules.get(name).node;
    const core = parseElements(tokenize(CORE_RULES[name], 0), 0);
    rules.set(name, { name, node: core, refs: references(core) });
    return core;
  };
  const entry = entryRule.toLowerCase();
  if (!rules.has(entry)) throw new AbnfError(`entry rule '${entryRule}' is not defined`);

  return function matches(input) {
    const memo = new Map(); // `${rule}@${pos}` → Set of end positions

    function ends(node, pos) {
      switch (node.type) {
        case 'ref': {
          const key = `${node.name}@${pos}`;
          if (!memo.has(key)) {
            memo.set(key, new Set()); // guards against left recursion
            memo.set(key, ends(nodeFor(node.name), pos));
          }
          return memo.get(key);
        }
        case 'alt': {
          const out = new Set();
          for (const a of node.alts) for (const e of ends(a, pos)) out.add(e);
          return out;
        }
        case 'seq': {
          let frontier = new Set([pos]);
          for (const item of node.items) {
            const next = new Set();
            for (const p of frontier) for (const e of ends(item, p)) next.add(e);
            if (!next.size) return next;
            frontier = next;
          }
          return frontier;
        }
        case 'rep': {
          const out = new Set();
          const explored = new Set();
          let frontier = new Set([pos]);
          if (node.min === 0) { out.add(pos); explored.add(pos); }
          for (let n = 1; n <= node.max && frontier.size; n++) {
            const next = new Set();
            for (const p of frontier) for (const e of ends(node.el, p)) next.add(e);
            if (n >= node.min) {
              // Past the minimum, a position already reached yields nothing new.
              frontier = new Set([...next].filter(e => !explored.has(e)));
              frontier.forEach(e => { out.add(e); explored.add(e); });
            } else {
              frontier = next;
            }
          }
          return out;
        }
        case 'string': {
          const s = input.slice(pos, pos + node.value.length);
          const ok = caseSensitiveStrings
            ? s === node.value
            : s.toLowerCase() === node.value.toLowerCase();
          return ok ? new Set([pos + node.value.length]) : new Set();
        }
        case 'num': {
          if (node.kind === 'range') {
            const c = input.codePointAt(pos);
            return c >= node.lo && c <= node.hi ? new Set([pos + 1]) : new Set();
          }
          for (let i = 0; i < node.codes.length; i++) {
            if (input.codePointAt(pos + i) !== node.codes[i]) return new Set();
          }
          return new Set([pos + node.codes.length]);
        }
        default:
          throw new AbnfError(`unknown node type '${node.type}'`);
      }
    }

    return ends(nodeFor(entry), 0).has(input.length);
  };
}

module.exports = { AbnfError, parseGrammar, undefinedReferences, compileMatcher, CORE_RULES };
