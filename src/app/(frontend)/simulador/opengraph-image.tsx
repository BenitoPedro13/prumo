import { OG_CONTENT_TYPE, OG_SIZE, renderShareCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function SimuladorOpenGraphImage() {
  return renderShareCard({
    eyebrow: "Antes do apartamento",
    heading: "Você consegue comprar?",
    subtitulo: "Seis perguntas, cerca de um minuto.",
  });
}
