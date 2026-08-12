import type { CollectionConfig } from "payload";

/**
 * Admin access. Infrastructure rather than domain — Payload requires an auth collection to
 * sign into the panel at all.
 */
export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Usuário", plural: "Usuários" },
  auth: true,
  admin: {
    useAsTitle: "email",
    group: "Sistema",
  },
  fields: [
    {
      name: "nome",
      type: "text",
      label: "Nome",
      required: true,
    },
  ],
};
