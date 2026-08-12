import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CondicoesComerciais } from "@/components/condicoes-comerciais";
import { Disponibilidade } from "@/components/disponibilidade";
import { RegistroLegal } from "@/components/registro-legal";
import { TipologiaCard } from "@/components/tipologia-card";
import { WhatsAppAction } from "@/components/whatsapp-action";
import { MODO_LABEL, STATUS_LABEL } from "@/lib/catalogo";
import { formatMonthYear } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { payload } from "@/lib/payload";
import type { CondicoesComerciai } from "@/payload/payload-types";

import {
  condicaoAtual,
  tipologiaMaisBarata,
  toCondicaoComercialResumo,
  toProjecaoIndice,
  toTipologiaResumo,
} from "../mapping";

export async function generateStaticParams() {
  const client = await payload();
  const { docs } = await client.find({
    collection: "empreendimentos",
    where: { _status: { equals: "published" } },
    depth: 0,
    limit: 100,
  });

  return docs.map((doc) => ({ slug: doc.slug }));
}

async function buscarEmpreendimento(slug: string) {
  const client = await payload();
  const { docs } = await client.find({
    collection: "empreendimentos",
    where: { slug: { equals: slug }, _status: { equals: "published" } },
    depth: 1,
    limit: 1,
  });

  return docs[0] ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const empreendimento = await buscarEmpreendimento(slug);
  if (!empreendimento) return pageMetadata({ path: `/empreendimentos/${slug}` });

  return pageMetadata({
    path: `/empreendimentos/${slug}`,
    title: empreendimento.nome,
    description: `${empreendimento.nome}, ${empreendimento.endereco.bairro}, ${empreendimento.endereco.cidade}. Custo total à vista, condições e registro de incorporação.`,
  });
}

export default async function EmpreendimentoFicha({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const empreendimento = await buscarEmpreendimento(slug);
  if (!empreendimento) notFound();

  const client = await payload();

  const [{ docs: tipologias }, parametros] = await Promise.all([
    client.find({
      collection: "tipologias",
      where: { empreendimento: { equals: empreendimento.id } },
      depth: 1,
      limit: 50,
    }),
    client.findGlobal({ slug: "parametros" }),
  ]);

  const tipologiaPrincipal = tipologiaMaisBarata(tipologias);
  let condicao: CondicoesComerciai | null = null;
  if (tipologiaPrincipal) {
    const { docs: condicoes } = await client.find({
      collection: "condicoes-comerciais",
      where: { tipologia: { equals: tipologiaPrincipal.id } },
      depth: 0,
      limit: 20,
    });
    condicao = condicaoAtual(condicoes, tipologiaPrincipal.id);
  }
  const projecao = toProjecaoIndice(parametros);

  const incorporadora =
    typeof empreendimento.incorporadora === "object" ? empreendimento.incorporadora : null;

  const hoje = new Date();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-12 px-6 py-14">
      <section>
        <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
          {STATUS_LABEL[empreendimento.status_obra]}
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-balance">
          {empreendimento.nome}
        </h1>
        <p className="mt-1 text-ink-muted">
          {empreendimento.endereco.bairro}, {empreendimento.endereco.cidade}
        </p>
        {empreendimento.entrega_prevista ? (
          <p className="mt-4 max-w-prose text-sm text-ink-muted">
            Entrega prevista para {formatMonthYear(empreendimento.entrega_prevista)}. O contrato
            prevê uma tolerância de 180 dias além dessa data — não é tática de pressa, é como
            funciona, e prefiro dizer isso agora do que deixar para explicar depois.
          </p>
        ) : null}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl tracking-tight">Onde fica</h2>
        <p className="text-ink">
          {empreendimento.endereco.logradouro}
          {empreendimento.endereco.numero ? `, ${empreendimento.endereco.numero}` : null} —{" "}
          {empreendimento.endereco.bairro}, {empreendimento.endereco.cidade}
        </p>

        {empreendimento.transporte_proximo && empreendimento.transporte_proximo.length > 0 ? (
          <ul className="space-y-1 text-sm text-ink-muted">
            {empreendimento.transporte_proximo.map((ponto, index) => (
              <li key={index}>
                {MODO_LABEL[ponto.modo]} {ponto.nome}
                {typeof ponto.minutos_a_pe === "number" ? ` · ${ponto.minutos_a_pe} min a pé` : null}
              </li>
            ))}
          </ul>
        ) : null}

        {empreendimento.lazer && empreendimento.lazer.length > 0 ? (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
            {empreendimento.lazer.map((item, index) => (
              <li key={index}>{item.item}</li>
            ))}
          </ul>
        ) : null}
      </section>

      {tipologias.length > 0 ? (
        <section className="space-y-4">
          <h2 className="font-display text-xl tracking-tight">Tipologias</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {tipologias.map((tipologia, index) => (
              <TipologiaCard
                key={tipologia.id}
                tipologia={toTipologiaResumo(tipologia)}
                priority={index === 0}
              />
            ))}
          </div>
        </section>
      ) : null}

      {condicao ? (
        <CondicoesComerciais
          condicao={toCondicaoComercialResumo(condicao)}
          projecao={projecao}
          entregaPrevista={empreendimento.entrega_prevista}
          hoje={hoje}
        />
      ) : null}

      <RegistroLegal
        registroIncorporacao={empreendimento.registro_legal.registro_incorporacao}
        cartorio={empreendimento.registro_legal.cartorio}
        incorporadora={incorporadora?.nome ?? "incorporadora"}
      />

      <div className="flex">
        <WhatsAppAction
          label="Consultar disponibilidade"
          context={{ origem: `na ficha do ${empreendimento.nome}`, empreendimento: empreendimento.nome }}
        />
      </div>

      <Disponibilidade atualizadoEm={empreendimento.updatedAt} />
    </div>
  );
}
