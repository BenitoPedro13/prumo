# Prumo — Design Handoff

> Identity, tokens, typography, voice, the signature spec, and the screen inventory. The source
> of truth for **how it looks and sounds**. For what to build and why see
> `product-definition.md`. For how to work see `../CLAUDE.md`.

---

## 01. The thesis — dignity, not luxury

The brief was "a high-end experience for a ticket that is not high-end." That is the right
instruction, and it contains a trap worth naming.

**Luxury signals repel this buyer.** Marble, gold, thin display serifs, a couple with wine
glasses on a balcony, "exclusivo", "seleto" — a family earning R$ 5 mil reads all of it as *not
for me* and closes the tab. Copying high-end language does not elevate the economic segment; it
embarrasses it.

What actually transfers from high-end work is not opulence but **respect**: space, calm, absence
of shouting, complete information with no fine print, and the assumption that the reader is
intelligent. High-end *treatment*, not high-end *appearance*.

| The segment's convention | This direction |
|---|---|
| Saturated yellow and green, caps, exclamation marks | Warm neutrals, one accent, generous type |
| Opens with the installment: "A PARTIR DE R$ 599!" | Opens with the address and the life there |
| Manufactured urgency, "últimas unidades" | Real deadlines, including the uncomfortable ones |
| Renders only, address hidden | Delivered buildings and real residents alongside renders |
| Total cost in fine print or absent | Total cost visible, INCC explained |
| Long form before any answer | Answer first, data afterwards |

**The Blessed Moon language does not transfer.** Black grounds, ASCII, WebGL, sharp corners
speak to founders and CTOs and would read as hostile here. What transfers are the principles —
clarity, restraint, honest hierarchy — not the tokens.

---

## 02. Name

**"Prumo" is the working codename, not a confirmed brand.** `prumo.com.br` and `prumo.co` are
both taken. Adriana has not chosen. Do not hardcode it — `BRAND_NAME` lives in
`src/lib/site-config.ts`.

A *prumo* is a plumb line: a weighted string that finds true vertical. The oldest and simplest
tool on a building site, and one that does not calculate or opine — it reveals what is straight
and what is crooked. *"Estar no prumo"* already means "correct and in order" in everyday
Portuguese, so the name carries the promise without stating it.

Why it led the field: it is **trade vocabulary, not elite vocabulary** — every bricklayer knows
the word, which signals belonging to the buyer's world rather than distance from it. It contains
none of *imóveis / casa / lar / chave*, the four words that make every broker interchangeable. It
survives a change of developer. And it draws itself — a thread and a weight, legible at 16px.

### Alternatives, with the argument against each

| Name | Territory | For | Against |
|---|---|---|---|
| **Prumo** | Precision | Honesty as an instrument, not a slogan | Needs one sentence of explanation for part of the audience |
| **Chão** | Security | "Ter um chão" is exactly what they are buying; no comprehension barrier | Perhaps too humble for a R$ 300k decision; hard to protect at INPI |
| **Soleira** | Threshold | The doorstep you cross to enter; precise and beautiful | More literary; the feminine singular reads delicate in a sector where she must assert authority |
| **Raiz** | Permanence | Double meaning — putting down roots, and the slang for authentic | The slang dates, and it has been used by many brands |
| **Boa Praça** | Trust | A trustworthy person *and* the neighbourhood square; disarming | Too informal for the one subject where the buyer wants none — money and contracts |

Before final artwork: check Registro.br, the Instagram handle, and an INPI search in the
real-estate services class.

---

## 03. Color

Avoiding both extremes: the saturated yellow-green of MCMV convention, and the black-and-gold of
high-end, which says "not for you."

Deep forest green is calm, institutional and serious without being cold — and quietly carries
"approved, go ahead," the central emotion of the pre-qualification. Brass appears rarely: numbers,
markers, emphasis. Neutrals are plaster and lime, warm, so the page feels like a place rather
than a form.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--verde` | `#2e4a3c` | `#82b598` | Single accent — actions, links, mark |
| `--verde-deep` | `#22392e` | `#0f1a15` | The plumb rail ground |
| `--latao` | `#9c7b3f` | `#c9a464` | Rare — numbers, markers, emphasis |
| `--paper` | `#e8e9e3` | `#131613` | Page ground (cool, faint green cast) |
| `--sheet` | `#f5f6f1` | `#1c201b` | Cards, fields, surfaces |
| `--ink` | `#22251f` | `#e7e9e2` | Text — warm near-black, never `#000` |
| `--ink-muted` | `#5b6157` | `#a3a99d` | Secondary text |
| `--rule` | `#cdd0c6` | `#333930` | Rules, borders, separators |

### State colors

The pre-qualification needs "proceed" and "not yet", and **neither may be red**. "Not yet" is
useful guidance, not a rejection — it renders in brass. Red is reserved for system errors.

---

## 04. Typography

**Display — slab serif.** `Superclarendon, Rockwell, "Roboto Slab", "Bitstream Charter", Georgia,
serif`. Slabs are the letterform of signage, stamps, and things that are *built*. Sturdy and
unpretentious: well-made without being expensive, which is the thesis.

**Body — geometric humanist.** `"Avenir Next", Avenir, "Segoe UI", Roboto, system-ui,
-apple-system, sans-serif`.

**Utility — mono.** `ui-monospace, "SF Mono", Menlo, Consolas, monospace`. Numbers, labels, legal
data, CRECI, areas, prices.

No webfonts. These are system stacks — the page carries no font download, which serves the weight
budget. Body is set **deliberately larger than default**: 17px base, never below 15px for
anything the buyer must read. This audience reads on mid-range Android, often in sunlight,
sometimes on a cracked screen. Large type is accessibility and respect in equal measure.

---

## 05. Voice

Measured, clear, adult. Technical when needed, always human.

- **No exclamation marks anywhere.** A rule, not a suggestion.
- **No caps in sentences. No manufactured urgency.**
- **Portuguese that neither patronises nor conceals.** "Entrada", not "sinal mais
  intermediárias". Explain INCC in one sentence a person can repeat to their spouse.
- **Name the discomfort.** The 180-day delay tolerance, the second credit check at handover, the
  fact that her own numbers expire. *"Não é tática de pressa, é como funciona."*
- **Recommend against your own interest when it is true.** In the proposal she recommends one
  option and names what the cheaper one costs you.
- **Remove pressure at the close.** *"A proposta fica de pé até 11 de setembro e eu não vou ficar
  cobrando resposta."*

---

## 06. The signature

The legal requirement is the identity's central asset. Because she is PF, the project name is
only permitted as a pseudonym when her real name appears clearly and prominently alongside it
(`product-definition.md` §06). Rather than treating that as a tax, the identity organises around
it.

**Content, fixed:** her photo · full name · "Corretora de Imóveis · Profissional liberal" ·
`CRECI-RJ <número>-F`.

| Element | Minimum | Rule |
|---|---|---|
| Her name | ≥ 50% | Of the wordmark's size on the same piece. Our standard, stricter than required |
| CRECI | ≥ 25% | Of the largest name on the piece — the wordmark, not her name. Conservative reading |
| CRECI floor | 11px | Never smaller, whatever the ratio permits. 25% of a small wordmark would be illegible; the rule is a legal minimum, not a design target |
| Photo | required | On the proposal and the "sobre" page; optional in interior footers |

**Present on:** header or first fold of every page, footer of all pages, every development
listing, every shared proposal, every pre-qualification result, the OG image, exported PDFs,
social profiles, portal listings.

**Test:** any screenshot of any part of the system must contain the complete signature. If it
does not, the layout is wrong.

> Adriana's real CRECI number is still unknown. Every prototype shows `CRECI-RJ 00.000-F`.

---

## 07. The signature element — the plumb apparatus

The one place boldness is spent. Everything around it stays quiet.

The plumb line is not a logo applied to a page; it is the page's mechanism.

- **In the pre-qualification** it is a fixed left rail on a deep green ground. A thread with a
  weighted bob that *drops* to the next notch as you answer and **swings, then damps out**, the
  way a real plumb bob does. Always visible, so the whole app becomes the instrument it is named
  after.
- **At the result** the metaphor pays off. Qualifying: the bob settles dead centre, thread taut,
  verdict **"No prumo."** Blocked: it hangs visibly crooked in brass, **"Ainda fora do prumo."**
  *Ainda* does the work — nothing is broken, it is simply not aligned yet.
- **In the proposal** the same line becomes the payment timeline, descending through the
  construction period with milestones hanging off it and the bob at *chaves na mão*. It is
  simultaneously the mark, the time axis, and the payment schedule.

### Motion

CSS transforms and opacity only, on `cubic-bezier(0.16, 1, 0.3, 1)`; the bob's drop uses a
slight overshoot. No animation library. Everything disabled under `prefers-reduced-motion`.
One orchestrated moment per screen beats scattered effects.

---

## 08. Screens

In order of value.

1. **Pré-qualificação** — six steps, the plumb rail, both honest exits. Design this first; it
   sets the tone for everything.
2. **Proposta compartilhada** — a personal letter, floor plans, the payment timeline, the three
   things that could go wrong, one action.
3. **Ficha do empreendimento** — address, surroundings, transport, typologies, commercial terms,
   total cost.
4. **Sobre ela** — face and story inside the project brand. Trust is the product.
5. **Home and admin** — deliberately simple.

### Prototypes

Working HTML in `docs/design/prototypes/`. Open in a browser — these are the reference, not
mockups, and the interaction detail matters.

| File | What it is |
|---|---|
| `pre-qualificacao.html` | The six-step flow, real MCMV math, plumb rail, both exits |
| `proposta.html` | The shared proposal — letter, SVG floor plans, payment timeline |
| `como-funciona.html` | Explains the day-to-day loop to Adriana (client-facing, pt-BR) |
| `marca.html` | Brand rationale, name alternatives, palette, signature spec |

`docs/design/adriana-placeholder.jpg` is a low-resolution stand-in embedded in the prototypes. A
proper photograph is needed — her face is a brand asset and an hour with a photographer is the
cheapest high-return item in the project.

### Notes on the prototypes

- Development names are **real Cury RJ products** (Cury Pixinguinha, Caminhos da Guanabara) with
  **invented prices, areas and delivery dates**. Useful for showing Adriana, who recognises them.
  Never send one to an actual buyer.
- MCMV faixas, rates and subsidy bands are hardcoded illustrative values. They belong in the
  admin (`product-definition.md` §04).
- Both prototypes carry a visible "Protótipo · valores ilustrativos" strip. Keep it until the
  numbers are real.

---

## 09. Layout and performance

- **Mobile-first, and mobile-real.** Opened from a WhatsApp link on a mid-range Android over 4G.
- **Budget:** < 500 KB above the fold, AVIF images, no autoplay video, LCP under 2.0s on 4G.
  Page weight is an ethical constraint here — much of this audience is on prepaid data, so a 4 MB
  homepage costs the reader money.
- **Reference class:** Brazilian fintech onboarding — Nubank, Caixa Tem, Mercado Pago, Serasa,
  gov.br. They have solved explaining money honestly to a mass audience on a cheap phone.
  **Explicitly not** Dribbble or Awwwards, which optimise for the desktop showreel on fibre and
  whose patterns are liabilities here.
- **Floor plans are primary visuals**, not stock renders. A *planta* is what a couple actually
  studies at the kitchen table, and every competitor buries it behind a carousel. Drawn as
  inline SVG in the prototypes.
- Light corner radius — unlike Blessed Moon, deliberately.
- Visible keyboard focus everywhere; `prefers-reduced-motion` respected.
