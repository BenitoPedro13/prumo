import { revalidatePath } from "next/cache";
import type { RequestContext } from "payload";

/**
 * `revalidatePath` only works inside a Next.js request — it throws
 * "static generation store missing" when a collection hook runs from a standalone script
 * (`payload run`, e.g. `src/payload/seed.ts`). Seed scripts pass `context: { disableRevalidate:
 * true }` on their `create()` calls so the catalogue hooks can skip it there and still fire for
 * every real edit made through the admin, which always runs inside the Next app.
 */
export function revalidateCatalogoPath(path: string, context: RequestContext) {
  if (context.disableRevalidate) return;
  revalidatePath(path);
}

/**
 * A parameter change touches every page that prints a number, not one document's own pages: the
 * INCC feeds each ficha's projected installment, and the MCMV faixas feed the pré-qualificação.
 * Walking the catalogue to list those paths would go stale the first time a page starts showing
 * a figure — so the whole layout is revalidated instead.
 *
 * This is the hook that makes the arrangement true. Without it Adriana can correct a faixa in
 * the admin, see it saved, and watch the site keep serving the prerendered old number
 * (docs/tasks/TASK-pre-qualificacao.md §2.4).
 */
export function revalidateParametros(context: RequestContext) {
  if (context.disableRevalidate) return;
  revalidatePath("/", "layout");
}
