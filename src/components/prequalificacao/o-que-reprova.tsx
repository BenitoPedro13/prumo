import {
  PRAZO_ANALISE_INICIAL_DIAS,
  PRAZO_PROCESSO_MAX_DIAS,
  PRAZO_PROCESSO_MIN_DIAS,
} from "@/lib/prequalificacao";
import { cn } from "@/lib/utils";

/**
 * What actually causes rejection, and how long the process really takes.
 *
 * `product-definition.md` §04 calls this "the most valuable content on the site", and the
 * reason is that it is the content the competition cannot publish: naming the four causes
 * costs a broker deals in the short run, which is exactly why saying it plainly is worth
 * more than another render of a lobby.
 *
 * The calendar is here rather than on the result screen because both exits need it. Someone
 * who can proceed needs to know it is 40 to 70 days before they sign anything; someone who
 * cannot needs to know the clock they are up against when they come back.
 */
const CAUSAS = [
  {
    causa: "Restrição no CPF ou dívida em atraso",
    detalhe:
      "É a que mais reprova. Regulariza e espera o cadastro atualizar antes de dar entrada.",
  },
  {
    causa: "Renda difícil de comprovar",
    detalhe:
      "Informal, MEI recente ou autônomo sem declaração. O banco não recusa a renda: recusa a falta de papel que a comprove.",
  },
  {
    causa: "Já ter imóvel, ou já ter usado o programa",
    detalhe: "O benefício é uma vez por pessoa, e vale imóvel residencial em qualquer cidade.",
  },
  {
    causa: "Documentação incompleta",
    detalhe:
      "A causa mais comum de todas, e a única que se resolve inteira antes de começar.",
  },
];

export function OQueReprova({ className }: { className?: string }) {
  return (
    <section className={cn("space-y-5", className)}>
      <div className="space-y-2">
        <h2 className="font-display text-xl tracking-tight">O que costuma reprovar</h2>
        <p className="max-w-prose text-sm text-ink-muted">
          Quatro causas respondem pela maioria das recusas. Nenhuma delas é surpresa no fim do
          processo se for verificada no começo.
        </p>
      </div>

      <ul className="space-y-3">
        {CAUSAS.map(({ causa, detalhe }) => (
          <li key={causa} className="rounded-lg border border-rule bg-sheet p-4">
            <p className="text-base text-ink">{causa}</p>
            <p className="mt-1 max-w-prose text-sm text-ink-muted">{detalhe}</p>
          </li>
        ))}
      </ul>

      <div className="rounded-lg border border-rule p-4">
        <h3 className="font-display text-base tracking-tight">Quanto tempo leva</h3>
        <p className="mt-1 max-w-prose text-sm text-ink-muted">
          A análise inicial da Caixa leva até {PRAZO_ANALISE_INICIAL_DIAS} dias. O processo
          completo, com vistoria e liberação, leva de {PRAZO_PROCESSO_MIN_DIAS} a{" "}
          {PRAZO_PROCESSO_MAX_DIAS} dias. Não é demora fora do comum — é como funciona, e vale
          saber disso antes de contar com a chave numa data.
        </p>
      </div>
    </section>
  );
}
