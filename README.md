# CDCF Catholic URI Scheme

**draft-cdcf-catholic-uri-scheme-04** · Version 0.5.0 · Status: **Draft Proposal — Public Comment**

A system of stable, globally unique, dereferenceable identifiers (`cdcf:`) for canonical
Catholic entities — Scripture, Magisterial documents, the Catechism, Canon Law,
theological concepts, cited works, and ecclesiastical institutions. Persons (saints,
popes, Church Fathers, theologians) are not `cdcf:` identifiers: they are named
individuals in the CDCF ontology, which `cdcf:` resources reference.

## Why this exists

Catholic digital projects — Bible apps, catechetical platforms, canon law databases,
theological reasoning engines — currently have no shared reference system. A magisterial
document cited in one application cannot be reliably matched to the same document in
another. This leads to two recurring failure modes:

- **Siloed digitization** — each project re-digitizes the same texts, introducing errors
  that can't be corrected centrally.
- **Vendor lock-in** — proprietary formats prevent interoperability and put governance of
  Church data outside Church institutions.

This specification defines the identifier layer needed to fix both.

## Status

| | |
|---|---|
| Document ID | `draft-cdcf-catholic-uri-scheme-04` |
| Supersedes | `draft-cdcf-catholic-uri-scheme-03` (v0.4.0) |
| Version | 0.5.0 (October 2026) |
| Comment period | 60 days from publication |
| License | [CC-BY 4.0 International](https://creativecommons.org/licenses/by/4.0/) |
| Issuing body | Catholic Digital Commons Foundation (CDCF) |
| Repository | [github.com/CatholicOS/cdcf-uri-scheme](https://github.com/CatholicOS/cdcf-uri-scheme) |

### What changed in 0.5.0

- **`cdcf:person/` withdrawn.** Persons are not an enumerable set and the Church keeps no
  register that settles their names, so they are modelled as individuals in the CDCF
  ontology with opaque IRIs ([§3.6.1](spec/03-domains.md#361-persons-as-ontology-individuals-new--rev-04)).
- **New `cdcf:work/` domain** for cited works, keeping the variable-depth path grammar
  ([§3.6](spec/03-domains.md#36-works-cdcfwork-rev-04)).
- Papal issuer slugs include the ordinal only where it is part of the official name —
  `pope-francis`, not `pope-francis-i` ([§3.2.3](spec/03-domains.md#323-papal-issuer-slugs-new--rev-04)).
- Response depth moves from a bespoke `Depth` header to `Prefer: depth=` (RFC 7240)
  ([§4.6](spec/04-resolution.md#46-response-depth-rev-02)).
- Upper-case exception for opaque prefixes (`CN`) in the syntax rules and ABNF.
- Appendix B now lists all 23 Eastern Catholic churches.

Version 0.4.0 (which never shipped as a repo release) is folded in: opaque `CN`-prefixed
concept IRIs with mandatory `skos:notation`, the notation-lookup endpoint, and the OSIS
book-code fix (`jn`→`john`, `mt`→`matt`). Full detail in [`CHANGELOG.md`](CHANGELOG.md).

## Reading the spec

The specification is split into sections under [`spec/`](spec/), in reading order:

| File | Covers |
|---|---|
| [`00-abstract.md`](spec/00-abstract.md) | Abstract, terminology |
| [`01-introduction.md`](spec/01-introduction.md) | Problem statement, design principles |
| [`02-syntax.md`](spec/02-syntax.md) | URI syntax rules, stability guarantee, licenses object, two-layer identifier model |
| [`03-domains.md`](spec/03-domains.md) | All nine `cdcf:` identifier domains with examples; persons as ontology individuals |
| [`04-resolution.md`](spec/04-resolution.md) | HTTP resolution, content negotiation, JSON-LD, errors, response depth, caching |
| [`05-authority.md`](spec/05-authority.md) | Theological authority metadata (the three levels of assent) |
| [`06-governance.md`](spec/06-governance.md) | Change process, versioning, theological/canonical review |
| [`07-security.md`](spec/07-security.md) | Security considerations, open standards alignment |
| [`08-open-issues.md`](spec/08-open-issues.md) | Open questions for public comment (18) |
| [`09-references.md`](spec/09-references.md) | Normative and informative references |
| [`appendix-a-osis.md`](spec/appendix-a-osis.md) | OSIS Scripture book code reference |
| [`appendix-b-eastern-churches.md`](spec/appendix-b-eastern-churches.md) | Eastern Catholic *sui iuris* churches (all 23) |
| [`appendix-d-abnf.abnf`](spec/appendix-d-abnf.abnf) | **Normative grammar** (machine-readable) |

Worked example resolution responses live in [`examples/`](examples/).

> **Section numbering.** This repo numbers sections as in earlier repo releases
> (Terminology lives in `00-abstract.md`), so each section is one lower than in the
> `.docx` rendering of draft-04 — e.g. the docx's §4.6.1 is §3.6.1 here, and docx §9
> (Open Standards Alignment) is part of `07-security.md`. Open Issues are numbered 1–18.

## How to propose a change

1. **Open an Issue first** for anything beyond a typo fix — wording changes, new domains,
   new fields, disputes about an identifier. This is where discussion happens.
2. **Open a PR** once there's rough consensus on an Issue, or for trivial fixes
   (typos, broken links, formatting).
3. **CI must pass.** Every PR is automatically checked against the ABNF grammar and the
   JSON-LD examples (see [`.github/workflows/validate.yml`](.github/workflows/validate.yml)).
   This catches syntax problems before a human reviewer needs to look at the PR.
4. **Theological/canonical sign-off is required** for any PR touching:
   - `05-authority.md` (authority levels, assent taxonomy)
   - the `documentType` / `papalApproval` vocab in `03-domains.md`
   - any concept identifier's doctrinal metadata or `skos:notation`
   - the rule for representing persons as ontology individuals (§3.6.1)

   These PRs require approval from a reviewer on the CDCF Technical Advisory Group
   before merge (enforced via branch protection — see `CODEOWNERS`).
5. **Breaking changes** (anything that would invalidate a previously published identifier)
   require a new major version and an explicit migration note — see `06-governance.md`.

Editorial PRs (typos, clarifications, examples) can be merged by any maintainer once CI
passes. Substantive PRs follow the Draft → Last Call → Published cycle described in
`06-governance.md`.

## Running the checks locally

No dependencies beyond Node.js 20:

```sh
node scripts/validate-grammar.js     spec/appendix-d-abnf.abnf
node scripts/validate-jsonld.js      examples/
node scripts/validate-identifiers.js spec/appendix-d-abnf.abnf examples/
node scripts/check-duplicate-vocab.js spec/03-domains.md
node scripts/check-duplicate-vocab.js spec/appendix-b-eastern-churches.md
```

## License

Specification text is licensed [CC-BY 4.0 International](https://creativecommons.org/licenses/by/4.0/).
Code in this repository (validators, CI scripts) is licensed MIT unless stated otherwise.
