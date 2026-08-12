import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  RequestContext,
} from "payload";

import { somenteAutenticado } from "../access";
import { revalidateCatalogoPath } from "../revalidate";

/**
 * A tipologia has no page of its own — it revalidates the empreendimento's ficha, walking the
 * relationship to find the slug. `doc.empreendimento` arrives as an id, not the populated
 * document, at the default query depth.
 */
const revalidateTipologia: CollectionAfterChangeHook = async ({ doc, req }) => {
  await revalidateEmpreendimentoFicha(doc.empreendimento, req.payload, req.context);
  return doc;
};

const revalidateTipologiaOnDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  await revalidateEmpreendimentoFicha(doc.empreendimento, req.payload, req.context);
  return doc;
};

async function revalidateEmpreendimentoFicha(
  empreendimento: unknown,
  payload: import("payload").Payload,
  context: RequestContext,
) {
  const id = typeof empreendimento === "object" && empreendimento
    ? (empreendimento as { id: number }).id
    : empreendimento;
  if (!id) return;

  const doc = await payload.findByID({
    collection: "empreendimentos",
    id: id as number,
    depth: 0,
  });
  revalidateCatalogoPath(`/empreendimentos/${doc.slug}`, context);
}

/**
 * The floor plan is the primary visual, not a render — a planta is what a couple actually
 * studies at the kitchen table (docs/design-handoff.md §09).
 *
 * Price is a band rather than a figure: the exact number belongs to the commercial table,
 * which expires. See `condicoes-comerciais`.
 */
export const Tipologias: CollectionConfig = {
  slug: "tipologias",
  labels: { singular: "Tipologia", plural: "Tipologias" },
  access: { read: somenteAutenticado },
  hooks: {
    afterChange: [revalidateTipologia],
    afterDelete: [revalidateTipologiaOnDelete],
  },
  admin: {
    useAsTitle: "nome",
    defaultColumns: ["nome", "empreendimento", "dormitorios", "area_privativa"],
    group: "Catálogo",
  },
  fields: [
    {
      name: "nome",
      type: "text",
      label: "Nome",
      required: true,
      admin: { description: 'Como ela chama internamente. Por exemplo "2 quartos com varanda".' },
    },
    {
      name: "empreendimento",
      type: "relationship",
      relationTo: "empreendimentos",
      label: "Empreendimento",
      required: true,
    },
    {
      name: "dormitorios",
      type: "number",
      label: "Dormitórios",
      required: true,
      min: 0,
    },
    {
      name: "vagas",
      type: "number",
      label: "Vagas",
      min: 0,
      defaultValue: 0,
    },
    {
      name: "area_privativa",
      type: "number",
      label: "Área privativa (m²)",
      required: true,
      min: 0,
    },
    {
      name: "planta",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      label: "Plantas",
    },
    {
      name: "faixa_de_preco",
      type: "group",
      label: "Faixa de preço",
      admin: {
        description:
          "Faixa indicativa para a listagem. O valor exato de cada unidade vem da condição comercial, que tem validade.",
      },
      fields: [
        { name: "minimo", type: "number", label: "De (R$)", min: 0 },
        { name: "maximo", type: "number", label: "Até (R$)", min: 0 },
      ],
    },
    {
      name: "faixa_mcmv_elegivel",
      type: "select",
      hasMany: true,
      label: "Faixas MCMV elegíveis",
      options: [
        { label: "Faixa 1", value: "1" },
        { label: "Faixa 2", value: "2" },
        { label: "Faixa 3", value: "3" },
        { label: "Faixa 4", value: "4" },
      ],
      admin: {
        description:
          "Tetos e rendas das faixas são revistos periodicamente e ficam na configuração do programa, nunca no código.",
      },
    },
  ],
};
