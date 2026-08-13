import { Signature } from "@/components/signature";
import { cn } from "@/lib/utils";

export function Carta({
  saudacao,
  titulo,
  principal,
  contexto,
  className,
}: {
  saudacao: string;
  titulo: string;
  principal: string;
  contexto?: string | null;
  className?: string;
}) {
  return (
    <section className={cn("space-y-6", className)}>
      <p className="font-mono text-xs tracking-widest text-latao uppercase">Para {saudacao}</p>
      <h1 className="max-w-[17ch] text-balance font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
        {titulo}
      </h1>
      <div className="max-w-prose space-y-4">
        <p className="text-lg leading-relaxed text-ink">{principal}</p>
        {contexto ? (
          <p className="text-base leading-relaxed text-ink-muted">{contexto}</p>
        ) : null}
      </div>

      <Signature variant="footer" photo className="pt-2" />
    </section>
  );
}
