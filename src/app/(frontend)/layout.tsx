import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import {
  BRAND_NAME,
  BROKER_NAME,
  BROKER_ROLE,
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_URL,
} from "@/lib/site-config";

import "../globals.css";

/**
 * No webfonts anywhere — the type stacks in docs/design-handoff.md §04 are system stacks, so
 * the page carries no font download. That is most of the reason the weight budget in §09 is
 * reachable at all. (The OG image is the one exception, and it is not a page: it embeds a font
 * at build time and ships a PNG. See opengraph-image.tsx.)
 *
 * Her real name sits in the title beside the project name for the same reason it sits in the
 * signature: the pseudonym is only permitted while it does.
 *
 * There is no `alternates.canonical` here on purpose. Metadata is inherited, so a canonical
 * declared once at the root would have every page claim to be the home page. Pages declare
 * their own through `pageMetadata()` in src/lib/metadata.ts.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND_NAME} · ${BROKER_NAME}, ${BROKER_ROLE}`,
    template: `%s · ${BRAND_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: `${BRAND_NAME} · ${BROKER_NAME}`,
    title: `${BRAND_NAME} · ${BROKER_NAME}, ${BROKER_ROLE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} · ${BROKER_NAME}, ${BROKER_ROLE}`,
    description: SITE_DESCRIPTION,
  },
};

/**
 * The nav and the footer live here rather than in pages, so the signature is not something a
 * screen has to remember (CLAUDE.md §0). `main` carries no container: the pre-qualification is
 * full-bleed on a deep green ground, so each screen sets its own width.
 */
export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={SITE_LOCALE} className="h-full">
      <body className="flex min-h-full flex-col">
        <SiteNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
