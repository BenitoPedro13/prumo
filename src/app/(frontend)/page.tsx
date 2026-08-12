import type { Metadata } from "next";

import { WhatsAppAction } from "@/components/whatsapp-action";
import { pageMetadata } from "@/lib/metadata";

/**
 * Placeholder. The real home is the last unit of Phase 0 — see docs/tasks/TASK-fase-0.md —
 * because it composes from the pages the earlier units build. The chrome, and with it the
 * signature, now comes from the layout.
 */
export const metadata: Metadata = pageMetadata({ path: "/" });

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-20">
      <h1 className="max-w-prose font-display text-3xl tracking-tight text-balance">
        Apartamentos da Cury no Rio, explicados por inteiro.
      </h1>
      <p className="max-w-prose text-ink-muted">
        O site está sendo construído. Enquanto isso, a conversa continua onde ela já
        acontece, e a primeira pergunta é sempre a mesma: quanto cabe no seu orçamento hoje,
        antes de olhar apartamento.
      </p>
      <div className="flex">
        <WhatsAppAction context={{ origem: "na página inicial" }} />
      </div>
    </div>
  );
}
