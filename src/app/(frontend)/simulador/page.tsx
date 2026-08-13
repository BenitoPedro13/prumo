import type { Metadata } from "next";

import { Fluxo } from "@/components/prequalificacao/fluxo";
import { pageMetadata } from "@/lib/metadata";
import type { FaixaMcmv, ParametrosMcmv } from "@/lib/mcmv";
import { payload } from "@/lib/payload";

export const metadata: Metadata = pageMetadata({
  path: "/simulador",
  title: "Você consegue comprar?",
  description:
    "Seis perguntas, cerca de um minuto: em que faixa do Minha Casa Minha Vida você entra, quanto costuma caber no seu mês, e o que pode travar antes de começar.",
});

/**
 * The pré-qualificação — docs/tasks/TASK-pre-qualificacao.md.
 *
 * The server's whole job is to read the faixas and hand them down. The arithmetic and the six
 * answers stay in the browser and are never sent anywhere, which is what lets this page make
 * the promise it makes on its first screen (`fluxo.tsx`).
 *
 * The faixas are read through the Local API, the same way the catalogue does it — same process,
 * no HTTP hop (docs/tasks/TASK-empreendimentos.md §2.1).
 */
async function parametrosMcmv(): Promise<{
  parametros: ParametrosMcmv;
  valoresSugeridos: boolean;
}> {
  const client = await payload();
  const parametros = await client.findGlobal({ slug: "parametros" });
  const mcmv = parametros.mcmv;

  return {
    parametros: {
      faixas: (mcmv?.faixas ?? []).map(
        (faixa): FaixaMcmv => ({
          nome: faixa.nome,
          rendaMin: faixa.renda_min,
          rendaMax: faixa.renda_max,
          tetoImovel: faixa.teto_imovel,
          taxaJurosAnual: faixa.taxa_juros_anual,
          subsidioMaximo: faixa.subsidio_maximo,
          percentualFinanciado: faixa.percentual_financiado,
        }),
      ),
      dataRevisao: mcmv?.data_revisao,
      fonte: mcmv?.fonte,
      portaria: mcmv?.portaria,
    },
    valoresSugeridos: Boolean(mcmv?.valores_sugeridos),
  };
}

export default async function Simulador() {
  const { parametros, valoresSugeridos } = await parametrosMcmv();

  /*
    Full-bleed, and the only screen on the site that is. The layout's `main` carries no
    container precisely for this one. The rail runs the height of the viewport at the left edge
    rather than sitting inside a centred column, so the content column does its own centring
    beside it (`fluxo.tsx`).
  */
  return <Fluxo parametros={parametros} valoresSugeridos={valoresSugeridos} />;
}
