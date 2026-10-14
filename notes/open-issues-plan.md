# Open Issues — proposed resolutions and triage (working notes)

Status: editor's working notes for the release after 0.5.0 (proposed **0.5.1**, or 0.6.0 if
any change is breaking). Not normative. Issue numbers refer to `spec/08-open-issues.md`;
section numbers are repo numbers (see `CLAUDE.md`).

## Cross-cutting proposal: generalized alias lookup

Issues 1, 2, 14, 16, 17 and 18 are all "one entity, several names" problems (Hebrew Psalm
numbers, OSIS separate-book IDs, concept notations, clavis numbers, Wikidata QIDs,
pre-existing Popes/Doctors dataset IDs). Instead of minting second identifiers,
generalize §3.5.2 into one section (proposed new §4.9 "Alias Lookup"):

```
GET /{domain}?{scheme}={value}  →  303 See Other, Location: <canonical IRI>
```

- Exact match against **registered alias schemes** (`notation`, `v11n`, `cpl`, `cpg`,
  `wikidata`, …); the registry lists schemes per domain.
- No match → `404` with the §4.5 error body (`suggestion` MAY be set).
- An alias value, once registered, is **never reassigned** to a different entity.
- Applications MUST store the canonical IRI, never the alias (as §3.5.2 already says).
- §3.5.2 becomes the `notation` scheme of this general mechanism.

Adopt this first: it reduces each related committee question to "which name is canonical".

## Triage

### A. Fix now — technical, editor PR (target 0.5.1)

| # | Resolution to write into the spec |
|---|---|
| 5 | One slug per entity = official title/incipit in the language of the typical edition, ASCII-folded (`dei-verbum`, `laudato-si`). Non-Latin scripts romanized with ALA-LC tables. Translations go in language-tagged `rdfs:label` / `skos:altLabel`. Issuer scoping prevents incipit collisions. |
| 6 | Yes: create sub-spec `draft-cdcf-patristics-00` (scope: clavis mapping, PG/PL locators, division conventions, disputed/traditional attribution for `authoredBy`). Merge Issue 16 into it. |
| 10 | Bulk resolution goes in a separate `draft-cdcf-resolution-api-00`. This spec fixes only: per-item result MUST equal the single-GET representation at the same depth; per-item status + §4.5 error body; input order preserved; server advertises max batch size. |
| 11 | Feed covers identifiers **and** `cdcf:rel/` declarations **and** JSON-LD context versions (context entries are only "vN published", since contexts are immutable). Entries retained permanently: live feed = recent window (e.g. 90 days), older entries in RFC 5005 archive documents. Git history remains the §7 audit log. Add RFC 5005 to standards/references. |
| 12 | Process: grammar change = PR touching `appendix-d-abnf.abnf` + test-vector file of valid/invalid IDs; additive changes MINOR, restrictive changes MAJOR and never allowed to invalidate a stable ID. Generate the validator from the ABNF (e.g. apg-js) instead of hand-synced regexes. **Grammar fixes in the same PR:** (a) bind paths to domains — `cdcf-id = "verse" SLASH verse-path / "book" SLASH book-path / …`, which also removes the invalid bare `domain-path =/`; (b) move vocabularies out of the grammar (`rel-slug`, `inst-type`, `code` become `slug`; allowed values live in the registry). |
| 13 | Central registrar allocation; no per-institution ID blocks (they leak provenance into opaque IDs and add nothing at CDCF's volume). Contributors use temporary IDs in PRs; ID minted at merge. **Fix padding defect:** `concept-num = 4DIGIT / %x31-39 4*7DIGIT` (minimum 4 digits, no extra leading zeros). |
| 14 | Notation lookup is MUST for the CDCF resolution server and its mirrors, OPTIONAL for third-party implementations. A notation once used is never reassigned to another concept. Concept **split**: old IRI keeps returning `200` and lists all successors (`dcterms:isReplacedBy`); old notation lookup returns `300 Multiple Choices`. |
| 15 | Informative compatibility note (CHANGELOG + Appendix A — already present). Former `jn`/`mt` paths return `404` with `suggestion` set to the corrected ID. **Never** `301` (implies they were published) and never an alias (would reintroduce a second naming scheme). |

### B. Decide now, with light sign-off

| # | Proposal | Sign-off needed |
|---|---|---|
| 3 | Corrections never change the identifier (§2.3 rule 6). Response carries `textHistory`: dated text states with source (AAS ref / rescript); current authoritative text is default. Test case: `cdcf:ccc/2267` (2018 revision). A new act that changes an earlier one gets its own ID + new `cdcf:rel/amends` (MagisterialDoc → MagisterialDoc \| CCC). "As of" access is an API parameter (`?asOf=`), not an identifier. | TAG approval of the new `amends` rel (vocab change). |
| 4 | Liturgy not a 1.0.0 domain; sub-spec `draft-cdcf-liturgy-00` (also home of calendar canonicalization). 1.0.0 only: reserve domain name `liturgy`; interim `citedIn` for `cdcf:rel/liturgical-use` = a `cdcf:work/` edition (e.g. `cdcf:work/missale-romanum-2002`). Sub-spec should align with existing Liturgical Calendar API event keys and Martyrology (`mr:`) IDs. | TAG confirms the roadmap deferral. |
| 9 | Standalone `draft-cdcf-particular-law-00`. 1.0.0 only reserves `particular-law`; opening the closed `code` enum is handled in Issue 12. Likely shape `cdcf:particular-law/{legislator}/{instrument}/…`, legislator = institution identifier. | TAG confirms the deferral. |

### C. Committee — genuine judgment calls

| # | Question for the committee | Editor's proposal | Who must weigh in |
|---|---|---|---|
| 18 | Popes / Doctors of the Church modelling | One ontology individual per person. Existing dataset IDs (`rp:`, `doct:`) become `skos:notation` literals in their own declared datatypes **and** alias lookup keys — every published ID keeps resolving. Pontificate = dated BFO role with ordinal; doctorate = status conferred by a dated act linked to its `cdcf:magisterium/` document; succession = `skos:OrderedCollection`. Ordinal is a property of a cited list (e.g. *Annuario Pontificio*), since numbering is contested (Stephen II/III). Avoids one person becoming two entities (Leo the Great, Gregory the Great). | Coordinate with the maintainers of the existing Popes/Doctors datasets before the meeting. |
| 17 | Person IRI allocation | `PN` + number under the ontology base IRI (pending ontology naming decision), same padding/allocation rules as `CN`. Type prefix is acceptable because "person" is rigid in BFO; roles/statuses never appear in IDs. Lookup by `notation` and `wikidata`. Person notations may carry disambiguators (they are labels, not identity). | Decide jointly with the ontology prefix / base-IRI decision. |
| 7 | `disputedApproval` | No boolean. Make `papalApproval` structured: `{ "value", "basis": <quoted approval formula>, "source" }`; add value `unspecified`. Scholarly disagreement goes in the non-doctrinal annotation layer. Spec's own *Fiducia Supplicans* example is a live test case. | A qualified canonist — required before this can close. |
| 1 | Psalm numbering | Keep Vulgate canonical; Hebrew via `v11n` alias. Replace `psalmNumberingMap` with verse-level `versificationMap` (superscriptions shift verse numbers; Pss 9–10, 114–116, 147 split/merge). Source mappings from an established dataset (e.g. CrossWire SWORD versification tables). Counter-argument: modern Catholic vernacular Bibles (NABRE, RSV-CE) use Hebrew numbering. | Theologian/liturgist; existing BibleGet practice. |
| 2 | Deuterocanon / Eastern canons | Catholic book structure normative (`cdcf:verse/dan/13/1`); OSIS separate-book IDs (`sus`, `bel`, `prazar`, `addesth`, `epjer`) invalid as `cdcf:book/`, resolve via alias; `osis-book` becomes a registered list. Books read in some Eastern traditions (3 Maccabees, Psalm 151, Prayer of Manasseh) get IDs with per-tradition `canonicalStatus`. | Eastern Catholic theologian for the per-tradition statuses. |
| 8 | Eastern concepts | Separate CN concepts (not an `easternEquivalents` field, which privileges the Latin concept and asserts contested equivalence). Link with within-scheme SKOS (`skos:related`, `skos:broader`); `skos:exactMatch` stays reserved for external vocabularies (§2.6). | Eastern and Latin theologians. |
| 16 | Clavis numbers; title language | Keep slugs as identifiers; clavis numbers (`cpg`, `cpl`) are required properties where they exist and alias keys (precedent: BKV keys works by clavis, e.g. CPL 251 = *Confessiones*). Clavis doesn't cover post-patristic works and is externally revised, so it can't be the identifier. **Resolve title-language inconsistency:** examples mix `confessions` (English) and `summa-theologiae` (Latin); proposal = standard Latin title from the clavis/standard reference (rename `confessions` → `confessiones`). | Committee (brief), then TAG review; patristics scholar helpful. Folded into the patristics sub-spec (Issue 6). |

### Suggested committee agenda order

1. Issues 18 + 17 together (shared principle; block person data).
2. Issue 7 — note that a qualified canonist reviewer is needed to close it.
3. Issues 1 + 2 (quick once the alias mechanism is adopted).
4. Issues 8, 16.

## Proposed 0.5.1 PR scope

- New §4.9 Alias Lookup; §3.5.2 rewritten as its `notation` scheme
- ABNF: domain-bound `cdcf-id`; `concept-num` padding fix; vocabularies → `slug`;
  reserve `liturgy`, `particular-law` domain names
- Validator: regenerate patterns from the new grammar; add `examples/test-vectors/`
  (valid + invalid identifiers) and a CI step that asserts invalid ones fail
- Resolutions for 5, 6, 10, 11, 12, 13, 14, 15 written into the relevant sections; those
  issues moved from `08-open-issues.md` into the CHANGELOG as resolved
- Group B items drafted but marked **needs TAG review**
- Group C items: add each proposal under its issue in `08-open-issues.md` as
  "Editor's proposal" — do not change normative text
