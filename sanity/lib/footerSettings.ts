import "server-only";
import {cache} from "react";
import {draftMode} from "next/headers";
import {fetchSanity} from "@/sanity/lib/live";
import {FOOTER_SETTINGS_QUERY} from "@/sanity/queries/footerSettings";

export type FooterSettings = {
  openingHoursHeading?: string;
  addressHeading?: string;
  linksHeading?: string;
  legalLinks?: {_key?: string; label: string; href: string}[];
} | null;

export const getFooterSettings = cache(async () => {
  const draft = await draftMode();
  return fetchSanity<FooterSettings>(FOOTER_SETTINGS_QUERY, {}, {stega: draft.isEnabled}).catch((error: unknown) => {
    console.error("Footer-Einstellungen konnten nicht aus Sanity geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
    return null;
  });
});
