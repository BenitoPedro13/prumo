import type { Metadata } from "next";

import { ContatoForm } from "@/components/contato-form";
import { WhatsAppAction } from "@/components/whatsapp-action";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  path: "/contato",
  title: "Contato",
  description: "Fale com a Adriana pelo WhatsApp ou deixe seu contato para ela retornar.",
});

/**
 * WhatsApp sits above the form, not below it — a real conversation before a submitted form is
 * the product's own instinct, and burying `WhatsAppAction` under three text fields would argue
 * against the site's own thesis (`docs/tasks/TASK-contato-lgpd.md` §2.3). The form is for
 * whoever would rather leave contact details first.
 */
export default function Contato() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 py-14">
      <div className="space-y-4">
        <h1 className="max-w-prose font-display text-3xl tracking-tight text-balance">
          Fale com a Adriana.
        </h1>
        <p className="max-w-prose text-ink-muted">
          O caminho mais rápido é o WhatsApp — ela responde por lá. Se preferir, deixe seu
          contato abaixo e ela retorna.
        </p>
        <div className="flex">
          <WhatsAppAction context={{ origem: "na página de contato" }} />
        </div>
      </div>

      <ContatoForm />
    </div>
  );
}
