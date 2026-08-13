import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { OG } from "@/lib/og-palette";
import { signatureScale } from "@/lib/signature";
import { BROKER_CRECI, BROKER_NAME, BROKER_QUALIFICATION, BROKER_ROLE } from "@/lib/site-config";

/**
 * What every `opengraph-image.tsx` in the app shares — font loading, size, and the layout
 * `empreendimentos/[slug]/opengraph-image.tsx` first established: eyebrow, heading, optional
 * subtitle, and the CRECI signature block, which is a legal requirement here too
 * (docs/design-handoff.md §06 — every artifact this advertising touches, this one included).
 *
 * The home page's own image (`(frontend)/opengraph-image.tsx`) is the one exception: it keeps
 * its bespoke plumb-rail-thread layout rather than this shared card, on purpose — it is the
 * single most likely surface to be seen, per its own comment, and earns being hand-drawn.
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const fontPath = (file: string) => join(process.cwd(), "src/assets/fonts", file);

export async function loadFonts() {
  const [slab, sans, mono] = await Promise.all([
    readFile(fontPath("RobotoSlab-Regular.ttf")),
    readFile(fontPath("Roboto-Regular.ttf")),
    readFile(fontPath("RobotoMono-Regular.ttf")),
  ]);

  return [
    { name: "Roboto Slab", data: slab, style: "normal" as const, weight: 400 as const },
    { name: "Roboto", data: sans, style: "normal" as const, weight: 400 as const },
    { name: "Roboto Mono", data: mono, style: "normal" as const, weight: 400 as const },
  ];
}

const hairline = "rgba(232, 233, 227, 0.22)";
const muted = "rgba(232, 233, 227, 0.74)";

export async function renderShareCard({
  eyebrow,
  heading,
  subtitulo,
}: {
  eyebrow: string;
  heading: string;
  subtitulo?: string;
}) {
  const fonts = await loadFonts();
  const lockup = signatureScale(40, { nameRatio: 0.62, creciRatio: 0.46 });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: OG.verdeDeep,
          color: OG.paper,
          fontFamily: "Roboto",
          padding: "64px 72px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "Roboto Mono",
              fontSize: 20,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: OG.latoClaro,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              fontFamily: "Roboto Slab",
              fontSize: 58,
              lineHeight: 1.2,
              marginTop: 18,
              maxWidth: 900,
            }}
          >
            {heading}
          </div>
          {subtitulo ? (
            <div style={{ fontSize: 26, color: muted, marginTop: 12, maxWidth: 820 }}>
              {subtitulo}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ height: 1, background: hairline, marginBottom: 22 }} />
          <div style={{ fontSize: lockup.name }}>{BROKER_NAME}</div>
          <div style={{ fontSize: 21, color: muted, marginTop: 6 }}>
            {`${BROKER_ROLE} · ${BROKER_QUALIFICATION}`}
          </div>
          <div
            style={{
              fontFamily: "Roboto Mono",
              fontSize: lockup.creci,
              letterSpacing: 1,
              color: OG.latoClaro,
              marginTop: 12,
            }}
          >
            {BROKER_CRECI}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
