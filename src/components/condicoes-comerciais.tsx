import { INDICE_LABEL, type CondicaoComercialResumo } from "@/lib/catalogo";
import { formatBRL, formatPercent, formatShortDate } from "@/lib/format";
import {
  mesesEntre,
  projetar,
  tabelaExpirada,
  type ProjecaoIndice,
  type ValorProjetado,
} from "@/lib/incc";
import { cn } from "@/lib/utils";

/**
 * The commercial table, and the two rules that govern it (CLAUDE.md §0).
 *
 * **Both figures, or neither.** Every installment appears twice — nominal today and corrected
 * to the handover — because showing only the first is the industry's standard omission and the
 * thing this product exists to correct. When the index is not configured there is no second
 * figure, so the first one is not shown either. That is the correct behaviour, not a fallback.
 *
 * **An expired table produces no numbers.** The validity date comes from the builder. Past it,
 * the block says so and offers the conversation instead of printing a figure that has already
 * stopped being true.
 *
 * The reference is printed as she wrote it, with no "Tabela" prepended — she names them
 * "Tabela 12 — agosto", and a label that assumes otherwise stutters.
 *
 * The projection is labelled a projection wherever it appears. Nobody knows the INCC of month
 * thirty, and pretending otherwise here would be the same dishonesty in the other direction.
 */
export function CondicoesComerciais({
  condicao,
  projecao,
  entregaPrevista,
  hoje,
  className,
}: {
  condicao: CondicaoComercialResumo;
  projecao?: ProjecaoIndice | null;
  entregaPrevista?: string | null;
  /** Passed in rather than read from the clock, so the render is deterministic and testable. */
  hoje: Date;
  className?: string;
}) {
  const expirada = tabelaExpirada(condicao, hoje);
  const mesesAteEntrega = entregaPrevista
    ? mesesEntre(hoje, new Date(entregaPrevista))
    : null;
  const podeProjetar = Boolean(projecao) && mesesAteEntrega !== null;

  return (
    <section
      className={cn("rounded-lg border border-rule bg-sheet p-6", className)}
      aria-labelledby="condicoes"
    >
      <h2 id="condicoes" className="font-display text-lg tracking-tight text-ink">
        Como se paga
      </h2>

      {expirada ? (
        <p className="mt-4 max-w-prose text-sm text-ink-muted">
          {condicao.referencia} valeu até {formatShortDate(condicao.validadeDaTabela)} e
          venceu. Os números mudaram, então não estão aqui — repetir um valor vencido seria o
          mesmo que inventar. Me chame que eu mando a tabela do dia.
        </p>
      ) : !podeProjetar ? (
        <p className="mt-4 max-w-prose text-sm text-ink-muted">
          As parcelas desta tabela só aparecem acompanhadas do valor corrigido até a entrega, e a
          projeção do INCC ainda não está configurada. Uma parcela sozinha diz metade da verdade,
          então prefiro não mostrar nenhuma. Me chame que eu passo as condições completas.
        </p>
      ) : (
        <Numeros
          condicao={condicao}
          projecao={projecao!}
          mesesAteEntrega={mesesAteEntrega!}
        />
      )}

      <p className="mt-6 border-t border-rule pt-4 font-mono text-xs text-ink-muted">
        {condicao.referencia} · vigência até {formatShortDate(condicao.validadeDaTabela)}
      </p>
    </section>
  );
}

function Numeros({
  condicao,
  projecao,
  mesesAteEntrega,
}: {
  condicao: CondicaoComercialResumo;
  projecao: ProjecaoIndice;
  mesesAteEntrega: number;
}) {
  const { entradaPercentual, parcelasObra, baloes, valorNasChaves, indiceReajuste } = condicao;

  const parcela = projetar(parcelasObra?.valor, mesesAteEntrega, projecao);
  const chaves = projetar(valorNasChaves, mesesAteEntrega, projecao);

  return (
    <>
      <dl className="mt-4 divide-y divide-rule border-y border-rule">
        {typeof entradaPercentual === "number" ? (
          <Linha termo="Entrada">
            <span className="font-mono text-sm text-ink">{entradaPercentual}%</span>
            <span className="block text-sm text-ink-muted">
              Paga agora, então não sofre correção.
            </span>
          </Linha>
        ) : null}

        {parcela && parcelasObra?.quantidade ? (
          <Linha termo="Parcelas de obra">
            <ValorPar valor={parcela} />
            <span className="block text-sm text-ink-muted">
              {parcelasObra.quantidade} parcelas mensais. Elas sobem um pouco a cada mês até a
              entrega — a primeira é a de hoje, a última fica perto do segundo número.
            </span>
          </Linha>
        ) : null}

        {baloes.length > 0 ? (
          <Linha termo={baloes.length === 1 ? "Balão" : "Balões"}>
            <ul className="space-y-2">
              {baloes.map((balao, index) => {
                const projetado = projetar(balao.valor, balao.mes ?? 0, projecao);
                if (!projetado) return null;

                return (
                  <li key={index}>
                    <span className="font-mono text-xs text-ink-muted">
                      mês {balao.mes}
                    </span>
                    <ValorPar valor={projetado} />
                  </li>
                );
              })}
            </ul>
          </Linha>
        ) : null}

        {chaves ? (
          <Linha termo="Nas chaves">
            <ValorPar valor={chaves} />
            <span className="block text-sm text-ink-muted">
              Este saldo vai a financiamento na entrega, com uma nova análise de crédito naquele
              momento. Não é tática de pressa, é como funciona — e é por isso que a conversa
              sobre crédito começa antes da escolha do apartamento.
            </span>
          </Linha>
        ) : null}
      </dl>

      <p className="mt-4 max-w-prose text-sm text-ink-muted">
        O segundo número é projeção, não promessa: aplica {formatPercent(projecao.taxaAnual)} ao
        ano de {INDICE_LABEL[indiceReajuste]} sobre {mesesAteEntrega} meses
        {projecao.fonte ? `, com base em ${projecao.fonte}` : null}. Índice revisto em{" "}
        {formatShortDate(projecao.dataRevisao)}.
      </p>
    </>
  );
}

function Linha({ termo, children }: { termo: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
      <dt className="text-sm text-ink-muted">{termo}</dt>
      <dd className="space-y-1">{children}</dd>
    </div>
  );
}

/** The two figures, always together, always in this order. */
function ValorPar({ valor }: { valor: ValorProjetado }) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className="font-mono text-base text-ink">
        {formatBRL(valor.nominal)}
        <span className="ml-1 text-xs text-ink-muted">hoje</span>
      </span>
      <span className="font-mono text-base text-latao">
        ≈ {formatBRL(valor.corrigido)}
        <span className="ml-1 text-xs text-ink-muted">na entrega</span>
      </span>
    </span>
  );
}
