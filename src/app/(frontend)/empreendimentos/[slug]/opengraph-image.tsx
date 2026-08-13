import { STATUS_LABEL } from "@/lib/catalogo";
import { OG_CONTENT_TYPE, OG_SIZE, renderShareCard } from "@/lib/og-image";
import { payload } from "@/lib/payload";
import { BRAND_NAME } from "@/lib/site-config";

/**
 * Same shared card every other route uses (`src/lib/og-image.tsx`), with the development's own
 * name and bairro in place of a fixed line — the signature is a legal requirement on this
 * surface too (docs/design-handoff.md §06: "every development listing").
 */
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function EmpreendimentoOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await payload();
  const { docs } = await client.find({
    collection: "empreendimentos",
    where: { slug: { equals: slug }, _status: { equals: "published" } },
    depth: 0,
    limit: 1,
  });
  const empreendimento = docs[0];

  const titulo = empreendimento?.nome ?? BRAND_NAME;
  const local = empreendimento
    ? `${empreendimento.endereco.bairro}, ${empreendimento.endereco.cidade}`
    : "Rio de Janeiro";
  const status = empreendimento ? STATUS_LABEL[empreendimento.status_obra] : "";

  return renderShareCard({
    eyebrow: status ? `Cury · ${status}` : "Cury",
    heading: titulo,
    subtitulo: local,
  });
}
