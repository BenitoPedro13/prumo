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
  /**
   * Public read, unlike every sibling collection in `../access.ts`. These files are rendered
   * on public pages, so gating them is a bug, not a safeguard — and without this, Payload's
   * unset-`access` default (`Boolean(user)`) blocks anonymous reads. That default is invisible
   * in local dev, where unconfigured storage falls back to serving straight off disk; the S3
   * and Vercel Blob plugins both proxy file reads through this same collection access check,
   * so it only surfaces once object storage is actually configured.
   */
  access: { read: () => true },
  upload: {
    mimeTypes: ["image/*", "application/pdf"],
    /**
     * Three sizes, and every one of them AVIF. The originals are Cury's renders and floor
     * plans at print resolution; served raw they would cost a reader on prepaid data more
     * than the page is worth (docs/design-handoff.md §09).
     *
     * `planta` is the largest because the floor plan is the one image on the page people
     * actually study, and a planta that cannot be read defeats the point of showing it.
     */
    imageSizes: [
      {
        name: "card",
        width: 640,
        withoutEnlargement: true,
        formatOptions: { format: "avif", options: { quality: 55 } },
      },
      {
        name: "ficha",
        width: 1280,
        withoutEnlargement: true,
        formatOptions: { format: "avif", options: { quality: 55 } },
      },
      {
        name: "planta",
        width: 1600,
        withoutEnlargement: true,
        formatOptions: { format: "avif", options: { quality: 70 } },
      },
    ],
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
