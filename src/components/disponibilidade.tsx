import { formatDate, FUSO_BRASIL } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The availability wording, in one file, for the same reason the signature is a component: it
 * is a rule, and a rule kept in one place cannot be paraphrased into a claim by the next screen.
 *
 * The sales mirror belongs to the builder and moves hourly. Nothing here says "disponível" —
 * it says what is true, which is that availability is something to check, and it stamps the
 * date so the reader can judge how old the information is (CLAUDE.md §0).
 */
export function Disponibilidade({
  atualizadoEm,
  className,
}: {
  /** A real instant — Payload's `updatedAt` — so it is read in São Paulo time, not UTC. */
  atualizadoEm: string | Date;
  className?: string;
}) {
  return (
    <p className={cn("max-w-prose text-sm text-ink-muted", className)}>
      Preços e unidades vêm da tabela da incorporadora e mudam sem aviso. Antes de decidir
      qualquer coisa, vale consultar a disponibilidade — é rápido e evita conversa sobre unidade
      que já saiu. Esta página foi atualizada em {formatDate(atualizadoEm, FUSO_BRASIL)}.
    </p>
  );
}
