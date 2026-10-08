# 5. Theological Authority Metadata

The three-level taxonomy follows the 1989 Profession of Faith and the 1998 CDF
commentary by Cardinal Ratzinger.

> **Normative sources:** 1989 Profession of Faith (*AAS* 81, 1989, pp. 104–106);
> *Ad Tuendam Fidem*, John Paul II (1998); *Commentary on the Professio fidei*,
> CDF/Card. Ratzinger (*AAS* 90, 1998, pp. 544–551); *Donum Veritatis*, CDF (1990);
> *Lumen Gentium* §25.

## 5.1 Three Levels of Assent

### Level 1 — Assent of Faith (*credenda*)

Truths contained in the Word of God and proposed by the Magisterium as divinely
revealed. Require assent of theological faith. Binding under penalty of heresy if
formally denied. Include both solemn definitions and truths proposed by the ordinary
universal magisterium (LG §25). **Both sub-types require the same assent of faith** —
they are not sequential levels.

### Level 2 — Definitive Assent (*tenenda*)

Truths proposed definitively but not explicitly contained in divine revelation. Require
definitive assent — firm and irrevocable but not an act of theological faith. Denial is
error but not formal heresy.

### Level 3 — Religious Submission (*sequenda*)

Teachings of the authentic ordinary magisterium not proposed definitively. Require
religious submission of intellect and will (*obsequium religiosum*). The largest
category; includes most encyclicals and dicastery documents.

## 5.2 Authority Level Taxonomy

| `cdcf:authority/` value | Assent Type | Notes |
|---|---|---|
| `solemn-definition` | Assent of faith | Ex cathedra papal definition; *de fide definita* |
| `ordinary-universal` | Assent of faith | Ordinary universal magisterium; *de fide catholica*; same assent as `solemn-definition` |
| `definitive-doctrine` | Definitive assent | *Definitive tenenda*; denial is error but not heresy |
| `authentic-doctrine` | Religious submission | Authentic ordinary magisterium; *obsequium religiosum* |
| `pastoral-guidance` | Respectful reception | Pastoral or prudential; no doctrinal definition |

> **Note:** `sententia communis` is a category of *theological opinion*, not a level of
> magisterial authority, and MUST NOT appear in the `authorityLevel` field of magisterial
> document identifiers. It may appear in the concept domain's `doctrinalHistory`
> metadata as a scholarly annotation. (This corrects an error present in version 0.1.0,
> which collapsed `sententia communis` into the authority taxonomy.)

---

**Previous:** [04 — Resolution Protocol](04-resolution.md) · **Next:** [06 — Governance](06-governance.md)
