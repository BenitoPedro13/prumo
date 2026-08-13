"use client";

import { useId } from "react";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

/**
 * The flow's choice control. Radios rather than two buttons that advance on click: an answer
 * that submits itself the instant it is touched cannot be reconsidered, and four of these six
 * questions are ones people want a second to sit with.
 *
 * Each option can carry a `nota` — the consequence of choosing it, in the buyer's terms. On
 * "tenho três anos ou mais de carteira" that note is worth more than the question, because it
 * is where the FGTS entrada comes from and almost nobody knows it.
 */
export type OpcaoEscolha<T extends string> = {
  value: T;
  label: string;
  nota?: string;
};

export function Escolha<T extends string>({
  opcoes,
  value,
  onChange,
  className,
}: {
  opcoes: OpcaoEscolha<T>[];
  value: T | null;
  onChange: (value: T) => void;
  className?: string;
}) {
  const groupId = useId();

  return (
    <RadioGroup
      value={value ?? undefined}
      onValueChange={(next) => onChange(next as T)}
      className={cn("gap-3", className)}
    >
      {opcoes.map((opcao) => {
        const id = `${groupId}-${opcao.value}`;

        return (
          <div
            key={opcao.value}
            className={cn(
              "flex items-start gap-3 rounded-lg border border-rule bg-sheet p-4 transition-colors",
              "has-[:checked]:border-verde has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
            )}
          >
            <RadioGroupItem id={id} value={opcao.value} className="mt-1" />
            <Label htmlFor={id} className="flex-1 cursor-pointer flex-col items-start gap-1">
              <span className="text-base font-normal text-ink">{opcao.label}</span>
              {opcao.nota ? (
                <span className="text-sm font-normal text-ink-muted">{opcao.nota}</span>
              ) : null}
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
}

/** The yes/no case, which is four of the six questions. Kept here so the wording is in one
 * place and cannot drift between steps. */
export function EscolhaSimNao({
  value,
  onChange,
  sim = "Sim",
  nao = "Não",
  notaSim,
  notaNao,
}: {
  value: boolean | null;
  onChange: (value: boolean) => void;
  sim?: string;
  nao?: string;
  notaSim?: string;
  notaNao?: string;
}) {
  return (
    <Escolha
      opcoes={[
        { value: "sim", label: sim, nota: notaSim },
        { value: "nao", label: nao, nota: notaNao },
      ]}
      value={value === null ? null : value ? "sim" : "nao"}
      onChange={(next) => onChange(next === "sim")}
    />
  );
}
