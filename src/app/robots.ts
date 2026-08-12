import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site-config";

/**
 * This is the one file that sits directly under `src/app/`, against the convention in
 * CLAUDE.md §4, and it has to: Next matches `robots` (and `manifest`) with a regex anchored at
 * the app root, so inside the `(frontend)` route group it is silently not a metadata route and
 * `/robots.txt` 404s. `sitemap`, `icon` and `opengraph-image` are matched unanchored, which is
 * why they live with the rest of the frontend. It is a route handler, not a layout or a page,
 * so it does not disturb Payload's root layout.
 *
 * `/p/` is the one worth explaining. The proposal route does not exist until Phase 1, but a
 * proposal link carries one buyer's income, their entrada and their name, and it must not be
 * indexable on the day it first ships. Writing the rule now costs a line; remembering it in
 * four months costs whatever it costs.
 *
 * `/sistema` is unlinked and declares `noindex` itself; this is the second lock.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/sistema", "/p/"],
    },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
