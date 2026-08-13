# TASK — `/sobre`

Unit 4 of `docs/tasks/TASK-fase-0.md`, and the last one in the phase.

---

## 1. Current scenario

`/sobre` does not exist. The nav links to it and the link 404s on purpose
(`src/lib/routes.ts`, `built: false`); the sitemap already excludes it, and the home page's
link to it is gated on the same boolean, so the route landing lights both up with no edit
elsewhere.

The unit has been blocked since the phase was planned, on one thing: a photograph.
`docs/design-handoff.md` §08 calls the screen "face and story inside the project brand", and
§06 makes the photo **required** on this page specifically. The repo's stand-in is
`public/adriana-placeholder.jpg`, described in `design-handoff.md` as a low-resolution
stand-in embedded in the prototypes.

**The photograph is now unblocked by decision, not by asset:** the placeholder already used in
the signature is approved for use here for now.

Two things about that file decide the layout below, and the first corrects a note in
`TASK-home.md` §8:

- It is **180×179**, not 50×50. The earlier figure in `TASK-home.md` §8 was wrong and is
  corrected in this commit. At the signature's 72px slot on a 2× screen it is not upscaled.
- 180px of source honestly supports about **90px of CSS width** at 2×. A portrait larger than
  that is an upscale, and an upscaled face on the one page whose subject is her face reads as
  carelessness precisely where the page is arguing for care.

**What remains genuinely unresolved is the other half of the screen: the story.** The repo
holds no biographical facts about her. `product-definition.md` mentions her once, in a sentence
about receiving the tabela de vendas, and §10 still lists her CRECI number, her lead sources and
the developments she represents as open. There is nothing to write a career history from.

Writing one anyway is not an option. It is a real person on a public page, and invented
experience is also a COFECI/CRECI advertising exposure, not only a copy problem. So this task
builds everything that is true and leaves the personal history as marked slots.

---

## 2. Planned changes

### 2.1 `src/app/(frontend)/sobre/page.tsx` — new

A static page, no data dependency. Five blocks, in this order:

1. **The lockup and the opening.** `Signature variant="full"` — which already carries photo,
   name, role, qualification and CRECI, and satisfies §06's "photo required on the sobre page"
   without a second portrait treatment. One sentence naming what she is: corretora de imóveis
   autônoma, pessoa física, Rio de Janeiro.

2. **"O que ela faz e o que ela não faz."** The honest boundary, and the block that carries the
   page. She resells Cury launches; she does not own the stock, set the price, or control
   delivery. What she controls is the information that reaches a buyer before the decision.
   This is already asserted verbatim on the home page (`page.tsx`, "Quem está do outro lado")
   and in `product-definition.md` §01–02, so it is a restatement, not a new claim.

3. **"Como ela trabalha."** The order of questions — crédito antes do apartamento — and what a
   buyer gets at each step. Derived from the same source as the home's `PERGUNTAS`, written
   from her side rather than the buyer's so the two pages do not read as copy-paste.

4. **"O que ela não vai fazer."** Explicitly: no availability she cannot guarantee, no credit
   analysis dressed up as orientation, no single installment figure without its INCC pair, no
   pressure. Each of these is a rule the rest of the site already keeps, so the page is
   checkable against the product rather than decorative.

5. **Her story — placeholder.** One short block, `[VERIFICAR: ...]`, holding the questions that
   need her answers rather than invented prose. See §6.

Style follows `/contato`: `max-w-2xl`, `px-6 py-14`, `font-display` h1, `text-ink-muted` body,
existing tokens only.

### 2.2 The portrait

No second portrait element and **no hero image**. `Signature variant="full"` renders the photo
at 72px, inside the source's honest range, and it is the lockup §06 requires.

Considered and rejected: a large portrait at the top of the page, which is what "face and story"
suggests visually. At 180×179 it cannot be done without upscaling. When a real photograph
arrives, the change is `BROKER_PHOTO` plus a portrait block here — recorded in §6 so it is not
rediscovered.

### 2.3 `src/lib/routes.ts` — edit

Flip `/sobre` to `built: true`. That is the whole integration: the sitemap starts listing it and
the home page's gated link to it appears, both without further edits. Verify both.

### 2.4 Metadata

`pageMetadata({ path: "/sobre", title, description })`, matching `/contato`.

### 2.5 `/sistema`

No new shared component — the page composes `Signature` and prose — so no new panel, the same
outcome as `TASK-home.md` §2.5. If the portrait block in §6 ever lands, it is page-local unless
the proposta surface needs it too.

---

## 3. Why

`design-handoff.md` §08 puts this screen fourth of five and says trust is the product. It is the
only page whose subject is the person, and the thesis in `product-definition.md` §01–02 is that
the buyer's experience is 100% of the available differentiation, because every competitor sells
the identical units from the identical Cury PDFs. A page that says plainly what she does not
control is a stronger trust argument than one that claims expertise, and it costs nothing that
has to be verified against Cury.

It also closes Phase 0. Every other unit is done; this is the last 404 in the nav.

The cost is one placeholder block on a public page. That is already the repo's established
position for unresolved facts — `BROKER_CRECI`, `WHATSAPP_NUMBER` and `BROKER_EMAIL` all ship
as marked placeholders today, and the site is not deployed.

---

## 4. Affected files

| File | Change type | Notes |
|---|---|---|
| `src/app/(frontend)/sobre/page.tsx` | new | the five blocks in §2.1 |
| `src/lib/routes.ts` | edit | `/sobre` → `built: true`; lights up sitemap and the home's gated link |
| `docs/tasks/TASK-home.md` | edit | correct the 50×50 portrait figure in §8 to 180×179 |
| `docs/tasks/TASK-fase-0.md` | edit | unit 4 status; the phase closes |
| `README.md`, `CLAUDE.md` | edit | status per `CLAUDE.md` §3 |
| `docs/design-handoff.md` | edit | §08 item 4 marked built |

Not touched: `src/components/`, `/sistema`, `payload.config.ts`, any collection.

---

## 5. Done when

- `/sobre` renders, `pnpm lint` and `pnpm exec tsc --noEmit` clean, `pnpm build` clean.
- The nav link no longer 404s; `/sitemap.xml` lists `/sobre`; the home's "Sobre Adriana" link
  appears without any edit to `page.tsx`.
- The complete signature is on the page (§0 test), CRECI at or above the 11px floor.
- Read at 390px with no overflow; weight inside the §09 budget — trivially, since the page adds
  no image the site does not already load.
- Copy rules: no exclamation marks, no fabricated urgency, no luxury vocabulary, no availability
  claim, no invented biography.

---

## 6. Open and blocking items

- **Her story is unwritten and cannot be guessed.** What the block needs from her: how long she
  has been a corretora, what she did before, why MCMV and why the Rio launches, and one sentence
  in her own words about what she wants a buyer to feel. Four questions, one conversation.
  `[VERIFICAR: história profissional — confirmar com Adriana antes de publicar]`
- **The photograph is a stand-in.** 180×179 caps the portrait at ~90px. A real photograph is
  still, per `design-handoff.md`, the cheapest high-return item in the project; when it lands,
  swap `BROKER_PHOTO` and add the portrait block §2.2 rejected.
- **`BROKER_CRECI` is still `00.000-F`**, as everywhere else. Must not reach production.

---

## 7. Explicitly out of scope

- Any redesign of `Signature`.
- A photo shoot, image pipeline work, or an `/sobre` OG image — the site-wide OG image already
  carries the signature.
- Depoimentos or client testimonials. None exist, and inventing them is the same failure as
  inventing the biography, with more legal weight.

---

## 8. What the build did, and how it was verified

**Status: built, rendered and verified. Phase 0 closes with this.**

| Check | Result |
|---|---|
| `pnpm lint` / `pnpm exec tsc --noEmit` | clean |
| `pnpm build` | clean; `/sobre` prerenders as static (`○`) |
| Route smoke test | `/`, `/empreendimentos`, `[slug]`, `/sobre`, `/contato`, `/privacidade`, `/sistema`, `/sitemap.xml`, `/robots.txt` all 200 |
| `built: true` payoff | `/sitemap.xml` now lists `/sobre`, and the home's gated link appears — both with no edit beyond the boolean, as designed |
| 390px render | no clipping; `scrollWidth == innerWidth == 390`, zero elements crossing the viewport |
| Signature (§0, §06) | present with photo; CRECI instances at 11px, 13px and 12px — at or above the floor |
| Theme | verified in both states; under `prefers-color-scheme: light` the tokens flip to paper `rgb(232 233 227)` on ink `rgb(34 37 31)` |
| Page weight (§09) | 198 KB, cache disabled — inside the 500 KB budget |
| Copy rules (§2.3) | no exclamation marks, no luxury vocabulary, no invented biography. The one match for "disponível" is the heading of the block saying she will not claim it |

### Where the build departed from §2

- **Nothing structural.** Five blocks as planned, no new shared component, `/sistema` unchanged.
- **No `WhatsAppAction` on the page.** §2.1 did not list one and it was not added: the header
  and footer both carry the action on every page, and `/contato` exists one nav item away.
  Worth revisiting once her story replaces the placeholder, since that is the version of this
  page a buyer would actually finish reading.

### One observation for the next design pass

The `full` signature's wordmark computes to 32px against an `h1` at 30px, so directly beneath
the page title the brand name is marginally the largest thing on screen. That is the existing
component behaving as specified in §06 — the proportions are derived from the wordmark — and
redesigning `Signature` was explicitly out of scope (§7). Flagged rather than changed.

### Still open

- **Her story.** The four questions in §6 are unanswered; the placeholder block ships with a
  `[VERIFICAR:]` marker and must not reach production.
- **`BROKER_CRECI` is still `00.000-F`**, and remains the one legally load-bearing placeholder.
- **The photograph is still the 180×179 stand-in.** A real one unlocks the portrait treatment
  §2.2 rejected.
