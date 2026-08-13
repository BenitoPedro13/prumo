"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * One step's shell: the question, the sentence that explains why it is being asked, the
 * control, and the way back.
 *
 * Every step explains itself. The prototype does this on all six and it is not decoration —
 * a stranger is being asked whether their name is clean, and the difference between a form
 * and an interrogation is whether the form says what it wants the answer for
 * (design-handoff.md §05, "name the discomfort").
 */
export function Passo({
  pergunta,
  ajuda,
  children,
  onVoltar,
  className,
}: {
  pergunta: string;
  ajuda?: string;
  children: ReactNode;
  onVoltar?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-2">
        <h2 className="max-w-prose font-display text-2xl tracking-tight text-balance">
          {pergunta}
        </h2>
        {ajuda ? <p className="max-w-prose text-sm text-ink-muted">{ajuda}</p> : null}
      </div>

      {children}

      {onVoltar ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onVoltar}
          className="h-9 px-2 text-sm font-normal text-ink-muted"
        >
          Voltar
        </Button>
      ) : null}
    </div>
  );
}
