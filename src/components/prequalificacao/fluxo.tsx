"use client";

import { useEffect, useRef, useState } from "react";

import { PlumbRail, type PlumbState } from "@/components/plumb-rail";
import { CampoRenda } from "@/components/prequalificacao/campo-renda";
import { Escolha, EscolhaSimNao } from "@/components/prequalificacao/escolha";
import { Passo } from "@/components/prequalificacao/passo";
import { Resultado } from "@/components/prequalificacao/resultado";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { avaliarEnquadramento, type ParametrosMcmv } from "@/lib/mcmv";
import {
  avaliarPreQualificacao,
  parcelasSugeridas,
  rendasSugeridas,
  TETO_COMPROMETIMENTO,
  tetoComprometimento,
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

/**
 * The five questions after the income open on an answer already chosen, so the flow moves at
 * the pace of reading rather than the pace of tapping and every step's "Continuar" is live.
 *
 * Each default is the most common answer, which together describe the unobstructed path. That
 * choice has a cost worth stating: someone who taps straight through reaches "vale conversar"
 * without having told us anything about themselves, and never sees the screen this product
 * exists for. It errs in the safer direction — the flow never invents an impediment nobody
 * reported — and the questions are five words long and one tap to change. The income is the one
 * field with no default, because a guessed income produces a real faixa and that would be a
 * fabricated answer rather than a fast one.
 */
const PADRAO = {
  tempoCarteira: "3_anos_ou_mais",
  imovelNoNome: false,
  jaUsouMcmv: false,
  nomeLimpo: true,
} satisfies Pick<
  Respostas,
  "tempoCarteira" | "imovelNoNome" | "jaUsouMcmv" | "nomeLimpo"
>;

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
  const [tempoCarteira, setTempoCarteira] = useState<TempoCarteira>(PADRAO.tempoCarteira);
  const [imovelNoNome, setImovelNoNome] = useState<boolean>(PADRAO.imovelNoNome);
  const [jaUsouMcmv, setJaUsouMcmv] = useState<boolean>(PADRAO.jaUsouMcmv);
  const [nomeLimpo, setNomeLimpo] = useState<boolean>(PADRAO.nomeLimpo);
  const [parcelaConfortavel, setParcelaConfortavel] = useState<number | null>(null);

  const topo = useRef<HTMLDivElement>(null);

  /**
   * Bring each step into view as it arrives.
   *
   * The rail is a viewport tall, so the page is always taller than the screen and the browser
   * keeps the scroll position it had — which put the next question above the fold and left the
   * person looking at the middle of a form they had not read. Skipped on the opening screen,
   * which is already at the top, and instant rather than smooth under reduced motion.
   */
  useEffect(() => {
    if (passo === 0 || !topo.current) return;

    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    topo.current.scrollIntoView({ behavior: suave ? "smooth" : "auto", block: "start" });
  }, [passo]);

  const avancar = () => setPasso((atual) => (atual + 1) as Passos);
  const voltar = () => setPasso((atual) => (atual - 1) as Passos);

  const recomecar = () => {
    setRendaBruta(null);
    setTempoCarteira(PADRAO.tempoCarteira);
    setImovelNoNome(PADRAO.imovelNoNome);
    setJaUsouMcmv(PADRAO.jaUsouMcmv);
    setNomeLimpo(PADRAO.nomeLimpo);
    setParcelaConfortavel(null);
    setPasso(0);
  };

  /**
   * Step 6 opens on the ceiling rather than on an empty field. The flow already falls back to
   * it when the question is skipped, so pre-filling it changes no arithmetic — it just shows
   * the number instead of hiding it, which is the one figure on this screen most people have
   * never been told.
   */
  const irParaParcela = () => {
    if (parcelaConfortavel === null && rendaBruta !== null) {
      setParcelaConfortavel(Math.round(tetoComprometimento(rendaBruta) / 10) * 10);
    }
    avancar();
  };

  const resultado =
    passo === 7 && rendaBruta !== null
      ? avaliarPreQualificacao(
          {
            rendaBruta,
            tempoCarteira,
            imovelNoNome,
            jaUsouMcmv,
            nomeLimpo,
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
    <div ref={topo} className="flex min-h-dvh scroll-mt-0 items-stretch">
      {/*
        A fixed left rail, always visible (design-handoff.md §07): the apparatus is the page's
        mechanism, not an indicator placed beside it, and an instrument that scrolls out of
        view is a picture of one.

        Sticky rather than `position: fixed` — fixed would take the rail out of flow and slide
        it under the header's signature, which is the one element no surface may cover. Sticky
        keeps it in the column, so it starts at the top of the flow and then holds at the top of
        the viewport for the rest of the page, which is the same reading with the header intact.

        `h-dvh`, not `h-screen`: on a phone `100vh` is the address bar's height too, so the bob
        would hang below the fold — on the exact device this screen was designed for.
      */}
      <div className="sticky top-0 h-dvh shrink-0 self-start">
        <PlumbRail
          notches={TOTAL_PERGUNTAS}
          current={notch}
          state={estado}
          label="Progresso das perguntas"
          className="h-full w-12 sm:w-16"
        />
      </div>

      {/*
        The six questions centre themselves against the rail — each one is short, and a single
        question floating at the top of a viewport-tall column reads as a page that failed to
        load. The result is long and scrolls, so it starts at the top like any other page.
      */}
      <div
        className={cn(
          "min-w-0 flex-1 px-6 py-12 sm:px-10 lg:px-14",
          resultado ? null : "flex flex-col justify-center",
        )}
      >
        <div className="w-full max-w-2xl">
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
              sugestoes={rendasSugeridas(parametros.faixas)}
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
            <Avancar onClick={avancar} />
          </Passo>
        ) : null}

        {passo === 3 ? (
          <Passo
            pergunta="Você tem imóvel no seu nome?"
            ajuda="O programa é para quem não tem. Vale para qualquer imóvel residencial, em qualquer cidade."
            onVoltar={voltar}
          >
            <EscolhaSimNao value={imovelNoNome} onChange={setImovelNoNome} />
            <Avancar onClick={avancar} />
          </Passo>
        ) : null}

        {passo === 4 ? (
          <Passo
            pergunta="Já comprou pelo Minha Casa Minha Vida antes?"
            ajuda="O benefício é uma vez só por pessoa."
            onVoltar={voltar}
          >
            <EscolhaSimNao value={jaUsouMcmv} onChange={setJaUsouMcmv} />
            <Avancar onClick={avancar} />
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
            <Avancar onClick={irParaParcela} />
          </Passo>
        ) : null}

        {passo === 6 ? (
          <Passo
            pergunta="Quanto cabe no seu mês, com folga?"
            ajuda={`O campo já vem no teto que o banco aceita para a sua renda, ${Math.round(
              TETO_COMPROMETIMENTO * 100,
            )}% dela. Se cabe menos que isso no seu mês, baixe — é uma conta que você paga por muitos anos.`}
            onVoltar={voltar}
          >
            <CampoRenda
              label="Parcela confortável por mês"
              value={parcelaConfortavel}
              onChange={setParcelaConfortavel}
              sugestoes={rendaBruta === null ? [] : parcelasSugeridas(rendaBruta)}
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
