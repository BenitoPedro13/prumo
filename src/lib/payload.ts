import { getPayload } from "payload";

import config from "@payload-config";

/**
 * The catalogue pages read through Payload's Local API, not REST or GraphQL: it runs in the
 * same process, so a server component reads the database directly with no HTTP hop and no
 * second serialisation (docs/tasks/TASK-empreendimentos.md §2.1). `getPayload()` already caches
 * its instance per process — this wrapper only fixes the one import site.
 */
export function payload() {
  return getPayload({ config });
}
