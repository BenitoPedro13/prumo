import type { Enquadramento, FaixaMcmv } from "@/lib/mcmv";

/**
 * The pré-qualificação's own logic — docs/tasks/TASK-pre-qualificacao.md.
 *
 * `src/lib/mcmv.ts` answers "which faixa"; this module answers the question the buyer actually
 * asked, which is "eu consigo?". It takes six answers the person gave about themselves and
 * returns which of the flow's exits they land on, and why.
 *
 * It follows the same three rules as `mcmv.ts`, for the same reasons:
 *
 * 1. **No policy number is written here.** Ceilings, rates and subsidies arrive through the
 *    faixa, which comes from the admin. The one constant below is a banking convention rather
 *    than a policy figure, and it is named and argued for where it is declared.
 * 2. **A missing number is a distinct outcome, never a zero.** `sem_parametros` is a real
 *    result: with no faixas configured the flow declines to answer instead of guessing.
 * 3. **Nothing here approves anything.** No bureau, no documents, no promise — orientation, and
 *    labelled as an estimate on every surface that shows it (CLAUDE.md §0).
 *
 * It also never persists. The answers below describe someone's debts and income; they live in
 * component state for the length of a visit and are neither stored nor transmitted, which is
 * what keeps this screen outside the LGPD surface that `/contato` deliberately entered.
 */

/**
 * What the bank will let a family commit of gross monthly income, as a decimal.
 *
 * Not an MCMV parameter — it is the long-standing underwriting convention, applied by every
 * bank in the country and unchanged by the portarias that move the faixas. So it sits in code
 * where the faixas may not. If it ever becomes a number that moves, it moves to `Parametros`.
 */
export const TETO_COMPROMETIMENTO = 0.3;

/** Caixa's own published windows — product-definition.md §04. Named, not inlined, so the copy
 * and the arithmetic cannot drift apart. */
export const PRAZO_ANALISE_INICIAL_DIAS = 30;
export const PRAZO_PROCESSO_MIN_DIAS = 40;
export const PRAZO_PROCESSO_MAX_DIAS = 70;

export type TempoCarteira = "menos_de_3_anos" | "3_anos_ou_mais" | "nao_tenho";

/** The six answers, in the order the flow asks them. */
export type Respostas = {
  rendaBruta: number;
  tempoCarteira: TempoCarteira;
  imovelNoNome: boolean;
  jaUsouMcmv: boolean;
  nomeLimpo: boolean;
  /** What they said fits comfortably. Null when they skipped it — then the ceiling is used. */
  parcelaConfortavel: number | null;
};

/**
 * Why someone is not eligible today, as a list rather than a first match.
 *
 * Returning only the first blocker would send a person away to fix one thing and bring them
 * back to a second no. Someone with a restriction *and* a prior MCMV purchase deserves to hear
 * both the first time — which is the whole argument of the "hoje ainda não" exit.
 */
export type Impedimento =
  | "nome_negativado"
  | "imovel_no_nome"
  | "ja_usou_o_programa";

/** Whether the installment they named sits under the ceiling. Three states, never a boolean:
 * "no limite" is real advice and a boolean erases it. */
export type FolgaNoOrcamento = "confortavel" | "no_limite" | "acima";

export type ResultadoPreQualificacao =
  | { saida: "sem_parametros" }
  | { saida: "acima_das_faixas"; rendaBruta: number }
  | {
      saida: "fora_do_programa";
      faixa: FaixaMcmv;
      impedimentos: Impedimento[];
    }
  | {
      saida: "hoje_ainda_nao";
      faixa: FaixaMcmv;
      impedimentos: Impedimento[];
      folga: FolgaNoOrcamento;
      teto: number;
    }
  | {
      saida: "vale_conversar";
      faixa: FaixaMcmv;
      folga: FolgaNoOrcamento;
      teto: number;
      /** Three years of carteira is what unlocks FGTS in the entrada, which moves the sum. */
      podeUsarFgts: boolean;
    };

/** The largest installment the bank will accept against this income. */
export function tetoComprometimento(rendaBruta: number): number {
  if (!Number.isFinite(rendaBruta) || rendaBruta <= 0) return 0;

  return rendaBruta * TETO_COMPROMETIMENTO;
}

/**
 * Where the installment they named falls against that ceiling.
 *
 * Skipping the question is not a failure to answer: it means "use the ceiling", so the honest
 * reading is that they are exactly at it. Within a tenth of the ceiling is "no limite" — the
 * band where the sum works on paper and does not work in a month with a broken fridge.
 */
export function folgaNoOrcamento(
  parcelaConfortavel: number | null,
  rendaBruta: number,
): FolgaNoOrcamento {
  const teto = tetoComprometimento(rendaBruta);
  if (teto <= 0) return "acima";
  if (parcelaConfortavel === null) return "no_limite";
  if (parcelaConfortavel > teto) return "acima";

  return parcelaConfortavel >= teto * 0.9 ? "no_limite" : "confortavel";
}

/**
 * Which things stand in the way today, in the order that matters to the person hearing them.
 *
 * A restriction comes first because it is the most common cause of rejection and the only one
 * on this list that time reliably fixes (product-definition.md §04).
 */
export function impedimentosDe(respostas: Respostas): Impedimento[] {
  const impedimentos: Impedimento[] = [];

  if (!respostas.nomeLimpo) impedimentos.push("nome_negativado");
  if (respostas.imovelNoNome) impedimentos.push("imovel_no_nome");
  if (respostas.jaUsouMcmv) impedimentos.push("ja_usou_o_programa");

  return impedimentos;
}

/**
 * The two blockers the programme itself closes the door on: owning residential property, and
 * having already used the benefit. Neither is something a person changes in six months, so
 * they route to a different exit than a restriction does — a permanent answer told kindly,
 * rather than a list of things to fix.
 */
function forasDoPrograma(impedimentos: Impedimento[]): boolean {
  return impedimentos.some(
    (impedimento) =>
      impedimento === "imovel_no_nome" || impedimento === "ja_usou_o_programa",
  );
}

/**
 * The whole answer in one call.
 *
 * Takes the `Enquadramento` that `mcmv.ts` already produced rather than re-deriving it, so the
 * faixa on screen and the faixa in this result are the same object and cannot disagree.
 */
export function avaliarPreQualificacao(
  respostas: Respostas,
  enquadramento: Enquadramento,
): ResultadoPreQualificacao {
  if (enquadramento.situacao === "sem_parametros") return { saida: "sem_parametros" };

  if (enquadramento.situacao === "acima_das_faixas") {
    return { saida: "acima_das_faixas", rendaBruta: enquadramento.rendaBruta };
  }

  const { faixa } = enquadramento;
  const impedimentos = impedimentosDe(respostas);
  const teto = tetoComprometimento(respostas.rendaBruta);
  const folga = folgaNoOrcamento(respostas.parcelaConfortavel, respostas.rendaBruta);

  if (forasDoPrograma(impedimentos)) {
    return { saida: "fora_do_programa", faixa, impedimentos };
  }

  if (impedimentos.length > 0) {
    return { saida: "hoje_ainda_nao", faixa, impedimentos, folga, teto };
  }

  return {
    saida: "vale_conversar",
    faixa,
    folga,
    teto,
    podeUsarFgts: respostas.tempoCarteira === "3_anos_ou_mais",
  };
}

/**
 * Round income values to offer as one-tap answers, derived from the configured faixas.
 *
 * Typing a number on a phone keypad is the most expensive interaction in the flow and the one
 * most likely to end it. These give a person something to tap instead — and the field stays
 * editable, so anyone who knows their number to the real digit can still enter it.
 *
 * Derived rather than listed, for the same reason nothing else here is listed: the brackets
 * move by portaria. One value per faixa, at the middle of the bracket and rounded to the
 * nearest hundred, so the suggestions follow the programme without a policy number appearing in
 * this file. The middle and not the edges — a bracket boundary is the worst possible place to
 * put an estimate, because a hundred reais either way changes the answer.
 */
export function rendasSugeridas(faixas: FaixaMcmv[]): number[] {
  return faixas
    .map((faixa) => Math.round((faixa.rendaMin + faixa.rendaMax) / 2 / 100) * 100)
    .filter((valor, indice, todos) => valor > 0 && todos.indexOf(valor) === indice);
}

/**
 * Installments to offer at the last step, from the ceiling downwards.
 *
 * The ceiling is what the bank allows, not what a family should spend, so the two cheaper steps
 * are the useful ones — and offering them is the closest this screen comes to giving advice.
 */
export function parcelasSugeridas(rendaBruta: number): number[] {
  const teto = tetoComprometimento(rendaBruta);
  if (teto <= 0) return [];

  return [0.6, 0.8, 1].map((parte) => Math.round((teto * parte) / 10) * 10);
}
