import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { pt } from "@payloadcms/translations/languages/pt";
import { buildConfig } from "payload";
import sharp from "sharp";

import { CondicoesComerciais } from "./src/payload/collections/condicoes-comerciais";
import { Empreendimentos } from "./src/payload/collections/empreendimentos";
import { Incorporadoras } from "./src/payload/collections/incorporadoras";
import { Media } from "./src/payload/collections/media";
import { Tipologias } from "./src/payload/collections/tipologias";
import { Users } from "./src/payload/collections/users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * Files go to S3-compatible storage only when it is configured. Without the env vars Payload
 * falls back to local disk, which is what a fresh clone should do — nobody needs a bucket to
 * run the admin.
 */
const hasObjectStorage = Boolean(
  process.env.S3_BUCKET &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY,
);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname, "src"),
    },
    meta: {
      titleSuffix: " · Administração",
    },
  },
  collections: [
    Empreendimentos,
    Tipologias,
    CondicoesComerciais,
    Incorporadoras,
    Media,
    Users,
  ],
  /** Adriana is not technical and works in Portuguese. The panel is pt-BR, not translated later. */
  i18n: {
    supportedLanguages: { pt },
    fallbackLanguage: "pt",
  },
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
  }),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "src/payload/payload-types.ts"),
  },
  sharp,
  plugins: hasObjectStorage
    ? [
        s3Storage({
          collections: { media: true },
          bucket: process.env.S3_BUCKET!,
          config: {
            endpoint: process.env.S3_ENDPOINT,
            region: process.env.S3_REGION ?? "auto",
            /** R2 and most S3-compatible providers need path-style addressing. */
            forcePathStyle: true,
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID!,
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
            },
          },
        }),
      ]
    : [],
});
