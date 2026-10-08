# 7. Security Considerations

- The resolution server MUST be served exclusively over HTTPS (TLS 1.2 minimum)
- The registry MUST be maintained under version control with a public audit log
- The resolution server MUST NOT accept write operations via the public endpoint
- Implementations MUST validate that responses originate from
  `id.catholiccommons.org` or a listed mirror
- DNS records MUST be protected with DNSSEC
- The JSON-LD context document MUST be served with Subresource Integrity (SRI) hashes
  published on the CDCF GitHub repository, so that implementations bundling the context
  locally can verify its integrity

## Open Standards Alignment

| Standard | Used for |
|---|---|
| RFC 2119 | Requirement levels (MUST/SHOULD/MAY) |
| RFC 3986 | URI generic syntax |
| RFC 4287 | Atom Syndication Format (change notification feed) |
| RFC 5234 | ABNF for syntax specifications |
| RFC 7231 | HTTP/1.1 semantics (content negotiation) |
| RFC 7240 | `Prefer` header (response depth, [§4.6](04-resolution.md#46-response-depth-rev-02)) |
| W3C JSON-LD 1.1 | Resolution response format |
| W3C OWL 2 | `cdcf:rel/` property declarations |
| ISO/IEC 21838-2 | Basic Formal Ontology (BFO) |
| W3C SKOS | `skos:notation` / `skos:exactMatch` for concept identifiers ([§2.6](02-syntax.md#26-two-layer-identifiers-ontology-iri-and-canonical-notation-rev-03)) **[REV-03]** |
| OSIS 2.1.1 | Scripture book codes |

---

**Previous:** [06 — Governance](06-governance.md) · **Next:** [08 — Open Issues](08-open-issues.md)
