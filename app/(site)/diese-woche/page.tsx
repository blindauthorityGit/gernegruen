import { createPageMetadata } from "@/lib/seo";

import { ProductWishCTA } from "@/components/cta/ProductWishCTA";
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

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Diese Woche – Frische Angebote bei GerneGrün",
  description: "Frisches Obst und Gemüse, Brot und Kuchen der Woche, Backwarenpreise und aktuelle Aktionen bei GerneGrün in Dreieich.",
  path: "/diese-woche",
  keywords: ["Wochenangebote", "frisches Obst", "frisches Gemüse", "Brot der Woche", "Aktionen"],
});

export default async function WeeklyPage() {
  const [data, nextWeekPreview, produceList] = await Promise.all([getWeeklyPageData(), getNextWeekPreview(), getCurrentWeeklyProduceList()]);

  return (
    <main>
      <PageHero
        badge={<WeekSummary week={data.week} />}
        description="Frisch eingetroffen, frisch gebacken und aktuell im Angebot – entdecke, was es diese Woche bei GerneGrün gibt."
        illustration={{ src: "/graphics/weekly-page-hero.svg", alt: "Illustrierte Auswahl frischer Wochenprodukte" }}
        showAccent
        mobileAccentPosition="closer"
        title="Diese Woche"
        variant="botanical"
      >
        <WeeklyJumpLinks />
      </PageHero>
      <FreshProduceSection list={produceList} />
      {nextWeekPreview && <NextWeekPreviewSection preview={nextWeekPreview} />}
      <WeeklyBakeryHighlights highlights={data.bakeryHighlights} />
      <BakeryPriceList categories={data.bakeryCategories} />
      <WeeklyPromotions sheet={data.promotionSheet} />
      <ProductWishCTA />
    </main>
  );
}
