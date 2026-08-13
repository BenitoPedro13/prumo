import type {
  CondicaoComercialResumo,
  OpcaoProposta,
  PropostaResumo,
} from "@/lib/catalogo";
import type { Proposta } from "@/payload/payload-types";

import { toTipologiaResumo } from "../empreendimentos/mapping";

/**
 * Payload document → view type, same split as `../empreendimentos/mapping.ts`: the components
 * take `PropostaResumo`, not a `Proposta`, so `/sistema` can render them with a fixture and
 * nothing running behind it.
 *
 * `tipologias[i]` and `premissas[i]` are matched by index — both are built in the same order,
 * by the same `beforeValidate` hook, in one pass (`src/payload/collections/propostas.ts`). An
 * item with no matching premissa is dropped rather than shown with invented numbers.
 */
export function toPropostaResumo(doc: Proposta): PropostaResumo {
  const opcoes: OpcaoProposta[] = (doc.tipologias ?? []).flatMap((item, index) => {
    const tipologiaDoc = typeof item.tipologia === "object" ? item.tipologia : null;
    const premissaDoc = doc.premissas?.[index];
    if (!tipologiaDoc || !premissaDoc) return [];

    const empreendimentoDoc =
      typeof tipologiaDoc.empreendimento === "object" ? tipologiaDoc.empreendimento : null;

    return [
      {
        tipologia: toTipologiaResumo(tipologiaDoc),
        empreendimentoNome: empreendimentoDoc?.nome ?? "",
        destaque: item.destaque ?? false,
        nota: item.nota,
        premissa: {
          tipologiaNome: premissaDoc.tipologia_nome ?? tipologiaDoc.nome,
          referenciaTabela: premissaDoc.referencia_tabela ?? "",
          entradaPercentual: premissaDoc.entrada_percentual,
          parcelasObra: premissaDoc.parcelas_obra,
          baloes: premissaDoc.baloes ?? [],
          valorNasChaves: premissaDoc.valor_nas_chaves,
          indiceReajuste:
            (premissaDoc.indice_reajuste as CondicaoComercialResumo["indiceReajuste"]) ?? "incc",
          projecaoIncc:
            typeof premissaDoc.incc_taxa_anual === "number" && premissaDoc.incc_data_revisao
              ? {
                  taxaAnual: premissaDoc.incc_taxa_anual / 100,
                  dataRevisao: premissaDoc.incc_data_revisao,
                }
              : null,
          entregaPrevista: premissaDoc.entrega_prevista,
        },
      },
    ];
  });

  return {
    saudacao: doc.saudacao,
    cartaTitulo: doc.carta.titulo,
    cartaPrincipal: doc.carta.paragrafo_principal,
    cartaContexto: doc.carta.paragrafo_contexto,
    opcoes,
    expiraEm: doc.expira_em,
    criadaEm: doc.createdAt,
    numeroAberturas: doc.eventos_de_abertura?.length ?? 0,
  };
}
