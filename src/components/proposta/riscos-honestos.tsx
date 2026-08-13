import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * "O que ninguém coloca no folheto" — three risks, and like the timeline's four stops, these
 * are fixed copy rather than an admin field. They are true of every MCMV proposal she sends,
 * not a judgement call to make fresh each time, and leaving them optional risks one being
 * quietly dropped from a proposal where it mattered most.
 */
export function RiscosHonestos({
  expiraEm,
  className,
}: {
  expiraEm: string;
  className?: string;
}) {
  return (
    <section className={cn("space-y-5 border-t border-rule pt-10", className)}>
      <div>
        <p className="font-mono text-xs tracking-widest text-ink-faint uppercase">
          O que ninguém coloca no folheto
        </p>
        <h2 className="mt-2 font-display text-2xl tracking-tight text-ink">
          As três coisas que podem dar errado
        </h2>
      </div>

      <dl className="divide-y divide-rule border-t border-ink">
        <Risco titulo="A obra pode atrasar">
          O contrato prevê uma tolerância de 180 dias além da data prevista, e ela é usada com
          frequência. Se vocês estão contando com a data pra sair do aluguel, contem com o prazo
          maior.
        </Risco>
        <Risco titulo="A segunda análise de crédito é de verdade">
          Aprovado hoje não é aprovado na entrega. Trocar de emprego, financiar um carro ou
          atrasar uma conta lá na frente muda o resultado.
        </Risco>
        <Risco titulo="Os valores desta página têm data">
          A tabela que usei vale até {formatDate(expiraEm)}. Depois disso eu refaço a conta — não
          é tática de pressa, é como funciona.
        </Risco>
      </dl>
    </section>
  );
}

function Risco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[16rem_1fr] sm:gap-6">
      <dt className="text-sm font-semibold text-ink">{titulo}</dt>
      <dd className="max-w-prose text-sm text-ink-muted">{children}</dd>
    </div>
  );
}
