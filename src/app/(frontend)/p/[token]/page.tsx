import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PropostaExpirada } from "@/components/proposta/proposta-expirada";
import { PropostaSheet } from "@/components/proposta/proposta-sheet";
import { payload } from "@/lib/payload";

import { buscarProposta, toPropostaResumo } from "../mapping";

/**
 * The shared proposal — `docs/tasks/TASK-proposta.md`. Never cached: `expira_em` is checked
 * against the current instant on every visit, and every visit is itself an event this page
 * writes (§ below), so a stale render would both show a wrong date and silently under-count.
 */
export const dynamic = "force-dynamic";

/**
 * A private link, not a page anyone should find by searching — `robots: { index: false }`
 * mirrors `/sistema`'s posture, for a different reason: that page is hidden because it is
 * internal, this one because it carries one family's real numbers.
 *
 * Sets its own `openGraph` rather than going through `pageMetadata()` — this is the page most
 * likely to actually be shared (product-definition.md §08: WhatsApp, far more than search), and
 * the one addressed to a specific person by name, so the generic site preview is the wrong
 * default here more than anywhere else (`docs/tasks/TASK-seo-metadata-og.md`). The image comes
 * from `opengraph-image.tsx` in this same segment, so nothing needs to reference it manually.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const doc = await buscarProposta(token);
  const titulo = doc ? `Proposta para ${doc.saudacao}` : "Proposta";

  return {
    title: titulo,
    robots: { index: false, follow: false },
    openGraph: { title: titulo, description: "Uma proposta feita para você, com a conta inteira." },
    twitter: { card: "summary_large_image", title: titulo },
  };
}

export default async function Proposta({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const doc = await buscarProposta(token);
  if (!doc) notFound();

  const hoje = new Date();
  const expirada = new Date(doc.expira_em).getTime() < hoje.getTime();

  if (expirada) {
    return <PropostaExpirada saudacao={doc.saudacao} expiraEm={doc.expira_em} />;
  }

  /**
   * Written directly in the server component during a plain GET, not behind a Server Action —
   * there is nothing submitted here to gate behind one. It stays inside the same boundary
   * CLAUDE.md already draws (reads and writes go through the Local API; the public
   * REST/GraphQL surface stays closed), just on the write side of it for the first time. See
   * `docs/tasks/TASK-proposta.md` §2.
   */
  const client = await payload();
  await client.update({
    collection: "propostas",
    id: doc.id,
    data: {
      eventos_de_abertura: [...(doc.eventos_de_abertura ?? []), { aberto_em: hoje.toISOString() }],
    },
    context: { disableRevalidate: true },
  });

  const resumo = toPropostaResumo(doc);

  return <PropostaSheet proposta={resumo} />;
}
