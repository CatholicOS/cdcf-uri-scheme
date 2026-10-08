# 6. Governance and Change Process

## 6.1 Identifier Assignment

New identifiers require:

- the entity to be identified
- the proposed URI slug
- a justification for the slug form
- a reference to at least one authoritative source
- confirmation the identifier conforms to the ABNF grammar in
  [Appendix D](appendix-d-abnf.abnf)

## 6.2 Change Process

1. **Draft** — proposal published on the CDCF GitHub repository for public comment
   (minimum 30 days)
2. **Last Call** — final comment period (14 days) after revision
3. **Published** — ratified and versioned release

No change may invalidate a previously published stable identifier.

## 6.3 Theological and Canonical Review

Proposals touching doctrinal classifications, authority-level metadata, or concept
definitions MUST receive review from at least one qualified theologian and one
qualified canonist before entering Last Call. The CDCF Technical Advisory Group
maintains a list of qualified reviewers (see `CODEOWNERS` in the repository root).

## 6.4 Versioning

This specification follows semantic versioning (`MAJOR.MINOR.PATCH`). Version `1.0.0`
will be declared when the specification has been implemented in at least two
independent systems and has passed a 90-day stability review.

## 6.5 Sub-Specification Versioning [REV-02]

Future sub-specifications (particular law, Eastern liturgy, patristics, the liturgical
domain) will be published as separate documents under the naming convention:

```
draft-cdcf-{topic}-{nn}
```

Examples: `draft-cdcf-particular-law-00`, `draft-cdcf-eastern-liturgy-00`,
`draft-cdcf-patristics-00`. Sub-specifications MUST reference the main
`cdcf-uri-scheme` version they are compatible with using a `compatibleWith` field in
their header table. A sub-specification that introduces a new domain or modifies an
existing domain's ABNF MUST be accompanied by a patch release of the main specification
incorporating the grammar change.

---

**Previous:** [05 — Theological Authority Metadata](05-authority.md) · **Next:** [07 — Security Considerations](07-security.md)
