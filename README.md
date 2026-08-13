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

**Phase 0 is built except for the page that needs a photograph.**

| Area | State |
|---|---|
| Product definition | Complete — `docs/product-definition.md` |
| Design handoff | Complete — `docs/design-handoff.md` |
| Prototypes | Four working HTML prototypes — `docs/design/prototypes/` |
| Application | Tokens, signature, nav, footer, OG image, robots, sitemap, `wa.me` builder |
| Catálogo | `/empreendimentos` and `/empreendimentos/[slug]` built and verified against Postgres; publication gate exercised end to end |
| Contato & LGPD | `/contato` and `/privacidade` built; `Lead` and `Consentimento` write through a Server Action, never a public endpoint |
| Home | `/` built and verified — composes the catálogo, the WhatsApp action and the signature; states the credit-before-apartment order in words. Lint, typecheck and `pnpm build` clean; rendered and read at 390px, empty state exercised |
| Content screens | `/sobre` not yet built — the nav link 404s on purpose, blocked on a real photograph |
| Payload admin | Schema built and run against a local Postgres (Docker); no deployment database yet |
| Deployment | None |

Adriana has reviewed the pre-qualification and proposal prototypes and approved the direction.
Corrections pending from her.

Units 1–3 and 5 of Phase 0 are done (`docs/tasks/TASK-chrome-e-seo.md`,
`docs/tasks/TASK-empreendimentos.md`, `docs/tasks/TASK-contato-lgpd.md`,
`docs/tasks/TASK-home.md`) — the catalogue's seed uses one real Rio development (Cury's
Residencial Pixinguinha in Santo Cristo) for everything Cury publishes, and marks everything it
does not — registro de incorporação, cartório, payment schedule — as placeholder. Unit 4,
`/sobre`, is the last one and is blocked on a photograph of her; it is sequenced in
`docs/tasks/TASK-fase-0.md`.

The nav links to `/sobre` before that page exists. That is deliberate: the sitemap only lists
routes flagged `built` in `src/lib/routes.ts`, so each unit flips one boolean.

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

## Stack

Installed versions are a snapshot, not a pin. See `CLAUDE.md` §2.0 before adding anything.

- **Next.js 16** (App Router, TypeScript, React Compiler on) · **Tailwind v4 + shadcn/ui**
  (Radix primitives) · **Payload CMS 3**
- Managed **Postgres** + S3-compatible storage · **Vercel**
- **pnpm**, never mixed

Messaging is `wa.me` deep links, not the WhatsApp Business API — at her volume the per-message
cost buys nothing. Credit analysis hands off to Cury's existing broker link and is never rebuilt.

---

## Setup

Requires Node 20.9+ and pnpm.

```bash
pnpm install
cp .env.example .env          # then fill DATABASE_URL and PAYLOAD_SECRET
docker run -d --name prumo-postgres -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=prumo -p 5432:5432 postgres:16-alpine
pnpm seed                     # one real Rio development, for the catalogue pages to render
pnpm dev                      # http://localhost:3000, admin at /admin
```

`DATABASE_URL` needs a real Postgres — the `docker run` above matches `.env.example`'s default
for local development; Neon or Supabase both work for deployment, and Payload creates its own
schema on first run either way. Generate `PAYLOAD_SECRET` with `openssl rand -hex 32`. The S3
variables can stay empty in development: without them uploads fall back to local disk.

---

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Development server, site and admin together |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |
| `pnpm generate:types` | Regenerate `src/payload/payload-types.ts` from the collections |
| `pnpm generate:importmap` | Regenerate the admin import map after adding custom components |
| `pnpm seed` | Seed the catalogue with one real (Cury-sourced) development, for local development only |

Run both `generate:` scripts after changing anything under `src/payload/collections/`.

---

## Layout

```
src/app/(frontend)/     the public site
src/app/(frontend)/empreendimentos/  the catalogue — listing, ficha, the Payload→view mapping
src/app/(frontend)/sistema/  the design system — hidden, noindex, and part of the deliverable
src/app/(payload)/      the admin panel and REST/GraphQL API, generated by Payload
src/app/globals.css     design tokens — docs/design-handoff.md §03-04, §07, §09
src/app/robots.ts       the only file at the top of src/app/ — Next matches robots there only
src/components/         signature (the CRECI lockup), site-nav, site-footer, whatsapp-action,
                         contato-form, the catálogo pieces (empreendimento-card, tipologia-card,
                         ...)
src/components/ui/      shadcn primitives, rethemed
src/lib/site-config.ts  BRAND_NAME, BROKER_CRECI and the rest of the identity strings
src/lib/routes.ts       the public routes, shared by the nav, the footer and the sitemap
src/lib/signature.ts    the §06 proportions, shared by the component and the OG image
src/lib/format.ts       money, areas and dates in pt-BR — calendar dates formatted in UTC
src/lib/incc.ts         the INCC projection; no rate configured means no figure is shown
src/lib/lgpd.ts         the consent copy and version, shared by the form and its Server Action
src/lib/payload.ts      the Local API client pages read the catalogue through
src/assets/fonts/       TTFs the OG image needs; never served to a browser
src/payload/            collections, globals, access rules and generated types
src/payload/revalidate.ts  wraps revalidatePath() so seed scripts can opt out of it
src/payload/seed.ts     `pnpm seed` — development data, never sent to a buyer
payload.config.ts       Postgres, S3, pt-BR admin
```

Two route groups because Payload's admin needs its own root layout. No other page or layout
lives at the top of `src/app/`; `robots.ts` is a route handler and has to be there.

The nav and the footer are rendered by `(frontend)/layout.tsx`, not by pages — the signature is
a legal requirement on every surface, and a page that cannot choose cannot forget.

`/sistema` renders the palette, states, type scale, primitives and signature with the real
components and the real tokens. It is where design questions get put to Adriana, and every new
shared component is expected to land there in the same task that introduces it — see `CLAUDE.md`
§4.

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
