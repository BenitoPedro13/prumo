import type { MetadataRoute } from "next";

import { PRIMARY_ROUTES, SITE_ROUTES } from "@/lib/routes";
import { payload } from "@/lib/payload";
import { SITE_URL } from "@/lib/site-config";

/**
 * Only routes that exist. The nav links ahead of the build on purpose (src/lib/routes.ts), so
 * this filters on the same flag rather than keeping a second list that would drift.
 *
 * One entry per published empreendimento, added beside the static routes now that
 * `/empreendimentos` is built (docs/tasks/TASK-empreendimentos.md §9.8).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries = SITE_ROUTES.filter((route) => route.built).map(
    ({ href, changeFrequency, priority }) => ({
      url: new URL(href, SITE_URL).toString(),
      lastModified,
      changeFrequency,
      priority,
    }),
  );

  const catalogo = PRIMARY_ROUTES.find((route) => route.href === "/empreendimentos");
  if (!catalogo?.built) return staticEntries;

  const client = await payload();
  const { docs } = await client.find({
    collection: "empreendimentos",
    where: { _status: { equals: "published" } },
    depth: 0,
    limit: 100,
  });

  const empreendimentoEntries = docs.map((doc) => ({
    url: new URL(`/empreendimentos/${doc.slug}`, SITE_URL).toString(),
    lastModified: new Date(doc.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...empreendimentoEntries];
}
