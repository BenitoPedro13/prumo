import type { Metadata } from "next";

import {
  BRAND_NAME,
  BROKER_NAME,
  BROKER_ROLE,
  SITE_LOCALE,
  SITE_URL,
} from "@/lib/site-config";

import "../globals.css";

/**
 * No webfonts anywhere — the type stacks in docs/design-handoff.md §04 are system stacks, so
 * the page carries no font download. That is most of the reason the weight budget in §09 is
 * reachable at all.
 *
 * Her real name sits in the title beside the project name for the same reason it sits in the
 * signature: the pseudonym is only permitted while it does.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND_NAME} · ${BROKER_NAME}, ${BROKER_ROLE}`,
    template: `%s · ${BRAND_NAME}`,
  },
  description:
    "Apartamentos da Cury no Rio de Janeiro, com o custo total à vista e uma orientação honesta sobre crédito antes de escolher o apartamento.",
};

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={SITE_LOCALE} className="h-full">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
