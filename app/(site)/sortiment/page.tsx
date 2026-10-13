import type { Metadata } from "next";

import { PageHero } from "@/components/layout/PageHero";
import { ProductCountBadge } from "@/components/sections/ProductCountBadge";
import { AssortmentDirectory, type AssortmentCategoryContent, type AssortmentGroupContent } from "@/components/sections/AssortmentDirectory";
import { SupplierLogoBar } from "@/components/sections/home/SupplierLogoBar";
import { WeeklyOffersSection } from "@/components/sections/home/WeeklyOffersSection";
import { ProductWishCTA } from "@/components/cta/ProductWishCTA";
import {AssortmentGallery, type AssortmentGalleryContent} from "@/components/sections/AssortmentGallery";
import type { AssortmentSectionData } from "@/components/sections/AssortmentSection";
import { sanityClient } from "@/sanity/lib/client";
import { CURRENT_ASSORTMENT_QUERY } from "@/sanity/queries/assortment";
import { ASSORTMENT_CATEGORIES_QUERY } from "@/sanity/queries/assortmentCategories";
import { SUPPLIER_BRANDS_QUERY } from "@/sanity/queries/supplierBrands";
import {getCurrentWeeklyProduceList} from "@/lib/weekly/produce-data";
import { createPageMetadata } from "@/lib/seo";

type AssortmentPageContent = {
  heroTitle: string;
  heroDescription: string;
  badgeVisible?: boolean;
  badgeTitle?: string;
  badgeText?: string;
  brandsHeading?: string;
  productWish?: {isVisible?: boolean; eyebrow?: string; heading?: string; description?: string; disclaimer?: string; buttonLabel?: string};
  gallery?: {isVisible?: boolean} & AssortmentGalleryContent;
  groups: (Omit<AssortmentGroupContent, "categories"> & {categories: AssortmentCategoryContent[]})[];
} | null;

async function getPageContent() {
  return sanityClient.fetch<AssortmentPageContent>(ASSORTMENT_CATEGORIES_QUERY, {}, { next: { revalidate: 60 } }).catch((error: unknown) => {
    console.error("Sortimentsseite konnte nicht aus Sanity geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
    return null;
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent();
  return createPageMetadata({
    title: page?.heroTitle || "Unser Sortiment in Dreieich",
    description: page?.heroDescription || "Entdecke frisches Obst und Gemüse, Brot, Getränke und mehr im Sortiment von GerneGrün in Dreieich.",
    path: "/sortiment",
    keywords: ["Obst und Gemüse", "Brot", "Getränke", "Naturkosmetik"],
  });
}

export default async function AssortmentPage() {
  const [page, assortment, brands, produceList] = await Promise.all([
    getPageContent(),
    sanityClient.fetch<{ enabled?: boolean; edition: AssortmentSectionData | null } | null>(CURRENT_ASSORTMENT_QUERY, {}, { useCdn: false, next: { revalidate: 60 } }).catch((error: unknown) => {
      console.error("Aktuelle Frischeprodukte konnten nicht geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
      return null;
    }),
    sanityClient.fetch<{_id: string; name: string; description?: string; url?: string; logoUrl?: string}[]>(SUPPLIER_BRANDS_QUERY, {}, { next: { revalidate: 60 } }).catch((error: unknown) => {
      console.error("Marken konnten nicht geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
      return [];
    }),
    getCurrentWeeklyProduceList(),
  ]);
  const data = assortment === null ? null : assortment.enabled === false ? null : assortment.edition;
  const supplierItems = brands.map((brand) => ({ name: brand.name, href: brand.url, src: brand.logoUrl ?? "", width: 360, height: 160 }));
  const badge = page?.badgeVisible !== false ? <ProductCountBadge title={page?.badgeTitle || "Über 4.000 Produkte"} text={page?.badgeText || "für deinen täglichen Einkauf"} /> : undefined;

  return <main>
    {page && <PageHero compact centerBadgeVertically description={page.heroDescription} badge={badge} showAccent mobileAccentPosition="closer" title={page.heroTitle} variant="botanical" />}
    {page && <AssortmentDirectory groups={page.groups ?? []} />}
    <SupplierLogoBar title={page?.brandsHeading ?? "Ausgewählte Marken und Hersteller"} suppliers={supplierItems} showTitle={false} showEmptyState={process.env.NODE_ENV === "development" && supplierItems.length === 0} />
    {(data || produceList) && <WeeklyOffersSection data={data} produceList={produceList} showDataHint={process.env.NODE_ENV === "development" && !data} />}
    {page && page.productWish?.isVisible !== false && <ProductWishCTA content={page.productWish} />}
    {page?.gallery && page.gallery.isVisible !== false && <AssortmentGallery content={page.gallery} />}
  </main>;
}
