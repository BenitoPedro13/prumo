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
