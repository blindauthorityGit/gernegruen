import type { Metadata } from "next";

import { PageHero } from "@/components/layout/PageHero";
import { ProductCountBadge } from "@/components/sections/ProductCountBadge";
import { AssortmentDirectory, type AssortmentCategoryContent, type AssortmentGroupContent } from "@/components/sections/AssortmentDirectory";
import { SupplierLogoBar } from "@/components/sections/home/SupplierLogoBar";
import { WeeklyOffersSection } from "@/components/sections/home/WeeklyOffersSection";
import { ProductWishCTA } from "@/components/cta/ProductWishCTA";
import {AssortmentGallery, type AssortmentGalleryContent} from "@/components/sections/AssortmentGallery";
import type { AssortmentSectionData } from "@/components/sections/AssortmentSection";
import {fetchSanity} from "@/sanity/lib/live";
import { CURRENT_ASSORTMENT_QUERY } from "@/sanity/queries/assortment";
import { ASSORTMENT_CATEGORIES_QUERY } from "@/sanity/queries/assortmentCategories";
import { SUPPLIER_BRANDS_QUERY } from "@/sanity/queries/supplierBrands";
import {getCurrentWeeklyProduceList} from "@/lib/weekly/produce-data";
import { createPageMetadata } from "@/lib/seo";
import {stegaClean} from "next-sanity";
import {sanityDataAttribute} from "@/sanity/lib/dataAttribute";

type AssortmentPageContent = {
  _id?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  heroTitle: string;
  heroDescription: string;
  badgeVisible?: boolean;
  badgeTitle?: string;
  badgeText?: string;
  brandsHeading?: string;
  productWish?: {isVisible?: boolean; eyebrow?: string; heading?: string; description?: string; disclaimer?: string; buttonLabel?: string; imageSrc?: string; imageAlt?: string};
  gallery?: {isVisible?: boolean} & AssortmentGalleryContent;
  groups: (Omit<AssortmentGroupContent, "categories"> & {categories: AssortmentCategoryContent[]})[];
} | null;

async function getPageContent(stega = true) {
  return fetchSanity<AssortmentPageContent>(ASSORTMENT_CATEGORIES_QUERY, {}, {stega}).catch((error: unknown) => {
    console.error("Sortimentsseite konnte nicht aus Sanity geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
    return null;
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent(false);
  return createPageMetadata({
    title: page?.seoTitle || page?.heroTitle || "Unser Sortiment in Dreieich",
    description: page?.seoDescription || page?.heroDescription || "Entdecke frisches Obst und Gemüse, Brot, Getränke und mehr im Sortiment von GerneGrün in Dreieich.",
    path: "/sortiment",
    keywords: page?.seoKeywords || ["Obst und Gemüse", "Brot", "Getränke", "Naturkosmetik"],
  });
}

export default async function AssortmentPage() {
  const [page, assortment, brands, produceList] = await Promise.all([
    getPageContent(),
    fetchSanity<{ enabled?: boolean; edition: (AssortmentSectionData & {_type: "assortmentEdition"}) | null } | null>(CURRENT_ASSORTMENT_QUERY).catch((error: unknown) => {
      console.error("Aktuelle Frischeprodukte konnten nicht geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
      return null;
    }),
    fetchSanity<{_id: string; name: string; description?: string; url?: string; logoUrl?: string}[]>(SUPPLIER_BRANDS_QUERY).catch((error: unknown) => {
      console.error("Marken konnten nicht geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
      return [];
    }),
    getCurrentWeeklyProduceList(),
  ]);
  const data = assortment === null ? null : assortment.enabled === false ? null : assortment.edition;
  const supplierItems = brands.map((brand) => ({ _id: brand._id, name: brand.name, href: brand.url ? stegaClean(brand.url) : undefined, src: brand.logoUrl ? stegaClean(brand.logoUrl) : "", width: 360, height: 160 }));
  const badge = page?.badgeVisible !== false ? <ProductCountBadge title={page?.badgeTitle || "Über 4.000 Produkte"} text={page?.badgeText || "für deinen täglichen Einkauf"} textDataAttribute={sanityDataAttribute("assortmentPage", "assortmentPage", "badgeText")} /> : undefined;

  return <main>
    {page && <PageHero compact centerBadgeVertically description={page.heroDescription} badge={badge} showAccent mobileAccentPosition="closer" title={page.heroTitle} variant="botanical" dataAttributes={{title: sanityDataAttribute("assortmentPage", "assortmentPage", "heroTitle"), description: sanityDataAttribute("assortmentPage", "assortmentPage", "heroDescription"), badge: sanityDataAttribute("assortmentPage", "assortmentPage", "badgeTitle")}} />}
    {page && <AssortmentDirectory groups={page.groups ?? []} />}
    <SupplierLogoBar title={page?.brandsHeading ?? "Ausgewählte Marken und Hersteller"} suppliers={supplierItems} showTitle={false} showEmptyState={process.env.NODE_ENV === "development" && supplierItems.length === 0} />
    {(data || produceList) && <WeeklyOffersSection data={data} produceList={produceList} showDataHint={process.env.NODE_ENV === "development" && !data} />}
    {page && page.productWish?.isVisible !== false && <ProductWishCTA content={page.productWish} sourceId={page._id} />}
    {page?.gallery && page.gallery.isVisible !== false && <AssortmentGallery content={{...page.gallery, _sourceId: page._id}} />}
  </main>;
}
