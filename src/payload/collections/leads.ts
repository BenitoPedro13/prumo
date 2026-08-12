import type { CollectionConfig } from "payload";

import { somenteAutenticado } from "../access";

/**
 * The only writer is the Server Action behind `/contato` (`docs/tasks/TASK-contato-lgpd.md`
 * §2.1), which creates through the Local API — that bypasses access control by design, the
 * same reason the catalogue's public read grants don't need to cover this collection either.
 * `create: () => false` closes the public REST/GraphQL write surface explicitly, on top of
 * Payload's own default of requiring a logged-in user.
 */
export const Leads: CollectionConfig = {
  slug: "leads",
  labels: { singular: "Lead", plural: "Leads" },
  access: { create: () => false, read: somenteAutenticado },
  admin: {
    useAsTitle: "nome",
    defaultColumns: ["nome", "telefone", "estagio", "retomar_em", "createdAt"],
    group: "Contato",
  },
  fields: [
    {
      name: "nome",
      type: "text",
      label: "Nome",
      required: true,
    },
    {
      name: "telefone",
      type: "text",
      label: "Telefone",
      required: true,
    },
    {
      name: "mensagem",
      type: "textarea",
      label: "Mensagem",
    },
    {
      name: "origem",
      type: "text",
      label: "Origem",
      admin: {
        description: "De onde o lead chegou. Preenchido pelo formulário que o criou.",
      },
    },
    {
      name: "estagio",
      type: "select",
      label: "Estágio",
      defaultValue: "novo",
      options: [
        { label: "Novo", value: "novo" },
        { label: "Em conversa", value: "em_conversa" },
        { label: "Aguardando retomada", value: "aguardando_retomada" },
        { label: "Convertido", value: "convertido" },
        { label: "Perdido", value: "perdido" },
      ],
      admin: {
        description: "Movido à mão por ela na medida em que a conversa avança.",
      },
    },
    {
      name: "retomar_em",
      type: "date",
      label: "Retomar em",
      admin: {
        description:
          "Data escolhida por ela quando marca o lead como \"aguardando retomada\". O formulário " +
          "público nunca preenche este campo.",
      },
    },
  ],
};
