import { Signature } from "@/components/signature";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Placeholder. The real home is a separate task — this route exists to prove that the tokens
 * resolve in all three theme states and that the signature renders in every variant.
 */

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

export default function Home() {
  return (
    <>
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Signature variant="header" />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-12 px-6 py-14">
        <section className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
            Estrutura montada
          </p>
          <h1 className="font-display text-3xl tracking-tight text-balance">
            O aplicativo está de pé, sem nenhuma tela ainda.
          </h1>
          <p className="max-w-prose text-ink-muted">
            Esta página existe para conferir uma coisa só: que as cores, os tipos e a
            assinatura respondem certo nos três estados de tema. As telas de verdade vêm
            depois, cada uma no seu documento de tarefa.
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
                  Campo de exemplo. A pré-qualificação de verdade é a próxima tarefa.
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
