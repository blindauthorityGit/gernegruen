import {fetchSanity} from "@/sanity/lib/live";
import { CURRENT_BAKERY_CATALOG_QUERY, CURRENT_WEEKLY_PAGE_QUERY } from "@/sanity/queries/weekly";

import {getCurrentIsoWeek} from "./produce-data";
import type { BakeryCatalogData, WeeklyPageData } from "./types";

async function fetchWeeklyPageData() {
  return fetchSanity<WeeklyPageData | null>(CURRENT_WEEKLY_PAGE_QUERY)
    .catch((error: unknown) => {
      console.error("Wochenübersicht konnte nicht aus Sanity geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
      return null;
    });
}

async function fetchBakeryCatalog() {
  return fetchSanity<BakeryCatalogData | null>(CURRENT_BAKERY_CATALOG_QUERY)
    .catch((error: unknown) => {
      console.error("Backwarensortiment konnte nicht aus Sanity geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
      return null;
    });
}

export async function getWeeklyPageData(): Promise<WeeklyPageData> {
  const [data, catalog] = await Promise.all([fetchWeeklyPageData(), fetchBakeryCatalog()]);
  const currentWeek = getCurrentIsoWeek();
  const pageData: WeeklyPageData = data ?? {
    ...currentWeek,
    dateRange: "",
    produceGroups: [],
    bakeryHighlights: [],
    bakeryCategories: [],
    promotionSheets: [],
    promotionSheet: null,
  };
  return {
    ...pageData,
    bakeryCategories: catalog?.categories ?? pageData.bakeryCategories,
    bakeryCatalogId: catalog?._id ?? pageData.bakeryCatalogId,
  };
}

export async function getCurrentBakeryCategories() {
  const catalog = await fetchBakeryCatalog();
  if (catalog) return catalog.categories;
  const data = await fetchWeeklyPageData();
  return data?.bakeryCategories ?? [];
}
