# TASK — `/`, the front door

> Unit 5 of Phase 0 (`TASK-fase-0.md`), and the last of it. Status: **planned, not started.**
>
> Built last on purpose: it composes from the four units above it and has almost nothing of its
> own. `design-handoff.md` §08 ranks it fifth in value and calls it deliberately simple, and
> `product-definition.md` §07 calls the whole phase commodity. Both are instructions to spend
> little here.

## 1. Current scenario

`src/app/(frontend)/page.tsx` is the placeholder written at the end of unit 1: a heading, one
paragraph saying the site is being built, and a `WhatsAppAction`. It carries the signature
because the layout does, so it is not wrong — it is just empty.

Everything the real home needs now exists:

- **Chrome and signature** — `(frontend)/layout.tsx` renders `SiteNav` and `SiteFooter`, so the
  page cannot forget the lockup. The layout also supplies the default title, description and OG
  envelope, so the home's `pageMetadata({ path: "/" })` needs no title or description of its own.
- **Catalogue** — `EmpreendimentoCard` takes an `EmpreendimentoResumo`, and
  `empreendimentos/mapping.ts` builds one from a Payload document. `/empreendimentos` already
  queries published developments, groups their tipologias and sorts by status then delivery.
- **The way in** — `WhatsAppAction` with a `WhatsAppContext`, `/contato`, `/privacidade`.
- **Identity** — `Signature` in `header`, `footer` and `full` variants.

Two things are missing rather than broken. `/sobre` is unit 4 and is not built:
`PRIMARY_ROUTES` marks it `built: false`, the nav links to it anyway (deliberate, per
`routes.ts`) and the sitemap omits it. And `BROKER_PHOTO` is still
`/adriana-placeholder.jpg`.

The listing page's sort (`ORDEM_STATUS`, `porStatusEEntrega`) and its query live inside
`empreendimentos/page.tsx`, where a second page cannot reach them.

## 2. Planned changes

### 2.1 Extract the catalogue query — `empreendimentos/query.ts` (new)

The home needs the same published-and-sorted developments the listing needs, capped at three.
Rather than a second copy of the query, the grouping and the sort, move all three out of
`empreendimentos/page.tsx` into a colocated `query.ts`:

```
listarEmpreendimentosPublicados({ limit }?: { limit?: number }): Promise<EmpreendimentoResumo[]>
```

It runs both `find` calls, groups tipologias by development, sorts by status then delivery, maps
through `toEmpreendimentoResumo`, and slices. `/empreendimentos` calls it with no limit; `/`
calls it with `limit: 3`. The listing page loses about thirty lines and gains nothing else.

**Colocated in the route folder, not `src/lib/`** — `mapping.ts` says it is "the one place
allowed to know the schema," and a query file is the same kind of knowledge. The home imports
across route folders, which is fine: only `page.tsx` and `route.ts` are routes, the rest are
plain modules.

*Rejected:* duplicating the query in the home page. Two copies of a sort that decides what a
buyer sees first is exactly the drift this phase cannot afford to debug later.

### 2.2 The page — six blocks, in this order

All of it in `page.tsx`. Section pieces stay inline in that file; if one passes roughly forty
lines it moves to a colocated file, not to `src/components/`, because none of this is shared.

1. **Abertura.** A heading about the address and the life there — never an installment figure,
   which is the segment convention `design-handoff.md` §01 exists to break. One paragraph
   stating the order the product insists on: what fits your budget before which apartment. Two
   actions: `WhatsAppAction` with `origem: "na página inicial"`, and a quiet link to
   `/empreendimentos`.

   **No hero image.** The hero is type. A stock render is the habit we are rejecting, the real
   places are carried by the cards below, and no image above the fold makes the §09 weight
   budget trivially true rather than something to measure.

2. **A ordem das perguntas.** Three short steps — *eu consigo?* → *onde?* → *as contas por
   inteiro*. This is a description of how the conversation with her goes, **not** an
   advertisement for a tool. The pré-qualificação is Phase 1 and does not exist; nothing here
   may imply a simulator, a result, or an approval. When Phase 1 lands, this block is where its
   entry point goes.

3. **Onde ela vende.** Up to three cards from `listarEmpreendimentosPublicados({ limit: 3 })`,
   reusing `EmpreendimentoCard` unchanged, with a link to the full list. Same empty state as the
   listing when nothing is published — the home must render on a database with no rows.

4. **O que você vê aqui.** Four factual lines, each one a promise the site already keeps and can
   be checked on the page it names: both installment figures together, total cost visible,
   registro de incorporação and cartório on every listing, and availability asked rather than
   claimed. Written as description, not as a boast, and with no comparison to named competitors.

5. **Quem está do outro lado.** `Signature variant="full"` with one short paragraph. Links to
   `/sobre` **only when `built` is true** in `routes.ts` — the nav's dead link is an accepted
   pre-existing state; body copy will not add a second one. When unit 4 lands, flipping that
   boolean lights this link up with no edit here.

6. **Fechamento.** One last `WhatsAppAction`. No urgency, no deadline, no second ask.

### 2.3 Copy rules this page is most likely to break

Listed because the home is the surface where sales instinct pushes hardest:

- No exclamation marks, no caps, no manufactured urgency, no "últimas unidades".
- No claim of availability, anywhere, in any tense.
- No installment figure in the opening block, and no figure anywhere without its pair.
- No "exclusivo", "seleto", "sofisticado" — §01, and the reason the whole palette exists.
- Nothing that implies she owns the inventory, sets the price, or controls delivery.

### 2.4 Routes

`HOME.built` is already `true` and the sitemap already lists `/`. Nothing to flip.

### 2.5 `/sistema`

**No new shared component, so no new panel.** Every visual element on the page is either an
existing shared component with a panel already (`EmpreendimentoCard`, `WhatsAppAction`,
`Signature`) or home-local prose. If a block turns out to want a shared primitive during the
build, it gets a panel in this task, not later (`CLAUDE.md` §3.1).

## 3. Why

The home is the least valuable screen in the project and the first one anyone sees. Both are
true, and the way to honour both is to make it a table of contents rather than a pitch: it
should get a visitor to the catalogue, to WhatsApp, or to her face, and take as little of their
time and data as possible doing it.

It is also the one page that states the thesis in plain words. Every other surface expresses the
credit-before-apartment order structurally — the ficha leads with the address, `/contato` leads
with WhatsApp — but nowhere does the site say it. Block 2 is the only genuinely new content on
this page, and it is the reason the page is worth building at all rather than redirecting `/` to
`/empreendimentos`.

The cost is small and mostly already paid. The one real change underneath it, §2.1, is a
deduplication the listing page benefits from too.

## 4. Affected files

| File | Change type | Notes |
|---|---|---|
| `src/app/(frontend)/page.tsx` | edit | the placeholder becomes the real home, six blocks per §2.2 |
| `src/app/(frontend)/empreendimentos/query.ts` | new | `listarEmpreendimentosPublicados({ limit })`, moved out of the listing page |
| `src/app/(frontend)/empreendimentos/page.tsx` | edit | loses the query, the grouping and the sort; calls §2.1 |
| `docs/tasks/TASK-fase-0.md` | edit | unit 5 marked built; unit 3's stale "planned" heading corrected |
| `README.md` | edit | status section |
| `CLAUDE.md` | edit | §0 status paragraph |
| `docs/design-handoff.md` | edit | §08 screen 5 marked built, matching how screen 3 is marked |

## 5. Done when

- `/` renders the six blocks, and renders correctly against a database with no published rows.
- The catalogue block shows at most three developments, ordered identically to `/empreendimentos`.
- No installment figure appears in the opening block, and no figure anywhere appears alone.
- The page contains no exclamation mark, no availability claim, and no link to `/sobre` while
  `built` is false.
- The complete signature is visible in a screenshot of the page, top and bottom.
- Above the fold is under 500 KB with no image but the 72px portrait; LCP under 2.0s on 4G.
- `pnpm build` and `pnpm lint` pass, and §4's docs are updated.

## 6. Open and blocking items

| Item | Blocks | Note |
|---|---|---|
| **A real photograph** | block 5 looking like a person rather than a stand-in | Renders with `/adriana-placeholder.jpg` meanwhile, same as `/sistema`. Blocks going live, not building |
| **`/sobre`** | block 5's link | Unit 4. Gated on `routes.ts`, so no edit here when it lands |
| **Real CRECI number** | shipping publicly | `BROKER_CRECI` is `00.000-F` — unchanged by this task, listed because the home is where it is most visible |
| **Her WhatsApp number** | both CTAs being real | `WHATSAPP_NUMBER` is a placeholder |
| **The brand name** | the wordmark in the opening block | `BRAND_NAME` is one edit; a drawn mark is not |

## 7. Explicitly out of scope

The pré-qualificação entry point and anything that looks like one, a simulator, a testimonial
section, a blog or "conteúdo", portal badges, a newsletter, an animated hero, and any statistic
about her sales. Block 2 reserves the place Phase 1's flow will occupy and stops there.

---

## 8. What the build did, and how it was verified

**Status: built, rendered and verified.**

### Verification actually performed

| Check | Result |
|---|---|
| `pnpm lint` | clean |
| `pnpm exec tsc --noEmit` | clean |
| Copy rules (§2.3), by grep | no exclamation marks, no availability claim, no luxury vocabulary, and no currency figure anywhere on the page |
| `pnpm build` | clean, ~9s; `/` prerenders as static (`○`) |
| The page rendered in a browser | read at 390px in headless Chrome; no clipping, `scrollWidth == innerWidth == 390`, zero elements crossing the viewport |
| CRECI signature (§0) | present; the three rendered instances compute to 11px, 13px and 12px — at or above the 11px floor |
| Portrait | `loading="lazy"`, `sizes="72px"`; the browser picks the 256w candidate, not the 3840w `src` fallback |
| Page weight (§09) | 190.6 KB above the fold, cache disabled — inside the 500 KB budget |
| Empty state | exercised by unpublishing the seed development and restoring it; the fallback copy renders and the card disappears |
| Route smoke test | `/`, `/empreendimentos`, `/empreendimentos/[slug]`, `/contato`, `/privacidade`, `/sistema` all 200 |

### Why the build had not run before, and what it was

The local Postgres was unreachable, and the failure mode was misleading: Docker Desktop's port
forwarder still accepted TCP on `localhost:5432`, so the port looked open, but the Postgres
handshake never completed. `next build` inherited that hang and sat for twenty-eight minutes
with no output.

The cause was not Postgres. Docker Desktop's backend processes — `com.docker.backend`,
`com.docker.krun` — were running from `/Volumes/Docker/Docker.app`, a DMG that had since been
unmounted, so they were live processes holding the socket and the port forwarder while their own
resources no longer existed. Nothing could recover them: the socket accepted connections and
never replied, `docker` CLI calls blocked forever, and a graceful quit had nothing left to talk
to. Killing the orphaned processes and relaunching from `/Applications/Docker.app` brought the
daemon straight up; the `prumo-postgres` container restarted with its schema and data intact.

One methodological note worth keeping, because it burned a whole session: the exit status
reported for the killed build belonged to the `tail` in the pipeline, not to `next build`. Any
piped build check here needs `${pipestatus[1]}` (zsh) or it will report success for a command
that never succeeded.

**`/` is now a database-dependent route.** It was the last page in the site that could render
without one. Any environment that builds this repo needs a reachable Postgres, and a stalled
database now stalls the build of the home page rather than only the catálogo. If that becomes a
deployment problem, the fix is a fallback in `listarEmpreendimentosPublicados` that returns an
empty list on a connection error — the home renders its empty state correctly, now confirmed.
That is deliberately not done here: silently swallowing a database failure at build time is a
worse default than a loud one, and the choice belongs with whoever provisions the deployment
database (`TASK-fase-0.md` §6).

### Where the build departed from §2

- **The listing page shrank more than planned.** Moving the query out took `ORDEM_STATUS`,
  `porStatusEEntrega`, both `find` calls and the tipologia grouping with it, so
  `empreendimentos/page.tsx` no longer imports Payload types at all. It went from 96 lines to 45.
- **Cards are keyed by `slug`, not `id`.** `EmpreendimentoResumo` has no `id` — that is the
  point of the view type — and slug is unique.
- **The step block is numbered.** `01 / 02 / 03` in mono, in `--latao`, whose documented role on
  `/sistema` is exactly "números, marcadores". Numbering is usually decoration; here the order
  *is* the product, so the numerals carry the one piece of information the block exists to
  deliver.
- **No new shared component, and `/sistema` is unchanged** — as §2.5 predicted. Every visual
  element is either an existing component with a panel already or home-local prose.

### Left for later

- **The portrait is a 50×50 placeholder** displayed at 72px, so it is upscaled and soft. It is
  the same missing asset that blocks `/sobre` (`TASK-fase-0.md` unit 4): a real photograph of
  her replaces both.
- **The CRECI number is still `00.000-F`** on every surface, as it is everywhere else in the
  repo — `docs/product-definition.md` §10.
- **The catálogo section shows one card**, because the seed publishes one development. The
  three-column grid and the `limit: 3` are exercised by structure, not by content.
