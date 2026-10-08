# 8. Open Issues for Public Comment

Each issue below should be tracked as its own GitHub Issue (linked once filed) rather
than resolved solely by editing this file — see `README.md` § *How to propose a change*.

## Carried from version 0.1.0

1. **Psalm numbering** — Vulgate vs. Hebrew as primary? Should both be first-class
   identifiers with an explicit mapping?
2. **Deuterocanonical books** — the Catholic canon is normative here. Should Protestant
   versification be supported as a secondary mapping?
3. **Amended magisterial documents** — sub-identifiers or replacement documents for
   post-promulgation corrections (e.g., footnote corrections in apostolic exhortations)?
4. **Liturgical domain** — are there dependencies that require addressing the liturgical
   domain in version 1.0.0, rather than deferring it?
5. **Multilingual slugs** — should non-English document title forms be permitted
   (`dei-verbum` vs. `on-divine-revelation`)?
6. **Patristic works** — is a dedicated patristics sub-specification needed for the
   Church Fathers corpus? *(See also Issue 16.)*

## Carried from version 0.2.0

7. **Dicastery approval disputes** — should a `disputedApproval` flag be added for
   `papalApproval` values where the approval mode is theologically contested?
8. **Eastern theological concepts** — separate identifiers for Eastern equivalents
   (*theosis*, *epiclesis*), or an `easternEquivalents` field on the Latin-rite
   identifier?
9. **Particular law** — a `cdcf:particular-law/` domain in version 1.0.0, or a
   standalone sub-specification?

## Carried from version 0.3.0 [REV-02]

10. **Bulk resolution API** — should the `POST /resolve` endpoint (§4.6) be specified in
    this document, or in a separate API specification?
11. **Change notification scope** — should the Atom feed (§4.8) also cover changes to
    `cdcf:rel/` OWL declarations and the JSON-LD context? What is the retention policy?
12. **ABNF stability** — how should future domains requiring new path patterns trigger a
    grammar revision? Should the ABNF be maintained as a separate machine-readable file
    with its own changelog? *(Resolved structurally by the repo split — the grammar
    lives at [`appendix-d-abnf.abnf`](appendix-d-abnf.abnf) — but the **process** for
    revising it is still open.)*

## Carried from version 0.4.0 [REV-03]

13. **Opaque concept ID allocation** — should `CN`-prefixed identifiers be allocated in
    reserved blocks per contributing institution (OBO Foundry ID-range style) or
    centrally by the CDCF registrar alone ([§3.5.1](03-domains.md#351-opaque-id-allocation-new--rev-03))?
14. **Notation-lookup endpoint** — should the convenience notation-resolution endpoint
    in [§3.5.2](03-domains.md#352-convenience-resolution-by-notation-new--rev-03) be
    normative for all implementations, or informative/optional given it duplicates
    functionality available through a full-text search of the registry?
15. **Historical OSIS path corrections** — version 0.3.0 shipped self-inconsistent
    `osis-book` codes (`jn`, `mt`) that version 0.4.0 corrects to the verified OSIS 2.1.1
    IDs (`john`, `matt`). Should CDCF publish a compatibility note for any implementer
    who built against the 0.3.0 examples before this correction, given that no
    identifiers under this domain have yet reached a stable release
    ([§2.4](02-syntax.md#24-stability-guarantee))?

## New in version 0.5.0 [REV-04]

16. **Patristic work identifiers** — should `cdcf:work/` identifiers for patristic texts
    be keyed to established clavis numbers (*Clavis Patrum Graecorum* / *Latinorum*)
    rather than author-qualified title slugs ([§3.6](03-domains.md#36-works-cdcfwork-rev-04))?
17. **Person IRIs in the ontology** — what allocation pattern and prefix should the CDCF
    ontology use for person individuals, and should it offer a notation-lookup
    convenience equivalent to §3.5.2?
18. **Closed person lists** — how should the existing Roman Pontiffs and Doctors of the
    Church datasets be expressed as role or list membership of ontology individuals
    ([§3.6.1](03-domains.md#361-persons-as-ontology-individuals-new--rev-04)(c)), and how
    do their current identifiers map to `skos:notation` values?

---

**Previous:** [07 — Security Considerations](07-security.md) · **Next:** [09 — References](09-references.md)
