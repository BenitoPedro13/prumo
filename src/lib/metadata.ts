import type { Metadata } from "next";

/**
 * Per-page metadata, built in one place.
 *
 * Canonical URLs cannot live in the root layout the way the nav and the footer can: metadata
 * is inherited, so a canonical set once at the root would have every page in the site claim to
 * be the home page. This helper is the next best thing — a page states its path and gets the
 * canonical, the OG url and the OG title without re-deriving any of it.
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
  };
}
