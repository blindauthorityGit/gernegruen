import {cache} from "react";
import type {Metadata} from "next";
import {PageHero} from "@/components/layout/PageHero";
import {Container} from "@/components/layout/Container";
import {ContactCards, DirectionsSection} from "@/components/sections/contact/ContactSections";
import {getBusinessSettings} from "@/sanity/lib/businessSettings";
import {sanityClient} from "@/sanity/lib/client";
import {CONTACT_PAGE_QUERY} from "@/sanity/queries/contactPage";
import type {BusinessSettings} from "@/sanity/types/business";
import { createPageMetadata } from "@/lib/seo";

type ContactPageContent = {
  seoTitle?: string;
  seoDescription?: string;
  hero?: {headline?: string; headlineAccent?: string; description?: string; image?: string; imageAlt?: string};
  cards?: {isVisible?: boolean; openingHoursHeading?: string; contactHeading?: string};
  directions?: {isVisible?: boolean; heading?: string; description?: string; mapZoom?: number; routeLabel?: string};
  travelBenefits?: {title: string; description: string; icon?: string; iconAlt?: string}[];
} | null;

const getContactPage = cache(async () => sanityClient.fetch<ContactPageContent>(CONTACT_PAGE_QUERY, {}, {next: {revalidate: 60}}).catch((error: unknown) => {
  console.error("Kontaktseite konnte nicht aus Sanity geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
  return null;
}));

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContactPage();
  return createPageMetadata({
    title: page?.seoTitle || "Kontakt & Anfahrt – GerneGrün Dreieich",
    description: page?.seoDescription || "Adresse, Öffnungszeiten und Anfahrt zu GerneGrün in Dreieich. Wir freuen uns auf deinen Besuch!",
    path: "/kontakt",
    keywords: ["Öffnungszeiten", "Adresse", "Anfahrt", "Kontakt"],
  });
}

function localBusinessStructuredData(business: BusinessSettings) {
  if (!business) return null;
  const schemaDays = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.businessName,
    address: {"@type": "PostalAddress", streetAddress: business.street, postalCode: business.postalCode, addressLocality: business.city, addressCountry: "DE"},
    telephone: business.phone,
    email: business.email,
    sameAs: business.instagramHandle ? [`https://www.instagram.com/${business.instagramHandle.replace(/^@/, "")}/`] : undefined,
    geo: {"@type": "GeoCoordinates", latitude: business.coordinates.latitude, longitude: business.coordinates.longitude},
    openingHoursSpecification: business.openingHours.filter((day) => !day.isClosed && day.opens && day.closes).map((day) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${schemaDays[day.dayOfWeek]}`,
      opens: day.opens,
      closes: day.closes,
    })),
    specialOpeningHoursSpecification: business.exceptions?.filter((entry) => entry.isClosed || (entry.opens && entry.closes)).map((entry) => ({
      "@type": "OpeningHoursSpecification",
      validFrom: entry.date,
      validThrough: entry.date,
      opens: entry.isClosed ? "00:00" : entry.opens,
      closes: entry.isClosed ? "00:00" : entry.closes,
    })),
  };
}

export default async function ContactPage() {
  const [page, business] = await Promise.all([getContactPage(), getBusinessSettings()]);
  if (!page) return <main><Container><p role="status">Die Kontaktseite ist noch nicht in Sanity veröffentlicht. Bitte veröffentliche das Dokument „Kontakt & Anfahrt“ im Studio.</p></Container></main>;

  const structuredData = localBusinessStructuredData(business);
  return <main>
    {page.hero && <PageHero
      accentTitle={page.hero.headlineAccent}
      description={page.hero.description || ""}
      photo={page.hero.image ? {src: page.hero.image, alt: page.hero.imageAlt || ""} : undefined}
      showAccent
      title={page.hero.headline || ""}
      variant="editorial"
    />}
    {page.cards?.isVisible !== false && business && <ContactCards business={business} cards={page.cards} />}
    {page.directions?.isVisible !== false && business && <DirectionsSection business={business} benefits={page.travelBenefits ?? []} directions={page.directions} />}
    {structuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(structuredData).replace(/</g, "\\u003c")}} />}
  </main>;
}
