import type { CondicaoComercialResumo } from "@/lib/catalogo";

/**
 * The INCC projection — docs/product-definition.md §04.
 *
 * Installments paid during construction are corrected monthly until the keys are handed over.
 * The parcel quoted today is not the parcel of month 30, and showing only the first is the
 * industry's standard omission — the one this product exists to correct (CLAUDE.md §0).
 *
 * Two rules are enforced by the shape of this module rather than by discipline:
 *
 * 1. The rate is never hardcoded. It comes from the `Parametros` global, with the date it was
 *    last revised, and both travel together in `ProjecaoIndice`.
 * 2. Without a rate there is no projection, and without a projection the nominal figure must
 *    not be shown alone. `projetar()` returns null, and the caller has nothing to render — the
 *    correct outcome, not a degraded one.
 *
 * It is a projection and it is labelled as one everywhere it appears. Nobody knows the INCC of
 * month 30.
 */

export type ProjecaoIndice = {
  /** Annual rate as a decimal: 0.0812 for 8,12% a.a. */
  taxaAnual: number;
  /** When the rate was last checked against the source. Displayed beside every figure. */
  dataRevisao: string;
  /** Where it came from — "INCC-DI/FGV, acumulado 12 meses", or similar. */
  fonte?: string | null;
};

export type ValorProjetado = {
  nominal: number;
  corrigido: number;
  meses: number;
  projecao: ProjecaoIndice;
};

/** Whole months from `de` to `ate`, floored at zero. A delivery in the past corrects nothing. */
export function mesesEntre(de: Date, ate: Date): number {
  const meses =
    (ate.getFullYear() - de.getFullYear()) * 12 + (ate.getMonth() - de.getMonth());

  return Math.max(0, meses);
}

/**
 * Compound the annual rate over the months remaining. Deliberately a single rate rather than a
 * month-by-month schedule: the schedule is the proposal's payment timeline and belongs to
 * Phase 1, and a fabricated monthly series would look more precise than it is.
 */
export function projetar(
  nominal: number | null | undefined,
  meses: number,
  projecao: ProjecaoIndice | null | undefined,
): ValorProjetado | null {
  if (typeof nominal !== "number" || !projecao) return null;

  return {
    nominal,
    corrigido: Math.round(nominal * (1 + projecao.taxaAnual) ** (meses / 12)),
    meses,
    projecao,
  };
}

/** A table past its validity cannot produce a figure. The date is the builder's, not ours. */
export function tabelaExpirada(
  condicao: Pick<CondicaoComercialResumo, "validadeDaTabela">,
  hoje: Date,
): boolean {
  return new Date(condicao.validadeDaTabela).getTime() < hoje.getTime();
}
