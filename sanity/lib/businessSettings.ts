import "server-only";
import {cache} from "react";
import {draftMode} from "next/headers";
import {fetchSanity} from "@/sanity/lib/live";
import {BUSINESS_SETTINGS_QUERY} from "@/sanity/queries/businessSettings";
import type {BusinessSettings} from "@/sanity/types/business";

export const getBusinessSettings = cache(async () => {
  const draft = await draftMode();
  return fetchSanity<BusinessSettings>(BUSINESS_SETTINGS_QUERY, {}, {stega: draft.isEnabled}).catch((error: unknown) => {
    console.error("Geschäftsdaten konnten nicht aus Sanity geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
    return null;
  });
});
