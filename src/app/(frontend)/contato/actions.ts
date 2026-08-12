"use server";

import { headers } from "next/headers";

import { CONSENT_PURPOSE_TEXT, CONSENT_VERSION } from "@/lib/lgpd";
import { payload } from "@/lib/payload";

import type { ContatoFieldErrors, ContatoState } from "./state";

/**
 * Server-side validation is authoritative — nothing from the client is trusted beyond what
 * gets re-checked here (`docs/tasks/TASK-contato-lgpd.md` §2.3).
 *
 * A filled honeypot silently no-ops rather than returning an error: telling a bot it was
 * caught only teaches it to try again differently (§2.6).
 */
export async function enviarContato(
  _prevState: ContatoState,
  formData: FormData,
): Promise<ContatoState> {
  if (String(formData.get("website") ?? "").trim() !== "") {
    return { status: "success", errors: {} };
  }

  const nome = String(formData.get("nome") ?? "").trim();
  const telefone = String(formData.get("telefone") ?? "").trim();
  const mensagem = String(formData.get("mensagem") ?? "").trim();
  const consentimento = formData.get("consentimento") === "on";

  const errors: ContatoFieldErrors = {};
  if (!nome) errors.nome = "Diga seu nome.";
  if (!telefone) errors.telefone = "Diga um telefone para retorno.";
  if (!consentimento) {
    errors.consentimento = "É preciso aceitar para enviar o formulário.";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";

  const client = await payload();

  const lead = await client.create({
    collection: "leads",
    data: {
      nome,
      telefone,
      mensagem: mensagem || undefined,
      origem: "Formulário em /contato",
    },
  });

  await client.create({
    collection: "consentimentos",
    data: {
      lead: lead.id,
      finalidade: CONSENT_PURPOSE_TEXT,
      texto_versao: CONSENT_VERSION,
      ip,
    },
  });

  return { status: "success", errors: {} };
}
