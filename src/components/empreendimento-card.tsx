import Link from "next/link";

import { MODO_LABEL, STATUS_LABEL, type EmpreendimentoResumo } from "@/lib/catalogo";
import { formatBRLRange, formatMonthYear } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The listing card. Where it is comes before what it costs, per docs/design-handoff.md §08 —
 * the neighbourhood and the commute are what a family actually chooses between, and leading
 * with an installment figure is the portal habit this site is not copying.
 *
 * The price is a band and says so. An exact figure belongs to a commercial table, which
 * expires; a band that is labelled a band cannot become a promise.
 */
export function EmpreendimentoCard({
  empreendimento,
  className,
}: {
  empreendimento: EmpreendimentoResumo;
  className?: string;
}) {
  const { nome, slug, bairro, cidade, status, entregaPrevista, transporte, faixa } =
    empreendimento;
  const banda = formatBRLRange(faixa?.minimo, faixa?.maximo);
  const acesso = transporte[0];

  return (
    <article
      className={cn(
        "group/card rounded-lg border border-rule bg-sheet transition-colors hover:border-verde",
        className,
      )}
    >
      <Link href={`/empreendimentos/${slug}`} className="block rounded-lg p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
          {STATUS_LABEL[status]}
          {entregaPrevista ? ` · entrega ${formatMonthYear(entregaPrevista)}` : null}
        </p>

        <h2 className="mt-2 font-display text-xl tracking-tight text-ink group-hover/card:text-verde">
          {nome}
        </h2>

        <p className="mt-1 text-sm text-ink-muted">
          {bairro}, {cidade}
        </p>

        {acesso ? (
          <p className="mt-4 text-sm text-ink">
            {MODO_LABEL[acesso.modo]} {acesso.nome}
            {typeof acesso.minutosAPe === "number"
              ? ` · ${acesso.minutosAPe} min a pé`
              : null}
          </p>
        ) : null}

        {banda ? (
          <p className="mt-4 border-t border-rule pt-4 text-sm text-ink-muted">
            Faixa indicativa <span className="text-ink">{banda}</span>
          </p>
        ) : null}
      </Link>
    </article>
  );
}
