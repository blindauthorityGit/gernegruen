"use client";

import {useEffect, useState} from "react";

import {Container} from "./Container";
import {addBerlinCalendarDays, formatOpeningHours, getBerlinDateKey, getOpeningHoursForDate} from "@/lib/content/openingHours";
import type {OpeningHoursDay, OpeningHoursException} from "@/sanity/types/business";
import styles from "./Header.module.css";

export function OpeningHoursStrip({openingHours, exceptions, initialDateKey}: {openingHours: OpeningHoursDay[]; exceptions: OpeningHoursException[]; initialDateKey: string}) {
  const [todayKey, setTodayKey] = useState(initialDateKey);
  const [expanded, setExpanded] = useState(false);
  const today = getOpeningHoursForDate(openingHours, exceptions, todayKey);
  const todayHours = formatOpeningHours(today);
  useEffect(() => {
    const updateToday = () => setTodayKey(getBerlinDateKey());
    updateToday();

    const interval = window.setInterval(updateToday, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className={styles.infoStrip} aria-label="Öffnungszeiten">
      <Container className={styles.infoContainer}>
        <div className={styles.infoStripSummary}>
          <p className={styles.todayHours}>
            <span className={styles.todayLong}>Heute, {today?.day}: {todayHours}</span>
            <span className={styles.todayShort}>Heute, {today?.shortDay}: {todayHours}</span>
          </p>
          <button
            aria-controls="weekly-opening-hours"
            aria-expanded={expanded}
            aria-label={expanded ? "Wochenübersicht der Öffnungszeiten ausblenden" : "Wochenübersicht der Öffnungszeiten anzeigen"}
            className={styles.infoToggle}
            onClick={() => setExpanded((value) => !value)}
            type="button"
          >
            <span className={styles.toggleLabel}>{expanded ? "Weniger" : "Alle Öffnungszeiten"}</span>
            <svg aria-hidden="true" className={expanded ? styles.chevronExpanded : styles.chevron} viewBox="0 0 16 16" fill="none">
              <path d="m3.5 6 4.5 4 4.5-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <ul className={styles.weeklyHours} hidden={!expanded} id="weekly-opening-hours">
            {Array.from({length: 7}, (_, index) => {
              const dateKey = addBerlinCalendarDays(todayKey, index);
              const hours = getOpeningHoursForDate(openingHours, exceptions, dateKey);
              if (!hours) return null;
              const isToday = index === 0;
              return (
                <li aria-current={isToday ? "date" : undefined} className={styles.weekday} key={dateKey}>
                  <span>{hours.day}{isToday ? " · Heute" : ""}{hours.label ? ` · ${hours.label}` : ""}</span>
                  <span>{formatOpeningHours(hours)}</span>
                </li>
              );
            })}
        </ul>
      </Container>
    </section>
  );
}
