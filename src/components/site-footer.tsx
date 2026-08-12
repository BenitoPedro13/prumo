import Link from "next/link";

import { Signature } from "@/components/signature";
import { WhatsAppAction } from "@/components/whatsapp-action";
import { LEGAL_ROUTES, PRIMARY_ROUTES } from "@/lib/routes";
import { BROKER_NAME } from "@/lib/site-config";

/**
 * Rendered by the layout alongside the nav, for the same reason.
 *
 * The legal block is the part worth reading twice. It says who is responsible for what — she
 * sells, Cury incorporates and delivers — and it says out loud that the numbers come from a
 * table that moves. Both are compliance and both are the product thesis: the competitor's
 * omission is exactly what this site exists to correct (docs/product-definition.md §01–02).
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-rule bg-sheet">
      <div className="mx-auto w-full max-w-4xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-8">
          <Signature variant="footer" />

          <div className="flex flex-col items-start gap-5">
            <nav
              aria-label="Rodapé"
              className="flex flex-wrap items-center gap-x-6 gap-y-2"
            >
              {[...PRIMARY_ROUTES, ...LEGAL_ROUTES.filter((route) => route.built)].map(
                ({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-sm text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline"
                  >
                    {label}
                  </Link>
                ),
              )}
            </nav>
            <WhatsAppAction
              context={{ origem: "no rodapé do site" }}
              variant="outline"
            />
          </div>
        </div>

        <div className="space-y-3 border-t border-rule pt-6 text-xs text-ink-muted">
          <p className="max-w-prose">
            {BROKER_NAME} é corretora de imóveis autônoma e trabalha na venda de lançamentos
            da Cury Construtora. A incorporação, a obra e a entrega são responsabilidade da
            incorporadora; o registro de incorporação e o cartório onde ele está arquivado
            ficam na ficha de cada empreendimento.
          </p>
          <p className="max-w-prose">
            Preços, condições de pagamento e disponibilidade vêm da tabela vigente da
            incorporadora, mudam sem aviso e são confirmados a cada conversa. Nada nesta página
            reserva unidade.
          </p>
          <p className="max-w-prose">
            Quando houver parcela, ela aparece em dois números: o valor de hoje e o valor
            corrigido pelo INCC até a entrega das chaves.
          </p>
          <p className="font-mono">
            © {new Date().getFullYear()} {BROKER_NAME}
          </p>
        </div>
      </div>
    </footer>
  );
}
