import { randomBytes } from "crypto";

import type { CollectionBeforeChangeHook, CollectionBeforeValidateHook, CollectionConfig } from "payload";

import { somenteAutenticado } from "../access";
import { tabelaExpirada } from "../../lib/incc";

/**
 * Runs before `token_publico`/`premissas` are trusted to exist, so it can read the
 * just-submitted `tipologias` array and decide whether the save is even allowed.
 *
 * Blocking here — not in the UI, not as a warning — is the direct application of CLAUDE.md §0:
 * "An expired price table blocks proposal generation." A stale table is the single most
 * expensive mistake this product can make, and the cheapest place to stop it is the one gate
 * every save must pass through.
 *
 * The same pass also copies the current numbers into `premissas`: a proposal freezes its
 * assumptions rather than referencing current prices (`docs/product-definition.md` §05), so this
 * is the one moment that snapshot is taken.
 */
const bloquearTabelaExpiradaESnapshot: CollectionBeforeValidateHook = async ({
  data,
  req,
  operation,
}) => {
  if (operation !== "create" || !data) return data;

  const itens = Array.isArray(data.tipologias) ? data.tipologias : [];
  const hoje = new Date();
  const premissas = [];

  for (const item of itens) {
    const condicaoId =
      typeof item.condicao_comercial === "object"
        ? item.condicao_comercial?.id
        : item.condicao_comercial;
    const tipologiaId =
      typeof item.tipologia === "object" ? item.tipologia?.id : item.tipologia;
    if (!condicaoId || !tipologiaId) continue;

    const condicao = await req.payload.findByID({
      collection: "condicoes-comerciais",
      id: condicaoId,
      depth: 0,
    });
    const tipologia = await req.payload.findByID({
      collection: "tipologias",
      id: tipologiaId,
      depth: 0,
    });
    const empreendimentoId =
      typeof tipologia.empreendimento === "object"
        ? tipologia.empreendimento?.id
        : tipologia.empreendimento;
    const empreendimento = empreendimentoId
      ? await req.payload.findByID({
          collection: "empreendimentos",
          id: empreendimentoId,
          depth: 0,
        })
      : null;

    if (tabelaExpirada({ validadeDaTabela: condicao.validade_da_tabela }, hoje)) {
      throw new Error(
        `A tabela "${condicao.referencia}" venceu em ${condicao.validade_da_tabela} e não pode gerar proposta. Peça uma tabela vigente antes de tentar de novo.`,
      );
    }

    const parametros = await req.payload.findGlobal({ slug: "parametros" });

    premissas.push({
      tipologia_nome: tipologia.nome,
      referencia_tabela: condicao.referencia,
      entrada_percentual: condicao.entrada_percentual,
      parcelas_obra: condicao.parcelas_obra,
      baloes: condicao.baloes,
      valor_nas_chaves: condicao.valor_nas_chaves,
      indice_reajuste: condicao.indice_reajuste,
      incc_taxa_anual: parametros.incc?.taxa_anual,
      incc_data_revisao: parametros.incc?.data_revisao,
      entrega_prevista: empreendimento?.entrega_prevista,
    });
  }

  data.premissas = premissas;
  return data;
};

/** Short, URL-safe, unguessable enough — and set once, on create, never touched again. */
const gerarToken: CollectionBeforeChangeHook = async ({ data, operation }) => {
  if (operation === "create" && !data.token_publico) {
    data.token_publico = randomBytes(9).toString("base64url");
  }
  return data;
};

/**
 * The shared proposal link — `docs/tasks/TASK-proposta.md`, `docs/product-definition.md` §05.
 *
 * Two rules from that document shape this collection more than any field does:
 *
 * **A proposal freezes its assumptions.** `premissas` is a snapshot copied out of the selected
 * `condicoes-comerciais` at creation time, not a live reference to them. A link sent in March
 * must show in May what she actually promised — so editing the source table afterwards does not
 * change a proposal that already exists. `premissas` is read-only in the admin for the same
 * reason a receipt is read-only: it is a record of what was said, not a live figure.
 *
 * **An expired price table blocks proposal generation** (CLAUDE.md §0). That's not a UI
 * suggestion, it's enforced in `beforeValidate` above — the save itself fails.
 */
export const Propostas: CollectionConfig = {
  slug: "propostas",
  labels: { singular: "Proposta", plural: "Propostas" },
  access: { create: somenteAutenticado, read: somenteAutenticado, update: somenteAutenticado },
  admin: {
    useAsTitle: "saudacao",
    defaultColumns: ["saudacao", "lead", "expira_em", "createdAt"],
    group: "Contato",
  },
  hooks: {
    beforeValidate: [bloquearTabelaExpiradaESnapshot],
    beforeChange: [gerarToken],
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
      name: "saudacao",
      type: "text",
      label: "Saudação",
      required: true,
      admin: {
        description: 'Como a carta começa. Por exemplo "Juliana e Marcos" — pode ser um casal, o Lead é uma pessoa só.',
      },
    },
    {
      name: "carta",
      type: "group",
      label: "Carta",
      fields: [
        {
          name: "titulo",
          type: "text",
          label: "Título",
          required: true,
          admin: {
            description: 'A frase de abertura, escrita como ela fala. Por exemplo "Separei duas, e uma delas eu acho melhor."',
          },
        },
        {
          name: "paragrafo_principal",
          type: "textarea",
          label: "Parágrafo principal",
          required: true,
          admin: { description: "O porquê destas opções — o que ficou de fora e por quê." },
        },
        {
          name: "paragrafo_contexto",
          type: "textarea",
          label: "Parágrafo de contexto",
          admin: {
            description: "Opcional. Comparação entre as opções, ou o que vale a pena elas conversarem antes de decidir.",
          },
        },
      ],
    },
    {
      name: "tipologias",
      type: "array",
      label: "Opções",
      labels: { singular: "Opção", plural: "Opções" },
      minRows: 1,
      maxRows: 2,
      admin: {
        description: "Uma ou duas unidades. A tabela comercial de cada uma precisa estar dentro da validade — uma tabela vencida bloqueia o salvamento.",
      },
      fields: [
        {
          name: "tipologia",
          type: "relationship",
          relationTo: "tipologias",
          label: "Tipologia",
          required: true,
        },
        {
          name: "condicao_comercial",
          type: "relationship",
          relationTo: "condicoes-comerciais",
          label: "Condição comercial",
          required: true,
        },
        {
          name: "destaque",
          type: "checkbox",
          label: "Destacar como recomendada",
          defaultValue: false,
        },
        {
          name: "nota",
          type: "text",
          label: "Nota",
          admin: { description: 'Curta, opcional. Por exemplo "é duas quadras do VLT".' },
        },
      ],
    },
    {
      name: "premissas",
      type: "array",
      label: "Premissas (congeladas)",
      admin: {
        readOnly: true,
        description: "Copiado automaticamente das condições comerciais no momento em que a proposta é criada. Editar a tabela depois não muda o que está aqui.",
      },
      fields: [
        { name: "tipologia_nome", type: "text", label: "Tipologia" },
        { name: "referencia_tabela", type: "text", label: "Referência da tabela" },
        { name: "entrada_percentual", type: "number", label: "Entrada (%)" },
        {
          name: "parcelas_obra",
          type: "group",
          label: "Parcelas de obra",
          fields: [
            { name: "quantidade", type: "number", label: "Quantidade" },
            { name: "valor", type: "number", label: "Valor nominal (R$)" },
          ],
        },
        {
          name: "baloes",
          type: "array",
          label: "Balões",
          fields: [
            { name: "mes", type: "number", label: "Mês" },
            { name: "valor", type: "number", label: "Valor (R$)" },
          ],
        },
        { name: "valor_nas_chaves", type: "number", label: "Valor nas chaves (R$)" },
        { name: "indice_reajuste", type: "text", label: "Índice de reajuste" },
        { name: "incc_taxa_anual", type: "number", label: "Taxa INCC anual (%) no momento" },
        { name: "incc_data_revisao", type: "date", label: "INCC revisado em" },
        { name: "entrega_prevista", type: "date", label: "Entrega prevista" },
      ],
    },
    {
      name: "expira_em",
      type: "date",
      label: "Válida até",
      required: true,
      admin: {
        description: "Depois desta data a página mostra que a proposta venceu, com o WhatsApp dela, em vez de continuar exibindo os números.",
      },
    },
    {
      name: "token_publico",
      type: "text",
      label: "Token",
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: "Gerado uma vez na criação. A URL compartilhada é /p/<token>.",
      },
    },
    {
      name: "eventos_de_abertura",
      type: "array",
      label: "Aberturas",
      admin: {
        readOnly: true,
        description: 'Preenchido pela própria página a cada visita — "ela vê quando foi aberta, e quantas vezes".',
      },
      fields: [{ name: "aberto_em", type: "date", label: "Aberto em" }],
    },
  ],
};
