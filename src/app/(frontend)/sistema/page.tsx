import type { Metadata } from "next";

import { CondicoesComerciais } from "@/components/condicoes-comerciais";
import { ContatoForm } from "@/components/contato-form";
import { Disponibilidade } from "@/components/disponibilidade";
import { EmpreendimentoCard } from "@/components/empreendimento-card";
import { PlumbRail, type PlumbState } from "@/components/plumb-rail";
import { RegistroLegal } from "@/components/registro-legal";
import { Signature } from "@/components/signature";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { TipologiaCard } from "@/components/tipologia-card";
import { ValoresIlustrativos } from "@/components/valores-ilustrativos";
import { WhatsAppAction } from "@/components/whatsapp-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CondicaoComercialResumo, EmpreendimentoResumo, TipologiaResumo } from "@/lib/catalogo";
import { formatBRL, formatDate, formatPercent } from "@/lib/format";
import type { ProjecaoIndice } from "@/lib/incc";
import type { FaixaMcmv } from "@/lib/mcmv";
import { payload } from "@/lib/payload";

import { PlumbRailDemo } from "./plumb-rail-demo";
import { PreQualificacaoDemo } from "./prequalificacao-demo";

/**
 * The design system, rendered with the real components and the real tokens.
 *
 * Hidden rather than protected: unlinked and noindex. It holds placeholder copy and public
 * brand decisions, nothing confidential. See docs/tasks/TASK-sistema-design.md.
 *
 * A shared component without a panel here is an unfinished task (CLAUDE.md §3.1).
 */

export const metadata: Metadata = {
  title: "Sistema",
  robots: { index: false, follow: false },
};

const PALETTE = [
  { token: "--verde", role: "Ação, link, marca", className: "bg-verde" },
  { token: "--verde-deep", role: "Chão do prumo", className: "bg-verde-deep" },
  { token: "--latao", role: "Números, marcadores", className: "bg-latao" },
  { token: "--paper", role: "Fundo da página", className: "bg-paper" },
  { token: "--sheet", role: "Cartões, campos", className: "bg-sheet" },
  { token: "--ink", role: "Texto", className: "bg-ink" },
  { token: "--ink-muted", role: "Texto secundário", className: "bg-ink-muted" },
  { token: "--rule", role: "Fios, bordas", className: "bg-rule" },
];

const STATES = [
  { token: "--state-ok", role: "No prumo", className: "bg-state-ok" },
  { token: "--state-wait", role: "Ainda fora do prumo", className: "bg-state-wait" },
  { token: "--state-error", role: "Erro de sistema, nunca um resultado", className: "bg-state-error" },
];

/**
 * Three readings of the apparatus, side by side. The middle and the right are the two honest
 * exits of the pré-qualificação: aligned, and not aligned yet.
 */
const PLUMB: { state: PlumbState; current: number; caption: string }[] = [
  { state: "hanging", current: 2, caption: "Descendo" },
  { state: "aligned", current: 7, caption: "No prumo" },
  { state: "crooked", current: 7, caption: "Ainda fora do prumo" },
];

const TYPE = [
  { size: "text-4xl", label: "40px", family: "font-display", note: "Título de abertura" },
  { size: "text-3xl", label: "32px", family: "font-display", note: "Título de página" },
  { size: "text-xl", label: "22px", family: "font-display", note: "Título de seção" },
  { size: "text-base", label: "17px", family: "font-sans", note: "Corpo" },
  { size: "text-sm", label: "15px", family: "font-sans", note: "Piso do que o comprador lê" },
  { size: "text-xs", label: "13px", family: "font-mono", note: "Dado técnico e legal" },
];


/**
 * Fixtures. Real Cury RJ names with invented numbers — the same rule the prototypes carry
 * (docs/design-handoff.md §08): useful for showing Adriana, who recognises the developments,
 * never to be sent to a buyer.
 *
 * The date is fixed rather than `new Date()` so this page renders the same way every build and
 * the expired-table panel stays expired.
 */
const HOJE = new Date("2026-08-12T12:00:00Z");

const EMPREENDIMENTO: EmpreendimentoResumo = {
  nome: "Cury Pixinguinha",
  slug: "cury-pixinguinha",
  bairro: "Santo Cristo",
  cidade: "Rio de Janeiro",
  status: "em_obras",
  entregaPrevista: "2029-03-01",
  transporte: [{ modo: "vlt", nome: "Estação Santo Cristo", minutosAPe: 6 }],
  faixa: { minimo: 249000, maximo: 289000 },
  atualizadoEm: "2026-08-12T14:30:00Z",
};

const TIPOLOGIA: TipologiaResumo = {
  nome: "2 quartos com varanda",
  dormitorios: 2,
  vagas: 1,
  areaPrivativa: 42,
  faixa: { minimo: 268000, maximo: 289000 },
  faixasMcmv: ["2", "3"],
  planta: {
    url: "/planta-exemplo.svg",
    alt: "Planta de exemplo: dois dormitórios, sala, cozinha, banheiro e varanda, 42 m²",
    width: 600,
    height: 420,
  },
};

const CONDICAO: CondicaoComercialResumo = {
  referencia: "Tabela 12 — agosto",
  validadeDaTabela: "2026-08-31",
  entradaPercentual: 7,
  parcelasObra: { quantidade: 36, valor: 1480 },
  baloes: [{ mes: 12, valor: 5000 }],
  valorNasChaves: 210000,
  indiceReajuste: "incc",
};

const CONDICAO_VENCIDA: CondicaoComercialResumo = {
  ...CONDICAO,
  referencia: "Tabela 9 — maio",
  validadeDaTabela: "2026-05-31",
};

/** Illustrative, and marked as such wherever it renders. [VERIFICAR: INCC real na FGV] */
const PROJECAO: ProjecaoIndice = {
  taxaAnual: 0.0812,
  dataRevisao: "2026-08-01",
  fonte: "INCC-DI/FGV, acumulado em 12 meses",
};

/**
 * Reads the real global rather than a fixture, unlike every other panel here.
 *
 * That is the point: a faixa whose ceiling or rate nobody has confirmed yet has to be visible
 * as unconfirmed on a page somebody looks at. A fixture would always look complete, which is
 * exactly the decay `/sistema` exists to prevent (CLAUDE.md §4).
 */
async function faixasConfiguradas() {
  const client = await payload();
  const parametros = await client.findGlobal({ slug: "parametros" });
  const mcmv = parametros.mcmv;

  return {
    faixas: (mcmv?.faixas ?? []).map(
      (faixa): FaixaMcmv => ({
        nome: faixa.nome,
        rendaMin: faixa.renda_min,
        rendaMax: faixa.renda_max,
        tetoImovel: faixa.teto_imovel,
        taxaJurosAnual: faixa.taxa_juros_anual,
        subsidioMaximo: faixa.subsidio_maximo,
        percentualFinanciado: faixa.percentual_financiado,
      }),
    ),
    dataRevisao: mcmv?.data_revisao,
    fonte: mcmv?.fonte,
    portaria: mcmv?.portaria,
    valoresSugeridos: Boolean(mcmv?.valores_sugeridos),
  };
}

/**
 * Income brackets, unlike prices, need their centavo.
 *
 * `formatBRL` is whole-reais on purpose, but Faixa 2 starts at R$ 3.200,01 where Faixa 1 ends at
 * R$ 3.200 — rounded, the two rows print the same boundary twice and the table reads as though
 * the brackets overlap. Local to this panel: prices elsewhere should stay whole.
 */
function formatRenda(value: number): string {
  const casas = Number.isInteger(value) ? 0 : 2;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(value);
}

/** Not a dash — a dash reads like a value. An unconfirmed number says so in words. */
function NaoConfirmado() {
  return <span className="font-mono text-xs text-latao">não confirmado</span>;
}

export default async function Sistema() {
  const mcmv = await faixasConfiguradas();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-14 px-6 py-14">
      <section className="space-y-4">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
          Página interna
        </p>
        <h1 className="font-display text-3xl tracking-tight text-balance">
          O sistema, desenhado com as próprias peças.
        </h1>
        <p className="max-w-prose text-ink-muted">
          Cor, tipo e componentes como eles saem na tela, não como estão descritos no
          documento. Serve para conferir que uma peça nova herdou o sistema em vez de
          reinventá-lo, e para decidir junto com a Adriana o que ainda não está resolvido.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl tracking-tight">Paleta</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PALETTE.map(({ token, role, className }) => (
            <li key={token} className="space-y-2">
              <span
                aria-hidden
                className={`block h-14 rounded-lg border border-rule ${className}`}
              />
              <span className="block font-mono text-xs text-ink">{token}</span>
              <span className="block text-xs text-ink-muted">{role}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl tracking-tight">Estados</h2>
        <p className="max-w-prose text-ink-muted">
          A pré-qualificação precisa de &ldquo;pode seguir&rdquo; e de &ldquo;ainda não&rdquo;,
          e nenhum dos dois pode ser vermelho. Vermelho fica reservado para erro de sistema.
        </p>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {STATES.map(({ token, role, className }) => (
            <li key={token} className="space-y-2">
              <span
                aria-hidden
                className={`block h-14 rounded-lg border border-rule ${className}`}
              />
              <span className="block font-mono text-xs text-ink">{token}</span>
              <span className="block text-xs text-ink-muted">{role}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl tracking-tight">O prumo</h2>
        <p className="max-w-prose text-ink-muted">
          A peça que dá nome ao projeto, e o único lugar onde o desenho levanta a voz. Não é um
          símbolo aplicado na página: é o mecanismo dela. Na pré-qualificação marca onde a pessoa
          está; no fim, marca o resultado. Na proposta, a mesma linha vira a linha do tempo do
          pagamento.
        </p>
        <div className="flex flex-wrap items-start gap-6">
          {PLUMB.map(({ state, current, caption }) => (
            <figure key={caption} className="space-y-2">
              <PlumbRail
                notches={8}
                current={current}
                state={state}
                label={caption}
                className="h-[26rem]"
              />
              <figcaption className="font-mono text-xs text-ink-muted">{caption}</figcaption>
            </figure>
          ))}
        </div>
        <p className="max-w-prose text-ink-muted">
          O componente recebe um estado, nunca uma frase. &ldquo;No prumo&rdquo; e &ldquo;Ainda
          fora do prumo&rdquo; são palavras da tela de pré-qualificação — e são a parte que uma
          troca de nome obriga a reescrever.
        </p>
        <PlumbRailDemo />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl tracking-tight">Tipografia</h2>
        <p className="max-w-prose text-ink-muted">
          Sem fonte baixada. O corpo é maior que o padrão de propósito: muita gente lê isto num
          Android intermediário, no sol, às vezes com a tela trincada.
        </p>
        <ul className="divide-y divide-rule border-y border-rule">
          {TYPE.map(({ size, label, family, note }) => (
            <li
              key={size}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4"
            >
              <span className={`${size} ${family} tracking-tight`}>Estar no prumo</span>
              <span className="font-mono text-xs text-ink-muted">
                {label} · {size} · {note}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl tracking-tight">Componentes</h2>
        <Card>
          <CardHeader>
            <CardTitle className="font-display font-normal tracking-tight">
              Primitivos retematizados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="renda">Renda familiar bruta</Label>
              <Input id="renda" inputMode="numeric" placeholder="R$ 4.200" />
              <p className="text-sm text-ink-muted">
                Campo de exemplo. A pré-qualificação de verdade é da fase 1.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button>Ver empreendimentos</Button>
              <Button variant="outline">Baixar a planta</Button>
              <Button variant="ghost">Como funciona</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl tracking-tight">Catálogo</h2>
        <p className="max-w-prose text-ink-muted">
          As peças da ficha do empreendimento. Nomes reais da Cury com números inventados, como
          nos protótipos: serve para conferir o desenho, nunca para mandar para um comprador.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <EmpreendimentoCard empreendimento={EMPREENDIMENTO} />
          <TipologiaCard tipologia={TIPOLOGIA} />
        </div>

        <RegistroLegal
          registroIncorporacao="R-4 · matrícula 00.000"
          cartorio="2º Ofício de Registro de Imóveis do Rio de Janeiro"
          incorporadora="Cury Construtora"
        />

        <Disponibilidade atualizadoEm={EMPREENDIMENTO.atualizadoEm} />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl tracking-tight">Condições comerciais</h2>
        <p className="max-w-prose text-ink-muted">
          Três estados, e os dois últimos são os que importam: as parcelas nunca aparecem
          sozinhas, e uma tabela vencida não vira número. Os dois valores juntos são a razão de
          o produto existir.
        </p>

        <CondicoesComerciais
          condicao={CONDICAO}
          projecao={PROJECAO}
          entregaPrevista={EMPREENDIMENTO.entregaPrevista}
          hoje={HOJE}
        />

        <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
          Sem índice configurado
        </p>
        <CondicoesComerciais
          condicao={CONDICAO}
          entregaPrevista={EMPREENDIMENTO.entregaPrevista}
          hoje={HOJE}
        />

        <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
          Tabela vencida
        </p>
        <CondicoesComerciais
          condicao={CONDICAO_VENCIDA}
          projecao={PROJECAO}
          entregaPrevista={EMPREENDIMENTO.entregaPrevista}
          hoje={HOJE}
        />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl tracking-tight">Faixas do MCMV</h2>
        <p className="max-w-prose text-ink-muted">
          Lido do admin, não de um exemplo. Os limites de renda, os dois tetos nacionais e a taxa
          da Classe Média estão confirmados na portaria. O resto é sugestão: preenchido para a
          pré-qualificação ter o que mostrar, e marcado como tal na própria linha. A Adriana
          corrige quatro campos e desmarca uma caixa; nenhum código muda.
        </p>

        {mcmv.faixas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-rule text-left">
                  <th className="py-2 pr-4 font-normal text-ink-muted">Faixa</th>
                  <th className="py-2 pr-4 font-normal text-ink-muted">Renda bruta familiar</th>
                  <th className="py-2 pr-4 font-normal text-ink-muted">Teto do imóvel</th>
                  <th className="py-2 pr-4 font-normal text-ink-muted">Juros</th>
                  <th className="py-2 font-normal text-ink-muted">Subsídio</th>
                </tr>
              </thead>
              <tbody>
                {mcmv.faixas.map((faixa) => (
                  <tr key={faixa.nome} className="border-b border-rule align-top">
                    <td className="py-3 pr-4 text-ink">{faixa.nome}</td>
                    <td className="py-3 pr-4 text-ink-muted">
                      {formatRenda(faixa.rendaMin)} – {formatRenda(faixa.rendaMax)}
                    </td>
                    <td className="py-3 pr-4 text-ink-muted">
                      {typeof faixa.tetoImovel === "number" ? (
                        formatBRL(faixa.tetoImovel)
                      ) : (
                        <NaoConfirmado />
                      )}
                    </td>
                    <td className="py-3 pr-4 text-ink-muted">
                      {typeof faixa.taxaJurosAnual === "number" ? (
                        `${formatPercent(faixa.taxaJurosAnual / 100)} a.a.`
                      ) : (
                        <NaoConfirmado />
                      )}
                    </td>
                    <td className="py-3 text-ink-muted">
                      {typeof faixa.subsidioMaximo === "number" ? (
                        formatBRL(faixa.subsidioMaximo)
                      ) : (
                        <NaoConfirmado />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="max-w-prose text-sm text-ink-muted">
            Nenhuma faixa configurada. Enquanto estiver assim, a pré-qualificação não enquadra
            ninguém — ela responde que não há parâmetros, e não um valor qualquer.
          </p>
        )}

        {mcmv.valoresSugeridos ? (
          <ValoresIlustrativos fonte={mcmv.fonte} dataRevisao={mcmv.dataRevisao} />
        ) : null}

        <dl className="space-y-1 text-xs text-ink-muted">
          <div className="flex gap-2">
            <dt>Revisado em:</dt>
            <dd className="font-mono">
              {mcmv.dataRevisao ? formatDate(mcmv.dataRevisao) : "—"}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt>Fonte:</dt>
            <dd>{mcmv.fonte ?? "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt>Portaria:</dt>
            <dd>{mcmv.portaria ?? "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl tracking-tight">Pré-qualificação</h2>
        <p className="max-w-prose text-ink-muted">
          Um passo do fluxo, os dois controles de resposta, e as cinco saídas lado a lado. A
          segunda — hoje_ainda_nao — é a que justifica a tela: dizer a alguém com restrição o que
          mudar primeiro, em vez de recusar sem explicar. A última mostra o gate: sem faixas no
          admin, a tela se recusa a estimar.
        </p>
        <p className="max-w-prose text-ink-muted">
          Os campos de dinheiro abrem com valores de um toque, tirados das próprias faixas: digitar
          num teclado de celular é a interação mais cara do fluxo e a que mais perde gente. O campo
          continua editável para quem sabe o próprio número.
        </p>
        <PreQualificacaoDemo />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl tracking-tight">Assinatura</h2>
        <p className="max-w-prose text-ink-muted">
          Três variantes, com as proporções calculadas em src/lib/signature.ts. Qualquer captura de
          qualquer tela precisa conter a assinatura completa.
        </p>
        <div className="space-y-8 rounded-lg border border-rule bg-sheet p-6">
          <Signature variant="header" />
          <Signature variant="footer" />
          <Signature variant="full" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl tracking-tight">Ação de WhatsApp</h2>
        <p className="max-w-prose text-ink-muted">
          A única ação do site. Cada tela passa de onde a pessoa está escrevendo, e isso entra
          no texto que ela envia — a Adriana abre a conversa já sabendo. Maior que o padrão do
          shadcn de propósito: 44px é o piso de alvo de toque.
        </p>
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-rule bg-sheet p-6">
          <WhatsAppAction context={{ origem: "na página do sistema" }} />
          <WhatsAppAction
            context={{
              origem: "na página do sistema",
              empreendimento: "Cury Pixinguinha",
              tipologia: "2 quartos, 42 m²",
            }}
            variant="outline"
            label="Falar sobre um empreendimento"
          />
        </div>
        <p className="max-w-prose text-xs text-ink-muted">
          O número em src/lib/site-config.ts ainda é placeholder, então os links abrem uma
          conversa que não existe.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl tracking-tight">Formulário de contato</h2>
        <p className="max-w-prose text-ink-muted">
          O componente real de <code className="font-mono text-sm">/contato</code>, não uma
          maquete — enviar aqui cria um <code className="font-mono text-sm">Lead</code> e um{" "}
          <code className="font-mono text-sm">Consentimento</code> de verdade no banco, do mesmo
          jeito que enviar no site faria.
        </p>
        <ContatoForm className="max-w-md" />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl tracking-tight">Cabeçalho e rodapé</h2>
        <p className="max-w-prose text-ink-muted">
          Os mesmos componentes que o layout renderiza em toda página — é por isso que nenhuma
          tela precisa lembrar da assinatura. Aqui aparecem dentro de uma moldura; no site eles
          ocupam a largura inteira.
        </p>
        <div className="overflow-hidden rounded-lg border border-rule">
          <SiteNav />
        </div>
        <div className="overflow-hidden rounded-lg border border-rule">
          <SiteFooter />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl tracking-tight">Tema</h2>
        <p className="max-w-prose text-ink-muted">
          Instrumento desta página, não recurso do site. Os três estados — claro, escuro e o
          padrão do sistema — são um contrato de tokens, e este botão é como ele se confere.
        </p>
        <div className="rounded-lg border border-rule bg-sheet p-6">
          <ThemeToggle />
        </div>
      </section>
    </div>
  );
}
