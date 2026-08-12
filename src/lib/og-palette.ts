/**
 * The light palette in plain hex, for the two surfaces that render without CSS: the OG image
 * and the icon. `next/og` runs Satori on the server, where custom properties do not exist.
 *
 * This is a copy of the light values in src/app/globals.css §03, and the only copy. Changing a
 * colour there means changing it here in the same commit — the design system on /sistema
 * renders from the CSS, so a drift shows up as an OG image that no longer matches the site.
 *
 * There is no dark variant on purpose. A shared link has no theme: it is a PNG, and it is the
 * deep green one.
 */
export const OG = {
  verde: "#2e4a3c",
  verdeDeep: "#22392e",
  latao: "#9c7b3f",
  latoClaro: "#c9a464",
  paper: "#e8e9e3",
  sheet: "#f5f6f1",
  ink: "#22251f",
} as const;
