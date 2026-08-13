import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { getPayload } from "payload";

import config from "@payload-config";

/**
 * Development data only — docs/tasks/TASK-empreendimentos.md §2.8 / §9.7.
 *
 * One incorporadora (Cury, authorised — the publication gate in
 * src/payload/collections/empreendimentos.ts has something to pass), one published
 * empreendimento with both legal fields filled, two tipologias and one live commercial table.
 *
 * The address, the VLT station, the delivery month, the leisure list and the starting price of
 * the smallest unit are real — Cury's own marketing site for Residencial Pixinguinha in Santo
 * Cristo (confirmed 2026-08-12). Everything Cury does not publish — the registro de
 * incorporação, the cartório, the payment schedule, the INCC rate — is still invented and
 * clearly marked `[SEED]` or `[VERIFICAR]`. Useful for exercising the pages and the publication
 * gate with a real address instead of a placeholder; still never sent to a buyer, still never
 * part of a production deploy — see docs/tasks/TASK-empreendimentos.md §7.
 *
 * Run with `pnpm seed`. Idempotent in the sense that matters here: it refuses to run twice
 * against the same database rather than piling up duplicates.
 */

const payload = await getPayload({ config });

/**
 * Every write here skips the revalidation hooks. `revalidatePath` needs a Next.js request and
 * this script is not one, so without it the first write throws (src/payload/revalidate.ts).
 */
const semRevalidacao = { context: { disableRevalidate: true } };

/*
  Globals are written before the guard below, and on every run.

  The guard exists to stop a second run duplicating collection documents. `parametros` is a
  global — one row, overwritten rather than appended — so it has nothing to duplicate, and
  leaving it after the guard means a change to the faixas never reaches a database that already
  has an empreendimento in it. That is the common case in development and it is how the seeded
  MCMV values would have been silently missed.

  This does overwrite whatever is in the admin, which is correct here and would not be in
  production: `pnpm seed` is a development script pointed at a local Postgres, and Adriana's
  edits live in a deployed database nobody seeds.
*/
/**
 * `incc`: [VERIFICAR: INCC real na FGV] — illustrative only, so the commercial block has both
 * figures to show in dev.
 *
 * `mcmv`: confirmed figures and flagged suggestions, in the same record.
 *
 * Confirmed against the source (Portaria MCID nº 333/2026, Ministério das Cidades): the four
 * income brackets, Faixa 3's R$ 400 mil and Faixa 4's R$ 600 mil nationwide ceilings, and
 * Classe Média's 10,00% a.a.
 *
 * Everything else is a **suggestion**, filled so the pré-qualificação has numbers to show
 * before Caixa confirms them, and flagged by `valores_sugeridos: true` so every page that
 * prints one of them says so (docs/tasks/TASK-pre-qualificacao.md §2.4). Each is an
 * interpolation inside a confirmed band, never an invention outside one:
 *
 *   teto_imovel, Faixas 1–2 — the confirmed range is R$ 210–275 mil *varying by locality*, and
 *     Rio capital and its metropolitan region sit in the most expensive tier of it, so the top
 *     of the range is the defensible guess. Commercially the load-bearing one: Cury's Rio
 *     product starts around R$ 210 mil, so this decides Faixa 2 versus Faixa 3 business.
 *   taxa_juros_anual — the confirmed band is 4,00–10,00% a.a. rising with income, anchored at
 *     4,25% (FGTS cotistas to R$ 2 mil, outside Norte/Nordeste — so Rio) and at 10,00%
 *     (Classe Média). Faixas 1–3 are interpolated between those two endpoints.
 *   subsidio_maximo — the discount concentrates in Faixas 1–2 and tapers to nothing by Faixa 3.
 *     The shape is the confirmed part; the magnitudes are the guess.
 *   percentual_financiado — product-definition.md §04's own claim, itself unreconfirmed.
 *
 * Adriana replaces these in the admin and unticks one box; no code changes and no redeploy.
 * Until then they may not reach a real buyer (docs/pending-verifications.md).
 */
await payload.updateGlobal({
  slug: "parametros",
  ...semRevalidacao,
  data: {
    incc: {
      taxa_anual: 8.12,
      data_revisao: "2026-08-01",
      fonte: "INCC-DI/FGV, acumulado em 12 meses — valor ilustrativo de desenvolvimento",
    },
    mcmv: {
      faixas: [
        {
          nome: "Faixa 1",
          renda_min: 0,
          renda_max: 3200,
          teto_imovel: 275000,
          taxa_juros_anual: 4.25,
          subsidio_maximo: 55000,
          percentual_financiado: 80,
        },
        {
          nome: "Faixa 2",
          renda_min: 3200.01,
          renda_max: 5000,
          teto_imovel: 275000,
          taxa_juros_anual: 6,
          subsidio_maximo: 25000,
          percentual_financiado: 80,
        },
        {
          nome: "Faixa 3",
          renda_min: 5000.01,
          renda_max: 9600,
          teto_imovel: 400000,
          taxa_juros_anual: 8.16,
          subsidio_maximo: 0,
          percentual_financiado: 80,
        },
        {
          nome: "Faixa 4 — Classe Média",
          renda_min: 9600.01,
          renda_max: 13000,
          teto_imovel: 600000,
          taxa_juros_anual: 10,
          subsidio_maximo: 0,
          percentual_financiado: 70,
        },
      ],
      valores_sugeridos: true,
      data_revisao: "2026-08-13",
      fonte: "Ministério das Cidades — programa Minha Casa, Minha Vida",
      portaria: "Portaria MCID nº 333, de 30 de março de 2026 (DOU 01/04/2026)",
    },
  },
});

const { totalDocs } = await payload.count({ collection: "empreendimentos" });
if (totalDocs > 0) {
  console.log(`Já existem ${totalDocs} empreendimento(s). Nada a semear.`);
  await payload.destroy();
  process.exit(0);
}

async function arquivo(nome: string) {
  const data = await readFile(join(process.cwd(), "public", nome));
  return {
    data,
    mimetype: nome.endsWith(".svg") ? "image/svg+xml" : "image/jpeg",
    name: nome,
    size: data.byteLength,
  };
}

const render = await payload.create({
  collection: "media",
  data: { alt: "Fachada ilustrativa — dado de desenvolvimento, não é o render real da Cury" },
  file: await arquivo("adriana-placeholder.jpg"),
});

const planta = await payload.create({
  collection: "media",
  data: { alt: "Planta de exemplo: dois dormitórios, sala, cozinha, banheiro e varanda, 42 m²" },
  file: await arquivo("planta-exemplo.svg"),
});

const cury = await payload.create({
  collection: "incorporadoras",
  data: {
    nome: "Cury Construtora",
    autorizacao_publicidade: {
      concedida_em: "2026-01-15",
      exige_pre_aprovacao: false,
    },
  },
});

/**
 * `disableRevalidate` skips the catalogue's `revalidatePath()` hooks (src/payload/revalidate.ts)
 * — they need an active Next.js request, which a standalone script never has.
 */

const empreendimento = await payload.create({
  collection: "empreendimentos",
  draft: false,
  ...semRevalidacao,
  data: {
    nome: "Residencial Pixinguinha",
    slug: "residencial-pixinguinha",
    incorporadora: cury.id,
    status_obra: "em_obras",
    /** Real: Cury advertises 10/2028 (apto.vc, confirmed 2026-08-12). */
    entrega_prevista: "2028-10-01",
    endereco: {
      logradouro: "Rua General Luís Mendes de Morais",
      bairro: "Santo Cristo",
      cidade: "Rio de Janeiro",
      uf: "RJ",
      cep: "20220-260",
    },
    /** Real: VLT Praia Formosa is ~2 min on foot from this address (Moovit, confirmed 2026-08-12). */
    transporte_proximo: [{ modo: "vlt", nome: "Praia Formosa", minutos_a_pe: 2 }],
    /** Real: the amenity list Cury advertises for this development. */
    lazer: [
      { item: "Rooftop" },
      { item: "Piscina" },
      { item: "Espaço churrasqueira" },
      { item: "Sauna" },
      { item: "Sala de spinning" },
      { item: "Solarium" },
      { item: "Espaço beleza" },
      { item: "Brinquedoteca" },
    ],
    midia: [render.id],
    /**
     * Not published by Cury's marketing site. [VERIFICAR: registro de incorporação real,
     * junto ao cartório de imóveis competente] before this reaches a real visitor.
     */
    registro_legal: {
      registro_incorporacao: "[SEED] a confirmar junto à Cury",
      cartorio: "[SEED] a confirmar junto à Cury",
    },
    _status: "published",
  },
});

const tipologiaMenor = await payload.create({
  collection: "tipologias",
  ...semRevalidacao,
  data: {
    /** Real dimensions, from Cury's own site for this development. */
    nome: "Studio",
    empreendimento: empreendimento.id,
    dormitorios: 1,
    vagas: 1,
    area_privativa: 32.44,
    planta: [planta.id],
    /** Real: R$ 349.649,15 is the starting price Cury advertises for the 33 m² studio. */
    faixa_de_preco: { minimo: 349649 },
    faixa_mcmv_elegivel: ["2", "3"],
  },
});

await payload.create({
  collection: "tipologias",
  ...semRevalidacao,
  data: {
    /** Real dimensions; price band not disclosed by Cury for this unit. */
    nome: "3 quartos com suíte",
    empreendimento: empreendimento.id,
    dormitorios: 3,
    vagas: 1,
    area_privativa: 70.19,
    planta: [planta.id],
    faixa_mcmv_elegivel: ["3"],
  },
});

const emSessentaDias = new Date();
emSessentaDias.setDate(emSessentaDias.getDate() + 60);

/**
 * Cury does not publish a payment schedule on its marketing pages, so this table is invented —
 * roughly consistent with the real R$ 349.649,15 starting price above, nothing more.
 */
await payload.create({
  collection: "condicoes-comerciais",
  ...semRevalidacao,
  data: {
    referencia: "[SEED] Tabela de desenvolvimento",
    tipologia: tipologiaMenor.id,
    validade_da_tabela: emSessentaDias.toISOString(),
    entrada_percentual: 7,
    parcelas_obra: { quantidade: 36, valor: 1900 },
    baloes: [{ mes: 12, valor: 8000 }],
    valor_nas_chaves: 248000,
    indice_reajuste: "incc",
  },
});

console.log("Semeado: 1 incorporadora, 1 empreendimento, 2 tipologias, 1 condição comercial.");
await payload.destroy();
process.exit(0);
