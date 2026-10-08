# 4. Resolution Protocol [REV-02]

## 4.1 HTTP Resolution

All `cdcf:` identifiers MUST be resolvable via HTTPS GET to the base URI. The resolution
server MUST support content negotiation via the HTTP `Accept` header.

## 4.2 Content Negotiation

| Accept Header | Format | Use Case |
|---|---|---|
| `text/html` | HTML | Human-readable browser view |
| `application/json` | JSON | Application integration |
| `application/ld+json` | JSON-LD | Linked Data / semantic web |
| `application/rdf+xml` | RDF/XML | OWL ontology systems |
| `text/turtle` | Turtle RDF | SPARQL / triplestore import |

## 4.3 JSON-LD Context Specification [REV-02]

Version 0.2.0 referenced `https://id.catholiccommons.org/context/v1` in example
responses without specifying the context document. This is corrected here.

### 4.3.1 Context Document Requirements

- The context document at `https://id.catholiccommons.org/context/v1` MUST map all
  field names used in `cdcf:` resolution responses to their fully qualified IRIs
- MUST be served with `Cache-Control: public, max-age=31536000, immutable` (one year;
  it is versioned and therefore stable)
- MUST be embedded inline in resolution responses (the `@context` field MUST contain
  the expanded context object, not only the URL) when the request includes
  `Prefer: return=representation`, or when the response is for a `cdcf:rel/` identifier
- Context versions are immutable: `v1` will never change. A new field requiring a
  different mapping requires a `v2` context; responses using v2 fields MUST reference
  `context/v2`
- MUST declare the `cdcf:` prefix, all `@type` values, and all relationship predicates
  used in [§3.8](03-domains.md#38-relationship-types-cdcfrel-rev-02)

### 4.3.2 Context Availability

Consuming applications MUST NOT assume the context URL is always reachable at request
time. Implementations SHOULD cache the context document locally. CDCF MUST publish the
context document as a static file on its GitHub repository so that implementations can
bundle it directly, eliminating the remote dependency.

## 4.4 Example Resolution Response [REV-02]

Full response for `cdcf:verse/john/6/53`, including the `licenses` object, inline
`@context`, opaque concept identifiers carrying transparent `skos:notation` values
([§2.6](02-syntax.md#26-two-layer-identifiers-ontology-iri-and-canonical-notation-rev-03)),
and typed relationship edges. See
[`examples/verse-john-6-53.jsonld`](../examples/verse-john-6-53.jsonld) for the complete,
lint-able file.

```json
{
  "@context": {
    "cdcf": "https://id.catholiccommons.org/",
    "owl":  "http://www.w3.org/2002/07/owl#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#"
  },
  "@id":  "cdcf:verse/john/6/53",
  "@type": "cdcf:BibleVerse",
  "book": "cdcf:book/john",
  "chapter": 6, "verse": 53,
  "osisRef": "John.6.53",
  "licenses": {
    "*":              "public-domain",
    "text.en-RSVCE":  "proprietary-licensed",
    "text.en-NABRE":  "proprietary-licensed"
  },
  "text": {
    "la-Vulgata": "Dixit ergo eis Iesus: Amen amen dico...",
    "en-DRC":     "Then Jesus said to them: Amen, amen..."
  },
  "crossReferences": [
    { "@type":          "cdcf:rel/magisterial-proof-text",
      "target":         "cdcf:concept/CN0007",
      "targetNotation": "real-presence",
      "citedIn":        "cdcf:magisterium/trent/decree-eucharist/canon/1" },
    { "@type":          "cdcf:rel/patristic-interpretation",
      "target":         "cdcf:concept/CN0007",
      "targetNotation": "real-presence",
      "citedIn":        "cdcf:work/cyril-of-alexandria-commentary-on-john" }
  ]
}
```

## 4.5 HTTP Status Codes and Error Response Schema [REV-02]

Every 4xx response has a mandatory JSON error body.

| HTTP Code | Condition | Error Response Body Required |
|---|---|---|
| `200` | Success | Full resource representation |
| `301` | Deprecated; use `Location` header | `{ "error": "deprecated", "successor": "cdcf:...", "since": "YYYY-MM-DD" }` |
| `404` | Identifier not yet assigned | `{ "error": "not-found", "identifier": "...", "message": "...", "suggestion": null }` |
| `406` | Accept type not supported | `{ "error": "not-acceptable", "supported": [...] }` |
| `410` | Retired; no successor | `{ "error": "gone", "identifier": "...", "retiredOn": "YYYY-MM-DD" }` |

All error responses MUST be served with `Content-Type: application/json`. The `message`
field in `404` responses SHOULD include human-readable detail (e.g., *"Chapter 99 does
not exist in the Gospel of John"*). The `suggestion` field MAY carry an alternative
identifier if a close match exists in the registry — including, for a former draft
`cdcf:person/` path, the corresponding ontology IRI or `cdcf:work/` identifier
([§3.6.1](03-domains.md#361-persons-as-ontology-individuals-new--rev-04)).

## 4.6 Response Depth [REV-02]

Version 0.2.0 did not define how much related data is inlined in responses. Without
this, implementations diverge: one may inline all `crossReferences` fully, another may
return only identifiers, breaking consuming applications.

Response depth is controlled by a `depth` preference in the HTTP `Prefer` request header
([RFC 7240](https://www.rfc-editor.org/rfc/rfc7240)). **[REV-04]** Version 0.3.0 defined a
bespoke `Depth` header, which collides with the WebDAV `Depth` header
([RFC 4918](https://www.rfc-editor.org/rfc/rfc4918)) whose values and semantics differ.
Two depth levels are defined:

- **`Prefer: depth=0`** (default) — *summary*: core metadata and identifier arrays only;
  no nested objects inlined. `crossReferences` is an array of `cdcf:` URI strings.
- **`Prefer: depth=1`** — *full*: core metadata with one level of related objects
  inlined. `crossReferences` is an array of objects with `@type`, `target`, and
  `citedIn` fields as shown in [§4.4](#44-example-resolution-response-rev-02).

Depth values above 1 are reserved for future use. Implementations MUST treat an
unrecognised depth value as `depth=0`, and the default behaviour (no depth preference) is
equivalent to `depth=0`. Servers SHOULD return a `Preference-Applied: depth={n}` response
header and MUST include `Prefer` in the `Vary` response header, so that caches keep
summary and full representations apart.

> **Design note — N+1 and bulk resolution:** `Prefer: depth=1` mitigates the most common
> N+1 request pattern. A bulk resolution endpoint (`POST /resolve` with an array of
> identifiers) is a near-term implementation requirement, planned for version 1.0.0 of
> the API specification. It is outside the scope of this identifier scheme document but
> is acknowledged here to prevent incompatible implementations.

## 4.7 Caching [REV-02]

The resolution server MUST set the following headers on all `200` responses for stable
identifiers (those in a published CDCF release):

- `Cache-Control: public, max-age=31536000, immutable` — one year; stable identifiers
  do not change
- `ETag` — a hash of the response body, supporting conditional GET (`If-None-Match`)
- `Last-Modified` — date of the last substantive change to the resource

Draft identifiers (in a draft release, not yet stable) MUST be served with
`Cache-Control: public, max-age=86400` (one day).

## 4.8 Operational Resilience [REV-02]

The resolution server at `id.catholiccommons.org` is the single canonical hostname and
MUST have a 99.9% monthly availability SLA. By version 1.0.0, the following are
REQUIRED:

1. At least two geographically distributed mirror servers hosting identical read-only
   replicas
2. A mirror discovery endpoint at `https://id.catholiccommons.org/.well-known/cdcf-mirrors`
   returning a JSON array of mirror base URIs
3. A change notification feed at `https://id.catholiccommons.org/changes` (Atom format,
   [RFC 4287](https://www.rfc-editor.org/rfc/rfc4287)) publishing an entry for every
   identifier deprecation, addition, and correction
4. DNS records for `id.catholiccommons.org` MUST be protected with DNSSEC

Consuming applications SHOULD implement fallback logic: if the canonical hostname is
unreachable, attempt the first mirror from the most recently cached mirror list before
failing. Because stable identifiers carry `max-age=31536000`, most production traffic
will be served from local cache without contacting the resolution server.

---

**Previous:** [03 — Identifier Domains](03-domains.md) · **Next:** [05 — Theological Authority Metadata](05-authority.md)
