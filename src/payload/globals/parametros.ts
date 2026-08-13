import type { GlobalConfig } from "payload";

/**
 * The numbers that policy and the market move, in the admin rather than in the code —
 * CLAUDE.md §0: configurable, never hardcoded, and always shown with the date of last revision.
 *
 * Holds the INCC projection and the MCMV faixas. Both were revised in 2026 and both will be
 * revised again — the faixas by portaria, which is exactly why they are an editable array here
 * rather than four shapes in code. See docs/tasks/TASK-mcmv-parametros.md.
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
    {
      name: "mcmv",
      type: "group",
      label: "Faixas do Minha Casa Minha Vida",
      admin: {
        description:
          "Faixas urbanas, na ordem em que o programa as define. Um campo vazio não é zero: enquanto o teto ou a taxa de uma faixa estiverem em branco, nenhum número dela é exibido no site. É melhor não mostrar do que mostrar errado.",
      },
      fields: [
        {
          name: "faixas",
          type: "array",
          label: "Faixas (área urbana)",
          labels: { singular: "Faixa", plural: "Faixas" },
          admin: {
            description:
              "Uma linha por faixa. Se uma portaria criar, unir ou remover faixas, isso se resolve aqui — não no código.",
          },
          fields: [
            {
              name: "nome",
              type: "text",
              label: "Nome da faixa",
              required: true,
              admin: { description: "Como o programa a chama. Ex.: Faixa 3." },
            },
            {
              name: "renda_min",
              type: "number",
              label: "Renda bruta familiar mínima (R$)",
              required: true,
              min: 0,
            },
            {
              name: "renda_max",
              type: "number",
              label: "Renda bruta familiar máxima (R$)",
              required: true,
              min: 0,
            },
            {
              name: "teto_imovel",
              type: "number",
              label: "Teto do valor do imóvel (R$)",
              min: 0,
              admin: {
                description:
                  "Nas Faixas 1 e 2 o teto varia conforme a localidade. Deixe vazio até confirmar o valor que vale no Rio de Janeiro.",
              },
            },
            {
              name: "taxa_juros_anual",
              type: "number",
              label: "Taxa de juros nominal (% a.a.)",
              min: 0,
              max: 100,
              admin: {
                description: "Confirme na Caixa antes de preencher. Vazio significa que nada é exibido.",
              },
            },
            {
              name: "subsidio_maximo",
              type: "number",
              label: "Subsídio máximo (R$)",
              min: 0,
            },
            {
              name: "percentual_financiado",
              type: "number",
              label: "Percentual financiável (%)",
              min: 0,
              max: 100,
            },
          ],
        },
        {
          name: "data_revisao",
          type: "date",
          label: "Revisado em",
          admin: {
            description: "Quando estes números foram conferidos na fonte. Aparece ao lado de cada valor.",
          },
        },
        {
          name: "fonte",
          type: "text",
          label: "Fonte",
          defaultValue: "Ministério das Cidades — programa Minha Casa, Minha Vida",
        },
        {
          name: "portaria",
          type: "text",
          label: "Portaria vigente",
          admin: {
            description: "A norma que fixou estes limites. Ex.: Portaria MCID nº 333, de 30 de março de 2026.",
          },
        },
      ],
    },
  ],
};
