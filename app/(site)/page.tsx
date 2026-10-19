import { type AssortmentSectionData } from "@/components/sections/AssortmentSection";
import { WeeklyOffersSection } from "@/components/sections/home/WeeklyOffersSection";
import { SupplierLogoBar } from "@/components/sections/home/SupplierLogoBar";
import { HomeHero, type HomeHeroData } from "@/components/sections/home/HomeHero";
import { StoreIntroSection, type StoreIntroSectionData } from "@/components/sections/home/StoreIntroSection";
import {fetchSanity} from "@/sanity/lib/live";
import { START_PAGE_CONTENT_QUERY, STORE_INTRO_QUERY } from "@/sanity/queries/startPage";
import {CURRENT_ASSORTMENT_QUERY} from "@/sanity/queries/assortment";
import {SUPPLIER_BRANDS_QUERY} from "@/sanity/queries/supplierBrands";
import {assortmentFallback} from "@/lib/content/assortmentFallback";
import {getCurrentWeeklyProduceList} from "@/lib/weekly/produce-data";
import { createPageMetadata } from "@/lib/seo";
import type {Metadata} from "next";
import {stegaClean} from "next-sanity";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchSanity<{seoTitle?: string; seoDescription?: string; seoKeywords?: string[]} | null>(
    START_PAGE_CONTENT_QUERY,
    {},
    {stega: false},
  ).catch(() => null);

  return createPageMetadata({
    title: content?.seoTitle || "GerneGrün – Lebensmittel in Dreieich",
    description: content?.seoDescription || "Entdecke Obst, Gemüse, Brot und mehr bei GerneGrün in Dreieich.",
    path: "/",
    keywords: content?.seoKeywords || ["Obst", "Gemüse", "Brot", "Lebensmittel"],
  });
}

const homeHero: HomeHeroData = {
  headlineLine1: "Gut versorgt",
  headlineLine2: "direkt in Dreieich",
  description:
    "Bei uns findest du Obst, Gemüse, Brot und mehr – persönlich ausgesucht und immer wieder neu.",
  primaryCta: {
    label: "Was gibt es diese Woche?",
    href: "/diese-woche",
  },
  secondaryCta: {
    label: "Sortiment entdecken",
    href: "/sortiment",
  },
  image: {
    src: "/images/home-hero-store.png",
    alt: "Blick in den GerneGrün Markt mit frischem Obst und Gemüse",
  },
};


export default async function Home() {
  const [startPageContent, storeIntroContent, assortment, brands, produceList] = await Promise.all([
    fetchSanity<{
      hero?: (Partial<HomeHeroData> & {imageUrl?: string; imageAlt?: string}) | null;
    } | null>(
      START_PAGE_CONTENT_QUERY,
    ).catch((error: unknown) => {
      console.error("Sanity-Hero konnte nicht geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
      return null;
    }),
    fetchSanity<StoreIntroSectionData | null>(STORE_INTRO_QUERY).catch((error: unknown) => {
      console.error("Sanity-Ladeneinleitung konnte nicht geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
      return null;
    }),
    fetchSanity<{enabled?: boolean; edition: (AssortmentSectionData & {_type: "assortmentEdition"}) | null} | null>(
      CURRENT_ASSORTMENT_QUERY,
    ).catch((error: unknown) => {
      console.error("Sanity-Sortiment konnte nicht geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
      return null;
    }),
    fetchSanity<{_id: string; name: string; url?: string; logoUrl?: string}[]>(
      SUPPLIER_BRANDS_QUERY,
    ).catch((error: unknown) => {
      console.error("Sanity-Marken konnten nicht geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
      return [];
    }),
    getCurrentWeeklyProduceList(),
  ]);
  const hero = startPageContent?.hero;
  const assortmentData = assortment === null ? assortmentFallback : assortment.enabled === false ? null : assortment.edition;
  const heroData: HomeHeroData = {
    ...homeHero,
    headlineLine1: hero?.headlineLine1?.trim() || homeHero.headlineLine1,
    headlineLine2: hero?.headlineLine2?.trim() || homeHero.headlineLine2,
    description: hero?.description?.trim() || homeHero.description,
    primaryCta: hero?.primaryCta ? {...hero.primaryCta, href: stegaClean(hero.primaryCta.href)} : homeHero.primaryCta,
    secondaryCta: hero?.secondaryCta ? {...hero.secondaryCta, href: stegaClean(hero.secondaryCta.href)} : homeHero.secondaryCta,
    image: hero?.imageUrl ? {src: stegaClean(hero.imageUrl), alt: hero.imageAlt ?? ""} : homeHero.image,
  };
  const storeIntro = storeIntroContent
    ? {...storeIntroContent, imageUrl: storeIntroContent.imageUrl ? stegaClean(storeIntroContent.imageUrl) : undefined, cta: storeIntroContent.cta ? {...storeIntroContent.cta, href: stegaClean(storeIntroContent.cta.href)} : undefined}
    : null;
  const supplierItems = brands.map((brand) => ({_id: brand._id, name: brand.name, href: brand.url ? stegaClean(brand.url) : undefined, src: brand.logoUrl ? stegaClean(brand.logoUrl) : "", width: 360, height: 160}));
  return (
    <>
      <main>
        <HomeHero data={heroData} />
        {(assortmentData || produceList) && <WeeklyOffersSection data={assortmentData} produceList={produceList} />}
        <SupplierLogoBar suppliers={supplierItems} showTitle={false} showEmptyState={process.env.NODE_ENV === "development" && supplierItems.length === 0} />
        <StoreIntroSection data={storeIntro} />
      </main>
    </>
  );
}

