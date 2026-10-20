import {fetchSanity} from "@/sanity/lib/live";
import { CURRENT_BAKERY_CATALOG_QUERY, CURRENT_WEEKLY_PAGE_QUERY } from "@/sanity/queries/weekly";

import {getCurrentIsoWeek} from "./produce-data";
import type { BakeryCatalogData, WeeklyPageData } from "./types";

function splitLegacyBakeryCategories(categories: WeeklyPageData["bakeryCategories"]) {
  const sweets = /kuchen|süß|plunder|biskuit|hefe|dauergebäck|snack/i;
  return {
    bread: categories.filter((category) => !sweets.test(category.title)),
    sweet: categories.filter((category) => sweets.test(category.title)),
  };
}

function getCatalogCategories(catalog: BakeryCatalogData | null, legacy: WeeklyPageData["bakeryCategories"], currentBread: WeeklyPageData["bakeryBreadCategories"] = [], currentSweet: WeeklyPageData["bakerySweetCategories"] = []) {
  if (!catalog) {
    if (currentBread.length || currentSweet.length) return {bread: currentBread, sweet: currentSweet};
    return splitLegacyBakeryCategories(legacy);
  }
  if (catalog.breadCategories?.length || catalog.sweetCategories?.length) {
    return {bread: catalog.breadCategories ?? [], sweet: catalog.sweetCategories ?? []};
  }
  return splitLegacyBakeryCategories(catalog.categories ?? legacy);
}

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
    bakeryBreadCategories: [],
    bakerySweetCategories: [],
    promotionSheets: [],
    promotionSheet: null,
  };
  const categories = getCatalogCategories(catalog, pageData.bakeryCategories, pageData.bakeryBreadCategories ?? [], pageData.bakerySweetCategories ?? []);
  return {
    ...pageData,
    bakeryBreadCategories: categories.bread,
    bakerySweetCategories: categories.sweet,
    bakeryCategories: [...categories.bread, ...categories.sweet],
    bakeryCatalogId: catalog?._id ?? pageData.bakeryCatalogId,
  };
}

export async function getCurrentBakeryGroups() {
  const catalog = await fetchBakeryCatalog();
  if (catalog) {
    return getCatalogCategories(catalog, []);
  }
  const data = await fetchWeeklyPageData();
  if (!data) return {bread: [], sweet: []};
  return getCatalogCategories(null, data.bakeryCategories ?? [], data.bakeryBreadCategories ?? [], data.bakerySweetCategories ?? []);
}

export async function getCurrentBakeryCategories() {
  const groups = await getCurrentBakeryGroups();
  return [...groups.bread, ...groups.sweet];
}
