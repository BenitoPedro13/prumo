# TASK — Move the scaffold page to a hidden design-system route

> Status: **built.**

## 1. Current scenario

The scaffold left a placeholder at `/` that renders the palette, the rethemed shadcn primitives
and the signature in all three variants. It was written to prove the tokens resolve, and by the
letter of `TASK-scaffold-nextjs.md` it should be replaced by the real home and thrown away.

It is not going to be thrown away. It is the only surface where the design decisions in
`design-handoff.md` are visible side by side, it is what gets shown to Adriana when a choice
needs her opinion, and it is the fastest way to check that a new component inherited the tokens
instead of reinventing them.

But it cannot stay at `/`, because `/` is the home page.

## 2. Planned changes

**`/sistema` becomes the design system.** The scaffold page moves there whole, reframed as a
component library rather than a "the app is up" notice, and gains `robots: noindex, nofollow`.

**Hidden, not protected.** Unlinked from the site and excluded from indexing. There is nothing
confidential on it — it is placeholder copy and public brand decisions — so an auth gate would
cost more than it protects. If it ever carries real client data, that changes.

**`/` becomes a minimal placeholder** carrying only the chrome and the signature, until
`TASK-chrome-e-seo.md` and the home task replace it.

**`ThemeToggle` is no longer scaffold scope.** It is how the three theme states get checked, and
it stays on `/sistema` as a permanent instrument. Its comment is updated to say so.

**A guideline, in `CLAUDE.md` §3.1 and §4.** Adding a shared component without adding its panel
to `/sistema` is an incomplete task, in the same way that leaving `README.md` stale is. This is
the rule that keeps the page from rotting into a screenshot of what the project looked like in
August.

**Alternatives considered and rejected:**

- *Delete it and rebuild a Storybook later.* Rejected: Storybook is a build system, a second dev
  server and a parallel set of stories to keep in sync, for a single-app project with one
  designer and one developer. A route in the app renders the real components with the real
  tokens and costs nothing.
- *Keep it at `/` behind an env flag.* Rejected: the home page is the thing most likely to be
  demoed, and a flag that changes what `/` is would eventually be wrong in production.
- *Put it under `(payload)` with the admin's auth.* Rejected: it would inherit the admin's layout
  and lose the site's tokens, which is the one thing it exists to display.

## 3. Why

The gap this closes is between `design-handoff.md`, which describes the system in prose, and the
screens, which use it. Neither shows the system itself. A palette swatch that is actually
rendered from `--verde` catches a broken token immediately; a table in a markdown file never
does.

It also gives Adriana something to react to that is not a finished page. Asking "does this feel
like it is for you" about a colour and a piece of type is a cheaper question than asking it about
a home page, and it is the question `design-handoff.md` §01 says matters most.

Cost: under an hour. Risk: none — no screen depends on it.

## 4. Affected files

| File | Change type | Notes |
|---|---|---|
| `src/app/(frontend)/sistema/page.tsx` | new | the scaffold page, reframed; `noindex` |
| `src/app/(frontend)/page.tsx` | edit | reduced to a minimal placeholder |
| `src/components/theme-toggle.tsx` | edit | comment: design-system instrument, not scaffold |
| `CLAUDE.md` | edit | §3.1 checklist and §4 convention |
| `README.md` | edit | Layout section names the route |

## 5. Done when

- `/sistema` renders every panel the scaffold page had, and reports `noindex`.
- `/` renders and is not the design system.
- `pnpm build` and lint pass.
- `CLAUDE.md` and `README.md` updated per `CLAUDE.md` §3.

## 6. Explicitly out of scope

Improving the page. Adriana and the build will drive that — new panels arrive with the
components they document, not in a redesign pass.
