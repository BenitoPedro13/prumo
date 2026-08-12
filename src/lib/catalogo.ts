/**
 * The catalogue's vocabulary and its view types.
 *
 * Components take these shapes rather than Payload documents. Two reasons, and the second is
 * the one that matters: a rename in the CMS should not reach into markup, and the design system
 * on /sistema has to be able to render every component with nothing running behind it.
 */

export type StatusObra = "lancamento" | "em_obras" | "entregue";

export const STATUS_LABEL: Record<StatusObra, string> = {
  lancamento: "Lançamento",
  em_obras: "Em obras",
  entregue: "Entregue",
};

export type ModoTransporte =
  | "metro"
  | "trem"
  | "vlt"
  | "brt"
  | "barca"
  | "onibus";

export const MODO_LABEL: Record<ModoTransporte, string> = {
  metro: "Metrô",
  trem: "Trem",
  vlt: "VLT",
  brt: "BRT",
  barca: "Barca",
  onibus: "Ônibus",
};

export type PontoTransporte = {
  modo: ModoTransporte;
  nome: string;
  minutosAPe?: number | null;
};

export type FaixaDePreco = {
  minimo?: number | null;
  maximo?: number | null;
};

/** What the listing card needs, and nothing else. */
export type EmpreendimentoResumo = {
  nome: string;
  slug: string;
  bairro: string;
  cidade: string;
  status: StatusObra;
  entregaPrevista?: string | null;
  transporte: PontoTransporte[];
  faixa?: FaixaDePreco | null;
  atualizadoEm: string;
};

export type PlantaImagem = {
  url: string;
  alt: string;
  width: number;
  height: number;
};

export type TipologiaResumo = {
  nome: string;
  dormitorios: number;
  vagas?: number | null;
  areaPrivativa: number;
  faixa?: FaixaDePreco | null;
  faixasMcmv: string[];
  planta?: PlantaImagem | null;
};

/**
 * A commercial table as the page needs it. `validadeDaTabela` is not optional and never will
 * be: it is the field that decides whether any of the rest may be shown at all.
 */
export type CondicaoComercialResumo = {
  referencia: string;
  validadeDaTabela: string;
  entradaPercentual?: number | null;
  parcelasObra?: { quantidade?: number | null; valor?: number | null } | null;
  baloes: { mes?: number | null; valor?: number | null }[];
  valorNasChaves?: number | null;
  indiceReajuste: "incc" | "ipca" | "igpm";
};

export const INDICE_LABEL: Record<CondicaoComercialResumo["indiceReajuste"], string> = {
  incc: "INCC",
  ipca: "IPCA",
  igpm: "IGP-M",
};
