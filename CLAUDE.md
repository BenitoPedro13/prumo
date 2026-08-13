# Workflow Guidelines — Prumo (Corretora de Imóveis, Rio de Janeiro)

> This file follows a portable process template (plan before you touch anything, lean on
> existing tooling while you work, treat documentation as part of the deliverable when you
> finish) instantiated for this specific project. Section 0 is project-specific; sections
> 1–4 are the portable rules with paths and examples adapted to this repo.
>
> The philosophy in one line: **Plan before you write, lean on existing tooling while you
> work, and treat documentation as part of the deliverable when you finish.**

---

## 0. Project context — Prumo

**Status: Phase 0 is built. Phase 1 has the plumb apparatus, the MCMV parameters and the pré-qualificação.** The product,
market, architecture and phasing live in `docs/product-definition.md`. The visual identity,
tokens, voice and screen inventory live in `docs/design-handoff.md`. Four working HTML
prototypes live in `docs/design/prototypes/`. The scaffold is done
(`docs/tasks/TASK-scaffold-nextjs.md`), and so are units 1–3 and 5 of Phase 0 — nav, footer, OG
image, icon, robots, sitemap and the `wa.me` builder (`docs/tasks/TASK-chrome-e-seo.md`);
`/empreendimentos` + `/empreendimentos/[slug]` against a running Postgres, with the publication
gate verified end to end (`docs/tasks/TASK-empreendimentos.md`); `/contato` +
`/privacidade`, with `Lead` and `Consentimento` writing through a Server Action, never a public
endpoint (`docs/tasks/TASK-contato-lgpd.md`); and `/`, which composes the catálogo, the WhatsApp
action and the signature, and is the one surface that states the credit-before-apartment order
in words (`docs/tasks/TASK-home.md`), built and rendered against a running Postgres; and
`/sobre` (`docs/tasks/TASK-sobre.md`), which uses the signature's 180×179 stand-in rather than
waiting on a photograph. That last page ships with its story half as a marked `[VERIFICAR:]`
placeholder: the repo holds no biographical facts about her, and inventing a career history for
a real person on a public page is a COFECI exposure as much as a copy failure. Four questions,
listed in `TASK-sobre.md` §6, close it.

Phase 1 has begun. `docs/tasks/TASK-plumb-rail.md` built the §07 plumb apparatus —
`src/components/plumb-rail.tsx`, with a panel on `/sistema`. It is a rope simulation rather than
an animation, and the only interactive thing on the site. Two of its decisions are corrections
to the prototype and are recorded in `docs/design-handoff.md` §07: the line never hangs crooked,
because a plumb line cannot, so the *mark* leans instead; and the motion is integrated rather
than keyframed, because a pendulum's period grows with its length and the length is what the
flow changes.

`docs/tasks/TASK-mcmv-parametros.md` put the MCMV faixas in the admin and the
enquadramento arithmetic in `src/lib/mcmv.ts`, with no policy number written into code. The
income brackets moved by portaria in March 2026 and this repo's own table was already stale when
it was checked — which is the argument for the whole arrangement.

`docs/tasks/TASK-pre-qualificacao.md` built `/simulador`, the surface the project is justified
by: six steps, the plumb rail as progress and then verdict, and five exits rather than two —
"fora do programa" and "acima das faixas" are different honest answers from "hoje ainda não".
Blockers are returned as a list, so someone with a restriction *and* a prior MCMV purchase hears
both the first time instead of fixing one and returning to a second no. **Nothing is persisted:**
the six answers describe someone's income and their debts, they live in component state for the
length of the visit, and no Server Action, fetch or storage touches them — which is why this
screen adds no LGPD surface to the one `/contato` deliberately accepted.

That unit also changed how unconfirmed policy numbers are handled, and the change is worth
knowing about. Rates, subsidies and the Rio locality ceiling used to be **stored empty**, which
gated them off every surface. They are now **flagged suggestions**: filled in the admin so the
flow has numbers to show, each interpolated inside a confirmed band and argued for in
`src/payload/seed.ts`, and marked by `Parametros.mcmv.valores_sugeridos` — a checkbox that puts a
visible "estimativas ilustrativas" strip on every page printing one of them. The flag is the gate
now. Adriana replaces four fields and unticks one box; no code changes. Until she does, none of
it may reach a real buyer (`docs/pending-verifications.md`).

Editing `Parametros` revalidates the site (`src/payload/revalidate.ts`). It did not before, so a
corrected faixa saved in the admin would have been saved and then not served.

`docs/product-definition.md` and `docs/design-handoff.md` are the source of truth for *what
to build*; this file covers *how to work*. The root `README.md` is the implementation README
(setup, scripts, status).

### What this is

A marketing and pre-qualification site for **Adriana Monteiro**, an autonomous real-estate
broker (corretora autônoma, pessoa física) in Rio de Janeiro who resells **Cury Construtora**
launches — Porto Maravilha, Niterói, Barra da Tijuca and Recreio. Cury's Rio product is
concentrated in Minha Casa Minha Vida, mostly Faixas 2 and 3, from around R$ 210 mil.

She does not own inventory, set prices, or control delivery. She competes against **other
brokers selling the identical units with the identical Cury PDFs**. Therefore 100% of the
available differentiation is the buyer's experience — which is the entire thesis of this
project. See `docs/product-definition.md` §01–02.

**The product in one sentence:** answer *"eu consigo?"* before answering *"qual
apartamento?"* — because in MCMV the anxiety is credit approval, not finishes.

### Naming — unresolved

**"Prumo" is the working codename, not a confirmed brand.** `prumo.com.br` and `prumo.co` are
both taken. Four alternatives (Chão, Soleira, Raiz, Boa Praça) are documented with rationale in
`docs/design-handoff.md`. Adriana has not chosen yet. Do not hardcode the name — it belongs in
a single config constant so a rename is one edit.

### Stack

| Layer | Choice | Status |
|---|---|---|
| Framework | **Next.js** (App Router, TypeScript, `src/` dir, `@/*` alias) — always the latest stable major, never a pinned number (see §2.0) | installed, 16.3.0 · React 19.2.8 · React Compiler on |
| Styling / components | **Tailwind CSS v4 + shadcn/ui**, CSS-first config, retheming to the tokens in `docs/design-handoff.md` | installed, Tailwind 4.3.3 · shadcn on Radix primitives, `nova` preset, rethemed |
| Content + admin | **Payload CMS 3**, embedded in the Next app. Chosen because Adriana is non-technical and the value is *validation* (blocking an expired price table, a missing CRECI) more than editing | installed, 3.87.1 · admin pt-BR · publication gate live (registro + cartório required to publish); `Parametros` holds the INCC and the MCMV faixas |
| Data + files | Managed **Postgres** (Neon or Supabase) + S3-compatible storage (R2). Renders and floor plans are heavy — the image pipeline matters more than the database | adapters wired, **local dev runs on Postgres in Docker; no deployment database provisioned yet** |
| Messaging | `wa.me` deep links with pre-filled context. **Not** the WhatsApp Business API — at her volume the per-message cost buys nothing. See `docs/product-definition.md` §05 | not built |
| Credit analysis | Hand off to **Cury's existing broker link**. Never rebuild | n/a |
| Hosting | **Vercel**, São Paulo edge | not deployed |
| Package manager | **pnpm** — decided here, never mixed | pnpm 11.21.0 |

**Version numbers written anywhere in this repo are a snapshot, not a pin.** See §2.0 before
adding a dependency.

### Things that must not break

These are not style preferences. Each one is either a legal requirement, the product thesis,
or a promise made to the user.

- **The CRECI signature is a component, present on every surface.** Adriana's full name,
  "Corretora de Imóveis", and her CRECI-RJ number, with her photo. Required on every page, every
  shared proposal, every pre-qualification result, the OG image, exported PDFs, social profiles
  and portal listings. Proportions: her name ≥ 50% of the wordmark, CRECI ≥ 25% of the largest
  name on the piece, and **never below 11px** regardless of what the ratio permits.
  **Test: any screenshot of any screen must contain the complete signature.**
- **Her real name must always accompany the project name.** She is PF, so a nome fantasia is
  only permitted as a pseudonym when her real name appears clearly and prominently alongside it.
  Dropping her name to "clean up" a layout is a legal regression, not a design improvement.
- **The pre-qualification is orientation, not credit analysis.** No bureau lookups, no document
  uploads, no promise of approval. Everything it outputs is labelled an estimate. Crossing that
  line adds regulatory and LGPD risk for zero product gain.
- **Never claim availability she cannot guarantee.** The sales mirror is Cury's and changes
  hourly. Language is "consultar disponibilidade", never "disponível", and anything stock-derived
  carries a timestamp.
- **Both installment figures always appear together** — nominal today and INCC-projected at
  handover. Showing only the first is the industry's standard omission and the thing this
  product exists to correct.
- **Dignity, not luxury.** Marble, gold, thin display serifs, "exclusivo", "seleto" — a family
  earning R$ 5 mil reads these as *not for me*. What transfers from high-end work is respect:
  space, calm, complete information, no shouting.
- **No exclamation marks. No fabricated urgency. No sentence-case shouting.** A copy rule, not a
  suggestion — it is the cheapest and most visible contrast with her competition.
- **Page weight is an ethical constraint.** Much of this audience is on prepaid data. Budget:
  < 500 KB above the fold, AVIF, no autoplay video, LCP under 2.0s on 4G.
- **MCMV faixas, rates and subsidy bands are configurable in the admin, never hardcoded**, with
  the date of last revision displayed. They changed in 2026 and will change again.
- **An expired price table blocks proposal generation.** A deliberate hard gate — a proposal
  built on a stale table is the most expensive mistake available here.

### Start here

1. `docs/product-definition.md` — market, product, architecture, data model, phases, risks.
2. `docs/design-handoff.md` — identity, tokens, type, voice, signature spec, screens.
3. `docs/design/prototypes/` — four working HTML prototypes. Open them in a browser; they are
   the real reference, not mockups.
4. `docs/tasks/` — task docs. `TASK-scaffold-nextjs.md` is done; read it for what the
   scaffold does and does not include.
5. `docs/pending-verifications.md` — everything unconfirmed, placeholder or invented, by who
   can answer it. Read before showing anything to a real buyer.

### Open questions blocking Phase 1

Tracked in `docs/product-definition.md` §10. The two that matter most: Adriana's real CRECI
number (every prototype currently shows a placeholder), and **of every ten interested buyers,
how many she loses at credit analysis** — that number sizes the whole project.

---

## 1. Plan before executing — write a task document first

**Rule:** Before editing or creating **any** code file, write a task document at
`docs/tasks/TASK-<slug>.md` describing the work. No exceptions for "small" changes.

This applies from the very first scaffold commit: no code exists yet, so the initial
`create-next-app` scaffold gets a task document before any file is created.

### 1.1 Required sections

Every task document must contain these four sections, in this order:

1. **Current scenario** — how it works today. What exists, what's missing or blocked.
2. **Planned changes** — what will change, file by file. New behaviour, not just "edit X."
   Note any alternatives considered and rejected.
3. **Why** — justification with context. What does this unblock, what does it cost?
4. **Affected files** — a table:

   | File | Change type | Notes |
   |------|-------------|-------|
   | `src/app/page.tsx` | new | home per `docs/design-handoff.md` Screens |
   | `src/components/signature.tsx` | new | CRECI lockup, §0 "must not break" |

### 1.2 How to apply it

- **Write the document silently.** Create the file, then point the user at it or summarize in
  2–3 lines, and wait for alignment on anything significant before writing code.
- **One document per task / unit of work.** Short kebab-case slug:
  `TASK-scaffold-nextjs.md`, `TASK-pre-qualificacao.md`, `TASK-proposta-links.md`.
- **Keep it in sync** if the plan changes mid-task — it's a living record, not write-once.
- **The document is the contract.** When scope is unclear, the task doc is the source of truth
  for what was agreed.

### 1.3 Why this matters

The user wants review and alignment before code is written. It also leaves a trail of *why* a
decision was made — the CRECI proportions, the decision not to rebuild Cury's credit analysis,
the choice of Payload over a hand-built admin — none of which is recoverable from the code
later.

---

## 2. Use CLIs, generators, and SDKs — don't write everything by hand

**Rule:** Prefer invoking existing, canonical tooling over hand-authoring files a tool can
generate correctly.

### 2.0 Assume your framework knowledge is outdated — check first, every time

Frontend tooling moves fast, and this stack has a second fast-moving surface: **Brazilian
housing policy**. Before scaffolding or writing framework-specific code:

1. **Go to the framework's own current docs first** — Next.js, Tailwind, shadcn/ui, Payload.
   Don't rely on remembered APIs or flags; they may already be wrong.
2. **Use the official CLI to scaffold/generate**, not a hand-written file:
   `pnpm create next-app@latest`, `pnpm dlx shadcn@latest init` / `add <component>`,
   `pnpm create payload-app@latest`.
3. **shadcn/ui specifically**: not a versioned dependency installed once — components are pulled
   into the repo via its CLI and the conventions change. Re-check its docs each time. **Before
   any UI work**, load the `frontend-design` skill first and build with shadcn primitives rather
   than hand-rolled markup.
4. **Take the current major version as authoritative** over anything written in this file, and
   update the stack table to match (§3.1).
5. **MCMV faixas, income ceilings, property caps, rates and subsidy rules must be re-verified
   against Caixa before they are shown to any real user.** Every open item of this kind is
   indexed in `docs/pending-verifications.md`, grouped by who can answer it — add to it and
   remove from it as markers appear and are resolved. They were revised in 2026 by the
   Conselho Curador do FGTS. Anything unconfirmed gets `[VERIFICAR: ...]` inline rather than a
   guess. The same applies to CRECI/COFECI advertising rules, which vary by regional.

### 2.1 What this looks like in practice

- **Scaffolding & generators.** `pnpm create next-app@latest`, `pnpm dlx shadcn@latest add …`,
  `gh repo create`.
- **Run the command, then verify the output** rather than hand-recreating what a reliable
  generator already produces.
- **Use the agent's dedicated tools** (Read/Edit/Write/Grep) over improvised shell commands.
- **One package manager, decided at scaffold time, then never mixed.**

### 2.2 When to hand-write instead

No generator covers the pre-qualification logic, the INCC projection, the proposal link and its
open-tracking, or the retheming to the design tokens. That is hand-written, matching surrounding
code style.

### 2.3 Why this matters

Less human error, canonical and reproducible output, and — for anything touching MCMV numbers —
a result that reflects current policy rather than a stale figure from training data. A wrong
subsidy figure shown to a family is the worst failure this product can have.

---

## 3. Update documentation after executing

**Rule:** Before considering a task **done**, update all documentation affected by the change.

### 3.1 What to check and update

- **`CLAUDE.md`** — if the change alters the stack, architecture, or any of §0's "things that
  must not break," update the corresponding section here.
- **`README.md`** — the *implementation* README (setup, scripts, status). Update when scripts,
  stack, or the "Status" section change.
- **`docs/product-definition.md`** — market, product, architecture. Update when a product or
  architectural decision genuinely changes, and when an open question in §10 gets answered.
- **`docs/design-handoff.md`** — identity, tokens, voice, screens. Update when a design decision
  genuinely changes, not merely because an implementation differs slightly from a prototype.
- **`/sistema`** — the design system route (§4). A new shared component, token or state that
  is not represented there is an unfinished task, not a finished one.
- **`docs/tasks/`** — keep task docs in sync while work is in progress (§1.2).

### 3.2 How to apply it

Treat "docs updated" as an explicit checklist item before declaring a task complete. When unsure
whether a doc is affected, grep for the thing you changed across `README.md`,
`docs/product-definition.md`, `docs/design-handoff.md`, and this file.

### 3.3 Why this matters

The facts underneath this project have already shifted twice mid-flight: the market moved from
São Paulo to Rio, and the segment thesis survived only because it was re-checked. A doc that
silently goes stale is how a future session builds against the wrong spec.

---

## 4. Project conventions

**Rule:** Single Next.js app, not a monorepo — no workspace tooling unless a real second package
emerges.

- **Proposed layout:**

  ```
  src/app/(frontend)/        App Router routes — /, /empreendimentos/[slug], /simulador,
                              /p/[token] (proposta), /sobre, /contato; layout.tsx renders the
                              nav and footer so a page cannot forget the signature; icon.tsx,
                              opengraph-image.tsx, sitemap.ts
  src/app/robots.ts          the one file directly under src/app/. Next matches `robots` and
                              `manifest` with a regex anchored at the app root, so inside a
                              route group /robots.txt silently 404s. It is a route handler,
                              not a layout, so Payload's admin is unaffected
  src/app/(payload)/         Payload admin and REST/GraphQL API, pt-BR. Generated —
                              regenerate rather than hand-edit
  src/app/globals.css        design tokens, ported from design-handoff.md §03-04, §07, §09
  src/components/ui/         shadcn primitives
  src/components/            shared composites — signature (CRECI lockup), site-nav,
                              site-footer, whatsapp-action, contato-form; the catálogo pieces
                              (empreendimento-card, tipologia-card, registro-legal,
                              condicoes-comerciais, disponibilidade); plumb-rail — the §07
                              apparatus, a simulated rope and the site's only interactive piece
  src/components/prequalificacao/  the six-step flow and its five result states; also
                              valores-ilustrativos.tsx, the strip that marks a figure the admin
                              has flagged as not yet confirmed
  src/components/proposta/   the shared-link proposal surface
  src/lib/                   cn(); site-config.ts (BRAND_NAME, SITE_URL, CRECI);
                              signature.ts (the §06 proportions, shared by the component and
                              the OG image); routes.ts (nav + sitemap, one list);
                              metadata.ts (per-page canonical); whatsapp.ts (wa.me builder);
                              og-palette.ts (hex mirror of the tokens, for Satori);
                              format.ts (money, areas, dates — calendar dates in UTC);
                              prequalificacao.ts (the flow's own outcomes; the 30% ceiling, which
                              is a banking convention rather than a policy number, so it may live
                              in code where the faixas may not);
                              catalogo.ts (view types the components take instead of Payload
                              documents); incc.ts (projection, admin-backed); lgpd.ts (the
                              consent copy and version, shared by the form and the Server
                              Action); mcmv.ts in Phase 1
  src/assets/fonts/          TTFs for the OG image only — never served to a browser (§04)
  src/payload/collections/   Incorporadora, Empreendimento, Tipologia, CondicaoComercial,
                              Media, Lead, Consentimento, Users — plus Proposta in Phase 1
  src/payload/globals/       Parametros — the INCC rate and its revision date. Any number that
                              policy or the market moves goes here, never in code
  src/payload/access.ts      what the public REST/GraphQL endpoints may hand out. The site
                              reads through the Local API, so that surface is closed
  src/payload/payload-types.ts  generated; `pnpm generate:types` after any schema change
  payload.config.ts          root, per Payload's docs. Postgres + S3 adapters, pt-BR admin
  docs/product-definition.md market, product, architecture, phases, risks
  docs/design-handoff.md     identity, tokens, voice, signature spec, screens
  docs/design/prototypes/    four working HTML prototypes (reference, not built output)
  docs/tasks/                task docs (§1)
  ```

- **Two route groups, and almost nothing at the top of `src/app/`.** Payload's admin ships its
  own root layout, so the site needs its own alongside it. A *page or layout* added directly
  under `src/app/` breaks the admin. The single exception is `robots.ts`, which Next only
  recognises at the app root and which is a route handler, not a layout — see the layout note
  above.

- **The palette is available under its own names** — `bg-verde`, `text-ink-muted`, `border-rule`
  — as well as through the shadcn semantic tokens they feed. Screens should read the way
  `design-handoff.md` reads.

- **Dark mode has three states**, and all three are token-driven: explicit light, explicit dark
  (`data-theme` on `<html>`), and the unstamped system default. Never define a color only inside
  a media query or a `[data-theme]` block.

- **`/sistema` is the design system, and it is part of the deliverable.** It renders the
  palette, the states, the type scale, the rethemed primitives and the signature with the real
  components and the real tokens — so a broken token shows up immediately, which a table in a
  markdown file never does. Rules:

  - **Every shared component gets a panel there in the same task that introduces it.** Not in a
    later tidy-up pass. This is the only thing that keeps the page from decaying into a
    screenshot of what the project looked like in August 2026.
  - **Hidden, not protected** — unlinked and `noindex`. It holds placeholder copy and public
    brand decisions, nothing confidential. If that ever changes, so does this.
  - **It is what gets shown to Adriana** when a design question needs her opinion. Asking
    whether a colour and a piece of type feel like they are *for her* is a cheaper and better
    question than asking it about a finished page (`docs/design-handoff.md` §01).
  - It is a reference surface, not a screen. Nothing on the site links to it, and no screen
    imports from it.

- **Language.** All user-facing copy is **Brazilian Portuguese**. Code, comments, commit
  messages and docs are English, except where a domain term has no useful translation — keep
  `espelho de vendas`, `tabela`, `faixa`, `entrada`, `repasse`, `INCC`, `CRECI` as-is.
- **Styling:** Tailwind v4 + shadcn/ui, rethemed to `docs/design-handoff.md`. Don't introduce a
  second styling system alongside it.

**Why:** this is a marketing and pre-qualification site for one broker, not a distributed
system. The process should match the size of the problem.

### 4.1 Commit conventions

- **Commit automatically once a task doc's work is complete and verified** (build/lint passing) —
  don't wait to be asked for each one. This is a standing authorization scoped to work that
  followed the task-doc process in §1; it is not blanket permission for destructive git
  operations (force-push, `reset --hard`), which still require explicit confirmation.

---

## TL;DR

| Phase | Rule | Output |
|-------|------|--------|
| **Stack** | Next.js + Tailwind v4 + shadcn/ui + Payload CMS 3 + Postgres + Vercel, pnpm | Single-app repo: `src/app/`, `src/components/`, `docs/tasks/` |
| **Before** | Write a task document first | `docs/tasks/TASK-<slug>.md`: current scenario, planned changes (file by file), why, affected-files table |
| **During** | Use CLIs / generators; `[VERIFICAR: ...]` for any MCMV or CRECI rule not confirmed against the source | Canonical output, no guessed policy numbers |
| **After** | Add any new shared component to `/sistema`; update `README.md` / `docs/product-definition.md` / `docs/design-handoff.md` / `CLAUDE.md`, then commit | Design system current, docs in sync, a commit |

**The loop:** plan → align → build with tooling → document → commit → done.

**Never broken:** the CRECI signature on every surface, her real name beside the project name,
pre-qualification as orientation and not credit analysis, no invented availability, both
installment figures shown together, dignity over luxury, no exclamation marks, the page-weight
budget, MCMV numbers configurable and dated, expired tables blocking proposals.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
