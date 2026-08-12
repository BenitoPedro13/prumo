import type { CollectionConfig } from "payload";

/**
 * The one entity in the catalogue that expires.
 *
 * A proposal built on a stale table is the most expensive mistake available here, so
 * `validade_da_tabela` is required at the schema level. The hard gate that blocks proposal
 * generation on an expired table is Phase 1 and gets its own task; this collection only
 * guarantees the date is always present to gate on.
 *
 * `valor_nas_chaves` and `indice_reajuste` exist together because both installment figures
 * must always be shown together — nominal today and corrected at handover. Showing only the
 * first is the industry's standard omission and the thing this product exists to correct.
 */
export const CondicoesComerciais: CollectionConfig = {
  slug: "condicoes-comerciais",
  labels: { singular: "Condição comercial", plural: "Condições comerciais" },
  admin: {
    useAsTitle: "referencia",
    defaultColumns: ["referencia", "tipologia", "validade_da_tabela"],
    group: "Catálogo",
  },
  fields: [
    {
      name: "referencia",
      type: "text",
      label: "Referência da tabela",
      required: true,
      admin: { description: 'Como a incorporadora nomeia a tabela. Por exemplo "Tabela 12 — agosto".' },
    },
    {
      name: "tipologia",
      type: "relationship",
      relationTo: "tipologias",
      label: "Tipologia",
      required: true,
    },
    {
      name: "validade_da_tabela",
      type: "date",
      label: "Válida até",
      required: true,
      index: true,
      admin: {
        description:
          "Depois desta data a tabela não pode gerar proposta. A data vem da incorporadora — não é estimada aqui.",
      },
    },
    {
      name: "entrada_percentual",
      type: "number",
      label: "Entrada (%)",
      min: 0,
      max: 100,
    },
    {
      name: "parcelas_obra",
      type: "group",
      label: "Parcelas de obra",
      fields: [
        { name: "quantidade", type: "number", label: "Quantidade", min: 0 },
        { name: "valor", type: "number", label: "Valor nominal hoje (R$)", min: 0 },
      ],
    },
    {
      name: "baloes",
      type: "array",
      label: "Balões",
      labels: { singular: "Balão", plural: "Balões" },
      fields: [
        { name: "mes", type: "number", label: "Mês", min: 0 },
        { name: "valor", type: "number", label: "Valor (R$)", min: 0 },
      ],
    },
    {
      name: "valor_nas_chaves",
      type: "number",
      label: "Valor nas chaves (R$)",
      min: 0,
      admin: {
        description:
          "Saldo que vai a repasse na entrega, sujeito a nova análise de crédito naquele momento.",
      },
    },
    {
      name: "indice_reajuste",
      type: "select",
      label: "Índice de reajuste",
      defaultValue: "incc",
      options: [
        { label: "INCC (até a entrega)", value: "incc" },
        { label: "IPCA", value: "ipca" },
        { label: "IGP-M", value: "igpm" },
      ],
      admin: {
        description:
          "Parcelas pagas antes da entrega são corrigidas mensalmente. A parcela de hoje não é a do mês 30.",
      },
    },
  ],
};
