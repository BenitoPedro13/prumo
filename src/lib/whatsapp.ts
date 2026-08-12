import { WHATSAPP_NUMBER } from "@/lib/site-config";

/**
 * `wa.me` deep links with the message pre-filled — docs/product-definition.md §05.
 *
 * Deliberately not the WhatsApp Business API: at her volume the per-message cost buys nothing
 * that a link does not already do, and a link works from a static page with no backend.
 *
 * The text is written in the buyer's voice, because the buyer is the one who presses send. It
 * says where they came from, so she opens the conversation already knowing what they were
 * looking at instead of spending the first two messages finding out.
 */

export type WhatsAppContext = {
  /**
   * Where they are writing from, as a prepositional phrase so it drops into the sentence:
   * "na página inicial", "na ficha do Cury Pixinguinha", "no rodapé do site".
   */
  origem: string;
  /** Named only when the surface is about one development. */
  empreendimento?: string;
  /** Only meaningful alongside an empreendimento — "2 quartos, 42 m²". */
  tipologia?: string;
};

export function whatsappMessage({
  origem,
  empreendimento,
  tipologia,
}: WhatsAppContext): string {
  const opening = `Oi, Adriana. Vim pelo site, ${origem}.`;

  if (!empreendimento) {
    return `${opening} Queria entender se eu consigo comprar e por onde começar.`;
  }

  const unit = tipologia ? `${empreendimento}, ${tipologia}` : empreendimento;

  return `${opening} Queria falar sobre o ${unit}: as condições e se eu consigo.`;
}

export function whatsappHref(context: WhatsAppContext): string {
  const number = WHATSAPP_NUMBER.replace(/\D/g, "");

  return `https://wa.me/${number}?text=${encodeURIComponent(whatsappMessage(context))}`;
}
