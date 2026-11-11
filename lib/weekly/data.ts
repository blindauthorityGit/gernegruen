import {fetchSanity} from "@/sanity/lib/live";
import {stegaClean} from "next-sanity";
import {CURRENT_ASSORTMENT_QUERY} from "@/sanity/queries/assortment";
import {CURRENT_BAKERY_CATALOG_QUERY} from "@/sanity/queries/weekly";
import type {CurrentAssortmentData} from "@/sanity/types/assortment";

import type {BakeryCatalogData, BakeryCategory} from "./types";

async function fetchBakeryCatalog() {
  return fetchSanity<BakeryCatalogData | null>(CURRENT_BAKERY_CATALOG_QUERY)
    .catch((error: unknown) => {
      console.error("Backwarensortiment konnte nicht aus Sanity geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
      return null;
    });
}

async function fetchCurrentBakeryOffers() {
  return fetchSanity<CurrentAssortmentData>(CURRENT_ASSORTMENT_QUERY)
    .catch((error: unknown) => {
      console.error("Wochenangebote für die Vorbestellung konnten nicht geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
      return null;
    });
}

function addWeeklyOffersToPreorder(groups: {bread: BakeryCategory[]; sweet: BakeryCategory[]}, data: CurrentAssortmentData) {
  const bakery = data?.enabled === false ? undefined : data?.edition?.bakeryHighlights;
  if (!bakery) return groups;

  const addOffer = (categories: BakeryCategory[], key: "bread" | "cake") => {
    const entry = bakery[key];
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

export async function getBakeryCatalogData() {
  const catalog = await fetchBakeryCatalog();
  return {
    bakeryBreadCategories: catalog?.breadCategories ?? [],
    bakerySweetCategories: catalog?.sweetCategories ?? [],
    bakeryCatalogId: catalog?._id,
  };
}

export async function getCurrentBakeryGroups() {
  const [catalog, offers] = await Promise.all([fetchBakeryCatalog(), fetchCurrentBakeryOffers()]);
  return addWeeklyOffersToPreorder({
    bread: catalog?.breadCategories ?? [],
    sweet: catalog?.sweetCategories ?? [],
  }, offers);
}

export async function getCurrentBakeryCategories() {
  const groups = await getCurrentBakeryGroups();
  return [...groups.bread, ...groups.sweet];
}
