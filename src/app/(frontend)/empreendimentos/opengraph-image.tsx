import { OG_CONTENT_TYPE, OG_SIZE, renderShareCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function EmpreendimentosOpenGraphImage() {
  return renderShareCard({
    eyebrow: "Cury · Rio de Janeiro",
    heading: "Empreendimentos",
    subtitulo: "Lançamentos da Cury, com o custo total à vista.",
  });
}
