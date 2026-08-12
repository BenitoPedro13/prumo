import type { CollectionConfig } from "payload";

import { publicadosOuAutenticado } from "../access";

/**
 * `registro_incorporacao` and `cartorio` are required by law in any advertising of a unit
 * under incorporação, which is why they are required fields and not optional notes
 * (docs/product-definition.md §06).
 *
 * There is deliberately no "disponível" flag. The sales mirror is the builder's and changes
 * hourly; availability is always "consultar", never asserted here.
 *
 * Drafts are the publication gate. Payload skips required-field validation on a draft and
 * enforces it on publish, so "no registro de incorporação and no cartório, no publish" is not a
 * policy anyone has to remember — it is the only way the button works. She can start a launch's
 * page the day she hears about it and simply cannot make it public until the number arrives.
 */
export const Empreendimentos: CollectionConfig = {
  slug: "empreendimentos",
  labels: { singular: "Empreendimento", plural: "Empreendimentos" },
  admin: {
    useAsTitle: "nome",
    defaultColumns: ["nome", "status", "entrega_prevista", "_status"],
    group: "Catálogo",
    description:
      "Um empreendimento só vai ao ar com registro de incorporação e cartório preenchidos. Salve como rascunho até tê-los.",
  },
  versions: {
    drafts: { autosave: false },
    maxPerDoc: 10,
  },
  access: { read: publicadosOuAutenticado },
  fields: [
    {
      name: "nome",
      type: "text",
      label: "Nome",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      unique: true,
      index: true,
      admin: {
        description: "Trecho final do endereço da página. Só letras minúsculas e hífens.",
      },
    },
    {
      name: "incorporadora",
      type: "relationship",
      relationTo: "incorporadoras",
      label: "Incorporadora",
      required: true,
    },
    {
      name: "status",
      type: "select",
      label: "Status da obra",
      required: true,
      options: [
        { label: "Lançamento", value: "lancamento" },
        { label: "Em obras", value: "em_obras" },
        { label: "Entregue", value: "entregue" },
      ],
    },
    {
      name: "entrega_prevista",
      type: "date",
      label: "Entrega prevista",
      admin: {
        description:
          "A data do contrato. A tolerância de 180 dias é explicada na página — não é escondida aqui.",
      },
    },
    {
      name: "endereco",
      type: "group",
      label: "Endereço",
      fields: [
        { name: "logradouro", type: "text", label: "Logradouro", required: true },
        { name: "numero", type: "text", label: "Número" },
        { name: "bairro", type: "text", label: "Bairro", required: true },
        { name: "cidade", type: "text", label: "Cidade", required: true, defaultValue: "Rio de Janeiro" },
        { name: "uf", type: "text", label: "UF", required: true, defaultValue: "RJ" },
        { name: "cep", type: "text", label: "CEP" },
      ],
    },
    {
      name: "geo",
      type: "group",
      label: "Coordenadas",
      admin: {
        description: "Usadas para o mapa e para calcular o entorno.",
      },
      fields: [
        { name: "latitude", type: "number", label: "Latitude" },
        { name: "longitude", type: "number", label: "Longitude" },
      ],
    },
    {
      name: "transporte_proximo",
      type: "array",
      label: "Transporte próximo",
      labels: { singular: "Ponto", plural: "Pontos" },
      fields: [
        {
          name: "modo",
          type: "select",
          label: "Modo",
          required: true,
          options: [
            { label: "Metrô", value: "metro" },
            { label: "Trem", value: "trem" },
            { label: "VLT", value: "vlt" },
            { label: "BRT", value: "brt" },
            { label: "Barca", value: "barca" },
            { label: "Ônibus", value: "onibus" },
          ],
        },
        { name: "nome", type: "text", label: "Nome da estação ou ponto", required: true },
        {
          name: "minutos_a_pe",
          type: "number",
          label: "Minutos a pé",
          admin: { description: "Tempo real de caminhada, não distância em linha reta." },
        },
      ],
    },
    {
      name: "lazer",
      type: "array",
      label: "Lazer e infraestrutura",
      labels: { singular: "Item", plural: "Itens" },
      fields: [{ name: "item", type: "text", label: "Item", required: true }],
    },
    {
      name: "midia",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      label: "Mídia",
      admin: {
        description: "Renders e fotografias. Prédios entregues valem mais que renders.",
      },
    },
    {
      name: "registro_legal",
      type: "group",
      label: "Registro de incorporação",
      admin: {
        description:
          "Obrigatório por lei em qualquer anúncio de unidade em incorporação. Sem estes dois campos o empreendimento não pode ser divulgado.",
      },
      fields: [
        {
          name: "registro_incorporacao",
          type: "text",
          label: "Número do registro",
          required: true,
        },
        {
          name: "cartorio",
          type: "text",
          label: "Cartório",
          required: true,
        },
      ],
    },
  ],
};
