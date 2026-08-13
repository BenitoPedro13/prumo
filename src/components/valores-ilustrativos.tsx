import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The strip that says which numbers on this page are not confirmed yet.
 *
 * The prototypes carry a fixed "Protótipo · valores ilustrativos" line (design-handoff.md §08).
 * This is that device on a live route, with one difference that matters: it is driven by
 * `Parametros.mcmv.valores_sugeridos` rather than written into the page. Adriana unticks the
 * box in the admin and the strip disappears everywhere at once, with no deploy — which is the
 * only version of this that cannot go stale, because the marker and the number it marks are
 * the same record (docs/tasks/TASK-pre-qualificacao.md §2.4).
 *
 * Brass rather than red. Nothing here is an error: it is a number waiting on a source
 * (design-handoff.md §03).
 */
export function ValoresIlustrativos({
  fonte,
  dataRevisao,
  className,
}: {
  fonte?: string | null;
  dataRevisao?: string | null;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "rounded-lg border border-latao/40 bg-latao/8 px-4 py-3 text-sm text-ink-muted",
        className,
      )}
    >
      <p className="max-w-prose">
        <span className="font-medium text-ink">Estimativas ilustrativas.</span> As faixas de
        renda vêm da portaria em vigor, mas as taxas, os subsídios e o teto do imóvel no Rio
        ainda estão sendo confirmados na Caixa. Servem para dar ordem de grandeza, não para
        fechar conta.
      </p>
      {fonte || dataRevisao ? (
        <p className="mt-2 font-mono text-xs">
          {fonte}
          {fonte && dataRevisao ? " · " : null}
          {dataRevisao ? `revisado em ${formatDate(dataRevisao)}` : null}
        </p>
      ) : null}
    </aside>
  );
}
