import type { Metadata } from "next";

import { Signature } from "@/components/signature";
import { pageMetadata } from "@/lib/metadata";
import { BROKER_NAME } from "@/lib/site-config";

/**
 * Sobre ela — docs/tasks/TASK-sobre.md, unit 4 and the last of Phase 0.
 *
 * `docs/design-handoff.md` §08 calls this screen "face and story" and says trust is the
 * product. Half of that is here and half is not: the repo holds no biographical facts about
 * her, so the page is built from what is already asserted elsewhere in the product — what she
 * controls, what she does not, and how she works — and the personal history is a marked
 * placeholder rather than invented prose. Inventing experience for a real person on a public
 * page is a COFECI exposure as much as a copy failure (§6 of the task doc).
 *
 * No hero portrait. `Signature variant="full"` carries the photo at 72px, which is what §06
 * requires on this page, and the stand-in is 180×179 — anything larger would be an upscale on
 * the one page whose subject is her face.
 */
export const metadata: Metadata = pageMetadata({
  path: "/sobre",
  title: "Sobre Adriana",
  description:
    "Adriana Monteiro é corretora de imóveis autônoma no Rio de Janeiro e revende lançamentos da Cury. O que está na mão dela, o que não está, e como ela trabalha.",
});

/**
 * Written from her side of the conversation, where the home's `PERGUNTAS` are written from the
 * buyer's. Same order — crédito antes do apartamento — because the order is the product; the
 * change of person is what keeps the two pages from reading as the same block twice.
 */
const COMO_TRABALHA = [
  {
    titulo: "Ela começa pela conta, não pelo apartamento",
    corpo:
      "Antes de marcar visita, a conversa é sobre renda, entrada e o que pode travar a análise. É orientação, não análise de crédito: quem aprova é o banco. Se hoje ainda não der, você sai sabendo o que mudar primeiro.",
  },
  {
    titulo: "Ela mostra o custo inteiro",
    corpo:
      "Entrada, parcelas até as chaves corrigidas pelo INCC, saldo que vai para financiamento e o total. Cada parcela em dois números: o de hoje e o da entrega.",
  },
  {
    titulo: "Ela manda a planta, não só o render",
    corpo:
      "A planta diz o que cabe onde. O endereço diz quanto tempo você leva para o trabalho. As duas coisas decidem mais do que a imagem da fachada.",
  },
];

/** Each of these is a rule the rest of the site already keeps, so the page is checkable. */
const NAO_FAZ = [
  {
    titulo: "Dizer que uma unidade está disponível",
    corpo:
      "O espelho de vendas é da Cury e muda ao longo do dia. Ela consulta e volta com a resposta e a hora em que consultou.",
  },
  {
    titulo: "Chamar orientação de análise de crédito",
    corpo:
      "Sem consulta a birô, sem documento anexado e sem promessa de aprovação. A análise é da Cury e do banco, e ela encaminha você para ela.",
  },
  {
    titulo: "Mostrar uma parcela sozinha",
    corpo:
      "Mostrar só o valor de hoje é a omissão padrão do setor e o principal susto de quem já comprou na planta. Aqui os dois números andam juntos.",
  },
  {
    titulo: "Apressar a sua decisão",
    corpo:
      "Sem contagem regressiva, sem última unidade e sem cobrança de resposta. Comprar um apartamento é a maior decisão financeira da maioria das famílias e leva o tempo que levar.",
  },
];

export default function Sobre() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-12 px-6 py-14">
      <section className="space-y-6">
        <h1 className="max-w-prose font-display text-3xl tracking-tight text-balance">
          Quem responde do outro lado.
        </h1>
        <Signature variant="full" />
        <p className="max-w-prose text-ink-muted">
          {BROKER_NAME} é corretora de imóveis autônoma no Rio de Janeiro e revende lançamentos
          da Cury em Porto Maravilha, Niterói, Barra da Tijuca e Recreio. Quem atende é ela, não
          uma equipe de plantão.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-xl tracking-tight">
          O que está na mão dela, e o que não está
        </h2>
        <p className="max-w-prose text-ink-muted">
          Ela não é dona do estoque, não define o preço da tabela e não controla a data de
          entrega. Isso é da construtora. Vale dizer com todas as letras, porque muita coisa no
          setor é anunciada como se fosse o contrário.
        </p>
        <p className="max-w-prose text-ink-muted">
          O que está na mão dela é a informação que chega até você antes da decisão: o custo
          completo em vez da parcela isolada, o registro de incorporação em vez da promessa, e
          uma conversa sobre crédito antes de qualquer visita. É pouco em número de itens e é
          quase tudo em consequência.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-xl tracking-tight">Como ela trabalha</h2>
        <dl className="divide-y divide-rule border-t border-b border-rule">
          {COMO_TRABALHA.map(({ titulo, corpo }) => (
            <div key={titulo} className="grid gap-2 py-5 sm:grid-cols-[16rem_1fr] sm:gap-8">
              <dt className="text-sm text-ink">{titulo}</dt>
              <dd className="max-w-prose text-sm text-ink-muted">{corpo}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-xl tracking-tight">O que ela não vai fazer</h2>
        <dl className="divide-y divide-rule border-t border-b border-rule">
          {NAO_FAZ.map(({ titulo, corpo }) => (
            <div key={titulo} className="grid gap-2 py-5 sm:grid-cols-[16rem_1fr] sm:gap-8">
              <dt className="text-sm text-ink">{titulo}</dt>
              <dd className="max-w-prose text-sm text-ink-muted">{corpo}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/*
        The story half of §08's "face and story". Deliberately empty of prose: the four questions
        below are what the block needs from her, and one conversation answers all of them. This
        marker must not reach production — TASK-sobre.md §6.
      */}
      <section className="space-y-4 rounded-lg border border-dashed border-rule p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-latao">
          Placeholder · a confirmar com Adriana
        </p>
        <h2 className="font-display text-xl tracking-tight">A história dela</h2>
        <p className="max-w-prose text-sm text-ink-muted">
          [VERIFICAR: história profissional — confirmar com Adriana antes de publicar]
        </p>
        <ul className="max-w-prose list-disc space-y-1 pl-5 text-sm text-ink-muted">
          <li>Há quanto tempo ela é corretora de imóveis.</li>
          <li>O que ela fazia antes.</li>
          <li>Por que Minha Casa Minha Vida e por que os lançamentos no Rio.</li>
          <li>Uma frase dela sobre o que quer que um comprador sinta ao sair da conversa.</li>
        </ul>
      </section>
    </div>
  );
}
