import { OG_CONTENT_TYPE, OG_SIZE, renderShareCard } from "@/lib/og-image";

import { buscarProposta } from "../mapping";

/**
 * Not gated on `expira_em` — a share preview that's a day stale on an expired link is a
 * cosmetic gap, not the data-safety concern the page itself guards against with a hard block
 * (`docs/tasks/TASK-proposta.md`). Not worth the added complexity for v1.
 */
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function PropostaOpenGraphImage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const doc = await buscarProposta(token);

  return renderShareCard({
    eyebrow: "Uma proposta para você",
    heading: doc ? `Para ${doc.saudacao}` : "Proposta",
    subtitulo: "A conta inteira, incluindo a parte que sobe durante a obra.",
  });
}
