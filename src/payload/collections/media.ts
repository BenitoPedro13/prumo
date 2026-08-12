import type { CollectionConfig } from "payload";

/**
 * Renders, photographs and floor plans. The image pipeline matters more here than the
 * database: much of this audience is on prepaid data, so a heavy upload costs the reader
 * money (docs/design-handoff.md §09).
 *
 * `alt` is required because a floor plan with no description is unreadable to a screen
 * reader and to Google alike.
 */
export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Arquivo", plural: "Arquivos" },
  admin: {
    group: "Sistema",
  },
  upload: {
    mimeTypes: ["image/*", "application/pdf"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Descrição da imagem",
      required: true,
      admin: {
        description:
          "Descreva o que a imagem mostra. Aparece para quem usa leitor de tela e quando a imagem não carrega.",
      },
    },
    {
      name: "credito",
      type: "text",
      label: "Crédito",
      admin: {
        description:
          "Origem do material, quando houver. Renders e plantas da Cury são publicados sob autorização registrada na incorporadora.",
      },
    },
  ],
};
