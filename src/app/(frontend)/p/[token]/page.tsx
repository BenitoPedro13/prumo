import { cache } from "react";

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PropostaExpirada } from "@/components/proposta/proposta-expirada";
import { PropostaSheet } from "@/components/proposta/proposta-sheet";
import { payload } from "@/lib/payload";

import { toPropostaResumo } from "../mapping";

/**
 * The shared proposal — `docs/tasks/TASK-proposta.md`. Never cached: `expira_em` is checked
 * against the current instant on every visit, and every visit is itself an event this page
 * writes (§ below), so a stale render would both show a wrong date and silently under-count.
 */
export const dynamic = "force-dynamic";

/**
 * Looked up by `token_publico`, not by id — the token is the only thing the URL carries, and it
 * is deliberately not the document's primary key. `cache()` dedupes this against the second call
 * `generateMetadata` and the page component each make for the same request.
 */
const buscarProposta = cache(async (token: string) => {
  const client = await payload();
  const { docs } = await client.find({
    collection: "propostas",
    where: { token_publico: { equals: token } },
    depth: 2,
    limit: 1,
  });

  return docs[0] ?? null;
});

/**
 * A private link, not a page anyone should find by searching — `robots: { index: false }`
 * mirrors `/sistema`'s posture, for a different reason: that page is hidden because it is
 * internal, this one because it carries one family's real numbers. No canonical, no OG url:
 * `pageMetadata()` assumes a stable public path, which this route deliberately isn't.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const doc = await buscarProposta(token);

  return {
    title: doc ? `Proposta para ${doc.saudacao}` : "Proposta",
    robots: { index: false, follow: false },
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
