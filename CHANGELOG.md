# Changelog

All notable changes to the `cdcf:` URI scheme are documented here. This file replaces
the prose "Change Rationale" appendices (Appendices C, E, F, G) from the `.docx`
drafts — Git history and PR descriptions are now the permanent record, per the
discussion that prompted this repo split.

The format follows [Keep a Changelog](https://keepachangelog.com/); versioning follows
[Semantic Versioning](https://semver.org/).

## [Unreleased] — open-issue resolutions, Group A ([REV-05])

Proposed as 0.5.1, but this release contains **restrictive grammar changes** (strings that
were valid under 0.5.0 are now invalid). Under the new §6.6 rule it should therefore be
released as **0.6.0**. No identifier invalidated by these changes had been assigned in a
stable release.

**Resolved open issues:** 5, 6, 10, 11, 12, 13, 14, 15 (see below). Remaining issues keep
their numbers.

**Grammar (Appendix D):**
- `cdcf-id` now binds each path production to its own domain. Previously
  `cdcf-id = domain SLASH domain-path` accepted any domain's path under any domain
  (`cdcf:ccc/summa-theologiae`). The `domain` rule is removed, along with the
  `domain-path =/` alternatives, which had no initial `=` definition as RFC 5234 §3.3
  requires. *(restrictive)*
- `concept-num = 4DIGIT / %x31-39 4*7DIGIT`: each number has a single spelling
  (`CN0007`, `CN12345`). `CN00007` and `CN012345` are now invalid. *(restrictive)*
- `work-path = work-slug *(SLASH path-segment)`. The former
  `[SLASH 1*path-segment]` concatenated segments with no separator, so it never matched
  `summa-theologiae/iii/q75/a1`. The old regex validator hid this. *(additive fix)*
- `code`, `inst-type` and `rel-slug` are now `slug`. Their values live in the registry,
  seeded from new tables §3.4.1 (codes) and §3.7.2 (institution types) and from the
  existing §3.8.2. The values themselves are unchanged.
- Validation notes 3 and 5–9 added or extended (case-sensitive matching of quoted
  strings, padding, registered segments, test vectors).

**Specification:**
- **Issue 5** — New §3.2.4 Document Slugs: one slug per document, taken from the title or
  incipit in the language of the typical edition and ASCII-folded. Non-Latin scripts are
  romanized with ALA-LC. Translations go in language-tagged labels.
- **Issue 6** — `draft-cdcf-patristics-00` chartered (§6.5.1). Issue 16 is carried into it.
- **Issue 10** — Bulk resolution is deferred to `draft-cdcf-resolution-api-00`.
  §4.6.1 fixes the constraints: per-item results equal to a single `GET` at the same
  depth, per-item status and error body, input order preserved, and an advertised
  maximum batch size.
- **Issue 11** — §4.8.1: the feed also covers `cdcf:rel/` declarations and context
  versions. Entries are retained permanently, with a live window of at least 90 days and
  RFC 5005 archives. Registry history remains the §7 audit log.
- **Issue 12** — §6.6 Grammar Revision Process: one PR per change, with test vectors;
  additive changes are MINOR and restrictive ones MAJOR, never invalidating a stable ID.
  Validators must interpret the grammar, and vocabularies are registered rather than
  written into the grammar.
- **Issue 13** — §3.5.1: allocation is central only, with no institutional ID ranges.
  Contributors use placeholders and the ID is minted at merge (§6.1). The padding rule
  is as above.
- **Issue 14** — New §4.9 Alias Lookup (`GET /{domain}?{scheme}={value}` → `303`).
  `notation` (§3.5.2) is its first registered scheme. It is MUST for the CDCF server and
  its mirrors and OPTIONAL elsewhere, and aliases are never reassigned. A split concept
  keeps `200` and lists its successors in `dcterms:isReplacedBy`; looking up its notation
  returns `300`. §4.5 gains `300`, `303` and `400` rows.
- **Issue 15** — Compatibility note in §3.1 and Appendix A: former `jn`/`mt` paths
  return `404` with a `suggestion`. They are never answered with `301` and never become
  aliases. New example `error-404-osis-correction.json`.
- RFC 5005, DCMI Metadata Terms and the ALA-LC Romanization Tables added to §7 and §9.

**Renamed identifiers** (draft only; never in a stable release), to follow §3.2.4:
- `cdcf:magisterium/trent/decree-justification` → `cdcf:magisterium/trent/decretum-de-iustificatione`
- `cdcf:magisterium/trent/decree-eucharist` → `cdcf:magisterium/trent/decretum-de-sanctissimo-eucharistiae-sacramento`

**Repo changes:** `scripts/lib/abnf.js` is a dependency-free RFC 5234 parser and
matcher. `validate-grammar.js` now parses the grammar properly and rejects `=/` without
`=`. `validate-identifiers.js` checks identifiers against the grammar itself plus the
registry tables, instead of hand-synced regexes. New `check-test-vectors.js` and
`examples/test-vectors/{valid,invalid}.txt`, with a matching CI step.

## [0.5.0] — 2026-10 — Person-domain review (draft-04)

**Critical fixes:**
- Withdrew the `cdcf:person/` domain. Persons are represented as named individuals in the
  CDCF ontology with opaque registrar-allocated IRIs; `authoredBy` and
  `magisterialIssuedBy` carry the person's ontology IRI — §2.6, §3.6.1
- Added the `cdcf:work/` domain for cited works, carrying over the variable-depth
  `1*path-segment` production; title collisions resolved by author-qualified slugs — §3.6

**Significant fixes:**
- Corrected the papal issuer-slug rule: the ordinal is included only where it forms part
  of the pope's official name (`pope-francis`, not `pope-francis-i`) — §3.2.3
- Moved response depth from a bespoke `Depth` header (which collides with WebDAV,
  RFC 4918) to `Prefer: depth=` per RFC 7240; responses MUST `Vary: Prefer` — §4.6
- Added an explicit upper-case exception for the fixed prefix of opaque identifiers;
  the ABNF writes `CN` as the case-sensitive hex literal `%x43.4E` — §2.3, Appendix D

**Minor fixes:**
- Completed Appendix B to all 23 Eastern Catholic churches, grouped by tradition;
  removed `melkite-jerusalem`, which is not a separate *sui iuris* church
- Aligned the Maronite description in §3.7.1 with Appendix B
- Corrected the document header and reviewer note, which still carried draft-02 labels

**Repo changes:** new examples `work-summa-theologiae-iii-q75-a1.jsonld` and
`error-404-withdrawn-person.json`; `verse-jn-6-53.jsonld` renamed to
`verse-john-6-53.jsonld`; `magisterialIssuedBy` in the *Fiducia Supplicans* example now
points to the DDF; `validate-identifiers.js` knows the `work` domain, the opaque `CN`
concept form, and skips the echoed `identifier` field of error bodies; CI also
duplicate-checks Appendix B; new `spec/09-references.md`.

**New open issues:** 16 (clavis numbers for patristic works), 17 (person IRI allocation
in the ontology), 18 (Roman Pontiffs / Doctors of the Church as list membership).

### Rationale

- **Persons (G.1).** Board review observed that the person domain cannot work as a
  transparent identifier space. The Roman Pontiffs and the Doctors of the Church are
  closed lists with authoritative names and numbering, but persons in general are
  neither: no Church register settles their names, homonyms are common, and readable
  slugs could be disambiguated only by invented qualifiers — the same "small false claim"
  that led 0.4.0 to make concept identifiers opaque. A person is moreover a BFO object
  whose ecclesial standing consists of roles and statuses acquired over time, which is
  ontology content rather than citation structure. Opaque registrar-allocated
  identifiers suffice; UUIDs are not required. No `cdcf:person/` identifier had reached
  a stable release, so there is no deprecation burden.
- **Works (G.2).** The person domain also carried work citations
  (`cdcf:person/thomas-aquinas/summa-theologiae/…`). Works are what citations point to,
  have settled internal structure, and are far closer to a finite catalogue than
  persons are, so they move to their own domain. Authorship becomes a property linking
  the work to the author's ontology IRI.
- **Papal ordinal (G.3).** Requiring an ordinal on every papal slug produced
  `pope-francis-i`, a regnal name he never bore. Forward stability is already
  guaranteed by §2.4. The papal slug survives only as an issuer token in
  `cdcf:magisterium/`.
- **`Prefer: depth` (G.4).** 0.3.0 cited RFC 7240 but defined its own `Depth` header,
  which WebDAV already defines with different values (`0`, `1`, `infinity`) and
  semantics; WebDAV-aware servers and intermediaries could misread it.
- **Upper-case prefix (G.5).** 0.4.0 introduced `CN` while §2.3 and the Appendix D notes
  still declared every upper-case character invalid. An ABNF quoted string is
  case-insensitive under RFC 5234, so `"CN"` would also have matched `cn`.

## [0.4.0] — 2026-09 — Identifier-model review (draft-03)

Not released as a separate repo version; its changes are included in 0.5.0.

**Critical fixes:**
- Introduced the two-layer ontology-IRI / `skos:notation` model: identifiers double as
  citations where the referent has fixed extension and a Church-settled name, and are
  separated where the boundary can be revised — §2.6
- Changed concept identifiers from transparent slugs (`cdcf:concept/real-presence`) to
  opaque `CN`-prefixed IDs (`cdcf:concept/CN0007`) with a mandatory `skos:notation` —
  §3.5, §3.5.1

**Significant fixes:**
- Added the notation-lookup convenience endpoint
  (`GET /concept?notation={mnemonic}` → `303 See Other`) — §3.5.2
- Clarified `owl:sameAs` (named individuals) vs. `skos:exactMatch` (concept-to-concept)
  — §2.6, §3.5
- Corrected self-inconsistent OSIS book codes against the OSIS 2.1.1 book-ID list:
  `jn`→`john`, `mt`→`matt` — §2.1, §3.1, §4.4, Appendix A, Appendix D

**Minor fixes:**
- Added W3C SKOS to the standards alignment — §7

**New open issues:** 13 (concept ID allocation blocks), 14 (normative status of the
notation lookup), 15 (compatibility note for the OSIS correction).

### Rationale

- **Two-layer model (F.1, F.2).** The committee's discussion of
  `draft-cdcf-identifier-rationale-00` converged on a rule rather than one global answer.
  A transparent concept identifier risks becoming a small false claim once a concept's
  articulation is split, merged, or clarified — exactly what the domain's own
  *Doctrinal Development* note anticipates. No concept identifier had reached a stable
  release, so the change carried no deprecation burden.
- **OSIS codes (F.4).** 0.3.0's examples used `jn`/`mt` path segments alongside
  `John.6.53`-style `osisRef` values — two undocumented naming schemes for one referent.
  `Jn`/`Mt` are display abbreviations, not OSIS IDs. A validation note now makes exact
  agreement with the `osisRef` book segment normative.
- **Notation lookup (F.5).** Opaque IRIs are not meant to be hand-typed; a single query
  parameter resolving by `303` restores the ergonomics of a transparent identifier
  without reintroducing semantics into it (cf. w3id.org).

## [0.3.0] — 2026-06 — Software architecture review

**Critical fixes:**
- Added the normative ABNF grammar ([`spec/appendix-d-abnf.abnf`](spec/appendix-d-abnf.abnf)),
  resolving the canon-qualifier ambiguity and the broken person-path grammar
- Defined resolution behaviour for `cdcf:rel/` identifiers (OWL `ObjectProperty` declarations) — §3.8.1
- Replaced the scalar `licenseStatus` field with a structured `licenses` object — §2.5
- Added response depth levels (`Depth: 0` / `Depth: 1`) — §4.6

**Significant fixes:**
- Formalised `cdcf:book/` as a first-class domain — §3.1.1
- Fixed the person-path grammar to support arbitrary-depth scholastic works — §3.6
- Specified the JSON-LD `@context` document's requirements, caching, and versioning — §4.3
- Added a mandatory error response schema for all 4xx codes — §4.5
- Added caching headers and operational resilience requirements (mirrors, DNSSEC, change feed) — §4.7, §4.8

**Minor fixes:**
- Unified papal issuer slugs to `pope-{name}-{roman}` across the magisterium and person domains — §3.2
- Removed a duplicate `dogmatic-constitution` row from the `documentType` vocabulary — §3.2.1
- Defined sub-specification naming and versioning conventions — §6.5

**New open issues:** bulk resolution API scope, change-notification feed scope/retention, ABNF maintenance process.

## [0.2.0] — 2026-06 — Theological and canonical review

**Critical fixes:**
- Corrected the authority taxonomy to follow the three-paragraph structure of the 1989
  Profession of Faith — no longer presents `de fide definita` and `de fide catholica` as
  sequential levels of differing weight — §5
- Added the `cdcf:rel/` relationship-type vocabulary so the cross-reference graph
  doesn't implicitly encode a proof-texting hermeneutic — §3.8
- Added the `licenseStatus` field (later superseded by `licenses` in 0.3.0) acknowledging
  that CDCF does not hold uniform rights over all referenced texts

**Significant additions:**
- Added authentic interpretations as a canon-law sub-domain — §3.4
- Added `documentType` and `papalApproval` fields to the magisterium domain — §3.2.1, §3.2.2
- Acknowledged the doctrinal-development limitation in the concept domain — §3.5
- Added the 23 Eastern Catholic *sui iuris* churches — §3.7.1, Appendix B

**Minor fixes:**
- Removed `sententia communis` from the authority-level taxonomy (it is a category of
  theological opinion, not a magisterial authority level)
- Required ordinal suffixes on all papal person identifiers for forward stability — §3.6.1

**New open issues:** dicastery approval disputes, Eastern theological concepts, particular law scope.

## [0.1.0] — 2026-06 — Initial draft

- First public draft of the `cdcf:` URI scheme
- Defined seven identifier domains: Scripture, Magisterium, Catechism, Canon Law,
  Theological Concepts, Persons, Institutions
- Defined a six-level theological authority taxonomy (later corrected in 0.2.0)
- Defined HTTP content negotiation and JSON-LD resolution example
- Six open issues submitted for public comment
