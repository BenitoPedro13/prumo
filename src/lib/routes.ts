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

/**
 * The nav, in the order the buyer needs them: whether they can buy at all, what she sells, who
 * she is, how to reach her.
 *
 * `/simulador` comes first and outranks the catalogue in the sitemap because the product's
 * whole claim is that "eu consigo?" is answered before "qual apartamento?"
 * (docs/product-definition.md §03). A nav that opened with the listings would argue the
 * opposite of the site it belongs to.
 */
export const PRIMARY_ROUTES: SiteRoute[] = [
  {
    href: "/simulador",
    label: "Você consegue?",
    built: true,
    changeFrequency: "monthly",
    priority: 0.9,
  },
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
    built: true,
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
