"use client";

import { useId } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * A money field for a phone keypad.
 *
 * Whole reais, digits only. `mcmv.ts` notes that the cent between two faixas "belongs to
 * nobody and cannot be typed anyway" — Faixa 1 ends at R$ 3.200 and Faixa 2 opens at
 * R$ 3.200,01 — so a centavos field would add a decimal separator to every phone keypad in the
 * audience to capture a value the brackets cannot use. Income here is approximate by
 * instruction: "pode ser aproximado".
 *
 * Separators are inserted as the person types, so R$ 5.000 never gets entered as R$ 50.000 by
 * one extra keystroke — the single most expensive typo available on this screen.
 */
const MILHAR = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

export function CampoRenda({
  label,
  value,
  onChange,
  ajuda,
  className,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  ajuda?: string;
  className?: string;
}) {
  const id = useId();

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2 rounded-lg border border-rule bg-sheet px-3 focus-within:ring-2 focus-within:ring-ring">
        <span aria-hidden className="font-mono text-sm text-ink-muted">
          R$
        </span>
        <Input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          value={value === null ? "" : MILHAR.format(value)}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "");
            onChange(digits === "" ? null : Number(digits));
          }}
          placeholder="0"
          className="h-12 border-0 bg-transparent px-0 text-lg tabular-nums shadow-none focus-visible:ring-0"
        />
      </div>
      {ajuda ? <p className="max-w-prose text-sm text-ink-muted">{ajuda}</p> : null}
    </div>
  );
}
