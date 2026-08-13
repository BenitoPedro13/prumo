"use client";

import { useState } from "react";

import { CampoRenda } from "@/components/prequalificacao/campo-renda";
import { Escolha, EscolhaSimNao } from "@/components/prequalificacao/escolha";
import { Passo } from "@/components/prequalificacao/passo";
import { Resultado } from "@/components/prequalificacao/resultado";
import type { FaixaMcmv } from "@/lib/mcmv";
import type { ResultadoPreQualificacao } from "@/lib/prequalificacao";

/**
 * The pré-qualificação's pieces on /sistema — CLAUDE.md §4: a shared component without a panel
 * here is an unfinished task.
 *
 * Client-side because the controls and the exits take callbacks. The exits are built as literal
 * `ResultadoPreQualificacao` values rather than by running the flow, so all five can be seen at
 * once — including `sem_parametros`, which a working database never produces.
 *
 * The rail is not here: on `/simulador` it is a viewport-tall sticky column and a panel-sized
 * copy of it would misrepresent the one thing about it that matters. Its own panel is above.
 * The suggestion chips are hardcoded here and derived from the faixas on the real screen.
 */

const FAIXA_COMPLETA: FaixaMcmv = {
  nome: "Faixa 3",
  rendaMin: 5000.01,
  rendaMax: 9600,
  tetoImovel: 400000,
  taxaJurosAnual: 8.16,
  subsidioMaximo: 0,
  percentualFinanciado: 80,
};

/** A faixa the admin has not finished. Its conditions must not render at all. */
const FAIXA_INCOMPLETA: FaixaMcmv = {
  nome: "Faixa 2",
  rendaMin: 3200.01,
  rendaMax: 5000,
  tetoImovel: null,
  taxaJurosAnual: null,
};

const SAIDAS: { titulo: string; nota: string; resultado: ResultadoPreQualificacao }[] = [
  {
    titulo: "vale_conversar",
    nota: "Nada trava. A única saída que leva a régua ao prumo.",
    resultado: {
      saida: "vale_conversar",
      faixa: FAIXA_COMPLETA,
      folga: "confortavel",
      teto: 1560,
      podeUsarFgts: true,
    },
  },
  {
    titulo: "hoje_ainda_nao",
    nota: "A saída que justifica a tela. Diz o que mudar, na ordem, e convida a voltar.",
    resultado: {
      saida: "hoje_ainda_nao",
      faixa: FAIXA_COMPLETA,
      impedimentos: ["nome_negativado"],
      folga: "no_limite",
      teto: 1560,
    },
  },
  {
    titulo: "fora_do_programa",
    nota: "Regra do programa, não papel que falta. Permanente, e dito com respeito.",
    resultado: {
      saida: "fora_do_programa",
      faixa: FAIXA_COMPLETA,
      impedimentos: ["imovel_no_nome", "ja_usou_o_programa"],
    },
  },
  {
    titulo: "acima_das_faixas",
    nota: "Renda acima do teto do programa. Não é um não: é outro caminho.",
    resultado: { saida: "acima_das_faixas", rendaBruta: 14000 },
  },
  {
    titulo: "sem_parametros",
    nota: "Sem faixas no admin a tela se recusa a estimar. O gate, visível.",
    resultado: { saida: "sem_parametros" },
  },
];

export function PreQualificacaoDemo() {
  const [renda, setRenda] = useState<number | null>(5200);
  const [sim, setSim] = useState<boolean | null>(null);
  const [carteira, setCarteira] = useState<string | null>("3_anos_ou_mais");

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-rule bg-sheet p-6">
        <Passo
          pergunta="Qual a renda da família por mês?"
          ajuda="Some tudo que entra na casa, de todo mundo que vai entrar no financiamento. Pode ser aproximado."
          onVoltar={() => undefined}
        >
          <CampoRenda
            label="Renda bruta da família"
            value={renda}
            onChange={setRenda}
            sugestoes={[1600, 4100, 7300, 11300]}
          />
        </Passo>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
            Escolha simples
          </p>
          <EscolhaSimNao
            value={sim}
            onChange={setSim}
            sim="Sim, está limpo"
            nao="Tenho alguma restrição"
            notaNao="Responder isso aqui não tira você do processo. Muda só a ordem das coisas."
          />
        </div>

        <div className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
            Escolha com nota
          </p>
          <Escolha
            opcoes={[
              {
                value: "3_anos_ou_mais",
                label: "Sim, três anos ou mais somados",
                nota: "Somando todos os contratos da vida, não só o atual. Isso libera o FGTS na entrada.",
              },
              { value: "menos_de_3_anos", label: "Sim, menos de três anos" },
              {
                value: "nao_tenho",
                label: "Não tenho carteira assinada",
                nota: "Autônomo, MEI ou informal.",
              },
            ]}
            value={carteira}
            onChange={setCarteira}
          />
        </div>
      </div>

      <div className="space-y-8">
        {SAIDAS.map(({ titulo, nota, resultado }) => (
          <figure key={titulo} className="space-y-3">
            <figcaption className="space-y-1">
              <p className="font-mono text-xs text-latao">{titulo}</p>
              <p className="max-w-prose text-sm text-ink-muted">{nota}</p>
            </figcaption>
            <div className="rounded-lg border border-rule bg-sheet p-6">
              <Resultado
                resultado={resultado}
                valoresSugeridos
                fonte="Ministério das Cidades — programa Minha Casa, Minha Vida"
                dataRevisao="2026-08-13"
                onRecomecar={() => undefined}
              />
            </div>
          </figure>
        ))}

        <figure className="space-y-3">
          <figcaption className="space-y-1">
            <p className="font-mono text-xs text-latao">faixa incompleta</p>
            <p className="max-w-prose text-sm text-ink-muted">
              A mesma saída com uma faixa cujo teto e cuja taxa o admin ainda não tem. As
              condições não aparecem — nem zeradas, nem estimadas.
            </p>
          </figcaption>
          <div className="rounded-lg border border-rule bg-sheet p-6">
            <Resultado
              resultado={{
                saida: "vale_conversar",
                faixa: FAIXA_INCOMPLETA,
                folga: "acima",
                teto: 1350,
                podeUsarFgts: false,
              }}
              valoresSugeridos={false}
              onRecomecar={() => undefined}
            />
          </div>
        </figure>
      </div>
    </div>
  );
}
