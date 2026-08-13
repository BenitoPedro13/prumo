import { OG_CONTENT_TYPE, OG_SIZE, renderShareCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function ContatoOpenGraphImage() {
  return renderShareCard({
    eyebrow: "Fale com a Adriana",
    heading: "Contato",
    subtitulo: "Pelo WhatsApp, ou deixe seu contato para ela retornar.",
  });
}
