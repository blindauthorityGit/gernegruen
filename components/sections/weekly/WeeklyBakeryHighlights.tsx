import Image from "next/image";

import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Heading } from "@/components/ui/Heading";
import { WeeklyBakeryCards } from "@/components/ui/WeeklyBakeryCards";
import type { WeeklyHighlight } from "@/lib/weekly/types";

import styles from "./WeeklySections.module.css";

export function WeeklyBakeryHighlights({ highlights }: { highlights: WeeklyHighlight[] }) {
  return (
    <section className={styles.highlightSection} id="wochenbackwaren" aria-labelledby="bakery-highlight-title">
      <Container>
        <Reveal className={styles.sectionIntro}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionIcon} aria-hidden="true">
              <Image alt="" height={2048} sizes="(max-width: 760px) 90px, 140px" src="/graphics/weekly-bread-cake-icon.png" width={2048} />
            </span>
            <Heading id="bakery-highlight-title">Brot & Kuchen der Woche</Heading>
          </div>
          <p>Unsere beiden Backstuben-Lieblinge wechseln regelmäßig – solange der Vorrat reicht.</p>
        </Reveal>
        <WeeklyBakeryCards items={highlights} />
      </Container>
    </section>
  );
}
