import type { Metadata } from "next";
import Link from "next/link";

import { EmpreendimentoCard } from "@/components/empreendimento-card";
import { Signature } from "@/components/signature";
import { WhatsAppAction } from "@/components/whatsapp-action";
import { pageMetadata } from "@/lib/metadata";
import { PRIMARY_ROUTES } from "@/lib/routes";
import { BROKER_NAME } from "@/lib/site-config";

import { listarEmpreendimentosPublicados } from "./empreendimentos/query";

/**
 * The front door — docs/tasks/TASK-home.md.
 *
 * Built last and deliberately simple: it is a table of contents, not a pitch. Its job is to get
 * a visitor to the catálogo, to WhatsApp, or to her face, spending as little of their time and
 * data as possible on the way (docs/design-handoff.md §08).
 *
 * No hero image. The hero is type. A stock render is the convention §01 exists to break, the
 * real places are carried by the cards below, and nothing above the fold but a 72px portrait
 * makes the §09 weight budget true rather than something to measure.
 *
 * The title and description come from the layout's defaults; only the canonical is stated here.
 */
export const metadata: Metadata = pageMetadata({ path: "/" });

/**
 * The one place on the site where the thesis is stated in words rather than in structure.
 *
 * Numbered because the order is the product (docs/product-definition.md §03) — "eu consigo?"
 * genuinely comes before "qual apartamento?", so the numerals carry information instead of
 * decorating three boxes.
 *
 * None of this describes a tool. The pré-qualificação is Phase 1 and does not exist yet; this
 * describes how the conversation with her goes, and it is where that flow's entry point lands
 * when it ships.
 */
const PERGUNTAS = [
  {
    titulo: "Eu consigo?",
    corpo:
      "Renda, entrada e o que pode travar a análise, antes de qualquer visita. Sem consulta a birô e sem documento anexado: é orientação, não análise de crédito. Se hoje ainda não der, você sai sabendo o que mudar primeiro.",
  },
  {
    titulo: "Onde?",
    corpo:
      "Só então o endereço: o bairro, quanto tempo até o trabalho, o que existe na esquina. A planta pesa mais que o render, e ela aparece inteira.",
  },
  {
    titulo: "Quanto, por inteiro",
    corpo:
      "Entrada, parcelas de obra corrigidas pelo INCC, saldo para financiamento e o custo total. Cada parcela em dois números: o de hoje e o da entrega.",
  },
];

/** Four promises the rest of the site already keeps, each checkable on the page it names. */
const PROMESSAS = [
  {
    titulo: "As duas parcelas, sempre juntas",
    corpo:
      "O valor de hoje e o valor corrigido pelo INCC na entrega. Mostrar só o primeiro é a omissão padrão do setor e o principal susto de quem já comprou.",
  },
  {
    titulo: "O custo total, não só a entrada",
    corpo:
      "Entrada, parcelas até as chaves e o saldo que vai para financiamento, somados e à vista na ficha.",
  },
  {
    titulo: "Registro de incorporação e cartório em toda ficha",
    corpo:
      "É o que separa um lançamento registrado de uma promessa. Sem os dois, a ficha não é publicada.",
  },
  {
    titulo: "Disponibilidade se consulta, não se anuncia",
    corpo:
      "O espelho de vendas é da Cury e muda ao longo do dia. Nada aqui reserva unidade, e nada aqui diz que uma unidade está livre.",
  },
];

const SOBRE = PRIMARY_ROUTES.find((route) => route.href === "/sobre");

export default async function Home() {
  const empreendimentos = await listarEmpreendimentosPublicados({ limit: 3 });

  return (
    <div className="mx-auto w-full max-w-4xl space-y-20 px-6 py-16">
      <section className="space-y-6">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
          Rio de Janeiro · Lançamentos da Cury
        </p>
        <h1 className="max-w-prose font-display text-4xl leading-tight tracking-tight text-balance">
          Um apartamento no Rio começa pelo endereço — e pela conta que cabe no seu mês.
        </h1>
        <p className="max-w-prose text-ink-muted">
          {BROKER_NAME} vende lançamentos da Cury em Porto Maravilha, Niterói, Barra da Tijuca
          e Recreio. Antes de escolher o apartamento, a conversa é sobre o que cabe no seu
          orçamento hoje — é essa pergunta que decide o resto.
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <WhatsAppAction context={{ origem: "na página inicial" }} />
          <Link
            href="/empreendimentos"
            className="rounded-sm text-sm text-ink underline underline-offset-4 hover:text-verde"
          >
            Ver os empreendimentos
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-xl tracking-tight">A ordem das perguntas</h2>
        <p className="max-w-prose text-ink-muted">
          Quase todo anúncio do setor começa pela parcela. Aqui a conversa começa uma pergunta
          antes, porque é ela que decide se as outras duas fazem sentido.
        </p>
        <ol className="grid gap-px overflow-hidden rounded-lg border border-rule bg-rule sm:grid-cols-3">
          {PERGUNTAS.map(({ titulo, corpo }, indice) => (
            <li key={titulo} className="space-y-2 bg-sheet p-6">
              <span className="font-mono text-xs tracking-widest text-latao">
                {String(indice + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-lg tracking-tight text-ink">{titulo}</h3>
              <p className="text-sm text-ink-muted">{corpo}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-xl tracking-tight">Onde ela vende</h2>
        <p className="max-w-prose text-ink-muted">
          Poucos empreendimentos, todos da Cury, todos no Rio. A ficha de cada um traz o
          endereço, o acesso, as plantas e o custo total.
        </p>

        {empreendimentos.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {empreendimentos.map((empreendimento) => (
              <li key={empreendimento.slug}>
                <EmpreendimentoCard empreendimento={empreendimento} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="max-w-prose text-sm text-ink-muted">
            Nenhum empreendimento publicado no momento.
          </p>
        )}

        <Link
          href="/empreendimentos"
          className="inline-block rounded-sm text-sm text-ink underline underline-offset-4 hover:text-verde"
        >
          Ver todos os empreendimentos
        </Link>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-xl tracking-tight">O que você vê aqui</h2>
        <dl className="divide-y divide-rule border-t border-b border-rule">
          {PROMESSAS.map(({ titulo, corpo }) => (
            <div key={titulo} className="grid gap-2 py-5 sm:grid-cols-[16rem_1fr] sm:gap-8">
              <dt className="text-sm text-ink">{titulo}</dt>
              <dd className="max-w-prose text-sm text-ink-muted">{corpo}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-xl tracking-tight">Quem está do outro lado</h2>
        <Signature variant="full" />
        <p className="max-w-prose text-ink-muted">
          Quem responde é ela, não um atendimento. {BROKER_NAME} é corretora autônoma: não é
          dona do estoque, não define o preço e não controla a entrega. O que ela controla é a
          informação que chega até você antes da decisão — e é por isso que ela aparece inteira
          aqui.
        </p>
        {SOBRE?.built ? (
          <Link
            href={SOBRE.href}
            className="inline-block rounded-sm text-sm text-ink underline underline-offset-4 hover:text-verde"
          >
            {SOBRE.label}
          </Link>
        ) : null}
      </section>

      <section className="space-y-6 border-t border-rule pt-10">
        <h2 className="max-w-prose font-display text-xl tracking-tight text-balance">
          Se quiser começar, é por aqui.
        </h2>
        <p className="max-w-prose text-ink-muted">
          Sem formulário obrigatório e sem cobrança de resposta. Se preferir deixar seu contato
          para ela retornar, a{" "}
          <Link
            href="/contato"
            className="text-ink underline underline-offset-4 hover:text-verde"
          >
            página de contato
          </Link>{" "}
          tem um formulário curto.
        </p>
        <div className="flex">
          <WhatsAppAction context={{ origem: "no fim da página inicial" }} />
        </div>
      </section>
    </div>
  );
}
