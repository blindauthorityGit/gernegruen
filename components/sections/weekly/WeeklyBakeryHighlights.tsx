import Image from "next/image";

import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Heading } from "@/components/ui/Heading";
import { WeeklyBakeryCards } from "@/components/ui/WeeklyBakeryCards";
import type { WeeklyHighlight } from "@/lib/weekly/types";

import styles from "./WeeklySections.module.css";
import type {WeeklyPageSettings} from "@/sanity/queries/weeklyPageSettings";
import {sanityDataAttribute} from "@/sanity/lib/dataAttribute";

export function WeeklyBakeryHighlights({highlights, settings, sourceId, sourceType}: {highlights: WeeklyHighlight[]; settings?: WeeklyPageSettings; sourceId?: string; sourceType?: "weeklyOverview" | "weeklyPageSettings" | "assortmentEdition"}) {
  return (
    <section className={styles.highlightSection} id="wochenbackwaren" aria-labelledby="bakery-highlight-title">
      <Container>
        <Reveal className={styles.sectionIntro}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionIcon} aria-hidden="true">
              <Image alt="" height={2048} sizes="(max-width: 760px) 90px, 140px" src="/graphics/weekly-bread-cake-icon.png" width={2048} />
            </span>
            <Heading id="bakery-highlight-title" data-sanity={sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", "bakeryHeading")}>{settings?.bakeryHeading || "Brot & Kuchen der Woche"}</Heading>
          </div>
          <p data-sanity={sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", "bakeryDescription")}>{settings?.bakeryDescription || "Unsere beiden Backstuben-Lieblinge wechseln regelmäßig – solange der Vorrat reicht."}</p>
        </Reveal>
        {highlights.length > 0
          ? <WeeklyBakeryCards items={highlights} sourceId={sourceId} sourceType={sourceType} />
          : <p className={styles.produceEmpty} role="status">Unsere Brot- und Kuchen-Highlights werden gerade vorbereitet. Schau bald wieder vorbei!</p>}
      </Container>
    </section>
  );
}
