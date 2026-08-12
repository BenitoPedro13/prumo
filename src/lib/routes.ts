import type { MetadataRoute } from "next";

/**
 * The site's public routes, in one list, because three surfaces have to agree on it: the nav,
 * the footer and the sitemap.
 *
 * `built` is the interesting field. The nav links to pages that do not exist yet — that is
 * deliberate, per docs/tasks/TASK-fase-0.md, and better than stubs that get thrown away — but
 * a sitemap that advertises a 404 is a real error. So the nav renders every route and the
 * sitemap renders only the built ones, and each remaining unit of Phase 0 flips one boolean.
 */
export type SiteRoute = {
  href: string;
  label: string;
  built: boolean;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
};

export const HOME: SiteRoute = {
  href: "/",
  label: "Início",
  built: true,
  changeFrequency: "weekly",
  priority: 1,
};

/** The nav, in the order the buyer needs them: what she sells, who she is, how to reach her. */
export const PRIMARY_ROUTES: SiteRoute[] = [
  {
    href: "/empreendimentos",
    label: "Empreendimentos",
    built: true,
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    href: "/sobre",
    label: "Sobre Adriana",
    built: false,
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    href: "/contato",
    label: "Contato",
    built: true,
    changeFrequency: "monthly",
    priority: 0.6,
  },
];

/** Footer-only. */
export const LEGAL_ROUTES: SiteRoute[] = [
  {
    href: "/privacidade",
    label: "Privacidade e dados",
    built: true,
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

export const SITE_ROUTES: SiteRoute[] = [HOME, ...PRIMARY_ROUTES, ...LEGAL_ROUTES];
