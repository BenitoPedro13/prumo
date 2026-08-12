import type { GlobalConfig } from "payload";

/**
 * The numbers that policy and the market move, in the admin rather than in the code —
 * CLAUDE.md §0: configurable, never hardcoded, and always shown with the date of last revision.
 *
 * Today it holds the INCC projection. The MCMV faixas, income ceilings and subsidy bands join
 * it when the pre-qualification is built; they were revised in 2026 and will be revised again.
 */
export const Parametros: GlobalConfig = {
  slug: "parametros",
  label: "Parâmetros do mercado",
  admin: {
    group: "Sistema",
    description:
      "Índices e regras que mudam com o tempo. Toda página que mostra um número daqui mostra também a data desta revisão.",
  },
  fields: [
    {
      name: "incc",
      type: "group",
      label: "Projeção do INCC",
      fields: [
        {
          name: "taxa_anual",
          type: "number",
          label: "Taxa anual (%)",
          min: 0,
          max: 100,
          admin: {
            description:
              "Acumulado de 12 meses do INCC, em porcentagem. Enquanto estiver vazio, nenhuma parcela é exibida no site — nem a de hoje, porque as duas só aparecem juntas.",
          },
        },
        {
          name: "data_revisao",
          type: "date",
          label: "Revisado em",
          admin: {
            description: "Quando este número foi conferido na fonte. Aparece ao lado de cada valor.",
          },
        },
        {
          name: "fonte",
          type: "text",
          label: "Fonte",
          defaultValue: "INCC-DI/FGV, acumulado em 12 meses",
        },
      ],
    },
  ],
};
