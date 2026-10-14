import {fetchSanity} from "@/sanity/lib/live";
import { CURRENT_WEEKLY_PAGE_QUERY } from "@/sanity/queries/weekly";

import {getCurrentIsoWeek} from "./produce-data";
import type { WeeklyPageData } from "./types";

async function fetchWeeklyPageData() {
  return fetchSanity<WeeklyPageData | null>(CURRENT_WEEKLY_PAGE_QUERY)
    .catch((error: unknown) => {
      console.error("Wochenübersicht konnte nicht aus Sanity geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
      return null;
    });
}

export async function getWeeklyPageData(): Promise<WeeklyPageData> {
  const data = await fetchWeeklyPageData();
  if (data) return data;
  const currentWeek = getCurrentIsoWeek();
  return {
    ...currentWeek,
    dateRange: "",
    produceGroups: [],
    bakeryHighlights: [],
    bakeryCategories: [],
    promotionSheets: [],
    promotionSheet: null,
  };
}

export async function getCurrentBakeryCategories() {
  const data = await fetchWeeklyPageData();
  return data?.bakeryCategories ?? [];
}
