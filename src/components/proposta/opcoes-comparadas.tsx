import type { OpcaoProposta } from "@/lib/catalogo";
import { cn } from "@/lib/utils";

import { OpcaoCard } from "./opcao-card";

export function OpcoesComparadas({
  opcoes,
  hoje,
  className,
}: {
  opcoes: OpcaoProposta[];
  hoje: Date;
  className?: string;
}) {
  return (
    <section className={cn("space-y-5 border-t border-rule pt-10", className)}>
      <div>
        <p className="font-mono text-xs tracking-widest text-ink-faint uppercase">
          {opcoes.length > 1 ? "As opções" : "A opção"}
        </p>
        <h2 className="mt-2 font-display text-2xl tracking-tight text-ink">
          O que vocês ganham e o que abrem mão
        </h2>
      </div>

      <div className={cn("grid gap-5", opcoes.length > 1 && "sm:grid-cols-2")}>
        {opcoes.map((opcao, index) => (
          <OpcaoCard key={index} opcao={opcao} hoje={hoje} />
        ))}
      </div>
    </section>
  );
}
