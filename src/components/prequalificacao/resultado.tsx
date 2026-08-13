"use client";

import Link from "next/link";

import { OQueReprova } from "@/components/prequalificacao/o-que-reprova";
import { ValoresIlustrativos } from "@/components/valores-ilustrativos";
import { WhatsAppAction } from "@/components/whatsapp-action";
import { Button } from "@/components/ui/button";
import { formatBRL, formatPercent } from "@/lib/format";
import { faixaCompleta, type FaixaMcmv } from "@/lib/mcmv";
import type {
  FolgaNoOrcamento,
  Impedimento,
  ResultadoPreQualificacao,
} from "@/lib/prequalificacao";
import { cn } from "@/lib/utils";

/**
 * The five exits — docs/tasks/TASK-pre-qualificacao.md §2.1.
 *
 * Two of them are the ones the flow was designed around, and the second is the one that
 * matters: telling someone with a restriction "hoje ainda não, e aqui está exatamente o que
 * mudar primeiro" is the opposite of what the sector does. It converts a permanent no into a
 * lead that comes back in six months (product-definition.md §03). It is written to be read by
 * someone who has just been told no, so it names what to do, not what went wrong.
 *
 * Nothing here approves anything, and every figure says so. The last step of every exit is a
 * WhatsApp conversation, never a link to Cury: the credit analysis handoff is broker-initiated
 * and cannot be deep-linked, so Adriana receives the link and pastes it herself (§03).
 */

const IMPEDIMENTO_COPY: Record<Impedimento, { titulo: string; oQueFazer: string }> = {
  nome_negativado: {
    titulo: "Seu nome precisa estar limpo",
    oQueFazer:
      "Negocie e quite o que está em atraso, e confira depois se o cadastro já foi atualizado. Costuma levar algumas semanas até sair. É o item mais comum e o que mais rápido se resolve.",
  },
  imovel_no_nome: {
    titulo: "Você já tem um imóvel no seu nome",
    oQueFazer:
      "O programa é para quem não tem imóvel residencial, em nenhuma cidade. Existem outras linhas de financiamento fora do MCMV, e a Adriana pode explicar como funcionam.",
  },
  ja_usou_o_programa: {
    titulo: "Você já comprou pelo Minha Casa Minha Vida",
    oQueFazer:
      "O benefício é uma vez por pessoa. Se a compra anterior foi no nome de outra pessoa da família, vale conferir — quem entra no financiamento é quem conta.",
  },
};

const FOLGA_COPY: Record<FolgaNoOrcamento, string> = {
  confortavel: "A parcela que você falou cabe com folga no que o banco aceita.",
  no_limite:
    "A parcela que você falou fica no limite do que o banco aceita. Funciona no papel, e aperta num mês fora da curva.",
  acima:
    "A parcela que você falou passa do que o banco costuma aceitar para essa renda. Dá para ajustar com uma entrada maior ou uma unidade menor.",
};

export function Resultado({
  resultado,
  valoresSugeridos,
  fonte,
  dataRevisao,
  onRecomecar,
}: {
  resultado: ResultadoPreQualificacao;
  valoresSugeridos: boolean;
  fonte?: string | null;
  dataRevisao?: string | null;
  onRecomecar: () => void;
}) {
  const strip = valoresSugeridos ? (
    <ValoresIlustrativos fonte={fonte} dataRevisao={dataRevisao} />
  ) : null;

  if (resultado.saida === "sem_parametros") {
    return (
      <Saida
        titulo="Ainda não dá para responder isso aqui."
        texto="As faixas do programa não estão configuradas no site neste momento, e preferimos não estimar. Fale com a Adriana — ela responde com os números atuais."
        origem="no simulador, quando ele não conseguiu calcular"
        onRecomecar={onRecomecar}
      />
    );
  }

  if (resultado.saida === "acima_das_faixas") {
    return (
      <Saida
        titulo="Sua renda está acima do Minha Casa Minha Vida."
        texto="O programa tem teto de renda, e a sua passa dele. Isso não é um problema: significa que o caminho é outro, com financiamento comum, e normalmente com mais opções de imóvel do que o programa permite. Vale conversar."
        origem="no simulador, com renda acima do teto do programa"
        onRecomecar={onRecomecar}
      />
    );
  }

  if (resultado.saida === "fora_do_programa") {
    return (
      <Saida
        titulo="Pelo programa, hoje não dá."
        texto="Uma coisa que você respondeu fecha a porta do Minha Casa Minha Vida — não é papel que falta, é regra do programa. Fora dele ainda existe caminho, e é melhor saber disso agora do que depois de juntar documento."
        origem="no simulador, fora das regras do programa"
        onRecomecar={onRecomecar}
      >
        <ListaImpedimentos impedimentos={resultado.impedimentos} />
      </Saida>
    );
  }

  if (resultado.saida === "hoje_ainda_nao") {
    return (
      <Saida
        titulo="Hoje ainda não — e dá para mudar isso."
        texto="Pela sua renda você entra no programa. O que trava é outra coisa, e é uma coisa que se resolve. Abaixo está o que mudar primeiro, na ordem. Quando estiver resolvido, volte aqui."
        origem="no simulador, com uma pendência para resolver antes"
        estado="crooked"
        onRecomecar={onRecomecar}
      >
        <Faixa faixa={resultado.faixa} />
        <ListaImpedimentos impedimentos={resultado.impedimentos} />
        <p className="max-w-prose text-sm text-ink-muted">{FOLGA_COPY[resultado.folga]}</p>
        {strip}
        <OQueReprova className="pt-2" />
      </Saida>
    );
  }

  return (
    <Saida
      titulo="Vale conversar."
      texto="Nada do que você respondeu trava o processo. Isso não é aprovação — quem aprova é a Caixa, e só depois de analisar os documentos. Mas é o suficiente para valer o próximo passo."
      origem="no simulador, com tudo indicando que dá para seguir"
      estado="aligned"
      onRecomecar={onRecomecar}
    >
      <Faixa faixa={resultado.faixa} />

      <div className="rounded-lg border border-rule bg-sheet p-4">
        <p className="text-sm text-ink-muted">Parcela que o banco costuma aceitar</p>
        <p className="mt-1 font-display text-2xl tabular-nums text-ink">
          até {formatBRL(resultado.teto)} por mês
        </p>
        <p className="mt-2 max-w-prose text-sm text-ink-muted">
          {FOLGA_COPY[resultado.folga]}
        </p>
      </div>

      {resultado.podeUsarFgts ? (
        <p className="max-w-prose text-sm text-ink-muted">
          Com três anos ou mais de carteira somados, você pode usar o FGTS na entrada. Costuma
          ser a diferença entre a conta fechar e não fechar, e muita gente não sabe que tem.
        </p>
      ) : null}

      {strip}

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline" className="h-11 px-4 text-base font-normal">
          <Link href="/empreendimentos">Ver o que ela representa</Link>
        </Button>
      </div>

      <OQueReprova className="pt-2" />
    </Saida>
  );
}

/** The faixa, stated plainly. Ceiling and rate appear only when the admin has both — the same
 * gate `faixaCompleta` enforces everywhere else. */
function Faixa({ faixa }: { faixa: FaixaMcmv }) {
  const completa = faixaCompleta(faixa);

  return (
    <div className="rounded-lg border border-rule bg-sheet p-4">
      <p className="text-sm text-ink-muted">Pela renda que você informou</p>
      <p className="mt-1 font-display text-2xl tracking-tight text-ink">{faixa.nome}</p>

      {completa ? (
        <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-3 sm:block">
            <dt className="text-ink-muted">Imóvel até</dt>
            <dd className="tabular-nums text-ink">{formatBRL(faixa.tetoImovel as number)}</dd>
          </div>
          <div className="flex justify-between gap-3 sm:block">
            <dt className="text-ink-muted">Juros a partir de</dt>
            <dd className="tabular-nums text-ink">
              {formatPercent((faixa.taxaJurosAnual as number) / 100)} ao ano
            </dd>
          </div>
          {typeof faixa.subsidioMaximo === "number" && faixa.subsidioMaximo > 0 ? (
            <div className="flex justify-between gap-3 sm:block">
              <dt className="text-ink-muted">Subsídio de até</dt>
              <dd className="tabular-nums text-ink">{formatBRL(faixa.subsidioMaximo)}</dd>
            </div>
          ) : null}
        </dl>
      ) : (
        <p className="mt-2 max-w-prose text-sm text-ink-muted">
          As condições desta faixa ainda estão sendo confirmadas na Caixa. A Adriana passa os
          números atuais na conversa.
        </p>
      )}
    </div>
  );
}

function ListaImpedimentos({ impedimentos }: { impedimentos: Impedimento[] }) {
  return (
    <ol className="space-y-3">
      {impedimentos.map((impedimento, index) => {
        const { titulo, oQueFazer } = IMPEDIMENTO_COPY[impedimento];

        return (
          <li key={impedimento} className="flex gap-4 rounded-lg border border-rule p-4">
            <span
              aria-hidden
              className="mt-0.5 font-mono text-sm text-latao tabular-nums"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="text-base text-ink">{titulo}</p>
              <p className="mt-1 max-w-prose text-sm text-ink-muted">{oQueFazer}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** The shell every exit shares: verdict, explanation, the one action, and the way back. */
function Saida({
  titulo,
  texto,
  origem,
  estado,
  children,
  onRecomecar,
}: {
  titulo: string;
  texto: string;
  origem: string;
  estado?: "aligned" | "crooked";
  children?: React.ReactNode;
  onRecomecar: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2
          className={cn(
            "max-w-prose font-display text-3xl tracking-tight text-balance",
            estado === "crooked" ? "text-latao-ink" : "text-ink",
          )}
        >
          {titulo}
        </h2>
        <p className="max-w-prose text-ink-muted">{texto}</p>
      </div>

      {children}

      <div className="flex flex-wrap items-center gap-3 border-t border-rule pt-6">
        <WhatsAppAction context={{ origem }} />
        <Button
          type="button"
          variant="ghost"
          onClick={onRecomecar}
          className="h-11 px-3 text-sm font-normal text-ink-muted"
        >
          Refazer as perguntas
        </Button>
      </div>

      <p className="max-w-prose text-xs text-ink-muted">
        Isto é uma orientação, não uma análise de crédito. Nada foi consultado no seu CPF e
        nenhuma resposta sua foi guardada. Quem aprova o financiamento é a Caixa.
      </p>
    </div>
  );
}
