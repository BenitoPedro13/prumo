# TASK — the plumb apparatus

The first piece of Phase 1's design, and the one place `design-handoff.md` §07 says boldness is
spent. Tokens and the component only: no flow, no screen.

---

## 1. Current scenario

Nothing of the apparatus exists. `src/components/` has the twelve Phase 0 components and no
`plumb-rail.tsx`; `/simulador` and `/p/[token]` are not routes; `prequalificacao/` and
`proposta/` are not directories.

That is not drift. §07 puts the apparatus in exactly two screens — the pre-qualification and the
proposal — and neither is built, so everything distinctive about the identity is still ahead of
us. Phase 0 built the half that was meant to stay quiet.

### The prototype is a working implementation, not a sketch

`docs/design/prototypes/pre-qualificacao.html` already contains the mechanism, and it is worth
copying rather than re-deriving:

| Piece | How the prototype does it |
|---|---|
| Structure | `.rig` > `.thread` + `.bob`, on a `.rail` of `var(--verde-deep)`, `overflow: hidden` |
| Drop | `--h` drives `.thread { height }` and `.bob { top }`, both `780ms var(--drop)` |
| Overshoot | `--drop: cubic-bezier(0.34, 1.32, 0.5, 1)` — the `1.32` is the overshoot §07 asks for |
| General easing | `--ease: cubic-bezier(0.16, 1, 0.3, 1)`, as §07 specifies |
| Swing | `.bob.swing { animation: swing 1500ms var(--ease) }`, keyframes damping `0 → 5.5 → −3.4 → 2 → −1 → 0.4 → 0` degrees |
| Pivot | `.bob { transform-origin: 50% −400% }` — the pendulum hangs from far above the bob, so rotation reads as a swing from the rail's top rather than a spin |
| Aligned | thread `rgba(245,246,241,0.92)`, bob `var(--verde-ink)` |
| Crooked | thread and bob both `rotate(9deg)`, thread `rgba(201,164,100,0.7)`, bob `var(--latao)` — brass, per §07 |
| Reduced motion | `.thread, .bob { transition: none }` and `.bob.swing { animation: none }` |
| Rail cap | vertical mono type, 8px, `letter-spacing: 0.14em`, `writing-mode: vertical-rl`, at 34% opacity |

### Two things that block a faithful copy

**Five tokens are missing.** Everything we shipped matches the prototypes exactly — `ink`
`#22251f`/`#e7e9e2`, `latao` `#9c7b3f`/`#c9a464`, `paper`, `rule`, `sheet`, in both themes — but
`globals.css` never defined `--ink-faint`, `--latao-soft`, `--rule-soft`, `--verde-soft` or
`--verde-ink`. The apparatus needs `--verde-ink` for the aligned bob, and the rest are the soft
tones the deep-green ground needs around it.

**The apparatus is a pun on the name.** A *prumo* is a plumb bob: the mechanism and the codename
are the same idea, which is why §07 works as well as it does. The prototype bakes the name in
three places — the rail cap reads `PRUMO`, and the verdicts are **"No prumo"** and **"Ainda fora
do prumo"**. The name is unresolved and both domains are taken (`design-handoff.md` §02).

This task takes a deliberate position on that, in §2.4.

---

## 2. What was built

The plan below is the record after the fact. Three parts of it changed while the work was in
front of a browser, and each change is marked **[changed]** with the reason.

### 2.1 `src/app/globals.css` — done

Six tokens, not five, in all three theme states, following the existing discipline: defined on
bare `:root`, redefined under `@media (prefers-color-scheme: dark)` guarded as
`:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]`.

| Token | Light | Dark |
|---|---|---|
| `--ink-faint` | `#878d82` | `#767c71` |
| `--latao-soft` | `#efe8d8` | `#2a2417` |
| `--rule-soft` | `#dee0d8` | `#262b25` |
| `--verde-soft` | `#dde5de` | `#1b2921` |
| `--verde-ink` | `#f5f6f1` | `#eef3ef` |
| `--latao-ink` | `#c9a464` | `#c9a464` |

**[changed]** `--ink-faint` is the reverse of what this document first listed: the light value is
the *lighter* grey. The table here was transcribed with the two swapped; the prototype has it
right, and the prototype is the authority (§1).

**[changed]** `--latao-ink` was not in the plan. The rail's ground is `--verde-deep`, which is
dark in **both** themes, so what sits on it must not flip — that is exactly why `--verde-ink`
exists. Brass needed the same treatment: the light palette's `--latao` is a dark bronze that all
but disappears against the green. `--latao-ink` is the bright brass in every theme, and it is
defined once because it has nothing to flip to.

`--ease-drop: cubic-bezier(0.34, 1.32, 0.5, 1)` joins the existing `--ease-prumo`, which already
held §07's `cubic-bezier(0.16, 1, 0.3, 1)` — the plan's `--ease-plumb` would have been a second
name for a token that was already there.

**[changed]** No `swing` keyframes. See §2.2.

### 2.2 `src/components/plumb-rail.tsx` — done, and not as planned

The plan was a CSS keyframe swing on a rotating rig. What shipped is a simulation, in three
steps, each forced by watching the previous one fail:

1. **The keyframe swing was wrong about pendulums.** A fixed 1500ms keyframe cannot slow down as
   the line lengthens, and the line lengthening is the one thing the flow does. It also rotated
   the bob alone about a phantom pivot 400% above itself, so the bob pivoted in mid-air while
   its own line stayed rigid.
2. **A rotating rod was wrong about slack.** Rotation cannot express a line that is not straight,
   so it could not be lifted, gathered in, or dropped.
3. **What shipped is a rope**: `KNOTS` points, Verlet-integrated, held by distance constraints,
   pinned at the anchor, weighted at the bob (`HEAVY`), solved `PASSES` times a step at a fixed
   120Hz. Every behaviour falls out of it rather than being authored: the period growing with
   length, a wave travelling down the line, slack bellying out, a rope that will not stretch.

The interaction is the same integrator. `take` pins the bob to the hand and keeps the grab
offset, so it does not snatch to the finger; `brush` pushes the nearest knot by the pointer's own
sideways speed; letting go simply unpins, and Verlet already knows how fast the hand was moving.

`aria` is progress only — `role="progressbar"` with the notch — because the verdict is the
screen's to announce, not the rail's. Under `prefers-reduced-motion` nothing is ever integrated:
CSS places the bob and the rope never wakes.

**Props as planned**, plus `label` for the progressbar's accessible name.

### 2.3 `/sistema` — done

A panel with the three states side by side and a rail with a control, colocated at
`src/app/(frontend)/sistema/plumb-rail-demo.tsx`. **[changed]** the demo lives beside the route
rather than in `src/components/`: it is page furniture, not a shared component, and Next
colocation is the idiomatic home for it.

### 2.4 The name, and what this task does about it

Unchanged and still the position: the component takes `BRAND_NAME` for the rail cap, and the
verdict copy — "No prumo", "Ainda fora do prumo" — stays in the screen, because that is the half
a rename actually breaks.

### 2.5 The crooked state — **[changed]**, and it is a design decision

The plan copied the prototype: thread and bob rotated 9°. Built, **nothing about the plumb ever
leans.** Gravity holding the line vertical is the whole reason the instrument works, so a crooked
plumb is a drawing of something that cannot exist — on the one screen whose entire claim is that
it tells the truth. Measured, the tilted thread also left the 36px rail and was clipped.

What leans is the **mark**: the face of the wall being measured, drawn corner to corner in a
stretched viewBox so the lean stays a share of the rail's width at any height. Aligned, the line
covers the mark exactly; out of true, the gap between them opens on the way down, which is how a
plumb is actually read. An earlier attempt offset the whole plumb sideways instead — rejected,
because two parallel lines say nothing: a plumb hung somewhere else is not a measurement.

`docs/design-handoff.md` §07 is updated to match, per CLAUDE.md §3.1.

---

## 3. Why

§07 calls the plumb line "the page's mechanism", not a logo applied to a page, and it is the
whole reason the identity is more than a colour palette. It is also the piece the
pre-qualification cannot be built without: the rail is the flow's progress indicator, its result
state, and — in the proposal — the payment timeline.

Doing it as its own unit separated a motion problem from a product-logic problem. The six-step
flow's remaining risk is the arithmetic behind its result, which is blocked on Caixa
(`docs/pending-verifications.md` §3). This unit was blocked on nothing.

It is also the only interactive thing on the site, which is why it earns a simulation. No
animation library: a general physics engine is some ninety kilobytes to do this worse than the
rope, and §09's weight budget is an ethical constraint, not a preference.

---

## 4. Affected files

| File | Change type | Notes |
|------|-------------|-------|
| `src/app/globals.css` | edit | six tokens in three theme states; `--ease-drop`; no keyframes |
| `src/components/plumb-rail.tsx` | new | the apparatus; rope simulation; client component |
| `src/app/(frontend)/sistema/plumb-rail-demo.tsx` | new | the panel's control, colocated |
| `src/app/(frontend)/sistema/page.tsx` | edit | panel with the three states |
| `docs/design-handoff.md` | edit | §07 rewritten: what leans, and simulation over keyframes |
| `CLAUDE.md`, `README.md` | edit | status |

Not touched: any route, any collection, `signature.tsx`, the catalogue.

---

## 5. Verified

`pnpm lint`, `pnpm exec tsc --noEmit` and `pnpm build` clean. The rest was measured in a headless
Chrome over CDP — computed style and emulated media, not eyeballing:

- **Tokens.** All six resolve correctly in all three theme states, plus explicit-light-over-dark
  and explicit-dark-over-light.
- **The rope does not stretch.** Dragged 400px outside the rail, the bob stops 74.1px from the
  anchor on a 84.6px rope.
- **Slack renders.** Lifted to 9.4px from the anchor, the line hangs 5.7px below the bob.
- **Release settles.** Thrown from outside the rail, it returns to the notch exactly and hands
  the layout back to CSS (inline `translate`/`rotate` cleared).
- **The period follows the length**, measured on the earlier pendulum build: half-period 420ms on
  a 66px line against 720ms on 176px — √L, within the sampling error.
- **Reduced motion.** The bob moves to the correct notch with no simulation, no transform and no
  running animation.
- **390px.** Rail 36px, the leaning face ends 9.4px inside the rail, the cap sits 12px off the
  floor and centred, `scrollWidth` 390 against a 390 viewport.
- **No console errors** under ten notch changes, a long drag and forty brush events.

Two bugs found by measuring rather than looking, both worth remembering:

- **React Compiler deletes `void el.offsetWidth`.** The classic reflow-to-restart-an-animation
  trick reads as dead code and is dropped, so the class came off and went back on in one frame
  and nothing restarted. Only visible in the compiled chunk. Moot now the swing is integrated,
  but it will bite the next person who reaches for that idiom.
- **`inset-x-*` and `mx-auto` are logical properties.** They compile to `inset-inline` and
  `margin-inline`, and the inline axis of a `writing-mode: vertical-rl` box runs top to bottom —
  so the rail cap was pinned to the rail's full height and auto-centred vertically, 164px from
  where it belonged. Physical `left-0 right-0 ml-auto mr-auto` fixes it.

---

## 6. Open and blocking items

- **The brand name** (`design-handoff.md` §02, `docs/pending-verifications.md` §1). Not blocking
  this unit, by the argument in §2.4, but blocking the verdict copy that lands with the flow.
- **The proposal's timeline variant.** §07 says the same line becomes the payment timeline with
  milestones hanging off it and the bob at *chaves na mão*. Reachable from here — the rope is
  already a list of points down the rail — and deliberately not built.
- **Tuning against a real screen.** The constants were tuned against a 416px panel rail. The
  pre-qualification's rail is full-height, where the line is longer and slower; expect to revisit
  `PAY_OUT`, `KICK_FLOOR` and `SWAY` once a real screen exists.

---

## 7. Explicitly out of scope

- The six-step flow, its questions, its state and its result copy.
- The proposal timeline, `Proposta`, tokenised links, `/p/[token]`.
- Any MCMV arithmetic — done, in `src/lib/mcmv.ts`.
