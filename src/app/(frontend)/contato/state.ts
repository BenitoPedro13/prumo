/**
 * Split out from `actions.ts`: a file marked `"use server"` may only export async functions —
 * a plain object export like `CONTATO_INITIAL_STATE` resolves to `undefined` on the client
 * instead of erroring, which is a silent break, not a loud one.
 */
export type ContatoFieldErrors = {
  nome?: string;
  telefone?: string;
  consentimento?: string;
};

export type ContatoState = {
  status: "idle" | "success" | "error";
  errors: ContatoFieldErrors;
};

export const CONTATO_INITIAL_STATE: ContatoState = {
  status: "idle",
  errors: {},
};
