import { cn } from "@/lib/utils";

/**
 * ⚖ Advertising a unit under incorporação requires the registro number and the cartório where
 * it is filed (docs/product-definition.md §06). Both are required fields on the collection and
 * an empreendimento cannot be published without them.
 *
 * It is rendered as information rather than as fine print — legible size, its own block, with
 * one sentence explaining what a registro is. Someone buying their first apartment has never
 * heard the term, and hiding it in 9px grey treats a legal protection as an inconvenience.
 */
export function RegistroLegal({
  registroIncorporacao,
  cartorio,
  incorporadora,
  className,
}: {
  registroIncorporacao: string;
  cartorio: string;
  incorporadora: string;
  className?: string;
}) {
  return (
    <section
      className={cn("rounded-lg border border-rule bg-sheet p-6", className)}
      aria-labelledby="registro-legal"
    >
      <h2
        id="registro-legal"
        className="font-display text-lg tracking-tight text-ink"
      >
        Registro de incorporação
      </h2>

      <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-ink-muted">Número do registro</dt>
          <dd className="font-mono text-sm text-ink">{registroIncorporacao}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-muted">Cartório</dt>
          <dd className="text-sm text-ink">{cartorio}</dd>
        </div>
      </dl>

      <p className="mt-4 max-w-prose text-sm text-ink-muted">
        Todo empreendimento em construção precisa estar registrado em cartório antes de ser
        vendido. É lá que ficam o memorial, as plantas e a lista de unidades, e qualquer pessoa
        pode consultar. A obra e a entrega são responsabilidade da {incorporadora}.
      </p>
    </section>
  );
}
