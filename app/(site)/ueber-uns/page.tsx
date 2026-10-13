import {cache} from "react";
import type {Metadata} from "next";
import {PageHero} from "@/components/layout/PageHero";
import {Container} from "@/components/layout/Container";
import {AssortmentGallery, type AssortmentGalleryContent, type AssortmentGalleryItem} from "@/components/sections/AssortmentGallery";
import {AboutBenefits, AboutContact, AboutTimeline, type AboutBenefit, type AboutMilestone} from "@/components/sections/about/AboutSections";
import {sanityClient} from "@/sanity/lib/client";
import {ABOUT_PAGE_QUERY} from "@/sanity/queries/aboutPage";
import { createPageMetadata } from "@/lib/seo";

type AboutPageContent = {
  seoTitle?: string; seoDescription?: string;
  hero?: {headline?: string; headlineAccent?: string; description?: string; image?: string; imageAlt?: string};
  timeline?: {isVisible?: boolean; heading?: string; milestones?: (Omit<AboutMilestone, "image"> & {image?: string})[]};
  gallery?: {isVisible?: boolean; images?: (AssortmentGalleryItem & {title?: string})[]} & Omit<AssortmentGalleryContent, "images">;
  benefits?: {isVisible?: boolean; heading?: string; items?: (Omit<AboutBenefit, "icon"> & {icon?: string})[]};
  contact?: {heading?: string; description?: string; ctaLabel?: string; ctaHref?: string; image?: string; imageAlt?: string};
} | null;

const getAboutPage = cache(async () => sanityClient.fetch<AboutPageContent>(ABOUT_PAGE_QUERY, {}, {next: {revalidate: 60}}).catch((error: unknown) => {
  console.error("Über-uns-Seite konnte nicht aus Sanity geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
  return null;
}));

export async function generateMetadata(): Promise<Metadata> {
  const page = await getAboutPage();
  return createPageMetadata({
    title: page?.seoTitle || "Über uns – GerneGrün in Dreieich",
    description: page?.seoDescription || "Lerne GerneGrün kennen: die Geschichte unseres Ladens und die Menschen hinter dem Markt in Dreieich.",
    path: "/ueber-uns",
    keywords: ["Team", "Geschichte", "Lebensmittelgeschäft Dreieich"],
  });
}

export default async function AboutPage() {
  const page = await getAboutPage();
  if (!page) return <main><Container><p role="status">Über-uns-Inhalte fehlen. Bitte veröffentliche das Dokument „Über uns“ im Sanity Studio.</p></Container></main>;

  const milestones: AboutMilestone[] = (page.timeline?.milestones ?? []).map(({image, ...item}) => ({...item, image: image ? {src: image} : undefined}));
  const benefits: AboutBenefit[] = (page.benefits?.items ?? []).map(({icon, ...item}) => ({...item, icon: icon ? {src: icon} : undefined}));
  const gallery: AssortmentGalleryContent | undefined = page.gallery && {
    eyebrow: page.gallery.eyebrow,
    heading: page.gallery.heading,
    description: page.gallery.description,
    images: page.gallery.images?.map((item) => ({...item, caption: item.caption || item.title})),
  };

  return <main>
    {page.hero && <PageHero
      accentTitle={page.hero.headlineAccent}
      description={page.hero.description || ""}
      photo={page.hero.image ? {src: page.hero.image, alt: page.hero.imageAlt || ""} : undefined}
      showAccent
      mobileAccentPosition="farther"
      title={page.hero.headline || ""}
      variant="editorial"
    >
    </PageHero>}
    {page.timeline?.isVisible !== false && page.timeline && <AboutTimeline milestones={milestones} />}
    {gallery?.images?.length && page.gallery?.isVisible !== false && <AssortmentGallery content={gallery} layout="carousel" />}
    {page.benefits?.isVisible !== false && page.benefits && <AboutBenefits benefits={benefits} />}
    {page.contact && <AboutContact content={{...page.contact, image: page.contact.image ? {src: page.contact.image} : undefined}} />}
  </main>;
}
