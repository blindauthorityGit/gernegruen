import "server-only";
import {cache} from "react";
import {sanityClient} from "@/sanity/lib/client";
import {BUSINESS_SETTINGS_QUERY} from "@/sanity/queries/businessSettings";
import type {BusinessSettings} from "@/sanity/types/business";

export const getBusinessSettings = cache(async () => sanityClient.fetch<BusinessSettings>(BUSINESS_SETTINGS_QUERY, {}, {next: {revalidate: 60}}).catch((error: unknown) => {
  console.error("Geschäftsdaten konnten nicht aus Sanity geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
  return null;
}));
