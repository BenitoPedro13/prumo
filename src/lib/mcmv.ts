/**
 * The MCMV enquadramento arithmetic — docs/tasks/TASK-mcmv-parametros.md.
 *
 * The product's first question is "eu consigo?", and this module is the part of that answer
 * that is arithmetic rather than conversation: given a gross family income, which faixa does a
 * family fall into, and does the apartment they are looking at fit under that faixa's ceiling.
 *
 * Three rules are enforced by the shape of this module rather than by discipline, the same way
 * `src/lib/incc.ts` enforces its own:
 *
 * 1. **No policy number is written here.** Faixas, ceilings, rates and subsidies arrive as
 *    arguments, read from the `Parametros` global. They were revised by portaria in 2026 and
 *    will be revised again; a number compiled into this file would be a bug waiting for a
 *    portaria (CLAUDE.md §0).
 * 2. **A missing number is a distinct outcome, never a zero.** A faixa whose `tetoImovel` has
 *    not been confirmed yields `teto_nao_configurado`, which the UI renders as "ainda não
 *    confirmado" — not as a failed comparison against zero.
 * 3. **Nothing here approves anything.** It is orientation, not análise de crédito: no bureau,
 *    no documents, no promise. Everything it produces is an estimate and is labelled as one on
 *    every surface that shows it (CLAUDE.md §0).
 */

/** One faixa as configured in the admin. The optional fields are the ones that gate display. */
export type FaixaMcmv = {
  nome: string;
  rendaMin: number;
  rendaMax: number;
  tetoImovel?: number | null;
  taxaJurosAnual?: number | null;
  subsidioMaximo?: number | null;
  percentualFinanciado?: number | null;
};

export type ParametrosMcmv = {
  faixas: FaixaMcmv[];
  /** When these were last checked against the source. Displayed beside every figure. */
  dataRevisao?: string | null;
  fonte?: string | null;
  /** The norm that fixed these limits, e.g. "Portaria MCID nº 333, de 30 de março de 2026". */
  portaria?: string | null;
};

/**
 * The outcomes, as a discriminated union rather than a boolean and a nullable faixa.
 *
 * The copy for each case lives with the screen that shows it, so this module stays testable and
 * the pre-qualification's wording stays where a writer can find it. `acima_das_faixas` is a
 * real, honest answer — one of the two exits the flow is designed around — and not an error.
 */
export type Enquadramento =
  | { situacao: "sem_parametros" }
  | { situacao: "acima_das_faixas"; rendaBruta: number }
  | { situacao: "faixa_identificada"; faixa: FaixaMcmv }
  | { situacao: "teto_nao_configurado"; faixa: FaixaMcmv }
  | { situacao: "dentro_do_teto"; faixa: FaixaMcmv; valorImovel: number }
  | { situacao: "acima_do_teto"; faixa: FaixaMcmv; valorImovel: number };

/**
 * The first faixa whose bracket contains the income, in configured order.
 *
 * Brackets are inclusive at both ends as the programme publishes them (Faixa 2 begins at
 * R$ 3.200,01, so the cent between brackets belongs to nobody and cannot be typed anyway).
 * Returns null above the last bracket — MCMV simply does not reach that family.
 */
export function enquadrarPorRenda(
  rendaBruta: number,
  faixas: FaixaMcmv[],
): FaixaMcmv | null {
  if (!Number.isFinite(rendaBruta) || rendaBruta < 0) return null;

  return (
    faixas.find(
      (faixa) => rendaBruta >= faixa.rendaMin && rendaBruta <= faixa.rendaMax,
    ) ?? null
  );
}

/**
 * Whether the property fits under the faixa's ceiling.
 *
 * Returns null — not false — when the ceiling has not been confirmed. In Faixas 1 and 2 the
 * ceiling varies by locality and the figure for Rio is still unconfirmed, so this is the
 * common case today, not an edge one.
 */
export function dentroDoTeto(
  valorImovel: number,
  faixa: FaixaMcmv,
): boolean | null {
  if (typeof faixa.tetoImovel !== "number") return null;

  return valorImovel <= faixa.tetoImovel;
}

/** True when every figure needed to quote conditions for this faixa has been confirmed. */
export function faixaCompleta(faixa: FaixaMcmv): boolean {
  return (
    typeof faixa.tetoImovel === "number" &&
    typeof faixa.taxaJurosAnual === "number"
  );
}

/**
 * The whole answer in one call: income alone identifies a faixa, and a property value — when
 * the buyer is already looking at one — turns that into a fit or a miss.
 */
export function avaliarEnquadramento(
  { rendaBruta, valorImovel }: { rendaBruta: number; valorImovel?: number | null },
  parametros: ParametrosMcmv | null | undefined,
): Enquadramento {
  const faixas = parametros?.faixas ?? [];
  if (faixas.length === 0) return { situacao: "sem_parametros" };

  const faixa = enquadrarPorRenda(rendaBruta, faixas);
  if (!faixa) return { situacao: "acima_das_faixas", rendaBruta };

  if (typeof valorImovel !== "number") return { situacao: "faixa_identificada", faixa };

  const cabe = dentroDoTeto(valorImovel, faixa);
  if (cabe === null) return { situacao: "teto_nao_configurado", faixa };

  return cabe
    ? { situacao: "dentro_do_teto", faixa, valorImovel }
    : { situacao: "acima_do_teto", faixa, valorImovel };
}
