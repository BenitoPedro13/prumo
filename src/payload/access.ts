import type { Access } from "payload";

/**
 * The site reads through Payload's Local API, which bypasses access control by design, so
 * these rules govern one thing: what the public REST and GraphQL endpoints hand out.
 *
 * That surface is not used by any page, so the safe default is to close it. A draft is a page
 * Adriana has not decided to publish, and it should not be readable by asking the API nicely.
 */

/** Published documents are public; a logged-in editor sees everything, drafts included. */
export const publicadosOuAutenticado: Access = ({ req: { user } }) => {
  if (user) return true;

  return { _status: { equals: "published" } };
};

/** Nothing public. For collections that only ever reach a visitor through a rendered page. */
export const somenteAutenticado: Access = ({ req: { user } }) => Boolean(user);
