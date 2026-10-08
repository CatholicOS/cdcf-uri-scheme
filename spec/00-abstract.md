# Abstract

This document defines the `cdcf:` URI scheme — a system of stable, globally unique,
dereferenceable identifiers for canonical Catholic entities including Scripture,
Magisterial documents, Catechism paragraphs, Canon Law, theological concepts, cited
works, and ecclesiastical institutions. Persons (saints, popes, Church Fathers,
theologians) are not identified by this scheme: they are named individuals in the CDCF
ontology, which `cdcf:` resources reference ([§3.6.1](03-domains.md#361-persons-as-ontology-individuals-new--rev-04)).

The scheme is designed to serve as the foundational reference layer for interoperable
Catholic digital infrastructure. It draws on established internet standards (URI syntax
per RFC 3986, content negotiation per RFC 7231, Linked Data principles per W3C, and ABNF
grammar per RFC 5234) while respecting the theological authority structures of the
Catholic Church.

This is a Draft Proposal published for public comment. The Catholic Digital Commons
Foundation invites responses from developers, theologians, canonists, and Catholic
institutions. The comment period closes 60 days from the date of publication.

> **Reviewer note — version 0.5.0:** This version withdraws the `cdcf:person/` domain
> following Board review: persons are not an enumerable or finite set and are better
> modelled as individuals in the CDCF ontology ([§3.6.1](03-domains.md#361-persons-as-ontology-individuals-new--rev-04)).
> Works cited by persons move to a new `cdcf:work/` domain ([§3.6](03-domains.md#36-works-cdcfwork-rev-04)).
> The release also corrects the papal ordinal rule, the response-depth header, the
> upper-case rule for opaque identifiers, and the Eastern Catholic churches list.
> Theological content from 0.2.0 and the identifier model of 0.4.0 are otherwise
> unchanged.

---

## Terminology

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHOULD**, **RECOMMENDED**,
and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).
ABNF notation is per [RFC 5234](https://www.rfc-editor.org/rfc/rfc5234).

| Term | Definition |
|---|---|
| Canonical Entity | A Catholic object of theological, juridical, or historical significance with a defined authoritative source |
| Canonical Identifier | A globally unique, stable URI assigned to a canonical entity under this specification |
| Dereferencing | The act of resolving a URI to its data resource via an HTTP request |
| Response Depth | A request parameter controlling how much related data is inlined in a resolution response (summary vs. full) |
| `licenses` object | A structured metadata object mapping each content field in a resolution response to its applicable `licenseStatus` value |
| Assent of Faith | The unconditional assent (*assensus fidei*) required for truths proposed as divinely revealed |
| Definitive Assent | The firm assent (*assensus definitivus*) required for truths definitively proposed but not explicitly revealed |
| Religious Submission | *Obsequium religiosum* — submission of intellect and will owed to authentic but non-definitive magisterial teaching (LG §25) |
| DS Number | Denzinger-Schönmetzer reference number — the established scholarly ID for magisterial texts |
| OSIS Code | Open Scripture Information Standard book abbreviation, used for Scripture book references |
| *Sui iuris* Church | One of the 24 autonomous Catholic churches (1 Latin, 23 Eastern) in full communion with the Bishop of Rome |

---

**Next:** [01 — Introduction](01-introduction.md)
