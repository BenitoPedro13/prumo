import { WhatsAppAction } from "@/components/whatsapp-action";
import { formatDate } from "@/lib/format";

/**
 * Not a 404 and not a stale render. Per the pré-qualificação's own honesty principle
 * (`docs/tasks/TASK-pre-qualificacao.md`), an outdated answer is worse than a plain one — this
 * says the proposal expired and offers the conversation, rather than either hiding the page or
 * quietly continuing to show numbers that are no longer true.
 */
export function PropostaExpirada({
  saudacao,
  expiraEm,
}: {
  saudacao: string;
  expiraEm: string;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <p className="font-mono text-xs tracking-widest text-latao uppercase">Para {saudacao}</p>
      <h1 className="font-display text-3xl tracking-tight text-ink">Essa proposta venceu</h1>
      <p className="max-w-prose text-ink-muted">
        Ela valia até {formatDate(expiraEm)} e os números mudaram desde então — repetir um valor
        vencido seria o mesmo que inventar. Me chama que eu refaço a conta com a tabela de hoje.
      </p>
      <WhatsAppAction
        context={{ origem: "numa proposta que venceu" }}
        label="Falar com a Adriana no WhatsApp"
      />
    </div>
  );
}
