/**
 * The rules behind the CRECI signature — docs/design-handoff.md §06.
 *
 * They live here, apart from the component that renders them, because two surfaces need them
 * and only one of them is a page: `src/components/signature.tsx` draws the on-screen lockup,
 * and `opengraph-image.tsx` draws the same lockup server-side with `next/og`, where no DOM and
 * no stylesheet exist. Both derive their sizes from this file, so the legal minimums have one
 * source rather than being re-derived by whoever composes the next surface.
 */

/** Her name, as a fraction of the wordmark on the same piece. Our standard, stricter than required. */
export const MIN_NAME_RATIO = 0.5;

/** CRECI, as a fraction of the largest name on the piece — the wordmark, not her name. */
export const MIN_CRECI_RATIO = 0.25;

/**
 * Absolute floor in px. 25% of a small wordmark would be illegible, so the ratio alone is
 * not enough: this is a legal minimum, not a design target.
 */
export const MIN_CRECI_PX = 11;

export type SignatureVariant = "header" | "footer" | "full";

type SignatureRatios = { nameRatio: number; creciRatio: number };

/**
 * Sizes per variant. The ratios sit above the §06 minimums on purpose — the floors are what
 * the rule permits, not what the design aims at.
 */
const VARIANTS = {
  header: { wordmark: 20, nameRatio: 0.65, creciRatio: 0.55 },
  footer: { wordmark: 24, nameRatio: 0.625, creciRatio: 0.5 },
  full: { wordmark: 32, nameRatio: 0.625, creciRatio: 0.4 },
} as const satisfies Record<SignatureVariant, { wordmark: number } & SignatureRatios>;

/**
 * Resolves a wordmark size to the rest of the lockup with the §06 floors applied. Takes the
 * wordmark size rather than a variant so a surface with its own scale — the OG image is
 * 1200×630 and answers to no CSS — inherits the same rules instead of inventing them.
 */
export function signatureScale(
  wordmark: number,
  { nameRatio, creciRatio }: SignatureRatios,
) {
  return {
    wordmark,
    name: Math.round(wordmark * Math.max(nameRatio, MIN_NAME_RATIO)),
    creci: Math.round(
      Math.max(wordmark * creciRatio, wordmark * MIN_CRECI_RATIO, MIN_CRECI_PX),
    ),
  };
}

/** The three on-screen variants, resolved. Exported so the rules can be asserted, not eyeballed. */
export function signatureSizes(variant: SignatureVariant) {
  return signatureScale(VARIANTS[variant].wordmark, VARIANTS[variant]);
}
