import Link from "next/link";

import styles from "./WeeklyIntro.module.css";
import type {WeeklyPageSettings} from "@/sanity/queries/weeklyPageSettings";
import {sanityDataAttribute} from "@/sanity/lib/dataAttribute";

export function WeeklyJumpLinks({settings}: {settings?: WeeklyPageSettings}) {
  return (
    <nav className={styles.jumpLinks} aria-label="Auf dieser Seite">
      <Link href="#frisches" data-sanity={sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", "jumpLinkFresh")}>{settings?.jumpLinkFresh || "Frisches"}</Link>
      <Link href="#wochenbackwaren" data-sanity={sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", "jumpLinkBakery")}>{settings?.jumpLinkBakery || "Brot & Kuchen"}</Link>
      <Link href="#backwaren" data-sanity={sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", "jumpLinkPrices")}>{settings?.jumpLinkPrices || "Preisliste"}</Link>
      <Link href="#aktionen" data-sanity={sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", "jumpLinkPromotions")}>{settings?.jumpLinkPromotions || "Aktionen"}</Link>
    </nav>
  );
}

export function WeekSummary({week, dataAttribute}: {week: number; dataAttribute?: string}) {
  return (
    <div className={styles.weekCard} aria-label={`Kalenderwoche ${week}`} data-sanity={dataAttribute}>
      <strong>KW {week}</strong>
    </div>
  );
}
