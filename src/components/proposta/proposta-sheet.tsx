import { WhatsAppAction } from "@/components/whatsapp-action";
import type { PropostaResumo } from "@/lib/catalogo";
import { formatDate } from "@/lib/format";

import { Carta } from "./carta";
import { LinhaDoTempo } from "./linha-do-tempo";
import { OpcoesComparadas } from "./opcoes-comparadas";
import { RiscosHonestos } from "./riscos-honestos";

/**
 * The whole shared proposal, composed — `docs/design/prototypes/proposta.html` is the
 * reference. `hoje` is a parameter rather than read from the clock so `/sistema`'s fixture panel
 * renders the same thing on every visit instead of drifting as months pass.
 */
export function PropostaSheet({
  proposta,
  hoje = new Date(),
}: {
  proposta: PropostaResumo;
  hoje?: Date;
}) {
  const exemplo = proposta.opcoes.find((opcao) => opcao.destaque) ?? proposta.opcoes[0];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-12 px-6 py-14">
      <p className="font-mono text-xs text-ink-faint">
        Proposta de {formatDate(proposta.criadaEm)} · válida até {formatDate(proposta.expiraEm)}
      </p>

      <Carta
        saudacao={proposta.saudacao}
        titulo={proposta.cartaTitulo}
        principal={proposta.cartaPrincipal}
        contexto={proposta.cartaContexto}
      />

      {proposta.opcoes.length > 0 ? (
        <OpcoesComparadas opcoes={proposta.opcoes} hoje={hoje} />
      ) : null}

      {exemplo ? <LinhaDoTempo exemplo={exemplo} hoje={hoje} /> : null}

      <RiscosHonestos expiraEm={proposta.expiraEm} />

      <section className="space-y-4 border-t border-rule pt-10 text-center">
        <WhatsAppAction
          context={{
            origem: "na proposta que você me mandou",
            empreendimento: exemplo?.empreendimentoNome,
            tipologia: exemplo?.tipologia.nome,
          }}
          label="Mandar uma dúvida no WhatsApp"
          className="w-full sm:w-auto"
        />
        <p className="mx-auto max-w-sm text-sm text-ink-muted">
          Ou me liguem. Se preferirem pensar mais um pouco, a proposta fica de pé até{" "}
          {formatDate(proposta.expiraEm)} e eu não vou ficar cobrando resposta.
        </p>
      </section>
    </div>
  );
}
