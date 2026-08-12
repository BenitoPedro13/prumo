import Link from "next/link";

import { Signature } from "@/components/signature";
import { WhatsAppAction } from "@/components/whatsapp-action";
import { PRIMARY_ROUTES } from "@/lib/routes";
import { BRAND_NAME, BROKER_NAME } from "@/lib/site-config";

/**
 * Rendered by the layout, never by a page — that is the point of it. The signature is a legal
 * requirement on every surface (CLAUDE.md §0), and a page that cannot choose cannot forget.
 *
 * No menu component and no JavaScript. Three links and one action wrap onto a second row at
 * narrow widths and that is the entire mobile treatment: a drawer would be a dependency, a
 * hydration cost and a focus trap to get right, for four items, on a page-weight budget that
 * exists because much of this audience pays for data by the megabyte.
 */
export function SiteNav() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-6 py-4">
        <Link
          href="/"
          aria-label={`${BRAND_NAME} — ${BROKER_NAME}, início`}
          className="rounded-sm"
        >
          <Signature variant="header" />
        </Link>

        <nav
          aria-label="Principal"
          className="flex flex-wrap items-center gap-x-6 gap-y-3"
        >
          {PRIMARY_ROUTES.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-sm text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline"
            >
              {label}
            </Link>
          ))}
          <WhatsAppAction context={{ origem: "no cabeçalho do site" }} />
        </nav>
      </div>
    </header>
  );
}
