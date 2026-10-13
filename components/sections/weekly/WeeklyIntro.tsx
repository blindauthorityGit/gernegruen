import Link from "next/link";

import styles from "./WeeklyIntro.module.css";

export function WeeklyJumpLinks() {
  return (
    <nav className={styles.jumpLinks} aria-label="Auf dieser Seite">
      <Link href="#frisches">Frisches</Link>
      <Link href="#wochenbackwaren">Brot & Kuchen</Link>
      <Link href="#backwaren">Preisliste</Link>
      <Link href="#aktionen">Aktionen</Link>
    </nav>
  );
}

export function WeekSummary({ week }: { week: number }) {
  return (
    <div className={styles.weekCard} aria-label={`Kalenderwoche ${week}`}>
      <strong>KW {week}</strong>
    </div>
  );
}
