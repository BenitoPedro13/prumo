# TASK — Site chrome and the metadata envelope

> Status: **built.** `pnpm build` and `pnpm lint` pass. §7 records where the build departed
> from this plan.
>
> Unit 1 of five in `TASK-fase-0.md`. Depends on nothing and needs no database.

## 1. Current scenario

Every page invents its own header and footer. `/` and `/sistema` each hand-assemble a `<header>`
with `<Signature variant="header" />` and a `<footer>` with `<Signature variant="footer" />`,
copied between the two files. `(frontend)/layout.tsx` renders `{children}` and nothing else.

That is precisely the failure mode `CLAUDE.md` §0 warns about: a signature re-implemented per
screen is how the screenshot test starts failing. Two pages in, it is already duplicated.

There is also no envelope around the site:

- No navigation. Nothing links to anything.
- No `icon.tsx`, so the browser tab is blank.
- No `opengraph-image.tsx`. A link shared to WhatsApp — which is how this site is actually
  reached — renders as a bare URL, with no signature on it.
- No `robots.ts`. `/admin`, `/api` and `/sistema` are all indexable, and `/p/[token]` will be the
  moment it exists.
- No `sitemap.ts`, no canonical URLs.
- No `wa.me` link builder, so the CTA that the whole product funnels into cannot be written.

## 2. Planned changes

### The chrome moves into the layout

`site-nav` and `site-footer` are rendered by `(frontend)/layout.tsx`, not by pages. A page cannot
then forget the signature, because a page no longer decides. `/` and `/sistema` lose their
hand-rolled headers and footers and become content only.

**`src/components/site-nav.tsx`** — `<Signature variant="header" />` on the left, links to
Empreendimentos, Sobre and Contato, and the WhatsApp action.

No menu component and no JavaScript. Three links plus an action wrap onto a second row at narrow
widths and that is the entire mobile treatment. A drawer would be a dependency, a hydration cost
and a focus trap to get right, for four items.

**`src/components/site-footer.tsx`** — `<Signature variant="footer" />`, the same links, and the
legal block that Phase 0 needs on every page:

- The incorporação notice, and where the per-development registro and cartório are found.
- "Valores e disponibilidade sujeitos a confirmação", in the voice of §05 — a statement of how
  it works, not a disclaimer hedge.
- A privacy link, pointing at a route that unit 3 creates. Until then the item is absent rather
  than a dead link.

### The envelope

**`src/app/(frontend)/icon.tsx`** — generated at build time, no binary in the repo.
**Deliberately provisional**: a plumb glyph presumes the name is Prumo, and it is not decided.
Ships as a plain verde field with the wordmark's first letter, replaced when the name lands. Noted
here so the next session does not mistake a placeholder for a decision.

**`src/app/(frontend)/opengraph-image.tsx`** — the surface most likely to be seen and most likely
to be forgotten. Carries the complete signature: her name, "Corretora de Imóveis", and the CRECI,
at the §06 proportions.

One technical wrinkle worth stating up front: **the OG image needs a real font file.**
`design-handoff.md` §04 specifies system stacks and no webfonts, but Satori renders on the server
where system fonts do not exist, so a font must be fetched and embedded at generation time. This
does **not** violate the weight budget in §09 — the file never reaches the browser; it is baked
into a PNG. Pick a slab that stands in for Superclarendon and record the choice in the handoff.

**`src/app/(frontend)/robots.ts`** — disallow `/admin`, `/api`, `/sistema` and `/p/`. The last one
matters most and is the least obvious: `/p/[token]` does not exist until Phase 1, but a proposal
link carries a buyer's figures and must never be indexed on the day it first ships. It is cheaper
to write the rule now than to remember it later.

**`src/app/(frontend)/sitemap.ts`** — static routes only for now. Unit 2 extends it with
empreendimentos once there is a database behind them.

**Metadata** in `(frontend)/layout.tsx` gains `alternates.canonical` and the OpenGraph and
Twitter blocks. `SITE_URL` already backs `metadataBase`.

### The link builder

**`src/lib/whatsapp.ts`** — one function producing a `wa.me` deep link with pre-filled context:
which page she is being written from, and which development or typology if there is one. Per
`product-definition.md` §05 this is deliberately not the Business API; at her volume the
per-message cost buys nothing.

The pre-filled text is written in the buyer's voice, not hers, because the buyer is the one who
sends it. It states where they came from so she opens the conversation already knowing.

### `/sistema` gains its panels

Per `CLAUDE.md` §4, in this task and not a later one: the nav, the footer and the WhatsApp action
in their real states.

**Alternatives considered and rejected:**

- *Keeping the chrome in pages, composed from a shared component.* Rejected: it keeps the
  decision with the page, which is the thing that fails. The layout removes the choice.
- *A mobile drawer menu.* Rejected: JavaScript, a focus trap and a dependency, for four links, on
  a page-weight budget that exists for ethical reasons.
- *A static OG image checked into `public/`.* Rejected: it goes stale the moment the CRECI number
  or the brand name changes, and both are still open. Generating it means the signature has one
  source.
- *Shipping the real plumb glyph as the icon now.* Rejected: it presumes a name that has not been
  chosen. A provisional mark that is labelled provisional costs nothing to replace.

## 3. Why

Two duplicated headers is not yet a problem; five pages of duplicated headers is exactly how the
one rule this repo cannot break gets broken. Moving the chrome into the layout now, while the
duplication is small, converts "remember the signature" from a discipline into a structural
guarantee.

The OG image is the other half. `product-definition.md` §08 says the traffic already exists and
arrives through WhatsApp, referrals and Instagram — which means the shared link *is* the front
door, more than the home page is. It is also advertising in the CRECI sense, so the signature on
it is a legal requirement rather than a nicety.

Cost: roughly a day, most of it the OG image and the font decision. Risk: low. Nothing here
commits to page structure, and every later unit inherits it.

## 4. Affected files

| File | Change type | Notes |
|---|---|---|
| `src/app/(frontend)/layout.tsx` | edit | renders nav and footer; OG and Twitter metadata |
| `src/components/site-nav.tsx` | new | signature, links, WhatsApp action; no JS |
| `src/components/site-footer.tsx` | new | signature, links, incorporação and pricing notices |
| `src/components/whatsapp-action.tsx` | new | the one action, at a 44px touch target |
| `src/app/(frontend)/icon.tsx` | new | provisional, blocked on the brand name |
| `src/app/(frontend)/opengraph-image.tsx` | new | complete signature at §06 proportions; plumb rail; embeds fonts |
| `src/app/robots.ts` | new | app root, not the route group — see §7. Disallows `/admin`, `/api`, `/sistema`, `/p/` |
| `src/app/(frontend)/sitemap.ts` | new | built routes only; unit 2 adds empreendimentos |
| `src/lib/routes.ts` | new | the public routes, shared by nav, footer and sitemap |
| `src/lib/whatsapp.ts` | new | `wa.me` builder with pre-filled context |
| `src/lib/metadata.ts` | new | `pageMetadata()` — per-page canonical and OG url |
| `src/lib/signature.ts` | new | the §06 proportions, extracted from the component |
| `src/lib/og-palette.ts` | new | the light palette in hex, for Satori |
| `src/components/signature.tsx` | edit | renders only; the rules moved to `src/lib/signature.ts` |
| `src/assets/fonts/` | new | three TTFs and the Apache licence, for the OG image only |
| `src/app/(frontend)/page.tsx` | edit | drops its hand-rolled chrome; gains the WhatsApp action |
| `src/app/(frontend)/sistema/page.tsx` | edit | drops its chrome; gains nav, footer, action and theme panels |
| `src/lib/site-config.ts` | edit | `SITE_DESCRIPTION` |
| `docs/design-handoff.md` | edit | §04 records the OG fonts; §06 records the OG lockup and the layout rule |
| `README.md`, `CLAUDE.md` | edit | per `CLAUDE.md` §3 |

## 5. Done when

- Every route renders the nav and footer without asking for them, and no page file contains a
  `<Signature>` in a header or footer role.
- The OG image renders at 1200×630 with the complete signature, and the CRECI clears the 11px
  floor at that scale.
- `robots.ts` disallows `/admin`, `/api`, `/sistema` and `/p/`; `/sistema` also reports `noindex`
  from its own metadata.
- `sitemap.ts` lists the public static routes with correct absolute URLs.
- The WhatsApp action opens a chat with context pre-filled, from every page.
- No exclamation marks anywhere in the new copy. No claim of availability.
- `/sistema` shows the nav, the footer and the WhatsApp action.
- `pnpm build` and lint pass.
- Docs updated per `CLAUDE.md` §3.

## 6. Explicitly out of scope

The pages the nav links to — `/empreendimentos`, `/sobre`, `/contato` are units 2 to 4 and the
links point at routes that will 404 until then. That is intentional and better than building
stubs that have to be thrown away.

Also out: the privacy policy page (unit 3), any analytics, and the real icon.

---

## 7. What changed while building

Six departures from the plan above, all recorded here rather than silently absorbed.

**Canonical URLs moved out of the layout.** The plan put `alternates.canonical` in
`(frontend)/layout.tsx`. Metadata is inherited, so that would have had every page in the site
declare itself the home page — an SEO error worse than having no canonical at all. Instead
`src/lib/metadata.ts` exports `pageMetadata({ path, title, description })`, which returns the
canonical and the OG url together, and pages call it. Everything else in the envelope stayed in
the layout, where it should be.

**`robots.ts` lives at `src/app/robots.ts`, not in the route group.** Next matches `robots` and
`manifest` with a regex anchored at the app root; inside `(frontend)` the file is silently not a
metadata route and `/robots.txt` returns 404 with no warning at build time. `sitemap`, `icon` and
`opengraph-image` are matched unanchored, which is why they sit with the rest of the frontend.
This is an exception to `CLAUDE.md` §4, and both that file and the README now say so — it is a
route handler rather than a layout, so Payload's admin is untouched.

**A route registry appeared: `src/lib/routes.ts`.** The nav, the footer and the sitemap all need
the same list, and the sitemap needs a subset of it — a sitemap that advertises the 404s the nav
deliberately links to is a real error. Each route carries a `built` flag; the nav renders all of
them, the sitemap renders the built ones, and units 2 to 4 each flip one boolean.

**The §06 proportions moved to `src/lib/signature.ts`.** The OG image has to compute the same
lockup at its own scale, and it renders through Satori with no DOM and no stylesheet, so it
cannot import a React component that reaches for `next/image`. The rules — the two ratios and the
11px floor — now sit in a file both surfaces call, and the component is only the rendering.

**The OG fonts: Roboto Slab, Roboto and Roboto Mono, checked in at `src/assets/fonts/`.** Chosen
because they are already the open members of the stacks in `design-handoff.md` §04, so the shared
preview is set in a face the page itself may fall back to rather than in something invented for
the server. Apache 2.0, licence included, roughly 280 KB that never reaches a browser. §04 of the
handoff now records the exception.

**The plumb rail is drawn on the OG image, as an SVG.** The plan did not call for it. It is the
identity's mechanism (§07) in its static form, and it earns its place by doing something: the
thread runs the full height of the piece and the bob comes to rest level with her name, so the
instrument settles on the signature. Assembling it from boxes was tried first and abandoned — a
bob tapers to a point, and a point is not a shape a `div` makes.

Two smaller notes. The WhatsApp action became its own component rather than an inline `Button`,
because every later screen needs it with different context, and it is sized to a 44px touch
target rather than the shadcn default of 32 — this audience is on a phone, often outdoors. And
`/sistema` gained four panels rather than three: nav, footer, the WhatsApp action in both its
states, and the theme toggle, which had been living in that page's hand-rolled header and needed
somewhere to go.

## 8. Still blocked

Unchanged by this unit, and both belong to `product-definition.md` §10:

- `BROKER_CRECI` is still `00.000-F`, and it is now baked into the OG image as well as the pages.
- `WHATSAPP_NUMBER` is a placeholder, so every `wa.me` link on the site currently opens a
  conversation with a number that does not exist.
- `NEXT_PUBLIC_SITE_URL` is unset locally, so `robots.txt` and `sitemap.xml` currently emit
  `http://localhost:3000`. It must be set in the deployment environment before anything ships.
