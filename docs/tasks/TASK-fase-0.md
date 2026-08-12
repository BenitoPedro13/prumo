# TASK — Phase 0, the real site pages

> Status: **in progress.** Unit 1 is built; unit 2 (the catalogue) is built and verified against
> a running Postgres — see `TASK-empreendimentos.md`. Unit 3 (`/contato`, `/privacidade`, `Lead`
> and `Consentimento`) is built — see `TASK-contato-lgpd.md`. Units 4–5 are commissioned below
> and drafted when reached.
>
> This is a roadmap, not a unit of work. It sequences Phase 0 into five task docs and records
> the order and the reasons. Each unit gets its own document with the four sections required by
> `CLAUDE.md` §1 before any of its code is written. `TASK-chrome-e-seo.md` is written; the rest
> are commissioned here and drafted when reached.

## 1. Current scenario

The app is scaffolded (`TASK-scaffold-nextjs.md`) and the design system lives at `/sistema`
(`TASK-sistema-design.md`). What exists is a themed shell: tokens, rethemed primitives, the
signature component, and a Payload admin whose catalogue schema is built but has never been run
against a database.

What does not exist is the site. `/` is a placeholder. There is no navigation, no footer, no OG
image, no `robots.ts`, no page that shows an empreendimento, no way for a visitor to reach her,
and no `Lead` or `Consentimento` collection to receive them if there were.

`docs/product-definition.md` §07 defines Phase 0 as **presence and identity**, roughly two weeks:
home, sobre, development listings, contact, admin with legal validation, the signature applied to
the OG image, a consent-versioned form and a `wa.me` CTA.

### The instruction that shapes this whole phase

`product-definition.md` §07 says it plainly: **Phase 0 is commodity.** Tecimob and Jetimob sell
it for R$ 100–300 a month with portal sync included. The project is justified by Phase 1 alone.

So the standard here is *correct, honest and fast*, not *distinctive*. The design budget belongs
to the pre-qualification and the proposal. Any task below that starts growing a bespoke
interaction is out of scope by definition — write it down for Phase 1 and move on.

The parts of Phase 0 that are **not** commodity, and where care is warranted:

- The signature, on every surface including the OG image and any exported PDF.
- The `registro de incorporação` and `cartório` on every listing — a legal requirement, not a
  detail.
- Availability language: **"consultar disponibilidade", never "disponível"**, and anything
  stock-derived carries a timestamp.
- Both installment figures together, nominal and corrected. Never one alone.
- LGPD consent: not pre-checked, purpose stated in the form itself, versioned proof stored.

## 2. Planned changes — five units, in order

### 1. `TASK-chrome-e-seo.md` — the envelope · **built**

Site navigation, footer, the metadata and social envelope, and the `wa.me` link builder. Moves
the chrome into `(frontend)/layout.tsx` so every page inherits the signature structurally rather
than by discipline.

Depended on nothing and needed no database. Done — see §7 of that document for where the build
departed from its plan, and §8 for what it left blocked.

### 2. `TASK-empreendimentos.md` — the catalogue · **built**

`/empreendimentos` and `/empreendimentos/[slug]`. Address and surroundings first, floor plans as
the primary visual, commercial terms with both installment figures, total cost visible, the
registro block, and availability phrased as a question rather than a claim. A publication gate in
the admin: no `registro_incorporacao` or `cartorio`, no publish — verified end to end, not just
configured.

Built and verified against a Postgres running in Docker; the seed uses one real Rio development
(Cury's Residencial Pixinguinha, Santo Cristo) for everything Cury publishes, and marks
everything it does not — the registro number, the cartório, the payment schedule — as
placeholder. The largest unit of the phase and the one where the "must not break" rules do the
most work. Still open: a Supabase connection string for deployment, and the real registro data
per development. See `TASK-empreendimentos.md` §7 and §10.

### 3. `TASK-contato-lgpd.md` — the way in · **planned**

`/contato`, the `wa.me` CTA everywhere, and the `Lead` and `Consentimento` collections with the
consent text versioned and stored with its timestamp and origin. Includes the `retomar_em`
field — the one that turns "hoje não" into pipeline rather than a lost lead.

Independent of unit 2. Carries the real legal weight of the phase, so it gets its own review —
drafted in full in `TASK-contato-lgpd.md`, not started.

### 4. `TASK-sobre.md` — the person

`/sobre`. Her face, her story, the signature in its `full` variant. Trust is the product, and
this is the page where the pseudonym route either reads as a serious professional with a brand
or as a brand hiding a person.

Blocked on a real photograph. `product-definition.md` and `design-handoff.md` §08 both flag an
hour with a photographer as the cheapest high-return item in the project.

### 5. `TASK-home.md` — the front door

Last, because it composes from everything above and has almost nothing of its own.
`design-handoff.md` §08 puts it fifth in value and calls it deliberately simple. Opens with the
address and the life there, not with an installment figure.

### Ordering, and what can move

1 is first because everything inherits it. 5 is last because it composes the others. 2, 3 and 4
are independent of one another and can be reordered around whatever unblocks first — most
likely 3, since it needs neither a photograph nor Cury's data.

**Alternatives considered and rejected:**

- *Home first, as the front door.* Rejected: it would be built against placeholder content and
  then rebuilt once the catalogue exists. The placeholder currently at `/` is adequate and
  carries the signature.
- *One task doc for all of Phase 0.* Rejected: `CLAUDE.md` §1.2 is one document per unit of
  work, and the LGPD unit in particular deserves its own review rather than a paragraph inside
  a larger plan.
- *Building the pre-qualification now, since `design-handoff.md` §08 says design it first.*
  Rejected on a reading of both documents together: §08 ranks screens by value, §07 sequences
  them by phase. The pre-qualification is Phase 1 and it is where the design budget goes — it
  should not be started inside a phase whose instruction is to stay cheap.
- *Skipping Phase 0 and migrating her to Tecimob.* Genuinely on the table per §07, and the
  honest test is in that section: if she does not use the proposal builder in the first month
  after Phase 1 ships, stop and migrate. Phase 0 is worth building only because Phase 1 needs
  somewhere to live.

## 3. Why

Phase 0 is what makes the project real to Adriana. It is also the part that earns the least, so
the risk it carries is not failure but **overspend** — two weeks becoming six on pages that a
R$ 200/month product would have delivered. Sequencing it explicitly, with the commodity
instruction written at the top of the roadmap, is the cheapest available defence against that.

The second reason is legal. Four of the five "must not break" rules in `CLAUDE.md` §0 first
become real in this phase, not in Phase 1: the signature on every surface, the registro block,
availability language, and consent. A phase that ships them wrong ships a regulatory problem, not
a design one.

## 4. Affected files

Per-unit tables live in each unit's own document. At the roadmap level:

| File | Change type | Notes |
|---|---|---|
| `docs/tasks/TASK-chrome-e-seo.md` | new | written alongside this doc |
| `docs/tasks/TASK-empreendimentos.md` | new | drafted when unit 2 starts |
| `docs/tasks/TASK-contato-lgpd.md` | new | drafted when unit 3 starts |
| `docs/tasks/TASK-sobre.md` | new | drafted when unit 4 starts |
| `docs/tasks/TASK-home.md` | new | drafted when unit 5 starts |
| `docs/product-definition.md` | edit | §10 open questions, as each is answered |
| `README.md`, `CLAUDE.md` | edit | status, per `CLAUDE.md` §3, at each unit |

## 5. Done when

All five units are built, each having satisfied its own done-when. Phase 0 as a whole is done
when:

- Every page carries the complete signature, and so does the OG image.
- No page claims availability. Anything stock-derived carries a timestamp.
- Every listing shows its registro de incorporação and cartório, and cannot be published without
  them.
- Every price shows both installment figures.
- A visitor can reach her by WhatsApp from any page, with context pre-filled.
- A submitted form stores versioned consent with its text, timestamp and origin.
- Page weight holds: under 500 KB above the fold, AVIF, LCP under 2.0s on 4G.
- `/sistema` documents every shared component the phase introduced.

## 6. Blocking and open items

Carried from `product-definition.md` §10, mapped to what each one stops.

| Item | Blocks | Note |
|---|---|---|
| **Adriana's real CRECI-RJ number** | shipping anything publicly | `BROKER_CRECI` is `00.000-F`. The one legally load-bearing element still fake |
| **A provisioned Postgres for deployment** | going live, not unit 2 anymore | Local dev runs on Docker now; Neon or Supabase still needed for Vercel |
| **Real Cury data** — registro numbers, price tables | going live, not unit 2 anymore | The seed's address, station, delivery and one price are real (§10 of `TASK-empreendimentos.md`); the registro de incorporação, cartório and payment schedule are still invented and must never reach a buyer |
| **A real photograph of her** | unit 4 | An hour with a photographer, per §08 |
| **Her WhatsApp number** | unit 1's CTA being real | `WHATSAPP_NUMBER` is a placeholder |
| **The brand name** | the wordmark, the icon, the domain | Prumo, Chão, Soleira, Raiz or Boa Praça. `BRAND_NAME` is one edit; a drawn mark is not |
| **How many of ten buyers she loses at credit analysis** | nothing in Phase 0 | Sizes Phase 1, which is the phase that justifies the project |

## 7. Explicitly out of scope

The pre-qualification, the proposal builder and its shared links, the INCC projection, the
simulator, the retomada queue, portal XML feeds, and any WhatsApp Business API work. All Phase 1
or later. The `/p/[token]` route does not exist yet, but `robots.ts` in unit 1 disallows it
already, because a proposal link must never be indexed on the day it first ships.
