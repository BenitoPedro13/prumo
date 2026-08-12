import type { CollectionConfig } from "payload";

import { somenteAutenticado } from "../access";

/**
 * The stored proof of what a `Lead` agreed to, sourced verbatim from `src/lib/lgpd.ts` at
 * creation time so the copy on the page and the copy on record are always the same string.
 *
 * No separate timestamp field: `createdAt`, which Payload stamps on every document, already is
 * the moment consent was given.
 *
 * `revogado_em` exists so a revoked record is representable, but nothing here is self-service —
 * she sets it by hand in the admin when someone asks her to stop (§2.5 of the task doc). Same
 * write posture as `Leads`: the only creator is the `/contato` Server Action, through the Local
 * API.
 */
export const Consentimentos: CollectionConfig = {
  slug: "consentimentos",
  labels: { singular: "Consentimento", plural: "Consentimentos" },
  access: { create: () => false, read: somenteAutenticado },
  admin: {
    useAsTitle: "lead",
    defaultColumns: ["lead", "finalidade", "texto_versao", "createdAt", "revogado_em"],
    group: "Contato",
  },
  fields: [
    {
      name: "lead",
      type: "relationship",
      relationTo: "leads",
      label: "Lead",
      required: true,
    },
    {
      name: "finalidade",
      type: "text",
      label: "Finalidade",
      required: true,
      admin: {
        description: "O que ela pode usar este contato para fazer, em texto claro.",
      },
    },
    {
      name: "texto_versao",
      type: "text",
      label: "Versão do texto",
      required: true,
      admin: {
        description: "Qual versão da cópia de consentimento a pessoa aceitou.",
      },
    },
    {
      name: "ip",
      type: "text",
      label: "IP",
      admin: {
        description: "Lido do cabeçalho da requisição no servidor, nunca enviado pelo cliente.",
      },
    },
    {
      name: "revogado_em",
      type: "date",
      label: "Revogado em",
      admin: {
        description: "Preenchido à mão quando ela é avisada para parar de usar este contato.",
      },
    },
  ],
};
