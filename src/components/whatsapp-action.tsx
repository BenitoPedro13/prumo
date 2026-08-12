import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { whatsappHref, type WhatsAppContext } from "@/lib/whatsapp";

/**
 * The one action the whole site funnels into. Every surface that offers it passes its own
 * context, so the message she receives says where it came from.
 *
 * Sized larger than the shadcn default on purpose: 44px is the touch-target floor, and this
 * audience is on a mid-range phone, often outdoors (docs/design-handoff.md §09). It is also
 * the only control on the page, so it can afford the room.
 */
export function WhatsAppAction({
  context,
  label = "Falar no WhatsApp",
  variant = "default",
  className,
}: {
  context: WhatsAppContext;
  label?: string;
  variant?: "default" | "outline";
  className?: string;
}) {
  return (
    <Button
      asChild
      variant={variant}
      className={cn("h-11 px-4 text-base font-normal", className)}
    >
      <a href={whatsappHref(context)} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    </Button>
  );
}
