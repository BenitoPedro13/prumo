"use client";

import { useState } from "react";

import { PlumbRail, type PlumbState } from "@/components/plumb-rail";
import { CampoRenda } from "@/components/prequalificacao/campo-renda";
import { Escolha, EscolhaSimNao } from "@/components/prequalificacao/escolha";
import { Passo } from "@/components/prequalificacao/passo";
import { Resultado } from "@/components/prequalificacao/resultado";
import { Button } from "@/components/ui/button";
import { avaliarEnquadramento, type ParametrosMcmv } from "@/lib/mcmv";
import {
  avaliarPreQualificacao,
  TETO_COMPROMETIMENTO,
  type Respostas,
  type TempoCarteira,
} from "@/lib/prequalificacao";

/**
 * The six-step flow — docs/tasks/TASK-pre-qualificacao.md, and
 * docs/design/prototypes/pre-qualificacao.html for the reference it was built from.
 *
 * Three properties are deliberate and load-bearing:
 *
 * **Nothing is persisted.** The answers describe someone's income and their debts. They live in
 * this component's state for the length of the visit: no Server Action, no fetch, no
 * localStorage, nothing written to the database. Closing the tab is a complete deletion, which
 * is the only privacy promise worth making and the reason this screen adds no LGPD surface to
 * the one `/contato` already accepted.
 *
 * **One question per screen.** Six questions on one page is a form, and a form is what the
 * competition sends. One at a time with its own explanation is a conversation, and it is also
 * the only shape in which the plumb rail means anything.
 *
 * **The rail is the progress and then the verdict.** It hangs while the flow runs, and at the
 * end it either comes to plumb or reports a face out of true. That is the §07 apparatus doing
 * the one job it was built for (design-handoff.md §07); everywhere else on the site it would
 * be decoration.
 */

type Passos = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

const TOTAL_PERGUNTAS = 6;

const CARTEIRA: { value: TempoCarteira; label: string; nota?: string }[] = [
  {
    value: "3_anos_ou_mais",
    label: "Sim, três anos ou mais somados",
    nota: "Somando todos os contratos da vida, não só o atual. Isso libera o FGTS na entrada.",
  },
  { value: "menos_de_3_anos", label: "Sim, menos de três anos" },
  { value: "nao_tenho", label: "Não tenho carteira assinada", nota: "Autônomo, MEI ou informal." },
];

export function Fluxo({
  parametros,
  valoresSugeridos,
}: {
  parametros: ParametrosMcmv;
  valoresSugeridos: boolean;
}) {
  const [passo, setPasso] = useState<Passos>(0);
  const [rendaBruta, setRendaBruta] = useState<number | null>(null);
  const [tempoCarteira, setTempoCarteira] = useState<TempoCarteira | null>(null);
  const [imovelNoNome, setImovelNoNome] = useState<boolean | null>(null);
  const [jaUsouMcmv, setJaUsouMcmv] = useState<boolean | null>(null);
  const [nomeLimpo, setNomeLimpo] = useState<boolean | null>(null);
  const [parcelaConfortavel, setParcelaConfortavel] = useState<number | null>(null);

  const avancar = () => setPasso((atual) => (atual + 1) as Passos);
  const voltar = () => setPasso((atual) => (atual - 1) as Passos);

  const recomecar = () => {
    setRendaBruta(null);
    setTempoCarteira(null);
    setImovelNoNome(null);
    setJaUsouMcmv(null);
    setNomeLimpo(null);
    setParcelaConfortavel(null);
    setPasso(0);
  };

  const resultado =
    passo === 7 && rendaBruta !== null && tempoCarteira !== null
      ? avaliarPreQualificacao(
          {
            rendaBruta,
            tempoCarteira,
            imovelNoNome: imovelNoNome ?? false,
            jaUsouMcmv: jaUsouMcmv ?? false,
            nomeLimpo: nomeLimpo ?? true,
            parcelaConfortavel,
          } satisfies Respostas,
          avaliarEnquadramento({ rendaBruta }, parametros),
        )
      : null;

  const estado: PlumbState = resultado
    ? resultado.saida === "vale_conversar"
      ? "aligned"
      : resultado.saida === "sem_parametros"
        ? "hanging"
        : "crooked"
    : "hanging";

  /** The bob rests on the notch of the question being asked, and stays on the last one for the
   * result — the reading is the state, not a seventh notch. */
  const notch = Math.min(Math.max(passo - 1, 0), TOTAL_PERGUNTAS - 1);

  return (
    <div className="flex gap-6 sm:gap-10">
      <PlumbRail
        notches={TOTAL_PERGUNTAS}
        current={notch}
        state={estado}
        label="Progresso das perguntas"
        className="shrink-0"
      />

      <div className="min-w-0 flex-1 pb-4">
        {passo === 0 ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="max-w-prose font-display text-3xl tracking-tight text-balance">
                Você vai saber se consegue, hoje.
              </h1>
              <p className="max-w-prose text-ink-muted">
                Seis perguntas, cerca de um minuto. No fim você fica sabendo em que faixa do
                programa entra, quanto costuma caber no seu mês, e o que pode travar antes de
                você juntar um documento sequer.
              </p>
            </div>

            <div className="rounded-lg border border-rule bg-sheet p-4">
              <h2 className="font-display text-base tracking-tight">Por que perguntar isso</h2>
              <p className="mt-1 max-w-prose text-sm text-ink-muted">
                Em imóvel na planta a angústia não é escolher o apartamento, é saber se o
                financiamento sai. Perguntamos primeiro o que o banco pergunta depois. Nada é
                consultado no seu CPF, nada é enviado a lugar nenhum, e nenhuma resposta sua
                fica guardada — some quando você fechar a página.
              </p>
            </div>

            <Button
              type="button"
              onClick={avancar}
              className="h-11 px-4 text-base font-normal"
            >
              Começar
            </Button>
          </div>
        ) : null}

        {passo === 1 ? (
          <Passo
            pergunta="Qual a renda da família por mês?"
            ajuda="Some tudo que entra na casa, de todo mundo que vai entrar no financiamento. Pode ser aproximado."
            onVoltar={voltar}
          >
            <CampoRenda
              label="Renda bruta da família"
              value={rendaBruta}
              onChange={setRendaBruta}
            />
            <Avancar onClick={avancar} disabled={rendaBruta === null || rendaBruta <= 0} />
          </Passo>
        ) : null}

        {passo === 2 ? (
          <Passo
            pergunta="Você tem tempo de carteira assinada?"
            ajuda="Com três anos ou mais somados, você pode usar o FGTS na entrada — o que muda bastante a conta."
            onVoltar={voltar}
          >
            <Escolha opcoes={CARTEIRA} value={tempoCarteira} onChange={setTempoCarteira} />
            <Avancar onClick={avancar} disabled={tempoCarteira === null} />
          </Passo>
        ) : null}

        {passo === 3 ? (
          <Passo
            pergunta="Você tem imóvel no seu nome?"
            ajuda="O programa é para quem não tem. Vale para qualquer imóvel residencial, em qualquer cidade."
            onVoltar={voltar}
          >
            <EscolhaSimNao value={imovelNoNome} onChange={setImovelNoNome} />
            <Avancar onClick={avancar} disabled={imovelNoNome === null} />
          </Passo>
        ) : null}

        {passo === 4 ? (
          <Passo
            pergunta="Já comprou pelo Minha Casa Minha Vida antes?"
            ajuda="O benefício é uma vez só por pessoa."
            onVoltar={voltar}
          >
            <EscolhaSimNao value={jaUsouMcmv} onChange={setJaUsouMcmv} />
            <Avancar onClick={avancar} disabled={jaUsouMcmv === null} />
          </Passo>
        ) : null}

        {passo === 5 ? (
          <Passo
            pergunta="Seu nome está limpo hoje?"
            ajuda="Pergunta direta porque é o que mais reprova. Aqui ninguém consulta nada — é você que responde."
            onVoltar={voltar}
          >
            <EscolhaSimNao
              value={nomeLimpo}
              onChange={setNomeLimpo}
              sim="Sim, está limpo"
              nao="Tenho alguma restrição"
              notaNao="Responder isso aqui não tira você do processo. Muda só a ordem das coisas."
            />
            <Avancar onClick={avancar} disabled={nomeLimpo === null} />
          </Passo>
        ) : null}

        {passo === 6 ? (
          <Passo
            pergunta="Quanto cabe no seu mês, com folga?"
            ajuda={`Pense no que dá pra pagar sem apertar. Se não souber, pode deixar em branco — a gente usa ${Math.round(
              TETO_COMPROMETIMENTO * 100,
            )}% da renda, que é o teto que o banco aceita.`}
            onVoltar={voltar}
          >
            <CampoRenda
              label="Parcela confortável por mês"
              value={parcelaConfortavel}
              onChange={setParcelaConfortavel}
            />
            <Avancar onClick={avancar} label="Ver o resultado" />
          </Passo>
        ) : null}

        {resultado ? (
          <Resultado
            resultado={resultado}
            valoresSugeridos={valoresSugeridos}
            fonte={parametros.fonte}
            dataRevisao={parametros.dataRevisao}
            onRecomecar={recomecar}
          />
        ) : null}
      </div>
    </div>
  );
}

function Avancar({
  onClick,
  disabled,
  label = "Continuar",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-11 px-4 text-base font-normal"
    >
      {label}
    </Button>
  );
}
