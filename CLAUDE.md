# CLAUDE.md — cdcf-uri-scheme

Specification repo for the `cdcf:` URI scheme (Catholic Digital Commons Foundation).
Current release: **draft-cdcf-catholic-uri-scheme-04, version 0.5.0** (Oct 2026).
The authoritative source of each release was a `.docx` draft; this repo is now the
source of truth, and Git history + `CHANGELOG.md` replace the docx "Change Rationale"
appendices.

Working plan for the next release (open-issue resolutions, triage, PR scope):
@notes/open-issues-plan.md

## Layout

- `spec/00-…09-*.md`, `spec/appendix-{a,b}-*.md` — the specification, one file per section
- `spec/appendix-d-abnf.abnf` — **normative grammar** (machine-readable)
- `examples/*.jsonld|json` — worked resolution responses; every `cdcf:` value in them is
  validated by CI
- `scripts/*.js` — dependency-free Node validators run by `.github/workflows/validate.yml`
- `CODEOWNERS` — review gates (placeholder `@cdcf/...` teams)

## Section numbering — read before editing cross-references

Repo section numbers are **one lower than the docx** for §3–§10, because Terminology is
folded into `00-abstract.md`: docx §3 → repo §2 (`02-syntax.md`), docx §4.6.1 → repo
§3.6.1, docx §5 → §4, §6 → §5, §7 → §6, §8 and §9 (Open Standards Alignment) → §7
(`07-security.md`), §10 → §8, §11 → §9. Open Issues are numbered **1–18** (the docx's
"20–37" numbering is a Word list-continuation glitch). Always use repo numbers.

## Conventions

- Revision markers: `[REV-02]` = 0.3.0, `[REV-03]` = 0.4.0, `[REV-04]` = 0.5.0; new
  sections `[NEW — REV-0n]`. Use `[REV-05]` for the next release.
- Every spec file ends with a `**Previous:** … · **Next:** …` nav footer — keep it valid.
- Cross-references use GitHub heading anchors, e.g.
  `03-domains.md#361-persons-as-ontology-individuals-new--rev-04`. If you rename a heading,
  fix every anchor that points to it (grep for the old slug).
- Code spans for every identifier, field name, header, and vocabulary value.
- Controlled-vocabulary tables put the value in the first column as a code span (CI checks
  for duplicates).
- Identifier rules: lower-case ASCII except the opaque `CN` prefix; OSIS book IDs exactly
  as OSIS 2.1.1, lower-cased (`john`, `matt` — never `jn`, `mt`); papal slugs carry the
  ordinal only when part of the official name (`pope-francis`, `pope-leo-xiii`).
- `cdcf:person/` is **withdrawn** (0.5.0). Persons are CDCF-ontology individuals; works
  are `cdcf:work/`. Never introduce `cdcf:person/` identifiers in spec or examples.
- No identifier has reached a stable release yet, so renames are still free — but record
  every rename in `CHANGELOG.md`.

## Before finishing any change

Run all CI checks (Node 20, no install needed):

```sh
node scripts/validate-grammar.js     spec/appendix-d-abnf.abnf
node scripts/validate-jsonld.js      examples/
node scripts/validate-identifiers.js spec/appendix-d-abnf.abnf examples/
node scripts/check-test-vectors.js  spec/appendix-d-abnf.abnf examples/test-vectors/
node scripts/check-duplicate-vocab.js spec/03-domains.md
node scripts/check-duplicate-vocab.js spec/appendix-b-eastern-churches.md
```

The validators interpret the ABNF directly (`scripts/lib/abnf.js`, RFC 5234 subset) — there
are no hand-synced regexes. Quoted strings are matched case-sensitively (§2.3 rule 1).
Registered values for `code`, `inst-type` and `rel-slug` are read from the tables in
`spec/03-domains.md` whose first header cell is `Code`, `Institution type` and
`` `cdcf:rel/` value `` (`scripts/lib/cdcf-id.js`) — keep those headers. Any grammar change
must add vectors to `examples/test-vectors/{valid,invalid}.txt` (§6.6). YAML values
containing `: ` must be quoted (the workflow's `name:` once broke CI this way).

Update `CHANGELOG.md` (Keep a Changelog format) for every substantive change.

## Review boundaries — do not decide these silently

Changes to the following are theological/canonical and need Technical Advisory Group
sign-off (§6.3, `CODEOWNERS`). Draft them if asked, but flag them clearly as
**needs TAG review** in the PR description rather than presenting them as settled:

- `spec/05-authority.md` (authority levels / assent taxonomy)
- `documentType`, `papalApproval`, and the `cdcf:rel/` vocabulary
- concept definitions, `authorityLevel` values, `skos:notation` changes
- canonical status of Scripture books per tradition; Psalm numbering choice
- how persons, popes, and Doctors of the Church are modelled
- identifiers for patristic works: clavis-number keys, title language of work slugs
  (Open Issue 16, `draft-cdcf-patristics-00`)
- roadmap deferrals: whether liturgy and particular law become 1.0.0 domains or
  sub-specifications (Open Issues 4 and 9)

Every remaining Open Issue carries the `needs TAG review` label on GitHub; issues that
also need committee discussion before drafting carry `committee`. There is no Board
sign-off step.

Do not invent `authorityLevel` values or theological claims in examples.

## Known defects (not yet fixed)

- `CODEOWNERS` uses placeholder teams.
- `osis-book` is any `slug`, so `jn` is grammatically valid (registered book list is
  Open Issue 2).

(Fixed, unreleased `[REV-05]`: domain-bound `cdcf-id`, the bare `domain-path =/`,
`concept-num` padding, and `work-path` missing its segment separator.)

See `notes/open-issues-plan.md` for the planned fixes.
