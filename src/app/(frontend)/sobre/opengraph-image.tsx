import { OG_CONTENT_TYPE, OG_SIZE, renderShareCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function SobreOpenGraphImage() {
  return renderShareCard({
    eyebrow: "Corretora de imóveis · Rio de Janeiro",
    heading: "Sobre Adriana",
    subtitulo: "O que está na mão dela, o que não está, e como ela trabalha.",
  });
}
