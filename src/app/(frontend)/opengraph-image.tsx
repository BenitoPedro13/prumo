import { ImageResponse } from "next/og";

import { OG_CONTENT_TYPE, OG_SIZE, loadFonts } from "@/lib/og-image";
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
 * The line states the order she works in, not a question about the reader. An earlier draft
 * asked "eu consigo?" — which is the product thesis, but pointed at a stranger in a preview
 * they did not ask for it reads as a doubt about them rather than a promise from her. The
 * order is the same; the subject is not.
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
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export const alt = `${BRAND_NAME} · ${BROKER_NAME}, ${BROKER_ROLE}, ${BROKER_CRECI}. Apartamentos da Cury no Rio de Janeiro.`;

const fonts = await loadFonts();

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
              fontSize: 62,
              lineHeight: 1.24,
            }}
          >
            <div>Primeiro a conta inteira.</div>
            <div>Depois o apartamento.</div>
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
    { ...size, fonts },
  );
}
