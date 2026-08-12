# Prumo

Marketing and pre-qualification site for **Adriana Monteiro**, an autonomous real-estate broker
in Rio de Janeiro reselling Cury Construtora launches in Porto Maravilha, Niterói, Barra da
Tijuca and Recreio.

The product answers *"eu consigo?"* before *"qual apartamento?"* — because in Minha Casa Minha
Vida the buyer's anxiety is credit approval, not finishes.

> **"Prumo" is a working codename, not a confirmed brand.** `prumo.com.br` and `prumo.co` are
> taken and the name is still open. See `docs/design-handoff.md` §02.

---

## Status

**Definition and design complete. No application code yet.**

| Area | State |
|---|---|
| Product definition | Complete — `docs/product-definition.md` |
| Design handoff | Complete — `docs/design-handoff.md` |
| Prototypes | Four working HTML prototypes — `docs/design/prototypes/` |
| Application | Not scaffolded. Next step: `docs/tasks/TASK-scaffold-nextjs.md` |
| Deployment | None |

Adriana has reviewed the pre-qualification and proposal prototypes and approved the direction.
Corrections pending from her.

---

## Start here

1. **`docs/product-definition.md`** — market, product, architecture, data model, phases, risks,
   open questions.
2. **`docs/design-handoff.md`** — identity, tokens, typography, voice, the signature spec,
   screens.
3. **`docs/design/prototypes/`** — open these in a browser. They are the reference, not mockups.
4. **`CLAUDE.md`** — how to work in this repo. Read before touching any code.

---

## Prototypes

Static HTML, no build step. Open directly:

```
open docs/design/prototypes/pre-qualificacao.html   # the six-step flow
open docs/design/prototypes/proposta.html           # the shared proposal link
open docs/design/prototypes/como-funciona.html      # day-to-day explainer for Adriana
open docs/design/prototypes/marca.html              # brand rationale and name options
```

They contain illustrative numbers and a placeholder CRECI. Real Cury development names appear
with invented prices — fine for showing Adriana, **never** to send to a buyer.

---

## Planned stack

Nothing is installed yet. See `CLAUDE.md` §0 for the full table and §2.0 before adding anything —
versions in the docs are snapshots, not pins.

- **Next.js** (App Router, TypeScript) · **Tailwind v4 + shadcn/ui** · **Payload CMS 3**
- Managed **Postgres** + S3-compatible storage · **Vercel**
- **pnpm**, never mixed

Messaging is `wa.me` deep links, not the WhatsApp Business API — at her volume the per-message
cost buys nothing. Credit analysis hands off to Cury's existing broker link and is never rebuilt.

---

## Scripts

None yet. This section gets filled in by `TASK-scaffold-nextjs.md`.

---

## Non-negotiables

Full list in `CLAUDE.md` §0. The ones most easily broken by accident:

- **The CRECI signature appears on every surface**, including the OG image and exported PDFs.
  Any screenshot of any screen must contain it.
- **Her real name always accompanies the project name** — a legal requirement of the pseudonym
  route, not a layout preference.
- **The pre-qualification is orientation, not credit analysis.** No bureau lookups, no documents,
  no promise of approval.
- **Both installment figures always shown together** — nominal today and INCC-projected at
  handover.
- **MCMV faixas, rates and subsidy bands are admin-configurable and dated**, never hardcoded.
- **No exclamation marks. No manufactured urgency.**

---

## Open questions

Tracked in `docs/product-definition.md` §10. The two that matter most:

1. **Adriana's real CRECI-RJ number** — every prototype shows a placeholder, and it is the one
   legally load-bearing element still fake.
2. **Of every ten interested buyers, how many she loses at credit analysis** — the number that
   sizes the whole project.
