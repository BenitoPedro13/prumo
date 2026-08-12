/**
 * Every identity string the site renders lives here.
 *
 * Two of these are unresolved and both are load-bearing, which is the whole reason for this
 * file: a rename or the arrival of the real CRECI number must be one edit, never a grep.
 * See docs/design-handoff.md §02 (name) and §06 (the signature).
 */

/**
 * Working codename, not a confirmed brand. `prumo.com.br` and `prumo.co` are both taken and
 * Adriana has not chosen between Prumo, Chão, Soleira, Raiz and Boa Praça.
 */
export const BRAND_NAME = "Prumo";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const SITE_LOCALE = "pt-BR";

/**
 * One sentence, used as the meta description, the OG description and the fallback subtitle.
 * It states the order the product insists on — credit first, apartment second — because that
 * order is the whole differentiation (docs/product-definition.md §01).
 */
export const SITE_DESCRIPTION =
  "Apartamentos da Cury no Rio de Janeiro, com o custo total à vista e uma orientação honesta sobre crédito antes de escolher o apartamento.";

/**
 * She is pessoa física, so the project name is only permitted as a pseudonym while her real
 * name appears clearly and prominently alongside it. Dropping this to tidy a layout is a
 * legal regression, not a design improvement.
 */
export const BROKER_NAME = "Adriana Monteiro";

export const BROKER_ROLE = "Corretora de Imóveis";

/** The qualification that follows the role in the signature lockup. */
export const BROKER_QUALIFICATION = "Profissional liberal";

/**
 * PLACEHOLDER. Her real registration is still outstanding and this must not reach production.
 * The `-F` suffix marks pessoa física and is mandatory in advertising.
 * [VERIFICAR: número real junto ao CRECI-RJ]
 */
export const BROKER_CRECI = "CRECI-RJ 00.000-F";

/** PLACEHOLDER. E.164 without punctuation, the form `wa.me` expects. */
export const WHATSAPP_NUMBER = "5521900000000";

/** PLACEHOLDER. The second channel `/privacidade` offers for a stop-or-delete request. */
export const BROKER_EMAIL = "adriana@example.com";

/** Optional in interior footers, required on the proposal and the "sobre" page (§06). */
export const BROKER_PHOTO = "/adriana-placeholder.jpg";
