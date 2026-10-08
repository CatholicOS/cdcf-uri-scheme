# 3. Identifier Domains

The `cdcf:` namespace is divided into nine domains. Domains revised or added in version
0.3.0 are marked **[REV-02]**; in version 0.4.0, **[REV-03]**; in version 0.5.0,
**[REV-04]**. The formal grammar for every domain is in
[Appendix D](appendix-d-abnf.abnf); this section gives the human-readable description and
worked examples.

| Domain | Section | Identifies |
|---|---|---|
| `cdcf:book/` | [§3.1.1](#311-book-identifiers-cdcfbook-rev-02) | Books of Scripture |
| `cdcf:verse/` | [§3.1.2](#312-verse-identifiers-cdcfverse) | Chapters, verses, and verse ranges |
| `cdcf:magisterium/` | [§3.2](#32-magisterial-documents-cdcfmagisterium-rev-02) | Magisterial documents and their sections |
| `cdcf:ccc/` | [§3.3](#33-catechism-cdcfccc) | Catechism paragraphs and ranges |
| `cdcf:canon/` | [§3.4](#34-canon-law-cdcfcanon) | Canons, paragraphs, authentic interpretations |
| `cdcf:concept/` | [§3.5](#35-theological-concepts-cdcfconcept-rev-03) | Theological concepts (opaque IRI + `skos:notation`) |
| `cdcf:work/` | [§3.6](#36-works-cdcfwork-rev-04) | Cited works and their internal divisions |
| `cdcf:institution/` | [§3.7](#37-institutions-cdcfinstitution-rev-02) | Councils, dicasteries, conferences, *sui iuris* churches, … |
| `cdcf:rel/` | [§3.8](#38-relationship-types-cdcfrel-rev-02) | Typed relationships for cross-reference edges |

> **Withdrawn in 0.5.0:** `cdcf:person/`. Persons are named individuals in the CDCF
> ontology, not `cdcf:` identifiers — see [§3.6.1](#361-persons-as-ontology-individuals-new--rev-04).

## 3.1 Scripture (`cdcf:verse/`) and Books (`cdcf:book/`) [REV-02]

Version 0.2.0 referenced `cdcf:book/` in a resolution example but never defined it.
Version 0.3.0 formally introduces `cdcf:book/` as a sibling of `cdcf:verse/` — the parent
entity of all verse identifiers within that book.

The `{osis-book}` segment MUST be the exact, lower-cased OSIS 2.1.1 book ID (`john`,
`matt` — not `jn`, `mt`) **[REV-03]**. See [Appendix A](appendix-a-osis.md) and the
validation notes in [Appendix D](appendix-d-abnf.abnf).

### 3.1.1 Book identifiers (`cdcf:book/`) [REV-02]

```
cdcf:book/{osis-book}
```

| URI | Refers to |
|---|---|
| `cdcf:book/john` | The Gospel of John |
| `cdcf:book/gen` | Genesis |
| `cdcf:book/ps` | Psalms (Vulgate numbering as canonical) |
| `cdcf:book/1macc` | 1 Maccabees (deuterocanonical) |

### 3.1.2 Verse identifiers (`cdcf:verse/`)

```
cdcf:verse/{osis-book}/{chapter}/{verse}
cdcf:verse/{osis-book}/{chapter}/{start-verse}-{end-verse}    ; verse range
cdcf:verse/{osis-book}/{chapter}                              ; whole chapter
```

| URI | Refers to |
|---|---|
| `cdcf:verse/john/3/16` | John 3:16 |
| `cdcf:verse/rom/8/28-30` | Romans 8:28–30 |
| `cdcf:verse/ps/22` | Psalm 22 (Vulgate numbering, canonical) |
| `cdcf:verse/matt/26/26-28` | Matthew 26:26–28 |

> **Note:** Identifiers MUST use Vulgate Psalm numbering as canonical. The resolution
> response MUST include a `psalmNumberingMap` field with the Hebrew/Protestant
> equivalent where they differ. See [Open Issue 1](08-open-issues.md).

---

## 3.2 Magisterial Documents (`cdcf:magisterium/`) [REV-02]

```
cdcf:magisterium/{issuer-slug}/{document-slug}
cdcf:magisterium/{issuer-slug}/{document-slug}/{section-type}/{section-id}
```

**Issuer slug convention [REV-02]:** Version 0.2.0 used inconsistent conventions
(`leo13` in the magisterium domain vs. `pope-leo-xiii` in the person domain for the same
pontiff). Version 0.3.0 unified all papal slugs to the form `pope-{name}-{roman-numeral}`.
A `magisterialIssuedBy` field in the resolution response carries a machine-derivable
reference to the issuing authority.

**[REV-04]** With the withdrawal of `cdcf:person/` ([§3.6.1](#361-persons-as-ontology-individuals-new--rev-04)),
`magisterialIssuedBy` now carries the issuing pope's CDCF ontology IRI, or the
`cdcf:institution/` identifier of the issuing council or dicastery. The papal slug rule
is revised in [§3.2.3](#323-papal-issuer-slugs-new--rev-04).

| Domain | Issuer Slug Form | Example |
|---|---|---|
| `cdcf:magisterium/` | `pope-{name}[-{roman}]` | `cdcf:magisterium/pope-leo-xiii/rerum-novarum` |
| `cdcf:magisterium/` | `pope-{name}[-{roman}]` | `cdcf:magisterium/pope-pius-ix/ineffabilis-deus` |
| `cdcf:magisterium/` | `{council-slug}` | `cdcf:magisterium/trent/decree-justification` |
| `cdcf:magisterium/` | `{dicastery-slug}` | `cdcf:magisterium/ddf/fiducia-supplicans` |

### 3.2.1 Document Type Field [REV-02]

Every magisterial document resolution response MUST include a `documentType` field.
(The duplicate `dogmatic-constitution` row present in version 0.2.0 has been removed.)

| `documentType` value | Latin Term | Description / Binding Weight |
|---|---|---|
| `dogmatic-constitution` | *Constitutio dogmatica* | Ecumenical council; defines doctrine or condemns error; assent of faith required |
| `apostolic-constitution` | *Constitutio apostolica* | Highest papal legislative act; used for dogma definition and major law |
| `solemn-definition` | *Definitio sollemnis* | Ex cathedra papal definition; highest authority; assent of faith required |
| `encyclical` | *Litterae encyclicae* | Circular letter on faith, morals, discipline; authentic magisterial teaching |
| `apostolic-exhortation` | *Adhortatio apostolica* | Post-synodal or devotional; pastoral; not definitional |
| `declaration` | *Declaratio* | Formal declaration clarifying doctrine or discipline |
| `instruction` | *Instructio* | Practical guidance for implementing magisterial teaching; dicastery-issued |
| `council-decree` | *Decretum conciliare* | Conciliar decree; weight depends on papal confirmation |
| `response-authentic` | *Responsio authentica* | Authentic interpretation by Dicastery for Legislative Texts; force of law |

### 3.2.2 Papal Approval Field

The resolution response MUST include a `papalApproval` field:

- `ex-cathedra` — solemn definition by the pope personally
- `in-forma-specifica` — papal approval incorporating the document as the pope's own act
- `in-forma-communi` — papal approval of the dicastery's competence but not the
  document's specific content
- `dicastery-only` — issued by a dicastery without explicit papal approval
- `conciliar` — promulgated by ecumenical council confirmed by the pope

> **Example — *Fiducia Supplicans* (2023):**
> `cdcf:magisterium/ddf/fiducia-supplicans` resolves with `documentType: declaration`,
> `papalApproval: in-forma-communi`, `authorityLevel: authentic-doctrine`. See
> [`examples/magisterium-fiducia-supplicans.jsonld`](../examples/magisterium-fiducia-supplicans.jsonld).

| URI | Refers to |
|---|---|
| `cdcf:magisterium/trent/decree-justification` | Council of Trent, Decree on Justification (1547) |
| `cdcf:magisterium/trent/decree-justification/canon/9` | Trent, Decree on Justification, Canon 9 |
| `cdcf:magisterium/vatican2/dei-verbum` | Vatican II, *Dei Verbum* (1965) |
| `cdcf:magisterium/pope-leo-xiii/rerum-novarum` | Leo XIII, *Rerum Novarum* (1891) |
| `cdcf:magisterium/pope-pius-ix/ineffabilis-deus` | Pius IX, *Ineffabilis Deus* (1854) — Immaculate Conception |
| `cdcf:magisterium/pope-francis/laudato-si` | Francis, *Laudato Si'* (2015) |
| `cdcf:magisterium/ddf/fiducia-supplicans` | DDF, *Fiducia Supplicans* (2023) |

### 3.2.3 Papal Issuer Slugs [NEW — REV-04]

The Roman Pontiffs form a closed, authoritatively numbered list, so papal issuer slugs in
`cdcf:magisterium/` remain human-readable path tokens under the rule in
[§2.6](02-syntax.md#26-two-layer-identifiers-ontology-iri-and-canonical-notation-rev-03).
A papal slug is `pope-{name}`, followed by `-{roman}` **wherever the ordinal forms part of
the pope's official name**.

Version 0.3.0 required an ordinal suffix on every papal slug for forward stability; that
rule produced `pope-francis-i`, a regnal name Pope Francis never used. Forward stability
is guaranteed by [§2.4](02-syntax.md#24-stability-guarantee) instead: once assigned,
`pope-francis` permanently denotes Pope Francis, and a future pontiff taking the same
name receives `pope-francis-ii`. The slug is a citation token only; the pontiff himself
is identified by his ontology IRI ([§3.6.1](#361-persons-as-ontology-individuals-new--rev-04)).

```
cdcf:magisterium/pope-leo-xiii/rerum-novarum
cdcf:magisterium/pope-francis/laudato-si
```

---

## 3.3 Catechism (`cdcf:ccc/`)

Resolution responses for CCC text MUST carry
`licenses: { "text.*": "proprietary-licensed" }` as copyright in all modern translations
is held by Libreria Editrice Vaticana and/or the relevant bishops' conference.

```
cdcf:ccc/{paragraph}
cdcf:ccc/{start}-{end}
```

| URI | Refers to |
|---|---|
| `cdcf:ccc/1324` | CCC §1324 — The Eucharist as source and summit |
| `cdcf:ccc/891` | CCC §891 — Papal infallibility |
| `cdcf:ccc/1730-1748` | CCC §§1730–1748 — Human freedom section |

---

## 3.4 Canon Law (`cdcf:canon/`)

```
cdcf:canon/{code}/{canon}
cdcf:canon/{code}/{canon}/{para}
cdcf:canon/{code}/{canon}/authentic-interpretation/{date}
```

| URI | Refers to |
|---|---|
| `cdcf:canon/cic1983/1024` | CIC 1983, Canon 1024 |
| `cdcf:canon/cic1983/844/1` | CIC 1983, Canon 844 §1 |
| `cdcf:canon/cic1983/230/authentic-interpretation/1994-11-11` | Authentic interpretation of Canon 230, 11 Nov 1994 |
| `cdcf:canon/cceo/7` | CCEO, Canon 7 |
| `cdcf:canon/cic1917/1023` | CIC 1917, Canon 1023 (historical) |

The ABNF grammar in [Appendix D](appendix-d-abnf.abnf) makes the three path forms
unambiguous: a canon paragraph is always numeric; `authentic-interpretation` is a fixed
keyword; dates follow ISO 8601. No heuristic parsing is required.

---

## 3.5 Theological Concepts (`cdcf:concept/`) [REV-03]

> **Limitation — Doctrinal Development:** This domain treats each concept as a single
> stable entity. Doctrinal concepts develop over time (cf. Newman, *Essay on the
> Development of Christian Doctrine*; *Dei Verbum* §8). The `doctrinalHistory` field (an
> ordered array of `cdcf:magisterium/` references) surfaces this development without
> resolving the formal question of how to represent it. A dedicated
> doctrinal-development specification is planned. Because that boundary is not fixed the
> way a promulgated document's is, this domain uses the opaque ontology IRI / transparent
> `skos:notation` model described in
> [§2.6](02-syntax.md#26-two-layer-identifiers-ontology-iri-and-canonical-notation-rev-03),
> rather than the transparent-IRI pattern used elsewhere in this specification.

```
cdcf:concept/{opaque-id}                          ; e.g. cdcf:concept/CN0001 — opaque, semantics-free (§2.6)
skos:notation "{mnemonic}"^^cdcf:ConceptNotation  ; e.g. "transubstantiation" — citation form, not part of the IRI
```

| URI | `skos:notation` | Refers to |
|---|---|---|
| `cdcf:concept/CN0001` | `"transubstantiation"` | Real change of substance in the Eucharist |
| `cdcf:concept/CN0002` | `"hypostatic-union"` | Union of divine and human natures in Christ |
| `cdcf:concept/CN0003` | `"purgatory"` | State of purification after death |
| `cdcf:concept/CN0004` | `"natural-law"` | Moral law knowable by unaided reason |
| `cdcf:concept/CN0005` | `"filioque"` | Procession of the Holy Spirit from Father and Son |
| `cdcf:concept/CN0006` | `"original-sin"` | Sin of Adam and its transmission to all humanity |
| `cdcf:concept/CN0007` | `"real-presence"` | Christ wholly and substantially present under the Eucharistic species (the running cross-reference target in [§4.4](04-resolution.md#44-example-resolution-response-rev-02)) |

The resolution response MUST include: canonical definition (from CCC or proximate
magisterium), `doctrinalHistory` array, `authorityLevel`, `skos:notation` (the transparent
citation form, per §2.6), and `suiIurisChurch` where the concept has distinct elaboration
in an Eastern tradition. Where an external alignment exists, the response MUST carry it
as `skos:exactMatch`, not `owl:sameAs` (§2.6).

### 3.5.1 Opaque ID Allocation [NEW — REV-03]

`cdcf:concept/` identifiers are allocated sequentially by the CDCF registrar from the
`CN`-prefixed range (`CN0001`, `CN0002`, …) following the assignment process in
[§6.1](06-governance.md#61-identifier-assignment). An allocated ID is never reused,
including when a concept is later split or merged; a superseded concept follows the
deprecation contract in [§2.4](02-syntax.md#24-stability-guarantee) (`301` to a
successor, both identifiers resolvable indefinitely). The `skos:notation` mnemonic MAY be
revised across a MINOR version release to track a boundary revision without changing the
ontology IRI; the prior notation MUST remain resolvable as an alternate `skos:altLabel`.

### 3.5.2 Convenience Resolution by Notation [NEW — REV-03]

Because the opaque ontology IRI is not intended to be guessed or hand-typed, the
resolution server MUST also support lookup by notation as a convenience for humans and
authoring tools:

```
GET https://id.catholiccommons.org/concept?notation={mnemonic}
```

A matching request MUST respond with `HTTP 303 See Other` and a `Location` header
pointing to the canonical `cdcf:concept/{opaque-id}` IRI. This mirrors the
friendly-alias / resolver pattern used by community identifier services such as
w3id.org, applied here at the level of a single query parameter rather than a separate
hostname. Applications MUST treat the notation-lookup endpoint as a convenience only: the
opaque IRI returned by the `303`, not the notation string, is what MUST be stored as the
identifying reference in any persisted graph or cross-reference.

---

## 3.6 Works (`cdcf:work/`) [REV-04]

Version 0.5.0 withdraws the `cdcf:person/` domain ([§3.6.1](#361-persons-as-ontology-individuals-new--rev-04))
and replaces its work-citation function with a top-level `cdcf:work/` domain. Works —
treatises, commentaries, sermons, letters — are what citations actually point to, and
most carry a settled internal citation structure (part / question / article; book /
chapter). Authorship is expressed as a property of the work (`authoredBy`), whose value
is the author's CDCF ontology IRI, not as a path segment.

```
cdcf:work/{work-slug}
cdcf:work/{work-slug}/{path-segment}+   ; one or more sub-divisions
```

The `{path-segment}+` production is carried over unchanged from version 0.3.0 and allows
arbitrary depth for works with three or more levels of internal structure (e.g.,
*Summa Theologiae*: part / question / article; *Scriptum super Sententiis*: book /
distinction / question / article).

A `work-slug` MUST be unique across the registry. Where a conventional title is shared
by more than one work (e.g., the commentaries on John by Cyril of Alexandria, Augustine
and Thomas Aquinas), the slug MUST be prefixed with the author's conventional citation
name (`cyril-of-alexandria-commentary-on-john`). That prefix is part of the work's
citation title; it is **not** a person identifier and MUST NOT be parsed as one. Whether
established clavis numbers (CPG, CPL) should be used instead for patristic works is
[Open Issue 16](08-open-issues.md). See [Appendix D](appendix-d-abnf.abnf) for the ABNF
production.

| URI | Refers to |
|---|---|
| `cdcf:work/summa-theologiae` | Thomas Aquinas, *Summa Theologiae* |
| `cdcf:work/summa-theologiae/iii/q75/a1` | ST III, Q.75, A.1 (variable-depth path) |
| `cdcf:work/confessions` | Augustine, *Confessions* |
| `cdcf:work/cyril-of-alexandria-commentary-on-john` | Cyril of Alexandria, *Commentary on John* (author-qualified slug: title shared with other works) |

### 3.6.1 Persons as Ontology Individuals [NEW — REV-04]

Persons are not identified under `cdcf:`. A person — a saint, pope, Church Father,
Doctor or theologian — is a BFO object (an independent continuant) whose ecclesial
standing consists of roles (Roman Pontiff, Doctor of the Church, martyr) and statuses
(venerable, blessed, saint) acquired over time. That structure belongs in the CDCF
ontology's classes and individuals, not in a citation path. Unlike the other domains of
this specification, the set of persons is not enumerable in advance and, outside closed
lists, has no Church-settled naming; readable person slugs would need invented
disambiguators (dates, sees, epithets), which is exactly the condition
[§2.6](02-syntax.md#26-two-layer-identifiers-ontology-iri-and-canonical-notation-rev-03)
identifies for separating identifier from label.

Accordingly:

- **(a)** each person is a named individual minted in the CDCF ontology namespace under
  that ontology's own allocation rules, using opaque registrar-allocated identifiers on
  the pattern of [§3.5.1](#351-opaque-id-allocation-new--rev-03) (UUIDs are not required);
- **(b)** human-readable forms are carried by `rdfs:label` and `skos:notation` on the
  individual, and external alignment by `owl:sameAs` to Wikidata and VIAF (§2.6);
- **(c)** closed authoritative lists such as the Roman Pontiffs and the Doctors of the
  Church are expressed as role or list membership of that single individual, each with
  its own notation, not as parallel identity schemes; and
- **(d)** wherever a `cdcf:` resolution response refers to a person (`authoredBy`,
  `magisterialIssuedBy`), the value MUST be the person's ontology IRI.

Ontology IRIs are served from `id.catholiccommons.org` by the same resolution server
([Section 4](04-resolution.md)), with the same content negotiation.

No `cdcf:person/` identifier reached a stable release ([§2.4](02-syntax.md#24-stability-guarantee)),
so the withdrawal carries no deprecation burden. A resolution server MAY answer a request
for a former draft `cdcf:person/` path with `HTTP 404` and a `suggestion` field
([§4.5](04-resolution.md#45-http-status-codes-and-error-response-schema-rev-02)) carrying
the corresponding ontology IRI or `cdcf:work/` identifier. See
[`examples/error-404-withdrawn-person.json`](../examples/error-404-withdrawn-person.json).

---

## 3.7 Institutions (`cdcf:institution/`) [REV-02]

```
cdcf:institution/{type}/{slug}
```

### 3.7.1 Eastern Catholic Churches

The Catholic Church comprises 24 *sui iuris* churches. Each MUST be representable
without privileging the Latin Church as the default. Eastern Church identifiers use the
`eastern-church` sub-type. The complete list of all 23 Eastern Catholic churches is in
[Appendix B](appendix-b-eastern-churches.md).

```
cdcf:institution/eastern-church/{slug}
```

| URI | Refers to |
|---|---|
| `cdcf:institution/eastern-church/maronite` | Maronite Catholic Church (West Syriac / Antiochene rite) |
| `cdcf:institution/eastern-church/coptic-catholic` | Coptic Catholic Church (Alexandrian rite) |
| `cdcf:institution/eastern-church/melkite` | Melkite Greek Catholic Church (Byzantine/Antiochene) |
| `cdcf:institution/eastern-church/chaldean` | Chaldean Catholic Church (East Syriac rite) |
| `cdcf:institution/eastern-church/ukrainian-greek-catholic` | Ukrainian Greek Catholic Church (Byzantine rite) |
| `cdcf:institution/council/trent` | Council of Trent (1545–1563) |
| `cdcf:institution/dicastery/ddf` | Dicastery for the Doctrine of the Faith |
| `cdcf:institution/conference/usccb` | United States Conference of Catholic Bishops |

---

## 3.8 Relationship Types (`cdcf:rel/`) [REV-02]

The `cdcf:rel/` domain defines a controlled vocabulary of relationship types for
cross-reference graph edges. Introduced in version 0.2.0, but it left unanswered what
dereferencing a `cdcf:rel/` identifier returns. Version 0.3.0 resolves this.

### 3.8.1 Resolution of `cdcf:rel/` identifiers [REV-02]

`cdcf:rel/` identifiers ARE dereferenceable. When resolved, they return an OWL
`ObjectProperty` declaration. `Accept: application/ld+json` returns a JSON-LD
`@type: owl:ObjectProperty` document; `Accept: application/rdf+xml` returns the OWL
declaration for ontology import; `Accept: text/html` returns a human-readable
description. See [`examples/rel-magisterial-proof-text.jsonld`](../examples/rel-magisterial-proof-text.jsonld)
for a worked example (`GET https://id.catholiccommons.org/rel/magisterial-proof-text`
with `Accept: application/ld+json`).

### 3.8.2 Relationship Type Vocabulary

| `cdcf:rel/` value | OWL Domain | OWL Range | Description |
|---|---|---|---|
| `magisterial-proof-text` | BibleVerse | Concept | Cited by the Magisterium as scriptural foundation |
| `patristic-interpretation` | BibleVerse | Concept | Interpreted in this doctrinal sense by a Church Father |
| `liturgical-use` | BibleVerse | Concept | Used in liturgy expressing this doctrine |
| `theological-argument` | BibleVerse | Concept | Used in theological argument; not magisterial |
| `typological-sense` | BibleVerse | BibleVerse | OT type fulfilled in NT antitype |
| `anagogical-sense` | BibleVerse | Concept | Points toward eschatological realities |
| `defines-concept` | MagisterialDoc | Concept | Document formally defines this concept |
| `supersedes` | MagisterialDoc | MagisterialDoc | Later document formally abrogates earlier |
| `interprets` | MagisterialDoc | Canon | Authentic interpretation of a canon |
| `contradicted-by` | Any | Any | Scholarly annotation; not a doctrinal assertion |

> Encoding cross-references without relationship types risks encoding a proof-texting
> methodology — the assumption that a scripture verse directly establishes a doctrine by
> itself — which is incompatible with Catholic hermeneutics (*Dei Verbum* §9–10). The
> `cdcf:rel/` vocabulary makes the nature of each link explicit.

---

**Previous:** [02 — URI Syntax](02-syntax.md) · **Next:** [04 — Resolution Protocol](04-resolution.md)
