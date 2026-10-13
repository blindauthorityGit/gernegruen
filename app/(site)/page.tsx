import { type AssortmentSectionData } from "@/components/sections/AssortmentSection";
import { WeeklyOffersSection } from "@/components/sections/home/WeeklyOffersSection";
import { SupplierLogoBar } from "@/components/sections/home/SupplierLogoBar";
import { HomeHero, type HomeHeroData } from "@/components/sections/home/HomeHero";
import { StoreIntroSection, type StoreIntroSectionData } from "@/components/sections/home/StoreIntroSection";
import { sanityClient } from "@/sanity/lib/client";
import { START_PAGE_CONTENT_QUERY } from "@/sanity/queries/startPage";
import {CURRENT_ASSORTMENT_QUERY} from "@/sanity/queries/assortment";
import {SUPPLIER_BRANDS_QUERY} from "@/sanity/queries/supplierBrands";
import {assortmentFallback} from "@/lib/content/assortmentFallback";
import {getCurrentWeeklyProduceList} from "@/lib/weekly/produce-data";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "GerneGrün – Lebensmittel in Dreieich",
  description: "Entdecke Obst, Gemüse, Brot und mehr bei GerneGrün in Dreieich.",
  path: "/",
  keywords: ["Obst", "Gemüse", "Brot", "Lebensmittel"],
});

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
  const [startPageContent, assortment, brands, produceList] = await Promise.all([
    sanityClient.fetch<{
      hero?: (Partial<HomeHeroData> & {imageUrl?: string; imageAlt?: string}) | null;
      storeIntroSection?: StoreIntroSectionData | null;
    } | null>(
      START_PAGE_CONTENT_QUERY, {}, {next: {revalidate: 60}},
    ).catch((error: unknown) => {
      console.error("Sanity-Hero konnte nicht geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
      return null;
    }),
    sanityClient.fetch<{enabled?: boolean; edition: AssortmentSectionData | null} | null>(
      CURRENT_ASSORTMENT_QUERY, {}, {useCdn: false, next: {revalidate: 60}},
    ).catch((error: unknown) => {
      console.error("Sanity-Sortiment konnte nicht geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
      return null;
    }),
    sanityClient.fetch<{_id: string; name: string; url?: string; logoUrl?: string}[]>(
      SUPPLIER_BRANDS_QUERY, {}, {next: {revalidate: 60}},
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
    primaryCta: hero?.primaryCta ?? homeHero.primaryCta,
    secondaryCta: hero?.secondaryCta ?? homeHero.secondaryCta,
    image: hero?.imageUrl ? { src: hero.imageUrl, alt: hero.imageAlt ?? "" } : homeHero.image,
  };
  const supplierItems = brands.map((brand) => ({name: brand.name, href: brand.url, src: brand.logoUrl ?? "", width: 360, height: 160}));
  return (
    <>
      <main>
        <HomeHero data={heroData} />
        {(assortmentData || produceList) && <WeeklyOffersSection data={assortmentData} produceList={produceList} />}
        <SupplierLogoBar suppliers={supplierItems} showTitle={false} showEmptyState={process.env.NODE_ENV === "development" && supplierItems.length === 0} />
        <StoreIntroSection data={startPageContent?.storeIntroSection} />
      </main>
    </>
  );
}

