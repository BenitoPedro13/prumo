"use client";

import { useState } from "react";

import { PlumbRail } from "@/components/plumb-rail";
import { Button } from "@/components/ui/button";

/**
 * An instrument on /sistema, not a site feature — the same arrangement as the theme toggle.
 *
 * The apparatus is the one component on this page a static panel cannot prove: the drop, the
 * overshoot and the damping are the design decision. So the rail gets a control, and the
 * decision gets checked instead of described.
 */

/** The pre-qualification's shape: an opening, six questions and the result. */
const MARCAS = 8;

export function PlumbRailDemo() {
  const [marca, setMarca] = useState(0);
  const ultima = MARCAS - 1;
  const noFim = marca === ultima;

  return (
    <div className="flex flex-wrap items-start gap-6 rounded-lg border border-rule bg-sheet p-6">
      <figure className="space-y-2">
        <PlumbRail
          notches={MARCAS}
          current={marca}
          state={noFim ? "aligned" : "hanging"}
          label="Exemplo de progresso"
          className="h-[30rem]"
        />
        <figcaption className="font-mono text-xs text-ink-muted">
          Marca {marca + 1} de {MARCAS}
        </figcaption>
      </figure>

      <div className="max-w-xs space-y-3">
        <Button onClick={() => setMarca(noFim ? 0 : marca + 1)}>
          {noFim ? "Recomeçar" : "Avançar uma marca"}
        </Button>
        <p className="text-sm text-ink-muted">
          Cada resposta solta mais linha. O peso desce atrás dela, a folga se recolhe de cima
          para baixo e o conjunto balança até parar. Quanto mais comprida a linha, mais devagar
          ele volta — é o que um prumo de verdade faz.
        </p>
        <p className="text-sm text-ink-muted">
          Pode pegar no peso e puxar. Levante e a linha afrouxa; puxe além do comprimento dela e
          ela não estica; solte e ele cai de onde estava, na velocidade em que estava indo.
          Passar o cursor por cima também mexe: a linha ondula a partir de onde foi tocada.
        </p>
        <p className="text-sm text-ink-muted">
          Com movimento reduzido no sistema nada disso roda. O peso vai para a marca certa e
          fica lá.
        </p>
      </div>
    </div>
  );
}
