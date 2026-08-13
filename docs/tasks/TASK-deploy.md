# TASK — First deployment

Not a phase unit — infrastructure. Gets a build reachable at a URL so Adriana (and whoever else
needs the link) can look at it without a local clone, ahead of starting the proposal screen.

---

## 1. Current scenario

Nothing is deployed. `README.md`'s Status table has always said "Deployment: None." Locally:

- Postgres runs in Docker; `DATABASE_URL` points at `localhost:5432`.
- `S3_BUCKET` and friends are empty, so Payload's media falls back to local disk
  (`payload.config.ts`'s `hasObjectStorage` check) — fine on a laptop, not on Vercel, whose
  production filesystem is read-only outside `/tmp`.
- No `vercel.json`, no `.vercel/`, no Vercel CLI on this machine, no Neon/Supabase project.
- `/` and `/empreendimentos` prerender from the database at build time, so the build itself needs
  a reachable `DATABASE_URL`, not just the running app.

Everything in `docs/pending-verifications.md` is still placeholder — fake CRECI, fake WhatsApp
number, fake e-mail, invented Cury pricing. Per the user, that's accepted for this deploy: this
is a working preview, not a public launch, and the placeholder-data gate in that doc still
governs when it may be shown to a real buyer.

## 2. Planned changes

1. **Vercel project.** User authenticates locally (`vercel login`, run by them). I run
   `vercel link` to create/connect the project, then `vercel env` to set the variables below
   rather than hand-editing anything in the dashboard where a CLI path exists.
2. **Database.** Provision Postgres through a Vercel-native integration (Neon or Supabase from
   the Marketplace) so `DATABASE_URL` is injected as a Vercel env var rather than pasted by hand.
   Same database serves Preview and Production for now — one environment, not two, since nothing
   is live yet.
3. **Object storage.** Provision an R2 bucket (Cloudflare) for `S3_BUCKET` /
   `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` / `S3_ENDPOINT`. Without it, media uploaded
   through the admin in production wouldn't survive past the request.
4. **Env vars set in Vercel**, mirroring `.env.example`: `DATABASE_URL`, `PAYLOAD_SECRET` (a
   fresh one, `openssl rand -hex 32` — never reuse the local dev secret), `NEXT_PUBLIC_SITE_URL`
   (the Vercel-issued URL, until a domain is chosen), the five `S3_*` vars.
5. **Seed the deployed database** with `pnpm seed` pointed at the new `DATABASE_URL`, so the
   catalogue isn't empty on first load — same seed data already in the repo (Residencial
   Pixinguinha, marked placeholders throughout).
6. **Deploy** with `vercel deploy` (preview) and confirm the build succeeds against the real
   `DATABASE_URL`.
7. **No code changes anticipated.** The Next config and `payload.config.ts` already branch
   correctly on env presence (§1). If the build surfaces something Vercel-specific, that becomes
   its own edit, documented here as it happens.
8. **Not doing:** a custom domain (the brand name itself is still unresolved, §0 of
   `CLAUDE.md`), Production-vs-Preview env separation, or deployment protection/password —
   covered by the "private preview, not a launch" framing the user confirmed.

## 3. Why

Adriana needs to see the current build to review the rail fix and the pré-qualificação flow
described in the last session, and the next unit of work (the proposal screen, `/p/[token]`)
benefits from a real deployed target to test shared links against rather than only `localhost`.
Deploying now, deliberately with placeholder data, also proves out the pipeline (DB, storage,
env vars, seed) before it's load-bearing for a real launch.

## 4. Affected files

| File | Change type | Notes |
|------|-------------|-------|
| `docs/tasks/TASK-deploy.md` | new | this document |
| `.vercel/` | new (gitignored) | created by `vercel link`, already in `.gitignore` |
| Vercel project env vars | new, external | not a repo file — set via `vercel env` |
| `README.md` | edit | Status table: "Deployment: None" → the live state |
| `payload.config.ts` | edit | added `@payloadcms/storage-vercel-blob`, gated by `BLOB_READ_WRITE_TOKEN`, alongside the existing S3 plugin — S3 wins if both are configured |
| `package.json` / `pnpm-lock.yaml` | edit | `@payloadcms/storage-vercel-blob@3.87.1`, pinned to match every other `@payloadcms/*`/`payload` package — 3.88.0 fails Payload's own version-consistency check at runtime |
| `.env.example` | edit | documents `BLOB_READ_WRITE_TOKEN` alongside the still-unused `S3_*` vars |
| `.env` | edit | now points at the same Neon database and Blob store as Preview/Production, per the user's instruction — Docker Postgres is no longer read locally |
| `src/payload/collections/media.ts` | edit | added `access: { read: () => true }` — see §5 |

## 5. What actually happened, and one bug found along the way

**R2 was dropped for this deploy.** It isn't reachable through Vercel's Marketplace CLI — it
needs a separate Cloudflare account and API token — so the user chose Vercel Blob instead,
provisionable in one command. `payload.config.ts` keeps both adapters wired, gated
independently, so moving to R2 later is an env var change, not a code change. Worth revisiting
once Adriana's stack decisions settle.

**Seed data came from the local Docker database, not `pnpm seed`.** The user asked to carry over
whatever was already in local Postgres rather than replay the seed script, so the flow was
`docker exec pg_dump` → `psql` against Neon's unpooled connection string, run from a throwaway
`postgres:16-alpine` container (no `psql` on this machine). Verified row counts after restore.

**Media collection had no `access` block — a pre-existing bug, not something this task
introduced.** Every other collection in `src/payload/collections/` sets `access.read` explicitly
via `../access.ts`; `Media` didn't, so it inherited Payload's own default, which is
`Boolean(user)` — authenticated-only. That was invisible in local dev, where unconfigured
storage serves uploads straight off disk without going through collection access at all. The
moment real object storage (Vercel Blob here, would be equally true of R2) is configured, its
file-serving route proxies through the collection's `read` access function, and every image on
the site started 404ing through a 403 JSON error. Fixed by adding `access: { read: () => true }`
to `media.ts` — these files are rendered on public pages, so gating them was never correct.
Confirmed by re-fetching `/api/media/file/*` directly (200, correct content-type) after the fix
shipped.

**One re-upload was needed.** The Docker-sourced Media rows pointed at local-disk-style paths
(`/api/media/file/*`) with binaries that only ever existed on the laptop's gitignored `media/`
folder. A one-off script (`payload.update()` per doc, passing the same file back through the
now-Blob-configured Local API) re-uploaded each in place, preserving the doc IDs so
`Empreendimento`/`Tipologia` relationships weren't broken. The script was deleted after running
— it isn't meant to be a repeatable command.
