import type { EmpreendimentoResumo, StatusObra } from "@/lib/catalogo";
import { payload } from "@/lib/payload";
import type { Empreendimento } from "@/payload/payload-types";

import { toEmpreendimentoResumo } from "./mapping";

/**
 * The published catalogue, read once and ordered one way.
 *
 * Colocated with the routes for the same reason `mapping.ts` is: this folder is the one place
 * allowed to know the schema. The home imports it across route folders, which is fine — only
 * `page.tsx` and `route.ts` are routes, the rest are plain modules.
 *
 * It lives here rather than inside the listing page because the home shows the first three of
 * the same list (docs/tasks/TASK-home.md §2.1). Two copies of the sort would eventually
 * disagree about what a buyer sees first, and that is not a bug anyone would notice quickly.
 */

/** Fewer than ten developments; a filter bar would be furniture (TASK-empreendimentos §2.3). */
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

export async function listarEmpreendimentosPublicados({
  limit,
}: { limit?: number } = {}): Promise<EmpreendimentoResumo[]> {
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
  const visiveis = typeof limit === "number" ? ordenados.slice(0, limit) : ordenados;

  return visiveis.map((empreendimento) =>
    toEmpreendimentoResumo(
      empreendimento,
      tipologiasPorEmpreendimento.get(empreendimento.id) ?? [],
    ),
  );
}
