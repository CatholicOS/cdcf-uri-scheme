# 6. Governance and Change Process

## 6.1 Identifier Assignment

New identifiers require:

- the entity to be identified
- the proposed URI slug
- a justification for the slug form
- a reference to at least one authoritative source
- confirmation the identifier conforms to the ABNF grammar in
  [Appendix D](appendix-d-abnf.abnf)

Opaque identifiers (`CN` concept IDs) are not proposed by the contributor: the proposal
uses a temporary placeholder and the registrar mints the identifier when the proposal is
merged ([§3.5.1](03-domains.md#351-opaque-id-allocation-new--rev-03)). **[REV-05]**

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
existing domain's ABNF MUST be accompanied by a release of the main specification
incorporating the grammar change, versioned as set out in
[§6.6](#66-grammar-revision-process-new--rev-05). **[REV-05]**

### 6.5.1 Chartered Sub-Specifications [NEW — REV-05]

The following sub-specifications are chartered. Their scope is fixed here so that this
document can defer to them; their content is developed separately.

| Document | Scope |
|---|---|
| `draft-cdcf-patristics-00` | The Church Fathers corpus under `cdcf:work/`: mapping to the *Clavis Patrum Graecorum* / *Latinorum*, *Patrologia Graeca* / *Latina* locators, division conventions, and disputed or traditional attribution in `authoredBy`. Takes up [Open Issue 16](08-open-issues.md). |
| `draft-cdcf-resolution-api-00` | The resolution API beyond single-identifier `GET`, beginning with bulk resolution (`POST /resolve`) under the constraints of [§4.6.1](04-resolution.md#461-bulk-resolution-new--rev-05). |

## 6.6 Grammar Revision Process [NEW — REV-05]

[Appendix D](appendix-d-abnf.abnf) is maintained as a separate machine-readable file. It
has no changelog of its own: its header lists its revision markers, and
[`CHANGELOG.md`](../CHANGELOG.md) records each change.

1. **One pull request per grammar change.** A change to the grammar is a pull request
   that edits `appendix-d-abnf.abnf` and adds to the test vectors in
   `examples/test-vectors/` at least one identifier the change makes valid
   (`valid.txt`) or invalid (`invalid.txt`). CI asserts that every valid vector
   conforms and every invalid vector is rejected.
2. **Additive changes** — those that only make new strings valid, such as a new domain or
   a new path form — are MINOR releases.
3. **Restrictive changes** — those that make some previously valid string invalid — are
   MAJOR releases (MINOR before 1.0.0, per Semantic Versioning). A restrictive change
   MUST NOT invalidate an identifier published in a stable release
   ([§2.4](02-syntax.md#24-stability-guarantee)).
4. **Validators interpret the grammar.** CI and reference validators parse
   `appendix-d-abnf.abnf` directly; they MUST NOT carry a hand-maintained copy of its
   productions.
5. **Vocabularies are registered, not grammar.** Where a path segment takes its values
   from a controlled vocabulary (canon-law codes, institution types, `cdcf:rel/` values),
   the grammar types it as `slug` and the allowed values are kept in the registry, whose
   initial content is the corresponding table in [Section 3](03-domains.md). Registering
   a value is therefore not a grammar change. It remains subject to
   [§6.3](#63-theological-and-canonical-review) where that section applies.

---

**Previous:** [05 — Theological Authority Metadata](05-authority.md) · **Next:** [07 — Security Considerations](07-security.md)
