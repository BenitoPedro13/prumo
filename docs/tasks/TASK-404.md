# TASK — A branded 404, and the gap it doesn't close

Not a phase unit — a small correctness pass, queued alongside `TASK-seo-metadata-og.md`.

---

## 1. Current scenario

No `not-found.tsx` existed anywhere under `src/app/(frontend)/`. Every `notFound()` call already
in the codebase (`/empreendimentos/[slug]`, `/p/[token]`) fell through to Next's generic built-in
404 — no nav, no signature, no help, nothing on-brand. CLAUDE.md §0's rule that any screenshot of
any screen must contain the complete signature made this an actual gap, not a cosmetic one.

## 2. Planned changes

**`src/app/(frontend)/not-found.tsx`** (new) — composes inside `(frontend)/layout.tsx` like any
page, so the nav and the footer signature are already there. Calm, first-person voice matching
the rest of the site (`tipologia-card.tsx`'s "a planta ainda não está publicada, peça no
WhatsApp" is the reference): explains the link may be stale or mistyped, offers a way back home,
and a `WhatsAppAction` — every dead end on this site turns into a conversation, not just this
one. `robots: { index: false }`, no exclamation marks.

**What this does and doesn't cover, checked empirically against the running dev server:**

- ✅ `notFound()` thrown inside any `(frontend)` route (bad `/p/[token]`, an unpublished
  `/empreendimentos/[slug]`) — the realistic cases an actual visitor hits from a stale or
  mistyped link that was otherwise well-formed.
- ❌ **A genuinely unmatched URL** (`/whatever-typo`) still shows Next's bare default page.
  Per Next's own docs (`node_modules/next/dist/docs/.../file-conventions/not-found.md`), catching
  that requires the new **experimental** `global-not-found.js` convention plus an
  `experimental.globalNotFound` flag in `next.config.ts` — needed specifically because this app
  has **two root layouts** (`(frontend)` and `(payload)`, per CLAUDE.md §4's "Payload's admin
  ships its own root layout"), which is exactly the case the docs name as requiring it.
  `global-not-found.js` bypasses every layout, so it would need to import global styles, fonts
  and the theme attribute itself, duplicating setup that normally lives in `(frontend)/layout.tsx`
  — and it's still labelled experimental in this Next major. That's a real stability tradeoff for
  a low-frequency case (this site has no history of URLs to go stale, so a stranger only lands
  on a garbage path via a typo or a broken external link), so it's left undone here rather than
  opted into silently.

## 3. Why

A 404 is one of the more likely screens a confused or lapsed visitor sees, and CLAUDE.md's
signature rule doesn't carve out an exception for error states. Closing the realistic 90% of the
gap (links that break inside the app) is worth doing now; closing the remaining sliver (garbage
URLs from outside the app) costs an experimental flag and a parallel copy of the page shell for
a case this site is unlikely to hit often — a decision worth surfacing, not making invisibly.

## 4. Affected files

| File | Change type | Notes |
|------|-------------|-------|
| `docs/tasks/TASK-404.md` | new | this document |
| `src/app/(frontend)/not-found.tsx` | new | §2 |
