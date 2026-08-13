import Image from "next/image";

import type { OpcaoProposta } from "@/lib/catalogo";
import { formatArea, formatBRL } from "@/lib/format";
import { mesesEntre, projetar } from "@/lib/incc";
import { cn } from "@/lib/utils";

/**
 * One compared unit. Visually a sibling of `TipologiaCard` — same floor-plan-first shape,
 * same card conventions — but not that component, because this one also prints frozen money
 * (`opcao.premissa`), a "recomendada" badge, and her one-line note, none of which belong on the
 * catalogue's own card.
 *
 * There is no "Valor" row: `CondicaoComercial` has never carried a total unit price, only the
 * pieces (entrada %, parcelas, balões, saldo nas chaves) — so this shows exactly those pieces
 * and nothing invented to fill the gap.
 */
export function OpcaoCard({
  opcao,
  hoje,
  className,
}: {
  opcao: OpcaoProposta;
  hoje: Date;
  className?: string;
}) {
  const { tipologia, premissa, destaque, nota } = opcao;
  const { nome, dormitorios, vagas, areaPrivativa, planta } = tipologia;

  const mesesAteEntrega = premissa.entregaPrevista
    ? mesesEntre(hoje, new Date(premissa.entregaPrevista))
    : null;
  const parcela =
    premissa.projecaoIncc && mesesAteEntrega !== null
      ? projetar(premissa.parcelasObra?.valor, mesesAteEntrega, premissa.projecaoIncc)
      : null;

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
    <article
      className={cn(
        "rounded-lg border border-rule bg-sheet",
        destaque && "border-l-[3px] border-l-verde",
        className,
      )}
    >
      {planta ? (
        <Image
          src={planta.url}
          alt={planta.alt}
          width={planta.width}
          height={planta.height}
          sizes="(min-width: 660px) 45vw, 100vw"
          className="w-full rounded-t-lg border-b border-rule bg-white object-contain"
        />
      ) : null}

      <div className="space-y-3 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-xl tracking-tight text-ink">{nome}</h3>
          {destaque ? (
            <span className="font-mono text-[10px] tracking-widest text-verde uppercase">
              Recomendada
            </span>
          ) : null}
        </div>
        <p className="font-mono text-xs text-ink-muted">{resumo.join(" · ")}</p>
        {nota ? <p className="text-sm text-ink-muted">{nota}</p> : null}

        <dl className="space-y-2 border-t border-rule pt-3">
          {typeof premissa.entradaPercentual === "number" ? (
            <Linha termo="Entrada">
              <span className="font-mono text-sm text-ink">{premissa.entradaPercentual}%</span>
            </Linha>
          ) : null}
          {parcela ? (
            <Linha termo="Parcela hoje">
              <span className="font-mono text-sm text-ink">{formatBRL(parcela.nominal)}</span>
            </Linha>
          ) : null}
          {parcela ? (
            <Linha termo="Parcela na entrega">
              <span className="font-mono text-sm text-latao">≈ {formatBRL(parcela.corrigido)}</span>
            </Linha>
          ) : null}
        </dl>
      </div>
    </article>
  );
}

function Linha({ termo, children }: { termo: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-sm text-ink-muted">{termo}</dt>
      <dd>{children}</dd>
    </div>
  );
}
