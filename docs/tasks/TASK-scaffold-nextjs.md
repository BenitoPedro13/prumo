# TASK — Scaffold the Next.js application

> Status: **awaiting approval.** No code written.

## 1. Current scenario

Documentation only. The repo contains `CLAUDE.md`, `README.md`, `docs/product-definition.md`,
`docs/design-handoff.md`, four HTML prototypes in `docs/design/prototypes/`, and this task doc.
There is no `package.json`, no application code, no deployment.

The prototypes are static single-file HTML with inlined CSS and vanilla JS. They are the design
reference and stay in `docs/` as reference — they are not built output and are not migrated.

Blocking items from `product-definition.md` §06 are resolved: Cury authorises advertising its
brand and material, and the naming route is decided (pseudonym with her real name prominent).
Adriana's real CRECI number is still outstanding but does not block scaffolding.

## 2. Planned changes

Scaffold only. **No screens are implemented in this task** — it ends with a themed, deployable
shell and a working admin, so Phase 0 screens land on solid ground.

**Scaffolding via official CLIs** (per `CLAUDE.md` §2), verifying current versions first:

- `pnpm create next-app@latest` — TypeScript, App Router, `src/`, `@/*` alias, Tailwind.
- `pnpm dlx shadcn@latest init` then `add button input textarea card select label` — the
  primitives Phase 0 needs.
- Payload CMS 3 into the same app, Postgres adapter, S3-compatible storage adapter, admin locale
  pt-BR.

**Design tokens.** Port the palette, type stacks and radius from `design-handoff.md` §03–04 into
`src/app/globals.css` as CSS-first Tailwind v4 theme variables, with the light and dark token
sets structured per the three-state rule (bare `:root`, `prefers-color-scheme` guarded against an
explicit light choice, and an explicit dark stamp). Retheme shadcn primitives to match.

**Config constants** in `src/lib/site-config.ts`: `BRAND_NAME`, `SITE_URL`, `BROKER_NAME`,
`BROKER_CRECI`, `BROKER_ROLE`, `WHATSAPP_NUMBER`. The brand name is unresolved and the CRECI is a
placeholder — both live here so a change is one edit, per `CLAUDE.md` §0.

**The signature component** — `src/components/signature.tsx`. Built in this task despite being
"a screen thing" because it is the repo's central legal constraint and everything else composes
it. Variants: `header`, `footer`, `full` (with photo). Sizes derive from the wordmark size via
tokens so the ≥50% / ≥25% / 11px-floor rules in `design-handoff.md` §06 are enforced by the
component rather than by discipline.

**Payload collections**, schema only, no seed data — `Incorporadora`, `Empreendimento`,
`Tipologia`, `CondicaoComercial`, per the data model in `product-definition.md` §05. Lead,
Consentimento and Proposta are Phase 1 and are deliberately not created yet.

**A single placeholder route** (`/`) rendering the signature and confirming tokens resolve in
both themes. Real home content is a separate task.

**Alternatives considered and rejected:**

- *Supabase + a hand-built admin instead of Payload.* Rejected: Adriana is non-technical and the
  admin's value is validation (blocking an expired table, a missing CRECI), which Payload gives
  via field-level rules rather than three weeks of CRUD.
- *Astro or plain Vite instead of Next.js.* Rejected: the proposal link needs server rendering
  with per-token data and open-tracking, and the studio's existing competence is Next.js.
- *Porting the prototypes' CSS directly.* Rejected: they are single-file documents with their own
  token blocks. Tokens get ported; markup gets rebuilt on shadcn primitives per `CLAUDE.md` §2.
- *Creating all Payload collections now.* Rejected: Lead/Consentimento/Proposta carry LGPD
  obligations that deserve their own task and their own review.

## 3. Why

Phase 0 is ~2 weeks of work that only starts once there is a themed shell. Doing tokens, config
and the signature component first means every subsequent screen inherits the legal constraint
instead of re-implementing it — and the signature is the single most likely thing to be broken by
accident later.

Cost: roughly a day. Risk: low, and reversible — nothing here commits to screen structure. The
one decision that is expensive to undo is Payload, which is why the alternative is recorded
above.

Not doing it costs more: Phase 0 screens built before tokens exist would need retheming, and a
signature re-implemented per screen is exactly how the screenshot test starts failing.

## 4. Affected files

| File | Change type | Notes |
|---|---|---|
| `package.json`, `pnpm-lock.yaml` | new | via `create-next-app`; pnpm only |
| `next.config.ts`, `tsconfig.json`, `.gitignore` | new | generator output, verified not hand-written |
| `src/app/layout.tsx` | new | fonts, metadata shell, both themes |
| `src/app/globals.css` | new | design tokens from `design-handoff.md` §03–04 |
| `src/app/page.tsx` | new | placeholder only — confirms tokens and signature render |
| `src/components/ui/*` | new | shadcn primitives, rethemed (no default radius) |
| `src/components/signature.tsx` | new | CRECI lockup; enforces §06 proportions |
| `src/lib/site-config.ts` | new | `BRAND_NAME`, `BROKER_CRECI` (placeholder), etc. |
| `src/lib/utils.ts` | new | shadcn `cn()` |
| `src/payload/collections/*.ts` | new | Incorporadora, Empreendimento, Tipologia, CondicaoComercial |
| `src/app/(payload)/*` | new | admin route, pt-BR |
| `payload.config.ts` | new | Postgres + S3 adapters |
| `.env.example` | new | `DATABASE_URL`, `PAYLOAD_SECRET`, S3 keys, `SITE_URL` |
| `README.md` | edit | fill in Scripts; move Status to "scaffolded" |
| `CLAUDE.md` | edit | stack table statuses → scaffolded; confirm actual versions installed |

## 5. Done when

- `pnpm dev` runs; `pnpm build` and lint pass.
- `/` renders with correct tokens in light, dark, and unstamped system themes.
- Payload admin loads in pt-BR and the four collections accept a record.
- `Signature` renders in all three variants and satisfies the proportion rules.
- `README.md` and `CLAUDE.md` updated per `CLAUDE.md` §3.
- Committed per `CLAUDE.md` §4.1.

## 6. Explicitly out of scope

Home, listing, pre-qualification, proposal, simulator, admin validation rules, LGPD consent
capture, SEO assets, deployment. Each gets its own task doc.
