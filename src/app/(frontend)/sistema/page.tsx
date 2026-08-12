import type { Metadata } from "next";

import { Signature } from "@/components/signature";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

const TYPE = [
  { size: "text-4xl", label: "40px", family: "font-display", note: "Título de abertura" },
  { size: "text-3xl", label: "32px", family: "font-display", note: "Título de página" },
  { size: "text-xl", label: "22px", family: "font-display", note: "Título de seção" },
  { size: "text-base", label: "17px", family: "font-sans", note: "Corpo" },
  { size: "text-sm", label: "15px", family: "font-sans", note: "Piso do que o comprador lê" },
  { size: "text-xs", label: "13px", family: "font-mono", note: "Dado técnico e legal" },
];

export default function Sistema() {
  return (
    <>
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Signature variant="header" />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-14 px-6 py-14">
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
                <Button variant="outline">Falar no WhatsApp</Button>
                <Button variant="ghost">Como funciona</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl tracking-tight">Assinatura</h2>
          <p className="max-w-prose text-ink-muted">
            Três variantes, com as proporções calculadas pelo componente. Qualquer captura de
            qualquer tela precisa conter a assinatura completa.
          </p>
          <div className="space-y-8 rounded-lg border border-rule bg-sheet p-6">
            <Signature variant="header" />
            <Signature variant="footer" />
            <Signature variant="full" />
          </div>
        </section>
      </main>

      <footer className="border-t border-rule">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <Signature variant="footer" />
        </div>
      </footer>
    </>
  );
}
