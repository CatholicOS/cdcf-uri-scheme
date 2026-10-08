# 1. Introduction

## 1.1 The Problem of Catholic Data Fragmentation

Catholic digital projects — Bible apps, catechetical platforms, canonical law databases,
theological reasoning engines — currently lack any shared reference system. A magisterial
document cited in one application cannot be reliably matched to the same document in
another. This fragmentation has two principal failure modes:

- **Siloed digitization** — each project independently digitizes the same texts,
  introducing independent errors that cannot be corrected centrally.
- **Vendor lock-in** — data held in proprietary formats cannot be consumed by other
  applications, placing governance of Church data outside Church institutions.

## 1.2 Purpose of This Specification

This specification defines a URI scheme that resolves both failure modes by establishing:

1. A canonical identifier for every major category of Catholic entity
2. A resolution protocol returning structured, machine-readable data on dereferencing
3. A formal path grammar ensuring machine-parseable, unambiguous identifiers
4. A governance model for identifier assignment and long-term stability

## 1.3 Design Principles

- **Stability** — once assigned, an identifier must never be reassigned or broken
- **Readability** — identifiers should be interpretable by humans without a lookup
  wherever the referent has a fixed extension and a Church-settled name; where it does
  not, human readability is carried by a `skos:notation` or label rather than by the IRI
  ([§2.6](02-syntax.md#26-two-layer-identifiers-ontology-iri-and-canonical-notation-rev-03))
- **Dereferenceability** — every identifier resolves to a structured data response
- **Openness** — the scheme is an open standard, not proprietary to any vendor
- **Theological fidelity** — metadata respects Catholic authority hierarchies as defined
  by the Magisterium
- **Backwards compatibility** — no published identifier may be invalidated by future
  revisions
- **Machine-parseability** — all identifier paths conform to the ABNF grammar in
  [Appendix D](appendix-d-abnf.abnf)

---

**Previous:** [00 — Abstract](00-abstract.md) · **Next:** [02 — URI Syntax](02-syntax.md)
