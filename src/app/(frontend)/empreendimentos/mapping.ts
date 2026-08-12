import type {
  CondicaoComercialResumo,
  EmpreendimentoResumo,
  PlantaImagem,
  TipologiaResumo,
} from "@/lib/catalogo";
import type { ProjecaoIndice } from "@/lib/incc";
import type {
  CondicoesComerciai,
  Empreendimento,
  Media,
  Parametro,
  Tipologia,
} from "@/payload/payload-types";

/**
 * Payload document → view type, colocated with the routes rather than in `src/lib/catalogo.ts`
 * (docs/tasks/TASK-empreendimentos.md §9.2). The types in `catalogo.ts` are deliberately
 * Payload-shaped-nothing — this is the one place allowed to know the schema.
 */

/** The `planta` image size — the largest of the three, because it is the one people study. */
function plantaImagemDe(media: number | Media | null | undefined): PlantaImagem | null {
  if (!media || typeof media === "number") return null;

  const variante = media.sizes?.planta;
  const url = variante?.url ?? media.url;
  const width = variante?.width ?? media.width;
  const height = variante?.height ?? media.height;

  if (!url || !width || !height) return null;

  return { url, alt: media.alt, width, height };
}

/**
 * The cheapest tipologia sets the listing's band (docs/tasks/TASK-empreendimentos.md §2.3) and
 * is also the one the ficha's commercial-conditions block refers to — the same tipologia in
 * both places, chosen by price rather than by query order, which Payload does not guarantee.
 */
export function tipologiaMaisBarata(tipologias: Tipologia[]): Tipologia | null {
  return tipologias.reduce<Tipologia | null>((maisBarata, atual) => {
    const valor = atual.faixa_de_preco?.minimo ?? atual.faixa_de_preco?.maximo;
    if (typeof valor !== "number") return maisBarata;

    const valorAtual = maisBarata?.faixa_de_preco?.minimo ?? maisBarata?.faixa_de_preco?.maximo;
    if (typeof valorAtual !== "number" || valor < valorAtual) return atual;

    return maisBarata;
  }, null);
}

export function toEmpreendimentoResumo(
  doc: Empreendimento,
  tipologias: Tipologia[],
): EmpreendimentoResumo {
  const referencia = tipologiaMaisBarata(tipologias);

  return {
    nome: doc.nome,
    slug: doc.slug,
    bairro: doc.endereco.bairro,
    cidade: doc.endereco.cidade,
    status: doc.status_obra,
    entregaPrevista: doc.entrega_prevista,
    transporte: (doc.transporte_proximo ?? []).map((ponto) => ({
      modo: ponto.modo,
      nome: ponto.nome,
      minutosAPe: ponto.minutos_a_pe,
    })),
    faixa: referencia?.faixa_de_preco ?? null,
    atualizadoEm: doc.updatedAt,
  };
}

export function toTipologiaResumo(doc: Tipologia): TipologiaResumo {
  const primeiraPlanta = Array.isArray(doc.planta) ? doc.planta[0] : null;

  return {
    nome: doc.nome,
    dormitorios: doc.dormitorios,
    vagas: doc.vagas,
    areaPrivativa: doc.area_privativa,
    faixa: doc.faixa_de_preco ?? null,
    faixasMcmv: doc.faixa_mcmv_elegivel ?? [],
    planta: plantaImagemDe(primeiraPlanta),
  };
}

export function toCondicaoComercialResumo(doc: CondicoesComerciai): CondicaoComercialResumo {
  return {
    referencia: doc.referencia,
    validadeDaTabela: doc.validade_da_tabela,
    entradaPercentual: doc.entrada_percentual,
    parcelasObra: doc.parcelas_obra ?? null,
    baloes: doc.baloes ?? [],
    valorNasChaves: doc.valor_nas_chaves,
    indiceReajuste: doc.indice_reajuste ?? "incc",
  };
}

/**
 * `taxa_anual` is stored in the admin as a percentage (8,12) because that is what a person
 * types; `src/lib/incc.ts` works in decimals (0,0812). This is the one place that conversion
 * happens.
 */
export function toProjecaoIndice(parametros: Parametro): ProjecaoIndice | null {
  const taxa = parametros.incc?.taxa_anual;
  const dataRevisao = parametros.incc?.data_revisao;
  if (typeof taxa !== "number" || !dataRevisao) return null;

  return {
    taxaAnual: taxa / 100,
    dataRevisao,
    fonte: parametros.incc?.fonte,
  };
}

/** The table this ficha shows: belongs to the reference tipologia, most recently valid first. */
export function condicaoAtual(
  condicoes: CondicoesComerciai[],
  tipologiaId: number,
): CondicoesComerciai | null {
  const daTipologia = condicoes.filter((condicao) => {
    const id = typeof condicao.tipologia === "object" ? condicao.tipologia.id : condicao.tipologia;
    return id === tipologiaId;
  });

  if (daTipologia.length === 0) return null;

  return daTipologia.sort(
    (a, b) => new Date(b.validade_da_tabela).getTime() - new Date(a.validade_da_tabela).getTime(),
  )[0];
}
