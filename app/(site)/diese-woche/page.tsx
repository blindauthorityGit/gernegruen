import { createPageMetadata } from "@/lib/seo";

import { ProductWishCTA, type ProductWishContent } from "@/components/cta/ProductWishCTA";
import { PageHero } from "@/components/layout/PageHero";
import { BakeryPriceList } from "@/components/sections/weekly/BakeryPriceList";
import { FreshProduceSection } from "@/components/sections/weekly/FreshProduceSection";
import { WeeklyBakeryHighlights } from "@/components/sections/weekly/WeeklyBakeryHighlights";
import { WeekSummary, WeeklyJumpLinks } from "@/components/sections/weekly/WeeklyIntro";
import { WeeklyPromotions } from "@/components/sections/weekly/WeeklyPromotions";
import { NextWeekPreviewSection } from "@/components/sections/weekly/NextWeekPreviewSection";
import { getWeeklyPageData } from "@/lib/weekly/data";
import { getNextWeekPreview } from "@/lib/weekly/preview-data";
import { getCurrentWeeklyProduceList } from "@/lib/weekly/produce-data";
import {type AssortmentSectionData} from "@/components/sections/AssortmentSection";
import {CURRENT_ASSORTMENT_QUERY} from "@/sanity/queries/assortment";
import {fetchSanity} from "@/sanity/lib/live";
import {WEEKLY_PAGE_SETTINGS_QUERY, type WeeklyPageSettings} from "@/sanity/queries/weeklyPageSettings";
import {PRODUCT_WISH_QUERY} from "@/sanity/queries/assortmentCategories";
import type {Metadata} from "next";
import {sanityDataAttribute} from "@/sanity/lib/dataAttribute";
import {stegaClean} from "next-sanity";
import {draftMode} from "next/headers";

export const dynamic = "force-dynamic";

type CurrentAssortment = {enabled?: boolean; edition: (AssortmentSectionData & {_type: "assortmentEdition"}) | null} | null;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSanity<WeeklyPageSettings>(WEEKLY_PAGE_SETTINGS_QUERY, {}, {stega: false}).catch(() => null);
  return createPageMetadata({
    title: settings?.seoTitle || "Diese Woche – Frische Angebote bei GerneGrün",
    description: settings?.seoDescription || "Frisches Obst und Gemüse, Brot und Kuchen der Woche, Backwarenpreise und aktuelle Aktionen bei GerneGrün in Dreieich.",
    path: "/diese-woche",
    keywords: settings?.seoKeywords || ["Wochenangebote", "frisches Obst", "frisches Gemüse", "Brot der Woche", "Aktionen"],
  });
}

export default async function WeeklyPage() {
  const [draft, data, nextWeekPreview, produceList, assortment, settings, wishPage] = await Promise.all([
    draftMode(),
    getWeeklyPageData(),
    getNextWeekPreview(),
    getCurrentWeeklyProduceList(),
    fetchSanity<CurrentAssortment>(CURRENT_ASSORTMENT_QUERY).catch((error: unknown) => {
      console.error("Brot- und Kuchen-Highlights konnten nicht geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
      return null;
    }),
    fetchSanity<WeeklyPageSettings>(WEEKLY_PAGE_SETTINGS_QUERY).catch((error: unknown) => {
      console.error("Seitentexte für Diese Woche konnten nicht aus Sanity geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
      return null;
    }),
    fetchSanity<{_id: string; productWish?: ProductWishContent} | null>(PRODUCT_WISH_QUERY).catch((error: unknown) => {
      console.error("Produktwunsch-Sektion konnte nicht aus Sanity geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
      return null;
    }),
  ]);
  const assortmentEdition = assortment?.enabled === false ? null : assortment?.edition;
  const bakeryCard = assortmentEdition?.cards.find((card) => stegaClean(card.marker) === "bread");
  const bakeryHighlights = bakeryCard ? ([
    {
      title: "Wochenangebot",
      name: "Brot der Woche",
      description: "",
      image: {src: "/graphics/weekly-bread-illustration.png", alt: "Illustration eines Brots"},
    },
    {
      title: "Wochenangebot",
      name: "Kuchen der Woche",
      description: "",
      image: {src: "/graphics/weekly-cake-illustration.png", alt: "Illustration eines Kuchens"},
    },
  ]) : [];

  return (
    <main>
      <PageHero
        badge={produceList ? <WeekSummary week={produceList.week} dataAttribute={produceList._id ? sanityDataAttribute(produceList._id, "weeklyProduceList", "week") : undefined} /> : undefined}
        description={settings?.heroDescription || "Frisch eingetroffen, frisch gebacken und aktuell im Angebot – entdecke, was es diese Woche bei GerneGrün gibt."}
        illustration={{ src: settings?.heroIllustrationSrc ? stegaClean(settings.heroIllustrationSrc) : "/graphics/weekly-page-hero.svg", alt: settings?.heroIllustrationAlt || "Illustrierte Auswahl frischer Wochenprodukte" }}
        showAccent
        mobileAccentPosition="closer"
        title={settings?.heroTitle || "Diese Woche"}
        variant="botanical"
        dataAttributes={{
          title: sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", "heroTitle"),
          description: sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", "heroDescription"),
          illustration: sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", "heroIllustration"),
        }}
      >
        <WeeklyJumpLinks settings={settings} />
      </PageHero>
      <FreshProduceSection list={produceList} settings={settings} />
      {nextWeekPreview && <NextWeekPreviewSection preview={nextWeekPreview} />}
      <WeeklyBakeryHighlights highlights={bakeryHighlights} settings={settings} sourceId={assortmentEdition?.id} sourceType="assortmentEdition" />
      {(data.bakeryBreadCategories.length > 0 || data.bakerySweetCategories.length > 0) && <BakeryPriceList breadCategories={data.bakeryBreadCategories} sweetCategories={data.bakerySweetCategories} settings={settings} catalogId={data.bakeryCatalogId} />}
      <WeeklyPromotions sheets={settings?.promotionSheets ?? []} settings={settings} showInactive={draft.isEnabled} />
      {wishPage?.productWish?.isVisible !== false && <ProductWishCTA content={wishPage?.productWish} sourceId={wishPage?._id} />}
    </main>
  );
}
