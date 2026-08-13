import { OG_CONTENT_TYPE, OG_SIZE, renderShareCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function PrivacidadeOpenGraphImage() {
  return renderShareCard({
    eyebrow: "Prumo",
    heading: "Privacidade e dados",
    subtitulo: "O que este site guarda sobre você, para quê, e como pedir para parar.",
  });
}
