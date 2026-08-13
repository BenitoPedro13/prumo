# TASK — Fix the OG image gap and give the site's real pages their own preview cards

Not a phase unit — a correctness pass, triggered by the user noticing `/simulador` has no OG
image while auditing SEO/metadata/OG images across every route.

---

## 1. Current scenario

Confirmed against Next's own bundled docs (`node_modules/next/dist/docs/.../generate-metadata.md`,
"Overwriting fields") and empirically against the running dev server:

**Every route using `pageMetadata()` (`src/lib/metadata.ts`) has no `og:image` or `twitter:image`
at all** — `/simulador`, `/sobre`, `/contato`, `/privacidade`, `/empreendimentos`. Root cause:
Next merges `metadata` objects **shallowly** across segments, and a duplicate key is **replaced
wholesale**, not deep-merged. `pageMetadata()` always returns its own `openGraph: {url, title,
description}` object, which — because it exists at all — replaces the root layout's `openGraph`
object entirely, image included, rather than layering on top of it.

`/` and `/sistema` only work by accident, for two different reasons: `/` has its own
`opengraph-image.tsx` in the exact same segment as its `page.tsx` (file-convention images
reattach regardless of what the config-based `openGraph` object contains — that mechanism is
independent of the merge/replace rule above), and `/sistema` never sets its own `openGraph` key
at all, so it inherits the root's complete object, image included.
`/empreendimentos/[slug]` also works, same reason as `/`: its own `opengraph-image.tsx` sits in
the `[slug]` segment.

**A second, related bug in the same function:** `pageMetadata()` never sets `twitter.title` /
`twitter.description`, so every route's Twitter/X card shows the generic homepage
title/description regardless of which page was actually shared — even though the `og:title` /
`og:description` tags are correctly page-specific. Not visible without checking Twitter-specific
tags directly, which is presumably why it went unnoticed.

**`/p/[token]`'s `generateMetadata` sets no `openGraph` object at all**, so a shared proposal
link — the one surface `product-definition.md` says is reached from WhatsApp far more than
search, and the one page that is *addressed to a specific person* — previews with generic
"Prumo" branding instead of "Proposta para Juliana," the same personalized title already used
for the `<title>` tag.

Two working OG image files already exist (`(frontend)/opengraph-image.tsx`,
`empreendimentos/[slug]/opengraph-image.tsx`) and duplicate a fair amount of boilerplate between
them — font loading, the OG palette, the signature-proportions call, the hairline/muted colors.

## 2. Planned changes

1. **`src/lib/og-image.tsx`** (new) — extracts the shared parts: `OG_SIZE`, `OG_CONTENT_TYPE`,
   `loadFonts()`, and `renderShareCard({ eyebrow, heading, subtitulo })`, which produces the
   ficha's existing layout (eyebrow, heading, optional subtitle, the CRECI signature block) as
   an `ImageResponse`. The root image keeps its own bespoke plumb-rail-thread layout — that one
   stays hand-written as the single most iconic version, per its own comment ("the surface most
   likely to be seen and most likely to be forgotten") — but pulls `OG_SIZE`/`loadFonts()` from
   the same shared module to drop the duplication.

2. **`empreendimentos/[slug]/opengraph-image.tsx`** — refactored to call `renderShareCard`
   instead of hand-rolling the same JSX; output unchanged except the footer now also carries
   `BROKER_QUALIFICATION` like the root image already does (a small compliance improvement, not
   a behaviour change — the ficha's version was the one missing it).

3. **New `opengraph-image.tsx` per route**, each a few lines calling `renderShareCard` with copy
   drawn from that route's own existing `pageMetadata()` title/description, never invented fresh:
   - `/simulador` — eyebrow "Antes do apartamento" (the product thesis in three words),
     heading "Você consegue comprar?", subtitle "Seis perguntas, cerca de um minuto."
   - `/sobre` — eyebrow "Corretora de imóveis · Rio de Janeiro", heading "Sobre Adriana",
     subtitle drawn from the page's own description.
   - `/contato` — eyebrow "Fale com a Adriana", heading "Contato", subtitle from the page's
     description.
   - `/privacidade` — heading "Privacidade e dados", subtitle from the page's description. Low
     traffic for sharing, but a broken/generic card here is still a bug, not a non-issue.
   - `/empreendimentos` — eyebrow "Cury · Rio de Janeiro" (matching the ficha's own eyebrow
     convention), heading "Empreendimentos", subtitle from the page's description.
   - `/p/[token]` — dynamic, reads the token same as the page itself, heading
     `Proposta para ${saudacao}`. Not gated on `expira_em`: an OG preview a day stale on an
     expired link is a cosmetic gap, not the data-safety concern the page content itself guards
     against, so it isn't worth the added complexity for v1.

4. **`pageMetadata()` gets a matching `twitter: { title, description }`** whenever `title`/
   `description` are given, so Twitter Card previews stop falling back to the generic root copy.
   No `twitter.images` needed — Next automatically reuses `opengraph-image` for Twitter when no
   dedicated `twitter-image` exists, confirmed against the same docs file.

5. **`/p/[token]`'s `generateMetadata`** gets its own `openGraph: { title, description, url }`
   to match the personalized `<title>` it already sets — the image comes from unit 3's own
   `opengraph-image.tsx` in that same segment, so no manual image reference is needed there
   either.

### Not doing in this unit

- **Not touching `/sistema`.** It's noindex and hidden by design; inheriting the root's default
  card by omission is correct, not a bug to fix.
- **Not restructuring `pageMetadata()`'s calling convention** (i.e., not converting every page to
  `generateMetadata` + `parent`). Giving each route its own `opengraph-image.tsx` file sidesteps
  the merge-replace problem entirely and produces a materially better result — a tailored share
  card per page — for comparable effort.

## 3. Why

An OG image is the thing a stranger sees before they ever load the page — the root image's own
comment already says as much. Right now most of the site's real pages (`/simulador` chief among
them, since it's "the surface the project is justified by") share preview as a blank/broken
image on WhatsApp and iMessage, and the one page addressed to a specific person by name
previews as generic branding. Both are silent failures: nothing errors, nothing warns, and they
only surface by actually checking rendered `<head>` output per route, which this task did.

## 4. Affected files

| File | Change type | Notes |
|------|-------------|-------|
| `docs/tasks/TASK-seo-metadata-og.md` | new | this document |
| `src/lib/og-image.tsx` | new | shared OG rendering helper, §2.1 |
| `src/lib/metadata.ts` | edit | `pageMetadata()` also sets `twitter.title`/`description` |
| `src/app/(frontend)/opengraph-image.tsx` | edit | uses shared `OG_SIZE`/`loadFonts()`, keeps its own layout |
| `src/app/(frontend)/empreendimentos/[slug]/opengraph-image.tsx` | edit | refactored onto `renderShareCard` |
| `src/app/(frontend)/simulador/opengraph-image.tsx` | new | §2.3 |
| `src/app/(frontend)/sobre/opengraph-image.tsx` | new | §2.3 |
| `src/app/(frontend)/contato/opengraph-image.tsx` | new | §2.3 |
| `src/app/(frontend)/privacidade/opengraph-image.tsx` | new | §2.3 |
| `src/app/(frontend)/empreendimentos/opengraph-image.tsx` | new | §2.3 |
| `src/app/(frontend)/p/[token]/opengraph-image.tsx` | new | §2.3 |
| `src/app/(frontend)/p/[token]/page.tsx` | edit | `generateMetadata` gets its own `openGraph`, §2.5 |
