# TASK — The way in: /contato, /privacidade, Lead and Consentimento

> Status: **built.**
>
> Unit 3 of five in `TASK-fase-0.md`. Independent of unit 2 — needs neither a photograph nor
> Cury data — and carries the real legal weight of the phase, per the roadmap's own note that
> this unit "gets its own review."

## 1. Current scenario

`/contato` is one of the three links the nav and footer already render and does not have — it
404s by design (`src/lib/routes.ts`, `built: false`). `/privacidade` is stubbed the same way in
`LEGAL_ROUTES`, with a comment saying it "arrives with the LGPD work in unit 3"; the footer
omits it from its link list until then.

The `wa.me` CTA itself is not missing — `WhatsAppAction` (`src/components/whatsapp-action.tsx`)
already renders on the home placeholder, the footer, and every catalogue ficha, each with its
own `origem` context (`docs/tasks/TASK-chrome-e-seo.md`). What unit 3 actually adds on that
front is nothing; the roadmap groups it into this unit's description because it is the fast path
the contact page sits beside, not because it needs building.

There is no `Lead` collection and no `Consentimento` collection. Nobody who prefers filling a
form to opening WhatsApp — and per `product-definition.md` §08 a meaningful share of visitors
arrive from Instagram or a referral, not already mid-conversation — has anywhere to leave
contact details. There is no `retomar_em` field anywhere, so a "não agora" today has nowhere to
go and is a lost contact rather than pipeline, which `TASK-fase-0.md` names explicitly as the
field that fixes that.

`CLAUDE.md`'s own layout tree currently lists `Lead, Consentimento, Proposta` together as
"Phase 1" collections. That line predates this roadmap: `TASK-fase-0.md` commissions `Lead` and
`Consentimento` for this unit, in Phase 0. Only `Proposta` is actually Phase 1. Fixing that line
is part of this task's documentation pass (§3.1).

There is no `Payload` email adapter configured — `payload.config.ts` has none, and Payload logs
"No email adapter provided" on every boot. A `Lead` created through this unit's form is visible
only by opening the admin; nothing pushes a notification to her.

## 2. Planned changes

### 2.1 Writes go through a Server Action, not a public collection endpoint

The catalogue pages read through Payload's Local API and the public REST/GraphQL surface is
closed for everything but `media` (`src/payload/access.ts`, `docs/tasks/TASK-empreendimentos.md`
§2.1 / "as built" note). This unit keeps that posture on the write side: the contact form posts
to a Next.js Server Action (`src/app/(frontend)/contato/actions.ts`), which validates on the
server and calls `payload.create()` for `Lead` and `Consentimento` through the Local API — no
REST endpoint is ever opened for either collection, public or authenticated. `access.create` on
both collections can be `() => false`: the only code path that ever creates one is the Server
Action, and the Local API bypasses access control by design, the same reason the catalogue pages
don't need a public read grant either. `access.read` stays `somenteAutenticado` — only she sees
leads, in the admin.

*(Before writing this, confirm the current Server Action / `useActionState` pattern against
Next's bundled docs — `CLAUDE.md` §2.0 — rather than relying on remembered React 18-era form
APIs.)*

### 2.2 Schema — two collections, one shared source for the consent text

**`src/payload/collections/leads.ts`** — `nome`, `telefone` (required), `mensagem` (optional free
text), `origem` (text, what the form already knows: `"Formulário em /contato"` today, kept as a
field rather than a constant so a second entry point in Phase 1 — a form embedded on a ficha, for
instance — has somewhere to write its own), `estagio` (select: `novo` · `em_conversa` ·
`aguardando_retomada` · `convertido` · `perdido`; defaults to `novo`, everything after that is
hers to move by hand in the admin), and **`retomar_em`** (date, admin-only — nothing on the
public form sets it; it is the date *she* picks when she marks a lead "aguardando_retomada", and
it is the whole reason `TASK-fase-0.md` calls this field out by name).

**`src/payload/collections/consentimentos.ts`** — `lead` (relationship, required), `finalidade`
(text — what she may contact them about, stated plainly), `texto_versao` (text — which version of
the consent copy they agreed to), `ip` (text, read server-side from the request, not the client),
`revogado_em` (date, admin-only — see §2.5). No separate `timestamp` field: `createdAt`, which
Payload stamps on every document, already is the moment consent was given, and a second field
saying the same thing would only be one more place for the two to drift.

**`src/lib/lgpd.ts`** — `CONSENT_VERSION` and `CONSENT_PURPOSE_TEXT`, one source both the form
(what the visitor reads and checks) and the Server Action (what gets stored as `texto_versao`,
verbatim) read from. Bumping the version means changing the copy here; nothing else has to know.

### 2.3 `/contato`

WhatsApp stays the fast path and sits above the form, not below it — the product's own instinct
is a real conversation before a submitted form, and burying `WhatsAppAction` under three text
fields would argue against the site's own thesis. Below it: a short form — `nome`, `telefone`,
an optional `mensagem`, an **unchecked** consent checkbox showing `CONSENT_PURPOSE_TEXT` with a
link to `/privacidade`, and a hidden honeypot field. Submit calls the Server Action through
`useActionState`; success replaces the form with a short confirmation and a second
`WhatsAppAction` for anyone who'd rather not wait ("prefere continuar agora?").

Server-side validation is authoritative — `nome` and `telefone` required, consent required,
honeypot must be empty — and returns field-level errors the client renders; nothing is trusted
from the client beyond what gets re-checked.

### 2.4 `/privacidade`

A static page, written in the site's own voice (`design-handoff.md` §05) rather than pasted
boilerplate: what gets collected and why, that nothing is a purchased list
(`product-definition.md` §06), how long it's kept, and how to ask her to stop or to delete what
she has — a WhatsApp message or an email, both already on the page, is the channel; see §2.5 for
why it stops there in this unit.

### 2.5 What "revoke consent" means in this unit, and what it deliberately does not

`Consentimento.revogado_em` exists in the schema so a revoked record is representable, but there
is no self-service revoke-my-data flow here — no token link, no account. When someone asks her to
stop or to delete their data, she sets the field by hand in the admin. For a solo broker's volume
this is honest and sufficient, and it matches the roadmap's standing instruction that Phase 0 stay
commodity, not distinctive (`TASK-fase-0.md` §"The instruction that shapes this whole phase").
Building a self-service portal here would be exactly the kind of bespoke interaction that
instruction says to write down for later and move on from.

### 2.6 Anti-spam, kept cheap

A honeypot field (a text input hidden from sighted users via CSS, never via `display:none` alone
— screen readers should skip it too, so `aria-hidden` plus visually-hidden styling) — filled in
means a bot, and the Server Action silently no-ops. No CAPTCHA: it is exactly the kind of
friction `design-handoff.md` §09 argues against for a visitor on a mid-range Android over 4G, and
at this volume a honeypot catches the overwhelming majority of automated spam for zero cost and
zero degraded experience for a real person.

**Alternatives considered and rejected:**

- *react-hook-form + zod.* Rejected: three visible fields and one checkbox is what
  `useActionState` already covers natively; a form library would be an abstraction with nothing
  to abstract yet.
- *A public REST/GraphQL write grant on `Leads`.* Rejected — see §2.1. Keeps the same closed
  posture the catalogue already committed to.
- *Self-service consent revocation.* Rejected for this unit — see §2.5.
- *reCAPTCHA or another JS challenge.* Rejected on weight and friction grounds (§2.6); a honeypot
  is the cheaper, invisible-to-real-visitors option and sufficient at this volume.
- *Email notification on new lead.* Wanted, not rejected — deferred because no email adapter is
  configured yet (`payload.config.ts` has none). Tracked in §7 rather than solved here, so this
  unit isn't blocked on choosing and wiring a transactional-email provider.

## 3. Why

Four of the "must not break" rules in `CLAUDE.md` §0 have had nothing to bind to until this unit,
the same way four others first became real in unit 2: consent not pre-checked with its purpose
stated in the form itself, versioned proof stored, no purchased lists, and an unsubscribe path in
all communication. Shipping this unit wrong is a regulatory problem, not a design one — the same
category of risk unit 2's registro block and expiring table carried.

It is also where a real product gap closes. Every current entry point assumes the visitor is
ready to open WhatsApp. `product-definition.md` §08 says a meaningful share arrive from
Instagram or a referral, mid-scroll, not mid-conversation — and `retomar_em` is `TASK-fase-0.md`'s
own name for the fix: a "não agora" becomes a date on her calendar instead of a closed tab.

### 3.1 Documentation correction bundled into this unit

`CLAUDE.md`'s layout tree lists `Lead, Consentimento, Proposta` together as Phase 1. That's
stale as of `TASK-fase-0.md`, which put `Lead` and `Consentimento` in Phase 0 unit 3. This task
fixes the line so the file matches the roadmap it's supposed to describe.

## 4. Affected files

| File | Change type | Notes |
|---|---|---|
| `src/payload/collections/leads.ts` | new | §2.2 |
| `src/payload/collections/consentimentos.ts` | new | §2.2 |
| `src/lib/lgpd.ts` | new | `CONSENT_VERSION`, `CONSENT_PURPOSE_TEXT` — §2.2 |
| `src/app/(frontend)/contato/page.tsx` | new | §2.3 |
| `src/app/(frontend)/contato/actions.ts` | new | Server Action, §2.1 / §2.3 |
| `src/app/(frontend)/contato/state.ts` | new | `ContatoState` and `CONTATO_INITIAL_STATE` — split out of `actions.ts` because a `"use server"` file may only export async functions; a plain object export there resolves to `undefined` on the client instead of erroring |
| `src/components/contato-form.tsx` | new | client component + `/sistema` panel, per `CLAUDE.md` §4 |
| `src/app/(frontend)/privacidade/page.tsx` | new | §2.4 |
| `payload.config.ts` | edit | register `Leads`, `Consentimentos` |
| `src/lib/site-config.ts` | edit | `BROKER_EMAIL`, placeholder — the second stop-or-delete channel `/privacidade` names, alongside the WhatsApp number |
| `src/payload/access.ts` | edit, maybe | only if a shared "nobody, ever" access helper is worth factoring out — otherwise inline `() => false` on both collections |
| `src/lib/routes.ts` | edit | `/contato` and `/privacidade` flip to `built: true` |
| `src/app/(frontend)/sitemap.ts` | none expected | already filters on `built`; no catalogue-style per-document loop needed here |
| `components.json` / `src/components/ui/checkbox.tsx` | new | `pnpm dlx shadcn@latest add checkbox` — check current docs first, §2.1 |
| `src/app/(frontend)/sistema/page.tsx` | edit | panel for `contato-form`, per `CLAUDE.md` §4 |
| `CLAUDE.md` | edit | layout tree correction, §3.1; status line, once built |
| `README.md` | edit | status table, per `CLAUDE.md` §3 |
| `docs/product-definition.md` | edit, maybe | only if building this answers anything in §10 |

## 5. Done when

- `/contato` and `/privacidade` render, both carrying the signature through the layout, and both
  are `built: true` in `src/lib/routes.ts` and present in the sitemap.
- A submission with a filled honeypot silently does nothing; a valid submission creates a `Lead`
  and a linked `Consentimento` with `finalidade`, `texto_versao` and `ip` all populated, visible
  in the admin.
- The consent checkbox is never pre-checked, and the purpose text on the page and the stored
  `texto_versao` are the same string, sourced from `src/lib/lgpd.ts`.
- Neither collection is reachable through the public REST or GraphQL API, read or write.
- `retomar_em` exists on `Lead` and is editable only from the admin, not the public form.
- `/privacidade` states what's collected, why, that it's never a purchased list, and how to ask
  her to stop or delete — and the contact form links to it.
- `/sistema` has a panel for `contato-form`.
- `pnpm build` and lint pass.

## 6. Explicitly out of scope

`PreQualificacao` and the `Lead.pré_qualificação` relationship the full data model in
`product-definition.md` §04 eventually wants — that collection doesn't exist until the
pre-qualification is built in Phase 1, so the relationship has nothing to point at yet. The
proposal builder and `Proposta`. Self-service consent revocation (§2.5). Email or any other
push notification on a new lead (§7). A pipeline/kanban view over `estagio` in the admin beyond
Payload's own list view — nothing here says she needs more than that yet.

## 7. Blocked on / open after this unit

- **No email adapter configured.** A new `Lead` is invisible until she opens the admin. Worth
  revisiting once there's a transactional-email provider decision to make — not this unit's to
  make unprompted.
- **Her real WhatsApp number** — unchanged from unit 1, `WHATSAPP_NUMBER` is still a placeholder,
  and this unit's second `WhatsAppAction` on the confirmation state inherits that.
- **Her CRECI number** — unchanged from every prior unit.
