import type { Metadata } from "next";

import { pageMetadata } from "@/lib/metadata";
import { BROKER_EMAIL, BROKER_NAME, WHATSAPP_NUMBER } from "@/lib/site-config";

export const metadata: Metadata = pageMetadata({
  path: "/privacidade",
  title: "Privacidade e dados",
  description: "O que este site guarda sobre você, para quê, e como pedir para parar.",
});

const telefoneLegivel = `+${WHATSAPP_NUMBER.slice(0, 2)} (${WHATSAPP_NUMBER.slice(2, 4)}) ${WHATSAPP_NUMBER.slice(4, 9)}-${WHATSAPP_NUMBER.slice(9)}`;

export default function Privacidade() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 py-14">
      <div className="space-y-4">
        <h1 className="max-w-prose font-display text-3xl tracking-tight text-balance">
          O que este site guarda sobre você.
        </h1>
        <p className="max-w-prose text-ink-muted">
          Poucas coisas, e nenhuma delas serve para outra coisa além de retornar sua
          conversa com {BROKER_NAME}.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-xl tracking-tight">O que é coletado</h2>
        <p className="max-w-prose text-ink-muted">
          Quando você preenche o formulário em <code className="font-mono text-sm">/contato</code>,
          ficam guardados o nome, o telefone e a mensagem que você escreveu, junto com a data e
          o endereço IP de onde a mensagem foi enviada — este último serve como prova de que
          você mesmo autorizou o contato, não para localizar você. Quando você fala pelo
          WhatsApp, a conversa fica no aplicativo, não neste site.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl tracking-tight">Para que serve</h2>
        <p className="max-w-prose text-ink-muted">
          Para {BROKER_NAME} entrar em contato sobre o que você pediu — condições, um
          empreendimento, uma dúvida de crédito. Nada além disso. Seus dados não são vendidos,
          trocados ou repassados a terceiros para fins de marketing, e nunca chegam aqui por
          uma lista comprada: só fala com você quem escreveu para ela primeiro.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl tracking-tight">Por quanto tempo</h2>
        <p className="max-w-prose text-ink-muted">
          Enquanto durar a possibilidade de uma conversa útil — em geral, enquanto você não
          pedir para parar. Um contato antigo sem retorno não é apagado automaticamente hoje;
          se isso muda, esta página muda junto.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl tracking-tight">Como pedir para parar ou apagar</h2>
        <p className="max-w-prose text-ink-muted">
          Uma mensagem basta — pelo WhatsApp, no número {telefoneLegivel}, ou por e-mail, em{" "}
          <a
            href={`mailto:${BROKER_EMAIL}`}
            className="text-ink underline underline-offset-4 hover:no-underline"
          >
            {BROKER_EMAIL}
          </a>
          . Não existe um formulário automático para isso ainda: é {BROKER_NAME} quem lê o
          pedido e atualiza o registro. Não é tática de demora, é o tamanho do negócio hoje.
        </p>
      </section>
    </div>
  );
}
