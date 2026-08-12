/**
 * One source for the consent copy, read by both the checkbox on `/contato` (what the visitor
 * reads and checks) and the Server Action (what gets stored on `Consentimento`, verbatim) —
 * so the on-page text and the stored proof of what someone agreed to can never drift apart.
 *
 * Bumping `CONSENT_VERSION` is how a future copy change stays auditable: an old `Consentimento`
 * keeps the version it was given under, not the version live today.
 */
export const CONSENT_VERSION = "2026-08";

export const CONSENT_PURPOSE_TEXT =
  "Aceito que Adriana Monteiro entre em contato comigo por WhatsApp, telefone ou e-mail " +
  "sobre este atendimento. Meus dados não são vendidos nem repassados a terceiros para fins " +
  "de marketing.";
