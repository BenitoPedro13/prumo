import Image from "next/image";

import type { TipologiaResumo } from "@/lib/catalogo";
import { formatArea, formatBRLRange } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The floor plan is the largest thing here, and that is the whole point.
 *
 * A planta is what a couple actually studies at the kitchen table, and every competitor buries
 * it behind a carousel of renders (docs/design-handoff.md §09). Showing it first, big, and
 * without a lightbox is the cheapest differentiation available on this page.
 */
export function TipologiaCard({
  tipologia,
  priority = false,
  className,
}: {
  tipologia: TipologiaResumo;
  /** The first plan on the page is the reason the page exists; it should not lazy-load. */
  priority?: boolean;
  className?: string;
}) {
  const { nome, dormitorios, vagas, areaPrivativa, faixa, faixasMcmv, planta } = tipologia;
  const banda = formatBRLRange(faixa?.minimo, faixa?.maximo);

  const resumo = [
    `${dormitorios} ${dormitorios === 1 ? "dormitório" : "dormitórios"}`,
    formatArea(areaPrivativa),
    typeof vagas === "number"
      ? vagas > 0
        ? `${vagas} ${vagas === 1 ? "vaga" : "vagas"}`
        : "sem vaga"
      : null,
  ].filter(Boolean);

  return (
    <article className={cn("rounded-lg border border-rule bg-sheet", className)}>
      {planta ? (
        <Image
          src={planta.url}
          alt={planta.alt}
          width={planta.width}
          height={planta.height}
          sizes="(min-width: 768px) 45vw, 100vw"
          priority={priority}
          className="w-full rounded-t-lg border-b border-rule bg-white object-contain"
        />
      ) : (
        <p className="border-b border-rule p-6 text-sm text-ink-muted">
          A planta desta tipologia ainda não está publicada. Peça no WhatsApp e eu envio.
        </p>
      )}

      <div className="p-6">
        <h3 className="font-display text-lg tracking-tight text-ink">{nome}</h3>
        <p className="mt-1 font-mono text-xs text-ink-muted">{resumo.join(" · ")}</p>

        {banda ? (
          <p className="mt-4 text-sm text-ink-muted">
            Faixa indicativa <span className="text-ink">{banda}</span>
          </p>
        ) : null}

        {faixasMcmv.length > 0 ? (
          <p className="mt-2 text-sm text-ink-muted">
            Enquadra-se {faixasMcmv.length === 1 ? "na faixa" : "nas faixas"}{" "}
            {formatarFaixas(faixasMcmv)} do Minha Casa Minha Vida. Em qual delas a sua família
            entra depende da renda, e é a primeira coisa que a gente confere.
          </p>
        ) : null}
      </div>
    </article>
  );
}

function formatarFaixas(faixas: string[]): string {
  if (faixas.length === 1) return faixas[0];

  return `${faixas.slice(0, -1).join(", ")} e ${faixas.at(-1)}`;
}
