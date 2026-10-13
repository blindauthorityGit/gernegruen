import { sanityClient } from "@/sanity/lib/client";
import { CURRENT_WEEKLY_PAGE_QUERY } from "@/sanity/queries/weekly";

import { weeklyPageFallback } from "./mock-data";
import type { WeeklyPageData } from "./types";

async function fetchWeeklyPageData() {
  return sanityClient
    .fetch<WeeklyPageData | null>(CURRENT_WEEKLY_PAGE_QUERY, {}, { useCdn: false, next: { revalidate: 60 } })
    .catch((error: unknown) => {
      console.error("Wochenübersicht konnte nicht aus Sanity geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
      return null;
    });
}

export async function getWeeklyPageData(): Promise<WeeklyPageData> {
  const data = await fetchWeeklyPageData();

  return data?.week && data?.bakeryCategories?.length ? data : weeklyPageFallback;
}

export async function getCurrentBakeryCategories() {
  const data = await fetchWeeklyPageData();
  return data?.bakeryCategories?.length ? data.bakeryCategories : weeklyPageFallback.bakeryCategories;
}
