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
      "citedIn":        "cdcf:magisterium/trent/decretum-de-sanctissimo-eucharistiae-sacramento/canon/1" },
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
| `300` | Alias value maps to more than one identifier (split concept, [§3.5.1](03-domains.md#351-opaque-id-allocation-new--rev-03)) **[REV-05]** | `{ "scheme": "...", "value": "...", "choices": ["cdcf:...", ...] }` |
| `301` | Deprecated; use `Location` header | `{ "error": "deprecated", "successor": "cdcf:...", "since": "YYYY-MM-DD" }` |
| `303` | Alias lookup matched; use `Location` header ([§4.9](#49-alias-lookup-new--rev-05)) **[REV-05]** | None |
| `400` | Malformed request, e.g. an alias scheme not registered for the domain **[REV-05]** | `{ "error": "bad-request", "message": "..." }` |
| `404` | Identifier not yet assigned, or no alias match | `{ "error": "not-found", "identifier": "...", "message": "...", "suggestion": null }` |
| `406` | Accept type not supported | `{ "error": "not-acceptable", "supported": [...] }` |
| `410` | Retired; no successor | `{ "error": "gone", "identifier": "...", "retiredOn": "YYYY-MM-DD" }` |

All error responses MUST be served with `Content-Type: application/json`. The `message`
field in `404` responses SHOULD include human-readable detail (e.g., *"Chapter 99 does
not exist in the Gospel of John"*). The `suggestion` field MAY carry an alternative
identifier if a close match exists in the registry — including, for a former draft
`cdcf:person/` path, the corresponding ontology IRI or `cdcf:work/` identifier
([§3.6.1](03-domains.md#361-persons-as-ontology-individuals-new--rev-04)), and, for a
path using a former 0.3.0 book code (`jn`, `mt`), the corrected identifier
([§3.1](03-domains.md#31-scripture-cdcfverse-and-books-cdcfbook-rev-02)) **[REV-05]**.

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

### 4.6.1 Bulk Resolution [NEW — REV-05]

`Prefer: depth=1` mitigates the most common N+1 request pattern. A bulk resolution
endpoint (`POST /resolve` with an array of identifiers) is specified in the separate
`draft-cdcf-resolution-api-00`
([§6.5.1](06-governance.md#651-chartered-sub-specifications-new--rev-05)), not in this
document. To keep bulk and single resolution interchangeable, any bulk mechanism MUST
meet these constraints:

1. The result for each identifier MUST be identical to the representation a single `GET`
   of that identifier returns at the same depth ([§4.6](#46-response-depth-rev-02)).
2. Each result MUST carry its own status code; a result whose status is `4xx` MUST carry
   the corresponding error body from
   [§4.5](#45-http-status-codes-and-error-response-schema-rev-02). One failed item does
   not fail the request.
3. Results MUST be returned in the order of the identifiers in the request.
4. The server MUST advertise the maximum number of identifiers it accepts in one
   request. The advertisement mechanism is defined by the API specification.

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
   [RFC 4287](https://www.rfc-editor.org/rfc/rfc4287)), as specified in
   [§4.8.1](#481-change-notification-feed-new--rev-05)
4. DNS records for `id.catholiccommons.org` MUST be protected with DNSSEC

Consuming applications SHOULD implement fallback logic: if the canonical hostname is
unreachable, attempt the first mirror from the most recently cached mirror list before
failing. Because stable identifiers carry `max-age=31536000`, most production traffic
will be served from local cache without contacting the resolution server.

### 4.8.1 Change Notification Feed [NEW — REV-05]

The feed at `https://id.catholiccommons.org/changes` MUST publish an entry for each:

- identifier addition, correction, deprecation (`301`), and retirement (`410`);
- addition of, or change to, a `cdcf:rel/` OWL declaration
  ([§3.8.1](03-domains.md#381-resolution-of-cdcfrel-identifiers-rev-02)); and
- publication of a JSON-LD context version
  ([§4.3.1](#431-context-document-requirements)). Context versions are immutable, so
  their entries only ever announce that a version (e.g. `context/v2`) was published.

Entries are retained permanently. The live feed document MUST contain at least the
entries of the last 90 days; older entries MUST be moved into archive documents as
defined for Archived Feeds in [RFC 5005](https://www.rfc-editor.org/rfc/rfc5005) §4,
linked from the live feed with `prev-archive`. The feed is a notification mechanism: the
version-controlled history of the registry remains the public audit log required by
[Section 7](07-security.md).

## 4.9 Alias Lookup [NEW — REV-05]

Some entities are also known by a name from another naming scheme — a concept by its
`skos:notation`, for example. Rather than mint a second identifier for such a name, the
resolution server resolves a registered alias to the canonical identifier:

```
GET https://id.catholiccommons.org/{domain}?{scheme}={value}
→ 303 See Other
  Location: https://id.catholiccommons.org/{domain}/{path}
```

1. `{scheme}` MUST be an alias scheme registered for `{domain}`
   ([§4.9.1](#491-registered-alias-schemes)). A request naming an unregistered scheme, or
   more than one alias parameter, MUST receive `400` with the error body of
   [§4.5](#45-http-status-codes-and-error-response-schema-rev-02).
2. Matching is exact: `{value}` (after percent-decoding) is compared with the registered
   values of that scheme for that domain without case folding, normalization, or prefix
   matching.
3. If exactly one identifier matches, the server MUST respond `303 See Other` with a
   `Location` header carrying the canonical HTTPS IRI.
4. If the value is registered for more than one identifier — which happens only when a
   concept has been split ([§3.5.1](03-domains.md#351-opaque-id-allocation-new--rev-03))
   — the server MUST respond `300 Multiple Choices` with a body listing every candidate
   identifier in `choices` (§4.5).
5. If nothing matches, the server MUST respond `404` with the §4.5 error body, whose
   `identifier` field echoes the request (e.g. the misspelled
   `concept?notation=transubstantation`). The
   `suggestion` field MAY carry the canonical identifier of a close match.
6. An alias value, once registered for an entity, MUST NOT be reassigned to a different
   entity.
7. Applications MUST store the canonical identifier, never the alias, in any persisted
   graph or cross-reference.

**Normative status.** The CDCF resolution server and every mirror listed at
`/.well-known/cdcf-mirrors` ([§4.8](#48-operational-resilience-rev-02)) MUST implement
alias lookup for every registered scheme. For other implementations of this
specification, alias lookup is OPTIONAL; an implementation that offers it MUST follow
the rules above.

### 4.9.1 Registered Alias Schemes

The registry lists the alias schemes registered for each domain. This version registers:

| Scheme | Domain | Registered values | Defined in |
|---|---|---|---|
| `notation` | `concept` | Each concept's current `skos:notation` and every prior notation kept as `skos:altLabel` | [§3.5.2](03-domains.md#352-convenience-resolution-by-notation-new--rev-03) |

Other alias schemes have been proposed (Hebrew Psalm numbering, OSIS separate-book IDs,
clavis numbers, Wikidata QIDs, and the identifiers of existing Roman Pontiffs and Doctors
of the Church datasets) under [Open Issues](08-open-issues.md) 1, 2, 16, 17 and 18. They
are not registered by this version. The book codes corrected in version 0.4.0 (`jn`,
`mt`) MUST NOT be registered as aliases
([§3.1](03-domains.md#31-scripture-cdcfverse-and-books-cdcfbook-rev-02)).

---

**Previous:** [03 — Identifier Domains](03-domains.md) · **Next:** [05 — Theological Authority Metadata](05-authority.md)
