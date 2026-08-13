import type { OpcaoProposta } from "@/lib/catalogo";
import { formatBRL, formatMonthYear } from "@/lib/format";
import { mesesEntre, projetar } from "@/lib/incc";
import { cn } from "@/lib/utils";

/**
 * "Do sim de hoje até a mudança" — four stops, and the four are fixed structure, not admin
 * content: credit analysis, entrada, the rising construction installments, and the keys. Every
 * MCMV purchase goes through the same four moments, so leaving them to a form field risks
 * someone shipping a proposal that quietly skips one. Only the numbers are per-proposal.
 *
 * Built from the destaque option (or the first, with one option there's no choice to make) —
 * "usando o Pixinguinha como exemplo" in the prototype's own words.
 *
 * The markers are diamonds, not dots — the plumb bob's own silhouette (`plumb-rail.tsx`'s SVG
 * is the same rhombus), hollow at each stop and filled only at the last. Not a second animated
 * apparatus, just its shape borrowed to mark where the line settles: this timeline is, quite
 * literally, a line running from today to the keys. Each stop draws its own connector down to
 * the next one, rather than one line spanning the whole list, so it stops exactly at "chaves"
 * instead of trailing past the last thing worth marking.
 */
export function LinhaDoTempo({
  exemplo,
  hoje,
  className,
}: {
  exemplo: OpcaoProposta;
  hoje: Date;
  className?: string;
}) {
  const { premissa } = exemplo;
  const mesesAteEntrega = premissa.entregaPrevista
    ? mesesEntre(hoje, new Date(premissa.entregaPrevista))
    : null;
  const parcela =
    premissa.projecaoIncc && mesesAteEntrega !== null
      ? projetar(premissa.parcelasObra?.valor, mesesAteEntrega, premissa.projecaoIncc)
      : null;

  return (
    <section className={cn("space-y-5 border-t border-rule pt-10", className)}>
      <div>
        <p className="font-mono text-xs tracking-widest text-ink-faint uppercase">
          Como o dinheiro sai daqui até a chave
        </p>
        <h2 className="mt-2 font-display text-2xl tracking-tight text-ink">
          Do sim de hoje até a mudança
        </h2>
        <p className="mt-3 max-w-prose text-sm text-ink-muted">
          Usando {exemplo.tipologia.nome} como exemplo. É o pedaço que costuma pegar as pessoas de
          surpresa, então está inteiro aqui, com o desconforto incluído.
        </p>
      </div>

      <ol>
        <Parada quando="Agora" oque="Análise de crédito">
          Eu abro o processo pela Cury e vocês anexam os documentos por um link. A Caixa leva{" "}
          <b className="font-semibold text-ink">cerca de 30 dias</b> pra dar a primeira resposta.
          Nada é assinado antes disso.
        </Parada>

        {typeof premissa.entradaPercentual === "number" ? (
          <Parada quando="Aprovado" oque={`Entrada de ${premissa.entradaPercentual}%`}>
            Pode ser parcelada até a entrega. Boa parte disso o FGTS de vocês costuma cobrir — a
            gente confirma o saldo exato na assinatura.
          </Parada>
        ) : null}

        {parcela ? (
          <Parada
            quando={
              mesesAteEntrega ? `Durante a obra · ${mesesAteEntrega} meses` : "Durante a obra"
            }
            oque="Parcelas que sobem"
          >
            Começam em <b className="font-semibold text-ink">{formatBRL(parcela.nominal)}</b> e
            são corrigidas todo mês pelo INCC, o índice do custo da construção. Na entrega devem
            estar perto de{" "}
            <b className="font-semibold text-ink">{formatBRL(parcela.corrigido)}</b>. Ninguém sabe
            o número exato, nem eu — mas é essa ordem de grandeza, e é melhor vocês contarem com
            ela.
          </Parada>
        ) : null}

        <Parada
          quando={premissa.entregaPrevista ? formatMonthYear(premissa.entregaPrevista) : "Na entrega"}
          oque="Chaves na mão"
          destaque
          ultima
        >
          O saldo que sobrar vira financiamento no banco. A análise acontece{" "}
          <b className="font-semibold text-ink">de novo</b> nessa hora, com a renda de vocês
          daquele momento — por isso vale manter o nome limpo até lá.
        </Parada>
      </ol>
    </section>
  );
}

function Parada({
  quando,
  oque,
  destaque = false,
  ultima = false,
  children,
}: {
  quando: string;
  oque: string;
  destaque?: boolean;
  /** The connector below the marker is skipped here — there is nothing left to point to. */
  ultima?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="grid grid-cols-[1.25rem_1fr] gap-4">
      <div className="flex flex-col items-center">
        <span
          aria-hidden
          className={cn(
            "mt-1.5 size-2.5 shrink-0 rotate-45 border bg-sheet",
            destaque ? "size-3 border-verde bg-verde" : "border-rule",
          )}
        />
        {!ultima ? <span aria-hidden className="mt-1 w-px flex-1 bg-rule" /> : null}
      </div>

      <div className={cn("pb-8", ultima && "pb-0")}>
        <p className="font-mono text-[10px] tracking-widest text-latao uppercase">{quando}</p>
        <p
          className={cn(
            "mt-0.5 font-display text-lg font-semibold tracking-tight",
            destaque ? "text-verde" : "text-ink",
          )}
        >
          {oque}
        </p>
        <p className="mt-1 max-w-prose text-sm text-ink-muted">{children}</p>
      </div>
    </li>
  );
}
