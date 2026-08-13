# TASK — Proposta compartilhada

Second unit of Phase 1's buyer-facing surfaces, after the plumb rail and the pré-qualificação.
Screen 2 in `docs/design-handoff.md` §08's value ordering: a personal letter, floor plans, the
payment timeline, the three things that could go wrong, one action.

---

## 1. Current scenario

Nothing is built. There is no `Proposta` collection, no `/p/[token]` route, and no
`src/components/proposta/`. The prototype at `docs/design/prototypes/proposta.html` is the
reference — a single-page "sheet" (masthead with proposal number/date/validity, a personal
letter, two compared units with SVG floor plans and money breakdowns, a four-stop payment
timeline from credit analysis to keys, three honest risks, one WhatsApp CTA, and the footer
signature).

`docs/product-definition.md` §05 already names the shape: `Proposta` holds `lead`,
`tipologias[]`, **`premissas` (a snapshot, not a reference)**, `token_publico`, `expira_em`, and
`eventos_de_abertura[]`. Two rules are already written down there and matter for what follows:

- **"`Proposta` freezes its assumptions rather than referencing current prices: a link sent in
  March must show in May what she actually promised."** The commercial numbers must be copied
  into the document at creation time, not read live from `CondicaoComercial` on every visit.
- **"She sees when it was opened, and how many times"** — a sales signal she doesn't have today.

`CLAUDE.md` §0 has two rules that apply directly and are not optional: **"An expired price table
blocks proposal generation"**, and **both installment figures (nominal and INCC-projected) always
appear together.** `src/lib/incc.ts` already has `projetar()` and `tabelaExpirada()` — built for
exactly this, unused until now.

## 2. Planned changes

### `src/payload/collections/proposta.ts`

New collection, `admin.group: "Contato"` alongside `Leads`/`Consentimentos`.

| Field | Type | Notes |
|---|---|---|
| `lead` | relationship → `leads`, required | who it's for |
| `saudacao` | text, required | the greeting name(s) — "Juliana e Marcos" — kept separate from `lead.nome` because a proposal usually addresses a couple and a Lead is one person |
| `carta.paragrafo_principal` | textarea, required | the `.note p.lead` paragraph |
| `carta.paragrafo_contexto` | textarea | the `.note p.aside` paragraphs — one field, not an array, for speed on her phone |
| `tipologias` | array, 1–2 items | each item: `tipologia` (relationship), `condicao_comercial` (relationship), `destaque` (checkbox — the starred/recommended option), `nota` (short text, optional — "é duas quadras do VLT...") |
| `premissas` | group, **not editable in the admin UI** (`admin.readOnly: true`) | the frozen snapshot — see hook below |
| `expira_em` | date, required | validity shown in the masthead and enforced on view |
| `token_publico` | text, unique, `admin.readOnly: true` | generated once, never edited |
| `eventos_de_abertura` | array, `admin.readOnly: true` | `{ aberto_em: date }`, appended by the page itself — see §2.3 |

`access: { create: somenteAutenticado, read: somenteAutenticado, update: somenteAutenticado }` —
same closed-by-default posture as every collection except `Media`. The public route never uses
this access layer; it reads through the Local API, same as the rest of the site.

**A `beforeValidate` hook does two things on create**, and neither is optional:

1. **Blocks the save if any selected `condicao_comercial` is past its `validade_da_tabela`** —
   `tabelaExpirada()` from `incc.ts`, thrown as a validation error. This is the CLAUDE.md §0 rule
   applied at the one point that matters: proposal generation.
2. **Copies the current numbers into `premissas`** — valor, entrada, parcelas, balões, índice de
   reajuste, and the INCC rate/date active at that moment — so the document no longer depends on
   `CondicaoComercial` staying unchanged. Editing the source table after a proposal exists does
   not alter it. Regenerating a proposal means creating a new one, not editing the old one.

`token_publico` is set by a `beforeChange` hook on create only — a short random string
(`crypto.randomBytes`, URL-safe), long enough not to be guessable, short enough to read out over
the phone if she ever has to.

### `src/app/(frontend)/p/[token]/page.tsx`

New route, **deliberately not in `src/lib/routes.ts`** — no nav entry, no sitemap entry. This
isn't the `/sistema` kind of hidden (unlinked but fine to stumble on); it's a private link tied
to one family's real numbers, so `generateMetadata` also sets `robots: { index: false }`.

- `export const dynamic = "force-dynamic"` — this page must never be statically cached. Every
  visit both needs current server time (to check `expira_em`) and writes a view event.
- Looks up the document by `token_publico` via the Local API (`payload.find`, `depth: 2` to
  resolve `tipologias`, `condicoes_comerciais` and `lead`). No token → `notFound()`.
- **Past `expira_em` is not a 404.** Per the product's own honesty principle (the same one
  behind the pré-qualificação's five exits), it renders a short, plain state: the proposal
  expired, here's her WhatsApp, ready to requote. Never silently shows stale numbers past their
  date.
- **Logs the view** by appending to `eventos_de_abertura` through `payload.update()`, called
  directly in the server component before returning JSX.

  **This is new for the codebase and worth flagging explicitly.** Every write so far (`Lead`,
  `Consentimento`) happens through a Server Action behind a form submission. This is a write
  triggered by a plain `GET` — nothing is submitted, nothing to gate behind an action. It stays
  inside the same "reads and writes go through the Local API, the public REST/GraphQL surface
  stays closed" boundary CLAUDE.md already draws, but it's the first time a page-render writes
  rather than reads. I want your sign-off on that pattern before it ships, since it's a precedent
  the next screen might copy.

### `src/components/proposta/`

Mirrors the prototype's sections as components, per `CLAUDE.md`'s proposed layout:
`masthead`, `carta` (letter + her mini signature), `opcoes-comparadas` (the two-column typology
cards, money rows, and — via `incc.ts`'s `projetar()` — nominal and INCC-projected installments
shown together, satisfying the CLAUDE.md rule directly), `linha-do-tempo` (the four fixed
stops: hoje, aprovado, durante a obra, chaves — dates and figures interpolated per-proposal, but
the four stops themselves are fixed structure, not admin content), `riscos-honestos` (the three
fixed risk statements — obra atrasar, segunda análise de crédito, validade da tabela — same
reasoning: universal truths about an MCMV purchase, not something to leave to a form field and
risk someone leaving blank), and reuses the existing `Signature`, `WhatsAppAction`-style CTA
(new `WhatsAppContext` case in `src/lib/whatsapp.ts` for "na proposta que a Adriana te mandou"),
and `formatMoney`/`formatDate` from `src/lib/format.ts`.

A panel goes on `/sistema` in this same task, per CLAUDE.md §4 — probably with a fixture proposal
rather than a live token, since `/sistema` renders with nothing running behind it by design.

### Not doing in this unit

- **No custom "build a proposal" admin UI.** V1 uses Payload's ordinary relationship/array
  fields, same as every other collection. `product-definition.md`'s "under 2 minutes on her
  phone" acceptance test is real but unverified — I'd rather ship the plain admin form and find
  out from her whether it's fast enough than guess at a custom builder nobody asked for yet.
- **No PDF export.** Not named as MVP scope anywhere in `product-definition.md`; the shared link
  is the artifact.
- **No Cury deep link in the CTA.** Ruled out by `docs/pending-verifications.md` §6 — the credit
  handoff is broker-initiated and has no stable URL. The action is WhatsApp, same as everywhere
  else on the site.

## 3. Why

This is the second surface `product-definition.md` names by value, right after the
pré-qualificação, and it's the one Adriana already approved the direction on ("Adriana has
reviewed the pre-qualification and proposal prototypes and approved the direction" — README
Status). It replaces her current 10-second move — forwarding a Cury PDF — so it only earns its
place if building one is nearly as fast and visibly better: the real arithmetic side by side, the
honest comparison, and open-tracking she doesn't have today. The freeze-on-create snapshot and
the expired-table gate aren't extra caution; they're the two things that make a proposal
trustworthy months after it's sent, which is the entire pitch of the project stated in one
sentence in `product-definition.md` §03.

## 4. Affected files

| File | Change type | Notes |
|------|-------------|-------|
| `docs/tasks/TASK-proposta.md` | new | this document |
| `src/payload/collections/propostas.ts` | new | collection + hooks, §2. Plural filename, not `proposta.ts` — matches every sibling collection file |
| `payload.config.ts` | edit | register `Propostas` in `collections` |
| `src/payload/payload-types.ts` | generated | `pnpm generate:types` after the collection lands |
| `src/app/(frontend)/p/[token]/page.tsx` | new | the route, §2 |
| `src/app/(frontend)/p/mapping.ts` | new | Payload doc → `PropostaResumo`, colocated with the route, same split as `../empreendimentos/mapping.ts` |
| `src/lib/catalogo.ts` | edit | `PropostaResumo`, `OpcaoProposta`, `PremissaCongelada` view types |
| `src/components/proposta/*` | new | `carta`, `opcao-card`, `opcoes-comparadas`, `linha-do-tempo`, `riscos-honestos`, `proposta-sheet`, `proposta-expirada` — §2 |
| `src/app/(frontend)/sistema/page.tsx` | edit | panel for the new components, both live and expired states, per CLAUDE.md §4 |
| `src/payload/seed.ts` | edit | a `Lead` + `Proposta` fixture, for a fresh clone |
| `README.md`, `CLAUDE.md` | edit, after build | Status sections for the proposal screen |

## 5. What actually happened, and what changed from the plan

**`src/lib/whatsapp.ts` needed no changes.** The existing `whatsappMessage()` already covers a
proposal's CTA once passed `empreendimento`/`tipologia` from the option being discussed — no new
`WhatsAppContext` case was necessary, just a new `origem` string ("na proposta que você me
mandou") at the call site. One fewer file touched than planned.

**A field was missing from the original plan: the carta's headline.** The prototype's hook line
("Separei duas, e uma delas eu acho melhor.") is distinct from the two body paragraphs, and the
collection as first designed had nowhere to put it. Added `carta.titulo` (required text) before
any of this reached the database.

**No "Valor" (total price) row on the compared options.** `CondicaoComercial` has never carried
a total unit price, only the pieces — entrada %, parcelas, balões, saldo nas chaves. The
prototype's absolute "Entrada de R$ 18.400" became "Entrada de 7%" for the same reason: showing
an absolute figure would mean inventing a total that doesn't exist in the schema.

**The seed fixture needed a second script, not just an edit to `seed.ts`.** `seed.ts` no-ops once
`empreendimentos` has any rows, which the deployed database already did (restored from the local
Docker instance during `docs/tasks/TASK-deploy.md`). A throwaway script created the `Lead` +
`Proposta` fixture directly against the live data, then was deleted — `seed.ts`'s own edit is
still correct and is what a genuinely fresh clone gets.

**The timeline's markers changed after a first look at a real screenshot.** Circles read as
generic — no different from a changelog. Swapped for diamonds, matching the plumb bob's own
silhouette in `plumb-rail.tsx` (a rhombus, not a circle): hollow at each stop, filled only at
"chaves na mão." Not a second animated apparatus — a static shape borrowed from the one the site
already has, marking where the line settles. The connecting line was also rebuilt per-stop
(each `<li>` draws its own segment down to the next one) so it terminates exactly at the last
marker instead of trailing past it into empty space, which is what a single `border-l` on the
whole list had been doing.

**Verified:** lint and `pnpm build` clean; driven end to end against a real token
(`/p/l59moi90VwCu` in local dev, pointed at the shared Neon database) — INCC pairing, the
timeline's projected figures, the three risks with the real expiry date, the WhatsApp CTA's
built message, and the signature all confirmed present in the rendered HTML. `/sistema`'s two
panels (live, expired) confirmed rendering with no server errors. No visual browser check was
possible this session — the Claude-in-Chrome extension wasn't connected — so nothing here has
been eyeballed in an actual browser chrome/viewport beyond the raw HTML and one user-supplied
screenshot of the timeline, which prompted the diamond-marker revision above.
