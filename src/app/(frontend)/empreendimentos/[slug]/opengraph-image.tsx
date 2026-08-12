import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { STATUS_LABEL } from "@/lib/catalogo";
import { OG } from "@/lib/og-palette";
import { payload } from "@/lib/payload";
import { signatureScale } from "@/lib/signature";
import { BRAND_NAME, BROKER_CRECI, BROKER_NAME, BROKER_ROLE } from "@/lib/site-config";

/**
 * Same construction as the site-wide OG image (src/app/(frontend)/opengraph-image.tsx), with
 * the fixed line swapped for the development's name and bairro — the signature is a legal
 * requirement on this surface too (docs/design-handoff.md §06: "every development listing").
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontPath = (file: string) => join(process.cwd(), "src/assets/fonts", file);

const [slab, sans, mono] = await Promise.all([
  readFile(fontPath("RobotoSlab-Regular.ttf")),
  readFile(fontPath("Roboto-Regular.ttf")),
  readFile(fontPath("RobotoMono-Regular.ttf")),
]);

const lockup = signatureScale(40, { nameRatio: 0.62, creciRatio: 0.46 });
const hairline = "rgba(232, 233, 227, 0.22)";
const muted = "rgba(232, 233, 227, 0.74)";

export default async function EmpreendimentoOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await payload();
  const { docs } = await client.find({
    collection: "empreendimentos",
    where: { slug: { equals: slug }, _status: { equals: "published" } },
    depth: 0,
    limit: 1,
  });
  const empreendimento = docs[0];

  const titulo = empreendimento?.nome ?? BRAND_NAME;
  const local = empreendimento
    ? `${empreendimento.endereco.bairro}, ${empreendimento.endereco.cidade}`
    : "Rio de Janeiro";
  const status = empreendimento ? STATUS_LABEL[empreendimento.status_obra] : "";

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
            {status ? `Cury · ${status}` : "Cury"}
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
            {titulo}
          </div>
          <div style={{ fontSize: 26, color: muted, marginTop: 12 }}>{local}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ height: 1, background: hairline, marginBottom: 22 }} />
          <div style={{ fontSize: lockup.name }}>{BROKER_NAME}</div>
          <div style={{ fontSize: 21, color: muted, marginTop: 6 }}>{BROKER_ROLE}</div>
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
