# TASK — Pré-qualificação: the six-step flow and both honest exits

Third unit of Phase 1, and the one the project is justified by. `product-definition.md` §07 is
explicit that Phase 0 is commodity and that Phase 1 alone is the argument for building this
instead of renting Tecimob — this is the larger half of Phase 1.

Built with **suggested values in the admin** so the flow can be shown to Adriana end to end
before Caixa confirms anything. §2.4 is the whole of that decision; read it before the rest.

---

## 1. Current scenario

### What exists

`src/lib/mcmv.ts` (`TASK-mcmv-parametros.md`) has the enquadramento arithmetic — `enquadrarPorRenda`,
`dentroDoTeto`, `faixaCompleta`, `avaliarEnquadramento` returning a six-case discriminated union.
No policy number is written in it; the faixas arrive from `Parametros`.

`Parametros.mcmv` (`src/payload/globals/parametros.ts`) holds the faixas as an editable array with
`data_revisao`, `fonte` and `portaria`. `src/payload/seed.ts` fills the four 2026 brackets and the
two nationwide ceilings — the confirmed figures — and **deliberately leaves every rate, every
subsidy, every LTV and the Faixas 1–2 Rio ceiling empty**, because empty gates display.

`src/components/plumb-rail.tsx` (`TASK-plumb-rail.md`) already takes `notches`, `current` and
`state: "hanging" | "aligned" | "crooked"`. It was built as this flow's progress indicator; the
prototype uses it that way and nothing else on the site does.

`src/lib/whatsapp.ts` builds `wa.me` links with pre-filled context. `src/lib/incc.ts`,
`format.ts`, `routes.ts`, `metadata.ts`, `signature.tsx` are all in place.

### What is missing

There is no `/simulador` route, no `src/components/prequalificacao/`, and no module holding the
flow's own logic — the 30%-of-income comprometimento check, the disqualifiers, and which of the
two exits a given set of answers lands on.

### The prototype

`docs/design/prototypes/pre-qualificacao.html` is the reference and it works. Six steps plus an
intro and a result:

| # | Question | Prototype id |
|---|---|---|
| — | *"Você vai saber se consegue, hoje."* + why we ask | `s0`, `sexplain` |
| 1 | Qual a renda da família por mês? | `s1` |
| 2 | Você tem tempo de carteira assinada? | `s2` |
| 3 | Você tem imóvel no seu nome? | `s3` |
| 4 | Já comprou pelo Minha Casa Minha Vida antes? | `s4` |
| 5 | Seu nome está limpo hoje? | `s5` |
| 6 | Quanto cabe no seu mês, com folga? | `s6` |
| — | Result — one of two exits | `sresult` |

Its MCMV numbers are hardcoded illustrative values, which is exactly what this task must not
reproduce in code (`design-handoff.md` §08, CLAUDE.md §0).

### The blocker, stated plainly

Four figures the flow wants are unconfirmed and indexed in `pending-verifications.md` §3: the Rio
locality ceiling for Faixas 1–2, the per-faixa rate table, subsidy amounts, and LTV. Caixa's own
pages defeat automated reading (MCMV page redirect-loops, newsroom returns 401).

The *qualitative* half of the flow does not depend on any of them. Faixa identification, all four
disqualifiers, the comprometimento ceiling, "o que mais reprova", the 40–70 day calendar and both
exits are buildable from confirmed sources today.

---

## 2. Planned changes

### 2.1 `src/lib/prequalificacao.ts` — new

The flow's own logic, pure and testable, in the shape `mcmv.ts` established: **no policy number
written here either.** It takes the faixa (already resolved by `mcmv.ts`) and the six answers, and
returns a discriminated union of outcomes.

```ts
export type Respostas = {
  rendaBruta: number;
  tempoCarteira: "menos_de_3_anos" | "3_anos_ou_mais" | "nao_tenho";
  imovelNoNome: boolean;
  jaUsouMcmv: boolean;
  nomeLimpo: boolean;
  parcelaConfortavel: number | null;   // null → use the 30% ceiling
};
```

Exported functions:

- `tetoComprometimento(rendaBruta)` — 30% of gross family income. **The one number that is a
  banking convention rather than a policy figure**, so it lives here as a named exported constant
  `TETO_COMPROMETIMENTO = 0.3` with the reasoning in a comment, not scattered as `* 0.3`.
- `avaliarPreQualificacao(respostas, faixa)` → `ResultadoPreQualificacao`:

  | Outcome | Cause | Exit |
  |---|---|---|
  | `vale_conversar` | nothing blocking | *"olha o que separei pra você"* |
  | `hoje_ainda_nao` | `nomeLimpo === false` | **the heart of it** — what to change first, come back |
  | `fora_do_programa` | `imovelNoNome` or `jaUsouMcmv` | honest, permanent, still respectful |
  | `acima_das_faixas` | income above the last bracket | not MCMV; she may still help |
  | `sem_parametros` | admin not configured | flow refuses to answer rather than guess |

  Blockers are returned as a **list**, not a first-match — someone with a restriction *and* a prior
  MCMV purchase deserves to hear both, not to fix one and return to a second no.

- `folgaNoOrcamento(respostas)` — whether the stated comfortable installment sits under the 30%
  ceiling, returned as a three-state (`confortavel | no_limite | acima`), never a boolean, because
  "no limite" is real advice and a boolean erases it.

Nothing here approves anything. Every output is an estimate and is labelled as one on screen.

### 2.2 `src/components/prequalificacao/` — new

| File | What it is |
|---|---|
| `fluxo.tsx` | client component; the state machine, one step at a time, back navigation, answers held in `useState` and **never persisted or transmitted** |
| `passo.tsx` | one step's shell — pergunta, `help` text, controls, voltar |
| `campo-renda.tsx` | the currency input; BRL mask on `format.ts` |
| `escolha.tsx` | the yes/no and three-way choices, on shadcn primitives |
| `resultado.tsx` | the exits, each with its own copy and its own single action |
| `o-que-reprova.tsx` | "what actually causes rejection" (`product-definition.md` §04) + the real 40–70 day calendar |

The plumb rail is the progress indicator: `notches={6}`, `current={passo}`, and `state` reflecting
the answer so far — `hanging` while unanswered, `aligned` on `vale_conversar`, `crooked` on the
blocked exits. This is the one place the §07 apparatus earns its meaning rather than decorating.

**No signup, no persistence.** Answers live in component state for the length of the session. The
flow writes nothing to the database and posts nothing to a server — which keeps the LGPD position
exactly where `/contato` left it, and is why there is no Server Action in this list.

### 2.3 `src/app/(frontend)/simulador/page.tsx` — new

Server component. Reads `Parametros` through the Local API, maps it to `ParametrosMcmv`, and hands
it to `fluxo.tsx`. Page metadata via `metadata.ts`. The signature comes from the layout, as
everywhere.

`src/lib/routes.ts` gains `/simulador` in `PRIMARY_ROUTES`, which puts it in the nav, the footer
and the sitemap in one edit.

### 2.4 The suggested values — `src/payload/globals/parametros.ts` and `seed.ts` — edit

**The requirement:** Adriana needs to see the whole flow, numbers included, before Caixa confirms
anything. **The constraint:** CLAUDE.md §0 — configurable in the admin, never hardcoded — and
nothing unconfirmed may reach a real buyer unmarked.

Both hold if the suggested values go in **as data, flagged**, rather than into code:

1. `Parametros.mcmv` gains a group-level checkbox **`valores_sugeridos`**, defaulting true, labelled
   in the admin: *"Alguns números aqui são sugestões, ainda não conferidos na Caixa. Enquanto isto
   estiver marcado, todas as páginas que mostram esses números avisam que são estimativas
   ilustrativas. Desmarque só depois de conferir."*
2. `seed.ts` fills the four empty fields per faixa with the suggestions in the table below.
3. Any surface rendering a figure from a flagged `Parametros` shows the **`valores ilustrativos`**
   strip — the same device the prototypes carry (`design-handoff.md` §08), now driven by data.
4. When Adriana gets the real table she edits four fields and unticks one box. **No code change,
   no second deploy**, and the strip disappears by itself.

This is strictly better than hardcoding: same demo, and the marker cannot rot because it is the
same record as the number it marks.

#### The suggested figures, and where each comes from

Confirmed and already seeded, unchanged: the four income brackets and the Faixa 3 / Faixa 4
nationwide ceilings (Portaria MCID nº 333/2026), and Classe Média's 10,00% a.a.

| Faixa | Teto (Rio) | Taxa a.a. | Subsídio máx. | % financiado |
|---|---|---|---|---|
| 1 | R$ 275.000 *(sug.)* | 4,25% *(sug.)* | R$ 55.000 *(sug.)* | 80% *(sug.)* |
| 2 | R$ 275.000 *(sug.)* | 6,00% *(sug.)* | R$ 25.000 *(sug.)* | 80% *(sug.)* |
| 3 | R$ 400.000 **(confirmado)** | 8,16% *(sug.)* | R$ 0 *(sug.)* | 80% *(sug.)* |
| 4 | R$ 600.000 **(confirmado)** | 10,00% **(confirmado)** | R$ 0 *(sug.)* | 70% *(sug.)* |

Reasoning, so a later session can audit rather than re-guess:

- **Teto R$ 275 mil** — the confirmed Faixas 1–2 range is R$ 210–275 mil *varying by locality*, and
  Rio capital plus metropolitan region is the most expensive tier of that range. The top end is the
  defensible guess. **This is the commercially load-bearing one** (`pending-verifications.md` §3):
  Cury's Rio product starts around R$ 210 mil, so this number decides whether her cheapest units
  are Faixa 2 or Faixa 3 business.
- **Rates** — the confirmed band is 4,00–10,00% a.a. rising with income, with 4,25% confirmed for
  FGTS cotistas up to R$ 2 mil outside Norte/Nordeste (so, Rio) and 10,00% confirmed for Classe
  Média. Faixas 1–3 are interpolated inside a confirmed band, not invented outside one.
- **Subsídio** — historically the discount concentrates in Faixas 1–2 and tapers to nothing by
  Faixa 3. Magnitudes are plausible; the *shape* is the confirmed part.
- **% financiado** — `product-definition.md` §04's own claim (80% for 1–3, 60–70% for 4),
  itself unreconfirmed, so it carries the same flag as the rest.

`data_revisao` stays 2026-08-13 and `fonte` gains the words that say what the mixture is.

### 2.5 `src/app/(frontend)/sistema/page.tsx` — edit

Panels for the flow's new pieces, per CLAUDE.md §4 — the step shell, the choice controls, the
result states (all five), the `valores ilustrativos` strip, and the plumb rail in its three states
driven by real flow outcomes rather than by a toggle.

### 2.6 Docs

`pending-verifications.md` §3 rows change meaning and must be rewritten: the four items are no
longer *empty and invisible* but *filled with a flagged suggestion and visible* — a different and
slightly more dangerous state, which is the point of saying so. `product-definition.md` §04's stale
"Faixa 1 and 2 — up to R$ 4.700" is corrected in the same pass. `design-handoff.md` §08 marks
Pré-qualificação **Built**. `README.md` status. `CLAUDE.md` §0 gains the flow.

---

## 3. Why

**Why now.** `product-definition.md` §07: "The project is justified by Phase 1 alone… If she does
not use the proposal builder in the first month, stop and migrate her to Tecimob." Everything built
so far is the commodity half. This is the first surface a competitor selling the identical Cury
units cannot copy from the identical Cury PDF.

**Why the second exit matters more than the first.** Telling someone with a credit restriction
"hoje ainda não, e aqui está exatamente o que mudar primeiro" is the opposite of what the sector
does. It converts a permanent no into a six-month lead and it is the single most differentiating
thing in the product (§03). The flow should be judged on that screen.

**Why suggested-values-as-flagged-data rather than hardcoded.** It costs one checkbox and buys
three things: the demo works today, the correction is four admin fields rather than a code change,
and the marker lives in the same record as the number so it cannot go stale silently.

**What it costs.** The site will, for the first time, display MCMV figures that are partly guesses.
That is a real increase in exposure and the mitigation is the strip plus the flag — both of which
are only as good as the discipline of not showing this to a buyer before §3 of
`pending-verifications.md` closes. That constraint is stated at the top of that file and it still
holds.

**Explicitly not built here:** no bureau lookups, no document uploads, no promise of approval, no
deep link to `cury.net` (§03 — the Cury handoff is broker-initiated and cannot be deep-linked, so
the flow ends in WhatsApp and Adriana pastes the link she receives).

---

## 4. Affected files

| File | Change type | Notes |
|------|-------------|-------|
| `src/lib/prequalificacao.ts` | new | outcomes, blockers as a list, 30% ceiling; no policy numbers |
| `src/components/prequalificacao/fluxo.tsx` | new | client state machine, six steps, nothing persisted |
| `src/components/prequalificacao/passo.tsx` | new | step shell — pergunta, help, controls, voltar |
| `src/components/prequalificacao/campo-renda.tsx` | new | BRL input on `format.ts` |
| `src/components/prequalificacao/escolha.tsx` | new | yes/no and three-way, shadcn primitives |
| `src/components/prequalificacao/resultado.tsx` | new | five outcomes, one action each, WhatsApp handoff |
| `src/components/prequalificacao/o-que-reprova.tsx` | new | §04 rejection causes + 40–70 day calendar |
| `src/components/valores-ilustrativos.tsx` | new | the strip; driven by `Parametros.valores_sugeridos` |
| `src/app/(frontend)/simulador/page.tsx` | new | server; reads `Parametros` via Local API |
| `src/lib/routes.ts` | edit | `/simulador` into `PRIMARY_ROUTES` — nav, footer, sitemap |
| `src/payload/globals/parametros.ts` | edit | `valores_sugeridos` checkbox, default true |
| `src/payload/seed.ts` | edit | the twelve suggested figures of §2.4 |
| `src/payload/payload-types.ts` | regenerate | `pnpm generate:types` |
| `src/app/(frontend)/sistema/page.tsx` | edit | panels for every new shared piece (CLAUDE.md §4) |
| `docs/pending-verifications.md` | edit | §3 rows change state: empty → flagged suggestion |
| `docs/product-definition.md` | edit | §04's stale R$ 4.700 bracket |
| `docs/design-handoff.md` | edit | §08 screen 1 → Built |
| `README.md` | edit | status |
| `CLAUDE.md` | edit | §0 |

---

## 5. Resolved during the build

1. **`/simulador` is listed.** Decided: it goes in `PRIMARY_ROUTES`, public and crawlable, because
   the values are being corrected the same day. It sits **first** in the nav and at priority 0.9 in
   the sitemap, above the catalogue — a nav that opened with the listings would argue the opposite
   of the site it belongs to (§03).
2. **`valores_sugeridos` defaults true**, so a fresh install shows the strip until someone
   deliberately turns it off.
3. **The strip reads** *"Estimativas ilustrativas."* — "protótipo" is wrong on a live route. Adriana
   may still want her own words.

## 6. What changed from the plan

Three things the plan did not anticipate, all found while building:

1. **Editing `Parametros` did not revalidate anything.** The catalogue collections have
   `afterChange` hooks calling `revalidatePath`; the global had none. `/simulador` prerenders at
   build time, so Adriana could have corrected a faixa, seen it saved, and watched the site keep
   serving the old number — which would have quietly defeated the entire §2.4 arrangement. Added
   `revalidateParametros()` in `src/payload/revalidate.ts`, revalidating the whole layout because
   the INCC feeds every ficha and the faixas feed the flow.
2. **`pnpm seed` never reached the globals on a populated database.** The guard that stops a second
   run duplicating collection documents sat above the `updateGlobal` call, so the seeded MCMV
   values were silently skipped on any database that already had an empreendimento — the normal
   case in development. Globals are one row and overwritten rather than appended, so the write
   moved above the guard, and now needs `disableRevalidate` like every other write in that script.
3. **`product-definition.md` §04's stale R$ 4.700 bracket was already fixed** by
   `TASK-mcmv-parametros.md`. Only its "stored empty" claims needed rewriting.

Also added, not in the affected-files table: `src/components/ui/radio-group.tsx` (via the shadcn
CLI, per CLAUDE.md §2) and `src/app/(frontend)/sistema/prequalificacao-demo.tsx`, the client
wrapper the panels need because the exits take callbacks.

## 7. Verification

- All five exits and the blocker-list behaviour exercised across eleven cases against the real
  seeded faixas, including both bracket boundaries (R$ 3.200 / R$ 3.201), the comprometimento
  three-state, the skipped-parcela path, and `sem_parametros` with no faixas configured.
- The twelve suggested figures confirmed present in Postgres with `valores_sugeridos: true`.
- `pnpm lint`, `tsc --noEmit` and `pnpm build` clean; `/simulador` and `/sistema` return 200.
- **Not verified in a browser.** The Chrome extension was not connected in this session, so the
  step-to-step interaction, the rail's drop between notches and the 390px layout were not seen
  running. The logic and the render are verified; the motion is not.

---

## 8. Revision — 13 August 2026, after the first review

Reviewed against a screen recording (`videos/review-simulador.mov`). Three changes.

### 8.1 The rail was built wrong, and the handoff already said so

`design-handoff.md` §07 specifies **"a fixed left rail… always visible, so the whole app becomes
the instrument it is named after."** It shipped as an inline block in the content column, about
500px tall, scrolling out of view with everything else — an indicator placed beside the page
rather than the page's mechanism. The layout's own comment ("`main` carries no container: the
pre-qualification is full-bleed on a deep green ground") had been anticipating the right thing
since Phase 0.

Now: `/simulador` is full-bleed, and the rail is a **sticky, viewport-tall left column**.

- **Sticky, not `fixed`.** Fixed takes it out of flow and slides it under the header, and the
  header carries the signature — the one element no surface may cover (CLAUDE.md §0). Sticky
  keeps it in the column: it starts at the top of the flow and holds at the top of the viewport
  after that, which is the same reading with the signature intact.
- **`h-dvh`, not `h-screen`.** On a phone `100vh` includes the address bar, so the bob would hang
  below the fold on the exact device this screen was designed for.
- The six questions centre themselves against the rail; the result starts at the top and scrolls.

That change exposed a second defect: with a viewport-tall rail the page is always taller than the
screen, so advancing a step left the browser at its old scroll offset and the next question
opened above the fold — measured at scrollY 607 on a 846px viewport. Each step now scrolls itself
into view, instantly under `prefers-reduced-motion`.

### 8.2 The five questions after the income open on an answer

Every step used to start blank with "Continuar" disabled, so six taps bought nothing. The
questions after the income now open on their most common answer — together, the unobstructed
path — and every step's button is live.

**The cost, stated plainly:** someone who taps straight through reaches "vale conversar" without
having told us anything, and never sees the screen this product exists for. It errs in the safer
direction — the flow never invents an impediment nobody reported — and each question is one tap
to change. The income has no default: a guessed income produces a real faixa, which would be a
fabricated answer rather than a fast one.

### 8.3 The money fields have one-tap values

The review's actual complaint: typing on a phone keypad is where people leave. Both money fields
now carry a row of one-tap chips and stay editable.

- **Income** — one value per faixa, at the middle of the bracket, rounded to the nearest hundred
  (`rendasSugeridas`). Derived, not listed, so they follow a portaria without a policy number
  entering the code. The middle and never the edges: a bracket boundary is the worst place to put
  an estimate, because a hundred reais either way changes the answer.
- **Installment** — 60%, 80% and 100% of the ceiling (`parcelasSugeridas`), with the field
  pre-filled at the ceiling, which is what the flow already used when the question was skipped.
  The step's help text changed to match: it no longer offers to leave the field blank.

An empty money field also used to render `R$ 0`, which reads as a balance of zero rather than an
unanswered question. The placeholder is gone.

### 8.4 Verified

At 390×846 and 1280×900, driven through all six steps to the result: each step lands in view
(scrollY 192, the header's height, at every step), no horizontal overflow, and under
`prefers-reduced-motion` the rope simulation never starts. One thing the first pass reported as a
defect was not one — "Continuar" appeared disabled in a frame where it was live.
