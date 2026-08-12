import Image from "next/image";

import {
  BRAND_NAME,
  BROKER_CRECI,
  BROKER_NAME,
  BROKER_PHOTO,
  BROKER_QUALIFICATION,
  BROKER_ROLE,
} from "@/lib/site-config";
import { cn } from "@/lib/utils";

/**
 * The CRECI signature — docs/design-handoff.md §06.
 *
 * This is the repo's central legal constraint, so the proportions are computed here rather
 * than left to whoever composes the next screen. Any screenshot of any surface must contain
 * the complete lockup: her real name, the role, and the registration. If it does not, the
 * layout is wrong.
 */

/** Her name, as a fraction of the wordmark on the same piece. Our standard, stricter than required. */
const MIN_NAME_RATIO = 0.5;

/** CRECI, as a fraction of the largest name on the piece — the wordmark, not her name. */
const MIN_CRECI_RATIO = 0.25;

/**
 * Absolute floor in px. 25% of a small wordmark would be illegible, so the ratio alone is
 * not enough: this is a legal minimum, not a design target.
 */
const MIN_CRECI_PX = 11;

export type SignatureVariant = "header" | "footer" | "full";

const VARIANTS = {
  header: { wordmark: 20, nameRatio: 0.65, creciRatio: 0.55 },
  footer: { wordmark: 24, nameRatio: 0.625, creciRatio: 0.5 },
  full: { wordmark: 32, nameRatio: 0.625, creciRatio: 0.4 },
} as const satisfies Record<
  SignatureVariant,
  { wordmark: number; nameRatio: number; creciRatio: number }
>;

/**
 * Resolves a variant to px sizes with the §06 floors applied. Exported so the rules can be
 * asserted directly instead of eyeballed in a screenshot.
 */
export function signatureSizes(variant: SignatureVariant) {
  const { wordmark, nameRatio, creciRatio } = VARIANTS[variant];

  return {
    wordmark,
    name: Math.round(wordmark * Math.max(nameRatio, MIN_NAME_RATIO)),
    creci: Math.round(
      Math.max(
        wordmark * creciRatio,
        wordmark * MIN_CRECI_RATIO,
        MIN_CRECI_PX,
      ),
    ),
  };
}

type SignatureProps = {
  variant?: SignatureVariant;
  /** Required on the proposal and the "sobre" page; optional in interior footers. */
  photo?: boolean;
  className?: string;
};

export function Signature({
  variant = "footer",
  photo = variant === "full",
  className,
}: SignatureProps) {
  const size = signatureSizes(variant);
  const px = (value: number) => `${value}px`;

  const wordmark = (
    <span
      className="font-display leading-none tracking-tight text-ink"
      style={{ fontSize: px(size.wordmark) }}
    >
      {BRAND_NAME}
    </span>
  );

  const registration = (
    <span
      className="font-mono uppercase tracking-wide text-ink-muted"
      style={{ fontSize: px(size.creci) }}
    >
      {BROKER_CRECI}
    </span>
  );

  if (variant === "header") {
    return (
      <address
        className={cn("flex items-center gap-3 not-italic", className)}
        aria-label="Identificação profissional"
      >
        {wordmark}
        <span aria-hidden className="h-8 w-px shrink-0 bg-rule" />
        <span className="flex flex-col gap-0.5">
          <span
            className="font-sans leading-tight text-ink"
            style={{ fontSize: px(size.name) }}
          >
            {BROKER_NAME}
            <span className="text-ink-muted"> · {BROKER_ROLE}</span>
          </span>
          {registration}
        </span>
      </address>
    );
  }

  return (
    <address
      className={cn(
        "flex items-center gap-4 not-italic",
        variant === "full" && "gap-5",
        className,
      )}
      aria-label="Identificação profissional"
    >
      {photo ? (
        <Image
          src={BROKER_PHOTO}
          alt={`Retrato de ${BROKER_NAME}`}
          width={144}
          height={144}
          sizes="72px"
          className="size-18 shrink-0 rounded-full object-cover"
        />
      ) : null}
      <span className="flex flex-col gap-1.5">
        {wordmark}
        <span className="flex flex-col gap-0.5">
          <span
            className="font-sans leading-tight text-ink"
            style={{ fontSize: px(size.name) }}
          >
            {BROKER_NAME}
          </span>
          <span
            className="font-sans leading-tight text-ink-muted"
            style={{ fontSize: px(size.creci) }}
          >
            {BROKER_ROLE} · {BROKER_QUALIFICATION}
          </span>
        </span>
        {registration}
      </span>
    </address>
  );
}
