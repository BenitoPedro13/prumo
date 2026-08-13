import type { Metadata } from "next";
import Link from "next/link";

import { WhatsAppAction } from "@/components/whatsapp-action";

/**
 * Catches `notFound()` thrown anywhere under `(frontend)` — a mistyped proposal link
 * (`/p/[token]`), a development slug that's been unpublished (`/empreendimentos/[slug]`) — and,
 * per Next's own docs, unmatched URLs for the group as well. Composed inside
 * `(frontend)/layout.tsx` like any page, so the nav and the signature are already there
 * (CLAUDE.md §0: any screenshot of any screen must contain the complete signature).
 *
 * No exclamation marks, no fabricated urgency — the same copy rule as everywhere else on the
 * site. A 404 is not an emergency, it's a wrong turn.
 */
export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <p className="font-mono text-xs tracking-widest text-latao uppercase">Página não encontrada</p>
      <h1 className="font-display text-3xl tracking-tight text-ink">Essa página não existe.</h1>
      <p className="max-w-prose text-ink-muted">
        O endereço pode ter sido digitado errado, ou o link que você seguiu não é mais válido.
        Volte para o início, ou me chame no WhatsApp que eu ajudo a achar o que você procura.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="rounded-sm text-sm text-ink underline underline-offset-4 hover:text-verde"
        >
          Voltar para o início
        </Link>
        <WhatsAppAction context={{ origem: "num link quebrado" }} />
      </div>
    </div>
  );
}
