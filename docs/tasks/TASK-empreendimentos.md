# TASK — The catalogue: /empreendimentos and /empreendimentos/[slug]

> Status: **built and verified against a running Postgres.** Both routes, the seed, the
> revalidation hooks and the sitemap are in; `pnpm build` and lint pass; the publication gate was
> exercised end to end (draft without registro → blocked on publish). `/empreendimentos` is
> `built: true`. See §9 and §10 for what stage 2 actually involved, including two real bugs it
> caught.
>
> Unit 2 of five in `TASK-fase-0.md`, and the largest of the phase. Decisions taken: Postgres in
> Docker for development, Supabase later; commercial conditions ship in full, with both
> installment figures (§2.5, option A).

## 1. Current scenario

The catalogue exists as a schema and nothing else. `src/payload/collections/` defines
`Empreendimento`, `Tipologia`, `CondicaoComercial`, `Incorporadora` and `Media`, with the two
legally required fields (`registro_incorporacao`, `cartorio`) marked required and
`validade_da_tabela` required on every commercial table. None of it has ever run against a
database: `DATABASE_URL` points at `postgres://…@localhost:5432/prumo` and nothing is listening
on that port, so the admin has never opened and no row has ever been written.

On the site, `/empreendimentos` is one of the three links the nav carries and does not have —
it 404s by design (`src/lib/routes.ts`, `built: false`). Nothing has exercised the image
pipeline, which is where the weight budget in `design-handoff.md` §09 is won or lost. There is
no publication state: an empreendimento is either saved or not, and "saved" would mean "public"
the moment a page reads the collection. There are no formatting helpers, so the first page to
print `R$ 289.000` and `42 m²` will invent its own.

Four of the rules in `CLAUDE.md` §0 have had nothing to bind to until now. This unit is where
they first become code:

- the registro de incorporação and the cartório on every listing,
- "consultar disponibilidade", never "disponível", with a timestamp on anything stock-derived,
- both installment figures together, nominal and corrected,
- and a price table that expires.

## 2. Planned changes

### 2.0 Prerequisite — a database, and it needs a decision

**Decided: Postgres in Docker for development, Supabase for deployment.** The `.env` already
points at `postgres://…@localhost:5432/prumo`, which the container will satisfy, and moving to
Supabase later is a change of one connection string — Payload creates its own schema on first
run against either.

Docker is not installed on this machine yet (checked: no `docker` on PATH or in the login shell,
no Docker Desktop, OrbStack, Colima or Podman), so the work splits in two:

**Stage 1 — no database.** Formatting and INCC helpers, the `Parametros` global, the schema
changes, the five components and their `/sistema` panels, built against fixtures. All of it
compiles, renders and is reviewable with nothing running.

**Stage 2 — needs the container.** The two routes, `generateStaticParams`, the revalidation
hooks, the seed script and the sitemap entries. None of it can be verified without rows, and a
page that reads an empty database proves nothing.

The split is not only pragmatic: it is the reason the components take view props rather than
Payload documents (§2.6), which is a better boundary regardless of when the database arrives.

### 2.1 Data access

**`src/lib/payload.ts`** — a thin `getPayload({ config })` wrapper, memoised. Pages query
through Payload's **Local API**, not REST or GraphQL: it runs in the same process, so a server
component reads the database directly with no HTTP hop and no second serialisation.

Rendering is static. `generateStaticParams()` enumerates published slugs at build time, and
`afterChange` / `afterDelete` hooks on the three catalogue collections call `revalidatePath()`
for the pages that entry appears on. Adriana publishes, the page updates, and nothing is rendered
per request — which matters on a 4G budget more than it matters for cost.

### 2.2 Schema — three additions, all of them rules that already exist on paper

**Drafts on `Empreendimentos`** (`versions: { drafts: true }`). This is the publication gate the
roadmap asks for, and it is worth being precise about the mechanism: Payload skips required-field
validation on drafts and enforces it on publish, so "no `registro_incorporacao` or `cartorio`, no
publish" stops being a policy and becomes the only way the button works. She can start a
launch's page days before the registro number arrives and simply cannot make it public. Public
queries filter `_status: 'published'`.

**A `Parametros` global** — one record, admin-editable, holding the INCC projection used to
correct installments, its `data_revisao`, and its source. `CLAUDE.md` §0 requires that any number
of this kind be configurable and dated rather than hardcoded, and this is the first surface that
needs one. The value ships as `[VERIFICAR: INCC acumulado — confirmar na FGV antes de exibir]`
and the page does not render a corrected figure until it is set.

**`publicavel` validation on `Incorporadoras`** — a hook that refuses to publish an
empreendimento whose incorporadora has no `autorizacao_publicidade.concedida_em`. Cury's
authorisation is confirmed and on record (`product-definition.md` §06); the point of the check is
the second builder, not the first.

### 2.3 The listing — `/empreendimentos`

One card per published development, ordered by status then delivery date. Each card carries the
name, the bairro and city, the construction status, the expected delivery, the nearest transport
with its walking time, and an indicative price band drawn from the cheapest tipologia — labelled
as a band, never as a price, and dated.

No filters and no search. Fewer than ten developments; a filter bar would be furniture. When the
count passes what a person can scan, that is the moment to add one and not before.

### 2.4 The ficha — `/empreendimentos/[slug]`

Order follows `design-handoff.md` §08: where it is, then what it is, then what it costs.

1. **Name, bairro, status, delivery.** The delivery date states the 180-day contractual
   tolerance in the same breath, in the §05 voice — the discomfort is named, not buried.
2. **Where it is.** Address, then transport with real walking minutes, then the lazer list. No
   map: a static map image is an API key, a request and 100 KB to say what an address and a
   metro station already say.
3. **Tipologias.** The floor plan is the primary visual and the largest thing on the page, per
   §09 — every competitor buries the planta behind a carousel of renders, which is precisely the
   habit worth breaking. Area, dormitórios, vagas, the MCMV faixas the unit is eligible for, and
   the price band.
4. **Commercial conditions**, when a non-expired `CondicaoComercial` exists — see the decision
   in §2.5. When the table has expired the block does not render a stale number; it says the
   table has expired and offers the conversation.
5. **The registro block.** Registro de incorporação and cartório, legible, not in 9px grey.
   ⚖ Legal requirement, and the design treats it as information rather than as fine print.
6. **One action.** "Consultar disponibilidade" as a `wa.me` link carrying the development's name,
   through the existing `WhatsAppAction`. The word "disponível" appears nowhere on the page.
7. **Timestamp.** Everything stock-derived carries `updatedAt`, in words.

### 2.5 The decision inside this unit — how much of the commercial table goes public

The roadmap commissioned "commercial terms with both installment figures, total cost visible".
There are two honest ways to ship that, and they differ in cost:

- **A — the full conditions.** Entrada, parcelas de obra, balões and the valor nas chaves, each
  nominal figure paired with its INCC-corrected value at handover, sourced from the `Parametros`
  global and stamped with the table's reference and validity. This is the product thesis made
  visible, and it is the thing no competitor does. It needs `src/lib/incc.ts`, the global, and a
  real INCC number from you.
- **B — the band only.** Price band per tipologia, total cost and installments deferred to the
  conversation. Cheaper, ships without an INCC figure, and is exactly what every other broker's
  site does — which is the argument against it.

**Decided: A, scoped.** One annual projection rate, applied to the nominal figures, with the
revision date shown beside them. Not a month-by-month schedule — that is the proposal's payment
timeline and it belongs to Phase 1. If the INCC number is not available when the build reaches
this point, the block degrades to B on its own and says why.

### 2.6 Components, and their panels on `/sistema`

Per `CLAUDE.md` §4, in this task and not a later one:

| Component | What it is |
|---|---|
| `empreendimento-card` | listing card, with the band and the timestamp |
| `tipologia-card` | floor plan first, then the numbers |
| `registro-legal` | ⚖ the registro and cartório block |
| `condicoes-comerciais` | the table, both figures, validity — or its expired state |
| `disponibilidade` | the "consultar" note and the timestamp, so the phrasing has one home |

`disponibilidade` exists as a component for the same reason `Signature` does: the wording is a
rule, and a rule that lives in one file cannot be paraphrased into a claim by the next screen.

### 2.7 Images

`Media` gains `imageSizes` and AVIF/WebP output through sharp, and the pages use `next/image`
with explicit `sizes`. Floor plans load eagerly on the ficha because they are the reason the page
exists; renders lazily below. The §09 budget is < 500 KB above the fold, and this is the first
unit that can break it.

### 2.8 Development data

`src/payload/seed.ts` and a `pnpm seed` script, creating one incorporadora, one empreendimento
and two tipologias so the pages have something to render before Cury's real numbers arrive.
Development only, and the values are invented — the same rule the prototypes carry: never send
one to a buyer, and never deploy with it.

**Alternatives considered and rejected:**

- *REST or GraphQL instead of the Local API.* Rejected: an HTTP hop to the same process.
- *Content in the repo as MDX.* Rejected outright — Adriana is not technical, and the whole
  reason Payload is here is that she edits this herself.
- *A render carousel.* Rejected: it buries the planta, which §09 makes the primary visual.
- *A static map.* Rejected on weight and on an API key, for information the address and the
  transport list already carry.
- *Publishing a "disponível" flag.* Rejected permanently, not just here: the sales mirror is
  Cury's and changes hourly.
- *Per-request rendering.* Rejected: nothing on this page is personal, and static is faster on
  4G.

## 3. Why

This is the page a WhatsApp link actually points at. `product-definition.md` §08 says the traffic
already exists and arrives through referrals and Instagram, which means the development page —
not the home page — is what most people will see first.

It is also where the compliance rules stop being documentation. The registro block, the
availability language, the expiring table and both installment figures all become code here, and
a Phase 0 that ships them wrong ships a regulatory problem rather than a design one.

Cost: the largest unit of the phase, and the one most exposed to the overspend risk that
`TASK-fase-0.md` names at the top. The defence is the commodity instruction — Tecimob sells this
for R$ 200/month — so the standard is correct and fast, and the one place worth spending beyond
that is the floor plan treatment, because it is the only part of the page a competitor is not
already doing.

## 4. Affected files

| File | Change type | Notes |
|---|---|---|
| `src/app/(frontend)/empreendimentos/page.tsx` | new | the listing |
| `src/app/(frontend)/empreendimentos/[slug]/page.tsx` | new | the ficha |
| `src/app/(frontend)/empreendimentos/[slug]/opengraph-image.tsx` | new | name, bairro, signature — the shared-link surface |
| `src/components/empreendimento-card.tsx` | new | + `/sistema` panel |
| `src/components/tipologia-card.tsx` | new | + `/sistema` panel |
| `src/components/registro-legal.tsx` | new | ⚖ + `/sistema` panel |
| `src/components/condicoes-comerciais.tsx` | new | ⚖ both figures; + `/sistema` panel |
| `src/components/disponibilidade.tsx` | new | the phrasing, in one place; + `/sistema` panel |
| `src/lib/payload.ts` | new | Local API client |
| `src/lib/format.ts` | new | BRL, m², dates, all pt-BR |
| `src/lib/incc.ts` | new | projection from the admin parameter (decision §2.5) |
| `src/payload/collections/empreendimentos.ts` | edit | drafts, publication gate, revalidation hooks |
| `src/payload/collections/tipologias.ts` | edit | revalidation hooks |
| `src/payload/collections/condicoes-comerciais.ts` | edit | revalidation hooks |
| `src/payload/collections/media.ts` | edit | image sizes, AVIF/WebP |
| `src/payload/globals/parametros.ts` | new | INCC projection + `data_revisao` |
| `src/payload/seed.ts` | new | development data only |
| `payload.config.ts` | edit | register the global |
| `src/lib/routes.ts` | edit | `/empreendimentos` becomes `built: true` |
| `src/app/(frontend)/sitemap.ts` | edit | one entry per published development |
| `src/app/(frontend)/sistema/page.tsx` | edit | five new panels |
| `package.json` | edit | `pnpm seed` |
| `.env.example` | edit | a note on where the connection string comes from |
| `docs/design-handoff.md` | edit | §08 records the ficha as built |
| `README.md`, `CLAUDE.md` | edit | per `CLAUDE.md` §3 |

## 5. Done when

- `/empreendimentos` lists every published development and `/empreendimentos/[slug]` renders one,
  both carrying the signature through the layout.
- No development can be published without its registro de incorporação and cartório, and the
  block is visible on the page.
- The word "disponível" appears nowhere; "consultar disponibilidade" does, and every
  stock-derived figure carries a date.
- No installment figure appears alone. Either both appear, or neither does.
- An expired `CondicaoComercial` renders as expired, never as a number.
- A floor plan is the largest element of a tipologia, and the ficha stays inside the §09 weight
  budget with images measured, not assumed.
- `/sistema` has a panel for each of the five new components.
- The sitemap lists the published developments; `/empreendimentos` is `built: true`.
- `pnpm build` and lint pass, and the seed data is not what shipped.

## 6. Explicitly out of scope

The pre-qualification and the proposal (Phase 1). Lead capture and consent — unit 3, and this
page's only action is the `wa.me` link until then. Portal sync, maps, search, filters, favourites
and comparison tables. Per-unit availability of any kind.

## 7. Blocked on

- **A Postgres connection string** — §2.0. Resolved for local development (Docker, this
  session); a Supabase connection string for deployment is still open, tracked in
  `docs/product-definition.md` §10.
- **Real Cury data.** Partially resolved by §10: the seed's address, station, delivery month,
  amenities and one starting price are real, sourced from Cury's own marketing pages. Still
  outstanding — and still blocking a public launch — is the registro de incorporação number and
  cartório for each development (not published anywhere Cury's marketing surfaces), the current
  price tables with their validity dates, and the floor plan files at a usable resolution.
- **An INCC figure**, if decision §2.5 goes to A. One number and its source, entered once in the
  admin. The seed sets an illustrative one so the commercial block has both figures to show in
  development; it is marked `[VERIFICAR]` and must not reach production.
- Unchanged from unit 1: `BROKER_CRECI` is still `00.000-F` and now appears on the per-development
  OG image as well.

---

## 8. Stage 1, as built

Everything below is in and reviewable on `/sistema` with nothing running behind it.

**`src/lib/format.ts`, `src/lib/catalogo.ts`, `src/lib/incc.ts`.** Money, areas and dates in
pt-BR; the catalogue's vocabulary and view types; the INCC projection.

**Schema.** Drafts and the publication gate on `Empreendimentos`, the `Parametros` global for the
INCC rate and its revision date, three AVIF image sizes on `Media`, and access rules in
`src/payload/access.ts`.

**Five components, five panels.** `EmpreendimentoCard`, `TipologiaCard`, `RegistroLegal`,
`CondicoesComerciais` (in all three of its states) and `Disponibilidade`.

### Three things worth recording

**The public REST API is closed, not just filtered.** The plan said drafts would keep unpublished
developments off the site. That is true of the pages, which read through the Local API — but
Payload also exposes REST and GraphQL, and a draft would have been one query away. Since no page
uses those endpoints, `empreendimentos` now returns published documents only to an anonymous
caller, and `tipologias`, `condicoes-comerciais` and `incorporadoras` return nothing at all.
`media` stays public because that is how the images are served.

**A timezone bug, caught by looking at the rendered page.** Payload stores calendar dates as
midnight UTC. Formatted in São Paulo time they print three hours earlier — so a delivery in
`2029-03-01` rendered as *fevereiro de 2029*, and a table valid until the 31st would have said
the 30th. Calendar dates are now formatted in UTC, which is the calendar they were written in;
real instants like `updatedAt` pass their own zone. It would have shipped a wrong delivery month
on every listing.

**The commercial block refuses to render half a truth.** Without an INCC rate in the admin there
is no corrected figure, so the nominal figure is not shown either and the block says why. The
same is true past a table's validity date. Both states are on `/sistema` beside the working one,
because a rule that only exists in prose is a rule waiting to be re-argued.

## 9. Stage 2, when Postgres is up

**Status: Docker Desktop installed but its daemon has not finished coming up on this
machine** — `docker version` returns the client block and then hangs waiting on the server,
which points at a stuck first-run step (a privileged-helper or Virtualization.framework
permission prompt) that needs a manual click in the GUI. Not something a shell command or an
agent can drive past. The plan below is written so every step that does not need a live
database happens first; only the last two bullets are actually blocked.

**9.1 `src/lib/payload.ts`.** A memoised `getPayload({ config })`, per Payload's own guidance
for calling the Local API from Next's server components — one instance per process, not one per
request.

**9.2 View-model mapping, colocated with the routes rather than in `catalogo.ts`.** The types in
`src/lib/catalogo.ts` are deliberately Payload-shaped-nothing (§2.6's whole point). Mapping a
Payload document to `EmpreendimentoResumo` / `TipologiaResumo` / `CondicaoComercialResumo` is
route-specific — it picks the cheapest tipologia for the listing band, resolves the `midia` and
`planta` upload relationships to `Media`'s `ficha`/`planta` image sizes, and filters
`condicoes-comerciais` down to the one that is not expired. That mapping lives next to the two
page files, not in the shared lib, so a schema rename cannot ripple into the components through
a back door.

**9.3 `/empreendimentos` (`page.tsx`).** Queries published `empreendimentos`, ordered by
`status` then `entrega_prevista`; for each, the cheapest `tipologia.faixa_de_preco` becomes the
card's band. Renders `EmpreendimentoCard` per result. Static (`revalidate` driven by the hooks
in 9.5, not time-based).

**9.4 `/empreendimentos/[slug]` (`page.tsx`).** `generateStaticParams()` enumerates published
slugs. The page composes, in the §2.4 order: heading block (name, bairro, status, delivery with
the 180-day tolerance named in the sentence, per `design-handoff.md` §05's "name the
discomfort"), address and transport, `TipologiaCard` per tipologia (first one `priority`),
`CondicoesComerciais` for the tipologia's live table (or its expired/unconfigured state — both
already handled inside the component), `RegistroLegal`, one `WhatsAppAction` carrying the
development's name as context, and `Disponibilidade` stamped with the document's `updatedAt`.
`notFound()` on an unpublished or missing slug.

**9.5 Revalidation hooks.** `afterChange` / `afterDelete` on `Empreendimentos`, `Tipologias` and
`CondicoesComerciais` call `revalidatePath()` for `/empreendimentos` and the affected
`/empreendimentos/[slug]` — a `Tipologia` or `CondicaoComercial` walks its `empreendimento`
relationship to find which slug to revalidate.

**9.6 `opengraph-image.tsx` under `[slug]/`.** Same construction as the site-wide one (shared
fonts, `signatureScale`, the plumb rail), swapping the fixed line for the development's name and
bairro. Reads the one document by slug through the Local API.

**9.7 `src/payload/seed.ts` + `pnpm seed`.** One incorporadora (Cury, with
`autorizacao_publicidade.concedida_em` set so the publication gate in §2.2 has something to
pass), one empreendimento (published, both legal fields filled with placeholder-but-present
values so the gate is exercised, not bypassed), two tipologias, one live `CondicaoComercial`.
Invented numbers, same rule as the `/sistema` fixtures: never sent to a buyer, never part of a
production deploy.

**9.8 Sitemap and routes.** `sitemap.ts` adds one entry per published `empreendimento`, read
through the same Local API call the listing uses. `routes.ts` flips `/empreendimentos` to
`built: true`.

**9.9 Run it.** `pnpm seed`, then `pnpm dev` to look at both routes and confirm the signature,
the registro block, both installment figures, and the "consultar disponibilidade" wording all
render from real rows rather than fixtures.

**9.10 Measure it.** A real reading of the §09 weight budget against the seeded floor plan and
render — not the rigorous 4G/Lighthouse pass §09 ultimately needs, since that needs the browser
tooling this run didn't have connected, but a first honest number rather than none: the ficha's
JS is Next's standard per-route chunk set, and the page compiles and serves in ~2s cold in dev.
The real measurement, with network throttling, is still open — see §10.

## 10. Stage 2, as built

Docker Desktop's daemon was mid-first-run (stuck behind a privileged-helper permission step) at
the start of this session and came up on its own partway through; a Postgres 16 container
(`prumo-postgres`, `-p 5432:5432`, matching `.env`'s `DATABASE_URL`) supplied the database
everything below was verified against. Both routes, the mapping module (§9.2), the revalidation
hooks (§9.5), the OG image (§9.6), `pnpm seed` (§9.7) and the sitemap/routes flip (§9.8) are in.
`pnpm build` and lint pass; `/empreendimentos` is `built: true`.

**Real data replaces the seed's placeholders where Cury publishes it.** The web has Cury's own
marketing pages for a real Santo Cristo launch, Residencial Pixinguinha — so the seed uses its
real address (Rua General Luís Mendes de Morais, Santo Cristo), its real nearest station (VLT
Praia Formosa, ~2 min on foot), its real delivery month (10/2028), its real amenity list, and the
one real price Cury discloses (R$ 349.649,15 for the 33 m² studio) — confirmed 2026-08-12.
Everything Cury does not publish — the registro de incorporação, the cartório, the payment
schedule, the INCC rate — is still invented and marked `[SEED]` or `[VERIFICAR]`, per §7: none of
it may reach a buyer, seed data or not.

**Two real bugs, caught by seeding for real instead of trusting fixtures — the whole reason §9.1
insisted on doing everything not needing a database first, and stage 2 second, rather than
skipping straight to a page that renders and calling the unit done:**

1. **A field-naming collision in the schema.** Payload's Postgres adapter names a `select`
   field's enum `enum_<table>_<snake_case field name>`. `toSnakeCase('_status')` — the field
   Payload's own `drafts` feature adds automatically — collapses to `status`, identical to
   `enum_empreendimentos_status` that this collection's own `status` field asked for. The two
   enums collided under one Postgres type, and the domain field silently inherited the drafts
   enum's values (`draft`/`published`) instead of its own (`lancamento`/`em_obras`/`entregue`) —
   no error at push time, only a `22P02 invalid input value for enum` the first time a real value
   was written. Fixed by renaming the field to `status_obra` in
   `src/payload/collections/empreendimentos.ts`, which sidesteps the collision entirely. Worth
   remembering for any future collection that both takes `drafts` and wants a field literally
   named `status`.
2. **`revalidatePath()` cannot run from a standalone script.** The hooks in §9.5 are correct
   inside the Next app — the admin always runs inside a Next request — but `payload run
   src/payload/seed.ts` has no Next request to hang the call on, and throws `Invariant: static
   generation store missing`. Fixed with `src/payload/revalidate.ts`, a
   `revalidateCatalogoPath()` wrapper that no-ops when `req.context.disableRevalidate` is set;
   `seed.ts` passes that context on every catalogue `create()`. Real edits through the admin are
   unaffected — the context flag is opt-in and only the seed script sets it.
3. **The ficha picked the wrong tipologia to key its commercial-conditions block on.** The first
   draft read `tipologias[0]` from the query result and asked for that tipologia's commercial
   table — but Payload does not guarantee the find() order matches insertion order, and when it
   didn't, the ficha silently rendered no "Como se paga" section at all, with no error to notice
   it by. Fixed by exporting `tipologiaMaisBarata()` from the mapping module (§9.2) and using the
   same cheapest-tipologia selection the listing card already uses, so the reference tipologia is
   chosen by price on both pages rather than by an unordered query result on one of them.

Verified directly against the database rather than assumed: a draft `Empreendimento` saved
without `registro_legal` succeeds, and publishing that same draft is rejected with a field-level
validation error naming the missing registro fields — the gate in §2.2 works as designed, not
just as configured.

**Not done in this pass:** the rigorous §09 weight/LCP measurement with network throttling (no
browser tooling connected this run — see §9.10), and a second `Tipologia`'s `CondicaoComercial`
was not seeded, so the expired-table and no-rate states are only exercised on `/sistema`'s
fixtures, not against a real row.
