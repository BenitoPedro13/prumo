import type { MetadataRoute } from "next";

import { SITE_ROUTES } from "@/lib/routes";
import { SITE_URL } from "@/lib/site-config";

/**
 * Only routes that exist. The nav links ahead of the build on purpose (src/lib/routes.ts), so
 * this filters on the same flag rather than keeping a second list that would drift.
 *
 * Unit 2 adds the empreendimentos, one entry per development, once there is a database behind
 * them.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return SITE_ROUTES.filter((route) => route.built).map(
    ({ href, changeFrequency, priority }) => ({
      url: new URL(href, SITE_URL).toString(),
      lastModified,
      changeFrequency,
      priority,
    }),
  );
}
