import {fetchSanity} from "@/sanity/lib/live";
import {stegaClean} from "next-sanity";
import {CURRENT_ASSORTMENT_QUERY} from "@/sanity/queries/assortment";
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

type CurrentBakeryOffers = {
  enabled?: boolean;
  edition?: {cards?: Array<{marker?: string; entries?: Array<{_key: string; title: string; ingredients?: string; price?: number}>}>} | null;
} | null;

async function fetchCurrentBakeryOffers() {
  return fetchSanity<CurrentBakeryOffers>(CURRENT_ASSORTMENT_QUERY)
    .catch((error: unknown) => {
      console.error("Wochenangebote für die Vorbestellung konnten nicht geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
      return null;
    });
}

function addWeeklyOffersToPreorder(groups: {bread: WeeklyPageData["bakeryBreadCategories"]; sweet: WeeklyPageData["bakerySweetCategories"]}, data: CurrentBakeryOffers) {
  const bakery = data?.enabled === false ? undefined : data?.edition?.cards?.find((card) => stegaClean(card.marker ?? "") === "bread");
  if (!bakery) return groups;

  const addOffer = (categories: typeof groups.bread, key: "bread" | "cake") => {
    const entry = bakery.entries?.find((item) => item._key === key);
    if (!entry) return categories;
    const actionIndex = categories.findIndex((category) => category.title.trim().toLocaleLowerCase("de-DE") === "aktion");
    const existingAction = actionIndex >= 0 ? categories[actionIndex] : undefined;
    const price = entry.price ?? existingAction?.products[0]?.price;
    if (price === undefined) return categories;
    const category = {
      _key: `weekly-${key}-action`,
      title: "Aktion",
      products: [{
        _key: `weekly-${key}`,
        name: stegaClean(entry.title),
        note: key === "bread" ? "500 g" : undefined,
        price,
        ingredients: entry.ingredients ? stegaClean(entry.ingredients) : undefined,
      }],
    };
    if (actionIndex < 0) return [category, ...categories];
    return categories.map((current, index) => index === actionIndex ? category : current);
  };

  return {
    bread: addOffer(groups.bread, "bread"),
    sweet: addOffer(groups.sweet, "cake"),
  };
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
  const [catalog, weeklyPage, offers] = await Promise.all([fetchBakeryCatalog(), fetchWeeklyPageData(), fetchCurrentBakeryOffers()]);
  const groups = catalog
    ? getCatalogCategories(catalog, [])
    : weeklyPage
      ? getCatalogCategories(null, weeklyPage.bakeryCategories ?? [], weeklyPage.bakeryBreadCategories ?? [], weeklyPage.bakerySweetCategories ?? [])
      : {bread: [], sweet: []};
  return addWeeklyOffersToPreorder(groups, offers);
}

export async function getCurrentBakeryCategories() {
  const groups = await getCurrentBakeryGroups();
  return [...groups.bread, ...groups.sweet];
}
