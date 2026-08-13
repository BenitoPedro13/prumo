# Pending verifications

Everything in the repo that is unconfirmed, placeholder, or invented, in one place.

Grouped by **who can answer it**, because that is what makes it actionable — most of this list
is closed by two conversations, not by research. Each item says what it blocks.

Assembled 13 August 2026. The markers themselves live inline as `[VERIFICAR: ...]`, `PLACEHOLDER`
and `[SEED]`; this file is an index, not a second source of truth. When an item is resolved,
remove the inline marker and the row here together.

**Nothing on this list may reach a real buyer while it is still on this list.**

---

## 1. Only Adriana can answer

| Item | Where | Blocks |
|---|---|---|
| **Her real CRECI-RJ number** | `src/lib/site-config.ts` — `BROKER_CRECI` is `CRECI-RJ 00.000-F` | **Any public launch.** The one legally load-bearing element still fake, and it renders on every page, the OG image and the footer |
| **Her WhatsApp number** | `src/lib/site-config.ts` — `WHATSAPP_NUMBER` is `5521900000000` | Every CTA on the site. The `wa.me` links are built correctly and point nowhere real |
| **Her e-mail** | `src/lib/site-config.ts` — `BROKER_EMAIL` is `adriana@example.com` | `/privacidade`'s second channel for a stop-or-delete request — an LGPD commitment we currently cannot honour |
| **A real photograph** | `public/adriana-placeholder.jpg`, 180×179 | Nothing hard, but it caps any portrait at ~90px and rules out the `/sobre` hero treatment. Still the cheapest high-return item in the project |
| **Her professional history** | `src/app/(frontend)/sobre/page.tsx` — the `[VERIFICAR:]` block | The story half of `/sobre`. Four questions, listed in `TASK-sobre.md` §6 |
| **The brand name** | `src/lib/site-config.ts` — `BRAND_NAME`, and `prumo.com.br` / `prumo.co` are both taken | The wordmark, the icon and the domain. `BRAND_NAME` is one edit; a drawn mark is not |
| **Of every ten interested buyers, how many she loses at credit analysis** | `product-definition.md` §10 q2 | Nothing in code — but it sizes Phase 1, which is the phase that justifies the project |
| **Where her leads come from today** | §10 q4 | If Cury distributes them, Phase 0's emphasis shifts from capture to conversion |

## 2. Cury can answer, through her

| Item | Where | Blocks |
|---|---|---|
| **Real registro de incorporação and cartório** | `src/payload/seed.ts` — both are `[SEED] a confirmar junto à Cury` | Publishing any real listing. The publication gate enforces their presence, not their truth |
| **A real price table** — validade, entrada, parcelas, saldo | `src/payload/seed.ts` — the `[SEED]` condição comercial | Every commercial figure on a ficha. Invented today |
| **Which developments and neighbourhoods she represents** | §10 q5 | The catalogue's real contents |
| **What the Cury Corretor app actually provides** — espelho, tabela, reservation, materials, commission, and whether anything can be exported | §10 q3 | How the catalogue stays current, and whether availability can ever be better than "consultar" |

## 3. Caixa and the official sources

Re-verify before launch regardless of age: these moved in 2026 and will move again.

**These four changed state on 13 August 2026 and are now more dangerous, not less.** They used
to be stored empty, which meant they rendered nowhere. They are now filled with **flagged
suggestions** so `/simulador` has numbers to show while Adriana reviews the flow
(`TASK-pre-qualificacao.md` §2.4) — so they are on screen, carrying a visible "estimativas
ilustrativas" strip, driven by `Parametros.mcmv.valores_sugeridos`. Each is an interpolation
inside a confirmed band, never an invention outside one, and each is argued for in
`src/payload/seed.ts`.

Closing an item means editing the field in the admin. When all four are confirmed, untick
`valores_sugeridos` and the strip disappears from every page at once. No code changes.

| Item | Where | Blocks |
|---|---|---|
| **Which property ceiling applies in Rio for Faixas 1 and 2** | `Parametros.mcmv`, **suggested R$ 275 mil** (top of the confirmed R$ 210–275 mil locality range); `product-definition.md` §04 | **Chase this first.** Cury's Rio product starts around R$ 210 mil, so this number decides whether her cheapest units are Faixa 2 or Faixa 3 business |
| **The full per-faixa interest rate table** | `Parametros.mcmv.faixas[].taxa_juros_anual`, **suggested 4,25 / 6,00 / 8,16%**; Classe Média's 10,00% is confirmed | Quoting any installment. Only the 4,00–10,00% a.a. band and its two endpoints are confirmed; Faixas 1–3 are interpolated between them |
| **Subsidy amounts per faixa** | `Parametros.mcmv.faixas[].subsidio_maximo`, **suggested R$ 55 mil / R$ 25 mil / R$ 0 / R$ 0** | The "roughly how much subsidy fits" half of the answer. The taper's shape is confirmed; the magnitudes are the guess |
| **Financing percentage / LTV per faixa** | `Parametros.mcmv.faixas[].percentual_financiado`, **suggested 80 / 80 / 80 / 70%** | The entrada and repasse arithmetic. Taken from `product-definition.md` §04's own unreconfirmed claim |
| **FGTS cotista eligibility** — contribution time, prior use of the programme | not modelled yet | "What causes rejection", one of the most valuable pages on the site |
| **The real INCC** | `src/payload/globals/parametros.ts` seeded at 8,12% as illustrative; `seed.ts` and `/sistema` both mark it | Every projected installment. The gate holds — with no rate, neither figure renders |

Caixa's own pages defeat automated reading: the MCMV page redirect-loops and the newsroom
returns 401. A person, a branch, or her Caixa contact settles all of the above faster than the
web will.

## 4. CRECI-RJ and COFECI

| Item | Where | Blocks |
|---|---|---|
| **How the advertising rules are interpreted by this regional** | `product-definition.md` §06 — interpretation varies by regional | The signature's exact proportions and wording. Ours are deliberately stricter than the conservative reading, so this is a risk of over-compliance rather than under |

## 5. Ours to decide

| Item | Where | Blocks |
|---|---|---|
| **A deployment Postgres** | Neon or Supabase; local dev runs on Docker | Going live at all. `/` and `/empreendimentos` prerender from the database, so the build needs one |
| **Meta ad rates** | `product-definition.md` §08 | A distribution estimate, nothing built |
| **Privacy wording for the credit handoff** | `/privacidade`, `src/lib/lgpd.ts` | Ships with Phase 1 — see §6 below |

---

## 6. The credit analysis handoff — how it actually works

Checked against Cury's own broker page on 13 August 2026, and it changes a design assumption.

**It is broker-initiated, not a link we can publish.** Adriana submits her name, e-mail and the
empreendimento to Cury; Cury e-mails *her* a unique link; she forwards that link to the buyer;
the buyer uploads their documents through it, and she retains access to what they attach. There
is no login, no per-broker referral code, and no stable public URL with her identifier in it.

Three consequences:

1. **The pre-qualification cannot end in a button that deep-links to Cury.** There is nothing
   stable to link to. The last step ends where the product says everything ends — in WhatsApp,
   with context pre-filled — and she pastes the Cury link into the conversation herself.
2. **That is the better outcome anyway.** It keeps "WhatsApp is the runtime" true, keeps the
   orientation-not-analysis boundary intact, and means the moment of handoff is a human one.
3. **Our site never transmits buyer data to Cury.** The buyer uploads directly. Our LGPD
   position is unchanged and `CONSENT_PURPOSE_TEXT` remains accurate — it scopes the promise to
   marketing, and no marketing sharing happens.

Still to confirm with her: whether the link is per-empreendimento or reusable, and how long it
lasts. That decides whether the WhatsApp context needs to carry the development.

`[VERIFICAR: link validity and whether one link serves several buyers — confirm with Adriana.]`
