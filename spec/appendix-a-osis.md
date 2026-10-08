# Appendix A: OSIS Book Code Reference (Selected)

The following OSIS codes are used in `cdcf:verse/` and `cdcf:book/` identifiers. Consult
the full [OSIS 2.1.1 specification](https://www.crosswire.org/osis/) for the complete
list, including all deuterocanonical books.

| OSIS | Book | OSIS | Book | Canon |
|---|---|---|---|---|
| `Gen` | Genesis | `Matt` | Matthew | OT/NT |
| `Exod` | Exodus | `Mark` | Mark | OT/NT |
| `Ps` | Psalms | `Luke` | Luke | OT/NT |
| `Prov` | Proverbs | `John` | John | OT/NT |
| `Isa` | Isaiah | `Rom` | Romans | OT/NT |
| `Dan` | Daniel | `1Cor` | 1 Corinthians | OT/NT |
| `Tob` | Tobit | `Eph` | Ephesians | Deuterocanon/NT |
| `Sir` | Sirach | `Rev` | Revelation | Deuterocanon/NT |
| `1Macc` | 1 Maccabees | `2Macc` | 2 Maccabees | Deuterocanon |

> All `osis-book` values in `cdcf:` identifiers MUST be the exact OSIS 2.1.1 book ID,
> lower-cased (e.g., `Gen` → `gen`, `John` → `john`, `Matt` → `matt`) per the ABNF
> grammar in [Appendix D](appendix-d-abnf.abnf). The book segment of an identifier MUST
> match the book segment of its `osisRef` field byte-for-byte after case-folding.
>
> **[REV-03]** Version 0.3.0 listed `Jn` for John and used `jn` / `mt` in its examples.
> `Jn` and `Mt` are common display abbreviations, not OSIS identifiers; they are
> corrected here. See [Open Issue 15](08-open-issues.md).

---

**Previous:** [09 — References](09-references.md) · **Next:** [Appendix B — Eastern Churches](appendix-b-eastern-churches.md)
