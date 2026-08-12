import type { Metadata } from "next";

import { EmpreendimentoCard } from "@/components/empreendimento-card";
import type { StatusObra } from "@/lib/catalogo";
import { pageMetadata } from "@/lib/metadata";
import { payload } from "@/lib/payload";
import type { Empreendimento } from "@/payload/payload-types";

import { toEmpreendimentoResumo } from "./mapping";

export const metadata: Metadata = pageMetadata({
  path: "/empreendimentos",
  title: "Empreendimentos",
  description: "Lançamentos da Cury no Rio de Janeiro, com o custo total à vista.",
});

/** Fewer than ten developments; a filter bar would be furniture (§2.3). */
const ORDEM_STATUS: Record<StatusObra, number> = {
  lancamento: 0,
  em_obras: 1,
  entregue: 2,
};

function porStatusEEntrega(a: Empreendimento, b: Empreendimento) {
  const statusDiff = ORDEM_STATUS[a.status_obra] - ORDEM_STATUS[b.status_obra];
  if (statusDiff !== 0) return statusDiff;

  if (!a.entrega_prevista) return 1;
  if (!b.entrega_prevista) return -1;

  return new Date(a.entrega_prevista).getTime() - new Date(b.entrega_prevista).getTime();
}

export default async function Empreendimentos() {
  const client = await payload();

  const { docs: empreendimentos } = await client.find({
    collection: "empreendimentos",
    where: { _status: { equals: "published" } },
    depth: 0,
    limit: 100,
  });

  const { docs: tipologias } = await client.find({
    collection: "tipologias",
    depth: 0,
    limit: 500,
  });

  const tipologiasPorEmpreendimento = new Map<number, typeof tipologias>();
  for (const tipologia of tipologias) {
    const id = typeof tipologia.empreendimento === "object"
      ? tipologia.empreendimento.id
      : tipologia.empreendimento;
    const lista = tipologiasPorEmpreendimento.get(id) ?? [];
    lista.push(tipologia);
    tipologiasPorEmpreendimento.set(id, lista);
  }

  const ordenados = [...empreendimentos].sort(porStatusEEntrega);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-14">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
        Empreendimentos
      </p>
      <h1 className="mt-2 max-w-prose font-display text-3xl tracking-tight text-balance">
        Lançamentos da Cury no Rio, um a um.
      </h1>
      <p className="mt-4 max-w-prose text-ink-muted">
        Bairro e acesso primeiro — é o que uma família realmente escolhe entre um endereço e
        outro. A faixa de preço é indicativa; a conversa sobre o que cabe no seu orçamento vem
        antes da escolha do apartamento.
      </p>

      {ordenados.length > 0 ? (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {ordenados.map((empreendimento) => (
            <li key={empreendimento.id}>
              <EmpreendimentoCard
                empreendimento={toEmpreendimentoResumo(
                  empreendimento,
                  tipologiasPorEmpreendimento.get(empreendimento.id) ?? [],
                )}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 max-w-prose text-sm text-ink-muted">
          Nenhum empreendimento publicado no momento.
        </p>
      )}
    </div>
  );
}
