"use client";

import Link from "next/link";
import { useActionState } from "react";

import { enviarContato } from "@/app/(frontend)/contato/actions";
import { CONTATO_INITIAL_STATE } from "@/app/(frontend)/contato/state";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WhatsAppAction } from "@/components/whatsapp-action";
import { CONSENT_PURPOSE_TEXT } from "@/lib/lgpd";
import { cn } from "@/lib/utils";

/**
 * The path for someone who'd rather leave contact details than open a conversation right away
 * — a meaningful share of visitors arrive from Instagram or a referral, mid-scroll, not
 * mid-conversation (`docs/product-definition.md` §08).
 *
 * The consent checkbox is never pre-checked, its purpose text and the stored proof come from
 * the same `src/lib/lgpd.ts` constant, and the honeypot field is invisible to a sighted user
 * and skipped by a screen reader, never merely `display:none` (`docs/tasks/TASK-contato-lgpd.md`
 * §2.6).
 */
export function ContatoForm({ className }: { className?: string }) {
  const [state, formAction, pending] = useActionState(
    enviarContato,
    CONTATO_INITIAL_STATE,
  );

  if (state.status === "success") {
    return (
      <div
        className={cn("rounded-lg border border-rule bg-sheet p-6", className)}
      >
        <h2 className="font-display text-lg tracking-tight text-ink">
          Recebemos sua mensagem
        </h2>
        <p className="mt-2 max-w-prose text-sm text-ink-muted">
          A Adriana confere as mensagens e retorna. Se preferir não esperar, dá para
          continuar agora mesmo pelo WhatsApp.
        </p>
        <WhatsAppAction
          context={{ origem: "depois de enviar o formulário em /contato" }}
          label="Prefere continuar agora?"
          className="mt-4"
        />
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className={cn(
        "relative space-y-5 rounded-lg border border-rule bg-sheet p-6",
        className,
      )}
      noValidate
    >
      <div
        aria-hidden="true"
        className="absolute size-px overflow-hidden opacity-0"
      >
        <Label htmlFor="website">Deixe em branco</Label>
        <Input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nome">Nome</Label>
        <Input
          id="nome"
          name="nome"
          autoComplete="name"
          aria-invalid={Boolean(state.errors.nome)}
          aria-describedby={state.errors.nome ? "nome-erro" : undefined}
        />
        {state.errors.nome ? (
          <p id="nome-erro" className="text-sm text-destructive">
            {state.errors.nome}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          name="telefone"
          type="tel"
          autoComplete="tel"
          placeholder="(21) 90000-0000"
          aria-invalid={Boolean(state.errors.telefone)}
          aria-describedby={state.errors.telefone ? "telefone-erro" : undefined}
        />
        {state.errors.telefone ? (
          <p id="telefone-erro" className="text-sm text-destructive">
            {state.errors.telefone}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="mensagem">Mensagem (opcional)</Label>
        <Textarea id="mensagem" name="mensagem" rows={4} />
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <Checkbox
            id="consentimento"
            name="consentimento"
            aria-invalid={Boolean(state.errors.consentimento)}
            aria-describedby={
              state.errors.consentimento ? "consentimento-erro" : undefined
            }
            className="mt-0.5"
          />
          <Label htmlFor="consentimento" className="text-sm font-normal text-ink-muted">
            {CONSENT_PURPOSE_TEXT}{" "}
            <Link
              href="/privacidade"
              className="text-ink underline underline-offset-4 hover:no-underline"
            >
              Ver a política de privacidade.
            </Link>
          </Label>
        </div>
        {state.errors.consentimento ? (
          <p id="consentimento-erro" className="text-sm text-destructive">
            {state.errors.consentimento}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={pending} className="h-11 px-4 text-base font-normal">
        {pending ? "Enviando…" : "Enviar"}
      </Button>
    </form>
  );
}
