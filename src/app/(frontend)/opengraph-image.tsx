import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { OG } from "@/lib/og-palette";
import { signatureScale } from "@/lib/signature";
import {
  BRAND_NAME,
  BROKER_CRECI,
  BROKER_NAME,
  BROKER_QUALIFICATION,
  BROKER_ROLE,
} from "@/lib/site-config";

/**
 * The surface most likely to be seen and most likely to be forgotten.
 *
 * This site is reached from a WhatsApp message far more often than from a search result
 * (docs/product-definition.md §08), which makes the shared preview the front door — and makes
 * it advertising in the CRECI sense, so the complete signature on it is a legal requirement
 * rather than a nicety (§06). The proportions come from src/lib/signature.ts, the same file the
 * on-screen lockup uses, so this cannot drift out of compliance on its own.
 *
 * Two things here are exceptions to stated rules, both deliberate:
 *
 * 1. It embeds font files. §04 says system stacks and no webfonts, and the site still ships
 *    none — but Satori renders server-side, where system fonts do not exist. The files are
 *    baked into a PNG at build time and never reach a browser, so the §09 weight budget is
 *    untouched. See src/assets/fonts/README.md.
 * 2. The colours are hardcoded hex. A PNG has no custom properties and no theme; see
 *    src/lib/og-palette.ts.
 *
 * The plumb rail on the left is the identity's mechanism (§07) in its static form — the same
 * thread and bob that will drop through the pre-qualification, here hanging still.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const alt = `${BRAND_NAME} · ${BROKER_NAME}, ${BROKER_ROLE}, ${BROKER_CRECI}. Apartamentos da Cury no Rio de Janeiro.`;

const fontPath = (file: string) => join(process.cwd(), "src/assets/fonts", file);

const [slab, sans, mono] = await Promise.all([
  readFile(fontPath("RobotoSlab-Regular.ttf")),
  readFile(fontPath("Roboto-Regular.ttf")),
  readFile(fontPath("RobotoMono-Regular.ttf")),
]);

/** Wordmark size for this piece; her name and the CRECI follow from it, per §06. */
const lockup = signatureScale(48, { nameRatio: 0.62, creciRatio: 0.46 });

const hairline = "rgba(232, 233, 227, 0.22)";

const PADDING_Y = 64;
const CONTENT_HEIGHT = size.height - PADDING_Y * 2;

/**
 * Thread and bob, drawn as one SVG rather than assembled from boxes: the bob tapers to a point,
 * and a point is not a shape a div makes. The thread runs the full height and the bob comes to
 * rest level with the signature — the instrument settles on her name, which is the whole idea.
 */
const plumbRail = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="${CONTENT_HEIGHT}" viewBox="0 0 30 ${CONTENT_HEIGHT}">
     <line x1="15" y1="0" x2="15" y2="${CONTENT_HEIGHT - 56}" stroke="${hairline}" stroke-width="2" />
     <path d="M15 ${CONTENT_HEIGHT - 54} C22 ${CONTENT_HEIGHT - 54} 27 ${CONTENT_HEIGHT - 49} 27 ${CONTENT_HEIGHT - 43} L27 ${CONTENT_HEIGHT - 26} L15 ${CONTENT_HEIGHT - 2} L3 ${CONTENT_HEIGHT - 26} L3 ${CONTENT_HEIGHT - 43} C3 ${CONTENT_HEIGHT - 49} 8 ${CONTENT_HEIGHT - 54} 15 ${CONTENT_HEIGHT - 54} Z" fill="${OG.latoClaro}" />
   </svg>`,
).toString("base64")}`;
const muted = "rgba(232, 233, 227, 0.74)";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: OG.verdeDeep,
          color: OG.paper,
          fontFamily: "Roboto",
          padding: `${PADDING_Y}px 72px`,
        }}
      >
        <img src={plumbRail} width={30} height={CONTENT_HEIGHT} alt="" />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            paddingLeft: 56,
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
              Cury · Rio de Janeiro
            </div>
            <div
              style={{
                fontFamily: "Roboto Slab",
                fontSize: lockup.wordmark,
                marginTop: 18,
              }}
            >
              {BRAND_NAME}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: "Roboto Slab",
              fontSize: 54,
              lineHeight: 1.24,
            }}
          >
            <div>Antes de escolher o apartamento,</div>
            <div>a pergunta é: eu consigo?</div>
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
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Roboto Slab", data: slab, style: "normal", weight: 400 },
        { name: "Roboto", data: sans, style: "normal", weight: 400 },
        { name: "Roboto Mono", data: mono, style: "normal", weight: 400 },
      ],
    },
  );
}
