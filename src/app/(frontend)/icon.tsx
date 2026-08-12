import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { OG } from "@/lib/og-palette";
import { BRAND_NAME } from "@/lib/site-config";

/**
 * Provisional, and deliberately so.
 *
 * The identity's real mark is the plumb apparatus (docs/design-handoff.md §07), and drawing it
 * presumes the name is Prumo — which is not decided (§02). Until it is, the tab carries the
 * wordmark's first letter on the verde field, which costs nothing to throw away. Do not mistake
 * this for a design decision that was made.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const slab = await readFile(
  join(process.cwd(), "src/assets/fonts/RobotoSlab-Regular.ttf"),
);

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: OG.verde,
          color: OG.sheet,
          fontFamily: "Roboto Slab",
          fontSize: 22,
        }}
      >
        {BRAND_NAME.charAt(0)}
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Roboto Slab", data: slab, style: "normal", weight: 400 }],
    },
  );
}
