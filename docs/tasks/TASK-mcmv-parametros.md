# TASK — MCMV parameters and the enquadramento arithmetic

First unit of Phase 1. Data and arithmetic only: no buyer-facing screen.

---

## 1. Current scenario

`Parametros` (`src/payload/globals/parametros.ts`) holds one group, `incc`, and its own comment
says the MCMV faixas "join it when the pre-qualification is built". They have not. There is no
`src/lib/mcmv.ts`.

The INCC group already establishes the pattern this unit copies, and it is a good one:

- a value, a `data_revisao` ("Quando este número foi conferido na fonte"), and a `fonte`;
- **an empty value is a gate, not a default.** With `taxa_anual` empty no installment renders at
  all — not even today's, because the two only ever appear together. Nothing is guessed and
  nothing is silently shown stale.

`product-definition.md` §04 carries a faixas table for "2026" with a standing
`[VERIFICAR: revised in 2026 by the Conselho Curador do FGTS and will change again]`.

**That warning has already come true.** Checked today against the Ministério das Cidades:

### Confirmed against primary sources

Portaria MCID nº 333, de 30 de março de 2026 (published 01/04/2026); income limits as published
on the ministry's own MCMV programme page. Caixa began operating the new conditions on
**22 April 2026**.

| Faixa (urbana) | Gross monthly family income |
|---|---|
| 1 | até R$ 3.200,00 |
| 2 | R$ 3.200,01 – R$ 5.000,00 |
| 3 | R$ 5.000,01 – R$ 9.600,00 |
| 4 — Classe Média | até R$ 13.000,00 |

Property ceilings, per the ministry:

| Faixa | Ceiling |
|---|---|
| 1 and 2 | R$ 210 mil – R$ 275 mil, **varying by locality** |
| 3 | até R$ 400 mil, anywhere in the country |
| 4 | até R$ 600 mil, anywhere in the country |

Rates, partially: a nominal band of **4,00% to 10,00% a.a.** varying with family income;
**10,00% a.a.** for Classe Média; and for FGTS cotistas earning up to R$ 2 mil, 4,00% in Norte
and Nordeste and 4,25% elsewhere.

### What this changes in our own docs

`product-definition.md` §04 says **"Faixa 1 and 2 — up to R$ 4.700"**. That is stale: Faixa 2 now
runs to **R$ 5.000**, and Faixa 3's ceiling moved from R$ 8.600 to R$ 9.600. The §04 table also
compresses Faixas 1 and 2 into one row, which the pre-qualification cannot do — they are
separate brackets with different subsidy treatment.

### Still unconfirmed, and therefore `[VERIFICAR:]`

Caixa's own pages defeated automated reading — the MCMV page redirect-loops and the newsroom
returns 401 — so these could not be taken from the operator itself:

- **The full per-faixa interest rate table.** Only the band and two endpoints are confirmed.
- **Subsidy (desconto) amounts per faixa**, and how they taper with income.
- **The financing percentage / LTV per faixa.** §04 claims "finances up to 80%" for Faixas 1–3
  and "LTV ~60–70%" for Faixa 4; neither was reconfirmed.
- **Which ceiling applies in Rio de Janeiro** — the R$ 210–275 mil range for Faixas 1 and 2
  varies by locality, and the figure for the capital and its metropolitan region was not found.
  **This is the commercially load-bearing one:** CLAUDE.md §0 puts Cury's Rio product "from
  around R$ 210 mil", which sits exactly on that boundary, so the locality ceiling decides
  whether the cheapest units are Faixa 2 or Faixa 3 business.
- **FGTS eligibility conditions** (cotista status, three years of contribution, prior use).

Rural faixas are published on an annual-income basis and are irrelevant here — she sells urban
Rio.

---

## 2. Planned changes

### 2.1 `src/payload/globals/parametros.ts` — edit

Add an `mcmv` group beside `incc`, following its shape exactly.

- `faixas` — an **array**, not four hardcoded groups, so a future portaria that adds or merges a
  bracket is an admin edit rather than a migration. Per row: `nome`, `renda_min`, `renda_max`,
  `teto_imovel`, `taxa_juros_anual`, `subsidio_maximo`, `percentual_financiado`.
- `data_revisao`, `fonte` and `portaria` at the group level, mirroring `incc`.
- **The same empty-value gate.** A faixa row missing `teto_imovel` or `taxa_juros_anual` may
  still enquadrar by income, but any surface that would print the missing number prints nothing
  instead. Half a figure is worse than no figure here.

`min`/`max` and `required` on the numeric fields, and admin `description` text in pt-BR
explaining that each number must be confirmed at the source and dated.

### 2.2 `src/lib/mcmv.ts` — new

Pure functions over values passed in. **No number from §1 is written into this file** — that is
the entire point of the global, and it is CLAUDE.md §0's "configurable, never hardcoded".

- `enquadrarPorRenda(rendaBruta, faixas)` → the matching faixa, or `null` when income exceeds
  every bracket. `null` is a real answer the flow must render honestly, not an error.
- `dentroDoTeto(valorImovel, faixa)` → boolean.
- `avaliarEnquadramento({ rendaBruta, valorImovel }, faixas)` → `{ faixa, dentroDoTeto, motivo }`
  where `motivo` is a discriminated union the UI maps to copy, so the wording lives with the
  screen and the logic stays testable.

Everything it returns is an **estimate and labelled as one**. It performs no bureau lookup,
accepts no document, and outputs no approval — CLAUDE.md §0, and the line this product must not
cross.

Mirrors `src/lib/incc.ts` in shape and comment density.

### 2.3 Seeding the confirmed values

Extend `src/payload/seed.ts` to write the four faixas with the confirmed income limits and
ceilings, `data_revisao` set to the check date, `fonte` naming the ministry page, and `portaria`
recording "Portaria MCID nº 333, de 30 de março de 2026".

**The unconfirmed fields are left empty on purpose** — rates, subsidies, LTV — so the gate in
§2.1 keeps them off every surface until somebody confirms them. Seeding a plausible rate would
defeat the whole unit.

### 2.4 `/sistema` — edit

A panel rendering the configured faixas as a table with the revision date and portaria beside
them, and empty fields shown as empty rather than as a dash that reads like a value. A stale or
half-filled table then shows up on a page somebody actually looks at, which is §4's entire
argument for `/sistema` existing.

No new shared component: this is a page-local panel. The buyer-facing presentation arrives with
the six-step flow.

### 2.5 `docs/product-definition.md` §04 — edit

Replace the stale table with the confirmed one, split Faixas 1 and 2 into separate rows, keep a
dated `[VERIFICAR:]` for everything §1 lists as unconfirmed, and record the portaria number.

---

## 3. Why

Phase 1 is the phase that justifies the project — `product-definition.md` §07 says so plainly,
and says Phase 0 is commodity. Every screen in it stands on this arithmetic.

Doing it as its own unit, before the six-step flow, separates the two risks. The flow's risk is
design, and its design already exists as a working prototype. This unit's risk is that a number
is wrong, and CLAUDE.md §2.0 is explicit that a wrong subsidy figure shown to a family is the
worst failure available here. Those risks want different kinds of attention and different review.

The check performed for §1 is the argument on its own: two of the figures in our own
documentation were already out of date, from a portaria published four months ago.

The cost is a unit that ships with no visible surface except a `/sistema` panel.

---

## 4. Affected files

| File | Change type | Notes |
|---|---|---|
| `src/payload/globals/parametros.ts` | edit | `mcmv` group; faixas as an array; empty-value gate |
| `src/lib/mcmv.ts` | new | enquadramento arithmetic, no hardcoded policy numbers |
| `src/payload/seed.ts` | edit | seed confirmed values only; unconfirmed left empty |
| `src/app/(frontend)/sistema/page.tsx` | edit | faixas panel with revision date and portaria |
| `src/payload/payload-types.ts` | generated | `pnpm generate:types` after the schema change |
| `docs/product-definition.md` | edit | §04 table corrected and re-dated |
| `README.md`, `CLAUDE.md` | edit | status, per `CLAUDE.md` §3 |

Not touched: any catalogue collection, any existing route, the signature.

---

## 5. Done when

- `pnpm lint`, `pnpm exec tsc --noEmit` and `pnpm build` clean; `pnpm generate:types` run.
- The four faixas are editable in the admin, and every number displayed anywhere carries the
  revision date.
- With `taxa_juros_anual` empty, no rate appears on any surface — verified, not assumed.
- `avaliarEnquadramento` returns a sane faixa for incomes at each bracket edge, and `null` above
  R$ 13.000.
- `/sistema` shows the table, and shows it as incomplete while it is incomplete.
- §04 of `product-definition.md` matches the confirmed figures, with the portaria cited.

---

## 6. Open and blocking items

Everything in §1's unconfirmed list. None of it blocks building this unit — the schema and the
arithmetic are the deliverable, and the gate means missing values simply do not render — but
**all of it blocks showing any of these numbers to a real buyer.**

The cheapest route to confirmation is Adriana, not the web: §10's question 3 asks what the Cury
Corretor app provides, and a broker's own Caixa contact settles the rate table and the Rio
locality ceiling in one conversation. Failing that, a Caixa branch or the Habitação simulator.

The Rio ceiling is the one to chase first, for the reason in §1.

---

## 7. Explicitly out of scope

- The six-step pre-qualification flow and the plumb rail — the next unit.
- The proposal builder, private links, and the expired-table hard gate.
- Any bureau lookup, document upload, or anything that could be mistaken for credit analysis.
- Rural MCMV.
- The INCC group, which already works.

---

## 8. Sources

- Ministério das Cidades — [Programa Minha Casa, Minha Vida](https://www.gov.br/cidades/pt-br/acesso-a-informacao/acoes-e-programas/habitacao/programa-minha-casa-minha-vida/sobre-o-minha-casa-minha-vida-1) (income limits per faixa)
- [Portaria MCID nº 333, de 30 de março de 2026](https://www.gov.br/cidades/pt-br/acesso-a-informacao/institucional/base-juridica/portarias/PORTARIAMCIDN333DE30DEMARODE2026.pdf) (DOU 01/04/2026; scanned, not machine-readable)
- Ministério das Cidades — [MCMV Classe Média](https://www.gov.br/cidades/pt-br/acesso-a-informacao/acoes-e-programas/habitacao/programa-minha-casa-minha-vida/minha-casa-minha-vida-classe-media/minha-casa-minha-vida-classe-media-1)
- Caixa — [Minha Casa, Minha Vida Habitação Urbana](https://www.caixa.gov.br/voce/habitacao/minha-casa-minha-vida/urbana/Paginas/default.aspx) (redirect-looped; not readable automatically)

Checked 13 August 2026. Re-check before launch — the 2026 revision is not the last one.

---

## 9. What the build did, and how it was verified

**Status: built and verified. No buyer-facing surface, as planned.**

| Check | Result |
|---|---|
| `pnpm lint` / `pnpm exec tsc --noEmit` / `pnpm build` | clean |
| `pnpm generate:types` | run; `Parametros.mcmv` in `payload-types.ts` |
| Bracket edges | 0 → F1; 3.200 → F1; 3.200,01 → F2; 5.000 → F2; 5.000,01 → F3; 9.600 → F3; 9.600,01 → F4; 13.000 → F4; 13.000,01 → none |
| The gate | `teto` unset → `teto_nao_configurado`, not a comparison against zero; no faixas → `sem_parametros`; both exercised |
| `/sistema` panel | renders the four real faixas from the admin, with "não confirmado" in ten cells |
| Revision metadata | date, fonte and portaria render beside the table |

### Two bugs the panel caught, which is why it reads the real global

- **`formatPercent` takes a decimal**, and the admin stores a percentage, so Faixa 4's 10% first
  rendered as **1.000% a.a.** Fixed by converting at the call site; the admin field stays a
  percentage because that is what a person types.
- **`formatBRL` is whole-reais**, so Faixa 1 ending at R$ 3.200 and Faixa 2 starting at
  R$ 3.200,01 both printed as "R$ 3.200" — two adjacent rows that read as overlapping brackets.
  Fixed with a panel-local `formatRenda` that keeps the centavo only when there is one. `formatBRL`
  is unchanged: prices elsewhere should stay whole.

Neither would have appeared against a fixture. That is the argument for the panel reading the
real global, and it paid for itself in the same commit.

### Applying the values to an existing database

`seed.ts` refuses to run against a database that already has empreendimentos, so extending it
covers a fresh database but not this one. The dev database was updated with a temporary
`updateGlobal` script, verified to have preserved the `incc` group, and the script deleted. A
fresh `pnpm seed` now writes both groups.

### Still open

Everything in §6, unchanged — the per-faixa rates, the subsidies, the LTV, and above all the Rio
locality ceiling for Faixas 1 and 2. All of it is stored empty and therefore renders nowhere.
