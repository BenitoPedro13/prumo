import type { CollectionConfig } from "payload";

import { somenteAutenticado } from "../access";

/**
 * n = 1 today (Cury), kept as an entity because she has already come from another builder
 * once. The authorisation fields exist because the permission to advertise a builder's
 * brand, renders and floor plans has to be evidenced, not remembered
 * (docs/product-definition.md §06).
 */
export const Incorporadoras: CollectionConfig = {
  slug: "incorporadoras",
  labels: { singular: "Incorporadora", plural: "Incorporadoras" },
  access: { read: somenteAutenticado },
  admin: {
    useAsTitle: "nome",
    defaultColumns: ["nome", "updatedAt"],
    group: "Catálogo",
  },
  fields: [
    {
      name: "nome",
      type: "text",
      label: "Nome",
      required: true,
    },
    {
      name: "portal_do_cliente_url",
      type: "text",
      label: "Portal do cliente",
      admin: {
        description: "Endereço onde o comprador acompanha o próprio contrato.",
      },
    },
    {
      name: "link_analise_credito",
      type: "text",
      label: "Link de análise de crédito",
      admin: {
        description:
          "Link de corretor da incorporadora. A análise de crédito é sempre feita lá, nunca aqui.",
      },
    },
    {
      name: "autorizacao_publicidade",
      type: "group",
      label: "Autorização de publicidade",
      fields: [
        {
          name: "concedida_em",
          type: "date",
          label: "Concedida em",
        },
        {
          name: "documento",
          type: "upload",
          relationTo: "media",
          label: "Documento",
          admin: {
            description:
              "A autorização por escrito para divulgar marca, renders e plantas.",
          },
        },
        {
          name: "exige_pre_aprovacao",
          type: "checkbox",
          label: "Exige pré-aprovação das peças",
          admin: {
            description:
              "Se marcado, cada proposta precisa de aprovação da incorporadora antes de virar link público.",
          },
        },
      ],
    },
  ],
};
