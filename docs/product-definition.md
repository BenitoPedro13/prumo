# Prumo — System Definition

> Market, product, architecture, phases and risks. The source of truth for **what to build**
> and why. For identity, tokens and voice see `design-handoff.md`. For how to work see
> `../CLAUDE.md`.
>
> Research current as of **12 August 2026**. Policy figures and platform pricing age fast —
> anything marked `[VERIFICAR]` must be reconfirmed against the primary source before it is
> shown to a real user.

---

## 01. Position in the chain

The chain is `incorporadora → corretora → comprador`. Revenue is commission on VGV, split
with the developer's sales structure. Adriana receives the **tabela de vendas** (prices and
terms) and the **espelho de vendas** (unit availability) from Cury, and both change several
times a day.

She therefore controls **no inventory, no price, and no delivery date**. Three things she
controls entirely: which developments she puts in front of whom, the relationship, and the
clarity with which a buyer understands what they are signing. Those three are the product.

### The facts that shaped this document

| Fact | Consequence |
|---|---|
| Autonomous broker, pessoa física | CRECI-F required on all advertising; nome fantasia restricted (see §06) |
| Cury only, fewer than 10 developments | Inventory management is a non-problem; Phase 0 shrinks; DWV is irrelevant |
| Economic segment | Cury RJ is MCMV-concentrated, from ~R$ 210 mil; product becomes credit and trust, not curation |
| Rio de Janeiro — Porto Maravilha, Niterói, Barra, Recreio | Cury has 18+ RJ developments; Reviver Centro incentives drive Porto Maravilha volume |
| Sales material comes from Cury | Professional and ready — and identical to every competing broker's |
| She can answer WhatsApp during showings | The operational bottleneck I expected does not exist |
| She appears, but the brand is not her name | Legally possible via one specific route (§06) |

### The central reframing

With a single supplier and a standardised product, she does not compete for inventory — she
**competes against brokers holding identical inventory**. That is liberating: it means 100%
of the available differentiation lives in the buyer's experience, which a design studio can
build and a competing broker cannot quickly copy.

---

## 02. Market

### The competitive set

Her competition is not the portals and not other developers. It is **the other accredited
Cury brokers**, all holding the same units, the same tables, the same PDFs.

| Layer | Who | Her posture |
|---|---|---|
| Portals | ZAP/VivaReal (Grupo OLX), OLX, Imovelweb, QuintoAndar, Chaves na Mão | Feed via XML eventually. Top of funnel, never the destination |
| Broker site + CRM | Jetimob, Tecimob, Kenlo, Vista, Imobisoft | The honest alternative — covers ~60% of Phase 0 for R$ 100–300/mo |
| Launch CRM | CV CRM (acquired Anapro from Grupo OLX), Facilita, Hypnobox | The developer's stack. She is a user, not a competitor |
| Supply marketplace | DWV — 70k+ brokers, 750+ developers | **Not applicable.** DWV serves multi-developer brokers. Her channel is the Cury Corretor app |

### The gap

There is an unquestioned visual convention in MCMV marketing: saturated yellow and green,
exclamation marks, `"PARCELAS A PARTIR DE R$ 599!"` in caps, "ÚLTIMAS UNIDADES" badges,
render carousels with no address. It is a vocabulary that treats the buyer as someone who
decides on impulse and on price.

They do not. They are making the largest financial commitment of their life, afraid of being
rejected for credit, often having been rejected before. **The distance between how this buyer
is treated and how they deserve to be treated is the entire market opportunity**, and it costs
nothing but taste and care.

### Buyer journey

Majority-online, months long, non-linear, 500+ digital interactions before deciding, mediated
by WhatsApp, with an expectation of immediate response. The 2026 buyer wants conversation and
photos in chat, not a scheduled call.

### What is explicitly out of scope

- **DWV** — no function with one developer.
- **Our own espelho de vendas** — it is Cury's, real-time, in her app. Replicating it is only a
  new way to be wrong.
- **A client portal** — Cury Relacionamento already handles boleto, construction progress and
  support tickets. Phase 2 deep-links to it.
- **Our own credit analysis** — Cury already generates a link the broker sends to the client for
  document upload. Route into it at the right moment; never rebuild it.

---

## 03. Product

### "Eu consigo?" comes before "qual apartamento?"

For a Faixa 2 or 3 buyer the mental sequence is not *choose, then finance*. It is the reverse:
find out whether it is possible, and only then allow yourself to want it. Every sales asset in
the sector inverts that order, which is why they convert badly.

### Surface 1 — Pré-qualificação *(the primary bet)*

A short flow, no signup, answering in under a minute: which faixa you fall into, roughly how
much subsidy fits, what installment is realistic, and what might disqualify you. It ends in one
of two honest exits — *"vale conversar, olha o que separei pra você"* or *"hoje ainda não, e
aqui está exatamente o que mudar primeiro."*

The second exit is the heart of it. Telling someone with a credit restriction "not today" is the
opposite of what the sector does, generates disproportionate trust, and creates a six-month lead
instead of a permanent no. She gains a list of people who come back.

**Boundary:** this is orientation, not credit analysis. No bureau queries, no document uploads,
no promise of approval. When the person is ready, hand off to Cury's official analysis.

**How that handoff actually works** (checked against Cury's broker page, 13 August 2026): it is
**broker-initiated and cannot be deep-linked.** Adriana submits her name, e-mail and the
empreendimento; Cury e-mails *her* a unique link; she forwards it to the buyer, who uploads
documents through it and whose files stay accessible to her. There is no login, no per-broker
referral code, and no stable URL carrying her identifier.

So the flow's last step is **not** a button pointing at `cury.net`. It ends in WhatsApp with
context pre-filled, and she pastes the link into the conversation. That keeps "WhatsApp is the
runtime" true, keeps the orientation boundary intact, and means our site never transmits buyer
data to Cury — the buyer uploads it themselves, which leaves the LGPD position unchanged.

### Surface 2 — Proposta pessoal *(private link)*

She picks one or two units for *one* family and generates a link: the real arithmetic (entrada,
INCC-corrected construction installments, estimated subsidy, balance for financing), the honest
comparison between them, her face and CRECI, and a single action.

Two properties make it work. **She sees when it was opened, and how many times** — a sales signal
she does not have today. And the link travels: forwarded to the spouse, to the mother helping
with the down payment. Housing at this level is a family decision, and the Cury PDF was not made
for that conversation.

### Back office

With fewer than ten developments and a standardised product, the admin is small: register a
development and its typologies, update commercial terms when the table changes, build a
proposal. It must work from her phone, and it must prevent error — an expired table blocks
proposal generation; missing CRECI or registro de incorporação blocks publication.

### Product principles

- **WhatsApp is the runtime.** The site is where the artifact lives; the conversation lives in
  WhatsApp. Every action ends in a `wa.me` link with context pre-filled.
- **The simulator is honest.** It includes INCC correction on construction installments. Almost
  no competitor shows this, and it is the number-one post-sale shock.
- **Mobile on 4G is the real target.** Opened from a WhatsApp link on a mid-range Android.
- **Never claim availability she cannot guarantee.**

### Acceptance test that can kill the project

Building a proposal on her phone must take **under 2 minutes**. She currently forwards a Cury
PDF and link, which costs 10 seconds. If the tool is not nearly as fast and clearly better, she
reverts to the PDF and Phase 1 dies.

---

## 04. Domain arithmetic

All of these age. They belong in the admin with a visible last-reviewed date, never in code.

### MCMV faixas — checked 13 August 2026

Set by **Portaria MCID nº 333, de 30 de março de 2026** (DOU 01/04/2026); Caixa began operating
the new conditions on 22 April 2026. Income limits and the two nationwide ceilings below are
confirmed against the Ministério das Cidades. **These live in the admin
(`Parametros.mcmv`), not here and not in code** — this table is documentation of a check, not a
source. See `docs/tasks/TASK-mcmv-parametros.md`.

| Faixa (urbana) | Gross monthly family income | Property ceiling |
|---|---|---|
| 1 | até R$ 3.200 | `[VERIFICAR]` — R$ 210–275 mil, varies by locality |
| 2 | R$ 3.200,01 – R$ 5.000 | `[VERIFICAR]` — R$ 210–275 mil, varies by locality |
| 3 | R$ 5.000,01 – R$ 9.600 | até R$ 400 mil, nationwide |
| 4 — Classe Média | R$ 9.600,01 – R$ 13.000 | até R$ 600 mil, nationwide |

The previous version of this table said Faixas 1 and 2 ran "up to R$ 4.700" and merged them into
one row. Both were wrong by the time they were read: Faixa 2 now ends at R$ 5.000, Faixa 3's
ceiling moved from R$ 8.600 to R$ 9.600, and the two brackets have different subsidy treatment
and cannot share a row.

Rates: a nominal band of **4,00% to 10,00% a.a.** by family income, **10,00% a.a.** for Classe
Média, and 4,00% (Norte/Nordeste) or 4,25% (elsewhere) for FGTS cotistas earning up to R$ 2 mil.

`[VERIFICAR: the full per-faixa rate table, subsidy amounts, and the financing percentage per
faixa. Caixa's own pages could not be read automatically — the MCMV page redirect-loops and the
newsroom returns 401.]`

`[VERIFICAR: which ceiling applies in Rio de Janeiro. The R$ 210–275 mil range for Faixas 1 and
2 varies by locality, and Cury's Rio product starts around R$ 210 mil — so this single number
decides whether her cheapest units are Faixa 2 or Faixa 3 business. Chase this one first.]`

**These four were stored empty until 13 August 2026 and are now flagged suggestions.** They were
filled so `/simulador` has numbers to show while Adriana reviews the flow, each interpolated
inside a confirmed band and argued for in `src/payload/seed.ts`. They are visible on screen and
carry an "estimativas ilustrativas" strip driven by `Parametros.mcmv.valores_sugeridos`. That
flag is the gate now — replacing the empty-value gate — and it must stay set until Caixa
confirms all four. See `docs/tasks/TASK-pre-qualificacao.md` §2.4 and
`docs/pending-verifications.md` §3.

Rural faixas are set on annual income and are irrelevant here — she sells urban Rio.

### What actually causes rejection

The most valuable content on the site.

- Credit restriction on the CPF, overdue debt, high income commitment.
- Income that is hard to document — informal, recent MEI, self-employed without a return.
- Already owning property, or having already used the programme.
- Incomplete documentation — the most common cause, and the easiest to fix in advance.

Caixa's initial analysis averages **up to 30 days**; the full process with inspection and release
runs **40 to 70 days**. Saying so plainly is exactly the honesty the segment does not practise.

### INCC

Installments paid before handover are corrected **monthly by the INCC**, using the index
published two months prior. After handover, any remaining balance with the builder typically
moves to IPCA or IGP-M plus contractual interest. The installment shown today is not the one
paid in month 30 — show nominal and projected side by side, projection labelled as an estimate.

### Repasse

At handover the balance is transferred to bank financing, subject to credit analysis **at that
moment**, not at purchase. The single largest source of deals lost late.

---

## 05. Architecture

Fewer than ten developments, one developer, standardised product. Nothing here calls for
infrastructure; it calls for a good admin.

| Layer | Choice | Rationale |
|---|---|---|
| App | Next.js App Router + TypeScript | Static for listings, server components for the proposal |
| UI | Tailwind v4 + shadcn/ui, rethemed | See `design-handoff.md` |
| Content + admin | Payload CMS 3, embedded | pt-BR admin without building CRUD; the value is *validation* |
| Data + files | Managed Postgres + S3-compatible storage | Neon/Supabase + R2. The image pipeline matters more than the DB |
| Messaging | `wa.me` links | Zero cost. See the pricing note below |
| Credit analysis | Handoff to Cury's link | Never rebuild |
| Hosting | Vercel, São Paulo edge | Zero ops; latency matters because the target is 4G |

### WhatsApp cost note

Deferring the official API is a cost decision. Brazil 2026: marketing ~US$ 0,0625 per delivered
message (~R$ 0,31–0,38), utility and authentication ~US$ 0,0068, service messages inside the
24h window free — plus BSP subscription and markup. At a solo broker's volume, `wa.me` links
deliver nearly the same result for R$ 0. `[VERIFICAR: Meta rates change frequently.]`

### Data model

Fields marked **⚖** are legal requirements.

| Entity | Fields |
|---|---|
| `Incorporadora` | nome · portal_do_cliente_url · link_analise_credito — n=1 today, but kept as an entity: she has already come from another builder |
| `Empreendimento` | nome · incorporadora · status · endereço · geo · transporte_proximo[] · entrega_prevista · **⚖ registro_incorporacao** · **⚖ cartorio** · lazer[] · mídia[] |
| `Tipologia` | empreendimento · dormitórios · vagas · área_privativa · planta[] · faixa_de_preço · faixa_mcmv_elegivel[] |
| `CondicaoComercial` | tipologia · entrada_% · parcelas_obra · balões[] · valor_nas_chaves · índice_reajuste · **⚖ validade_da_tabela** |
| `PreQualificacao` | renda_declarada · composição_familiar · fgts_anos · possui_imovel · faixa_estimada · resultado · **⚖ consentimento** |
| `Lead` | nome · telefone · origem · pré_qualificação · estágio · **retomar_em** — the field that turns "hoje não" into pipeline |
| `Consentimento` | lead · **⚖ finalidade** · **⚖ texto_versao** · **⚖ timestamp** · **⚖ ip** · revogado_em |
| `Proposta` | lead · tipologias[] · premissas (snapshot) · token_publico · expira_em · eventos_de_abertura[] |

Two subtleties that are easy to miss. **`CondicaoComercial` has an expiry** — a stale table is
the most common source of a wrong proposal, and here it is a publication gate. And **`Proposta`
freezes its assumptions** rather than referencing current prices: a link sent in March must show
in May what she actually promised.

---

## 06. Compliance

Not legal notes to review at the end — they change the design system, because they must appear
on every artifact the system emits, including the OG image and the exported PDF.

### Branding — decided

A PF broker **cannot use a nome fantasia**, and must use their own name followed by "corretor de
imóveis" and the CRECI registration. Two legitimate routes to an own brand:

| Route | What it involves | Design effect |
|---|---|---|
| **A — pseudonym with real name** *(chosen)* | A project name is permitted **provided her real name appears clearly and prominently alongside it** in all communication | Project mark on top, her signature fixed and prominent — a *component*, not a footer |
| B — Empresário Individual | Junta Comercial registration unlocks a true nome fantasia. Implies CNPJ, accounting, probably CRECI-J | Full brand freedom, recurring cost and bureaucracy |

**Route A is chosen.** It stops being a constraint to work around and becomes the central asset:
the brand supplies seriousness, the person supplies trust, and an MCMV buyer is looking for both
at once. `[VERIFICAR: interpretation varies by regional — confirm with CRECI-RJ.]`

### CRECI in advertising

- Number mandatory in **all** advertising, with the abbreviation and number, followed by `F` for
  pessoa física.
- Minimum **25% of the font size of the name used**. This is a typographic rule and becomes a
  token bound to the signature component. Our own floor: never below 11px.
- Advertising a unit under incorporation requires the **registro de incorporação number and the
  cartório** — hence the mandatory fields on `Empreendimento`.

### LGPD

- Consent not pre-checked, with explicit purpose in the form itself. Versioned proof stored —
  text displayed, date, origin.
- The pre-qualification collects **income and household composition**, sensitive in practice.
  Minimise: no CPF, no documents, no bureau queries; store the band, not the exact figure, where
  possible.
- Unsubscribe path in all communication, privacy policy, retention policy, data-subject channel.
- No purchased lists — common in the sector, incompatible with the law.

### Cury authorisation

Confirmed: she may advertise the brand, renders and floor plans. **Keep the authorisation in
writing** on the `Incorporadora` record, and confirm whether pieces require pre-approval — if
so, the proposal builder needs a draft state before it can mint a public link.

---

## 07. Phases

| Phase | Duration | Contents |
|---|---|---|
| **0 — Presence and identity** | ~2 weeks | Home, sobre, development listings, contact. Payload admin with legal validation. Signature component applied to OG. Consent-versioned form, `wa.me` CTA |
| **1 — Pre-qualification and proposal** | ~4 weeks | The six-step flow with both honest exits. "What causes rejection" and the real 40–70 day calendar. Proposal builder under 2 minutes. Private link with expiry, frozen assumptions, open notification. Handoff to Cury's analysis link |
| **2 — Follow-up** | reassess | Retomada queue for "hoje não". Deal timeline deep-linking to Cury Relacionamento. Portal XML feed if organic capture is insufficient |

Each phase delivers standalone value. If she stops using it after Phase 1, nothing was wasted.

### The honest case against building this

Tecimob or Jetimob deliver Phase 0 for R$ 100–300/month today, with portal sync thrown in. The
project is justified by **Phase 1 alone**. Build Phase 0 knowing it is commodity — keep it cheap
and fast — and spend the design budget on Phase 1. If she does not use the proposal builder in
the first month, stop and migrate her to Tecimob. That is a conscious decision, not a failure.

---

## 08. Distribution

She raised this herself, and the honest answer is: **do not build this for Google.**

She would be competing for "apartamento na planta Niterói" against ZAP, VivaReal, OLX and Cury's
own site, with domain authority a solo broker cannot approach. What works, in order of return:

1. **Conversion, not acquisition.** Her traffic already exists — WhatsApp, referrals, Instagram,
   plantão. Today those people receive a forwarded PDF. That is where the return is.
2. **Long tail, not head terms.** "Quanto ganha pra financiar pelo Minha Casa Minha Vida",
   "posso comprar com nome sujo", "Reviver Centro como funciona", "morar no Porto Maravilha vale
   a pena" — low competition, high intent, and already answered by the pre-qualification. **The
   product is the SEO strategy.**
3. **Google Business Profile** — probably higher return than the whole site for local search, and
   free.
4. **Instagram** — [@meumelhorape](https://www.instagram.com/meumelhorape/), 104 followers after
   92 posts. Underperforming. The site gives her a link in bio that *does* something and a reason
   to make content from the honest answers nobody else gives.

Organic search takes 6–12 months to produce anything; everything above produces results in week
one. Set that expectation explicitly so the project is not judged on the wrong scoreboard.

---

## 09. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Signature disappears from some artifact | High | Residual risk of route A. Slips happen in the OG, the PDF, and isolated shared pages. The screenshot test in `CLAUDE.md` covers all three |
| She reverts to the Cury PDF | High | The 2-minute test, validated on her phone before building the rest of Phase 1 |
| Pre-qualification read as a promise | High | Estimate language, visible assumptions, no bureau queries, legal review before launch |
| Dependence on a single developer | High | She has already come from another builder. Keep `Incorporadora` as an entity and the brand independent of Cury |
| Cury requires piece pre-approval | Medium | Confirm. If so, add a draft state to the proposal builder |
| Expired table produces a wrong proposal | Medium | `validade_da_tabela` as a publication gate |
| MCMV figures age | Low | Admin-configurable, last-reviewed date displayed |

### Metrics, in order

1. **Closings originated on the site.** The only one that pays.
2. **Pre-qualifications completed** and the share becoming conversations — health of the thesis.
3. **Proposal open rate** and time to open.
4. **Retomadas converted** — whether honesty pays financially.
5. **Proposals created per week.** If it hits zero the project is dead, however good traffic looks.

---

## 10. Open questions

Blocking Phase 1, not Phase 0.

1. **Her real CRECI-RJ number and exact format.** Every prototype shows a placeholder. The one
   legally load-bearing element still fake.
2. **Of every ten interested buyers, how many does she lose at credit analysis?** The number that
   sizes the entire project. If it is the majority — as it usually is in MCMV — the thesis holds.
3. **What exactly does the Cury Corretor app provide** — espelho, tabela, reservation, materials,
   commission? Can anything be exported? Cury's public pages are silent; 15 minutes of screen
   share answers it. **Partially answered:** the credit-analysis half is broker-initiated and
   produces a per-request link by e-mail, with no stable URL or referral code — see §03. What the
   app itself exposes is still open.
4. **Where do her leads come from today** — Cury, referral, Instagram, plantão? If Cury
   distributes them, the site is about conversion and Phase 0 shifts emphasis.
5. **Which developments and neighbourhoods** she currently represents, and a sample tabela to
   understand the format Cury sends.
6. **The name.** `prumo.com.br` and `prumo.co` are taken. See `design-handoff.md` for four
   alternatives.

---

## Sources

Research 12 August 2026.

- [DWV](https://site.dwvapp.com.br/corretores-e-imobiliarias/) · [DWV API](https://api.dwvapp.com.br/)
- [CV CRM](https://cvcrm.com.br/cv-vender/) · [CV CRM acquires Anapro](https://infraroi.com.br/cv-crm-compra-anapro-em-estrategia-de-consolidacao/)
- [Cury — imobiliárias e corretoras](https://cury.net/imobiliarias) · [Cury — análise de crédito para corretor](https://cury.net/analise-de-credito/corretor) · [Cury Cliente](https://cliente.cury.net/login) · [Apecury — MCMV no Rio](https://apecury.com.br/) · [Cury Construtora](https://pt.wikipedia.org/wiki/Cury_Construtora)
- [Caixa — Minha Casa Minha Vida](https://www.caixa.gov.br/voce/habitacao/minha-casa-minha-vida/urbana/Paginas/default.aspx) · [Checklist de documentação (PDF)](https://www.caixa.gov.br/Downloads/habitacao-minha-casa-minha-vida/checklist_beneficiario.pdf) · [Regras 2026](https://www.tenda.com/blog/minha-casa-minha-vida/minha-casa-minha-vida-2026) · [Tetos por faixa](https://www.direcional.com.br/blog/minha-casa-minha-vida/teto-minha-casa-minha-vida/)
- [Resolução COFECI — regras de divulgação](https://crecies.gov.br/resolucao-do-cofeci-estabelece-regras-de-divulgacao-para-corretores-de-imoveis/) · [Nome fantasia para corretor](https://www.ibresp.com.br/blogs/2025/o-corretor-de-imoveis-pode-usar-um-nome-fantasia/) · [CRECI-RJ — registro de incorporação em anúncios](https://creci-rj.gov.br/anuncios-de-imoveis-na-internet-devem-conter-registro-de-incorporacao/)
- [INCC e reajuste na planta](https://ape3d.com.br/guia-de-compras/avaliacao-tecnica/reajuste-do-imovel-na-planta-entenda-o-incc-e-outros-indices) · [Etapas até as chaves](https://www.cnnbrasil.com.br/branded-content/economia/negocios/etapas-apos-comprar-um-imovel-na-planta-o-que-fazer-ate-receber-as-chaves/)
- [LGPD para imobiliárias](https://cvcrm.com.br/blog/lgpd-para-imobiliarias-o-que-mudou-e-como-o-crm-pode-ajudar/) · [WhatsApp Business API — preços no Brasil](https://www.messagecentral.com/blog/whatsapp-business-api-pricing-brazil) · [Integração XML de portais](https://www.websiteimobiliario.com.br/blog/integracao-de-portais-imobiliarios.html) · [DataZAP — jornada do comprador](https://www.datazap.com.br/jornada-do-comprador/)
