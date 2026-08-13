import type { Metadata } from "next";

import { EmpreendimentoCard } from "@/components/empreendimento-card";
import { pageMetadata } from "@/lib/metadata";

import { listarEmpreendimentosPublicados } from "./query";

export const metadata: Metadata = pageMetadata({
  path: "/empreendimentos",
  title: "Empreendimentos",
  description: "Lançamentos da Cury no Rio de Janeiro, com o custo total à vista.",
});

export default async function Empreendimentos() {
  const empreendimentos = await listarEmpreendimentosPublicados();

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

      {empreendimentos.length > 0 ? (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {empreendimentos.map((empreendimento) => (
            <li key={empreendimento.slug}>
              <EmpreendimentoCard empreendimento={empreendimento} />
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
