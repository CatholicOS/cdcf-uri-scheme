# 2. URI Syntax and Structure

## 2.1 Base URI

The authoritative base URI for all `cdcf:` identifiers is:

```
https://id.catholiccommons.org/
```

The prefix `cdcf:` is a shorthand notation used throughout this specification. All
`cdcf:` identifiers MUST resolve to the base URI when expanded:

```
cdcf:verse/john/3/16  →  https://id.catholiccommons.org/verse/john/3/16
```

## 2.2 General Structure

```
cdcf:{domain}/{path}
```

Where `{domain}` is one of the nine defined domains ([Section 3](03-domains.md)) and
`{path}` conforms to the domain-specific ABNF production rules in
[Appendix D](appendix-d-abnf.abnf).

## 2.3 Syntax Rules

1. All characters MUST be lower-case ASCII, except the fixed upper-case prefix of an
   opaque registrar-allocated identifier (e.g., `CN` in
   [§3.5.1](03-domains.md#351-opaque-id-allocation-new--rev-03)), as defined in
   [Appendix D](appendix-d-abnf.abnf) **[REV-04]**
2. Words within a path segment MUST be separated by hyphens (`-`)
3. Path segments MUST be separated by forward slashes (`/`)
4. No trailing slashes
5. No query strings in canonical identifiers (query parameters are permitted on API
   endpoints, which are distinct from canonical identifiers)
6. No version numbers or dates in identifier paths, except where the date is intrinsic
   to the entity identity (e.g., authentic interpretations of canons are dated acts)
7. Identifiers MUST NOT exceed 256 characters
8. All identifier paths MUST conform to the ABNF grammar in
   [Appendix D](appendix-d-abnf.abnf)

## 2.4 Stability Guarantee

Any identifier published in a CDCF stable release MUST remain resolvable and MUST NOT
be reassigned to a different entity. Deprecated identifiers MUST return `HTTP 301` with
a `Location` header pointing to the successor. The successor MUST be a new URI. Both the
original and successor identifiers MUST remain resolvable indefinitely.

## 2.5 Licenses Object

> **[REV-02]** Replaces the scalar `licenseStatus` field from version 0.2.0.

Every resolution response MUST include a `licenses` object. A scalar field was
insufficient for composite resources whose constituent parts carry different copyright
statuses (e.g., a Latin text that is public domain alongside an English translation that
is proprietary).

The `licenses` object maps each content-bearing field in the response to its applicable
`licenseStatus` value. Fields not listed inherit the value of the root key (`"*"`).

```json
"licenses": {
  "*":              "public-domain",
  "text.en-RSVCE":  "proprietary-licensed",
  "text.en-NABRE":  "proprietary-licensed"
}
```

Permitted `licenseStatus` values:

| Value | Meaning |
|---|---|
| `public-domain` | No copyright restrictions; free use and redistribution |
| `cc-by` | Creative Commons Attribution; attribution required |
| `cc-by-nc` | Creative Commons Attribution Non-Commercial |
| `proprietary-licensed` | CDCF holds a distribution licence; contact CDCF for terms |
| `rights-holder-contact-required` | No CDCF licence; contact the rights holder directly before redistribution |

CDCF does not claim to own content it does not hold rights to. The `licenses` object is
informational, not a grant of rights.

## 2.6 Two-Layer Identifiers: Ontology IRI and Canonical Notation [REV-03]

For most domains in this specification — Scripture, Magisterial Documents, the
Catechism, Canon Law, Cited Works, and Institutions — the `cdcf:` identifier serves
simultaneously as the entity's rigid ontology identifier (consumed by reasoners, per
RDF/OWL discipline, as an opaque atom regardless of its spelling) and as its
human-legible canonical citation. This is safe because these entities have fixed
extension and an authoritative naming already settled by the Church's own record (see
the companion rationale, `draft-cdcf-identifier-rationale-00`, §6).

The Theological Concepts domain ([§3.5](03-domains.md#35-theological-concepts-cdcfconcept-rev-03))
is the exception. Because a concept's boundary can be revised as doctrinal understanding
develops (§3.5, *Limitation — Doctrinal Development*), the two roles are separated there:

- the **ontology IRI** (`cdcf:concept/{opaque-id}`) is a semantics-free, permanently
  stable identifier that is never reassigned even if the concept's articulation is later
  split, merged, or clarified; and
- a **`skos:notation`** literal, datatyped to a declared CDCF scheme, carries the
  transparent, human-authored mnemonic used in citations, footnotes, and interchange.

Every concept entity MUST carry both fields; neither substitutes for the other.

External alignment follows the same split: `owl:sameAs` links a `cdcf:` identifier to
the corresponding named individual in Wikidata, VIAF, or GeoNames for "thing" entities
(institutions, documents, works, Scripture; and, within the CDCF ontology, persons);
`skos:exactMatch` is reserved for concept-to-concept mappings between the `cdcf:concept/`
vocabulary and other controlled theological or philosophical vocabularies. This layering
does not change the resolution protocol of [Section 4](04-resolution.md): both opaque and
transparent identifiers under this specification remain fully dereferenceable HTTPS
URIs, and both resolve through the same content-negotiated endpoint.

**Persons [REV-04].** Persons do not meet the second condition of this rule. Outside
closed authoritative lists such as the Roman Pontiffs and the Doctors of the Church, the
set of persons is open-ended and the Church keeps no register that settles their names;
readable person slugs could be disambiguated only by invented qualifiers. Persons are
therefore not identified under `cdcf:` at all. Each person is a named individual in the
CDCF ontology ([§3.6.1](03-domains.md#361-persons-as-ontology-individuals-new--rev-04)),
and `cdcf:` resources refer to a person only by that individual's ontology IRI.

---

**Previous:** [01 — Introduction](01-introduction.md) · **Next:** [03 — Identifier Domains](03-domains.md)
