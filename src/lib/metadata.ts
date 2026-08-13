import type { Metadata } from "next";

/**
 * Per-page metadata, built in one place.
 *
 * Canonical URLs cannot live in the root layout the way the nav and the footer can: metadata
 * is inherited, so a canonical set once at the root would have every page in the site claim to
 * be the home page. This helper is the next best thing — a page states its path and gets the
 * canonical, the OG url and the OG title without re-deriving any of it.
 *
 * Two things this function must do, both easy to lose track of:
 *
 * 1. **Mirror `title`/`description` into `twitter`, not just `openGraph`.** Setting `openGraph`
 *    at all replaces the root layout's `openGraph` object wholesale rather than merging with it
 *    (Next merges `metadata` shallowly across segments — see
 *    `node_modules/next/dist/docs/.../generate-metadata.md`, "Overwriting fields"). `twitter`
 *    would silently keep inheriting the root's generic title/description forever if this
 *    function didn't set its own, since nothing here was ever replacing it.
 * 2. **Never set `openGraph.images` here.** Every route gets its own `opengraph-image.tsx` file
 *    instead (`docs/tasks/TASK-seo-metadata-og.md`) — file-convention images reattach to a
 *    route regardless of what its own config-based `openGraph` object contains, which sidesteps
 *    the replace-not-merge problem above entirely. A manually referenced image URL here would
 *    have to guess Next's internal per-build hash for the generated route, which isn't stable
 *    or documented to rely on.
 */
export function pageMetadata({
  path,
  title,
  description,
}: {
  /** Route path, leading slash, no origin. `metadataBase` in the layout supplies the origin. */
  path: string;
  title?: string;
  description?: string;
}): Metadata {
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: { canonical: path },
    openGraph: {
      url: path,
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
    },
    ...(title || description
      ? {
          twitter: {
            // The same replace-not-merge rule applies here: setting `twitter` at all drops
            // the root layout's `card`, not just its title/description, unless restated.
            card: "summary_large_image",
            ...(title ? { title } : {}),
            ...(description ? { description } : {}),
          },
        }
      : {}),
  };
}
