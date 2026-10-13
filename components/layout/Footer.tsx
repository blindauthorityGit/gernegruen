import Link from "next/link";

import { Container } from "./Container";
import { FooterBleedSync } from "./FooterBleedSync";
import { formatOpeningHours, getBerlinDateKey } from "@/lib/content/openingHours";
import type {BusinessSettings} from "@/sanity/types/business";
import styles from "./Footer.module.css";

function Icon({ type }: { type: "clock" | "pin" | "instagram" }) {
  if (type === "clock") return <svg aria-hidden="true" viewBox="0 0 32 32" fill="none"><circle cx="15" cy="16" r="11" stroke="currentColor" strokeWidth="2.5" /><path d="M15 9v7l5 3M25 5l2 3-3 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (type === "pin") return <svg aria-hidden="true" viewBox="0 0 32 32" fill="none"><path d="M16 29s10-9.1 10-17a10 10 0 1 0-20 0c0 7.9 10 17 10 17Z" fill="currentColor" /><circle cx="16" cy="12" r="3.5" fill="#494260" /></svg>;
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" /><circle cx="17.5" cy="6.8" r="1.2" fill="currentColor" /></svg>;
}

function FooterHeading({ icon, children }: { icon: "clock" | "pin"; children: string }) {
  return <h2 className={styles.heading}><span className={styles.headingIcon}><Icon type={icon} /></span>{children}</h2>;
}

export function Footer({business}: {business: BusinessSettings}) {
  const coordinates = business?.coordinates;
  const directionsHref = coordinates ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=;${coordinates.latitude}%2C${coordinates.longitude}` : undefined;
  return (
    <footer className={styles.footer} data-site-footer>
      <FooterBleedSync />
      <Container className={styles.content}>
        <section className={styles.column}>
          <FooterHeading icon="clock">Öffnungszeiten</FooterHeading>
          <ul className={styles.hours}>
            {(business?.openingHours ?? []).map((entry) => (
              <li key={entry.day}><span>{entry.day}</span><span>{formatOpeningHours(entry)}</span></li>
            ))}
            {(business?.exceptions ?? []).filter((entry) => entry.date >= getBerlinDateKey()).map((entry) => (
              <li key={entry.date}><span>{entry.label || new Intl.DateTimeFormat("de-DE", {dateStyle: "medium", timeZone: "Europe/Berlin"}).format(new Date(`${entry.date}T12:00:00Z`))}</span><span>{entry.isClosed ? "geschlossen" : entry.opens && entry.closes ? `${entry.opens} - ${entry.closes} Uhr` : "Öffnungszeiten siehe Laden"}</span></li>
            ))}
          </ul>
        </section>
        <section className={styles.column}>
          <FooterHeading icon="pin">Besuche uns</FooterHeading>
          {business && <address className={styles.address}>
            {directionsHref && <a href={directionsHref} rel="noreferrer" target="_blank">{business.businessName}<br />{business.street}<br />{business.postalCode} {business.city}</a>}
            <a href={`tel:${business.phone.replace(/[^\d+]/g, "")}`}>{business.phone}</a>
            <a href={`mailto:${business.email}`}>{business.email}</a>
          </address>}
          {business?.instagramHandle && <a className={styles.instagram} href={`https://www.instagram.com/${business.instagramHandle.replace(/^@/, "")}/`} rel="noreferrer" target="_blank">
            <span className={styles.socialIcon}><Icon type="instagram" /></span><span>{business.instagramHandle.replace(/^@/, "")}</span>
          </a>}
        </section>
        <nav className={styles.column} aria-label="Rechtliche Informationen">
          <FooterHeading icon="pin">Links</FooterHeading>
          <ul className={styles.links}>
            <li><Link href="/impressum">Impressum</Link></li>
            <li><Link href="/datenschutz">Datenschutzerklärung</Link></li>
            <li><Link href="/barrierefreiheit">Barrierefreiheit</Link></li>
          </ul>
        </nav>
      </Container>
    </footer>
  );
}
