# 8. Open Issues for Public Comment

Each issue below should be tracked as its own GitHub Issue (linked once filed) rather
than resolved solely by editing this file — see `README.md` § *How to propose a change*.

Issues keep their numbers once assigned. Resolved issues are removed from this list and
recorded in [`CHANGELOG.md`](../CHANGELOG.md); see [Resolved issues](#resolved-issues)
below.

## Carried from version 0.1.0

1. **Psalm numbering** — Vulgate vs. Hebrew as primary? Should both be first-class
   identifiers with an explicit mapping?
2. **Deuterocanonical books** — the Catholic canon is normative here. Should Protestant
   versification be supported as a secondary mapping?
3. **Amended magisterial documents** — sub-identifiers or replacement documents for
   post-promulgation corrections (e.g., footnote corrections in apostolic exhortations)?
4. **Liturgical domain** — are there dependencies that require addressing the liturgical
   domain in version 1.0.0, rather than deferring it?

## Carried from version 0.2.0

7. **Dicastery approval disputes** — should a `disputedApproval` flag be added for
   `papalApproval` values where the approval mode is theologically contested?
8. **Eastern theological concepts** — separate identifiers for Eastern equivalents
   (*theosis*, *epiclesis*), or an `easternEquivalents` field on the Latin-rite
   identifier?
9. **Particular law** — a `cdcf:particular-law/` domain in version 1.0.0, or a
   standalone sub-specification?

## New in version 0.5.0 [REV-04]

16. **Patristic work identifiers** — should `cdcf:work/` identifiers for patristic texts
    be keyed to established clavis numbers (*Clavis Patrum Graecorum* / *Latinorum*)
    rather than author-qualified title slugs ([§3.6](03-domains.md#36-works-cdcfwork-rev-04))?
    *(To be taken up by `draft-cdcf-patristics-00`,
    [§6.5.1](06-governance.md#651-chartered-sub-specifications-new--rev-05).)*
17. **Person IRIs in the ontology** — what allocation pattern and prefix should the CDCF
    ontology use for person individuals, and should it offer a notation-lookup
    convenience equivalent to §3.5.2?
18. **Closed person lists** — how should the existing Roman Pontiffs and Doctors of the
    Church datasets be expressed as role or list membership of ontology individuals
    ([§3.6.1](03-domains.md#361-persons-as-ontology-individuals-new--rev-04)(c)), and how
    do their current identifiers map to `skos:notation` values?

## Resolved issues

Resolved in the release after 0.5.0 **[REV-05]**; details in
[`CHANGELOG.md`](../CHANGELOG.md).

| # | Issue | Resolution |
|---|---|---|
| 5 | Multilingual slugs | One slug per document: the title or incipit in the language of the typical edition, ASCII-folded — [§3.2.4](03-domains.md#324-document-slugs-new--rev-05) |
| 6 | Patristic works | Sub-specification `draft-cdcf-patristics-00` chartered — [§6.5.1](06-governance.md#651-chartered-sub-specifications-new--rev-05) |
| 10 | Bulk resolution API | Specified in `draft-cdcf-resolution-api-00`; this document fixes its constraints — [§4.6.1](04-resolution.md#461-bulk-resolution-new--rev-05) |
| 11 | Change notification scope | Feed covers identifiers, `cdcf:rel/` declarations and context versions; permanent retention with RFC 5005 archives — [§4.8.1](04-resolution.md#481-change-notification-feed-new--rev-05) |
| 12 | ABNF stability | Grammar revision process; validators interpret the grammar; vocabularies moved to the registry — [§6.6](06-governance.md#66-grammar-revision-process-new--rev-05) |
| 13 | Opaque concept ID allocation | Central registrar allocation, no reserved ranges; single spelling per number — [§3.5.1](03-domains.md#351-opaque-id-allocation-new--rev-03) |
| 14 | Notation-lookup endpoint | Generalized as alias lookup: MUST for the CDCF server and mirrors, OPTIONAL elsewhere — [§4.9](04-resolution.md#49-alias-lookup-new--rev-05) |
| 15 | Historical OSIS path corrections | Compatibility note; former paths return `404` with a `suggestion` — [§3.1](03-domains.md#31-scripture-cdcfverse-and-books-cdcfbook-rev-02), [Appendix A](appendix-a-osis.md) |

---

**Previous:** [07 — Security Considerations](07-security.md) · **Next:** [09 — References](09-references.md)
